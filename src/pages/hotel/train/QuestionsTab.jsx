/**
 * QuestionsTab — "Guest questions".
 *   left   TopicList (desktop) / TopicSelect (mobile)
 *   main   one toolbar (search · Unanswered only · Add question), then the list
 */
import { useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CircleCheck, MessageCircleQuestion, Plus, RotateCcw, Search } from "lucide-react";
import TopicList, { TopicSelect } from "./TopicList";
import QuestionCard from "./QuestionCard";
import AddQuestion from "./AddQuestion";
import { OTHER, ease, hasText, spring } from "./shared";

export default function QuestionsTab({
  faqs,
  categories,
  topic,
  setTopic,
  query,
  setQuery,
  unansweredOnly,
  setUnansweredOnly,
  addDraft,
  setAddDraft,
  onSave,
  onAdd,
  onDelete,
  onReset,
}) {
  const known = useMemo(() => new Set(categories.map((c) => c.key)), [categories]);
  const catOf = useCallback((f) => (known.has(f.category) ? f.category : OTHER), [known]);

  const topics = useMemo(() => {
    const stats = (list) => ({
      count: list.length,
      unanswered: list.filter((f) => !hasText(f.answer)).length,
      missingRequired: list.some((f) => f.required && !hasText(f.answer)),
    });
    const rows = [{ key: "all", label: "All topics", ...stats(faqs) }];
    for (const c of categories) rows.push({ ...c, ...stats(faqs.filter((f) => f.category === c.key)) });
    const other = faqs.filter((f) => catOf(f) === OTHER);
    if (other.length) rows.push({ key: OTHER, label: "Other", ...stats(other) });
    return rows;
  }, [faqs, categories, catOf]);

  const labelOf = (key) =>
    key === OTHER ? "Other" : categories.find((c) => c.key === key)?.label || "Other";

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = faqs;
    if (topic !== "all") list = list.filter((f) => catOf(f) === topic);
    if (unansweredOnly) list = list.filter((f) => !hasText(f.answer));
    if (q)
      list = list.filter(
        (f) =>
          f.question.toLowerCase().includes(q) ||
          String(f.answer || "").toLowerCase().includes(q),
      );
    if (unansweredOnly) list = [...list].sort((a, b) => Number(!!b.required) - Number(!!a.required));
    return list;
  }, [faqs, topic, unansweredOnly, query, catOf]);

  const current = topics.find((t) => t.key === topic) || topics[0];
  const defaultAddCategory =
    topic !== "all" && topic !== OTHER ? topic : categories[0]?.key || "general";

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] items-start">
      <aside className="hidden lg:block lg:sticky lg:top-4">
        <TopicList topics={topics} topic={topic} setTopic={setTopic} />
      </aside>

      <div className="min-w-0">
        {/* Toolbar */}
        <div className="card p-2.5 flex flex-wrap items-center gap-2">
          <TopicSelect topics={topics} topic={topic} setTopic={setTopic} />
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search questions and answers"
              className="input pl-9"
              aria-label="Search questions"
            />
          </div>
          <div className="flex w-full sm:w-auto items-center gap-2">
            <label className="inline-flex flex-1 sm:flex-none min-h-[42px] items-center gap-2.5 text-sm font-medium text-ink-700 rounded-xl px-3 py-2 cursor-pointer select-none hover:bg-white/80 transition-colors whitespace-nowrap">
              <span className="toggle shrink-0">
                <input
                  type="checkbox"
                  checked={unansweredOnly}
                  onChange={(e) => setUnansweredOnly(e.target.checked)}
                />
                <span className="slider" />
              </span>
              Unanswered only
              {current?.unanswered > 0 && (
                <span className="text-xs font-semibold tabular-nums text-ink-400">({current.unanswered})</span>
              )}
            </label>
            <button
              onClick={() => setAddDraft({ question: "", category: defaultAddCategory })}
              className="btn-primary group min-h-[42px] shrink-0 whitespace-nowrap"
            >
              <Plus className="w-4 h-4 transition-transform duration-500 ease-spring group-hover:rotate-90" />
              Add question
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {addDraft && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease }}
              className="overflow-hidden"
            >
              <div className="pt-3">
                <AddQuestion
                  key={addDraft.question + addDraft.category}
                  draft={addDraft}
                  defaultCategory={defaultAddCategory}
                  categories={categories}
                  onCancel={() => setAddDraft(null)}
                  onAdd={onAdd}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Current topic heading */}
        <div className="mt-5 mb-2.5 flex items-baseline justify-between gap-3 px-1">
          <h2 className="font-display font-semibold tracking-[-0.01em] text-ink-900">
            {current?.label}
          </h2>
          <span className="text-xs text-ink-400 tabular-nums">
            {current?.count - current?.unanswered} of {current?.count} answered
          </span>
        </div>

        {/* List */}
        <div className="space-y-2">
          {shown.length === 0 ? (
            <EmptyState
              unansweredOnly={unansweredOnly}
              query={query}
              noQuestions={faqs.length === 0}
              onReset={onReset}
            />
          ) : (
            <AnimatePresence initial={false}>
              {shown.map((f, i) => (
                <motion.div
                  key={f._id}
                  layout="position"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ ...spring, delay: Math.min(i, 8) * 0.02 }}
                >
                  <QuestionCard
                    faq={f}
                    topicLabel={topic === "all" ? labelOf(catOf(f)) : ""}
                    onSave={onSave}
                    onDelete={onDelete}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {faqs.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-400">
            <span className="tabular-nums">
              Showing {shown.length} of {faqs.length} questions
            </span>
            <button onClick={onReset} className="btn-ghost group px-2.5 py-1.5 text-xs text-ink-400">
              <RotateCcw className="w-3.5 h-3.5 transition-transform duration-700 ease-spring group-hover:-rotate-180" />
              Restore default questions
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ unansweredOnly, query, noQuestions, onReset }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={spring}
      className="card p-10 text-center"
    >
      {unansweredOnly && !query ? (
        <>
          <div className="relative mx-auto grid h-14 w-14 place-items-center">
            <span aria-hidden className="absolute inset-0 rounded-full bg-emerald-400 opacity-30 blur-2xl" />
            <span className="relative grid h-12 w-12 place-items-center rounded-full bg-emerald-500 text-white shadow-[0_10px_26px_-8px_rgba(16,185,129,0.65)]">
              <CircleCheck className="w-6 h-6" />
            </span>
          </div>
          <p className="font-display text-lg font-semibold text-ink-900 mt-4">Everything here is answered</p>
          <p className="text-sm text-ink-500 mt-1">Nice work. Pick another topic, or turn off "Unanswered only".</p>
        </>
      ) : noQuestions ? (
        <>
          <div className="relative mx-auto mb-4 grid h-14 w-14 place-items-center">
            <span aria-hidden className="absolute inset-0 rounded-full bg-sunset opacity-20 blur-2xl" />
            <span className="relative grid h-12 w-12 place-items-center rounded-xl bg-sunset-soft text-sunset-flame">
              <MessageCircleQuestion className="w-6 h-6" strokeWidth={1.8} />
            </span>
          </div>
          <p className="font-display text-lg font-semibold text-ink-900">No questions yet</p>
          <p className="text-sm text-ink-500 mt-1">Add your own, or restore the default questions.</p>
          <button onClick={onReset} className="btn-primary group mt-4 min-h-[42px]">
            <RotateCcw className="w-4 h-4 transition-transform duration-700 ease-spring group-hover:-rotate-180" />
            Restore default questions
          </button>
        </>
      ) : (
        <>
          <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-xl bg-ink-900/[0.05] text-ink-400">
            <Search className="w-5 h-5" />
          </div>
          <p className="font-display font-semibold text-ink-900">Nothing matches</p>
          <p className="text-sm text-ink-500 mt-1">Try a different word or topic.</p>
        </>
      )}
    </motion.div>
  );
}
