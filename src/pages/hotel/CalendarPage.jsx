/**
 * Calendar — a 30-day availability grid across every room type, an inline
 * rate editor per room, and the housekeeping board underneath.
 *
 * Availability: GET /hotel/properties → GET /hotel/rooms/:id/availability
 * Rates:        PUT /hotel/rooms/:id { baseRate }
 * Housekeeping: GET /pms/units, PATCH /pms/units { roomTypeId, unitLabel, status }
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { usePropertyScope } from "@/store/propertyStore";
import toast from "react-hot-toast";
import {
  BedDouble,
  CalendarDays,
  Check,
  Hotel,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";

const DAYS = 30;

const errMsg = (e, fallback) => e?.response?.data?.message || fallback;

const isoDay = (d) => new Date(d).toISOString().slice(0, 10);

/* Green = free, amber = last unit, red = sold out. */
function cellStyle(available) {
  if (available <= 0) return "bg-rose-100 text-rose-700";
  if (available === 1) return "bg-amber-100 text-amber-700";
  return "bg-emerald-100 text-emerald-700";
}

/* ── Housekeeping ────────────────────────────────────────────────────────── */

// Order matters — clicking a chip advances to the next status.
const HK_STATUSES = ["clean", "dirty", "inspected", "out_of_service"];
const HK_META = {
  clean: { label: "Clean", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  dirty: { label: "Dirty", cls: "bg-amber-100 text-amber-700 border-amber-200" },
  inspected: { label: "Inspected", cls: "bg-sky-100 text-sky-700 border-sky-200" },
  out_of_service: {
    label: "Out of service",
    cls: "bg-rose-100 text-rose-700 border-rose-200",
  },
};

function UnitChip({ roomTypeId, unit, onChanged }) {
  const [busy, setBusy] = useState(false);
  const meta = HK_META[unit.status] || HK_META.clean;

  const cycle = async () => {
    if (busy) return;
    const idx = HK_STATUSES.indexOf(unit.status);
    const next = HK_STATUSES[(idx + 1) % HK_STATUSES.length];
    setBusy(true);
    try {
      await api.patch("/pms/units", {
        roomTypeId,
        unitLabel: unit.label,
        status: next,
      });
      onChanged?.(roomTypeId, unit.label, next);
    } catch (e) {
      toast.error(errMsg(e, "Couldn't update that unit"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={cycle}
      disabled={busy}
      title={`${unit.label} — ${meta.label} (click to change)`}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition hover:opacity-80 disabled:opacity-50 ${meta.cls}`}
    >
      {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
      <span>{unit.label}</span>
      <span className="opacity-70 font-medium">{meta.label}</span>
    </button>
  );
}

function Housekeeping() {
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/pms/units", {
        params: propertyId ? { propertyId } : undefined,
      });
      setRooms(data.rooms || []);
    } catch (e) {
      toast.error(errMsg(e, "Couldn't load housekeeping"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Patch just the one unit locally — no full refetch for a chip click.
  const onChanged = useCallback((roomTypeId, label, status) => {
    setRooms((rs) =>
      rs.map((r) =>
        String(r.roomTypeId) !== String(roomTypeId)
          ? r
          : {
              ...r,
              units: r.units.map((u) =>
                u.label === label ? { ...u, status } : u,
              ),
            },
      ),
    );
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <EmptyState
        icon={BedDouble}
        title="No units yet"
        description="Add room types with a unit count in Settings → Property & Rooms and they'll show up here."
      />
    );
  }

  return (
    <div className="space-y-4">
      {rooms.map((r) => (
        <div key={r.roomTypeId} className="card p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h3 className="text-sm font-bold text-ink-900 truncate">
              {r.roomName}
            </h3>
            <span className="text-xs text-ink-500 flex-shrink-0">
              {r.units.length} unit{r.units.length === 1 ? "" : "s"}
            </span>
          </div>
          {r.units.length === 0 ? (
            <p className="text-sm text-ink-500">No units in this room type.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {r.units.map((u) => (
                <UnitChip
                  key={u.label}
                  roomTypeId={r.roomTypeId}
                  unit={u}
                  onChanged={onChanged}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Rate editor ─────────────────────────────────────────────────────────── */

function RateEditor({ room, currency, onSaved, onClose }) {
  const [rate, setRate] = useState(String(room.baseRate ?? ""));
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const baseRate = Number(rate);
    if (!Number.isFinite(baseRate) || baseRate < 0) {
      toast.error("Enter a valid rate");
      return;
    }
    setSaving(true);
    try {
      await api.put(`/hotel/rooms/${room._id}`, { baseRate });
      toast.success("Rate updated");
      onSaved?.(room._id, baseRate);
      onClose?.();
    } catch (e) {
      toast.error(errMsg(e, "Couldn't save that rate"));
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-brand-200 bg-brand-50/60 p-3.5">
      <div className="min-w-[160px]">
        <label className="label text-xs" htmlFor={`rate-${room._id}`}>
          Base rate ({currency || "USD"} per night)
        </label>
        <input
          id={`rate-${room._id}`}
          type="number"
          min="0"
          step="1"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          className="input py-2"
        />
      </div>
      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="btn-primary text-xs px-3 py-2"
      >
        {saving ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Check className="w-3.5 h-3.5" />
        )}
        Save
      </button>
      <button
        type="button"
        onClick={onClose}
        className="btn-ghost text-xs px-3 py-2"
      >
        <X className="w-3.5 h-3.5" /> Close
      </button>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */

export default function CalendarPage() {
  // Which hotel's calendar this is (multi-property accounts only).
  const { activeWorkspace } = useAuthStore();
  const { propertyId } = usePropertyScope(activeWorkspace);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [property, setProperty] = useState(null);
  const [rooms, setRooms] = useState([]);
  // roomId → [{ date, available }]
  const [availability, setAvailability] = useState({});
  const [openRoom, setOpenRoom] = useState(null);

  const from = useMemo(() => isoDay(new Date()), []);

  const dates = useMemo(() => {
    const start = new Date(from);
    return Array.from({ length: DAYS }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [from]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/hotel/properties");
      const props = (data.properties || []).filter((p) => p.active !== false);
      // Honour the sidebar's property choice; fall back to the first so a
      // single-property account (and a stale id) behaves exactly as before.
      const prop =
        props.find((p) => String(p._id) === String(propertyId)) ||
        props[0] ||
        null;
      setProperty(prop);

      if (!prop) {
        setRooms([]);
        setAvailability({});
        setFailed(false);
        return;
      }

      const { data: roomData } = await api.get(
        `/hotel/properties/${prop._id}/rooms`,
      );
      const list = roomData.roomTypes || roomData.rooms || [];
      setRooms(list);

      // One availability call per room — tolerate individual failures.
      const results = await Promise.all(
        list.map((r) =>
          api
            .get(`/hotel/rooms/${r._id}/availability`, {
              params: { from, days: DAYS },
            })
            .then((res) => [r._id, res.data.nights || []])
            .catch(() => [r._id, []]),
        ),
      );
      setAvailability(Object.fromEntries(results));
      setFailed(false);
    } catch (e) {
      setFailed(true);
      toast.error(errMsg(e, "Couldn't load your calendar"));
    } finally {
      setLoading(false);
    }
  }, [from, propertyId]);

  useEffect(() => {
    load();
  }, [load]);

  const onRateSaved = useCallback((roomId, baseRate) => {
    setRooms((rs) =>
      rs.map((r) => (String(r._id) === String(roomId) ? { ...r, baseRate } : r)),
    );
  }, []);

  const currency = property?.currency || "USD";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-5 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
            <CalendarDays className="w-6 h-6 text-brand-500" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-black text-ink-900 tracking-tight">
              Calendar
            </h1>
            <p className="text-sm text-ink-500 mt-0.5">
              The next 30 days, and who's cleaning what.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : failed ? (
        <EmptyState
          icon={CalendarDays}
          title="Couldn't load the calendar"
          description="We couldn't reach your rooms. Check your connection and try again."
          action={
            <button type="button" onClick={load} className="btn-primary">
              Try again
            </button>
          }
        />
      ) : !property ? (
        <EmptyState
          icon={Hotel}
          title="No property yet"
          description="Add your hotel in Settings → Property & Rooms and your availability will appear here."
        />
      ) : rooms.length === 0 ? (
        <EmptyState
          icon={BedDouble}
          title="No rooms yet"
          description="Add your first room type in Settings → Property & Rooms to see the 30-day grid."
        />
      ) : (
        <>
          {/* ── Availability grid ──────────────────────────────────── */}
          <section className="mb-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <h2 className="section-heading">Availability</h2>
              <div className="flex items-center gap-3 text-xs text-ink-500">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200" />
                  Free
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-amber-100 border border-amber-200" />
                  1 left
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-rose-100 border border-rose-200" />
                  Full
                </span>
              </div>
            </div>

            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-ink-50">
                      <th className="sticky left-0 z-10 bg-ink-50 text-left text-xs font-bold text-ink-600 px-3 py-2.5 min-w-[150px] border-b border-ink-100">
                        Room
                      </th>
                      {dates.map((d) => (
                        <th
                          key={d.toISOString()}
                          className="text-center text-[10px] font-semibold text-ink-500 px-1 py-2.5 min-w-[34px] border-b border-ink-100"
                        >
                          <span className="block leading-tight">
                            {d.toLocaleDateString(undefined, { weekday: "narrow" })}
                          </span>
                          <span className="block leading-tight text-ink-700 font-bold">
                            {d.getDate()}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map((room) => {
                      const nights = availability[room._id] || [];
                      const open = String(openRoom) === String(room._id);
                      return (
                        <tr
                          key={room._id}
                          className={open ? "bg-brand-50/40" : "hover:bg-ink-50/60"}
                        >
                          <td className="sticky left-0 z-10 bg-white px-3 py-2 border-b border-ink-100">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenRoom(open ? null : room._id)
                              }
                              className="text-left w-full group"
                            >
                              <span className="block text-sm font-semibold text-ink-900 truncate group-hover:text-brand-700 transition">
                                {room.name}
                              </span>
                              <span className="block text-[11px] text-ink-500 mt-0.5">
                                {currency} {Number(room.baseRate || 0)} · tap to edit
                              </span>
                            </button>
                          </td>
                          {dates.map((d, i) => {
                            const night = nights[i];
                            const available = night ? night.available : null;
                            return (
                              <td
                                key={d.toISOString()}
                                className="px-0.5 py-1 border-b border-ink-100 text-center"
                              >
                                {available == null ? (
                                  <span className="inline-flex items-center justify-center w-7 h-7 rounded text-[11px] font-semibold bg-ink-100 text-ink-400">
                                    –
                                  </span>
                                ) : (
                                  <span
                                    title={`${d.toLocaleDateString()} — ${available} free`}
                                    className={`inline-flex items-center justify-center w-7 h-7 rounded text-[11px] font-bold ${cellStyle(available)}`}
                                  >
                                    {available}
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {openRoom && (
                <div className="p-3 sm:p-4 border-t border-ink-100 bg-ink-50/60">
                  <RateEditor
                    room={rooms.find((r) => String(r._id) === String(openRoom))}
                    currency={currency}
                    onSaved={onRateSaved}
                    onClose={() => setOpenRoom(null)}
                  />
                </div>
              )}
            </div>
          </section>

          {/* ── Housekeeping ───────────────────────────────────────── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <h2 className="section-heading">Housekeeping</h2>
            </div>
            <p className="text-xs text-ink-500 mb-3">
              Tap a unit to move it through clean → dirty → inspected → out of
              service.
            </p>
            <Housekeeping />
          </section>
        </>
      )}
    </div>
  );
}
