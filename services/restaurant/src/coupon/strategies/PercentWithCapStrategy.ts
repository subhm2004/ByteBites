import type { DiscountStrategy } from "./DiscountStrategy.js";
import type { ICouponData } from "../types.js";

/** Percentage off with optional max cap */
export class PercentWithCapStrategy implements DiscountStrategy {
  calculate(subtotal: number, coupon: ICouponData): number {
    const percentOff = (subtotal * coupon.value) / 100;
    const cap = coupon.maxDiscount ?? percentOff;
    return Math.min(Math.max(percentOff, 0), cap, subtotal);
  }
}
