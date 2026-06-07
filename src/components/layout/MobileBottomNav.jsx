import { NavLink } from "react-router-dom";
import { LayoutDashboard, Zap, Inbox, BarChart2, Menu } from "lucide-react";
import { clsx } from "clsx";

const TABS = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Home", end: true },
  { to: "/dashboard/inbox", icon: Inbox, label: "Inbox" },
  { to: "/dashboard/automation", icon: Zap, label: "Automate" },
  { to: "/dashboard/analytics", icon: BarChart2, label: "Insights" },
];

export default function MobileBottomNav({ onMore }) {
  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 h-[62px] bg-white/85 backdrop-blur-xl border-t border-ink-100 flex items-stretch justify-around z-30 safe-bottom"
      aria-label="Primary"
    >
      {TABS.map(({ to, icon: Icon, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            clsx(
              "flex flex-col items-center justify-center gap-1 flex-1 text-[11px] font-semibold min-h-[44px] transition active:scale-95",
              isActive ? "text-brand-600" : "text-ink-500",
            )
          }
          aria-label={label}
        >
          {({ isActive }) => (
            <>
              <span
                className={clsx(
                  "flex items-center justify-center w-11 h-7 rounded-full transition",
                  isActive && "bg-brand-50",
                )}
              >
                <Icon className="w-[22px] h-[22px]" />
              </span>
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
      <button
        type="button"
        onClick={onMore}
        className="flex flex-col items-center justify-center gap-1 flex-1 text-[11px] font-semibold text-ink-500 min-h-[44px] active:scale-95"
        aria-label="More options"
      >
        <span className="flex items-center justify-center w-11 h-7 rounded-full">
          <Menu className="w-[22px] h-[22px]" />
        </span>
        <span>More</span>
      </button>
    </nav>
  );
}
