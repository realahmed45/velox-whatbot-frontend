/**
 * Step 3 — Connect your booking channels. The headline step: this is the
 * channel-manager promise, so it leads with the OTA import and shows the
 * breadth of what Botlify distributes to.
 *
 * GET  /hotel/channex/properties  → the owner's properties on the connectivity
 *                                   partner (503 when not switched on yet)
 * POST /hotel/channex/import      → { channexPropertyId }
 */
import { useEffect, useState } from "react";
import {
  Check,
  CloudDownload,
  Globe2,
  Loader2,
  RefreshCw,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/services/api";
import WizardShell from "./WizardShell";

/* Simple, honest chips — initials on a tint. We don't ship OTA brand marks. */
const OTAS = [
  { name: "Booking.com", short: "B", tint: "bg-blue-50 text-blue-700 border-blue-100" },
  { name: "Airbnb", short: "A", tint: "bg-rose-50 text-rose-700 border-rose-100" },
  { name: "Agoda", short: "Ag", tint: "bg-indigo-50 text-indigo-700 border-indigo-100" },
  { name: "Expedia", short: "E", tint: "bg-amber-50 text-amber-700 border-amber-100" },
  { name: "Vrbo", short: "V", tint: "bg-sky-50 text-sky-700 border-sky-100" },
  { name: "Traveloka", short: "Tr", tint: "bg-cyan-50 text-cyan-700 border-cyan-100" },
  { name: "Tiket.com", short: "Ti", tint: "bg-teal-50 text-teal-700 border-teal-100" },
  { name: "Trip.com", short: "Tc", tint: "bg-violet-50 text-violet-700 border-violet-100" },
  { name: "Hostelworld", short: "Hw", tint: "bg-orange-50 text-orange-700 border-orange-100" },
  { name: "Google Hotel Ads", short: "G", tint: "bg-emerald-50 text-emerald-700 border-emerald-100" },
];

function ChannelWall() {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <Globe2 className="w-4 h-4 text-brand-500" />
        <p className="text-sm font-black text-ink-900">
          Where your rooms can sell
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {OTAS.map((o) => (
          <span
            key={o.name}
            className={`inline-flex items-center gap-2 rounded-full border pl-1.5 pr-3 py-1.5 text-xs font-semibold ${o.tint}`}
          >
            <span className="w-6 h-6 rounded-full bg-white/70 flex items-center justify-center text-[10px] font-black">
              {o.short}
            </span>
            {o.name}
          </span>
        ))}
        <span className="inline-flex items-center rounded-full border border-ink-200 bg-ink-50 px-3 py-1.5 text-xs font-semibold text-ink-500">
          and 50 more
        </span>
      </div>
    </div>
  );
}

