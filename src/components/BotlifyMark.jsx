/**
 * BotlifyMark — Botlify's brand mark.
 *
 * A friendly bot face (eyes + smile) wrapped by an automation loop arrow —
 * "a bot that replies, on autopilot." It fuses the two things Botlify is about:
 * the bot and the automation. Razor-sharp from a 16px favicon to the hero.
 *
 * Props:
 *   size      pixel size (width = height), default 36
 *   className extra classes on the <svg>
 *   mono      single-color render (uses currentColor) for subtle/dark uses
 */
export default function BotlifyMark({ size = 36, className = "", mono = false }) {
  const gid = "blf_g";
  const tile = mono ? "currentColor" : `url(#${gid})`;
  const glyph = "#fff";

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
      {/* rounded tile */}
      <rect x="2" y="2" width="44" height="44" rx="13" fill={tile} />
      {!mono && (
        <rect
          x="2"
          y="2"
          width="44"
          height="44"
          rx="13"
          fill="url(#blf_sheen)"
          opacity="0.16"
        />
      )}

      {/* automation loop circling the face */}
      <path
        d="M34.5 17.5 A11.5 11.5 0 1 0 35.5 26"
        fill="none"
        stroke={glyph}
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <path d="M32.8 11.5 L36.4 18 L29.6 18.4 Z" fill={glyph} />

      {/* bot face — two eyes + a smile */}
      <circle cx="20.3" cy="22.5" r="1.9" fill={glyph} />
      <circle cx="27.7" cy="22.5" r="1.9" fill={glyph} />
      <path
        d="M20 28 q4 3 8 0"
        stroke={glyph}
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />

      <defs>
        <linearGradient
          id={gid}
          x1="4"
          y1="4"
          x2="44"
          y2="44"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#ff8a4c" />
          <stop offset="0.5" stopColor="#ff5722" />
          <stop offset="1" stopColor="#e13c08" />
        </linearGradient>
        <linearGradient
          id="blf_sheen"
          x1="6"
          y1="4"
          x2="26"
          y2="30"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
