/**
 * Botlify Dashboard — Channel-aware control center.
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
  Settings as SettingsIcon,
  CreditCard,
  Sparkles,
  ShoppingBag,
  Link as LinkIcon,
  Webhook,
  CalendarClock,
  Droplet,
  Gift,
  Eye,
  UserPlus,
  ShoppingCart,
  Users2,
} from "lucide-react";
import { clsx } from "clsx";

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
    <div className="relative min-h-full">
      {/* Ambient glass backdrop — soft orange glows the cards refract over */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 right-0 w-[40rem] h-[40rem] rounded-full bg-brand-200/40 blur-[130px]" />
        <div className="absolute top-1/3 -left-24 w-[32rem] h-[32rem] rounded-full bg-amber-200/30 blur-[130px]" />
        <div className="absolute bottom-0 right-1/4 w-[28rem] h-[28rem] rounded-full bg-brand-100/40 blur-[130px]" />
      </div>

      <div className="relative p-4 sm:p-8 max-w-6xl mx-auto space-y-7">
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
        color="brand"
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
          color="brand"
        />
        <StatCard
          icon={Users}
          label="Contacts"
          value={stats?.totalContacts ?? 0}
          color="brand"
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

      {/* ── Automation ────────────────────────────────────── */}
      <Section
        title="Automation"
        subtitle="AI replies, smart triggers, and visual conversation flows."
        accent="ink"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <ActionTile
            icon={Bot}
            title="AI Bot"
            desc="Configure your AI — persona, tone, knowledge base."
            to="/dashboard/ai-bot"
            primary
          />
          <ActionTile
            icon={Zap}
            title="Smart Automations"
            desc="Comment-to-DM, story replies, keywords, welcome messages."
            to="/dashboard/automation"
          />
          <ActionTile
            icon={Workflow}
            title="Custom Flows"
            desc="Visual drag-and-drop multi-step conversation builder."
            to="/dashboard/flows"
          />
        </div>
      </Section>

      {/* ── Management ────────────────────────────────────── */}
      <Section
        title="Management"
        subtitle="Everything you need to manage conversations and your audience."
        accent="ink"
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <ActionTile icon={Inbox} title="Inbox" desc="Live conversations" to="/dashboard/inbox" />
          <ActionTile icon={Users} title="Contacts" desc="Your audience" to="/dashboard/contacts" />
          <ActionTile icon={ShoppingCart} title="Orders" desc="AI order capture" to="/dashboard/orders" />
          <ActionTile icon={Send} title="Broadcasts" desc="Bulk messages" to="/dashboard/broadcasts" />
          <ActionTile icon={BarChart2} title="Analytics" desc="Performance" to="/dashboard/analytics" />
        </div>
      </Section>

      {/* ── Grow ──────────────────────────────────────────── */}
      <Section
        title="Grow"
        subtitle="Tools to grow your audience, nurture leads, and boost engagement."
        accent="emerald"
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <ActionTile icon={CalendarClock} title="Scheduled Posts" desc="Plan your content" to="/dashboard/scheduled-posts" />
          <ActionTile icon={Droplet} title="Drip Campaigns" desc="Automated sequences" to="/dashboard/drip" />
          <ActionTile icon={Gift} title="Giveaways" desc="Run contests" to="/dashboard/giveaways" />
          <ActionTile icon={LinkIcon} title="Link in Bio" desc="Smart bio page" to="/dashboard/link-in-bio" />
          <ActionTile icon={Hash} title="Hashtags" desc="Track hashtags" to="/dashboard/hashtags" />
          <ActionTile icon={Eye} title="Competitors" desc="Monitor rivals" to="/dashboard/competitors" />
          <ActionTile icon={UserPlus} title="Referrals" desc="Referral program" to="/dashboard/referral" />
        </div>
      </Section>

      {/* ── Integrations ─────────────────────────────────── */}
      <Section
        title="Integrations"
        subtitle="Connect Shopify, Make.com, Mailchimp, and more."
        accent="ink"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ActionTile
            icon={ShoppingBag}
            title="Apps"
            desc="Connect Shopify, Mailchimp, Make.com and other tools."
            to="/dashboard/apps"
          />
          <ActionTile
            icon={Webhook}
            title="Webhooks"
            desc="Send Botlify events to Zapier, Make, or any custom endpoint."
            to="/dashboard/integrations"
          />
        </div>
      </Section>

      {/* ── Settings ─────────────────────────────────────── */}
      <Section
        title="Settings"
        subtitle="Manage your team, workspace, and subscription."
        accent="ink"
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <ActionTile icon={Users2} title="Team" desc="Invite & manage members" to="/dashboard/team" />
          <ActionTile icon={CreditCard} title="Plan & Billing" desc="Subscription" to="/dashboard/billing" />
          <ActionTile icon={SettingsIcon} title="Settings" desc="Workspace config" to="/dashboard/settings" />
        </div>
      </Section>

    </div>
    </div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────
