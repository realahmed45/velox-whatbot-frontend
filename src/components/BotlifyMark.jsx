/**
 * BotlifyMark — an ink tile holding a geometric lowercase "b" whose bowl is a
 * chat bubble (note the tail), with an orange spark for the AI.
 *
 * Built from primitives (stem + circle + tail) on a 48px grid so it stays crisp
 * from a 16px favicon to the hero. Monochrome-first: the only colour is the
 * spark, which keeps it classy on light and dark surfaces alike.
 *
 * Props:
 *   size      px (width = height), default 36
 *   tile      tile colour (default ink). On dark UIs pass a lifted ink, e.g. "#24212F".
 *   mono      no tile: just the glyph in currentColor (for inline/badge use)
 *   className extra classes on the <svg>
 */
export default function BotlifyMark({ size = 36, className = "", tile = "#0E0D14", mono = false }) {
  const fg = mono ? "currentColor" : "#FFFFFF";
  const counter = mono ? "var(--blf-bg, #fff)" : tile;
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
      {!mono && <rect width="48" height="48" rx="11" fill={tile} />}
      <rect x="12.5" y="9" width="7" height="27.5" rx="3.5" fill={fg} />
      <circle cx="26" cy="27" r="10.5" fill={fg} />
      <path d="M32.6 34.9l4.6 4.3c.5.5.1 1.4-.6 1.3l-6.7-1.1Z" fill={fg} />
      <circle cx="26" cy="27" r="4.6" fill={counter} />
      <circle cx="36.5" cy="11.5" r="3.4" fill="#FF6A2B" />
    </svg>
  );
}
