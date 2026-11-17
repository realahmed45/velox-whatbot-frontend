/**
 * Today — the hotel owner's home screen.
 *
 * Three stacked blocks:
 *   1. Botlify Agent chat (hero) — ask anything, confirm any action.
 *   2. Pricing suggestions — approve/skip the revenue manager's ideas.
 *   3. Today at a glance — arrivals, departures, in-house, MTD revenue.
 *
 * Everything below the chat comes from a single GET /api/agent/today.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api from "@/services/api";
import { usePropertyScope } from "@/store/propertyStore";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BedDouble,
  CalendarCheck,
  Check,
  DoorOpen,
  Loader2,
  LogIn,
  LogOut,
  Send,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
  X,
} from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import ConnectionStatus from "@/components/ConnectionStatus";
import {
  Magnetic,
  NumberTicker,
  PulseDot,
  Reveal,
  Spotlight,
} from "@/components/fx";

const money = (amount, currency) =>
  `${currency || "USD"} ${Number(amount || 0).toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })}`;

const fmtDay = (d) =>
  d
    ? new Date(d).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : "—";

const errMsg = (e, fallback) => e?.response?.data?.message || fallback;

const spring = { type: "spring", stiffness: 420, damping: 30 };

const bubbleIn = {
  initial: { opacity: 0, y: 10, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -4, scale: 0.97 },
  transition: spring,
};

/* ────────────────────────────────────────────────────────────────────────── */
/* 1. Botlify Agent chat                                                      */
/* ────────────────────────────────────────────────────────────────────────── */

const SUGGESTED = [
  "Who checks in today?",
  "How many rooms are free this weekend?",
  "What's my revenue this month?",
];

