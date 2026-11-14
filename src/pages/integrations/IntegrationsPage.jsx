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
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { AnimatePresence, motion } from "framer-motion";
import { Magnetic, PulseDot, Reveal, Spotlight } from "@/components/fx";

const actBtn =
  "group/act flex h-10 w-10 sm:h-9 sm:w-9 items-center justify-center rounded-xl transition-all duration-300 ease-spring hover:-translate-y-0.5 active:scale-90";

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
  const confirm = useConfirm();
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
    const ok = await confirm({
      title: "Delete this integration?",
      description: "This webhook will be permanently deleted and stop receiving events.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      danger: true,
    });
    if (!ok) return;
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
      <div className="px-4 sm:px-6 lg:px-8 pt-5 pb-10 max-w-7xl mx-auto">
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
          <Magnetic strength={0.25}>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary group/nw text-sm px-3 sm:px-4 py-2"
            >
              <Plus className="w-4 h-4 transition-transform duration-500 ease-spring group-hover/nw:rotate-90" />
              New webhook
            </button>
          </Magnetic>
        </StatHero>

        {/* How it works strip */}
        {!loading && list.length > 0 && (
          <Reveal className="card mb-5 flex items-start gap-3 px-4 py-3.5">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sunset-soft text-sunset-flame">
              <Zap className="h-4 w-4" strokeWidth={1.8} />
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
          </Reveal>
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
                className="btn-primary group/af gap-2"
              >
                <Plus className="w-4 h-4 transition-transform duration-500 ease-spring group-hover/af:rotate-90" /> Add your first
              </button>
            }
          />
        ) : (
          <div className="grid gap-3">
            <AnimatePresence initial={false}>
            {list.map((i, idx) => (
              <motion.div
                key={i._id}
                layout
                initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)", transition: { delay: Math.min(idx, 8) * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] } }}
                exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.2 } }}
              >
              <WebhookCard
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
              </motion.div>
            ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
      {showModal && (
        <CreateModal
          key="create-webhook"
          form={form}
          setForm={setForm}
          saving={saving}
          onClose={() => setShowModal(false)}
          onSave={save}
          onToggleEvent={toggleEvent}
        />
      )}
      </AnimatePresence>
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
    <Spotlight className="card group p-4 sm:p-5 transition-shadow duration-300 hover:shadow-[inset_0_1px_0_#fff,0_0_0_1px_rgba(255,106,43,0.18),0_16px_36px_-18px_rgba(255,61,119,0.3)]">
      <div className="flex items-start gap-3 sm:gap-4">
        <div
          className={`hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg] ${
            i.enabled
              ? "bg-sunset-soft text-sunset-flame"
              : "bg-ink-900/[0.05] text-ink-400"
          }`}
        >
          <Plug className="h-5 w-5" strokeWidth={1.8} />
        </div>

        <div className="min-w-0 flex-1">
          {/* name + status */}
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-display font-semibold tracking-[-0.01em] text-ink-900">{i.name}</h3>
            <span
              className={`inline-flex items-center gap-1.5 ${
                i.enabled ? "badge-green" : "badge-gray"
              }`}
            >
              {i.enabled ? (
                <PulseDot color="bg-emerald-500" className="!h-1.5 !w-1.5 [&>span]:!h-1.5 [&>span]:!w-1.5" />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-ink-400" />
              )}
              {i.enabled ? "Active" : "Paused"}
            </span>
          </div>

          {/* URL pill */}
          <div className="mt-2.5 flex items-center gap-2">
            <div className="flex min-w-0 items-center gap-2 rounded-xl bg-white/60 ring-1 ring-ink-900/[0.06] shadow-[inset_0_1px_0_#fff] px-2.5 py-1.5">
              <span className="truncate font-mono text-xs text-ink-600">
                {i.url}
              </span>
              <button
                onClick={() => onCopy(i.url, urlCopyId)}
                title="Copy URL"
                className="shrink-0 rounded-md p-0.5 text-ink-400 transition-all duration-300 ease-spring hover:text-sunset-flame hover:scale-110 active:scale-90"
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
                className="badge-brand text-[11px] font-medium"
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
              <code className="rounded-lg bg-ink-900/[0.04] ring-1 ring-ink-900/[0.05] px-2 py-1 font-mono text-xs text-ink-700 break-all">
                {revealed
                  ? i.secret
                  : `${i.secret.slice(0, 6)}${"•".repeat(12)}`}
              </code>
              <button
                onClick={onToggleReveal}
                title={revealed ? "Hide secret" : "Reveal secret"}
                className="rounded-lg p-1.5 text-ink-400 transition-all duration-300 ease-spring hover:bg-white hover:text-ink-700 active:scale-90"
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
                className="rounded-lg p-1.5 text-ink-400 transition-all duration-300 ease-spring hover:bg-white hover:text-sunset-flame active:scale-90"
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
        <div className="flex shrink-0 flex-col sm:flex-row items-center gap-0.5 sm:gap-1">
          <button
            onClick={onTest}
            title="Send test event"
            className={`${actBtn} text-sunset-flame hover:bg-sunset-soft`}
          >
            <Send className="h-4 w-4 transition-transform duration-500 ease-spring group-hover/act:translate-x-0.5 group-hover/act:-translate-y-0.5" />
          </button>
          <button
            onClick={onToggle}
            title={i.enabled ? "Pause webhook" : "Resume webhook"}
            className={`${actBtn} ${
              i.enabled
                ? "text-ink-500 hover:bg-ink-900/[0.05] hover:text-ink-700"
                : "text-emerald-600 hover:bg-emerald-50"
            }`}
          >
            <Power className="h-4 w-4 transition-transform duration-500 ease-spring group-hover/act:rotate-[20deg]" />
          </button>
          <button
            onClick={onRemove}
            title="Delete webhook"
            className={`${actBtn} text-ink-400 hover:bg-rose-50 hover:text-rose-600`}
          >
            <Trash2 className="h-4 w-4 transition-transform duration-500 ease-spring group-hover/act:rotate-[-12deg]" />
          </button>
        </div>
      </div>
    </Spotlight>
  );
}

