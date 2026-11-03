/**
 * Pickups waiting for a Botlify driver — for hotels with no taxi service of
 * their own. The team rings a driver, then assigns them here; the guest is
 * sent the driver's details automatically.
 */
import { useCallback, useEffect, useState } from "react";
import { Loader2, Plane, Users } from "lucide-react";
import AssignDriver from "@/components/AssignDriver";

const fmt = (d) =>
  new Date(d).toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function AdminPickups({ client, drivers }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await client.get("/admin/transfers");
      setRows(data.transfers || []);
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    load();
  }, [load]);

  const waiting = rows.filter((r) => !r.driverSnapshot?.phone).length;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <h2 className="text-lg font-black text-ink-900">Pickups</h2>
        {waiting > 0 && (
          <span className="text-xs font-bold text-amber-800 bg-amber-100 rounded-full px-2.5 py-1">
            {waiting} need a driver
          </span>
        )}
      </div>

      {loading ? (
        <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
      ) : rows.length === 0 ? (
        <p className="text-sm text-ink-500 rounded-2xl border border-dashed border-ink-200 p-6 text-center">
          No upcoming pickups for Botlify drivers.
        </p>
      ) : (
        <div className="space-y-2.5">
          {rows.map((t) => (
            <div
              key={t._id}
              className={`rounded-2xl border p-4 ${
                t.driverSnapshot?.phone
                  ? "border-ink-100 bg-white"
                  : "border-amber-200 bg-amber-50/40"
              }`}
            >
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="font-bold text-ink-900">{fmt(t.pickupAt)}</span>
                <span className="text-sm text-ink-600">
                  {t.property?.name || "Hotel"}
                  {t.property?.city ? `, ${t.property.city}` : ""}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500 mt-1">
                <span>
                  {t.direction === "dropoff" ? "Hotel → Airport" : "Airport → Hotel"}
                </span>
                <span className="font-semibold text-ink-700">{t.guestName || "Guest"}</span>
                {t.guestPhone && <span>{t.guestPhone}</span>}
                <span className="inline-flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {t.passengers}
                </span>
                {t.flightNumber && (
                  <span className="inline-flex items-center gap-1 font-mono">
                    <Plane className="w-3.5 h-3.5" />
                    {t.flightNumber}
                  </span>
                )}
              </div>
              <AssignDriver
                transfer={t}
                drivers={drivers}
                onAssign={async (driverId) => {
                  const { data } = await client.patch(
                    `/admin/transfers/${t._id}/driver`,
                    { driverId },
                  );
                  await load();
                  return data;
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
