import { useEffect, useState } from "react";
import axios from "axios";
import { BiStar } from "react-icons/bi";
import { restaurantService } from "../main";
import { AppCard, LoadingScreen } from "./ui/AppUI";

type Review = {
  _id: string;
  rating: number;
  comment: string;
  userName: string;
  createdAt: string;
};

const RestaurantReviews = ({ restaurantId }: { restaurantId: string }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await axios.get(
          `${restaurantService}/api/review/restaurant/${restaurantId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setReviews(data.reviews || []);
        setAvgRating(data.avgRating || 0);
        setReviewCount(data.reviewCount || 0);
      } catch {
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [restaurantId]);

  if (loading) {
    return <LoadingScreen message="Loading reviews..." />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/40">
          <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {reviewCount > 0 ? avgRating.toFixed(1) : "—"}
          </span>
          <BiStar className="fill-amber-400 text-amber-400" size={14} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {reviewCount > 0
              ? `${reviewCount} rating${reviewCount === 1 ? "" : "s"}`
              : "No ratings yet"}
          </h2>
          <p className="text-sm text-gray-500">
            {reviewCount > 0
              ? "What customers are saying"
              : "Order & rate to be the first!"}
          </p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <p className="text-sm text-gray-400">No reviews to show yet.</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <AppCard key={review._id} className="!p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {review.userName}
                </p>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <BiStar
                      key={i}
                      size={14}
                      className={
                        i < review.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-300 dark:text-gray-600"
                      }
                    />
                  ))}
                </div>
              </div>
              {review.comment && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  {review.comment}
                </p>
              )}
              <p className="mt-2 text-xs text-gray-400">
                {new Date(review.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </AppCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantReviews;
