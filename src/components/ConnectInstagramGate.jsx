import { Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import { useWorkspaceStore } from "@/store/workspaceStore";

/**
 * Wrap any page that requires a connected Instagram account.
 * Shows a friendly nudge instead of empty data when not connected.
 *
 * <ConnectInstagramGate>
 *   <YourPage />
 * </ConnectInstagramGate>
 */
export default function ConnectInstagramGate({ children, feature }) {
  const { workspace, loading } = useWorkspaceStore();
  const status = workspace?.instagram?.status;

  // While first-load is happening, render children so we don't flash gate.
  if (loading || !workspace) return children;
  if (status === "connected") return children;

  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto">
      <div className="card p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 via-rose-500 to-orange-500 mx-auto mb-4 flex items-center justify-center shadow-glow">
          <Instagram className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-xl font-bold text-ink-900 mb-1">
          Connect Instagram first
        </h2>
        <p className="text-sm text-ink-500 max-w-md mx-auto mb-5">
          {feature
            ? `${feature} needs an Instagram Business or Creator account to work.`
            : "This feature needs an Instagram Business or Creator account to work."}{" "}
          It takes about 30 seconds.
        </p>
        <Link
          to="/dashboard/settings"
          className="btn-primary inline-flex animate-pulse-soft"
        >
          Connect Instagram
        </Link>
      </div>
    </div>
  );
}
