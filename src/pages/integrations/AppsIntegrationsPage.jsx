import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
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
  ChevronRight,
  RefreshCw,
  Zap,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Eye,
  EyeOff,
  Clock,
  Play,
  Pause,
  Search,
} from "lucide-react";
import IntegrationsTabs from "./IntegrationsTabs";
import PageHeader from "@/components/ui/PageHeader";
import ShopifyConnect from "@/components/integrations/ShopifyConnect";
import { AppWindow } from "lucide-react";
import { ShopifyIcon } from "@/components/icons/BrandIcons";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";

const APP_TABS = [
  { id: "make", label: "Make.com" },
  { id: "mailchimp", label: "Mailchimp" },
  { id: "shopify", label: "Shopify" },
];

export default function AppsIntegrationsPage() {
  const makeRef = useRef(null);
  const mailchimpRef = useRef(null);
  const shopifyRef = useRef(null);
  const [activeTab, setActiveTab] = useState("make");
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { fetchWorkspace } = useWorkspaceStore();
  const { activeWorkspace } = useAuthStore();

  const refs = { make: makeRef, mailchimp: mailchimpRef, shopify: shopifyRef };

  useEffect(() => {
    const status = searchParams.get("shopify");
    const shop = searchParams.get("shop");
    if (status === "connected") {
      toast.success(`✅ Shopify connected${shop ? ` — ${shop}` : ""}!`);
      fetchWorkspace(activeWorkspace);
      setSearchParams({}, { replace: true });
      setTimeout(() => navigate("/dashboard/ai-bot"), 1200);
    } else if (status === "error") {
      const reason = searchParams.get("reason");
      const msgs = {
        hmac: "Security check failed.",
        missing: "Connection was cancelled.",
        state: "Session expired.",
        exchange: "Token exchange failed.",
      };
      toast.error(`Shopify: ${msgs[reason] || "Unknown error"}`);
      setSearchParams({}, { replace: true });
    }
  }, []); // eslint-disable-line

  const scrollTo = (id) => {
    setActiveTab(id);
    refs[id]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div>
      <IntegrationsTabs />
      <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8">
        <PageHeader
          icon={AppWindow}
          title="Apps"
          subtitle="Connect Botlify to your existing tools — no code, no manual setup"
        />

        {/* Tab nav */}
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
              {tab.id === "make" && <Workflow className="w-4 h-4 text-[#6D00CC]" />}
              {tab.id === "mailchimp" && <Mail className="w-4 h-4 text-[#C21325]" />}
              {tab.id === "shopify" && <ShopifyIcon className="w-4 h-4 text-[#96BF48]" />}
              {tab.label}
              {tab.id === "shopify" && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full leading-none">
                  Soon
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div ref={makeRef} className="scroll-mt-4">
          <MakeCard />
        </div>
        <div ref={mailchimpRef} className="scroll-mt-4">
          <MailchimpCard />
        </div>
        <div ref={shopifyRef} className="scroll-mt-4">
          <ShopifyComingSoon />
        </div>
      </div>
    </div>
  );
}

// ─── Make.com Card ───────────────────────────────────────────────────────────

const MAKE_EVENTS = [
  { key: "dm.received", emoji: "💬", label: "DM Received", desc: "Someone messages your Instagram" },
  { key: "dm.sent", emoji: "🤖", label: "Bot Replied", desc: "Your bot sent an automated reply" },
  { key: "comment.received", emoji: "💭", label: "Comment / Story Reply", desc: "Someone engaged with your content" },
  { key: "lead.created", emoji: "🎯", label: "New Lead", desc: "Email or phone captured from a DM" },
  { key: "flow.completed", emoji: "✅", label: "Flow Completed", desc: "A conversation flow finished" },
  { key: "contact.tagged", emoji: "🏷️", label: "Contact Tagged", desc: "A tag was added to a contact" },
];

function MakeCard() {
  const [state, setState] = useState({ connected: false, loading: true });
  const [step, setStep] = useState("connect"); // connect | scenarios | linked
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [scenarios, setScenarios] = useState([]);
  const [scenariosLoading, setScenariosLoading] = useState(false);
  const [linking, setLinking] = useState(null);
  const [search, setSearch] = useState("");
  const [disconnecting, setDisconnecting] = useState(false);
  const [popupOpened, setPopupOpened] = useState(false);
  const tokenInputRef = useRef(null);

  const [searchReadOnly, setSearchReadOnly] = useState(true);

  // Safety net: Chrome sometimes autofills the search box with saved email addresses.
  // If search ever ends up with an @ sign it's definitely autofill — clear it immediately.
  useEffect(() => {
    if (search.includes("@")) {
      setSearch("");
    }
  }, [search]);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/integrations/make");
      const m = data.make;
      setState({ ...m, loading: false });
      if (m.connected && m.linkedScenarioId) {
        setStep("linked");
      } else if (m.connected) {
        setStep("scenarios");
        fetchScenarios();
      } else {
        setStep("connect");
      }
    } catch {
      setState((s) => ({ ...s, loading: false }));
    }
  }, []); // eslint-disable-line

  useEffect(() => { load(); }, [load]);

  const fetchScenarios = async () => {
    setScenariosLoading(true);
    try {
      const { data } = await api.get("/integrations/make/scenarios");
      setScenarios(data.scenarios || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch scenarios");
    } finally {
      setScenariosLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!token.trim()) return toast.error("Paste your Make.com API token first");
    setConnecting(true);
    try {
      await api.post("/integrations/make/connect", { apiToken: token });
      toast.success("✅ Connected to Make.com!");
      setToken("");
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Connection failed");
    } finally {
      setConnecting(false);
    }
  };

  const handleLink = async (scenario) => {
    if (!scenario.hasWebhook) {
      toast.error("This scenario has no Custom Webhook trigger. Add one in Make first.");
      return;
    }
    setLinking(scenario.id);
    try {
      await api.post("/integrations/make/link", {
        scenarioId: scenario.id,
        scenarioName: scenario.name,
        webhookUrl: scenario.webhookUrl,
        hookId: scenario.hookId,
      });
      toast.success(`🎉 Linked! Botlify will now feed "${scenario.name}"`);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to link scenario");
    } finally {
      setLinking(null);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm("Disconnect Make.com? Botlify will stop sending events to your scenario.")) return;
    setDisconnecting(true);
    try {
      await api.delete("/integrations/make");
      toast.success("Make.com disconnected");
      setStep("connect");
      setState({ connected: false, loading: false });
      setScenarios([]);
    } catch {
      toast.error("Failed to disconnect");
    } finally {
      setDisconnecting(false);
    }
  };

  const filtered = scenarios.filter((s) => {
    // If the search string looks like an email (autofilled), do not filter by it (treat it as empty search)
    const cleanSearch = search.includes("@") ? "" : search;
    return s.name.toLowerCase().includes(cleanSearch.toLowerCase());
  });

  if (state.loading) {
    return (
      <div className="card !rounded-none flex items-center justify-center h-40">
        <Loader2 className="w-6 h-6 animate-spin text-ink-400" />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-none border border-ink-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-start gap-4 p-6 border-b border-ink-100 bg-gradient-to-r from-violet-50 to-white">
        <div className="w-14 h-14 bg-[#6D00CC] flex items-center justify-center text-white shrink-0 rounded-xl shadow-lg shadow-violet-200">
          <Workflow className="w-7 h-7" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-xl text-ink-900">Make.com</h3>
            {state.connected && state.linkedScenarioId ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-700 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" /> Live
              </span>
            ) : state.connected ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-700 rounded-full border border-blue-200">
                <Zap className="w-3 h-3" /> Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-ink-100 text-ink-500 rounded-full border border-ink-200">
                Not connected
              </span>
            )}
          </div>
          <p className="text-sm text-ink-500 mt-1">
            Connect to <strong>1,000+ apps</strong> — automatically push every DM, lead, and flow completion into Google Sheets, Gmail, HubSpot, Slack, Notion, and more.
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">
        {/* ── Step: CONNECT ── */}
        {step === "connect" && (
          <>
            <div className="space-y-5">
              {/* Value props */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { icon: "📊", title: "Log to Google Sheets", desc: "Every DM auto-logged" },
                  { icon: "📧", title: "Email your team", desc: "Instant alerts for new leads" },
                  { icon: "🔗", title: "Push to your CRM", desc: "HubSpot, Notion, Airtable…" },
                ].map((b) => (
                  <div key={b.title} className="p-3.5 border border-ink-100 bg-ink-50/50 rounded-xl">
                    <div className="text-xl mb-1">{b.icon}</div>
                    <p className="text-xs font-semibold text-ink-900">{b.title}</p>
                    <p className="text-xs text-ink-400 mt-0.5">{b.desc}</p>
                  </div>
                ))}
              </div>

              {/* Main connect box */}
              <div className="border-2 border-dashed border-violet-200 bg-gradient-to-b from-violet-50/60 to-white rounded-2xl p-6 space-y-5">

                {!popupOpened ? (
                  /* ── Step A: Launch popup ── */
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-[#6D00CC] rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-violet-200">
                      <Workflow className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-ink-900 text-base">Connect your Make.com account</p>
                      <p className="text-sm text-ink-500 mt-1">
                        We'll open Make.com in a small window. Copy your API token — we'll do the rest.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        window.open(
                          "https://www.make.com/en/profile",
                          "make_connect",
                          "width=960,height=700,scrollbars=yes,resizable=yes"
                        );
                        setPopupOpened(true);
                        setTimeout(() => tokenInputRef.current?.focus(), 400);
                      }}
                      className="inline-flex items-center gap-2.5 bg-[#6D00CC] hover:bg-violet-700 text-white font-bold py-3 px-6 rounded-xl transition shadow-lg shadow-violet-200 text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open Make.com — Get API Token
                    </button>

                    <p className="text-xs text-ink-400">
                      In Make → Profile (top right) → scroll to <strong>API</strong> → click <strong>"Add token"</strong>
                    </p>
                  </div>
                ) : (
                  /* ── Step B: Paste token (shown after popup launched) ── */
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span>
                        Make.com is open in another window. Go to <strong>Profile → API → Add token</strong>, copy it, then paste below.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-ink-600 mb-1.5">
                        Paste your API token
                      </label>
                      <div className="relative">
                        <input
                          ref={tokenInputRef}
                          type={showToken ? "text" : "password"}
                          value={token}
                          onChange={(e) => {
                            setToken(e.target.value);
                            // Auto-connect when a long token is pasted
                            if (e.target.value.trim().length > 20 && e.nativeEvent.inputType === "insertFromPaste") {
                              setTimeout(() => document.getElementById("make-connect-btn")?.click(), 300);
                            }
                          }}
                          onKeyDown={(e) => e.key === "Enter" && handleConnect()}
                          placeholder="Paste token here — we connect instantly…"
                          className="w-full border-2 border-violet-300 focus:border-violet-500 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-violet-200 bg-white font-mono transition"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowToken((v) => !v)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
                        >
                          {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        id="make-connect-btn"
                        onClick={handleConnect}
                        disabled={connecting || !token.trim()}
                        className="flex-1 flex items-center justify-center gap-2 bg-[#6D00CC] hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl transition text-sm shadow-md shadow-violet-100"
                      >
                        {connecting ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Connecting…</>
                        ) : (
                          <><Zap className="w-4 h-4" /> Connect — I'm in!</>
                        )}
                      </button>
                      <button
                        onClick={() => setPopupOpened(false)}
                        className="text-xs text-ink-400 hover:text-ink-600 transition px-3 py-3 rounded-xl border border-ink-200 hover:border-ink-300"
                      >
                        Back
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Events preview */}
            <div>
              <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide mb-2.5">Events Botlify will send to Make</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {MAKE_EVENTS.map((e) => (
                  <div key={e.key} className="flex items-start gap-2 p-2.5 border border-ink-100 rounded-lg bg-ink-50/30">
                    <span className="text-base leading-none mt-0.5">{e.emoji}</span>
                    <div>
                      <p className="text-xs font-semibold text-ink-800">{e.label}</p>
                      <p className="text-xs text-ink-400">{e.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Step: SCENARIOS ── */}
        {step === "scenarios" && (
          <div className="space-y-4">
            {/* Connected badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-ink-700 font-medium">
                  Connected{state.accountEmail ? ` as ${state.accountEmail}` : ""}
                </span>
              </div>
              <button
                onClick={() => { setScenariosLoading(true); fetchScenarios(); }}
                className="flex items-center gap-1.5 text-xs text-ink-500 hover:text-ink-800 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${scenariosLoading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>

            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
              <span>
                Pick the Make.com scenario you want Botlify to feed. Scenarios marked <strong>⚡ Webhook ready</strong> are ready to connect instantly. Others need a <strong>Custom Webhook</strong> trigger added in Make first.
              </span>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input
                type="text"
                readOnly={searchReadOnly}
                onFocus={() => setSearchReadOnly(false)}
                onBlur={() => setSearchReadOnly(true)}
                value={search}
                onChange={(e) => {
                  // Block browser autofill: real keystrokes always have nativeEvent.inputType set.
                  // Autofill events have no inputType (empty string or undefined).
                  if (e.nativeEvent?.inputType) {
                    setSearch(e.target.value);
                  } else {
                    // Autofill detected — reset the DOM value back to empty
                    e.target.value = "";
                    setSearch("");
                  }
                }}
                placeholder="Search your scenarios…"
                className="w-full border border-ink-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                autoComplete="off"
                data-form-type="other"
                data-lpignore="true"
              />
            </div>

            {/* Scenario list */}
            {scenariosLoading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-ink-400">
                <Loader2 className="w-6 h-6 animate-spin" />
                <p className="text-sm">Fetching your Make.com scenarios…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-8 text-ink-400 text-sm">
                {search ? "No scenarios match your search." : "No scenarios found in your Make.com account."}
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {filtered.map((s) => (
                  <div
                    key={s.id}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border transition ${
                      s.hasWebhook
                        ? "border-violet-200 bg-violet-50/40 hover:border-violet-300 hover:bg-violet-50"
                        : "border-ink-100 bg-ink-50/30 opacity-60"
                    }`}
                  >
                    {/* Status dot */}
                    <div className={`w-2 h-2 rounded-full shrink-0 ${s.isActive ? "bg-emerald-500" : "bg-ink-300"}`} />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink-900 truncate">{s.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {s.hasWebhook ? (
                          <span className="text-xs text-violet-600 font-medium flex items-center gap-1">
                            <Zap className="w-3 h-3" /> Webhook ready
                          </span>
                        ) : (
                          <span className="text-xs text-ink-400">No webhook trigger</span>
                        )}
                        <span className="text-ink-300">·</span>
                        <span className="text-xs text-ink-400 flex items-center gap-1">
                          {s.isActive ? (
                            <><Play className="w-3 h-3 text-emerald-500" /> Active</>
                          ) : (
                            <><Pause className="w-3 h-3 text-ink-300" /> Inactive</>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Action */}
                    {s.hasWebhook ? (
                      <button
                        onClick={() => handleLink(s)}
                        disabled={!!linking}
                        className="flex items-center gap-1.5 bg-[#6D00CC] hover:bg-violet-700 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition shrink-0"
                      >
                        {linking === s.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <><Link2 className="w-3.5 h-3.5" /> Connect</>
                        )}
                      </button>
                    ) : (
                      <span className="text-xs text-ink-400 shrink-0">Add webhook in Make</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="text-xs text-ink-400 hover:text-red-500 transition flex items-center gap-1"
            >
              <Unlink className="w-3.5 h-3.5" />
              {disconnecting ? "Disconnecting…" : "Disconnect Make.com account"}
            </button>
          </div>
        )}

        {/* ── Step: LINKED (success state) ── */}
        {step === "linked" && (
          <div className="space-y-5">
            {/* Success banner */}
            <div className="relative overflow-hidden rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/40 rounded-full -translate-y-8 translate-x-8" />
              <div className="relative flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-100">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-emerald-900 text-base">Make.com is live! 🎉</p>
                  <p className="text-sm text-emerald-700 mt-0.5">
                    Botlify is feeding <strong>"{state.linkedScenarioName}"</strong> in real-time
                  </p>
                  {state.accountEmail && (
                    <p className="text-xs text-emerald-600 mt-1">Account: {state.accountEmail}</p>
                  )}
                </div>
              </div>
            </div>

            {/* What's flowing */}
            <div>
              <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide mb-2.5">Events flowing to Make.com</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {MAKE_EVENTS.map((e) => (
                  <div key={e.key} className="flex items-center gap-2 p-2.5 border border-emerald-100 rounded-lg bg-emerald-50/40">
                    <span className="text-base leading-none">{e.emoji}</span>
                    <p className="text-xs font-semibold text-ink-800">{e.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Payload preview */}
            <div className="rounded-xl border border-ink-100 overflow-hidden">
              <div className="bg-ink-900 px-4 py-2 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
                <span className="text-xs text-ink-400 font-mono ml-2">Sample payload → Make.com</span>
              </div>
              <pre className="bg-ink-950 text-emerald-400 text-xs p-4 overflow-x-auto font-mono leading-relaxed">
{`{
  "event": "dm.received",
  "workspaceId": "...",
  "timestamp": "2026-06-28T10:00:00Z",
  "data": {
    "igUsername": "potential_customer",
    "text": "Hi! Do you have this in red?",
    "contactId": "..."
  }
}`}
              </pre>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => { setStep("scenarios"); fetchScenarios(); }}
                className="flex items-center gap-2 text-sm font-semibold text-violet-600 hover:text-violet-800 transition"
              >
                <RefreshCw className="w-4 h-4" /> Switch scenario
              </button>
              <span className="text-ink-200">|</span>
              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="flex items-center gap-2 text-sm text-ink-400 hover:text-red-500 transition"
              >
                <Unlink className="w-4 h-4" />
                {disconnecting ? "Disconnecting…" : "Disconnect"}
              </button>
              <span className="text-ink-200">|</span>
              <a
                href="https://make.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-sm text-ink-400 hover:text-ink-700 transition"
              >
                Open Make.com <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Mailchimp Card ──────────────────────────────────────────────────────────

function MailchimpCard() {
  const [state, setState] = useState({ connected: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ apiKey: "", listId: "" });
  const [lists, setLists] = useState([]);

  useEffect(() => { load(); }, []);

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

  const disconnect = async () => {
    if (!window.confirm("Disconnect Mailchimp?")) return;
    try {
      await api.delete("/integrations/mailchimp");
      toast.success("Mailchimp disconnected");
      setState({ connected: false });
      setLists([]);
    } catch {
      toast.error("Failed");
    }
  };

  return (
    <div className="overflow-hidden rounded-none border border-ink-200 bg-white shadow-sm">
      <div className="flex items-start gap-4 p-6 border-b border-ink-100 bg-gradient-to-r from-red-50/50 to-white">
        <div className="w-14 h-14 bg-[#C21325] flex items-center justify-center text-white shrink-0 rounded-xl shadow-lg shadow-red-100">
          <Mail className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-xl text-ink-900">Mailchimp</h3>
            {state.connected ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-700 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" /> Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-ink-100 text-ink-500 rounded-full border border-ink-200">
                Not connected
              </span>
            )}
          </div>
          <p className="text-sm text-ink-500 mt-1">
            Auto-subscribe every DM contact to your Mailchimp audience — capture leads from Instagram into your email list instantly.
          </p>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-ink-300" />
          </div>
        ) : state.connected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Mailchimp connected. DM contacts are being auto-subscribed to your audience.</span>
            </div>

            {lists.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-ink-600 mb-1.5">Active Audience</label>
                <select
                  className="w-full border border-ink-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                  value={state.listId || ""}
                  onChange={async (e) => {
                    try {
                      await api.post("/integrations/mailchimp", { listId: e.target.value });
                      setState((s) => ({ ...s, listId: e.target.value }));
                      toast.success("Audience updated");
                    } catch { toast.error("Failed"); }
                  }}
                >
                  <option value="">— Select audience —</option>
                  {lists.map((l) => (
                    <option key={l.id} value={l.id}>{l.name} ({l.members || 0} members)</option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={disconnect}
              className="flex items-center gap-1.5 text-sm text-ink-400 hover:text-red-500 transition"
            >
              <Unlink className="w-4 h-4" /> Disconnect Mailchimp
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-ink-600 mb-1.5">Mailchimp API Key</label>
              <input
                type="password"
                placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-us1"
                value={form.apiKey}
                onChange={(e) => setForm((f) => ({ ...f, apiKey: e.target.value }))}
                className="w-full border border-ink-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 font-mono"
              />
              <p className="text-xs text-ink-400 mt-1">
                Find it in Mailchimp → Account → Extras → API Keys
              </p>
            </div>
            <button
              onClick={connect}
              disabled={saving}
              className="flex items-center gap-2 bg-[#C21325] hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg transition text-sm"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              {saving ? "Connecting…" : "Connect Mailchimp"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Shopify Coming Soon ─────────────────────────────────────────────────────

function ShopifyComingSoon() {
  return (
    <div className="overflow-hidden rounded-none border border-ink-200 bg-white shadow-sm relative">
      {/* Blurred content */}
      <div className="select-none pointer-events-none" style={{ filter: "blur(1px)", opacity: 0.5 }}>
        <div className="flex items-start gap-4 p-6 border-b border-ink-100">
          <div className="w-14 h-14 bg-[#96BF48] flex items-center justify-center text-white shrink-0 rounded-xl">
            <ShopifyIcon className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-xl text-ink-900">Shopify</h3>
            <p className="text-sm text-ink-500 mt-1">
              Connect your Shopify store. Let your bot answer product questions, check order status, and recommend items automatically from your catalog.
            </p>
          </div>
        </div>
        <div className="p-6 space-y-3">
          <div className="h-4 bg-ink-100 rounded w-3/4" />
          <div className="h-4 bg-ink-100 rounded w-1/2" />
          <div className="h-10 bg-ink-100 rounded w-40 mt-4" />
        </div>
      </div>

      {/* Coming soon overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="text-center">
          <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-7 h-7 text-amber-500" />
          </div>
          <p className="font-bold text-lg text-ink-900">Shopify — Coming Soon</p>
          <p className="text-sm text-ink-500 mt-1 max-w-xs mx-auto">
            Full Shopify integration is on the way. Your bot will know your entire catalog and handle order lookups automatically.
          </p>
          <span className="inline-flex items-center gap-1.5 mt-4 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-xs font-semibold text-amber-700">
            <Clock className="w-3.5 h-3.5" /> In development
          </span>
        </div>
      </div>
    </div>
  );
}
