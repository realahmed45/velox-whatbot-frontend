import { useEffect, useState } from "react";
import api from "@/services/api";
import toast from "react-hot-toast";
import {
  ShoppingBag,
  Mail,
  Check,
  X,
  Loader2,
  Link2,
  Unlink,
  ExternalLink,
  Workflow,
} from "lucide-react";
import { Link } from "react-router-dom";
import IntegrationsTabs from "./IntegrationsTabs";
import PageHeader from "@/components/ui/PageHeader";
import ShopifyConnect from "@/components/integrations/ShopifyConnect";
import { AppWindow } from "lucide-react";

export default function AppsIntegrationsPage() {
  return (
    <div>
      <IntegrationsTabs />
      <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
        <PageHeader
          icon={AppWindow}
          title="Apps"
          subtitle="Plug Botlify into Shopify, Make.com, and your marketing stack"
        />

        <ShopifyCard />
        <MakeCard />
        <MailchimpCard />
      </div>
    </div>
  );
}

function ShopifyCard() {
  const [state, setState] = useState({
    connected: false,
    storeUrl: "",
    productCount: 0,
    orderTrackingEnabled: false,
    authMethod: null,
    shopName: null,
  });
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsFetched, setProductsFetched] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/integrations/shopify");
      setState(data.shopify || { connected: false });
      // Auto-load products when already connected
      if (data.shopify?.connected) {
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const { data } = await api.get("/integrations/shopify/products");
      setProducts(data.products || []);
      setProductsFetched(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleConnected = (data) => {
    load();
  };

  return (
    <div className="card overflow-hidden">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
          <ShoppingBag className="w-7 h-7" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-lg text-ink-900">Shopify</h3>
            {state.connected ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                <Check className="w-3 h-3" /> Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-ink-100 text-ink-500 text-xs font-medium">
                Not connected
              </span>
            )}
          </div>
          <p className="text-sm text-ink-500 mt-1">
            Connect your store — your bot instantly knows your products, prices, and inventory. Works for any Shopify store, no admin setup required.
          </p>

          {loading ? (
            <div className="flex items-center gap-2 mt-4 text-sm text-ink-400">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading…
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <ShopifyConnect
                connected={state.connected}
                storeUrl={state.storeUrl}
                orderTracking={state.orderTrackingEnabled}
                authMethod={state.authMethod}
                onConnected={handleConnected}
                showManageLink={false}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Product showcase ── */}
      {state.connected && !loading && (
        <div className="mt-6 pt-5 border-t border-ink-100">
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <div>
              <p className="text-sm font-bold text-ink-900 flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                {state.shopName || state.storeUrl} — imported catalog
              </p>
              <p className="text-xs text-ink-500 mt-0.5">
                {state.productCount > 0
                  ? `${state.productCount} products synced · your bot knows all of them`
                  : "Your bot has access to all your live products"}
              </p>
            </div>
            <button
              onClick={fetchProducts}
              disabled={loadingProducts}
              className="btn btn-outline text-xs flex items-center gap-1.5"
            >
              {loadingProducts ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <ExternalLink className="w-3 h-3" />
              )}
              {productsFetched ? "Refresh" : "Preview catalog"}
            </button>
          </div>

          {loadingProducts && !productsFetched && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-lg border border-ink-100 bg-ink-50 aspect-square animate-pulse" />
              ))}
            </div>
          )}

          {productsFetched && products.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {products.slice(0, 12).map((p) => (
                <a
                  key={p.id}
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group border border-ink-100 rounded-xl overflow-hidden hover:border-emerald-300 hover:shadow-md transition-all duration-200 bg-white"
                >
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.title}
                      className="w-full aspect-square object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-square bg-ink-50 flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-ink-300" />
                    </div>
                  )}
                  <div className="p-2">
                    <p className="text-[11px] font-semibold text-ink-800 truncate leading-tight">
                      {p.title}
                    </p>
                    {p.price && (
                      <p className="text-[11px] font-bold text-emerald-700 mt-0.5">
                        {p.currency} {p.price}
                      </p>
                    )}
                    <p className="text-[10px] mt-0.5">
                      {p.inStock ? (
                        <span className="text-emerald-600">In stock</span>
                      ) : (
                        <span className="text-red-400">Out of stock</span>
                      )}
                    </p>
                  </div>
                </a>
              ))}
              {products.length > 12 && (
                <div className="border border-dashed border-ink-200 rounded-xl flex items-center justify-center aspect-square bg-ink-50">
                  <p className="text-xs text-ink-400 text-center px-2">
                    +{products.length - 12} more products
                  </p>
                </div>
              )}
            </div>
          )}

          {productsFetched && products.length === 0 && (
            <div className="border border-dashed border-ink-200 rounded-xl p-6 text-center bg-ink-50/50">
              <p className="text-sm text-ink-500">No published products found in this store yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MakeCard() {
  return (
    <div className="card">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-md bg-violet-600 flex items-center justify-center text-white">
          <Workflow className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-ink-900">Make.com</h3>
          <p className="text-sm text-ink-500 mt-1">
            Send Botlify events to Make (new DMs, leads, flow completions) and
            trigger automations anywhere — no code.
          </p>
          <Link to="/dashboard/integrations" className="btn btn-outline mt-4 inline-flex items-center gap-2">
            <Link2 className="w-4 h-4" /> Set up webhooks
          </Link>
        </div>
      </div>
    </div>
  );
}

function MailchimpCard() {
  const [state, setState] = useState({ connected: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ apiKey: "", listId: "" });
  const [lists, setLists] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/integrations/mailchimp");
      setState(data.mailchimp || { connected: false });
      if (data.mailchimp?.connected) loadLists();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadLists = async () => {
    try {
      const { data } = await api.get("/integrations/mailchimp/lists");
      setLists(data.lists || []);
    } catch {}
  };

  const connect = async () => {
    if (!form.apiKey) return toast.error("API key required");
    setSaving(true);
    try {
      await api.post("/integrations/mailchimp", form);
      toast.success("Connected to Mailchimp");
      setForm({ apiKey: "", listId: "" });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const selectList = async (listId) => {
    try {
      await api.post("/integrations/mailchimp", { listId });
      toast.success("Audience selected");
      load();
    } catch {
      toast.error("Failed");
    }
  };

  const disconnect = async () => {
    if (!window.confirm("Disconnect Mailchimp?")) return;
    try {
      await api.delete("/integrations/mailchimp");
      toast.success("Disconnected");
      setLists([]);
      load();
    } catch {
      toast.error("Failed");
    }
  };

  return (
    <div className="card">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-md bg-yellow-400 flex items-center justify-center text-black">
          <Mail className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg text-ink-900">Mailchimp</h3>
            {state.connected ? (
              <span className="chip bg-emerald-100 text-emerald-700 text-xs">
                <Check className="w-3 h-3 inline mr-1" />
                Connected
              </span>
            ) : (
              <span className="chip bg-ink-100 text-ink-500 text-xs">
                Not connected
              </span>
            )}
          </div>
          <p className="text-sm text-ink-500 mt-1">
            Auto-forward emails captured in DMs to your Mailchimp audience for
            follow-up campaigns.
          </p>

          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-ink-400 mt-3" />
          ) : state.connected ? (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-ink-600">
                Connected · DC:{" "}
                <code className="font-mono">{state.serverPrefix}</code>
              </p>
              {lists.length > 0 && (
                <div>
                  <label className="label">Selected Audience</label>
                  <select
                    className="input"
                    value={state.listId || ""}
                    onChange={(e) => selectList(e.target.value)}
                  >
                    <option value="">— Choose an audience —</option>
                    {lists.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name} ({l.members} members)
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <button
                onClick={disconnect}
                className="btn btn-outline text-red-600"
              >
                <Unlink className="w-4 h-4" /> Disconnect
              </button>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              <input
                className="input text-sm font-mono"
                type="password"
                placeholder="Mailchimp API key (e.g. abc…-us1)"
                value={form.apiKey}
                onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={connect}
                  disabled={saving}
                  className="btn btn-primary"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Link2 className="w-4 h-4" />
                  )}
                  Connect
                </button>
                <a
                  href="https://mailchimp.com/help/about-api-keys/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-brand-600 hover:underline flex items-center gap-1"
                >
                  Get API key <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
