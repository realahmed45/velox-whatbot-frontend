/**
 * Train your AI — everything the AI needs to look after guests on its own,
 * so nobody from the team has to step in.
 *
 *   Guest questions      ~120 questions across 14 topics. Answered ones may be
 *                        sent to guests word for word; unanswered ones are
 *                        ignored until the hotelier fills them in.
 *   People to contact    who the AI points guests to (and who stays private).
 *   How your AI behaves  instructions for tricky moments (emergencies, angry
 *                        guests, refunds…).
 *   Test your AI         asks the REAL reply logic — the investor-demo panel.
 *
 * Backend: /api/training (see backend/src/controllers/trainingController.js).
 * Every write returns the full payload, which replaces local state; edits are
 * applied optimistically first and rolled back on failure.
 *
 * Deep links: ?tab=questions|contacts|behaviour|test, ?fill=1 jumps straight
 * to whatever must-have is still missing (used by <TrainingReminder />).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  ArrowRight,
  Bot,
  Car,
  Check,
  CircleAlert,
  CircleCheck,
  ConciergeBell,
  Crown,
  Eye,
  EyeOff,
  Flame,
  GraduationCap,
  Hammer,
  Lightbulb,
  Loader2,
  Mail,
  MessageCircleQuestion,
  Pencil,
  Phone,
  Plus,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  Siren,
  Sparkles,
  SprayCan,
  Trash2,
  UserCog,
  UserRound,
  Users,
  Utensils,
  Clock,
  X,
} from "lucide-react";
import api from "@/services/api";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import {
  ReadinessModal,
  sessionGet,
  sessionSet,
} from "@/components/TrainingReminder";

const TABS = [
  { key: "questions", label: "Guest questions", short: "Questions", icon: MessageCircleQuestion },
  { key: "contacts", label: "People to contact", short: "People", icon: Users },
  { key: "behaviour", label: "How your AI behaves", short: "Behaviour", icon: ShieldCheck },
  { key: "test", label: "Test your AI", short: "Test", icon: Bot },
];
const TAB_KEYS = new Set(TABS.map((t) => t.key));
const POPUP_KEY = "botlify.trainAi.popupShown";
const OTHER = "__other";
const PHONE_RE = /^\+?[0-9 ()-]{6,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const errMsg = (e, fallback) => e?.response?.data?.message || fallback;
const hasText = (s) => !!String(s || "").trim();
let keySeq = 0;
const newKey = () => `k${++keySeq}`;

/* Plain-English help per contact role (keys come from the backend config). */
const ROLE_META = {
  front_desk: {
    icon: ConciergeBell,
    help: "The main number for guests — bookings, questions, anything at all.",
  },
  manager: {
    icon: UserCog,
    help: "Handles complaints, refunds and anything the AI can't sort out itself.",
  },
  owner: {
    icon: Crown,
    help: "Only for serious matters. Usually kept private.",
  },
  emergency: {
    icon: Siren,
    help: "Who guests should call in an emergency — fire, injury or a medical problem.",
  },
  maintenance_emergency: {
    icon: Flame,
    help: "On call at night for urgent problems: no water, no power, a broken lock or AC.",
  },
  maintenance: {
    icon: Hammer,
    help: "Fixes things during the day. The AI tells guests it'll be sorted — without giving out this number.",
  },
  cleaning: {
    icon: SprayCan,
    help: "Housekeeping, for cleaning requests and fresh towels.",
  },
  taxi: {
    icon: Car,
    help: "Your own driver or a taxi company you trust. Add as many as you like.",
    multiple: true,
  },
  restaurant: {
    icon: Utensils,
    help: "For table bookings, room service and food questions.",
  },
};

const SUGGESTED_TESTS = [
  "What time is check-in?",
  "What's the WiFi password?",
  "Is breakfast included?",
  "The AC in my room isn't working",
  "Can I get a refund?",
  "Can you book me a taxi to the airport?",
];

/** Same rules as readinessOf() on the backend, so optimistic edits update the bar instantly. */
function computeReadiness(faqs, contacts, roles) {
  const missingAnswers = faqs
    .filter((f) => f.required && !hasText(f.answer))
    .map((f) => ({ id: f._id, question: f.question, category: f.category }));
  const requiredRoles = roles.filter((r) => r.required);
  const missingContacts = requiredRoles
    .filter((r) => !contacts.some((c) => c.role === r.key && hasText(c.whatsapp)))
    .map((r) => ({ role: r.key, label: r.label }));
  const requiredTotal = faqs.filter((f) => f.required).length + requiredRoles.length;
  const missing = missingAnswers.length + missingContacts.length;
  return {
    complete: missing === 0,
    percent: requiredTotal ? Math.round(((requiredTotal - missing) / requiredTotal) * 100) : 100,
    missingAnswers,
    missingContacts,
    answered: faqs.filter((f) => hasText(f.answer)).length,
    total: faqs.length,
  };
}

