/**
 * Bookings — every reservation across OTAs, chat channels and manual entry,
 * plus the guest message inbox behind a tab switch so conversations and
 * reservations live on one screen.
 *
 * Stats row, filterable table with source badges, New Booking modal and
 * cancel-with-confirm. Matches the Appointments/Billing page patterns.
 */
import { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import GuestInboxPage from "@/pages/inbox/GuestInboxPage";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { usePropertyScope } from "@/store/propertyStore";
import toast from "react-hot-toast";
import {
  BedDouble,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MessageSquare,
  Plus,
  TrendingUp,
  XCircle,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import {
  Magnetic,
  NumberTicker,
  Reveal,
  SlidingTabs,
  Spotlight,
} from "@/components/fx";

const STATUS_STYLE = {
  pending: "badge-yellow",
  confirmed: "badge-green",
  completed: "badge-gray",
  cancelled: "badge-red",
  no_show: "badge-red",
};

// Dot colour that leads each status pill.
const STATUS_DOT = {
  pending: "bg-amber-500",
  confirmed: "bg-emerald-500",
  completed: "bg-ink-400",
  cancelled: "bg-rose-500",
  no_show: "bg-rose-500",
};

// Colored source badges — each channel keeps its recognisable brand color.
const SOURCE_META = {
  booking_com: { label: "Booking.com", cls: "bg-blue-500/10 text-blue-700 ring-blue-500/20" },
  airbnb: { label: "Airbnb", cls: "bg-rose-500/10 text-rose-600 ring-rose-500/20" },
  whatsapp: { label: "WhatsApp", cls: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20" },
  tiktok: { label: "TikTok", cls: "bg-ink-900 text-white ring-ink-900" },
  direct: { label: "Direct", cls: "bg-ink-900/[0.04] text-ink-600 ring-ink-900/10" },
  manual: { label: "Manual", cls: "bg-ink-900/[0.04] text-ink-600 ring-ink-900/10" },
  other_ota: { label: "Other OTA", cls: "bg-sky-500/10 text-sky-700 ring-sky-500/20" },
};

function SourceBadge({ source }) {
  const m = SOURCE_META[source] || SOURCE_META.manual;
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${m.cls}`}
    >
      {m.label}
    </span>
  );
}

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

const money = (amount, currency) =>
  `${currency || "USD"} ${Number(amount || 0).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}`;

/* Premium KPI tile — black hero variant for the money number. */
function KpiTile({ icon: Icon, label, hero = false, tone = "brand", children }) {
  return (
    <div
      className={`group relative h-full overflow-hidden rounded-2xl p-4 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 sm:p-5 ${
        hero
          ? "bg-[#0A0A0A] text-white shadow-[0_24px_48px_-28px_rgba(10,10,10,0.8)]"
          : "bg-white ring-1 ring-black/[0.06] shadow-[0_1px_2px_rgba(10,10,10,0.04)] hover:shadow-[0_20px_40px_-26px_rgba(255,90,31,0.55)] hover:ring-[#FF5A1F]/25"
      }`}
    >
      {hero && (
        <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#FF5A1F] opacity-30 blur-2xl" />
      )}
      <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-[#FF5A1F] transition-transform duration-500 ease-out group-hover:scale-x-100" />
      <div className="relative flex items-start justify-between gap-2">
        <p className={`text-[11px] font-semibold uppercase tracking-[0.08em] ${hero ? "text-white/55" : "text-black/45"}`}>
          {label}
        </p>
        {Icon && (
          <div
            className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg] ${
              hero
                ? "bg-[#FF5A1F] text-white"
                : tone === "green"
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-[#FFF1EA] text-[#FF5A1F]"
            }`}
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
          </div>
        )}
      </div>
      <div className="relative mt-3">{children}</div>
    </div>
  );
}

