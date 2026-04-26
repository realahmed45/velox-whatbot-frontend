import { useEffect, useState } from "react";
import api from "@/services/api";
import toast from "react-hot-toast";
import { Plug, Plus, Trash2, Power, Send, X, Copy, Check } from "lucide-react";
import IntegrationsTabs from "./IntegrationsTabs";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";

const EVENTS = [
  { key: "dm.received", label: "DM received" },
  { key: "dm.sent", label: "DM sent" },
  { key: "comment.received", label: "Comment received" },
  { key: "lead.created", label: "New lead / contact" },
  { key: "flow.completed", label: "Flow completed" },
];

const EMPTY = { name: "", url: "", events: EVENTS.map((e) => e.key) };

export default function IntegrationsPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

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

  return (
    <div>
      <IntegrationsTabs />
      <div className="p-4 sm:p-8 max-w-7xl mx-auto">
        <PageHeader
          icon={Plug}
          title="Webhooks"
          subtitle="Send every DM, comment, and lead to Zapier, Make, CRMs, or any webhook URL"
        >
          <button onClick={() => setShowModal(true)} className="btn-primary gap-2">
            <Plus className="w-4 h-4" /> New webhook
          </button>
        </PageHeader>

        {loading ? (
          <div className="text-center py-12 text-ink-400">Loading…</div>
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
              <div key={i._id} className="card">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white">
                    <Plug className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-ink-900">{i.name}</h3>
                      <span
                        className={`chip ${i.enabled ? "bg-emerald-100 text-emerald-700" : "bg-ink-100 text-ink-500"}`}
                      >
                        {i.enabled ? "Active" : "Paused"}
                      </span>
                    </div>
                    <p className="text-xs text-ink-500 mt-1 truncate font-mono">
                      {i.url}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(i.events || []).map((ev) => (
                        <span
                          key={ev}
                          className="chip bg-brand-50 text-brand-700 text-[10px]"
                        >
                          {ev}
                        </span>
                      ))}
                    </div>
                    {i.secret && (
                      <div className="flex items-center gap-2 mt-2 text-xs">
                        <span className="text-ink-500">Secret:</span>
                        <code className="font-mono text-ink-700 bg-ink-50 px-2 py-0.5 rounded">
                          {i.secret.slice(0, 8)}…
                        </code>
                        <button
                          onClick={() => copy(i.secret, i._id)}
                          className="text-brand-600 hover:underline"
                        >
                          {copiedId === i._id ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => test(i._id)}
                      title="Send test"
                      className="p-2 rounded hover:bg-brand-50 text-brand-600"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggle(i)}
                      title="Toggle"
                      className="p-2 rounded hover:bg-ink-100 text-ink-600"
                    >
                      <Power className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => remove(i._id)}
                      className="p-2 rounded hover:bg-red-50 text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full">
              <div className="flex items-center justify-between p-5 border-b border-ink-100">
                <h2 className="text-lg font-semibold">
                  New Webhook Integration
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded hover:bg-ink-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 space-y-3">
                <div>
                  <label className="label">Name</label>
                  <input
                    className="input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Zapier — New leads"
                  />
                </div>
                <div>
                  <label className="label">URL</label>
                  <input
                    className="input font-mono text-xs"
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    placeholder="https://hooks.zapier.com/hooks/catch/…"
                  />
                </div>
                <div>
                  <label className="label">Events</label>
                  <div className="space-y-1.5">
                    {EVENTS.map((e) => (
                      <label
                        key={e.key}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={form.events.includes(e.key)}
                          onChange={() => toggleEvent(e.key)}
                          className="rounded"
                        />
                        <span className="text-ink-700">{e.label}</span>
                        <code className="text-[10px] text-ink-400 font-mono">
                          {e.key}
                        </code>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-5 border-t border-ink-100 flex justify-end gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={save}
                  disabled={saving}
                  className="btn btn-primary"
                >
                  {saving ? "Saving…" : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
