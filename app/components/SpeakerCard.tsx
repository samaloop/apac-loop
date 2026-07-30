import type { Speaker } from "@/app/data/speakers";

export default function SpeakerCard({ speaker }: { speaker: Speaker }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-black/[.08] bg-white p-6 dark:border-white/[.145] dark:bg-[#111]">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-semibold text-white"
        style={{ backgroundColor: speaker.color }}
        aria-hidden
      >
        {speaker.initials}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-foreground">{speaker.name}</h3>
        <p className="text-sm text-accent">{speaker.role}</p>
        <p className="text-sm text-foreground/60">{speaker.company}</p>
      </div>
      <p className="text-sm leading-6 text-foreground/70">{speaker.bio}</p>
    </div>
  );
}
