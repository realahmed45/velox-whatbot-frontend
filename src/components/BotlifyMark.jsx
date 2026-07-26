/**
 * BotlifyMark — Botlify's brand mark.
 *
 * An automation loop (a circular arrow) wrapped around a lightning bolt:
 * "automated + instant." It says what the product does — triggers that fire
 * automatically — and stays razor-sharp from a 16px favicon to the hero.
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

      {/* automation loop — an open circular arrow */}
      <path
        d="M33.5 20 A11 11 0 1 0 34.5 27.5"
        fill="none"
        stroke={glyph}
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <path d="M31.5 13.5 L35.6 20.6 L27.7 21 Z" fill={glyph} />

      {/* lightning bolt — instant / triggered */}
      <path d="M26.5 14 L18.5 25 H23.3 L21.5 32.5 L29.5 21 H24.6 Z" fill={glyph} />

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
