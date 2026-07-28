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

export default function AppsIntegrationsPage() {
  // Mailchimp connection state is lifted here so the StatHero can reflect the
  // number of connected apps. All API calls/handlers still live in MailchimpCard.
  const [mailchimpConnected, setMailchimpConnected] = useState(false);

  const connectedCount = mailchimpConnected ? 1 : 0;

  return (
    <div>
      <IntegrationsTabs />
      <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
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
          <MakeCard />
          <MailchimpCard onStatusChange={setMailchimpConnected} />
        </div>

        <ComingSoonCard />
      </div>
    </div>
  );
}

/* ── Shared card shell ──────────────────────────────────────────── */

function StatusPill({ connected }) {
  return connected ? (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold border border-emerald-200 bg-emerald-50 text-emerald-700">
      <Check className="w-3 h-3" />
      Connected
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold border border-ink-200 bg-ink-50 text-ink-500">
      Not connected
    </span>
  );
}

function CardShell({ tile, name, connected, description, children }) {
  return (
    <div className="group flex flex-col rounded-2xl border border-ink-100 bg-white shadow-sm p-6 transition-all duration-200 hover:shadow-glow hover:-translate-y-0.5">
      <div className="flex items-start gap-4">
        {tile}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-lg text-ink-900">{name}</h3>
            {connected !== undefined && <StatusPill connected={connected} />}
          </div>
          <p className="text-sm text-ink-500 mt-1">{description}</p>
        </div>
      </div>
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}

/* ── Make.com ───────────────────────────────────────────────────── */

function MakeCard() {
  return (
    <CardShell
      tile={
        <div className="w-12 h-12 rounded-xl bg-[#6D00CC] flex items-center justify-center text-white shrink-0 shadow-sm">
          <Workflow className="w-6 h-6" />
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
        className="btn btn-primary w-full sm:w-auto"
      >
        <Link2 className="w-4 h-4" /> Set up webhooks
        <ArrowRight className="w-4 h-4" />
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
        <div className="w-12 h-12 rounded-xl bg-[#FFE01B] flex items-center justify-center text-black shrink-0 shadow-sm">
          <Mail className="w-6 h-6" />
        </div>
      }
      name="Mailchimp"
      connected={!!state.connected}
      description="Auto-forward emails captured in DMs to your Mailchimp audience for follow-up campaigns."
    >
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-ink-400 py-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading…
        </div>
      ) : state.connected ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-lg border border-ink-100 bg-ink-50 px-3 py-2 text-xs text-ink-600">
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
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 hover:underline transition"
          >
            <Unlink className="w-4 h-4" /> Disconnect
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
    </CardShell>
  );
}

/* ── Coming soon ────────────────────────────────────────────────── */

function ComingSoonCard() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-dashed border-ink-200 bg-ink-50/50 px-6 py-5">
      <div className="w-10 h-10 rounded-xl bg-white border border-ink-100 flex items-center justify-center text-ink-400 shrink-0">
        <Sparkles className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm font-semibold text-ink-700">
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