function AgentChat({ onActionDone }) {
  // Local-only transcript — nothing is persisted between visits.
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  // The action the agent wants the owner to approve, if any.
  const [pending, setPending] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy, pending]);

  // The backend expects a plain [{role, content}] history.
  const historyFor = (list) =>
    list
      .filter((m) => m.role === "user" || m.role === "assistant")
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }));

  const send = useCallback(
    async (text) => {
      const message = String(text || "").trim();
      if (!message || busy) return;
      const next = [...messages, { role: "user", content: message }];
      setMessages(next);
      setInput("");
      setPending(null);
      setBusy(true);
      try {
        const { data } = await api.post("/agent/chat", {
          message,
          history: historyFor(messages),
        });
        if (data.reply) {
          setMessages((m) => [
            ...m,
            { role: "assistant", content: data.reply },
          ]);
        }
        if (data.pendingAction) setPending(data.pendingAction);
      } catch (e) {
        toast.error(errMsg(e, "The agent couldn't answer just now"));
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: "Sorry — I couldn't reach the system. Please try again.",
          },
        ]);
      } finally {
        setBusy(false);
      }
    },
    [busy, messages],
  );

  // [Do it] — re-post the same endpoint with `confirm` so the agent executes.
  const confirmAction = useCallback(async () => {
    if (!pending || busy) return;
    const action = pending;
    setPending(null);
    setBusy(true);
    try {
      const { data } = await api.post("/agent/chat", {
        confirm: { name: action.name, args: action.args },
        history: historyFor(messages),
      });
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.reply || "Done." },
      ]);
      // A completed action can change rates/bookings — refresh the screen.
      onActionDone?.();
    } catch (e) {
      toast.error(errMsg(e, "Couldn't complete that"));
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "That didn't go through. Nothing changed." },
      ]);
    } finally {
      setBusy(false);
    }
  }, [pending, busy, messages, onActionDone]);

  const cancelAction = () => {
    setPending(null);
    setMessages((m) => [
      ...m,
      { role: "assistant", content: "No problem — I've left everything as it was." },
    ]);
  };

  return (
    <div className="relative">
      {/* soft sunset halo behind the panel */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-6 -inset-y-4 -z-10 rounded-[2.5rem] bg-[#FF5A1F] opacity-[0.12] blur-3xl"
      />
      <div className="relative overflow-hidden rounded-3xl bg-white ring-1 ring-black/[0.07] shadow-[0_30px_60px_-40px_rgba(10,10,10,0.45)]">
        {/* specular sunset hairline */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#FF5A1F]/60 to-transparent"
        />
        {/* header */}
        <div className="relative flex items-center gap-3 bg-[#0A0A0A] px-4 py-4 sm:px-6">
          <div className="group relative flex-shrink-0">
            <div
              aria-hidden
              className="absolute inset-0 rounded-xl bg-[#FF5A1F] opacity-50 blur-md transition-opacity duration-500 group-hover:opacity-80"
            />
            <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-[#FF5A1F] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]">
              <Sparkles className="h-[18px] w-[18px]" strokeWidth={1.8} />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="flex items-center gap-2 font-geist text-[15px] font-semibold leading-tight tracking-[-0.02em] text-white">
              Botlify Agent
              <PulseDot color="bg-emerald-500" />
            </h2>
            <p className="mt-0.5 truncate text-xs leading-tight text-white/55">
              Ask about your hotel, or tell it what to change.
            </p>
          </div>
        </div>

        {/* transcript */}
        <div
          ref={scrollRef}
          className="max-h-[420px] min-h-[220px] space-y-3 overflow-y-auto px-4 py-5 sm:px-6"
        >
          {messages.length === 0 && !busy && (
            <div className="py-3 text-center">
              <p className="mb-3.5 text-sm text-ink-500">
                Try something like&hellip;
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {SUGGESTED.map((s, i) => (
                  <motion.button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...spring, delay: 0.08 * i }}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    className="group inline-flex min-h-[36px] items-center gap-1.5 rounded-full bg-white/80 px-3.5 py-1.5 text-xs font-medium text-ink-600 ring-1 ring-ink-900/[0.07] shadow-[inset_0_1px_0_#fff,0_1px_2px_rgba(15,23,42,0.04)] transition-[color,box-shadow] duration-300 hover:text-ink-900 hover:ring-[#FF5A1F]/30 hover:shadow-[inset_0_1px_0_#fff,0_10px_22px_-12px_rgba(255,90,31,0.5)]"
                  >
                    <Sparkles
                      className="h-3 w-3 text-[#FF5A1F] transition-transform duration-500 ease-spring group-hover:rotate-[-14deg] group-hover:scale-125"
                      strokeWidth={1.8}
                    />
                    {s}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                {...bubbleIn}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`relative max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "rounded-br-md bg-[#0A0A0A] text-white shadow-[0_10px_24px_-14px_rgba(10,10,10,0.6)]"
                      : "rounded-bl-md bg-white/85 text-ink-800 ring-1 ring-ink-900/[0.06] shadow-[inset_0_1px_0_#fff,0_1px_2px_rgba(15,23,42,0.04)]"
                  }`}
                >
                  {m.content}
                </div>
              </motion.div>
            ))}

            {busy && (
              <motion.div key="typing" {...bubbleIn} className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-white/85 px-4 py-3 ring-1 ring-ink-900/[0.06] shadow-[inset_0_1px_0_#fff]">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#FF5A1F] [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#FF5A1F] [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#FF5A1F]" />
                </div>
              </motion.div>
            )}

            {/* inline confirm card — the agent never acts without approval */}
            {pending && !busy && (
              <motion.div
                key="pending"
                {...bubbleIn}
                className="rounded-2xl bg-amber-50/90 p-4 ring-1 ring-amber-300/50 shadow-[inset_0_1px_0_#fff,0_12px_28px_-16px_rgba(245,158,11,0.5)]"
              >
                <p className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-amber-700">
                  <PulseDot color="bg-amber-500" />
                  Confirm this change
                </p>
                <p className="mb-3.5 text-sm text-ink-800">
                  {pending.summary || "The agent wants to make a change."}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={confirmAction}
                    className="btn bg-[#FF5A1F] text-white shadow-[0_10px_24px_-12px_rgba(255,90,31,0.8)] hover:bg-[#E84A12] hover:-translate-y-0.5 active:scale-[0.97] px-3.5 py-2 text-xs"
                  >
                    <Check className="h-3.5 w-3.5" /> Do it
                  </button>
                  <button
                    type="button"
                    onClick={cancelAction}
                    className="btn-ghost px-3.5 py-2 text-xs"
                  >
                    <X className="h-3.5 w-3.5" /> Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* composer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2 border-t border-ink-900/[0.06] bg-white/40 px-3 py-3 sm:px-5"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Change Deluxe to $95 next weekend…"
            disabled={busy}
            className="input flex-1 rounded-2xl py-2.5"
            aria-label="Message the Botlify Agent"
          />
          <Magnetic strength={0.25}>
            <motion.button
              type="submit"
              disabled={busy || !input.trim()}
              whileTap={{ scale: 0.92 }}
              className="btn bg-[#FF5A1F] text-white shadow-[0_10px_24px_-12px_rgba(255,90,31,0.8)] hover:bg-[#E84A12] hover:-translate-y-0.5 active:scale-[0.97] h-11 w-11 rounded-2xl p-0 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Send"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" strokeWidth={1.8} />
              )}
            </motion.button>
          </Magnetic>
        </form>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* 2. Pricing suggestions                                                     */
/* ────────────────────────────────────────────────────────────────────────── */

function SuggestionCard({ s, onDone }) {
  const [busy, setBusy] = useState(null); // "approve" | "skip" | null
  const up = s.direction === "up" || s.suggestedRate > s.currentRate;

  const act = async (kind) => {
    if (busy) return;
    setBusy(kind);
    try {
      await api.post(`/agent/suggestions/${s._id}/${kind}`);
      toast.success(kind === "approve" ? "New rate applied" : "Suggestion skipped");
      onDone?.();
    } catch (e) {
      toast.error(
        errMsg(e, kind === "approve" ? "Couldn't apply that rate" : "Couldn't skip that"),
      );
      setBusy(null);
    }
  };

  const range =
    s.dateFrom && s.dateTo && fmtDay(s.dateFrom) !== fmtDay(s.dateTo)
      ? `${fmtDay(s.dateFrom)} – ${fmtDay(s.dateTo)}`
      : fmtDay(s.dateFrom);

  return (
    <Spotlight className="card group h-full p-5 transition-transform duration-300 hover:-translate-y-0.5">
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent ${
          up ? "via-emerald-400/70" : "via-amber-400/70"
        } to-transparent`}
      />
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-geist text-[15px] font-semibold tracking-[-0.01em] text-ink-900">
            {s.room || "Room"}
          </p>
          <p className="mt-0.5 text-xs text-ink-500">{range}</p>
        </div>
        <div
          className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg] ${
            up ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
          }`}
        >
          {up ? (
            <ArrowUpRight className="h-4 w-4" strokeWidth={1.8} />
          ) : (
            <ArrowDownRight className="h-4 w-4" strokeWidth={1.8} />
          )}
        </div>
      </div>

      <p className="mb-2 flex flex-wrap items-baseline gap-x-1.5 font-geist text-lg font-semibold tabular-nums text-ink-900">
        <span className="text-sm font-medium text-ink-400 line-through">
          {money(s.currentRate, s.currency)}
        </span>
        <ArrowRight className="h-3.5 w-3.5 self-center text-ink-300" />
        <span className={up ? "text-emerald-700" : "text-amber-700"}>
          {money(s.suggestedRate, s.currency)}
        </span>
      </p>

      {s.reason && <p className="mb-4 text-xs leading-relaxed text-ink-600">{s.reason}</p>}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => act("approve")}
          disabled={!!busy}
          className="btn bg-[#FF5A1F] text-white shadow-[0_10px_24px_-12px_rgba(255,90,31,0.8)] hover:bg-[#E84A12] hover:-translate-y-0.5 active:scale-[0.97] px-3.5 py-2 text-xs disabled:opacity-60"
        >
          {busy === "approve" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Check className="h-3.5 w-3.5" />
          )}
          Approve
        </button>
        <button
          type="button"
          onClick={() => act("skip")}
          disabled={!!busy}
          className="btn-ghost px-3.5 py-2 text-xs disabled:opacity-60"
        >
          {busy === "skip" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <X className="h-3.5 w-3.5" />
          )}
          Skip
        </button>
      </div>
    </Spotlight>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* 3. Today at a glance                                                       */
/* ────────────────────────────────────────────────────────────────────────── */

function GlanceRow({ booking, kind, onDone }) {
  const [busy, setBusy] = useState(false);
  const done = kind === "in" ? !!booking.checkedInAt : !!booking.checkedOutAt;

  const act = async () => {
    if (busy || done) return;
    setBusy(true);
    try {
      await api.post(
        `/pms/bookings/${booking._id}/${kind === "in" ? "check-in" : "check-out"}`,
      );
      toast.success(kind === "in" ? "Checked in" : "Checked out");
      onDone?.();
    } catch (e) {
      toast.error(
        errMsg(e, kind === "in" ? "Couldn't check in" : "Couldn't check out"),
      );
      setBusy(false);
    }
  };

  const room = booking.roomTypeId?.name || booking.unitLabel || "";
  const initial = (booking.guestName || "G").trim().charAt(0).toUpperCase();

  return (
    <div className="group -mx-2 flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors duration-200 hover:bg-[#FFF1EA]/60">
      <div
        className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-full font-geist text-sm font-semibold ring-1 transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:scale-105 ${
          done
            ? "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20"
            : "bg-[#FFF1EA] text-[#FF5A1F] ring-[#FF5A1F]/15"
        }`}
      >
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink-900">
          {booking.guestName || "Guest"}
        </p>
        <p className="mt-0.5 truncate text-xs text-ink-500">
          {[room, booking.unitLabel, booking.code].filter(Boolean).join(" · ") || "—"}
        </p>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.span
            key="done"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
            className="badge-green flex-shrink-0"
          >
            <Check className="h-3 w-3" />
            {kind === "in" ? "In" : "Out"}
          </motion.span>
        ) : (
          <motion.button
            key="act"
            type="button"
            onClick={act}
            disabled={busy}
            exit={{ opacity: 0, scale: 0.85 }}
            whileTap={{ scale: 0.94 }}
            className="btn-secondary group/btn min-h-[36px] flex-shrink-0 px-3 py-1.5 text-xs disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : kind === "in" ? (
              <LogIn className="h-3.5 w-3.5 transition-transform duration-500 ease-spring group-hover/btn:translate-x-0.5" />
            ) : (
              <LogOut className="h-3.5 w-3.5 transition-transform duration-500 ease-spring group-hover/btn:translate-x-0.5" />
            )}
            {kind === "in" ? "Check in" : "Check out"}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

function GlanceCard({ icon: Icon, title, count, children }) {
  return (
    <div className="group h-full rounded-2xl bg-white p-4 ring-1 ring-black/[0.06] shadow-[0_1px_2px_rgba(10,10,10,0.04)] sm:p-5">
      <div className="mb-3 flex items-center gap-2.5 border-b border-black/[0.05] pb-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#FFF1EA] text-[#FF5A1F] transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]">
          <Icon className="h-4 w-4" strokeWidth={1.8} />
        </div>
        <h3 className="font-geist text-[15px] font-semibold tracking-[-0.02em] text-[#0A0A0A]">
          {title}
        </h3>
        {count > 0 && (
          <span className="ml-auto rounded-full bg-[#0A0A0A] px-2.5 py-0.5 text-[11px] font-semibold tabular-nums text-white">
            {count}
          </span>
        )}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, children, footer, hero = false }) {
  return (
    <div
      className={`group relative h-full overflow-hidden rounded-2xl p-4 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 sm:p-5 ${
        hero
          ? "bg-[#0A0A0A] text-white shadow-[0_24px_48px_-28px_rgba(10,10,10,0.8)]"
          : "bg-white ring-1 ring-black/[0.06] shadow-[0_1px_2px_rgba(10,10,10,0.04)] hover:shadow-[0_20px_40px_-26px_rgba(255,90,31,0.55)] hover:ring-[#FF5A1F]/25"
      }`}
    >
      {hero && (
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#FF5A1F] opacity-30 blur-2xl"
        />
      )}
      {/* orange accent bar slides in on hover */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-[#FF5A1F] transition-transform duration-500 ease-out group-hover:scale-x-100"
      />
      <div className="relative flex items-start justify-between gap-2">
        <p
          className={`text-[11px] font-semibold uppercase tracking-[0.08em] ${
            hero ? "text-white/55" : "text-black/45"
          }`}
        >
          {label}
        </p>
        <div
          className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg] ${
            hero
              ? "bg-[#FF5A1F] text-white shadow-[0_8px_18px_-8px_rgba(255,90,31,0.8)]"
              : "bg-[#FFF1EA] text-[#FF5A1F]"
          }`}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </div>
      </div>
      <p
        className={`relative mt-3 truncate font-geist text-3xl font-semibold tracking-[-0.04em] tabular-nums sm:text-[34px] ${
          hero ? "text-white" : "text-[#0A0A0A]"
        }`}
      >
        {children}
      </p>
      {footer}
    </div>
  );
}

function EmptyRow({ text }) {
  return (
    <div className="flex flex-col items-center justify-center py-7 text-center">
      <div className="mb-2 grid h-9 w-9 place-items-center rounded-full bg-ink-900/[0.04] text-ink-400">
        <Check className="h-4 w-4" strokeWidth={1.8} />
      </div>
      <p className="text-sm text-ink-500">{text}</p>
    </div>
  );
}

const greetingFor = (h) =>
  h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";

/* ────────────────────────────────────────────────────────────────────────── */

export default function TodayPage() {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [data, setData] = useState(null);
  const { activeWorkspace, user } = useAuthStore();
  // Which property this screen is about (null = whole account, the normal
  // single-hotel case).
  const { propertyId } = usePropertyScope(activeWorkspace);

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await api.get("/agent/today", {
        params: propertyId ? { propertyId } : undefined,
      });
      setData(data);
      setFailed(false);
    } catch (e) {
      setFailed(true);
      toast.error(errMsg(e, "Couldn't load today's overview"));
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(() => load({ silent: true }), [load]);

  const arrivals = data?.arrivals || [];
  const departures = data?.departures || [];
  const suggestions = data?.suggestions || [];
  const revenue = data?.revenue || {};

  const topSources = useMemo(
    () =>
      [...(revenue.bySource || [])]
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 3),
    [revenue.bySource],
  );

  const firstName = String(user?.name || "").trim().split(/\s+/)[0];
  const greeting = greetingFor(new Date().getHours());

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-12 pt-6 font-geist sm:px-6 sm:pt-8 lg:px-8">
      {/* ── Page header ─────────────────────────────────────────────── */}
      <Reveal className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[12px] font-medium text-black/60 ring-1 ring-black/[0.07]">
            <CalendarCheck className="h-3.5 w-3.5 text-[#FF5A1F]" strokeWidth={1.8} />
            Today ·{" "}
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
          <h1 className="font-geist text-[30px] font-semibold leading-[1.02] tracking-[-0.045em] text-[#0A0A0A] sm:text-[44px]">
            {greeting},{" "}
            <span className="text-[#FF5A1F]">{firstName || "there"}</span>
          </h1>
          <p className="mt-2 text-sm text-black/55 sm:text-[15px]">
            Here&apos;s your hotel at a glance — and an agent ready for anything.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start rounded-full bg-[#0A0A0A] py-1.5 pl-2.5 pr-3.5 text-xs font-medium text-white sm:self-auto">
          <PulseDot color="bg-emerald-400" />
          AI agent online
        </div>
      </Reveal>

      {/* ── Where the OTA connection really is ─────────────────────────
          Hidden entirely when nothing is connected and nothing needs fixing,
          so a direct-only hotel isn't nagged about a channel they never
          asked for. When the approval wait IS running, this is where they
          see it narrated honestly instead of wondering. */}
      <div className="mb-6 empty:hidden">
        <ConnectionStatus compact hideWhenIdle />
      </div>

      {/* ── KPI counters ────────────────────────────────────────────── */}
      {loading ? (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[124px] w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        !failed && (
          <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <Reveal delay={0} className="h-full">
              <KpiCard icon={DoorOpen} label="Arrivals">
                <NumberTicker value={arrivals.length} />
              </KpiCard>
            </Reveal>
            <Reveal delay={0.06} className="h-full">
              <KpiCard icon={LogOut} label="Departures">
                <NumberTicker value={departures.length} />
              </KpiCard>
            </Reveal>
            <Reveal delay={0.12} className="h-full">
              <KpiCard icon={BedDouble} label="In house">
                <NumberTicker value={data?.inHouse ?? 0} />
              </KpiCard>
            </Reveal>
            <Reveal delay={0.18} className="h-full">
              <KpiCard
                icon={Wallet}
                label="Revenue (MTD)"
                hero
                footer={
                  topSources.length > 0 && (
                    <p className="relative mt-1.5 truncate text-[11px] capitalize text-white/50">
                      {topSources
                        .map(
                          (s) =>
                            `${String(s.source || "other").replace(/_/g, " ")} ${money(
                              s.revenue,
                              revenue.currency,
                            )}`,
                        )
                        .join(" · ")}
                    </p>
                  )
                }
              >
                <span className="text-2xl sm:text-[28px]">
                  <NumberTicker
                    value={Number(revenue.monthToDate || 0)}
                    prefix={`${revenue.currency || "USD"} `}
                  />
                </span>
              </KpiCard>
            </Reveal>
          </div>
        )
      )}

      {/* ── Agent + today's movements ───────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* The agent is always available, even if today's data failed */}
        <Reveal delay={0.06} className="min-w-0 lg:col-span-7">
          <AgentChat onActionDone={refresh} />
        </Reveal>

        <div className="min-w-0 lg:col-span-5">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-48 w-full rounded-2xl" />
              <Skeleton className="h-48 w-full rounded-2xl" />
            </div>
          ) : failed ? (
            <EmptyState
              icon={CalendarCheck}
              title="Couldn't load today"
              description="We couldn't reach your hotel data. Check your connection and try again."
              action={
                <button
                  type="button"
                  onClick={() => load()}
                  className="btn bg-[#FF5A1F] text-white shadow-[0_10px_24px_-12px_rgba(255,90,31,0.8)] hover:bg-[#E84A12] hover:-translate-y-0.5 active:scale-[0.97]"
                >
                  Try again
                </button>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <Reveal delay={0.05} className="h-full">
                <GlanceCard icon={DoorOpen} title="Arriving today" count={arrivals.length}>
                  {arrivals.length === 0 ? (
                    <EmptyRow text="No arrivals today" />
                  ) : (
                    arrivals.map((b) => (
                      <GlanceRow key={b._id} booking={b} kind="in" onDone={refresh} />
                    ))
                  )}
                </GlanceCard>
              </Reveal>

              <Reveal delay={0.1} className="h-full">
                <GlanceCard icon={BedDouble} title="Departing today" count={departures.length}>
                  {departures.length === 0 ? (
                    <EmptyRow text="No departures today" />
                  ) : (
                    departures.map((b) => (
                      <GlanceRow key={b._id} booking={b} kind="out" onDone={refresh} />
                    ))
                  )}
                </GlanceCard>
              </Reveal>
            </div>
          )}
        </div>
      </div>

      {!loading && !failed && (
        <>
          {/* ── Pricing suggestions ──────────────────────────────────── */}
          {suggestions.length > 0 && (
            <section className="mt-8">
              <div className="mb-4 flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#0A0A0A] text-[#FF5A1F]">
                  <TrendingUp className="h-4 w-4" strokeWidth={1.8} />
                </div>
                <h2 className="font-geist text-lg font-semibold tracking-[-0.03em] text-[#0A0A0A]">
                  Pricing suggestions
                </h2>
                <span className="rounded-full bg-[#FF5A1F] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-white">
                  {suggestions.length}
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {suggestions.map((s, i) => (
                  <Reveal key={s._id} delay={i * 0.06} className="h-full">
                    <SuggestionCard s={s} onDone={refresh} />
                  </Reveal>
                ))}
              </div>
            </section>
          )}

          {arrivals.length === 0 &&
            departures.length === 0 &&
            (data?.inHouse ?? 0) === 0 &&
            suggestions.length === 0 && (
              <div className="mt-6">
                <EmptyState
                  icon={Users}
                  title="A quiet day"
                  description="No arrivals, departures or guests in house. Ask the agent about your upcoming bookings."
                />
              </div>
            )}
        </>
      )}
    </div>
  );
}
