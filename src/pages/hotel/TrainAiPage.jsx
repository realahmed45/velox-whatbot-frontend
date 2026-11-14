/**
 * Train your AI — everything the AI needs to look after guests on its own.
 *
 *   [readiness summary]
 *   [Guest questions | Contacts & rules]     ← the only tab row
 *
 *   Guest questions    topics on the left, toolbar + question list on the right.
 *   Contacts & rules   1. People to contact  2. How your AI behaves.
 *
 * Testing lives on its own page (/dashboard/test-ai, TestAiPage.jsx).
 * Data + writes: ./train/useTraining.js (backend /api/training).
 *
 * Deep links:
 *   ?tab=questions|contacts     (legacy "behaviour" → Contacts & rules, scrolled
 *                                to the rules; legacy "test" → Test your AI page)
 *   ?fill=1                     jump straight to whatever must-have is missing
 *                                (used by <TrainingReminder />)
 *   ?teach=<question>           open "New question" pre-filled (from Test your AI)
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { CircleAlert, FlaskConical, GraduationCap, MessageCircleQuestion, RotateCcw, Users } from "lucide-react";
import { PulseDot, Reveal, SlidingTabs } from "@/components/fx";
import { ReadinessModal, sessionGet, sessionSet } from "@/components/TrainingReminder";
import useTraining from "./train/useTraining";
import ReadinessCard from "./train/ReadinessCard";
import LoadingState from "./train/LoadingState";
import QuestionsTab from "./train/QuestionsTab";
import ContactsAndRulesTab from "./train/ContactsAndRulesTab";
import { TEST_PATH, hop } from "./train/shared";

const POPUP_KEY = "botlify.trainAi.popupShown";

const scrollMainTop = () =>
  // The dashboard scrolls inside <main>, not the window.
  setTimeout(() => document.getElementById("main-content")?.scrollTo?.({ top: 0, behavior: "smooth" }), 50);

export default function TrainAiPage() {
  const [params, setParams] = useSearchParams();
  const rawTab = params.get("tab");
  const tab = rawTab === "contacts" || rawTab === "behaviour" ? "contacts" : "questions";

  const t = useTraining();
  const { loading, loadError, readiness, categories } = t;

  // Guest-questions view state lives here so "Show me what's missing" can drive it.
  const [topic, setTopic] = useState("all");
  const [query, setQuery] = useState("");
  const [unansweredOnly, setUnansweredOnly] = useState(false);
  const [addDraft, setAddDraft] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const handledLoad = useRef(false);

  const setTab = useCallback(
    (key) =>
      setParams(
        (p) => {
          const n = new URLSearchParams(p);
          n.set("tab", key);
          n.delete("fill");
          n.delete("teach");
          return n;
        },
        { replace: true },
      ),
    [setParams],
  );

  const goToMissing = useCallback(() => {
    setPopupOpen(false);
    const r = readiness;
    if (!r) return;
    if (r.missingAnswers.length) {
      const cat = r.missingAnswers[0].category;
      setTopic(categories.some((c) => c.key === cat) ? cat : "all");
      setQuery("");
      setUnansweredOnly(true);
      setTab("questions");
    } else if (r.missingContacts.length) {
      setTab("contacts");
      const role = r.missingContacts[0].role;
      setTimeout(() => {
        document.getElementById(`contact-${role}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 120);
    }
  }, [readiness, categories, setTab]);

  // After the first load: open a pre-filled question (?teach=), jump straight
  // to what's missing (?fill=1), or show the friendly reminder once per session.
  useEffect(() => {
    if (loading || loadError || handledLoad.current || !readiness) return;
    handledLoad.current = true;

    const teach = params.get("teach");
    if (teach) {
      setAddDraft({ question: teach, category: "" });
      setTab("questions");
      scrollMainTop();
      return;
    }
    if (rawTab === "behaviour") {
      setTimeout(() => {
        document.getElementById("ai-rules")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    }
    if (readiness.complete) return;
    if (params.get("fill")) {
      sessionSet(POPUP_KEY, "1");
      goToMissing();
      return;
    }
    if (!sessionGet(POPUP_KEY)) {
      sessionSet(POPUP_KEY, "1");
      setPopupOpen(true);
    }
  }, [loading, loadError, readiness, params, rawTab, goToMissing, setTab]);

  const addFaq = async (form) => {
    const ok = await t.addFaq(form);
    if (ok) setAddDraft(null);
    return ok;
  };

  const resetFaqs = async () => {
    if (await t.resetFaqs()) {
      setTopic("all");
      setUnansweredOnly(false);
    }
  };

  // Old "Test your AI" tab links now open the dedicated page.
  if (rawTab === "test") return <Navigate to={TEST_PATH} replace />;

  const tabs = [
    {
      value: "questions",
      icon: MessageCircleQuestion,
      label: (
        <>
          Guest questions
          {readiness?.missingAnswers.length > 0 && (
            <span aria-label="Needs attention" className="ml-0.5 inline-flex">
              <PulseDot color="bg-sunset-flame" />
            </span>
          )}
        </>
      ),
    },
    {
      value: "contacts",
      icon: Users,
      label: (
        <>
          Contacts &amp; rules
          {readiness?.missingContacts.length > 0 && (
            <span aria-label="Needs attention" className="ml-0.5 inline-flex">
              <PulseDot color="bg-sunset-flame" />
            </span>
          )}
        </>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-8">
      <Reveal as="header" className="group flex flex-col sm:flex-row sm:items-start gap-4 mb-6">
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sunset text-white shadow-[0_10px_24px_-10px_rgba(255,61,119,0.6)] ${hop}`}>
            <GraduationCap className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-ink-900">
              Train your <span className="font-serif italic font-normal">AI</span>
            </h1>
            <p className="text-sm text-ink-500 mt-0.5 max-w-2xl">
              Teach your AI what guests ask, who to call, and how to handle tricky moments.
            </p>
          </div>
        </div>
        <Link to={TEST_PATH} className="btn-secondary min-h-[42px] self-start shrink-0">
          <FlaskConical className="w-4 h-4 text-sunset-flame" />
          Test your AI
        </Link>
      </Reveal>

      {loading ? (
        <LoadingState />
      ) : loadError ? (
        <div className="card p-10 text-center">
          <div className="relative mx-auto grid h-14 w-14 place-items-center">
            <span aria-hidden className="absolute inset-0 rounded-full bg-rose-400 opacity-25 blur-2xl" />
            <span className="relative grid h-12 w-12 place-items-center rounded-xl bg-rose-50 text-rose-500 ring-1 ring-rose-500/20">
              <CircleAlert className="w-6 h-6" strokeWidth={1.8} />
            </span>
          </div>
          <p className="font-display font-semibold text-ink-900 mt-4">{loadError}</p>
          <button onClick={t.load} className="btn-secondary group mt-4 min-h-[40px]">
            <RotateCcw className="w-4 h-4 transition-transform duration-700 ease-spring group-hover:-rotate-180" />
            Try again
          </button>
        </div>
      ) : (
        <>
          <ReadinessCard readiness={readiness} onFill={goToMissing} />

          <div className="mt-6 mb-5">
            <SlidingTabs value={tab} onChange={setTab} items={tabs} />
          </div>

          {/* Only the active tab is shown. Both stay mounted (hidden) so
              unsaved edits survive switching back and forth. */}
          <div role="tabpanel" hidden={tab !== "questions"}>
            <QuestionsTab
              faqs={t.faqs}
              categories={categories}
              topic={topic}
              setTopic={setTopic}
              query={query}
              setQuery={setQuery}
              unansweredOnly={unansweredOnly}
              setUnansweredOnly={setUnansweredOnly}
              addDraft={addDraft}
              setAddDraft={setAddDraft}
              onSave={t.saveFaq}
              onAdd={addFaq}
              onDelete={t.deleteFaq}
              onReset={resetFaqs}
            />
          </div>
          <div role="tabpanel" hidden={tab !== "contacts"}>
            <ContactsAndRulesTab
              contacts={t.contacts}
              roles={t.roles}
              playbook={t.playbook}
              onSaveContacts={t.saveContacts}
              onSavePlaybook={t.savePlaybook}
              contactsMissing={readiness?.missingContacts.length > 0}
            />
          </div>

          <ReadinessModal
            open={popupOpen}
            readiness={readiness}
            categories={categories}
            onFill={goToMissing}
            onClose={() => setPopupOpen(false)}
          />
        </>
      )}
    </div>
  );
}

