/**
 * One-click Shopify connect — enter store, log in with Shopify.
 */
import { useState } from "react";
import { Link2, Loader2, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";

export default function ShopifyConnect({
  connected = false,
  storeUrl = "",
  orderTracking = false,
  onConnected,
  compact = false,
  showManageLink = true,
}) {
  const { activeWorkspace } = useAuthStore();
  const { fetchWorkspace } = useWorkspaceStore();
  const [shop, setShop] = useState("");
  const [connecting, setConnecting] = useState(false);

  const startOAuth = async () => {
    const s = shop.trim();
    if (!s) return toast.error("Enter your store name to continue");
    setConnecting(true);
    try {
      const { data } = await api.get("/integrations/shopify/oauth-url", {
        params: { shop: s },
      });
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      toast.error("Unable to connect right now. Please try again shortly.");
    } catch (e) {
      toast.error(
        e.response?.data?.message ||
          "Unable to connect to Shopify. Please try again shortly.",
      );
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = async () => {
    if (!window.confirm("Disconnect Shopify from Botlify?")) return;
    try {
      await api.delete("/integrations/shopify");
      toast.success("Shopify disconnected");
      await fetchWorkspace(activeWorkspace);
      onConnected?.(null);
    } catch {
      toast.error("Could not disconnect");
    }
  };

  if (connected) {
    return (
      <div
        className={`border border-emerald-200 bg-emerald-50/80 ${compact ? "p-3" : "p-4"} space-y-2`}
      >
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="text-xs font-semibold text-emerald-900">
            Connected · <span className="font-mono">{storeUrl}</span>
          </p>
          <button
            type="button"
            onClick={disconnect}
            className="text-[11px] text-red-600 hover:underline"
          >
            Disconnect
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200">
            Catalog synced
          </span>
          {orderTracking && (
            <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200">
              Order updates in DMs
            </span>
          )}
        </div>
        {showManageLink && (
          <p className="text-[11px] text-emerald-700">
            Product and order questions are handled automatically in conversations.{" "}
            <Link to="/dashboard/apps" className="underline font-semibold">
              Manage connection
            </Link>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${compact ? "" : "border border-ink-200 bg-white p-4"}`}>
      {!compact && (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 flex items-center justify-center text-white">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-sm text-ink-900">Shopify</p>
            <p className="text-xs text-ink-500">
              Sign in with Shopify to sync your catalog and order updates.
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <input
          className="input text-sm flex-1"
          placeholder="your-store"
          value={shop}
          onChange={(e) => setShop(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && startOAuth()}
          disabled={connecting}
        />
        <button
          type="button"
          onClick={startOAuth}
          disabled={connecting}
          className="btn btn-primary whitespace-nowrap flex items-center gap-1.5"
        >
          {connecting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Link2 className="w-4 h-4" />
          )}
          Connect with Shopify
        </button>
      </div>

      {!compact && (
        <p className="text-[10px] text-ink-400">
          Optional — only needed if you sell through Shopify.
        </p>
      )}
    </div>
  );
}
