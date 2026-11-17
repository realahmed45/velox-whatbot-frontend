/**
 * GuidedMode — the default "Guest questions" view: ONE question at a time.
 *
 *   must-have unanswered  →  short break ("essentials done!")  →  other unanswered  →  done
 *
 * The queue is a snapshot taken when the session starts, so counts stay stable
 * ("Question 3 of 13 must-haves") while answers are saved. Skipped questions
 * can be revisited from the completion screen. Writes go through the same
 * `onSave(faq, { question, answer })` as the full list (PATCH /training/:id).
 */
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, CornerDownLeft, List, Loader2, PartyPopper, Plus, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { TEST_PATH, hasText } from "./shared";
import { Progress, btnGhost, btnPrimary, btnSecondary, field, mustHavePill, panel, softPill } from "./ui";

const ease = [0.16, 1, 0.3, 1];

function buildSession(faqs, onlyIds) {
  const open = faqs.filter((f) => !hasText(f.answer) && (!onlyIds || onlyIds.has(f._id)));
  return {
    req: open.filter((f) => f.required).map((f) => f._id),
    opt: open.filter((f) => !f.required).map((f) => f._id),
  };
}

const firstPhase = (s) => (s.req.length ? "required" : s.opt.length ? "break" : "done");

export default function GuidedMode({ faqs, categories, onSave, onSeeAll, onAddQuestion }) {
  const [session, setSession] = useState(() => buildSession(faqs));
  const [phase, setPhase] = useState(() => firstPhase(session));
  const [idx, setIdx] = useState(0);
  const [skipped, setSkipped] = useState(() => new Set());
  const [firstRun] = useState(() => session.req.length + session.opt.length > 0);

  const list = phase === "required" ? session.req : phase === "optional" ? session.opt : [];
  const currentId = list[idx];
  const faq = currentId ? faqs.find((f) => f._id === currentId) : null;

  const advance = () => {
    if (idx + 1 < list.length) {
      setIdx(idx + 1);
      return;
    }
    setIdx(0);
    if (phase === "required") setPhase(session.opt.length ? "break" : "done");
    else setPhase("done");
  };

  // A question deleted elsewhere (e.g. in "See all answers") → move on.
  useEffect(() => {
    if ((phase === "required" || phase === "optional") && currentId && !faq) advance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentId, faq]);

  const skip = () => {
    setSkipped((s) => new Set(s).add(currentId));
    advance();
  };

  const restart = (onlyIds) => {
    const s = buildSession(faqs, onlyIds);
    setSession(s);
    setSkipped(new Set());
    setIdx(0);
    setPhase(firstPhase(s));
  };

  const skippedOpen = [...skipped].filter((id) => {
    const f = faqs.find((x) => x._id === id);
    return f && !hasText(f.answer);
  });
  const skippedReqOpen = skippedOpen.filter((id) => faqs.find((x) => x._id === id)?.required);

  const catLabel = (key) => categories.find((c) => c.key === key)?.label;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[13px] font-medium text-neutral-500">
          {phase === "required" || phase === "optional" ? "One question at a time" : "Guest questions"}
        </p>
        <button onClick={onSeeAll} className={btnGhost}>
          <List className="h-4 w-4" />
          See all answers
        </button>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {faq && (phase === "required" || phase === "optional") ? (
          <motion.div
            key={faq._id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.28, ease }}
          >
            <QuestionStep
              faq={faq}
              topic={catLabel(faq.category)}
              step={idx + 1}
              total={list.length}
              phase={phase}
              onBack={idx > 0 ? () => setIdx(idx - 1) : null}
              onSkip={skip}
              onSave={async (answer) => {
                const ok = await onSave(faq, { question: faq.question, answer });
                if (ok) advance();
                return ok;
              }}
            />
          </motion.div>
        ) : phase === "break" ? (
          <motion.div
            key="break"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease }}
          >
            <Milestone
              icon={Sparkles}
              title={skippedReqOpen.length ? "Essentials covered — nearly there" : "All must-haves done!"}
              text={
                <>
                  {skippedReqOpen.length > 0 && (
                    <>
                      You skipped {skippedReqOpen.length} must-have{" "}
                      {skippedReqOpen.length === 1 ? "question" : "questions"} — you can come back to{" "}
                      {skippedReqOpen.length === 1 ? "it" : "them"} any time.{" "}
                    </>
                  )}
                  {session.opt.length} more optional{" "}
                  {session.opt.length === 1 ? "question makes" : "questions make"} your AI even smarter. Answer
                  as many as you like.
                </>
              }
            >
              <button onClick={() => { setIdx(0); setPhase("optional"); }} className={`${btnPrimary} group`}>
                Keep going
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>
              <button onClick={() => setPhase("done")} className={btnSecondary}>
                I'm done for now
              </button>
            </Milestone>
          </motion.div>
        ) : (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease }}
          >
            <Milestone
              icon={firstRun ? PartyPopper : Check}
              celebrate
              title={firstRun ? "Lovely — you're all caught up!" : "Every question is answered"}
              text={
                skippedOpen.length
                  ? `You skipped ${skippedOpen.length} ${skippedOpen.length === 1 ? "question" : "questions"}. Pick ${skippedOpen.length === 1 ? "it" : "them"} up now, or whenever you're ready.`
                  : "Your AI now answers guests with your own words. Try it out, or add questions guests often ask you."
              }
            >
              {skippedOpen.length > 0 ? (
                <button onClick={() => restart(new Set(skippedOpen))} className={`${btnPrimary} group`}>
                  Answer the {skippedOpen.length} I skipped
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
              ) : (
                <Link to={TEST_PATH} className={`${btnPrimary} group`}>
                  Test your AI
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              )}
              <button onClick={onAddQuestion} className={btnSecondary}>
                <Plus className="h-4 w-4" />
                Add a question
              </button>
              <button onClick={onSeeAll} className={btnSecondary}>
                See all answers
              </button>
            </Milestone>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function QuestionStep({ faq, topic, step, total, phase, onBack, onSkip, onSave }) {
  const [answer, setAnswer] = useState(faq.answer || "");
  const [saving, setSaving] = useState(false);
  const ref = useRef(null);
  const canSave = hasText(answer) && !saving;

  useEffect(() => {
    // Focus without scrolling the page on small screens.
    ref.current?.focus({ preventScroll: true });
  }, []);

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    const ok = await onSave(answer.trim());
    if (!ok) setSaving(false);
  };

  return (
    <div className={`${panel} p-5 sm:p-8`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[13px] font-semibold text-[#0A0A0A]">
          Question <span className="tabular-nums">{step}</span> of{" "}
          <span className="tabular-nums">{total}</span>{" "}
          <span className="font-medium text-neutral-500">{phase === "required" ? "must-haves" : "extras"}</span>
        </p>
        <div className="flex items-center gap-1.5">
          {topic && <span className={softPill}>{topic}</span>}
          {faq.required && <span className={mustHavePill}>Must-have</span>}
        </div>
      </div>
      <Progress value={((step - 1) / total) * 100} className="mt-3" />

      <p className="mt-6 text-[13px] font-medium text-neutral-500">A guest asks</p>
      <h2 className="mt-1 text-[22px] sm:text-[26px] font-semibold leading-tight tracking-[-0.02em] text-[#0A0A0A]">
        {faq.question}
      </h2>

      <label htmlFor={`guided-${faq._id}`} className="mt-6 block text-[13px] font-medium text-neutral-500">
        Your AI answers
      </label>
      <textarea
        id={`guided-${faq._id}`}
        ref={ref}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows={4}
        maxLength={2000}
        placeholder="Write it the way you'd say it to a guest…"
        className={`${field} mt-1.5 min-h-[128px] resize-y px-4 py-3 text-[16px] leading-relaxed`}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            save();
          }
        }}
      />
      <p className="mt-2 hidden items-center gap-1.5 text-[12px] text-neutral-400 sm:flex">
        <CornerDownLeft className="h-3.5 w-3.5" />
        Ctrl + Enter to save. Your AI may send this word for word — keep it friendly and complete.
      </p>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
        {onBack ? (
          <button onClick={onBack} className={`${btnGhost} sm:mr-auto`}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        ) : (
          <span className="hidden sm:block sm:mr-auto" />
        )}
        <button onClick={onSkip} disabled={saving} className={btnSecondary}>
          Skip
        </button>
        <button onClick={save} disabled={!canSave} className={`${btnPrimary} group sm:min-w-[150px]`}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save &amp; next
          {!saving && <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />}
        </button>
      </div>
    </div>
  );
}

