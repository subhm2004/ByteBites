import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import {
  getMyReviewedOrderIds,
  getRestaurantReviews,
  getRiderReviews,
  submitReview,
} from "../controllers/review.js";

const router = express.Router();

router.post("/", isAuth, submitReview);
router.get("/my", isAuth, getMyReviewedOrderIds);
router.get("/restaurant/:restaurantId", isAuth, getRestaurantReviews);
router.get("/rider/:riderId", isAuth, getRiderReviews);

export default router;
