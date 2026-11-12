import type { CommitteeMember } from "@/app/data/committee";

export default function CommitteeCard({ member }: { member: CommitteeMember }) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-black/[.08] bg-background p-6 dark:border-white/[.145] dark:bg-[#241c15]">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-semibold text-white"
        style={{ backgroundColor: member.color }}
        aria-hidden
      >
        {member.initials}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-foreground">{member.name}</h3>
        <p className="text-sm text-accent">{member.role}</p>
        <p className="text-sm text-foreground/60">{member.organization}</p>
      </div>
    </div>
  );
}
