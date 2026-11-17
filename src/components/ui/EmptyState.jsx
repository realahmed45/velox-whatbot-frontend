import { clsx } from "clsx";

/**
 * Reusable empty-state card shown when a list has no items yet.
 * Every list page should use this instead of ad-hoc empty markup.
 *
 * Centred icon tile in a soft orange halo (static), Geist title, one
 * sentence, and the actions.
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
        "surface group relative flex flex-col items-center justify-center overflow-hidden px-6 py-14 text-center",
        className,
      )}
    >
      {/* faint dot texture fading from the centre */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-dot-grid opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_65%)]"
      />
      {Icon && (
        <div className="relative mb-5">
          <div aria-hidden className="absolute -inset-5 rounded-full bg-[#FF5A1F]/15 blur-2xl" />
          <div className="relative grid h-14 w-14 place-items-center rounded-2xl bg-white text-[#FF5A1F] shadow-[0_0_0_1px_rgba(255,90,31,0.18),0_12px_30px_-12px_rgba(255,90,31,0.55)] transition-transform duration-300 ease-spring group-hover:-translate-y-1 group-hover:rotate-[-6deg]">
            <Icon className="h-7 w-7" strokeWidth={1.8} />
          </div>
        </div>
      )}
      {title && (
        <h3 className="relative mb-1.5 font-geist text-lg font-semibold tracking-[-0.025em] text-neutral-950">{title}</h3>
      )}
      {description && <p className="relative mb-6 max-w-md text-sm leading-relaxed text-neutral-500">{description}</p>}
      <div className="relative flex flex-wrap items-center justify-center gap-3">
        {action}
        {secondaryAction}
      </div>
    </div>
  );
}
