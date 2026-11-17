import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutGrid, X, CreditCard, LogOut } from "lucide-react";
import { clsx } from "clsx";
import { useAuthStore } from "@/store/authStore";
import { isItemActive } from "./navConfig";
import PropertySwitcher from "./PropertySwitcher";
import AccountSwitcher from "./AccountSwitcher";

// Keys pinned to the dock; everything else (incl. Settings) lives in "More".
const DOCK_KEYS = ["today", "bookings", "messages", "calendar"];

/**
 * Mobile (< lg) bottom dock. White, solid (no blur), a black pill slides to
 * the active tab. "More" opens a sheet with the remaining tabs, the property
 * and account switchers, billing and sign-out.
 *
 * `onMore` (legacy prop) is still called when the sheet opens.
 */
export default function MobileBottomNav({ items = [], badges = {}, onMore }) {
  const location = useLocation();
  const [sheet, setSheet] = useState(false);

  const dock = DOCK_KEYS.map((k) => items.find((i) => i.key === k)).filter(Boolean);
  const rest = items.filter((i) => !DOCK_KEYS.includes(i.key));
  const restActive = rest.some((i) => isItemActive(i, location));
  const restBadge = rest.reduce((s, i) => s + (badges[i.key] || 0), 0);

  // Close the sheet whenever the route changes.
  useEffect(() => setSheet(false), [location.pathname, location.search]);

  return (
    <>
      <nav
        className="fixed inset-x-2 z-30 lg:hidden"
        style={{ bottom: "calc(0.5rem + env(safe-area-inset-bottom, 0px))" }}
        aria-label="Primary"
      >
        <div className="relative mx-auto flex h-[60px] max-w-md items-stretch justify-around rounded-[22px] bg-white px-1 shadow-[0_0_0_1px_rgba(10,10,10,0.08),0_18px_40px_-14px_rgba(10,10,10,0.35)]">
          {dock.map((item) => {
            const active = isItemActive(item, location);
            return (
              <NavLink
                key={item.key}
                to={item.to}
                end={item.end}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "group relative flex min-h-[44px] flex-1 flex-col items-center justify-center gap-0.5 text-[10.5px] font-semibold transition-[color,transform] duration-200 active:scale-90",
                  active ? "text-white" : "text-neutral-500",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="mobile-dock-pill"
                    className="absolute inset-x-1 inset-y-1.5 rounded-2xl bg-[#0A0A0A]"
                    transition={{ type: "spring", stiffness: 520, damping: 38 }}
                  />
                )}
                <span className="relative">
                  <item.icon
                    className={clsx("h-[20px] w-[20px]", active && "text-[#FF5A1F]")}
                    strokeWidth={active ? 2.2 : 1.9}
                  />
                  {badges[item.key] > 0 && (
                    <span className="absolute -right-2.5 -top-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#FF5A1F] px-1 text-[9.5px] font-bold leading-none text-white ring-2 ring-white">
                      {badges[item.key] > 99 ? "99+" : badges[item.key]}
                    </span>
                  )}
                </span>
                <span className="relative">{item.label}</span>
              </NavLink>
            );
          })}
          <button
            type="button"
            onClick={() => {
              setSheet(true);
              onMore?.();
            }}
            className={clsx(
              "group relative flex min-h-[44px] flex-1 flex-col items-center justify-center gap-0.5 text-[10.5px] font-semibold transition-[color,transform] duration-200 active:scale-90",
              restActive ? "text-white" : "text-neutral-500",
            )}
            aria-label="More"
            aria-haspopup="dialog"
            aria-expanded={sheet}
          >
            {restActive && (
              <motion.span
                layoutId="mobile-dock-pill"
                className="absolute inset-x-1 inset-y-1.5 rounded-2xl bg-[#0A0A0A]"
                transition={{ type: "spring", stiffness: 520, damping: 38 }}
              />
            )}
            <span className="relative">
              <LayoutGrid className={clsx("h-[20px] w-[20px]", restActive && "text-[#FF5A1F]")} strokeWidth={1.9} />
              {restBadge > 0 && <span className="absolute -right-1 -top-0.5 h-2 w-2 rounded-full bg-[#FF5A1F] ring-2 ring-white" />}
            </span>
            <span className="relative">More</span>
          </button>
        </div>
      </nav>

      <MoreSheet open={sheet} onClose={() => setSheet(false)} items={rest} badges={badges} />
    </>
  );
}

function MoreSheet({ open, onClose, items, badges }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="More"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 420, damping: 40 }}
            className="absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-[28px] bg-[#FAFAFA] px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] pt-2"
          >
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-neutral-300" />
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-geist text-lg font-semibold tracking-[-0.02em] text-neutral-950">More</h2>
              <button
                onClick={onClose}
                className="grid h-9 w-9 place-items-center rounded-full text-neutral-500 ring-1 ring-black/[0.08] transition active:scale-90"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {items.map((item, i) => {
                const active = isItemActive(item, location);
                return (
                  <motion.button
                    key={item.key}
                    type="button"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.03 * i, type: "spring", stiffness: 500, damping: 34 }}
                    onClick={() => {
                      onClose();
                      navigate(item.to);
                    }}
                    className={clsx(
                      "relative flex flex-col items-center gap-2 rounded-2xl px-2 py-3.5 text-[12px] font-semibold transition active:scale-95",
                      active
                        ? "bg-[#0A0A0A] text-white"
                        : "bg-white text-neutral-800 shadow-[0_0_0_1px_rgba(10,10,10,0.07)]",
                    )}
                  >
                    <span
                      className={clsx(
                        "grid h-10 w-10 place-items-center rounded-xl",
                        active ? "bg-[#FF5A1F] text-white" : "bg-[#FFF1EA] text-[#FF5A1F]",
                      )}
                    >
                      <item.icon className="h-5 w-5" strokeWidth={1.9} />
                    </span>
                    {item.label}
                    {badges[item.key] > 0 && (
                      <span className="absolute right-2 top-2 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#FF5A1F] px-1 text-[9.5px] font-bold text-white">
                        {badges[item.key]}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-4 space-y-2.5">
              <PropertySwitcher variant="block" />
              <AccountSwitcher variant="list" className="sm:hidden" />
              <div className="surface overflow-hidden p-1">
                <button
                  onClick={() => {
                    onClose();
                    navigate("/dashboard/billing");
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium text-neutral-800 active:bg-neutral-100"
                >
                  <CreditCard className="h-4 w-4 text-neutral-500" /> Plan &amp; billing
                </button>
                <button
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium text-rose-600 active:bg-rose-50"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
