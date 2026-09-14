import type { Metadata } from "next";
import SectionHeading from "../components/SectionHeading";
import PricingCard from "../components/PricingCard";
import { pricingTiers, groupRate } from "../data/pricing";

export const metadata: Metadata = {
  title: "Pricing | APAC Coaching Conference 2027",
  description: "Ticket pricing tiers for APAC Coaching Conference 2027.",
};

export default function PricingPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-20">
      <SectionHeading
        eyebrow="Pricing"
        title="Register early, save more"
        description="Prices shown are placeholders and will be finalized closer to the event."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {pricingTiers.map((tier) => (
          <PricingCard key={tier.id} tier={tier} />
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-3xl bg-surface-muted p-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <span className="w-fit rounded-full bg-gold px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold-foreground">
            Group Rate
          </span>
          <h3 className="text-xl font-semibold text-foreground">
            Extra {groupRate.discountPercent}% off for groups of {groupRate.minPeople}+
          </h3>
          <p className="max-w-2xl text-sm leading-6 text-foreground/70">{groupRate.description}</p>
        </div>
      </div>
    </div>
  );
}
