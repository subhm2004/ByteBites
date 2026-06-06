import express from "express";
import { isAdmin, isAuth } from "../middlewares/isAuth.js";
import {
  getPendingRestaurant,
  getPendingRiders,
  verifyRestaurant,
  verifyRider,
} from "../controllers/admin.js";
import {
  createCoupon,
  deleteCoupon,
  listCoupons,
  toggleCoupon,
  updateCoupon,
} from "../controllers/coupon.js";

const router = express.Router();

router.get("/admin/restaurant/pending", isAuth, isAdmin, getPendingRestaurant);
router.get("/admin/rider/pending", isAuth, isAdmin, getPendingRiders);
router.patch("/verify/rider/:id", isAuth, isAdmin, verifyRider);
router.patch("/verify/restaurant/:id", isAuth, isAdmin, verifyRestaurant);

router.get("/admin/coupons", isAuth, isAdmin, listCoupons);
router.post("/admin/coupon", isAuth, isAdmin, createCoupon);
router.patch("/admin/coupon/:id", isAuth, isAdmin, updateCoupon);
router.patch("/admin/coupon/:id/toggle", isAuth, isAdmin, toggleCoupon);
router.delete("/admin/coupon/:id", isAuth, isAdmin, deleteCoupon);

export default router;
