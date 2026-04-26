import { useEffect, useState } from "react";
import api from "@/services/api";
import toast from "react-hot-toast";
import { Plus, Trash2, X, Droplet, Play, Pause } from "lucide-react";
import dayjs from "dayjs";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";

const EMPTY_STEP = { delayMinutes: 60, messageText: "" };
const EMPTY_CAMPAIGN = {
  name: "",
  triggerType: "keyword",
  triggerValue: "",
  steps: [{ ...EMPTY_STEP }],
};

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
    if (!form.steps.length || form.steps.some((s) => !s.messageText.trim()))
      return toast.error("All steps need message text");
    setSaving(true);
    try {
      await api.post("/drip-campaigns", form);
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

  const toggleActive = async (id, isActive) => {
    try {
      await api.put(`/drip-campaigns/${id}`, { isActive: !isActive });
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

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <PageHeader
        icon={Droplet}
        title="Drip campaigns"
        subtitle="Multi-step DM sequences triggered by keywords or events"
      >
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary gap-2"
        >
          <Plus className="w-4 h-4" /> New campaign
        </button>
      </PageHeader>

      {loading ? (
        <div className="text-center py-12 text-ink-400">Loading…</div>
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
            <div key={c._id} className="card flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-ink-900">{c.name}</h3>
                  <span
                    className={`chip ${c.isActive ? "bg-emerald-100 text-emerald-700" : "bg-ink-100 text-ink-500"}`}
                  >
                    {c.isActive ? "Active" : "Paused"}
                  </span>
                </div>
                <p className="text-xs text-ink-500 mt-1">
                  Trigger: <span className="font-medium">{c.triggerType}</span>{" "}
                  — {c.triggerValue} · {c.steps?.length || 0} steps ·{" "}
                  {c.stats?.enrolled || 0} enrolled · {c.stats?.completed || 0}{" "}
                  completed
                </p>
              </div>
              <button
                onClick={() => toggleActive(c._id, c.isActive)}
                className="btn btn-outline"
                title={c.isActive ? "Pause" : "Activate"}
              >
                {c.isActive ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => remove(c._id)}
                className="p-2 rounded hover:bg-red-50 text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-ink-100 sticky top-0 bg-white">
              <h2 className="text-lg font-semibold">New Drip Campaign</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded hover:bg-ink-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="label">Campaign Name</label>
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="E.g. Welcome Series"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Trigger Type</label>
                  <select
                    className="input"
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
                  <label className="label">Trigger Value</label>
                  <input
                    className="input"
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
                  <label className="label mb-0">Steps</label>
                  <button
                    type="button"
                    onClick={addStep}
                    className="text-xs text-brand-600 font-medium hover:underline"
                  >
                    + Add Step
                  </button>
                </div>
                <div className="space-y-3">
                  {form.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="border border-ink-200 rounded-lg p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-ink-600">
                          Step {idx + 1}
                        </span>
                        {form.steps.length > 1 && (
                          <button
                            onClick={() => removeStep(idx)}
                            className="text-red-500 text-xs hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div>
                        <label className="text-xs text-ink-500">
                          Delay (minutes after previous step)
                        </label>
                        <input
                          type="number"
                          min="0"
                          className="input"
                          value={step.delayMinutes}
                          onChange={(e) =>
                            updateStep(idx, {
                              delayMinutes: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs text-ink-500">Message</label>
                        <textarea
                          className="input"
                          rows="3"
                          value={step.messageText}
                          onChange={(e) =>
                            updateStep(idx, { messageText: e.target.value })
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
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? "Saving…" : "Create Campaign"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
