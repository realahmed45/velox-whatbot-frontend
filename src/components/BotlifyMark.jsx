/**
 * BotlifyMark — Botlify's icon: a clean, iconic orange robot head.
 *
 * Transparent background (no tile), single warm-orange gradient, thick friendly
 * geometry — a rounded head with an antenna, two eyes, and side panels. Reads
 * instantly as "a bot" on light or dark, from a 16px favicon to the hero.
 *
 * Props:
 *   size      pixel size (width = height), default 36
 *   className extra classes on the <svg>
 *   mono      single-color render (uses currentColor) for subtle/dark uses
 */
export default function BotlifyMark({ size = 36, className = "", mono = false }) {
  const gid = "blf_g";
  const body = mono ? "currentColor" : `url(#${gid})`;
  const face = "#fff";

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
    >
      {/* antenna */}
      <path
        d="M24 4 V8"
        stroke={body}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="24" cy="3" r="3" fill={body} />

      {/* head */}
      <path
        d="M13 11 h22 a7 7 0 0 1 7 7 v13 a7 7 0 0 1 -7 7 h-22 a7 7 0 0 1 -7 -7 v-13 a7 7 0 0 1 7 -7 Z"
        fill={body}
      />

      {/* side ear-panels */}
      <path
        d="M6 22 h-2 a2 2 0 0 0 -2 2 v3 a2 2 0 0 0 2 2 h2 Z"
        fill={body}
      />
      <path
        d="M42 22 h2 a2 2 0 0 1 2 2 v3 a2 2 0 0 1 -2 2 h-2 Z"
        fill={body}
      />

      {/* eyes */}
      <circle cx="18" cy="24" r="3" fill={face} />
      <circle cx="30" cy="24" r="3" fill={face} />

      <defs>
        <linearGradient
          id={gid}
          x1="6"
          y1="4"
          x2="42"
          y2="44"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#ff8a4c" />
          <stop offset="0.5" stopColor="#ff5722" />
          <stop offset="1" stopColor="#e13c08" />
        </linearGradient>
      </defs>
    </svg>
  );
}
