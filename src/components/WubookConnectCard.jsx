/**
 * WubookConnectCard — the booking-sites connection, through WuBook (WooDoo).
 *
 *   GET  /hotel/wubook/status → { configured }
 *   POST /hotel/wubook/import { lcode }
 *        → { success, property, roomTypes: [{_id,name,unitsCount}],
 *            channels: [{ channelId, ota, name }] } | 4xx { message }
 *   GET  /hotel/connection → { connection: { provider, state, message,
 *          otaStatus: [{ota,status,message}], connectedOtas, requestedOtas,
 *          providerPropertyId?, ... } }
 *
 * Botlify's team creates the hotel's WooDoo property and links their sites;
 * the hotel (or our team) pastes the WuBook property code ("lcode") here and
 * rooms + linked sites are imported. When the server isn't configured for
 * WuBook yet, the card says so and shows no form.
 *
 * onConfigured(boolean) tells the page whether WuBook is live, so it can hide
 * the older Zodomus card. onConnected(data) fires after a successful import.
 */
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  ArrowRight,
  BedDouble,
  Clock,
  Loader2,
  Plug,
  RefreshCw,
  Link2,
} from "lucide-react";
import api from "@/services/api";
import OtaLogo from "@/components/OtaLogo";
import { PulseDot, Reveal, Spotlight } from "@/components/fx";

const spring = { type: "spring", stiffness: 420, damping: 30 };

const SITES = [
  { ota: "airbnb", logo: "airbnb", name: "Airbnb" },
  { ota: "booking_com", logo: "booking", name: "Booking.com" },
  { ota: "expedia", logo: "expedia", name: "Expedia" },
  { ota: "trip_com", logo: "trip", name: "Trip.com" },
];