function Section({ title, subtitle, accent = "ink", children }) {
  const bar = {
    brand: "bg-brand-500",
    emerald: "bg-emerald-600",
    ink: "bg-ink-900",
  }[accent] || "bg-ink-900";
  return (
    <section>
      <div className="flex items-center gap-2.5 mb-3">
        <span className={clsx("w-1 h-5 rounded-full", bar)} />
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
    brand: {
      bg: "bg-gradient-to-br from-brand-400 to-brand-600",
      badge: "bg-brand-50 text-brand-700 border-brand-200",
      dot: "bg-brand-500",
      border: "border-brand-200",
      btn: "bg-brand-500 hover:bg-brand-600 text-white",
    },
    green: {
      bg: "bg-gradient-to-br from-emerald-500 to-teal-600",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500",
      border: "border-emerald-200",
      btn: "bg-emerald-600 hover:bg-emerald-700 text-white",
    },
  };
  const c = colorMap[color] || colorMap.brand;

  return (
    <div
      className={clsx(
        "rounded-2xl border bg-white/70 backdrop-blur-xl p-5 shadow-glass transition-all",
        connected ? c.border : "border-white/60",
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        {connected && avatar ? (
          <img
            src={avatar}
            alt=""
            className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow"
          />
        ) : (
          <div
            className={clsx(
              "w-10 h-10 rounded-xl flex items-center justify-center shadow",
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
              <span className={clsx("w-1.5 h-1.5 rounded-full animate-pulse", c.dot)} />
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
              "px-2 py-0.5 rounded-full text-[10px] font-semibold border uppercase tracking-wide",
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
                  className="rounded-lg bg-white/50 border border-white/60 p-2.5 text-center"
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
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-ink-950 hover:bg-ink-800 text-white text-sm font-semibold transition"
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
              "w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition shadow-glow",
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
    brand: "bg-brand-50 text-brand-600 border-brand-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
  };
  return (
    <div className="rounded-xl border border-white/60 bg-white/60 backdrop-blur-xl p-4 shadow-glass hover:bg-white/80 transition-colors">
      <div
        className={clsx(
          "w-9 h-9 rounded-lg flex items-center justify-center mb-3 border",
          colors[color] || colors.brand,
        )}
      >
        <Icon className="w-[18px] h-[18px]" />
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
        "group flex items-start gap-3 p-4 rounded-xl border bg-white/60 backdrop-blur-xl shadow-glass transition-all",
        primary
          ? "border-brand-300/70 hover:border-brand-500 hover:bg-white/85 hover:shadow-glow"
          : "border-white/60 hover:border-brand-300 hover:bg-white/85",
      )}
    >
      <div
        className={clsx(
          "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
          primary
            ? "bg-brand-500 text-white"
            : "bg-brand-50 text-brand-500 group-hover:bg-brand-500 group-hover:text-white",
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
