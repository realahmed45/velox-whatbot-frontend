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
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-ink-100 text-ink-600 border-ink-200",
  cancelled: "bg-rose-50 text-rose-600 border-rose-200",
  no_show: "bg-rose-50 text-rose-600 border-rose-200",
};

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
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-7 h-7 text-brand-500 animate-spin" />
      </div>
    );
  }

  const upcoming = appointments.filter(
    (a) => new Date(a.startAt) >= new Date() && a.status !== "cancelled",
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl bg-brand-500/10 flex items-center justify-center">
          <CalendarCheck className="w-6 h-6 text-brand-500" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-ink-900">Appointments</h1>
          <p className="text-sm text-ink-500">
            Bookings your bot captures from Instagram DMs, and how scheduling
            works.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-ink-100">
        {[
          ["bookings", "Bookings", CalendarCheck],
          ["settings", "Settings", Settings2],
        ].map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition ${
              tab === key
                ? "border-brand-500 text-brand-600"
                : "border-transparent text-ink-500 hover:text-ink-800"
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {tab === "bookings" ? (
        <>
          {/* quick stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              ["Upcoming", upcoming.length],
              [
                "Pending approval",
                appointments.filter((a) => a.status === "pending").length,
              ],
              ["Total", appointments.length],
            ].map(([label, val]) => (
              <div
                key={label}
                className="rounded-xl border border-ink-100 bg-white p-4"
              >
                <p className="text-2xl font-black text-ink-900">{val}</p>
                <p className="text-xs text-ink-500">{label}</p>
              </div>
            ))}
          </div>

          {appointments.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-dashed border-ink-200">
              <CalendarCheck className="w-10 h-10 text-ink-300 mx-auto mb-3" />
              <p className="font-semibold text-ink-700">No bookings yet</p>
              <p className="text-sm text-ink-500 mt-1">
                When your bot books someone from a DM, it'll show up here.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {appointments.map((a) => (
                <div
                  key={a._id}
                  className="rounded-xl border border-ink-100 bg-white p-4 flex flex-wrap items-center gap-3"
                >
                  <div className="flex-1 min-w-[180px]">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-ink-900">
                        {a.service || "Appointment"}
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLE[a.status] || STATUS_STYLE.completed}`}
                      >
                        {a.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500 mt-1.5">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {fmt(a.startAt)}
                      </span>
                      {a.customerName && (
                        <span className="inline-flex items-center gap-1">
                          <User className="w-3.5 h-3.5" /> {a.customerName}
                        </span>
                      )}
                      {a.customerPhone && (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" /> {a.customerPhone}
                        </span>
                      )}
                      {a.igUsername && (
                        <span className="text-ink-400">@{a.igUsername}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {a.status === "pending" && (
                      <button
                        onClick={() => setStatus(a._id, "confirmed")}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg px-2.5 py-1.5 transition"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                      </button>
                    )}
                    {["pending", "confirmed"].includes(a.status) && (
                      <>
                        <button
                          onClick={() => setStatus(a._id, "completed")}
                          className="text-xs font-semibold text-ink-600 bg-ink-50 hover:bg-ink-100 border border-ink-200 rounded-lg px-2.5 py-1.5 transition"
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
                          className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg px-2.5 py-1.5 transition"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* ── Settings tab ─────────────────────────────────────── */
        <div className="space-y-6">
          {/* Master toggle */}
          <div className="rounded-2xl border border-ink-100 bg-white p-5 flex items-center justify-between">
            <div>
              <p className="font-bold text-ink-900">Appointment scheduling</p>
              <p className="text-sm text-ink-500">
                Let your bot offer open slots and book customers automatically.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={!!config?.enabled}
                onChange={(e) => patchCfg("enabled", e.target.checked)}
              />
              <div className="w-11 h-6 bg-ink-200 rounded-full peer peer-checked:bg-brand-500 peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition" />
            </label>
          </div>

          {/* Services */}
          <div className="rounded-2xl border border-ink-100 bg-white p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-ink-900">Services</p>
              <button
                onClick={addService}
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                <Plus className="w-4 h-4" /> Add service
              </button>
            </div>
            <div className="space-y-2">
              {(config?.services || []).map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={s.name}
                    onChange={(e) => patchService(i, "name", e.target.value)}
                    placeholder="Service name"
                    className="flex-1 rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 outline-none"
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={s.durationMinutes}
                      onChange={(e) =>
                        patchService(i, "durationMinutes", Number(e.target.value))
                      }
                      className="w-20 rounded-lg border border-ink-200 px-2 py-2 text-sm focus:border-brand-400 outline-none"
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
                    className="w-24 rounded-lg border border-ink-200 px-2 py-2 text-sm focus:border-brand-400 outline-none"
                  />
                  <button
                    onClick={() => removeService(i)}
                    className="text-ink-400 hover:text-rose-500 p-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {!(config?.services || []).length && (
                <p className="text-sm text-ink-400">
                  No services yet — add the things people can book.
                </p>
              )}
            </div>
          </div>

          {/* Slot rules */}
          <div className="rounded-2xl border border-ink-100 bg-white p-5 grid sm:grid-cols-2 gap-4">
            {[
              ["slotMinutes", "Slot length (min)"],
              ["bufferMinutes", "Gap between (min)"],
              ["capacityPerSlot", "Bookings per slot"],
              ["advanceDays", "Book up to (days ahead)"],
              ["minNoticeHours", "Minimum notice (hours)"],
            ].map(([k, label]) => (
              <label key={k} className="block">
                <span className="text-xs font-semibold text-ink-600">
                  {label}
                </span>
                <input
                  type="number"
                  value={config?.[k] ?? 0}
                  onChange={(e) => patchCfg(k, Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 outline-none"
                />
              </label>
            ))}
            <label className="flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                checked={!!config?.requireApproval}
                onChange={(e) => patchCfg("requireApproval", e.target.checked)}
                className="w-4 h-4 accent-brand-500"
              />
              <span className="text-sm text-ink-700">
                Hold bookings for my approval before confirming
              </span>
            </label>
          </div>

          {/* Business hours */}
          <div className="rounded-2xl border border-ink-100 bg-white p-5">
            <p className="font-bold text-ink-900 mb-3">Working hours</p>
            <div className="space-y-2">
              {businessHours.map((d, i) => (
                <div key={d.day} className="flex items-center gap-3">
                  <label className="flex items-center gap-2 w-24">
                    <input
                      type="checkbox"
                      checked={d.isOpen}
                      onChange={(e) => patchHour(i, "isOpen", e.target.checked)}
                      className="w-4 h-4 accent-brand-500"
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
                        className="rounded-lg border border-ink-200 px-2 py-1.5 text-sm"
                      />
                      <span className="text-ink-400 text-sm">–</span>
                      <input
                        type="time"
                        value={d.closeTime}
                        onChange={(e) =>
                          patchHour(i, "closeTime", e.target.value)
                        }
                        className="rounded-lg border border-ink-200 px-2 py-1.5 text-sm"
                      />
                    </div>
                  ) : (
                    <span className="text-sm text-ink-400">Closed</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="rounded-2xl border border-ink-100 bg-white p-5 space-y-3">
            <p className="font-bold text-ink-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-brand-500" /> Location (optional)
            </p>
            <p className="text-xs text-ink-500 -mt-1">
              Shown in booking confirmations so customers know where to go.
            </p>
            <input
              value={config?.locationName || ""}
              onChange={(e) => patchCfg("locationName", e.target.value)}
              placeholder="Location name (e.g. Smile Dental, Main St Clinic)"
              className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 outline-none"
            />
            <input
              value={config?.mapsUrl || ""}
              onChange={(e) => patchCfg("mapsUrl", e.target.value)}
              placeholder="Google Maps link (https://maps.app.goo.gl/…)"
              className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 outline-none"
            />
            <input
              value={config?.notifyEmail || ""}
              onChange={(e) => patchCfg("notifyEmail", e.target.value)}
              placeholder="Notify email for new bookings (defaults to your account email)"
              className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 outline-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={saveConfig}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl px-6 py-3 transition disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
