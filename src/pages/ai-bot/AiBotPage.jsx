import { useEffect, useMemo, useState } from "react";
import {
  Sparkles,
  Save,
  Bot,
  Plus,
  Trash2,
  Zap,
  MessageCircle,
  Instagram,
  Layers,
  Loader2,
  Wand2,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";

/**
 * v2 AI Bot training page — writes to workspace.aiSettings.
 * Channel-aware (WhatsApp, Instagram, Both). Uses Groq + Llama 3.1 70B by default.
 */

const DEFAULTS = {
  enabled: true,
  provider: "groq",
  model: "llama-3.1-70b-versatile",
  systemPrompt:
    "You are a friendly, professional support agent. Keep replies short (under 3 sentences), helpful, and in the customer's language.",
  businessContext: "",
  faqs: [],
  temperature: 0.4,
  maxTokens: 240,
  handoffKeywords: ["human", "agent", "support"],
};

const TONE_PRESETS = [
  {
    id: "friendly",
    label: "Friendly & casual",
    prompt:
      "You are a warm, casual support agent. Reply with empathy, use plain English, and feel free to use 1 emoji per reply.",
  },
  {
    id: "professional",
    label: "Professional",
    prompt:
      "You are a formal customer-support specialist. Reply concisely, accurately, and never use emojis or slang.",
  },
  {
    id: "playful",
    label: "Playful brand voice",
    prompt:
      "You are an energetic, witty brand voice. Keep replies short and fun. Use 1–2 emojis when it fits.",
  },
  {
    id: "expert",
    label: "Technical expert",
    prompt:
      "You are a precise technical advisor. Use clear, structured replies. Cite documentation steps when relevant.",
  },
];

export default function AiBotPage() {
  const { activeWorkspace } = useAuthStore();
  const { workspace, fetchWorkspace } = useWorkspaceStore();

  const [cfg, setCfg] = useState(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [kwInput, setKwInput] = useState("");
  const [newFaq, setNewFaq] = useState({ question: "", answer: "" });

  const channel = workspace?.activeChannel || "instagram";

  useEffect(() => {
    if (workspace?.aiSettings) {
      setCfg({ ...DEFAULTS, ...workspace.aiSettings });
    }
  }, [workspace?._id]);

  const set = (patch) => setCfg((c) => ({ ...c, ...patch }));

  const addKeyword = () => {
    const k = kwInput.trim().toLowerCase();
    if (!k) return;
    if (cfg.handoffKeywords.includes(k)) return setKwInput("");
    set({ handoffKeywords: [...cfg.handoffKeywords, k] });
    setKwInput("");
  };

  const removeKeyword = (k) =>
    set({ handoffKeywords: cfg.handoffKeywords.filter((x) => x !== k) });

  const addFaq = () => {
    if (!newFaq.question.trim() || !newFaq.answer.trim())
      return toast.error("Both question and answer required");
    set({ faqs: [...cfg.faqs, { ...newFaq }] });
    setNewFaq({ question: "", answer: "" });
  };

  const removeFaq = (idx) =>
    set({ faqs: cfg.faqs.filter((_, i) => i !== idx) });

  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/workspaces/${activeWorkspace}`, { aiSettings: cfg });
      await fetchWorkspace(activeWorkspace);
      toast.success("AI bot updated");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const channelMeta = useMemo(() => {
    if (channel === "whatsapp")
      return {
        icon: MessageCircle,
        color: "from-emerald-500 to-green-600",
        label: "WhatsApp",
      };
    if (channel === "instagram")
      return {
        icon: Instagram,
        color: "from-pink-500 via-fuchsia-500 to-violet-600",
        label: "Instagram",
      };
    return { icon: Layers, color: "from-indigo-500 to-violet-600", label: "Both channels" };
  }, [channel]);
  const ChannelIcon = channelMeta.icon;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-5">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-lg border border-ink-100 bg-white p-6">
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="relative flex items-start gap-4">
          <div className={`w-12 h-12 rounded-md bg-gradient-to-br ${channelMeta.color} flex items-center justify-center shadow-glow`}>
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-ink-900">
                AI Chatbot
              </h1>
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Sparkles className="w-3 h-3" /> Powered by Botlify AI
              </span>
            </div>
            <p className="text-sm text-ink-500 mt-1">
              Train one bot for{" "}
              <span className="inline-flex items-center gap-1 font-semibold text-ink-700">
                <ChannelIcon className="w-3.5 h-3.5" />
                {channelMeta.label}
              </span>
              . It auto-replies when no flow matches and hands off to humans on
              keywords.
            </p>
          </div>
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={!!cfg.enabled}
              onChange={(e) => set({ enabled: e.target.checked })}
            />
            <span className="w-11 h-6 rounded-full bg-ink-200 peer-checked:bg-emerald-500 transition relative">
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition ${cfg.enabled ? "translate-x-5" : ""}`}
              />
            </span>
            <span className="text-xs font-semibold text-ink-700">
              {cfg.enabled ? "Active" : "Paused"}
            </span>
          </label>
        </div>
      </div>

      {/* Tone presets */}
      <Section title="Tone & personality" icon={Wand2}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {TONE_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => set({ systemPrompt: p.prompt })}
              className={`text-left rounded-md p-3 border-2 transition text-xs ${
                cfg.systemPrompt === p.prompt
                  ? "border-brand-500 bg-brand-50/50"
                  : "border-ink-100 hover:border-brand-200"
              }`}
            >
              <p className="font-bold text-ink-900">{p.label}</p>
              <p className="text-[11px] text-ink-500 mt-1 line-clamp-2">
                {p.prompt}
              </p>
            </button>
          ))}
        </div>
        <div className="mt-4">
          <label className="label">System prompt</label>
          <textarea
            className="input min-h-[120px] font-mono text-xs"
            value={cfg.systemPrompt}
            onChange={(e) => set({ systemPrompt: e.target.value })}
            placeholder="You are a helpful agent for…"
          />
        </div>
      </Section>

      {/* Business context */}
      <Section title="Business context" icon={Zap}>
        <p className="text-xs text-ink-500 mb-2">
          Anything the bot should know about your business — products, pricing,
          policies, hours, locations. The more context, the better the replies.
        </p>
        <textarea
          className="input min-h-[140px]"
          value={cfg.businessContext}
          onChange={(e) => set({ businessContext: e.target.value })}
          placeholder={`Example:\n• We sell handmade leather wallets, $40–$120\n• Free shipping in Pakistan, 3–5 day delivery\n• Returns within 7 days, must be unused\n• Office hours: Mon–Sat 10am–7pm PKT`}
        />
        <p className="text-[10px] text-ink-400 mt-1">
          {cfg.businessContext.length} characters
        </p>
      </Section>

      {/* FAQs */}
      <Section title={`FAQs (${cfg.faqs.length})`} icon={MessageCircle}>
        <p className="text-xs text-ink-500 mb-3">
          Frequently asked questions. The bot uses these as priority answers
          before falling back to the AI.
        </p>

        <div className="space-y-2 mb-4">
          {cfg.faqs.map((f, i) => (
            <div
              key={i}
              className="rounded-md border border-ink-100 p-3 flex items-start gap-3 bg-ink-50/50"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-ink-900">Q: {f.question}</p>
                <p className="text-xs text-ink-600 mt-1">A: {f.answer}</p>
              </div>
              <button
                type="button"
                onClick={() => removeFaq(i)}
                className="text-ink-400 hover:text-rose-500 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {cfg.faqs.length === 0 && (
            <p className="text-[11px] text-ink-400 italic">
              No FAQs yet — add a few to dramatically improve replies.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 items-start">
          <input
            className="input"
            placeholder="Question"
            value={newFaq.question}
            onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
          />
          <input
            className="input"
            placeholder="Answer"
            value={newFaq.answer}
            onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
          />
          <button
            type="button"
            onClick={addFaq}
            className="btn-secondary !py-2.5 !px-4"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </Section>

      {/* Handoff + tuning */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Section title="Human handoff" icon={CheckCircle2}>
          <p className="text-xs text-ink-500 mb-3">
            When a customer types any of these words, the bot pauses and the
            chat is flagged for an agent.
          </p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {cfg.handoffKeywords.map((k) => (
              <span
                key={k}
                className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-md"
              >
                {k}
                <button
                  onClick={() => removeKeyword(k)}
                  className="hover:text-amber-900"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              value={kwInput}
              onChange={(e) => setKwInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addKeyword()}
              placeholder="Add keyword (e.g. refund)"
            />
            <button onClick={addKeyword} className="btn-secondary !py-2 !px-3">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </Section>

        <Section title="Response tuning" icon={Sparkles}>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="label !mb-0">Creativity</label>
                <span className="text-[11px] font-mono text-ink-500">
                  {cfg.temperature.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={cfg.temperature}
                onChange={(e) =>
                  set({ temperature: parseFloat(e.target.value) })
                }
                className="w-full accent-brand-500"
              />
              <p className="text-[10px] text-ink-400">
                Lower = factual & consistent, Higher = creative
              </p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="label !mb-0">Max reply length</label>
                <span className="text-[11px] font-mono text-ink-500">
                  {cfg.maxTokens} tokens
                </span>
              </div>
              <input
                type="range"
                min="60"
                max="600"
                step="20"
                value={cfg.maxTokens}
                onChange={(e) =>
                  set({ maxTokens: parseInt(e.target.value, 10) })
                }
                className="w-full accent-brand-500"
              />
            </div>
            <div>
              <label className="label">AI tier</label>
              <select
                className="input"
                value={cfg.provider}
                onChange={(e) => set({ provider: e.target.value })}
              >
                <option value="groq">Standard (Free, fast — included)</option>
                <option value="openai">Premium (Higher quality — paid)</option>
              </select>
            </div>
          </div>
        </Section>
      </div>

      {/* Save bar */}
      <div className="sticky bottom-3 z-10">
        <div className="bg-white border border-ink-100 rounded-lg shadow-card p-3 flex items-center justify-between">
          <div className="text-xs text-ink-500">
            Changes apply to all incoming{" "}
            <strong className="text-ink-700">
              {channelMeta.label.toLowerCase()}
            </strong>{" "}
            messages.
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="btn-primary shadow-glow disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-lg border border-ink-100 p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-8 h-8 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center">
          <Icon className="w-4 h-4" />
        </span>
        <h2 className="font-bold text-ink-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}
