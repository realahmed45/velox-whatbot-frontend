import { clsx } from "clsx";

/**
 * Page header used across the dashboard.
 *
 * Props:
 *   - title: required string or node
 *   - subtitle: optional supporting copy
 *   - eyebrow: optional small label above title (defaults to nothing)
 *   - icon: optional lucide icon component
 *   - children: optional action buttons rendered on the right
 *   - variant: 'default' | 'hero' (hero = night-glass slab with a sunset glow)
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
          "group relative mb-6 overflow-hidden rounded-3xl bg-night-900 p-5 text-white shadow-[0_30px_60px_-30px_rgba(6,5,10,0.6)] ring-1 ring-white/[0.06] sm:p-7",
          className,
        )}
      >
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-sunset-flame/30 blur-[70px] animate-drift-a" />
          <div className="absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-sunset-violet/25 blur-[70px] animate-drift-b" />
          <div className="absolute inset-0 bg-dot-grid-dark opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        </div>
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            {Icon && (
              <div className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-sunset text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_8px_20px_-8px_rgba(255,61,119,0.7)] transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]">
                <Icon className="h-5 w-5" strokeWidth={1.8} />
              </div>
            )}
            <div className="min-w-0">
              {eyebrow && (
                <span className="mb-1.5 inline-block text-[10px] font-semibold uppercase tracking-[0.18em] text-sunset-gold">
                  {eyebrow}
                </span>
              )}
              <h1 className="font-display text-2xl font-semibold leading-tight tracking-[-0.03em] sm:text-3xl">
                {title}
              </h1>
              {subtitle && <p className="mt-1 max-w-xl text-sm text-white/60">{subtitle}</p>}
            </div>
          </div>
          {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
        </div>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "group relative mb-6 flex flex-col gap-3 pb-5 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-3.5">
        {Icon && (
          <div className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-sunset text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_8px_20px_-8px_rgba(255,61,119,0.6)] transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]">
            <Icon className="h-5 w-5" strokeWidth={1.8} />
          </div>
        )}
        <div className="min-w-0">
          {eyebrow && (
            <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-sunset-flame">
              {eyebrow}
            </span>
          )}
          <h1 className="truncate font-display text-2xl font-semibold tracking-[-0.03em] text-ink-900 sm:text-3xl">
            {title}
          </h1>
          {subtitle && <p className="mt-0.5 max-w-2xl text-sm text-ink-500">{subtitle}</p>}
        </div>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
      {/* fading hairline instead of a hard border */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-ink-900/10 via-ink-900/[0.06] to-transparent"
      />
    </div>
  );
}
