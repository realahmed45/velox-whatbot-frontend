/**
 * BotlifyMark — the Botlify robot mark, redesigned as a crisp inline SVG.
 *
 * A bold, geometric orange robot head: solid fills, thick rounded strokes, a
 * friendly screen-face, and two antennae. Built to stay razor-sharp and
 * recognizable at any size — from a 16px favicon to a 96px hero — unlike the
 * old hand-drawn PNG.
 *
 * Props:
 *   size      pixel size (width = height), default 36
 *   className extra classes on the <svg>
 *   mono      render single-color (uses currentColor) — for dark/subtle uses
 */
export default function BotlifyMark({ size = 36, className = "", mono = false }) {
  const orange = mono ? "currentColor" : "#ff5722";
  const orangeDeep = mono ? "currentColor" : "#f2440c";
  const face = mono ? "#fff" : "#fff";

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
      {/* antennae */}
      <path
        d="M18 9 L15.5 4.5"
        stroke={orange}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M30 9 L32.5 4.5"
        stroke={orange}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="15" cy="4" r="2.4" fill={orange} />
      <circle cx="33" cy="4" r="2.4" fill={orange} />

      {/* head — rounded square with a soft depth edge */}
      <rect
        x="7"
        y="8"
        width="34"
        height="28"
        rx="9"
        fill={orange}
      />
      {!mono && (
        <rect
          x="7"
          y="8"
          width="34"
          height="28"
          rx="9"
          fill="url(#blf_grad)"
          opacity="0.18"
        />
      )}

      {/* screen face */}
      <rect x="13" y="14" width="22" height="16" rx="6" fill={face} />

      {/* eyes */}
      <circle cx="20" cy="21.5" r="2.3" fill={orangeDeep} />
      <circle cx="28" cy="21.5" r="2.3" fill={orangeDeep} />
      {/* smile */}
      <path
        d="M20 25.5 Q24 28.5 28 25.5"
        stroke={orangeDeep}
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />

      {/* little neck / body hint */}
      <rect x="20.5" y="36" width="7" height="5" rx="2.5" fill={orangeDeep} />

      <defs>
        <linearGradient id="blf_grad" x1="7" y1="8" x2="41" y2="36">
          <stop stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
