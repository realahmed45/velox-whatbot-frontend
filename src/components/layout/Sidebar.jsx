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
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import Logo from "@/components/Logo";
import { clsx } from "clsx";

const GROUPS = [
  {
    id: "overview",
    label: "Overview",
    items: [
      { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", end: true },
    ],
  },
  {
    id: "automate",
    label: "Automate",
    items: [
      { to: "/dashboard/automation", icon: Zap, label: "Automation" },
      { to: "/dashboard/flow-builder", icon: Workflow, label: "Flow Builder" },
    ],
  },
  {
    id: "engage",
    label: "Engage",
    items: [
      { to: "/dashboard/inbox", icon: Inbox, label: "Inbox" },
      { to: "/dashboard/contacts", icon: Users, label: "Contacts" },
      { to: "/dashboard/broadcasts", icon: Send, label: "Broadcasts" },
      { to: "/dashboard/drip-campaigns", icon: Droplet, label: "Drip Campaigns" },
      { to: "/dashboard/giveaways", icon: Gift, label: "Giveaways" },
    ],
  },
  {
    id: "content",
    label: "Content",
    items: [
      { to: "/dashboard/scheduled-posts", icon: Calendar, label: "Scheduled Posts" },
      { to: "/dashboard/link-in-bio", icon: Link2, label: "Link in Bio" },
      { to: "/dashboard/ai-bot", icon: Sparkles, label: "AI Bot", premium: true },
    ],
  },
  {
    id: "grow",
    label: "Grow",
    items: [
      { to: "/dashboard/analytics", icon: BarChart2, label: "Analytics" },
      { to: "/dashboard/competitors", icon: Target, label: "Competitors" },
      { to: "/dashboard/hashtags", icon: Hash, label: "Hashtags", premium: true },
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

function loadCollapsed() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

export default function Sidebar({ onNavigate }) {
  const { logout, user } = useAuthStore();
  const { workspace } = useWorkspaceStore();
  const navigate = useNavigate();
  const location = useLocation();
  const plan = workspace?.subscription?.plan || "starter";
  const isConnected = workspace?.instagram?.status === "connected";
  const [collapsed, setCollapsed] = useState(loadCollapsed);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collapsed));
  }, [collapsed]);

  const toggleGroup = (id) =>
    setCollapsed((c) => ({ ...c, [id]: !c[id] }));

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isGroupActive = (items) =>
    items.some((i) =>
      i.end
        ? location.pathname === i.to
        : location.pathname.startsWith(i.to),
    );

  return (
    <aside className="w-60 flex-shrink-0 bg-white border-r border-ink-100 flex flex-col h-full">
      <div className="h-16 flex items-center px-4 border-b border-ink-100">
        <Link to="/dashboard" onClick={onNavigate}>
          <Logo size="sm" />
        </Link>
      </div>

      {workspace && (
        <div className="px-4 py-3 border-b border-ink-100">
          <p className="text-xs text-ink-400 truncate font-medium uppercase tracking-wider">
            {workspace.name}
          </p>
          <div className="mt-1 flex items-center justify-between">
            <span
              className={clsx(
                "inline-flex items-center gap-1 text-xs font-medium",
                isConnected ? "text-emerald-600" : "text-ink-400",
              )}
            >
              <span
                className={clsx(
                  "w-1.5 h-1.5 rounded-full",
                  isConnected ? "bg-emerald-500" : "bg-ink-300",
                )}
              />
              {isConnected ? "IG Connected" : "Not connected"}
            </span>
            <span
              className={clsx(
                "chip text-[10px] capitalize",
                plan === "scale"
                  ? "bg-accent-100 text-accent-700"
                  : plan === "growth"
                    ? "bg-brand-100 text-brand-700"
                    : "bg-ink-100 text-ink-600",
              )}
            >
              {plan}
            </span>
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-1">
        {GROUPS.map((group) => {
          const isOpen = !collapsed[group.id] || isGroupActive(group.items);
          return (
            <div key={group.id}>
              {group.items.length > 1 && (
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-400 hover:text-ink-600 transition"
                >
                  <span>{group.label}</span>
                  <ChevronDown
                    className={clsx(
                      "w-3.5 h-3.5 transition-transform",
                      isOpen ? "rotate-0" : "-rotate-90",
                    )}
                  />
                </button>
              )}
              {isOpen &&
                group.items.map(({ to, icon: Icon, label, end, premium }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      clsx(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium mb-0.5 transition-all",
                        isActive
                          ? "bg-brand-gradient text-white shadow-sm"
                          : "text-ink-600 hover:bg-ink-50 hover:text-ink-900",
                      )
                    }
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1">{label}</span>
                    {premium && plan !== "scale" && (
                      <Sparkles className="w-3 h-3 text-accent-500" />
                    )}
                  </NavLink>
                ))}
            </div>
          );
        })}
      </nav>

      <div className="p-3 border-t border-ink-100">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-9 h-9 bg-brand-gradient rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-glow">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink-800 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-ink-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded text-ink-400 hover:text-red-500 hover:bg-red-50 transition"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
