/**
 * Instagram Onboarding — connect the account, then a quick "teach your bot"
 * step, then into the app. (Shopify removed; Zernio-based connect.)
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
  ShieldCheck,
  MessageCircle,
  Zap,
  Bot,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/services/api";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";

export default function InstagramOnboardingPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { workspace, fetchWorkspace } = useWorkspaceStore();
  const { activeWorkspace, user, setActiveWorkspace } = useAuthStore();

  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [siteUrl, setSiteUrl] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [ensuring, setEnsuring] = useState(!activeWorkspace);

  // A workspace is created deliberately here (not at signup). The first time an
  // owner reaches onboarding without one, create/return their workspace so the
  // rest of the flow (connecting Instagram) has something to attach to.
  useEffect(() => {
    let alive = true;
    if (activeWorkspace) {
      setEnsuring(false);
      return;
    }
    (async () => {
      try {
        const { data } = await api.post("/workspaces/ensure", {
          name: user?.name ? `${user.name}'s Workspace` : undefined,
        });
        if (!alive) return;
        setActiveWorkspace(data.workspace._id);
        fetchWorkspace(data.workspace._id);
      } catch (e) {
        if (alive)
          toast.error(
            e?.response?.data?.message || "Couldn't set up your workspace",
          );
      } finally {
        if (alive) setEnsuring(false);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWorkspace]);

  const saveBusinessProfile = async () => {
    const url = siteUrl.trim();
    if (!url || savingProfile) return;
    setSavingProfile(true);
    try {
      await api.post(`/workspaces/${activeWorkspace}/ai-knowledge/import-url`, {
        url,
      });
      setProfileSaved(true);
      toast.success("We're learning your business — nice!");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Could not read that website");
    } finally {
      setSavingProfile(false);
    }
  };

  useEffect(() => {
    if (params.get("connected") === "true" && activeWorkspace) {
      fetchWorkspace(activeWorkspace);
    }
    const errParam = params.get("error");
    if (errParam) setError(errParam);
  }, [params, activeWorkspace, fetchWorkspace]);

  const igConnected = workspace?.instagram?.status === "connected";

  // Once Instagram is connected, onboarding is done — go straight to the
  // dashboard. No intermediate "teach your bot / add your site" step; users
  // add their site + knowledge later from the AI Bot page.
  useEffect(() => {
    if (igConnected) navigate("/dashboard", { replace: true });
  }, [igConnected, navigate]);

  if (ensuring) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-7 h-7 text-brand-500 animate-spin" />
      </div>
    );
  }

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
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-ink-400 hover:text-ink-700 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Skip to dashboard
          </Link>
          {/* step dots */}
          <div className="flex items-center gap-1.5">
            <span
              className={`w-6 h-1.5 rounded-full ${igConnected ? "bg-emerald-400" : "bg-brand-500"}`}
            />
            <span
              className={`w-6 h-1.5 rounded-full ${igConnected ? "bg-brand-500" : "bg-ink-200"}`}
            />
          </div>
        </div>

        {!igConnected ? (
          /* ── Step 1: connect ─────────────────────────────────── */
          <>
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 via-rose-500 to-orange-500 flex items-center justify-center shadow-lg mx-auto mb-4">
                <Instagram className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-black text-ink-900">
                Connect Instagram
              </h1>
              <p className="text-sm text-ink-500 mt-1.5">
                One click to bring your DMs into Botlify.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-ink-100 shadow-lg p-6 sm:p-7 space-y-5">
              {/* what you'll get */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: MessageCircle, label: "Auto-reply DMs" },
                  { icon: Zap, label: "Comment → DM" },
                  { icon: Bot, label: "AI answers" },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="rounded-xl border border-ink-100 bg-ink-50/50 p-3 text-center"
                  >
                    <Icon className="w-5 h-5 text-brand-500 mx-auto mb-1.5" />
                    <p className="text-[11px] font-semibold text-ink-600 leading-tight">
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-ink-100 bg-ink-50/60 p-4">
                <p className="text-xs font-bold text-ink-700 mb-2">
                  Two quick things:
                </p>
                <ul className="space-y-2 text-sm text-ink-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
                    Your Instagram must be a{" "}
                    <span className="font-semibold text-ink-900">
                      Business or Creator
                    </span>{" "}
                    account.
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
                    You'll log in on Instagram and approve Botlify.
                  </li>
                </ul>
              </div>

              {error && (
                <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 flex items-start gap-2 text-xs text-rose-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    {error === "no_ig_account"
                      ? "We couldn't find a Business/Creator account. Switch your account type in the Instagram app, then try again."
                      : error === "access_denied"
                        ? "Authorization was cancelled. Please try again."
                        : error === "already_connected"
                          ? "This Instagram account is already connected to another Botlify account. Disconnect it there first, then try again."
                          : "Something went wrong. Please try again."}
                  </span>
                </div>
              )}

              <button
                onClick={startOAuth}
                disabled={connecting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 text-white text-sm font-bold shadow-sm transition hover:brightness-105 hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {connecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Opening
                    Instagram…
                  </>
                ) : (
                  <>
                    <Instagram className="w-4 h-4" /> Connect Instagram
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-ink-400 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                We only request permission to read messages and reply on your
                behalf.
              </p>
            </div>
          </>
        ) : (
          /* ── Step 2: teach your bot ───────────────────────────── */
          <>
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
              </div>
              <h1 className="text-2xl font-black text-ink-900">
                @{workspace?.instagram?.username || "Instagram"} connected 🎉
              </h1>
              <p className="text-sm text-ink-500 mt-1.5">
                Last step — teach your bot about your business.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-ink-100 shadow-lg p-6 sm:p-7 space-y-5">
              <div className="rounded-xl border border-brand-100 bg-brand-50/50 p-4">
                <p className="font-bold text-sm text-ink-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-brand-500" /> Learn from your
                  website
                </p>
                <p className="text-xs text-ink-500 mt-1 mb-3">
                  Paste your site and we'll pull in your products, prices and FAQs
                  so replies sound like you. (Optional — you can add this later
                  on the AI Bot page.)
                </p>
                {profileSaved ? (
                  <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Got it — your bot is
                    learning your business.
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Globe className="w-4 h-4 text-ink-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        className="w-full rounded-xl border border-ink-200 pl-8 pr-3 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition"
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
                      className="px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 whitespace-nowrap transition"
                    >
                      {savingProfile ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Learn"
                      )}
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => navigate("/dashboard")}
                className="w-full py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold transition flex items-center justify-center gap-2"
              >
                Go to my dashboard →
              </button>
              <p className="text-center text-[11px] text-ink-400">
                You can fine-tune everything from the sidebar anytime.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
