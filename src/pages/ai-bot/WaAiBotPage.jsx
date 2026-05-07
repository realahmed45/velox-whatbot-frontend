/**
 * WhatsApp AI Bot — distinct visual identity.
 *
 * Teal/emerald palette, chat-bubble hero mockup, business-support copy
 * ("messages", "customer queries", "business hours"). Tone presets reference
 * support-agent voices. Persists to workspace.aiSettingsWa.
 */
import { useEffect, useState } from "react";
import {
  Sparkles,
  Save,
  Bot,
  Plus,
  Trash2,
  MessageSquare,
  Loader2,
  Wand2,
  CheckCheck,
  Phone,
  Briefcase,
  Clock3,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";

const DEFAULTS = {
  enabled: true,
  provider: "groq",
  model: "llama-3.3-70b-versatile",
  systemPrompt:
    "You are a friendly, professional WhatsApp support agent. Keep replies short, warm, and helpful. Always answer in the customer's language.",
  businessContext: "",
  faqs: [],
  temperature: 0.4,
  maxTokens: 240,
  handoffKeywords: ["human", "agent", "manager", "complaint", "refund"],
};

const WA_TONE_PRESETS = [
  {
    id: "support",
    label: "Customer support",
    prompt:
      "You are a calm, helpful WhatsApp support agent. Acknowledge the customer, give a clear answer in 1–2 short messages, and confirm next steps.",
  },
  {
    id: "sales",
    label: "Sales & enquiries",
    prompt:
      "You are a sales rep on WhatsApp. Answer pricing, availability, and ordering questions concisely. Always invite the next step.",
  },
  {
    id: "formal",
    label: "Formal business",
    prompt:
      "You are a formal business representative. Professional tone, precise wording, no slang or emojis.",
  },
  {
    id: "concierge",
    label: "Concierge / clinic",
    prompt:
      "You are a polite concierge handling appointments and bookings on WhatsApp. Confirm details, offer slots, and never overcommit.",
  },
];

export default function WaAiBotPage() {
  const { activeWorkspace } = useAuthStore();
  const { workspace, fetchWorkspace } = useWorkspaceStore();

  const [cfg, setCfg] = useState(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [kwInput, setKwInput] = useState("");
  const [newFaq, setNewFaq] = useState({ question: "", answer: "" });

  useEffect(() => {
    const stored = workspace?.aiSettingsWa;
    if (stored && Object.keys(stored).length)
      setCfg({ ...DEFAULTS, ...stored });
    else setCfg(DEFAULTS);
  }, [workspace?._id]);

  const set = (patch) => setCfg((c) => ({ ...c, ...patch }));

  const addKeyword = () => {
    const k = kwInput.trim().toLowerCase();
    if (!k || cfg.handoffKeywords.includes(k)) return setKwInput("");
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
  const removeFaq = (i) => set({ faqs: cfg.faqs.filter((_, x) => x !== i) });

  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/workspaces/${activeWorkspace}`, { aiSettingsWa: cfg });
      await fetchWorkspace(activeWorkspace);
      toast.success("WhatsApp AI bot updated");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const phone =
    workspace?.whatsapp?.phoneNumber ||
    workspace?.whatsapp?.displayName ||
    "Your business";

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-5">
      {/* ── WA-themed hero (chat bubble mockup) ──────────────────── */}
      <div className="relative overflow-hidden border border-teal-200/70 bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 p-6">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-emerald-300/25 blur-3xl" />

        <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-start">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black text-ink-900">
                    WhatsApp AI Agent
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 bg-teal-600/10 text-teal-700 border border-teal-300">
                    <Phone className="w-3 h-3" /> {phone}
                  </span>
                </div>
                <p className="text-sm text-ink-600 mt-1">
                  Handles customer messages 24/7 — orders, support, FAQs,
                  bookings — in your business voice.
                </p>
              </div>
            </div>

            {/* SLA stat strip */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              {[
                { Icon: Clock3, k: "Avg reply", v: "~1.8s" },
                { Icon: ShieldCheck, k: "Compliance", v: "Business policy" },
                { Icon: Briefcase, k: "Channel", v: "WhatsApp Business" },
              ].map(({ Icon, k, v }) => (
                <div
                  key={k}
                  className="bg-white border border-teal-200 px-3 py-2 flex items-center gap-2"
                >
                  <Icon className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-teal-700 font-bold">
                      {k}
                    </p>
                    <p className="text-xs font-bold text-ink-900 truncate">
                      {v}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mock chat bubble preview */}
          <div className="hidden lg:block w-[260px] bg-[#e7f4ec] border border-teal-200 p-3 space-y-2">
            <div className="bg-white px-3 py-2 max-w-[85%] text-xs text-ink-800 shadow-sm">
              Hi, do you deliver to Lahore?
              <span className="block text-[9px] text-ink-400 text-right mt-0.5">
                12:04
              </span>
            </div>
            <div className="bg-[#d9fdd3] px-3 py-2 max-w-[85%] ml-auto text-xs text-ink-800 shadow-sm">
              Yes! Free shipping across Pakistan, 2–4 days. Want me to share
              today's offers?
              <span className="flex items-center gap-1 text-[9px] text-teal-700 justify-end mt-0.5">
                12:04 <CheckCheck className="w-3 h-3" />
              </span>
            </div>
          </div>

          <label className="absolute top-4 right-4 inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={!!cfg.enabled}
              onChange={(e) => set({ enabled: e.target.checked })}
            />
            <span className="w-11 h-6 bg-ink-200 peer-checked:bg-teal-600 transition relative">
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white shadow transition ${cfg.enabled ? "translate-x-5" : ""}`}
              />
            </span>
            <span className="text-xs font-bold text-ink-700">
              {cfg.enabled ? "Online" : "Offline"}
            </span>
          </label>
        </div>
      </div>

      {/* ── Business context FIRST (WA users care about ops) ─────── */}
      <WaSection title="About your business" icon={Briefcase}>
        <p className="text-xs text-ink-500 mb-2">
          Tell the agent about your business — services, pricing, delivery,
          policies, opening hours. The clearer the context, the more accurate
          the replies.
        </p>
        <textarea
          className="input min-h-[140px]"
          value={cfg.businessContext}
          onChange={(e) => set({ businessContext: e.target.value })}
          placeholder={`Example:\n• Bakery in DHA Lahore, open Mon–Sun 10am–11pm\n• Cakes from PKR 2,500, custom orders 48h notice\n• Free delivery within 5km, PKR 300 beyond\n• Payment: COD, EasyPaisa, JazzCash`}
        />
        <p className="text-[10px] text-ink-400 mt-1">
          {cfg.businessContext.length} characters
        </p>
      </WaSection>

      {/* ── Quick replies / FAQs ──────────────────────────────────── */}
      <WaSection
        title={`Quick replies (${cfg.faqs.length})`}
        icon={MessageSquare}
      >
        <p className="text-xs text-ink-500 mb-3">
          Pre-approved answers for common customer questions. The agent
          prioritises these before generating an AI reply.
        </p>

        <div className="space-y-2 mb-4">
          {cfg.faqs.map((f, i) => (
            <div
              key={i}
              className="border-l-4 border-teal-500 bg-teal-50/40 p-3 flex items-start gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-ink-900">
                  Customer: "{f.question}"
                </p>
                <p className="text-xs text-teal-800 mt-1">→ {f.answer}</p>
              </div>
              <button
                type="button"
                onClick={() => removeFaq(i)}
                className="text-ink-400 hover:text-rose-600 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {cfg.faqs.length === 0 && (
            <p className="text-[11px] text-ink-400 italic">
              No quick replies yet — add common ones like "How much?", "Delivery
              time?", "Are you open?".
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2">
          <input
            className="input"
            placeholder="Customer question"
            value={newFaq.question}
            onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
          />
          <input
            className="input"
            placeholder="Your standard answer"
            value={newFaq.answer}
            onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
          />
          <button
            type="button"
            onClick={addFaq}
            className="!py-2.5 !px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </WaSection>

      {/* ── Tone (after context, since WA is biz-first) ──────────── */}
      <WaSection title="Agent voice" icon={Wand2}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {WA_TONE_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => set({ systemPrompt: p.prompt })}
              className={`text-left p-3 border-2 transition text-xs ${
                cfg.systemPrompt === p.prompt
                  ? "border-teal-600 bg-teal-50"
                  : "border-ink-100 hover:border-teal-300"
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
          <label className="label">Custom system prompt</label>
          <textarea
            className="input min-h-[110px] font-mono text-xs"
            value={cfg.systemPrompt}
            onChange={(e) => set({ systemPrompt: e.target.value })}
          />
        </div>
      </WaSection>

      {/* ── Handoff + tuning ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <WaSection title="Escalate to human agent" icon={ShieldCheck}>
          <p className="text-xs text-ink-500 mb-3">
            When a customer types any of these words, the bot pauses and flags
            the chat for an agent.
          </p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {cfg.handoffKeywords.map((k) => (
              <span
                key={k}
                className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300 px-2 py-1"
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
              placeholder="Add escalation keyword"
            />
            <button
              onClick={addKeyword}
              className="!py-2 !px-3 bg-teal-600 text-white"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </WaSection>

        <WaSection title="Reply tuning" icon={Sparkles}>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="label !mb-0">Strictness</label>
                <span className="text-[11px] font-mono text-teal-700">
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
                className="w-full accent-teal-600"
              />
              <p className="text-[10px] text-ink-400">
                Lower = factual & consistent · Higher = adaptive
              </p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="label !mb-0">Max message length</label>
                <span className="text-[11px] font-mono text-teal-700">
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
                className="w-full accent-teal-600"
              />
            </div>
            <div>
              <label className="label">AI tier</label>
              <select
                className="input"
                value={cfg.provider}
                onChange={(e) => set({ provider: e.target.value })}
              >
                <option value="groq">Standard (free, fast — included)</option>
                <option value="openai">Premium (sharper replies — paid)</option>
              </select>
            </div>
          </div>
        </WaSection>
      </div>

      {/* ── Sticky save ──────────────────────────────────────────── */}
      <div className="sticky bottom-3 z-10">
        <div className="bg-white border border-teal-200 shadow-card p-3 flex items-center justify-between">
          <div className="text-xs text-ink-500 flex items-center gap-1.5">
            <CheckCheck className="w-4 h-4 text-teal-600" />
            Applies to all incoming{" "}
            <strong className="text-ink-700">WhatsApp</strong> messages.
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm px-5 py-2.5 flex items-center gap-2 disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save WhatsApp agent
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function WaSection({ title, icon: Icon, children }) {
  return (
    <div className="bg-white border border-ink-100 p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-8 h-8 bg-teal-600 text-white flex items-center justify-center">
          <Icon className="w-4 h-4" />
        </span>
        <h2 className="font-bold text-ink-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}
