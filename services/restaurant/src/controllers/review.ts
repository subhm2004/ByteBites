import axios from "axios";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/trycatch.js";
import Order from "../models/Order.js";
import Restaurant from "../models/Restaurant.js";
import Review from "../models/Review.js";
import RiderReview from "../models/RiderReview.js";

const recalculateRestaurantRating = async (restaurantId: string) => {
  const stats = await Review.aggregate([
    { $match: { restaurantId } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  const avgRating = stats[0]?.avgRating
    ? Math.round(stats[0].avgRating * 10) / 10
    : 0;
  const reviewCount = stats[0]?.reviewCount || 0;

  await Restaurant.findByIdAndUpdate(restaurantId, { avgRating, reviewCount });
};

const recalculateRiderRating = async (riderId: string) => {
  const stats = await RiderReview.aggregate([
    { $match: { riderId } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  const avgRating = stats[0]?.avgRating
    ? Math.round(stats[0].avgRating * 10) / 10
    : 0;
  const reviewCount = stats[0]?.reviewCount || 0;

  try {
    await axios.patch(
      `${process.env.RIDER_SERVICE || "http://localhost:5005"}/api/rider/internal/rating`,
      { riderId, avgRating, reviewCount },
      {
        headers: {
          "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        },
      }
    );
  } catch (error) {
    console.error("Failed to sync rider rating:", error);
  }

  return { avgRating, reviewCount };
};

export const submitReview = TryCatch(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { orderId, rating, comment, riderRating, riderComment } = req.body;

  if (!orderId) {
    return res.status(400).json({ message: "Order is required" });
  }

  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  if (order.userId !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not your order" });
  }

  if (order.status !== "delivered") {
    return res.status(400).json({ message: "You can only review delivered orders" });
  }

  const existingRestaurantReview = await Review.findOne({ orderId });
  const existingRiderReview = await RiderReview.findOne({ orderId });

  if (existingRestaurantReview && (!order.riderId || existingRiderReview)) {
    return res.status(400).json({ message: "You already reviewed this order" });
  }

  if (!existingRestaurantReview && !rating) {
    return res.status(400).json({ message: "Restaurant rating is required" });
  }

  if (
    order.riderId &&
    !existingRiderReview &&
    !riderRating &&
    !existingRestaurantReview
  ) {
    return res.status(400).json({ message: "Delivery partner rating is required" });
  }

  let review = existingRestaurantReview;
  let riderReview = existingRiderReview;

  if (!existingRestaurantReview && rating) {
    const numericRating = Number(rating);
    if (numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    review = await Review.create({
      userId: req.user._id.toString(),
      restaurantId: order.restaurantId,
      orderId: order._id.toString(),
      rating: numericRating,
      comment: comment?.trim() || "",
      userName: req.user.name,
    });

    await recalculateRestaurantRating(order.restaurantId);
  }

  let riderRatingStats = { avgRating: 0, reviewCount: 0 };

  if (order.riderId && !existingRiderReview && riderRating) {
    const numericRiderRating = Number(riderRating);
    if (numericRiderRating < 1 || numericRiderRating > 5) {
      return res.status(400).json({
        message: "Delivery rating must be between 1 and 5",
      });
    }

    riderReview = await RiderReview.create({
      userId: req.user._id.toString(),
      riderId: order.riderId,
      orderId: order._id.toString(),
      rating: numericRiderRating,
      comment: riderComment?.trim() || "",
      userName: req.user.name,
    });

    riderRatingStats = await recalculateRiderRating(order.riderId);
  }

  const restaurant = await Restaurant.findById(order.restaurantId).select(
    "avgRating reviewCount"
  );

  res.status(201).json({
    message: "Thanks for your feedback!",
    review,
    riderReview,
    avgRating: restaurant?.avgRating || 0,
    reviewCount: restaurant?.reviewCount || 0,
    riderAvgRating: riderRatingStats.avgRating,
    riderReviewCount: riderRatingStats.reviewCount,
  });
});

export const getRestaurantReviews = TryCatch(async (req, res) => {
  const { restaurantId } = req.params;

  if (!restaurantId || typeof restaurantId !== "string") {
    return res.status(400).json({ message: "Restaurant id is required" });
  }

  const reviews = await Review.find({ restaurantId })
    .sort({ createdAt: -1 })
    .limit(20);

  const restaurant = await Restaurant.findById(restaurantId).select(
    "avgRating reviewCount name"
  );

  res.json({
    reviews,
    avgRating: restaurant?.avgRating || 0,
    reviewCount: restaurant?.reviewCount || 0,
  });
});

export const getRiderReviews = TryCatch(async (req, res) => {
  const { riderId } = req.params;

  if (!riderId || typeof riderId !== "string") {
    return res.status(400).json({ message: "Rider id is required" });
  }

  const reviews = await RiderReview.find({ riderId })
    .sort({ createdAt: -1 })
    .limit(20);

  const stats = await RiderReview.aggregate([
    { $match: { riderId } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  const avgRating = stats[0]?.avgRating
    ? Math.round(stats[0].avgRating * 10) / 10
    : 0;
  const reviewCount = stats[0]?.reviewCount || 0;

  res.json({
    reviews,
    avgRating,
    reviewCount,
  });
});

export const getMyReviewedOrderIds = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user._id.toString();

    const [restaurantReviews, riderReviews] = await Promise.all([
      Review.find({ userId }).select("orderId rating comment"),
      RiderReview.find({ userId }).select("orderId rating comment"),
    ]);

    res.json({
      restaurantReviews,
      riderReviews,
      reviews: restaurantReviews,
    });
  }
);
