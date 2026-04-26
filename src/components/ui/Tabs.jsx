import { clsx } from "clsx";

/**
 * Simple underline-style tabs. Controlled component.
 *
 *  <Tabs
 *    value={tab}
 *    onChange={setTab}
 *    items={[{ value: "all", label: "All", count: 12 }, ...]}
 *  />
 */
export default function Tabs({ value, onChange, items, className }) {
  return (
    <div
      className={clsx(
        "flex items-center gap-1 border-b border-ink-100 overflow-x-auto",
        className,
      )}
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
              "flex items-center gap-2 px-3 py-2 -mb-px text-sm font-medium border-b-2 transition whitespace-nowrap",
              active
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-ink-500 hover:text-ink-800",
            )}
          >
            {item.icon && <item.icon className="w-4 h-4" />}
            <span>{item.label}</span>
            {item.count != null && (
              <span
                className={clsx(
                  "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                  active
                    ? "bg-brand-100 text-brand-700"
                    : "bg-ink-100 text-ink-600",
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
