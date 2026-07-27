/**
 * BotlifyMark — Botlify's icon: a winking robot with a lightning-bolt eye.
 *
 * A rounded orange bot head with an antenna, one round eye, and one eye shaped
 * like a lightning bolt — "a bot that fires instantly." The asymmetry is what
 * makes it distinctive and ownable, not a generic robot face. Transparent
 * background, single warm gradient, crisp from a 16px favicon to the hero.
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
      <path d="M24 4 V8" stroke={body} strokeWidth="3" strokeLinecap="round" />
      <circle cx="24" cy="3" r="3" fill={body} />

      {/* head */}
      <path
        d="M12 11 h24 a8 8 0 0 1 8 8 v10 a8 8 0 0 1 -8 8 h-24 a8 8 0 0 1 -8 -8 v-10 a8 8 0 0 1 8 -8 Z"
        fill={body}
      />

      {/* left eye — round */}
      <circle cx="18" cy="24" r="3.2" fill={face} />

      {/* right eye — lightning bolt (the signature detail) */}
      <path d="M31 19 l-4 6 h3 l-2 5 5 -7 h-3 Z" fill={face} />

      <defs>
        <linearGradient
          id={gid}
          x1="6"
          y1="4"
          x2="42"
          y2="44"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#ff9a5c" />
          <stop offset="0.5" stopColor="#ff5722" />
          <stop offset="1" stopColor="#d93b06" />
        </linearGradient>
      </defs>
    </svg>
  );
}
