import { useId } from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";

/**
 * Segmented tabs with a springy sliding pill. Controlled.
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
        className="relative inline-flex items-center gap-0.5 rounded-full bg-black/[0.045] p-1 ring-1 ring-inset ring-black/[0.05]"
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
                "group relative z-10 flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium active:scale-[0.96]",
                active ? "text-neutral-950" : "text-neutral-500 hover:text-neutral-900",
              )}
              style={{ transition: "color .2s ease, transform .3s cubic-bezier(.34,1.56,.64,1)" }}
            >
              {active && (
                <motion.span
                  layoutId={pillId}
                  className="absolute inset-0 -z-10 rounded-full bg-white shadow-[0_0_0_1px_rgba(10,10,10,0.06),0_2px_6px_-1px_rgba(10,10,10,0.12)]"
                  transition={{ type: "spring", stiffness: 520, damping: 38 }}
                />
              )}
              {item.icon && (
                <item.icon
                  className={clsx(
                    "h-4 w-4 transition-transform duration-300 ease-spring group-hover:-translate-y-px",
                    active && "text-[#FF5A1F]",
                  )}
                  strokeWidth={1.9}
                />
              )}
              <span>{item.label}</span>
              {item.count != null && (
                <span
                  className={clsx(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums transition-colors",
                    active ? "bg-[#FF5A1F] text-white" : "bg-black/[0.06] text-neutral-500",
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
