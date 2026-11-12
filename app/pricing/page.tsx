import type { Metadata } from "next";
import { event } from "../data/event";
import SectionHeading from "../components/SectionHeading";

export const metadata: Metadata = {
  title: "Pricing | APAC Coaching Conference 2027",
  description: "Ticket pricing for APAC Coaching Conference 2027 — announced soon.",
};

export default function PricingPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-20">
      <SectionHeading
        eyebrow="Pricing"
        title="Registration Opening Soon"
        description="Pricing and Early Bird registration will be announced soon. Be the first to know when registration opens."
      />

      <div className="flex flex-col items-start gap-4 rounded-3xl bg-surface-muted p-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-foreground">Don&apos;t miss Early Bird</h3>
          <p className="mt-1 max-w-xl text-sm text-foreground/70">
            Get in touch with the team to be notified as soon as registration and Early Bird
            pricing go live.
          </p>
        </div>
        <a
          href={`https://wa.me/${event.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 shrink-0 items-center justify-center rounded-full bg-accent px-8 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
        >
          Get Updates
        </a>
      </div>
    </div>
  );
}
