/**
 * Instagram connection gate.
 * Pages wrapped by this component render normally if Instagram is connected.
 * Otherwise a soft banner invites the user to connect.
 */
import { Instagram } from "lucide-react";
import { useWorkspaceStore } from "@/store/workspaceStore";
import api from "@/services/api";
import { useState } from "react";

export default function ConnectChannelGate({ children, feature }) {
  const { workspace, loading } = useWorkspaceStore();
  const [connecting, setConnecting] = useState(false);

  const igConnected = workspace?.instagram?.status === "connected";

  if (loading || !workspace || igConnected) return children;

  const startIg = async () => {
    setConnecting(true);
    try {
      const { data } = await api.get("/instagram/connect/oauth-url");
      window.location.href = data.url;
    } catch {
      setConnecting(false);
    }
  };

  return (
    <div>
      <div className="mx-4 sm:mx-8 mt-4 sm:mt-6 mb-0 flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 rounded-xl bg-violet-50 border border-violet-100">
        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
          <Instagram className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-violet-900">
            {feature
              ? `${feature} needs a connected Instagram account`
              : "Connect Instagram to see live data"}
          </p>
          <p className="text-xs text-violet-700/80 mt-0.5">
            Link your Instagram Business account to start automating. Takes
            about 30 seconds.
          </p>
        </div>
        <button
          onClick={startIg}
          disabled={connecting}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold transition disabled:opacity-60 flex-shrink-0"
        >
          <Instagram className="w-3.5 h-3.5" />
          {connecting ? "Connecting…" : "Connect Instagram"}
        </button>
      </div>
      {children}
    </div>
  );
}
