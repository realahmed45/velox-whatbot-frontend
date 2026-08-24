/**
 * Step 1 — "How do you want to set up?"
 *
 * The fork, right at the very start, as two large choice cards:
 *
 *   • Connect a booking channel — import the property, rooms, photos and
 *     occupancy straight out of Booking.com / Airbnb / Agoda via the
 *     connectivity partner (GET /hotel/channex/properties →
 *     POST /hotel/channex/import). Handled by StepChannels, which already
 *     owns that flow including the calm 503 "not switched on yet" state.
 *
 *   • Enter details myself — the manual path: StepProperty, then rooms.
 *
 * Both forks converge on rooms before continuing: an import may land a
 * property with no rate set, and a manual property obviously has no rooms yet.
 *
 * Everything here happens INSIDE step 1 — the progress rail never moves until
 * the owner leaves for guest messaging. Sub-pane position lives in wizard
 * state (`setupPane`) so a mid-fork refresh doesn't restart the fork.
 */
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  CloudDownload,
  Loader2,
  PencilLine,
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
import StepChannels from "./StepChannels";
import { SETUP_PANES } from "./wizardState";

/* ── The two choice cards ─────────────────────────────────────────────────── */

function ChoiceCard({
  icon: Icon,
  tint,
  badge,
  title,
  blurb,
  bullets,
  footer,
  onClick,
  cta,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group text-left w-full rounded-2xl border-2 border-ink-200 bg-white p-5 sm:p-6 shadow-lg transition hover:border-brand-400 hover:shadow-xl focus:outline-none focus-visible:border-brand-500 focus-visible:shadow-ring"
    >
      <div className="flex items-start gap-3.5">
        <span
          className={clsx(
            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
            tint,
          )}
        >
          <Icon className="w-6 h-6" />
        </span>
        <div className="min-w-0 flex-1">
          {badge && (
            <span className="inline-block text-[10px] font-black uppercase tracking-widest text-brand-600 bg-brand-50 rounded-full px-2 py-0.5 mb-1.5">
              {badge}
            </span>
          )}
          <p className="text-lg font-black text-ink-900 leading-tight">
            {title}
          </p>
          <p className="text-sm text-ink-500 mt-1 leading-snug">{blurb}</p>
        </div>
      </div>

      {bullets?.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span className="text-sm text-ink-600">{b}</span>
            </li>
          ))}
        </ul>
      )}

      {footer}

      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 group-hover:gap-2.5 transition-all">
        {cta}
        <ArrowRight className="w-4 h-4" />
      </span>
    </button>
  );
}

/* ── Consultant referral ──────────────────────────────────────────────────── */

/**
 * Lives on the fork screen rather than buried in the manual property form:
 * both paths need to be able to credit a consultant, and a hotelier who was
 * handed a code shouldn't have to pick "enter details myself" to use it.
 * Attribution is best-effort and never blocks setup.
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

/* ── The fork screen ──────────────────────────────────────────────────────── */

