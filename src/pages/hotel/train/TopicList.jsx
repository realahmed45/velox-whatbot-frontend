/**
 * TopicList — every topic visible at once, no horizontal dragging.
 *   ≥ lg  a vertical list in a sticky card (counts + "needs answer" dot)
 *   < lg  a native select (shows the count and a "needs answers" hint)
 */
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { spring } from "./shared";

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
        className="input appearance-none pr-9 font-medium"
      >
        {topics.map((t) => (
          <option key={t.key} value={t.key}>
            {t.label} ({t.count}){t.missingRequired ? " · needs answers" : ""}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
    </div>
  );
}

export default function TopicList({ topics, topic, setTopic }) {
  return (
    <nav aria-label="Topics" className="card p-2">
      <p className="px-2.5 pt-1.5 pb-2 text-[11px] font-bold uppercase tracking-wide text-ink-400">
        Topics
      </p>
      <ul className="space-y-0.5">
        {topics.map((t) => {
          const active = t.key === topic;
          return (
            <li key={t.key}>
              <button
                onClick={() => setTopic(t.key)}
                aria-current={active ? "true" : undefined}
                className={`relative w-full flex items-center gap-2 rounded-xl px-2.5 py-2 text-left text-sm transition-colors ${
                  active ? "text-white font-semibold" : "text-ink-700 hover:bg-white/80 hover:text-ink-900"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="train-topic-pill"
                    transition={spring}
                    className="absolute inset-0 rounded-xl bg-night-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_8px_20px_-10px_rgba(255,61,119,0.55)]"
                  />
                )}
                <span className="relative min-w-0 flex-1 truncate">{t.label}</span>
                {t.missingRequired && (
                  <span
                    className="relative h-2 w-2 shrink-0 rounded-full bg-sunset-flame"
                    title="Has must-have questions without an answer"
                    aria-label="Needs answers"
                  />
                )}
                <span
                  className={`relative shrink-0 min-w-[26px] text-center text-xs font-semibold tabular-nums rounded-full px-1.5 py-0.5 ${
                    active ? "bg-white/15 text-white" : "bg-ink-900/[0.05] text-ink-500"
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
