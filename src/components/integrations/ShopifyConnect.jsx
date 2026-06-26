/**
 * Shopify connect — manual Admin API token flow.
 * Clear step-by-step instructions guide the user to get their token in < 2 min.
 */
import { useState } from "react";
import { Link2, Loader2, ShoppingBag, CheckCircle2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";

const STEPS = [
  {
    n: 1,
    text: (
      <>
        Go to your Shopify admin →{" "}
        <strong>Settings → Apps and sales channels</strong>
      </>
    ),
  },
  {
    n: 2,
    text: (
      <>
        Click <strong>Develop apps</strong> → <strong>Create an app</strong> →
        name it anything (e.g. "Botlify")
      </>
    ),
  },
  {
    n: 3,
    text: (
      <>
        Inside the app → <strong>Configuration</strong> → under Admin API access
        scopes tick <strong>read_products</strong> &amp;{" "}
        <strong>read_orders</strong> → Save
      </>
    ),
  },
  {
    n: 4,
    text: (
      <>
        Click <strong>API credentials</strong> tab → <strong>Install app</strong>{" "}
        → <strong>Reveal token once</strong> → copy it (starts with{" "}
        <span className="font-mono">shpat_</span>)
      </>
    ),
  },
];

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
  const [token, setToken] = useState("");
  const [connecting, setConnecting] = useState(false);

  const connect = async () => {
    const s = shop.trim();
    const t = token.trim();
    if (!s) return toast.error("Enter your store name");
    if (!t) return toast.error("Paste your Admin API access token");
    setConnecting(true);
    try {
      const { data } = await api.post("/integrations/shopify", {
        storeUrl: s,
        accessToken: t,
      });
      toast.success(`Connected! ${data.products} products synced.`);
      await fetchWorkspace(activeWorkspace);
      onConnected?.(data);
    } catch (e) {
      toast.error(
        e.response?.data?.message ||
          "Connection failed — double-check your store name and token."
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
            Connected ·{" "}
            <span className="font-mono">{storeUrl}</span>
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
    <div className={`space-y-4 ${compact ? "" : "border border-ink-200 bg-white p-5"}`}>
      {!compact && (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 flex items-center justify-center text-white shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-sm text-ink-900">Connect your Shopify store</p>
            <p className="text-xs text-ink-500">
              Takes about 2 minutes. Follow the steps below, then paste your token here.
            </p>
          </div>
        </div>
      )}

      {/* Step-by-step instructions */}
      <div className="bg-ink-50 border border-ink-100 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide">How to get your token</p>
          <a
            href="https://admin.shopify.com/store"
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-brand-600 hover:underline flex items-center gap-1"
          >
            Open Shopify admin <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        {STEPS.map((s) => (
          <div key={s.n} className="flex gap-3 items-start">
            <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              {s.n}
            </span>
            <p className="text-xs text-ink-600 leading-relaxed">{s.text}</p>
          </div>
        ))}
        <div className="flex gap-3 items-start">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <p className="text-xs text-ink-600">
            Paste your token and store name below → click <strong>Connect</strong>
          </p>
        </div>
      </div>

      {/* Input fields */}
      <div className="space-y-2">
        <div className="relative">
          <input
            type="text"
            className="input text-sm w-full pr-32"
            placeholder="your-store"
            value={shop}
            onChange={(e) => setShop(e.target.value)}
            disabled={connecting}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-400 pointer-events-none">
            .myshopify.com
          </span>
        </div>
        <input
          type="password"
          className="input text-sm w-full"
          placeholder="Admin API access token  (shpat_...)"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && connect()}
          disabled={connecting}
        />
        <button
          type="button"
          onClick={connect}
          disabled={connecting}
          className="btn btn-primary w-full flex items-center justify-center gap-2"
        >
          {connecting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Link2 className="w-4 h-4" />
          )}
          Connect Shopify
        </button>
      </div>
    </div>
  );
}
