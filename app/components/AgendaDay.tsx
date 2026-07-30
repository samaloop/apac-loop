import type { AgendaDayData } from "@/app/data/agenda";

export default function AgendaDay({ data }: { data: AgendaDayData }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-baseline gap-3">
        <h3 className="text-2xl font-semibold text-foreground">{data.day}</h3>
        <span className="text-sm text-foreground/60">{data.date}</span>
      </div>
      <ol className="flex flex-col gap-4">
        {data.sessions.map((session) => (
          <li
            key={session.time + session.title}
            className="flex flex-col gap-1 rounded-xl border border-black/[.08] bg-white p-5 sm:flex-row sm:items-start sm:gap-6 dark:border-white/[.145] dark:bg-[#111]"
          >
            <span className="w-20 shrink-0 text-sm font-semibold text-accent">
              {session.time}
            </span>
            <div>
              <h4 className="text-base font-semibold text-foreground">{session.title}</h4>
              <p className="mt-1 text-sm leading-6 text-foreground/70">{session.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
