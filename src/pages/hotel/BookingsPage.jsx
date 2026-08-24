/**
 * Bookings — every reservation across OTAs, chat channels and manual entry,
 * plus the guest message inbox behind a tab switch so conversations and
 * reservations live on one screen.
 *
 * Stats row, filterable table with source badges, New Booking modal and
 * cancel-with-confirm. Matches the Appointments/Billing page patterns.
 */
import { useEffect, useState, useCallback, useMemo } from "react";
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

const STATUS_STYLE = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-ink-100 text-ink-600 border-ink-200",
  cancelled: "bg-rose-50 text-rose-600 border-rose-200",
  no_show: "bg-rose-50 text-rose-600 border-rose-200",
};

// Colored source badges — each channel keeps its recognisable brand color.
const SOURCE_META = {
  booking_com: { label: "Booking.com", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  airbnb: { label: "Airbnb", cls: "bg-rose-50 text-rose-600 border-rose-200" },
  whatsapp: { label: "WhatsApp", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  instagram: { label: "Instagram", cls: "bg-purple-50 text-purple-700 border-purple-200" },
  tiktok: { label: "TikTok", cls: "bg-ink-900 text-white border-ink-900" },
  direct: { label: "Direct", cls: "bg-ink-50 text-ink-600 border-ink-200" },
  manual: { label: "Manual", cls: "bg-ink-50 text-ink-600 border-ink-200" },
  other_ota: { label: "Other OTA", cls: "bg-sky-50 text-sky-700 border-sky-200" },
};

function SourceBadge({ source }) {
  const m = SOURCE_META[source] || SOURCE_META.manual;
  return (
    <span
      className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full border ${m.cls}`}
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

function BookingsTable() {
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
  }, [status, source, page, scopeParams]);

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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-brand-500/10 flex items-center justify-center">
            <CalendarCheck className="w-6 h-6 text-brand-500" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-ink-900">Bookings</h1>
            <p className="text-sm text-ink-500">
              Every reservation — from your OTAs, your AI concierge, and manual
              entries.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl px-4 py-2.5 transition"
        >
          <Plus className="w-4 h-4" /> New booking
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl border border-ink-100 bg-white p-4">
          <p className="text-2xl font-semibold text-ink-900">{stats.upcoming}</p>
          <p className="text-xs text-ink-500">Upcoming check-ins</p>
        </div>
        <div className="rounded-xl border border-ink-100 bg-white p-4">
          <p className="text-2xl font-semibold text-ink-900">{stats.monthCount}</p>
          <p className="text-xs text-ink-500">Bookings this month</p>
        </div>
        <div className="rounded-xl border border-ink-100 bg-white p-4">
          <p className="text-lg font-semibold text-ink-900 truncate flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" />
            {stats.revenueLabel}
          </p>
          <p className="text-xs text-ink-500">Revenue this month</p>
        </div>
        <div className="rounded-xl border border-ink-100 bg-white p-4">
          <div className="flex flex-wrap gap-1">
            {Object.keys(stats.bySource).length === 0 ? (
              <p className="text-lg font-semibold text-ink-300">—</p>
            ) : (
              Object.entries(stats.bySource).map(([s, n]) => (
                <span key={s} className="inline-flex items-center gap-1">
                  <SourceBadge source={s} />
                  <span className="text-xs font-bold text-ink-700">{n}</span>
                </span>
              ))
            )}
          </div>
          <p className="text-xs text-ink-500 mt-1">By source</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-400 bg-white"
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
          className="rounded-xl border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-400 bg-white"
        >
          <option value="">All sources</option>
          <option value="booking_com">Booking.com</option>
          <option value="airbnb">Airbnb</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="instagram">Instagram</option>
          <option value="tiktok">TikTok</option>
          <option value="direct">Direct</option>
          <option value="manual">Manual</option>
          <option value="other_ota">Other OTA</option>
        </select>
        <span className="ml-auto text-xs text-ink-400">
          {total} booking{total === 1 ? "" : "s"}
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-7 h-7 text-brand-500 animate-spin" />
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={BedDouble}
          title="No bookings yet"
          description="When your AI concierge books a guest — or a reservation syncs from Booking.com or Airbnb — it shows up here."
          action={
            <button
              onClick={() => setShowNew(true)}
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl px-4 py-2.5 transition"
            >
              <Plus className="w-4 h-4" /> Add a booking
            </button>
          }
        />
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-ink-100 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-ink-400 border-b border-ink-100">
                  <th className="px-3 py-2.5">Guest</th>
                  <th className="px-3 py-2.5">Room</th>
                  <th className="px-3 py-2.5">Check-in → out</th>
                  <th className="px-3 py-2.5">Source</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5">Total</th>
                  <th className="px-3 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id} className="border-b border-ink-50 hover:bg-ink-50/60">
                    <td className="px-3 py-2.5">
                      <div className="font-semibold text-ink-900">
                        {b.guestName || "—"}
                      </div>
                      <div className="text-xs text-ink-400">
                        {b.code ? `#${b.code}` : ""}
                        {b.guestPhone ? ` · ${b.guestPhone}` : ""}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-ink-700">
                      <div>{b.roomTypeId?.name || "—"}</div>
                      <div className="text-xs text-ink-400">
                        {b.propertyId?.name || ""}
                        {b.unitsBooked > 1 ? ` · ${b.unitsBooked} units` : ""}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-ink-700 whitespace-nowrap">
                      {fmtDate(b.checkIn)}
                      <span className="text-ink-300"> → </span>
                      {fmtDate(b.checkOut)}
                      <div className="text-xs text-ink-400">
                        {b.nights} night{b.nights === 1 ? "" : "s"}
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <SourceBadge source={b.source} />
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLE[b.status] || STATUS_STYLE.completed}`}
                      >
                        {(b.status || "").replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-semibold text-ink-900 whitespace-nowrap">
                      {money(b.totalAmount, b.currency)}
                      {b.commission?.amount > 0 && (
                        <div className="text-[11px] font-normal text-ink-400">
                          fee {money(b.commission.amount, b.currency)}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-end gap-1.5">
                        {b.status === "pending" && (
                          <button
                            onClick={() => setBookingStatus(b, "confirmed")}
                            className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg px-2.5 py-1.5 transition"
                          >
                            Confirm
                          </button>
                        )}
                        {b.status === "confirmed" && (
                          <button
                            onClick={() => setBookingStatus(b, "completed")}
                            className="text-xs font-semibold text-ink-600 bg-ink-50 hover:bg-ink-100 border border-ink-200 rounded-lg px-2.5 py-1.5 transition"
                          >
                            Done
                          </button>
                        )}
                        {["pending", "confirmed"].includes(b.status) && (
                          <button
                            onClick={() => cancelBooking(b)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg px-2.5 py-1.5 transition"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="w-8 h-8 rounded-lg border border-ink-200 flex items-center justify-center text-ink-500 hover:bg-ink-50 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-ink-600 font-medium">
                Page {page} of {pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page >= pages}
                className="w-8 h-8 rounded-lg border border-ink-200 flex items-center justify-center text-ink-500 hover:bg-ink-50 disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4" />
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

  const input =
    "w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 outline-none";
  const label = "block text-xs font-semibold text-ink-600 mb-1";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New booking"
      description="Record a reservation manually."
      size="lg"
      footer={
        <>
          <button
            onClick={onClose}
            className="text-sm font-semibold text-ink-600 hover:text-ink-900 px-4 py-2 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl px-5 py-2.5 transition disabled:opacity-60"
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
        <div className="rounded-xl bg-brand-50/60 border border-brand-100 px-4 py-3 flex items-center justify-between text-sm">
          <span className="text-ink-600">
            {nights > 0
              ? `${nights} night${nights === 1 ? "" : "s"} × ${form.nightlyRate || 0}${
                  Number(form.unitsBooked) > 1 ? ` × ${form.unitsBooked} rooms` : ""
                }`
              : "Pick dates to see the total"}
          </span>
          <span className="font-semibold text-ink-900">
            {room?.currency || ""} {totalPreview.toLocaleString()}
          </span>
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

  const TABS = [
    { id: "bookings", label: "Bookings", icon: CalendarCheck },
    { id: "messages", label: "Messages", icon: MessageSquare },
  ];

  return (
    <div className="flex flex-col">
      <div className="px-4 sm:px-6 pt-5 flex-shrink-0">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-1 bg-ink-100 rounded-xl p-1 max-w-xs">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                  tab === t.id
                    ? "bg-white text-ink-900 shadow-sm"
                    : "text-ink-500 hover:text-ink-700"
                }`}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {tab === "bookings" ? (
        <BookingsTable />
      ) : (
        // The inbox pins itself with `h-full`, so it needs an ancestor with a
        // real height. The dashboard's animated <main> wrapper doesn't provide
        // one, so size this box off the viewport instead: full height minus the
        // header (68px), these tabs (~68px) and the mobile bottom nav (62px).
        <div className="mt-4 border-t border-ink-100 h-[calc(100vh-198px)] lg:h-[calc(100vh-136px)]">
          <GuestInboxPage />
        </div>
      )}
    </div>
  );
}
