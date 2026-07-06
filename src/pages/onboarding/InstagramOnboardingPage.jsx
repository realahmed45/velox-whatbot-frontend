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
  Sparkles,
  Globe,
  ShoppingBag,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/services/api";
import ShopifyConnect from "@/components/integrations/ShopifyConnect";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";

export default function InstagramOnboardingPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { workspace, fetchWorkspace } = useWorkspaceStore();
  const { activeWorkspace } = useAuthStore();

  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [siteUrl, setSiteUrl] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const saveBusinessProfile = async () => {
    const url = siteUrl.trim();
    if (!url || savingProfile) return;
    setSavingProfile(true);
    try {
      await api.post(`/workspaces/${activeWorkspace}/ai-knowledge/import-url`, {
        url,
      });
      setProfileSaved(true);
      toast.success("Business profile saved");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Could not save your profile");
    } finally {
      setSavingProfile(false);
    }
  };

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
      setError(
        e.response?.data?.message ||
          "Failed to start connection. Please try again.",
      );
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

        <div className="bg-white rounded-2xl border border-ink-100 shadow-lg p-6 sm:p-7">
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
                  Set up your business profile so automated replies sound like
                  you.
                </p>
              </div>

              <div className="text-left bg-brand-50/50 border border-brand-100 p-4 rounded-xl">
                <p className="font-bold text-sm text-ink-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-brand-500" /> Business
                  profile
                </p>
                <p className="text-xs text-ink-500 mt-1 mb-3">
                  Enter your website — we&apos;ll use it to personalize your
                  automated replies.
                </p>
                {profileSaved ? (
                  <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Profile saved — you can
                    update this anytime in settings.
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Globe className="w-4 h-4 text-ink-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        className="input w-full !pl-8 text-sm"
                        value={siteUrl}
                        onChange={(e) => setSiteUrl(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && saveBusinessProfile()
                        }
                        placeholder="yourbrand.com"
                        disabled={savingProfile}
                      />
                    </div>
                    <button
                      onClick={saveBusinessProfile}
                      disabled={savingProfile || !siteUrl.trim()}
                      className="!py-2 !px-3 rounded-xl bg-ink-900 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 whitespace-nowrap"
                    >
                      {savingProfile ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Continue"
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div className="text-left border border-emerald-100 bg-emerald-50/50 p-4 rounded-xl">
                <p className="font-bold text-sm text-ink-900 flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-emerald-600" /> Shopify
                </p>
                <p className="text-xs text-ink-500 mt-1 mb-3">
                  Optional — connect if you sell through Shopify.
                </p>
                <ShopifyConnect
                  compact
                  connected={!!workspace?.integrations?.shopify?.storeUrl}
                  storeUrl={workspace?.integrations?.shopify?.storeUrl}
                  orderTracking={
                    !!workspace?.integrations?.shopify?.scopes?.orders
                  }
                  showManageLink={false}
                  onConnected={() => fetchWorkspace(activeWorkspace)}
                />
              </div>

              <button
                onClick={() => navigate("/onboarding/pricing")}
                className="btn-primary w-full rounded-xl"
              >
                Continue
              </button>
              <button
                type="button"
                onClick={() => navigate("/onboarding/pricing")}
                className="text-xs text-ink-400 hover:text-ink-600"
              >
                Skip for now
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="rounded-xl border border-ink-100 bg-ink-50/60 p-5">
                <p className="text-sm font-semibold text-ink-900 mb-3">
                  Before you start
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 w-6 h-6 rounded-full bg-white border border-ink-200 flex items-center justify-center text-xs font-bold text-ink-500 flex-shrink-0">
                      1
                    </span>
                    <p className="text-sm text-ink-600 leading-relaxed">
                      Make sure your Instagram is a{" "}
                      <span className="font-semibold text-ink-900">
                        Business
                      </span>{" "}
                      or{" "}
                      <span className="font-semibold text-ink-900">
                        Creator
                      </span>{" "}
                      account.
                    </p>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 w-6 h-6 rounded-full bg-white border border-ink-200 flex items-center justify-center text-xs font-bold text-ink-500 flex-shrink-0">
                      2
                    </span>
                    <p className="text-sm text-ink-600 leading-relaxed">
                      Click below to log in to Instagram and grant Botlify
                      permission to manage your messages and comments.
                    </p>
                  </li>
                </ul>
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
                className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 text-white text-sm font-semibold shadow-sm transition hover:brightness-105 hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
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

              <p className="text-[11px] text-center text-ink-400 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
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
