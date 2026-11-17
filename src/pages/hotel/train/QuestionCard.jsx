/** QuestionCard — one row in "See all answers", with inline answer editing. */
import { useState } from "react";
import { Check, Loader2, Pencil, Trash2 } from "lucide-react";
import { hasText } from "./shared";
import { btnGhost, btnPrimary, field, iconBtn, iconBtnDanger, mustHavePill } from "./ui";

export default function QuestionCard({ faq, topicLabel, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [question, setQuestion] = useState(faq.question);
  const [answer, setAnswer] = useState(faq.answer || "");
  const [saving, setSaving] = useState(false);
  const answered = hasText(faq.answer);

  const open = () => {
    setQuestion(faq.question);
    setAnswer(faq.answer || "");
    setEditing(true);
  };

  const save = async () => {
    if (!hasText(question) || saving) return;
    setSaving(true);
    const ok = await onSave(faq, { question: question.trim(), answer: answer.trim() });
    setSaving(false);
    if (ok) setEditing(false);
  };

  return (
    <div className={`group/q px-4 py-4 sm:px-5 transition-colors ${editing ? "bg-[#FF5A1F]/[0.03]" : "hover:bg-neutral-50/70"}`}>
      <div className="flex items-start gap-3">
        <span
          className={`mt-[3px] grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full ${
            answered ? "bg-emerald-500 text-white" : "border-[1.5px] border-dashed border-neutral-300"
          }`}
          title={answered ? "Answered" : "Not answered yet"}
        >
          {answered && <Check className="h-3 w-3" strokeWidth={3} />}
        </span>
        <div className="min-w-0 flex-1">
          {editing ? (
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className={`${field} font-semibold`}
              aria-label="Question"
              maxLength={300}
            />
          ) : (
            <p className="text-[15px] font-semibold leading-snug tracking-[-0.01em] text-[#0A0A0A]">{faq.question}</p>
          )}
          {(faq.required || topicLabel) && !editing && (
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              {faq.required && <span className={mustHavePill}>Must-have</span>}
              {topicLabel && <span className="text-[12px] text-neutral-400">{topicLabel}</span>}
            </div>
          )}

          {editing ? (
            <div className="mt-3">
              <label className="text-[13px] font-medium text-neutral-500">Your AI answers</label>
              <textarea
                autoFocus
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={3}
                maxLength={2000}
                placeholder="Write it the way you'd say it to a guest."
                className={`${field} mt-1 min-h-[96px]`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) save();
                  if (e.key === "Escape") setEditing(false);
                }}
              />
              <p className="mt-1.5 text-[12px] text-neutral-400">
                Your AI may send this word for word, so keep it friendly and complete. Leave it empty if the AI
                shouldn't answer this yet.
              </p>
              <div className="mt-3 flex items-center justify-end gap-2">
                <button onClick={() => setEditing(false)} className={btnGhost}>
                  Cancel
                </button>
                <button onClick={save} disabled={!hasText(question) || saving} className={btnPrimary}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Save
                </button>
              </div>
            </div>
          ) : answered ? (
            <button
              onClick={open}
              className="mt-1.5 block w-full whitespace-pre-line text-left text-[14px] leading-relaxed text-neutral-600 transition-colors hover:text-[#0A0A0A]"
            >
              {faq.answer}
            </button>
          ) : (
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
              <p className="text-[14px] text-neutral-400">Not answered — the AI won't use this yet.</p>
              <button
                onClick={open}
                className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#FF5A1F] transition-colors hover:text-[#E84A12]"
              >
                <Pencil className="h-3.5 w-3.5" />
                Write the answer
              </button>
            </div>
          )}
        </div>
        {!editing && (
          <div className="-mr-2 -mt-2 flex shrink-0 items-center opacity-100 transition-opacity lg:opacity-0 lg:group-hover/q:opacity-100 lg:focus-within:opacity-100">
            <button onClick={open} title="Edit" aria-label="Edit answer" className={iconBtn}>
              <Pencil className="h-4 w-4" />
            </button>
            <button onClick={() => onDelete(faq)} title="Delete" aria-label="Delete question" className={iconBtnDanger}>
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
