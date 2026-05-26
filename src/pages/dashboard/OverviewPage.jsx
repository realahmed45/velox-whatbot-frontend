/**
 * Botlify Dashboard — Channel-aware control center.
 *
 * Sections:
 *   1. Channel cards     — connect/manage WhatsApp + Instagram
 *   2. Stats row         — messages / contacts / reply rate / triggers
 *   3. Bot Automation    — AI bot
 *   4. Custom Automations — comment-to-DM, story replies, keywords, etc.
 *   5. Tools & Insights  — inbox, contacts, broadcasts, analytics, flow builder, settings, billing
 *
 * Design: rectangular only — no rounded corners. Enterprise-clean.
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
  ArrowRight,
  Zap,
  Send,
  Bot,
  Inbox,
  BarChart2,
  Workflow,
  Hash,
  MessageCircle,
  Heart,
  Share2,
  Link as LinkIcon,
  Radio,
  Target,
  Clock,
  CircleDot,
  Settings as SettingsIcon,
  CreditCard,
  Sparkles,
} from "lucide-react";
import { clsx } from "clsx";
import ActivationCard from "@/components/ActivationCard";

// Custom automation tiles — link directly into AutomationSetupPage
// with the ?tab= query so the tab opens immediately.
const IG_AUTOMATIONS = [
  {
    id: "welcome",
    label: "Welcome DM",
    desc: "First-time DM auto reply",
    icon: MessageCircle,
  },
  {
    id: "comment_kw",
    label: "Comment → DM",
    desc: "Reply to post comments by keyword",
    icon: Hash,
  },
  {
    id: "dm_kw",
    label: "DM keywords",
    desc: "Trigger replies on DM keywords",
    icon: MessageCircle,
  },
  {
    id: "story_reply",
    label: "Story replies",
    desc: "Auto-reply to story responses",
    icon: Heart,
  },
  {
    id: "story_mention",
    label: "Story mentions",
    desc: "Reply when tagged in stories",
    icon: Heart,
  },
  {
    id: "share",
    label: "Share to story",
    desc: "Trigger when post is shared to story",
    icon: Share2,
  },
  {
    id: "ref_url",
    label: "Tracked links",
    desc: "Send DM from referral URL",
    icon: LinkIcon,
  },
  {
    id: "live",
    label: "Live comments",
    desc: "Reply to live broadcast comments",
    icon: Radio,
  },
  {
    id: "starters",
    label: "Chat starters",
    desc: "Ice-breakers in your DM thread",
    icon: Target,
  },
  {
    id: "fallback",
    label: "Fallback reply",
    desc: "Catch-all when no rule matches",
    icon: CircleDot,
  },
  {
    id: "hours",
    label: "Business hours",
    desc: "Respond differently after hours",
    icon: Clock,
  },
];


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

  const ig = workspace?.instagram;
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
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-7">
      {/* Activation checklist (auto-hides when complete or dismissed) */}
      <ActivationCard />

      {/* ── Greeting (no channel toggle — ManyChat-style unified) ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-ink-950">
            Hey, {firstName}
          </h1>
          <p className="text-sm text-ink-500 mt-1">
            {igConnected
              ? "Manage your Instagram account and automations from one place."
              : "Connect Instagram below to start automating."}
          </p>
        </div>
      </div>

      {/* ── Instagram channel card ─── */}
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
        connectDesc="Link your Instagram Business or Creator account."
        onConnect={startIgOAuth}
        onManage={() => navigate("/dashboard/settings")}
      />

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

      {/* ── Bot Automation ────────────────────────────────── */}
      <Section
        title="Bot Automation"
        subtitle="Smart AI replies — train it once, let it handle conversations 24/7."
        accent="ink"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <ActionTile
            icon={Bot}
            title="AI Bot"
            desc="Configure your AI assistant — model, persona, tone, knowledge base."
            to="/dashboard/ai-bot"
            primary
          />
          <ActionTile
            icon={Sparkles}
            title="Test the bot"
            desc="Send a message and see how the AI handles it before going live."
            to="/dashboard/ai-bot?test=1"
          />
          <ActionTile
            icon={Workflow}
            title="Bot flows"
            desc="Build branching conversation flows with the visual builder."
            to="/dashboard/flow-builder"
          />
        </div>
      </Section>

      {/* ── Custom Automations (per connected channel) ─────── */}
      {igConnected && (
        <Section
          title="Instagram Automations"
          subtitle="Comment-to-DM, story replies, keyword triggers, and more."
          accent="pink"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {IG_AUTOMATIONS.map((a) => (
              <ActionTile
                key={`ig-${a.id}`}
                icon={a.icon}
                title={a.label}
                desc={a.desc}
                to={`/dashboard/automation?tab=${a.id}&channel=instagram`}
              />
            ))}
          </div>
        </Section>
      )}


      {/* ── Tools & Insights ──────────────────────────────── */}
      <Section
        title="Tools & Insights"
        subtitle="Inbox, contacts, broadcasts, orders, analytics — everything else you need."
        accent="ink"
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <ActionTile
            icon={Inbox}
            title="Inbox"
            desc="Live conversations"
            to="/dashboard/inbox"
          />
          <ActionTile
            icon={Users}
            title="Contacts"
            desc="Your audience"
            to="/dashboard/contacts"
          />
          <ActionTile
            icon={Send}
            title="Broadcasts"
            desc="Bulk send"
            to="/dashboard/broadcasts"
          />
          <ActionTile
            icon={Sparkles}
            title="Smart Orders"
            desc="AI order capture"
            to="/dashboard/orders"
          />
          <ActionTile
            icon={BarChart2}
            title="Analytics"
            desc="Performance"
            to="/dashboard/analytics"
          />
          <ActionTile
            icon={Workflow}
            title="Flow Builder"
            desc="Visual flows"
            to="/dashboard/flow-builder"
          />
          <ActionTile
            icon={SettingsIcon}
            title="Settings"
            desc="Workspace"
            to="/dashboard/settings"
          />
          <ActionTile
            icon={CreditCard}
            title="Plan & Billing"
            desc="Subscription"
            to="/dashboard/billing"
          />
        </div>
      </Section>

      {/* No "Add another channel" CTA needed — the unified ChannelCards above
          already render a Connect CTA for any disconnected channel. */}
    </div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────
