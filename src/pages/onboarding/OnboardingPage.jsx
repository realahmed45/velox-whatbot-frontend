import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import { Building2, MessageSquare, Bot, CheckCircle2 } from "lucide-react";

const STEPS = [
  { id: 1, title: "Create Workspace", icon: Building2 },
  { id: 2, title: "Connect WhatsApp", icon: MessageSquare },
  { id: 3, title: "Choose a Template", icon: Bot },
  { id: 4, title: "You're Ready!", icon: CheckCircle2 },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(false);
  const { setActiveWorkspace } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        {/* Progress */}
        <div className="flex items-center gap-0 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0
                ${step >= s.id ? "bg-brand-600 text-white" : "bg-gray-200 text-gray-400"}`}
              >
                {step > s.id ? "✓" : s.id}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-1 ${step > s.id ? "bg-brand-400" : "bg-gray-200"}`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="card p-8">
          {step === 1 && (
            <Step1
              onNext={(ws) => {
                setWorkspace(ws);
                setStep(2);
              }}
              loading={loading}
              setLoading={setLoading}
            />
          )}
          {step === 2 && (
            <Step2
              workspace={workspace}
              onNext={() => setStep(3)}
              onSkip={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <Step3
              workspace={workspace}
              onNext={() => setStep(4)}
              onSkip={() => setStep(4)}
            />
          )}
          {step === 4 && (
            <Step4
              workspace={workspace}
              onDone={() => {
                setActiveWorkspace(workspace?._id);
                navigate("/dashboard");
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Step1({ onNext, loading, setLoading }) {
  const [form, setForm] = useState({
    name: "",
    industry: "general",
    timezone: "Asia/Karachi",
  });
  const TYPES = [
    "restaurant",
    "retail",
    "beauty_salon",
    "real_estate",
    "general",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Workspace name required");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/workspaces", form);
      onNext(data.workspace);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create workspace");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center mb-4">
        <Building2 className="w-5 h-5 text-brand-600" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">
        Create your workspace
      </h2>
      <p className="text-gray-500 text-sm mb-6">
        A workspace represents your WhatsApp business account.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Workspace / Business Name</label>
          <input
            className="input"
            placeholder="e.g. Ahmed's Restaurant"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Business Type</label>
          <select
            className="input"
            value={form.industry}
            onChange={(e) => setForm({ ...form, industry: e.target.value })}
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Creating…" : "Create workspace & continue"}
        </button>
      </form>
    </div>
  );
}

function Step2({ workspace, onNext, onSkip }) {
  const [provider, setProvider] = useState("ultramsg");
  const [form, setForm] = useState({
    instanceId: "",
    token: "",
    phoneNumberId: "",
    accessToken: "",
    verifyToken: "",
  });
  const [qrUrl, setQrUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const connectUltraMsg = async () => {
    if (!form.instanceId || !form.token) {
      toast.error("Instance ID and token required");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post(
        `/workspaces/${workspace._id}/connect-ultramsg`,
        { instanceId: form.instanceId, token: form.token },
      );
      if (data.qrUrl) setQrUrl(data.qrUrl);
      else toast.success("UltraMsg connected!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Connection failed");
    } finally {
      setLoading(false);
    }
  };

  const connectMeta = async () => {
    if (!form.phoneNumberId || !form.accessToken || !form.verifyToken) {
      toast.error("All Meta fields required");
      return;
    }
    setLoading(true);
    try {
      await api.post(`/workspaces/${workspace._id}/connect-meta`, {
        phoneNumberId: form.phoneNumberId,
        accessToken: form.accessToken,
        verifyToken: form.verifyToken,
      });
      toast.success("Meta Cloud API connected!");
      onNext();
    } catch (err) {
      toast.error(err.response?.data?.message || "Connection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-4">
        <MessageSquare className="w-5 h-5 text-green-600" />
      </div>
      <h2 className="text-xl font-bold mb-1">Connect WhatsApp</h2>
      <p className="text-gray-500 text-sm mb-6">
        Choose how you want to connect your WhatsApp number.
      </p>

      {/* Provider tabs */}
      <div className="flex gap-2 mb-4">
        {["ultramsg", "meta"].map((p) => (
          <button
            key={p}
            onClick={() => setProvider(p)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg border transition ${provider === p ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
          >
            {p === "ultramsg" ? "UltraMsg (QR Scan)" : "Meta Cloud API"}
          </button>
        ))}
      </div>

      {provider === "ultramsg" ? (
        <div className="space-y-3">
          <div>
            <label className="label">Instance ID</label>
            <input
              className="input"
              placeholder="instance12345"
              value={form.instanceId}
              onChange={(e) => setForm({ ...form, instanceId: e.target.value })}
            />
          </div>
          <div>
            <label className="label">API Token</label>
            <input
              className="input"
              type="password"
              placeholder="your-ultramsg-token"
              value={form.token}
              onChange={(e) => setForm({ ...form, token: e.target.value })}
            />
          </div>
          {qrUrl && (
            <div className="text-center bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">
                Scan this QR code with WhatsApp
              </p>
              <img
                src={qrUrl}
                alt="QR Code"
                className="mx-auto max-w-[200px]"
              />
            </div>
          )}
          <button
            onClick={connectUltraMsg}
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? "Connecting…" : "Connect & Get QR"}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="label">Phone Number ID</label>
            <input
              className="input"
              placeholder="From Meta Developer Console"
              value={form.phoneNumberId}
              onChange={(e) =>
                setForm({ ...form, phoneNumberId: e.target.value })
              }
            />
          </div>
          <div>
            <label className="label">Access Token</label>
            <input
              className="input"
              type="password"
              placeholder="EAAB..."
              value={form.accessToken}
              onChange={(e) =>
                setForm({ ...form, accessToken: e.target.value })
              }
            />
          </div>
          <div>
            <label className="label">Webhook Verify Token</label>
            <input
              className="input"
              placeholder="Any secret string"
              value={form.verifyToken}
              onChange={(e) =>
                setForm({ ...form, verifyToken: e.target.value })
              }
            />
          </div>
          <div className="text-xs text-gray-500 bg-blue-50 rounded-lg p-3">
            Webhook URL:{" "}
            <code className="font-mono">
              https://yourdomain.com/api/whatsapp/webhook/meta
            </code>
          </div>
          <button
            onClick={connectMeta}
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? "Connecting…" : "Save & Connect"}
          </button>
        </div>
      )}

      <button
        onClick={onSkip}
        className="btn-ghost w-full mt-3 text-gray-400 text-sm"
      >
        Skip for now
      </button>
    </div>
  );
}

function Step3({ workspace, onNext, onSkip }) {
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);
  const TEMPLATES = [
    {
      id: "restaurant",
      label: "🍽 Restaurant",
      desc: "Menu, reservations, order enquiries",
    },
    {
      id: "beauty_salon",
      label: "💅 Beauty Salon",
      desc: "Appointments & services menu",
    },
    {
      id: "retail",
      label: "🛍 Retail Shop",
      desc: "Product enquiry & order tracking",
    },
    {
      id: "real_estate",
      label: "🏠 Real Estate",
      desc: "Lead qualification & property tours",
    },
    {
      id: "general_faq",
      label: "💬 General FAQ",
      desc: "Welcome + human handover fallback",
    },
  ];

  const applyTemplate = async () => {
    if (!selected) {
      toast.error("Please pick a template");
      return;
    }
    setLoading(true);
    try {
      await api.post(`/flows/from-template`, {
        workspaceId: workspace._id,
        templateKey: selected,
      });
      toast.success("Template applied!");
      onNext();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to apply template");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mb-4">
        <Bot className="w-5 h-5 text-purple-600" />
      </div>
      <h2 className="text-xl font-bold mb-1">Choose a starter template</h2>
      <p className="text-gray-500 text-sm mb-4">
        We'll create ready-made automation flows for your business type.
      </p>
      <div className="space-y-2 mb-4">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelected(t.id)}
            className={`w-full text-left p-3 rounded-lg border transition ${selected === t.id ? "border-brand-500 bg-brand-50" : "border-gray-200 hover:border-gray-300"}`}
          >
            <div className="font-medium text-sm">{t.label}</div>
            <div className="text-xs text-gray-500">{t.desc}</div>
          </button>
        ))}
      </div>
      <button
        onClick={applyTemplate}
        className="btn-primary w-full"
        disabled={loading || !selected}
      >
        {loading ? "Applying…" : "Apply template"}
      </button>
      <button
        onClick={onSkip}
        className="btn-ghost w-full mt-2 text-gray-400 text-sm"
      >
        Start from scratch
      </button>
    </div>
  );
}

function Step4({ workspace, onDone }) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="w-8 h-8 text-brand-600" />
      </div>
      <h2 className="text-xl font-bold mb-2">You're all set!</h2>
      <p className="text-gray-500 text-sm mb-6">
        Your workspace <strong>{workspace?.name}</strong> is ready. Start
        building flows, managing your inbox, and growing your business.
      </p>
      <button onClick={onDone} className="btn-primary w-full">
        Go to Dashboard
      </button>
    </div>
  );
}
