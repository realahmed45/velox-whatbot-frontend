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
 *   - variant: 'default' | 'hero' (hero = black slab with an orange glow)
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
          "group relative mb-6 overflow-hidden rounded-3xl bg-[#0A0A0A] p-5 text-white shadow-[0_30px_60px_-30px_rgba(10,10,10,0.6)] sm:p-7",
          className,
        )}
      >
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-[#FF5A1F]/35 blur-[80px]" />
          <div className="absolute inset-0 bg-dot-grid-dark opacity-30 [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]" />
          <div className="absolute inset-x-0 top-0 h-[3px] bg-[#FF5A1F]" />
        </div>
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            {Icon && (
              <div className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-2xl bg-[#FF5A1F] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_10px_24px_-10px_rgba(255,90,31,0.8)] transition-transform duration-300 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-6deg]">
                <Icon className="h-5 w-5" strokeWidth={1.9} />
              </div>
            )}
            <div className="min-w-0">
              {eyebrow && (
                <span className="mb-1.5 inline-block text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#FF8A5B]">
                  {eyebrow}
                </span>
              )}
              <h1 className="font-geist text-2xl font-semibold leading-tight tracking-[-0.035em] sm:text-3xl">{title}</h1>
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
          <div className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-2xl bg-[#0A0A0A] text-[#FF5A1F] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_10px_24px_-12px_rgba(10,10,10,0.6)] transition-transform duration-300 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-6deg]">
            <Icon className="h-5 w-5" strokeWidth={1.9} />
          </div>
        )}
        <div className="min-w-0">
          {eyebrow && (
            <span className="mb-0.5 block text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#FF5A1F]">
              {eyebrow}
            </span>
          )}
          <h1 className="truncate font-geist text-2xl font-semibold tracking-[-0.035em] text-neutral-950 sm:text-[28px]">
            {title}
          </h1>
          {subtitle && <p className="mt-0.5 max-w-2xl text-sm text-neutral-500">{subtitle}</p>}
        </div>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
      {/* hairline with a short orange lead */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-black/[0.07]" />
      <div aria-hidden className="absolute bottom-0 left-0 h-[2px] w-12 rounded-full bg-[#FF5A1F]" />
    </div>
  );
}