/* "booking_com", "Booking.com", "booking" → "bookingcom" — one key per site. */
function normOta(key) {
  const k = String(key || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  if (k === "booking") return "bookingcom";
  if (k === "trip" || k === "ctrip") return "tripcom";
  return k;
}

const LIVE = ["connected", "live", "active", "ok", "synced", "mapped"];
const BAD = ["error", "failed", "rejected", "disconnected"];

/** live | pending | error | off for one site, from the connection payload. */
function siteState(conn, ota) {
  if (!conn) return { state: "off" };
  const key = normOta(ota);
  const entry = (Array.isArray(conn.otaStatus) ? conn.otaStatus : []).find(
    (o) => normOta(o?.ota) === key,
  );
  if (entry) {
    const s = String(entry.status || "").toLowerCase();
    if (LIVE.includes(s)) return { state: "live" };
    if (BAD.includes(s)) return { state: "error", message: entry.message };
    if (s && s !== "not_connected" && s !== "none")
      return { state: "pending", message: entry.message };
  }
  const has = (list) =>
    (Array.isArray(list) ? list : []).some(
      (o) => normOta(typeof o === "string" ? o : o?.ota) === key,
    );
  if (has(conn.connectedOtas)) return { state: "live" };
  if (has(conn.requestedOtas)) return { state: "pending" };
  return { state: "off" };
}

const BADGE = {
  live: { cls: "badge-green", label: "Live" },
  pending: { cls: "badge-yellow", label: "Pending" },
  error: { cls: "badge-red", label: "Needs attention" },
  off: { cls: "badge-gray", label: "Not connected" },
};

function plural(n, word) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

export default function WubookConnectCard({ onConfigured, onConnected }) {
  const [configured, setConfigured] = useState(null); // null = loading
  const [conn, setConn] = useState(null);
  const [lcode, setLcode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  // Last import result — fills in names/counts the connection may not carry.
  const [imported, setImported] = useState(null);

  const loadConnection = useCallback(async () => {
    try {
      const { data } = await api.get("/hotel/connection");
      setConn(data?.connection !== undefined ? data.connection : data || null);
    } catch {
      /* no connection yet — the form is the right thing to show */
    }
  }, []);

  useEffect(() => {
    let alive = true;
    api
      .get("/hotel/wubook/status")
      .then(({ data }) => {
        if (!alive) return;
        const ok = !!data?.configured;
        setConfigured(ok);
        onConfigured?.(ok);
        if (ok) loadConnection();
      })
      .catch(() => {
        if (!alive) return;
        setConfigured(false);
        onConfigured?.(false);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadConnection]);

  const isWubook = conn?.provider === "wubook";
  const storedCode = isWubook ? conn?.providerPropertyId : null;

  const runImport = async (code) => {
    const clean = String(code ?? "").trim();
    if (!/^\d+$/.test(clean)) {
      setError("The WuBook property code is a number, e.g. 1712345678.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const { data } = await api.post("/hotel/wubook/import", {
        lcode: Number(clean),
      });
      if (data && data.success === false) {
        throw Object.assign(new Error("rejected"), { response: { data } });
      }
      const rooms = Array.isArray(data?.roomTypes) ? data.roomTypes.length : 0;
      const sites = Array.isArray(data?.channels) ? data.channels.length : 0;
      toast.success(
        `Connected — ${plural(rooms, "room")} imported, ${plural(sites, "booking site")} linked`,
      );
      setImported(data || null);
      setLcode("");
      await loadConnection();
      onConnected?.(data);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "We couldn't connect that property. Check the code and try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    if (submitting) return;
    runImport(lcode);
  };

  /* ── Loading ─────────────────────────────────────────────────────────── */
  if (configured === null) {
    return (
      <div className="card mt-5 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-ink-900/[0.06] animate-pulse" />
          <div className="flex-1">
            <div className="h-4 w-48 rounded bg-ink-900/[0.06] animate-pulse" />
            <div className="mt-2 h-3 w-full max-w-md rounded bg-ink-900/[0.06] animate-pulse" />
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SITES.map((s) => (
            <div
              key={s.ota}
              className="h-16 rounded-2xl bg-ink-900/[0.06] animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // Names and counts for the connected summary.
  const propertyName =
    conn?.propertyName ||
    conn?.property?.name ||
    imported?.property?.name ||
    (typeof imported?.property === "string" ? imported.property : null);
  const roomsCount = Array.isArray(imported?.roomTypes)
    ? imported.roomTypes.length
    : Array.isArray(conn?.roomTypes)
      ? conn.roomTypes.length
      : Number.isFinite(conn?.roomTypesCount)
        ? conn.roomTypesCount
        : null;
  const states = SITES.map((s) => ({ ...s, ...siteState(conn, s.ota) }));
  const linked = states.filter((s) => s.state === "live");

  return (
    <Reveal>
      <Spotlight className="card relative mt-5 overflow-hidden p-5 sm:p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-sunset opacity-[0.12] blur-3xl"
        />
        <div className="relative flex items-start gap-3">
          <div className="group grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sunset text-white shadow-[0_8px_20px_-8px_rgba(255,61,119,0.6)]">
            <Link2 className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <h3 className="font-display text-[17px] font-semibold tracking-[-0.02em] text-ink-900">
              {isWubook ? "Your booking sites are connected" : "Connect your booking sites"}
            </h3>
            <p className="mt-0.5 text-[13px] text-ink-500">
              Connect Airbnb, Booking.com, Expedia and Trip.com once — rooms,
              rates and availability stay in sync and your AI answers guests in
              each site's inbox.
            </p>
          </div>
        </div>

        {/* The four sites with their live state */}
        <ul className="relative mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {states.map((s) => {
            const b = BADGE[s.state];
            return (
              <li
                key={s.ota}
                title={s.message || undefined}
                className="flex min-w-0 items-center gap-2.5 rounded-2xl bg-white/60 p-2.5 ring-1 ring-ink-900/[0.06] shadow-[inset_0_1px_0_#fff]"
              >
                <OtaLogo channelKey={s.logo} name={s.name} size={32} />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-ink-900">
                    {s.name}
                  </p>
                  <span
                    className={`${b.cls} mt-0.5 inline-flex items-center gap-1 text-[10.5px]`}
                  >
                    {s.state === "live" && <PulseDot color="bg-emerald-500" />}
                    {s.state === "pending" && <Clock className="h-2.5 w-2.5" />}
                    {b.label}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Not switched on for this account yet */}
        {!configured && (
          <div className="relative mt-4 flex gap-2.5 rounded-xl bg-amber-50/80 p-3 ring-1 ring-inset ring-amber-600/15">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-[13px] text-amber-900">
              Channel sync is being switched on for your account — we'll email
              you.
            </p>
          </div>
        )}

        {/* Connected summary */}
        {configured && isWubook && (
          <div className="relative mt-4 rounded-2xl bg-emerald-50/70 p-4 ring-1 ring-emerald-500/20">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-[13px] font-semibold text-emerald-900">
                  <PulseDot color="bg-emerald-500" />
                  <span className="truncate">
                    {propertyName || "WuBook property"}
                  </span>
                  {storedCode && (
                    <span className="font-mono text-[11px] font-normal text-emerald-800/70">
                      #{storedCode}
                    </span>
                  )}
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-emerald-800">
                  {roomsCount !== null && (
                    <span className="inline-flex items-center gap-1">
                      <BedDouble className="h-3.5 w-3.5" />
                      {plural(roomsCount, "room type")}
                    </span>
                  )}
                  <span>
                    {linked.length
                      ? `Linked: ${linked.map((s) => s.name).join(", ")}`
                      : "Sites are being linked — this can take a little while"}
                  </span>
                </p>
                {conn?.message && conn?.state && conn.state !== "connected" && (
                  <p className="mt-1 text-xs text-ink-500">{conn.message}</p>
                )}
              </div>
              {storedCode && (
                <button
                  type="button"
                  onClick={() => runImport(storedCode)}
                  disabled={submitting}
                  className="btn-secondary group min-h-[44px] shrink-0 text-sm disabled:opacity-60"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 transition-transform duration-500 ease-spring group-hover:rotate-[-60deg]" />
                  )}
                  Re-sync rooms
                </button>
              )}
            </div>
          </div>
        )}

        {/* Connect form */}
        {configured && !isWubook && (
          <form onSubmit={submit} className="relative mt-4">
            <label htmlFor="wubook-lcode" className="label">
              WuBook property code
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id="wubook-lcode"
                className="input font-mono sm:flex-1"
                placeholder="e.g. 1712345678"
                value={lcode}
                onChange={(e) => {
                  setLcode(e.target.value.replace(/\D/g, ""));
                  if (error) setError(null);
                }}
                autoComplete="off"
                inputMode="numeric"
                aria-invalid={!!error}
                aria-describedby="wubook-lcode-help"
              />
              <button
                type="submit"
                disabled={submitting || !lcode.trim()}
                className="btn-primary group min-h-[44px] justify-center disabled:pointer-events-none disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plug className="h-4 w-4 transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-12deg]" />
                )}
                Connect
                {!submitting && (
                  <ArrowRight className="h-4 w-4 transition-transform duration-500 ease-spring group-hover:translate-x-0.5" />
                )}
              </button>
            </div>
            <AnimatePresence initial={false}>
              {error ? (
                <motion.p
                  key="err"
                  role="alert"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={spring}
                  className="mt-2 text-xs text-rose-600"
                >
                  {error}
                </motion.p>
              ) : (
                <p key="help" id="wubook-lcode-help" className="mt-2 text-xs text-ink-500">
                  Our team sets up your property in WuBook and links your sites,
                  then sends you this code — paste it here, or we'll do it for
                  you.
                </p>
              )}
            </AnimatePresence>
          </form>
        )}
      </Spotlight>
    </Reveal>
  );
}
