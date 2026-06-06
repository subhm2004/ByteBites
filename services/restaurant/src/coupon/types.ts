export type CouponType = "flat" | "percent_cap";

export interface ICouponData {
  _id: string;
  code: string;
  type: CouponType;
  value: number;
  maxDiscount?: number | null;
  minOrderAmount: number;
  usageLimit?: number | null;
  usedCount: number;
  perUserLimit: number;
  expiresAt: Date;
  isActive: boolean;
  description?: string;
}

export interface DiscountApplyContext {
  subtotal: number;
  userId: string;
}

export interface DiscountResult {
  discountAmount: number;
  couponId: string;
  couponCode: string;
  couponType: CouponType;
  description: string;
}
