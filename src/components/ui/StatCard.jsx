import { clsx } from "clsx";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Spotlight, NumberTicker } from "@/components/fx";

/**
 * KPI stat card used on Dashboard + Analytics.
 * Liquid glass + cursor spotlight, a hopping icon tile, and numeric values
 * count up when they scroll into view.
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
  const tileMap = {
    brand: "bg-sunset-soft text-sunset-flame ring-sunset-flame/10",
    accent: "bg-amber-500/10 text-amber-600 ring-amber-500/10",
    emerald: "bg-emerald-500/10 text-emerald-600 ring-emerald-500/10",
    amber: "bg-amber-500/10 text-amber-600 ring-amber-500/10",
  };
  const glowMap = {
    brand: "bg-sunset",
    accent: "bg-amber-400",
    emerald: "bg-emerald-400",
    amber: "bg-amber-400",
  };

  const isNumber = typeof value === "number" && Number.isFinite(value);
  const decimals = isNumber && !Number.isInteger(value) ? Math.min(2, (String(value).split(".")[1] || "").length) : 0;

  return (
    <Spotlight className={clsx("card group relative overflow-hidden p-5", className)}>
      {/* faint accent glow in the corner, brightens on hover */}
      <div
        aria-hidden
        className={clsx(
          "pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full opacity-[0.12] blur-2xl transition-opacity duration-500 group-hover:opacity-25",
          glowMap[accent] || glowMap.brand,
        )}
      />
      <div className="relative">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="text-[13px] font-medium text-ink-500">{label}</span>
          {Icon && (
            <div
              className={clsx(
                "grid h-9 w-9 shrink-0 place-items-center rounded-xl ring-1 ring-inset transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg] group-hover:scale-105",
                tileMap[accent] || tileMap.brand,
              )}
            >
              <Icon className="h-4.5 w-4.5" strokeWidth={1.8} />
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="font-display text-3xl font-semibold tracking-[-0.03em] text-ink-900 tabular-nums">
            {isNumber ? <NumberTicker value={value} decimals={decimals} /> : value}
          </span>
          {typeof trend === "number" && (
            <span
              className={clsx(
                "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
                trend >= 0
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-600/15"
                  : "bg-rose-50 text-rose-600 ring-rose-600/15",
              )}
            >
              {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
        {hint && <p className="mt-2 text-xs text-ink-400">{hint}</p>}
      </div>
    </Spotlight>
  );
}
