import { useId } from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";

/**
 * Segmented tabs with a springy sliding pill (SlidingTabs look). Controlled.
 * Scrolls horizontally on narrow screens instead of wrapping.
 *
 *  <Tabs
 *    value={tab}
 *    onChange={setTab}
 *    items={[{ value: "all", label: "All", count: 12 }, ...]}
 *  />
 */
export default function Tabs({ value, onChange, items, className }) {
  const pillId = `tabs-pill-${useId()}`;
  return (
    <div className={clsx("max-w-full overflow-x-auto no-scrollbar", className)}>
      <div
        className="relative inline-flex items-center gap-1 rounded-2xl bg-ink-900/[0.04] p-1 ring-1 ring-ink-900/[0.06]"
        role="tablist"
      >
        {items.map((item) => {
          const active = item.value === value;
          return (
            <button
              key={item.value}
              role="tab"
              aria-selected={active}
              onClick={() => onChange(item.value)}
              className={clsx(
                "group relative z-10 flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-medium transition-colors active:scale-[0.96]",
                active ? "text-ink-900" : "text-ink-500 hover:text-ink-800",
              )}
              style={{ transition: "color .2s ease, transform .35s cubic-bezier(.34,1.56,.64,1)" }}
            >
              {active && (
                <motion.span
                  layoutId={pillId}
                  className="absolute inset-0 -z-10 rounded-xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.08),0_4px_12px_-4px_rgba(15,23,42,0.12),inset_0_1px_0_#fff]"
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                />
              )}
              {item.icon && (
                <item.icon
                  className={clsx(
                    "h-4 w-4 transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]",
                    active && "text-sunset-flame",
                  )}
                  strokeWidth={1.8}
                />
              )}
              <span>{item.label}</span>
              {item.count != null && (
                <span
                  className={clsx(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums transition-colors",
                    active ? "bg-sunset text-white shadow-[0_2px_6px_-2px_rgba(255,61,119,0.6)]" : "bg-ink-900/[0.06] text-ink-500",
                  )}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
