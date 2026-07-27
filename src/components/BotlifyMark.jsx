/**
 * BotlifyMark — Botlify's icon: a friendly, aesthetic bot.
 *
 * A soft rounded (squircle) head in a warm orange gradient, a tiny antenna,
 * two calm dot eyes and a gentle smile. Simple, approachable, unmistakably a
 * bot. Transparent background (bare SVG, no tile) so it drops cleanly onto any
 * surface, and it stays crisp from a 16px favicon up to the hero.
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
      <circle cx="24" cy="7" r="2.3" fill={body} />
      <path d="M24 9 V12" stroke={body} strokeWidth="2.6" strokeLinecap="round" />

      {/* head — soft squircle */}
      <rect x="8" y="12" width="32" height="27" rx="13" fill={body} />

      {/* eyes */}
      <circle cx="18.5" cy="24" r="2.6" fill={face} />
      <circle cx="29.5" cy="24" r="2.6" fill={face} />

      {/* gentle smile */}
      <path
        d="M19 30 q5 3.5 10 0"
        stroke={face}
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />

      <defs>
        <linearGradient
          id={gid}
          x1="8"
          y1="6"
          x2="40"
          y2="42"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#ff9a5c" />
          <stop offset="0.55" stopColor="#ff5722" />
          <stop offset="1" stopColor="#e13c08" />
        </linearGradient>
      </defs>
    </svg>
  );
}
