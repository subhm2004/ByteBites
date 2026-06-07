import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/trycatch.js";
import { couponEngine } from "../coupon/CouponEngine.js";
import { CouponError } from "../coupon/errors/CouponError.js";
import { calculateOrderPricing } from "../pricing/orderPricing.js";

export const validateCoupon = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { code, subtotal, distanceKm } = req.body;

    if (!code || subtotal == null) {
      return res.status(400).json({
        message: "Coupon code and subtotal are required",
      });
    }

    try {
      const result = await couponEngine.apply(String(code), {
        subtotal: Number(subtotal),
        userId: user._id.toString(),
      });

      const pricing = calculateOrderPricing({
        subtotal: Number(subtotal),
        distanceKm: distanceKm != null ? Number(distanceKm) : undefined,
        discountAmount: result.discountAmount,
      });

      return res.json({
        valid: true,
        discountAmount: result.discountAmount,
        couponCode: result.couponCode,
        couponType: result.couponType,
        description: result.description,
        deliveryFee: pricing.deliveryFee,
        platformFee: pricing.platformFee,
        smallOrderFee: pricing.smallOrderFee,
        totalAmount: pricing.grandTotal,
      });
    } catch (error) {
      if (error instanceof CouponError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      throw error;
    }
  }
);
