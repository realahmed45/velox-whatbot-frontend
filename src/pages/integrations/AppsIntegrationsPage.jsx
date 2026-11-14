import { useEffect, useState } from "react";
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
  AppWindow,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import IntegrationsTabs from "./IntegrationsTabs";
import StatHero from "@/components/ui/StatHero";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { PulseDot, Reveal, Spotlight } from "@/components/fx";

export default function AppsIntegrationsPage() {
  // Mailchimp connection state is lifted here so the StatHero can reflect the
  // number of connected apps. All API calls/handlers still live in MailchimpCard.
  const [mailchimpConnected, setMailchimpConnected] = useState(false);

  const connectedCount = mailchimpConnected ? 1 : 0;

  return (
    <div>
      <IntegrationsTabs />
      <div className="px-4 sm:px-6 lg:px-8 pt-5 pb-10 max-w-7xl mx-auto space-y-6">
        <StatHero
          icon={AppWindow}
          eyebrow="Apps"
          title="App integrations"
          subtitle="Connect Make.com, Mailchimp, and your marketing stack"
          stats={[
            { label: "Connected", value: connectedCount, accent: true },
            { label: "Available", value: 2 },
          ]}
        />

        {/* Premium integration grid — clean 1-2 col layout */}
        <div className="grid gap-5 sm:grid-cols-2">
          <Reveal className="h-full">
            <MakeCard />
          </Reveal>
          <Reveal delay={0.06} className="h-full">
            <MailchimpCard onStatusChange={setMailchimpConnected} />
          </Reveal>
        </div>

        <Reveal delay={0.12}>
          <ComingSoonCard />
        </Reveal>
      </div>
    </div>
  );
}

/* ── Shared card shell ──────────────────────────────────────────── */

function StatusPill({ connected }) {
  return connected ? (
    <span className="badge-green inline-flex items-center gap-1.5 text-[11px] font-semibold">
      <PulseDot color="bg-emerald-500" className="!h-1.5 !w-1.5 [&>span]:!h-1.5 [&>span]:!w-1.5" />
      <Check className="w-3 h-3" />
      Connected
    </span>
  ) : (
    <span className="badge-gray inline-flex items-center gap-1 text-[11px] font-semibold">
      Not connected
    </span>
  );
}

function CardShell({ tile, name, connected, description, children }) {
  return (
    <Spotlight className="card-hover group flex flex-col h-full p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <div className="shrink-0 transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]">
          {tile}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display font-semibold tracking-[-0.02em] text-lg text-ink-900">{name}</h3>
            {connected !== undefined && <StatusPill connected={connected} />}
          </div>
          <p className="text-sm text-ink-500 mt-1">{description}</p>
        </div>
      </div>
      {children && <div className="mt-5">{children}</div>}
    </Spotlight>
  );
}

/* ── Make.com ───────────────────────────────────────────────────── */

function MakeCard() {
  return (
    <CardShell
      tile={
        <div className="w-12 h-12 rounded-xl bg-[#6D00CC] grid place-items-center text-white shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_8px_20px_-10px_rgba(109,0,204,0.7)]">
          <Workflow className="w-6 h-6" strokeWidth={1.8} />
        </div>
      }
      name="Make.com"
      description="Send Botlify events to Make (new DMs, leads, flow completions) and trigger automations anywhere — no code."
    >
      <p className="text-xs text-ink-500 mb-4">
        Push DMs, leads and flow-completions to{" "}
        <span className="font-semibold text-ink-700">1,000+ apps</span> — Sheets,
        CRMs, Slack and more.
      </p>
      <Link
        to="/dashboard/integrations"
        className="btn btn-primary group/cta w-full sm:w-auto"
      >
        <Link2 className="w-4 h-4" /> Set up webhooks
        <ArrowRight className="w-4 h-4 transition-transform duration-500 ease-spring group-hover/cta:translate-x-1" />
      </Link>
    </CardShell>
  );
}

/* ── Mailchimp ──────────────────────────────────────────────────── */

function MailchimpCard({ onStatusChange }) {
  const confirm = useConfirm();
  const [state, setState] = useState({ connected: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ apiKey: "", listId: "" });
  const [lists, setLists] = useState([]);

  useEffect(() => {
    load();
  }, []);

  // Keep the parent (StatHero counter) in sync with connection status.
  useEffect(() => {
    onStatusChange?.(!!state.connected);
  }, [state.connected, onStatusChange]);

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
    const ok = await confirm({
      title: "Disconnect Mailchimp?",
      description: "Emails captured in DMs will no longer sync to your Mailchimp audience.",
      confirmLabel: "Disconnect",
      cancelLabel: "Cancel",
      danger: true,
    });
    if (!ok) return;
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
    <CardShell
      tile={
        <div className="w-12 h-12 rounded-xl bg-[#FFE01B] grid place-items-center text-black shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_8px_20px_-10px_rgba(200,170,0,0.7)]">
          <Mail className="w-6 h-6" strokeWidth={1.8} />
        </div>
      }
      name="Mailchimp"
      connected={!!state.connected}
      description="Auto-forward emails captured in DMs to your Mailchimp audience for follow-up campaigns."
    >
      {loading ? (
        <div className="space-y-2.5 py-1" aria-busy="true">
          <span className="sr-only">Loading…</span>
          <div className="h-3 w-24 rounded-md bg-ink-900/[0.06] animate-pulse" />
          <div className="h-10 w-full rounded-xl bg-ink-900/[0.06] animate-pulse" />
          <div className="h-9 w-28 rounded-xl bg-ink-900/[0.06] animate-pulse" />
        </div>
      ) : state.connected ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-xl bg-white/60 ring-1 ring-ink-900/[0.06] px-3 py-2 text-xs text-ink-600">
            <span className="font-medium text-ink-500">Data center</span>
            <code className="font-mono font-semibold text-ink-800">
              {state.serverPrefix}
            </code>
          </div>

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
            className="group/dc inline-flex items-center gap-1.5 rounded-lg px-2 py-1 -ml-2 text-sm font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 active:scale-95 transition-all duration-300 ease-spring"
          >
            <Unlink className="w-4 h-4 transition-transform duration-500 ease-spring group-hover/dc:rotate-[-12deg]" /> Disconnect
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="label">API key</label>
            <input
              className="input text-sm font-mono"
              type="password"
              placeholder="e.g. abc…-us1"
              value={form.apiKey}
              onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
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
              className="group/k text-xs font-semibold text-sunset-flame hover:text-sunset-magenta flex items-center gap-1 transition-colors"
            >
              Get API key <ExternalLink className="w-3 h-3 transition-transform duration-500 ease-spring group-hover/k:-translate-y-0.5 group-hover/k:translate-x-0.5" />
            </a>
          </div>
        </div>
      )}
    </CardShell>
  );
}

/* ── Coming soon ────────────────────────────────────────────────── */

function ComingSoonCard() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-dashed border-ink-900/[0.12] bg-white/40 backdrop-blur px-4 sm:px-6 py-5">
      <div className="w-10 h-10 rounded-xl bg-sunset-soft text-sunset-flame grid place-items-center shrink-0">
        <Sparkles className="w-5 h-5" strokeWidth={1.8} />
      </div>
      <div className="min-w-0">
        <p className="font-display text-sm font-semibold text-ink-800">
          More integrations coming soon
        </p>
        <p className="text-xs text-ink-500 mt-0.5">
          We're adding new apps regularly. Need one now? Use Make.com webhooks to
          reach 1,000+ apps today.
        </p>
      </div>
    </div>
  );
}
