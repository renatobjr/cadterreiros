import type { CSSProperties } from "react";

export interface ArrowIconProps {
  size?: number;
  className?: string;
}

/** Seta de avanço usada em CTAs e links de seção. Puramente decorativa. */
export function ArrowIcon({ size = 16, className }: ArrowIconProps) {
  return (
    <svg
      className={["od-icon", "btn__arrow", className].filter(Boolean).join(" ")}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
      style={{ "--od-icon-size": `${size}px` } as CSSProperties}
    >
      <path
        d="M5 12h14M13 6l6 6-6 6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default ArrowIcon;
