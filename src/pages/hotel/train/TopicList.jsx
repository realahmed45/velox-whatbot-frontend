/**
 * TopicList — topic filter for "See all answers".
 *   ≥ lg  a quiet vertical list (counts + "needs answer" dot)
 *   < lg  a native select
 */
import { ChevronDown } from "lucide-react";
import { field } from "./ui";

export function TopicSelect({ topics, topic, setTopic }) {
  return (
    <div className="relative w-full sm:w-56 lg:hidden">
      <label htmlFor="train-topic" className="sr-only">
        Topic
      </label>
      <select
        id="train-topic"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        className={`${field} appearance-none pr-9 font-medium`}
      >
        {topics.map((t) => (
          <option key={t.key} value={t.key}>
            {t.label} ({t.count}){t.missingRequired ? " · needs answers" : ""}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
    </div>
  );
}

export default function TopicList({ topics, topic, setTopic }) {
  return (
    <nav aria-label="Topics">
      <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-400">Topics</p>
      <ul className="space-y-0.5">
        {topics.map((t) => {
          const active = t.key === topic;
          return (
            <li key={t.key}>
              <button
                onClick={() => setTopic(t.key)}
                aria-current={active ? "true" : undefined}
                className={`flex min-h-[40px] w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[14px] transition-colors ${
                  active
                    ? "bg-[#0A0A0A] font-semibold text-white"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-[#0A0A0A]"
                }`}
              >
                <span className="min-w-0 flex-1 truncate">{t.label}</span>
                {t.missingRequired && (
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF5A1F]"
                    title="Has must-have questions without an answer"
                    aria-label="Needs answers"
                  />
                )}
                <span
                  className={`shrink-0 text-[12px] font-semibold tabular-nums ${
                    active ? "text-white/60" : "text-neutral-400"
                  }`}
                >
                  {t.count}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
