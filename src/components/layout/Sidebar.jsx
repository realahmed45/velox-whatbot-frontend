import { NavLink, useNavigate, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Zap,
  Workflow,
  Inbox,
  Users,
  BarChart2,
  LogOut,
  Sparkles,
  CreditCard,
  Send,
  Calendar,
  Droplet,
  Gift,
  Target,
  Plug,
  Hash,
  Link2,
  UserPlus,
  Award,
  Settings as SettingsIcon,
  ChevronDown,
  Bot,
  ChevronsLeft,
  ChevronsRight,
  Crown,
  Instagram,
  MessageCircle,
  Layers,
  Plus,
  Check,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import api from "@/services/api";
import toast from "react-hot-toast";
import { clsx } from "clsx";

const GROUPS = [
  {
    id: "overview",
    label: "Overview",
    items: [
      {
        to: "/dashboard",
        icon: LayoutDashboard,
        label: "Dashboard",
        end: true,
      },
      {
        to: "/dashboard/guide",
        icon: Sparkles,
        label: "Guide me",
        highlight: true,
      },
    ],
  },
  {
    id: "automate",
    label: "Automate",
    items: [
      { to: "/dashboard/automation", icon: Zap, label: "Automation" },
      { to: "/dashboard/flow-builder", icon: Workflow, label: "Flow Builder" },
      { to: "/dashboard/ai-bot", icon: Bot, label: "AI Bot", premium: true },
    ],
  },
  {
    id: "engage",
    label: "Engage",
    items: [
      { to: "/dashboard/inbox", icon: Inbox, label: "Inbox" },
      { to: "/dashboard/contacts", icon: Users, label: "Contacts" },
      { to: "/dashboard/broadcasts", icon: Send, label: "Broadcasts" },
      {
        to: "/dashboard/drip-campaigns",
        icon: Droplet,
        label: "Drip Campaigns",
      },
      { to: "/dashboard/giveaways", icon: Gift, label: "Giveaways", channel: "ig" },
    ],
  },
  {
    id: "content",
    label: "Content",
    channel: "ig",
    items: [
      {
        to: "/dashboard/scheduled-posts",
        icon: Calendar,
        label: "Scheduled Posts",
        channel: "ig",
      },
      { to: "/dashboard/link-in-bio", icon: Link2, label: "Link in Bio", channel: "ig" },
    ],
  },
  {
    id: "grow",
    label: "Grow",
    items: [
      { to: "/dashboard/analytics", icon: BarChart2, label: "Analytics" },
      { to: "/dashboard/competitors", icon: Target, label: "Competitors", channel: "ig" },
      {
        to: "/dashboard/hashtags",
        icon: Hash,
        label: "Hashtags",
        premium: true,
        channel: "ig",
      },
    ],
  },
  {
    id: "connect",
    label: "Connect",
    items: [
      { to: "/dashboard/integrations", icon: Plug, label: "Integrations" },
      { to: "/dashboard/team", icon: UserPlus, label: "Team" },
      { to: "/dashboard/referral", icon: Award, label: "Referrals" },
    ],
  },
  {
    id: "account",
    label: "Account",
    items: [
      { to: "/dashboard/settings", icon: SettingsIcon, label: "Settings" },
      { to: "/dashboard/billing", icon: CreditCard, label: "Billing & Plan" },
    ],
  },
];

const STORAGE_KEY = "botlify-sidebar-groups";
const COLLAPSE_KEY = "botlify-sidebar-collapsed";

function loadJSON(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
}

export default function Sidebar({ onNavigate }) {
  const { logout, user, activeWorkspace } = useAuthStore();
  const { workspace, fetchWorkspace } = useWorkspaceStore();
  const navigate = useNavigate();
  const location = useLocation();
  const plan = workspace?.subscription?.plan || "starter";
  const igConnected = workspace?.instagram?.status === "connected";
  const waConnected =
    workspace?.whatsapp?.status === "connected" ||
    (workspace?.whatsapp?.type && workspace.whatsapp.type !== "none");
  const igHandle = workspace?.instagram?.username;
  const igPic = workspace?.instagram?.profilePicture;
  const activeChannel = workspace?.activeChannel || "instagram";
  const [switcherOpen, setSwitcherOpen] = useState(false);

  const switchChannel = async (next) => {
    setSwitcherOpen(false);
    if (next === activeChannel) return;
    if (next === "whatsapp" && !waConnected) {
      navigate("/onboarding/whatsapp");
      return;
    }
    if (next === "instagram" && !igConnected) {
      navigate("/onboarding/instagram");
      return;
    }
    try {
      await api.put(`/workspaces/${activeWorkspace}`, { activeChannel: next });
      await fetchWorkspace(activeWorkspace);
      toast.success(
        `Now showing ${next === "both" ? "all channels" : next === "whatsapp" ? "WhatsApp" : "Instagram"}`,
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't switch");
    }
  };

  const [collapsedGroups, setCollapsedGroups] = useState(() =>
    loadJSON(STORAGE_KEY, {}),
  );
  const [collapsed, setCollapsed] = useState(() =>
    loadJSON(COLLAPSE_KEY, false),
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collapsedGroups));
  }, [collapsedGroups]);
  useEffect(() => {
    localStorage.setItem(COLLAPSE_KEY, JSON.stringify(collapsed));
  }, [collapsed]);

  const toggleGroup = (id) =>
    setCollapsedGroups((c) => ({ ...c, [id]: !c[id] }));

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isGroupActive = (items) =>
    items.some((i) =>
      i.end ? location.pathname === i.to : location.pathname.startsWith(i.to),
    );

  const usage = useMemo(() => {
    const used = workspace?.usage?.messagesThisMonth || 0;
    const limit = workspace?.usage?.messagesLimit || 500;
    const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
    return { used, limit, pct };
  }, [workspace]);

  const planLabel =
    plan === "scale" ? "Scale" : plan === "growth" ? "Growth" : "Starter";

  return (
    <aside
      className={clsx(
        "relative flex-shrink-0 flex flex-col h-full text-ink-200 transition-[width] duration-300",
        "bg-ink-950 border-r border-white/5",
        collapsed ? "w-[72px]" : "w-64",
      )}
    >
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0 bg-mesh-dark opacity-70" />
      <div className="pointer-events-none absolute inset-0 bg-grid-dark bg-grid-32 opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="pointer-events-none absolute -top-24 -left-12 w-64 h-64 rounded-full bg-brand-500/15 blur-[80px]" />
      <div className="pointer-events-none absolute bottom-10 -right-12 w-56 h-56 rounded-full bg-accent-500/15 blur-[80px]" />

      {/* Header / logo + collapse */}
      <div className="relative h-16 flex items-center justify-between px-4 border-b border-white/5">
        <Link
          to="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-2 min-w-0"
          aria-label="Botlify home"
        >
          <span className="w-8 h-8 rounded-md bg-brand-gradient flex items-center justify-center shadow-glow flex-shrink-0">
            <Bot className="w-4 h-4 text-white" />
          </span>
          {!collapsed && (
            <span className="font-bold text-white tracking-tight truncate">
              Botlify
            </span>
          )}
        </Link>
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="hidden lg:flex w-7 h-7 items-center justify-center rounded-md text-ink-400 hover:text-white hover:bg-white/10 transition"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronsRight className="w-4 h-4" />
          ) : (
            <ChevronsLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Workspace card */}
      {workspace && !collapsed && (
        <div className="relative mx-3 mt-3 p-3 rounded-md bg-white/5 backdrop-blur border border-white/10 overflow-hidden hover:border-white/20 transition group">
          <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-brand-500/20 blur-2xl group-hover:bg-brand-500/30 transition" />
          <div className="relative flex items-center gap-2.5">
            <div className="relative flex-shrink-0">
              {igPic ? (
                <img
                  src={igPic}
                  alt=""
                  className="w-9 h-9 rounded-md object-cover ring-1 ring-white/10"
                />
              ) : (
                <div className="w-9 h-9 rounded-md bg-brand-gradient flex items-center justify-center shadow-glow">
                  <Instagram className="w-4 h-4 text-white" />
                </div>
              )}
              <span
                className={clsx(
                  "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-ink-950",
                  igConnected || waConnected ? "bg-emerald-400" : "bg-ink-500",
                )}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-ink-400 font-bold truncate">
                {workspace.name}
              </p>
              <p className="text-xs text-white font-medium truncate">
                {igHandle
                  ? `@${igHandle}`
                  : igConnected || waConnected
                    ? "Connected"
                    : "Not connected"}
              </p>
            </div>
          </div>

          {/* Channel switcher pill */}
          <div className="relative mt-3">
            <button
              type="button"
              onClick={() => setSwitcherOpen((v) => !v)}
              className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 transition"
            >
              <span className="flex items-center gap-1.5 min-w-0">
                <ChannelIcon channel={activeChannel} className="w-3.5 h-3.5" />
                <span className="text-[11px] font-semibold text-white truncate">
                  {channelLabel(activeChannel)}
                </span>
              </span>
              <ChevronDown
                className={clsx(
                  "w-3 h-3 text-ink-400 transition-transform",
                  switcherOpen && "rotate-180",
                )}
              />
            </button>
            {switcherOpen && (
              <div className="absolute z-20 mt-1 left-0 right-0 bg-ink-900 border border-white/10 rounded-md shadow-xl overflow-hidden">
                <ChannelOption
                  channel="whatsapp"
                  active={activeChannel === "whatsapp"}
                  connected={waConnected}
                  onClick={() => switchChannel("whatsapp")}
                />
                <ChannelOption
                  channel="instagram"
                  active={activeChannel === "instagram"}
                  connected={igConnected}
                  onClick={() => switchChannel("instagram")}
                />
                <ChannelOption
                  channel="both"
                  active={activeChannel === "both"}
                  connected={igConnected && waConnected}
                  onClick={() => switchChannel("both")}
                />
                <Link
                  to="/onboarding/choose-channel"
                  onClick={() => {
                    setSwitcherOpen(false);
                    onNavigate?.();
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-[11px] text-brand-300 hover:bg-white/5 border-t border-white/5"
                >
                  <Plus className="w-3 h-3" /> Add channel
                </Link>
              </div>
            )}
          </div>

          {/* Plan + DM usage meter */}
          <div className="relative mt-3 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between text-[10px] mb-1.5">
              <span className="inline-flex items-center gap-1 font-semibold text-ink-300">
                {plan === "scale" && (
                  <Crown className="w-3 h-3 text-amber-400" />
                )}
                {planLabel} plan
              </span>
              <span className="text-ink-400">{usage.pct}%</span>
            </div>
            <div className="h-1.5 rounded-md bg-white/10 overflow-hidden">
              <div
                className={clsx(
                  "h-full rounded-md transition-all",
                  usage.pct > 90
                    ? "bg-gradient-to-r from-rose-500 to-red-500"
                    : usage.pct > 70
                      ? "bg-gradient-to-r from-amber-400 to-orange-500"
                      : "bg-gradient-to-r from-brand-400 to-accent-400",
                )}
                style={{ width: `${usage.pct}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[10px] text-ink-400">
                {usage.used.toLocaleString()} /{" "}
                {usage.limit > 0 ? usage.limit.toLocaleString() : "∞"} DMs
              </span>
              {plan !== "scale" && (
                <Link
                  to="/dashboard/billing"
                  onClick={onNavigate}
                  className="text-[10px] font-semibold text-brand-300 hover:text-white transition"
                >
                  Upgrade →
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Collapsed plan badge */}
      {workspace && collapsed && (
        <div
          className="relative mx-auto mt-3"
          title={`${planLabel} · ${usage.pct}%`}
        >
          <div className="w-10 h-10 rounded-md bg-white/5 border border-white/10 flex items-center justify-center">
            {plan === "scale" ? (
              <Crown className="w-4 h-4 text-amber-400" />
            ) : (
              <Sparkles className="w-4 h-4 text-brand-300" />
            )}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="relative flex-1 overflow-y-auto py-3 px-2 space-y-1 sidebar-scroll">
        {GROUPS.map((group) => {
          // Channel filter — hide groups/items that don't apply to the active channel
          const visibleItems = group.items.filter((item) => {
            if (activeChannel === "both") return true;
            const itemChan = item.channel; // undefined = both
            if (!itemChan) return true;
            return itemChan === (activeChannel === "whatsapp" ? "wa" : "ig");
          });
          if (visibleItems.length === 0) return null;
          if (activeChannel !== "both" && group.channel) {
            const groupChan = group.channel;
            const wantWa = activeChannel === "whatsapp";
            if ((groupChan === "ig" && wantWa) || (groupChan === "wa" && !wantWa))
              return null;
          }

          const groupActive = isGroupActive(visibleItems);
          const isOpen = !collapsedGroups[group.id] || groupActive;
          const showGroupHeader = visibleItems.length > 1 && !collapsed;
          return (
            <div key={group.id}>
              {showGroupHeader && (
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className={clsx(
                    "w-full flex items-center justify-between px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] transition",
                    groupActive
                      ? "text-brand-300"
                      : "text-ink-500 hover:text-ink-300",
                  )}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {groupActive && (
                      <span className="w-1 h-1 rounded-full bg-brand-400 shadow-glow" />
                    )}
                    {group.label}
                  </span>
                  <ChevronDown
                    className={clsx(
                      "w-3 h-3 transition-transform",
                      isOpen ? "rotate-0" : "-rotate-90",
                    )}
                  />
                </button>
              )}
              {collapsed && visibleItems.length > 1 && (
                <div className="my-2 mx-3 h-px bg-white/5" />
              )}
              {(isOpen || collapsed) &&
                visibleItems.map(
                  ({ to, icon: Icon, label, end, premium, highlight }) => (
                    <NavLink
                      key={to}
                      to={to}
                      end={end}
                      onClick={onNavigate}
                      title={collapsed ? label : undefined}
                      className={({ isActive }) =>
                        clsx(
                          "group relative flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium mb-0.5 transition-all duration-200",
                          collapsed && "justify-center px-0",
                          isActive
                            ? "bg-gradient-to-r from-brand-500/20 to-accent-500/10 text-white shadow-inner-glow border border-white/10"
                            : highlight
                              ? "text-accent-300 hover:bg-white/5 hover:text-white"
                              : "text-ink-300 hover:bg-white/5 hover:text-white",
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && !collapsed && (
                            <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md bg-gradient-to-b from-brand-400 to-accent-400 shadow-glow" />
                          )}
                          <span
                            className={clsx(
                              "flex-shrink-0 flex items-center justify-center",
                              collapsed ? "w-9 h-9 rounded-md" : "",
                              isActive && collapsed
                                ? "bg-brand-gradient shadow-glow"
                                : "",
                            )}
                          >
                            <Icon
                              className={clsx(
                                "w-4 h-4",
                                isActive
                                  ? "text-white"
                                  : highlight
                                    ? "text-accent-300"
                                    : "text-ink-400 group-hover:text-white",
                              )}
                            />
                          </span>
                          {!collapsed && (
                            <>
                              <span className="flex-1 truncate">{label}</span>
                              {highlight && !isActive && (
                                <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-accent-500/15 text-accent-300 border border-accent-400/20 font-bold">
                                  New
                                </span>
                              )}
                              {premium && plan !== "scale" && !isActive && (
                                <Crown className="w-3 h-3 text-amber-400" />
                              )}
                            </>
                          )}
                        </>
                      )}
                    </NavLink>
                  ),
                )}
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="relative p-3 border-t border-white/5 bg-black/20">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-gradient rounded-md flex items-center justify-center text-white font-semibold text-sm shadow-glow flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() ||
                user?.email?.[0]?.toUpperCase() ||
                "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name || "You"}
              </p>
              <p className="text-[11px] text-ink-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-md text-ink-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-9 h-9 bg-brand-gradient rounded-md flex items-center justify-center text-white font-semibold text-sm shadow-glow">
              {user?.name?.[0]?.toUpperCase() ||
                user?.email?.[0]?.toUpperCase() ||
                "U"}
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-md text-ink-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

function ChannelIcon({ channel, className = "w-4 h-4" }) {
  if (channel === "whatsapp")
    return <MessageCircle className={clsx(className, "text-emerald-400")} />;
  if (channel === "instagram")
    return <Instagram className={clsx(className, "text-pink-400")} />;
  return <Layers className={clsx(className, "text-violet-400")} />;
}

function channelLabel(c) {
  if (c === "whatsapp") return "WhatsApp";
  if (c === "instagram") return "Instagram";
  return "Both channels";
}

function ChannelOption({ channel, active, connected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "w-full flex items-center justify-between gap-2 px-3 py-2 text-[11px] transition",
        active
          ? "bg-white/10 text-white"
          : "text-ink-300 hover:bg-white/5 hover:text-white",
      )}
    >
      <span className="flex items-center gap-2">
        <ChannelIcon channel={channel} className="w-3.5 h-3.5" />
        <span className="font-semibold">{channelLabel(channel)}</span>
        {!connected && (
          <span className="text-[9px] uppercase tracking-wider text-ink-500">
            Setup
          </span>
        )}
      </span>
      {active && <Check className="w-3.5 h-3.5 text-emerald-400" />}
    </button>
  );
}