/* ------------------------------------------------------------------ */
/* Skeleton                                                            */
/* ------------------------------------------------------------------ */

function SkeletonCard() {
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-start gap-4">
        <div className="hidden sm:block h-11 w-11 shrink-0 animate-pulse rounded-xl bg-ink-900/[0.06]" />
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-4 w-40 animate-pulse rounded bg-ink-900/[0.06]" />
            <div className="h-4 w-16 animate-pulse rounded-full bg-ink-900/[0.06]" />
          </div>
          <div className="h-7 w-72 max-w-full animate-pulse rounded-lg bg-ink-900/[0.06]" />
          <div className="flex gap-1.5">
            <div className="h-5 w-24 animate-pulse rounded-md bg-ink-900/[0.06]" />
            <div className="h-5 w-20 animate-pulse rounded-md bg-ink-900/[0.06]" />
            <div className="h-5 w-28 animate-pulse rounded-md bg-ink-900/[0.06]" />
          </div>
        </div>
        <div className="hidden sm:flex gap-1">
          <div className="h-9 w-9 animate-pulse rounded-lg bg-ink-900/[0.06]" />
          <div className="h-9 w-9 animate-pulse rounded-lg bg-ink-900/[0.06]" />
          <div className="h-9 w-9 animate-pulse rounded-lg bg-ink-900/[0.06]" />
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
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-night-950/40 p-3 sm:p-4 backdrop-blur-md"
      onMouseDown={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="glass-strong flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl"
        onMouseDown={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 12, scale: 0.96, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: 8, scale: 0.97, filter: "blur(4px)" }}
        transition={{ type: "spring", stiffness: 420, damping: 30 }}
      >
        {/* sticky header */}
        <div className="flex items-start justify-between gap-4 border-b border-ink-900/[0.06] px-4 sm:px-6 py-5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sunset text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_8px_20px_-8px_rgba(255,61,119,0.7)]">
              <Plug className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-base font-semibold tracking-[-0.02em] text-ink-900">
                New webhook integration
              </h2>
              <p className="text-xs text-ink-500">
                Receive events in real time on your endpoint
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-ink-400 transition-all duration-300 ease-spring hover:bg-ink-900/[0.05] hover:text-ink-700 hover:rotate-90 active:scale-90"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* scrollable body */}
        <div className="flex-1 space-y-5 overflow-y-auto px-4 sm:px-6 py-5">
          {/* helper */}
          <div className="rounded-xl bg-sunset-soft ring-1 ring-sunset-flame/15 px-4 py-3">
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
                    className={`flex cursor-pointer items-center gap-3 rounded-xl ring-1 px-3.5 py-2.5 transition-all duration-300 ease-spring active:scale-[0.99] ${
                      checked
                        ? "ring-sunset-flame/30 bg-sunset-soft"
                        : "ring-ink-900/[0.07] bg-white/70 hover:bg-white hover:ring-ink-900/[0.12]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggleEvent(e.key)}
                      className="h-4 w-4 rounded border-ink-300 accent-[#FF6A2B] text-sunset-flame focus:ring-2 focus:ring-sunset-flame/20"
                    />
                    <span className="flex-1 min-w-0 text-sm font-medium text-ink-800">
                      {e.label}
                    </span>
                    <code className="hidden sm:inline font-mono text-[10px] text-ink-400">
                      {e.key}
                    </code>
                  </label>
                );
              })}
            </div>
          </div>

          {/* payload example */}
          <div className="overflow-hidden rounded-xl bg-white/60 ring-1 ring-ink-900/[0.07]">
            <button
              type="button"
              onClick={() => setShowPayload((s) => !s)}
              aria-expanded={showPayload}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-[13px] font-semibold text-ink-700 transition-colors hover:bg-white"
            >
              <span>Example payload you'll receive</span>
              <ChevronDown
                className={`h-4 w-4 text-ink-400 transition-transform duration-500 ease-spring ${
                  showPayload ? "rotate-180" : ""
                }`}
              />
            </button>
            <AnimatePresence initial={false}>
            {showPayload && (
              <motion.div
                key="payload"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 420, damping: 36 }}
                className="overflow-hidden"
              >
                <pre className="overflow-x-auto border-t border-ink-900/[0.06] bg-night-900 px-4 py-3.5 font-mono text-[11px] leading-relaxed text-white/80">
                  {PAYLOAD_EXAMPLE}
                </pre>
              </motion.div>
            )}
            </AnimatePresence>
          </div>
        </div>

        {/* sticky footer */}
        <div className="flex items-center justify-end gap-2 border-t border-ink-900/[0.06] px-4 sm:px-6 py-4">
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
      </motion.div>
    </motion.div>,
    document.body,
  );
}
