/**
 * Step 1 — "Bring your hotel across."
 *
 * Import-first, deliberately. The old screen offered a 50/50 fork ("connect a
 * channel" vs "type it in") and made the hotelier choose before they knew
 * anything. The promise we're building is simpler than that:
 *
 *     enter your hotel ID → confirm what we imported → your AI is live.
 *
 * So the primary path leads: one input for the hotel ID, or a picker when the
 * provider hands us a list. Manual setup is still there — one clear secondary
 * link — because a brand-new property genuinely has nothing to import.
 *
 * The panes:
 *   CHOOSE  → the import screen (hotel ID input + picker + manual escape hatch)
 *   REVIEW  → "here's what came across, is this right?" — rooms with units and
 *             rates, blockers editable INLINE. The confirm moment.
 *   ROOMS   → the full room editor (manual path, or "add more" from review)
 *   MANUAL_PROPERTY → the by-hand property form
 *
 * What this screen must never do is block anyone on OTA approval. The import
 * gets their content in; the approval runs in the background and is narrated
 * by ConnectionStatus, not gated here.
 */
import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  CloudDownload,
  Loader2,
  PencilLine,
  Search,
  ShieldCheck,
  Sparkles,
  Ticket,
} from "lucide-react";
import toast from "react-hot-toast";
import { clsx } from "clsx";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import OtaLogo from "@/components/OtaLogo";
import {
  OTA_CHANNELS,
  CHANNEL_TOTAL_LABEL,
  MORE_CHANNELS_PHRASE,
} from "@/data/otaChannels";
import WizardShell from "./WizardShell";
import StepProperty from "./StepProperty";
import StepRooms from "./StepRooms";
import { SETUP_PANES } from "./wizardState";

/* ── Consultant referral ──────────────────────────────────────────────────── */

/**
 * Kept on the first screen: a hotelier handed a code shouldn't have to hunt
 * for where to type it. Attribution is best-effort and never blocks setup.
 */
function ReferralField({ code, setCode, refState, refName }) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white shadow-card p-5">
      <label className="label" htmlFor="refCode">
        Have a consultant's referral code?{" "}
        <span className="font-normal text-ink-400">(optional)</span>
      </label>
      <div className="relative">
        <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
        <input
          id="refCode"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter it here and we'll credit them"
          className="input pl-9"
        />
        {refState === "checking" && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 animate-spin" />
        )}
        {refState === "valid" && (
          <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
        )}
      </div>
      {refState === "valid" && (
        <p className="text-xs text-emerald-600 mt-1.5">
          Referred by {refName || "a Botlify consultant"}
        </p>
      )}
      {refState === "invalid" && (
        <p className="text-xs text-ink-400 mt-1.5">
          We don't recognise that code — you can leave it blank.
        </p>
      )}
    </div>
  );
}

/* ── The import screen ────────────────────────────────────────────────────── */

