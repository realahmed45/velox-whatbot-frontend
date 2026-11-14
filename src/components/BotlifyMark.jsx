import { useId } from "react";

/**
 * BotlifyMark — the 2026 mark: a conversation bubble with the sun rising over
 * a horizon inside it. Chat (the AI concierge) + hospitality (a sunrise over
 * the sea) in one silhouette, filled with the Bali-sunset gradient.
 *
 * Built on a 48px grid with chunky geometry so it holds at a 16px favicon and
 * still looks considered at hero size. Each instance gets its own gradient id
 * (useId), so many marks on one page never clash.
 *
 * Props:
 *   size      px (width = height), default 36
 *   mono      single colour (currentColor) with knocked-out sun
 *   glow      soft sunset halo behind the mark
 *   className extra classes on the <svg>
 */
export default function BotlifyMark({ size = 36, className = "", mono = false, glow = false }) {
  const uid = useId().replace(/:/g, "");
  const g = `blf-g-${uid}`;
  const s = `blf-s-${uid}`;
  const body = mono ? "currentColor" : `url(#${g})`;
  const face = mono ? "var(--blf-face, #fff)" : "#fff";

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
      style={glow ? { filter: "drop-shadow(0 6px 14px rgba(255,61,119,0.45))" } : undefined}
    >
      {/* bubble with tail */}
      <path
        d="M16 5h16a12 12 0 0 1 12 12v8a12 12 0 0 1-12 12H20.5l-8.7 6.6c-.9.7-2.2-.1-1.9-1.2l1.4-6A12 12 0 0 1 4 25v-8A12 12 0 0 1 16 5Z"
        fill={body}
      />
      {/* specular edge — the liquid-glass highlight */}
      {!mono && (
        <path
          d="M16 6.2h16a10.8 10.8 0 0 1 10.6 8.8"
          stroke="white"
          strokeOpacity="0.45"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      )}
      {/* rising sun */}
      <path d="M16.6 25.5a7.4 7.4 0 0 1 14.8 0Z" fill={mono ? face : `url(#${s})`} />
      {/* horizon */}
      <path d="M13 28.6h22" stroke={face} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M17.5 32.4h13" stroke={face} strokeOpacity="0.7" strokeWidth="2.2" strokeLinecap="round" />
      {/* spark */}
      <path
        d="M35.6 10.2l.7 1.9 1.9.7-1.9.7-.7 1.9-.7-1.9-1.9-.7 1.9-.7.7-1.9Z"
        fill={face}
        fillOpacity="0.95"
      />
      <defs>
        <linearGradient id={g} x1="4" y1="6" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFB547" />
          <stop offset="0.32" stopColor="#FF6A2B" />
          <stop offset="0.68" stopColor="#FF3D77" />
          <stop offset="1" stopColor="#7C5CFF" />
        </linearGradient>
        <linearGradient id={s} x1="24" y1="18" x2="24" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#FFE7C2" />
        </linearGradient>
      </defs>
    </svg>
  );
}
