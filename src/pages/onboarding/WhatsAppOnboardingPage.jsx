/**
 * WhatsApp Onboarding - Embedded-signup flow (Botlify Cloud Pro)
 *
 * Two paths offered to the user:
 *   1. "Use my own WhatsApp number"  - opens upstream embedded signup,
 *      customer authorizes their existing business number, returns connected.
 *   2. "Get a free instant number"   - upstream provisions a US WhatsApp
 *      number for them in seconds. No verification.
 *
 * The same page also handles the post-signup redirect: when the user is
 * sent back here with `?status=completed&phone_number_id=...` we finalize
 * the connection on the backend and show success.
 */
import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  MessageSquare,
  ArrowLeft,
  Check,
  Loader2,
  CreditCard,
  Phone,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";

const FAILURE_MESSAGES = {
  facebook_auth_failed: "Facebook login was cancelled. You can try again.",
  phone_verification_failed:
    "Phone verification failed. Please try again or use a different number.",
  waba_limit_reached:
    "This number has reached the maximum allowed WhatsApp Business accounts.",
  token_exchange_failed: "Authorization failed. Please try again.",
  link_expired: "This connection link expired. Please start over.",
  already_used:
    "This connection link has already been used. Please start over.",
};

export default function WhatsAppOnboardingPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeWorkspace } = useAuthStore();
  const { fetchWorkspace } = useWorkspaceStore();

  const callbackStatus = searchParams.get("status"); // completed | failed | undefined
  const phoneNumberIdParam = searchParams.get("phone_number_id");
  const businessAccountIdParam = searchParams.get("business_account_id");
  const displayPhoneNumberParam = searchParams.get("display_phone_number");
  const errorCodeParam = searchParams.get("error_code");

  // 'choose' | 'redirecting' | 'finalizing' | 'done' | 'failed' | 'upgrade'
  const [phase, setPhase] = useState(() => {
    if (callbackStatus === "completed") return "finalizing";
    if (callbackStatus === "failed") return "failed";
    return "choose";
  });
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Run finalize call once when we land back from upstream signup
  useEffect(() => {
    if (phase !== "finalizing") return;
    let cancelled = false;
    (async () => {
      if (!phoneNumberIdParam) {
        setErrorMessage(
          "We couldn't read the connection details. Please try connecting again.",
        );
        setPhase("failed");
        return;
      }
      try {
        await api.post("/whatsapp/connect/finalize", {
          phoneNumberId: phoneNumberIdParam,
          businessAccountId: businessAccountIdParam || undefined,
          displayPhoneNumber: displayPhoneNumberParam
            ? decodeURIComponent(displayPhoneNumberParam)
            : undefined,
        });
        if (cancelled) return;
        if (activeWorkspace) await fetchWorkspace(activeWorkspace);
        setPhase("done");
        // Clean the URL so refresh doesn't re-finalize
        setSearchParams({}, { replace: true });
      } catch (err) {
        if (cancelled) return;
        setErrorMessage(
          err.response?.data?.message ||
            "Could not finalize your connection. Please try again.",
        );
        setPhase("failed");
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const stepIndex = useMemo(() => {
    if (phase === "done") return 3;
    if (phase === "redirecting" || phase === "finalizing") return 2;
    return 1;
  }, [phase]);

  const startConnect = async ({ instant }) => {
    setBusy(true);
    setErrorMessage(null);
    try {
      const { data } = await api.post("/whatsapp/connect/provision", {
        instant: !!instant,
      });
      if (!data?.redirectUrl) {
        throw new Error("Missing redirect URL");
      }
      setPhase("redirecting");
      // Hand off to upstream embedded signup
      window.location.assign(data.redirectUrl);
    } catch (err) {
      const code = err.response?.data?.code;
      if (err.response?.status === 402 || code === "PLAN_UPGRADE_REQUIRED") {
        setPhase("upgrade");
      } else {
        setErrorMessage(
          err.response?.data?.message ||
            "Could not start the connection. Please try again.",
        );
        toast.error(
          err.response?.data?.message ||
            "Could not start the connection. Please try again.",
        );
      }
    } finally {
      setBusy(false);
    }
  };

  if (phase === "upgrade") {
    return (
      <UpgradePrompt
        onBilling={() => navigate("/dashboard/billing")}
        onBack={() => setPhase("choose")}
      />
    );
  }

  return (
    <div className="flex items-start justify-center px-4 sm:px-6 py-8 sm:py-12">
      <div className="w-full max-w-2xl">
        {/* Header bar */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-ink-400 hover:text-ink-700 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to dashboard
          </Link>
          <div className="flex gap-2">
            {[1, 2, 3].map((n) => (
              <span
                key={n}
                className={`w-6 h-1.5 rounded-full transition-colors ${stepIndex >= n ? "bg-emerald-500" : "bg-ink-200"}`}
              />
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink-900">Connect WhatsApp</h1>
            <p className="text-xs text-ink-500">
              {phase === "choose" &&
                "Choose how you'd like to set up your WhatsApp number"}
              {phase === "redirecting" && "Opening the secure setup page..."}
              {phase === "finalizing" && "Almost done - finishing setup..."}
              {phase === "done" && "WhatsApp connected successfully!"}
              {phase === "failed" && "Something went wrong"}
            </p>
          </div>
        </div>

        {phase === "choose" && (
          <ChooseStep busy={busy} onStart={startConnect} />
        )}

        {phase === "redirecting" && <RedirectingStep />}

        {phase === "finalizing" && <FinalizingStep />}

        {phase === "done" && (
          <DoneStep onFinish={() => navigate("/dashboard")} />
        )}

        {phase === "failed" && (
          <FailedStep
            message={
              errorMessage ||
              FAILURE_MESSAGES[errorCodeParam] ||
              "We couldn't complete your WhatsApp setup."
            }
            onRetry={() => {
              setSearchParams({}, { replace: true });
              setErrorMessage(null);
              setPhase("choose");
            }}
          />
        )}
      </div>
    </div>
  );
}

// --- Step 1: Choose path ----------------------------------------------------

function ChooseStep({ busy, onStart }) {
  return (
    <div className="space-y-4">
      {/* Path A - bring own number */}
      <button
        type="button"
        disabled={busy}
        onClick={() => onStart({ instant: false })}
        className="group w-full text-left bg-white rounded-2xl border border-ink-100 hover:border-emerald-300 hover:shadow-md transition p-5 sm:p-6 disabled:opacity-60 disabled:cursor-wait"
      >
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
            <Phone className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-semibold text-ink-900">
                Use my own WhatsApp number
              </h3>
              <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                Recommended
              </span>
            </div>
            <p className="text-xs sm:text-sm text-ink-500 mt-1">
              Connect your existing business number. You'll log in with Facebook
              and verify ownership with a one-time code. Takes about
              2&nbsp;minutes.
            </p>
            <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-y-1 text-[11px] text-ink-500">
              <li className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-emerald-500" /> Official
                WhatsApp Cloud
              </li>
              <li className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-emerald-500" /> No bans, no
                QR drops
              </li>
              <li className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-emerald-500" /> Broadcasts
                & templates
              </li>
              <li className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-emerald-500" /> Phone can
                be offline
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-4 sm:mt-5 flex items-center justify-end">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 group-hover:text-emerald-800">
            {busy ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Starting...
              </>
            ) : (
              <>Connect via Facebook →</>
            )}
          </span>
        </div>
      </button>

      {/* Path B - instant number */}
      <button
        type="button"
        disabled={busy}
        onClick={() => onStart({ instant: true })}
        className="group w-full text-left bg-white rounded-2xl border border-ink-100 hover:border-violet-300 hover:shadow-md transition p-5 sm:p-6 disabled:opacity-60 disabled:cursor-wait"
      >
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-violet-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base font-semibold text-ink-900">
              Get a free instant number
            </h3>
            <p className="text-xs sm:text-sm text-ink-500 mt-1">
              We'll provision a brand-new US WhatsApp number for you in about
              5&nbsp;seconds. Great for testing, agencies, or B2B outreach. No
              Facebook account needed.
            </p>
            <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-y-1 text-[11px] text-ink-500">
              <li className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-violet-500" /> Live in
                seconds
              </li>
              <li className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-violet-500" /> No
                verification
              </li>
              <li className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-violet-500" /> US dial code
                (+1)
              </li>
              <li className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-violet-500" /> Full API
                access
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-4 sm:mt-5 flex items-center justify-end">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 group-hover:text-violet-800">
            {busy ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Starting...
              </>
            ) : (
              <>Get instant number →</>
            )}
          </span>
        </div>
      </button>

      <p className="text-[11px] text-ink-400 text-center pt-2">
        Both options use the official WhatsApp Cloud platform. Your number won't
        get banned and stays online 24/7.
      </p>
    </div>
  );
}

// --- Step 2a: Redirecting away ----------------------------------------------

function RedirectingStep() {
  return (
    <div className="bg-white rounded-2xl border border-ink-100 shadow-sm p-8 text-center space-y-4">
      <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
      <div>
        <h2 className="text-lg font-semibold text-ink-900">
          Opening secure setup...
        </h2>
        <p className="text-sm text-ink-500 mt-1">
          You'll be redirected to a secure page to authorize your WhatsApp
          number. This page will reload once you're done.
        </p>
      </div>
    </div>
  );
}

// --- Step 2b: Finalizing after redirect back --------------------------------

function FinalizingStep() {
  return (
    <div className="bg-white rounded-2xl border border-ink-100 shadow-sm p-8 text-center space-y-4">
      <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
      <div>
        <h2 className="text-lg font-semibold text-ink-900">
          Wrapping things up...
        </h2>
        <p className="text-sm text-ink-500 mt-1">
          We're connecting your number to your workspace. Just a moment.
        </p>
      </div>
    </div>
  );
}

// --- Step 3: Done -----------------------------------------------------------

function DoneStep({ onFinish }) {
  return (
    <div className="bg-white rounded-2xl border border-ink-100 shadow-sm p-8 text-center space-y-5">
      <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto">
        <Check className="w-7 h-7 text-emerald-500" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-ink-900">You're all set!</h2>
        <p className="text-sm text-ink-500 mt-1">
          WhatsApp is connected. Start automating replies, building flows, and
          sending broadcasts from your dashboard.
        </p>
      </div>
      <button
        onClick={onFinish}
        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition"
      >
        Go to Dashboard
      </button>
    </div>
  );
}

// --- Step 3 (failure): Failed -----------------------------------------------

function FailedStep({ message, onRetry }) {
  return (
    <div className="bg-white rounded-2xl border border-ink-100 shadow-sm p-8 text-center space-y-5">
      <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto">
        <AlertTriangle className="w-7 h-7 text-amber-500" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-ink-900">Setup didn't finish</h2>
        <p className="text-sm text-ink-500 mt-1">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition"
      >
        Try again
      </button>
    </div>
  );
}

// --- Upgrade prompt (when plan doesn't allow WA) ----------------------------

function UpgradePrompt({ onBilling, onBack }) {
  return (
    <div className="flex items-start justify-center px-4 sm:px-6 py-8 sm:py-12">
      <div className="w-full max-w-md bg-white rounded-2xl border border-ink-100 shadow-sm p-8 text-center space-y-5">
        <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto">
          <CreditCard className="w-7 h-7 text-amber-500" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-ink-900">
            WhatsApp needs a paid plan
          </h2>
          <p className="text-sm text-ink-500 mt-1.5">
            Connecting a live WhatsApp number requires a WhatsApp Starter plan
            or higher. Upgrade to get instant access.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <button
            onClick={onBilling}
            className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition"
          >
            View plans →
          </button>
          <button
            onClick={onBack}
            className="w-full py-2.5 rounded-xl border border-ink-200 text-ink-600 text-sm font-medium hover:bg-ink-50 transition"
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );
}
