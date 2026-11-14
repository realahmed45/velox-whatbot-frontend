/**
 * Botlify Sidebar — night liquid glass.
 *
 * - Deep night surface with a slow sunset glow bleeding in from the top.
 * - Active item: a springy sliding pill (framer layoutId) with a sunset edge,
 *   so moving between pages feels like one continuous object, not a repaint.
 * - Icons hop on hover; the collapse control spins; the plan card glows.
 * - Same navigation model and permission rules as before.
 */
import { NavLink, useNavigate, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  LogOut,
  Settings as SettingsIcon,
  ChevronsLeft,
  Crown,
  ArrowUpRight,
  Globe,
  BedDouble,
  CalendarDays,
  HandCoins,
  MessageSquare,
  GraduationCap,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import BotlifyMark from "@/components/BotlifyMark";
import PropertySwitcher from "@/components/layout/PropertySwitcher";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { usePermissions } from "@/hooks/usePermissions";
import api from "@/services/api";
import { clsx } from "clsx";

const COLLAPSE_KEY = "botlify-sidebar-collapsed";

// ─── Navigation model ────────────────────────────────────────────────────────
// Everything else that used to live here is a tab inside Settings or reachable
// by URL only — the routes all still work, they just aren't nav entries.
const NAV = [
  {
    section: null,
    items: [
      { to: "/dashboard", icon: LayoutDashboard, label: "Today", end: true },
      { to: "/dashboard/bookings", icon: BedDouble, label: "Bookings" },
      { to: "/dashboard/inbox", icon: MessageSquare, label: "Messages", perm: "inbox" },
      { to: "/dashboard/calendar", icon: CalendarDays, label: "Calendar" },
      { to: "/dashboard/guests", icon: Users, label: "Guests" },
      { to: "/dashboard/train", icon: GraduationCap, label: "Train your AI" },
      { to: "/dashboard/website", icon: Globe, label: "Your website" },
      { to: "/dashboard/settings", icon: SettingsIcon, label: "Settings", perm: "settings" },
    ],
  },
];

const CONSULTANT_ITEM = { to: "/dashboard/consultant", icon: HandCoins, label: "Consultant" };

function planLabel(id) {
  const map = {
    free: "Trial",
    trial: "Trial",
    hotel_free: "Launch (Free)",
    hotel_pro: "Botlify for Hotels",
    ig_starter: "Basic Plan",
    ig_pro: "Pro Plan",
    starter: "Basic Plan",
    growth: "Basic Plan",
    scale: "Pro Plan",
  };
  return map[id] || id;
}

export default function Sidebar({ onNavigate }) {
  const { logout, user } = useAuthStore();
  const { workspace } = useWorkspaceStore();
  const navigate = useNavigate();
  const { canItem } = usePermissions();
  const features = workspace?.features || {};
  const hasFeature = (item) => !item.feature || features[item.feature] === true;

  const [isConsultant, setIsConsultant] = useState(false);
  useEffect(() => {
    let alive = true;
    api
      .get("/consultants/me")
      .then(() => alive && setIsConsultant(true))
      .catch(() => alive && setIsConsultant(false));
    return () => {
      alive = false;
    };
  }, [user?._id, user?.id]);

  const NAV_VISIBLE = NAV.map((g) => ({
    ...g,
    items: g.items.filter((i) => canItem(i) && hasFeature(i)),
  }))
    .map((g, i) => (i === 0 && isConsultant ? { ...g, items: [...g.items, CONSULTANT_ITEM] } : g))
    .filter((g) => g.items.length > 0);

  const [collapsed, setCollapsed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(COLLAPSE_KEY)) ?? false;
    } catch {
      return false;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, JSON.stringify(collapsed));
    } catch {
      /* private mode — fine */
    }
  }, [collapsed]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isLifetime = workspace?.subscription?.lifetime === true;
  const plan = isLifetime ? "ig_pro" : workspace?.subscription?.plan || "free";
  const usage = useMemo(() => {
    const used = workspace?.usage?.messagesThisMonth || 0;
    const rawLimit = workspace?.usage?.messagesLimit;
    const unlimited = isLifetime || rawLimit === -1 || rawLimit == null;
    const limit = unlimited ? Infinity : rawLimit;
    const pct = unlimited || !(limit > 0) ? 0 : Math.min(100, Math.round((used / limit) * 100));
    return { used, limit, pct, unlimited };
  }, [workspace, isLifetime]);
  const isPremium = isLifetime || ["ig_pro", "scale", "hotel_pro"].includes(plan);

  const initial = (workspace?.name?.[0] || user?.name?.[0] || user?.email?.[0] || "B").toUpperCase();

  return (
    <aside
      className={clsx(
        "relative flex h-full flex-shrink-0 flex-col overflow-hidden text-white",
        "bg-night-900 transition-[width] duration-500 ease-out-expo",
        collapsed ? "w-[80px]" : "w-[264px]",
      )}
    >
      {/* sunset glow + grain — the sidebar is a little window onto the brand */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 -left-16 h-64 w-64 rounded-full bg-sunset-flame/25 blur-[70px]" />
        <div className="absolute top-10 -right-24 h-56 w-56 rounded-full bg-sunset-violet/25 blur-[80px]" />
        <div className="absolute bottom-0 left-0 h-48 w-full bg-gradient-to-t from-sunset-magenta/[0.07] to-transparent" />
        <div className="absolute inset-0 bg-dot-grid-dark opacity-40 mask-fade-b" />
      </div>
      <div aria-hidden className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-white/[0.12] via-white/[0.05] to-transparent" />

      {/* ── Logo ─────────────────────────────────────────────── */}
      <div
        className={clsx(
          "relative flex h-[72px] flex-shrink-0 items-center px-4",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        <Link to="/dashboard" onClick={onNavigate} className="group/logo flex min-w-0 items-center gap-2.5">
          <span className="transition-transform duration-500 ease-spring group-hover/logo:-rotate-6 group-hover/logo:scale-110">
            <BotlifyMark size={34} glow />
          </span>
          {!collapsed && (
            <div className="flex min-w-0 flex-col leading-none">
              <span className="inline-flex items-baseline font-display text-[19px] font-bold tracking-[-0.045em]">
                botlify
                <span className="ml-[2px] inline-block h-[6px] w-[6px] rounded-full bg-sunset shadow-[0_0_10px_rgba(255,61,119,0.8)]" />
              </span>
              <span className="mt-1 font-serif text-[12.5px] italic text-white/45">
                AI channel manager
              </span>
            </div>
          )}
        </Link>
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className={clsx(
            "hidden h-7 w-7 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/[0.08] hover:text-white lg:flex",
            collapsed && "absolute -right-0 top-[76px] mx-auto",
          )}
          title={collapsed ? "Expand" : "Collapse"}
        >
          <ChevronsLeft
            className={clsx("h-4 w-4 transition-transform duration-500 ease-spring", collapsed && "rotate-180")}
          />
        </button>
      </div>

      <div className="relative">
        <PropertySwitcher collapsed={collapsed} onNavigate={onNavigate} />
      </div>

      {/* ── Navigation ───────────────────────────────────────── */}
      <nav className={clsx("relative flex-1 overflow-y-auto px-3 no-scrollbar", collapsed ? "pt-10" : "pt-3")}>
        {NAV_VISIBLE.map((group, gi) => (
          <div key={gi} className="mb-1">
            {group.section && !collapsed && (
              <p className="px-3 pb-2 pt-5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
                {group.section}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavItem key={item.to} item={item} collapsed={collapsed} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Bottom: plan + profile ───────────────────────────── */}
      <div className="relative flex-shrink-0 space-y-2.5 p-3">
        {!collapsed && (
          <div className="card-dark overflow-hidden p-4">
            <div aria-hidden className="absolute -right-8 -top-10 h-24 w-24 rounded-full bg-sunset opacity-30 blur-2xl" />
            <div className="relative mb-3 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/80">
                {isPremium && <Crown className="h-3.5 w-3.5 text-sunset-gold" />}
                {isLifetime ? "Lifetime" : planLabel(plan)}
              </span>
              {!usage.unlimited && <span className="font-mono text-[11px] text-white/45">{usage.pct}%</span>}
            </div>
            <div className="relative mb-1.5 flex items-center justify-between text-[11px]">
              <span className="text-white/50">Messages this month</span>
              <span className="font-semibold tabular-nums">
                {usage.unlimited
                  ? `${usage.used.toLocaleString()} · ∞`
                  : `${usage.used.toLocaleString()} / ${usage.limit.toLocaleString()}`}
              </span>
            </div>
            {!usage.unlimited && (
              <div className="relative h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                <motion.div
                  className={clsx("h-full rounded-full", usage.pct > 90 ? "bg-rose-500" : "bg-sunset")}
                  initial={{ width: 0 }}
                  animate={{ width: `${usage.pct}%` }}
                  transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            )}
            {!isPremium && !isLifetime && (
              <Link to="/dashboard/billing" onClick={onNavigate} className="btn-primary relative mt-3.5 w-full py-2 text-xs">
                Upgrade plan <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        )}

        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          title={collapsed ? "Visit website" : undefined}
          className={clsx(
            "group flex items-center rounded-xl text-[13px] font-medium text-white/50 transition-all duration-300 hover:bg-white/[0.06] hover:text-white",
            collapsed ? "mx-auto h-11 w-11 justify-center" : "gap-3 px-3 py-2.5",
          )}
        >
          <Globe className="h-[18px] w-[18px] flex-shrink-0 transition-transform duration-500 ease-spring group-hover:rotate-[20deg]" />
          {!collapsed && (
            <>
              <span className="truncate">Visit botlify.app</span>
              <ArrowUpRight className="ml-auto h-4 w-4 flex-shrink-0 transition-transform duration-300 ease-spring group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </>
          )}
        </a>

        <div
          className={clsx(
            "flex items-center gap-3 rounded-2xl bg-white/[0.04] ring-1 ring-white/[0.07] transition hover:bg-white/[0.07]",
            collapsed ? "justify-center p-2" : "p-2.5",
          )}
        >
          <div className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-sunset text-[13px] font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
            {initial}
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-night-900" />
          </div>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold leading-tight">
                  {user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "You"}
                </p>
                <p className="mt-0.5 truncate text-[11px] leading-tight text-white/45">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="group/out flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-white/45 transition hover:bg-white/[0.08] hover:text-white"
              >
                <LogOut className="h-4 w-4 transition-transform duration-300 ease-spring group-hover/out:translate-x-0.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

// ─── Nav item ────────────────────────────────────────────────────────────────
function NavItem({ item, collapsed, onNavigate, badge = 0 }) {
  const { to, icon: Icon, label, end } = item;
  const location = useLocation();
  const navigate = useNavigate();

  const [pathAndSearch, hash] = to.split("#");
  const [pathname] = pathAndSearch.split("?");
  const search = pathAndSearch.includes("?") ? pathAndSearch.split("?")[1] : null;

  const isActive = end
    ? location.pathname === pathname && !location.search && !location.hash
    : hash
      ? location.pathname === pathname && location.hash === `#${hash}`
      : (location.pathname === pathname || location.pathname.startsWith(pathname + "/")) &&
        (search ? location.search.includes(search) : !/[?&]tab=/.test(location.search) || pathname.endsWith("settings"));

  const handleClick = (e) => {
    if (hash) {
      e.preventDefault();
      navigate(pathname);
      setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" }), 100);
    }
    onNavigate?.();
  };

  return (
    <NavLink
      to={to}
      onClick={handleClick}
      title={collapsed ? label : undefined}
      end={end}
      className={clsx(
        "group relative flex items-center rounded-xl text-[13.5px] transition-colors duration-300",
        collapsed ? "mx-auto h-11 w-11 justify-center" : "gap-3 px-3 py-2.5",
        isActive ? "font-semibold text-white" : "font-medium text-white/55 hover:text-white",
      )}
    >
      {isActive && (
        <motion.span
          layoutId="sidebar-active-pill"
          className="absolute inset-0 -z-0 rounded-xl bg-white/[0.09] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_8px_24px_-12px_rgba(255,61,119,0.6)] ring-1 ring-white/10"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        >
          <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-sunset shadow-[0_0_12px_rgba(255,61,119,0.9)]" />
        </motion.span>
      )}
      {!isActive && (
        <span className="absolute inset-0 rounded-xl bg-white/[0.04] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      )}
      <Icon
        className={clsx(
          "relative h-[19px] w-[19px] flex-shrink-0 transition-all duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:scale-110",
          isActive ? "text-sunset-gold drop-shadow-[0_0_8px_rgba(255,181,71,0.6)]" : "",
        )}
        strokeWidth={isActive ? 2.2 : 1.8}
      />
      {!collapsed && <span className="relative truncate">{label}</span>}
      {!collapsed && badge > 0 && (
        <span className="relative ml-auto inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-sunset px-1.5 text-[11px] font-bold">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </NavLink>
  );
}
