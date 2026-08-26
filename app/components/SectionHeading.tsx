import { FrangipaniIcon } from "./motifs";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: SectionHeadingProps) {
  const isCentered = align === "center";

  return (
    <div
      className={`flex flex-col gap-3 ${
        isCentered ? "items-center text-center" : "items-start text-left"
      }`}
    >
      {eyebrow && (
        <span className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-accent">
          <FrangipaniIcon className="h-4 w-4" />
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="max-w-2xl text-lg text-foreground/70">{description}</p>
      )}
    </div>
  );
}
