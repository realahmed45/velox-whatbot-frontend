/** QuestionCard — one guest question with inline answer editing. */
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Pencil, Trash2 } from "lucide-react";
import { ease, hasText, mustHave, ringFocus, ringWarn } from "./shared";

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
    <div
      className={`card group/q px-4 py-3.5 transition-[box-shadow] duration-300 ${
        editing
          ? ringFocus
          : !answered && faq.required
            ? ringWarn
            : "hover:shadow-[inset_0_1px_0_#fff,0_0_0_1px_rgba(255,106,43,0.18),0_12px_30px_-18px_rgba(255,61,119,0.3)]"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full ${
            answered ? "bg-emerald-500 text-white" : "ring-[1.5px] ring-inset ring-ink-900/15"
          }`}
          title={answered ? "Answered" : "Not answered yet"}
        >
          {answered && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
        </span>
        <div className="min-w-0 flex-1">
          {editing ? (
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="input font-bold"
              aria-label="Question"
              maxLength={300}
            />
          ) : (
            <p className="font-display font-semibold tracking-[-0.01em] text-ink-900 text-[15px] leading-snug">
              {faq.question}
            </p>
          )}
          {(faq.required || topicLabel) && !editing && (
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              {faq.required && <span className={mustHave}>Must-have</span>}
              {topicLabel && <span className="text-[11px] font-medium text-ink-400">{topicLabel}</span>}
            </div>
          )}
        </div>
        {!editing && (
          <div className="flex items-center gap-0.5 shrink-0 -mr-1.5 -mt-1.5 opacity-100 lg:opacity-60 lg:group-hover/q:opacity-100 transition-opacity">
            <button
              onClick={open}
              title="Edit"
              aria-label="Edit answer"
              className="grid h-9 w-9 place-items-center rounded-xl text-ink-400 transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:text-sunset-flame hover:bg-sunset-soft active:scale-90"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(faq)}
              title="Delete"
              aria-label="Delete question"
              className="grid h-9 w-9 place-items-center rounded-xl text-ink-400 transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:text-rose-600 hover:bg-rose-50 active:scale-90"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="pl-7">
        <AnimatePresence initial={false} mode="wait">
          {editing ? (
            <motion.div
              key="edit"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease }}
              className="overflow-hidden"
            >
              <div className="mt-3">
                <label className="text-xs font-semibold text-ink-500">Your AI answers</label>
                <textarea
                  autoFocus
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={3}
                  maxLength={2000}
                  placeholder="Write it the way you'd say it to a guest."
                  className="input mt-1 min-h-[96px]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) save();
                    if (e.key === "Escape") setEditing(false);
                  }}
                />
                <p className="text-[11px] text-ink-400 mt-1.5">
                  Your AI may send this word for word, so keep it friendly and complete.
                  Leave it empty if the AI shouldn't answer this yet.
                </p>
                <div className="flex items-center justify-end gap-2 mt-3">
                  <button onClick={() => setEditing(false)} className="btn-ghost min-h-[40px]">
                    Cancel
                  </button>
                  <button onClick={save} disabled={!hasText(question) || saving} className="btn-primary group min-h-[40px]">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 transition-transform duration-500 ease-spring group-hover:scale-125" />}
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          ) : answered ? (
            <motion.button
              key="answer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={open}
              className="mt-1.5 block w-full text-left text-sm text-ink-600 whitespace-pre-line leading-relaxed hover:text-ink-900 transition-colors"
            >
              {faq.answer}
            </motion.button>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5"
            >
              <p className="text-sm text-ink-500">Not answered — the AI won't use this yet.</p>
              <button
                onClick={open}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-sunset-flame hover:text-sunset-magenta transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                Write the answer
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
