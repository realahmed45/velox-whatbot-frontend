import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "@/services/api";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import {
  MessageCircle,
  Check,
  ArrowRight,
  ArrowLeft,
  Shield,
  ExternalLink,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Send,
  Rocket,
  Smartphone,
  RefreshCw,
  QrCode,
  Sparkles,
  Zap,
} from "lucide-react";

/**
 * WhatsApp onboarding wizard.
 *
 * Two paths:
 *  • "Quick connect" (default)  → Botlify Cloud, QR-scan onboarding (~2 min)
 *  • "Official API"             → Meta Cloud API (advanced, for verified businesses)
 */
export default function WhatsAppOnboardingPage() {
  const [step, setStep] = useState(1);
  const [provider, setProvider] = useState("cloud"); // "cloud" | "meta"

  // Cloud (white-labeled) creds
  const [cloud, setCloud] = useState({
    idInstance: "",
    apiTokenInstance: "",
    displayName: "",
  });

  // Meta creds
  const [meta, setMeta] = useState({
    phoneNumberId: "",
    accessToken: "",
    wabaId: "",
    displayName: "",
    phoneNumber: "",
  });

  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);

  // QR scan state (cloud only)
  const [qrImage, setQrImage] = useState(null);
  const [qrStatus, setQrStatus] = useState("idle"); // idle | pending | authorized | error
  const [qrLoading, setQrLoading] = useState(false);
  const qrPollRef = useRef(null);

  // Test step
  const [testNumber, setTestNumber] = useState("");
  const [testing, setTesting] = useState(false);

  const navigate = useNavigate();
  const { activeWorkspace } = useAuthStore();
  const { fetchWorkspace } = useWorkspaceStore();

  // ─── stop polling when leaving page or finishing ─────────
  useEffect(() => () => stopPolling(), []);

  const stopPolling = () => {
    if (qrPollRef.current) {
      clearInterval(qrPollRef.current);
      qrPollRef.current = null;
    }
  };

  const startPolling = () => {
    stopPolling();
    qrPollRef.current = setInterval(refreshQr, 5000);
  };

  const refreshQr = async () => {
    try {
      const { data } = await api.get("/whatsapp/cloud/qr");
      if (data.status === "authorized") {
        setQrStatus("authorized");
        setQrImage(null);
        stopPolling();
        await fetchWorkspace(activeWorkspace);
        toast.success("Phone linked successfully!");
        setStep(4);
      } else if (data.qr) {
        setQrImage(data.qr);
        setQrStatus("pending");
      } else {
        setQrStatus(data.status || "pending");
      }
    } catch (err) {
      // soft-fail; keep polling
    }
  };

  // ─── Submit credentials ──────────────────────────────────
  const onboard = async () => {
    setSaving(true);
    try {
      let payload;
      if (provider === "cloud") {
        if (!cloud.idInstance.trim() || !cloud.apiTokenInstance.trim()) {
          setSaving(false);
          return toast.error("Both fields are required");
        }
        payload = {
          type: "cloud",
          idInstance: cloud.idInstance.trim(),
          apiTokenInstance: cloud.apiTokenInstance.trim(),
          displayName: cloud.displayName.trim(),
        };
      } else {
        payload = { type: "meta", ...meta };
      }
      const { data } = await api.post("/whatsapp/onboard", payload);
      await fetchWorkspace(activeWorkspace);

      if (provider === "cloud") {
        if (data.cloudState === "authorized") {
          toast.success("Already linked!");
          setStep(4);
        } else {
          toast.success("Credentials saved — scan the code to link");
          setStep(3);
          setQrLoading(true);
          await refreshQr();
          setQrLoading(false);
          startPolling();
        }
      } else {
        toast.success("WhatsApp connected!");
        setStep(4);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Connection failed");
    } finally {
      setSaving(false);
    }
  };

  const sendTest = async () => {
    if (!testNumber.trim()) return toast.error("Enter a phone number");
    setTesting(true);
    try {
      await api.post("/whatsapp/test", { phone: testNumber });
      toast.success("Test message sent! Check WhatsApp.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send");
    } finally {
      setTesting(false);
    }
  };

  const finish = async () => {
    stopPolling();
    try {
      await api.put(`/workspaces/${activeWorkspace}`, {
        settings: { automationEnabled: true },
      });
    } catch {}
    navigate("/dashboard?welcome=wa");
  };

  const totalSteps = provider === "cloud" ? 4 : 3;

  return (
    <div className="min-h-screen bg-gradient-to-br from-ink-50 via-white to-emerald-50/40 p-6 sm:p-10">
      <div className="max-w-3xl mx-auto">
        {/* ── Header ─────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/onboarding/choose-channel"
            className="text-xs text-ink-400 hover:text-ink-700 inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to channel
          </Link>
          <div className="flex items-center gap-2 text-xs text-ink-500">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <span key={i} className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${step >= i + 1 ? "bg-emerald-500" : "bg-ink-200"}`}
                />
                {i < totalSteps - 1 && (
                  <span
                    className={`w-8 h-px ${step >= i + 2 ? "bg-emerald-500" : "bg-ink-200"}`}
                  />
                )}
              </span>
            ))}
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700">
            <MessageCircle className="w-3 h-3" /> WhatsApp setup · Step {step}{" "}
            of {totalSteps}
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight text-ink-900">
            {step === 1 && "How do you want to connect?"}
            {step === 2 && "Add your details"}
            {step === 3 && "Scan to link your phone"}
            {step === 4 && "You're live 🎉"}
          </h1>
          <p className="mt-2 text-sm text-ink-500 max-w-lg mx-auto">
            {step === 1 &&
              "Most users go with Quick Connect — it takes about 2 minutes."}
            {step === 2 &&
              "We never store your details in plain text — everything is encrypted at rest."}
            {step === 3 &&
              "Open WhatsApp on your phone → Linked Devices → scan this code."}
            {step === 4 &&
              "Send a test message to confirm everything works, then go to your dashboard."}
          </p>
        </div>

        {/* ── STEP 1 — provider ──────────────────────────── */}
        {step === 1 && (
          <div className="space-y-4">
            <ProviderCard
              active={provider === "cloud"}
              onClick={() => setProvider("cloud")}
              title="Quick Connect"
              tagline="Use your existing WhatsApp by scanning a QR code — like WhatsApp Web."
              badge="Recommended"
              icon={QrCode}
              bullets={[
                "Live in 2 minutes — no Facebook approval needed",
                "Works with any WhatsApp number you already own",
                "Full automation: AI replies, broadcasts, flows, comment-to-DM",
                "Encrypted end-to-end through Botlify Cloud",
              ]}
            />
            <ProviderCard
              active={provider === "meta"}
              onClick={() => setProvider("meta")}
              title="Official WhatsApp Business API"
              tagline="For verified businesses with a Meta Business account."
              badge="Advanced"
              icon={Shield}
              bullets={[
                "Best for businesses with a verified Meta page",
                "Higher messaging limits & official green-tick eligibility",
                "Requires a Meta-issued Phone Number ID + Access Token",
              ]}
              link={{
                href: "https://developers.facebook.com/docs/whatsapp/cloud-api/get-started",
                label: "How to get Meta credentials",
              }}
            />

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setStep(2)}
                className="btn-primary !px-7 !py-3 shadow-glow"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2 — credentials ───────────────────────── */}
        {step === 2 && (
          <div className="bg-white rounded-lg border border-ink-100 p-6 sm:p-8 shadow-card">
            {provider === "cloud" ? (
              <div className="space-y-4">
                <div className="rounded-md bg-emerald-50 border border-emerald-200 p-3 flex gap-3">
                  <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-800">
                    <strong>Two fields, that's it.</strong> Get your free
                    Connection ID & Key from your{" "}
                    <a
                      href="https://console.green-api.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-semibold"
                    >
                      Botlify Cloud console
                    </a>
                    , paste them below, and you'll scan a QR on the next step.
                  </div>
                </div>

                <Field
                  label="Display name (optional)"
                  value={cloud.displayName}
                  onChange={(v) => setCloud({ ...cloud, displayName: v })}
                  placeholder="My Brand"
                />
                <Field
                  label="Connection ID"
                  value={cloud.idInstance}
                  onChange={(v) => setCloud({ ...cloud, idInstance: v })}
                  placeholder="1101234567"
                  helper="The numeric ID from your Botlify Cloud console"
                />
                <Field
                  label="Connection Key"
                  value={cloud.apiTokenInstance}
                  onChange={(v) => setCloud({ ...cloud, apiTokenInstance: v })}
                  placeholder="••••••••••••••••••••••••••••••••"
                  type={show ? "text" : "password"}
                  rightIcon={show ? EyeOff : Eye}
                  onRightClick={() => setShow(!show)}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <Field
                  label="Display name"
                  value={meta.displayName}
                  onChange={(v) => setMeta({ ...meta, displayName: v })}
                  placeholder="My Brand"
                />
                <Field
                  label="WhatsApp phone number"
                  value={meta.phoneNumber}
                  onChange={(v) => setMeta({ ...meta, phoneNumber: v })}
                  placeholder="+923001234567"
                  helper="In E.164 format (with country code)"
                />
                <Field
                  label="Phone Number ID"
                  value={meta.phoneNumberId}
                  onChange={(v) => setMeta({ ...meta, phoneNumberId: v })}
                  placeholder="123456789012345"
                  helper="From developers.facebook.com → your app → WhatsApp → API Setup"
                />
                <Field
                  label="WABA ID (optional)"
                  value={meta.wabaId}
                  onChange={(v) => setMeta({ ...meta, wabaId: v })}
                  placeholder="WhatsApp Business Account ID"
                />
                <Field
                  label="Permanent Access Token"
                  value={meta.accessToken}
                  onChange={(v) => setMeta({ ...meta, accessToken: v })}
                  placeholder="EAAxxxxxxxxxxxx..."
                  type={show ? "text" : "password"}
                  rightIcon={show ? EyeOff : Eye}
                  onRightClick={() => setShow(!show)}
                  helper="System User → Add Asset → Generate Token"
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-6 mt-6 border-t border-ink-100">
              <button
                onClick={() => setStep(1)}
                className="text-sm font-semibold text-ink-500 hover:text-ink-800 inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={onboard}
                disabled={saving}
                className="btn-primary !px-7 !py-3 shadow-glow disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Connecting…
                  </>
                ) : provider === "cloud" ? (
                  <>
                    Continue to QR <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Connect WhatsApp <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <div className="mt-5 p-3 rounded-md bg-ink-50 text-[11px] text-ink-500 flex items-start gap-2">
              <Shield className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div>
                Credentials are AES-256 encrypted at rest. We never log or share
                them.
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3 — QR (cloud only) ───────────────────── */}
        {step === 3 && provider === "cloud" && (
          <div className="bg-white rounded-lg border border-ink-100 p-6 sm:p-8 shadow-card">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* QR card */}
              <div className="relative">
                <div className="aspect-square w-full max-w-xs mx-auto bg-white border-2 border-ink-100 rounded-lg flex items-center justify-center p-4 shadow-card">
                  {qrLoading || (qrStatus === "idle" && !qrImage) ? (
                    <div className="flex flex-col items-center gap-3 text-ink-400">
                      <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                      <p className="text-xs">Preparing your link code…</p>
                    </div>
                  ) : qrImage ? (
                    <img
                      src={
                        qrImage.startsWith("data:")
                          ? qrImage
                          : `data:image/png;base64,${qrImage}`
                      }
                      alt="WhatsApp link code"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-ink-400">
                      <QrCode className="w-12 h-12" />
                      <p className="text-xs text-center">
                        Couldn't generate code.
                        <br />
                        Try refreshing.
                      </p>
                    </div>
                  )}
                </div>
                <button
                  onClick={refreshQr}
                  className="mt-3 mx-auto flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh code
                </button>
              </div>

              {/* Steps */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-ink-900 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-emerald-500" /> On your
                  phone
                </h3>
                <ol className="space-y-3 text-sm text-ink-600">
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      1
                    </span>
                    Open <strong>WhatsApp</strong> on the phone you want to
                    automate
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      2
                    </span>
                    Tap <strong>⋮ Menu</strong> (Android) or{" "}
                    <strong>Settings</strong> (iPhone) →{" "}
                    <strong>Linked Devices</strong>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      3
                    </span>
                    Tap <strong>Link a device</strong> and point your camera at
                    the code
                  </li>
                </ol>

                <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
                  <strong>Heads up:</strong> use a phone you own. The number you
                  link becomes your bot's WhatsApp number.
                </div>

                <div className="flex items-center gap-2 text-xs text-ink-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Waiting for scan…
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 mt-6 border-t border-ink-100">
              <button
                onClick={() => {
                  stopPolling();
                  setStep(2);
                }}
                className="text-sm font-semibold text-ink-500 hover:text-ink-800 inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Edit credentials
              </button>
              <button
                onClick={refreshQr}
                className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
              >
                <RefreshCw className="w-4 h-4" /> Check status
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4 (or 3 for meta) — done + test ───────── */}
        {((provider === "cloud" && step === 4) ||
          (provider === "meta" && step === 4)) && (
          <div className="bg-white rounded-lg border border-ink-100 p-6 sm:p-8 shadow-card">
            <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-md bg-gradient-to-br from-emerald-500 to-green-600 shadow-glow mb-5">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-center text-xl font-bold text-ink-900">
              Connected successfully
            </h3>
            <p className="text-center text-sm text-ink-500 mt-2">
              Send a test message to confirm everything works end-to-end.
            </p>

            <div className="mt-6 space-y-3">
              <Field
                label="Test phone number (your own)"
                value={testNumber}
                onChange={setTestNumber}
                placeholder="+923001234567"
                helper="The number must be on WhatsApp"
              />
              <button
                onClick={sendTest}
                disabled={testing}
                className="btn-secondary w-full !py-3 disabled:opacity-60"
              >
                {testing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Sending…
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Send test message
                  </>
                )}
              </button>
            </div>

            <button
              onClick={finish}
              className="btn-primary w-full !py-3.5 mt-6 shadow-glow"
            >
              <Rocket className="w-4 h-4" /> Go to my dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────
function ProviderCard({
  active,
  onClick,
  title,
  tagline,
  badge,
  bullets,
  warning,
  link,
  icon: Icon,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left bg-white rounded-lg p-5 border-2 transition ${
        active
          ? "border-emerald-500 shadow-glow"
          : "border-ink-100 hover:border-emerald-300"
      }`}
    >
      <div className="flex items-start gap-4">
        {Icon && (
          <div
            className={`w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0 ${
              active
                ? "bg-emerald-500 text-white"
                : "bg-emerald-50 text-emerald-600"
            }`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-ink-900">{title}</h3>
            {badge && (
              <span
                className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md ${
                  badge === "Recommended"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-ink-100 text-ink-600"
                }`}
              >
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs text-ink-500 mt-0.5">{tagline}</p>
          <ul className="mt-3 space-y-1.5">
            {bullets.map((b) => (
              <li
                key={b}
                className="text-xs text-ink-600 flex items-start gap-2"
              >
                <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
          {warning && (
            <div className="mt-3 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-2 flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>{warning}</span>
            </div>
          )}
          {link && (
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800"
              onClick={(e) => e.stopPropagation()}
            >
              {link.label} <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  helper,
  type = "text",
  rightIcon: RightIcon,
  onRightClick,
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-ink-700 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3.5 py-2.5 text-sm rounded-md border border-ink-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition"
        />
        {RightIcon && (
          <button
            type="button"
            onClick={onRightClick}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
          >
            <RightIcon className="w-4 h-4" />
          </button>
        )}
      </div>
      {helper && <p className="text-[11px] text-ink-400 mt-1">{helper}</p>}
    </div>
  );
}