function BookingsTable({ focusCode = "", onClearFocus }) {
  const confirm = useConfirm();
  // Which hotel this list is about (multi-property accounts only).
  const { activeWorkspace } = useAuthStore();
  const { propertyId } = usePropertyScope(activeWorkspace);
  // Memoised by id, not by object identity — an unstable params object here
  // would re-run the loaders on every render.
  const scopeParams = useMemo(
    () => (propertyId ? { propertyId } : {}),
    [propertyId],
  );
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("");
  const [source, setSource] = useState("");
  const [showNew, setShowNew] = useState(false);
  // Separate, unfiltered sample used only for the stats row.
  const [statsRows, setStatsRows] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/hotel/bookings", {
        params: {
          status: status || undefined,
          source: source || undefined,
          page,
          limit: 20,
          // Deep link from a notification (?code=…) narrows to that booking.
          search: focusCode || undefined,
          // Multi-property accounts scope to the sidebar's chosen hotel;
          // single-property accounts send nothing and get the default.
          ...scopeParams,
        },
      });
      setBookings(data.bookings || []);
      setPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch {
      toast.error("Couldn't load bookings");
    } finally {
      setLoading(false);
    }
  }, [status, source, page, scopeParams, focusCode]);

  // Bring the deep-linked booking into view once it has rendered.
  useEffect(() => {
    if (!focusCode || loading) return;
    const el = [
      document.getElementById(`booking-${focusCode}`),
      document.getElementById(`booking-m-${focusCode}`),
    ].find((x) => x && x.offsetParent !== null);
    if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [focusCode, loading, bookings]);

  const loadStats = useCallback(async () => {
    try {
      const { data } = await api.get("/hotel/bookings", {
        params: { page: 1, limit: 200, ...scopeParams },
      });
      setStatsRows(data.bookings || []);
    } catch {
      /* stats are non-blocking */
    }
  }, [scopeParams]);

  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const active = statsRows.filter((b) => b.status !== "cancelled");
    const upcoming = active.filter((b) => new Date(b.checkIn) >= now).length;
    const thisMonth = active.filter((b) => new Date(b.createdAt || b.checkIn) >= monthStart);
    const revenueByCur = {};
    for (const b of thisMonth) {
      const cur = b.currency || "USD";
      revenueByCur[cur] = (revenueByCur[cur] || 0) + Number(b.totalAmount || 0);
    }
    const revenueLabel =
      Object.keys(revenueByCur).length === 0
        ? "0"
        : Object.entries(revenueByCur)
            .map(([c, v]) => money(v, c))
            .join(" · ");
    const bySource = {};
    for (const b of active) bySource[b.source] = (bySource[b.source] || 0) + 1;
    return { upcoming, monthCount: thisMonth.length, revenueLabel, bySource };
  }, [statsRows]);

  const cancelBooking = async (b) => {
    const ok = await confirm({
      title: `Cancel booking ${b.code || ""}?`,
      description: "The guest's reservation will be marked cancelled.",
      confirmLabel: "Cancel booking",
      danger: true,
    });
    if (!ok) return;
    try {
      await api.patch(`/hotel/bookings/${b._id}/status`, {
        status: "cancelled",
      });
      toast.success("Booking cancelled");
      load();
      loadStats();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Couldn't cancel booking");
    }
  };

  const setBookingStatus = async (b, next) => {
    try {
      await api.patch(`/hotel/bookings/${b._id}/status`, { status: next });
      setBookings((list) =>
        list.map((x) => (x._id === b._id ? { ...x, status: next } : x)),
      );
      toast.success(`Marked ${next.replace("_", " ")}`);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Update failed");
    }
  };

  const statusSelect =
    "input w-full min-w-0 cursor-pointer rounded-xl py-2.5 text-sm sm:w-auto sm:min-w-[170px]";

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-12 pt-6 font-geist sm:px-6 lg:px-8">
      {/* Header */}
      <Reveal className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3.5">
          <div className="group grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl bg-[#0A0A0A] text-[#FF5A1F] shadow-[0_14px_28px_-14px_rgba(10,10,10,0.7)]">
            <CalendarCheck className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <h1 className="font-geist text-[28px] font-semibold leading-tight tracking-[-0.045em] text-[#0A0A0A] sm:text-[36px]">
              Bookings
            </h1>
            <p className="text-sm text-black/55">
              Every reservation — from your OTAs, your AI concierge, and manual
              entries.
            </p>
          </div>
        </div>
        <Magnetic strength={0.25}>
          <button onClick={() => setShowNew(true)} className="btn bg-[#FF5A1F] text-white shadow-[0_10px_24px_-12px_rgba(255,90,31,0.8)] hover:bg-[#E84A12] hover:-translate-y-0.5 active:scale-[0.97] group">
            <Plus className="h-4 w-4 transition-transform duration-500 ease-spring group-hover:rotate-90" />{" "}
            New booking
          </button>
        </Magnetic>
      </Reveal>

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Reveal delay={0} className="h-full">
          <KpiTile icon={CalendarCheck} label="Upcoming check-ins">
            <p className="font-geist text-3xl font-semibold tracking-[-0.04em] text-[#0A0A0A] tabular-nums sm:text-[34px]">
              <NumberTicker value={stats.upcoming} />
            </p>
          </KpiTile>
        </Reveal>
        <Reveal delay={0.06} className="h-full">
          <KpiTile icon={BedDouble} label="Bookings this month">
            <p className="font-geist text-3xl font-semibold tracking-[-0.04em] text-[#0A0A0A] tabular-nums sm:text-[34px]">
              <NumberTicker value={stats.monthCount} />
            </p>
          </KpiTile>
        </Reveal>
        <Reveal delay={0.12} className="h-full">
          <KpiTile icon={TrendingUp} label="Revenue this month" hero>
            <p className="truncate font-geist text-xl font-semibold tabular-nums tracking-[-0.03em] text-white sm:text-2xl">
              {stats.revenueLabel}
            </p>
          </KpiTile>
        </Reveal>
        <Reveal delay={0.18} className="h-full">
          <KpiTile label="By source">
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(stats.bySource).length === 0 ? (
                <p className="font-geist text-lg font-semibold text-black/25">—</p>
              ) : (
                Object.entries(stats.bySource).map(([s, n]) => (
                  <span key={s} className="inline-flex items-center gap-1 rounded-full bg-black/[0.03] py-0.5 pl-0.5 pr-2">
                    <SourceBadge source={s} />
                    <span className="text-xs font-semibold tabular-nums text-[#0A0A0A]">{n}</span>
                  </span>
                ))
              )}
            </div>
          </KpiTile>
        </Reveal>
      </div>

      {/* Deep-link banner (?code=…) */}
      {focusCode && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl bg-[#FFF1EA] px-4 py-3 text-sm ring-1 ring-inset ring-[#FF5A1F]/20">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#FF5A1F] text-white">
            <CalendarCheck className="h-4 w-4" strokeWidth={1.8} />
          </span>
          <span className="min-w-0 flex-1 text-[#0A0A0A]">
            Showing booking <span className="font-mono font-semibold">#{focusCode}</span>
          </span>
          <button
            type="button"
            onClick={onClearFocus}
            className="min-h-[36px] rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-[#0A0A0A] ring-1 ring-black/10 transition-transform duration-200 hover:-translate-y-0.5 active:scale-95"
          >
            Show all bookings
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 grid grid-cols-2 items-center gap-2 rounded-2xl bg-white p-2 ring-1 ring-black/[0.06] sm:flex sm:flex-wrap">
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className={statusSelect}
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no_show">No-show</option>
        </select>
        <select
          value={source}
          onChange={(e) => {
            setSource(e.target.value);
            setPage(1);
          }}
          className={statusSelect}
        >
          <option value="">All sources</option>
          <option value="booking_com">Booking.com</option>
          <option value="airbnb">Airbnb</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="tiktok">TikTok</option>
          <option value="direct">Direct</option>
          <option value="manual">Manual</option>
          <option value="other_ota">Other OTA</option>
        </select>
        <span className="col-span-2 justify-self-start rounded-full bg-[#0A0A0A] px-3 py-1 text-xs font-semibold tabular-nums text-white sm:col-span-1 sm:ml-auto sm:mr-1">
          {total} booking{total === 1 ? "" : "s"}
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/[0.06]">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-ink-900/[0.05] px-4 py-4 last:border-0"
            >
              <div className="h-9 w-9 animate-pulse rounded-full bg-ink-900/[0.06]" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/3 animate-pulse rounded bg-ink-900/[0.06]" />
                <div className="h-2.5 w-1/4 animate-pulse rounded bg-ink-900/[0.05]" />
              </div>
              <div className="hidden h-5 w-20 animate-pulse rounded-full bg-ink-900/[0.06] sm:block" />
              <div className="h-3 w-16 animate-pulse rounded bg-ink-900/[0.06]" />
            </div>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={BedDouble}
          title="No bookings yet"
          description="When your AI concierge books a guest — or a reservation syncs from Booking.com or Airbnb — it shows up here."
          action={
            <button onClick={() => setShowNew(true)} className="btn bg-[#FF5A1F] text-white shadow-[0_10px_24px_-12px_rgba(255,90,31,0.8)] hover:bg-[#E84A12] hover:-translate-y-0.5 active:scale-[0.97]">
              <Plus className="h-4 w-4" /> Add a booking
            </button>
          }
        />
      ) : (
        <>
          {/* Phones: one card per booking */}
          <div className="space-y-2.5 md:hidden">
            {bookings.map((b) => {
              const focused =
                focusCode && String(b.code || "").toLowerCase() === focusCode.toLowerCase();
              return (
                <div
                  key={b._id}
                  id={b.code ? `booking-m-${b.code}` : undefined}
                  className={`rounded-2xl bg-white p-4 ring-1 ${
                    focused ? "ring-2 ring-[#FF5A1F] shadow-[0_16px_32px_-20px_rgba(255,90,31,0.6)]" : "ring-black/[0.06]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-[#FFF1EA] font-geist text-sm font-semibold text-[#FF5A1F]">
                      {(b.guestName || "?").trim().charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate font-semibold text-[#0A0A0A]">{b.guestName || "—"}</p>
                        <span
                          className={`${STATUS_STYLE[b.status] || STATUS_STYLE.completed} flex-shrink-0 whitespace-nowrap capitalize`}
                        >
                          <span className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${STATUS_DOT[b.status] || STATUS_DOT.completed}`} />
                          {(b.status || "").replace("_", " ")}
                        </span>
                      </div>
                      <p className="truncate text-xs text-black/45">
                        <span className="font-mono">{b.code ? `#${b.code}` : ""}</span>
                        {b.roomTypeId?.name ? ` · ${b.roomTypeId.name}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-black/[0.05] pt-3 text-xs">
                    <span className="tabular-nums text-black/60">
                      {fmtDate(b.checkIn)} → {fmtDate(b.checkOut)}
                    </span>
                    <span className="font-semibold tabular-nums text-[#0A0A0A]">
                      {money(b.totalAmount, b.currency)}
                    </span>
                  </div>
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    <SourceBadge source={b.source} />
                    <div className="ml-auto flex items-center gap-1.5">
                      {b.status === "pending" && (
                        <button
                          onClick={() => setBookingStatus(b, "confirmed")}
                          className="min-h-[36px] rounded-lg bg-emerald-500/10 px-3 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-500/20 active:scale-95"
                        >
                          Confirm
                        </button>
                      )}
                      {b.status === "confirmed" && (
                        <button
                          onClick={() => setBookingStatus(b, "completed")}
                          className="min-h-[36px] rounded-lg bg-white px-3 text-xs font-semibold text-[#0A0A0A] ring-1 ring-inset ring-black/10 active:scale-95"
                        >
                          Done
                        </button>
                      )}
                      {["pending", "confirmed"].includes(b.status) && (
                        <button
                          onClick={() => cancelBooking(b)}
                          className="inline-flex min-h-[36px] items-center gap-1 rounded-lg bg-rose-500/10 px-3 text-xs font-semibold text-rose-600 ring-1 ring-inset ring-rose-500/20 active:scale-95"
                        >
                          <XCircle className="h-3.5 w-3.5" /> Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Reveal y={16} className="hidden overflow-hidden rounded-2xl bg-white ring-1 ring-black/[0.06] shadow-[0_24px_48px_-36px_rgba(10,10,10,0.35)] md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-black/[0.06] bg-[#FAFAFA] text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-black/45">
                    <th className="px-4 py-3">Guest</th>
                    <th className="px-4 py-3">Room</th>
                    <th className="px-4 py-3">Check-in → out</th>
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.05]">
                  {bookings.map((b, i) => (
                    <motion.tr
                      key={b._id}
                      id={b.code ? `booking-${b.code}` : undefined}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, delay: Math.min(i, 12) * 0.03, ease: [0.16, 1, 0.3, 1] }}
                      className={`group transition-colors duration-200 hover:bg-[#FFF1EA]/50 ${
                        focusCode && String(b.code || "").toLowerCase() === focusCode.toLowerCase()
                          ? "bg-[#FFF1EA] shadow-[inset_3px_0_0_#FF5A1F]"
                          : "hover:shadow-[inset_3px_0_0_#FF5A1F]"
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-[#FFF1EA] font-geist text-sm font-semibold text-[#FF5A1F] ring-1 ring-[#FF5A1F]/15 transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:scale-105">
                            {(b.guestName || "?").trim().charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate font-semibold text-[#0A0A0A]">
                              {b.guestName || "—"}
                            </div>
                            <div className="truncate text-xs text-ink-400">
                              <span className="font-mono">{b.code ? `#${b.code}` : ""}</span>
                              {b.guestPhone ? ` · ${b.guestPhone}` : ""}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-ink-700">
                        <div>{b.roomTypeId?.name || "—"}</div>
                        <div className="text-xs text-ink-400">
                          {b.propertyId?.name || ""}
                          {b.unitsBooked > 1 ? ` · ${b.unitsBooked} units` : ""}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 tabular-nums text-ink-700">
                        {fmtDate(b.checkIn)}
                        <span className="text-ink-300"> → </span>
                        {fmtDate(b.checkOut)}
                        <div className="text-xs text-ink-400">
                          {b.nights} night{b.nights === 1 ? "" : "s"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <SourceBadge source={b.source} />
                      </td>
                      <td className="px-4 py-3">
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.span
                            key={b.status}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ type: "spring", stiffness: 500, damping: 26 }}
                            className={`${STATUS_STYLE[b.status] || STATUS_STYLE.completed} whitespace-nowrap capitalize`}
                          >
                            <span
                              className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${STATUS_DOT[b.status] || STATUS_DOT.completed}`}
                            />
                            {(b.status || "").replace("_", " ")}
                          </motion.span>
                        </AnimatePresence>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-semibold tabular-nums text-[#0A0A0A]">
                        {money(b.totalAmount, b.currency)}
                        {b.commission?.amount > 0 && (
                          <div className="text-[11px] font-normal text-ink-400">
                            fee {money(b.commission.amount, b.currency)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          {b.status === "pending" && (
                            <button
                              onClick={() => setBookingStatus(b, "confirmed")}
                              className="rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-500/20 transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:bg-emerald-500/15 active:scale-95"
                            >
                              Confirm
                            </button>
                          )}
                          {b.status === "confirmed" && (
                            <button
                              onClick={() => setBookingStatus(b, "completed")}
                              className="rounded-lg bg-white/80 px-2.5 py-1.5 text-xs font-semibold text-ink-600 ring-1 ring-inset ring-ink-900/10 transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:bg-white hover:text-ink-900 active:scale-95"
                            >
                              Done
                            </button>
                          )}
                          {["pending", "confirmed"].includes(b.status) && (
                            <button
                              onClick={() => cancelBooking(b)}
                              className="group/x inline-flex items-center gap-1 rounded-lg bg-rose-500/10 px-2.5 py-1.5 text-xs font-semibold text-rose-600 ring-1 ring-inset ring-rose-500/20 transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:bg-rose-500/15 active:scale-95"
                            >
                              <XCircle className="h-3.5 w-3.5 transition-transform duration-500 ease-spring group-hover/x:rotate-90" /> Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>

          {/* Pagination */}
          {pages > 1 && (
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                aria-label="Previous page"
                className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#0A0A0A] ring-1 ring-black/[0.08] transition-all duration-300 ease-spring hover:-translate-x-0.5 hover:bg-[#0A0A0A] hover:text-white active:scale-95 disabled:pointer-events-none disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="rounded-full bg-white px-3 py-1.5 text-sm font-medium tabular-nums text-black/60 ring-1 ring-black/[0.06]">
                Page {page} of {pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page >= pages}
                aria-label="Next page"
                className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#0A0A0A] ring-1 ring-black/[0.08] transition-all duration-300 ease-spring hover:translate-x-0.5 hover:bg-[#0A0A0A] hover:text-white active:scale-95 disabled:pointer-events-none disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}

      <NewBookingModal
        open={showNew}
        onClose={() => setShowNew(false)}
        onCreated={() => {
          setShowNew(false);
          load();
          loadStats();
        }}
      />
    </div>
  );
}

/* ── New booking modal ──────────────────────────────────────────────── */
function NewBookingModal({ open, onClose, onCreated }) {
  const [properties, setProperties] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    propertyId: "",
    roomTypeId: "",
    checkIn: "",
    checkOut: "",
    guestName: "",
    guestPhone: "",
    adults: 2,
    children: 0,
    unitsBooked: 1,
    nightlyRate: "",
    specialRequests: "",
  });
  const patch = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!open) return;
    api
      .get("/hotel/properties")
      .then(({ data }) => {
        const props = data.properties || [];
        setProperties(props);
        if (props.length === 1) patch("propertyId", props[0]._id);
      })
      .catch(() => toast.error("Couldn't load properties"));
  }, [open]);

  useEffect(() => {
    if (!form.propertyId) {
      setRooms([]);
      return;
    }
    api
      .get(`/hotel/properties/${form.propertyId}/rooms`)
      .then(({ data }) => setRooms(data.roomTypes || []))
      .catch(() => setRooms([]));
  }, [form.propertyId]);

  const room = rooms.find((r) => r._id === form.roomTypeId);
  // Prefill nightly rate from the selected room's base rate.
  useEffect(() => {
    if (room) patch("nightlyRate", room.baseRate ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.roomTypeId]);

  const nights = useMemo(() => {
    if (!form.checkIn || !form.checkOut) return 0;
    const n = Math.round(
      (new Date(form.checkOut) - new Date(form.checkIn)) / 86400000,
    );
    return n > 0 ? n : 0;
  }, [form.checkIn, form.checkOut]);

  const totalPreview =
    nights * Number(form.nightlyRate || 0) * Number(form.unitsBooked || 1);

  const submit = async () => {
    if (!form.propertyId || !form.roomTypeId)
      return toast.error("Pick a property and room");
    if (!form.checkIn || !form.checkOut || nights <= 0)
      return toast.error("Pick a valid date range");
    if (!form.guestName.trim()) return toast.error("Guest name is required");
    setSaving(true);
    try {
      await api.post("/hotel/bookings", {
        propertyId: form.propertyId,
        roomTypeId: form.roomTypeId,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        guestName: form.guestName.trim(),
        guestPhone: form.guestPhone.trim(),
        adults: Number(form.adults) || 1,
        children: Number(form.children) || 0,
        unitsBooked: Number(form.unitsBooked) || 1,
        nightlyRate:
          form.nightlyRate === "" ? undefined : Number(form.nightlyRate),
        specialRequests: form.specialRequests.trim() || undefined,
      });
      toast.success("Booking created");
      setForm((f) => ({
        ...f,
        roomTypeId: "",
        checkIn: "",
        checkOut: "",
        guestName: "",
        guestPhone: "",
        specialRequests: "",
      }));
      onCreated();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Couldn't create booking");
    } finally {
      setSaving(false);
    }
  };

  const input = "input w-full py-2 text-sm";
  const label = "label block";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New booking"
      description="Record a reservation manually."
      size="lg"
      footer={
        <>
          <button onClick={onClose} className="btn-ghost">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="btn bg-[#FF5A1F] text-white shadow-[0_10px_24px_-12px_rgba(255,90,31,0.8)] hover:bg-[#E84A12] hover:-translate-y-0.5 active:scale-[0.97] disabled:opacity-60"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Create booking
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <span className={label}>Property</span>
            <select
              value={form.propertyId}
              onChange={(e) => {
                patch("propertyId", e.target.value);
                patch("roomTypeId", "");
              }}
              className={input}
            >
              <option value="">Select property…</option>
              {properties.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <span className={label}>Room type</span>
            <select
              value={form.roomTypeId}
              onChange={(e) => patch("roomTypeId", e.target.value)}
              className={input}
              disabled={!form.propertyId}
            >
              <option value="">Select room…</option>
              {rooms.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name} · {r.currency || ""} {r.baseRate}/night
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <span className={label}>Check-in</span>
            <input
              type="date"
              value={form.checkIn}
              onChange={(e) => patch("checkIn", e.target.value)}
              className={input}
            />
          </div>
          <div>
            <span className={label}>Check-out</span>
            <input
              type="date"
              value={form.checkOut}
              min={form.checkIn || undefined}
              onChange={(e) => patch("checkOut", e.target.value)}
              className={input}
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <span className={label}>Guest name</span>
            <input
              value={form.guestName}
              onChange={(e) => patch("guestName", e.target.value)}
              placeholder="e.g. Sara Ahmed"
              className={input}
            />
          </div>
          <div>
            <span className={label}>Guest phone</span>
            <input
              value={form.guestPhone}
              onChange={(e) => patch("guestPhone", e.target.value)}
              placeholder="+92 300 1234567"
              className={input}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            ["adults", "Adults"],
            ["children", "Children"],
            ["unitsBooked", "Rooms"],
            ["nightlyRate", "Rate / night"],
          ].map(([k, l]) => (
            <div key={k}>
              <span className={label}>{l}</span>
              <input
                type="number"
                min="0"
                value={form[k]}
                onChange={(e) => patch(k, e.target.value)}
                className={input}
              />
            </div>
          ))}
        </div>

        <div>
          <span className={label}>Special requests (optional)</span>
          <textarea
            value={form.specialRequests}
            onChange={(e) => patch("specialRequests", e.target.value)}
            rows={2}
            placeholder="Late check-in, extra bed…"
            className={input}
          />
        </div>

        {/* Computed total */}
        <div className="relative flex items-center justify-between gap-3 overflow-hidden rounded-2xl bg-[#FFF1EA] px-4 py-3.5 text-sm ring-1 ring-inset ring-[#FF5A1F]/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
          <span className="text-ink-600">
            {nights > 0
              ? `${nights} night${nights === 1 ? "" : "s"} × ${form.nightlyRate || 0}${
                  Number(form.unitsBooked) > 1 ? ` × ${form.unitsBooked} rooms` : ""
                }`
              : "Pick dates to see the total"}
          </span>
          <motion.span
            key={totalPreview}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            className="whitespace-nowrap font-geist text-base font-semibold tabular-nums text-ink-900"
          >
            {room?.currency || ""} {totalPreview.toLocaleString()}
          </motion.span>
        </div>
      </div>
    </Modal>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Screen shell — Bookings | Messages                                         */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * Reservations and guest conversations share one screen. The inbox is the
 * guest inbox, embedded as-is — it lays itself out with `h-full`, so
 * it gets a fixed-height viewport box to fill.
 */
export default function BookingsPage() {
  const [tab, setTab] = useState("bookings");
  // Notification deep link: /dashboard/bookings?code=<bookingCode>
  const [searchParams, setSearchParams] = useSearchParams();
  const focusCode = (searchParams.get("code") || "").trim();
  useEffect(() => {
    if (focusCode) setTab("bookings");
  }, [focusCode]);
  const clearFocus = useCallback(() => {
    const next = new URLSearchParams(searchParams);
    next.delete("code");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const TABS = [
    { id: "bookings", label: "Bookings", icon: CalendarCheck },
    { id: "messages", label: "Messages", icon: MessageSquare },
  ];

  return (
    <div className="flex flex-col font-geist">
      <div className="flex-shrink-0 px-4 pt-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1400px]">
          <SlidingTabs
            items={TABS.map((t) => ({ value: t.id, label: t.label, icon: t.icon }))}
            value={tab}
            onChange={setTab}
          />
        </div>
      </div>

      {tab === "bookings" ? (
        <BookingsTable focusCode={focusCode} onClearFocus={clearFocus} />
      ) : (
        // The inbox pins itself with `h-full`, so it needs an ancestor with a
        // real height. The dashboard's animated <main> wrapper doesn't provide
        // one, so size this box off the viewport instead: full height minus the
        // header (68px), these tabs (~68px) and the mobile bottom nav (62px).
        <div className="mt-4 h-[calc(100vh-198px)] border-t border-ink-900/[0.06] lg:h-[calc(100vh-136px)]">
          <GuestInboxPage />
        </div>
      )}
    </div>
  );
}
