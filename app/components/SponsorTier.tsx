import type { SponsorTierGroup } from "@/app/data/sponsors";

const tierBadgeStyles: Record<SponsorTierGroup["tier"], string> = {
  Platinum: "bg-primary text-primary-foreground",
  Gold: "bg-accent text-accent-foreground",
  Silver: "bg-surface-muted text-foreground border border-black/[.08] dark:border-white/[.145]",
};

export default function SponsorTier({ group }: { group: SponsorTierGroup }) {
  return (
    <div className="flex flex-col gap-5">
      <span
        className={`w-fit rounded-full px-4 py-1 text-sm font-semibold ${tierBadgeStyles[group.tier]}`}
      >
        {group.tier}
      </span>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {group.sponsors.map((sponsor) => (
          <div
            key={sponsor.id}
            className="flex h-24 items-center justify-center rounded-xl border border-black/[.08] bg-white px-4 text-center text-sm font-medium text-foreground/80 dark:border-white/[.145] dark:bg-[#111]"
          >
            {sponsor.name}
          </div>
        ))}
      </div>
    </div>
  );
}
