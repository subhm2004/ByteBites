import { useParams } from "react-router-dom";
import { useSocket } from "../context/useSocket";
import { useEffect, useState } from "react";
import type { IOrder } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import UserOrderMap from "../components/UserOrderMap";
import {
  AppCard,
  AppPage,
  LoadingScreen,
  PageHeader,
  StatusBadge,
} from "../components/ui/AppUI";
import DownloadReceiptButton from "../components/DownloadReceiptButton";
import { MdDeliveryDining } from "react-icons/md";

const OrderPage = () => {
  const { id } = useParams();
  const { socket } = useSocket();

  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      const { data } = await axios.get(`${restaurantService}/api/order/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setOrder(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  useEffect(() => {
    if (!socket) return;

    const onOrderUpdate = () => {
      fetchOrder();
    };

    socket.on("order:update", onOrderUpdate);
    socket.on("order:rider_assigned", onOrderUpdate);

    return () => {
      socket.off("order:update", onOrderUpdate);
      socket.off("order:rider_assigned", onOrderUpdate);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket || !id) return;

    socket.emit("join", `user:${id}`);

    return () => {
      socket.emit("leave", `user:${id}`);
    };
  }, [socket, id]);

  const [riderLocation, setRiderLocation] = useState<[number, number] | null>(
    null
  );

  useEffect(() => {
    if (!socket) return;

    const onRiderLocation = ({
      latitude,
      longitude,
    }: {
      latitude: number;
      longitude: number;
    }) => {
      setRiderLocation([latitude, longitude]);
    };

    socket.on("rider:location", onRiderLocation);

    return () => {
      socket.off("rider:location", onRiderLocation);
    };
  }, [socket]);

  if (loading) {
    return <LoadingScreen message="Loading order details..." />;
  }

  if (!order) {
    return (
      <AppPage narrow>
        <p className="text-center text-gray-500">Order not found</p>
      </AppPage>
    );
  }

  const isLive =
    order.status === "rider_assigned" || order.status === "picked_up";

  return (
    <AppPage narrow>
      <PageHeader
        eyebrow="Order tracking"
        title={`#${order._id.slice(-6).toUpperCase()}`}
      />

      <div className="space-y-4">
        <AppCard className="flex items-center justify-between !py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E23744]/10 text-[#E23744]">
              <MdDeliveryDining className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <StatusBadge status={order.status} />
            </div>
          </div>
          <p className="text-2xl font-black text-[#E23744]">
            ₹{order.totalAmount}
          </p>
        </AppCard>

        {isLive && (
          <AppCard className="!p-0 overflow-hidden">
            {riderLocation ? (
              <UserOrderMap
                riderLocation={riderLocation}
                deliveryLocation={[
                  order.deliveryAddress.latitude!,
                  order.deliveryAddress.longitude!,
                ]}
              />
            ) : (
              <div className="flex items-center justify-center gap-2 py-12 text-sm text-gray-500">
                <div className="h-2 w-2 animate-pulse rounded-full bg-[#E23744]" />
                Waiting for rider location...
              </div>
            )}
          </AppCard>
        )}

        <AppCard className="space-y-3">
          <h2 className="font-bold text-gray-900 dark:text-white">Items</h2>
          {order.items.map((item, i) => (
            <div className="flex justify-between text-sm" key={i}>
              <span className="text-gray-600">
                {item.name} × {item.quauntity}
              </span>
              <span className="font-medium">₹{item.price * item.quauntity}</span>
            </div>
          ))}
        </AppCard>

        <AppCard>
          <h2 className="mb-2 font-bold text-gray-900 dark:text-white">Delivery address</h2>
          <p className="text-sm text-gray-600">
            {order.deliveryAddress.fromattedAddress}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            📞 {order.deliveryAddress.mobile}
          </p>
        </AppCard>

        <AppCard className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>₹{order.subtotal}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Delivery fee</span>
            <span>₹{order.deliveryFee}</span>
          </div>
          <div className="flex justify-between text-gray-600 dark:text-gray-300">
            <span>Platform fee</span>
            <span>₹{order.platfromFee}</span>
          </div>
          {(order.discountAmount ?? 0) > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
              <span>Coupon {order.couponCode ? `(${order.couponCode})` : ""}</span>
              <span>−₹{order.discountAmount}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-gray-100 dark:border-gray-800 pt-2 font-bold">
            <span>Total paid</span>
            <span>₹{order.totalAmount}</span>
          </div>
          <p className="pt-1 text-xs capitalize text-gray-400">
            {order.paymentMethod} · {order.paymentStatus}
          </p>
        </AppCard>

        {order.paymentStatus === "paid" && (
          <DownloadReceiptButton
            order={order}
            variant="primary"
            label="Download receipt (PDF)"
          />
        )}
      </div>
    </AppPage>
  );
};

export default OrderPage;
