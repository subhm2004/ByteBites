import { useState } from "react";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { BiStar, BiX } from "react-icons/bi";
import type { IOrder } from "../types";

interface ReviewModalProps {
  order: IOrder;
  hasRestaurantReview?: boolean;
  hasRiderReview?: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

const StarRow = ({
  value,
  hover,
  onHover,
  onSelect,
}: {
  value: number;
  hover: number;
  onHover: (n: number) => void;
  onSelect: (n: number) => void;
}) => (
  <div className="flex justify-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onMouseEnter={() => onHover(star)}
        onMouseLeave={() => onHover(0)}
        onClick={() => onSelect(star)}
        className="p-1 transition hover:scale-110"
      >
        <BiStar
          size={32}
          className={
            star <= (hover || value)
              ? "fill-amber-400 text-amber-400"
              : "text-gray-300 dark:text-gray-600"
          }
        />
      </button>
    ))}
  </div>
);

const ReviewModal = ({
  order,
  hasRestaurantReview = false,
  hasRiderReview = false,
  onClose,
  onSubmitted,
}: ReviewModalProps) => {
  const needsRestaurant = !hasRestaurantReview;
  const needsRider = Boolean(order.riderId) && !hasRiderReview;

  const [restaurantRating, setRestaurantRating] = useState(0);
  const [restaurantHover, setRestaurantHover] = useState(0);
  const [restaurantComment, setRestaurantComment] = useState("");
  const [riderRating, setRiderRating] = useState(0);
  const [riderHover, setRiderHover] = useState(0);
  const [riderComment, setRiderComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (needsRestaurant && restaurantRating < 1) {
      toast.error("Please rate the restaurant");
      return;
    }

    if (needsRider && riderRating < 1) {
      toast.error("Please rate your delivery partner");
      return;
    }

    try {
      setLoading(true);
      const payload: Record<string, unknown> = { orderId: order._id };

      if (needsRestaurant) {
        payload.rating = restaurantRating;
        payload.comment = restaurantComment;
      }

      if (needsRider) {
        payload.riderRating = riderRating;
        payload.riderComment = riderComment;
      }

      await axios.post(`${restaurantService}/api/review`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.success("Thanks for your feedback!");
      onSubmitted();
      onClose();
    } catch (error: unknown) {
      const msg =
        axios.isAxiosError(error) && error.response?.data?.message
          ? String(error.response.data.message)
          : "Failed to submit review";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-md space-y-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Rate your order
            </h2>
            <p className="text-sm text-gray-500">{order.restaurantName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <BiX size={22} />
          </button>
        </div>

        {needsRestaurant && (
          <div className="space-y-2 rounded-xl border border-gray-100 p-4 dark:border-gray-800">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              🍽️ Restaurant
            </p>
            <StarRow
              value={restaurantRating}
              hover={restaurantHover}
              onHover={setRestaurantHover}
              onSelect={setRestaurantRating}
            />
            <textarea
              placeholder="Food quality, packaging… (optional)"
              value={restaurantComment}
              onChange={(e) => setRestaurantComment(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
        )}

        {needsRider && (
          <div className="space-y-2 rounded-xl border border-gray-100 p-4 dark:border-gray-800">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              🛵 Delivery partner
            </p>
            <StarRow
              value={riderRating}
              hover={riderHover}
              onHover={setRiderHover}
              onSelect={setRiderRating}
            />
            <textarea
              placeholder="Delivery speed, behaviour… (optional)"
              value={riderComment}
              onChange={(e) => setRiderComment(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
        )}

        <button
          disabled={loading}
          onClick={handleSubmit}
          className="w-full rounded-xl bg-[#E23744] py-3 text-sm font-semibold text-white hover:bg-[#c9303c] disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit rating"}
        </button>
      </div>
    </div>
  );
};

export default ReviewModal;
