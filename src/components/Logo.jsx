import { Bot } from "lucide-react";

/**
 * Botlify logo — gradient wordmark with robot icon.
 * Sizes: sm (24px icon), md (32px), lg (40px), xl (56px)
 */
export default function Logo({
  size = "md",
  showWordmark = true,
  className = "",
}) {
  const sizes = {
    sm: { box: "w-8 h-8", icon: "w-4 h-4", text: "text-lg" },
    md: { box: "w-10 h-10", icon: "w-5 h-5", text: "text-xl" },
    lg: { box: "w-12 h-12", icon: "w-6 h-6", text: "text-2xl" },
    xl: { box: "w-16 h-16", icon: "w-8 h-8", text: "text-4xl" },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div
        className={`${s.box} bg-brand-gradient rounded-xl flex items-center justify-center shadow-glow`}
      >
        <Bot className={`${s.icon} text-white`} strokeWidth={2.5} />
      </div>
      {showWordmark && (
        <span className={`font-bold tracking-tight text-ink-900 ${s.text}`}>
          Botlify
        </span>
      )}
    </div>
  );
}
