/**
 * BotlifyMark — Botlify's brand mark.
 *
 * A custom monogram: a bold lowercase "b" (for Botlify) on a rounded gradient
 * tile, where the bowl of the "b" carries a chat-bubble tail — so the letter
 * itself reads as a message. Simple, ownable, and razor-sharp at any size
 * (the concept survives all the way down to a 16px favicon).
 *
 * Props:
 *   size      pixel size (width = height), default 36
 *   className extra classes on the <svg>
 *   mono      single-color render (uses currentColor); knockout becomes
 *             transparent so it works on top of a colored surface
 *   plain     omit the tile — just the "b" glyph in brand color (for use on
 *             already-branded/coloured backgrounds)
 */
export default function BotlifyMark({
  size = 36,
  className = "",
  mono = false,
  plain = false,
}) {
  const gid = "blf_g";
  const tile = mono ? "currentColor" : `url(#${gid})`;
  // The "b" is knocked out of the tile (white). In plain mode there's no tile,
  // so the "b" is drawn in brand orange instead.
  const glyph = plain ? (mono ? "currentColor" : "#ff5722") : "#fff";

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
      {!plain && (
        <>
          <rect x="2" y="2" width="44" height="44" rx="13" fill={tile} />
          {!mono && (
            <rect
              x="2"
              y="2"
              width="44"
              height="44"
              rx="13"
              fill="url(#blf_sheen)"
              opacity="0.18"
            />
          )}
        </>
      )}

      {/* The "b": bold stem + a round bowl. even-odd cuts the counter (the hole)
          so the tile/background shows through — that hole is what makes it a
          clean, high-contrast letter at tiny sizes. */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        fill={glyph}
        d="
          M15.4 8.5
          a3 3 0 0 1 3 3
          V18
          A10 10 0 0 1 24.3 16
          A10.4 10.4 0 0 1 34.7 26.4
          A10.4 10.4 0 0 1 24.3 36.8
          A10 10 0 0 1 18.4 34.8
          V35.5
          a3 3 0 0 1 -6 0
          V11.5
          A3 3 0 0 1 15.4 8.5
          Z
          M23.9 21.6
          a4.8 4.8 0 1 0 0 9.6
          a4.8 4.8 0 0 0 0 -9.6
          Z
        "
      />

      {/* chat-bubble tail on the bowl → the 'b' is a message */}
      <path
        d="M31.4 33.2 L36.6 37.4 L31 37.9 Z"
        fill={glyph}
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
