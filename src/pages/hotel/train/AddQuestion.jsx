/** AddQuestion — the inline "New question" form. */
import { useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { hasText } from "./shared";
import { btnGhost, btnPrimary, field, iconBtn, labelCls } from "./ui";

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
    <div className="rounded-2xl border border-[#FF5A1F]/40 bg-white p-4 shadow-[0_0_0_4px_rgba(255,90,31,0.08)] sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[15px] font-semibold tracking-[-0.01em] text-[#0A0A0A]">New question</p>
        <button onClick={onCancel} aria-label="Close" className={`${iconBtn} -mr-2`}>
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-2 grid gap-3 sm:grid-cols-[1fr_200px]">
        <div>
          <label className={labelCls}>When a guest asks</label>
          <input
            autoFocus={!draft.question}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={300}
            placeholder="e.g. Do you have a spa?"
            className={`${field} mt-1.5`}
          />
        </div>
        <div>
          <label className={labelCls}>Topic</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={`${field} mt-1.5`}>
            {categories.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <label className={`${labelCls} mt-3`}>Your AI answers</label>
      <textarea
        autoFocus={!!draft.question}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        maxLength={2000}
        rows={3}
        placeholder="e.g. Yes — our spa is open 9am to 9pm. Massages start at USD 30."
        className={`${field} mt-1.5 min-h-[96px]`}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
        }}
      />
      <div className="mt-3 flex items-center justify-end gap-2">
        <button onClick={onCancel} className={btnGhost}>
          Cancel
        </button>
        <button onClick={submit} disabled={!canSave} className={btnPrimary}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add question
        </button>
      </div>
    </div>
  );
}
