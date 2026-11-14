/**
 * Calendar — a 30-day availability grid across every room type, an inline
 * rate editor per room, and the housekeeping board underneath.
 *
 * Availability: GET /hotel/properties → GET /hotel/rooms/:id/availability
 * Rates:        PUT /hotel/rooms/:id { baseRate }
 * Housekeeping: GET /pms/units, PATCH /pms/units { roomTypeId, unitLabel, status }
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
import { Reveal } from "@/components/fx";

const DAYS = 30;

const errMsg = (e, fallback) => e?.response?.data?.message || fallback;

const isoDay = (d) => new Date(d).toISOString().slice(0, 10);

/* Green = free, amber = last unit, red = sold out. */
function cellStyle(available) {
  if (available <= 0)
    return "bg-rose-500/[0.12] text-rose-700 ring-rose-500/25";
  if (available === 1)
    return "bg-amber-400/[0.18] text-amber-800 ring-amber-500/25";
  return "bg-emerald-500/[0.10] text-emerald-700 ring-emerald-500/20";
}

/* ── Housekeeping ────────────────────────────────────────────────────────── */

// Order matters — clicking a chip advances to the next status.
const HK_STATUSES = ["clean", "dirty", "inspected", "out_of_service"];
const HK_META = {
  clean: {
    label: "Clean",
    cls: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20",
    dot: "bg-emerald-500",
  },
  dirty: {
    label: "Dirty",
    cls: "bg-amber-400/15 text-amber-800 ring-amber-500/25",
    dot: "bg-amber-500",
  },
  inspected: {
    label: "Inspected",
    cls: "bg-sky-500/10 text-sky-700 ring-sky-500/20",
    dot: "bg-sky-500",
  },
  out_of_service: {
    label: "Out of service",
    cls: "bg-rose-500/10 text-rose-700 ring-rose-500/20",
    dot: "bg-rose-500",
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
    <motion.button
      type="button"
      onClick={cycle}
      disabled={busy}
      title={`${unit.label} — ${meta.label} (click to change)`}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 420, damping: 26 }}
      className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold ring-1 ring-inset shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] transition-colors duration-300 disabled:opacity-50 ${meta.cls}`}
    >
      {busy ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      )}
      <span>{unit.label}</span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={unit.status}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 0.75, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="font-medium"
        >
          {meta.label}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

function Housekeeping({ propertyId }) {
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
  }, [propertyId]);

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
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
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
      {rooms.map((r, i) => (
        <Reveal key={r.roomTypeId} delay={i * 0.06} y={16}>
        <div className="card group p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="flex min-w-0 items-center gap-2.5 font-display text-[15px] font-semibold tracking-[-0.01em] text-ink-900">
              <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg bg-sunset-soft text-sunset-flame transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]">
                <BedDouble className="h-4 w-4" strokeWidth={1.8} />
              </span>
              <span className="truncate">{r.roomName}</span>
            </h3>
            <span className="flex-shrink-0 rounded-full bg-ink-900/[0.05] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-ink-600">
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
        </Reveal>
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
    <div className="flex flex-wrap items-end gap-3 rounded-2xl bg-white/80 p-4 ring-1 ring-sunset-flame/20 shadow-[inset_0_1px_0_#fff,0_12px_30px_-18px_rgba(255,106,43,0.5)]">
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
        className="btn-primary px-3.5 py-2 text-xs"
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
        className="btn-ghost px-3.5 py-2 text-xs"
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
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-6 sm:pt-8 lg:px-8">
      <Reveal className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3.5">
          <div className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-sunset text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_10px_22px_-10px_rgba(255,61,119,0.6)]">
            <CalendarDays className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-semibold tracking-[-0.03em] text-ink-900 sm:text-3xl">
              Calendar
            </h1>
            <p className="mt-0.5 text-sm text-ink-500">
              The next{" "}
              <span className="font-serif text-[1.05em] italic text-ink-700">30 days</span>, and
              who's cleaning what.
            </p>
          </div>
        </div>
      </Reveal>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-56 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
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
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-base font-semibold tracking-[-0.02em] text-ink-900">
                Availability
              </h2>
              <div className="flex items-center gap-1 rounded-full bg-white/70 p-1 text-xs text-ink-600 ring-1 ring-ink-900/[0.06] shadow-[inset_0_1px_0_#fff]">
                <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5">
                  <span className="h-2.5 w-2.5 rounded-[4px] bg-emerald-500/20 ring-1 ring-inset ring-emerald-500/30" />
                  Free
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5">
                  <span className="h-2.5 w-2.5 rounded-[4px] bg-amber-400/30 ring-1 ring-inset ring-amber-500/30" />
                  1 left
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5">
                  <span className="h-2.5 w-2.5 rounded-[4px] bg-rose-500/20 ring-1 ring-inset ring-rose-500/30" />
                  Full
                </span>
              </div>
            </div>

            <Reveal delay={0.05} y={16} className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-0">
                  <thead>
                    <tr>
                      <th className="sticky left-0 top-0 z-20 min-w-[132px] border-b border-r border-ink-900/[0.06] bg-white/85 px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-500 backdrop-blur-xl sm:min-w-[160px]">
                        Room
                      </th>
                      {dates.map((d, i) => {
                        const today = i === 0;
                        const weekend = d.getDay() === 0 || d.getDay() === 6;
                        return (
                          <th
                            key={d.toISOString()}
                            className={`min-w-[36px] border-b border-ink-900/[0.06] px-1 py-2 text-center text-[10px] font-semibold backdrop-blur-xl ${
                              today
                                ? "bg-sunset-soft text-sunset-flame"
                                : weekend
                                  ? "bg-ink-900/[0.03] text-ink-500"
                                  : "bg-white/70 text-ink-500"
                            }`}
                          >
                            <span className="block uppercase leading-tight">
                              {d.toLocaleDateString(undefined, { weekday: "narrow" })}
                            </span>
                            <span
                              className={`mx-auto mt-0.5 grid h-5 w-5 place-items-center rounded-full font-display text-[11px] font-semibold leading-none tabular-nums ${
                                today
                                  ? "bg-sunset text-white shadow-[0_4px_10px_-4px_rgba(255,61,119,0.7)]"
                                  : "text-ink-800"
                              }`}
                            >
                              {d.getDate()}
                            </span>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map((room) => {
                      const nights = availability[room._id] || [];
                      const open = String(openRoom) === String(room._id);
                      return (
                        <tr
                          key={room._id}
                          className={`group/row transition-colors duration-300 ${
                            open ? "bg-sunset-soft" : "hover:bg-white/70"
                          }`}
                        >
                          <td
                            className={`sticky left-0 z-10 border-b border-r border-ink-900/[0.06] px-2 py-1.5 backdrop-blur-xl transition-colors duration-300 ${
                              open ? "bg-orange-50/90" : "bg-white/85 group-hover/row:bg-white/95"
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setOpenRoom(open ? null : room._id)
                              }
                              aria-expanded={open}
                              className={`group block w-full max-w-[150px] rounded-lg px-1.5 py-1 text-left transition-all duration-300 ease-spring active:scale-[0.97] sm:max-w-none ${
                                open ? "" : "hover:translate-x-0.5"
                              }`}
                            >
                              <span
                                className={`block truncate text-sm font-semibold transition-colors ${
                                  open ? "text-sunset-flame" : "text-ink-900 group-hover:text-sunset-flame"
                                }`}
                              >
                                {room.name}
                              </span>
                              <span className="mt-0.5 block text-[11px] tabular-nums text-ink-500">
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
                                className={`border-b border-ink-900/[0.05] px-0.5 py-1 text-center ${
                                  i === 0 ? "bg-sunset-flame/[0.06]" : ""
                                }`}
                              >
                                {available == null ? (
                                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-ink-900/[0.04] text-[11px] font-semibold text-ink-400">
                                    –
                                  </span>
                                ) : (
                                  <span
                                    title={`${d.toLocaleDateString()} — ${available} free`}
                                    className={`relative inline-flex h-7 w-7 cursor-default items-center justify-center rounded-lg text-[11px] font-semibold tabular-nums ring-1 ring-inset transition-transform duration-300 ease-spring hover:z-[5] hover:scale-[1.18] hover:shadow-[0_6px_14px_-6px_rgba(15,23,42,0.35)] ${cellStyle(available)}`}
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

              <AnimatePresence initial={false}>
                {openRoom && (
                  <motion.div
                    key={String(openRoom)}
                    initial={{ height: 0, opacity: 0, filter: "blur(4px)" }}
                    animate={{ height: "auto", opacity: 1, filter: "blur(0px)" }}
                    exit={{ height: 0, opacity: 0, filter: "blur(4px)" }}
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-ink-900/[0.06] bg-white/40 p-3 sm:p-4">
                      <RateEditor
                        room={rooms.find((r) => String(r._id) === String(openRoom))}
                        currency={currency}
                        onSaved={onRateSaved}
                        onClose={() => setOpenRoom(null)}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Reveal>
          </section>

          {/* ── Housekeeping ───────────────────────────────────────── */}
          <section>
            <div className="mb-1.5 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-sunset-flame" strokeWidth={1.8} />
              <h2 className="font-display text-base font-semibold tracking-[-0.02em] text-ink-900">
                Housekeeping
              </h2>
            </div>
            <p className="mb-4 text-xs text-ink-500">
              Tap a unit to move it through clean → dirty → inspected → out of
              service.
            </p>
            <Housekeeping propertyId={propertyId} />
          </section>
        </>
      )}
    </div>
  );
}
