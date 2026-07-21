import { useEffect, useState } from "react";
import api from "@/services/api";
import toast from "react-hot-toast";
import { Plus, Trash2, X, Droplet, Play, Pause } from "lucide-react";
import dayjs from "dayjs";
import StatHero from "@/components/ui/StatHero";
import EmptyState from "@/components/ui/EmptyState";

const EMPTY_STEP = { delayMinutes: 60, message: "" };
const EMPTY_CAMPAIGN = {
  name: "",
  triggerType: "keyword",
  triggerValue: "",
  steps: [{ ...EMPTY_STEP }],
};

// Map the form shape -> the API/model shape (trigger object + message + enabled).
const toApiPayload = (form) => ({
  name: form.name,
  trigger: { type: form.triggerType, keyword: form.triggerValue },
  steps: form.steps.map((s) => ({
    delayMinutes: Number(s.delayMinutes) || 0,
    message: s.message,
  })),
  enabled: true,
});

export default function DripCampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_CAMPAIGN);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/drip-campaigns");
      setCampaigns(data.campaigns || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!form.name.trim()) return toast.error("Name required");
    if (!form.triggerValue.trim()) return toast.error("Trigger value required");
    if (!form.steps.length || form.steps.some((s) => !s.message.trim()))
      return toast.error("All steps need message text");
    setSaving(true);
    try {
      await api.post("/drip-campaigns", toApiPayload(form));
      toast.success("Drip campaign created");
      setShowModal(false);
      setForm(EMPTY_CAMPAIGN);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id, enabled) => {
    try {
      await api.put(`/drip-campaigns/${id}`, { enabled: !enabled });
      load();
    } catch {
      toast.error("Failed to update");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this drip campaign?")) return;
    try {
      await api.delete(`/drip-campaigns/${id}`);
      setCampaigns((c) => c.filter((x) => x._id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const addStep = () =>
    setForm((f) => ({ ...f, steps: [...f.steps, { ...EMPTY_STEP }] }));

  const updateStep = (idx, patch) =>
    setForm((f) => ({
      ...f,
      steps: f.steps.map((s, i) => (i === idx ? { ...s, ...patch } : s)),
    }));

  const removeStep = (idx) =>
    setForm((f) => ({
      ...f,
      steps: f.steps.filter((_, i) => i !== idx),
    }));

  const activeCount = campaigns.filter((c) => c.enabled).length;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      <StatHero
        icon={Droplet}
        title="Drip campaigns"
        subtitle="Multi-step DM sequences triggered by keywords or events — nurture leads on autopilot."
        stats={[
          { label: "Campaigns", value: campaigns.length },
          { label: "Active", value: activeCount, accent: true },
          { label: "Paused", value: campaigns.length - activeCount },
        ]}
      >
        <button
          onClick={() => setShowModal(true)}
          className="bg-white text-ink-900 hover:bg-brand-50 font-bold text-sm px-5 py-2.5 rounded-xl shadow-sm flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" /> New campaign
        </button>
      </StatHero>

      {loading ? (
        <div className="text-center py-16 text-ink-400 text-sm">Loading…</div>
      ) : campaigns.length === 0 ? (
        <EmptyState
          icon={Droplet}
          title="No drip campaigns yet"
          description="Drip campaigns let you nurture leads over days or weeks with scheduled follow-ups."
          action={
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary gap-2"
            >
              <Plus className="w-4 h-4" /> Create your first
            </button>
          }
        />
      ) : (
        <div className="grid gap-3">
          {campaigns.map((c) => (
            <div
              key={c._id}
              className="rounded-2xl border border-ink-100 bg-white shadow-sm hover:border-brand-300 hover:shadow-md transition flex items-center gap-4 p-4 sm:p-5"
            >
              <div className="w-11 h-11 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 flex-shrink-0">
                <Droplet className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-ink-900 truncate">{c.name}</h3>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${c.enabled ? "bg-emerald-100 text-emerald-700" : "bg-ink-100 text-ink-500"}`}
                  >
                    {c.enabled ? "Active" : "Paused"}
                  </span>
                </div>
                <p className="text-xs text-ink-500 mt-1.5">
                  Trigger:{" "}
                  <span className="font-semibold text-ink-700">
                    {c.trigger?.type || "keyword"}
                  </span>{" "}
                  — {c.trigger?.keyword || "—"} · {c.steps?.length || 0} steps ·{" "}
                  {c.stats?.enrolled || 0} enrolled · {c.stats?.completed || 0}{" "}
                  completed
                </p>
              </div>
              <button
                onClick={() => toggleActive(c._id, c.enabled)}
                className="p-2.5 rounded-xl border border-ink-200 hover:border-brand-300 hover:bg-brand-50 text-ink-600 hover:text-brand-600 transition flex-shrink-0"
                title={c.enabled ? "Pause" : "Activate"}
              >
                {c.enabled ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => remove(c._id)}
                className="p-2.5 rounded-xl border border-ink-200 hover:border-red-300 hover:bg-red-50 text-ink-600 hover:text-red-600 transition flex-shrink-0"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-ink-100 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
                  <Droplet className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-ink-900">
                  New drip campaign
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-ink-400 hover:text-ink-700 hover:bg-ink-50 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-ink-700 mb-1.5">
                  Campaign name
                </label>
                <input
                  className="w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="E.g. Welcome Series"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-ink-700 mb-1.5">
                    Trigger type
                  </label>
                  <select
                    className="w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm text-ink-900 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition bg-white"
                    value={form.triggerType}
                    onChange={(e) =>
                      setForm({ ...form, triggerType: e.target.value })
                    }
                  >
                    <option value="keyword">Keyword in DM</option>
                    <option value="new_follower">New Follower</option>
                    <option value="comment_keyword">Keyword in Comment</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink-700 mb-1.5">
                    Trigger value
                  </label>
                  <input
                    className="w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition"
                    value={form.triggerValue}
                    onChange={(e) =>
                      setForm({ ...form, triggerValue: e.target.value })
                    }
                    placeholder="E.g. price, info, start"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-ink-700">
                    Steps
                  </label>
                  <button
                    type="button"
                    onClick={addStep}
                    className="inline-flex items-center gap-1 text-xs text-brand-600 font-semibold hover:text-brand-700 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add step
                  </button>
                </div>
                <div className="space-y-3">
                  {form.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="border border-ink-100 bg-ink-50/40 rounded-xl p-3.5 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 bg-brand-100 px-2.5 py-0.5 rounded-full">
                          Step {idx + 1}
                        </span>
                        {form.steps.length > 1 && (
                          <button
                            onClick={() => removeStep(idx)}
                            className="text-red-500 text-xs font-semibold hover:text-red-600 transition"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-ink-500 mb-1">
                          Delay (minutes after previous step)
                        </label>
                        <input
                          type="number"
                          min="0"
                          className="w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm text-ink-900 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition bg-white"
                          value={step.delayMinutes}
                          onChange={(e) =>
                            updateStep(idx, {
                              delayMinutes: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-ink-500 mb-1">
                          Message
                        </label>
                        <textarea
                          className="w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition bg-white"
                          rows="3"
                          value={step.message}
                          onChange={(e) =>
                            updateStep(idx, { message: e.target.value })
                          }
                          placeholder="Hi {{name}}, thanks for subscribing…"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-ink-100 flex justify-end gap-2 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowModal(false)}
                className="border border-ink-200 hover:border-brand-300 text-ink-700 font-semibold text-sm rounded-xl px-4 py-2.5 transition"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm rounded-xl px-5 py-2.5 shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? "Saving…" : "Create campaign"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
