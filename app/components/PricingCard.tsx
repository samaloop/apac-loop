import Link from "next/link";
import type { PricingTier } from "@/app/data/pricing";
import { pricingFeatures } from "@/app/data/pricing";

const statusStyles: Record<PricingTier["status"], string> = {
  past: "bg-surface-muted text-foreground/50 line-through",
  active: "bg-accent/10 text-accent",
  upcoming: "bg-surface-muted text-foreground/60",
};

export default function PricingCard({ tier }: { tier: PricingTier }) {
  return (
    <div
      className={`flex flex-col gap-5 rounded-3xl border bg-background p-6 dark:bg-[#241c15] ${
        tier.featured
          ? "border-2 border-accent shadow-lg"
          : "border-black/[.08] dark:border-white/[.145]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-xl font-bold text-foreground">{tier.name}</h3>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusStyles[tier.status]}`}
        >
          {tier.statusLabel}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-foreground/60">Non-Member</span>
          <span className="text-lg font-semibold text-foreground">
            {tier.currency}
            {tier.nonMemberPrice}
          </span>
        </div>
        <div className="flex items-center justify-between rounded-2xl bg-surface-muted px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground/70">Member APAC</span>
            <span className="rounded-md bg-gold px-2 py-0.5 text-[10px] font-semibold text-gold-foreground">
              Hemat {tier.memberDiscountPercent}%
            </span>
          </div>
          <span className="text-xl font-bold text-accent">
            {tier.currency}
            {tier.memberPrice}
          </span>
        </div>
      </div>

      <p className="text-sm leading-6 text-foreground/70">{tier.description}</p>

      <div className="border-t border-dashed border-black/[.15] dark:border-white/[.2]" />

      <ul className="flex flex-col gap-2">
        {pricingFeatures.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm text-foreground/80">
            <span className="text-accent" aria-hidden>
              &#10003;
            </span>
            {feature}
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between pt-1">
        <span className="font-mono text-xs text-foreground/40">{tier.sku}</span>
        <Link
          href={`/register?tier=${tier.id}`}
          className={`rounded-full px-6 py-2 text-sm font-semibold transition-opacity hover:opacity-90 ${
            tier.featured
              ? "bg-accent text-accent-foreground"
              : "bg-primary text-primary-foreground"
          }`}
        >
          Pesan
        </Link>
      </div>
    </div>
  );
}
