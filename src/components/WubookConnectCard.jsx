/**
 * WubookConnectCard — "Booking sites": zero-setup connection through WuBook.
 *
 *   GET  /hotel/wubook/sites        → { configured, lcode, sites: [{ ota,
 *          otaHotelId, chid, state, message, error, updatedAt }] }
 *   POST /hotel/wubook/sites        { ota, otaHotelId } → { success, site } | 4xx/503 { message }
 *   POST /hotel/wubook/sites/check  → { success, sites }   ("I've approved it")
 *   GET  /hotel/connection          → overall state / room types (summary only)
 *
 * The hotelier only types each site's hotel ID (Booking.com, Expedia) or
 * presses Connect (Airbnb, Trip.com). Botlify creates the WuBook property and
 * channel itself; the only manual step left is the one no API can skip —
 * approving the channel manager in the OTA's extranet, or the Airbnb host
 * login. The server writes that step in plain language (`message`), and we
 * show it as the single next step.
 *
 * onConfigured(boolean) tells the page whether WuBook sync is on (it hides the
 * older Zodomus card). onConnected(site) fires when a site turns live.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  ArrowRight,
  BedDouble,
  CheckCircle2,
  Clock,
  Link2,
  Loader2,
  LogIn,
  Plug,
  RefreshCw,
  Users,
} from "lucide-react";
import api from "@/services/api";
import OtaLogo from "@/components/OtaLogo";
import { PulseDot, Reveal, Spotlight } from "@/components/fx";

const POLL_MS = 20000;

const SITES = [
  { ota: "airbnb", logo: "airbnb", name: "Airbnb", needsId: false },
  {
    ota: "booking_com",
    logo: "booking",
    name: "Booking.com",
    needsId: true,
    help: "Booking.com: the number at the top of your extranet",
    placeholder: "e.g. 1234567",
  },
  {
    ota: "expedia",
    logo: "expedia",
    name: "Expedia",
    needsId: true,
    help: "Expedia: your Expedia hotel ID in Partner Central",
    placeholder: "e.g. 12345678",
  },
  { ota: "trip_com", logo: "trip", name: "Trip.com", needsId: false },
];

const NAME = Object.fromEntries(SITES.map((s) => [s.ota, s.name]));

/* Badge per server state ("off" = no site record yet). */
const BADGE = {
  off: { cls: "badge-gray", label: "Not connected" },
  starting: { cls: "badge-blue", label: "Connecting…" },
  awaiting_approval: { cls: "badge-yellow", label: "Waiting for your approval" },
  mapping: { cls: "badge-blue animate-pulse", label: "Importing rooms" },
  live: { cls: "badge-green", label: "Live" },
  needs_host_login: { cls: "badge-yellow", label: "Log in needed" },
  awaiting_team: { cls: "badge-blue", label: "Our team is connecting it" },
  error: { cls: "badge-red", label: "Needs attention" },
};

const POLL_STATES = ["starting", "awaiting_approval", "mapping"];
const ACTION_STATES = ["awaiting_approval", "needs_host_login"];

function plural(n, word) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

function errMsg(err, fallback) {
  return err?.response?.data?.message || fallback;
}

function byOta(list) {
  const map = {};
  (Array.isArray(list) ? list : []).forEach((s) => {
    if (s?.ota) map[s.ota] = s;
  });
  return map;
}

