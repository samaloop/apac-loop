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