function ChoosePane({ onPick }) {
  const { activeWorkspace, setActiveWorkspace, user } = useAuthStore();
  const { fetchWorkspace } = useWorkspaceStore();
  const [ensuring, setEnsuring] = useState(!activeWorkspace);

  const [refCode, setRefCode] = useState("");
  const [refState, setRefState] = useState(null); // null|checking|valid|invalid
  const [refName, setRefName] = useState("");

  /**
   * A workspace is created deliberately here (not at signup) — the fork is now
   * the first thing an owner sees, so this is where it has to happen. Both
   * forks need one before they can create or import a property.
   */
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

  // Validate the referral code live, exactly as the old property form did.
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

  /** Credit the consultant, then hand control to the chosen fork. */
  const pick = async (path) => {
    if (refCode.trim() && refState === "valid") {
      try {
        await api.post("/consultants/attribute", { code: refCode.trim() });
        toast.success(`Referral credited to ${refName || "your consultant"}`);
      } catch {
        /* best-effort — a referral problem must never block setup */
      }
    }
    onPick(path);
  };

  if (ensuring) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-7 h-7 text-brand-500 animate-spin" />
      </div>
    );
  }

  return (
    <WizardShell
      step={0}
      icon={Sparkles}
      eyebrow="Step 1 of 3"
      title="How do you want to set up?"
      subtitle="Two ways in. Import everything from a channel you already sell on, or type it in yourself — it takes a few minutes either way."
      hideFooter
      wide
    >
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <ChoiceCard
            icon={CloudDownload}
            tint="bg-brand-50 text-brand-600"
            badge="Fastest"
            title="Connect a booking channel"
            blurb="Already on Booking.com, Airbnb or Agoda? We'll pull your property straight across."
            bullets={[
              "Rooms, photos and occupancy imported for you",
              "One calendar drives every channel",
              "0% commission on your direct bookings",
            ]}
            cta="Import from a channel"
            onClick={() => pick("ota")}
            footer={
              <div className="mt-4 flex flex-wrap gap-1.5">
                {OTA_CHANNELS.slice(0, 6).map((c) => (
                  <OtaLogo
                    key={c.key}
                    channelKey={c.key}
                    name={c.name}
                    size={30}
                  />
                ))}
                <span className="inline-flex items-center rounded-lg bg-ink-50 border border-ink-200 px-2 text-[11px] font-bold text-ink-500">
                  +{CHANNEL_TOTAL_LABEL}
                </span>
              </div>
            }
          />

          <ChoiceCard
            icon={PencilLine}
            tint="bg-ink-100 text-ink-600"
            title="Enter details myself"
            blurb="New to this, or not listed anywhere yet? Add your property and rooms by hand."
            bullets={[
              "Your property details and photos",
              "Room types, occupancy and rates",
              "Connect channels later, any time",
            ]}
            cta="Set up manually"
            onClick={() => pick("manual")}
          />
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-ink-900 to-ink-800 text-white p-5 sm:p-6 shadow-2xl shadow-ink-900/20">
          <div className="flex items-start gap-3">
            <span className="w-9 h-9 rounded-xl bg-brand-500/20 text-brand-300 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </span>
            <div>
              <p className="font-black text-[15px]">
                Either way, you end up in the same place
              </p>
              <p className="text-sm text-white/60 mt-1">
                {CHANNEL_TOTAL_LABEL} booking channels are supported,{" "}
                {MORE_CHANNELS_PHRASE} — and everything you skip now stays one
                click away in the dashboard.
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
      </div>
    </WizardShell>
  );
}

/* ── Step 1 orchestrator ──────────────────────────────────────────────────── */

export default function StepSetup({ state, patch, goNext }) {
  const pane = state.setupPane || SETUP_PANES.CHOOSE;

  const setPane = (next, extra) => patch({ setupPane: next, ...(extra || {}) });

  /**
   * The OTA fork needs a property before rooms can be added. StepChannels
   * imports one but doesn't know its id, so pick up whatever landed in the
   * workspace on the way to the rooms pane.
   */
  const [linking, setLinking] = useState(false);
  const goToRoomsFromImport = async () => {
    setLinking(true);
    try {
      const { data } = await api.get("/hotel/properties");
      const p = (data.properties || [])[0];
      if (p) {
        patch({
          setupPane: SETUP_PANES.ROOMS,
          propertyId: p._id,
          propertyName: p.name,
          currency: p.currency || state.currency,
          bookingSlug: p.directBooking?.slug || state.bookingSlug,
        });
        return;
      }
      // Nothing imported and nothing created — the manual form is the way on.
      toast("Let's add your property details so we can continue");
      patch({ setupPath: "manual", setupPane: SETUP_PANES.MANUAL_PROPERTY });
    } catch {
      patch({ setupPath: "manual", setupPane: SETUP_PANES.MANUAL_PROPERTY });
    } finally {
      setLinking(false);
    }
  };

  const backToChoose = () => setPane(SETUP_PANES.CHOOSE, { setupPath: null });

  if (linking) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-7 h-7 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (pane === SETUP_PANES.IMPORT) {
    return (
      <StepChannels
        state={state}
        patch={patch}
        goNext={goToRoomsFromImport}
        goBack={backToChoose}
        shell={{
          eyebrow: "Step 1 of 3 · Connect a channel",
          onBack: backToChoose,
          nextLabel: "Continue to rooms",
          skipLabel: "I'll connect channels later",
        }}
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
          onBack: backToChoose,
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
            cameFromImport ? SETUP_PANES.IMPORT : SETUP_PANES.MANUAL_PROPERTY,
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
    <ChoosePane
      onPick={(path) =>
        patch({
          setupPath: path,
          setupPane:
            path === "ota" ? SETUP_PANES.IMPORT : SETUP_PANES.MANUAL_PROPERTY,
        })
      }
    />
  );
}
