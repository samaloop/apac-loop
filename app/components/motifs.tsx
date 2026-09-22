export function FrangipaniIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      className={className}
      aria-hidden
    >
      <g>
        <ellipse cx="12" cy="7" rx="2.6" ry="4" />
        <ellipse cx="12" cy="7" rx="2.6" ry="4" transform="rotate(72 12 12)" />
        <ellipse cx="12" cy="7" rx="2.6" ry="4" transform="rotate(144 12 12)" />
        <ellipse cx="12" cy="7" rx="2.6" ry="4" transform="rotate(216 12 12)" />
        <ellipse cx="12" cy="7" rx="2.6" ry="4" transform="rotate(288 12 12)" />
        <circle cx="12" cy="12" r="1.4" />
      </g>
    </svg>
  );
}

export function PalmFrond({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 220"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <path d="M10 210 C 60 160, 90 100, 100 10" />
      <path d="M100 10 C 60 40, 20 60, 0 70" />
      <path d="M100 10 C 70 55, 40 90, 15 110" />
      <path d="M100 10 C 90 65, 75 110, 55 150" />
      <path d="M100 10 C 115 60, 120 110, 115 160" />
      <path d="M100 10 C 135 45, 165 70, 190 80" />
      <path d="M100 10 C 130 60, 155 100, 175 130" />
    </svg>
  );
}

// A simplified Balinese "patra" (ornamental carving) motif — a vertical
// stem with a diamond leaf-bud unit, tiled down the page as a subtle side
// border. Rendered as a repeating background-image (color baked into the
// SVG itself) rather than a CSS mask, since background-image tiling has
// the most consistent cross-browser support.
function patraTileSvg(color: string): string {
  return (
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 96'>` +
    `<line x1='16' y1='0' x2='16' y2='96' stroke='${color}' stroke-width='1.5' stroke-opacity='0.7'/>` +
    `<path d='M16 32 L24 48 L16 64 L8 48 Z' fill='none' stroke='${color}' stroke-width='1.8' stroke-linejoin='round'/>` +
    `<circle cx='16' cy='48' r='3' fill='${color}'/>` +
    `</svg>`
  );
}

export function PatraSideBorder({
  className,
  color = "#d9a441",
}: {
  className?: string;
  color?: string;
}) {
  const encodedColor = color.replace("#", "%23");
  const svg = patraTileSvg(encodedColor);
  return (
    <div
      aria-hidden
      className={className}
      style={{
        backgroundImage: `url("data:image/svg+xml,${svg}")`,
        backgroundRepeat: "repeat-y",
        backgroundSize: "32px 96px",
        backgroundPosition: "top center",
      }}
    />
  );
}

// Generic person silhouette used as a placeholder "photo" for speakers/
// committee members until real portraits are available.
export function PersonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8v1H4v-1Z" />
    </svg>
  );
}

export function UsersIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17" cy="8" r="2.4" />
      <path d="M15.5 14.2c2.5.4 4.5 2.6 4.5 5.3" />
    </svg>
  );
}

export function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

export function NetworkIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="6" cy="6" r="2.2" />
      <circle cx="18" cy="6" r="2.2" />
      <circle cx="12" cy="18" r="2.2" />
      <path d="M7.7 7.4 10.5 16M16.3 7.4 13.5 16M8.2 6h7.6" />
    </svg>
  );
}

export function BadgeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="9" r="5" />
      <path d="M9 13.5 7.5 21l4.5-2.5 4.5 2.5-1.5-7.5" />
    </svg>
  );
}

export function WaveDivider({
  className,
  color = "var(--background)",
  flip = false,
}: {
  className?: string;
  color?: string;
  flip?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
      className={className}
      style={flip ? { transform: "scaleY(-1)" } : undefined}
      aria-hidden
    >
      <path
        d="M0 40 C 240 90, 480 0, 720 30 C 960 60, 1200 10, 1440 40 L1440 80 L0 80 Z"
        fill={color}
      />
    </svg>
  );
}
