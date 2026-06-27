import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "@/services/api";
import toast from "react-hot-toast";
import {
  Mail,
  Check,
  Loader2,
  Link2,
  Unlink,
  ExternalLink,
  Workflow,
  Package,
} from "lucide-react";
import { Link } from "react-router-dom";
import IntegrationsTabs from "./IntegrationsTabs";
import PageHeader from "@/components/ui/PageHeader";
import ShopifyConnect from "@/components/integrations/ShopifyConnect";
import { AppWindow } from "lucide-react";
import { ShopifyIcon } from "@/components/icons/BrandIcons";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";

const APP_TABS = [
  { id: "shopify", label: "Shopify" },
  { id: "make", label: "Make.com" },
  { id: "mailchimp", label: "Mailchimp" },
];

export default function AppsIntegrationsPage() {
  const shopifyRef = useRef(null);
  const makeRef = useRef(null);
  const mailchimpRef = useRef(null);
  const [activeTab, setActiveTab] = useState("shopify");
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { fetchWorkspace } = useWorkspaceStore();
  const { activeWorkspace } = useAuthStore();

  const refs = { shopify: shopifyRef, make: makeRef, mailchimp: mailchimpRef };

  // Handle OAuth callback — ?shopify=connected or ?shopify=error
  useEffect(() => {
    const status = searchParams.get("shopify");
    const shop = searchParams.get("shop");
    if (status === "connected") {
      toast.success(`✅ Shopify connected${shop ? ` — ${shop}` : ""}! Your bot now knows your full catalog.`);
      fetchWorkspace(activeWorkspace);
      // Clean URL then redirect to AI Bot
      setSearchParams({}, { replace: true });
      setTimeout(() => navigate("/dashboard/ai-bot"), 1200);
    } else if (status === "error") {
      const reason = searchParams.get("reason");
      const msgs = {
        hmac: "Security check failed. Please try again.",
        missing: "Connection was cancelled.",
        state: "Session expired. Please try again.",
        exchange: "Couldn't exchange tokens with Shopify. Try again.",
      };
      toast.error(`Shopify connection failed: ${msgs[reason] || "Unknown error"}`);
      setSearchParams({}, { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const scrollTo = (id) => {
    setActiveTab(id);
    refs[id]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div>
      <IntegrationsTabs />
      <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
        <PageHeader
          icon={AppWindow}
          title="Apps"
          subtitle="Plug Botlify into Shopify, Make.com, and your marketing stack"
        />

        {/* ── App navigation tabs ── */}
        <div className="flex items-center gap-0 border-b border-ink-200">
          {APP_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => scrollTo(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition ${
                activeTab === tab.id
                  ? "border-ink-900 text-ink-900"
                  : "border-transparent text-ink-500 hover:text-ink-800 hover:border-ink-300"
              }`}
            >
              {tab.id === "shopify" && <ShopifyIcon className="w-4 h-4 text-[#96BF48]" />}
              {tab.id === "make" && <Workflow className="w-4 h-4 text-[#6D00CC]" />}
              {tab.id === "mailchimp" && <Mail className="w-4 h-4 text-[#C21325]" />}
              {tab.label}
            </button>
          ))}
        </div>

        <div ref={shopifyRef} className="scroll-mt-4">
          <ShopifyCard />
        </div>
        <div ref={makeRef} className="scroll-mt-4">
          <MakeCard />
        </div>
        <div ref={mailchimpRef} className="scroll-mt-4">
          <MailchimpCard />
        </div>
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

  useEffect(() => { load(); }, []);

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

  const handleConnected = () => load();

  return (
    <div className="card !rounded-none overflow-hidden">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-[#96BF48] flex items-center justify-center text-white shrink-0">
          <ShopifyIcon className="w-8 h-8" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-lg text-ink-900">Shopify</h3>
            {state.connected ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold border border-emerald-200 bg-emerald-50 text-emerald-700">
                <Check className="w-3 h-3" /> Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold border border-ink-200 bg-ink-50 text-ink-500">
                Not connected
              </span>
            )}
          </div>
          <p className="text-sm text-ink-500 mt-1">
            Connect your Shopify store — your bot instantly knows your products, prices, and inventory.
          </p>

          {loading ? (
            <div className="flex items-center gap-2 mt-4 text-sm text-ink-400">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading…
            </div>
          ) : (
            <div className="mt-4">
              {state.connected && (
                <div className="flex items-center gap-3 mb-4 p-3 border border-emerald-100 bg-emerald-50/40">
                  <div className="w-8 h-8 bg-emerald-500 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink-900">
                      {state.shopName || state.storeUrl}
                    </p>
                    <p className="text-xs text-ink-500">
                      {state.productCount > 0 ? `${state.productCount} products synced to your bot` : "Store connected · bot knows your catalog"}
                    </p>
                  </div>
                  {state.orderTrackingEnabled && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold border border-blue-200 bg-blue-50 text-blue-700 shrink-0">
                      <Package className="w-3 h-3" /> Orders
                    </span>
                  )}
                </div>
              )}
              <ShopifyConnect
                connected={state.connected}
                storeUrl={state.storeUrl}
                orderTracking={state.orderTrackingEnabled}
                authMethod={state.authMethod}
                onConnected={handleConnected}
                showManageLink={false}
                redirectToAiBot={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MakeCard() {
  const [open, setOpen] = useState(false);

  const steps = [
    {
      n: "1",
      title: "Create a scenario in Make.com",
      desc: (
        <>
          Go to{" "}
          <a href="https://make.com" target="_blank" rel="noreferrer" className="text-brand-600 hover:underline inline-flex items-center gap-0.5">
            make.com <ExternalLink className="w-3 h-3" />
          </a>{" "}
          → <strong>Create a new scenario</strong> → click the <strong>+</strong> circle → search <strong>Webhooks</strong> → pick <strong>Custom webhook</strong>.
        </>
      ),
    },
    {
      n: "2",
      title: "Copy your webhook URL from Make",
      desc: <>Make will show you a URL like <code className="text-xs bg-ink-100 px-1.5 py-0.5 rounded font-mono">https://hook.us2.make.com/abc123…</code> — copy it.</>,
    },
    {
      n: "3",
      title: "Paste it into Botlify Webhooks",
      desc: (
        <>
          Go to the{" "}
          <Link to="/dashboard/integrations" className="text-brand-600 hover:underline font-medium">
            Webhooks tab →
          </Link>{" "}
          click <strong>New Webhook</strong> → paste the URL → select the events you want → click <strong>Create</strong>.
        </>
      ),
    },
    {
      n: "4",
      title: "Click 'Run once' in Make, then test in Botlify",
      desc: <>In Make click <strong>Run once</strong> (bottom left) so it listens — then click the <strong>send icon</strong> on your webhook in Botlify. Make will capture the data structure and you're live.</>,
    },
    {
      n: "5",
      title: "Add your action in Make",
      desc: <>Click the <strong>+</strong> in Make after the webhook trigger — connect Google Sheets, Gmail, Slack, HubSpot, or any of 1,000+ apps to do something with every DM, lead, or event.</>,
    },
  ];

  const events = [
    { key: "dm.received", label: "New DM", desc: "Someone messages your Instagram" },
    { key: "dm.sent", label: "Bot replied", desc: "Your bot sent a response" },
    { key: "comment.received", label: "New comment", desc: "Someone commented on your post" },
    { key: "lead.created", label: "Lead captured", desc: "Email or phone detected in a DM" },
    { key: "flow.completed", label: "Flow finished", desc: "A conversation flow completed" },
    { key: "contact.tagged", label: "Contact tagged", desc: "A tag was added to a contact" },
  ];

  return (
    <div className="card !rounded-none">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-[#6D00CC] flex items-center justify-center text-white shrink-0">
          <Workflow className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-lg text-ink-900">Make.com</h3>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold border border-violet-200 bg-violet-50 text-violet-700">
              Webhook-based
            </span>
          </div>
          <p className="text-sm text-ink-500 mt-1">
            Connect Botlify to <strong>1,000+ apps</strong> — automatically push every DM, lead, and flow completion into Google Sheets, Gmail, HubSpot, Slack, Notion, and more. No code, no developer needed.
          </p>

          {/* ── What you can do ── */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { icon: "📊", title: "Log to Google Sheets", desc: "Every DM & lead auto-logged" },
              { icon: "📧", title: "Email your team", desc: "Instant alerts for new leads" },
              { icon: "🔗", title: "Push to your CRM", desc: "HubSpot, Notion, Airtable…" },
            ].map((b) => (
              <div key={b.title} className="p-3 border border-ink-100 bg-ink-50/50 rounded-sm">
                <div className="text-lg mb-0.5">{b.icon}</div>
                <p className="text-xs font-semibold text-ink-900">{b.title}</p>
                <p className="text-xs text-ink-500">{b.desc}</p>
              </div>
            ))}
          </div>

          {/* ── Events ── */}
          <div className="mt-4">
            <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-2">Events Botlify sends to Make</p>
            <div className="flex flex-wrap gap-1.5">
              {events.map((e) => (
                <span key={e.key} title={e.desc} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono border border-violet-200 bg-violet-50 text-violet-700 cursor-default">
                  {e.key}
                </span>
              ))}
            </div>
          </div>

          {/* ── Setup steps ── */}
          <div className="mt-4">
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              <Workflow className="w-4 h-4" />
              {open ? "Hide setup guide" : "How to set up Make.com →"}
            </button>

            {open && (
              <div className="mt-3 space-y-3">
                {steps.map((s) => (
                  <div key={s.n} className="flex gap-3">
                    <div className="w-6 h-6 bg-[#6D00CC] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {s.n}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink-900">{s.title}</p>
                      <p className="text-sm text-ink-500 mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
                <div className="p-3 border border-amber-200 bg-amber-50 text-xs text-amber-800 mt-2">
                  💡 <strong>Pro tip:</strong> In Make, click <strong>"Immediately as data arrives"</strong> toggle so your scenario runs in real-time — not on a schedule.
                </div>
              </div>
            )}
          </div>

          {/* ── CTAs ── */}
          <div className="flex items-center gap-3 mt-4 flex-wrap">
            <Link
              to="/dashboard/integrations"
              className="btn btn-primary inline-flex items-center gap-2"
            >
              <Link2 className="w-4 h-4" /> Set up webhooks
            </Link>
            <a
              href="https://make.com"
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline inline-flex items-center gap-2 text-sm"
            >
              Open Make.com <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
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
    <div className="card !rounded-none">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-[#FFE01B] flex items-center justify-center text-black">
          <Mail className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg text-ink-900">Mailchimp</h3>
            {state.connected ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold border border-emerald-200 bg-emerald-50 text-emerald-700">
                <Check className="w-3 h-3" />
                Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold border border-ink-200 bg-ink-50 text-ink-500">
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
