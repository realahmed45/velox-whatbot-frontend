/**
 * Instagram Onboarding — simple page that kicks off Meta OAuth.
 * Replaces the legacy 4-step wizard.
 */
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  Instagram,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import api from "@/services/api";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";

export default function InstagramOnboardingPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { workspace, fetchWorkspace } = useWorkspaceStore();
  const { activeWorkspace } = useAuthStore();

  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  // Re-fetch workspace if we just came back from Meta OAuth
  useEffect(() => {
    if (params.get("connected") === "true" && activeWorkspace) {
      fetchWorkspace(activeWorkspace);
    }
    const errParam = params.get("error");
    if (errParam) setError(errParam);
  }, [params, activeWorkspace, fetchWorkspace]);

  const igConnected = workspace?.instagram?.status === "connected";

  const startOAuth = async () => {
    setConnecting(true);
    setError(null);
    try {
      const { data } = await api.get("/instagram/connect/oauth-url");
      window.location.href = data.url;
    } catch (e) {
      setError("Failed to start connection. Please try again.");
      setConnecting(false);
    }
  };

  return (
    <div className="flex items-start justify-center px-4 sm:px-6 py-8 sm:py-12">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-ink-400 hover:text-ink-700 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to dashboard
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 via-rose-500 to-orange-500 flex items-center justify-center shadow-lg">
            <Instagram className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink-900">
              Connect Instagram
            </h1>
            <p className="text-xs text-ink-500">
              {igConnected
                ? "Your account is connected"
                : "Link your Instagram Business or Creator account"}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-ink-100 shadow-sm p-6">
          {igConnected ? (
            <div className="text-center space-y-5 py-2">
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-ink-900">
                  {workspace?.instagram?.username || "Instagram"} connected!
                </h2>
                <p className="text-sm text-ink-500 mt-1">
                  You can now automate DM replies, comments, and broadcasts.
                </p>
              </div>
              <button
                onClick={() => navigate("/dashboard")}
                className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition"
              >
                Go to dashboard
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="rounded-xl bg-pink-50 border border-pink-100 p-4 text-sm text-pink-800">
                <p className="font-semibold mb-1">Before you start:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs text-pink-700">
                  <li>
                    Make sure your Instagram is a <strong>Business</strong> or{" "}
                    <strong>Creator</strong> account
                  </li>
                  <li>
                    Click below — you'll log in to Instagram and grant Botlify
                    permission to manage messages and comments
                  </li>
                </ol>
              </div>

              {error && (
                <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 flex items-start gap-2 text-xs text-rose-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    {error === "no_pages" &&
                      "We couldn't complete the connection. Please try again."}
                    {error === "no_ig_account" &&
                      "We couldn't find an Instagram Business or Creator account. Please switch your account type and try again."}
                    {error === "access_denied" &&
                      "Authorization was cancelled. Please try again."}
                    {!["no_pages", "no_ig_account", "access_denied"].includes(
                      error,
                    ) && "Something went wrong. Please try again."}
                  </span>
                </div>
              )}

              <button
                onClick={startOAuth}
                disabled={connecting}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-sm font-semibold transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {connecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Opening Instagram…
                  </>
                ) : (
                  <>
                    <Instagram className="w-4 h-4" />
                    Connect Instagram
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-ink-400">
                We only request the permissions needed to read messages and post
                replies on your behalf.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
