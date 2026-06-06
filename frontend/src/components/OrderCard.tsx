import { useEffect, useState } from "react";
import type { IOrder } from "../types";
import { ORDER_ACTIONS, SELLER_CANCELLABLE } from "../utils/orderflow";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { getErrorMessage } from "../utils/errors";

interface props {
  order: IOrder;
  onStatusUpdate?: () => void;
}

const statusColor = (status: string) => {
  switch (status) {
    case "placed":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400";
    case "accepted":
      return "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400";
    case "preparing":
      return "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400";
    case "ready_for_rider":
      return "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400";
    case "picked_up":
      return "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400";
    case "delivered":
      return "bg-green-100 text-green-700 dark:bg-emerald-950/50 dark:text-emerald-400";
    case "cancelled":
      return "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  }
};

const OrderCard = ({ order, onStatusUpdate }: props) => {
  const [loading, setLoading] = useState(false);
  const [retryVisible, setRetryVisible] = useState(false);

  const actions = ORDER_ACTIONS[order.status] || [];

  useEffect(() => {
    if (order.status !== "ready_for_rider") {
      setRetryVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      setRetryVisible(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, [order.status]);

  const updateStatus = async (status: string) => {
    if (
      status === "cancelled" &&
      !window.confirm("Cancel this order? The customer will be notified.")
    ) {
      return;
    }

    try {
      setLoading(true);
      setRetryVisible(false);
      await axios.put(
        `${restaurantService}/api/order/${order._id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success(
        status === "cancelled" ? "Order cancelled" : "Order updated"
      );
      onStatusUpdate?.();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to update order"));
    } finally {
      setLoading(false);
    }
  };

  const canCancel = SELLER_CANCELLABLE.includes(order.status);

  return (
    <div className="space-y-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          Order #{order._id.slice(-6)}
        </p>

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusColor(
            order.status
          )}`}
        >
          {order.status.replaceAll("_", " ")}
        </span>
      </div>

      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
        {order.items.map((item, i) => (
          <p key={i}>
            {item.name} x {item.quauntity}
          </p>
        ))}
      </div>

      <div className="flex justify-between text-sm font-medium text-gray-900 dark:text-white">
        <span>Total</span>
        <span>₹{order.totalAmount}</span>
      </div>

      <p className="text-xs capitalize text-gray-400 dark:text-gray-500">
        Payment: {order.paymentStatus}
      </p>

      {order.paymentStatus === "paid" && actions.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {actions.map((status) => (
            <button
              key={status}
              disabled={loading}
              onClick={() => updateStatus(status)}
              className="rounded-lg bg-[#e23744] px-3 py-1 text-xs text-white hover:bg-[#d32f3a] disabled:opacity-50"
            >
              Mark as {status.replaceAll("_", " ")}
            </button>
          ))}
          {canCancel && (
            <button
              disabled={loading}
              onClick={() => updateStatus("cancelled")}
              className="rounded-lg border border-red-300 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              Cancel order
            </button>
          )}
        </div>
      )}

      {order.paymentStatus === "paid" &&
        actions.length === 0 &&
        canCancel && (
          <div className="pt-2">
            <button
              disabled={loading}
              onClick={() => updateStatus("cancelled")}
              className="w-full rounded-lg border border-red-300 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              Cancel order
            </button>
          </div>
        )}

      {order.status === "ready_for_rider" && retryVisible && (
        <div className="pt-2">
          <button
            className="w-full rounded-lg border border-[#e23744] py-2 text-xs font-semibold text-[#e23744] hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950/40"
            onClick={() => updateStatus("ready_for_rider")}
          >
            Retry Ready for Rider
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