function ImportPane({ onImported, onManual, state, patch }) {
  const { activeWorkspace, setActiveWorkspace, user } = useAuthStore();
  const { fetchWorkspace } = useWorkspaceStore();
  const [ensuring, setEnsuring] = useState(!activeWorkspace);

  const [hotelId, setHotelId] = useState("");
  const [importing, setImporting] = useState(false);
  // Properties the provider can see. Populated on load when sync is switched
  // on; also returned by the import call when a hotel ID couldn't be matched.
  const [choices, setChoices] = useState([]);
  const [listing, setListing] = useState(true);
  const [unavailable, setUnavailable] = useState(null);
  const [notMatched, setNotMatched] = useState(null);

  const [refCode, setRefCode] = useState("");
  const [refState, setRefState] = useState(null);
  const [refName, setRefName] = useState("");

  /** A workspace has to exist before anything can be imported or created. */
  useEffect(() => {
    let alive = true;
    if (activeWorkspace) {
      setEnsuring(false);
      return undefined;
    }
    (async () => {
      try {
        const { data } = await api.post("/workspaces/ensure", {
          name: user?.name ? `${user.name}'s Hotel` : undefined,
        });
        if (!alive) return;
        setActiveWorkspace(data.workspace._id);
        fetchWorkspace(data.workspace._id);
      } catch (e) {
        if (alive)
          toast.error(
            e?.response?.data?.message || "Couldn't set up your workspace",
          );
      } finally {
        if (alive) setEnsuring(false);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWorkspace]);

  /** Validate the referral code live. */
  useEffect(() => {
    const code = refCode.trim();
    if (!code) {
      setRefState(null);
      setRefName("");
      return undefined;
    }
    setRefState("checking");
    const t = setTimeout(async () => {
      try {
        const { data } = await api.get(
          `/consultants/validate/${encodeURIComponent(code)}`,
        );
        if (data?.valid) {
          setRefState("valid");
          setRefName(data.consultantName || "");
        } else {
          setRefState("invalid");
          setRefName("");
        }
      } catch {
        setRefState("invalid");
        setRefName("");
      }
    }, 450);
    return () => clearTimeout(t);
  }, [refCode]);

  /**
   * If the provider exposes a list, showing it is far kinder than asking for
   * an ID — one tap beats typing a number they have to go and look up. A 503
   * here is the normal "not switched on for this account yet" case and gets a
   * calm message, not an error.
   */
  useEffect(() => {
    let alive = true;
    setListing(true);
    api
      .get("/hotel/channex/properties")
      .then(({ data }) => {
        if (!alive) return;
        setChoices(
          (data.properties || [])
            .filter((p) => !p.alreadyImported)
            .map((p) => ({
              providerPropertyId: p.channexId,
              name: p.name,
              city: p.city,
              country: p.country,
            })),
        );
      })
      .catch((e) => {
        if (!alive) return;
        if (e?.response?.status === 503) {
          setUnavailable(
            e.response?.data?.message ||
              "Channel sync isn't switched on for your account yet.",
          );
        }
      })
      .finally(() => {
        if (alive) setListing(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  /** Credit the consultant once, on the way through. Best-effort. */
  const creditReferral = async () => {
    if (refCode.trim() && refState === "valid") {
      try {
        await api.post("/consultants/attribute", { code: refCode.trim() });
      } catch {
        /* a referral problem must never block setup */
      }
    }
  };

  /**
   * The one call that does it all: by provider property id when they picked
   * from the list, by OTA/hotel id when they typed one. A hotel ID we can't
   * resolve comes back as resolved:false with the list to pick from — never
   * as a guess at which hotel they meant.
   */
  const runImport = async (body) => {
    setImporting(true);
    setNotMatched(null);
    try {
      await creditReferral();
      const { data } = await api.post("/hotel/connection/import", body);

      if (data.resolved === false) {
        setChoices(data.choices || []);
        setNotMatched(
          data.message ||
            "We couldn't match that hotel ID — pick your property below.",
        );
        return;
      }

      toast.success(`${data.property?.name || "Your hotel"} is in`);
      patch({ channelsImported: true, channelsSkipped: false });
      onImported(data);
    } catch (e) {
      const status = e?.response?.status;
      if (status === 503) {
        setUnavailable(
          e.response?.data?.message ||
            "Channel sync isn't switched on for your account yet.",
        );
      } else {
        toast.error(e?.response?.data?.message || "Import failed");
      }
    } finally {
      setImporting(false);
    }
  };

  if (ensuring) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-7 h-7 text-brand-500 animate-spin" />
      </div>
    );
  }

  const canSubmit = hotelId.trim().length > 0 && !importing;

  return (
    <WizardShell
      step={0}
      icon={CloudDownload}
      eyebrow="Step 1 of 3"
      title="Bring your hotel across"
      subtitle="Enter your Booking.com hotel ID and we'll pull your property, rooms, photos and occupancy over. No forms to fill in."
      hideFooter
      wide
    >
      <div className="space-y-4">
        {/* ── The hotel ID input — the headline action ─────────────────── */}
        <div className="rounded-2xl border-2 border-brand-200 bg-white p-5 sm:p-6 shadow-lg">
          <label className="label" htmlFor="hotelId">
            Your Booking.com hotel ID
          </label>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (canSubmit) runImport({ otaPropertyId: hotelId.trim() });
            }}
            className="flex flex-col sm:flex-row gap-2.5"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
              <input
                id="hotelId"
                value={hotelId}
                onChange={(e) => setHotelId(e.target.value)}
                placeholder="e.g. 1234567"
                className="input pl-9"
                autoComplete="off"
              />
            </div>
            <button
              type="submit"
              disabled={!canSubmit}
              className="btn-primary justify-center shrink-0 disabled:opacity-50"
            >
              {importing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CloudDownload className="w-4 h-4" />
              )}
              Bring it across
            </button>
          </form>
          <p className="text-xs text-ink-400 mt-2">
            It's the number in your Booking.com extranet URL. Not sure? Pick
            your property from the list below instead.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            {OTA_CHANNELS.slice(0, 6).map((c) => (
              <OtaLogo key={c.key} channelKey={c.key} name={c.name} size={30} />
            ))}
            <span className="inline-flex items-center rounded-lg bg-ink-50 border border-ink-200 px-2 text-[11px] font-bold text-ink-500">
              +{CHANNEL_TOTAL_LABEL}
            </span>
          </div>
        </div>

        {/* Couldn't match the typed ID — say so plainly and offer the list. */}
        {notMatched && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-900">{notMatched}</p>
          </div>
        )}

        {/* ── Or pick from what the provider can actually see ──────────── */}
        {listing ? (
          <div className="rounded-2xl border border-ink-100 bg-white p-6 text-center shadow-card">
            <Loader2 className="w-5 h-5 text-brand-500 animate-spin inline" />
            <p className="text-sm text-ink-400 mt-2">
              Looking for your properties…
            </p>
          </div>
        ) : unavailable ? (
          <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
            <p className="font-bold text-ink-900">
              We'll connect your channels for you
            </p>
            <p className="text-sm text-ink-500 mt-1">
              {unavailable} Add your rooms below and our team takes it from
              there — your AI, calendar and direct bookings all work exactly the
              same in the meantime.
            </p>
          </div>
        ) : choices.length > 0 ? (
          <div className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6 shadow-card">
            <p className="font-black text-ink-900 mb-1">
              Or pick your property
            </p>
            <p className="text-sm text-ink-500 mb-4">
              These are the properties we can see on your channel account.
            </p>
            <div className="space-y-2">
              {choices.map((p) => (
                <div
                  key={p.providerPropertyId}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-ink-100 p-4"
                >
                  <div className="flex-1 min-w-[180px]">
                    <p className="font-bold text-ink-900">{p.name}</p>
                    <p className="text-xs text-ink-500">
                      {[p.city, p.country].filter(Boolean).join(", ")}
                      {p.rooms ? ` · ${p.rooms} rooms` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={importing}
                    onClick={() =>
                      runImport({ providerPropertyId: p.providerPropertyId })
                    }
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-lg px-3.5 py-2 transition disabled:opacity-60"
                  >
                    {importing ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CloudDownload className="w-3.5 h-3.5" />
                    )}
                    Bring it across
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* ── What actually happens, said plainly ──────────────────────── */}
        <div className="rounded-2xl bg-gradient-to-br from-ink-900 to-ink-800 text-white p-5 sm:p-6 shadow-2xl shadow-ink-900/20">
          <div className="flex items-start gap-3">
            <span className="w-9 h-9 rounded-xl bg-brand-500/20 text-brand-300 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </span>
            <div>
              <p className="font-black text-[15px]">
                Your AI goes live today. One quick step turns the channels on.
              </p>
              <p className="text-sm text-white/60 mt-1">
                Airbnb connects in one click. For Booking.com, Agoda and the
                rest, your OTA asks you to approve the connection from your own
                extranet — we show you exactly where, and it takes about a
                minute. That approval is the OTA's own screen, so it can only
                come from you.{" "}
                {CHANNEL_TOTAL_LABEL} channels are supported,{" "}
                {MORE_CHANNELS_PHRASE}.
              </p>
            </div>
          </div>
        </div>

        <ReferralField
          code={refCode}
          setCode={setRefCode}
          refState={refState}
          refName={refName}
        />

        {/* ── The secondary path, clear but not competing ──────────────── */}
        <div className="text-center pt-1 pb-2">
          <button
            type="button"
            onClick={async () => {
              await creditReferral();
              onManual();
            }}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-ink-600 hover:text-brand-600 transition"
          >
            <PencilLine className="w-4 h-4" />
            Set it up manually instead
          </button>
          <p className="text-xs text-ink-400 mt-1">
            New property, or not listed anywhere yet? This is the way in.
          </p>
        </div>
      </div>
    </WizardShell>
  );
}

/* ── The review screen — "is this right?" ─────────────────────────────────── */

/**
 * One imported room. `unitsCount` and `baseRate` are editable right here,
 * because a rate that didn't come across is the single most common gap and
 * sending someone to another screen to fix it is exactly the fuss we're
 * removing. Saves straight to PUT /hotel/rooms/:id.
 */
function ReviewRoom({ room, currency, onSaved }) {
  const [units, setUnits] = useState(String(room.unitsCount ?? 1));
  const [rate, setRate] = useState(
    room.baseRate ? String(room.baseRate) : "",
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const missingRate = !(Number(rate) > 0);
  const missingUnits = !(Number(units) >= 1);
  const needsFix = missingRate || missingUnits;

  const save = async () => {
    if (needsFix) return;
    setSaving(true);
    try {
      const { data } = await api.put(`/hotel/rooms/${room._id}`, {
        unitsCount: Number(units),
        baseRate: Number(rate),
      });
      setSaved(true);
      onSaved?.(data.roomType || { ...room, unitsCount: Number(units), baseRate: Number(rate) });
    } catch (e) {
      toast.error(e?.response?.data?.message || "Couldn't save that");
    } finally {
      setSaving(false);
    }
  };

  const dirty =
    Number(units) !== Number(room.unitsCount ?? 1) ||
    Number(rate || 0) !== Number(room.baseRate || 0);

  return (
    <div
      className={clsx(
        "rounded-xl border p-4",
        needsFix ? "border-amber-200 bg-amber-50/50" : "border-ink-100",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <p className="font-bold text-ink-900 min-w-0">{room.name}</p>
        {needsFix ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 rounded-full px-2 py-0.5 shrink-0">
            <AlertTriangle className="w-3 h-3" /> Needs a detail
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5 shrink-0">
            <CheckCircle2 className="w-3 h-3" />
            {saved && dirty === false ? "Saved" : "Came across"}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <span className="label">How many of these?</span>
          <input
            type="number"
            min="1"
            value={units}
            onChange={(e) => {
              setUnits(e.target.value);
              setSaved(false);
            }}
            className={clsx("input", missingUnits && "border-amber-300")}
          />
        </div>
        <div>
          <span className="label">Nightly rate ({currency || "USD"})</span>
          <input
            type="number"
            min="0"
            value={rate}
            onChange={(e) => {
              setRate(e.target.value);
              setSaved(false);
            }}
            placeholder="0"
            className={clsx("input", missingRate && "border-amber-300")}
          />
        </div>
      </div>

      {missingRate && (
        <p className="text-xs text-amber-700 mt-2">
          No rate came across for this room — set one so your AI can quote it.
        </p>
      )}

      {dirty && !needsFix && (
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-lg px-3 py-1.5 transition disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5" />
          )}
          Save
        </button>
      )}
    </div>
  );
}

/**
 * "Here's what we brought across — is this right?"
 *
 * The confirm moment. It shows the property, every room with its units and
 * rate, and makes anything missing fixable without leaving. It does NOT wait
 * on OTA approval: confirming here moves them to messaging, and the channel
 * connection carries on in the background.
 */
function ReviewPane({ imported, onConfirm, onBack, onAddRooms }) {
  const [rooms, setRooms] = useState(imported?.roomTypes || []);
  const property = imported?.property;
  const currency = property?.currency || "USD";

  const outstanding = rooms.filter(
    (r) => !(Number(r.baseRate) > 0) || !(Number(r.unitsCount) >= 1),
  );

  const updateRoom = (updated) =>
    setRooms((cur) =>
      cur.map((r) => (r._id === updated._id ? { ...r, ...updated } : r)),
    );

  return (
    <WizardShell
      step={0}
      icon={CheckCircle2}
      eyebrow="Step 1 of 3 · Check what we imported"
      title={`We brought ${property?.name || "your hotel"} across`}
      subtitle="Have a quick look. Anything missing you can fix right here — then you're done with setup."
      onBack={onBack}
      onNext={onConfirm}
      nextLabel={
        outstanding.length ? "Looks right — continue" : "That's right — continue"
      }
      wide
    >
      <div className="space-y-4">
        {/* What landed */}
        <div className="rounded-2xl border border-ink-100 bg-white shadow-card p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <p className="font-black text-ink-900">{property?.name}</p>
              <p className="text-sm text-ink-500">
                {[property?.city, property?.country].filter(Boolean).join(", ") ||
                  "Location not set"}
                {" · "}
                {rooms.length} room type{rooms.length === 1 ? "" : "s"}
                {" · "}
                {currency}
              </p>
              {property?.photos?.length > 0 && (
                <p className="text-xs text-emerald-600 mt-1">
                  {property.photos.length} photo
                  {property.photos.length === 1 ? "" : "s"} came across too
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Rooms — editable where a blocker exists */}
        <div className="rounded-2xl border border-ink-100 bg-white shadow-card p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <p className="font-black text-ink-900">Your rooms</p>
              <p className="text-sm text-ink-500 mt-0.5">
                {outstanding.length === 0
                  ? "Everything we need came across."
                  : `${outstanding.length} room${
                      outstanding.length === 1 ? " needs" : "s need"
                    } a detail before we can switch the channels over.`}
              </p>
            </div>
            <button
              type="button"
              onClick={onAddRooms}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 underline underline-offset-2 shrink-0"
            >
              Add or edit rooms
            </button>
          </div>

          {rooms.length === 0 ? (
            <div className="rounded-xl border border-ink-100 bg-ink-50 p-5 text-center">
              <p className="text-sm font-semibold text-ink-700">
                No rooms came across
              </p>
              <button
                type="button"
                onClick={onAddRooms}
                className="btn-secondary mt-3"
              >
                Add your rooms
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {rooms.map((r) => (
                <ReviewRoom
                  key={r._id}
                  room={r}
                  currency={currency}
                  onSaved={updateRoom}
                />
              ))}
            </div>
          )}
        </div>

        {/* Why we hold the switch-over — protection, not an error. */}
        {outstanding.length > 0 && (
          <div className="rounded-2xl border border-ink-200 bg-ink-50/70 p-5">
            <p className="flex items-center gap-1.5 font-bold text-ink-900">
              <ShieldCheck className="w-4 h-4 text-brand-500 shrink-0" />
              You can carry on — we'll hold the channel switch-over
            </p>
            <p className="text-sm text-ink-500 mt-1">
              Your Booking.com listing keeps selling exactly as it does now. We
              won't hand your rates over until they're set, so nothing can break
              on your live listing. Fix them here or any time in Settings.
            </p>
          </div>
        )}

        {/* The honest note about what happens next. */}
        <div className="rounded-2xl bg-gradient-to-br from-ink-900 to-ink-800 text-white p-5 sm:p-6 shadow-2xl shadow-ink-900/20">
          <div className="flex items-start gap-3">
            <span className="w-9 h-9 rounded-xl bg-brand-500/20 text-brand-300 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <p className="font-black text-[15px]">
                Next: switch your channels on
              </p>
              <p className="text-sm text-white/60 mt-1">
                Airbnb is one click. Booking.com, Agoda and the others ask you
                to approve the connection in your own extranet — about a minute
                each, and we walk you through it. Your calendar starts syncing
                the moment one goes live.
              </p>
            </div>
          </div>
        </div>
      </div>
    </WizardShell>
  );
}

/* ── Step 1 orchestrator ──────────────────────────────────────────────────── */

export default function StepSetup({ state, patch, goNext }) {
  const pane = state.setupPane || SETUP_PANES.CHOOSE;
  const [imported, setImported] = useState(null);
  const [loadingReview, setLoadingReview] = useState(false);

  const setPane = (next, extra) => patch({ setupPane: next, ...(extra || {}) });

  /** An import landed — record it and go straight to the review. */
  const handleImported = (data) => {
    setImported(data);
    patch({
      setupPath: "ota",
      setupPane: SETUP_PANES.REVIEW,
      propertyId: data.property?._id || null,
      propertyName: data.property?.name || "",
      currency: data.property?.currency || state.currency,
      bookingSlug: data.property?.directBooking?.slug || state.bookingSlug,
      roomsAdded: (data.roomTypes || []).length,
    });
  };

  /**
   * A refresh on the review pane loses the in-memory import. Rather than
   * bouncing them back to the start, refetch the property and its rooms —
   * the review is reconstructible from the server.
   */
  const rehydrateReview = useCallback(async () => {
    if (imported || !state.propertyId) return;
    setLoadingReview(true);
    try {
      const [{ data: props }, { data: roomsData }] = await Promise.all([
        api.get("/hotel/properties"),
        api.get(`/hotel/properties/${state.propertyId}/rooms`),
      ]);
      const property =
        (props.properties || []).find((p) => p._id === state.propertyId) ||
        (props.properties || [])[0];
      setImported({ property, roomTypes: roomsData.roomTypes || [] });
    } catch {
      // Couldn't rebuild it — the rooms pane is a safe place to land.
      setPane(SETUP_PANES.ROOMS);
    } finally {
      setLoadingReview(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imported, state.propertyId]);

  useEffect(() => {
    if (pane === SETUP_PANES.REVIEW) rehydrateReview();
  }, [pane, rehydrateReview]);

  const backToStart = () =>
    setPane(SETUP_PANES.CHOOSE, { setupPath: null });

  if (loadingReview) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-7 h-7 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (pane === SETUP_PANES.REVIEW && imported) {
    return (
      <ReviewPane
        imported={imported}
        onBack={backToStart}
        onConfirm={goNext}
        onAddRooms={() => setPane(SETUP_PANES.ROOMS)}
      />
    );
  }

  if (pane === SETUP_PANES.MANUAL_PROPERTY) {
    return (
      <StepProperty
        state={state}
        patch={patch}
        goNext={() => setPane(SETUP_PANES.ROOMS)}
        shell={{
          eyebrow: "Step 1 of 3 · Your property",
          onBack: backToStart,
        }}
      />
    );
  }

  if (pane === SETUP_PANES.ROOMS) {
    const cameFromImport = state.setupPath === "ota";
    return (
      <StepRooms
        state={state}
        patch={patch}
        goNext={goNext}
        goBack={() =>
          setPane(
            cameFromImport
              ? SETUP_PANES.REVIEW
              : SETUP_PANES.MANUAL_PROPERTY,
          )
        }
        shell={{
          eyebrow: "Step 1 of 3 · Your rooms",
          title: cameFromImport
            ? "Check the rooms we imported"
            : "Now, what do you rent out?",
          subtitle: cameFromImport
            ? "These came across from your channel. Add a rate to anything missing one — without it the AI can't quote a price."
            : "Add one room type at a time — a category, not every physical room. Ten identical doubles are one room type with ten of them.",
        }}
      />
    );
  }

  return (
    <ImportPane
      state={state}
      patch={patch}
      onImported={handleImported}
      onManual={() =>
        patch({
          setupPath: "manual",
          setupPane: SETUP_PANES.MANUAL_PROPERTY,
        })
      }
    />
  );
}
