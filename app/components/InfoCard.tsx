type InfoCardProps = {
  title: string;
  meta?: string;
  description: string;
};

export default function InfoCard({ title, meta, description }: InfoCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-black/[.08] bg-white p-6 dark:border-white/[.145] dark:bg-[#111]">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {meta && (
          <span className="shrink-0 rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-foreground/70">
            {meta}
          </span>
        )}
      </div>
      <p className="text-sm leading-6 text-foreground/70">{description}</p>
    </div>
  );
}
