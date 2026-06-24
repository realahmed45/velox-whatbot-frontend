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
    scopes: { products: false, orders: false },
    orderTrackingEnabled: false,
  });
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/integrations/shopify");
      setState(data.shopify || { connected: false });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const { data } = await api.get("/integrations/shopify/products");
      setProducts(data.products || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  return (
    <div className="card">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-md bg-emerald-500 flex items-center justify-center text-white">
          <ShoppingBag className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg text-ink-900">Shopify</h3>
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
            One login — your bot gets live products, prices, and order tracking in
            DMs. Works for any store, any industry.
          </p>

          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-ink-400 mt-3" />
          ) : (
            <div className="mt-4 space-y-3">
              <ShopifyConnect
                connected={state.connected}
                storeUrl={state.storeUrl}
                orderTracking={state.orderTrackingEnabled}
                onConnected={load}
                showManageLink={false}
              />
              {state.connected && (
                <button onClick={loadProducts} className="btn btn-outline">
                  Preview products
                </button>
              )}
              {products.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
                  {products.slice(0, 12).map((p) => (
                    <a
                      key={p.id}
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="border border-ink-200 rounded-lg p-2 hover:border-brand-400 transition text-xs"
                    >
                      {p.image && (
                        <img
                          src={p.image}
                          alt={p.title}
                          className="w-full aspect-square object-cover rounded mb-1"
                        />
                      )}
                      <p className="font-medium truncate">{p.title}</p>
                      <p className="text-ink-500">{p.price}</p>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
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
