/**
 * BotlifyMark — Botlify's brand mark.
 *
 * A "b" monogram orbited by a tilted ring and a spark — the letter stays
 * grounded while the orbit says "out of this world / always in motion." Bold,
 * ownable, and razor-sharp from a 16px favicon to the hero.
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

      {/* tilted orbit ring behind the letter */}
      <ellipse
        cx="24"
        cy="24"
        rx="17"
        ry="6.5"
        fill="none"
        stroke={glyph}
        strokeWidth="2.4"
        opacity="0.55"
        transform="rotate(-28 24 24)"
      />

      {/* the "b" — stem + bowl, counter cut so the tile shows through */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        fill={glyph}
        d="
          M15.5 10
          a2.8 2.8 0 0 1 2.8 2.8
          V19
          A9.2 9.2 0 0 1 24 17.2
          A9.6 9.6 0 0 1 33.6 26.8
          A9.6 9.6 0 0 1 24 36.4
          A9.2 9.2 0 0 1 18.3 34.6
          V35
          a2.8 2.8 0 0 1 -5.6 0
          V12.8
          A2.8 2.8 0 0 1 15.5 10
          Z
          M24 22.3
          a4.5 4.5 0 1 0 0 9
          a4.5 4.5 0 0 0 0 -9
          Z
        "
      />

      {/* spark / satellite on the orbit */}
      <circle cx="38" cy="14" r="2.6" fill={glyph} />

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
