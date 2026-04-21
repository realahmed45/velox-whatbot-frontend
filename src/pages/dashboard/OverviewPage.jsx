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
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Dashboard
        </h1>
        <p className="text-gray-500 text-xs sm:text-sm mt-1">
          Manage your Instagram DM automation
        </p>
      </div>

      {/* Instagram connection status */}
      <div
        className={`rounded-xl sm:rounded-2xl p-4 sm:p-5 mb-4 sm:mb-6 border-2 ${isConnected ? "border-green-200 bg-green-50" : "border-pink-200 bg-pink-50"}`}
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
            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-pink-500" />
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
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:opacity-90 transition text-sm sm:text-base"
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
          className="group p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 border-purple-200 bg-purple-50 hover:border-purple-400 hover:bg-purple-100 transition text-left"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3">
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
              color: "text-purple-600",
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
