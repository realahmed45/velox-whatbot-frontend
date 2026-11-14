/**
 * Appointments — manage bot-booked appointments and the scheduling config.
 * Two tabs: Bookings (list + approve/cancel) and Settings (services, slot
 * rules, hours, location). Only visible when the workspace vertical enables
 * the `appointments` feature.
 */
import { useEffect, useState, useCallback } from "react";
import api from "@/services/api";
import toast from "react-hot-toast";
import {
  CalendarCheck,
  Plus,
  Trash2,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  Loader2,
  Phone,
  User,
  Settings2,
  Save,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { AnimatePresence, motion } from "framer-motion";
import { NumberTicker, Reveal, SlidingTabs, Spotlight } from "@/components/fx";

const DAYS = [
  ["monday", "Mon"],
  ["tuesday", "Tue"],
  ["wednesday", "Wed"],
  ["thursday", "Thu"],
  ["friday", "Fri"],
  ["saturday", "Sat"],
  ["sunday", "Sun"],
];

const STATUS_STYLE = {
  pending: "badge-yellow",
  confirmed: "badge-green",
  completed: "badge-gray",
  cancelled: "badge-red",
  no_show: "badge-red",
};

const STATUS_DOT = {
  pending: "bg-amber-500",
  confirmed: "bg-emerald-500",
  completed: "bg-ink-400",
  cancelled: "bg-rose-500",
  no_show: "bg-rose-500",
};

const rowBtn =
  "group/rb inline-flex items-center gap-1 text-xs font-semibold rounded-xl px-2.5 py-1.5 ring-1 transition-all duration-300 ease-spring hover:-translate-y-0.5 active:scale-95";

function fmt(dt) {
  try {
    return new Date(dt).toLocaleString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return dt;
  }
}

export default function AppointmentsPage() {
  const { activeWorkspace } = useAuthStore();
  const confirm = useConfirm();
  const [tab, setTab] = useState("bookings");
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [config, setConfig] = useState(null);
  const [businessHours, setBusinessHours] = useState([]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!activeWorkspace) return;
    setLoading(true);
    try {
      const [a, c] = await Promise.all([
        api.get(`/workspaces/${activeWorkspace}/appointments`),
        api.get(`/workspaces/${activeWorkspace}/appointments/config`),
      ]);
      setAppointments(a.data.appointments || []);
      setConfig(c.data.config);
      // Normalize business hours into a fixed 7-day array for the editor.
      const raw = c.data.businessHours || [];
      setBusinessHours(
        DAYS.map(([day]) => {
          const found = raw.find(
            (h) => (h.day || "").startsWith(day.slice(0, 3)) || h.day === day,
          );
          return {
            day,
            isOpen: found ? found.isOpen !== false : day !== "sunday",
            openTime: found?.openTime || "09:00",
            closeTime: found?.closeTime || "18:00",
          };
        }),
      );
    } catch (e) {
      toast.error("Couldn't load appointments");
    } finally {
      setLoading(false);
    }
  }, [activeWorkspace]);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (id, status) => {
    try {
      await api.patch(`/workspaces/${activeWorkspace}/appointments/${id}`, {
        status,
      });
      setAppointments((list) =>
        list.map((a) => (a._id === id ? { ...a, status } : a)),
      );
      toast.success(`Marked ${status}`);
    } catch {
      toast.error("Update failed");
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      await api.put(`/workspaces/${activeWorkspace}/appointments/config`, {
        ...config,
        businessHours,
      });
      toast.success("Scheduling settings saved");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const patchCfg = (k, v) => setConfig((c) => ({ ...c, [k]: v }));
  const patchService = (i, k, v) =>
    setConfig((c) => {
      const services = [...(c.services || [])];
      services[i] = { ...services[i], [k]: v };
      return { ...c, services };
    });
  const addService = () =>
    setConfig((c) => ({
      ...c,
      services: [
        ...(c.services || []),
        { name: "", durationMinutes: 30, price: 0 },
      ],
    }));
  const removeService = (i) =>
    setConfig((c) => ({
      ...c,
      services: (c.services || []).filter((_, idx) => idx !== i),
    }));
  const patchHour = (i, k, v) =>
    setBusinessHours((h) => h.map((d, idx) => (idx === i ? { ...d, [k]: v } : d)));

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6" aria-busy="true">
        <span className="sr-only">Loading appointments…</span>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-ink-900/[0.06] animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-48 rounded-lg bg-ink-900/[0.06] animate-pulse" />
            <div className="h-3.5 w-72 max-w-[60vw] rounded-md bg-ink-900/[0.06] animate-pulse" />
          </div>
        </div>
        <div className="h-10 w-56 rounded-2xl bg-ink-900/[0.06] animate-pulse" />
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card p-4 space-y-2">
              <div className="h-7 w-12 rounded-md bg-ink-900/[0.06] animate-pulse" />
              <div className="h-3 w-20 max-w-full rounded-md bg-ink-900/[0.06] animate-pulse" />
            </div>
          ))}
        </div>
        <div className="card divide-y divide-ink-900/[0.06]">
          {[0, 1, 2].map((i) => (
            <div key={i} className="p-4 space-y-2">
              <div className="h-4 w-40 rounded-md bg-ink-900/[0.06] animate-pulse" />
              <div className="h-3 w-64 max-w-full rounded-md bg-ink-900/[0.06] animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const upcoming = appointments.filter(
    (a) => new Date(a.startAt) >= new Date() && a.status !== "cancelled",
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-10">
      <Reveal className="group flex items-center gap-3.5 mb-6">
        <div className="relative shrink-0">
          <div aria-hidden className="absolute inset-0 rounded-2xl bg-sunset opacity-30 blur-xl" />
          <div className="relative w-11 h-11 rounded-2xl bg-sunset text-white grid place-items-center shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]">
            <CalendarCheck className="w-5 h-5" strokeWidth={1.8} />
          </div>
        </div>
        <div className="min-w-0">
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-ink-900">
            <span className="font-serif italic font-normal">Appointments</span>
          </h1>
          <p className="text-sm text-ink-500 mt-0.5">
            Bookings your bot captures from Instagram DMs, and how scheduling
            works.
          </p>
        </div>
      </Reveal>

      {/* Tabs */}
      <div className="mb-6">
        <SlidingTabs
          value={tab}
          onChange={setTab}
          items={[
            { value: "bookings", label: "Bookings", icon: CalendarCheck },
            { value: "settings", label: "Settings", icon: Settings2 },
          ]}
        />
      </div>

      <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
      {tab === "bookings" ? (
        <>
          {/* quick stats */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-6">
            {[
              ["Upcoming", upcoming.length, CalendarCheck],
              [
                "Pending approval",
                appointments.filter((a) => a.status === "pending").length,
                Clock,
              ],
              ["Total", appointments.length, CheckCircle2],
            ].map(([label, val, Icon], i) => (
              <Reveal key={label} delay={i * 0.06}>
                <Spotlight className="card group p-3 sm:p-5 h-full">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[12px] sm:text-[13px] text-ink-500 leading-tight">{label}</p>
                    <span className="hidden sm:grid w-8 h-8 rounded-xl bg-sunset-soft text-sunset-flame place-items-center shrink-0 transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]">
                      <Icon className="w-4 h-4" strokeWidth={1.8} />
                    </span>
                  </div>
                  <p className="font-display text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-ink-900 mt-1">
                    <NumberTicker value={val} />
                  </p>
                </Spotlight>
              </Reveal>
            ))}
          </div>

          {appointments.length === 0 ? (
            <Reveal className="card text-center py-16 px-6">
              <div className="relative mx-auto w-14 h-14 mb-4">
                <div aria-hidden className="absolute inset-0 rounded-2xl bg-sunset opacity-20 blur-2xl" />
                <div className="relative w-14 h-14 rounded-2xl bg-sunset-soft text-sunset-flame grid place-items-center animate-float">
                  <CalendarCheck className="w-7 h-7" strokeWidth={1.8} />
                </div>
              </div>
              <p className="font-display text-lg font-semibold tracking-[-0.02em] text-ink-900">No bookings yet</p>
              <p className="text-sm text-ink-500 mt-1">
                When your bot books someone from a DM, it'll show up here.
              </p>
            </Reveal>
          ) : (
            <div className="card divide-y divide-ink-900/[0.06] overflow-hidden">
              {appointments.map((a, idx) => (
                <motion.div
                  key={a._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx, 10) * 0.04, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="p-4 flex flex-wrap items-center gap-3 transition-colors hover:bg-white/80"
                >
                  <div className="flex-1 min-w-[180px]">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display font-semibold tracking-[-0.01em] text-ink-900">
                        {a.service || "Appointment"}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${STATUS_STYLE[a.status] || STATUS_STYLE.completed}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[a.status] || STATUS_DOT.completed}`} />
                        {a.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500 mt-1.5">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> <span className="tabular-nums">{fmt(a.startAt)}</span>
                      </span>
                      {a.customerName && (
                        <span className="inline-flex items-center gap-1">
                          <User className="w-3.5 h-3.5" /> {a.customerName}
                        </span>
                      )}
                      {a.customerPhone && (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" /> <span className="tabular-nums">{a.customerPhone}</span>
                        </span>
                      )}
                      {a.igUsername && (
                        <span className="text-ink-400">@{a.igUsername}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {a.status === "pending" && (
                      <button
                        onClick={() => setStatus(a._id, "confirmed")}
                        className={`${rowBtn} text-emerald-700 bg-emerald-50 hover:bg-emerald-100 ring-emerald-200`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 transition-transform duration-500 ease-spring group-hover/rb:scale-110" /> Approve
                      </button>
                    )}
                    {["pending", "confirmed"].includes(a.status) && (
                      <>
                        <button
                          onClick={() => setStatus(a._id, "completed")}
                          className={`${rowBtn} text-ink-700 bg-white/80 hover:bg-white ring-ink-900/[0.08] shadow-[inset_0_1px_0_#fff]`}
                        >
                          Done
                        </button>
                        <button
                          onClick={async () => {
                            if (
                              await confirm({
                                title: "Cancel this appointment?",
                                confirmLabel: "Cancel booking",
                                danger: true,
                              })
                            )
                              setStatus(a._id, "cancelled");
                          }}
                          className={`${rowBtn} text-rose-600 bg-rose-50 hover:bg-rose-100 ring-rose-200`}
                        >
                          <XCircle className="w-3.5 h-3.5 transition-transform duration-500 ease-spring group-hover/rb:rotate-90" /> Cancel
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* ── Settings tab ─────────────────────────────────────── */
        <div className="space-y-6">
          {/* Master toggle */}
          <div className="card p-5 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="font-display font-semibold tracking-[-0.01em] text-ink-900">Appointment scheduling</p>
              <p className="text-sm text-ink-500">
                Let your bot offer open slots and book customers automatically.
              </p>
            </div>
            <label className="toggle shrink-0 cursor-pointer">
              <input
                type="checkbox"
                checked={!!config?.enabled}
                onChange={(e) => patchCfg("enabled", e.target.checked)}
                aria-label="Appointment scheduling"
              />
              <span className="slider" />
            </label>
          </div>

          {/* Services */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="font-display font-semibold tracking-[-0.01em] text-ink-900">Services</p>
              <button
                onClick={addService}
                className="btn-secondary group/as text-xs px-3 py-1.5"
              >
                <Plus className="w-4 h-4 transition-transform duration-500 ease-spring group-hover/as:rotate-90" /> Add service
              </button>
            </div>
            <div className="space-y-2">
              <AnimatePresence initial={false}>
              {(config?.services || []).map((s, i) => (
                <motion.div
                  key={i}
                  layout
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  className="flex flex-wrap items-center gap-2 rounded-xl bg-white/50 ring-1 ring-ink-900/[0.05] p-2 sm:bg-transparent sm:ring-0 sm:p-0"
                >
                  <input
                    value={s.name}
                    onChange={(e) => patchService(i, "name", e.target.value)}
                    placeholder="Service name"
                    className="input flex-1 min-w-[10rem]"
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={s.durationMinutes}
                      onChange={(e) =>
                        patchService(i, "durationMinutes", Number(e.target.value))
                      }
                      className="input !w-20 !px-2 tabular-nums"
                    />
                    <span className="text-xs text-ink-400">min</span>
                  </div>
                  <input
                    type="number"
                    value={s.price}
                    onChange={(e) =>
                      patchService(i, "price", Number(e.target.value))
                    }
                    placeholder="Price"
                    className="input !w-24 !px-2 tabular-nums"
                  />
                  <button
                    onClick={() => removeService(i)}
                    className="group/del ml-auto sm:ml-0 grid w-10 h-10 place-items-center rounded-xl text-ink-400 hover:text-rose-600 hover:bg-rose-50 active:scale-90 transition-all duration-300 ease-spring"
                    aria-label="Remove service"
                  >
                    <Trash2 className="w-4 h-4 transition-transform duration-500 ease-spring group-hover/del:rotate-[-12deg]" />
                  </button>
                </motion.div>
              ))}
              </AnimatePresence>
              {!(config?.services || []).length && (
                <p className="text-sm text-ink-400">
                  No services yet — add the things people can book.
                </p>
              )}
            </div>
          </div>

          {/* Slot rules */}
          <div className="card p-5 grid sm:grid-cols-2 gap-4">
            {[
              ["slotMinutes", "Slot length (min)"],
              ["bufferMinutes", "Gap between (min)"],
              ["capacityPerSlot", "Bookings per slot"],
              ["advanceDays", "Book up to (days ahead)"],
              ["minNoticeHours", "Minimum notice (hours)"],
            ].map(([k, label]) => (
              <label key={k} className="block">
                <span className="label">
                  {label}
                </span>
                <input
                  type="number"
                  value={config?.[k] ?? 0}
                  onChange={(e) => patchCfg(k, Number(e.target.value))}
                  className="input mt-1 w-full tabular-nums"
                />
              </label>
            ))}
            <label className="flex items-center gap-2.5 sm:col-span-2 cursor-pointer rounded-xl px-3 py-2.5 bg-white/50 ring-1 ring-ink-900/[0.06] hover:bg-white/80 transition-colors">
              <input
                type="checkbox"
                checked={!!config?.requireApproval}
                onChange={(e) => patchCfg("requireApproval", e.target.checked)}
                className="w-4 h-4 accent-[#FF6A2B]"
              />
              <span className="text-sm text-ink-700">
                Hold bookings for my approval before confirming
              </span>
            </label>
          </div>

          {/* Business hours */}
          <div className="card p-5">
            <p className="font-display font-semibold tracking-[-0.01em] text-ink-900 mb-3">Working hours</p>
            <div className="space-y-1.5">
              {businessHours.map((d, i) => (
                <div key={d.day} className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl px-2 py-1.5 -mx-2 transition-colors hover:bg-white/70">
                  <label className="flex items-center gap-2 w-20 sm:w-24 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={d.isOpen}
                      onChange={(e) => patchHour(i, "isOpen", e.target.checked)}
                      className="w-4 h-4 accent-[#FF6A2B]"
                    />
                    <span className="text-sm font-medium text-ink-700 capitalize">
                      {d.day.slice(0, 3)}
                    </span>
                  </label>
                  {d.isOpen ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={d.openTime}
                        onChange={(e) => patchHour(i, "openTime", e.target.value)}
                        className="input !w-auto !px-2 !py-1.5 tabular-nums"
                      />
                      <span className="text-ink-400 text-sm">–</span>
                      <input
                        type="time"
                        value={d.closeTime}
                        onChange={(e) =>
                          patchHour(i, "closeTime", e.target.value)
                        }
                        className="input !w-auto !px-2 !py-1.5 tabular-nums"
                      />
                    </div>
                  ) : (
                    <span className="badge-gray text-xs">Closed</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="card p-5 space-y-3">
            <p className="font-display font-semibold tracking-[-0.01em] text-ink-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-sunset-soft text-sunset-flame grid place-items-center">
                <MapPin className="w-4 h-4" strokeWidth={1.8} />
              </span>
              Location (optional)
            </p>
            <p className="text-xs text-ink-500 -mt-1">
              Shown in booking confirmations so customers know where to go.
            </p>
            <input
              value={config?.locationName || ""}
              onChange={(e) => patchCfg("locationName", e.target.value)}
              placeholder="Location name (e.g. Smile Dental, Main St Clinic)"
              className="input w-full"
            />
            <input
              value={config?.mapsUrl || ""}
              onChange={(e) => patchCfg("mapsUrl", e.target.value)}
              placeholder="Google Maps link (https://maps.app.goo.gl/…)"
              className="input w-full"
            />
            <input
              value={config?.notifyEmail || ""}
              onChange={(e) => patchCfg("notifyEmail", e.target.value)}
              placeholder="Notify email for new bookings (defaults to your account email)"
              className="input w-full"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={saveConfig}
              disabled={saving}
              className="btn-primary group/sv text-sm px-6 py-3 disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4 transition-transform duration-500 ease-spring group-hover/sv:-translate-y-0.5" />
              )}
              Save settings
            </button>
          </div>
        </div>
      )}
      </motion.div>
      </AnimatePresence>
    </div>
  );
}
