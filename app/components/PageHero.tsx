// Blue page header shared by the redesigned inner pages: eyebrow, a big
// uppercase title whose second line is the yellow italic highlight, a short
// intro, and the teal arc on the right.
export default function PageHero({
  eyebrow,
  title,
  highlight,
  description,
  eyebrowClassName = "text-(--brand-yellow)",
}: {
  eyebrow: string;
  title: string;
  highlight: string;
  description?: string;
  eyebrowClassName?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-(--brand-blue) text-white">
      <svg
        viewBox="0 0 400 260"
        className="pointer-events-none absolute -right-24 bottom-0 hidden h-[22rem] w-auto md:block"
        aria-hidden
      >
        <path d="M30 260 A230 230 0 0 1 400 75" fill="none" stroke="var(--brand-teal)" strokeOpacity="0.7" strokeWidth="58" />
      </svg>
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-5 px-6 pt-10 pb-16 sm:pt-12 sm:pb-20">
        <p className={`text-base font-bold uppercase sm:text-xl ${eyebrowClassName}`}>{eyebrow}</p>
        <h1 className="max-w-4xl text-5xl font-bold uppercase leading-[1.02] tracking-[-0.05em] sm:text-7xl lg:text-[88px]">
          {title}
          <br />
          <em className="font-bold text-(--brand-yellow-text)">{highlight}</em>
        </h1>
        {description && <p className="max-w-2xl text-base leading-7 sm:text-xl sm:leading-8">{description}</p>}
      </div>
    </section>
  );
}
