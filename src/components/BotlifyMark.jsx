import { useId } from "react";

/**
 * BotlifyMark — a lowercase "b" whose bowl is a chat bubble with three typing
 * dots: Botlify, replying to your guests. One silhouette, readable from a 16px
 * favicon to the hero, filled with the sunset gradient.
 *
 * Props:
 *   size      px (width = height), default 36
 *   mono      single colour (currentColor), dots knocked out in white
 *   glow      soft sunset shadow under the mark
 *   className extra classes on the <svg>
 */
export default function BotlifyMark({ size = 36, className = "", mono = false, glow = false }) {
  const uid = useId().replace(/:/g, "");
  const g = `blf-g-${uid}`;
  const fill = mono ? "currentColor" : `url(#${g})`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Botlify"
      style={glow ? { filter: "drop-shadow(0 4px 10px rgba(255,61,119,0.35))" } : undefined}
    >
      <path
        d="M12.5 3.5h0a4.5 4.5 0 0 1 4.5 4.5v8.6c2-.7 4.2-1.1 6.5-1.1H30a13 13 0 0 1 13 13v1a13 13 0 0 1-8.1 12l1.7 4.4c.4 1-.7 1.9-1.6 1.3l-6.3-4.7h-5.2A15.5 15.5 0 0 1 8 27V8a4.5 4.5 0 0 1 4.5-4.5Z"
        fill={fill}
      />
      <circle cx="20.5" cy="29" r="2.6" fill="#fff" />
      <circle cx="27.5" cy="29" r="2.6" fill="#fff" fillOpacity="0.85" />
      <circle cx="34.5" cy="29" r="2.6" fill="#fff" fillOpacity="0.7" />
      {!mono && (
        <defs>
          <linearGradient id={g} x1="6" y1="4" x2="44" y2="46" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFB547" />
            <stop offset="0.35" stopColor="#FF6A2B" />
            <stop offset="0.72" stopColor="#FF3D77" />
            <stop offset="1" stopColor="#7C5CFF" />
          </linearGradient>
        </defs>
      )}
    </svg>
  );
}
