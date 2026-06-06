import axios from "axios";
import type { IOrder } from "../types";
import { riderService } from "../main";
import toast from "react-hot-toast";
import { getErrorMessage } from "../utils/errors";

interface Props {
  order: IOrder;
  onStatusUpdate: () => void;
}

const RiderCurrentOrder = ({ order, onStatusUpdate }: Props) => {
  const updateStatus = async () => {
    try {
      await axios.put(
        `${riderService}/api/rider/order/update/${order._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Order status updated");
      onStatusUpdate();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to update order"));
    }
  };
  return (
    <div className="space-y-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
      <h1 className="font-semibold text-gray-800 dark:text-white">Current Order</h1>

      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
        <p>
          <b>Pickup:</b>
          {order.restaurantName}
        </p>
        <p>
          <b>Drop:</b>
          {order.deliveryAddress.fromattedAddress}
        </p>
        <p>
          <b>Total:</b>₹{order.totalAmount}
        </p>
        <p>
          <b>Your Earning:</b>₹{order.riderAmount}
        </p>
        <p>
          <b>Status:</b>
          <span className="capitalize text-blue-600 dark:text-blue-400">
            {order.status.replace("_", " ")}
          </span>
        </p>
      </div>

      {order.deliveryAddress.mobile && (
        <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700">
          <div className="text-sm">
            <p className="text-gray-500 dark:text-gray-400">Customer Phone</p>
            <p className="font-semibold text-gray-800 dark:text-white">
              {order.deliveryAddress.mobile}
            </p>
          </div>
          <a
            href={`tel:${order.deliveryAddress.mobile}`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Call
          </a>
        </div>
      )}

      <div className="space-y-2">
        {order.status === "rider_assigned" && (
          <button
            onClick={() => updateStatus()}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg py-2 font-semibold"
          >
            Reached Restaurant
          </button>
        )}

        {order.status === "picked_up" && (
          <button
            onClick={() => updateStatus()}
            className="w-full bg-green-500 hover:bg-green-600 text-white rounded-lg py-2 font-semibold"
          >
            Mark as delivered
          </button>
        )}
      </div>
    </div>
  );
};

export default RiderCurrentOrder;
