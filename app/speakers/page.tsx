import type { Metadata } from "next";
import { speakers } from "../data/speakers";
import SectionHeading from "../components/SectionHeading";
import SpeakerCard from "../components/SpeakerCard";

export const metadata: Metadata = {
  title: "Speakers | Loop Coaching Summit 2026",
  description: "Meet the speakers of Loop Coaching Summit 2026.",
};

export default function SpeakersPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-20">
      <SectionHeading
        eyebrow="Speakers"
        title="Practitioners shaping coaching in Indonesia"
        description="A lineup of coaches, psychologists, and leaders sharing what's working in coaching practice today."
      />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {speakers.map((speaker) => (
          <SpeakerCard key={speaker.id} speaker={speaker} />
        ))}
      </div>
    </div>
  );
}
