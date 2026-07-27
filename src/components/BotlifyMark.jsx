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
      {/* antenna — thin stalk + round bulb, reads as tech not a stem */}
      <path d="M24 6 V10" stroke={body} strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="24" cy="5" r="2.4" fill={body} />

      {/* head — wide rounded bot head (wider than tall so it never reads as fruit) */}
      <rect x="6" y="13" width="36" height="26" rx="11" fill={body} />

      {/* eyes */}
      <circle cx="18" cy="25" r="2.7" fill={face} />
      <circle cx="30" cy="25" r="2.7" fill={face} />

      {/* gentle smile */}
      <path
        d="M18.5 31 q5.5 3.5 11 0"
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
