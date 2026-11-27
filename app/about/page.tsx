import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageHero from "../components/PageHero";

export const metadata: Metadata = {
  title: "About | APAC Coaching Conference 2027",
  description:
    "The community, collaborators and purpose behind APAC Coaching Conference 2027.",
};

const organizations = [
  {
    eyebrow: "About APAC",
    logo: { src: "/images/logo_apac.webp", alt: "Asia Pacific Alliance of Coaches", width: 310, height: 174 },
    lead: "The Asia Pacific Alliance of Coaches brings the region’s coaching community together.",
    body: "This conference is presented as a space for professional connection, shared learning and dialogue about coaching’s evolving role across Asia Pacific. Additional organizational profile information will be published after confirmation by APAC.",
  },
  {
    eyebrow: "About LOOP",
    logo: { src: "/images/design/logo-loop-new.webp", alt: "Loop Institute of Coaching", width: 316, height: 108 },
    lead: "The First ICF-Based Coaching Institution in Indonesia",
    body: "Loop Institute of Coaching is the official local partner of APAC Coaching Conference 2027 in Bali. More about Loop’s role in the conference will be published soon.",
  },
];

// The three pillars (people, systems, society), in the conference copy.
const lenses = [
  { title: "For people", body: "Inspire people to unlock their potential and lead with purpose." },
  {
    title: "For systems",
    body: "Transform systems to create more conscious, sustainable and human-centred organisations.",
  },
  {
    title: "For society",
    body: "Shape society by contributing to a more inclusive, connected and empowered future.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col bg-(--brand-cream) text-(--brand-ink)">
      <PageHero
        eyebrow="About the conference"
        title="Coaching beyond"
        highlight="boundaries."
        description="Meet the community, collaborators and purpose behind APAC Coaching Conference 2027."
      />

      <section className="mx-auto flex w-full max-w-6xl flex-col px-6 py-16">
        {organizations.map((org, i) => (
          <div
            key={org.eyebrow}
            className={`grid gap-8 py-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1.75fr)] ${i > 0 ? "border-t border-[#b0b0b0]" : ""}`}
          >
            <div className="flex flex-col gap-6">
              <p className="text-base font-bold uppercase sm:text-xl">{org.eyebrow}</p>
              <Image src={org.logo.src} alt={org.logo.alt} width={org.logo.width} height={org.logo.height} className="h-auto w-56 sm:w-72" />
            </div>
            <div className="flex flex-col gap-4 text-lg leading-8">
              <p className="font-bold">{org.lead}</p>
              <p>{org.body}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="bg-white">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-24 md:grid-cols-2">
          <div className="flex flex-col justify-between gap-10">
            <div className="flex flex-col gap-6">
              <p className="text-4xl leading-tight tracking-[-0.05em] sm:text-6xl">
                Two days to explore the next frontier of coaching.
              </p>
              <p className="text-lg leading-8">
                As our world continues to evolve, coaching has an increasingly important role to
                play in shaping individuals, organisations and communities. This conference is a
                collective invitation to rethink possibilities, challenge conventional thinking and
                expand the impact of coaching in a rapidly changing world.
              </p>
            </div>
            <Link
              href="/agenda"
              className="btn-yellow flex h-16 w-fit items-center rounded-full bg-(--brand-yellow) px-10 text-lg font-bold uppercase sm:h-24 sm:px-14 sm:text-2xl"
            >
              Explore the agenda
            </Link>
          </div>
          <ul className="flex flex-col">
            {lenses.map((lens) => (
              <li key={lens.title} className="flex flex-col gap-2 border-b border-[#b0b0b0] py-6 last:border-b-0">
                <h2 className="text-3xl font-bold tracking-[-0.05em]">{lens.title}</h2>
                <p className="text-lg leading-7">{lens.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
