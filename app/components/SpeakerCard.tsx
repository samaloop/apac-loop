import type { Speaker } from "@/app/data/speakers";
import { PersonIcon } from "./motifs";

export default function SpeakerCard({ speaker }: { speaker: Speaker }) {
  return (
    <div className="group relative flex min-h-64 flex-col gap-4 overflow-hidden rounded-3xl border border-black/[.08] bg-background p-6 dark:border-white/[.145] dark:bg-[#241c15]">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full text-white"
        style={{ backgroundColor: speaker.color }}
        aria-hidden
      >
        <PersonIcon className="h-7 w-7" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-foreground">{speaker.name}</h3>
        <p className="text-sm text-accent">{speaker.role}</p>
        <p className="text-sm text-foreground/60">{speaker.company}</p>
      </div>
      <div className="absolute inset-x-0 bottom-0 translate-y-full bg-linear-to-t from-background via-background/95 to-transparent p-6 pt-10 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 dark:from-[#241c15] dark:via-[#241c15]/95">
        <p className="text-sm leading-6 text-foreground/70">{speaker.bio}</p>
      </div>
    </div>
  );
}
