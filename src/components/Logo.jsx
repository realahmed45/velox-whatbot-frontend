/**
 * Botlify logo — orange robot mascot + wordmark.
 * Renders the actual mascot image (public/logo.png).
 * Sizes: sm (28px), md (36px), lg (44px), xl (64px), 2xl (88px)
 *
 * Props:
 *  - showWordmark: show the "Botlify" text (default true)
 *  - dark: use light wordmark text for dark backgrounds (default false)
 *  - animated: gently float/bob the mascot (wordmark stays steady)
 */
export default function Logo({
  size = "md",
  showWordmark = true,
  dark = false,
  animated = false,
  className = "",
}) {
  const sizes = {
    sm: { img: "w-7 h-7", text: "text-lg" },
    md: { img: "w-9 h-9", text: "text-2xl" },
    lg: { img: "w-11 h-11", text: "text-[1.7rem]" },
    xl: { img: "w-16 h-16", text: "text-4xl" },
    "2xl": { img: "w-20 h-20", text: "text-5xl" },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <img
        src="/logo.png"
        alt="Botlify"
        className={`${s.img} object-contain shrink-0 drop-shadow-sm ${
          animated ? "animate-float will-change-transform" : ""
        }`}
        loading="eager"
        decoding="async"
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
