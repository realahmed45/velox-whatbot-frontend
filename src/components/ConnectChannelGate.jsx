/**
 * Messaging-channel gate.
 * Pages wrapped by this component render normally when ANY guest messaging
 * channel is connected. A hotel running WhatsApp only must never be blocked
 * out of its own inbox. `workspace.instagram` is the backend's historical
 * connection record and is still checked so no existing connection is missed.
 */
import { MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useWorkspaceStore } from "@/store/workspaceStore";

export default function ConnectChannelGate({ children, feature }) {
  const { workspace, loading } = useWorkspaceStore();

  const igConnected = workspace?.instagram?.status === "connected";
  const otherConnected = (workspace?.channels || []).some(
    (c) => c.status === "connected",
  );
  const anyConnected = igConnected || otherConnected;

  if (loading || !workspace || anyConnected) return children;

  return (
    <div>
      <div className="card group relative mx-4 mb-0 mt-4 flex flex-col gap-3 overflow-hidden px-4 py-3.5 sm:mx-8 sm:mt-6 sm:flex-row sm:items-center">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-sunset-soft opacity-70" />
        <div aria-hidden className="pointer-events-none absolute inset-y-3 left-0 w-[3px] rounded-full bg-sunset" />
        <div className="relative grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-sunset shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_8px_20px_-8px_rgba(255,61,119,0.6)] transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]">
          <MessageCircle className="h-4.5 w-4.5 text-white" strokeWidth={1.8} />
        </div>
        <div className="relative min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink-900">
            {feature
              ? `${feature} needs a connected messaging channel`
              : "Connect a channel to see guest messages"}
          </p>
          <p className="text-xs text-ink-500 mt-0.5">
            Connect WhatsApp and your AI starts answering guests there —
            booking-site messages arrive once Airbnb, Booking.com or Expedia
            is linked. Takes about a minute.
          </p>
        </div>
        <Link
          to="/dashboard/settings?tab=channels"
          className="btn-primary relative flex-shrink-0 px-3.5 py-2 text-xs"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          Connect a channel
        </Link>
      </div>
      {children}
    </div>
  );
}
