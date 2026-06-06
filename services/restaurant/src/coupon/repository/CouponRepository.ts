import Coupon, { ICoupon } from "../../models/Coupon.js";
import type { ICouponData } from "../types.js";

/** Repository — data access layer for coupons */
export class CouponRepository {
  async findByCode(code: string): Promise<ICouponData | null> {
    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
    }).lean<ICoupon>();

    if (!coupon) return null;

    return {
      _id: coupon._id.toString(),
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      maxDiscount: coupon.maxDiscount ?? null,
      minOrderAmount: coupon.minOrderAmount,
      usageLimit: coupon.usageLimit ?? null,
      usedCount: coupon.usedCount,
      perUserLimit: coupon.perUserLimit,
      expiresAt: coupon.expiresAt,
      isActive: coupon.isActive,
      description: coupon.description ?? "",
    };
  }

  async incrementUsage(couponId: string): Promise<void> {
    await Coupon.findByIdAndUpdate(couponId, { $inc: { usedCount: 1 } });
  }
}
