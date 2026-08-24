/**
 * SetupWizardPage — the hotel onboarding wizard, in three steps.
 *
 *   1. Your hotel      — a fork at the very start: connect a booking channel
 *                        (import everything) or enter details yourself. Both
 *                        paths finish inside this step, ending at rooms.
 *   2. Guest channels  — WhatsApp / Instagram / Messenger / Telegram. Optional.
 *   3. Done            — the receipt, the direct-booking link, the dashboard.
 *
 * Plan selection still happens BEFORE this (RequireOnboarding redirects an
 * unentitled owner to /onboarding/pricing), so the wizard never has to think
 * about billing.
 *
 * Progress lives in component state and is mirrored into sessionStorage so a
 * refresh mid-setup doesn't start over.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import StepSetup from "./wizard/StepSetup";
import StepMessaging from "./wizard/StepMessaging";
import StepDone from "./wizard/StepDone";
import {
  loadWizard,
  saveWizard,
  SETUP_PANES,
  STEP_BY_NAME,
  TOTAL_STEPS,
} from "./wizard/wizardState";

/** ?step=<name> → index, or null when absent/unrecognised. */
function requestedStepIndex() {
  try {
    const wanted = new URLSearchParams(window.location.search).get("step");
    if (wanted && STEP_BY_NAME[wanted] !== undefined) return STEP_BY_NAME[wanted];
  } catch {
    /* no window/search — caller falls back to the saved step */
  }
  return null;
}

/** Whether a ?step= was present at all, recognised or not. */
function hasRequestedStep() {
  try {
    return !!new URLSearchParams(window.location.search).get("step");
  } catch {
    return false;
  }
}

export default function SetupWizardPage() {
  const navigate = useNavigate();
  const { activeWorkspace } = useAuthStore();
  const [state, setState] = useState(() => {
    const saved = loadWizard();
    // A provider OAuth round trip (WhatsApp/Messenger) returns here with
    // ?step=messaging — the target the backend hardcodes in
    // channelController.js. Honour it so the user lands back where they left
    // rather than at step 1, or worse, out of the wizard entirely.
    const wanted = requestedStepIndex();
    if (wanted !== null) return { ...saved, step: wanted };
    return saved;
  });
  const [checking, setChecking] = useState(true);

  const patch = (fields) =>
    setState((s) => {
      const next = { ...s, ...fields };
      saveWizard(next);
      return next;
    });

  const goTo = (step) =>
    setState((s) => {
      const next = { ...s, step: Math.max(0, Math.min(TOTAL_STEPS - 1, step)) };
      saveWizard(next);
      return next;
    });

  const goNext = () => goTo(state.step + 1);
  const goBack = () => goTo(state.step - 1);

  /**
   * An owner who already has a property has done step 1 — either on a previous
   * visit or in another tab. Don't make them create a second one: drop them at
   * the rooms pane with the existing property, or straight into the dashboard
   * if they'd already finished the wizard once.
   */
  useEffect(() => {
    let alive = true;
    if (!activeWorkspace) {
      setChecking(false);
      return undefined;
    }
    (async () => {
      try {
        const { data } = await api.get("/hotel/properties");
        if (!alive) return;
        const props = data.properties || [];
        if (props.length === 0) {
          // No property → the wizard starts (or resumes) at the fork.
          setState((s) => {
            const next = { ...s, step: 0, propertyId: null };
            saveWizard(next);
            return next;
          });
          return;
        }
        const p = props[0];
        const resumed = loadWizard();
        // An explicit ?step= means we just came back from a provider OAuth
        // round trip — always treat that as a resume, never as "setup done".
        const requested = hasRequestedStep();
        const midWizard =
          resumed.step > 0 ||
          (resumed.propertyId === p._id &&
            resumed.setupPane &&
            resumed.setupPane !== SETUP_PANES.CHOOSE);
        if (requested || midWizard) {
          // Mid-wizard refresh — carry on where they left off, with the
          // property details refreshed from the server.
          setState((s) => {
            const next = {
              ...s,
              propertyId: s.propertyId || p._id,
              propertyName: p.name,
              currency: p.currency || s.currency,
              bookingSlug: p.directBooking?.slug || s.bookingSlug,
            };
            saveWizard(next);
            return next;
          });
          return;
        }
        // A property exists but this isn't a resume — setup is already done.
        navigate("/dashboard", { replace: true });
      } catch {
        /* fall through to the form — creating a property is still possible */
      } finally {
        if (alive) setChecking(false);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWorkspace]);

  if (checking && activeWorkspace) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-7 h-7 text-brand-500 animate-spin" />
      </div>
    );
  }

  const shared = { state, patch, goNext, goBack, goTo };

  switch (state.step) {
    case 1:
      return <StepMessaging {...shared} />;
    case 2:
      return <StepDone {...shared} />;
    case 0:
    default:
      return <StepSetup {...shared} />;
  }
}
