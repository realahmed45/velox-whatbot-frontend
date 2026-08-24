/**
 * Messaging-channel gate.
 * Pages wrapped by this component render normally when ANY guest messaging
 * channel is connected — WhatsApp, Instagram, Messenger or Telegram. A hotel
 * running WhatsApp only must never be blocked out of its own inbox, which is
 * what this used to do when it checked Instagram alone.
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
      <div className="mx-4 sm:mx-8 mt-4 sm:mt-6 mb-0 flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 rounded-xl bg-brand-50 border border-brand-100">
        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center shadow-glow">
          <MessageCircle className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-ink-900">
            {feature
              ? `${feature} needs a connected messaging channel`
              : "Connect a channel to see guest messages"}
          </p>
          <p className="text-xs text-ink-500 mt-0.5">
            Connect WhatsApp, Instagram, Messenger or Telegram and your AI
            starts answering guests there. Takes about a minute.
          </p>
        </div>
        <Link
          to="/dashboard/settings?tab=channels"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold transition flex-shrink-0 shadow-glow"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          Connect a channel
        </Link>
      </div>
      {children}
    </div>
  );
}
