/** AddQuestion — the inline "New question" form. */
import { useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { hasText, ringFocus } from "./shared";

export default function AddQuestion({ draft, defaultCategory, categories, onAdd, onCancel }) {
  const [question, setQuestion] = useState(draft.question || "");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState(draft.category || defaultCategory);
  const [saving, setSaving] = useState(false);
  const canSave = hasText(question) && hasText(answer) && !saving;

  const submit = async () => {
    if (!canSave) return;
    setSaving(true);
    await onAdd({ question: question.trim(), answer: answer.trim(), category });
    setSaving(false);
  };

  return (
    <div className={`glass-strong rounded-2xl p-4 sm:p-5 ${ringFocus}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-sunset text-white shadow-[0_6px_16px_-6px_rgba(255,61,119,0.6)]">
            <Plus className="h-4 w-4" />
          </span>
          <p className="font-display font-semibold tracking-[-0.01em] text-ink-900">New question</p>
        </div>
        <button onClick={onCancel} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-lg text-ink-400 transition-all duration-300 ease-spring hover:rotate-90 hover:bg-ink-900/[0.05] hover:text-ink-700">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="grid sm:grid-cols-[1fr_220px] gap-3 mt-3">
        <div>
          <label className="text-xs font-semibold text-ink-500">When a guest asks</label>
          <input
            autoFocus={!draft.question}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={300}
            placeholder="e.g. Do you have a spa?"
            className="input mt-1"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-ink-500">Topic</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input mt-1">
            {categories.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <label className="text-xs font-semibold text-ink-500 mt-3 block">Your AI answers</label>
      <textarea
        autoFocus={!!draft.question}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        maxLength={2000}
        rows={3}
        placeholder="e.g. Yes — our spa is open 9am to 9pm. Massages start at USD 30."
        className="input mt-1 min-h-[96px]"
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
        }}
      />
      <div className="flex items-center justify-end gap-2 mt-3">
        <button onClick={onCancel} className="btn-ghost min-h-[40px]">
          Cancel
        </button>
        <button onClick={submit} disabled={!canSave} className="btn-primary group min-h-[40px]">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 transition-transform duration-500 ease-spring group-hover:rotate-90" />}
          Add question
        </button>
      </div>
    </div>
  );
}
