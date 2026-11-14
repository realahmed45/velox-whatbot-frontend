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
import { Magnetic, PulseDot, Reveal, SlidingTabs, Spotlight } from "@/components/fx";
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

const spring = { type: "spring", stiffness: 420, damping: 30 };
const hop =
  "transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]";
/* Liquid-glass "must-have" ring (cards use box-shadow rings, not borders). */
const ringWarn =
  "shadow-[inset_0_1px_0_#fff,0_0_0_1.5px_rgba(255,181,71,0.55),0_10px_28px_-16px_rgba(255,106,43,0.45)]";
const ringError =
  "shadow-[inset_0_1px_0_#fff,0_0_0_1.5px_rgba(244,63,94,0.5),0_10px_28px_-16px_rgba(244,63,94,0.4)]";
const ringFocus =
  "shadow-[inset_0_1px_0_#fff,0_0_0_1.5px_rgba(255,106,43,0.6),0_18px_40px_-18px_rgba(255,61,119,0.45)]";
const mustHave =
  "inline-flex items-center rounded-full bg-sunset-soft text-sunset-flame ring-1 ring-sunset-flame/20 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5";

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-8">
      <Reveal as="header" className="group flex items-start gap-3.5 mb-6">
        <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sunset text-white shadow-[0_10px_24px_-10px_rgba(255,61,119,0.6)] ${hop}`}>
          <GraduationCap className="h-5 w-5" strokeWidth={1.8} />
        </div>
        <div className="min-w-0">
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-ink-900">
            Train your <span className="font-serif italic font-normal">AI</span>
          </h1>
          <p className="text-sm text-ink-500 mt-0.5 max-w-2xl">
            Teach your AI what guests ask, who to call, and how to handle tricky
            moments — so it can look after guests on its own, day and night.
          </p>
        </div>
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
          <button onClick={load} className="btn-secondary group mt-4 min-h-[40px]">
            <RotateCcw className="w-4 h-4 transition-transform duration-700 ease-spring group-hover:-rotate-180" />
            Try again
          </button>
        </div>
      ) : (
        <>
          <ReadinessCard readiness={readiness} onFill={goToMissing} />

          {/* Segmented control */}
          <div className="mt-6 mb-5 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto no-scrollbar">
            <SlidingTabs
              className="min-w-max"
              value={tab}
              onChange={setTab}
              items={TABS.map((t) => {
                const dot =
                  (t.key === "questions" && readiness?.missingAnswers.length > 0) ||
                  (t.key === "contacts" && readiness?.missingContacts.length > 0);
                return {
                  value: t.key,
                  icon: t.icon,
                  label: (
                    <>
                      <span className="hidden sm:inline">{t.label}</span>
                      <span className="sm:hidden">{t.short}</span>
                      {dot && (
                        <span aria-label="Needs attention" className="ml-0.5 inline-flex">
                          <PulseDot color="bg-sunset-flame" />
                        </span>
                      )}
                    </>
                  ),
                };
              })}
            />
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
                <motion.div
                  initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="max-w-3xl mx-auto"
                >
                  <TestChat messages={chat} setMessages={setChat} onTeach={teach} tall />
                </motion.div>
              )}
            </div>

            {tab !== "test" && (
              <aside className="hidden xl:block xl:sticky xl:top-6">
                <Reveal delay={0.12}>
                  <TestChat messages={chat} setMessages={setChat} onTeach={teach} />
                </Reveal>
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
      <div className="card h-28 p-5 flex items-center gap-4">
        <div className="h-16 w-16 shrink-0 rounded-full bg-ink-900/[0.06] animate-pulse" />
        <div className="flex-1 space-y-2.5">
          <div className="h-4 w-64 max-w-full rounded bg-ink-900/[0.06] animate-pulse" />
          <div className="h-3 w-80 max-w-full rounded bg-ink-900/[0.06] animate-pulse" />
          <div className="h-2 w-full rounded-full bg-ink-900/[0.06] animate-pulse" />
        </div>
      </div>
      <div className="h-11 w-80 max-w-full rounded-2xl bg-ink-900/[0.06] animate-pulse" />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="card h-20 p-4 space-y-2.5">
          <div className="h-3.5 w-1/2 rounded bg-ink-900/[0.06] animate-pulse" />
          <div className="h-3 w-3/4 rounded bg-ink-900/[0.06] animate-pulse" />
        </div>
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
      <Reveal>
      <Spotlight className="card relative overflow-hidden p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 shadow-[inset_0_1px_0_#fff,0_0_0_1px_rgba(16,185,129,0.25),0_18px_40px_-20px_rgba(16,185,129,0.45)]">
        <div aria-hidden className="pointer-events-none absolute -left-10 -top-16 h-48 w-48 rounded-full bg-emerald-400/25 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -right-10 -bottom-16 h-40 w-40 rounded-full bg-sunset opacity-[0.12] blur-3xl" />
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 14, delay: 0.15 }}
          className="relative grid h-14 w-14 shrink-0 place-items-center"
        >
          <span className="absolute inset-0 rounded-2xl bg-emerald-400/40 blur-xl" />
          <span className="absolute inset-0 rounded-2xl bg-emerald-400/30 animate-ping-soft" />
          <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_12px_28px_-10px_rgba(16,185,129,0.7)]">
            <CircleCheck className="w-7 h-7" strokeWidth={2} />
          </span>
        </motion.div>
        <div className="relative min-w-0 flex-1">
          <p className="font-display text-lg font-semibold tracking-[-0.02em] text-ink-900">
            Your AI is <span className="font-serif italic font-normal">ready</span> to look after guests on its own
          </p>
          <p className="text-sm text-ink-600 mt-0.5">
            Every must-have is filled in. {readiness.answered} of {readiness.total} questions
            answered — the more you answer, the fewer messages reach your team.
          </p>
          <div className="mt-3 h-1.5 rounded-full bg-emerald-500/15 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${readiness.total ? Math.round((readiness.answered / readiness.total) * 100) : 100}%` }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
      </Spotlight>
      </Reveal>
    );
  }

  const parts = [];
  if (answers) parts.push(`${answers} must-have ${answers === 1 ? "answer" : "answers"}`);
  if (people) parts.push(`${people} ${people === 1 ? "contact" : "contacts"}`);

  return (
    <Reveal>
    <Spotlight className="card relative overflow-hidden p-5 sm:p-6">
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-sunset opacity-[0.10] blur-3xl" />
      <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
        <div className="relative w-16 h-16 shrink-0">
          <span aria-hidden className="absolute inset-1 rounded-full bg-sunset opacity-20 blur-xl" />
          <svg viewBox="0 0 36 36" className="relative w-16 h-16 -rotate-90">
            <defs>
              <linearGradient id="train-ring-sunset" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FFB547" />
                <stop offset="35%" stopColor="#FF6A2B" />
                <stop offset="70%" stopColor="#FF3D77" />
                <stop offset="100%" stopColor="#7C5CFF" />
              </linearGradient>
            </defs>
            <circle cx="18" cy="18" r="15.5" fill="none" strokeWidth="3.5" className="stroke-ink-900/[0.07]" />
            <motion.circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="url(#train-ring-sunset)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: Math.max(0.001, readiness.percent / 100) }}
              transition={{ type: "spring", stiffness: 60, damping: 16 }}
            />
          </svg>
          <motion.span
            key={readiness.percent}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
            className="absolute inset-0 flex items-center justify-center font-display text-[15px] font-semibold tabular-nums text-ink-900"
          >
            {readiness.percent}%
          </motion.span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-semibold tracking-[-0.02em] text-ink-900">
            {parts.join(" and ")} still missing
          </p>
          <p className="text-sm text-ink-500 mt-0.5">
            Until these are filled in, some guests will need someone from your team.
            {" "}
            {readiness.answered} of {readiness.total} questions answered so far.
          </p>
          <div className="relative mt-3 h-2 rounded-full bg-ink-900/[0.06] overflow-hidden">
            <motion.div
              className="relative h-full rounded-full bg-sunset overflow-hidden"
              initial={{ width: 0 }}
              animate={{ width: `${readiness.percent}%` }}
              transition={{ type: "spring", stiffness: 70, damping: 18 }}
            >
              <motion.span
                aria-hidden
                className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                initial={{ x: "-120%" }}
                animate={{ x: "320%" }}
                transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1.6, ease: "easeInOut" }}
              />
            </motion.div>
          </div>
        </div>
        <Magnetic strength={0.25} className="shrink-0 self-start sm:self-center">
          <button onClick={onFill} className="btn-primary group min-h-[44px]">
            Show me what's missing
            <ArrowRight className="w-4 h-4 transition-transform duration-500 ease-spring group-hover:translate-x-1" />
          </button>
        </Magnetic>
      </div>
    </Spotlight>
    </Reveal>
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
              <motion.button
                key={t.key}
                data-topic={t.key}
                onClick={() => setTopic(t.key)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={spring}
                className={`relative shrink-0 inline-flex min-h-[40px] items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "text-white"
                    : "bg-white/70 text-ink-700 ring-1 ring-ink-900/[0.08] shadow-[inset_0_1px_0_#fff] hover:bg-white hover:text-ink-900"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="train-topic-pill"
                    transition={spring}
                    className="absolute inset-0 rounded-full bg-night-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_8px_20px_-8px_rgba(255,61,119,0.55)]"
                  />
                )}
                {t.missingRequired && (
                  <span
                    className="relative inline-flex"
                    title="Has must-have questions without an answer"
                  >
                    <PulseDot color="bg-sunset-flame" />
                  </span>
                )}
                <span className="relative">{t.label}</span>
                <span
                  className={`relative text-xs font-semibold tabular-nums rounded-full px-1.5 ${
                    active ? "bg-white/15 text-white" : "bg-ink-900/[0.05] text-ink-500"
                  }`}
                >
                  {t.count}
                </span>
              </motion.button>
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
        <label
          className={`inline-flex min-h-[42px] items-center gap-2.5 text-sm font-medium rounded-xl px-3 py-2 cursor-pointer select-none transition-all duration-300 ease-spring hover:-translate-y-0.5 ${
            unansweredOnly
              ? "bg-white text-ink-900 shadow-[inset_0_1px_0_#fff,0_0_0_1.5px_rgba(255,106,43,0.5)]"
              : "bg-white/70 text-ink-700 ring-1 ring-ink-900/[0.08] shadow-[inset_0_1px_0_#fff] hover:bg-white"
          }`}
        >
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
          className="btn-primary group min-h-[42px]"
        >
          <Plus className="w-4 h-4 transition-transform duration-500 ease-spring group-hover:rotate-90" />
          Add question
        </button>
      </div>

      <AnimatePresence initial={false}>
        {addDraft && (
          <motion.div
            initial={{ opacity: 0, height: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, height: "auto", filter: "blur(0px)" }}
            exit={{ opacity: 0, height: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
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
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={spring}
            className="card p-10 text-center"
          >
            {unansweredOnly && !query ? (
              <>
                <motion.div
                  initial={{ scale: 0, rotate: -40 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 380, damping: 13, delay: 0.1 }}
                  className="relative mx-auto grid h-14 w-14 place-items-center"
                >
                  <span aria-hidden className="absolute inset-0 rounded-full bg-emerald-400 opacity-30 blur-2xl" />
                  <span className="relative grid h-12 w-12 place-items-center rounded-full bg-emerald-500 text-white shadow-[0_10px_26px_-8px_rgba(16,185,129,0.65)]">
                    <CircleCheck className="w-6 h-6" />
                  </span>
                </motion.div>
                <p className="font-display text-lg font-semibold text-ink-900 mt-4">Everything here is answered</p>
                <p className="text-sm text-ink-500 mt-1">Nice work. Pick another topic, or turn off "Unanswered only".</p>
              </>
            ) : faqs.length === 0 ? (
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
        ) : (
          <AnimatePresence initial={false}>
            {shown.map((f, i) => (
              <motion.div
                key={f._id}
                layout="position"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ ...spring, delay: Math.min(i, 10) * 0.03 }}
              >
                <QuestionRow
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
          <button
            onClick={onReset}
            className="btn-ghost group px-2.5 py-1.5 text-xs text-ink-400"
          >
            <RotateCcw className="w-3.5 h-3.5 transition-transform duration-700 ease-spring group-hover:-rotate-180" />
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
      className={`card group/q p-4 transition-[transform,box-shadow] duration-500 ease-spring ${
        editing
          ? ringFocus
          : !answered && faq.required
            ? `${ringWarn} hover:-translate-y-0.5`
            : "hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_#fff,0_0_0_1px_rgba(255,106,43,0.18),0_16px_36px_-18px_rgba(255,61,119,0.32)]"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            {answered && !editing && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 18 }}
                className="grid h-4 w-4 place-items-center rounded-full bg-emerald-500 text-white"
                title="Answered"
              >
                <Check className="h-2.5 w-2.5" strokeWidth={3} />
              </motion.span>
            )}
            {faq.required && (
              <span className={mustHave}>
                Must-have
              </span>
            )}
            {topicLabel && (
              <span className="text-[11px] font-medium text-ink-400">{topicLabel}</span>
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
            <p className="font-display font-semibold tracking-[-0.01em] text-ink-900 text-[15px]">{faq.question}</p>
          )}
        </div>
        {!editing && (
          <div className="flex items-center gap-0.5 shrink-0 -mr-1 -mt-1">
            <button
              onClick={open}
              title="Edit"
              aria-label="Edit answer"
              className="grid h-10 w-10 place-items-center rounded-xl text-ink-400 transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:rotate-[-10deg] hover:text-sunset-flame hover:bg-sunset-soft active:scale-90"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(faq)}
              title="Delete"
              aria-label="Delete question"
              className="grid h-10 w-10 place-items-center rounded-xl text-ink-400 transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:text-rose-600 hover:bg-rose-50 active:scale-90"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <AnimatePresence initial={false} mode="wait">
      {editing ? (
        <motion.div
          key="edit"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
        <div className="mt-3">
          <label className="text-xs font-semibold text-ink-500">Your AI answers</label>
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
            <button onClick={() => setEditing(false)} className="btn-ghost min-h-[40px]">
              Cancel
            </button>
            <button onClick={save} disabled={!hasText(question) || saving} className="btn-primary group min-h-[40px]">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 transition-transform duration-500 ease-spring group-hover:scale-125" />}
              Save
            </button>
          </div>
        </div>
        </motion.div>
      ) : answered ? (
        <motion.button
          key="answer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={open}
          className="mt-1.5 block w-full text-left text-sm text-ink-600 whitespace-pre-line leading-relaxed hover:text-ink-900 transition-colors"
        >
          {faq.answer}
        </motion.button>
      ) : (
        <motion.div
          key="empty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="mt-2.5 rounded-xl bg-gradient-to-r from-sunset-gold/[0.10] via-sunset-flame/[0.06] to-transparent ring-1 ring-sunset-flame/25 px-3.5 py-3 flex flex-col sm:flex-row sm:items-center gap-2.5"
        >
          <p className="text-sm text-ink-700 flex-1">
            <span className="font-semibold text-ink-900">Not answered</span> — the AI won't use this until you answer.
          </p>
          <button
            onClick={open}
            className="btn-secondary group/w shrink-0 self-start sm:self-auto min-h-[40px] px-3 py-1.5 text-sm"
          >
            <Pencil className="w-3.5 h-3.5 text-sunset-flame transition-transform duration-500 ease-spring group-hover/w:rotate-[-14deg] group-hover/w:-translate-y-0.5" />
            Write the answer
          </button>
        </motion.div>
      )}
      </AnimatePresence>
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
    <div className={`glass-strong rounded-2xl p-4 sm:p-5 ${ringFocus}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-sunset text-white shadow-[0_6px_16px_-6px_rgba(255,61,119,0.6)]">
            <Plus className="h-4 w-4" />
          </span>
          <p className="font-display font-semibold tracking-[-0.01em] text-ink-900">New question</p>
        </div>
        <button onClick={onCancel} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-lg text-ink-400 transition-all duration-300 ease-spring hover:rotate-90 hover:bg-ink-900/[0.05] hover:text-ink-700">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="grid sm:grid-cols-[1fr_220px] gap-3 mt-3">
        <div>
          <label className="text-xs font-semibold text-ink-500">When a guest asks</label>
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
          <label className="text-xs font-semibold text-ink-500">Topic</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input mt-1">
            {categories.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <label className="text-xs font-semibold text-ink-500 mt-3 block">Your AI answers</label>
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
        <button onClick={onCancel} className="btn-ghost min-h-[40px]">
          Cancel
        </button>
        <button onClick={submit} disabled={!canSave} className="btn-primary group min-h-[40px]">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 transition-transform duration-500 ease-spring group-hover:rotate-90" />}
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
      <Reveal className="card px-4 py-3.5 flex items-start gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/15">
          <ShieldCheck className="w-4.5 h-4.5" strokeWidth={1.8} />
        </span>
        <p className="text-sm text-ink-600">
          <span className="font-bold text-ink-900">Private numbers stay private.</span> Your AI only
          gives a guest a number when you've switched on{" "}
          <span className="font-semibold">"Guests can get this number"</span>. Everyone else is kept
          on file for you and your team, and is never shared with guests.
        </p>
      </Reveal>

      <div className="mt-4 grid md:grid-cols-2 gap-4">
        {roles.map((role, ri) => {
          const meta = ROLE_META[role.key] || { icon: UserRound, help: "" };
          const Icon = meta.icon;
          const list = rows.filter((r) => r.role === role.key);
          const missing = role.required && !list.some((r) => hasText(r.whatsapp));
          return (
            <Reveal
              key={role.key}
              delay={Math.min(ri, 6) * 0.05}
              className={`scroll-mt-24 ${meta.multiple ? "md:col-span-2" : ""}`}
            >
            <section
              id={`contact-${role.key}`}
              className={`card group h-full p-4 sm:p-5 scroll-mt-24 transition-shadow duration-500 ${
                missing
                  ? ringWarn
                  : list.some((r) => hasText(r.whatsapp))
                    ? "shadow-[inset_0_1px_0_#fff,0_0_0_1px_rgba(16,185,129,0.18),0_10px_28px_-18px_rgba(16,185,129,0.35)]"
                    : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${missing ? "bg-sunset text-white shadow-[0_8px_20px_-8px_rgba(255,61,119,0.55)]" : "bg-sunset-soft text-sunset-flame"} ${hop}`}>
                  <Icon className="w-5 h-5" strokeWidth={1.8} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h3 className="font-display font-semibold tracking-[-0.01em] text-ink-900">{role.label}</h3>
                    {role.required && (
                      <span className={mustHave}>
                        Must-have
                      </span>
                    )}
                    {!missing && list.some((r) => hasText(r.whatsapp)) && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
                        <PulseDot color="bg-emerald-500" /> Set
                      </span>
                    )}
                  </div>
                  {meta.help && <p className="text-xs text-ink-500 mt-0.5">{meta.help}</p>}
                  {missing && (
                    <p className="text-xs font-semibold text-sunset-flame mt-1">
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
                  className="btn-secondary group/a mt-3 min-h-[40px] text-sm"
                >
                  <Plus className="w-4 h-4 text-sunset-flame transition-transform duration-500 ease-spring group-hover/a:rotate-90" />
                  Add another {role.key === "taxi" ? "driver or taxi company" : "contact"}
                </button>
              )}
            </section>
            </Reveal>
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
        <label htmlFor={`${row._k}-${f}`} className="text-xs font-semibold text-ink-500">
          {label}
        </label>
        <div className="relative mt-1">
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
          <input
            id={`${row._k}-${f}`}
            value={row[f]}
            onChange={(e) => onChange({ [f]: e.target.value })}
            aria-invalid={!!err(f)}
            className={`input pl-9 ${err(f) ? "!border-rose-400 focus:!shadow-[0_0_0_4px_rgba(244,63,94,0.12)]" : ""}`}
            {...props}
          />
        </div>
        <AnimatePresence>
          {err(f) && (
            <motion.p
              initial={{ opacity: 0, y: -4, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={spring}
              className="text-xs text-rose-600 mt-1"
            >
              {err(f)}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div id={`row-${row._k}`} className={index ? "rounded-xl bg-white/60 p-3.5 ring-1 ring-ink-900/[0.07] shadow-[inset_0_1px_0_#fff]" : ""}>
      {(index > 0 || removable || clearable) && (
        <div className="flex items-center justify-between mb-2 min-h-[20px]">
          <span className="text-[11px] font-bold uppercase tracking-wide text-ink-400">
            {index ? `#${index}` : ""}
          </span>
          {removable ? (
            <button onClick={onRemove} className="btn-ghost group/r px-2.5 py-1.5 text-xs text-ink-400 hover:!text-rose-600 hover:!bg-rose-50">
              <Trash2 className="w-3.5 h-3.5 transition-transform duration-500 ease-spring group-hover/r:rotate-[-12deg]" />
              Remove
            </button>
          ) : clearable ? (
            <button onClick={onClear} className="btn-ghost px-2.5 py-1.5 text-xs text-ink-400">
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
        className={`mt-3 w-full flex items-start gap-3 rounded-xl px-3.5 py-2.5 text-left ring-1 transition-[background-color,box-shadow,transform] duration-300 ease-spring active:scale-[0.99] ${
          row.shareWithGuests
            ? "bg-emerald-50/80 ring-emerald-500/25"
            : "bg-ink-900/[0.03] ring-ink-900/[0.06] hover:bg-white/70"
        }`}
      >
        <span
          className={`relative mt-0.5 inline-flex h-5 w-9 shrink-0 rounded-full shadow-[inset_0_1px_2px_rgba(15,23,42,0.15)] transition-colors duration-300 ${
            row.shareWithGuests ? "bg-emerald-500" : "bg-ink-900/[0.15]"
          }`}
        >
          <motion.span
            layout
            transition={{ type: "spring", stiffness: 600, damping: 28 }}
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-[0_2px_5px_rgba(15,23,42,0.25)] ${
              row.shareWithGuests ? "left-[18px]" : "left-0.5"
            }`}
          />
        </span>
        <span className="min-w-0">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-ink-900">
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
      <Reveal className="card px-4 py-3.5 flex items-start gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-sunset-soft text-sunset-flame">
          <Lightbulb className="w-4.5 h-4.5" strokeWidth={1.8} />
        </span>
        <p className="text-sm text-ink-600">
          These are <span className="font-bold text-ink-900">instructions to your AI</span>, not
          messages to guests. They tell it what to do in tricky moments — an emergency, an angry
          guest, a refund request — so it handles them the way you would.
        </p>
      </Reveal>

      <div className="mt-4 space-y-3">
        {rules.length === 0 && (
          <div className="card p-8 text-center">
            <div className="relative mx-auto mb-3 grid h-12 w-12 place-items-center">
              <span aria-hidden className="absolute inset-0 rounded-full bg-sunset opacity-20 blur-2xl" />
              <span className="relative grid h-11 w-11 place-items-center rounded-xl bg-sunset-soft text-sunset-flame">
                <ShieldCheck className="w-5 h-5" strokeWidth={1.8} />
              </span>
            </div>
            <p className="font-display font-semibold text-ink-900">No rules yet</p>
            <p className="text-sm text-ink-500 mt-1">Add one for each situation you want handled your way.</p>
          </div>
        )}
        <AnimatePresence initial={false}>
        {rules.map((r, i) => {
          const flagged = showErrors && incomplete(r);
          const done = !incomplete(r);
          return (
            <motion.div
              key={r._k}
              layout="position"
              initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.97, filter: "blur(4px)" }}
              transition={spring}
              className={`card group p-4 transition-shadow duration-500 ${flagged ? ringError : "focus-within:shadow-[inset_0_1px_0_#fff,0_0_0_1.5px_rgba(255,106,43,0.45),0_16px_36px_-18px_rgba(255,61,119,0.35)]"}`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-semibold tabular-nums mt-6 transition-colors duration-300 ${
                    done ? "bg-sunset text-white shadow-[0_6px_14px_-6px_rgba(255,61,119,0.55)]" : "bg-ink-900/[0.05] text-ink-600"
                  }`}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1 grid gap-3">
                  <div>
                    <label htmlFor={`rule-${r._k}`} className="text-xs font-semibold text-ink-500">
                      When…
                    </label>
                    <input
                      id={`rule-${r._k}`}
                      value={r.situation}
                      onChange={(e) => update(r._k, { situation: e.target.value })}
                      maxLength={200}
                      placeholder="e.g. A guest asks for a late check-out on a Sunday"
                      className={`input mt-1 font-medium ${flagged && !hasText(r.situation) ? "!border-rose-400" : ""}`}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-ink-500">Your AI should…</label>
                    <textarea
                      value={r.response}
                      onChange={(e) => update(r._k, { response: e.target.value })}
                      maxLength={1000}
                      rows={2}
                      placeholder="e.g. Say yes until 2pm at no charge, later than that costs half a night."
                      className={`input mt-1 min-h-[72px] ${flagged && !hasText(r.response) ? "!border-rose-400" : ""}`}
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
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-ink-400 transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:rotate-[-10deg] hover:text-rose-600 hover:bg-rose-50 active:scale-90 mt-5"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
        </AnimatePresence>
      </div>

      <button onClick={add} className="btn-secondary group mt-4 min-h-[42px]" disabled={rules.length >= 60}>
        <Plus className="w-4 h-4 text-sunset-flame transition-transform duration-500 ease-spring group-hover:rotate-90" />
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
          initial={{ opacity: 0, y: 24, scale: 0.97, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: 24, scale: 0.97, filter: "blur(6px)" }}
          transition={spring}
          className="sticky bottom-16 lg:bottom-0 z-20 mt-5 pb-4"
        >
          <div className="card-dark relative overflow-hidden !bg-night-950/90 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_24px_60px_-20px_rgba(255,61,119,0.45)]">
            <div aria-hidden className="pointer-events-none absolute -left-10 -top-10 h-28 w-28 rounded-full bg-sunset opacity-25 blur-3xl" />
            <p className={`relative flex items-start gap-2 text-sm flex-1 ${error ? "text-rose-200" : "text-white/70"}`}>
              <PulseDot color={error ? "bg-rose-400" : "bg-amber-400"} className="mt-1.5 shrink-0" />
              <span>{error || "You have unsaved changes. Your AI keeps using the old version until you save."}</span>
            </p>
            <div className="relative flex items-center gap-2 justify-end">
              {dirty && (
                <button
                  onClick={onDiscard}
                  disabled={saving}
                  className="btn-glass-dark min-h-[40px] px-3 py-2 text-sm"
                >
                  Discard
                </button>
              )}
              <button onClick={onSave} disabled={saving || !dirty} className="btn-primary group min-h-[40px]">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 transition-transform duration-500 ease-spring group-hover:scale-125" />}
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
      className={`card overflow-hidden flex flex-col ${
        tall ? "h-[calc(100vh-260px)] min-h-[480px]" : "h-[calc(100vh-140px)] max-h-[640px] min-h-[420px]"
      }`}
    >
      <div className="group px-4 py-3.5 border-b border-ink-900/[0.06] bg-white/60 backdrop-blur flex items-center gap-2.5">
        <div className={`relative grid h-9 w-9 place-items-center rounded-xl bg-sunset text-white shadow-[0_8px_18px_-8px_rgba(255,61,119,0.6)] ${hop}`}>
          <Bot className="w-4.5 h-4.5" />
          <span className="absolute -bottom-0.5 -right-0.5 grid place-items-center rounded-full bg-white p-[2px]">
            <PulseDot color="bg-emerald-500" />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display font-semibold text-ink-900 text-sm">Test your AI</p>
          <p className="text-[11px] text-ink-400">
            Ask like a guest would. Real answers — nothing is sent to anyone.
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="btn-ghost px-2.5 py-1.5 text-xs text-ink-400"
          >
            Start over
          </button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-ink-900/[0.015] to-ink-900/[0.035]">
        {messages.length === 0 && (
          <div className="text-center pt-4">
            <div className="relative mx-auto grid h-12 w-12 place-items-center">
              <span aria-hidden className="absolute inset-0 rounded-full bg-sunset opacity-25 blur-2xl" />
              <motion.span
                animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.08, 1] }}
                transition={{ duration: 3.2, repeat: Infinity, repeatDelay: 1.5 }}
                className="relative grid h-11 w-11 place-items-center rounded-xl bg-sunset-soft text-sunset-flame"
              >
                <Sparkles className="w-5 h-5" strokeWidth={1.8} />
              </motion.span>
            </div>
            <p className="font-display text-sm font-semibold text-ink-800 mt-3">See how your AI answers guests</p>
            <p className="text-xs text-ink-400 mt-0.5">Tap a question or type your own</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {SUGGESTED_TESTS.map((q, i) => (
                <motion.button
                  key={q}
                  onClick={() => ask(q)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ ...spring, delay: i * 0.04 }}
                  className="min-h-[34px] text-xs font-medium text-ink-700 bg-white/80 ring-1 ring-ink-900/[0.08] shadow-[inset_0_1px_0_#fff] hover:bg-white hover:text-ink-900 hover:ring-sunset-flame/35 hover:shadow-[inset_0_1px_0_#fff,0_8px_18px_-10px_rgba(255,106,43,0.5)] rounded-full px-3 py-1.5 transition-[color,background-color,box-shadow]"
                >
                  {q}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={spring}
            style={{ originX: m.role === "user" ? 1 : 0 }}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className="max-w-[88%]">
              <div
                className={`rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-line leading-relaxed ${
                  m.role === "user"
                    ? "bg-sunset text-white rounded-br-md shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_8px_20px_-10px_rgba(255,61,119,0.55)]"
                    : m.error
                      ? "bg-rose-50 text-rose-800 ring-1 ring-rose-500/15 rounded-bl-md"
                      : "bg-white/90 text-ink-800 ring-1 ring-ink-900/[0.07] shadow-[inset_0_1px_0_#fff,0_4px_14px_-10px_rgba(15,23,42,0.3)] rounded-bl-md"
                }`}
              >
                {m.content}
              </div>
              {m.role === "assistant" && !m.error && (
                <div className="mt-1 ml-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                  {m.fromTraining ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
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
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                      <Users className="w-3.5 h-3.5" />
                      Would alert your team
                    </span>
                  )}
                  {!m.fromTraining && m.question && onTeach && (
                    <button
                      onClick={() => onTeach(m.question)}
                      className="text-[11px] font-semibold text-sunset-flame hover:text-sunset-magenta underline-offset-2 hover:underline transition-colors"
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
            <div className="bg-white/90 ring-1 ring-ink-900/[0.07] rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
              {[0, 1, 2].map((d) => (
                <motion.span
                  key={d}
                  className="w-1.5 h-1.5 rounded-full bg-sunset"
                  animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
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
        className="p-3 border-t border-ink-900/[0.06] bg-white/60 backdrop-blur flex items-center gap-2"
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
          className="btn-primary group h-10 w-10 shrink-0 !p-0 justify-center disabled:opacity-50"
          aria-label="Send"
        >
          {thinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 transition-transform duration-500 ease-spring group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:rotate-12" />}
        </button>
      </form>
    </div>
  );
}
