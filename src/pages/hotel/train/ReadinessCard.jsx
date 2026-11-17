/**
 * ReadinessCard — one calm line above the tabs:
 *   "Your AI knows 68%  ·  13 quick answers left"  [progress]  [Continue]
 * Turns green once every must-have (answers + contacts) is in.
 */
import { ArrowRight, Check } from "lucide-react";
import { Progress, btnDark, panel } from "./ui";

export default function ReadinessCard({ readiness, onFill }) {
  if (!readiness) return null;
  const answers = readiness.missingAnswers.length;
  const people = readiness.missingContacts.length;

  if (readiness.complete) {
    return (
      <div className={`${panel} flex items-center gap-3.5 px-4 py-3.5 sm:px-5`}>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-500 text-white">
          <Check className="h-5 w-5" strokeWidth={2.5} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold tracking-[-0.01em] text-[#0A0A0A]">
            Your AI is ready to look after guests
          </p>
          <p className="mt-0.5 text-[13px] text-neutral-500">
            Every must-have is in · {readiness.answered} of {readiness.total} questions answered
          </p>
        </div>
      </div>
    );
  }

  const left = [];
  if (answers) left.push(`${answers} quick ${answers === 1 ? "answer" : "answers"}`);
  if (people) left.push(`${people} ${people === 1 ? "contact" : "contacts"}`);

  return (
    <div className={`${panel} flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:gap-5 sm:px-5`}>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold tracking-[-0.01em] text-[#0A0A0A]">
          Your AI knows <span className="tabular-nums text-[#FF5A1F]">{readiness.percent}%</span>
          <span className="font-normal text-neutral-400"> — </span>
          <span className="font-medium text-neutral-600">{left.join(" and ")} left</span>
        </p>
        <Progress value={readiness.percent} className="mt-2.5 max-w-md" />
      </div>
      <button onClick={onFill} className={`${btnDark} group shrink-0 self-start sm:self-center`}>
        Continue
        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      </button>
    </div>
  );
}
