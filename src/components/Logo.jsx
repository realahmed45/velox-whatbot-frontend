import BotlifyMark from "@/components/BotlifyMark";

/**
 * Botlify logo — crisp SVG robot mark + wordmark.
 * Uses the vector BotlifyMark (razor-sharp at every size).
 *
 * Props:
 *  - size: sm (28px), md (36px), lg (44px), xl (64px), 2xl (88px)
 *  - showWordmark: show the "Botlify" text (default true)
 *  - dark: light wordmark text for dark backgrounds (default false)
 *  - animated: gently float the mark
 */
export default function Logo({
  size = "md",
  showWordmark = true,
  dark = false,
  animated = false,
  className = "",
}) {
  const sizes = {
    sm: { px: 28, text: "text-lg" },
    md: { px: 34, text: "text-2xl" },
    lg: { px: 42, text: "text-[1.7rem]" },
    xl: { px: 60, text: "text-4xl" },
    "2xl": { px: 84, text: "text-5xl" },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <BotlifyMark
        size={s.px}
        className={`shrink-0 ${
          animated ? "animate-float will-change-transform" : ""
        }`}
      />
      {showWordmark && (
        <span
          className={`font-black tracking-tight ${s.text} ${
            dark ? "text-white" : "text-ink-900"
          }`}
        >
          Botl<span className="text-brand-500">ify</span>
        </span>
      )}
    </div>
  );
}
