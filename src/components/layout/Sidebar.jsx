/**
 * Botlify Sidebar — premium, minimal, enterprise-grade.
 *
 * Brand: #FF6B2C accent on a #111827 surface, #1F2937 cards.
 * Design language: Linear / Stripe / Vercel / Notion / Intercom.
 * - Five destinations: Today, Bookings, Calendar, Guests, Settings
 * - Active item: 4px orange left bar + soft orange tint + orange icon
 * - Usage card + profile card pinned to the bottom
 * - Collapsible with smooth micro-interactions
 */
import { NavLink, useNavigate, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  LogOut,
  Settings as SettingsIcon,
  ChevronsLeft,
  ChevronsRight,
  Crown,
  ArrowUpRight,
  Globe,
  BedDouble,
  CalendarDays,
  HandCoins,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import BotlifyMark from "@/components/BotlifyMark";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { usePermissions } from "@/hooks/usePermissions";
import api from "@/services/api";
import { clsx } from "clsx";

const COLLAPSE_KEY = "botlify-sidebar-collapsed";
const ACCENT = "#ff5722";

// ─── Navigation model ────────────────────────────────────────────────────────
// Five destinations, nothing more. Everything else that used to live here is
// now a tab inside Settings (Property & Rooms, Channels, Transfers, AI
// Assistant, Team, Billing) or reachable by URL only — the routes all still
// work, they just aren't nav entries any more.
const NAV = [
  {
    section: null,
    items: [
      { to: "/dashboard", icon: LayoutDashboard, label: "Today", end: true },
      { to: "/dashboard/bookings", icon: BedDouble, label: "Bookings" },
      { to: "/dashboard/calendar", icon: CalendarDays, label: "Calendar" },
      { to: "/dashboard/guests", icon: Users, label: "Guests" },
      { to: "/dashboard/settings", icon: SettingsIcon, label: "Settings", perm: "settings" },
    ],
  },
];

// Shown only to users who actually have a consultant profile.
const CONSULTANT_ITEM = {
  to: "/dashboard/consultant",
  icon: HandCoins,
  label: "Consultant",
};

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

  // Agents only see the areas they've been granted; owners see everything.
  // Shared with the route guard (RequirePermission) via usePermissions so the
  // sidebar and the actual access checks can never disagree.
  const { canItem } = usePermissions();
  // Some nav items only appear when the workspace's vertical enables that
  // feature (e.g. Appointments for booking businesses). Items with no `feature`
  // key are always shown (subject to permissions).
  const features = workspace?.features || {};
  const hasFeature = (item) => !item.feature || features[item.feature] === true;

  // The Consultant link is a 6th entry shown ONLY to users who actually have a
  // consultant profile. /consultants/me 404s for everyone else.
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

  // Filter nav to what this user can access; drop now-empty sections.
  const NAV_VISIBLE = NAV.map((g) => ({
    ...g,
    items: g.items.filter((i) => canItem(i) && hasFeature(i)),
  }))
    .map((g, i) =>
      i === 0 && isConsultant
        ? { ...g, items: [...g.items, CONSULTANT_ITEM] }
        : g,
    )
    .filter((g) => g.items.length > 0);

  const [collapsed, setCollapsed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(COLLAPSE_KEY)) ?? false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    localStorage.setItem(COLLAPSE_KEY, JSON.stringify(collapsed));
  }, [collapsed]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isLifetime = workspace?.subscription?.lifetime === true;
  // Lifetime accounts are effectively Pro.
  const plan = isLifetime
    ? "ig_pro"
    : workspace?.subscription?.plan || "free";
  const usage = useMemo(() => {
    const used = workspace?.usage?.messagesThisMonth || 0;
    const rawLimit = workspace?.usage?.messagesLimit;
    // -1 (or 0/undefined on unlimited plans) means UNLIMITED.
    const unlimited = isLifetime || rawLimit === -1 || rawLimit == null;
    const limit = unlimited ? Infinity : rawLimit;
    const pct =
      unlimited || !(limit > 0)
        ? 0
        : Math.min(100, Math.round((used / limit) * 100));
    return { used, limit, pct, unlimited };
  }, [workspace, isLifetime]);

  const isPremium = isLifetime || ["ig_pro", "scale", "hotel_pro"].includes(plan);

  const initial = (
    workspace?.name?.[0] ||
    user?.name?.[0] ||
    user?.email?.[0] ||
    "B"
  ).toUpperCase();

  return (
    <aside
      className={clsx(
        "relative flex-shrink-0 flex flex-col h-full bg-gradient-to-b from-[#141b2b] to-[#0f1524] border-r border-white/[0.06]",
        "transition-[width] duration-300 ease-out overflow-hidden",
        collapsed ? "w-[76px]" : "w-[260px]",
      )}
    >
      {/* subtle brand glow at the top */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-40 bg-brand-500/10 blur-[60px]" />
      {/* ── Logo ─────────────────────────────────────────────── */}
      <div
        className={clsx(
          "flex items-center h-[68px] px-4 border-b border-white/[0.06] flex-shrink-0",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        <Link
          to="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-2.5 min-w-0"
        >
          <BotlifyMark size={34} className="flex-shrink-0 drop-shadow" />
          {!collapsed && (
            <div className="flex flex-col leading-none min-w-0">
              <span className="font-black text-white text-[17px] tracking-tight">
                Botlify
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-400/80 mt-1 truncate">
                AI Hotel Booking
              </span>
            </div>
          )}
        </Link>
        {!collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className="hidden lg:flex w-7 h-7 rounded-lg items-center justify-center text-gray-500 hover:text-white hover:bg-white/[0.06] transition"
            title="Collapse"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="hidden lg:flex mx-auto mt-2 w-7 h-7 rounded-lg items-center justify-center text-gray-500 hover:text-white hover:bg-white/[0.06] transition"
          title="Expand"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      )}

      {/* ── Navigation ───────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 sidebar-scroll">
        {NAV_VISIBLE.map((group, gi) => (
          <div key={gi} className="mb-1">
            {group.section &&
              (collapsed ? (
                <div className="my-2 flex justify-center">
                  <span className="w-5 h-px bg-white/[0.08]" />
                </div>
              ) : (
                <p className="px-3 pt-5 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500/80">
                  {group.section}
                </p>
              ))}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavItem
                  key={item.to}
                  item={item}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                  badge={0}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Bottom: usage + profile ──────────────────────────── */}
      <div className="flex-shrink-0 p-3 space-y-2.5 border-t border-white/[0.06]">
        {!collapsed && (
          <div className="rounded-2xl bg-[#1F2937] border border-white/[0.06] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-300">
                {isPremium && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                {isLifetime ? "Lifetime" : planLabel(plan)}
              </span>
              {!usage.unlimited && (
                <span className="text-[11px] font-mono text-gray-500">
                  {usage.pct}%
                </span>
              )}
            </div>
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="text-gray-400">Messages Used</span>
              <span className="text-white font-semibold">
                {usage.unlimited
                  ? `${usage.used.toLocaleString()} · Unlimited`
                  : `${usage.used.toLocaleString()} / ${usage.limit.toLocaleString()}`}
              </span>
            </div>
            {!usage.unlimited && (
              <div className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${usage.pct}%`,
                    background:
                      usage.pct > 90
                        ? "#ef4444"
                        : `linear-gradient(90deg, ${ACCENT}, #ff9466)`,
                  }}
                />
              </div>
            )}
            {/* Only show upgrade for non-premium, non-lifetime accounts. */}
            {!isPremium && !isLifetime && (
              <Link
                to="/dashboard/billing"
                onClick={onNavigate}
                className="mt-3.5 w-full inline-flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold text-white transition hover:opacity-90"
                style={{ background: ACCENT }}
              >
                Upgrade Plan <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        )}

        {/* Visit public website — opens landing page in a new tab, keeps session */}
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          title={collapsed ? "Visit website" : undefined}
          className={clsx(
            "group flex items-center rounded-xl text-[13.5px] font-medium text-gray-400 transition-all duration-200 hover:text-white hover:bg-white/[0.04]",
            collapsed ? "justify-center h-11 w-11 mx-auto" : "gap-3 px-3 py-2.5",
          )}
        >
          <Globe className="w-[19px] h-[19px] flex-shrink-0 text-gray-500 transition-colors duration-200 group-hover:text-[#ff5722]" />
          {!collapsed && (
            <>
              <span className="truncate">Visit website</span>
              <ArrowUpRight className="ml-auto w-4 h-4 flex-shrink-0 text-gray-600 transition-colors group-hover:text-[#ff5722]" />
            </>
          )}
        </a>

        {/* Profile card */}
        <div
          className={clsx(
            "rounded-2xl bg-[#1F2937] border border-white/[0.06] flex items-center gap-3 transition hover:border-white/[0.12]",
            collapsed ? "justify-center p-2" : "p-2.5",
          )}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${ACCENT}, #ff9466)`,
            }}
          >
            {initial}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="truncate font-semibold text-white text-[13px] leading-tight">
                  {user?.name?.split(" ")[0] ||
                    user?.email?.split("@")[0] ||
                    "You"}
                </p>
                <p className="truncate text-[11px] text-gray-400 leading-tight mt-0.5">
                  {user?.email}
                </p>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/[0.06] transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

// ─── Nav item ────────────────────────────────────────────────────────────────
function NavItem({ item, collapsed, onNavigate, badge }) {
  const { to, icon: Icon, label, end } = item;
  const location = useLocation();
  const navigate = useNavigate();

  // Parse path / search / hash from the `to` string
  const [pathAndSearch, hash] = to.split("#");
  const [pathname] = pathAndSearch.split("?");
  const search = pathAndSearch.includes("?")
    ? pathAndSearch.split("?")[1]
    : null;

  const isActive = end
    ? location.pathname === pathname && !location.search && !location.hash
    : hash
      ? location.pathname === pathname && location.hash === `#${hash}`
      : location.pathname === pathname &&
        (search
          ? location.search.includes(search)
          : // A plain link (no ?search) is NOT active when the URL carries a
            // ?tab= param that a sibling link owns (e.g. ?tab=test).
            !/[?&]tab=/.test(location.search));

  const handleClick = (e) => {
    if (hash) {
      e.preventDefault();
      // Navigate to the path first, then scroll to the section
      navigate(pathname);
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
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
        "group relative flex items-center rounded-xl text-[13.5px] transition-all duration-200",
        collapsed ? "justify-center h-11 w-11 mx-auto" : "gap-3 px-3 py-2.5",
        isActive
          ? "text-white font-semibold"
          : "text-gray-400 font-medium hover:text-white hover:bg-white/[0.04]",
      )}
      style={
        isActive
          ? {
              background:
                "linear-gradient(90deg, rgba(255,87,34,0.18), rgba(255,87,34,0.06))",
            }
          : undefined
      }
    >
      {/* active left indicator */}
      {isActive && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full shadow-[0_0_8px_rgba(255,87,34,0.6)]"
          style={{ background: ACCENT }}
        />
      )}
      <Icon
        className={clsx(
          "w-[19px] h-[19px] flex-shrink-0 transition-colors duration-200",
          isActive ? "" : "text-gray-500 group-hover:text-[#ff5722]",
        )}
        style={isActive ? { color: ACCENT } : undefined}
      />
      {!collapsed && <span className="truncate">{label}</span>}
      {!collapsed && badge > 0 && (
        <span
          className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-bold rounded-full text-white"
          style={{ background: ACCENT }}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      )}
      {collapsed && badge > 0 && (
        <span
          className="absolute top-1 right-1 w-2 h-2 rounded-full ring-2 ring-[#111827]"
          style={{ background: ACCENT }}
        />
      )}
    </NavLink>
  );
}
