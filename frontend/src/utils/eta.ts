import type { IOrder } from "../types";

export const AVG_RIDER_SPEED_KMH = 22;
export const BASE_PREP_MINUTES = 15;
export const ETA_BUFFER_MINUTES = 5;
export const MIN_ETA_MINUTES = 20;
export const MAX_ETA_MINUTES = 60;

export type ETARange = {
  min: number;
  max: number;
  midpoint: number;
};

export const getDistanceKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return +(R * c).toFixed(2);
};

export const travelMinutesFromKm = (distanceKm: number): number =>
  (distanceKm / AVG_RIDER_SPEED_KMH) * 60;

export const estimateETA = (
  distanceKm: number,
  prepMinutes = BASE_PREP_MINUTES
): ETARange => {
  const travel = travelMinutesFromKm(distanceKm);
  const total = prepMinutes + travel + ETA_BUFFER_MINUTES;

  const min = Math.max(MIN_ETA_MINUTES, Math.round(total - 5));
  const max = Math.min(MAX_ETA_MINUTES, Math.round(total + 5));

  return {
    min,
    max,
    midpoint: Math.round((min + max) / 2),
  };
};

export const formatETARange = (eta: ETARange): string =>
  `${eta.min}–${eta.max} min`;

export const formatETAShort = (eta: ETARange): string =>
  `~${eta.midpoint} min`;

export const getOrderETA = (
  order: Pick<IOrder, "status" | "distance">,
  riderToCustomerKm?: number | null
): { minutes: number; label: string } => {
  const base = estimateETA(order.distance);
  const travel = travelMinutesFromKm(order.distance);

  switch (order.status) {
    case "placed":
    case "accepted":
      return {
        minutes: base.midpoint,
        label: `Estimated ${formatETARange(base)}`,
      };
    case "preparing":
      return {
        minutes: Math.max(10, Math.round(base.midpoint * 0.7)),
        label: `~${Math.max(10, Math.round(base.midpoint * 0.7))} min left`,
      };
    case "ready_for_rider":
      return {
        minutes: Math.max(12, Math.round(travel + 8)),
        label: `Rider assigning · ~${Math.max(12, Math.round(travel + 8))} min`,
      };
    case "rider_assigned":
      return {
        minutes: Math.max(10, Math.round(travel + 6)),
        label: `Rider on the way · ~${Math.max(10, Math.round(travel + 6))} min`,
      };
    case "picked_up": {
      const remaining =
        riderToCustomerKm != null && riderToCustomerKm > 0
          ? travelMinutesFromKm(riderToCustomerKm) + 3
          : Math.max(8, Math.round(travel * 0.6));
      const mins = Math.max(5, Math.round(remaining));
      return {
        minutes: mins,
        label: `Arriving in ~${mins} min`,
      };
    }
    case "delivered":
      return { minutes: 0, label: "Delivered" };
    case "cancelled":
      return { minutes: 0, label: "Order cancelled" };
    default:
      return {
        minutes: base.midpoint,
        label: formatETARange(base),
      };
  }
};
