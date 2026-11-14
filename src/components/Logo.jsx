import BotlifyMark from "@/components/BotlifyMark";

/**
 * Botlify logo — ink "b"-bubble mark + a plain Geist wordmark. Deliberately
 * quiet: no gradients, no effects, the orange spark in the mark is the only
 * colour.
 *
 * Props:
 *  - size: sm | md | lg | xl | 2xl
 *  - showWordmark (default true)
 *  - dark: white wordmark + lifted tile for dark surfaces
 */
export default function Logo({ size = "md", showWordmark = true, dark = false, className = "" }) {
  const sizes = {
    sm: { px: 26, text: "text-[1.2rem]", gap: "gap-2" },
    md: { px: 32, text: "text-[1.5rem]", gap: "gap-2.5" },
    lg: { px: 40, text: "text-[1.85rem]", gap: "gap-3" },
    xl: { px: 56, text: "text-[2.6rem]", gap: "gap-3.5" },
    "2xl": { px: 80, text: "text-[3.6rem]", gap: "gap-4" },
  };
  const s = sizes[size] || sizes.md;
  return (
    <div className={`inline-flex items-center ${s.gap} ${className}`}>
      <BotlifyMark size={s.px} tile={dark ? "#24212F" : "#0E0D14"} className="shrink-0" />
      {showWordmark && (
        <span
          className={`font-geist font-semibold leading-none tracking-[-0.04em] ${s.text} ${
            dark ? "text-white" : "text-ink-950"
          }`}
        >
          botlify
        </span>
      )}
    </div>
  );
}
