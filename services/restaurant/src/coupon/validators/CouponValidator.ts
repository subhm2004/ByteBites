import Order from "../../models/Order.js";
import type { ICouponData, DiscountApplyContext } from "../types.js";
import { CouponError } from "../errors/CouponError.js";

/** Chain-style validation rules for coupon eligibility */
export class CouponValidator {
  async validate(
    coupon: ICouponData,
    context: DiscountApplyContext
  ): Promise<void> {
    this.assertActive(coupon);
    this.assertNotExpired(coupon);
    this.assertMinOrder(coupon, context.subtotal);
    await this.assertUsageLimit(coupon);
    await this.assertPerUserLimit(coupon, context.userId);
  }

  private assertActive(coupon: ICouponData): void {
    if (!coupon.isActive) {
      throw new CouponError("This coupon is no longer active");
    }
  }

  private assertNotExpired(coupon: ICouponData): void {
    if (new Date(coupon.expiresAt) < new Date()) {
      throw new CouponError("This coupon has expired");
    }
  }

  private assertMinOrder(coupon: ICouponData, subtotal: number): void {
    if (subtotal < coupon.minOrderAmount) {
      throw new CouponError(
        `Minimum order amount is ₹${coupon.minOrderAmount}`
      );
    }
  }

  private async assertUsageLimit(coupon: ICouponData): Promise<void> {
    if (
      coupon.usageLimit != null &&
      coupon.usedCount >= coupon.usageLimit
    ) {
      throw new CouponError("This coupon has reached its usage limit");
    }
  }

  private async assertPerUserLimit(
    coupon: ICouponData,
    userId: string
  ): Promise<void> {
    const userUsage = await Order.countDocuments({
      userId,
      couponId: coupon._id.toString(),
      paymentStatus: "paid",
    });

    if (userUsage >= coupon.perUserLimit) {
      throw new CouponError("You have already used this coupon");
    }
  }
}
