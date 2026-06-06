import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import { validateCoupon } from "../controllers/coupon.js";

const router = express.Router();

router.post("/validate", isAuth, validateCoupon);

export default router;
