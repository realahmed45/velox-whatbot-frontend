import { clsx } from "clsx";

/**
 * Cinematic page header used across the dashboard.
 *
 * Props:
 *   - title: required string or node
 *   - subtitle: optional supporting copy
 *   - eyebrow: optional small label above title (defaults to nothing)
 *   - icon: optional lucide icon component
 *   - children: optional action buttons rendered on the right
 *   - variant: 'default' | 'hero' (hero = dark gradient slab)
 *   - className: extra classes
 */
export default function PageHeader({
  title,
  subtitle,
  eyebrow,
  icon: Icon,
  children,
  variant = "default",
  className,
}) {
  if (variant === "hero") {
    return (
      <div
        className={clsx(
          "relative overflow-hidden rounded-lg p-5 sm:p-7 mb-6 bg-gradient-to-br from-ink-900 via-ink-900 to-brand-900 text-white shadow-hero",
          className,
        )}
      >
        <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-brand-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-12 w-56 h-56 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-grid-dark bg-grid-32 opacity-30 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            {Icon && (
              <div className="w-11 h-11 rounded-md bg-white/10 backdrop-blur border border-white/15 flex items-center justify-center text-white flex-shrink-0">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0">
              {eyebrow && (
                <span className="inline-block text-[10px] uppercase tracking-[0.18em] font-bold text-accent-300 mb-1.5">
                  {eyebrow}
                </span>
              )}
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-ink-200 mt-1 max-w-xl">{subtitle}</p>
              )}
            </div>
          </div>
          {children && (
            <div className="flex items-center gap-2 flex-wrap">{children}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-5 border-b border-ink-100",
        className,
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <div className="relative w-11 h-11 rounded-md bg-brand-gradient flex items-center justify-center text-white shadow-glow flex-shrink-0">
            <span className="absolute inset-0 rounded-md bg-white/10 opacity-0 hover:opacity-100 transition" />
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div className="min-w-0">
          {eyebrow && (
            <span className="block text-[10px] uppercase tracking-[0.18em] font-bold text-brand-600 mb-0.5">
              {eyebrow}
            </span>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-900 truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-ink-500 mt-0.5 max-w-2xl">{subtitle}</p>
          )}
        </div>
      </div>
      {children && (
        <div className="flex items-center gap-2 flex-wrap">{children}</div>
      )}
    </div>
  );
}
