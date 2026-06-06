import type { CouponType } from "../types.js";
import type { DiscountStrategy } from "../strategies/DiscountStrategy.js";
import { FlatDiscountStrategy } from "../strategies/FlatDiscountStrategy.js";
import { PercentWithCapStrategy } from "../strategies/PercentWithCapStrategy.js";
import { CouponError } from "../errors/CouponError.js";

/** Factory — picks the right discount algorithm by coupon type */
export class DiscountStrategyFactory {
  private static strategies: Record<CouponType, DiscountStrategy> = {
    flat: new FlatDiscountStrategy(),
    percent_cap: new PercentWithCapStrategy(),
  };

  static getStrategy(type: CouponType): DiscountStrategy {
    const strategy = this.strategies[type];
    if (!strategy) {
      throw new CouponError("Unsupported coupon type");
    }
    return strategy;
  }
}
