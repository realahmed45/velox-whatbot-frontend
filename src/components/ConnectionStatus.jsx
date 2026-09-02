/**
 * ConnectionStatus — the honest story of the hotel's OTA connection.
 *
 * This card exists because of one uncomfortable truth we refuse to hide: when
 * a hotel hands rate and availability control to ANY channel manager,
 * Booking.com runs its own approval from the hotel's extranet. Every competitor
 * has this wait. We can't remove it — so the job here is to make sure the
 * hotelier is never blocked by it and never confused about it.
 *
 * Three rules the copy follows:
 *   1. Never claim a channel is syncing when it isn't. "Live" appears only
 *      when the backend saw a real connected channel from the provider.
 *   2. Never present the approval wait as a failure. It's a background item
 *      with a plain explanation, always paired with what IS already working
 *      ("your AI is already taking bookings").
 *   3. Blockers are framed as protection, not as errors — we're holding the
 *      switch-over so a live listing can't break, and every blocker is a
 *      sentence with a link that fixes it.
 *
 * Polls while the state is transitional (importing / awaiting approval) and
 * stops as soon as it settles on live or error, so an idle dashboard isn't
 * making requests forever.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CloudDownload,
  Clock,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Wifi,
} from "lucide-react";
import { clsx } from "clsx";
import toast from "react-hot-toast";
import api from "@/services/api";

/** How often to re-ask while something is still moving. */
const POLL_MS = 20000;

/** States still in motion — the only ones worth polling. */
const TRANSITIONAL = ["importing", "awaiting_ota_approval"];

