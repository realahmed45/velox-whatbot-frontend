import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import api from "@/services/api";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import {
  Instagram,
  Zap,
  MessageSquare,
  Users,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Rocket,
  Send,
  Workflow,
  Sparkles,
  BarChart3,
  Inbox,
  Bot,
  Megaphone,
} from "lucide-react";
import WelcomeModal from "@/components/dashboard/WelcomeModal";

function WhatsAppMark({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M19.05 4.91A10 10 0 0 0 4.94 19.04L4 23l4.06-1.06a10 10 0 0 0 14.94-9A9.94 9.94 0 0 0 19.05 4.91zM12 21.02a8 8 0 0 1-4.08-1.12l-.29-.17l-2.41.63l.65-2.35l-.19-.3A8 8 0 1 1 20.02 13a7.94 7.94 0 0 1-8.02 8.02zm4.61-5.83c-.25-.13-1.49-.74-1.72-.82c-.23-.08-.4-.13-.57.13c-.17.25-.65.82-.8 1c-.15.17-.3.19-.55.06c-.25-.13-1.06-.39-2.02-1.24a7.6 7.6 0 0 1-1.4-1.74c-.15-.25 0-.39.11-.51c.11-.11.25-.3.38-.45c.13-.15.17-.25.25-.42c.08-.17 0-.32-.04-.45c-.06-.13-.57-1.38-.78-1.89c-.21-.5-.42-.43-.57-.44h-.49c-.17 0-.45.06-.69.32c-.23.25-.9.88-.9 2.15c0 1.27.92 2.5 1.05 2.67c.13.17 1.81 2.77 4.39 3.88c.61.26 1.09.42 1.46.54c.61.19 1.17.17 1.61.1c.49-.07 1.49-.61 1.7-1.2c.21-.6.21-1.11.15-1.21c-.06-.1-.23-.16-.48-.29z"
      />
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
        no_pages: "No Facebook pages linked to your Business account.",
        no_ig_account: "No Instagram Business account on your Facebook page.",
        invalid_state: "Connection failed. Please try again.",
      };
      toast.error(msgs[error] || "Connection failed. Please try again.");
      setSearchParams({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeWorkspace) return;
    api
      .get("/analytics/overview")
      .then(({ data }) => setStats(data))
      .catch(() => {});
  }, [activeWorkspace]);

  const channel = workspace?.activeChannel || "instagram";
  const igConnected = workspace?.instagram?.status === "connected";
  const waConnected = workspace?.whatsapp?.status === "connected";
  const ig = workspace?.instagram;
  const wa = workspace?.whatsapp;

  const hasTriggers =
    (workspace?.keywordTriggers?.length || 0) > 0 ||
    (workspace?.postCommentTriggers?.length || 0) > 0 ||
    (workspace?.storyReplyTriggers?.length || 0) > 0;
  const automationOn = workspace?.settings?.automationEnabled !== false;

  const showIg = channel === "instagram" || channel === "both";
  const showWa = channel === "whatsapp" || channel === "both";

  const channelConnected =
    (showIg && showWa && igConnected && waConnected) ||
    (showIg && !showWa && igConnected) ||
    (showWa && !showIg && waConnected);

  const steps = [
    {
      id: 1,
      title: "Workspace ready",
      desc: "Account verified.",
      done: true,
    },
    {
      id: 2,
      title:
        showIg && showWa
          ? "Connect WhatsApp & Instagram"
          : showWa
            ? "Connect WhatsApp"
            : "Connect Instagram",
      desc: "Secure Meta-approved login.",
      done: channelConnected,
      cta: "Connect",
      path: "/dashboard/settings",
    },
    {
      id: 3,
      title: "Add your first automation",
      desc: "Pick a keyword, comment trigger or AI reply.",
      done: hasTriggers,
      cta: "Open automations",
      path: "/dashboard/automation",
    },
    {
      id: 4,
      title: "Turn the bot on",
      desc: "Flip the switch to start replying 24/7.",
      done: channelConnected && hasTriggers && automationOn,
      cta: "Go live",
      path: "/dashboard/automation",
    },
  ];
  const completed = steps.filter((s) => s.done).length;
  const onboardingDone =
    workspace?.onboardingCompleted || completed === steps.length;
  const progress = Math.round((completed / steps.length) * 100);

  const startIgOAuth = async () => {
    try {
      const { data } = await api.get("/instagram/connect/oauth-url");
      window.location.href = data.url;
    } catch {
      /* api interceptor toasts the error */
    }
  };

  const firstName = (user?.name || "").split(" ")[0] || "there";

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {!onboardingDone && <WelcomeModal userName={user?.name} />}

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-ink-500">
            Dashboard
          </p>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-ink-950 mt-1">
            Hey, {firstName} 👋
          </h1>
          <p className="text-sm text-ink-500 mt-1">
            {channelConnected
              ? "Your automations are live. Here's what's happening."
              : "Let's get your channel connected and your first automation running."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {showIg && (
            <ChannelStatus
              tone="ig"
              connected={igConnected}
              label={
                igConnected ? `@${ig?.username || "instagram"}` : "Instagram"
              }
              onConnect={startIgOAuth}
            />
          )}
          {showWa && (
            <ChannelStatus
              tone="wa"
              connected={waConnected}
              label={
                waConnected
                  ? wa?.phoneNumber || wa?.displayName || "WhatsApp"
                  : "WhatsApp"
              }
              onConnect={() => navigate("/onboarding/whatsapp")}
            />
          )}
        </div>
      </div>

      {/* ── Onboarding (only if not done) ─────────────────── */}
      {!onboardingDone && (
        <div className="rounded-xl border border-ink-100 bg-white p-5 sm:p-6 shadow-card">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-pink-500 flex items-center justify-center">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-ink-900 text-base">
                  Get live in ~6 minutes
                </h3>
                <p className="text-xs text-ink-500">
                  {completed} of {steps.length} done
                </p>
              </div>
            </div>
            <span className="text-2xl font-black tracking-tighter text-ink-900">
              {progress}%
            </span>
          </div>
          <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden mb-5">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-pink-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {steps.map((s) => (
              <div
                key={s.id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  s.done
                    ? "bg-emerald-50/50 border-emerald-100"
                    : "bg-white border-ink-100 hover:border-ink-300"
                } transition`}
              >
                <div
                  className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${
                    s.done
                      ? "bg-emerald-500 text-white"
                      : "bg-ink-50 text-ink-500"
                  }`}
                >
                  {s.done ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-bold">{s.id}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-bold ${
                      s.done ? "text-ink-400 line-through" : "text-ink-900"
                    }`}
                  >
                    {s.title}
                  </p>
                  {!s.done && (
                    <>
                      <p className="text-xs text-ink-500 mt-0.5">{s.desc}</p>
                      {s.cta && s.path && (
                        <button
                          onClick={() => navigate(s.path)}
                          className="mt-1.5 text-xs font-bold text-ink-900 hover:underline inline-flex items-center gap-1"
                        >
                          {s.cta} <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Stats ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat
          icon={MessageSquare}
          label="Messages sent"
          value={stats?.totalMessages ?? 0}
          accent="emerald"
        />
        <Stat
          icon={Users}
          label="Total contacts"
          value={stats?.totalContacts ?? 0}
          accent="pink"
        />
        <Stat
          icon={TrendingUp}
          label="Reply rate"
          value={stats?.replyRate ? `${stats.replyRate}%` : "—"}
          accent="violet"
        />
        <Stat
          icon={Sparkles}
          label="Active triggers"
          value={
            (workspace?.keywordTriggers?.length || 0) +
            (workspace?.postCommentTriggers?.length || 0) +
            (workspace?.storyReplyTriggers?.length || 0)
          }
          accent="amber"
        />
      </div>

      {/* ── Quick actions ─────────────────────────────────── */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-ink-500 mb-3">
          Quick actions
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Action
            icon={Zap}
            title="Automations"
            desc="Triggers & rules"
            to="/dashboard/automation"
          />
          <Action
            icon={Bot}
            title="AI chatbot"
            desc="Train your bot"
            to="/dashboard/ai-bot"
          />
          <Action
            icon={Workflow}
            title="Flow builder"
            desc="Drag & drop"
            to="/dashboard/flow-builder"
          />
          <Action
            icon={Send}
            title="Broadcasts"
            desc="Mass messages"
            to="/dashboard/broadcasts"
          />
        </div>
      </div>

      {/* ── Discover ─────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-3">
        <Discover
          icon={Inbox}
          title="Inbox"
          desc="Every DM, comment & reply in one place."
          to="/dashboard/inbox"
        />
        <Discover
          icon={BarChart3}
          title="Analytics"
          desc="See what's converting."
          to="/dashboard/analytics"
        />
        <Discover
          icon={Megaphone}
          title="Contacts"
          desc="Tag, segment & target."
          to="/dashboard/contacts"
        />
      </div>
    </div>
  );
}

/* ─── Channel status pill ─── */
function ChannelStatus({ tone, connected, label, onConnect }) {
  const isWa = tone === "wa";
  if (connected) {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border ${
          isWa
            ? "bg-emerald-50 border-emerald-100 text-emerald-800"
            : "bg-pink-50 border-pink-100 text-pink-800"
        } text-xs font-bold`}
      >
        {isWa ? (
          <WhatsAppMark className="w-4 h-4" />
        ) : (
          <Instagram className="w-4 h-4" />
        )}
        <span>{label}</span>
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isWa ? "bg-emerald-500" : "bg-pink-500"
          } animate-pulse`}
        />
      </div>
    );
  }
  return (
    <button
      onClick={onConnect}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border border-dashed ${
        isWa
          ? "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
          : "border-pink-300 text-pink-700 hover:bg-pink-50"
      } text-xs font-bold transition`}
    >
      {isWa ? (
        <WhatsAppMark className="w-4 h-4" />
      ) : (
        <Instagram className="w-4 h-4" />
      )}
      Connect {label}
    </button>
  );
}

