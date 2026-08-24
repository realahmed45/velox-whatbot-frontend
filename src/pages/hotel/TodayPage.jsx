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
import {
  ArrowDownRight,
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
  X,
} from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";

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
    <div className="card overflow-hidden">
      {/* header */}
      <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-ink-100">
        <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center text-white shadow-glow flex-shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-ink-900 leading-tight">
            Botlify Agent
          </h2>
          <p className="text-xs text-ink-500 leading-tight mt-0.5">
            Ask about your hotel, or tell it what to change.
          </p>
        </div>
      </div>

      {/* transcript */}
      <div
        ref={scrollRef}
        className="max-h-[340px] min-h-[132px] overflow-y-auto px-4 sm:px-5 py-4 space-y-3"
      >
        {messages.length === 0 && !busy && (
          <div className="text-center py-3">
            <p className="text-sm text-ink-500 mb-3">
              Try something like&hellip;
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="text-xs font-medium px-3 py-1.5 rounded-full border border-ink-200 text-ink-600 hover:border-brand-300 hover:text-brand-700 hover:bg-brand-50 transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap break-words ${
                m.role === "user"
                  ? "bg-brand-500 text-white rounded-br-md"
                  : "bg-ink-100 text-ink-800 rounded-bl-md"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {busy && (
          <div className="flex justify-start">
            <div className="bg-ink-100 rounded-2xl rounded-bl-md px-3.5 py-2.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-ink-400 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-ink-400 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-ink-400 animate-bounce" />
            </div>
          </div>
        )}

        {/* inline confirm card — the agent never acts without approval */}
        {pending && !busy && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-1.5">
              Confirm this change
            </p>
            <p className="text-sm text-ink-800 mb-3">
              {pending.summary || "The agent wants to make a change."}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={confirmAction}
                className="btn-primary text-xs px-3 py-1.5"
              >
                <Check className="w-3.5 h-3.5" /> Do it
              </button>
              <button
                type="button"
                onClick={cancelAction}
                className="btn-ghost text-xs px-3 py-1.5"
              >
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 px-4 sm:px-5 py-3 border-t border-ink-100 bg-ink-50/60"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Change Deluxe to $95 next weekend…"
          disabled={busy}
          className="input flex-1 py-2"
          aria-label="Message the Botlify Agent"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="btn-primary px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Send"
        >
          {busy ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
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
    <div
      className={`rounded-lg border p-4 ${
        up ? "border-emerald-200 bg-emerald-50/60" : "border-amber-200 bg-amber-50/60"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <p className="text-sm font-bold text-ink-900 truncate">
            {s.room || "Room"}
          </p>
          <p className="text-xs text-ink-500 mt-0.5">{range}</p>
        </div>
        <div
          className={`flex items-center gap-1 flex-shrink-0 text-sm font-bold ${
            up ? "text-emerald-700" : "text-amber-700"
          }`}
        >
          {up ? (
            <ArrowUpRight className="w-4 h-4" />
          ) : (
            <ArrowDownRight className="w-4 h-4" />
          )}
        </div>
      </div>

      <p className="text-base font-bold text-ink-900 mb-2">
        <span className="text-ink-400 line-through font-semibold">
          {money(s.currentRate, s.currency)}
        </span>
        <span className="mx-1.5 text-ink-400">→</span>
        <span className={up ? "text-emerald-700" : "text-amber-700"}>
          {money(s.suggestedRate, s.currency)}
        </span>
      </p>

      {s.reason && <p className="text-xs text-ink-600 mb-3.5">{s.reason}</p>}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => act("approve")}
          disabled={!!busy}
          className="btn-primary text-xs px-3 py-1.5 disabled:opacity-60"
        >
          {busy === "approve" ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Check className="w-3.5 h-3.5" />
          )}
          Approve
        </button>
        <button
          type="button"
          onClick={() => act("skip")}
          disabled={!!busy}
          className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-60"
        >
          {busy === "skip" ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <X className="w-3.5 h-3.5" />
          )}
          Skip
        </button>
      </div>
    </div>
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

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-ink-100 last:border-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink-900 truncate">
          {booking.guestName || "Guest"}
        </p>
        <p className="text-xs text-ink-500 truncate mt-0.5">
          {[room, booking.unitLabel, booking.code].filter(Boolean).join(" · ") || "—"}
        </p>
      </div>
      {done ? (
        <span className="badge-green flex-shrink-0">
          <Check className="w-3 h-3" />
          {kind === "in" ? "In" : "Out"}
        </span>
      ) : (
        <button
          type="button"
          onClick={act}
          disabled={busy}
          className="btn-secondary text-xs px-2.5 py-1.5 flex-shrink-0 disabled:opacity-60"
        >
          {busy ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : kind === "in" ? (
            <LogIn className="w-3.5 h-3.5" />
          ) : (
            <LogOut className="w-3.5 h-3.5" />
          )}
          {kind === "in" ? "Check in" : "Check out"}
        </button>
      )}
    </div>
  );
}

function GlanceCard({ icon: Icon, title, children }) {
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-brand-600" />
        <h3 className="text-sm font-bold text-ink-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */

export default function TodayPage() {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [data, setData] = useState(null);
  const { activeWorkspace } = useAuthStore();
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-5 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-ink-900 tracking-tight">
          Today
        </h1>
        <p className="text-sm text-ink-500 mt-1">
          {new Date().toLocaleDateString(undefined, {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </div>

      {/* ── 1. The agent (always available, even if today's data failed) ── */}
      <div className="mb-6">
        <AgentChat onActionDone={refresh} />
      </div>

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-40 w-full" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      ) : failed ? (
        <EmptyState
          icon={CalendarCheck}
          title="Couldn't load today"
          description="We couldn't reach your hotel data. Check your connection and try again."
          action={
            <button type="button" onClick={() => load()} className="btn-primary">
              Try again
            </button>
          }
        />
      ) : (
        <>
          {/* ── 2. Pricing suggestions ─────────────────────────────── */}
          {suggestions.length > 0 && (
            <section className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-brand-600" />
                <h2 className="section-heading">Pricing suggestions</h2>
                <span className="badge-brand">{suggestions.length}</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {suggestions.map((s) => (
                  <SuggestionCard key={s._id} s={s} onDone={refresh} />
                ))}
              </div>
            </section>
          )}

          {/* ── 3. Today at a glance ───────────────────────────────── */}
          <section>
            <h2 className="section-heading mb-3">Today at a glance</h2>

            {/* counters */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              <div className="card p-4">
                <p className="text-xs font-medium text-ink-500 uppercase tracking-wider mb-1">
                  Arrivals
                </p>
                <p className="text-2xl font-bold text-ink-900">
                  {arrivals.length}
                </p>
              </div>
              <div className="card p-4">
                <p className="text-xs font-medium text-ink-500 uppercase tracking-wider mb-1">
                  Departures
                </p>
                <p className="text-2xl font-bold text-ink-900">
                  {departures.length}
                </p>
              </div>
              <div className="card p-4">
                <p className="text-xs font-medium text-ink-500 uppercase tracking-wider mb-1">
                  In house
                </p>
                <p className="text-2xl font-bold text-ink-900">
                  {data?.inHouse ?? 0}
                </p>
              </div>
              <div className="card p-4">
                <p className="text-xs font-medium text-ink-500 uppercase tracking-wider mb-1">
                  Revenue (MTD)
                </p>
                <p className="text-2xl font-bold text-ink-900 truncate">
                  {money(revenue.monthToDate, revenue.currency)}
                </p>
                {topSources.length > 0 && (
                  <p className="text-[11px] text-ink-400 mt-1.5 truncate">
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
                )}
              </div>
            </div>

            {/* arrivals / departures lists */}
            <div className="grid gap-4 sm:grid-cols-2">
              <GlanceCard icon={DoorOpen} title="Arriving today">
                {arrivals.length === 0 ? (
                  <p className="text-sm text-ink-500 py-6 text-center">
                    No arrivals today
                  </p>
                ) : (
                  arrivals.map((b) => (
                    <GlanceRow key={b._id} booking={b} kind="in" onDone={refresh} />
                  ))
                )}
              </GlanceCard>

              <GlanceCard icon={BedDouble} title="Departing today">
                {departures.length === 0 ? (
                  <p className="text-sm text-ink-500 py-6 text-center">
                    No departures today
                  </p>
                ) : (
                  departures.map((b) => (
                    <GlanceRow key={b._id} booking={b} kind="out" onDone={refresh} />
                  ))
                )}
              </GlanceCard>
            </div>

            {arrivals.length === 0 &&
              departures.length === 0 &&
              (data?.inHouse ?? 0) === 0 &&
              suggestions.length === 0 && (
                <div className="mt-4">
                  <EmptyState
                    icon={Users}
                    title="A quiet day"
                    description="No arrivals, departures or guests in house. Ask the agent about your upcoming bookings."
                  />
                </div>
              )}
          </section>
        </>
      )}
    </div>
  );
}