/** "booking_com" → "Booking.com" */
const prettyOta = (key = "") => {
  const map = {
    booking_com: "Booking.com",
    airbnb: "Airbnb",
    agoda: "Agoda",
    expedia: "Expedia",
    traveloka: "Traveloka",
    hostelworld: "Hostelworld",
    vrbo: "Vrbo",
    tripadvisor: "Tripadvisor",
  };
  return (
    map[key] ||
    String(key)
      .replace(/[_-]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
};

const joinNames = (names = []) => {
  const list = names.filter(Boolean);
  if (list.length <= 1) return list[0] || "";
  return `${list.slice(0, -1).join(", ")} and ${list[list.length - 1]}`;
};

/**
 * How each state presents itself. Kept as one table so the tone stays
 * consistent and nothing can accidentally imply a sync that doesn't exist.
 */
function present(conn) {
  const state = conn?.state || "not_started";
  const liveOtas = (conn?.otaStatus || [])
    .filter((o) => o.status === "live")
    .map((o) => prettyOta(o.ota));
  const pendingOtas = (conn?.otaStatus || [])
    .filter((o) => o.status === "pending")
    .map((o) => prettyOta(o.ota));

  switch (state) {
    case "importing":
      return {
        icon: Loader2,
        spin: true,
        tone: "brand",
        title: "Importing your hotel…",
        body: "Pulling your rooms, photos and occupancy across. This takes a few seconds.",
      };
    case "imported":
      return {
        icon: CloudDownload,
        tone: "brand",
        title: conn?.roomCount
          ? `Imported — ${conn.roomCount} room${conn.roomCount === 1 ? "" : "s"}`
          : "Imported",
        body:
          conn?.message ||
          "Your rooms are set up and your AI can already take bookings.",
      };
    case "awaiting_ota_approval":
      return {
        icon: Clock,
        tone: "amber",
        title: pendingOtas.length
          ? `Waiting for ${joinNames(pendingOtas)} to approve`
          : "Waiting for your channel to approve",
        body:
          "Approve the connection from your own extranet and it goes live in " +
          "minutes — the OTA only accepts that from you, which is why every " +
          "channel manager has this step. Nothing is on hold meanwhile: your AI " +
          "is already taking bookings and your calendar is live.",
      };
    case "live":
      return {
        icon: Wifi,
        tone: "emerald",
        title: liveOtas.length
          ? `Live — syncing with ${joinNames(liveOtas)}`
          : "Live — your channels are syncing",
        body:
          "Rates and availability travel both ways automatically. A booking on any " +
          "channel closes the room everywhere else.",
      };
    case "error":
      return {
        icon: AlertTriangle,
        tone: "rose",
        title: "We couldn't reach your channel manager",
        body:
          conn?.message ||
          "We'll keep trying in the background. Nothing you've set up is affected.",
      };
    default:
      return {
        icon: CloudDownload,
        tone: "ink",
        title: "No booking channel connected",
        body:
          "Your AI takes direct bookings right now. Connect Booking.com or Airbnb " +
          "whenever you're ready and one calendar will drive all of them.",
      };
  }
}

const TONES = {
  brand: { chip: "bg-brand-50 text-brand-600", ring: "border-brand-200" },
  emerald: { chip: "bg-emerald-50 text-emerald-600", ring: "border-emerald-200" },
  amber: { chip: "bg-amber-50 text-amber-600", ring: "border-amber-200" },
  rose: { chip: "bg-rose-50 text-rose-600", ring: "border-rose-200" },
  ink: { chip: "bg-ink-100 text-ink-500", ring: "border-ink-100" },
};

/** One OTA's real status — never a blanket badge over channels we can't see. */
function OtaRow({ entry }) {
  const live = entry.status === "live";
  const failed = entry.status === "error";
  return (
    <li className="flex items-center justify-between gap-3 py-2">
      <span className="text-sm font-semibold text-ink-800 truncate">
        {prettyOta(entry.ota)}
      </span>
      <span
        className={clsx(
          "inline-flex items-center gap-1.5 text-[11px] font-bold rounded-full px-2.5 py-1 shrink-0",
          live && "bg-emerald-50 text-emerald-700",
          failed && "bg-rose-50 text-rose-700",
          !live && !failed && "bg-amber-50 text-amber-700",
        )}
      >
        {live ? (
          <>
            <CheckCircle2 className="w-3 h-3" /> Syncing
          </>
        ) : failed ? (
          <>
            <AlertTriangle className="w-3 h-3" /> Needs attention
          </>
        ) : (
          <>
            <Clock className="w-3 h-3" /> Pending approval
          </>
        )}
      </span>
    </li>
  );
}

/**
 * The blockers panel. Deliberately NOT styled as an error: nothing is broken,
 * we are protecting a live listing from a bad push. That framing is the whole
 * point — a hotelier who reads this should feel looked after, not told off.
 */
function Blockers({ blockers, fixHref }) {
  if (!blockers?.length) return null;
  return (
    <div className="mt-4 rounded-xl border border-ink-200 bg-ink-50/70 p-4">
      <p className="flex items-center gap-1.5 text-sm font-bold text-ink-900">
        <ShieldCheck className="w-4 h-4 text-brand-500 shrink-0" />
        We're holding the switch-over until these are set
      </p>
      <p className="text-xs text-ink-500 mt-1">
        Your live listing keeps selling exactly as it does now. We won't hand
        your rates to the channels until they're right — that way nothing can
        break on Booking.com.
      </p>
      <ul className="mt-3 space-y-1.5">
        {blockers.map((b) => (
          <li key={b}>
            <Link
              to={fixHref}
              className="group flex items-start gap-2 text-sm text-ink-700 hover:text-brand-700 transition"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0 mt-[7px]" />
              <span className="underline decoration-ink-300 underline-offset-2 group-hover:decoration-brand-400">
                {b}
              </span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * @param {string}  [propertyId]  scope to one property (defaults to the first)
 * @param {boolean} [compact]     tighter styling for the Today screen
 * @param {string}  [fixHref]     where a blocker's fix-it link goes
 * @param {boolean} [hideWhenIdle] don't render at all when nothing is connected
 *                                 and nothing is wrong (keeps Today calm)
 */
export default function ConnectionStatus({
  propertyId,
  compact = false,
  fixHref = "/dashboard/property",
  hideWhenIdle = false,
}) {
  const [conn, setConn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const timer = useRef(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/hotel/connection", {
        params: propertyId ? { propertyId } : undefined,
      });
      if (mounted.current) setConn(data.connection || null);
      return data.connection;
    } catch {
      // Silent: a status card that shouts about its own fetch failure is worse
      // than one that simply doesn't appear.
      return null;
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    let alive = true;
    // Cleared by the cleanup below AND checked before every state write, so a
    // fetch still in flight when propertyId changes can't start a second
    // interval or overwrite the newer one.
    const stop = () => {
      if (timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
    };

    load().then((c) => {
      if (!alive) return;
      // Poll only while something is actually moving — a settled connection
      // makes no requests at all.
      if (c && TRANSITIONAL.includes(c.state)) {
        stop();
        timer.current = setInterval(async () => {
          const next = await load();
          if (!alive) return;
          if (next && !TRANSITIONAL.includes(next.state)) stop();
        }, POLL_MS);
      }
    });

    return () => {
      alive = false;
      stop();
    };
  }, [load]);

  /** Owner-triggered "check again" — hits the provider, not just our cache. */
  const refresh = async () => {
    setRefreshing(true);
    try {
      const { data } = await api.post("/hotel/connection/refresh", {
        ...(propertyId ? { propertyId } : {}),
      });
      setConn(data.connection || null);
      toast.success("Checked — this is the latest from your channel manager");
    } catch (e) {
      toast.error(
        e?.response?.data?.message || "Couldn't check right now — try again shortly",
      );
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-ink-100 bg-white p-5 animate-pulse">
        <div className="h-4 w-40 bg-ink-100 rounded" />
        <div className="h-3 w-full bg-ink-50 rounded mt-3" />
      </div>
    );
  }

  if (!conn) return null;

  const idle = conn.state === "not_started" && !conn.blockers?.length;
  if (hideWhenIdle && idle) return null;

  const view = present(conn);
  const tone = TONES[view.tone] || TONES.ink;
  const Icon = view.icon;
  const otaRows = (conn.otaStatus || []).filter((o) => o.ota);

  return (
    <div
      className={clsx(
        "rounded-2xl border bg-white shadow-card",
        tone.ring,
        compact ? "p-4 sm:p-5" : "p-5 sm:p-6",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={clsx(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
            tone.chip,
          )}
        >
          <Icon className={clsx("w-5 h-5", view.spin && "animate-spin")} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="font-bold text-ink-900 leading-tight">{view.title}</p>
            {conn.providerConfigured && (
              <button
                type="button"
                onClick={refresh}
                disabled={refreshing}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500 hover:text-ink-800 transition disabled:opacity-50 shrink-0"
              >
                <RefreshCw
                  className={clsx("w-3.5 h-3.5", refreshing && "animate-spin")}
                />
                Check again
              </button>
            )}
          </div>
          <p className="text-sm text-ink-500 mt-1 leading-snug">{view.body}</p>

          {/* Per-channel truth. Only rendered when we actually know something
              about a named channel — an empty list says nothing rather than
              implying everything is fine. */}
          {otaRows.length > 0 && (
            <ul className="mt-3 divide-y divide-ink-100 border-t border-ink-100">
              {otaRows.map((o) => (
                <OtaRow key={o.ota} entry={o} />
              ))}
            </ul>
          )}

          <Blockers blockers={conn.blockers} fixHref={fixHref} />

          {/* Reassurance that the thing they actually bought is working, shown
              exactly when the OTA side isn't finished yet. */}
          {(conn.state === "awaiting_ota_approval" ||
            conn.state === "imported") && (
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Your AI concierge is live and taking bookings right now
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
