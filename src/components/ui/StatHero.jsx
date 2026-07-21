import { clsx } from "clsx";

/**
 * StatHero — the shared, on-brand page hero used across the dashboard so every
 * page reads as one system. Dark charcoal warming into deep brand orange
 * (ink-900 → brand-900), white text, with an optional right-side actions slot
 * and an optional stat strip below the title.
 *
 * Theme: orange / white / black only. No off-brand accent colors.
 *
 * Props:
 *  - title (string|node)   required
 *  - subtitle (string)     optional supporting line
 *  - icon (lucide comp)    optional badge icon
 *  - eyebrow (string)      optional small uppercase label above title
 *  - stats ([{label,value,accent?}])  optional stat strip
 *  - children              optional action buttons (rendered top-right)
 */
export default function StatHero({
  title,
  subtitle,
  icon: Icon,
  eyebrow,
  stats,
  children,
  className,
}) {
  return (
    <div
      className={clsx(
        "relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink-900 via-ink-900 to-brand-900 text-white p-6 sm:p-7 shadow-xl",
        className,
      )}
    >
      {/* warm glow + subtle grid, all brand-toned */}
      <div className="pointer-events-none absolute -top-20 -right-16 w-72 h-72 rounded-full bg-brand-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-8 w-72 h-72 rounded-full bg-brand-600/15 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-grid-dark bg-grid-32 opacity-20 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />

      <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          {Icon && (
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur border border-white/15 flex items-center justify-center text-brand-200 flex-shrink-0">
              <Icon className="w-6 h-6" />
            </div>
          )}
          <div className="min-w-0">
            {eyebrow && (
              <span className="inline-block text-[10px] uppercase tracking-[0.18em] font-bold text-brand-300 mb-1.5">
                {eyebrow}
              </span>
            )}
            <h1 className="text-2xl sm:text-[28px] font-black tracking-tight leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-white/60 mt-1 max-w-xl leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {children && (
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {children}
          </div>
        )}
      </div>

      {stats?.length > 0 && (
        <div className="relative mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl bg-white/[0.06] border border-white/10 px-4 py-3 backdrop-blur"
            >
              <p
                className={clsx(
                  "text-xl font-black leading-none",
                  s.accent ? "text-brand-300" : "text-white",
                )}
              >
                {s.value}
              </p>
              <p className="text-[11px] font-medium text-white/55 mt-1.5">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
