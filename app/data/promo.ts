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
  fixed: "Fixed amount (SGD) off the whole order",
};

export function normalizePromoCode(code: string): string {
  return code.trim().toUpperCase();
}

// Discount in SGD (the base currency) on the ticket subtotal, before the
// payment fee (which is then computed on the discounted subtotal). A fixed
// discount value is therefore in SGD. Never more than the subtotal.
export function promoDiscount(promo: AppliedPromo | null, subtotal: number): number {
  if (!promo) return 0;
  const raw =
    promo.discountType === "percent"
      ? (subtotal * promo.discountValue) / 100
      : promo.discountValue;
  return Math.min(subtotal, Math.round(raw * 100) / 100);
}

export function describePromo(promo: AppliedPromo): string {
  return promo.discountType === "percent"
    ? `${promo.discountValue}% off`
    : `S$${promo.discountValue.toFixed(2)} off`;
}
