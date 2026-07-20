/**
 * BrandSpinner — Botlify's signature loading animation.
 *
 * A dual orange ring that spins around the Botlify logo, on brand
 * (#FF6B2C). Used as the Suspense fallback and anywhere a full-screen
 * or inline loading state is needed.
 */
export default function BrandSpinner({ fullScreen = true, label = "Loading" }) {
  const spinner = (
    <div className="flex flex-col items-center gap-5">
      <div className="relative w-16 h-16">
        {/* faint track */}
        <div className="absolute inset-0 rounded-full border-4 border-brand-100" />
        {/* spinning arc */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-500 border-r-brand-500 animate-spin" />
        {/* inner counter-spinning arc for depth */}
        <div
          className="absolute inset-2 rounded-full border-[3px] border-transparent border-b-brand-400 animate-spin"
          style={{ animationDirection: "reverse", animationDuration: "1.1s" }}
        />
        {/* logo core */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="/logo.png"
            alt="Botlify"
            className="w-7 h-7 object-contain animate-pulse"
          />
        </div>
      </div>
      {label && (
        <div className="flex items-center gap-1 text-sm font-semibold text-ink-500">
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
    <div className="min-h-screen flex items-center justify-center bg-white">
      {spinner}
    </div>
  );
}
