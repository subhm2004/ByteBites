import axios from "axios";
import { getChannel } from "./rabbitmq.js";
import { Rider } from "../model/Rider.js";

const DISPATCH_OFFER_MS = 10_000;
const DISPATCH_RADIUS_M = Number(process.env.RIDER_DISPATCH_RADIUS_M || 5000);
const dispatchTimeouts = new Map<string, NodeJS.Timeout>();

const restaurantBase = () =>
  process.env.RESTAURANT_SERVICE || "http://localhost:5001";

const internalHeaders = () => ({
  "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
});

const clearDispatch = (orderId: string) => {
  const existing = dispatchTimeouts.get(orderId);
  if (existing) {
    clearTimeout(existing);
    dispatchTimeouts.delete(orderId);
  }
};

const getOrderDispatchState = async (orderId: string) => {
  const { data } = await axios.get(
    `${restaurantBase()}/api/order/rider/dispatch/${orderId}`,
    { headers: internalHeaders() }
  );
  return data as { status: string; riderId: string | null; assigned: boolean };
};

const notifyRider = async (
  orderId: string,
  restaurantId: string,
  riderUserId: string
) => {
  await axios.post(
    `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
    {
      event: "order:available",
      room: `user:${String(riderUserId)}`,
      payload: { orderId, restaurantId },
    },
    { headers: internalHeaders() }
  );
};

const dispatchSequentially = async (
  orderId: string,
  restaurantId: string,
  riders: { userId: string; distance?: number }[],
  index = 0
) => {
  if (index >= riders.length) {
    console.log(`No rider accepted order ${orderId}`);
    dispatchTimeouts.delete(orderId);
    return;
  }

  const rider = riders[index];
  if (!rider) {
    dispatchTimeouts.delete(orderId);
    return;
  }

  console.log(
    `Offering order ${orderId} to rider ${rider.userId} (${index + 1}/${riders.length}, ${Math.round(rider.distance || 0)}m away)`
  );

  try {
    await notifyRider(orderId, restaurantId, rider.userId);
  } catch {
    console.log(`Failed to notify rider ${rider.userId}, trying next`);
    dispatchSequentially(orderId, restaurantId, riders, index + 1);
    return;
  }

  const timeout = setTimeout(async () => {
    try {
      const state = await getOrderDispatchState(orderId);

      if (state.assigned || state.status !== "ready_for_rider") {
        clearDispatch(orderId);
        return;
      }

      dispatchSequentially(orderId, restaurantId, riders, index + 1);
    } catch (error) {
      console.log("Dispatch status check failed:", error);
      dispatchSequentially(orderId, restaurantId, riders, index + 1);
    }
  }, DISPATCH_OFFER_MS);

  dispatchTimeouts.set(orderId, timeout);
};

export const startOrderReadyConsumer = async () => {
  const channel = getChannel();

  console.log("Starting to consume from:", process.env.ORDER_READY_QUEUE);

  channel.consume(process.env.ORDER_READY_QUEUE!, async (msg) => {
    if (!msg) return;

    try {
      const event = JSON.parse(msg.content.toString());

      if (event.type !== "ORDER_READY_FOR_RIDER") {
        channel.ack(msg);
        return;
      }

      const { orderId, restaurantId, location } = event.data;

      if (
        !orderId ||
        !restaurantId ||
        !location?.coordinates ||
        location.coordinates.length !== 2
      ) {
        console.log("Invalid ORDER_READY_FOR_RIDER payload:", event.data);
        channel.ack(msg);
        return;
      }

      clearDispatch(orderId);

      const nearPoint = {
        type: "Point" as const,
        coordinates: location.coordinates as [number, number],
      };

      const riders = await Rider.aggregate([
        {
          $geoNear: {
            near: nearPoint,
            distanceField: "distance",
            maxDistance: DISPATCH_RADIUS_M,
            spherical: true,
            query: { isAvailble: true, isVerified: true },
          },
        },
        { $sort: { distance: 1 } },
        { $project: { userId: 1, distance: 1 } },
      ]);

      console.log(
        `Found ${riders.length} nearby riders for order ${orderId} (within ${DISPATCH_RADIUS_M}m)`
      );

      if (riders.length === 0) {
        console.log(
          `No riders within ${DISPATCH_RADIUS_M}m for order ${orderId}. Ensure a verified rider is online near the restaurant.`
        );
        channel.ack(msg);
        return;
      }

      await dispatchSequentially(orderId, restaurantId, riders);
      channel.ack(msg);
    } catch (error) {
      console.log("OrderReady consumer error:", error);
      channel.ack(msg);
    }
  });
};
