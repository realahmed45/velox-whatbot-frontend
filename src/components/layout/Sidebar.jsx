/**
 * Botlify Sidebar — channel-aware, rectangular, premium dark.
 *
 * - Section dividers ("Bot Automation" / "Custom Automations" / "Tools")
 *   mirror the dashboard structure exactly.
 * - Custom Automations list differs per active channel (IG vs WA).
 * - Active-channel accent paints the highlight, top-bar glow and section
 *   bullets — pink (Instagram) or emerald (WhatsApp).
 * - Zero rounded corners. Sharp edges, thin borders, premium dark surface.
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
  Instagram,
  MessageSquare,
  ChevronsLeft,
  ChevronsRight,
  Crown,
  Workflow,
  Sparkles,
  MessageCircle,
  Hash,
  Heart,
  Share2,
  Link as LinkIcon,
  Radio,
  Target,
  CircleDot,
  Clock,
  ShoppingCart,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { clsx } from "clsx";

const COLLAPSE_KEY = "botlify-sidebar-collapsed";

// ─── Static items ──────────────────────────────────────────────────────────
const TOP = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", end: true },
];

const BOT_AUTOMATION = [
  { to: "/dashboard/ai-bot", icon: Bot, label: "AI Bot" },
  { to: "/dashboard/ai-bot?test=1", icon: Sparkles, label: "Test the bot" },
  { to: "/dashboard/flow-builder", icon: Workflow, label: "Bot Flows" },
];

// Custom-automation tabs — vary by channel
const IG_AUTOMATIONS = [
  {
    to: "/dashboard/automation?tab=welcome",
    icon: MessageCircle,
    label: "Welcome DM",
  },
  {
    to: "/dashboard/automation?tab=comment_kw",
    icon: Hash,
    label: "Comment → DM",
  },
  {
    to: "/dashboard/automation?tab=dm_kw",
    icon: MessageCircle,
    label: "DM keywords",
  },
  {
    to: "/dashboard/automation?tab=story_reply",
    icon: Heart,
    label: "Story replies",
  },
  {
    to: "/dashboard/automation?tab=story_mention",
    icon: Heart,
    label: "Story mentions",
  },
  {
    to: "/dashboard/automation?tab=share",
    icon: Share2,
    label: "Share to story",
  },
  {
    to: "/dashboard/automation?tab=ref_url",
    icon: LinkIcon,
    label: "Tracked links",
  },
  { to: "/dashboard/automation?tab=live", icon: Radio, label: "Live comments" },
  {
    to: "/dashboard/automation?tab=starters",
    icon: Target,
    label: "Chat starters",
  },
  {
    to: "/dashboard/automation?tab=fallback",
    icon: CircleDot,
    label: "Fallback reply",
  },
  {
    to: "/dashboard/automation?tab=hours",
    icon: Clock,
    label: "Business hours",
  },
];


const TOOLS = [
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
];

const BOTTOM_NAV = [
  { to: "/dashboard/billing", icon: CreditCard, label: "Plan & Billing" },
  { to: "/dashboard/settings", icon: SettingsIcon, label: "Settings" },
];

// ─── Per-channel theme ─────────────────────────────────────────────────────
// Single neutral theme — channel-agnostic ManyChat-style sidebar. The dashboard
// shows all connected channels in one unified view, so the sidebar no longer
// re-paints per channel.
const THEME = {
  name: "Botlify",
  accentText: "text-violet-200",
  accentIcon: "text-violet-300",
  activeBg: "bg-white/[0.06]",
  activeRing: "shadow-[inset_2px_0_0_0_rgba(139,92,246,0.9)]",
  sectionBar: "bg-violet-400/70",
  sectionLabel: "text-white/40",
  glow: "bg-gradient-to-b from-violet-400/8 via-violet-400/2 to-transparent",
  logoGrad: "from-violet-500 via-fuchsia-500 to-rose-500",
  progress: "from-violet-400 to-fuchsia-500",
  badge: "bg-violet-400/10 text-violet-200 border-violet-400/25",
  pillActive: "bg-violet-400/15 text-violet-100 border-violet-400/35",
  pillDot: "bg-violet-400",
};

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

  // Single neutral theme — channel-agnostic
  const theme = THEME;

  // Plan / usage
  const plan = workspace?.subscription?.plan || "free";
  const usage = useMemo(() => {
    const used = workspace?.usage?.messagesThisMonth || 0;
    const limit = workspace?.usage?.messagesLimit || 500;
    const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
    return { used, limit, pct };
  }, [workspace]);

  const igConnected = workspace?.instagram?.status === "connected";

  const automations = useMemo(
    () => (igConnected ? IG_AUTOMATIONS : []),
    [igConnected],
  );

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
    let socket;
    (async () => {
      const { initSocket } = await import("@/services/socket");
      socket = initSocket();
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

  // Reset count when user visits orders page
  useEffect(() => {
    if (location.pathname === "/dashboard/orders") setNewOrderCount(0);
  }, [location.pathname]);

  const isPremium = ["ig_pro", "scale"].includes(plan);

  const initial = (
    workspace?.name?.[0] ||
    user?.name?.[0] ||
    user?.email?.[0] ||
    "B"
  ).toUpperCase();

  return (
    <aside
      className={clsx(
        "relative flex-shrink-0 flex flex-col h-full transition-[width] duration-300 overflow-hidden",
        "bg-[#0a0a14] border-r border-white/[0.06]",
        collapsed ? "w-[72px]" : "w-[260px]",
      )}
    >
      {/* Channel-tinted glow */}
      <div
        className={clsx(
          "pointer-events-none absolute inset-x-0 top-0 h-48 opacity-80",
          theme.glow,
        )}
      />

      {/* ── Logo ──────────────────────────────────────────────── */}
      <div className="relative flex items-center justify-between h-14 px-3.5 border-b border-white/[0.08] flex-shrink-0">
        <Link
          to="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-2.5 min-w-0"
        >
          <span
            className={clsx(
              "w-8 h-8 flex-shrink-0 flex items-center justify-center shadow-lg bg-gradient-to-br",
              theme.logoGrad,
            )}
          >
            <Bot className="w-4 h-4 text-white" />
          </span>
          {!collapsed && (
            <div className="flex flex-col leading-none min-w-0">
              <span className="font-bold text-white text-sm tracking-tight">
                Botlify
              </span>
              <span
                className={clsx(
                  "text-[10px] font-semibold mt-0.5 tracking-wider uppercase",
                  theme.accentText,
                )}
              >
                {theme.name}
              </span>
            </div>
          )}
        </Link>
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="hidden lg:flex w-7 h-7 items-center justify-center text-white/30 hover:text-white hover:bg-white/8 transition"
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? (
            <ChevronsRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronsLeft className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Channel pills removed — ManyChat-style sidebar is channel-agnostic.
          Connected channels are surfaced on the dashboard home (OverviewPage). */}

      {/* ── Main nav (scrollable) ─────────────────────────────── */}
      <nav className="relative flex-1 overflow-y-auto py-3 px-2 space-y-3 sidebar-scroll">
        {/* Top */}
        <div className="space-y-0.5">
          {TOP.map((item) => (
            <SidebarLink
              key={item.to}
              {...item}
              theme={theme}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </div>

        {/* Bot Automation */}
        <NavSection
          label="Bot Automation"
          collapsed={collapsed}
          theme={theme}
        />
        <div className="space-y-0.5">
          {BOT_AUTOMATION.map((item) => (
            <SidebarLink
              key={item.to}
              {...item}
              theme={theme}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </div>

        {/* Custom Automations — union of connected channels' items */}
        {automations.length > 0 && (
          <>
            <NavSection
              label="Custom Automations"
              collapsed={collapsed}
              theme={theme}
              accent
            />
            <div className="space-y-0.5">
              {automations.map((item) => (
                <SidebarLink
                  key={item.to}
                  {...item}
                  theme={theme}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                  dense
                />
              ))}
            </div>
          </>
        )}

        {/* Tools */}
        <NavSection
          label="Tools & Insights"
          collapsed={collapsed}
          theme={theme}
        />
        <div className="space-y-0.5">
          {TOOLS.map((item) => (
            <SidebarLink
              key={item.to}
              {...item}
              badge={
                item.badgeKey === "newOrders" && newOrderCount > 0
                  ? newOrderCount
                  : null
              }
              theme={theme}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </nav>

      {/* ── Bottom section ────────────────────────────────────── */}
      <div className="relative px-3 pb-3 space-y-1 border-t border-white/[0.06] pt-3 flex-shrink-0">
        {/* Usage bar */}
        {!collapsed && (
          <div className="px-2 py-3 mb-2">
            <div className="flex justify-between text-[10px] text-white/50 mb-2">
              <span className="flex items-center gap-1.5">
                {isPremium && <Crown className="w-3 h-3 text-amber-400" />}
                <span className="font-semibold tracking-wide uppercase">
                  {planLabel(plan)}
                </span>
              </span>
              <span className="font-mono text-white/60">{usage.pct}%</span>
            </div>
            <div className="h-1 bg-white/[0.08] overflow-hidden">
              <div
                className={clsx(
                  "h-full transition-all bg-gradient-to-r",
                  usage.pct > 90
                    ? "from-red-500 to-rose-600"
                    : usage.pct > 70
                      ? "from-amber-400 to-orange-500"
                      : theme.progress,
                )}
                style={{ width: `${usage.pct}%` }}
              />
            </div>
            <p className="text-[10px] text-white/30 mt-2">
              {usage.used.toLocaleString()} / {usage.limit.toLocaleString()}{" "}
              messages
            </p>
          </div>
        )}

        {BOTTOM_NAV.map((item) => (
          <SidebarLink
            key={item.to}
            {...item}
            theme={theme}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}

        {/* User + logout */}
        <div
          className={clsx(
            "mt-2 flex items-center gap-3 px-3 py-2.5",
            "text-white/60 text-xs border border-white/[0.06] bg-white/[0.02]",
            collapsed && "justify-center px-2",
          )}
        >
          <div
            className={clsx(
              "w-8 h-8 flex items-center justify-center text-[12px] text-white font-bold flex-shrink-0 bg-gradient-to-br",
              theme.logoGrad,
            )}
          >
            {initial}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="truncate font-semibold text-white/85 text-[12px] leading-tight">
                {user?.name?.split(" ")[0] ||
                  user?.email?.split("@")[0] ||
                  "You"}
              </p>
              <p className="truncate text-[10px] text-white/40 leading-tight mt-0.5">
                {user?.email}
              </p>
            </div>
          )}
          <button
            onClick={handleLogout}
            title="Sign out"
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-white/40 hover:text-rose-400 hover:bg-white/[0.05] transition"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function NavSection({ label, collapsed, theme, accent }) {
  if (collapsed) {
    return (
      <div className="flex justify-center py-2">
        <span
          className={clsx(
            "w-6 h-px",
            accent ? theme.sectionBar : "bg-white/15",
          )}
        />
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2.5 px-3 pt-1 pb-2">
      <span
        className={clsx("w-1 h-3.5", accent ? theme.sectionBar : "bg-white/25")}
      />
      <span
        className={clsx(
          "text-[10px] font-bold uppercase tracking-[0.16em]",
          accent ? theme.sectionLabel : "text-white/45",
        )}
      >
        {label}
      </span>
    </div>
  );
}

function SidebarLink({
  to,
  icon: Icon,
  label,
  end,
  collapsed,
  onNavigate,
  theme,
  badge,
}) {
  const location = useLocation();

  // NavLink doesn't match query strings out of the box. We need custom active
  // detection so e.g. /dashboard/automation?tab=welcome highlights only that
  // exact item, not every automation row.
  const [pathname, search] = to.split("?");
  const matchesPath = location.pathname === pathname;
  const matchesQuery = search ? location.search.includes(search) : true;
  const isActive = end
    ? location.pathname === pathname && !location.search
    : matchesPath && matchesQuery;

  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      end={end}
      className={clsx(
        "group relative flex items-center gap-3 text-[13px] font-medium transition-all duration-150",
        "px-3.5 py-2.5",
        collapsed && "justify-center px-0 w-full",
        isActive
          ? clsx(theme.activeBg, theme.accentText, theme.activeRing)
          : "text-white/60 hover:text-white hover:bg-white/[0.04]",
      )}
    >
      <Icon
        className={clsx(
          "w-[15px] h-[15px] flex-shrink-0",
          isActive
            ? theme.accentIcon
            : "text-white/45 group-hover:text-white/85",
        )}
      />
      {!collapsed && <span className="truncate">{label}</span>}
      {!collapsed && badge ? (
        <span className="ml-auto inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 text-[10px] font-bold rounded-full bg-rose-500 text-white">
          {badge > 99 ? "99+" : badge}
        </span>
      ) : null}
      {collapsed && badge ? (
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
      ) : null}
    </NavLink>
  );
}

function planLabel(id) {
  const map = {
    free: "Free trial",
    ig_starter: "Basic",
    ig_pro: "Pro",
    starter: "Starter",
    growth: "Basic",
    scale: "Pro",
  };
  return map[id] || id;
}
