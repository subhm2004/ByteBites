import type { DiscountStrategy } from "./DiscountStrategy.js";
import type { ICouponData } from "../types.js";

/** Flat ₹ off — discount cannot exceed subtotal */
export class FlatDiscountStrategy implements DiscountStrategy {
  calculate(subtotal: number, coupon: ICouponData): number {
    return Math.min(Math.max(coupon.value, 0), subtotal);
  }
}
