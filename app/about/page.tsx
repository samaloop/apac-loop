import type { Metadata } from "next";
import Image from "next/image";
import SectionHeading from "../components/SectionHeading";
import CommitteeCard from "../components/CommitteeCard";
import { FrangipaniIcon, PalmFrond } from "../components/motifs";
import { committeeMembers } from "../data/committee";

export const metadata: Metadata = {
  title: "About | APAC Coaching Conference 2027",
  description:
    "Learn about the organizer, local partner, and committee behind APAC Coaching Conference 2027.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-20">
      <SectionHeading
        eyebrow="About"
        title="Who's behind APAC Coaching Conference 2027"
        description="A regional alliance, a local partner, and the committee making it happen on the ground in Bali."
      />

      <section className="relative overflow-hidden rounded-3xl bg-primary text-primary-foreground">
        <PalmFrond className="pointer-events-none absolute -left-14 -top-16 h-56 w-56 rotate-20 text-primary-foreground/10" />
        <PalmFrond className="pointer-events-none absolute -bottom-20 -right-14 h-64 w-64 rotate-200 text-primary-foreground/10" />

        <div className="relative z-10 flex flex-col gap-10 px-6 py-14 sm:px-12 sm:py-16">
          <div className="flex flex-col items-center gap-2 text-center">
            <FrangipaniIcon className="h-7 w-7 text-gold" />
            <span className="text-sm font-semibold uppercase tracking-wide text-gold">
              A Regional Alliance, A Local Partner
            </span>
          </div>

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-24 w-40 items-center justify-center rounded-2xl bg-background p-4 shadow-lg sm:h-28 sm:w-48">
                <Image
                  src="/images/logo_apac.webp"
                  alt="Asia Pacific Alliance of Coaches"
                  width={220}
                  height={124}
                  className="h-full w-auto object-contain"
                />
              </div>
              <div className="flex max-w-sm flex-col items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-gold">
                  About the Organizer
                </span>
                <h3 className="text-xl font-semibold">Asia Pacific Alliance of Coaches (APAC)</h3>
                <p className="text-sm leading-6 text-primary-foreground/70">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                  incididunt ut labore et dolore magna aliqua.
                </p>
                <a
                  href="https://apacoaches.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-gold hover:underline"
                >
                  Visit apacoaches.org &rarr;
                </a>
              </div>
            </div>

            <div className="hidden flex-col items-center gap-3 sm:flex">
              <span className="h-20 w-px bg-primary-foreground/20" aria-hidden />
              <FrangipaniIcon className="h-5 w-5 shrink-0 text-gold" />
              <span className="h-20 w-px bg-primary-foreground/20" aria-hidden />
            </div>

            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-24 w-40 items-center justify-center rounded-2xl bg-background p-4 shadow-lg sm:h-28 sm:w-48">
                <Image
                  src="/images/Logo-loop.webp"
                  alt="Loop Institute of Coaching"
                  width={240}
                  height={82}
                  className="h-full w-auto object-contain"
                />
              </div>
              <div className="flex max-w-sm flex-col items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-gold">
                  Local Partner
                </span>
                <h3 className="text-xl font-semibold">Loop Institute of Coaching</h3>
                <p className="text-sm leading-6 text-primary-foreground/70">
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
                  fugiat nulla pariatur.
                </p>
                <a
                  href="https://www.loop-indonesia.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-gold hover:underline"
                >
                  Visit loop-indonesia.com &rarr;
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-8">
        <SectionHeading
          eyebrow="Our Committee"
          title="The team organizing this conference"
          description="Coordinating across APAC and Loop Institute of Coaching to bring APAC Coaching Conference 2027 to life."
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {committeeMembers.map((member) => (
            <CommitteeCard key={member.id} member={member} />
          ))}
        </div>
      </section>
    </div>
  );
}
