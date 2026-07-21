import { clsx } from "clsx";

/**
 * StatHero — compact, refined page header shared across the dashboard so every
 * page reads as one system. Charcoal warming into deep brand orange, white
 * text, optional inline stat pills and a right-side actions slot.
 *
 * Deliberately restrained: tight padding, one clean row, subtle glow. No
 * off-brand accent colors — orange / white / black only.
 *
 * Props:
 *  - title (string|node)   required
 *  - subtitle (string)     optional supporting line
 *  - icon (lucide comp)    optional badge icon
 *  - eyebrow (string)      optional small uppercase label above title
 *  - stats ([{label,value,accent?}])  optional inline stat pills
 *  - children              optional action buttons (right side)
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
        "relative overflow-hidden rounded-2xl bg-gradient-to-r from-ink-900 to-ink-800 text-white px-5 py-4 sm:px-6 sm:py-5 mb-6 shadow-lg shadow-ink-900/10",
        className,
      )}
    >
      {/* single soft warm glow, kept subtle */}
      <div className="pointer-events-none absolute -top-16 right-8 w-56 h-56 rounded-full bg-brand-500/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-brand-900/40 to-transparent" />

      <div className="relative flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        {/* left: icon + title */}
        <div className="flex items-center gap-3.5 min-w-0">
          {Icon && (
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-brand-200 shrink-0">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <div className="min-w-0">
            {eyebrow && (
              <span className="block text-[10px] uppercase tracking-[0.16em] font-bold text-brand-300/90 mb-0.5">
                {eyebrow}
              </span>
            )}
            <h1 className="text-lg sm:text-xl font-bold tracking-tight leading-tight truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[13px] text-white/55 mt-0.5 truncate max-w-md">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* right: inline stats + actions */}
        <div className="flex items-center gap-4 sm:gap-5 ml-auto">
          {stats?.length > 0 && (
            <div className="hidden md:flex items-center gap-5 pr-1">
              {stats.map((s) => (
                <div key={s.label} className="text-right leading-none">
                  <p
                    className={clsx(
                      "text-lg font-black",
                      s.accent ? "text-brand-300" : "text-white",
                    )}
                  >
                    {s.value}
                  </p>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-white/45 mt-1">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          )}
          {children && (
            <div className="flex items-center gap-2 shrink-0">{children}</div>
          )}
        </div>
      </div>

      {/* stats collapse to a compact scrollable row on small screens */}
      {stats?.length > 0 && (
        <div className="md:hidden relative mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          {stats.map((s) => (
            <div
              key={s.label}
              className="shrink-0 rounded-lg bg-white/[0.07] border border-white/10 px-3 py-1.5"
            >
              <span
                className={clsx(
                  "text-sm font-black",
                  s.accent ? "text-brand-300" : "text-white",
                )}
              >
                {s.value}
              </span>{" "}
              <span className="text-[10px] text-white/50">{s.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
