import type { Metadata } from "next";
import Image from "next/image";
import SectionHeading from "../components/SectionHeading";
import CommitteeCard from "../components/CommitteeCard";
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

      <section className="flex flex-col gap-6 rounded-3xl border border-black/[.08] bg-surface-muted p-8 dark:border-white/[.145] sm:flex-row sm:items-center sm:gap-10">
        <Image
          src="/images/logo_apac.webp"
          alt="Asia Pacific Alliance of Coaches"
          width={220}
          height={124}
          className="h-20 w-auto shrink-0"
        />
        <div className="flex flex-col gap-3">
          <span className="text-sm font-semibold uppercase tracking-wide text-accent">
            About the Organizer
          </span>
          <h3 className="text-2xl font-semibold text-foreground">
            Asia Pacific Alliance of Coaches (APAC)
          </h3>
          <p className="text-sm leading-6 text-foreground/70">
            APAC is a regional alliance of coaching professionals, credentialing bodies, and
            practitioners committed to advancing the coaching profession across Asia Pacific.
            APAC Coaching Conference 2027 is APAC&apos;s flagship gathering, bringing together
            coaches, leaders, and researchers from across the region.
          </p>
          <a
            href="https://apacoaches.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit text-sm font-semibold text-accent hover:underline"
          >
            Visit apacoaches.org &rarr;
          </a>
        </div>
      </section>

      <section className="flex flex-col gap-6 rounded-3xl border border-black/[.08] bg-surface-muted p-8 dark:border-white/[.145] sm:flex-row sm:items-center sm:gap-10">
        <Image
          src="/images/Logo-loop.webp"
          alt="Loop Institute of Coaching"
          width={240}
          height={82}
          className="h-14 w-auto shrink-0"
        />
        <div className="flex flex-col gap-3">
          <span className="text-sm font-semibold uppercase tracking-wide text-accent">
            Local Partner
          </span>
          <h3 className="text-2xl font-semibold text-foreground">Loop Institute of Coaching</h3>
          <p className="text-sm leading-6 text-foreground/70">
            Loop Institute of Coaching is the official local partner for APAC Coaching
            Conference 2027, coordinating on-the-ground logistics, local outreach, and the Bali
            host experience for the conference.
          </p>
          <a
            href="https://www.loop-indonesia.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit text-sm font-semibold text-accent hover:underline"
          >
            Visit loop-indonesia.com &rarr;
          </a>
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
