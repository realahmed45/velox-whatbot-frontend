/**
 * BotlifyMark — Botlify's brand mark.
 *
 * A speech bubble with a lightning bolt struck through it: "instant, automated
 * messaging." Bold, ownable, and razor-sharp at every size — the bolt reads
 * clearly all the way down to a 16px favicon. The bubble tail sits bottom-left
 * so it's unmistakably a message/DM.
 *
 * Props:
 *   size      pixel size (width = height), default 36
 *   className extra classes on the <svg>
 *   mono      single-color render (uses currentColor) for subtle/dark uses
 */
export default function BotlifyMark({ size = 36, className = "", mono = false }) {
  const gid = "blf_g";
  const bubble = mono ? "currentColor" : `url(#${gid})`;
  const bolt = mono ? "#fff" : "#fff";

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
      {/* speech bubble with a bottom-left tail */}
      <path
        d="M13 8 H35
           A9.5 9.5 0 0 1 44.5 17.5 V28.5
           A9.5 9.5 0 0 1 35 38 H23.5
           L15 44.8
           A1 1 0 0 1 13.4 44 V37.9
           A9.5 9.5 0 0 1 4 28.5 V17.5
           A9.5 9.5 0 0 1 13 8 Z"
        fill={bubble}
      />

      {/* subtle top sheen for depth */}
      {!mono && (
        <path
          d="M13 8 H35 A9.5 9.5 0 0 1 44.5 17.5 V21 H4 V17.5 A9.5 9.5 0 0 1 13 8 Z"
          fill="#fff"
          opacity="0.14"
        />
      )}

      {/* lightning bolt = instant / automated */}
      <path
        d="M27 13.5 L18 25.5 H23.2 L21 34 L31 21.5 H25.4 Z"
        fill={bolt}
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
      </defs>
    </svg>
  );
}
