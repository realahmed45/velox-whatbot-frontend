import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  X,
  Bot,
  Instagram,
  Zap,
  Rocket,
  Sparkles,
  ArrowRight,
  Play,
} from "lucide-react";

const STORAGE_KEY = "botlify_welcome_seen_v1";

const HIGHLIGHTS = [
  {
    icon: Instagram,
    title: "Connect Instagram",
    desc: "One-click Meta-approved login. No password sharing, ever.",
  },
  {
    icon: Zap,
    title: "Pick your automations",
    desc: "DM auto-replies, comment-to-DM, story replies, mentions, broadcasts — turn on what you need.",
  },
  {
    icon: Bot,
    title: "Let the AI handle the rest",
    desc: "Your chatbot answers FAQs 24/7, qualifies leads, and pings you for the real conversations.",
  },
];

/**
 * One-time welcome modal shown on the user's first dashboard visit.
 * Gated by localStorage so it never appears twice.
 */
export default function WelcomeModal({ userName }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        // tiny delay so the dashboard mounts first (smoother UX)
        const t = setTimeout(() => setOpen(true), 350);
        return () => clearTimeout(t);
      }
    } catch {
      /* ignore storage errors */
    }
  }, []);

  const close = () => {
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  if (!open) return null;

  const firstName = (userName || "").split(" ")[0] || "there";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-ink-950/70 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-hero overflow-hidden border border-ink-100 animate-slide-up">
        {/* Top hero strip */}
        <div className="relative bg-gradient-to-br from-indigo-600 via-violet-600 to-pink-600 p-6 sm:p-8 text-white overflow-hidden">
          <div className="absolute inset-0 bg-grid-dark bg-grid-32 opacity-40" />
          <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-white/15 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full bg-pink-300/30 blur-3xl" />

          <button
            type="button"
            onClick={close}
            aria-label="Close welcome"
            className="absolute top-3 right-3 w-9 h-9 rounded-md bg-white/15 hover:bg-white/25 backdrop-blur flex items-center justify-center text-white transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="relative">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur text-[10px] uppercase tracking-[0.2em] font-bold">
              <Sparkles className="w-3 h-3" /> Welcome aboard
            </span>
            <h2
              id="welcome-title"
              className="mt-3 text-2xl sm:text-3xl font-black tracking-tight leading-tight"
            >
              Hey {firstName} — welcome to your Instagram command center.
            </h2>
            <p className="mt-2 text-sm sm:text-base text-white/85 max-w-lg">
              Botlify is your all-in-one suite: AI chatbot, DM automations,
              comment-to-DM, story replies, broadcasts and more. Most users go
              live in under 6 minutes — here's how.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8">
          <ol className="space-y-3.5">
            {HIGHLIGHTS.map((h, i) => {
              const Icon = h.icon;
              return (
                <li key={h.title} className="flex items-start gap-3.5">
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-md bg-brand-gradient flex items-center justify-center text-white shadow-glow">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white border-2 border-brand-500 text-brand-700 text-[10px] font-black flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <p className="font-bold text-ink-900 text-sm">{h.title}</p>
                    <p className="text-xs text-ink-500 mt-0.5 leading-relaxed">
                      {h.desc}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="mt-6 p-3.5 rounded-md bg-brand-50/60 border border-brand-100 flex items-start gap-3">
            <div className="w-9 h-9 rounded-md bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Play className="w-4 h-4 text-brand-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-ink-900">
                Prefer a guided tour?
              </p>
              <p className="text-[11px] text-ink-500 mt-0.5">
                The Guide page walks through every step with screenshots — open
                anytime from the sidebar.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
            <button
              type="button"
              onClick={close}
              className="text-xs font-semibold text-ink-500 hover:text-ink-800 transition"
            >
              Skip for now
            </button>
            <div className="flex items-center gap-2">
              <Link
                to="/dashboard/guide"
                onClick={close}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-md text-sm font-semibold border border-ink-200 text-ink-700 hover:border-brand-300 hover:text-brand-700 transition"
              >
                <Play className="w-4 h-4" /> Watch the tour
              </Link>
              <Link
                to="/dashboard/settings"
                onClick={close}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-md text-sm font-semibold bg-brand-gradient text-white shadow-glow hover:shadow-glow-lg transition"
              >
                <Rocket className="w-4 h-4" /> Start setup
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
