export type Sponsor = {
  id: string;
  name: string;
};

export type SponsorTierGroup = {
  tier: "Platinum" | "Gold" | "Silver";
  sponsors: Sponsor[];
};

export const sponsorTiers: SponsorTierGroup[] = [
  {
    tier: "Platinum",
    sponsors: [
      { id: "nusantara-talenta", name: "PT Nusantara Talenta" },
      { id: "bank-ceria", name: "Bank Ceria Indonesia" },
    ],
  },
  {
    tier: "Gold",
    sponsors: [
      { id: "garuda-wellness", name: "Garuda Wellness Group" },
      { id: "meridian-hr", name: "Meridian HR Solutions" },
      { id: "cakra-learning", name: "Cakra Learning" },
    ],
  },
  {
    tier: "Silver",
    sponsors: [
      { id: "kopi-sehat", name: "Kopi Sehat Co." },
      { id: "arunika-media", name: "Arunika Media" },
      { id: "sinar-konsultan", name: "Sinar Konsultan" },
      { id: "bijak-finance", name: "Bijak Finance" },
    ],
  },
];
