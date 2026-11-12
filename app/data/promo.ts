export type PromoDiscountType = "percent" | "fixed";

// What the buyer's browser gets back after applying a code — enough to
// preview the discount; the server always recomputes it before charging.
export type AppliedPromo = {
  code: string;
  discountType: PromoDiscountType;
  discountValue: number;
};

export const PROMO_DISCOUNT_LABELS: Record<PromoDiscountType, string> = {
  percent: "Percentage (%) off the ticket subtotal",
  fixed: "Fixed amount (USD) off the whole order",
};

export function normalizePromoCode(code: string): string {
  return code.trim().toUpperCase();
}

// Discount in USD on the ticket subtotal (before the payment fee, which is
// then computed on the discounted subtotal). Never more than the subtotal.
export function promoDiscountUSD(promo: AppliedPromo | null, subtotalUSD: number): number {
  if (!promo) return 0;
  const raw =
    promo.discountType === "percent"
      ? (subtotalUSD * promo.discountValue) / 100
      : promo.discountValue;
  return Math.min(subtotalUSD, Math.round(raw * 100) / 100);
}

export function describePromo(promo: AppliedPromo): string {
  return promo.discountType === "percent"
    ? `${promo.discountValue}% off`
    : `$${promo.discountValue.toFixed(2)} off`;
}
