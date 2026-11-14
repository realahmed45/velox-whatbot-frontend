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
      <div className="mt-2 inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl bg-emerald-50/90 px-2.5 py-1.5 text-xs text-emerald-800 ring-1 ring-inset ring-emerald-600/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
        <Car className="h-3.5 w-3.5" strokeWidth={1.8} />
        <span className="font-bold">{assigned.name}</span>
        <span>{assigned.phone}</span>
        {assigned.vehicleLabel && (
          <span className="text-emerald-700/80">· {assigned.vehicleLabel}</span>
        )}
        {open && (
          <button
            onClick={() => setChanging(true)}
            className="rounded-md px-1 font-semibold underline decoration-emerald-600/40 underline-offset-2 transition hover:bg-emerald-600/10 hover:text-emerald-900 active:scale-95"
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
      <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-xs text-amber-700 ring-1 ring-inset ring-amber-600/20">
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
        className="cursor-pointer rounded-xl border border-amber-300/70 bg-amber-50/90 px-2.5 py-1.5 text-xs font-semibold text-amber-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] outline-none transition hover:border-amber-400 focus:border-sunset-flame/60 focus:ring-4 focus:ring-sunset-flame/10 disabled:opacity-60"
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
      {saving && <Loader2 className="h-3.5 w-3.5 animate-spin text-sunset-flame" />}
      {changing && (
        <button
          onClick={() => setChanging(false)}
          className="rounded-lg px-2 py-1 text-xs font-medium text-ink-500 transition hover:bg-ink-900/[0.05] hover:text-ink-800"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
