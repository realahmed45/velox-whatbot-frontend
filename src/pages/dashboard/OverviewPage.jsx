/**
 * Botlify Dashboard – clean overview with two channel control cards
 */
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import api from "@/services/api";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import {
  Instagram,
  MessageSquare,
  Users,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Zap,
  Send,
  Bot,
  Inbox,
  BarChart2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { clsx } from "clsx";

function WhatsAppIcon({ className = "w-5 h-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden
    >
      <path d="M19.05 4.91A10 10 0 0 0 4.94 19.04L4 23l4.06-1.06a10 10 0 0 0 14.94-9A9.94 9.94 0 0 0 19.05 4.91zM12 21.02a8 8 0 0 1-4.08-1.12l-.29-.17-2.41.63.65-2.35-.19-.3A8 8 0 1 1 20.02 13a7.94 7.94 0 0 1-8.02 8.02zm4.61-5.83c-.25-.13-1.49-.74-1.72-.82-.23-.08-.4-.13-.57.13-.17.25-.65.82-.8 1-.15.17-.3.19-.55.06-.25-.13-1.06-.39-2.02-1.24a7.6 7.6 0 0 1-1.4-1.74c-.15-.25 0-.39.11-.51.11-.11.25-.3.38-.45.13-.15.17-.25.25-.42.08-.17 0-.32-.04-.45-.06-.13-.57-1.38-.78-1.89-.21-.5-.42-.43-.57-.44h-.49c-.17 0-.45.06-.69.32-.23.25-.9.88-.9 2.15 0 1.27.92 2.5 1.05 2.67.13.17 1.81 2.77 4.39 3.88.61.26 1.09.42 1.46.54.61.19 1.17.17 1.61.1.49-.07 1.49-.61 1.7-1.2.21-.6.21-1.11.15-1.21-.06-.1-.23-.16-.48-.29z" />
    </svg>
  );
}

export default function OverviewPage() {
  const { activeWorkspace } = useAuthStore();
  const { workspace, fetchWorkspace } = useWorkspaceStore();
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useAuthStore((s) => s.user);

  // Handle OAuth redirects back from Instagram/Meta
  useEffect(() => {
    const connected = searchParams.get("connected");
    const error = searchParams.get("error");
    if (connected === "true") {
      toast.success("Instagram connected successfully!");
      fetchWorkspace(activeWorkspace);
      setSearchParams({});
    } else if (error) {
      const msgs = {
        cancelled: "Instagram connection was cancelled.",
        no_pages: "We couldn't complete the connection. Please try again.",
        no_ig_account:
          "We couldn't find an Instagram Business or Creator account on your profile.",
        invalid_state: "Connection failed — please try again.",
      };
      toast.error(
        msgs[error] || "Instagram connection failed. Please try again.",
      );
      setSearchParams({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeWorkspace) return;
    api
      .get("/analytics/overview")
      .then(({ data }) => setStats(data?.overview || data))
      .catch(() => {});
  }, [activeWorkspace]);

  const igConnected = workspace?.instagram?.status === "connected";
  const waConnected =
    workspace?.whatsapp?.status === "connected" ||
    (workspace?.whatsapp?.type && workspace.whatsapp.type !== "none");

  const ig = workspace?.instagram;
  const wa = workspace?.whatsapp;
  const firstName = (user?.name || "").split(" ")[0] || "there";

  const startIgOAuth = async () => {
    try {
      const { data } = await api.get("/instagram/connect/oauth-url");
      window.location.href = data.url;
    } catch {
      toast.error("Could not start Instagram connection. Try again.");
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
      {/* ── Greeting ──────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-ink-950">
          Hey, {firstName} 👋
        </h1>
        <p className="text-sm text-ink-500 mt-1">
          {igConnected || waConnected
            ? "Your automations are running. Here's a quick overview."
            : "Connect your channels below to start automating."}
        </p>
      </div>

      {/* ── Channel cards ─────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Instagram */}
        <ChannelCard
          name="Instagram"
          icon={Instagram}
          color="pink"
          connected={igConnected}
          connectedLabel={ig?.username ? `@${ig.username}` : "Connected"}
          avatar={ig?.profilePicture}
          stats={
            igConnected
              ? {
                  messages: stats?.igMessages ?? stats?.totalMessages ?? "—",
                  followers: ig?.followersCount ?? "—",
                }
              : null
          }
          connectLabel="Connect Instagram"
          connectDesc="Link your Instagram Business or Creator account via Facebook."
          onConnect={startIgOAuth}
          manageLink="/dashboard/automation"
        />

        {/* WhatsApp */}
        <ChannelCard
          name="WhatsApp"
          icon={WhatsAppIcon}
          color="green"
          connected={waConnected}
          connectedLabel={wa?.phoneNumber || wa?.displayName || "Connected"}
          stats={
            waConnected
              ? {
                  messages: stats?.waMessages ?? stats?.totalMessages ?? "—",
                  contacts: stats?.totalContacts ?? "—",
                }
              : null
          }
          connectLabel="Connect WhatsApp"
          connectDesc="Connect your number in 2 minutes using Botlify Quick Connect."
          onConnect={() => navigate("/dashboard/onboarding/whatsapp")}
          manageLink="/dashboard/automation"
        />
      </div>

      {/* ── Stats row ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={MessageSquare}
          label="Messages"
          value={stats?.totalMessages ?? 0}
          color="violet"
        />
        <StatCard
          icon={Users}
          label="Contacts"
          value={stats?.totalContacts ?? 0}
          color="pink"
        />
        <StatCard
          icon={TrendingUp}
          label="Reply rate"
          value={stats?.replyRate ? `${stats.replyRate}%` : "—"}
          color="emerald"
        />
        <StatCard
          icon={Zap}
          label="Active triggers"
          value={
            (workspace?.keywordTriggers?.length || 0) +
            (workspace?.postCommentTriggers?.length || 0)
          }
          color="amber"
        />
      </div>

      {/* ── Quick actions ─────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-3">
          Quick actions
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickAction
            icon={Zap}
            label="Automation"
            to="/dashboard/automation"
          />
          <QuickAction icon={Inbox} label="Inbox" to="/dashboard/inbox" />
          <QuickAction
            icon={Send}
            label="Broadcasts"
            to="/dashboard/broadcasts"
          />
          <QuickAction icon={Bot} label="AI Bot" to="/dashboard/ai-bot" />
        </div>
      </div>
    </div>
  );
}

// ─── Channel Card ────────────────────────────────────────────────────────────
function ChannelCard({
  name,
  icon: Icon,
  color,
  connected,
  connectedLabel,
  avatar,
  stats,
  connectLabel,
  connectDesc,
  onConnect,
  manageLink,
}) {
  const colorMap = {
    pink: {
      bg: "bg-gradient-to-br from-pink-500 to-rose-600",
      badge: "bg-pink-50 text-pink-700 border-pink-100",
      dot: "bg-pink-500",
      border: "border-pink-100 hover:border-pink-200",
      btn: "bg-pink-600 hover:bg-pink-700 text-white",
      dashed: "border-dashed border-pink-200",
    },
    green: {
      bg: "bg-gradient-to-br from-emerald-500 to-teal-600",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
      dot: "bg-emerald-500",
      border: "border-emerald-100 hover:border-emerald-200",
      btn: "bg-emerald-600 hover:bg-emerald-700 text-white",
      dashed: "border-dashed border-emerald-200",
    },
  };
  const c = colorMap[color];

  return (
    <div
      className={clsx(
        "rounded-xl border bg-white p-5 shadow-card transition-all",
        connected ? c.border : "border-ink-100 hover:border-ink-200",
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        {/* Icon / avatar */}
        {connected && avatar ? (
          <img
            src={avatar}
            alt=""
            className="w-10 h-10 rounded-lg object-cover ring-2 ring-white shadow"
          />
        ) : (
          <div
            className={clsx(
              "w-10 h-10 rounded-lg flex items-center justify-center shadow",
              c.bg,
            )}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-ink-900 text-sm">{name}</h3>
          {connected ? (
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={clsx(
                  "w-1.5 h-1.5 rounded-full animate-pulse",
                  c.dot,
                )}
              />
              <span className="text-xs text-ink-500 truncate">
                {connectedLabel}
              </span>
            </div>
          ) : (
            <span className="text-xs text-ink-400">Not connected</span>
          )}
        </div>
        {connected && (
          <span
            className={clsx(
              "px-2 py-0.5 rounded-full text-[10px] font-semibold border",
              c.badge,
            )}
          >
            Active
          </span>
        )}
      </div>

      {connected ? (
        <>
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {Object.entries(stats).map(([k, v]) => (
                <div key={k} className="bg-ink-50 rounded-lg p-2.5 text-center">
                  <p className="text-lg font-black text-ink-900">
                    {typeof v === "number" ? v.toLocaleString() : v}
                  </p>
                  <p className="text-[10px] font-semibold text-ink-400 uppercase tracking-wide">
                    {k}
                  </p>
                </div>
              ))}
            </div>
          )}
          <Link
            to={manageLink}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-ink-950 hover:bg-ink-800 text-white text-sm font-semibold transition"
          >
            Manage {name}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </>
      ) : (
        <>
          <p className="text-xs text-ink-500 mb-4 leading-relaxed">
            {connectDesc}
          </p>
          <button
            onClick={onConnect}
            className={clsx(
              "w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition",
              c.btn,
            )}
          >
            {connectLabel}
            <ArrowRight className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    violet: "bg-violet-50 text-violet-600",
    pink: "bg-pink-50 text-pink-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <div className="rounded-xl border border-ink-100 bg-white p-4 shadow-card">
      <div
        className={clsx(
          "w-8 h-8 rounded-lg flex items-center justify-center mb-3",
          colors[color],
        )}
      >
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-2xl font-black text-ink-950">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      <p className="text-[11px] font-semibold text-ink-400 uppercase tracking-wider mt-0.5">
        {label}
      </p>
    </div>
  );
}

// ─── Quick Action ────────────────────────────────────────────────────────────
function QuickAction({ icon: Icon, label, to }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-2.5 p-3 rounded-xl border border-ink-100 bg-white hover:border-violet-200 hover:bg-violet-50/30 shadow-card transition-all"
    >
      <div className="w-8 h-8 rounded-lg bg-ink-50 group-hover:bg-violet-100 flex items-center justify-center transition-colors flex-shrink-0">
        <Icon className="w-4 h-4 text-ink-500 group-hover:text-violet-600 transition-colors" />
      </div>
      <span className="text-sm font-semibold text-ink-700 group-hover:text-ink-900 transition-colors">
        {label}
      </span>
    </Link>
  );
}
