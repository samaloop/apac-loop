export type PricingTierStatus = "past" | "active" | "upcoming";

export type PricingTier = {
  id: string;
  name: string;
  status: PricingTierStatus;
  statusLabel: string;
  // Stored in SGD — the source of truth and the headline price shown to
  // buyers (formatSGD). PayPal is charged in SGD directly; the Indonesian
  // Xendit account can only bill IDR, so its charge is converted (sgdToIDR).
  nonMemberPrice: number;
  memberPrice: number;
  memberDiscountPercent: number;
  description: string;
  sku: string;
  featured: boolean;
  // Optional eye-catching corner sticker (e.g. "Limited Time") — leave unset
  // for tiers that don't need one.
  badge?: string;
};

// Dummy pricing — real tier dates/prices to be confirmed later.
export const pricingTiers: PricingTier[] = [
  {
    id: "super-early-bird",
    name: "Super Early Bird",
    status: "past",
    statusLabel: "Sep 1 – Oct 31, 2026",
    nonMemberPrice: 350,
    memberPrice: 298,
    memberDiscountPercent: 15,
    description: "Our best price, for the earliest registrants.",
    sku: "APAC-SEB-2027",
    featured: false,
    badge: "Limited Time",
  },
  {
    id: "early-bird",
    name: "Early Bird",
    status: "active",
    statusLabel: "ON SALE NOW",
    nonMemberPrice: 425,
    memberPrice: 360,
    memberDiscountPercent: 15,
    description: "Nov 1, 2026 – Jan 31, 2027. Our most popular phase.",
    sku: "APAC-EB-2027",
    featured: true,
  },
  {
    id: "regular",
    name: "Regular",
    status: "upcoming",
    statusLabel: "STARTS FEB 1, 2027",
    nonMemberPrice: 500,
    memberPrice: 425,
    memberDiscountPercent: 15,
    description: "Valid through the day of the event.",
    sku: "APAC-RG-2027",
    featured: false,
  },
];

export const pricingFeatures = [
  "Access to all 3 days of main sessions",
  "Materials & goodie bag",
  "Lunch & coffee breaks",
  "Certificate of participation",
];

export function getPricingTier(id: string): PricingTier | undefined {
  return pricingTiers.find((tier) => tier.id === id);
}

// The member price is only accepted by the payment routes when the order is
// backed by a confirmed APAC membership (lib/apac.ts checkMemberOrder).
export function tierPriceFor(tier: PricingTier, isMember: boolean): number {
  return isMember ? tier.memberPrice : tier.nonMemberPrice;
}

export const DEFAULT_TIER_ID = "early-bird";

// Tier prices are stored in SGD (the source of truth and the headline price).
// PayPal is charged in SGD directly; the Indonesian Xendit account can only
// charge IDR, so the SGD price is converted with the daily ECB rate fetched in
// lib/fx.ts. This fallback is used only when that fetch fails and no good
// rate is cached yet — update it by hand now and then.
export const SGD_TO_IDR_FALLBACK = 14250; // 1 SGD ≈ 14,250 IDR (Nov 2026)

// SGD → IDR: the whole-Rupiah amount Xendit is actually charged.
export function sgdToIDR(sgdAmount: number, rate: number): number {
  return Math.round(sgdAmount * rate);
}

// The headline price, shown everywhere the main price appears.
export function formatSGD(sgdAmount: number): string {
  return `S$ ${Math.round(sgdAmount).toLocaleString("en-SG")}`;
}

// Convert an amount in a provider's charge currency back to SGD. PayPal is
// already SGD (identity); only Xendit's IDR needs converting.
export function methodAmountToSGD(amount: number, currency: "IDR" | "SGD", rate: number): number {
  return currency === "IDR" ? amount / rate : amount;
}

export const groupRate = {
  minPeople: 3,
  discountPercent: 10,
  description:
    "Register together with 3 or more people from the same organization/team and get an extra discount on top of the applicable tier price. Contact our team for group registration.",
};
