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
};

// Dummy pricing — real tier dates/prices to be confirmed later.
export const pricingTiers: PricingTier[] = [
  {
    id: "super-early-bird",
    name: "Super Early Bird",
    status: "past",
    statusLabel: "1 Sep – 31 Okt 2026",
    currency: "$",
    nonMemberPrice: 350,
    memberPrice: 298,
    memberDiscountPercent: 15,
    description: "Harga terbaik, untuk pendaftar paling awal.",
    sku: "APAC-SEB-2027",
    featured: false,
  },
  {
    id: "early-bird",
    name: "Early Bird",
    status: "active",
    statusLabel: "SEDANG BERLANGSUNG",
    currency: "$",
    nonMemberPrice: 425,
    memberPrice: 360,
    memberDiscountPercent: 15,
    description: "1 Nov 2026 – 31 Jan 2027. Fase paling banyak dipilih.",
    sku: "APAC-EB-2027",
    featured: true,
  },
  {
    id: "regular",
    name: "Regular",
    status: "upcoming",
    statusLabel: "MULAI 1 FEB 2027",
    currency: "$",
    nonMemberPrice: 500,
    memberPrice: 425,
    memberDiscountPercent: 15,
    description: "Berlaku sampai hari pelaksanaan acara.",
    sku: "APAC-RG-2027",
    featured: false,
  },
];

export const pricingFeatures = [
  "Akses 3 hari sesi utama",
  "Materi & goodie bag",
  "Makan siang & kopi",
  "Sertifikat partisipasi",
];

export function getPricingTier(id: string): PricingTier | undefined {
  return pricingTiers.find((tier) => tier.id === id);
}

export const DEFAULT_TIER_ID = "early-bird";

// Dummy placeholder rate for converting the USD-denominated tier prices into
// IDR for Xendit — replace with a real FX source before taking live payments.
export const USD_TO_IDR_RATE = 15800;

export const groupRate = {
  minPeople: 3,
  discountPercent: 10,
  description:
    "Daftar bersama 3 orang atau lebih dari organisasi/tim yang sama, dan dapatkan tambahan diskon di luar harga tier yang berlaku. Hubungi tim kami untuk pendaftaran grup.",
};
