import { clsx } from "clsx";
import { TrendingUp, TrendingDown } from "lucide-react";

/**
 * KPI stat card used on Dashboard + Analytics.
 */
export default function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  hint,
  accent = "brand",
  className,
}) {
  const accentMap = {
    brand: "from-brand-500/10 to-brand-500/0 text-brand-600",
    accent: "from-accent-500/10 to-accent-500/0 text-accent-600",
    emerald: "from-emerald-500/10 to-emerald-500/0 text-emerald-600",
    amber: "from-amber-500/10 to-amber-500/0 text-amber-600",
  };

  return (
    <div
      className={clsx(
        "card p-5 relative overflow-hidden group hover:shadow-glow transition",
        className,
      )}
    >
      <div
        className={clsx(
          "absolute inset-0 bg-gradient-to-br opacity-60 pointer-events-none",
          accentMap[accent],
        )}
      />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-ink-500 uppercase tracking-wider">
            {label}
          </span>
          {Icon && (
            <div
              className={clsx(
                "w-8 h-8 rounded-lg bg-white/70 flex items-center justify-center",
                accentMap[accent]?.split(" ").pop(),
              )}
            >
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-ink-900">{value}</span>
          {typeof trend === "number" && (
            <span
              className={clsx(
                "text-xs font-semibold flex items-center gap-0.5",
                trend >= 0 ? "text-emerald-600" : "text-red-500",
              )}
            >
              {trend >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
        {hint && <p className="text-xs text-ink-400 mt-2">{hint}</p>}
      </div>
    </div>
  );
}
