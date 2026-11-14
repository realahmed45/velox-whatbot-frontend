import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  BedDouble,
  CalendarDays,
  Users,
  Menu,
} from "lucide-react";
import { clsx } from "clsx";

// Mirrors the sidebar's five destinations; Settings sits behind "More".
const TABS = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Today", end: true },
  { to: "/dashboard/bookings", icon: BedDouble, label: "Bookings" },
  { to: "/dashboard/calendar", icon: CalendarDays, label: "Calendar" },
  { to: "/dashboard/guests", icon: Users, label: "Guests" },
];

/**
 * Floating night-glass dock. The active destination sits on a springy pill
 * that slides between tabs (framer layoutId), with a sunset dot beneath.
 */
export default function MobileBottomNav({ onMore }) {
  return (
    <nav
      className="fixed inset-x-2 z-30 lg:hidden"
      style={{ bottom: "calc(0.5rem + env(safe-area-inset-bottom, 0px))" }}
      aria-label="Primary"
    >
      <div className="relative mx-auto flex h-14 max-w-md items-stretch justify-around overflow-hidden rounded-[22px] bg-night-900/85 px-1 shadow-[0_18px_40px_-14px_rgba(6,5,10,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] ring-1 ring-white/10 backdrop-blur-2xl backdrop-saturate-150">
        {/* a whisper of sunset at the top edge */}
        <div aria-hidden className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-sunset-flame/60 to-transparent" />
        {TABS.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              clsx(
                "group relative flex min-h-[44px] flex-1 flex-col items-center justify-center gap-0.5 text-[10.5px] font-semibold transition-[color,transform] duration-300 active:scale-90",
                isActive ? "text-white" : "text-white/50",
              )
            }
            aria-label={label}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="mobile-dock-pill"
                    className="absolute inset-x-1 inset-y-1.5 rounded-2xl bg-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] ring-1 ring-white/10"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  />
                )}
                <Icon
                  className={clsx(
                    "relative h-[20px] w-[20px] transition-transform duration-500 ease-spring",
                    isActive ? "-translate-y-0.5 text-sunset-gold" : "group-hover:-translate-y-0.5",
                  )}
                  strokeWidth={1.8}
                />
                <span className="relative">{label}</span>
              </>
            )}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={onMore}
          className="group relative flex min-h-[44px] flex-1 flex-col items-center justify-center gap-0.5 text-[10.5px] font-semibold text-white/50 transition-[color,transform] duration-300 hover:text-white active:scale-90"
          aria-label="More options"
        >
          <Menu
            className="h-[20px] w-[20px] transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-active:rotate-90"
            strokeWidth={1.8}
          />
          <span>More</span>
        </button>
      </div>
    </nav>
  );
}
