import type { Metadata } from "next";
import SectionHeading from "../components/SectionHeading";

export const metadata: Metadata = {
  title: "Speakers | APAC Coaching Conference 2027",
  description: "Meet the speakers of APAC Coaching Conference 2027.",
};

export default function SpeakersPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-20">
      <SectionHeading
        eyebrow="Speakers"
        title="Keynote Speakers"
        description="Visionary voices from coaching, leadership, organizational transformation, and society — to be announced."
      />
      <div className="rounded-3xl border border-dashed border-black/[.15] bg-background px-8 py-14 text-center dark:border-white/[.2] dark:bg-[#241c15]">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">Coming Soon</p>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-foreground/70">
          We&apos;re confirming an outstanding keynote lineup for APAC Coaching Conference 2027.
          Check back soon.
        </p>
      </div>
    </div>
  );
}
