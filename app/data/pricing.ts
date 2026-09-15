export type PricingTierStatus = "past" | "active" | "upcoming";

export type PricingTier = {
  id: string;
  name: string;
  status: PricingTierStatus;
  statusLabel: string;
  currency: string;
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
    currency: "$",
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
    currency: "$",
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
    currency: "$",
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

// Member status is self-declared on the form — there's no membership lookup
// yet, so this price is applied immediately and reconciled manually later
// (see the Member ID collected alongside it).
export function tierPriceFor(tier: PricingTier, isMember: boolean): number {
  return isMember ? tier.memberPrice : tier.nonMemberPrice;
}

export const DEFAULT_TIER_ID = "early-bird";

// Dummy placeholder rate for converting the USD-denominated tier prices into
// IDR for Xendit — replace with a real FX source before taking live payments.
export const USD_TO_IDR_RATE = 15800;

export const groupRate = {
  minPeople: 3,
  discountPercent: 10,
  description:
    "Register together with 3 or more people from the same organization/team and get an extra discount on top of the applicable tier price. Contact our team for group registration.",
};
