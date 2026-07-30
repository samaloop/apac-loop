import type { Metadata } from "next";
import { agenda } from "../data/agenda";
import SectionHeading from "../components/SectionHeading";
import AgendaDay from "../components/AgendaDay";

export const metadata: Metadata = {
  title: "Agenda | Loop Coaching Summit 2026",
  description: "Day 1 and Day 2 schedule for Loop Coaching Summit 2026.",
};

export default function AgendaPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-6 py-20">
      <SectionHeading
        eyebrow="Agenda"
        title="Two days of keynotes, workshops, and conversation"
        description="A first look at the schedule — subject to change as the program is finalized."
      />
      {agenda.map((day) => (
        <AgendaDay key={day.day} data={day} />
      ))}
    </div>
  );
}
