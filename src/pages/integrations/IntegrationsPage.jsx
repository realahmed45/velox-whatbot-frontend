import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import api from "@/services/api";
import toast from "react-hot-toast";
import {
  Plug,
  Plus,
  Trash2,
  Power,
  Send,
  X,
  Copy,
  Check,
  Eye,
  EyeOff,
  Zap,
  ChevronDown,
  Loader2,
} from "lucide-react";
import IntegrationsTabs from "./IntegrationsTabs";
import StatHero from "@/components/ui/StatHero";
import EmptyState from "@/components/ui/EmptyState";

const EVENTS = [
  { key: "dm.received", label: "DM received" },
  { key: "dm.sent", label: "DM sent (bot reply)" },
  { key: "comment.received", label: "Comment / story reply received" },
  { key: "lead.created", label: "New lead (email/phone captured)" },
  { key: "flow.completed", label: "Flow completed" },
  { key: "contact.tagged", label: "Contact tagged" },
];

const EVENT_LABELS = Object.fromEntries(EVENTS.map((e) => [e.key, e.label]));

const EMPTY = { name: "", url: "", events: EVENTS.map((e) => e.key) };

const PAYLOAD_EXAMPLE = `{
  "event": "lead.created",
  "workspaceId": "ws_8f2a...",
  "data": {
    "contactId": "ct_1029",
    "email": "jane@acme.com",
    "source": "instagram_dm"
  },
  "timestamp": "2026-07-24T14:32:07.512Z",
  "signature": "sha256=9d1f4c…"
}`;

