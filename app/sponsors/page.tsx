import type { Metadata } from "next";
import { event } from "../data/event";
import SectionHeading from "../components/SectionHeading";

export const metadata: Metadata = {
  title: "Sponsors | APAC Coaching Conference 2027",
  description: "Sponsorship and partnership opportunities for APAC Coaching Conference 2027.",
};

export default function SponsorsPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-20">
      <SectionHeading
        eyebrow="Partners & Sponsors"
        title="Partnership opportunities are now open"
        description="Join organizations investing in the future of coaching across Asia Pacific."
      />

      <div className="flex flex-col items-start gap-4 rounded-2xl bg-surface-muted p-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-foreground">Interested in partnering?</h3>
          <p className="mt-1 max-w-xl text-sm text-foreground/70">
            Get in touch with the team to learn about sponsorship and partnership packages for
            APAC Coaching Conference 2027.
          </p>
        </div>
        <a
          href={`https://wa.me/${event.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 shrink-0 items-center justify-center rounded-full bg-accent px-8 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
        >
          Become a Partner
        </a>
      </div>
    </div>
  );
}
