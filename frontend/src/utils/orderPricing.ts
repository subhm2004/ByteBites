/** Shared order pricing — mirrors backend `orderPricing.ts` */

export const MIN_ORDER_AMOUNT = 50;
export const FREE_DELIVERY_THRESHOLD = 250;
export const PLATFORM_FEE = 7;

export type OrderPricing = {
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  smallOrderFee: number;
  discountAmount: number;
  grandTotal: number;
  meetsMinimumOrder: boolean;
  amountToMinimum: number;
  amountToFreeDelivery: number;
  isFreeDelivery: boolean;
  distanceKm?: number;
};

const smallOrderFee = (subtotal: number) =>
  subtotal >= MIN_ORDER_AMOUNT && subtotal < 100 ? 15 : 0;

/** Distance-based delivery fee (Swiggy/Zomato style slabs) */
export const calculateDeliveryFee = (
  subtotal: number,
  distanceKm?: number
): number => {
  if (subtotal >= FREE_DELIVERY_THRESHOLD) return 0;
  if (subtotal < MIN_ORDER_AMOUNT) return 0;

  if (distanceKm == null) return 40;

  if (distanceKm <= 2) return 29;
  if (distanceKm <= 5) return 39;
  return 49;
};

export const calculateOrderPricing = ({
  subtotal,
  distanceKm,
  discountAmount = 0,
}: {
  subtotal: number;
  distanceKm?: number;
  discountAmount?: number;
}): OrderPricing => {
  const meetsMinimumOrder = subtotal >= MIN_ORDER_AMOUNT;
  const amountToMinimum = Math.max(0, MIN_ORDER_AMOUNT - subtotal);
  const amountToFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const deliveryFee = calculateDeliveryFee(subtotal, distanceKm);
  const orderSmallFee = smallOrderFee(subtotal);
  const platformFee = meetsMinimumOrder ? PLATFORM_FEE : 0;

  const grandTotal = Math.max(
    0,
    subtotal +
      deliveryFee +
      platformFee +
      orderSmallFee -
      discountAmount
  );

  return {
    subtotal,
    deliveryFee,
    platformFee,
    smallOrderFee: orderSmallFee,
    discountAmount,
    grandTotal,
    meetsMinimumOrder,
    amountToMinimum,
    amountToFreeDelivery,
    isFreeDelivery: deliveryFee === 0 && subtotal >= MIN_ORDER_AMOUNT,
    distanceKm,
  };
};