/* ─── Stat card ─── */
function Stat({ icon: Icon, label, value, accent }) {
  const tones = {
    emerald: "text-emerald-600 bg-emerald-50",
    pink: "text-pink-600 bg-pink-50",
    violet: "text-violet-600 bg-violet-50",
    amber: "text-amber-600 bg-amber-50",
  };
  return (
    <div className="rounded-xl border border-ink-100 bg-white p-4 shadow-card hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center ${tones[accent]}`}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="mt-3 text-2xl font-black text-ink-950 tracking-tighter">
        {value}
      </p>
      <p className="text-[11px] uppercase font-bold text-ink-500 tracking-wider mt-1">
        {label}
      </p>
    </div>
  );
}

/* ─── Quick action ─── */
function Action({ icon: Icon, title, desc, to }) {
  return (
    <Link
      to={to}
      className="group rounded-xl border border-ink-100 bg-white p-4 shadow-card hover:border-ink-300 hover:shadow-md transition"
    >
      <div className="w-9 h-9 rounded-lg bg-ink-50 group-hover:bg-ink-950 flex items-center justify-center transition-colors">
        <Icon className="w-4 h-4 text-ink-700 group-hover:text-white transition-colors" />
      </div>
      <p className="mt-3 text-sm font-bold text-ink-900">{title}</p>
      <p className="text-xs text-ink-500 mt-0.5">{desc}</p>
    </Link>
  );
}

/* ─── Discover card ─── */
function Discover({ icon: Icon, title, desc, to }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-xl border border-ink-100 bg-white p-4 hover:border-ink-300 transition"
    >
      <div className="w-10 h-10 rounded-lg bg-ink-50 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-ink-700" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-ink-900">{title}</p>
        <p className="text-xs text-ink-500 mt-0.5 truncate">{desc}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-ink-300 group-hover:text-ink-900 group-hover:translate-x-0.5 transition" />
    </Link>
  );
}
