import axios from "axios";
import toast from "react-hot-toast";
import { restaurantService } from "../main";
import type { IOrder } from "../types";

export const CUSTOMER_CANCELLABLE_STATUSES = ["placed", "accepted"] as const;
export const REORDERABLE_STATUSES = ["delivered", "cancelled"] as const;

export const canCustomerCancel = (order: IOrder) =>
  CUSTOMER_CANCELLABLE_STATUSES.includes(
    order.status as (typeof CUSTOMER_CANCELLABLE_STATUSES)[number]
  );

export const canReorder = (order: IOrder) =>
  REORDERABLE_STATUSES.includes(
    order.status as (typeof REORDERABLE_STATUSES)[number]
  );

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const cancelCustomerOrder = async (orderId: string) => {
  const { data } = await axios.put(
    `${restaurantService}/api/order/${orderId}/cancel`,
    {},
    { headers: authHeaders() }
  );
  return data as { message: string };
};

export const reorderOrder = async (orderId: string) => {
  const { data } = await axios.post(
    `${restaurantService}/api/order/${orderId}/reorder`,
    {},
    { headers: authHeaders() }
  );
  return data as {
    message: string;
    unavailable?: string[];
    itemCount?: number;
  };
};

export const handleOrderActionError = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error) && error.response?.data?.message) {
    toast.error(String(error.response.data.message));
  } else {
    toast.error(fallback);
  }
};
