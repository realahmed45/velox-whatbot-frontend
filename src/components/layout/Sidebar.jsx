/**
 * Botlify Sidebar — premium, minimal, enterprise-grade.
 *
 * Brand: #FF6B2C accent on a #111827 surface, #1F2937 cards.
 * Design language: Linear / Stripe / Vercel / Notion / Intercom.
 * - Sectioned nav (Automation / Management / Grow / Settings)
 * - Active item: 4px orange left bar + soft orange tint + orange icon
 * - Usage card + profile card pinned to the bottom
 * - Collapsible with smooth micro-interactions
 */
import { NavLink, useNavigate, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Inbox,
  Users,
  BarChart2,
  LogOut,
  CreditCard,
  Send,
  Settings as SettingsIcon,
  Bot,
  ChevronsLeft,
  ChevronsRight,
  Crown,
  Workflow,
  Sparkles,
  Hash,
  Link as LinkIcon,
  CalendarClock,
  Droplet,
  Gift,
  Eye,
  UserPlus,
  Plug,
  ShoppingCart,
  ArrowUpRight,
  Zap,
  Webhook,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { clsx } from "clsx";

const COLLAPSE_KEY = "botlify-sidebar-collapsed";
const ACCENT = "#FF6B2C";

// ─── Navigation model ────────────────────────────────────────────────────────
const NAV = [
  {
    section: null,
    items: [
      { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", end: true },
    ],
  },
  {
    section: "Automation",
    items: [
      { to: "/dashboard/ai-bot", icon: Bot, label: "AI Bot" },
      { to: "/dashboard/automation", icon: Zap, label: "Smart Automations" },
      { to: "/dashboard/flows", icon: Workflow, label: "Custom Flows" },
    ],
  },
  {
    section: "Management",
    items: [
      { to: "/dashboard/inbox", icon: Inbox, label: "Inbox" },
      { to: "/dashboard/contacts", icon: Users, label: "Contacts" },
      {
        to: "/dashboard/orders",
        icon: ShoppingCart,
        label: "Orders",
        badgeKey: "newOrders",
      },
      { to: "/dashboard/broadcasts", icon: Send, label: "Broadcasts" },
      { to: "/dashboard/analytics", icon: BarChart2, label: "Analytics" },
    ],
  },
  {
    section: "Grow",
    items: [
      { to: "/dashboard/scheduled-posts", icon: CalendarClock, label: "Scheduled Posts" },
      { to: "/dashboard/drip", icon: Droplet, label: "Drip Campaigns" },
      { to: "/dashboard/giveaways", icon: Gift, label: "Giveaways" },
      { to: "/dashboard/link-in-bio", icon: LinkIcon, label: "Link in Bio" },
      { to: "/dashboard/hashtags", icon: Hash, label: "Hashtags" },
      { to: "/dashboard/competitors", icon: Eye, label: "Competitors" },
      { to: "/dashboard/referral", icon: UserPlus, label: "Referrals" },
    ],
  },
  {
    section: "Integrations",
    items: [
      { to: "/dashboard/apps", icon: Plug, label: "Apps" },
      { to: "/dashboard/integrations", icon: Webhook, label: "Webhooks" },
    ],
  },
  {
    section: "Settings",
    items: [
      { to: "/dashboard/team", icon: Users, label: "Team" },
      { to: "/dashboard/billing", icon: CreditCard, label: "Plan & Billing" },
      { to: "/dashboard/settings", icon: SettingsIcon, label: "Settings" },
    ],
  },
];

function planLabel(id) {
  const map = {
    free: "Free Plan",
    ig_starter: "Basic Plan",
    ig_pro: "Pro Plan",
    starter: "Starter",
    growth: "Basic Plan",
    scale: "Pro Plan",
  };
  return map[id] || id;
}

export default function Sidebar({ onNavigate }) {
  const { logout, user } = useAuthStore();
  const { workspace } = useWorkspaceStore();
  const navigate = useNavigate();
  const location = useLocation();

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

  const plan = workspace?.subscription?.plan || "free";
  const usage = useMemo(() => {
    const used = workspace?.usage?.messagesThisMonth || 0;
    const limit = workspace?.usage?.messagesLimit || 500;
    const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
    return { used, limit, pct };
  }, [workspace]);

  const isPremium = ["ig_pro", "scale"].includes(plan);

  // Live "new orders" badge — fetched once + bumped via socket
  const [newOrderCount, setNewOrderCount] = useState(0);
  useEffect(() => {
    let cancelled = false;
    if (!workspace?._id || !workspace?.smartOrders?.enabled) return;
    (async () => {
      try {
        const api = (await import("@/services/api")).default;
        const { data } = await api.get("/orders?status=new&limit=1");
        if (!cancelled) setNewOrderCount(data.statusCounts?.new || 0);
      } catch (_) {
        /* ignore */
      }
    })();
    (async () => {
      const { initSocket } = await import("@/services/socket");
      const socket = initSocket();
      if (!socket) return;
      const onNew = () => setNewOrderCount((c) => c + 1);
      const onUpdated = ({ order }) => {
        if (order?.status && order.status !== "new") {
          setNewOrderCount((c) => Math.max(0, c - 1));
        }
      };
      socket.on("order:new", onNew);
      socket.on("order:updated", onUpdated);
    })();
    return () => {
      cancelled = true;
    };
  }, [workspace?._id, workspace?.smartOrders?.enabled]);

  useEffect(() => {
    if (location.pathname === "/dashboard/orders") setNewOrderCount(0);
  }, [location.pathname]);

  const initial = (
    workspace?.name?.[0] ||
    user?.name?.[0] ||
    user?.email?.[0] ||
    "B"
  ).toUpperCase();

  const badges = { newOrders: newOrderCount };

  return (
    <aside
      className={clsx(
        "relative flex-shrink-0 flex flex-col h-full bg-[#111827] border-r border-white/[0.06]",
        "transition-[width] duration-300 ease-out overflow-hidden",
        collapsed ? "w-[76px]" : "w-[260px]",
      )}
    >
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
          <img
            src="/logo.png"
            alt="Botlify"
            className="w-9 h-9 flex-shrink-0 object-contain drop-shadow"
          />
          {!collapsed && (
            <div className="flex flex-col leading-none min-w-0">
              <span className="font-bold text-white text-[17px] tracking-tight">
                Botlify
              </span>
              <span className="text-[11px] font-medium text-gray-400 mt-1 truncate">
                Instagram Automation
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
        {NAV.map((group, gi) => (
          <div key={gi} className="mb-1">
            {group.section &&
              (collapsed ? (
                <div className="my-2 flex justify-center">
                  <span className="w-5 h-px bg-white/[0.08]" />
                </div>
              ) : (
                <p className="px-3 pt-4 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500">
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
                  badge={item.badgeKey ? badges[item.badgeKey] : 0}
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
                {planLabel(plan)}
              </span>
              <span className="text-[11px] font-mono text-gray-500">
                {usage.pct}%
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="text-gray-400">Messages Used</span>
              <span className="text-white font-semibold">
                {usage.used.toLocaleString()} / {usage.limit.toLocaleString()}
              </span>
            </div>
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
            <Link
              to="/dashboard/billing"
              onClick={onNavigate}
              className="mt-3.5 w-full inline-flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold text-white transition hover:opacity-90"
              style={{ background: ACCENT }}
            >
              Upgrade Plan <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

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
  const search = pathAndSearch.includes("?") ? pathAndSearch.split("?")[1] : null;

  const isActive = end
    ? location.pathname === pathname && !location.search && !location.hash
    : hash
    ? location.pathname === pathname && location.hash === `#${hash}`
    : location.pathname === pathname && (search ? location.search.includes(search) : true);

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
        "group relative flex items-center rounded-lg text-[14px] transition-all duration-200",
        collapsed ? "justify-center h-11 w-11 mx-auto" : "gap-3 px-3 py-2.5",
        isActive
          ? "text-white font-semibold"
          : "text-gray-400 font-medium hover:text-white hover:bg-white/[0.04]",
      )}
      style={isActive ? { background: "rgba(255,107,44,0.12)" } : undefined}
    >
      {/* active left indicator (4px) */}
      {isActive && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full"
          style={{ background: ACCENT }}
        />
      )}
      <Icon
        className={clsx(
          "w-[19px] h-[19px] flex-shrink-0 transition-colors duration-200",
          isActive ? "" : "text-gray-500 group-hover:text-[#FF6B2C]",
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