/* ═══════════════════════════════════════════════════════════════════════ */
export default function TrainAiPage() {
  const confirm = useConfirm();
  const [params, setParams] = useSearchParams();
  const tab = TAB_KEYS.has(params.get("tab")) ? params.get("tab") : "questions";

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [faqs, setFaqs] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [playbook, setPlaybook] = useState([]);
  const [categories, setCategories] = useState([]);
  const [roles, setRoles] = useState([]);
  const [serverReadiness, setServerReadiness] = useState(null);

  // Guest-questions view state lives here so "Fill them now" can drive it.
  const [topic, setTopic] = useState("all");
  const [query, setQuery] = useState("");
  const [unansweredOnly, setUnansweredOnly] = useState(false);
  const [addDraft, setAddDraft] = useState(null);

  const [chat, setChat] = useState([]);
  const [popupOpen, setPopupOpen] = useState(false);
  const handledLoad = useRef(false);

  const setTab = useCallback(
    (key) =>
      setParams(
        (p) => {
          const n = new URLSearchParams(p);
          n.set("tab", key);
          n.delete("fill");
          return n;
        },
        { replace: true },
      ),
    [setParams],
  );

  const apply = useCallback((data) => {
    if (!data) return;
    // Only swap arrays that actually changed: the contacts and behaviour
    // editors reset their drafts when their source changes, so saving a
    // question must not wipe unsaved edits on another tab.
    const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const keep = (next) => (prev) => (same(prev, next) ? prev : next);
    if (data.faqs) setFaqs(data.faqs);
    if (data.contacts) setContacts(keep(data.contacts));
    if (data.playbook) setPlaybook(keep(data.playbook));
    if (data.categories) setCategories(keep(data.categories));
    if (data.roles) setRoles(keep(data.roles));
    if (data.readiness) setServerReadiness(data.readiness);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const { data } = await api.get("/training");
      apply(data);
    } catch (e) {
      setLoadError(errMsg(e, "We couldn't load your AI's training."));
    } finally {
      setLoading(false);
    }
  }, [apply]);

  useEffect(() => {
    load();
  }, [load]);

  const readiness = useMemo(
    () => (roles.length ? computeReadiness(faqs, contacts, roles) : serverReadiness),
    [faqs, contacts, roles, serverReadiness],
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
        document
          .getElementById(`contact-${role}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 120);
    }
  }, [readiness, categories, setTab]);

  // After the first load: either jump straight to what's missing (?fill=1)
  // or show the friendly reminder once per session.
  useEffect(() => {
    if (loading || loadError || handledLoad.current || !readiness) return;
    handledLoad.current = true;
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
  }, [loading, loadError, readiness, params, goToMissing]);

  /* ── Question writes ─────────────────────────────────────────────── */
  const saveFaq = async (faq, form) => {
    const prev = faqs;
    setFaqs((list) => list.map((f) => (f._id === faq._id ? { ...f, ...form } : f)));
    try {
      const { data } = await api.patch(`/training/${faq._id}`, form);
      apply(data);
      toast.success(hasText(form.answer) ? "Saved — your AI will use this answer" : "Saved — the AI won't answer this one yet");
      return true;
    } catch (e) {
      setFaqs(prev);
      toast.error(errMsg(e, "Couldn't save that answer"));
      return false;
    }
  };

  const addFaq = async (form) => {
    try {
      const { data } = await api.post("/training", form);
      apply(data);
      toast.success("Question added");
      setAddDraft(null);
      return true;
    } catch (e) {
      toast.error(errMsg(e, "Couldn't add that question"));
      return false;
    }
  };

  const deleteFaq = async (faq) => {
    const yes = await confirm({
      title: "Delete this question?",
      description: `"${faq.question}" — your AI will stop using this answer.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!yes) return;
    const prev = faqs;
    setFaqs((list) => list.filter((f) => f._id !== faq._id));
    try {
      const { data } = await api.delete(`/training/${faq._id}`);
      apply(data);
      toast.success("Question deleted");
    } catch (e) {
      setFaqs(prev);
      toast.error(errMsg(e, "Couldn't delete that question"));
    }
  };

  const resetFaqs = async () => {
    const yes = await confirm({
      title: "Restore the default questions?",
      description:
        "This replaces every question and answer on this tab with the original set. Answers you've written will be lost. Your contacts and AI behaviour stay as they are.",
      confirmLabel: "Restore defaults",
      danger: true,
    });
    if (!yes) return;
    try {
      const { data } = await api.post("/training/reset");
      apply(data);
      setTopic("all");
      setUnansweredOnly(false);
      toast.success("Default questions restored");
    } catch (e) {
      toast.error(errMsg(e, "Couldn't restore the defaults"));
    }
  };

  /* ── Contacts & playbook writes ─────────────────────────────────── */
  // Contacts and rules are edited as drafts inside their panels, so there's
  // nothing to roll back here — a failed save simply leaves the draft as is.
  const saveContacts = async (list) => {
    try {
      const { data } = await api.put("/training/contacts", { contacts: list });
      apply(data);
      toast.success("Contacts saved");
      return { ok: true };
    } catch (e) {
      const message = errMsg(e, "Couldn't save your contacts");
      if (e?.response?.status !== 400) toast.error(message);
      return { ok: false, message, validation: e?.response?.status === 400 };
    }
  };

  const savePlaybook = async (list) => {
    try {
      const { data } = await api.put("/training/playbook", { playbook: list });
      apply(data);
      toast.success("Saved — your AI will follow these from its next reply");
      return true;
    } catch (e) {
      toast.error(errMsg(e, "Couldn't save these rules"));
      return false;
    }
  };

  const teach = (question) => {
    setAddDraft({ question, category: topic !== "all" && topic !== OTHER ? topic : "" });
    setTab("questions");
    // The dashboard scrolls inside <main>, not the window.
    setTimeout(
      () => document.getElementById("main-content")?.scrollTo?.({ top: 0, behavior: "smooth" }),
      50,
    );
  };

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <header className="flex items-start gap-3 mb-5">
        <div className="w-11 h-11 rounded-xl bg-brand-500/10 flex items-center justify-center shrink-0">
          <GraduationCap className="w-6 h-6 text-brand-500" />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-black text-ink-900">Train your AI</h1>
          <p className="text-sm text-ink-500 mt-0.5 max-w-2xl">
            Teach your AI what guests ask, who to call, and how to handle tricky
            moments — so it can look after guests on its own, day and night.
          </p>
        </div>
      </header>

      {loading ? (
        <LoadingState />
      ) : loadError ? (
        <div className="card p-10 text-center">
          <CircleAlert className="w-8 h-8 text-rose-500 mx-auto" />
          <p className="font-bold text-ink-900 mt-3">{loadError}</p>
          <button onClick={load} className="btn-secondary mt-4">
            <RotateCcw className="w-4 h-4" />
            Try again
          </button>
        </div>
      ) : (
        <>
          <ReadinessCard readiness={readiness} onFill={goToMissing} />

          {/* Segmented control */}
          <div className="mt-6 mb-5 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto no-scrollbar">
            <div role="tablist" className="inline-flex gap-1 p-1 rounded-xl bg-ink-100/80 min-w-max">
              {TABS.map((t) => {
                const Icon = t.icon;
                const active = tab === t.key;
                const dot =
                  (t.key === "questions" && readiness?.missingAnswers.length > 0) ||
                  (t.key === "contacts" && readiness?.missingContacts.length > 0);
                return (
                  <button
                    key={t.key}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setTab(t.key)}
                    className={`relative inline-flex items-center gap-2 rounded-lg px-3 sm:px-4 py-2 text-sm font-bold transition ${
                      active ? "text-ink-900" : "text-ink-500 hover:text-ink-800"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="train-tab"
                        className="absolute inset-0 rounded-lg bg-white shadow-card"
                        transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
                      />
                    )}
                    <Icon className={`relative w-4 h-4 ${active ? "text-brand-500" : ""}`} />
                    <span className="relative hidden sm:inline">{t.label}</span>
                    <span className="relative sm:hidden">{t.short}</span>
                    {dot && (
                      <span className="relative w-2 h-2 rounded-full bg-accent-500" aria-label="Needs attention" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className={`grid gap-6 items-start ${
              tab !== "test" ? "xl:grid-cols-[minmax(0,1fr)_360px]" : ""
            }`}
          >
            <div className="min-w-0">
              {/* Panels stay mounted so unsaved edits survive a tab switch. */}
              <div hidden={tab !== "questions"}>
                <QuestionsPanel
                  faqs={faqs}
                  categories={categories}
                  topic={topic}
                  setTopic={setTopic}
                  query={query}
                  setQuery={setQuery}
                  unansweredOnly={unansweredOnly}
                  setUnansweredOnly={setUnansweredOnly}
                  addDraft={addDraft}
                  setAddDraft={setAddDraft}
                  onSave={saveFaq}
                  onAdd={addFaq}
                  onDelete={deleteFaq}
                  onReset={resetFaqs}
                />
              </div>
              <div hidden={tab !== "contacts"}>
                <ContactsPanel contacts={contacts} roles={roles} onSave={saveContacts} />
              </div>
              <div hidden={tab !== "behaviour"}>
                <PlaybookPanel playbook={playbook} onSave={savePlaybook} />
              </div>
              {tab === "test" && (
                <div className="max-w-3xl mx-auto">
                  <TestChat messages={chat} setMessages={setChat} onTeach={teach} tall />
                </div>
              )}
            </div>

            {tab !== "test" && (
              <aside className="hidden xl:block xl:sticky xl:top-6">
                <TestChat messages={chat} setMessages={setChat} onTeach={teach} />
              </aside>
            )}
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

/* ── Loading ─────────────────────────────────────────────────────────── */
function LoadingState() {
  return (
    <div className="space-y-4" aria-busy="true">
      <div className="card h-28 animate-pulse bg-ink-50" />
      <div className="h-10 w-80 max-w-full rounded-xl bg-ink-100 animate-pulse" />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="card h-20 animate-pulse bg-ink-50" />
      ))}
    </div>
  );
}

/* ── Readiness ───────────────────────────────────────────────────────── */
function ReadinessCard({ readiness, onFill }) {
  if (!readiness) return null;
  const answers = readiness.missingAnswers.length;
  const people = readiness.missingContacts.length;

  if (readiness.complete) {
    return (
      <div className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4 border-emerald-200 bg-emerald-50/50">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
          <CircleCheck className="w-6 h-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-black text-ink-900">Your AI is ready to look after guests on its own</p>
          <p className="text-sm text-ink-600 mt-0.5">
            Every must-have is filled in. {readiness.answered} of {readiness.total} questions
            answered — the more you answer, the fewer messages reach your team.
          </p>
        </div>
      </div>
    );
  }

  const parts = [];
  if (answers) parts.push(`${answers} must-have ${answers === 1 ? "answer" : "answers"}`);
  if (people) parts.push(`${people} ${people === 1 ? "contact" : "contacts"}`);

  return (
    <div className="card p-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative w-14 h-14 shrink-0">
          <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
            <circle cx="18" cy="18" r="15.5" fill="none" strokeWidth="4" className="stroke-ink-100" />
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              strokeWidth="4"
              strokeLinecap="round"
              className="stroke-brand-500 transition-all duration-500"
              strokeDasharray={`${(readiness.percent / 100) * 97.4} 97.4`}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-ink-900">
            {readiness.percent}%
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-black text-ink-900">
            {parts.join(" and ")} still missing
          </p>
          <p className="text-sm text-ink-500 mt-0.5">
            Until these are filled in, some guests will need someone from your team.
            {" "}
            {readiness.answered} of {readiness.total} questions answered so far.
          </p>
          <div className="mt-3 h-2 rounded-full bg-ink-100 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-500"
              initial={false}
              animate={{ width: `${readiness.percent}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
        <button onClick={onFill} className="btn-primary shrink-0 self-start sm:self-center">
          Show me what's missing
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ═══ Guest questions ═══════════════════════════════════════════════════ */
function QuestionsPanel({
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

  // Keep the active topic chip in view when it's set from elsewhere.
  const stripRef = useRef(null);
  useEffect(() => {
    stripRef.current
      ?.querySelector(`[data-topic="${topic}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [topic]);

  return (
    <div>
      {/* Topic strip */}
      <div className="relative -mx-4 sm:mx-0">
        <div ref={stripRef} className="flex gap-2 overflow-x-auto no-scrollbar px-4 sm:px-0 pb-1">
          {topics.map((t) => {
            const active = t.key === topic;
            return (
              <button
                key={t.key}
                data-topic={t.key}
                onClick={() => setTopic(t.key)}
                className={`shrink-0 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${
                  active
                    ? "bg-ink-900 border-ink-900 text-white"
                    : "bg-white border-ink-200 text-ink-700 hover:border-ink-300"
                }`}
              >
                {t.missingRequired && (
                  <span
                    className="w-2 h-2 rounded-full bg-accent-500"
                    title="Has must-have questions without an answer"
                  />
                )}
                {t.label}
                <span
                  className={`text-xs font-bold rounded-full px-1.5 ${
                    active ? "bg-white/15 text-white" : "bg-ink-100 text-ink-500"
                  }`}
                >
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tools */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
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
        <label className="inline-flex items-center gap-2 text-sm font-semibold text-ink-700 bg-white border border-ink-200 rounded-md px-3 py-2.5 cursor-pointer select-none hover:border-ink-300 transition">
          <input
            type="checkbox"
            checked={unansweredOnly}
            onChange={(e) => setUnansweredOnly(e.target.checked)}
            className="w-4 h-4 rounded border-ink-300 text-brand-500 focus:ring-brand-500"
          />
          Unanswered only
          {current?.unanswered > 0 && (
            <span className="text-xs font-bold text-ink-400">({current.unanswered})</span>
          )}
        </label>
        <button
          onClick={() => setAddDraft({ question: "", category: defaultAddCategory })}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Add question
        </button>
      </div>

      <AnimatePresence initial={false}>
        {addDraft && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
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

      {/* List */}
      <div className="mt-4 space-y-2.5">
        {shown.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-200 bg-white p-10 text-center">
            {unansweredOnly && !query ? (
              <>
                <CircleCheck className="w-7 h-7 text-emerald-500 mx-auto" />
                <p className="font-bold text-ink-900 mt-2">Everything here is answered</p>
                <p className="text-sm text-ink-500 mt-1">Nice work. Pick another topic, or turn off "Unanswered only".</p>
              </>
            ) : faqs.length === 0 ? (
              <>
                <p className="font-bold text-ink-900">No questions yet</p>
                <p className="text-sm text-ink-500 mt-1">Add your own, or restore the default questions.</p>
                <button onClick={onReset} className="btn-secondary mt-4">
                  <RotateCcw className="w-4 h-4" />
                  Restore default questions
                </button>
              </>
            ) : (
              <>
                <p className="font-bold text-ink-900">Nothing matches</p>
                <p className="text-sm text-ink-500 mt-1">Try a different word or topic.</p>
              </>
            )}
          </div>
        ) : (
          shown.map((f) => (
            <QuestionRow
              key={f._id}
              faq={f}
              topicLabel={topic === "all" ? labelOf(catOf(f)) : ""}
              onSave={onSave}
              onDelete={onDelete}
            />
          ))
        )}
      </div>

      {faqs.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-400">
          <span>
            Showing {shown.length} of {faqs.length} questions
          </span>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 font-semibold hover:text-ink-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restore default questions
          </button>
        </div>
      )}
    </div>
  );
}

function QuestionRow({ faq, topicLabel, onSave, onDelete }) {
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
      className={`rounded-2xl border bg-white p-4 transition ${
        editing
          ? "border-brand-300 shadow-ring"
          : !answered && faq.required
            ? "border-accent-200"
            : "border-ink-100 hover:border-ink-200"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            {faq.required && (
              <span className="inline-flex items-center rounded-full bg-accent-100 text-accent-800 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5">
                Must-have
              </span>
            )}
            {topicLabel && (
              <span className="text-[11px] font-semibold text-ink-400">{topicLabel}</span>
            )}
          </div>
          {editing ? (
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="input font-bold"
              aria-label="Question"
              maxLength={300}
            />
          ) : (
            <p className="font-bold text-ink-900 text-[15px]">{faq.question}</p>
          )}
        </div>
        {!editing && (
          <div className="flex items-center gap-0.5 shrink-0 -mr-1 -mt-1">
            <button
              onClick={open}
              title="Edit"
              aria-label="Edit answer"
              className="p-2 rounded-lg text-ink-400 hover:text-ink-800 hover:bg-ink-50 transition"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(faq)}
              title="Delete"
              aria-label="Delete question"
              className="p-2 rounded-lg text-ink-400 hover:text-rose-600 hover:bg-rose-50 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="mt-3">
          <label className="text-xs font-bold text-ink-500">Your AI answers</label>
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
            <button onClick={() => setEditing(false)} className="btn-ghost">
              Cancel
            </button>
            <button onClick={save} disabled={!hasText(question) || saving} className="btn-primary">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Save
            </button>
          </div>
        </div>
      ) : answered ? (
        <button
          onClick={open}
          className="mt-1.5 block w-full text-left text-sm text-ink-600 whitespace-pre-line leading-relaxed hover:text-ink-900 transition"
        >
          {faq.answer}
        </button>
      ) : (
        <div className="mt-2.5 rounded-xl border border-dashed border-accent-300 bg-accent-50/60 px-3.5 py-3 flex flex-col sm:flex-row sm:items-center gap-2.5">
          <p className="text-sm text-accent-900 flex-1">
            <span className="font-bold">Not answered</span> — the AI won't use this until you answer.
          </p>
          <button
            onClick={open}
            className="shrink-0 inline-flex items-center gap-1.5 self-start sm:self-auto bg-white border border-accent-300 hover:border-accent-400 text-accent-900 text-sm font-bold rounded-lg px-3 py-1.5 transition"
          >
            <Pencil className="w-3.5 h-3.5" />
            Write the answer
          </button>
        </div>
      )}
    </div>
  );
}

function AddQuestion({ draft, defaultCategory, categories, onAdd, onCancel }) {
  const [question, setQuestion] = useState(draft.question || "");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState(draft.category || defaultCategory);
  const [saving, setSaving] = useState(false);
  const canSave = hasText(question) && hasText(answer) && !saving;

  const submit = async () => {
    if (!canSave) return;
    setSaving(true);
    await onAdd({ question: question.trim(), answer: answer.trim(), category });
    setSaving(false);
  };

  return (
    <div className="rounded-2xl border-2 border-brand-200 bg-white p-4 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <p className="font-bold text-ink-900">New question</p>
        <button onClick={onCancel} aria-label="Close" className="p-1 text-ink-400 hover:text-ink-700">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="grid sm:grid-cols-[1fr_220px] gap-3 mt-3">
        <div>
          <label className="text-xs font-bold text-ink-500">When a guest asks</label>
          <input
            autoFocus={!draft.question}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={300}
            placeholder="e.g. Do you have a spa?"
            className="input mt-1"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-ink-500">Topic</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input mt-1">
            {categories.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <label className="text-xs font-bold text-ink-500 mt-3 block">Your AI answers</label>
      <textarea
        autoFocus={!!draft.question}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        maxLength={2000}
        rows={3}
        placeholder="e.g. Yes — our spa is open 9am to 9pm. Massages start at USD 30."
        className="input mt-1 min-h-[96px]"
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
        }}
      />
      <div className="flex items-center justify-end gap-2 mt-3">
        <button onClick={onCancel} className="btn-ghost">
          Cancel
        </button>
        <button onClick={submit} disabled={!canSave} className="btn-primary">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Add question
        </button>
      </div>
    </div>
  );
}

/* ═══ People to contact ═════════════════════════════════════════════════ */
function toRows(contacts, roles) {
  const rows = contacts.map((c) => ({
    _k: newKey(),
    role: c.role,
    name: c.name || "",
    whatsapp: c.whatsapp || "",
    email: c.email || "",
    availability: c.availability || "",
    shareWithGuests: !!c.shareWithGuests,
    notes: c.notes || "",
  }));
  for (const r of roles) {
    if (!rows.some((x) => x.role === r.key)) rows.push(blankRow(r));
  }
  return rows;
}

function blankRow(role) {
  return {
    _k: newKey(),
    role: role.key,
    name: "",
    whatsapp: "",
    email: "",
    availability: "",
    shareWithGuests: !!role.share,
    notes: "",
  };
}

const stripRow = ({ _k, ...rest }) => rest;
const isFilled = (r) => hasText(r.name) || hasText(r.whatsapp) || hasText(r.email);
const sig = (rows) => JSON.stringify(rows.filter(isFilled).map(stripRow));

function ContactsPanel({ contacts, roles, onSave }) {
  const [rows, setRows] = useState(() => toRows(contacts, roles));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const baseline = useMemo(() => sig(toRows(contacts, roles)), [contacts, roles]);
  const dirty = sig(rows) !== baseline;

  // Server data changed (initial load, after save) → start from it.
  useEffect(() => {
    setRows(toRows(contacts, roles));
  }, [contacts, roles]);

  const update = (k, patch) => {
    setRows((list) => list.map((r) => (r._k === k ? { ...r, ...patch } : r)));
    setErrors((e) => {
      const n = { ...e };
      Object.keys(patch).forEach((f) => delete n[`${k}.${f}`]);
      return n;
    });
    setFormError("");
  };

  const validate = () => {
    const e = {};
    for (const r of rows) {
      if (hasText(r.whatsapp) && !PHONE_RE.test(r.whatsapp.trim()))
        e[`${r._k}.whatsapp`] = "Use the full international number, e.g. +62 812 3456 7890";
      if (hasText(r.email) && !EMAIL_RE.test(r.email.trim()))
        e[`${r._k}.email`] = "That email doesn't look right";
    }
    return e;
  };

  const save = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      setFormError("A couple of details need fixing — they're marked in red.");
      const first = Object.keys(e)[0].split(".")[0];
      document.getElementById(`row-${first}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSaving(true);
    const list = rows.filter(isFilled).map(stripRow);
    const res = await onSave(list);
    setSaving(false);
    if (res.ok) {
      setErrors({});
      setFormError("");
      return;
    }
    if (res.validation) {
      // The server names the contact ("The number for "Wayan" doesn't look right…").
      const quoted = /"([^"]+)"/.exec(res.message || "")?.[1];
      const hit = quoted && rows.find((r) => isFilled(r) && (r.name.trim() === quoted || r.role === quoted));
      if (hit) setErrors({ [`${hit._k}.whatsapp`]: res.message });
      setFormError(res.message);
    }
  };

  const discard = () => {
    setRows(toRows(contacts, roles));
    setErrors({});
    setFormError("");
  };

  return (
    <div>
      <div className="rounded-xl border border-ink-100 bg-white px-4 py-3 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <p className="text-sm text-ink-600">
          <span className="font-bold text-ink-900">Private numbers stay private.</span> Your AI only
          gives a guest a number when you've switched on{" "}
          <span className="font-semibold">"Guests can get this number"</span>. Everyone else is kept
          on file for you and your team, and is never shared with guests.
        </p>
      </div>

      <div className="mt-4 grid md:grid-cols-2 gap-4">
        {roles.map((role) => {
          const meta = ROLE_META[role.key] || { icon: UserRound, help: "" };
          const Icon = meta.icon;
          const list = rows.filter((r) => r.role === role.key);
          const missing = role.required && !list.some((r) => hasText(r.whatsapp));
          return (
            <section
              key={role.key}
              id={`contact-${role.key}`}
              className={`card p-4 sm:p-5 scroll-mt-24 ${meta.multiple ? "md:col-span-2" : ""} ${
                missing ? "border-accent-200" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-ink-50 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-ink-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h3 className="font-bold text-ink-900">{role.label}</h3>
                    {role.required && (
                      <span className="inline-flex items-center rounded-full bg-accent-100 text-accent-800 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5">
                        Must-have
                      </span>
                    )}
                  </div>
                  {meta.help && <p className="text-xs text-ink-500 mt-0.5">{meta.help}</p>}
                  {missing && (
                    <p className="text-xs font-semibold text-accent-700 mt-1">
                      Add a WhatsApp number so your AI can point guests here.
                    </p>
                  )}
                </div>
              </div>

              <div className={`mt-4 ${meta.multiple ? "grid lg:grid-cols-2 gap-4" : "space-y-4"}`}>
                {list.map((r, i) => (
                  <ContactFields
                    key={r._k}
                    row={r}
                    errors={errors}
                    onChange={(patch) => update(r._k, patch)}
                    removable={meta.multiple && list.length > 1}
                    clearable={isFilled(r)}
                    onRemove={() => setRows((all) => all.filter((x) => x._k !== r._k))}
                    onClear={() =>
                      update(r._k, { name: "", whatsapp: "", email: "", availability: "", notes: "" })
                    }
                    index={meta.multiple && list.length > 1 ? i + 1 : 0}
                  />
                ))}
              </div>

              {meta.multiple && (
                <button
                  onClick={() => setRows((all) => [...all, blankRow(role)])}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:text-brand-700"
                >
                  <Plus className="w-4 h-4" />
                  Add another {role.key === "taxi" ? "driver or taxi company" : "contact"}
                </button>
              )}
            </section>
          );
        })}
      </div>

      <SaveBar
        dirty={dirty}
        saving={saving}
        error={formError}
        onSave={save}
        onDiscard={discard}
        label="Save contacts"
      />
    </div>
  );
}

function ContactFields({ row, errors, onChange, removable, clearable, onRemove, onClear, index }) {
  const err = (f) => errors[`${row._k}.${f}`];
  const field = (f, label, icon, props = {}) => {
    const Icon = icon;
    return (
      <div>
        <label htmlFor={`${row._k}-${f}`} className="text-xs font-bold text-ink-500">
          {label}
        </label>
        <div className="relative mt-1">
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
          <input
            id={`${row._k}-${f}`}
            value={row[f]}
            onChange={(e) => onChange({ [f]: e.target.value })}
            aria-invalid={!!err(f)}
            className={`input pl-9 ${err(f) ? "border-rose-400 focus:ring-rose-400" : ""}`}
            {...props}
          />
        </div>
        {err(f) && <p className="text-xs text-rose-600 mt-1">{err(f)}</p>}
      </div>
    );
  };

  return (
    <div id={`row-${row._k}`} className={index ? "rounded-xl border border-ink-100 p-3.5" : ""}>
      {(index > 0 || removable || clearable) && (
        <div className="flex items-center justify-between mb-2 min-h-[20px]">
          <span className="text-[11px] font-bold uppercase tracking-wide text-ink-400">
            {index ? `#${index}` : ""}
          </span>
          {removable ? (
            <button onClick={onRemove} className="text-xs font-semibold text-ink-400 hover:text-rose-600 inline-flex items-center gap-1">
              <Trash2 className="w-3.5 h-3.5" />
              Remove
            </button>
          ) : clearable ? (
            <button onClick={onClear} className="text-xs font-semibold text-ink-400 hover:text-ink-700">
              Clear
            </button>
          ) : null}
        </div>
      )}
      <div className="grid sm:grid-cols-2 gap-3">
        {field("name", "Name", UserRound, { placeholder: "e.g. Wayan", maxLength: 120 })}
        {field("whatsapp", "WhatsApp number", Phone, {
          placeholder: "+62 812 3456 7890",
          inputMode: "tel",
          maxLength: 30,
        })}
        {field("email", "Email (optional)", Mail, {
          placeholder: "name@hotel.com",
          type: "email",
          maxLength: 160,
        })}
        {field("availability", "When they're available", Clock, {
          placeholder: "e.g. 24/7 or Mon–Sat, 8am–5pm",
          maxLength: 120,
        })}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={row.shareWithGuests}
        onClick={() => onChange({ shareWithGuests: !row.shareWithGuests })}
        className={`mt-3 w-full flex items-start gap-3 rounded-xl border px-3.5 py-2.5 text-left transition ${
          row.shareWithGuests ? "border-emerald-200 bg-emerald-50/60" : "border-ink-100 bg-ink-50/60"
        }`}
      >
        <span
          className={`relative mt-0.5 inline-flex h-5 w-9 shrink-0 rounded-full transition ${
            row.shareWithGuests ? "bg-emerald-500" : "bg-ink-300"
          }`}
        >
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
              row.shareWithGuests ? "left-[18px]" : "left-0.5"
            }`}
          />
        </span>
        <span className="min-w-0">
          <span className="flex items-center gap-1.5 text-sm font-bold text-ink-900">
            {row.shareWithGuests ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            Guests can get this number
          </span>
          <span className="block text-xs text-ink-500 mt-0.5">
            {row.shareWithGuests
              ? "Your AI may give this number to a guest who needs it."
              : "Private — never given to guests. The AI tells them your team will help instead."}
          </span>
        </span>
      </button>
    </div>
  );
}

/* ═══ How your AI behaves ═══════════════════════════════════════════════ */
const toRules = (playbook) =>
  playbook.map((p) => ({ _k: newKey(), situation: p.situation || "", response: p.response || "" }));
const ruleSig = (rules) =>
  JSON.stringify(rules.map((r) => ({ situation: r.situation.trim(), response: r.response.trim() })));

function PlaybookPanel({ playbook, onSave }) {
  const [rules, setRules] = useState(() => toRules(playbook));
  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const baseline = useMemo(() => ruleSig(toRules(playbook)), [playbook]);
  const dirty = ruleSig(rules) !== baseline;
  const lastAdded = useRef(null);

  useEffect(() => {
    setRules(toRules(playbook));
    setShowErrors(false);
  }, [playbook]);

  useEffect(() => {
    if (!lastAdded.current) return;
    document.getElementById(`rule-${lastAdded.current}`)?.focus();
    lastAdded.current = null;
  }, [rules.length]);

  const incomplete = (r) => !hasText(r.situation) || !hasText(r.response);

  const update = (k, patch) => setRules((list) => list.map((r) => (r._k === k ? { ...r, ...patch } : r)));

  const add = () => {
    const k = newKey();
    lastAdded.current = k;
    setRules((list) => [...list, { _k: k, situation: "", response: "" }]);
  };

  const save = async () => {
    // A rule with only one half filled would be silently dropped by the server.
    const bad = rules.filter((r) => incomplete(r) && (hasText(r.situation) || hasText(r.response)));
    if (bad.length) {
      setShowErrors(true);
      toast.error("Fill in both parts of each rule, or remove it.");
      document.getElementById(`rule-${bad[0]._k}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSaving(true);
    await onSave(
      rules
        .filter((r) => !incomplete(r))
        .map((r) => ({ situation: r.situation.trim(), response: r.response.trim() })),
    );
    setSaving(false);
  };

  return (
    <div>
      <div className="rounded-xl border border-ink-100 bg-white px-4 py-3 flex items-start gap-3">
        <Lightbulb className="w-5 h-5 text-accent-500 shrink-0 mt-0.5" />
        <p className="text-sm text-ink-600">
          These are <span className="font-bold text-ink-900">instructions to your AI</span>, not
          messages to guests. They tell it what to do in tricky moments — an emergency, an angry
          guest, a refund request — so it handles them the way you would.
        </p>
      </div>

      <div className="mt-4 space-y-3">
        {rules.length === 0 && (
          <div className="rounded-2xl border border-dashed border-ink-200 bg-white p-8 text-center">
            <p className="font-bold text-ink-900">No rules yet</p>
            <p className="text-sm text-ink-500 mt-1">Add one for each situation you want handled your way.</p>
          </div>
        )}
        {rules.map((r, i) => {
          const flagged = showErrors && incomplete(r);
          return (
            <div key={r._k} className={`card p-4 ${flagged ? "border-rose-300" : ""}`}>
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-lg bg-ink-100 text-ink-600 text-xs font-black flex items-center justify-center shrink-0 mt-6">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1 grid gap-3">
                  <div>
                    <label htmlFor={`rule-${r._k}`} className="text-xs font-bold text-ink-500">
                      When…
                    </label>
                    <input
                      id={`rule-${r._k}`}
                      value={r.situation}
                      onChange={(e) => update(r._k, { situation: e.target.value })}
                      maxLength={200}
                      placeholder="e.g. A guest asks for a late check-out on a Sunday"
                      className={`input mt-1 font-semibold ${flagged && !hasText(r.situation) ? "border-rose-400" : ""}`}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-ink-500">Your AI should…</label>
                    <textarea
                      value={r.response}
                      onChange={(e) => update(r._k, { response: e.target.value })}
                      maxLength={1000}
                      rows={2}
                      placeholder="e.g. Say yes until 2pm at no charge, later than that costs half a night."
                      className={`input mt-1 min-h-[72px] ${flagged && !hasText(r.response) ? "border-rose-400" : ""}`}
                    />
                  </div>
                  {flagged && (
                    <p className="text-xs text-rose-600 -mt-1">Fill in both parts, or remove this rule.</p>
                  )}
                </div>
                <button
                  onClick={() => setRules((list) => list.filter((x) => x._k !== r._k))}
                  aria-label="Remove rule"
                  title="Remove"
                  className="p-2 rounded-lg text-ink-400 hover:text-rose-600 hover:bg-rose-50 transition shrink-0 mt-5"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={add} className="btn-secondary mt-4" disabled={rules.length >= 60}>
        <Plus className="w-4 h-4" />
        Add a rule
      </button>

      <SaveBar
        dirty={dirty}
        saving={saving}
        onSave={save}
        onDiscard={() => {
          setRules(toRules(playbook));
          setShowErrors(false);
        }}
        label="Save rules"
      />
    </div>
  );
}

/* ── Sticky save bar (shared) ────────────────────────────────────────── */
function SaveBar({ dirty, saving, error, onSave, onDiscard, label }) {
  return (
    <AnimatePresence>
      {(dirty || error) && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          className="sticky bottom-16 lg:bottom-0 z-20 mt-5 pb-4"
        >
          <div className="rounded-2xl bg-ink-900 text-white shadow-card-lg px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
            <p className={`text-sm flex-1 ${error ? "text-rose-200" : "text-ink-200"}`}>
              {error || "You have unsaved changes. Your AI keeps using the old version until you save."}
            </p>
            <div className="flex items-center gap-2 justify-end">
              {dirty && (
                <button
                  onClick={onDiscard}
                  disabled={saving}
                  className="text-sm font-semibold text-ink-300 hover:text-white px-3 py-2 transition"
                >
                  Discard
                </button>
              )}
              <button onClick={onSave} disabled={saving || !dirty} className="btn-primary">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {label}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══ Test your AI ══════════════════════════════════════════════════════ */
function TestChat({ messages, setMessages, onTeach, tall = false }) {
  const [text, setText] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const ask = async (raw) => {
    const message = String(raw ?? text).trim();
    if (!message || thinking) return;
    const history = messages
      .filter((m) => !m.error)
      .map((m) => ({ role: m.role, content: m.content }));
    setMessages((m) => [...m, { role: "user", content: message }]);
    setText("");
    setThinking(true);
    try {
      const { data } = await api.post("/training/test", { message, history });
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: data.reply || "(The AI chose not to reply to this one.)",
          fromTraining: !!data.fromTraining,
          escalate: !!data.escalate,
          question: message,
        },
      ]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: errMsg(e, "The AI couldn't answer just now. Try again."),
          error: true,
        },
      ]);
    } finally {
      setThinking(false);
    }
  };

  return (
    <div
      className={`rounded-2xl border border-ink-100 bg-white shadow-card overflow-hidden flex flex-col ${
        tall ? "h-[calc(100vh-260px)] min-h-[480px]" : "h-[calc(100vh-140px)] max-h-[640px] min-h-[420px]"
      }`}
    >
      <div className="px-4 py-3.5 border-b border-ink-100 flex items-center gap-2.5">
        <div className="relative w-9 h-9 rounded-xl bg-brand-500 text-white flex items-center justify-center">
          <Bot className="w-4.5 h-4.5" />
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-ink-900 text-sm">Test your AI</p>
          <p className="text-[11px] text-ink-400">
            Ask like a guest would. Real answers — nothing is sent to anyone.
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="text-xs font-semibold text-ink-400 hover:text-ink-700 px-2 py-1"
          >
            Start over
          </button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-ink-50/50">
        {messages.length === 0 && (
          <div className="text-center pt-4">
            <Sparkles className="w-6 h-6 text-brand-400 mx-auto" />
            <p className="text-sm font-semibold text-ink-700 mt-2">See how your AI answers guests</p>
            <p className="text-xs text-ink-400 mt-0.5">Tap a question or type your own</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {SUGGESTED_TESTS.map((q) => (
                <button
                  key={q}
                  onClick={() => ask(q)}
                  className="text-xs font-semibold text-ink-700 bg-white border border-ink-200 hover:border-brand-300 hover:text-brand-700 rounded-full px-3 py-1.5 transition"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className="max-w-[88%]">
              <div
                className={`rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-line leading-relaxed ${
                  m.role === "user"
                    ? "bg-brand-500 text-white rounded-br-md"
                    : m.error
                      ? "bg-rose-50 text-rose-800 border border-rose-100 rounded-bl-md"
                      : "bg-white text-ink-800 border border-ink-100 rounded-bl-md"
                }`}
              >
                {m.content}
              </div>
              {m.role === "assistant" && !m.error && (
                <div className="mt-1 ml-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                  {m.fromTraining ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                      <GraduationCap className="w-3.5 h-3.5" />
                      From your training
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink-500">
                      <Sparkles className="w-3.5 h-3.5" />
                      Written by the AI from your hotel's info
                    </span>
                  )}
                  {m.escalate && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-accent-700">
                      <Users className="w-3.5 h-3.5" />
                      Would alert your team
                    </span>
                  )}
                  {!m.fromTraining && m.question && onTeach && (
                    <button
                      onClick={() => onTeach(m.question)}
                      className="text-[11px] font-bold text-brand-600 hover:text-brand-700 underline-offset-2 hover:underline"
                    >
                      Teach it the exact answer
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {thinking && (
          <div className="flex justify-start">
            <div className="bg-white border border-ink-100 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
              {[0, 1, 2].map((d) => (
                <motion.span
                  key={d}
                  className="w-1.5 h-1.5 rounded-full bg-ink-400"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: d * 0.15 }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask();
        }}
        className="p-3 border-t border-ink-100 flex items-center gap-2"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask a question as a guest…"
          className="input flex-1"
          maxLength={2000}
          aria-label="Test question"
        />
        <button
          type="submit"
          disabled={!text.trim() || thinking}
          className="w-10 h-10 shrink-0 inline-flex items-center justify-center bg-brand-500 hover:bg-brand-600 text-white rounded-xl transition disabled:opacity-50"
          aria-label="Send"
        >
          {thinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
}
