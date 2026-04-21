import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
} from "lucide-react";

export default function OverviewPage() {
  const { activeWorkspace } = useAuthStore();
  const { workspace, fetchWorkspace } = useWorkspaceStore();
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Handle OAuth callback params
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
        no_pages:
          "No Facebook pages found. Make sure you have a linked Business/Creator account.",
        no_ig_account:
          "No Instagram Business account found on your Facebook page.",
        invalid_state: "Connection failed. Please try again.",
      };
      toast.error(msgs[error] || "Connection failed. Please try again.");
      setSearchParams({});
    }
  }, []);

  useEffect(() => {
    if (!activeWorkspace) return;
    api
      .get("/analytics/overview")
      .then(({ data }) => setStats(data))
      .catch(() => {});
  }, [activeWorkspace]);

  const isConnected = workspace?.instagram?.status === "connected";

  // Onboarding wizard steps
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
      cta: "Connect now",
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
      cta: "Enable automation",
      path: "/dashboard/automation",
    },
  ];
  const completedCount = steps.filter((s) => s.done).length;
  const onboardingDone =
    workspace?.onboardingCompleted || completedCount === steps.length;

  const startOAuth = async () => {
    try {
      const { data } = await api.get("/instagram/connect/oauth-url");
      window.location.href = data.url;
    } catch {
      // handled by api interceptor
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-ink-900">
          Dashboard
        </h1>
        <p className="text-ink-500 text-xs sm:text-sm mt-1">
          Manage your Instagram DM automation
        </p>
      </div>

      {/* Onboarding wizard */}
      {!onboardingDone && (
        <div className="card p-5 mb-4 sm:mb-6 bg-gradient-to-br from-brand-50 to-white border-brand-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center shadow-glow">
                <Rocket className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-ink-900">Get started</h3>
                <p className="text-xs text-ink-500">
                  {completedCount} of {steps.length} steps completed
                </p>
              </div>
            </div>
            <div className="text-sm font-semibold text-brand-700">
              {Math.round((completedCount / steps.length) * 100)}%
            </div>
          </div>
          <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-brand-gradient transition-all"
              style={{ width: `${(completedCount / steps.length) * 100}%` }}
            />
          </div>
          <div className="space-y-2">
            {steps.map((s) => (
              <div
                key={s.id}
                className={`flex items-center gap-3 p-2 rounded-lg ${
                  s.done ? "bg-white/60" : "bg-white"
                }`}
              >
                {s.done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-ink-300 flex-shrink-0" />
                )}
                <span
                  className={`text-sm flex-1 ${
                    s.done
                      ? "text-ink-400 line-through"
                      : "text-ink-800 font-medium"
                  }`}
                >
                  {s.title}
                </span>
                {!s.done && s.cta && s.path && (
                  <button
                    onClick={() => navigate(s.path)}
                    className="btn-primary text-xs gap-1"
                  >
                    {s.cta} <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instagram connection status */}
      <div
        className={`rounded-xl sm:rounded-2xl p-4 sm:p-5 mb-4 sm:mb-6 border-2 ${isConnected ? "border-green-200 bg-green-50" : "border-brand-200 bg-brand-50"}`}
      >
        <div className="flex items-center gap-3 mb-3">
          {isConnected && workspace.instagram?.profilePicture ? (
            <img
              src={workspace.instagram.profilePicture}
              alt=""
              className="w-10 h-10 rounded-full border-2 border-green-300 object-cover flex-shrink-0"
            />
          ) : isConnected ? (
            <div className="w-10 h-10 rounded-full bg-green-100 border-2 border-green-300 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-brand-600" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm sm:text-base text-gray-900 truncate">
              {isConnected
                ? `@${workspace.instagram.username}`
                : "Not Connected"}
            </p>
            <p className="text-xs text-gray-500">
              {isConnected
                ? "Auto-DM on incoming messages & comments"
                : "Connect to start"}
            </p>
          </div>
        </div>
        {!isConnected && (
          <button
            onClick={startOAuth}
            className="w-full flex items-center justify-center gap-2 bg-brand-gradient text-white font-semibold py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:shadow-glow transition text-sm sm:text-base"
          >
            <Instagram className="w-4 h-4" />
            <span className="hidden sm:inline">
              Connect Instagram Business Account
            </span>
            <span className="sm:hidden">Connect Instagram</span>
          </button>
        )}
      </div>

      {/* Main actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <button
          onClick={() => navigate("/dashboard/automation")}
          className="group p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 border-brand-200 bg-brand-50 hover:border-brand-400 hover:bg-brand-100 transition text-left"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-brand-gradient rounded-lg sm:rounded-xl shadow-glow flex items-center justify-center mb-2 sm:mb-3">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <p className="font-bold text-sm sm:text-base text-gray-900">
            Setup Automation
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Edit greeting & follow-up messages
          </p>
        </button>

        <button
          onClick={() => navigate("/dashboard/analytics")}
          className="group p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 border-blue-200 bg-blue-50 hover:border-blue-400 hover:bg-blue-100 transition text-left"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <p className="font-bold text-sm sm:text-base text-gray-900">
            Analytics
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Track DMs sent, replies, and growth
          </p>
        </button>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[
            {
              label: "DMs Sent",
              value: stats.totalMessages ?? 0,
              icon: MessageSquare,
              color: "text-blue-600",
            },
            {
              label: "Contacts",
              value: stats.totalContacts ?? 0,
              icon: Users,
              color: "text-brand-600",
            },
            {
              label: "Reply Rate",
              value: stats.replyRate ? `${stats.replyRate}%` : "—",
              icon: TrendingUp,
              color: "text-green-600",
            },
          ].map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="bg-white rounded-lg sm:rounded-xl border border-gray-100 p-3 sm:p-4 text-center"
            >
              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 ${color}`} />
              <p className="text-lg sm:text-xl font-bold text-gray-900">
                {value}
              </p>
              <p className="text-[10px] sm:text-xs text-gray-400">{label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
