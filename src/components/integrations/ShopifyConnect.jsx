/**
 * ShopifyConnect — ManyChat-style OAuth flow.
 *
 * User enters their store name → clicks "Connect with Shopify" →
 * redirected to Shopify login → returns to /dashboard/apps?shopify=connected
 *
 * Falls back to manual storefront if OAuth not configured on server.
 */
import { useState } from "react";
import {
  Loader2,
  CheckCircle2,
  Package,
  Unlink,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { ShopifyIcon } from "@/components/icons/BrandIcons";

export default function ShopifyConnect({
  connected = false,
  storeUrl = "",
  orderTracking = false,
  authMethod = null,
  onConnected,
  compact = false,
  showManageLink = true,
  redirectToAiBot = false,
}) {
  const { activeWorkspace } = useAuthStore();
  const { fetchWorkspace } = useWorkspaceStore();

  const [shop, setShop] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTokenForm, setShowTokenForm] = useState(false);
  const [upgradeToken, setUpgradeToken] = useState("");
  const [upgradingToken, setUpgradingToken] = useState(false);

  /* ── OAuth connect — ManyChat-style ── */
  const connectOAuth = async () => {
    const s = shop.trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/\.myshopify\.com.*$/, "")
      .replace(/\/$/, "");

    if (!s) return toast.error("Enter your store name first");
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.get("/integrations/shopify/oauth-url", {
        params: { shop: s },
      });

      if (data.fallbackManual) {
        // OAuth not yet configured — use storefront fallback
        await connectStorefront(s);
        return;
      }

      // Redirect to Shopify — merchant logs in and approves
      window.location.href = data.url;
    } catch (e) {
      const msg = e.response?.data?.message || "Couldn't start Shopify login. Try again.";
      setError(msg);
      setLoading(false);
    }
  };

  /* ── Storefront fallback (used when OAuth keys not yet set on server) ── */
  const connectStorefront = async (storeName) => {
    try {
      const { data } = await api.post("/integrations/shopify/storefront", {
        storeUrl: storeName,
      });
      toast.success(`✅ Connected! ${data.products} products synced.`);
      await fetchWorkspace(activeWorkspace);
      onConnected?.(data);
    } catch (e) {
      const msg = e.response?.data?.message || "Could not connect to that store.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ── Upgrade to order tracking (admin token) ── */
  const doUpgradeToken = async () => {
    const t = upgradeToken.trim();
    if (!t) return toast.error("Paste your Admin API access token");
    setUpgradingToken(true);
    try {
      await api.post("/integrations/shopify", { storeUrl, accessToken: t });
      toast.success("Order tracking enabled!");
      await fetchWorkspace(activeWorkspace);
      onConnected?.({});
      setShowTokenForm(false);
    } catch (e) {
      toast.error(e.response?.data?.message || "Token invalid.");
    } finally {
      setUpgradingToken(false);
    }
  };

  /* ── Disconnect ── */
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

  /* ── Connected state ── */
  if (connected) {
    return (
      <div className={`border border-emerald-200 bg-emerald-50/60 ${compact ? "p-3" : "p-4"} space-y-3`}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-sm font-semibold text-emerald-900 font-mono">
              {storeUrl}
            </span>
          </div>
          <button
            type="button"
            onClick={disconnect}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-500 hover:text-red-700 transition"
          >
            <Unlink className="w-3 h-3" /> Disconnect
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Package className="w-3 h-3" /> Catalog synced
          </span>
          {authMethod === "oauth" && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200">
              OAuth ✓
            </span>
          )}
          {orderTracking ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200">
              Order tracking ✓
            </span>
          ) : (
            authMethod !== "oauth" && (
              <button
                type="button"
                onClick={() => setShowTokenForm((v) => !v)}
                className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition"
              >
                + Order tracking
                {showTokenForm ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
              </button>
            )
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
              → Apps → Develop apps → create app → add <code className="bg-ink-100 px-0.5">read_orders</code> scope → install → copy Admin API token.
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
              {upgradingToken && <Loader2 className="w-3 h-3 animate-spin" />}
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

  /* ── Connect state — ManyChat-style OAuth ── */
  return (
    <div className={`space-y-3 ${compact ? "" : "border border-ink-200 bg-white p-5"}`}>
      {!compact && (
        <div className="space-y-1 mb-3">
          <p className="text-sm font-semibold text-ink-900">Connect your Shopify store</p>
          <p className="text-xs text-ink-500">
            Enter your store name and click Connect — you'll be taken to Shopify to log in and approve. One click, done.
          </p>
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
            onKeyDown={(e) => e.key === "Enter" && connectOAuth()}
            disabled={loading}
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
          onClick={connectOAuth}
          disabled={loading}
          className="btn btn-primary flex items-center gap-2 shrink-0"
        >
          {loading
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <ShopifyIcon className="w-4 h-4" />
          }
          {loading ? "Connecting…" : "Connect with Shopify"}
        </button>
      </div>

      {error && (
        <div className="border border-red-200 bg-red-50 p-3 text-xs space-y-1">
          <p className="font-semibold text-red-800 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            {error.includes("password") ? "Store is password-protected" : "Connection failed"}
          </p>
          {error.includes("password") ? (
            <p className="text-ink-600">
              Your store is in Coming Soon mode. Remove the password at{" "}
              <a href="https://admin.shopify.com/settings/general" target="_blank" rel="noreferrer" className="underline text-brand-600">
                Shopify Admin → Online Store → Preferences
              </a>{" "}
              then try again.
            </p>
          ) : (
            <p className="text-ink-600">{error}</p>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 text-[11px] text-ink-400">
        <ExternalLink className="w-3 h-3 shrink-0" />
        <span>You'll be redirected to Shopify to log in — we never see your password.</span>
      </div>
    </div>
  );
}

