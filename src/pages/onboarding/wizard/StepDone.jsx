/**
 * Step 5 — Done. A short receipt of what got set up, the public direct-booking
 * link if one exists, and the way into the dashboard.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  Copy,
  ExternalLink,
  MinusCircle,
  PartyPopper,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { clsx } from "clsx";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import WizardShell from "./WizardShell";
import { clearWizard } from "./wizardState";

function Row({ done, title, detail }) {
  return (
    <li className="flex items-start gap-3 py-3">
      <span
        className={clsx(
          "w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5",
          done ? "bg-emerald-50 text-emerald-600" : "bg-ink-100 text-ink-400",
        )}
      >
        {done ? (
          <Check className="w-3.5 h-3.5" strokeWidth={3} />
        ) : (
          <MinusCircle className="w-3.5 h-3.5" />
        )}
      </span>
      <div className="min-w-0">
        <p
          className={clsx(
            "text-sm font-bold",
            done ? "text-ink-900" : "text-ink-500",
          )}
        >
          {title}
        </p>
        <p className="text-xs text-ink-500 mt-0.5">{detail}</p>
      </div>
    </li>
  );
}

export default function StepDone({ state, goBack }) {
  const navigate = useNavigate();
  const { activeWorkspace } = useAuthStore();
  const { fetchWorkspace } = useWorkspaceStore();
  const [going, setGoing] = useState(false);

  const rooms = state.roomsAdded || 0;
  const messaging = state.messagingConnected || [];
  const bookingUrl = state.bookingSlug
    ? `${window.location.origin}/book/${state.bookingSlug}`
    : null;

  const finish = async () => {
    setGoing(true);
    clearWizard();
    try {
      if (activeWorkspace) await fetchWorkspace(activeWorkspace, { force: true });
    } catch {
      /* the dashboard refetches anyway */
    }
    navigate("/dashboard", { replace: true });
  };

  const copyLink = async () => {
    if (!bookingUrl) return;
    try {
      await navigator.clipboard.writeText(bookingUrl);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy — select the link and copy it manually");
    }
  };

  return (
    <WizardShell
      step={4}
      icon={PartyPopper}
      eyebrow="Step 5 of 5"
      title={`${state.propertyName || "Your property"} is live on Botlify`}
      subtitle="Here's what's set up. Everything you skipped is one click away in the dashboard."
      onBack={goBack}
      onNext={finish}
      nextLabel="Go to my dashboard"
      busy={going}
    >
      <div className="space-y-4">
        <div className="rounded-2xl border border-ink-100 bg-white shadow-lg p-5 sm:p-6">
          <ul className="divide-y divide-ink-100">
            <Row
              done
              title="Property created"
              detail={state.propertyName || "Your property is set up"}
            />
            <Row
              done={rooms > 0}
              title={
                rooms > 0
                  ? `${rooms} room type${rooms === 1 ? "" : "s"} added`
                  : "No rooms yet"
              }
              detail={
                rooms > 0
                  ? "Your calendar and rates are ready."
                  : "Add rooms in Property → Rooms so the AI can quote and sell them."
              }
            />
            <Row
              done={!!state.channelsImported}
              title={
                state.channelsImported
                  ? "Booking channels connected"
                  : "Booking channels not connected yet"
              }
              detail={
                state.channelsImported
                  ? "Availability and rates sync across every connected OTA."
                  : "Connect Booking.com, Airbnb, Agoda and 60+ more from Property → Channels."
              }
            />
            <Row
              done={messaging.length > 0}
              title={
                messaging.length > 0
                  ? `Guest messaging on ${messaging.length} channel${messaging.length === 1 ? "" : "s"}`
                  : "Guest messaging not connected yet"
              }
              detail={
                messaging.length > 0
                  ? "Your AI concierge answers guests there 24/7."
                  : "Add WhatsApp, Instagram, Messenger or Telegram from Settings → Channels."
              }
            />
          </ul>
        </div>

        {bookingUrl && (
          <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-5 sm:p-6">
            <p className="font-black text-ink-900">Your direct booking page</p>
            <p className="text-sm text-ink-600 mt-1 mb-3">
              Share this link — guests book you directly, with no OTA
              commission.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <code className="flex-1 min-w-[200px] truncate rounded-lg bg-white border border-ink-200 px-3 py-2 text-xs text-ink-700">
                {bookingUrl}
              </code>
              <button
                type="button"
                onClick={copyLink}
                className="btn-secondary"
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
              <a
                href={bookingUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
              >
                <ExternalLink className="w-4 h-4" />
                Open
              </a>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6 shadow-card">
          <div className="flex items-start gap-3">
            <span className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <p className="font-black text-ink-900 text-[15px]">
                One more thing
              </p>
              <p className="text-sm text-ink-500 mt-1">
                On the Today screen you can ask the Botlify Agent anything —
                "who's arriving tomorrow?", "raise weekend rates 10%", "which
                rooms are empty this week?" — and it just does it.
              </p>
            </div>
          </div>
        </div>
      </div>
    </WizardShell>
  );
}
