/**
 * The driver's job page — what opens when a driver taps their link.
 *
 * No login: the token in the URL is the credential. This is deliberate. A
 * driver is not a Botlify user, will often be on a cheap phone with patchy
 * signal, and needs to answer in one tap while a guest waits. Making them
 * install something or remember a password would lose us drivers, and a job
 * nobody accepts is a guest standing at an airport.
 *
 * So: big type, two buttons, no chrome. The guest's number only appears after
 * the driver accepts — before that there is nothing to leak.
 */
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Car,
  Check,
  Clock,
  Loader2,
  Phone,
  Plane,
  Users,
  X,
} from "lucide-react";

// A plain axios client — the driver has no session, and the app's shared
// instance attaches auth headers this page must not send.
const API =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
  "https://velox-whatbot-backend.onrender.com/api";

function whenLabel(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Minutes left to answer, or null once it has lapsed. */
function minutesLeft(expiresAt) {
  if (!expiresAt) return null;
  const ms = new Date(expiresAt).getTime() - Date.now();
  return ms > 0 ? Math.ceil(ms / 60000) : null;
}

export default function DriverPage() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const { data: res } = await axios.get(`${API}/drive/${token}`);
      setData(res);
      setError("");
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          "This link isn't working. Ask the hotel for a new one.",
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
    // A job can be taken by someone else, or time out, while this sits open on
    // a dashboard mount. Re-read so the driver isn't tapping a dead offer.
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  const respond = async (transferId, action) => {
    setBusy(transferId + action);
    try {
      const { data: res } = await axios.post(
        `${API}/drive/${token}/${transferId}/${action}`,
      );
      if (action === "accept") {
        toast.success("Job accepted — the guest has your number.");
        if (res.guestPhone) {
          toast(`Guest: ${res.guestPhone}`, { icon: "📞", duration: 8000 });
        }
      } else {
        toast("Passed on — we'll offer it to someone else.", { icon: "👍" });
      }
      await load();
    } catch (e) {
      toast.error(
        e?.response?.data?.message || "Couldn't save that. Try again.",
      );
      await load();
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-50">
        <Loader2 className="w-7 h-7 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-50 p-6">
        <div className="max-w-sm text-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
            <X className="w-6 h-6" />
          </div>
          <p className="font-black text-ink-900 text-lg">Link not working</p>
          <p className="text-sm text-ink-500 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const { driver, offers = [], assigned = [] } = data || {};

  return (
    <div className="min-h-screen bg-ink-50 pb-16">
      <div className="max-w-lg mx-auto px-4 pt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-brand-500 text-white flex items-center justify-center">
            <Car className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="font-black text-ink-900 text-lg leading-tight">
              Hi {driver?.displayName || driver?.name}
            </p>
            {driver?.vehicleLabel && (
              <p className="text-xs text-ink-500">{driver.vehicleLabel}</p>
            )}
          </div>
        </div>

        {/* Offers first — these are the ones on a clock. */}
        {offers.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-black uppercase tracking-wide text-ink-400 mb-2.5">
              New {offers.length === 1 ? "job" : "jobs"}
            </h2>
            <div className="space-y-3">
              {offers.map((t) => {
                const left = minutesLeft(t.expiresAt);
                return (
                  <div
                    key={t.id}
                    className="rounded-2xl border-2 border-brand-200 bg-white p-4 shadow-sm"
                  >
                    <JobFacts t={t} />
                    {left !== null && (
                      <p className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-amber-700">
                        <Clock className="w-3.5 h-3.5" />
                        {left} min to answer
                      </p>
                    )}
                    <div className="grid grid-cols-2 gap-2.5 mt-4">
                      <button
                        onClick={() => respond(t.id, "accept")}
                        disabled={!!busy}
                        className="inline-flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl px-4 py-3.5 transition disabled:opacity-60"
                      >
                        {busy === t.id + "accept" ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Check className="w-5 h-5" />
                        )}
                        Accept
                      </button>
                      <button
                        onClick={() => respond(t.id, "decline")}
                        disabled={!!busy}
                        className="inline-flex items-center justify-center gap-1.5 border border-ink-200 text-ink-700 font-bold rounded-xl px-4 py-3.5 hover:bg-ink-50 transition disabled:opacity-60"
                      >
                        <X className="w-5 h-5" />
                        Pass
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xs font-black uppercase tracking-wide text-ink-400 mb-2.5">
            Your pickups
          </h2>
          {assigned.length === 0 ? (
            <div className="rounded-2xl border border-ink-100 bg-white p-6 text-center">
              <p className="text-sm text-ink-500">
                {offers.length
                  ? "Accept a job above and it'll show here."
                  : "Nothing right now. We'll message you when a pickup comes in."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {assigned.map((t) => (
                <div
                  key={t.id}
                  className="rounded-2xl border border-ink-100 bg-white p-4"
                >
                  <JobFacts t={t} />
                  {t.guestPhone && (
                    <a
                      href={`https://wa.me/${String(t.guestPhone).replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl px-4 py-2.5 transition"
                    >
                      <Phone className="w-4 h-4" />
                      Message {t.guestName || "guest"}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/** The facts of a job, in the order a driver actually needs them. */
function JobFacts({ t }) {
  return (
    <div>
      <p className="font-black text-ink-900 text-[17px] leading-tight">
        {whenLabel(t.pickupAt)}
      </p>
      <p className="text-sm text-ink-600 mt-0.5">
        {t.direction === "pickup"
          ? `Airport${t.airportCode ? ` (${t.airportCode})` : ""} → hotel`
          : `Hotel → airport${t.airportCode ? ` (${t.airportCode})` : ""}`}
      </p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-ink-500">
        {t.guestName && <span className="font-semibold">{t.guestName}</span>}
        <span className="inline-flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          {t.passengers}
        </span>
        {t.flightNumber && (
          <span className="inline-flex items-center gap-1">
            <Plane className="w-3.5 h-3.5" />
            {t.flightNumber}
          </span>
        )}
      </div>
      {t.notes && <p className="text-xs text-ink-400 mt-1.5">{t.notes}</p>}
    </div>
  );
}
