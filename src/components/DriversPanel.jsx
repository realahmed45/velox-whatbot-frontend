/**
 * Drivers — the roster we dispatch airport pickups to.
 *
 * One component, two homes, because the shape is identical either way:
 *   scope="hotel"    → Settings → Transfers. The hotel's own driver(s).
 *   scope="platform" → /admin. Botlify's pool, used by hotels with no service
 *                      of their own.
 *
 * Only the endpoints differ, so they're passed in rather than branched on
 * throughout. The dispatch link is the one thing that needs explaining in the
 * UI: a driver has no Botlify login, so that link IS their way in, and it can
 * be reissued if a phone goes missing.
 */
import { useCallback, useEffect, useState } from "react";
import defaultApi from "@/services/api";
import toast from "react-hot-toast";
import {
  Car,
  Check,
  Copy,
  Link2,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import { useConfirm } from "@/components/ui/ConfirmDialog";

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
export default function DriversPanel({ scope = "hotel", client }) {
  const api = client || defaultApi;
  const base = scope === "platform" ? "/admin/drivers" : "/drivers";
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | {} | driver
  const [saving, setSaving] = useState(false);
  const [linkFor, setLinkFor] = useState(null);
  const confirm = useConfirm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(base);
      setDrivers(data.drivers || []);
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
        "They'll stop receiving pickup offers. Trips they already drove stay on record.",
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

  const getLink = async (driver, rotate = false) => {
    try {
      const { data } = await api.get(
        `${base}/${driver._id}/link${rotate ? "?rotate=1" : ""}`,
      );
      setLinkFor({ driver, link: data.link });
      if (rotate) toast.success("New link issued — the old one stopped working");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Couldn't get that link");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-black text-ink-900">
            {scope === "platform" ? "Botlify drivers" : "Your drivers"}
          </h2>
          <p className="text-sm text-ink-500 mt-0.5 max-w-xl">
            {scope === "platform"
              ? "Dispatched for hotels that don't run their own taxi service. We offer a job to one driver at a time and move on if they don't answer."
              : "When a guest asks for an airport pickup we offer the job to your drivers, one at a time, and give the guest whoever accepts."}
          </p>
        </div>
        <button
          onClick={() => setEditing({ ...BLANK })}
          className="inline-flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl px-4 py-2.5 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add driver
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-14">
          <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
        </div>
      ) : drivers.length === 0 ? (
        <EmptyState
          icon={Car}
          title="No drivers yet"
          description="Add a driver and we'll send them airport pickups as they come in."
        />
      ) : (
        <div className="space-y-2.5">
          {drivers.map((d) => (
            <div
              key={d._id}
              className="rounded-2xl border border-ink-100 bg-white p-4 flex flex-wrap items-start gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-ink-900">{d.name}</p>
                  {d.nickname && (
                    <span className="text-xs text-ink-500">"{d.nickname}"</span>
                  )}
                  {!d.active && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-ink-100 text-ink-500">
                      Paused
                    </span>
                  )}
                </div>
                <p className="text-sm text-ink-500 mt-0.5">{d.phone}</p>
                {d.vehicleLabel && (
                  <p className="text-xs text-ink-400 mt-0.5">{d.vehicleLabel}</p>
                )}
                <p className="text-xs text-ink-400 mt-1.5">
                  {d.stats?.accepted || 0} accepted ·{" "}
                  {d.stats?.missed || 0} missed ·{" "}
                  {d.stats?.declined || 0} passed
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => getLink(d)}
                  title="Their dispatch link"
                  className="p-2 rounded-lg text-ink-400 hover:text-brand-600 hover:bg-brand-50 transition"
                >
                  <Link2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    setEditing({
                      ...BLANK,
                      ...d,
                      vehicle: { ...BLANK.vehicle, ...(d.vehicle || {}) },
                      idExpiry: dateInput(d.idExpiry),
                      licenceExpiry: dateInput(d.licenceExpiry),
                    })
                  }
                  title="Edit"
                  className="p-2 rounded-lg text-ink-400 hover:text-ink-800 hover:bg-ink-50 transition"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => remove(d)}
                  title="Remove"
                  className="p-2 rounded-lg text-ink-400 hover:text-rose-600 hover:bg-rose-50 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <DriverForm
          value={editing}
          saving={saving}
          onCancel={() => setEditing(null)}
          onSave={save}
        />
      )}

      {linkFor && (
        <LinkModal
          data={linkFor}
          onRotate={() => getLink(linkFor.driver, true)}
          onClose={() => setLinkFor(null)}
        />
      )}
    </div>
  );
}

/* ── The driver's private link ─────────────────────────────────────────── */
function LinkModal({ data, onRotate, onClose }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(data.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — select the link and copy it by hand.");
    }
  };
  return (
    <Modal open onClose={onClose} title={`${data.driver.name}'s link`}>
      <p className="text-sm text-ink-500">
        Send this to {data.driver.name}. They open it to accept or pass on
        pickups — no app, no password. Anyone with the link can answer as them,
        so if they lose their phone, issue a new one.
      </p>
      <div className="mt-3 flex items-center gap-2">
        <input
          readOnly
          value={data.link}
          onClick={(e) => e.target.select()}
          className="input flex-1 text-xs font-mono"
        />
        <button
          onClick={copy}
          className="inline-flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl px-3.5 py-2.5 transition shrink-0"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <button
        onClick={onRotate}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-ink-500 hover:text-rose-600 transition"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Issue a new link (stops the old one)
      </button>
    </Modal>
  );
}

/* ── Add / edit ────────────────────────────────────────────────────────── */
function DriverForm({ value, saving, onCancel, onSave }) {
  const [form, setForm] = useState(value);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
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

        <div className="rounded-xl border border-ink-100 bg-ink-50/40 p-3.5">
          <p className="text-xs font-bold text-ink-700 mb-2.5">Vehicle</p>
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

        <div className="rounded-xl border border-ink-100 bg-ink-50/40 p-3.5">
          <p className="text-xs font-bold text-ink-700 mb-1">Identity</p>
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
                className="w-4 h-4 accent-brand-500"
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
            className="inline-flex items-center gap-1.5 text-sm font-bold text-ink-500 hover:text-ink-800 px-3 py-2.5 transition"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={!canSave}
            className="inline-flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl px-4 py-2.5 transition disabled:opacity-50"
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