function ValueStrip() {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-ink-900 to-ink-800 text-white p-5 sm:p-6 shadow-2xl shadow-ink-900/20">
      <div className="flex items-start gap-3">
        <span className="w-9 h-9 rounded-xl bg-brand-500/20 text-brand-300 flex items-center justify-center shrink-0">
          <Zap className="w-5 h-5" />
        </span>
        <div>
          <p className="font-black text-[15px]">
            One calendar. Sell a room anywhere, every channel updates instantly.
          </p>
          <p className="text-sm text-white/60 mt-1">
            Availability and rates stay in sync across all of them — and Botlify
            takes 0% commission on OTA bookings.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function StepChannels({ state, patch, goNext, goBack }) {
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(null); // 503 message
  const [failed, setFailed] = useState(false);
  const [list, setList] = useState([]);
  const [importing, setImporting] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setUnavailable(null);
    setFailed(false);
    api
      .get("/hotel/channex/properties")
      .then(({ data }) => {
        if (alive) setList(data.properties || []);
      })
      .catch((e) => {
        if (!alive) return;
        if (e?.response?.status === 503) {
          setUnavailable(
            e.response?.data?.message ||
              "OTA sync isn't switched on for your account yet.",
          );
        } else {
          setFailed(true);
        }
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [reloadKey]);

  const doImport = async (p) => {
    setImporting(p.channexId);
    try {
      await api.post("/hotel/channex/import", {
        channexPropertyId: p.channexId,
      });
      toast.success(`${p.name} imported with its rooms and rates`);
      patch({ channelsImported: true, channelsSkipped: false });
      setList((cur) =>
        cur.map((x) =>
          x.channexId === p.channexId ? { ...x, alreadyImported: true } : x,
        ),
      );
    } catch (e) {
      toast.error(e?.response?.data?.message || "Import failed");
    } finally {
      setImporting(null);
    }
  };

  const skip = () => {
    patch({ channelsSkipped: !state.channelsImported });
    goNext();
  };

  return (
    <WizardShell
      step={2}
      icon={CloudDownload}
      eyebrow="Step 3 of 5"
      title="Connect your booking channels"
      subtitle="Already listed on Booking.com, Airbnb or Agoda? Import your property and Botlify keeps every channel in sync from one calendar."
      onBack={goBack}
      onSkip={skip}
      skipLabel="Skip — I'll connect channels later"
      onNext={goNext}
      nextLabel="Continue"
      wide
    >
      <div className="space-y-4">
        <ValueStrip />

        <div className="rounded-2xl border border-ink-100 bg-white shadow-lg p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <p className="font-black text-ink-900">
              Import from your existing channels
            </p>
            {!loading && !unavailable && (
              <button
                type="button"
                onClick={() => setReloadKey((k) => k + 1)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500 hover:text-ink-800 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>
            )}
          </div>

          {loading ? (
            <div className="py-10 text-center">
              <Loader2 className="w-6 h-6 text-brand-500 animate-spin inline" />
              <p className="text-sm text-ink-400 mt-2">
                Looking for your properties…
              </p>
            </div>
          ) : unavailable ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
              <p className="font-bold text-amber-900">
                OTA sync isn't switched on for your account yet
              </p>
              <p className="text-sm text-amber-800 mt-1">
                {unavailable} You can add rooms manually now and connect
                channels later — bookings, the calendar and the AI concierge all
                work exactly the same in the meantime.
              </p>
            </div>
          ) : failed ? (
            <div className="rounded-xl border border-ink-100 bg-ink-50 p-5 text-center">
              <p className="text-sm font-semibold text-ink-700">
                Couldn't reach the channel manager
              </p>
              <button
                type="button"
                onClick={() => setReloadKey((k) => k + 1)}
                className="btn-secondary mt-3"
              >
                <RefreshCw className="w-4 h-4" />
                Try again
              </button>
            </div>
          ) : list.length === 0 ? (
            <div className="rounded-xl border border-ink-100 bg-ink-50 p-5 text-center">
              <p className="text-sm font-semibold text-ink-700">
                No properties found on your channel account yet
              </p>
              <p className="text-xs text-ink-500 mt-1">
                Once your OTA listings are linked they'll show up here to import
                in one click.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {list.map((p) => (
                <div
                  key={p.channexId}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-ink-100 p-4"
                >
                  <div className="flex-1 min-w-[180px]">
                    <p className="font-bold text-ink-900">{p.name}</p>
                    <p className="text-xs text-ink-500">
                      {[p.city, p.country].filter(Boolean).join(", ")}
                      {p.currency ? ` · ${p.currency}` : ""}
                    </p>
                  </div>
                  {p.alreadyImported ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5">
                      <Check className="w-3.5 h-3.5" /> Connected
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => doImport(p)}
                      disabled={!!importing}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-lg px-3.5 py-2 transition disabled:opacity-60"
                    >
                      {importing === p.channexId ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CloudDownload className="w-3.5 h-3.5" />
                      )}
                      Connect
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <ChannelWall />
      </div>
    </WizardShell>
  );
}
