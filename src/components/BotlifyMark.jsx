/**
 * BotlifyMark — Botlify's brand mark.
 *
 * A unique "chat-bot" glyph: a rounded speech bubble (Botlify automates DMs)
 * that doubles as a robot's face — a single antenna, two friendly eyes, and a
 * warm smile. It fuses the two ideas the product is about — conversations and
 * a bot — into one confident, geometric mark with a warm orange gradient.
 *
 * Pure vector, so it stays razor-sharp from a 16px favicon to a 128px hero.
 *
 * Props:
 *   size      pixel size (width = height), default 36
 *   className extra classes on the <svg>
 *   mono      single-color render (uses currentColor) for subtle/dark uses
 */
export default function BotlifyMark({ size = 36, className = "", mono = false }) {
  const gid = "blf_g";
  const bubbleFill = mono ? "currentColor" : `url(#${gid})`;
  const faceInk = mono ? "#fff" : "#fff";
  const featureInk = mono ? "currentColor" : "#f2440c";

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
      {/* antenna — marks it as a bot */}
      <path
        d="M24 6.5 V3.2"
        stroke={mono ? "currentColor" : "#ff5722"}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="24" cy="2.6" r="2.5" fill={mono ? "currentColor" : "#ff5722"} />

      {/* speech bubble = head. rounded body + a tail at the bottom-left,
          so it reads unmistakably as a chat/DM shape. */}
      <path
        d="M14 7.5 H34
           A9.5 9.5 0 0 1 43.5 17 V29
           A9.5 9.5 0 0 1 34 38.5 H23
           L14.5 45.2
           A1 1 0 0 1 13 44.4 V38.4
           A9.5 9.5 0 0 1 4.5 29 V17
           A9.5 9.5 0 0 1 14 7.5 Z"
        fill={bubbleFill}
      />

      {/* subtle top-light sheen for depth */}
      {!mono && (
        <path
          d="M14 7.5 H34 A9.5 9.5 0 0 1 43.5 17 V22 H4.5 V17 A9.5 9.5 0 0 1 14 7.5 Z"
          fill="#fff"
          opacity="0.14"
        />
      )}

      {/* eyes */}
      <circle cx="18.5" cy="21" r="2.7" fill={faceInk} />
      <circle cx="29.5" cy="21" r="2.7" fill={faceInk} />
      <circle cx="18.5" cy="21" r="1.1" fill={featureInk} />
      <circle cx="29.5" cy="21" r="1.1" fill={featureInk} />

      {/* smile */}
      <path
        d="M18 27.5 Q24 32 30 27.5"
        stroke={faceInk}
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />

      <defs>
        <linearGradient
          id={gid}
          x1="6"
          y1="8"
          x2="42"
          y2="44"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#ff7d3e" />
          <stop offset="0.55" stopColor="#ff5722" />
          <stop offset="1" stopColor="#f2440c" />
        </linearGradient>
      </defs>
    </svg>
  );
}
