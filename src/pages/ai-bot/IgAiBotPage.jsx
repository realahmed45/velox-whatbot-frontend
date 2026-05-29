/**
 * Instagram AI Bot — distinct visual identity.
 *
 * Rose/fuchsia palette, story-bubble hero, IG-flavored copy ("DMs",
 * "comments", "story replies"). Tone presets reference creator/brand voice.
 * Persists to workspace.aiSettings.
 */
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Sparkles,
  Save,
  Bot,
  Plus,
  Trash2,
  Heart,
  MessageCircle,
  Instagram,
  Loader2,
  Wand2,
  Camera,
  Hash,
  AtSign,
  Send,
  X,
  Play,
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
    "You are a warm, on-brand Instagram support voice. Reply like a real creator — short, friendly, 1 emoji max. Stay on-brand and never sound robotic.",
  businessContext: "",
  faqs: [],
  temperature: 0.55,
  maxTokens: 220,
  handoffKeywords: ["human", "agent", "support", "complain"],
};

const IG_TONE_PRESETS = [
  {
    id: "creator",
    label: "Creator vibe",
    emoji: "✨",
    prompt:
      "You are an authentic creator replying to DMs. Be warm, casual, use 1 emoji per reply. Match the energy of the follower.",
  },
  {
    id: "brand",
    label: "Lifestyle brand",
    emoji: "🌸",
    prompt:
      "You are a lifestyle brand voice — aesthetic, friendly, on-trend. Keep replies short (1–2 lines) and inviting.",
  },
  {
    id: "playful",
    label: "Playful & witty",
    emoji: "💫",
    prompt:
      "You are a witty Instagram brand voice. Use clever, fun replies. Drop emojis when it fits the mood.",
  },
  {
    id: "luxury",
    label: "Premium / luxury",
    emoji: "🖤",
    prompt:
      "You are a premium luxury brand. Refined, polished, no slang, minimal emoji use. Sound elevated.",
  },
];

