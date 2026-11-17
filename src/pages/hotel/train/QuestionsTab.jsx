/**
 * QuestionsTab — "See all answers": the complete list, tucked behind the
 * guided mode. Search + topic filter + "Unanswered only", add, edit, delete.
 *   left   TopicList (desktop) / TopicSelect (mobile)
 *   main   toolbar, then the list
 */
import { useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, CircleCheck, MessageCircleQuestion, Plus, RotateCcw, Search } from "lucide-react";
import TopicList, { TopicSelect } from "./TopicList";
import QuestionCard from "./QuestionCard";
import AddQuestion from "./AddQuestion";
import { OTHER, hasText } from "./shared";
import { Switch, btnGhost, btnPrimary, field, panel } from "./ui";

const ease = [0.16, 1, 0.3, 1];

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
  onBack,
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
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        {onBack && (
          <button onClick={onBack} className={`${btnGhost} -ml-2`}>
            <ArrowLeft className="h-4 w-4" />
            Back to one-at-a-time
          </button>
        )}
        <button
          onClick={() => setAddDraft({ question: "", category: defaultAddCategory })}
          className={`${btnPrimary} group ml-auto`}
        >
          <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
          Add question
        </button>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden lg:sticky lg:top-4 lg:block">
          <TopicList topics={topics} topic={topic} setTopic={setTopic} />
        </aside>

        <div className="min-w-0">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <TopicSelect topics={topics} topic={topic} setTopic={setTopic} />
            <div className="relative min-w-[200px] flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search questions and answers"
                className={`${field} pl-10`}
                aria-label="Search questions"
              />
            </div>
            <label className="inline-flex min-h-[44px] cursor-pointer select-none items-center gap-2.5 whitespace-nowrap rounded-xl px-2 text-[14px] font-medium text-neutral-700">
              <Switch checked={unansweredOnly} onChange={setUnansweredOnly} label="Unanswered only" />
              Unanswered only
              {current?.unanswered > 0 && (
                <span className="text-[12px] font-semibold tabular-nums text-neutral-400">({current.unanswered})</span>
              )}
            </label>
          </div>

          <AnimatePresence initial={false}>
            {addDraft && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease }}
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
          <div className="mb-2.5 mt-5 flex items-baseline justify-between gap-3 px-1">
            <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-[#0A0A0A]">{current?.label}</h2>
            <span className="text-[12px] tabular-nums text-neutral-400">
              {current?.count - current?.unanswered} of {current?.count} answered
            </span>
          </div>

          {/* List */}
          {shown.length === 0 ? (
            <EmptyState
              unansweredOnly={unansweredOnly}
              query={query}
              noQuestions={faqs.length === 0}
              onReset={onReset}
            />
          ) : (
            <div className={`${panel} divide-y divide-neutral-100 overflow-hidden`}>
              {shown.map((f) => (
                <QuestionCard
                  key={f._id}
                  faq={f}
                  topicLabel={topic === "all" ? labelOf(catOf(f)) : ""}
                  onSave={onSave}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}

          {faqs.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-[12px] text-neutral-400">
              <span className="tabular-nums">
                Showing {shown.length} of {faqs.length} questions
              </span>
              <button onClick={onReset} className={`${btnGhost} text-[12px]`}>
                <RotateCcw className="h-3.5 w-3.5" />
                Restore default questions
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ unansweredOnly, query, noQuestions, onReset }) {
  return (
    <div className={`${panel} p-10 text-center`}>
      {unansweredOnly && !query ? (
        <>
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-500 text-white">
            <CircleCheck className="h-6 w-6" />
          </span>
          <p className="mt-4 text-[17px] font-semibold text-[#0A0A0A]">Everything here is answered</p>
          <p className="mt-1 text-[14px] text-neutral-500">Nice work. Pick another topic, or turn off "Unanswered only".</p>
        </>
      ) : noQuestions ? (
        <>
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#FF5A1F]/10 text-[#FF5A1F]">
            <MessageCircleQuestion className="h-6 w-6" strokeWidth={1.8} />
          </span>
          <p className="mt-4 text-[17px] font-semibold text-[#0A0A0A]">No questions yet</p>
          <p className="mt-1 text-[14px] text-neutral-500">Add your own, or restore the default questions.</p>
          <button onClick={onReset} className={`${btnPrimary} mt-5`}>
            <RotateCcw className="h-4 w-4" />
            Restore default questions
          </button>
        </>
      ) : (
        <>
          <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-neutral-100 text-neutral-400">
            <Search className="h-5 w-5" />
          </span>
          <p className="mt-3 font-semibold text-[#0A0A0A]">Nothing matches</p>
          <p className="mt-1 text-[14px] text-neutral-500">Try a different word or topic.</p>
        </>
      )}
    </div>
  );
}
