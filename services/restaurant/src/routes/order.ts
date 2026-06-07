import express from "express";
import { isAuth, isSeller } from "../middlewares/isAuth.js";
import {
  assignRiderToOrder,
  cancelOrderByCustomer,
  createOrder,
  fetchOrderForPayment,
  fetchRestaurantOrders,
  fetchSingleOrder,
  getCurrentOrderForRider,
  getMyOrders,
  getOrderDispatchStatus,
  getRestaurantSalesAnalytics,
  getRiderEarningsAnalytics,
  reorderFromOrder,
  updateOrderStatus,
  updateOrderStatusRider,
} from "../controllers/order.js";

const router = express.Router();

router.get("/myorder", isAuth, getMyOrders);
router.put("/:orderId/cancel", isAuth, cancelOrderByCustomer);
router.post("/:orderId/reorder", isAuth, reorderFromOrder);
router.get(
  "/analytics/:restaurantId",
  isAuth,
  isSeller,
  getRestaurantSalesAnalytics
);
router.get("/:id", isAuth, fetchSingleOrder);
router.post("/new", isAuth, createOrder);
router.get("/payment/:id", fetchOrderForPayment);
router.get(
  "/restaurant/:restaurantId",
  isAuth,
  isSeller,
  fetchRestaurantOrders
);
router.put("/:orderId", isAuth, isSeller, updateOrderStatus);
router.put("/assign/rider", assignRiderToOrder);
router.get("/rider/earnings", getRiderEarningsAnalytics);
router.get("/rider/dispatch/:orderId", getOrderDispatchStatus);
router.get("/current/rider", getCurrentOrderForRider);
router.put("/update/status/rider", updateOrderStatusRider);

export default router;
