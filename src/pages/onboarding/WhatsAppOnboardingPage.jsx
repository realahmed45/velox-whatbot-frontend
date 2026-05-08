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
  QrCode,
  Smartphone,
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

  // Wasender QR-scan flow ($6/mo paid managed gateway)
  const startWasender = async ({ reset = false } = {}) => {
    setBusy(true);
    setErrorMessage(null);
    try {
      await api.post("/whatsapp/wasender/connect", { reset });
      setPhase("qr");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Could not start the QR session. Please try again.";
      setErrorMessage(msg);
      toast.error(msg);
      setPhase("failed");
    } finally {
      setBusy(false);
    }
  };

  // Auto-start QR session as soon as the user lands on this page (single-path UX)
  useEffect(() => {
    if (phase !== "choose") return;
    startWasender({ reset: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
              {phase === "choose" && "Generating your QR code…"}
              {phase === "qr" && "Scan the QR code with WhatsApp on your phone"}
              {phase === "redirecting" && "Opening the secure setup page..."}
              {phase === "finalizing" && "Almost done - finishing setup..."}
              {phase === "done" && "WhatsApp connected successfully!"}
              {phase === "failed" && "Something went wrong"}
            </p>
          </div>
        </div>

        {phase === "choose" && <StartingQrStep />}

        {phase === "qr" && (
          <WasenderQrStep
            onCancel={() => setPhase("choose")}
            onDone={async () => {
              if (activeWorkspace) await fetchWorkspace(activeWorkspace);
              setPhase("done");
            }}
            onReset={() => startWasender({ reset: true })}
          />
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
              startWasender({ reset: true });
            }}
          />
        )}
      </div>
    </div>
  );
}

// --- Step 1: Starting QR session (single-path) ----------------------------

function StartingQrStep() {
  return (
    <div className="bg-white rounded-2xl border border-ink-100 shadow-sm p-8 text-center space-y-4">
      <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center mx-auto">
        <Loader2 className="w-6 h-6 text-teal-600 animate-spin" />
      </div>
      <div>
        <h2 className="text-base font-bold text-ink-900">
          Preparing your QR code…
        </h2>
        <p className="text-xs text-ink-500 mt-1">
          We're setting up a secure WhatsApp session for your workspace. This
          takes a few seconds.
        </p>
      </div>
    </div>
  );
}
// --- Step 2c: Wasender QR scan ---------------------------------------------

function WasenderQrStep({ onCancel, onDone, onReset }) {
  const [state, setState] = useState({ status: "connecting" });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let timer;
    const poll = async () => {
      try {
        const { data } = await api.get("/whatsapp/wasender/qr");
        if (cancelled) return;
        setState(data || {});
        if (data?.status === "connected") {
          setTimeout(() => !cancelled && onDone(), 1200);
          return;
        }
      } catch (err) {
        if (cancelled) return;
        setState({ status: "error", lastError: err.message });
      }
      timer = setTimeout(() => setTick((t) => t + 1), 2500);
    };
    poll();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [tick, onDone]);

  const status = state.status || "connecting";

  return (
    <div className="bg-white rounded-2xl border border-ink-100 shadow-sm p-6 sm:p-8 space-y-5">
      {status === "connected" ? (
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto">
            <Check className="w-7 h-7 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-ink-900">
              Connected successfully!
            </h2>
            {state.phoneNumber && (
              <p className="text-sm text-ink-500 mt-1">
                {state.displayName ? `${state.displayName} · ` : ""}+
                {state.phoneNumber}
              </p>
            )}
          </div>
        </div>
      ) : status === "qr" && state.qr ? (
        <>
          <div className="flex flex-col items-center gap-4">
            <div className="p-3 rounded-2xl bg-white border-2 border-teal-100 shadow-sm">
              <img
                src={state.qr}
                alt="WhatsApp QR code"
                className="w-64 h-64"
              />
            </div>
            <p className="text-xs text-ink-400">
              Refreshing automatically every 20 seconds
            </p>
          </div>
          <div className="bg-teal-50 border border-teal-100 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-teal-900 mb-2">
              How to scan
            </h3>
            <ol className="text-xs text-teal-800 space-y-1.5 list-decimal list-inside">
              <li>Open WhatsApp on your phone</li>
              <li>
                Tap <b>Menu</b> (Android) or <b>Settings</b> (iPhone) →{" "}
                <b>Linked Devices</b>
              </li>
              <li>
                Tap <b>Link a Device</b> and point your camera at this screen
              </li>
            </ol>
          </div>
        </>
      ) : status === "error" || status === "logged_out" ? (
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7 text-amber-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-ink-900">
              {status === "logged_out"
                ? "Session was logged out"
                : "Couldn't connect"}
            </h2>
            <p className="text-sm text-ink-500 mt-1">
              {state.lastError ||
                "Something went wrong. Try resetting the session and scanning again."}
            </p>
          </div>
          <button
            onClick={onReset}
            className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition"
          >
            Reset & try again
          </button>
        </div>
      ) : (
        <div className="text-center space-y-4 py-8">
          <Loader2 className="w-8 h-8 text-teal-500 animate-spin mx-auto" />
          <p className="text-sm text-ink-500">
            Generating QR code, this takes a few seconds...
          </p>
        </div>
      )}

      {status !== "connected" && (
        <button
          onClick={onCancel}
          className="w-full py-2 text-xs text-ink-400 hover:text-ink-700 transition"
        >
          Cancel and go back
        </button>
      )}
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