export default function IgAiBotPage() {
  const { activeWorkspace } = useAuthStore();
  const { workspace, fetchWorkspace } = useWorkspaceStore();

  const [cfg, setCfg] = useState(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [kwInput, setKwInput] = useState("");
  const [newFaq, setNewFaq] = useState({ question: "", answer: "" });

  const [searchParams, setSearchParams] = useSearchParams();
  const [testerOpen, setTesterOpen] = useState(false);

  // Open the tester automatically when the sidebar "Test the bot" link is used.
  useEffect(() => {
    if (searchParams.get("test") === "1") setTesterOpen(true);
  }, [searchParams]);

  const closeTester = () => {
    setTesterOpen(false);
    if (searchParams.get("test")) {
      searchParams.delete("test");
      setSearchParams(searchParams, { replace: true });
    }
  };

  useEffect(() => {
    const stored = workspace?.aiSettings;
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
      await api.put(`/workspaces/${activeWorkspace}`, { aiSettings: cfg });
      await fetchWorkspace(activeWorkspace);
      toast.success("Instagram AI bot updated");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const igHandle = workspace?.instagram?.username;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-5">
      {/* ── IG-themed hero (gradient + story bubble row) ─────────── */}
      <div className="relative overflow-hidden border border-rose-200/60 bg-gradient-to-br from-rose-50 via-fuchsia-50 to-violet-50 p-6">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-fuchsia-300/30 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-rose-300/20 blur-3xl" />

        <div className="relative flex items-start gap-4">
          {/* Story-ring avatar */}
          <div className="relative w-14 h-14 flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-400 via-rose-500 to-fuchsia-600 p-[2px]">
              <div className="w-full h-full bg-white p-[2px]">
                <div className="w-full h-full bg-gradient-to-br from-rose-500 via-fuchsia-500 to-violet-600 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-ink-900">
                Instagram AI Bot
              </h1>
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 bg-rose-500/10 text-rose-700 border border-rose-300">
                <Instagram className="w-3 h-3" /> @{igHandle || "your.handle"}
              </span>
            </div>
            <p className="text-sm text-ink-600 mt-1">
              Auto-replies to <strong>DMs</strong>, <strong>comments</strong>,{" "}
              <strong>story mentions</strong> and <strong>shared posts</strong>{" "}
              in your brand voice.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={!!cfg.enabled}
                onChange={(e) => set({ enabled: e.target.checked })}
              />
              <span className="w-11 h-6 bg-ink-200 peer-checked:bg-gradient-to-r peer-checked:from-rose-500 peer-checked:to-fuchsia-600 transition relative">
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white shadow transition ${cfg.enabled ? "translate-x-5" : ""}`}
                />
              </span>
              <span className="text-xs font-bold text-ink-700">
                {cfg.enabled ? "Live" : "Paused"}
              </span>
            </label>
            <button
              type="button"
              onClick={() => setTesterOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-ink-900 text-white hover:bg-ink-800 transition"
            >
              <Play className="w-3.5 h-3.5" /> Test the bot
            </button>
          </div>
        </div>

        {/* Stat row IG-style */}
        <div className="relative grid grid-cols-3 gap-3 mt-5">
          {[
            { k: "Surfaces", v: "DM · Comment · Story" },
            { k: "Tone", v: "Creator-friendly" },
            { k: "Reply time", v: "< 2s" },
          ].map((s) => (
            <div
              key={s.k}
              className="bg-white/70 backdrop-blur border border-rose-200/50 px-3 py-2"
            >
              <p className="text-[10px] uppercase tracking-wider text-rose-600 font-bold">
                {s.k}
              </p>
              <p className="text-xs font-bold text-ink-900 truncate">{s.v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tone presets ──────────────────────────────────────────── */}
      <IgSection title="Brand voice" icon={Wand2}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {IG_TONE_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => set({ systemPrompt: p.prompt })}
              className={`text-left p-3 border-2 transition text-xs ${
                cfg.systemPrompt === p.prompt
                  ? "border-rose-500 bg-rose-50"
                  : "border-ink-100 hover:border-rose-300"
              }`}
            >
              <p className="font-bold text-ink-900">
                <span className="mr-1">{p.emoji}</span>
                {p.label}
              </p>
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
      </IgSection>

      {/* ── Business context ─────────────────────────────────────── */}
      <IgSection title="About your page" icon={Camera}>
        <p className="text-xs text-ink-500 mb-2">
          What does your page sell or talk about? Products, drops, collabs,
          shipping policy, opening hours, links — the more context, the better
          the bot replies.
        </p>
        <textarea
          className="input min-h-[140px]"
          value={cfg.businessContext}
          onChange={(e) => set({ businessContext: e.target.value })}
          placeholder={`Example:\n• Streetwear drop every Friday 8pm PKT\n• Sizes XS–XXL, ships across PK in 3 days\n• Collabs: DM with "collab" + media kit\n• Returns within 7 days, unworn only`}
        />
        <p className="text-[10px] text-ink-400 mt-1">
          {cfg.businessContext.length} characters
        </p>
      </IgSection>

      {/* ── FAQs ──────────────────────────────────────────────────── */}
      <IgSection
        title={`Saved replies (${cfg.faqs.length})`}
        icon={MessageCircle}
      >
        <p className="text-xs text-ink-500 mb-3">
          Pre-written answers for the most common DMs. The bot uses these first
          before falling back to AI.
        </p>

        <div className="space-y-2 mb-4">
          {cfg.faqs.map((f, i) => (
            <div
              key={i}
              className="border border-rose-100 bg-rose-50/30 p-3 flex items-start gap-3"
            >
              <Hash className="w-3.5 h-3.5 text-rose-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-ink-900">{f.question}</p>
                <p className="text-xs text-ink-600 mt-1">↳ {f.answer}</p>
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
              No saved replies yet — start with "How much?", "Where do you
              ship?", "Do you collab?".
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2">
          <input
            className="input"
            placeholder="Question (e.g. How much?)"
            value={newFaq.question}
            onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
          />
          <input
            className="input"
            placeholder="Reply"
            value={newFaq.answer}
            onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
          />
          <button
            type="button"
            onClick={addFaq}
            className="!py-2.5 !px-4 bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white font-bold text-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </IgSection>

      {/* ── Handoff + tuning grid ────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <IgSection title="Hand off to me" icon={AtSign}>
          <p className="text-xs text-ink-500 mb-3">
            When a follower says any of these, the bot pauses so you can step in
            personally.
          </p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {cfg.handoffKeywords.map((k) => (
              <span
                key={k}
                className="inline-flex items-center gap-1 text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-200 px-2 py-1"
              >
                #{k}
                <button
                  onClick={() => removeKeyword(k)}
                  className="hover:text-rose-900"
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
              placeholder="Add trigger word"
            />
            <button
              onClick={addKeyword}
              className="!py-2 !px-3 bg-rose-500 text-white"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </IgSection>

        <IgSection title="Reply behaviour" icon={Sparkles}>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="label !mb-0">Personality strength</label>
                <span className="text-[11px] font-mono text-rose-700">
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
                className="w-full accent-rose-500"
              />
              <p className="text-[10px] text-ink-400">
                Lower = consistent · Higher = expressive & on-brand
              </p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="label !mb-0">Max DM length</label>
                <span className="text-[11px] font-mono text-rose-700">
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
                className="w-full accent-rose-500"
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
        </IgSection>
      </div>

      {/* ── Sticky save ──────────────────────────────────────────── */}
      <div className="sticky bottom-3 z-10">
        <div className="bg-white border border-rose-200 shadow-card p-3 flex items-center justify-between">
          <div className="text-xs text-ink-500 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            Applies to all incoming{" "}
            <strong className="text-ink-700">Instagram</strong> messages.
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white font-bold text-sm px-5 py-2.5 flex items-center gap-2 disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Instagram bot
              </>
            )}
          </button>
        </div>
      </div>

      <BotTester open={testerOpen} onClose={closeTester} igHandle={igHandle} />
    </div>
  );
}

function BotTester({ open, onClose, igHandle }) {
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (open && msgs.length === 0) {
      setMsgs([
        {
          from: "bot",
          text: `Hey! I'm @${igHandle || "your.handle"}'s bot. Send a DM like a follower would — try a keyword, "hi", or a question — and I'll reply exactly how I would in real life. (Nothing is actually sent to Instagram.)`,
        },
      ]);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [msgs, sending]);

  const send = async () => {
    const t = text.trim();
    if (!t || sending) return;
    setMsgs((m) => [...m, { from: "user", text: t }]);
    setText("");
    setSending(true);
    try {
      const { data } = await api.post("/instagram/test/trigger", {
        triggerType: "direct_message",
        text: t,
        dryRun: true,
      });
      if (data.replies?.length) {
        setMsgs((m) => [
          ...m,
          ...data.replies.map((r) => ({ from: "bot", text: r })),
        ]);
      } else {
        setMsgs((m) => [
          ...m,
          {
            from: "system",
            text: "No automation matched this message. Add a keyword rule, enable the AI bot, or set a fallback reply.",
          },
        ]);
      }
    } catch (e) {
      setMsgs((m) => [
        ...m,
        {
          from: "system",
          text: e?.response?.data?.message || "Test failed. Try again.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right">
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-ink-100 bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white flex-shrink-0">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            <div className="leading-tight">
              <p className="font-bold text-sm">Bot Tester</p>
              <p className="text-[10px] text-white/80">
                Live preview · nothing sent to Instagram
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-white/15"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-3 bg-ink-50"
        >
          {msgs.map((m, i) =>
            m.from === "system" ? (
              <div
                key={i}
                className="mx-auto max-w-[90%] text-center text-[11px] text-ink-500 bg-amber-50 border border-amber-200 px-3 py-2"
              >
                {m.text}
              </div>
            ) : (
              <div
                key={i}
                className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 text-sm whitespace-pre-wrap ${
                    m.from === "user"
                      ? "bg-gradient-to-br from-rose-500 to-fuchsia-600 text-white rounded-2xl rounded-br-sm"
                      : "bg-white border border-ink-100 text-ink-800 rounded-2xl rounded-bl-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ),
          )}
          {sending && (
            <div className="flex justify-start">
              <div className="bg-white border border-ink-100 px-3 py-2 rounded-2xl rounded-bl-sm">
                <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
              </div>
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="p-3 border-t border-ink-100 flex-shrink-0">
          <p className="text-[10px] text-ink-400 mb-2">
            Tip: save your changes above before testing — the tester uses your
            last saved config.
          </p>
          <div className="flex items-center gap-2">
            <input
              className="input flex-1"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type a DM as a follower…"
              autoFocus
            />
            <button
              onClick={send}
              disabled={sending || !text.trim()}
              className="!py-2.5 !px-4 bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function IgSection({ title, icon: Icon, children }) {
  return (
    <div className="bg-white border border-ink-100 p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-8 h-8 bg-gradient-to-br from-rose-500 to-fuchsia-600 text-white flex items-center justify-center">
          <Icon className="w-4 h-4" />
        </span>
        <h2 className="font-bold text-ink-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}
