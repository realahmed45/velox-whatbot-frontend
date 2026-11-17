import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  LogOut,
  Settings as SettingsIcon,
  CreditCard,
  Crown,
  ArrowUpRight,
  Keyboard,
  Globe,
} from "lucide-react";
import { clsx } from "clsx";
import { useAuthStore } from "@/store/authStore";
import { planLabel, usePlanUsage } from "./navConfig";

/** Avatar + menu: who you are, plan & usage, Settings, Billing, Sign out. */
export default function UserMenu({ onShortcuts }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const usage = usePlanUsage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const initial = (user?.name?.[0] || user?.email?.[0] || "B").toUpperCase();
  const go = (to) => {
    setOpen(false);
    navigate(to);
  };
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          "relative grid h-9 w-9 place-items-center rounded-full bg-[#FF5A1F] text-[13px] font-bold text-white ring-2 transition-transform duration-300 ease-spring hover:scale-105 active:scale-95",
          open ? "ring-[#0A0A0A]" : "ring-white",
        )}
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {initial}
        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.12 } }}
            transition={{ type: "spring", stiffness: 520, damping: 36 }}
            style={{ transformOrigin: "top right" }}
            className="popover absolute right-0 z-50 mt-2.5 w-72 overflow-hidden p-1.5"
          >
            <div className="flex items-center gap-3 px-2.5 pb-3 pt-2">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#FF5A1F] text-sm font-bold text-white">
                {initial}
              </span>
              <div className="min-w-0">
                <p className="truncate font-geist text-[14px] font-semibold text-neutral-950">{user?.name || "Account"}</p>
                <p className="truncate text-[12px] text-neutral-500">{user?.email}</p>
              </div>
            </div>

            {/* Plan & usage */}
            <div className="relative mx-1 mb-1.5 overflow-hidden rounded-xl bg-[#0A0A0A] p-3.5 text-white">
              <div aria-hidden className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-[#FF5A1F]/40 blur-2xl" />
              <div className="relative mb-2.5 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/85">
                  {usage.isPremium && <Crown className="h-3.5 w-3.5 text-[#FF8A5B]" />}
                  {usage.isLifetime ? "Lifetime" : planLabel(usage.plan)}
                </span>
                {!usage.unlimited && <span className="font-mono text-[11px] text-white/50">{usage.pct}%</span>}
              </div>
              <div className="relative mb-1.5 flex items-center justify-between text-[11.5px]">
                <span className="text-white/55">Messages this month</span>
                <span className="font-semibold tabular-nums">
                  {usage.unlimited
                    ? `${usage.used.toLocaleString()} · ∞`
                    : `${usage.used.toLocaleString()} / ${usage.limit.toLocaleString()}`}
                </span>
              </div>
              {!usage.unlimited && (
                <div className="relative h-1.5 overflow-hidden rounded-full bg-white/[0.12]">
                  <motion.div
                    className={clsx("h-full origin-left rounded-full", usage.pct > 90 ? "bg-rose-500" : "bg-[#FF5A1F]")}
                    style={{ width: `${usage.pct}%` }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              )}
              {!usage.isPremium && !usage.isLifetime && (
                <Link
                  to="/dashboard/billing"
                  onClick={() => setOpen(false)}
                  className="btn-brand relative mt-3 w-full py-2 text-xs"
                >
                  Upgrade plan <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>

            <Item icon={SettingsIcon} label="Settings" onClick={() => go("/dashboard/settings")} />
            <Item icon={CreditCard} label="Plan & billing" onClick={() => go("/dashboard/billing")} />
            {onShortcuts && (
              <Item
                icon={Keyboard}
                label="Keyboard shortcuts"
                hint="?"
                onClick={() => {
                  setOpen(false);
                  onShortcuts();
                }}
              />
            )}
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-950"
            >
              <Globe className="h-4 w-4 text-neutral-500" />
              Visit botlify.app
              <ArrowUpRight className="ml-auto h-3.5 w-3.5 text-neutral-400 transition-transform duration-300 ease-spring group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
            <div className="mt-1 border-t border-black/[0.06] pt-1">
              <Item icon={LogOut} label="Sign out" danger onClick={handleLogout} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Item({ icon: Icon, label, onClick, danger, hint }) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={clsx(
        "group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition",
        danger ? "text-rose-600 hover:bg-rose-50" : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950",
      )}
    >
      <Icon
        className={clsx(
          "h-4 w-4 transition-transform duration-300 ease-spring group-hover:scale-110",
          danger ? "" : "text-neutral-500 group-hover:text-neutral-900",
        )}
      />
      {label}
      {hint && <span className="kbd ml-auto">{hint}</span>}
    </button>
  );
}
