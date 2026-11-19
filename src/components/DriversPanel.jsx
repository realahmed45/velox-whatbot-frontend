/**
 * Drivers — who can be assigned to airport pickups.
 *
 * One component, two homes, because the shape is identical either way:
 *   scope="hotel"    → Settings → Transfers. The hotel's own driver(s).
 *   scope="platform" → /admin. Botlify's pool, used by hotels with no service
 *                      of their own.
 *
 * Only the endpoints differ, so they're passed in rather than branched on
 * throughout. Jobs are offered to drivers on WhatsApp automatically (first
 * YES wins); assigning one by hand still works and sends the guest the
 * driver's name, car and WhatsApp number.
 */
import { useCallback, useEffect, useState } from "react";
import defaultApi from "@/services/api";
import toast from "react-hot-toast";
import {
  Car,
  Check,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import Skeleton from "@/components/ui/Skeleton";
import { Spotlight } from "@/components/fx";
import { PAYOUT_CHANNELS } from "@/data/payoutChannels";

const ID_TYPES = [
  { value: "ktp", label: "KTP" },
  { value: "passport", label: "Passport" },
  { value: "driving_licence", label: "Driving licence" },
  { value: "other", label: "Other" },
];

const BLANK = {
  name: "",
  nickname: "",
  phone: "",
  email: "",
  idType: "ktp",
  idNumber: "",
  idExpiry: "",
  licenceNumber: "",
  licenceExpiry: "",
  vehicle: { make: "", model: "", colour: "", plate: "", seats: 4 },
  serviceAreas: [],
  payout: { channelCode: "", accountNumber: "", accountHolderName: "" },
  priority: 100,
  active: true,
  notes: "",
};

const dateInput = (v) => (v ? String(v).slice(0, 10) : "");

/**
 * `client` exists because /admin authenticates with its own token in its own
 * axios instance — the app's shared client would send the wrong credentials
 * there. Callers pass whichever one is right for their side of the app.
 */
export default function DriversPanel({ scope = "hotel", client, onChange }) {
  const api = client || defaultApi;
  const base = scope === "platform" ? "/admin/drivers" : "/drivers";
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | {} | driver
  const [saving, setSaving] = useState(false);
  const confirm = useConfirm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(base);
      setDrivers(data.drivers || []);
      onChange?.(data.drivers || []);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Couldn't load drivers");
    } finally {
      setLoading(false);
    }
  }, [api, base]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (form) => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        priority: Number(form.priority) || 100,
        vehicle: { ...form.vehicle, seats: Number(form.vehicle.seats) || 4 },
        idExpiry: form.idExpiry || null,
        licenceExpiry: form.licenceExpiry || null,
      };
      if (form._id) {
        await api.patch(`${base}/${form._id}`, payload);
        toast.success("Driver updated");
      } else {
        await api.post(base, payload);
        toast.success("Driver added");
      }
      setEditing(null);
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Couldn't save that driver");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (driver) => {
    const yes = await confirm({
      title: `Remove ${driver.name}?`,
      description:
        "They can no longer be assigned to pickups. Trips they already drove stay on record.",
      confirmLabel: "Remove",
      danger: true,
    });
    if (!yes) return;
    try {
      await api.delete(`${base}/${driver._id}`);
      toast.success("Driver removed");
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Couldn't remove that driver");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-[-0.02em] text-ink-900">
            {scope === "platform" ? "Botlify drivers" : "Your drivers"}
          </h2>
          <p className="text-sm text-ink-500 mt-0.5 max-w-xl">
            {scope === "platform"
              ? "Used for hotels that don't run their own taxi service. Paid pickups are offered to these drivers on WhatsApp automatically — the first to reply YES gets it, and is paid out after the trip."
              : "When a guest books an airport pickup, these drivers get the job on WhatsApp automatically — the first to reply YES gets it, and the guest is sent their name, car and number."}
          </p>
        </div>
        <button
          onClick={() => setEditing({ ...BLANK })}
          className="btn-primary group shrink-0"
        >
          <Plus className="h-4 w-4 transition-transform duration-500 ease-spring group-hover:rotate-90" />
          Add driver
        </button>
      </div>

      {loading ? (
        <div className="space-y-2.5">
          {[0, 1].map((i) => (
            <div key={i} className="card flex items-start gap-4 p-4">
              <Skeleton className="h-11 w-11 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-52" />
              </div>
            </div>
          ))}
        </div>
      ) : drivers.length === 0 ? (
        <EmptyState
          icon={Car}
          title="No drivers yet"
          description="Add a driver so you can assign them to airport pickups."
        />
      ) : (
        <div className="space-y-2.5">
          {drivers.map((d) => (
            <Spotlight
              key={d._id}
              className="card group flex flex-wrap items-start gap-4 p-4 transition-transform duration-500 ease-spring hover:-translate-y-0.5"
            >
              <span
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl font-display text-base font-semibold transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg] ${
                  d.active
                    ? "bg-sunset text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_8px_18px_-8px_rgba(255,61,119,0.6)]"
                    : "bg-ink-900/[0.05] text-ink-400"
                }`}
                aria-hidden
              >
                {(d.name || "?").trim().charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-ink-900">{d.name}</p>
                  {d.nickname && (
                    <span className="text-xs text-ink-500">"{d.nickname}"</span>
                  )}
                  {!d.active && (
                    <span className="badge-gray">
                      Paused
                    </span>
                  )}
                </div>
                <p className="mt-0.5 font-mono text-[13px] text-ink-500">{d.phone}</p>
                {d.vehicleLabel && (
                  <p className="text-xs text-ink-400 mt-0.5">{d.vehicleLabel}</p>
                )}
                <p className="mt-1.5 text-xs tabular-nums text-ink-400">
                  {d.stats?.accepted || 0} accepted ·{" "}
                  {d.stats?.missed || 0} missed ·{" "}
                  {d.stats?.declined || 0} passed
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() =>
                    setEditing({
                      ...BLANK,
                      ...d,
                      vehicle: { ...BLANK.vehicle, ...(d.vehicle || {}) },
                      payout: { ...BLANK.payout, ...(d.payout || {}) },
                      idExpiry: dateInput(d.idExpiry),
                      licenceExpiry: dateInput(d.licenceExpiry),
                    })
                  }
                  title="Edit"
                  className="group/b grid h-10 w-10 place-items-center rounded-xl text-ink-400 transition hover:bg-ink-900/[0.05] hover:text-ink-800 active:scale-90"
                >
                  <Pencil className="h-4 w-4 transition-transform duration-500 ease-spring group-hover/b:-translate-y-0.5 group-hover/b:rotate-[-12deg]" />
                </button>
                <button
                  onClick={() => remove(d)}
                  title="Remove"
                  className="group/b grid h-10 w-10 place-items-center rounded-xl text-ink-400 transition hover:bg-rose-50 hover:text-rose-600 active:scale-90"
                >
                  <Trash2 className="h-4 w-4 transition-transform duration-500 ease-spring group-hover/b:-translate-y-0.5 group-hover/b:rotate-[8deg]" />
                </button>
              </div>
            </Spotlight>
          ))}
        </div>
      )}

      {editing && (
        <DriverForm
          value={editing}
          scope={scope}
          saving={saving}
          onCancel={() => setEditing(null)}
          onSave={save}
        />
      )}

    </div>
  );
}

/* ── Add / edit ────────────────────────────────────────────────────────── */
function DriverForm({ value, scope, saving, onCancel, onSave }) {
  const [form, setForm] = useState(value);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setPayout = (k, v) =>
    setForm((f) => ({ ...f, payout: { ...(f.payout || {}), [k]: v } }));
  const setVehicle = (k, v) =>
    setForm((f) => ({ ...f, vehicle: { ...f.vehicle, [k]: v } }));

  const canSave = form.name.trim() && form.phone.trim() && !saving;

  return (
    <Modal
      open
      onClose={onCancel}
      title={form._id ? "Edit driver" : "Add a driver"}
      size="lg"
    >
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Full name</label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="input"
              placeholder="Wayan Sudiarta"
            />
          </div>
          <div>
            <label className="label">
              Nickname <span className="text-ink-400">(optional)</span>
            </label>
            <input
              value={form.nickname}
              onChange={(e) => set("nickname", e.target.value)}
              className="input"
              placeholder="Wayan"
            />
            <p className="text-xs text-ink-400 mt-1">
              What the guest is told to ask for.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="label">WhatsApp number</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              className="input"
              placeholder="+62 812 3456 7890"
            />
            <p className="text-xs text-ink-400 mt-1">
              This is the number we give the guest.
            </p>
          </div>
          <div>
            <label className="label">
              Email <span className="text-ink-400">(optional)</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className="input"
              placeholder="driver@example.com"
            />
          </div>
        </div>

        <div className="rounded-2xl bg-white/50 p-3.5 ring-1 ring-inset ring-ink-900/[0.06]">
          <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-500">Vehicle</p>
          <div className="grid sm:grid-cols-4 gap-3">
            <input
              value={form.vehicle.make}
              onChange={(e) => setVehicle("make", e.target.value)}
              className="input"
              placeholder="Make"
            />
            <input
              value={form.vehicle.model}
              onChange={(e) => setVehicle("model", e.target.value)}
              className="input"
              placeholder="Model"
            />
            <input
              value={form.vehicle.colour}
              onChange={(e) => setVehicle("colour", e.target.value)}
              className="input"
              placeholder="Colour"
            />
            <input
              value={form.vehicle.plate}
              onChange={(e) => setVehicle("plate", e.target.value)}
              className="input"
              placeholder="Plate"
            />
          </div>
        </div>

        <div className="rounded-2xl bg-white/50 p-3.5 ring-1 ring-inset ring-ink-900/[0.06]">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-500">Identity</p>
          <p className="text-xs text-ink-400 mb-2.5">
            Numbers only — we never store a photo or scan of a document.
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            <select
              value={form.idType}
              onChange={(e) => set("idType", e.target.value)}
              className="input"
            >
              {ID_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <input
              value={form.idNumber}
              onChange={(e) => set("idNumber", e.target.value)}
              className="input"
              placeholder="ID number"
            />
            <div>
              <input
                type="date"
                value={form.idExpiry}
                onChange={(e) => set("idExpiry", e.target.value)}
                className="input"
              />
              <p className="text-xs text-ink-400 mt-1">ID expiry</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 mt-3">
            <input
              value={form.licenceNumber}
              onChange={(e) => set("licenceNumber", e.target.value)}
              className="input"
              placeholder="Driving licence number"
            />
            <div>
              <input
                type="date"
                value={form.licenceExpiry}
                onChange={(e) => set("licenceExpiry", e.target.value)}
                className="input"
              />
              <p className="text-xs text-ink-400 mt-1">Licence expiry</p>
            </div>
          </div>
        </div>

        {scope === "platform" && (
          <div className="rounded-2xl bg-white/50 p-3.5 ring-1 ring-inset ring-ink-900/[0.06]">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-500">Automatic payouts</p>
            <p className="text-xs text-ink-400 mb-2.5">
              Their earnings from paid trips go here every day, automatically.
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              <select
                value={form.payout?.channelCode || ""}
                onChange={(e) => setPayout("channelCode", e.target.value)}
                className="input"
              >
                <option value="">Bank or e-wallet…</option>
                {PAYOUT_CHANNELS.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
              <input
                value={form.payout?.accountNumber || ""}
                onChange={(e) => setPayout("accountNumber", e.target.value)}
                className="input"
                placeholder="Account / phone number"
              />
              <input
                value={form.payout?.accountHolderName || ""}
                onChange={(e) => setPayout("accountHolderName", e.target.value)}
                className="input"
                placeholder="Name on the account"
              />
            </div>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Order</label>
            <input
              type="number"
              value={form.priority}
              onChange={(e) => set("priority", e.target.value)}
              className="input"
            />
            <p className="text-xs text-ink-400 mt-1">
              Lower is asked first. Same number spreads work evenly.
            </p>
          </div>
          <div className="flex items-end pb-1">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => set("active", e.target.checked)}
                className="h-4 w-4 accent-[#FF6A2B]"
              />
              <span className="text-sm font-semibold text-ink-700">
                Taking jobs
              </span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            onClick={onCancel}
            className="btn-ghost"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={!canSave}
            className="btn-primary"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {form._id ? "Save changes" : "Add driver"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
