import { useEffect, useState } from "react";
import { Sparkles, Save, Bot } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import PlanGate from "@/components/PlanGate";

const DEFAULT_CFG = {
  enabled: false,
  personality:
    "You are a friendly, helpful assistant for our business. Reply concisely, professionally, and always in the user's language.",
  businessInfo: "",
  model: "gpt-4o-mini",
  maxTurnsPerConversation: 20,
  escalateOnKeywords: ["human", "agent", "support", "help"],
};

export default function AiBotPage() {
  const { activeWorkspace } = useAuthStore();
  const { workspace, fetchWorkspace } = useWorkspaceStore();
  const plan = workspace?.subscription?.plan || "starter";

  const [cfg, setCfg] = useState(DEFAULT_CFG);
  const [saving, setSaving] = useState(false);
  const [kwInput, setKwInput] = useState("");

  useEffect(() => {
    if (!activeWorkspace) return;
    api
      .get(`/workspaces/${activeWorkspace}/ai-bot`)
      .then(({ data }) => {
        if (data?.aiBot) setCfg({ ...DEFAULT_CFG, ...data.aiBot });
      })
      .catch(() => {});
  }, [activeWorkspace]);

  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/workspaces/${activeWorkspace}/ai-bot`, cfg);
      await fetchWorkspace(activeWorkspace);
      toast.success("AI bot settings saved");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const addKeyword = () => {
    const k = kwInput.trim().toLowerCase();
    if (!k || cfg.escalateOnKeywords.includes(k)) return;
    setCfg({ ...cfg, escalateOnKeywords: [...cfg.escalateOnKeywords, k] });
    setKwInput("");
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-premium-gradient flex items-center justify-center shadow-glow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-ink-900">
                AI Conversational Bot
              </h1>
              <p className="text-sm text-ink-500">
                GPT-powered replies that sound human.
              </p>
            </div>
          </div>
        </div>
        <span className="badge-premium">Premium · Scale plan</span>
      </div>

      <PlanGate
        currentPlan={plan}
        requiredPlan="scale"
        feature="AI Conversational Bot"
      >
        <div className="space-y-5">
          {/* Toggle */}
          <div className="card p-5 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-ink-900 flex items-center gap-2">
                <Bot className="w-4 h-4" /> Enable AI replies
              </h2>
              <p className="text-sm text-ink-500">
                When enabled, unmatched DMs will be answered by AI.
              </p>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={cfg.enabled}
                onChange={(e) => setCfg({ ...cfg, enabled: e.target.checked })}
              />
              <span className="slider" />
            </label>
          </div>

          {/* Personality */}
          <div className="card p-5">
            <label className="label">Personality / system prompt</label>
            <textarea
              className="textarea min-h-[120px]"
              value={cfg.personality}
              onChange={(e) => setCfg({ ...cfg, personality: e.target.value })}
              placeholder="Describe how the AI should behave..."
            />
            <p className="text-xs text-ink-400 mt-1">
              This is sent to the model as the system message.
            </p>
          </div>

          {/* Business info */}
          <div className="card p-5">
            <label className="label">Business information (optional)</label>
            <textarea
              className="textarea min-h-[100px]"
              value={cfg.businessInfo}
              onChange={(e) => setCfg({ ...cfg, businessInfo: e.target.value })}
              placeholder="E.g. We're a clothing brand. Working hours 9–6. Shipping 3–5 days. Return policy: 7 days..."
            />
            <p className="text-xs text-ink-400 mt-1">
              AI will use this to answer customer questions accurately.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Model */}
            <div className="card p-5">
              <label className="label">Model</label>
              <select
                className="input"
                value={cfg.model}
                onChange={(e) => setCfg({ ...cfg, model: e.target.value })}
              >
                <option value="gpt-4o-mini">
                  GPT-4o Mini (fast, affordable)
                </option>
                <option value="gpt-4o">GPT-4o (highest quality)</option>
              </select>
            </div>
            {/* Max turns */}
            <div className="card p-5">
              <label className="label">
                Max turns per conversation: {cfg.maxTurnsPerConversation}
              </label>
              <input
                type="range"
                min="5"
                max="50"
                value={cfg.maxTurnsPerConversation}
                onChange={(e) =>
                  setCfg({
                    ...cfg,
                    maxTurnsPerConversation: Number(e.target.value),
                  })
                }
                className="w-full"
              />
              <p className="text-xs text-ink-400 mt-1">
                After this many AI replies the bot hands over to a human.
              </p>
            </div>
          </div>

          {/* Escalation keywords */}
          <div className="card p-5">
            <label className="label">Escalation keywords</label>
            <p className="text-xs text-ink-500 mb-2">
              When user message contains any of these, the AI stops and
              transfers to team inbox.
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {cfg.escalateOnKeywords.map((k) => (
                <span key={k} className="chip bg-brand-100 text-brand-700">
                  {k}
                  <button
                    onClick={() =>
                      setCfg({
                        ...cfg,
                        escalateOnKeywords: cfg.escalateOnKeywords.filter(
                          (x) => x !== k,
                        ),
                      })
                    }
                    className="ml-1 hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="input flex-1"
                value={kwInput}
                onChange={(e) => setKwInput(e.target.value)}
                placeholder="add keyword and press Enter"
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addKeyword())
                }
              />
              <button onClick={addKeyword} className="btn-secondary">
                Add
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={save} disabled={saving} className="btn-premium">
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save AI settings"}
            </button>
          </div>
        </div>
      </PlanGate>
    </div>
  );
}
