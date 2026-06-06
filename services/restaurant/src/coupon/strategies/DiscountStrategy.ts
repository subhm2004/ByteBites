import type { ICouponData } from "../types.js";

export interface DiscountStrategy {
  calculate(subtotal: number, coupon: ICouponData): number;
}
