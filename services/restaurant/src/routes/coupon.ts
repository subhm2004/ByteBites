import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import { validateCoupon } from "../controllers/coupon.js";
import { couponLimiter } from "../middlewares/rateLimit.js";

const router = express.Router();

router.post("/validate", couponLimiter, isAuth, validateCoupon);

export default router;
