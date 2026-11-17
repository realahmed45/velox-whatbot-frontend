/**
 * Train your AI — everything the AI needs to look after guests on its own.
 *
 *   [readiness summary]            "Your AI knows 68% — 13 quick answers left"
 *   [Guest questions | Contacts & rules]
 *
 *   Guest questions    default: guided mode, ONE question at a time
 *                      (must-haves first). "See all answers" opens the full
 *                      list with search + topic filter (?view=all).
 *   Contacts & rules   1. People to contact  2. How your AI behaves.
 *
 * Testing lives on its own page (/dashboard/test-ai, TestAiPage.jsx).
 * Data + writes: ./train/useTraining.js (backend /api/training).
 *
 * Deep links:
 *   ?tab=questions|contacts     (legacy "behaviour" → Contacts & rules, scrolled
 *                                to the rules; legacy "test" → Test your AI page)
 *   ?view=all                   the complete list instead of guided mode
 *   ?fill=1                     jump straight to whatever must-have is missing
 *                                (used by <TrainingReminder />)
 *   ?teach=<question>           open "New question" pre-filled (from Test your AI)
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { CircleAlert, FlaskConical, RotateCcw } from "lucide-react";
import { ReadinessModal, sessionGet, sessionSet } from "@/components/TrainingReminder";
import useTraining from "./train/useTraining";
import ReadinessCard from "./train/ReadinessCard";
import LoadingState from "./train/LoadingState";
import GuidedMode from "./train/GuidedMode";
import QuestionsTab from "./train/QuestionsTab";
import ContactsAndRulesTab from "./train/ContactsAndRulesTab";
import { TEST_PATH } from "./train/shared";
import { Segmented, btnSecondary, pageTitle, panel } from "./train/ui";

const POPUP_KEY = "botlify.trainAi.popupShown";

const scrollMainTop = () =>
  // The dashboard scrolls inside <main>, not the window.
  setTimeout(() => document.getElementById("main-content")?.scrollTo?.({ top: 0, behavior: "smooth" }), 50);

export default function TrainAiPage() {
  const [params, setParams] = useSearchParams();
  const rawTab = params.get("tab");
  const tab = rawTab === "contacts" || rawTab === "behaviour" ? "contacts" : "questions";
  const view = params.get("view") === "all" ? "all" : "guided";

  const t = useTraining();
  const { loading, loadError, readiness, categories } = t;

  // "See all answers" view state lives here so deep links can drive it.
  const [topic, setTopic] = useState("all");
  const [query, setQuery] = useState("");
  const [unansweredOnly, setUnansweredOnly] = useState(false);
  const [addDraft, setAddDraft] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [guidedKey, setGuidedKey] = useState(0);
  const handledLoad = useRef(false);

  const go = useCallback(
    (nextTab, nextView) =>
      setParams(
        (p) => {
          const n = new URLSearchParams(p);
          n.set("tab", nextTab);
          if (nextView === "all") n.set("view", "all");
          else if (nextView === "guided") n.delete("view");
          n.delete("fill");
          n.delete("teach");
          return n;
        },
        { replace: true },
      ),
    [setParams],
  );
  const setTab = useCallback((key) => go(key), [go]);

  const goToMissing = useCallback(() => {
    setPopupOpen(false);
    const r = readiness;
    if (!r) return;
    if (r.missingAnswers.length) {
      // Guided mode always starts with the unanswered must-haves.
      setGuidedKey((k) => k + 1);
      go("questions", "guided");
      scrollMainTop();
    } else if (r.missingContacts.length) {
      go("contacts");
      const role = r.missingContacts[0].role;
      setTimeout(() => {
        document.getElementById(`contact-${role}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 120);
    }
  }, [readiness, go]);

  const openAdd = useCallback(
    (question = "") => {
      setAddDraft({ question, category: question ? "" : categories[0]?.key || "general" });
      go("questions", "all");
      scrollMainTop();
    },
    [categories, go],
  );

  // After the first load: open a pre-filled question (?teach=), jump straight
  // to what's missing (?fill=1), or show the friendly reminder once per session.
  useEffect(() => {
    if (loading || loadError || handledLoad.current || !readiness) return;
    handledLoad.current = true;

    const teach = params.get("teach");
    if (teach) {
      setAddDraft({ question: teach, category: "" });
      go("questions", "all");
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
  }, [loading, loadError, readiness, params, rawTab, goToMissing, go]);

  const addFaq = async (form) => {
    const ok = await t.addFaq(form);
    if (ok) setAddDraft(null);
    return ok;
  };

  const resetFaqs = async () => {
    if (await t.resetFaqs()) {
      setTopic("all");
      setUnansweredOnly(false);
      setGuidedKey((k) => k + 1);
    }
  };

  // Old "Test your AI" tab links now open the dedicated page.
  if (rawTab === "test") return <Navigate to={TEST_PATH} replace />;

  const tabs = [
    { value: "questions", label: "Guest questions", dot: readiness?.missingAnswers.length > 0 },
    { value: "contacts", label: "Contacts & rules", dot: readiness?.missingContacts.length > 0 },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-6 font-geist text-[#0A0A0A] sm:px-6 sm:pt-8 lg:px-8">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <h1 className={pageTitle}>
            Train your AI<span className="text-[#FF5A1F]">.</span>
          </h1>
          <p className="mt-1 max-w-xl text-[15px] text-neutral-500">
            Answer a few guest questions in your own words. Your AI does the rest.
          </p>
        </div>
        <Link to={TEST_PATH} className={`${btnSecondary} self-start shrink-0 sm:self-auto`}>
          <FlaskConical className="h-4 w-4 text-[#FF5A1F]" />
          Test your AI
        </Link>
      </header>

      {loading ? (
        <LoadingState />
      ) : loadError ? (
        <div className={`${panel} p-10 text-center`}>
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-rose-50 text-rose-500">
            <CircleAlert className="h-6 w-6" strokeWidth={1.8} />
          </span>
          <p className="mt-4 font-semibold text-[#0A0A0A]">{loadError}</p>
          <button onClick={t.load} className={`${btnSecondary} mt-4`}>
            <RotateCcw className="h-4 w-4" />
            Try again
          </button>
        </div>
      ) : (
        <>
          <ReadinessCard readiness={readiness} onFill={goToMissing} />

          <div className="mb-6 mt-7">
            <Segmented id="train-tabs" items={tabs} value={tab} onChange={setTab} />
          </div>

          {/* Only the active tab is shown. Both stay mounted (hidden) so
              unsaved edits survive switching back and forth. */}
          <div role="tabpanel" hidden={tab !== "questions"}>
            {view === "guided" ? (
              <GuidedMode
                key={guidedKey}
                faqs={t.faqs}
                categories={categories}
                onSave={(faq, form) => t.saveFaq(faq, form, { quiet: true })}
                onSeeAll={() => go("questions", "all")}
                onAddQuestion={() => openAdd()}
              />
            ) : (
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
                onBack={() => {
                  setAddDraft(null);
                  go("questions", "guided");
                }}
              />
            )}
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
