import { clsx } from "clsx";

/**
 * Consistent page header used across the dashboard.
 * Props: title, subtitle, icon (optional), children (actions on the right).
 */
export default function PageHeader({
  title,
  subtitle,
  icon: Icon,
  children,
  className,
}) {
  return (
    <div
      className={clsx(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6",
        className,
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center text-white shadow-glow flex-shrink-0">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-ink-900 truncate">{title}</h1>
          {subtitle && (
            <p className="text-sm text-ink-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {children && (
        <div className="flex items-center gap-2 flex-wrap">{children}</div>
      )}
    </div>
  );
}
