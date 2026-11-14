import { clsx } from "clsx";

/**
 * Reusable empty-state card shown when a list has no items yet.
 * Every list page should use this instead of ad-hoc empty markup.
 *
 * Centred icon tile floating in a soft sunset halo, display-font title,
 * one sentence, and the actions.
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}) {
  return (
    <div
      className={clsx(
        "card group relative flex flex-col items-center justify-center overflow-hidden px-6 py-14 text-center",
        className,
      )}
    >
      {/* faint dot texture fading from the centre */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-dot-grid opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent_65%)]"
      />
      {Icon && (
        <div className="relative mb-5">
          <div aria-hidden className="absolute -inset-6 rounded-full bg-sunset opacity-20 blur-2xl animate-glow-pulse" />
          <div className="relative grid h-14 w-14 place-items-center rounded-2xl bg-white/90 text-sunset-flame shadow-[inset_0_1px_0_#fff,0_0_0_1px_rgba(255,106,43,0.14),0_10px_30px_-10px_rgba(255,61,119,0.45)] transition-transform duration-500 ease-spring group-hover:-translate-y-1 group-hover:rotate-[-8deg]">
            <Icon className="h-7 w-7" strokeWidth={1.8} />
          </div>
        </div>
      )}
      {title && (
        <h3 className="relative mb-1.5 font-display text-lg font-semibold tracking-[-0.02em] text-ink-900">{title}</h3>
      )}
      {description && <p className="relative mb-6 max-w-md text-sm leading-relaxed text-ink-500">{description}</p>}
      <div className="relative flex flex-wrap items-center justify-center gap-3">
        {action}
        {secondaryAction}
      </div>
    </div>
  );
}
