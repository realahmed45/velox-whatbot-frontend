/**
 * TrainingReminder — keeps nudging the hotelier until the AI has the
 * must-have details it needs to look after guests on its own.
 *
 *  <TrainingReminder />          slim banner, mounted once in DashboardLayout.
 *                                Hidden on the Train your AI page itself (that
 *                                page shows its own pop-up), hidden once
 *                                everything is filled in, and dismissible for
 *                                the rest of the browser session.
 *
 *  <ReadinessModal ... />        the friendly "a few details are missing" pop-up,
 *                                used by TrainAiPage on load.
 *
 * Reads GET /api/training/readiness → { readiness: { complete, percent,
 * missingAnswers: [{id, question, category}], missingContacts: [{role, label}] } }
 */
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CircleHelp,
  GraduationCap,
  Phone,
  Sparkles,
  X,
} from "lucide-react";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";

const BANNER_KEY = "botlify.trainingReminder.dismissed";
const TRAIN_PATH = "/dashboard/train";
const REFRESH_MS = 60_000;

/* sessionStorage can throw (private mode, blocked storage) — never let it break the UI. */
export function sessionGet(key) {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}
export function sessionSet(key, value) {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

export function missingCount(readiness) {
  if (!readiness) return 0;
  return (
    (readiness.missingAnswers?.length || 0) +
    (readiness.missingContacts?.length || 0)
  );
}

/* ── Banner for the dashboard layout ─────────────────────────────────── */
export default function TrainingReminder() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeWorkspace = useAuthStore((s) => s.activeWorkspace);
  const [readiness, setReadiness] = useState(null);
  const [dismissed, setDismissed] = useState(() => !!sessionGet(BANNER_KEY));
  const lastFetch = useRef(0);
  const prevPath = useRef(location.pathname);

  const onTrainPage = location.pathname.startsWith(TRAIN_PATH);

  useEffect(() => {
    if (!activeWorkspace || dismissed) return;
    const leftTrainPage =
      prevPath.current.startsWith(TRAIN_PATH) && !onTrainPage;
    prevPath.current = location.pathname;
    if (onTrainPage) return;
    // Refresh on navigation, but at most once a minute — unless the
    // hotelier just came back from filling things in.
    if (!leftTrainPage && Date.now() - lastFetch.current < REFRESH_MS) return;
    lastFetch.current = Date.now();
    let alive = true;
    api
      .get("/training/readiness")
      .then(({ data }) => alive && setReadiness(data?.readiness || null))
      .catch(() => alive && setReadiness(null));
    return () => {
      alive = false;
    };
  }, [activeWorkspace, location.pathname, onTrainPage, dismissed]);

  // A workspace switch starts fresh.
  useEffect(() => {
    lastFetch.current = 0;
    setReadiness(null);
  }, [activeWorkspace]);

  const count = missingCount(readiness);
  const show = !dismissed && !onTrainPage && readiness && !readiness.complete && count > 0;

  const dismiss = () => {
    sessionSet(BANNER_KEY, "1");
    setDismissed(true);
  };

  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="overflow-hidden"
        >
          <div className="card group relative mx-4 mt-4 flex items-center gap-3 overflow-hidden px-4 py-3 sm:mx-6">
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-r from-amber-100/70 via-amber-50/40 to-transparent" />
            <div aria-hidden className="pointer-events-none absolute inset-y-3 left-0 w-[3px] rounded-full bg-amber-400" />
            <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white shadow-[inset_0_1px_0_#fff,0_0_0_1px_rgba(245,158,11,0.2),0_6px_14px_-6px_rgba(245,158,11,0.5)] transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]">
              <GraduationCap className="h-4.5 w-4.5 text-amber-600" strokeWidth={1.8} />
            </div>
            <div className="relative min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink-900">
                Your AI is missing {count} must-have{" "}
                {count === 1 ? "detail" : "details"}
              </p>
              <p className="text-xs text-ink-600 mt-0.5 hidden sm:block">
                Fill them in so it can look after guests without you stepping in.
                It's {readiness.percent}% ready.
              </p>
            </div>
            <button
              onClick={() => navigate(`${TRAIN_PATH}?fill=1`)}
              className="btn-primary group/cta relative shrink-0 px-3 py-2 text-xs sm:text-sm"
            >
              Fill them in
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 ease-spring group-hover/cta:translate-x-0.5" />
            </button>
            <button
              onClick={dismiss}
              aria-label="Hide for now"
              title="Hide for now"
              className="group/x relative grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-400 transition hover:bg-white/70 hover:text-ink-700 active:scale-90"
            >
              <X className="h-4 w-4 transition-transform duration-500 ease-spring group-hover/x:rotate-90" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── The pop-up ──────────────────────────────────────────────────────── */
export function ReadinessModal({ open, readiness, categories = [], onFill, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const answers = readiness?.missingAnswers || [];
  const contacts = readiness?.missingContacts || [];
  const label = (key) => categories.find((c) => c.key === key)?.label || "";
  const MAX = 6;

  return (
    <AnimatePresence>
      {open && readiness && (
        <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-night-950/40 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="readiness-title"
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1, transitionEnd: { filter: "none" } }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            className="relative w-full sm:max-w-md glass-strong rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden"
          >
            <div aria-hidden className="pointer-events-none absolute inset-x-8 top-0 h-px bg-sunset opacity-60" />
            <button
              onClick={onClose}
              aria-label="Close"
              className="group/x absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-xl text-ink-400 transition hover:bg-ink-900/[0.05] hover:text-ink-700 active:scale-90"
            >
              <X className="h-4 w-4 transition-transform duration-500 ease-spring group-hover/x:rotate-90" />
            </button>
            <div className="px-6 pt-6 pb-4">
              <div className="relative grid h-12 w-12 place-items-center rounded-2xl bg-sunset shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_24px_-10px_rgba(255,61,119,0.7)]">
                <Sparkles className="h-6 w-6 text-white" strokeWidth={1.8} />
              </div>
              <h2 id="readiness-title" className="mt-4 text-lg font-display font-semibold tracking-[-0.02em] text-ink-900">
                Almost there — your AI needs a few details
              </h2>
              <p className="mt-1 text-sm text-ink-500 leading-relaxed">
                Guests ask about these all the time. Once they're filled in, your AI
                can answer them on its own, any time of day, with no one from your
                team needed.
              </p>
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs font-bold text-ink-500">
                  <span>Ready to look after guests</span>
                  <span className="text-ink-900">{readiness.percent}%</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink-900/[0.06]">
                  <div
                    className="h-full rounded-full bg-sunset transition-all duration-700 ease-out-expo"
                    style={{ width: `${readiness.percent}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="px-6 pb-4 overflow-y-auto space-y-4">
              {answers.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-ink-400">
                    Questions to answer ({answers.length})
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {answers.slice(0, MAX).map((a) => (
                      <li key={a.id || a.question} className="flex items-start gap-2 text-sm text-ink-700">
                        <CircleHelp className="w-4 h-4 text-accent-500 mt-0.5 shrink-0" />
                        <span className="min-w-0">
                          {a.question}
                          {label(a.category) && (
                            <span className="text-ink-400"> · {label(a.category)}</span>
                          )}
                        </span>
                      </li>
                    ))}
                    {answers.length > MAX && (
                      <li className="text-xs text-ink-400 pl-6">
                        and {answers.length - MAX} more
                      </li>
                    )}
                  </ul>
                </div>
              )}
              {contacts.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-ink-400">
                    People to add ({contacts.length})
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {contacts.map((c) => (
                      <li key={c.role} className="flex items-start gap-2 text-sm text-ink-700">
                        <Phone className="w-4 h-4 text-accent-500 mt-0.5 shrink-0" />
                        <span>{c.label} — WhatsApp number</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-ink-900/[0.06] bg-white/50 px-6 py-4 sm:flex-row sm:justify-end">
              <button onClick={onClose} className="btn-ghost">
                Later
              </button>
              <button onClick={onFill} className="btn-primary">
                Fill them now
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
