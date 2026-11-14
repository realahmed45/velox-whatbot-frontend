import BotlifyMark from "@/components/BotlifyMark";

/**
 * BrandSpinner — Botlify's signature loading animation.
 *
 * A sunset conic ring orbiting the Botlify mark inside a soft halo. Used as
 * the Suspense fallback and anywhere a full-screen or inline loading state
 * is needed.
 */
export default function BrandSpinner({ fullScreen = true, label = "Loading" }) {
  const spinner = (
    <div className="flex flex-col items-center gap-5" role="status" aria-live="polite">
      <div className="relative h-16 w-16">
        {/* halo */}
        <div aria-hidden className="absolute -inset-4 rounded-full bg-sunset opacity-25 blur-2xl animate-glow-pulse" />
        {/* conic sunset ring, masked to a thin band */}
        <div
          aria-hidden
          className="absolute inset-0 rounded-full bg-sunset-conic animate-spin"
          style={{
            animationDuration: "1.1s",
            WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
            mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
          }}
        />
        {/* glass core */}
        <div className="absolute inset-[5px] grid place-items-center rounded-full bg-white/80 shadow-[inset_0_1px_0_#fff,0_4px_14px_-6px_rgba(255,61,119,0.45)] backdrop-blur">
          <BotlifyMark size={26} className="animate-pulse" />
        </div>
      </div>
      {label && (
        <div className="flex items-center gap-1 text-sm font-medium text-ink-500">
          <span>{label}</span>
          <span className="inline-flex">
            <span className="animate-bounce" style={{ animationDelay: "0ms" }}>
              .
            </span>
            <span className="animate-bounce" style={{ animationDelay: "150ms" }}>
              .
            </span>
            <span className="animate-bounce" style={{ animationDelay: "300ms" }}>
              .
            </span>
          </span>
        </div>
      )}
    </div>
  );

  if (!fullScreen) return spinner;

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--canvas)" }}>
      {spinner}
    </div>
  );
}