export default function IntegrationsPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [revealed, setRevealed] = useState({});

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/integrations");
      setList(data.integrations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!form.name || !form.url) return toast.error("Name and URL required");
    setSaving(true);
    try {
      await api.post("/integrations", form);
      toast.success("Integration created");
      setShowModal(false);
      setForm(EMPTY);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (i) => {
    try {
      await api.put(`/integrations/${i._id}`, { enabled: !i.enabled });
      load();
    } catch {
      toast.error("Failed");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this integration?")) return;
    try {
      await api.delete(`/integrations/${id}`);
      setList((c) => c.filter((x) => x._id !== id));
    } catch {
      toast.error("Failed");
    }
  };

  const test = async (id) => {
    try {
      const { data } = await api.post(`/integrations/${id}/test`);
      toast.success(
        data.result?.ok
          ? "Test fired successfully"
          : "Endpoint responded with error",
      );
    } catch {
      toast.error("Test failed");
    }
  };

  const copy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleEvent = (key) =>
    setForm((f) => ({
      ...f,
      events: f.events.includes(key)
        ? f.events.filter((x) => x !== key)
        : [...f.events, key],
    }));

  const activeCount = list.filter((i) => i.enabled).length;

  return (
    <div>
      <IntegrationsTabs />
      <div className="p-4 sm:p-8 max-w-7xl mx-auto">
        <StatHero
          icon={Plug}
          title="Webhooks"
          subtitle="Send DMs, comments & leads to Zapier, Make, or any URL"
          stats={
            list.length > 0
              ? [
                  { label: "Webhooks", value: list.length },
                  { label: "Active", value: activeCount, accent: true },
                ]
              : undefined
          }
        >
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-white text-ink-900 font-bold text-sm px-4 py-2 hover:bg-white/90 transition"
          >
            <Plus className="w-4 h-4" /> New webhook
          </button>
        </StatHero>

        {/* How it works strip */}
        {!loading && list.length > 0 && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-ink-100 bg-white px-4 py-3.5 shadow-sm">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <Zap className="h-4 w-4" />
            </div>
            <p className="text-[13px] leading-relaxed text-ink-600">
              We POST a JSON payload to your URL whenever these events happen —
              use it with{" "}
              <span className="font-semibold text-ink-800">Zapier</span>,{" "}
              <span className="font-semibold text-ink-800">Make</span>,{" "}
              <span className="font-semibold text-ink-800">n8n</span>, or your
              own server. Every request is signed with your secret so you can
              verify it came from Botlify.
            </p>
          </div>
        )}

        {loading ? (
          <div className="grid gap-3">
            {[0, 1, 2].map((n) => (
              <SkeletonCard key={n} />
            ))}
          </div>
        ) : list.length === 0 ? (
          <EmptyState
            icon={Plug}
            title="No webhooks yet"
            description="Connect Botlify to your stack. Every DM, comment, and lead can flow into Zapier, Make, or your own endpoints."
            action={
              <button
                onClick={() => setShowModal(true)}
                className="btn-primary gap-2"
              >
                <Plus className="w-4 h-4" /> Add your first
              </button>
            }
          />
        ) : (
          <div className="grid gap-3">
            {list.map((i) => (
              <WebhookCard
                key={i._id}
                i={i}
                copiedId={copiedId}
                revealed={!!revealed[i._id]}
                onCopy={copy}
                onToggleReveal={() =>
                  setRevealed((r) => ({ ...r, [i._id]: !r[i._id] }))
                }
                onTest={() => test(i._id)}
                onToggle={() => toggle(i)}
                onRemove={() => remove(i._id)}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <CreateModal
          form={form}
          setForm={setForm}
          saving={saving}
          onClose={() => setShowModal(false)}
          onSave={save}
          onToggleEvent={toggleEvent}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Webhook card                                                        */
/* ------------------------------------------------------------------ */

function WebhookCard({
  i,
  copiedId,
  revealed,
  onCopy,
  onToggleReveal,
  onTest,
  onToggle,
  onRemove,
}) {
  const secretCopyId = `secret-${i._id}`;
  const urlCopyId = `url-${i._id}`;

  return (
    <div className="group rounded-2xl border border-ink-100 bg-white p-5 shadow-sm transition-all hover:border-ink-200 hover:shadow-md">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            i.enabled
              ? "bg-brand-50 text-brand-600"
              : "bg-ink-50 text-ink-400"
          }`}
        >
          <Plug className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          {/* name + status */}
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold text-ink-900">{i.name}</h3>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                i.enabled
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-ink-100 text-ink-500"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  i.enabled ? "bg-emerald-500" : "bg-ink-400"
                }`}
              />
              {i.enabled ? "Active" : "Paused"}
            </span>
          </div>

          {/* URL pill */}
          <div className="mt-2.5 flex items-center gap-2">
            <div className="flex min-w-0 items-center gap-2 rounded-lg border border-ink-100 bg-ink-50/70 px-2.5 py-1.5">
              <span className="truncate font-mono text-xs text-ink-600">
                {i.url}
              </span>
              <button
                onClick={() => onCopy(i.url, urlCopyId)}
                title="Copy URL"
                className="shrink-0 text-ink-400 transition hover:text-brand-600"
              >
                {copiedId === urlCopyId ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* events */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {(i.events || []).map((ev) => (
              <span
                key={ev}
                title={ev}
                className="inline-flex items-center rounded-md bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700"
              >
                {EVENT_LABELS[ev] || ev}
              </span>
            ))}
          </div>

          {/* secret */}
          {i.secret && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-medium uppercase tracking-wide text-ink-400">
                Signing secret
              </span>
              <code className="rounded-md bg-ink-50 px-2 py-1 font-mono text-xs text-ink-700">
                {revealed
                  ? i.secret
                  : `${i.secret.slice(0, 6)}${"•".repeat(12)}`}
              </code>
              <button
                onClick={onToggleReveal}
                title={revealed ? "Hide secret" : "Reveal secret"}
                className="rounded-md p-1 text-ink-400 transition hover:bg-ink-50 hover:text-ink-700"
              >
                {revealed ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </button>
              <button
                onClick={() => onCopy(i.secret, secretCopyId)}
                title="Copy secret"
                className="rounded-md p-1 text-ink-400 transition hover:bg-ink-50 hover:text-brand-600"
              >
                {copiedId === secretCopyId ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* actions */}
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={onTest}
            title="Send test event"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-brand-600 transition hover:bg-brand-50"
          >
            <Send className="h-4 w-4" />
          </button>
          <button
            onClick={onToggle}
            title={i.enabled ? "Pause webhook" : "Resume webhook"}
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
              i.enabled
                ? "text-ink-500 hover:bg-ink-100 hover:text-ink-700"
                : "text-emerald-600 hover:bg-emerald-50"
            }`}
          >
            <Power className="h-4 w-4" />
          </button>
          <button
            onClick={onRemove}
            title="Delete webhook"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-400 transition hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Skeleton                                                            */
/* ------------------------------------------------------------------ */

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-ink-100" />
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-4 w-40 animate-pulse rounded bg-ink-100" />
            <div className="h-4 w-16 animate-pulse rounded-full bg-ink-100" />
          </div>
          <div className="h-7 w-72 max-w-full animate-pulse rounded-lg bg-ink-100" />
          <div className="flex gap-1.5">
            <div className="h-5 w-24 animate-pulse rounded-md bg-ink-100" />
            <div className="h-5 w-20 animate-pulse rounded-md bg-ink-100" />
            <div className="h-5 w-28 animate-pulse rounded-md bg-ink-100" />
          </div>
        </div>
        <div className="flex gap-1">
          <div className="h-9 w-9 animate-pulse rounded-lg bg-ink-100" />
          <div className="h-9 w-9 animate-pulse rounded-lg bg-ink-100" />
          <div className="h-9 w-9 animate-pulse rounded-lg bg-ink-100" />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Create modal (portaled)                                             */
/* ------------------------------------------------------------------ */

function CreateModal({ form, setForm, saving, onClose, onSave, onToggleEvent }) {
  const [showPayload, setShowPayload] = useState(false);
  const canSave = form.name.trim() && form.url.trim() && !saving;

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-900/50 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* sticky header */}
        <div className="flex items-start justify-between gap-4 border-b border-ink-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Plug className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink-900">
                New webhook integration
              </h2>
              <p className="text-xs text-ink-500">
                Receive events in real time on your endpoint
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* scrollable body */}
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {/* helper */}
          <div className="rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-3">
            <p className="text-[13px] leading-relaxed text-ink-700">
              We POST a JSON payload to your URL whenever these events happen —
              use it with{" "}
              <span className="font-semibold">Zapier</span>,{" "}
              <span className="font-semibold">Make</span>,{" "}
              <span className="font-semibold">n8n</span>, or your own server.
            </p>
          </div>

          <div>
            <label className="label">Name</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Zapier — New leads"
              autoFocus
            />
          </div>

          <div>
            <label className="label">Endpoint URL</label>
            <input
              className="input font-mono text-xs"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://hooks.zapier.com/hooks/catch/…"
            />
          </div>

          <div>
            <label className="label mb-2">Events</label>
            <div className="space-y-1.5">
              {EVENTS.map((e) => {
                const checked = form.events.includes(e.key);
                return (
                  <label
                    key={e.key}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 transition ${
                      checked
                        ? "border-brand-200 bg-brand-50/50"
                        : "border-ink-100 bg-white hover:border-ink-200 hover:bg-ink-50/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggleEvent(e.key)}
                      className="h-4 w-4 rounded border-ink-300 text-brand-500 focus:ring-2 focus:ring-brand-100"
                    />
                    <span className="flex-1 text-sm font-medium text-ink-800">
                      {e.label}
                    </span>
                    <code className="font-mono text-[10px] text-ink-400">
                      {e.key}
                    </code>
                  </label>
                );
              })}
            </div>
          </div>

          {/* payload example */}
          <div className="overflow-hidden rounded-xl border border-ink-100">
            <button
              type="button"
              onClick={() => setShowPayload((s) => !s)}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-[13px] font-semibold text-ink-700 transition hover:bg-ink-50"
            >
              <span>Example payload you'll receive</span>
              <ChevronDown
                className={`h-4 w-4 text-ink-400 transition-transform ${
                  showPayload ? "rotate-180" : ""
                }`}
              />
            </button>
            {showPayload && (
              <pre className="overflow-x-auto border-t border-ink-100 bg-ink-900 px-4 py-3.5 font-mono text-[11px] leading-relaxed text-ink-100">
                {PAYLOAD_EXAMPLE}
              </pre>
            )}
          </div>
        </div>

        {/* sticky footer */}
        <div className="flex items-center justify-end gap-2 border-t border-ink-100 px-6 py-4">
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={!canSave}
            className="btn-primary min-w-[110px]"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving…
              </>
            ) : (
              "Create webhook"
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
