import { DiscountStrategyFactory } from "./factory/DiscountStrategyFactory.js";
import { CouponRepository } from "./repository/CouponRepository.js";
import { CouponValidator } from "./validators/CouponValidator.js";
import { CouponError } from "./errors/CouponError.js";
import type { DiscountApplyContext, DiscountResult } from "./types.js";

/**
 * Facade — single entry point for the discount coupon engine.
 * Orchestrates repository, validation, and strategy calculation.
 */
export class CouponEngine {
  constructor(
    private readonly repository: CouponRepository,
    private readonly validator: CouponValidator
  ) {}

  async apply(
    code: string,
    context: DiscountApplyContext
  ): Promise<DiscountResult> {
    const coupon = await this.repository.findByCode(code);
    if (!coupon) {
      throw new CouponError("Invalid coupon code");
    }

    await this.validator.validate(coupon, context);

    const strategy = DiscountStrategyFactory.getStrategy(coupon.type);
    const discountAmount = Math.round(strategy.calculate(context.subtotal, coupon));

    if (discountAmount <= 0) {
      throw new CouponError("Coupon does not apply to this order");
    }

    return {
      discountAmount,
      couponId: coupon._id,
      couponCode: coupon.code,
      couponType: coupon.type,
      description: this.buildDescription(coupon, discountAmount),
    };
  }

  private buildDescription(
    coupon: { type: string; value: number; maxDiscount?: number | null },
    discountAmount: number
  ): string {
    if (coupon.type === "flat") {
      return `Flat ₹${coupon.value} off applied (−₹${discountAmount})`;
    }
    const cap = coupon.maxDiscount ? `, max ₹${coupon.maxDiscount}` : "";
    return `${coupon.value}% off${cap} applied (−₹${discountAmount})`;
  }
  async recordUsage(couponId: string): Promise<void> {
    await this.repository.incrementUsage(couponId);
  }
}

export const couponEngine = new CouponEngine(
  new CouponRepository(),
  new CouponValidator()
);