function Section({ title, subtitle, accent = "ink", children }) {
  const bar = {
    pink: "bg-pink-600",
    emerald: "bg-emerald-600",
    ink: "bg-ink-900",
  }[accent];
  return (
    <section>
      <div className="flex items-center gap-2.5 mb-3">
        <span className={clsx("w-1 h-5", bar)} />
        <div>
          <h2 className="text-base font-black text-ink-950 tracking-tight uppercase">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-ink-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

// ─── Channel Card (rectangular) ──────────────────────────────────────────────
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
  onManage,
}) {
  const colorMap = {
    pink: {
      bg: "bg-gradient-to-br from-pink-500 to-rose-600",
      badge: "bg-pink-50 text-pink-700 border-pink-200",
      dot: "bg-pink-500",
      border: "border-pink-200",
      btn: "bg-pink-600 hover:bg-pink-700 text-white",
    },
    green: {
      bg: "bg-gradient-to-br from-emerald-500 to-teal-600",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500",
      border: "border-emerald-200",
      btn: "bg-emerald-600 hover:bg-emerald-700 text-white",
    },
  };
  const c = colorMap[color];

  return (
    <div
      className={clsx(
        "border bg-white p-5 transition-all",
        connected ? c.border : "border-ink-200",
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        {connected && avatar ? (
          <img
            src={avatar}
            alt=""
            className="w-10 h-10 object-cover ring-2 ring-white shadow"
          />
        ) : (
          <div
            className={clsx(
              "w-10 h-10 flex items-center justify-center shadow",
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
              <span className={clsx("w-1.5 h-1.5 animate-pulse", c.dot)} />
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
              "px-2 py-0.5 text-[10px] font-semibold border uppercase tracking-wide",
              c.badge,
            )}
          >
            Active
          </span>
        )}
      </div>

      {connected ? (
        <>
          {stats && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {Object.entries(stats).map(([k, v]) => (
                <div
                  key={k}
                  className="bg-ink-50 border border-ink-100 p-2.5 text-center"
                >
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
          <button
            onClick={onManage}
            className="w-full flex items-center justify-center gap-2 py-2 bg-ink-950 hover:bg-ink-800 text-white text-sm font-semibold transition"
          >
            Manage {name}
            <ArrowRight className="w-4 h-4" />
          </button>
        </>
      ) : (
        <>
          <p className="text-xs text-ink-500 mb-4 leading-relaxed">
            {connectDesc}
          </p>
          <button
            onClick={onConnect}
            className={clsx(
              "w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition",
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

// ─── Stat Card (rectangular) ─────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    violet: "bg-violet-50 text-violet-600 border-violet-100",
    pink: "bg-pink-50 text-pink-600 border-pink-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
  };
  return (
    <div className="border border-ink-200 bg-white p-4">
      <div
        className={clsx(
          "w-8 h-8 flex items-center justify-center mb-3 border",
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

// ─── Action Tile (rectangular) ───────────────────────────────────────────────
function ActionTile({ icon: Icon, title, desc, to, primary }) {
  return (
    <Link
      to={to}
      className={clsx(
        "group flex items-start gap-3 p-4 border bg-white transition-all",
        primary
          ? "border-violet-300 hover:border-violet-500 hover:bg-violet-50/40"
          : "border-ink-200 hover:border-ink-400 hover:bg-ink-50/60",
      )}
    >
      <div
        className={clsx(
          "w-9 h-9 flex items-center justify-center flex-shrink-0 transition-colors",
          primary
            ? "bg-violet-600 text-white"
            : "bg-ink-100 text-ink-600 group-hover:bg-ink-900 group-hover:text-white",
        )}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-ink-900 leading-tight">{title}</p>
        {desc && (
          <p className="text-[11px] text-ink-500 mt-0.5 leading-snug">{desc}</p>
        )}
      </div>
      <ArrowRight className="w-3.5 h-3.5 text-ink-300 group-hover:text-ink-700 mt-1.5 flex-shrink-0 transition-colors" />
    </Link>
  );
}
