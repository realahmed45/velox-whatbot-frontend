/**
 * ReadinessCard — one slim row above the tabs: a small progress ring, what's
 * still missing, and a "Show me" button. Turns green once every must-have is in.
 */
import { motion } from "framer-motion";
import { ArrowRight, CircleCheck } from "lucide-react";

export default function ReadinessCard({ readiness, onFill }) {
  if (!readiness) return null;
  const answers = readiness.missingAnswers.length;
  const people = readiness.missingContacts.length;
  const answeredPct = readiness.total
    ? Math.round((readiness.answered / readiness.total) * 100)
    : 100;

  if (readiness.complete) {
    return (
      <div className="card px-4 py-3 sm:px-5 flex items-center gap-3.5 shadow-[inset_0_1px_0_#fff,0_0_0_1px_rgba(16,185,129,0.22),0_12px_30px_-20px_rgba(16,185,129,0.45)]">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500 text-white shadow-[0_8px_20px_-10px_rgba(16,185,129,0.7)]">
          <CircleCheck className="w-5 h-5" strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display font-semibold tracking-[-0.01em] text-ink-900">
            Your AI is <span className="font-serif italic font-normal">ready</span> to look after guests
          </p>
          <p className="text-xs text-ink-500 mt-0.5">
            Every must-have is filled in · {readiness.answered} of {readiness.total} questions answered
          </p>
        </div>
        <div className="hidden sm:block w-40 shrink-0">
          <div className="h-1.5 rounded-full bg-emerald-500/15 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${answeredPct}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <p className="text-[11px] text-ink-400 mt-1 text-right tabular-nums">{answeredPct}% answered</p>
        </div>
      </div>
    );
  }

  const parts = [];
  if (answers) parts.push(`${answers} must-have ${answers === 1 ? "answer" : "answers"}`);
  if (people) parts.push(`${people} ${people === 1 ? "contact" : "contacts"}`);

  return (
    <div className="card px-4 py-3 sm:px-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <div className="relative h-11 w-11 shrink-0">
          <svg viewBox="0 0 36 36" className="h-11 w-11 -rotate-90">
            <defs>
              <linearGradient id="train-ring-sunset" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FFB547" />
                <stop offset="35%" stopColor="#FF6A2B" />
                <stop offset="70%" stopColor="#FF3D77" />
                <stop offset="100%" stopColor="#7C5CFF" />
              </linearGradient>
            </defs>
            <circle cx="18" cy="18" r="15" fill="none" strokeWidth="4" className="stroke-ink-900/[0.07]" />
            <motion.circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              strokeWidth="4"
              strokeLinecap="round"
              stroke="url(#train-ring-sunset)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: Math.max(0.001, readiness.percent / 100) }}
              transition={{ type: "spring", stiffness: 60, damping: 16 }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-display text-[11px] font-semibold tabular-nums text-ink-900">
            {readiness.percent}%
          </span>
        </div>
        <div className="min-w-0">
          <p className="font-display font-semibold tracking-[-0.01em] text-ink-900">
            {parts.join(" and ")} still missing
          </p>
          <p className="text-xs text-ink-500 mt-0.5">
            Until then, some guests will need your team · {readiness.answered} of {readiness.total} questions answered
          </p>
        </div>
      </div>
      <button onClick={onFill} className="btn-primary group min-h-[40px] shrink-0 self-start sm:self-center text-sm">
        Show me what's missing
        <ArrowRight className="w-4 h-4 transition-transform duration-500 ease-spring group-hover:translate-x-1" />
      </button>
    </div>
  );
}
