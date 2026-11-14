import BotlifyMark from "@/components/BotlifyMark";

/**
 * Botlify logo — sunrise-bubble mark + lowercase wordmark ending in a glowing
 * sunset dot. The dot is the brand's signature detail: it breathes slowly, and
 * the mark lifts on hover.
 *
 * Props:
 *  - size: sm | md | lg | xl | 2xl
 *  - showWordmark (default true)
 *  - dark: white wordmark for night surfaces
 *  - animated: mark floats gently
 */
export default function Logo({
  size = "md",
  showWordmark = true,
  dark = false,
  animated = false,
  className = "",
}) {
  const sizes = {
    sm: { px: 26, text: "text-[1.15rem]", dot: "h-1.5 w-1.5", gap: "gap-2" },
    md: { px: 32, text: "text-[1.45rem]", dot: "h-[7px] w-[7px]", gap: "gap-2.5" },
    lg: { px: 40, text: "text-[1.8rem]", dot: "h-2 w-2", gap: "gap-2.5" },
    xl: { px: 56, text: "text-[2.6rem]", dot: "h-2.5 w-2.5", gap: "gap-3" },
    "2xl": { px: 80, text: "text-[3.6rem]", dot: "h-3.5 w-3.5", gap: "gap-4" },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className={`group/logo inline-flex items-center ${s.gap} ${className}`}>
      <span
        className={`relative inline-flex shrink-0 transition-transform duration-500 ease-spring group-hover/logo:-translate-y-0.5 group-hover/logo:rotate-[-6deg] ${
          animated ? "animate-float" : ""
        }`}
      >
        <BotlifyMark size={s.px} glow={dark} />
      </span>
      {showWordmark && (
        <span
          className={`inline-flex items-baseline font-display font-bold leading-none tracking-[-0.045em] ${s.text} ${
            dark ? "text-white" : "text-ink-950"
          }`}
        >
          botlify
          <span
            aria-hidden
            className={`ml-[0.08em] inline-block rounded-full bg-sunset ${s.dot} animate-pulse-soft`}
            style={{ boxShadow: "0 0 12px rgba(255,61,119,0.6)" }}
          />
        </span>
      )}
    </div>
  );
}
