/**
 * Botlify Sidebar — simplified, clean, 3-colour theme
 * Violet (#8b5cf6) · Rose (#ec4899) · Ink/Slate (neutral)
 */
import { NavLink, useNavigate, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Zap,
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
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { clsx } from "clsx";

// ─── Navigation ────────────────────────────────────────────────────────────
const MAIN_NAV = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/dashboard/inbox", icon: Inbox, label: "Inbox" },
  { to: "/dashboard/contacts", icon: Users, label: "Contacts" },
  { to: "/dashboard/automation", icon: Zap, label: "Automation" },
  { to: "/dashboard/flow-builder", icon: Workflow, label: "Flow Builder" },
  { to: "/dashboard/broadcasts", icon: Send, label: "Broadcasts" },
  { to: "/dashboard/ai-bot", icon: Bot, label: "AI Bot" },
  { to: "/dashboard/analytics", icon: BarChart2, label: "Analytics" },
];

const BOTTOM_NAV = [
  { to: "/dashboard/billing", icon: CreditCard, label: "Plan & Billing" },
  { to: "/dashboard/settings", icon: SettingsIcon, label: "Settings" },
];

const COLLAPSE_KEY = "botlify-sidebar-collapsed";

export default function Sidebar({ onNavigate }) {
  const { logout, user } = useAuthStore();
  const { workspace } = useWorkspaceStore();
  const navigate = useNavigate();

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

  // Plan / usage
  const plan = workspace?.subscription?.plan || "free";
  const usage = useMemo(() => {
    const used = workspace?.usage?.messagesThisMonth || 0;
    const limit = workspace?.usage?.messagesLimit || 500;
    const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
    return { used, limit, pct };
  }, [workspace]);

  const igConnected = workspace?.instagram?.status === "connected";
  const waConnected = workspace?.whatsapp?.status === "connected";
  const igHandle = workspace?.instagram?.username;
  const waNumber =
    workspace?.whatsapp?.phoneNumber || workspace?.whatsapp?.displayName;

  const isPremium = [
    "wa_pro",
    "bundle_pro",
    "bundle_business",
    "ig_pro",
    "scale",
  ].includes(plan);

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
        collapsed ? "w-[68px]" : "w-[220px]",
      )}
    >
      {/* Subtle violet glow at top */}
      <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full bg-violet-500/10 blur-3xl" />

      {/* ── Logo ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between h-14 px-3.5 border-b border-white/[0.06] flex-shrink-0">
        <Link
          to="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-2.5 min-w-0"
        >
          {/* Logo mark */}
          <span className="w-8 h-8 flex-shrink-0 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg">
            <Bot className="w-4 h-4 text-white" />
          </span>
          {!collapsed && (
            <span className="font-bold text-white text-sm tracking-tight">
              Botlify
            </span>
          )}
        </Link>
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="hidden lg:flex w-7 h-7 items-center justify-center rounded-md text-white/30 hover:text-white hover:bg-white/8 transition"
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? (
            <ChevronsRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronsLeft className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* ── Channel status pills ───────────────────────────────── */}
      {!collapsed && (
        <div className="px-3 pt-3 flex gap-1.5 flex-shrink-0">
          <ChannelPill
            icon={Instagram}
            label={igConnected ? `@${igHandle}` : "Instagram"}
            connected={igConnected}
            onClick={() => {
              onNavigate?.();
              navigate(
                igConnected
                  ? "/dashboard/settings#instagram"
                  : "/dashboard/onboarding/instagram",
              );
            }}
          />
          <ChannelPill
            icon={MessageSquare}
            label={waConnected ? waNumber || "WhatsApp" : "WhatsApp"}
            connected={waConnected}
            onClick={() => {
              onNavigate?.();
              navigate(
                waConnected
                  ? "/dashboard/automation"
                  : "/dashboard/onboarding/whatsapp",
              );
            }}
          />
        </div>
      )}
      {collapsed && (
        <div className="px-1.5 pt-2 space-y-1 flex-shrink-0">
          <button
            title={
              igConnected ? `Instagram: @${igHandle}` : "Connect Instagram"
            }
            onClick={() =>
              navigate(
                igConnected
                  ? "/dashboard/settings#instagram"
                  : "/dashboard/onboarding/instagram",
              )
            }
            className="w-full flex items-center justify-center"
          >
            <span
              className={clsx(
                "w-8 h-8 rounded-md flex items-center justify-center",
                igConnected
                  ? "bg-pink-500/20 text-pink-400"
                  : "bg-white/5 text-white/30",
              )}
            >
              <Instagram className="w-3.5 h-3.5" />
            </span>
          </button>
          <button
            title={
              waConnected
                ? `WhatsApp: ${waNumber || "connected"}`
                : "Connect WhatsApp"
            }
            onClick={() =>
              navigate(
                waConnected ? "/dashboard" : "/dashboard/onboarding/whatsapp",
              )
            }
            className="w-full flex items-center justify-center"
          >
            <span
              className={clsx(
                "w-8 h-8 rounded-md flex items-center justify-center",
                waConnected
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-white/5 text-white/30",
              )}
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </span>
          </button>
        </div>
      )}

      {/* ── Main nav ──────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {MAIN_NAV.map((item) => (
          <SidebarLink
            key={item.to}
            {...item}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      {/* ── Bottom section ────────────────────────────────────── */}
      <div className="px-2 pb-2 space-y-0.5 border-t border-white/[0.06] pt-2 flex-shrink-0">
        {/* Usage bar */}
        {!collapsed && (
          <div className="px-2 py-2 mb-1">
            <div className="flex justify-between text-[10px] text-white/30 mb-1">
              <span className="flex items-center gap-1">
                {isPremium && <Crown className="w-3 h-3 text-amber-400" />}
                <span className="capitalize">{planLabel(plan)}</span>
              </span>
              <span>{usage.pct}%</span>
            </div>
            <div className="h-1 rounded-full bg-white/10 overflow-hidden">
              <div
                className={clsx(
                  "h-full rounded-full transition-all",
                  usage.pct > 90
                    ? "bg-red-500"
                    : usage.pct > 70
                      ? "bg-amber-400"
                      : "bg-gradient-to-r from-violet-500 to-pink-500",
                )}
                style={{ width: `${usage.pct}%` }}
              />
            </div>
          </div>
        )}

        {BOTTOM_NAV.map((item) => (
          <SidebarLink
            key={item.to}
            {...item}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}

        {/* User + logout */}
        <div
          className={clsx(
            "mt-1 flex items-center gap-2.5 px-2 py-2 rounded-md",
            "text-white/40 text-xs",
            collapsed && "justify-center",
          )}
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-[10px] text-white font-bold flex-shrink-0">
            {initial}
          </div>
          {!collapsed && (
            <span className="flex-1 truncate min-w-0 text-white/50">
              {user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "You"}
            </span>
          )}
          <button
            onClick={handleLogout}
            title="Sign out"
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-white/30 hover:text-rose-400 hover:bg-white/5 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function SidebarLink({ to, icon: Icon, label, end, collapsed, onNavigate }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        clsx(
          "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-medium transition-all duration-150",
          collapsed && "justify-center px-0 w-full",
          isActive
            ? "bg-violet-500/15 text-violet-300 shadow-[inset_0_0_0_1px_rgba(139,92,246,0.25)]"
            : "text-white/40 hover:text-white/80 hover:bg-white/5",
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={clsx(
              "flex-shrink-0",
              collapsed &&
                "w-9 h-9 flex items-center justify-center rounded-md",
              collapsed && isActive && "bg-violet-500/20",
            )}
          >
            <Icon
              className={clsx("w-4 h-4", isActive ? "text-violet-400" : "")}
            />
          </span>
          {!collapsed && <span>{label}</span>}
        </>
      )}
    </NavLink>
  );
}

function ChannelPill({ icon: Icon, label, connected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "flex-1 flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[11px] font-medium transition",
        connected
          ? "bg-white/8 text-white/70 hover:bg-white/12 border border-white/10"
          : "bg-white/4 text-white/25 hover:text-white/50 hover:bg-white/8 border border-white/5 border-dashed",
      )}
    >
      <span
        className={clsx(
          "w-1.5 h-1.5 rounded-full flex-shrink-0",
          connected ? "bg-emerald-400" : "bg-white/20",
        )}
      />
      <Icon className="w-3 h-3 flex-shrink-0" />
      <span className="truncate">{connected ? label : "Connect"}</span>
    </button>
  );
}

function planLabel(id) {
  const map = {
    free: "Free trial",
    ig_starter: "IG Starter",
    ig_pro: "IG Pro",
    wa_starter: "WA Starter",
    wa_pro: "WA Pro",
    bundle_pro: "Bundle Pro",
    bundle_business: "Business",
    starter: "Starter",
    growth: "Growth",
    scale: "Scale",
  };
  return map[id] || id;
}
