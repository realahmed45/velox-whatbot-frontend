/**
 * Shopify connect component.
 *
 * PRIMARY FLOW — Shopify OAuth (one-click):
 *   Merchant enters store name → we redirect to Shopify OAuth → merchant
 *   clicks "Install" → Shopify redirects back with token automatically.
 *   Works on password-protected stores. No manual token copying. Ever.
 *
 * FALLBACK — if OAuth not configured on server, shows manual token form.
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
  ArrowRight,
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

  // Manual token fallback (only shown if server has no OAuth configured)
  const [showManual, setShowManual] = useState(false);
  const [adminToken, setAdminToken] = useState("");
  const [savingToken, setSavingToken] = useState(false);

  // Order tracking upgrade (for already-connected storefront stores)
  const [showTokenForm, setShowTokenForm] = useState(false);
  const [upgradeToken, setUpgradeToken] = useState("");
  const [upgradingToken, setUpgradingToken] = useState(false);

  /* ── PRIMARY: OAuth one-click connect ── */
  const connect = async () => {
    const s = shop.trim();
    if (!s) return toast.error("Enter your store name");
    setConnecting(true);
    try {
      const { data } = await api.get("/integrations/shopify/oauth-url", {
        params: { shop: s },
      });

      if (data.fallbackManual) {
        // OAuth not configured on server — show manual form
        setShowManual(true);
        setConnecting(false);
        return;
      }

      if (data.url) {
        // Redirect to Shopify — merchant clicks "Install", comes back automatically
        window.location.href = data.url;
        return;
      }

      throw new Error("Unexpected response from server");
    } catch (e) {
      setConnecting(false);
      const msg = e.response?.data?.message || "Could not start Shopify connection. Try again.";
      toast.error(msg);
    }
  };

  /* ── FALLBACK: manual Admin API token ── */
  const connectManual = async () => {
    const s = shop.trim();
    const t = adminToken.trim();
    if (!s) return toast.error("Enter your store name");
    if (!t) return toast.error("Paste your Admin API access token");
    setSavingToken(true);
    try {
      const { data } = await api.post("/integrations/shopify", {
        storeUrl: s,
        accessToken: t,
      });
      toast.success(`Connected! ${data.productCount ?? 0} products synced.`);
      await fetchWorkspace(activeWorkspace);
      onConnected?.(data);
    } catch (e) {
      toast.error(e.response?.data?.message || "Token invalid. Check and try again.");
    } finally {
      setSavingToken(false);
    }
  };

  /* ── upgrade existing connection to admin token (adds order tracking) ── */
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
          ) : authMethod !== "oauth" ? (
            <button
              type="button"
              onClick={() => setShowTokenForm((v) => !v)}
              className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 flex items-center gap-1"
            >
              Add order tracking
              {showTokenForm ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
            </button>
          ) : null}
        </div>

        {showTokenForm && !orderTracking && (
          <div className="bg-white border border-amber-200 p-3 space-y-2 text-xs">
            <p className="font-semibold text-amber-800">Enable order tracking in DMs</p>
            <p className="text-ink-500">
              Create a custom app in{" "}
              <a href="https://admin.shopify.com" target="_blank" rel="noreferrer" className="underline text-brand-600">
                Shopify admin
              </a>{" "}
              → Settings → Apps → Develop apps → give it <code className="bg-ink-100 px-1">read_orders</code> scope → copy Admin API token.
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
            Your bot answers product and order questions automatically.{" "}
            <Link to="/dashboard/apps" className="underline font-semibold">Manage</Link>
          </p>
        )}
      </div>
    );
  }

  /* ── connect state ── */
  return (
    <div className={`space-y-4 ${compact ? "" : "border border-ink-200 bg-white p-5"}`}>
      {!compact && (
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-emerald-500 flex items-center justify-center text-white shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-sm text-ink-900">Connect your Shopify store</p>
            <p className="text-xs text-ink-500 mt-0.5">
              Enter your store name and we'll handle the rest — no tokens, no setup.
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
            onChange={(e) => setShop(e.target.value)}
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
          {connecting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Link2 className="w-4 h-4" />
              Connect
            </>
          )}
        </button>
      </div>

      <p className="text-[11px] text-ink-400 flex items-center gap-1">
        <ArrowRight className="w-3 h-3 shrink-0" />
        You'll be redirected to Shopify to approve the connection — then automatically brought back.
      </p>

      {/* Manual token fallback (only shown if server OAuth not configured) */}
      {showManual && (
        <div className="border border-ink-200 bg-ink-50 p-3 space-y-2 text-xs">
          <p className="font-semibold text-ink-800">Admin API token</p>
          <p className="text-ink-500">
            Go to{" "}
            <a href="https://admin.shopify.com" target="_blank" rel="noreferrer" className="underline text-brand-600">
              Shopify Admin
            </a>{" "}
            → Settings → Apps → Develop apps → create an app → give it{" "}
            <code className="bg-ink-200 px-0.5">read_products, read_orders</code> scope → install → copy the Admin API access token.
          </p>
          <input
            type="password"
            className="input text-xs w-full"
            placeholder="shpat_..."
            value={adminToken}
            onChange={(e) => setAdminToken(e.target.value)}
            disabled={savingToken}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={connectManual}
            disabled={savingToken}
            className="btn btn-primary text-xs py-1.5 flex items-center gap-1.5"
          >
            {savingToken ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
            Save token &amp; connect
          </button>
        </div>
      )}
    </div>
  );
}
