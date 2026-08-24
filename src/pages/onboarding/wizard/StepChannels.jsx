/**
 * Booking-channel import — the "connect a booking channel" pane of step 1.
 * The headline path: this is the channel-manager promise, so it leads with
 * "where are you already listed?" and then offers the one-click import.
 *
 * Two different things happen on this screen, and they're deliberately kept
 * apart:
 *
 *  1. SELECTION (always available) — the hotel taps the OTAs it's listed on.
 *     This is recorded INTENT, not a connection. It personalises the Done
 *     screen and gives onboarding a target list. Persisted into the property's
 *     `description` is NOT appropriate and there's no dedicated field on the
 *     Property model for it (`channel.connectedOtas` is written by the Channex
 *     import from real connection state, so writing intent there would lie
 *     about what's actually synced — and updateProperty doesn't accept it
 *     anyway). It therefore lives in wizard state only.
 *
 *  2. IMPORT (when the connectivity partner is switched on) — the real thing.
 *     GET  /hotel/channex/properties  → the owner's properties on the partner
 *                                       (503 when not enabled yet)
 *     POST /hotel/channex/import      → { channexPropertyId }
 */
import { useEffect, useMemo, useState } from "react";
import {
  Check,
  CloudDownload,
  Loader2,
  RefreshCw,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";
import { clsx } from "clsx";
import api from "@/services/api";
import OtaLogo from "@/components/OtaLogo";
import {
  OTA_CHANNELS,
  MORE_CHANNELS_PHRASE,
  CHANNEL_TOTAL_LABEL,
} from "@/data/otaChannels";
import WizardShell from "./WizardShell";

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

/**
 * A selectable channel tile: brand mark, name, and an unmistakable selected
 * state (brand ring + filled checkmark). Big enough to hit with a thumb.
 */
function ChannelTile({ channel, selected, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      role="checkbox"
      aria-checked={selected}
      className={clsx(
        "relative flex items-center gap-3 rounded-2xl border-2 p-3 sm:p-3.5 text-left transition",
        selected
          ? "border-brand-500 bg-brand-50/70 shadow-ring"
          : "border-ink-200 bg-white hover:border-ink-300 hover:bg-ink-50",
      )}
    >
      <OtaLogo channelKey={channel.key} name={channel.name} size={38} />
      <span className="min-w-0 flex-1">
        <span
          className={clsx(
            "block font-bold text-sm truncate",
            selected ? "text-brand-700" : "text-ink-900",
          )}
        >
          {channel.name}
        </span>
      </span>
      <span
        className={clsx(
          "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition",
          selected
            ? "border-brand-500 bg-brand-500 text-white"
            : "border-ink-300 bg-white",
        )}
      >
        {selected && <Check className="w-3 h-3" strokeWidth={4} />}
      </span>
    </button>
  );
}

export default function StepChannels({ state, patch, goNext, goBack, shell = {} }) {
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(null); // 503 message
  const [failed, setFailed] = useState(false);
  const [list, setList] = useState([]);
  const [importing, setImporting] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const selected = useMemo(
    () => state.channelsSelected || [],
    [state.channelsSelected],
  );
  const allKeys = useMemo(() => OTA_CHANNELS.map((c) => c.key), []);
  const allSelected = selected.length === allKeys.length;

  const toggle = (key) =>
    patch({
      channelsSelected: selected.includes(key)
        ? selected.filter((k) => k !== key)
        : [...selected, key],
    });

  const toggleAll = () =>
    patch({ channelsSelected: allSelected ? [] : [...allKeys] });

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

  // Persist which channels the hotel says they're on. Stored as INTENT
  // (channel.requestedOtas), never as connection state — best-effort, so a
  // failure here must not trap them on this step.
  const saveAndNext = async () => {
    if (selected.length && state.propertyId) {
      try {
        await api.put(`/hotel/properties/${state.propertyId}`, {
          requestedOtas: selected,
        });
      } catch {
        /* non-fatal — they can pick channels again in Settings */
      }
    }
    goNext();
  };

  const skip = () => {
    patch({ channelsSkipped: !state.channelsImported });
    goNext();
  };

  return (
    <WizardShell
      step={0}
      icon={CloudDownload}
      eyebrow="Step 1 of 3"
      title="Where are you already listed?"
      subtitle={`Pick every channel you sell on — we'll set them up so one calendar drives all of them. ${CHANNEL_TOTAL_LABEL} channels are supported, ${MORE_CHANNELS_PHRASE}.`}
      onBack={goBack}
      onSkip={skip}
      skipLabel="Skip — I'll connect channels later"
      onNext={saveAndNext}
      nextLabel="Continue"
      wide
      {...shell}
    >
      <div className="space-y-4">
        <ValueStrip />

        {/* ── Multi-select ─────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-ink-100 bg-white shadow-lg p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="min-w-0">
              <p className="font-black text-ink-900">
                Select your booking channels
              </p>
              <p className="text-sm text-ink-500 mt-0.5">
                Choose as many as you like — most hotels are on three or four.
              </p>
            </div>
            <button
              type="button"
              onClick={toggleAll}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 underline underline-offset-2 transition shrink-0"
            >
              {allSelected ? "Clear all" : "Select all"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {OTA_CHANNELS.map((c) => (
              <ChannelTile
                key={c.key}
                channel={c}
                selected={selected.includes(c.key)}
                onToggle={() => toggle(c.key)}
              />
            ))}
          </div>

          {/* Running count — the confirmation that taps registered. */}
          <div className="mt-4 flex items-center gap-2 min-h-[1.5rem]">
            {selected.length > 0 ? (
              <>
                <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" strokeWidth={4} />
                </span>
                <p className="text-sm font-bold text-ink-800">
                  {selected.length} channel{selected.length === 1 ? "" : "s"}{" "}
                  selected
                </p>
              </>
            ) : (
              <p className="text-sm text-ink-400">
                Not listed anywhere yet? That's fine — skip this and sell direct
                from day one.
              </p>
            )}
          </div>
        </div>

        {/* ── One-click import (real connection) ───────────────────────── */}
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
                {unavailable} We've noted{" "}
                {selected.length > 0
                  ? "the channels you picked"
                  : "your setup"}{" "}
                and our team will take it from here. Bookings, the calendar and
                the AI concierge all work exactly the same in the meantime.
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
      </div>
    </WizardShell>
  );
}
