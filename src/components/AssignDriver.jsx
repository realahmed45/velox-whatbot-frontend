/**
 * Assign a driver to one pickup.
 *
 * Shows who is driving once someone is assigned, with a way to change it; until
 * then, a picker. Assigning sends the guest the driver's name, car and WhatsApp
 * number — which is why the confirmation toast says so.
 *
 * Used by the hotel (its own drivers) and by /admin (Botlify's drivers); the
 * caller passes the drivers and the save function, so this stays dumb.
 */
import { useState } from "react";
import toast from "react-hot-toast";
import { Car, Loader2 } from "lucide-react";

export default function AssignDriver({ transfer, drivers, onAssign }) {
  const [changing, setChanging] = useState(false);
  const [saving, setSaving] = useState(false);
  const open = ["pending", "confirmed"].includes(transfer.status);
  const assigned = transfer.driverSnapshot?.phone ? transfer.driverSnapshot : null;

  const pick = async (driverId) => {
    if (!driverId) return;
    setSaving(true);
    try {
      const res = await onAssign(driverId);
      toast.success(
        res?.guestTold
          ? "Driver assigned — the guest has their details"
          : "Driver assigned",
      );
      setChanging(false);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Couldn't assign that driver");
    } finally {
      setSaving(false);
    }
  };

  if (assigned && !changing) {
    return (
      <div className="mt-2 inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-xs bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-lg px-2.5 py-1.5">
        <Car className="w-3.5 h-3.5" />
        <span className="font-bold">{assigned.name}</span>
        <span>{assigned.phone}</span>
        {assigned.vehicleLabel && (
          <span className="text-emerald-700/80">· {assigned.vehicleLabel}</span>
        )}
        {open && (
          <button
            onClick={() => setChanging(true)}
            className="font-bold underline underline-offset-2 hover:text-emerald-900"
          >
            Change
          </button>
        )}
      </div>
    );
  }

  if (!open) return null;

  if (!drivers.length) {
    return (
      <p className="mt-2 text-xs text-amber-700">
        No drivers yet — add one below to assign this pickup.
      </p>
    );
  }

  return (
    <div className="mt-2 flex items-center gap-2">
      <select
        defaultValue=""
        disabled={saving}
        onChange={(e) => pick(e.target.value)}
        className="text-xs font-semibold border border-amber-300 bg-amber-50 text-amber-900 rounded-lg px-2.5 py-1.5 outline-none"
      >
        <option value="" disabled>
          Assign a driver…
        </option>
        {drivers
          .filter((d) => d.active)
          .map((d) => (
            <option key={d._id} value={d._id}>
              {d.name} · {d.phone}
            </option>
          ))}
      </select>
      {saving && <Loader2 className="w-3.5 h-3.5 animate-spin text-ink-400" />}
      {changing && (
        <button
          onClick={() => setChanging(false)}
          className="text-xs text-ink-500 hover:text-ink-800"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
