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

// Custom automation tiles per channel — link directly into AutomationSetupPage
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

const WA_AUTOMATIONS = [
  {
    id: "welcome",
    label: "Welcome message",
    desc: "First message a contact gets",
    icon: MessageCircle,
  },
  {
    id: "dm_kw",
    label: "Keyword auto-reply",
    desc: "Reply when message matches keyword",
    icon: Hash,
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
  const { workspace, fetchWorkspace, setActiveChannel } = useWorkspaceStore();
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
  const activeChannel = workspace?.activeChannel || "instagram";
  const channelLabel = activeChannel === "whatsapp" ? "WhatsApp" : "Instagram";
  const channelAccent = activeChannel === "whatsapp" ? "emerald" : "pink";

  const startIgOAuth = async () => {
    try {
      const { data } = await api.get("/instagram/connect/oauth-url");
      window.location.href = data.url;
    } catch {
      toast.error("Could not start Instagram connection. Try again.");
    }
  };

  const switchTo = async (channel) => {
    try {
      await setActiveChannel(channel);
    } catch {
      toast.error("Could not switch dashboard");
    }
  };

  const automations =
    activeChannel === "whatsapp" ? WA_AUTOMATIONS : IG_AUTOMATIONS;

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-7">
      {/* Activation checklist (auto-hides when complete or dismissed) */}
      <ActivationCard />

      {/* ── Greeting + active channel ─────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-ink-950">
            Hey, {firstName}
          </h1>
          <p className="text-sm text-ink-500 mt-1">
            {igConnected || waConnected
              ? `Viewing ${channelLabel} dashboard. Switch channels from the top bar.`
              : "Connect a channel below to start automating."}
          </p>
        </div>
        {(igConnected || waConnected) && (
          <div className="inline-flex items-center border border-ink-200 bg-white">
            <ChannelToggle
              icon={Instagram}
              label="Instagram"
              active={activeChannel === "instagram"}
              connected={igConnected}
              onClick={() => switchTo("instagram")}
              accent="pink"
            />
            <span className="w-px h-7 bg-ink-200" />
            <ChannelToggle
              icon={MessageSquare}
              label="WhatsApp"
              active={activeChannel === "whatsapp"}
              connected={waConnected}
              onClick={() => switchTo("whatsapp")}
              accent="emerald"
            />
          </div>
        )}
      </div>

      {/* ── Channel cards ─────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-4">
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
          onManage={() => switchTo("instagram")}
        />

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
          onManage={() => switchTo("whatsapp")}
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

      {/* ── Bot Automation ────────────────────────────────── */}
      <Section
        title="Bot Automation"
        subtitle={`Smart AI replies for ${channelLabel} — train it once, let it handle conversations 24/7.`}
        accent={channelAccent}
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

      {/* ── Custom Automations ────────────────────────────── */}
      <Section
        title="Custom Automations"
        subtitle={`Rule-based triggers for ${channelLabel} — keywords, comments, story replies and more.`}
        accent={channelAccent}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {automations.map((a) => (
            <ActionTile
              key={a.id}
              icon={a.icon}
              title={a.label}
              desc={a.desc}
              to={`/dashboard/automation?tab=${a.id}`}
            />
          ))}
        </div>
      </Section>

      {/* ── Tools & Insights ──────────────────────────────── */}
      <Section
        title="Tools & Insights"
        subtitle="Inbox, contacts, broadcasts, analytics — everything else you need."
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

// ─── Channel Toggle (rectangular pill pair) ──────────────────────────────────
function ChannelToggle({
  icon: Icon,
  label,
  active,
  connected,
  onClick,
  accent,
}) {
  const styles = {
    pink: {
      activeBg: "bg-pink-600 text-white",
      idle: "text-pink-700 hover:bg-pink-50",
    },
    emerald: {
      activeBg: "bg-emerald-600 text-white",
      idle: "text-emerald-700 hover:bg-emerald-50",
    },
  }[accent];
  return (
    <button
      onClick={onClick}
      disabled={!connected}
      className={clsx(
        "flex items-center gap-2 px-4 py-2 text-xs font-semibold transition",
        active ? styles.activeBg : styles.idle,
        !connected && "opacity-40 cursor-not-allowed",
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
      {connected && (
        <span
          className={clsx(
            "w-1.5 h-1.5",
            active ? "bg-white" : "bg-emerald-500",
          )}
        />
      )}
    </button>
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
