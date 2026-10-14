/**
 * Train your AI — the hotel's own answers, and a place to test them.
 *
 * Left: the questions guests ask and the hotel's answer to each. Starts with
 * the 20 every hotel gets asked; the hotelier edits, deletes and adds. Right:
 * a chat box that asks the REAL AI, so a hotelier (or an investor watching)
 * can type a question and see the trained answer come back.
 *
 * Saving is per question, on the spot — no page-level Save button to forget.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api from "@/services/api";
import toast from "react-hot-toast";
import {
  Bot,
  Check,
  GraduationCap,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Send,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useConfirm } from "@/components/ui/ConfirmDialog";

const SUGGESTED_TESTS = [
  "What time is check-in?",
  "Is breakfast included?",
  "Do you offer airport pickup?",
  "Can I bring my dog?",
];

export default function TrainAiPage() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [adding, setAdding] = useState(false);
  const confirm = useConfirm();

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/training");
      setFaqs(data.faqs || []);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Couldn't load your training");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (id, form) => {
    try {
      const { data } = id
        ? await api.patch(`/training/${id}`, form)
        : await api.post("/training", form);
      setFaqs(data.faqs || []);
      setEditingId(null);
      setAdding(false);
      toast.success(id ? "Answer updated" : "Question added");
      return true;
    } catch (e) {
      toast.error(e?.response?.data?.message || "Couldn't save that");
      return false;
    }
  };

  const remove = async (faq) => {
    const yes = await confirm({
      title: "Delete this question?",
      description: `"${faq.question}" — your AI will stop using this answer.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!yes) return;
    try {
      const { data } = await api.delete(`/training/${faq._id}`);
      setFaqs(data.faqs || []);
      toast.success("Deleted");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Couldn't delete that");
    }
  };

  const reset = async () => {
    const yes = await confirm({
      title: "Restore the 20 starter questions?",
      description:
        "This replaces everything on this page with the original 20 questions and answers.",
      confirmLabel: "Restore",
      danger: true,
    });
    if (!yes) return;
    try {
      const { data } = await api.post("/training/reset");
      setFaqs(data.faqs || []);
      toast.success("Starter questions restored");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Couldn't restore");
    }
  };

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqs;
    return faqs.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q),
    );
  }, [faqs, query]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-brand-500/10 flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6 text-brand-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-ink-900">Train your AI</h1>
            <p className="text-sm text-ink-500 mt-0.5 max-w-xl">
              The questions guests ask, and how you want them answered. Your AI
              replies to guests on every channel using exactly these answers.
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
        {/* ── Knowledge ─────────────────────────────────────────────── */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${faqs.length} questions`}
                className="input pl-9"
              />
            </div>
            <button
              onClick={() => {
                setAdding(true);
                setEditingId(null);
              }}
              className="inline-flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl px-4 py-2.5 transition"
            >
              <Plus className="w-4 h-4" />
              Add question
            </button>
          </div>

          {adding && (
            <div className="mb-3">
              <FaqEditor
                initial={{ question: "", answer: "" }}
                onCancel={() => setAdding(false)}
                onSave={(form) => save(null, form)}
              />
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
            </div>
          ) : shown.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink-200 bg-white p-10 text-center">
              <p className="font-bold text-ink-900">
                {faqs.length ? "No questions match that search" : "No questions yet"}
              </p>
              <p className="text-sm text-ink-500 mt-1">
                {faqs.length
                  ? "Try a different word."
                  : "Add your first question, or restore the 20 starters."}
              </p>
              {!faqs.length && (
                <button
                  onClick={reset}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:text-brand-700"
                >
                  <RotateCcw className="w-4 h-4" />
                  Restore starter questions
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              {shown.map((f) =>
                editingId === f._id ? (
                  <FaqEditor
                    key={f._id}
                    initial={f}
                    onCancel={() => setEditingId(null)}
                    onSave={(form) => save(f._id, form)}
                  />
                ) : (
                  <div
                    key={f._id}
                    className="group rounded-2xl border border-ink-100 bg-white p-4 hover:border-ink-200 transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-ink-900 text-[15px]">
                          {f.question}
                        </p>
                        <p className="text-sm text-ink-600 mt-1 whitespace-pre-line leading-relaxed">
                          {f.answer}
                        </p>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          onClick={() => {
                            setEditingId(f._id);
                            setAdding(false);
                          }}
                          title="Edit"
                          className="p-2 rounded-lg text-ink-400 hover:text-ink-800 hover:bg-ink-50 transition"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => remove(f)}
                          title="Delete"
                          className="p-2 rounded-lg text-ink-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}

          {faqs.length > 0 && (
            <button
              onClick={reset}
              className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-400 hover:text-ink-700 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restore the 20 starter questions
            </button>
          )}
        </div>

        {/* ── Test it ───────────────────────────────────────────────── */}
        <div className="lg:sticky lg:top-6">
          <TestChat />
        </div>
      </div>
    </div>
  );
}

/* ── Add / edit one question ─────────────────────────────────────────── */
function FaqEditor({ initial, onSave, onCancel }) {
  const [question, setQuestion] = useState(initial.question || "");
  const [answer, setAnswer] = useState(initial.answer || "");
  const [saving, setSaving] = useState(false);
  const canSave = question.trim() && answer.trim() && !saving;

  const submit = async () => {
    if (!canSave) return;
    setSaving(true);
    await onSave({ question: question.trim(), answer: answer.trim() });
    setSaving(false);
  };

  return (
    <div className="rounded-2xl border-2 border-brand-200 bg-white p-4 shadow-card">
      <label className="text-xs font-bold text-ink-500">When a guest asks</label>
      <input
        autoFocus
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="e.g. Do you have a spa?"
        className="input mt-1"
      />
      <label className="text-xs font-bold text-ink-500 mt-3 block">
        Your AI answers
      </label>
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="e.g. Yes — our spa is open 9am to 9pm. Massages start at USD 30."
        className="input mt-1 min-h-[96px]"
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
        }}
      />
      <div className="flex items-center justify-end gap-2 mt-3">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-ink-500 hover:text-ink-800 px-3 py-2 transition"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={!canSave}
          className="inline-flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl px-4 py-2 transition disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Save
        </button>
      </div>
    </div>
  );
}

/* ── Ask the real AI ─────────────────────────────────────────────────── */
function TestChat() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, thinking]);

  const ask = async (raw) => {
    const message = String(raw ?? text).trim();
    if (!message || thinking) return;
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((m) => [...m, { role: "user", content: message }]);
    setText("");
    setThinking(true);
    try {
      const { data } = await api.post("/training/test", { message, history });
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: data.reply || "…",
          fromTraining: data.fromTraining,
        },
      ]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            e?.response?.data?.message || "The AI couldn't answer just now. Try again.",
          error: true,
        },
      ]);
    } finally {
      setThinking(false);
    }
  };

  return (
    <div className="rounded-2xl border border-ink-100 bg-white shadow-card overflow-hidden flex flex-col h-[560px]">
      <div className="px-4 py-3.5 border-b border-ink-100 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center">
          <Bot className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-ink-900 text-sm">Test your AI</p>
          <p className="text-[11px] text-ink-400">
            Ask like a guest would. Nothing is sent to anyone.
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="text-[11px] font-semibold text-ink-400 hover:text-ink-700"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-ink-50/40">
        {messages.length === 0 && (
          <div className="text-center pt-6">
            <Sparkles className="w-6 h-6 text-brand-400 mx-auto" />
            <p className="text-sm text-ink-500 mt-2">Try one of these</p>
            <div className="mt-3 flex flex-col items-center gap-2">
              {SUGGESTED_TESTS.map((q) => (
                <button
                  key={q}
                  onClick={() => ask(q)}
                  className="text-xs font-semibold text-ink-700 bg-white border border-ink-200 hover:border-brand-300 rounded-full px-3.5 py-1.5 transition"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className="max-w-[85%]">
              <div
                className={`rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-line leading-relaxed ${
                  m.role === "user"
                    ? "bg-brand-500 text-white rounded-br-md"
                    : m.error
                      ? "bg-rose-50 text-rose-800 border border-rose-100 rounded-bl-md"
                      : "bg-white text-ink-800 border border-ink-100 rounded-bl-md"
                }`}
              >
                {m.content}
              </div>
              {m.fromTraining && (
                <p className="mt-1 ml-1 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                  <GraduationCap className="w-3 h-3" />
                  Answered from your training
                </p>
              )}
            </div>
          </div>
        ))}

        {thinking && (
          <div className="flex justify-start">
            <div className="bg-white border border-ink-100 rounded-2xl rounded-bl-md px-3.5 py-2.5">
              <Loader2 className="w-4 h-4 text-ink-400 animate-spin" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask();
        }}
        className="p-3 border-t border-ink-100 flex items-center gap-2"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask a question…"
          className="input flex-1"
        />
        <button
          type="submit"
          disabled={!text.trim() || thinking}
          className="w-10 h-10 shrink-0 inline-flex items-center justify-center bg-brand-500 hover:bg-brand-600 text-white rounded-xl transition disabled:opacity-50"
          aria-label="Send"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
