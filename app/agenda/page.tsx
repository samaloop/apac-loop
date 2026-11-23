import type { Metadata } from "next";
import PageHero from "../components/PageHero";
import RegisterLink from "@/app/components/RegisterLink";

export const metadata: Metadata = {
  title: "Agenda | APAC Coaching Conference 2027",
  description: "A first look at the two days of APAC Coaching Conference 2027 in Bali.",
};

// Session titles stay indicative until the program is confirmed.
const sessions = ["Arrival and welcome", "Opening experience", "Featured conversations", "Connection sessions"];

const days = [
  { label: "Day 01", date: "Wednesday · 22 September 2027", theme: "Gather · Expand · Connect" },
  { label: "Day 02", date: "Thursday · 23 September 2027", theme: "Explore · Integrate · Act" },
];

export default function AgendaPage() {
  return (
    <div className="flex flex-col bg-(--brand-cream) text-(--brand-ink)">
      <PageHero
        eyebrow="Two days of discovery"
        title="The festival"
        highlight="agenda."
        description="A first look at the flow of the conference. Session titles, speakers and exact timings are still to be confirmed."
      />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-14">
        <div className="flex flex-col gap-2 border-l-[15px] border-(--brand-coral) bg-(--brand-blue) px-6 py-6 text-white sm:flex-row sm:items-center sm:justify-between">
          <p className="text-lg font-bold">Agenda preview</p>
          <p className="text-sm sm:text-base">All listed formats are indicative and subject to confirmation.</p>
        </div>

        {days.map((day) => (
          <div key={day.label} className="grid md:grid-cols-[minmax(0,386px)_minmax(0,1fr)]">
            <div className="flex flex-col gap-1 bg-(--brand-blue) px-9 py-10 text-white">
              <p className="text-3xl font-bold text-(--brand-yellow)">{day.label}</p>
              <p className="text-base">{day.date}</p>
              {/* Non-breaking space before each dot so a line never starts with "·" */}
              <p className="mt-8 text-3xl font-bold leading-tight tracking-[-0.05em] sm:text-4xl">
                {day.theme.replaceAll(" · ", " · ")}
              </p>
            </div>
            <ol className="flex flex-col justify-center border border-black bg-white px-8 py-6 md:border-l-0">
              {sessions.map((session, i) => (
                <li
                  key={session}
                  className="flex items-center gap-8 border-b border-[#cfcfcf] py-3 last:border-b-0"
                >
                  <span className="w-10 text-3xl font-bold text-(--brand-coral)">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-lg font-bold">{session}</span>
                </li>
              ))}
            </ol>
          </div>
        ))}

        <div className="flex flex-col gap-6 bg-(--brand-coral) px-8 py-9 text-white sm:flex-row sm:items-center sm:justify-between sm:px-12">
          <div>
            <p className="text-base font-bold uppercase text-(--brand-cream)">Ready to join us?</p>
            <p className="text-3xl font-bold sm:text-4xl">Save your place in Bali.</p>
            <p className="mt-2 text-base">
              Be part of the movement. Be part of the conversation. Be part of THE NEXT FRONTIER.
            </p>
          </div>
          <RegisterLink
            href="/register"
            className="flex h-12 w-fit items-center rounded-full bg-(--brand-yellow) px-7 text-sm font-bold uppercase text-(--brand-ink)"
          >
            Register now
          </RegisterLink>
        </div>
      </div>
    </div>
  );
}
