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
  AlertCircle,
  Circle,
  ArrowRight,
  Rocket,
  Send,
  Calendar,
  Workflow,
  Sparkles,
  BarChart3,
  Inbox,
  Hash,
  ExternalLink,
  Play,
} from "lucide-react";

export default function OverviewPage() {
  const { activeWorkspace } = useAuthStore();
  const { workspace, fetchWorkspace } = useWorkspaceStore();
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useAuthStore((s) => s.user);

  /* OAuth callback toasts */
  useEffect(() => {
    const connected = searchParams.get("connected");
    const error = searchParams.get("error");
    if (connected === "true") {
      toast.success("Instagram connected successfully! 🎉");
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

  const isConnected = workspace?.instagram?.status === "connected";
  const ig = workspace?.instagram;

  const hasTriggers =
    (workspace?.keywordTriggers?.length || 0) > 0 ||
    (workspace?.postCommentTriggers?.length || 0) > 0 ||
    (workspace?.storyReplyTriggers?.length || 0) > 0;
  const automationOn = workspace?.settings?.automationEnabled !== false;

  const steps = [
    {
      id: 1,
      title: "Create your workspace",
      done: true,
      cta: null,
      path: null,
    },
    {
      id: 2,
      title: "Connect Instagram",
      done: isConnected,
      cta: "Connect",
      path: "/dashboard/settings",
    },
    {
      id: 3,
      title: "Configure your first trigger",
      done: hasTriggers,
      cta: "Open automation",
      path: "/dashboard/automation",
    },
    {
      id: 4,
      title: "Go live",
      done: isConnected && hasTriggers && automationOn,
      cta: "Enable",
      path: "/dashboard/automation",
    },
  ];
  const completed = steps.filter((s) => s.done).length;
  const onboardingDone =
    workspace?.onboardingCompleted || completed === steps.length;
  const progress = Math.round((completed / steps.length) * 100);

  const startOAuth = async () => {
    try {
      const { data } = await api.get("/instagram/connect/oauth-url");
      window.location.href = data.url;
    } catch {
      /* api interceptor toasts the error */
    }
  };

  const firstName = (user?.name || "").split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* ── Hero / welcome ───────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-pink-600 p-6 sm:p-8 shadow-hero">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-pink-300/20 blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="text-white">
            <p className="text-xs uppercase tracking-[0.25em] font-bold text-white/70 mb-1.5">
              {greeting}
            </p>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Welcome back, {firstName} <span className="inline-block">👋</span>
            </h1>
            <p className="mt-2 text-white/80 text-sm sm:text-base max-w-lg">
              {isConnected
                ? `@${ig?.username} is connected. Botlify is replying to DMs in real time.`
                : "Let's get your Instagram automating in under six minutes."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isConnected && ig?.profilePicture ? (
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20">
                <img
                  src={ig.profilePicture}
                  alt=""
                  className="w-10 h-10 rounded-full ring-2 ring-white/40 object-cover"
                />
                <div className="text-white">
                  <p className="text-sm font-bold leading-tight">
                    @{ig.username}
                  </p>
                  <p className="text-[11px] text-white/70 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />{" "}
                    Live
                  </p>
                </div>
              </div>
            ) : (
              <button
                onClick={startOAuth}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-brand-700 font-semibold text-sm hover:bg-white/90 transition shadow-lg"
              >
                <Instagram className="w-4 h-4" /> Connect Instagram
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Onboarding strip ─────────────────────────────────── */}
      {!onboardingDone && (
        <div className="rounded-3xl border border-brand-100 bg-gradient-to-br from-brand-50/80 via-white to-accent-50/40 p-5 sm:p-7 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-gradient flex items-center justify-center shadow-glow">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-ink-900 text-lg">
                  Finish setting up
                </h3>
                <p className="text-xs text-ink-500">
                  {completed} of {steps.length} steps complete · keep going!
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 bg-clip-text text-transparent">
                {progress}%
              </div>
              <p className="text-[11px] uppercase tracking-wider text-ink-500 font-semibold">
                Complete
              </p>
            </div>
          </div>
          <div className="h-2 bg-ink-100 rounded-full overflow-hidden mb-5">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {steps.map((s) => (
              <div
                key={s.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition ${
                  s.done
                    ? "bg-emerald-50/60 border-emerald-100"
                    : "bg-white border-ink-100 hover:border-brand-200"
                }`}
              >
                {s.done ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-ink-300 flex-shrink-0" />
                )}
                <span
                  className={`text-sm flex-1 ${s.done ? "text-ink-400 line-through" : "text-ink-800 font-medium"}`}
                >
                  {s.title}
                </span>
                {!s.done && s.cta && s.path && (
                  <button
                    onClick={() => navigate(s.path)}
                    className="text-xs font-bold text-brand-700 hover:text-brand-800 inline-flex items-center gap-1"
                  >
                    {s.cta} <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Stats ────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-ink-700 uppercase tracking-wider">
            Performance
          </h2>
          <Link
            to="/dashboard/analytics"
            className="text-xs font-bold text-brand-700 hover:text-brand-800 inline-flex items-center gap-1"
          >
            View analytics <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            icon={MessageSquare}
            label="DMs sent"
            value={stats?.totalMessages ?? 0}
            gradient="from-indigo-500 to-violet-500"
            spark={[40, 60, 50, 75, 65, 90, 100]}
          />
          <StatCard
            icon={Users}
            label="Total contacts"
            value={stats?.totalContacts ?? 0}
            gradient="from-pink-500 to-rose-500"
            spark={[20, 35, 45, 50, 65, 75, 90]}
          />
          <StatCard
            icon={TrendingUp}
            label="Reply rate"
            value={stats?.replyRate ? `${stats.replyRate}%` : "—"}
            gradient="from-emerald-500 to-teal-500"
            spark={[55, 60, 70, 65, 80, 85, 95]}
          />
          <StatCard
            icon={Sparkles}
            label="Active triggers"
            value={
              (workspace?.keywordTriggers?.length || 0) +
              (workspace?.postCommentTriggers?.length || 0) +
              (workspace?.storyReplyTriggers?.length || 0)
            }
            gradient="from-amber-500 to-orange-500"
            spark={[30, 40, 50, 60, 65, 70, 80]}
          />
        </div>
      </div>

      {/* ── Quick actions ────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-bold text-ink-700 uppercase tracking-wider mb-4">
          Quick actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <QuickAction
            icon={Zap}
            title="Setup automation"
            desc="Triggers, keywords, welcome DMs"
            to="/dashboard/automation"
            gradient="from-indigo-500 to-violet-500"
          />
          <QuickAction
            icon={Workflow}
            title="Build a flow"
            desc="Drag-and-drop conversation builder"
            to="/dashboard/flow-builder"
            gradient="from-pink-500 to-rose-500"
          />
          <QuickAction
            icon={Send}
            title="Send broadcast"
            desc="Mass DM your contacts"
            to="/dashboard/broadcasts"
            gradient="from-emerald-500 to-teal-500"
          />
          <QuickAction
            icon={Calendar}
            title="Schedule post"
            desc="Plan IG posts & stories"
            to="/dashboard/scheduled-posts"
            gradient="from-amber-500 to-orange-500"
          />
        </div>
      </div>

      {/* ── Discover row ─────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-4 sm:gap-5">
        <DiscoverCard
          icon={Inbox}
          title="Unified inbox"
          desc="Every comment, DM and story-reply in one place. Assign and resolve."
          to="/dashboard/inbox"
        />
        <DiscoverCard
          icon={BarChart3}
          title="Analytics"
          desc="See which trigger drives sales and which ad delivered each lead."
          to="/dashboard/analytics"
        />
        <DiscoverCard
          icon={Hash}
          title="Hashtag tracker"
          desc="Monitor your brand hashtags and auto-DM mentions."
          to="/dashboard/hashtags"
        />
      </div>

      {/* ── Help banner ──────────────────────────────────────── */}
      <div className="rounded-3xl border border-ink-100 bg-white p-6 sm:p-7 shadow-card flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500 flex items-center justify-center shadow-md">
          <Play className="w-6 h-6 text-white fill-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-ink-900 text-base">
            New to Botlify? Watch the 60-second tour.
          </h3>
          <p className="text-sm text-ink-500 mt-1">
            From connecting Instagram to your first auto-reply — in plain
            English.
          </p>
        </div>
        <a href="mailto:support@botlify.site" className="btn-secondary text-sm">
          Contact support
        </a>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 * Sub-components
 * ──────────────────────────────────────────────────────────── */

function StatCard({ icon: Icon, label, value, gradient, spark }) {
  const max = Math.max(...spark);
  return (
    <div className="relative overflow-hidden rounded-2xl border border-ink-100 bg-white p-5 shadow-card hover:shadow-glow hover:-translate-y-0.5 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex items-end gap-0.5 h-8 opacity-70">
          {spark.map((h, i) => (
            <div
              key={i}
              className={`w-1 rounded-t bg-gradient-to-t ${gradient}`}
              style={{ height: `${(h / max) * 100}%` }}
            />
          ))}
        </div>
      </div>
      <p className="text-2xl sm:text-3xl font-black text-ink-900 tracking-tight">
        {value}
      </p>
      <p className="text-[11px] sm:text-xs text-ink-500 mt-0.5 uppercase tracking-wider font-semibold">
        {label}
      </p>
    </div>
  );
}

function QuickAction({ icon: Icon, title, desc, to, gradient }) {
  return (
    <Link
      to={to}
      className="group relative overflow-hidden rounded-2xl border border-ink-100 bg-white p-5 shadow-card hover:shadow-glow hover:-translate-y-1 transition-all duration-300"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500" />
      <div
        className={`relative w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h3 className="relative mt-4 font-bold text-ink-900 text-sm">{title}</h3>
      <p className="relative text-xs text-ink-500 mt-1 leading-relaxed">
        {desc}
      </p>
      <ArrowRight className="relative w-4 h-4 text-ink-300 mt-3 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
    </Link>
  );
}

function DiscoverCard({ icon: Icon, title, desc, to }) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-ink-100 bg-white p-5 sm:p-6 shadow-card hover:border-brand-200 hover:shadow-glow transition-all"
    >
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-gradient transition-colors">
          <Icon className="w-5 h-5 text-brand-600 group-hover:text-white transition-colors" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-ink-900 text-sm flex items-center justify-between gap-2">
            {title}
            <ArrowRight className="w-4 h-4 text-ink-300 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
          </h3>
          <p className="text-xs text-ink-500 mt-1 leading-relaxed">{desc}</p>
        </div>
      </div>
    </Link>
  );
}