export default function WubookConnectCard({ onConfigured, onConnected }) {
  const [configured, setConfigured] = useState(null); // null = loading
  const [sites, setSites] = useState({}); // ota → site
  const [conn, setConn] = useState(null);
  const [ids, setIds] = useState({}); // ota → typed hotel ID
  const [errors, setErrors] = useState({}); // ota → inline error
  const [busy, setBusy] = useState(null); // ota being connected
  const [checking, setChecking] = useState(null); // ota whose "check now" runs
  const [retrying, setRetrying] = useState({}); // ota → show form again after error

  // Previous states, to toast on the transition to live (not on first load).
  const prevStates = useRef(null);
  const sitesRef = useRef({});
  const configuredRef = useRef(null);
  const cbRef = useRef({ onConfigured, onConnected });
  cbRef.current = { onConfigured, onConnected };

  const loadConnection = useCallback(async () => {
    try {
      const { data } = await api.get("/hotel/connection");
      setConn(data?.connection !== undefined ? data.connection : data || null);
    } catch {
      /* no connection yet — fine */
    }
  }, []);

  /* Apply a fresh list of sites; toast any site that just went live. */
  const applySites = useCallback(
    (list, { replace = true } = {}) => {
      const next = replace
        ? byOta(list)
        : { ...sitesRef.current, ...byOta(list) };
      sitesRef.current = next;
      setSites(next);

      const prev = prevStates.current;
      const states = {};
      Object.values(next).forEach((s) => (states[s.ota] = s.state));
      prevStates.current = states;
      if (!prev) return; // first load: no toasts for sites already live

      let wentLive = false;
      Object.values(next).forEach((s) => {
        if (s.state === "live" && prev[s.ota] !== "live") {
          wentLive = true;
          toast.success(
            `${NAME[s.ota] || "Your site"} is live — rooms synced and your AI is answering guests there.`,
            { id: `live-${s.ota}`, duration: 6000 },
          );
          cbRef.current.onConnected?.(s);
        }
      });
      if (wentLive) loadConnection();
    },
    [loadConnection],
  );

  const loadSites = useCallback(async () => {
    try {
      const { data } = await api.get("/hotel/wubook/sites");
      const ok = !!data?.configured;
      if (configuredRef.current !== ok) {
        configuredRef.current = ok;
        setConfigured(ok);
        cbRef.current.onConfigured?.(ok);
      }
      if (ok) applySites(data?.sites);
      return ok;
    } catch {
      // Keep what we had on a transient poll failure; only settle first load.
      if (configuredRef.current === null) {
        configuredRef.current = false;
        setConfigured(false);
        cbRef.current.onConfigured?.(false);
      }
      return false;
    }
  }, [applySites]);

  useEffect(() => {
    loadSites().then((ok) => ok && loadConnection());
  }, [loadSites, loadConnection]);

  // Auto-refresh while any site is mid-connection.
  const shouldPoll =
    configured && Object.values(sites).some((s) => POLL_STATES.includes(s.state));
  useEffect(() => {
    if (!shouldPoll) return undefined;
    const t = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      loadSites();
    }, POLL_MS);
    return () => clearInterval(t);
  }, [shouldPoll, loadSites]);

  const connect = async (site) => {
    if (busy) return;
    const otaHotelId = site.needsId ? String(ids[site.ota] || "").trim() : "";
    if (site.needsId && !/^\d+$/.test(otaHotelId)) {
      setErrors((e) => ({
        ...e,
        [site.ota]: `Enter your ${site.name} hotel ID — numbers only.`,
      }));
      return;
    }
    setBusy(site.ota);
    setErrors((e) => ({ ...e, [site.ota]: null }));
    try {
      const { data } = await api.post("/hotel/wubook/sites", {
        ota: site.ota,
        otaHotelId,
      });
      if (data && data.success === false) {
        throw Object.assign(new Error("rejected"), { response: { data } });
      }
      if (data?.site) applySites([data.site], { replace: false });
      else await loadSites();
      setRetrying((r) => ({ ...r, [site.ota]: false }));
      toast.success(`Connecting ${site.name} — one step left for you below.`);
    } catch (err) {
      const msg = errMsg(err, `We couldn't start connecting ${site.name}. Please try again.`);
      setErrors((e) => ({ ...e, [site.ota]: msg }));
      toast.error(msg);
    } finally {
      setBusy(null);
    }
  };

  const checkNow = async (ota) => {
    if (checking) return;
    setChecking(ota);
    try {
      const { data } = await api.post("/hotel/wubook/sites/check");
      if (Array.isArray(data?.sites)) applySites(data.sites);
      await loadSites();
      const s = byOta(data?.sites)[ota];
      if (s && ACTION_STATES.includes(s.state)) {
        toast(`${NAME[ota]} hasn't confirmed yet — it can take a few minutes. We'll keep checking.`);
      }
    } catch (err) {
      toast.error(errMsg(err, "We couldn't check right now. Please try again in a moment."));
    } finally {
      setChecking(null);
    }
  };

  /* ── Loading ─────────────────────────────────────────────────────────── */
  if (configured === null) {
    return (
      <div className="card mt-5 p-5 sm:p-6" aria-busy="true" aria-label="Loading booking sites">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-ink-900/[0.06] animate-pulse" />
          <div className="flex-1">
            <div className="h-4 w-48 rounded bg-ink-900/[0.06] animate-pulse" />
            <div className="mt-2 h-3 w-full max-w-md rounded bg-ink-900/[0.06] animate-pulse" />
          </div>
        </div>
        <div className="mt-5 space-y-2">
          {SITES.map((s) => (
            <div key={s.ota} className="h-16 rounded-2xl bg-ink-900/[0.06] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const liveSites = SITES.filter((s) => sites[s.ota]?.state === "live");
  const roomsCount = Array.isArray(conn?.roomTypes)
    ? conn.roomTypes.length
    : Number.isFinite(conn?.roomTypesCount)
      ? conn.roomTypesCount
      : null;

  return (
    <Reveal>
      <Spotlight className="card relative mt-5 overflow-hidden p-4 sm:p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-sunset opacity-[0.12] blur-3xl"
        />
        <div className="relative flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sunset text-white shadow-[0_8px_20px_-8px_rgba(255,61,119,0.6)]">
            <Link2 className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <h3 className="font-display text-[17px] font-semibold tracking-[-0.02em] text-ink-900">
              {liveSites.length ? "Your booking sites" : "Connect your booking sites"}
            </h3>
            <p className="mt-0.5 text-[13px] text-ink-500">
              Just enter your hotel ID — Botlify does the rest. Rooms, rates and
              availability stay in sync and your AI answers guests in each
              site's inbox.
            </p>
            {liveSites.length > 0 && (
              <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-emerald-800">
                <span className="inline-flex items-center gap-1.5">
                  <PulseDot color="bg-emerald-500" />
                  Live on {liveSites.map((s) => s.name).join(", ")}
                </span>
                {roomsCount !== null && (
                  <span className="inline-flex items-center gap-1">
                    <BedDouble className="h-3.5 w-3.5" />
                    {plural(roomsCount, "room type")} synced
                  </span>
                )}
              </p>
            )}
          </div>
        </div>

        {/* Not switched on for this account yet */}
        {!configured && (
          <div className="relative mt-4 flex gap-2.5 rounded-xl bg-amber-50/80 p-3 ring-1 ring-inset ring-amber-600/15">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
            <p className="text-[13px] text-amber-900">
              Channel sync is being switched on for your account — we'll email
              you.
            </p>
          </div>
        )}

        <ul className="relative mt-5 space-y-2.5" aria-label="Booking sites">
          {SITES.map((s) => (
            <SiteRow
              key={s.ota}
              site={s}
              data={sites[s.ota]}
              configured={configured}
              value={ids[s.ota] ?? sites[s.ota]?.otaHotelId ?? ""}
              onChange={(v) => {
                setIds((cur) => ({ ...cur, [s.ota]: v }));
                if (errors[s.ota]) setErrors((e) => ({ ...e, [s.ota]: null }));
              }}
              error={errors[s.ota]}
              busy={busy === s.ota}
              anyBusy={!!busy}
              checking={checking === s.ota}
              anyChecking={!!checking}
              retrying={!!retrying[s.ota]}
              onRetry={() => setRetrying((r) => ({ ...r, [s.ota]: true }))}
              onConnect={() => connect(s)}
              onCheck={() => checkNow(s.ota)}
            />
          ))}
        </ul>
      </Spotlight>
    </Reveal>
  );
}

function SiteRow({
  site,
  data,
  configured,
  value,
  onChange,
  error,
  busy,
  anyBusy,
  checking,
  anyChecking,
  retrying,
  onRetry,
  onConnect,
  onCheck,
}) {
  const state = data?.state && BADGE[data.state] ? data.state : "off";
  const badge = BADGE[state];
  const showForm = configured && (state === "off" || (state === "error" && retrying));
  const inputId = `ota-id-${site.ota}`;
  const helpId = `${inputId}-help`;
  const errId = `${inputId}-err`;
  const message = data?.message || data?.error;

  return (
    <li className="rounded-2xl bg-white/60 p-3 ring-1 ring-ink-900/[0.06] shadow-[inset_0_1px_0_#fff] sm:p-3.5">
      <div className="flex items-center gap-3">
        <OtaLogo channelKey={site.logo} name={site.name} size={36} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold text-ink-900">{site.name}</p>
          <span
            className={`${badge.cls} mt-0.5 inline-flex items-center gap-1 text-[11px]`}
            aria-live="polite"
          >
            {state === "live" && <PulseDot color="bg-emerald-500" />}
            {state === "awaiting_approval" && <Clock className="h-3 w-3" aria-hidden />}
            {state === "needs_host_login" && <LogIn className="h-3 w-3" aria-hidden />}
            {state === "awaiting_team" && <Users className="h-3 w-3" aria-hidden />}
            {state === "starting" && <Loader2 className="h-3 w-3 animate-spin" aria-hidden />}
            {state === "error" && <AlertTriangle className="h-3 w-3" aria-hidden />}
            {badge.label}
          </span>
        </div>
        {data?.otaHotelId && state !== "off" && (
          <span className="hidden shrink-0 font-mono text-[11px] text-ink-400 sm:inline">
            #{data.otaHotelId}
          </span>
        )}
        {/* Airbnb / Trip.com: one button, no fields */}
        {showForm && !site.needsId && (
          <ConnectButton busy={busy} disabled={anyBusy} onClick={onConnect} name={site.name} />
        )}
      </div>

      {/* Booking.com / Expedia: hotel ID */}
      {showForm && site.needsId && (
        <form
          className="mt-3"
          onSubmit={(e) => {
            e.preventDefault();
            onConnect();
          }}
        >
          <label htmlFor={inputId} className="label">
            Hotel ID
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id={inputId}
              className="input font-mono sm:flex-1"
              placeholder={site.placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
              autoComplete="off"
              inputMode="numeric"
              pattern="[0-9]*"
              aria-invalid={!!error}
              aria-describedby={error ? `${errId} ${helpId}` : helpId}
            />
            <ConnectButton
              busy={busy}
              disabled={anyBusy || !String(value).trim()}
              submit
              name={site.name}
            />
          </div>
          <p id={helpId} className="mt-1.5 text-xs text-ink-500">
            {site.help}
          </p>
        </form>
      )}

      {error && (
        <p id={errId} role="alert" className="mt-2 text-xs text-rose-600">
          {error}
        </p>
      )}

      {/* The one step only the hotel can do */}
      {configured && ACTION_STATES.includes(state) && (
        <div className="mt-3 rounded-xl bg-amber-50/80 p-3 ring-1 ring-inset ring-amber-600/20 sm:p-3.5">
          <div className="flex gap-3">
            <span
              aria-hidden
              className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-amber-500 text-[12px] font-bold text-white"
            >
              1
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                1 click left
              </p>
              <p className="mt-0.5 whitespace-pre-line break-words text-[13px] leading-relaxed text-amber-950">
                {message ||
                  (state === "needs_host_login"
                    ? `Log in to ${site.name} once to let Botlify connect.`
                    : `Approve Botlify (via WuBook) as your channel manager in your ${site.name} extranet.`)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCheck}
            disabled={anyChecking}
            className="btn-secondary group mt-3 min-h-[44px] w-full justify-center text-sm disabled:opacity-60 sm:w-auto"
          >
            {checking ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <RefreshCw
                className="h-4 w-4 transition-transform duration-500 ease-spring group-hover:rotate-[-60deg]"
                aria-hidden
              />
            )}
            {checking
              ? "Checking…"
              : state === "needs_host_login"
                ? "I've logged in — check now"
                : "I've approved it — check now"}
          </button>
        </div>
      )}

      {/* In progress / with our team / live: server's message, quietly */}
      {configured && ["starting", "mapping", "awaiting_team", "live"].includes(state) && message && (
        <p className="mt-2 flex gap-1.5 text-xs text-ink-500">
          {state === "live" && (
            <CheckCircle2 className="mt-px h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden />
          )}
          <span className="break-words">{message}</span>
        </p>
      )}

      {/* Error: what went wrong + try again */}
      {configured && state === "error" && !retrying && (
        <div className="mt-3 flex flex-col gap-2 rounded-xl bg-rose-50/80 p-3 ring-1 ring-inset ring-rose-600/15 sm:flex-row sm:items-center sm:justify-between">
          <p className="break-words text-[13px] text-rose-900">
            {message || `Something went wrong connecting ${site.name}.`}
          </p>
          <button
            type="button"
            onClick={site.needsId ? onRetry : onConnect}
            disabled={anyBusy}
            className="btn-secondary min-h-[44px] shrink-0 justify-center text-sm disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <RefreshCw className="h-4 w-4" aria-hidden />}
            Try again
          </button>
        </div>
      )}
    </li>
  );
}

function ConnectButton({ busy, disabled, onClick, submit = false, name }) {
  return (
    <button
      type={submit ? "submit" : "button"}
      onClick={onClick}
      disabled={disabled}
      aria-label={`Connect ${name}`}
      className="btn-primary group min-h-[44px] shrink-0 justify-center disabled:pointer-events-none disabled:opacity-50"
    >
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : (
        <Plug
          className="h-4 w-4 transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-12deg]"
          aria-hidden
        />
      )}
      Connect
      {!busy && (
        <ArrowRight
          className="hidden h-4 w-4 transition-transform duration-500 ease-spring group-hover:translate-x-0.5 sm:block"
          aria-hidden
        />
      )}
    </button>
  );
}
