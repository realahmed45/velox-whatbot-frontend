/**
 * Shopify connect component.
 *
 * For live/public stores: tokenless products.json (zero setup, instant).
 * For password-protected/dev stores: shows clear guidance.
 */
import { useState } from "react";
import {
  Link2,
  Loader2,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Package,
  AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";

export default function ShopifyConnect({
  connected = false,
  storeUrl = "",
  orderTracking = false,
  authMethod = null,
  onConnected,
  compact = false,
  showManageLink = true,
}) {
  const { activeWorkspace } = useAuthStore();
  const { fetchWorkspace } = useWorkspaceStore();

  const [shop, setShop] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  // Order tracking upgrade
  const [showTokenForm, setShowTokenForm] = useState(false);
  const [upgradeToken, setUpgradeToken] = useState("");
  const [upgradingToken, setUpgradingToken] = useState(false);

  /* ── connect (tokenless — works on all live/public stores) ── */
  const connect = async () => {
    const s = shop.trim();
    if (!s) return toast.error("Enter your store name");
    setConnecting(true);
    setError(null);
    try {
      const { data } = await api.post("/integrations/shopify/storefront", {
        storeUrl: s,
      });
      toast.success(`Connected! ${data.products} products synced.`);
      await fetchWorkspace(activeWorkspace);
      onConnected?.(data);
    } catch (e) {
      const msg = e.response?.data?.message || "Could not connect to that store.";
      setError(msg);
    } finally {
      setConnecting(false);
    }
  };

  /* ── upgrade to admin token for order tracking ── */
  const doUpgradeToken = async () => {
    const t = upgradeToken.trim();
    if (!t) return toast.error("Paste your Admin API access token");
    setUpgradingToken(true);
    try {
      const { data } = await api.post("/integrations/shopify", {
        storeUrl,
        accessToken: t,
      });
      toast.success("Order tracking enabled!");
      await fetchWorkspace(activeWorkspace);
      onConnected?.(data);
      setShowTokenForm(false);
    } catch (e) {
      toast.error(e.response?.data?.message || "Token invalid. Try again.");
    } finally {
      setUpgradingToken(false);
    }
  };

  /* ── disconnect ── */
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

  /* ── connected state ── */
  if (connected) {
    return (
      <div className={`border border-emerald-200 bg-emerald-50/80 ${compact ? "p-3" : "p-4"} space-y-3`}>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <p className="text-xs font-semibold text-emerald-900 font-mono">{storeUrl}</p>
          </div>
          <button type="button" onClick={disconnect} className="text-[11px] text-red-500 hover:underline">
            Disconnect
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Package className="w-2.5 h-2.5 inline mr-1" />
            Catalog synced
          </span>
          {orderTracking ? (
            <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200">
              Order tracking ✓
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setShowTokenForm((v) => !v)}
              className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 flex items-center gap-1"
            >
              Add order tracking
              {showTokenForm ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
            </button>
          )}
        </div>

        {showTokenForm && !orderTracking && (
          <div className="bg-white border border-amber-200 p-3 space-y-2 text-xs">
            <p className="font-semibold text-amber-800">Enable order tracking in DMs</p>
            <p className="text-ink-500">
              Go to{" "}
              <a href="https://admin.shopify.com" target="_blank" rel="noreferrer" className="underline text-brand-600">
                Shopify Admin
              </a>{" "}
              → Settings → Apps → Develop apps → create app → add <code className="bg-ink-100 px-1">read_orders</code> scope → install → copy Admin API token.
            </p>
            <input
              type="password"
              className="input text-xs w-full"
              placeholder="shpat_..."
              value={upgradeToken}
              onChange={(e) => setUpgradeToken(e.target.value)}
              disabled={upgradingToken}
            />
            <button
              type="button"
              onClick={doUpgradeToken}
              disabled={upgradingToken}
              className="btn btn-primary text-xs py-1.5 flex items-center gap-1.5"
            >
              {upgradingToken ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              Enable order tracking
            </button>
          </div>
        )}

        {showManageLink && (
          <p className="text-[11px] text-emerald-700">
            Your bot answers product questions automatically.{" "}
            <Link to="/dashboard/apps" className="underline font-semibold">Manage</Link>
          </p>
        )}
      </div>
    );
  }

  /* ── connect state ── */
  return (
    <div className={`space-y-3 ${compact ? "" : "border border-ink-200 bg-white p-5"}`}>
      {!compact && (
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-emerald-500 flex items-center justify-center text-white shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-sm text-ink-900">Connect your Shopify store</p>
            <p className="text-xs text-ink-500 mt-0.5">
              Enter your store name — product catalog syncs automatically, no tokens needed.
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            className="input text-sm w-full pr-32"
            placeholder="your-store-name"
            value={shop}
            onChange={(e) => { setShop(e.target.value); setError(null); }}
            onKeyDown={(e) => e.key === "Enter" && connect()}
            disabled={connecting}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-400 pointer-events-none select-none">
            .myshopify.com
          </span>
        </div>
        <button
          type="button"
          onClick={connect}
          disabled={connecting}
          className="btn btn-primary flex items-center gap-2 shrink-0"
        >
          {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
          Connect
        </button>
      </div>

      {/* Error with context-aware guidance */}
      {error && (
        <div className="border border-red-200 bg-red-50 p-3 text-xs space-y-1">
          <p className="font-semibold text-red-800 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            {error.includes("password") ? "Store is password-protected" : "Connection failed"}
          </p>
          {error.includes("password") ? (
            <p className="text-ink-600">
              Your store is in Coming Soon or development mode. Make your store live at{" "}
              <a href="https://admin.shopify.com/settings/general" target="_blank" rel="noreferrer" className="underline text-brand-600">
                Shopify Admin → Online Store → Preferences
              </a>{" "}
              by removing the password, then try again.
            </p>
          ) : error.includes("not found") || error.includes("404") ? (
            <p className="text-ink-600">Store not found. Double-check the name — it should be the part before <code>.myshopify.com</code>.</p>
          ) : (
            <p className="text-ink-600">{error}</p>
          )}
        </div>
      )}

      <p className="text-[11px] text-ink-400">
        Works with any live Shopify store. No tokens, no admin setup — just enter your store name.
      </p>
    </div>
  );
}
