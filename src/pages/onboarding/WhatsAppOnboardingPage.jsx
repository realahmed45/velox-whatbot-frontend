import { useState } from "react";
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
  Sparkles,
  AlertCircle,
  Loader2,
  Send,
  Rocket,
} from "lucide-react";

/**
 * 3-step WhatsApp onboarding wizard.
 *  1. Pick provider (Meta Cloud — recommended / UltraMsg — advanced)
 *  2. Paste credentials
 *  3. Send a test message → activate
 */
export default function WhatsAppOnboardingPage() {
  const [step, setStep] = useState(1);
  const [provider, setProvider] = useState("meta"); // "meta" | "ultramsg"
  const [meta, setMeta] = useState({
    phoneNumberId: "",
    accessToken: "",
    wabaId: "",
    displayName: "",
    phoneNumber: "",
  });
  const [um, setUm] = useState({ instanceId: "", token: "" });
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testNumber, setTestNumber] = useState("");
  const [testing, setTesting] = useState(false);
  const navigate = useNavigate();
  const { activeWorkspace } = useAuthStore();
  const { fetchWorkspace } = useWorkspaceStore();

  const onboard = async () => {
    setSaving(true);
    try {
      const payload =
        provider === "meta"
          ? { type: "meta", ...meta }
          : { type: "ultramsg", ...um };
      await api.post("/whatsapp/onboard", payload);
      await fetchWorkspace(activeWorkspace);
      toast.success("WhatsApp connected!");
      setStep(3);
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
    try {
      await api.put(`/workspaces/${activeWorkspace}`, {
        settings: { automationEnabled: true },
      });
      navigate("/dashboard?welcome=wa");
    } catch {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ink-50 via-white to-emerald-50/40 p-6 sm:p-10">
      <div className="max-w-3xl mx-auto">
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/onboarding/choose-channel"
            className="text-xs text-ink-400 hover:text-ink-700 inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to channel
          </Link>
          <div className="flex items-center gap-2 text-xs text-ink-500">
            <span
              className={`w-2 h-2 rounded-full ${step >= 1 ? "bg-emerald-500" : "bg-ink-200"}`}
            />
            <span
              className={`w-8 h-px ${step >= 2 ? "bg-emerald-500" : "bg-ink-200"}`}
            />
            <span
              className={`w-2 h-2 rounded-full ${step >= 2 ? "bg-emerald-500" : "bg-ink-200"}`}
            />
            <span
              className={`w-8 h-px ${step >= 3 ? "bg-emerald-500" : "bg-ink-200"}`}
            />
            <span
              className={`w-2 h-2 rounded-full ${step >= 3 ? "bg-emerald-500" : "bg-ink-200"}`}
            />
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700">
            <MessageCircle className="w-3 h-3" /> WhatsApp setup · Step {step}{" "}
            of 3
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight text-ink-900">
            {step === 1 && "Pick your WhatsApp provider"}
            {step === 2 && "Add your credentials"}
            {step === 3 && "You're live 🎉"}
          </h1>
          <p className="mt-2 text-sm text-ink-500 max-w-lg mx-auto">
            {step === 1 &&
              "We support both the official Meta Cloud API and UltraMsg for testing."}
            {step === 2 &&
              "We never store your credentials in plain text — everything is encrypted at rest."}
            {step === 3 &&
              "Send a test message to confirm everything works, then go to your dashboard."}
          </p>
        </div>

        {/* STEP 1 — provider */}
        {step === 1 && (
          <div className="space-y-4">
            <ProviderCard
              id="meta"
              active={provider === "meta"}
              onClick={() => setProvider("meta")}
              title="Meta Cloud API"
              tagline="Official, free up to 1,000 conversations/month"
              badge="Recommended"
              bullets={[
                "Customer numbers stay safe forever",
                "1,000 free service conversations / month",
                "Same Business Verification you already have",
                "Live in 1 hour — no app review needed for testing",
              ]}
              link={{
                href: "https://developers.facebook.com/docs/whatsapp/cloud-api/get-started",
                label: "Meta setup guide",
              }}
            />
            <ProviderCard
              id="ultramsg"
              active={provider === "ultramsg"}
              onClick={() => setProvider("ultramsg")}
              title="UltraMsg"
              tagline="Quick test option — uses WhatsApp Web behind the scenes"
              badge="Advanced"
              warning="Unofficial. Numbers can be banned by WhatsApp. Use only for testing or non-critical accounts."
              bullets={[
                "Fastest setup if you already have an UltraMsg account",
                "Bring your own instance ID + token",
                "Not recommended for production",
              ]}
              link={{ href: "https://ultramsg.com", label: "ultramsg.com" }}
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

        {/* STEP 2 — credentials */}
        {step === 2 && (
          <div className="bg-white rounded-lg border border-ink-100 p-6 sm:p-8 shadow-card">
            {provider === "meta" ? (
              <div className="space-y-4">
                <Field
                  label="Display name (e.g. your brand)"
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
                  helper="Created via System User → Add Asset → Generate Token"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-md bg-amber-50 border border-amber-200 p-3 flex gap-3">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-800">
                    <strong>Use at your own risk.</strong> UltraMsg uses
                    unofficial APIs. WhatsApp may ban your number. Recommended
                    for testing only.
                  </div>
                </div>
                <Field
                  label="Instance ID"
                  value={um.instanceId}
                  onChange={(v) => setUm({ ...um, instanceId: v })}
                  placeholder="instance123456"
                />
                <Field
                  label="Token"
                  value={um.token}
                  onChange={(v) => setUm({ ...um, token: v })}
                  placeholder="abc123..."
                  type={show ? "text" : "password"}
                  rightIcon={show ? EyeOff : Eye}
                  onRightClick={() => setShow(!show)}
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
                Credentials are AES-256 encrypted at rest. We never log or
                share them.
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 — test + finish */}
        {step === 3 && (
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

function ProviderCard({
  active,
  onClick,
  title,
  tagline,
  badge,
  bullets,
  warning,
  link,
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
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
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
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-brand-600 hover:underline mt-2"
            >
              {link.label} <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
        {active && (
          <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
            <Check className="w-4 h-4" />
          </div>
        )}
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
      <label className="label">{label}</label>
      <div className="relative">
        <input
          className="input"
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
        {RightIcon && (
          <button
            type="button"
            onClick={onRightClick}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
          >
            <RightIcon className="w-4 h-4" />
          </button>
        )}
      </div>
      {helper && (
        <p className="text-[11px] text-ink-400 mt-1 leading-relaxed">{helper}</p>
      )}
    </div>
  );
}