function Milestone({ icon: Icon, title, text, celebrate, children }) {
  return (
    <div className={`${panel} relative overflow-hidden px-6 py-10 text-center sm:px-10 sm:py-12`}>
      {celebrate && (
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-6 flex justify-center gap-10">
          {["bg-[#FF5A1F]", "bg-[#0A0A0A]", "bg-amber-400", "bg-[#FF5A1F]", "bg-emerald-400"].map((c, i) => (
            <motion.span
              key={i}
              className={`h-1.5 w-1.5 rounded-full ${c}`}
              initial={{ opacity: 0, y: 14, scale: 0.4 }}
              animate={{ opacity: [0, 1, 0.7], y: [14, -6, 0], scale: 1 }}
              transition={{ duration: 0.9, delay: 0.1 + i * 0.07, ease }}
            />
          ))}
        </div>
      )}
      <motion.span
        initial={{ scale: 0.6, rotate: -12 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 18 }}
        className="relative mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#FF5A1F] text-[#0A0A0A] shadow-[0_3px_0_0_#0A0A0A]"
      >
        <Icon className="h-6 w-6" strokeWidth={2} />
      </motion.span>
      <h2 className="mt-5 text-[22px] font-semibold tracking-[-0.02em] text-[#0A0A0A]">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-neutral-500">{text}</p>
      <div className="mt-7 flex flex-col items-stretch justify-center gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        {children}
      </div>
    </div>
  );
}
