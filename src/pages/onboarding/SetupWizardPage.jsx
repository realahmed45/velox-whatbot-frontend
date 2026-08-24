/**
 * SetupWizardPage — the hotel onboarding wizard.
 *
 * Property → Rooms → Booking channels → Guest messaging → Done. Property-first,
 * the way a channel manager onboards a hotel; the Instagram-first flow this
 * replaced belonged to the old chatbot product.
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
import StepProperty from "./wizard/StepProperty";
import StepRooms from "./wizard/StepRooms";
import StepChannels from "./wizard/StepChannels";
import StepMessaging from "./wizard/StepMessaging";
import StepDone from "./wizard/StepDone";
import { loadWizard, saveWizard, TOTAL_STEPS } from "./wizard/wizardState";

export default function SetupWizardPage() {
  const navigate = useNavigate();
  const { activeWorkspace } = useAuthStore();
  const [state, setState] = useState(() => loadWizard());
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
   * the rooms step with the existing property, or straight into the dashboard
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
          // No property → the wizard starts (or resumes) at step 1.
          setState((s) => {
            const next = { ...s, step: 0, propertyId: null };
            saveWizard(next);
            return next;
          });
          return;
        }
        const p = props[0];
        const resumed = loadWizard();
        if (resumed.propertyId === p._id && resumed.step > 0) {
          // Mid-wizard refresh — carry on where they left off.
          setState((s) => ({
            ...s,
            propertyName: p.name,
            currency: p.currency || s.currency,
            bookingSlug: p.directBooking?.slug || s.bookingSlug,
          }));
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
      return <StepRooms {...shared} />;
    case 2:
      return <StepChannels {...shared} />;
    case 3:
      return <StepMessaging {...shared} />;
    case 4:
      return <StepDone {...shared} />;
    case 0:
    default:
      return <StepProperty {...shared} />;
  }
}
