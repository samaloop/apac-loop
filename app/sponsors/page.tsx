import type { Metadata } from "next";
import { sponsorTiers } from "../data/sponsors";
import SectionHeading from "../components/SectionHeading";
import SponsorTier from "../components/SponsorTier";

export const metadata: Metadata = {
  title: "Sponsors | Loop Coaching Summit 2026",
  description: "Meet the sponsors supporting Loop Coaching Summit 2026.",
};

export default function SponsorsPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-20">
      <SectionHeading
        eyebrow="Sponsors"
        title="Organizations investing in coaching"
        description="Loop Coaching Summit 2026 is made possible by the generous support of these partners."
      />
      <div className="flex flex-col gap-12">
        {sponsorTiers.map((group) => (
          <SponsorTier key={group.tier} group={group} />
        ))}
      </div>

      <div className="flex flex-col items-start gap-4 rounded-2xl bg-surface-muted p-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-foreground">
            Interested in sponsoring?
          </h3>
          <p className="mt-1 text-sm text-foreground/70">
            Get in touch with the Loop Institute of Coaching team to learn about sponsorship packages.
          </p>
        </div>
        <a
          href="#"
          className="flex h-12 shrink-0 items-center justify-center rounded-full bg-accent px-8 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
        >
          Become a Sponsor
        </a>
      </div>
    </div>
  );
}
