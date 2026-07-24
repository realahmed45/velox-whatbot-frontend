import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import api from "@/services/api";
import toast from "react-hot-toast";
import {
  Plus,
  Trash2,
  X,
  Droplet,
  Play,
  Pause,
  Clock,
  MessageSquare,
  Sparkles,
  Users,
  CheckCircle2,
  Zap,
} from "lucide-react";
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

// Friendly delay presets (client-side only) — quick-pick chips that set delayMinutes.
const DELAY_PRESETS = [
  { label: "Immediately", minutes: 0 },
  { label: "5 min", minutes: 5 },
  { label: "1 hour", minutes: 60 },
  { label: "1 day", minutes: 1440 },
  { label: "3 days", minutes: 4320 },
];

// Human-readable delay label from a minute count.
const formatDelay = (minutes) => {
  const m = Number(minutes) || 0;
  if (m <= 0) return "Immediately";
  if (m < 60) return `${m} min`;
  if (m < 1440) {
    const h = m / 60;
    return `${Number.isInteger(h) ? h : h.toFixed(1)} hour${h === 1 ? "" : "s"}`;
  }
  const d = m / 1440;
  return `${Number.isInteger(d) ? d : d.toFixed(1)} day${d === 1 ? "" : "s"}`;
};

// Ready-made starter templates (client-side only — they just prefill the form).
const TEMPLATES = [
  {
    id: "welcome",
    icon: Sparkles,
    title: "Welcome series",
    blurb: "3 messages · warm intro",
    form: {
      name: "Welcome Series",
      triggerType: "keyword",
      triggerValue: "hi",
      steps: [
        {
          delayMinutes: 0,
          message:
            "Hey {{name}} 👋 Welcome! Thanks for reaching out — I'm here to help you get started.",
        },
        {
          delayMinutes: 1440,
          message:
            "Quick tip to get the most out of us: reply anytime and I'll point you in the right direction. What are you hoping to achieve?",
        },
        {
          delayMinutes: 4320,
          message:
            "Ready to take the next step? Here's a little something to get you going — reply 'YES' and I'll set you up. 🎁",
        },
      ],
    },
  },
  {
    id: "abandoned",
    icon: Zap,
    title: "Abandoned interest",
    blurb: "3 messages · re-capture",
    form: {
      name: "Abandoned Interest",
      triggerType: "keyword",
      triggerValue: "price",
      steps: [
        {
          delayMinutes: 0,
          message:
            "Great question! Here's our pricing 👉 [link]. Any questions, just ask!",
        },
        {
          delayMinutes: 60,
          message:
            "Still thinking it over? Happy to walk you through what fits best for you — no pressure. 🙂",
        },
        {
          delayMinutes: 1440,
          message:
            "Last nudge — here's a special offer just for you if you decide today. Want me to send the details?",
        },
      ],
    },
  },
  {
    id: "reengage",
    icon: Users,
    title: "Re-engagement",
    blurb: "2 messages · win-back",
    form: {
      name: "Re-engagement",
      triggerType: "keyword",
      triggerValue: "info",
      steps: [
        {
          delayMinutes: 0,
          message:
            "Hey {{name}}! It's been a while — here's what's new with us. 🚀",
        },
        {
          delayMinutes: 1440,
          message:
            "We'd love to have you back. Reply and let me know what you're looking for and I'll help right away.",
        },
      ],
    },
  },
];

export default function DripCampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_CAMPAIGN);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  // Lock body scroll + Escape-to-close while the modal is open.
  useEffect(() => {
    if (!showModal) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") setShowModal(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [showModal]);

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

  // Apply a starter template — deep-clones its steps so edits don't mutate the constant.
  const applyTemplate = (tpl) =>
    setForm({
      ...tpl.form,
      steps: tpl.form.steps.map((s) => ({ ...s })),
    });

  const openModal = () => {
    setForm(EMPTY_CAMPAIGN);
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

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
          onClick={openModal}
          className="bg-white text-ink-900 hover:bg-brand-50 font-bold text-sm px-5 py-2.5 rounded-xl shadow-sm flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" /> New campaign
        </button>
      </StatHero>

      {loading ? (
        <div className="grid gap-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-ink-100 bg-white shadow-sm p-4 sm:p-5 animate-pulse"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-ink-100 flex-shrink-0" />
                <div className="flex-1 space-y-2.5">
                  <div className="h-3.5 bg-ink-100 rounded-full w-1/3" />
                  <div className="h-2.5 bg-ink-100 rounded-full w-2/3" />
                </div>
                <div className="w-9 h-9 rounded-xl bg-ink-100 flex-shrink-0" />
                <div className="w-9 h-9 rounded-xl bg-ink-100 flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <EmptyState
          icon={Droplet}
          title="No drip campaigns yet"
          description="Drip campaigns let you nurture leads over days or weeks with scheduled follow-ups — set it up once and let it run on autopilot."
          action={
            <button onClick={openModal} className="btn-primary gap-2">
              <Plus className="w-4 h-4" /> Create your first
            </button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {campaigns.map((c) => (
            <div
              key={c._id}
              className="group rounded-2xl border border-ink-100 bg-white shadow-sm hover:border-brand-300 hover:shadow-md transition flex flex-col p-4 sm:p-5"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 flex-shrink-0">
                  <Droplet className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-ink-900 truncate">
                      {c.name}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${
                        c.enabled
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-ink-100 text-ink-500"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          c.enabled ? "bg-emerald-500" : "bg-ink-400"
                        }`}
                      />
                      {c.enabled ? "Active" : "Paused"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-ink-500">
                    <Zap className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
                    <span className="capitalize">
                      {(c.trigger?.type || "keyword").replace(/_/g, " ")}
                    </span>
                    {c.trigger?.keyword && (
                      <span className="font-semibold text-ink-700 truncate">
                        · {c.trigger.keyword}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap mt-4">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-ink-50 border border-ink-100 px-2.5 py-1 text-xs font-semibold text-ink-600">
                  <MessageSquare className="w-3.5 h-3.5 text-ink-400" />
                  {c.steps?.length || 0} step
                  {(c.steps?.length || 0) === 1 ? "" : "s"}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 border border-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-700">
                  <Users className="w-3.5 h-3.5" />
                  {c.stats?.enrolled || 0} enrolled
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {c.stats?.completed || 0} completed
                </span>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-ink-100">
                <button
                  onClick={() => toggleActive(c._id, c.enabled)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl border border-ink-200 hover:border-brand-300 hover:bg-brand-50 text-ink-700 hover:text-brand-600 text-sm font-semibold transition"
                >
                  {c.enabled ? (
                    <>
                      <Pause className="w-4 h-4" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" /> Resume
                    </>
                  )}
                </button>
                <button
                  onClick={() => remove(c._id)}
                  className="p-2 rounded-xl border border-ink-200 hover:border-red-300 hover:bg-red-50 text-ink-600 hover:text-red-600 transition flex-shrink-0"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) closeModal();
            }}
          >
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
              {/* Sticky header */}
              <div className="flex items-center justify-between p-5 border-b border-ink-100 bg-white flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center text-white shadow-sm">
                    <Droplet className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-ink-900 leading-tight">
                      New drip campaign
                    </h2>
                    <p className="text-xs text-ink-500">
                      Build an automated multi-step sequence
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-1.5 rounded-lg text-ink-400 hover:text-ink-700 hover:bg-ink-50 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable body */}
              <div className="p-5 space-y-5 overflow-y-auto">
                {/* Starter templates */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-ink-700 mb-2">
                    <Sparkles className="w-4 h-4 text-brand-500" />
                    Start from a template
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {TEMPLATES.map((tpl) => {
                      const Icon = tpl.icon;
                      return (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => applyTemplate(tpl)}
                          className="text-left rounded-xl border border-ink-200 bg-white hover:border-brand-400 hover:bg-brand-50 hover:shadow-sm transition p-3 group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-brand-50 group-hover:bg-white flex items-center justify-center text-brand-600 mb-2 transition">
                            <Icon className="w-4 h-4" />
                          </div>
                          <p className="text-sm font-bold text-ink-900 leading-tight">
                            {tpl.title}
                          </p>
                          <p className="text-xs text-ink-500 mt-0.5">
                            {tpl.blurb}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="h-px bg-ink-100" />

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

                {/* Step builder */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-ink-700">
                      <MessageSquare className="w-4 h-4 text-brand-500" />
                      Sequence steps
                    </label>
                    <span className="text-xs text-ink-400">
                      {form.steps.length} message
                      {form.steps.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  <div className="space-y-0">
                    {form.steps.map((step, idx) => {
                      const chars = step.message.length;
                      return (
                        <div key={idx} className="relative">
                          {/* Timeline connector */}
                          {idx > 0 && (
                            <div className="absolute left-[18px] -top-3 h-3 w-px bg-brand-200" />
                          )}
                          <div className="flex gap-3">
                            {/* Timeline node + line */}
                            <div className="flex flex-col items-center flex-shrink-0">
                              <div className="w-9 h-9 rounded-full bg-brand-gradient text-white flex items-center justify-center text-sm font-bold shadow-sm">
                                {idx + 1}
                              </div>
                              {idx < form.steps.length - 1 && (
                                <div className="flex-1 w-px bg-brand-200 my-1" />
                              )}
                            </div>

                            {/* Step card */}
                            <div className="flex-1 min-w-0 rounded-xl border border-ink-100 bg-ink-50/50 p-3.5 mb-3">
                              <div className="flex items-center justify-between mb-2.5">
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700">
                                  <Clock className="w-3.5 h-3.5" />
                                  Wait {formatDelay(step.delayMinutes)}
                                </span>
                                {form.steps.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeStep(idx)}
                                    className="inline-flex items-center gap-1 text-red-500 text-xs font-semibold hover:text-red-600 transition"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" /> Remove
                                  </button>
                                )}
                              </div>

                              {/* Delay presets */}
                              <div className="flex flex-wrap gap-1.5 mb-2.5">
                                {DELAY_PRESETS.map((p) => {
                                  const active =
                                    Number(step.delayMinutes) === p.minutes;
                                  return (
                                    <button
                                      key={p.label}
                                      type="button"
                                      onClick={() =>
                                        updateStep(idx, {
                                          delayMinutes: p.minutes,
                                        })
                                      }
                                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition ${
                                        active
                                          ? "bg-brand-500 border-brand-500 text-white"
                                          : "bg-white border-ink-200 text-ink-600 hover:border-brand-300 hover:text-brand-600"
                                      }`}
                                    >
                                      {p.label}
                                    </button>
                                  );
                                })}
                                <div className="inline-flex items-center gap-1 rounded-full border border-ink-200 bg-white pl-2.5 pr-1 py-0.5">
                                  <input
                                    type="number"
                                    min="0"
                                    className="w-12 bg-transparent text-xs text-ink-900 text-right outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    value={step.delayMinutes}
                                    onChange={(e) =>
                                      updateStep(idx, {
                                        delayMinutes: Number(e.target.value),
                                      })
                                    }
                                    aria-label="Custom delay in minutes"
                                  />
                                  <span className="text-xs text-ink-400 pr-1">
                                    min
                                  </span>
                                </div>
                              </div>

                              {/* Message */}
                              <textarea
                                className="w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition bg-white resize-none"
                                rows="3"
                                value={step.message}
                                onChange={(e) =>
                                  updateStep(idx, { message: e.target.value })
                                }
                                placeholder="Hi {{name}}, thanks for subscribing…"
                              />
                              <div className="flex justify-end mt-1">
                                <span
                                  className={`text-[11px] ${
                                    chars > 0 ? "text-ink-400" : "text-ink-300"
                                  }`}
                                >
                                  {chars} character{chars === 1 ? "" : "s"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={addStep}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-ink-200 hover:border-brand-400 hover:bg-brand-50 text-ink-600 hover:text-brand-600 text-sm font-semibold py-2.5 transition"
                  >
                    <Plus className="w-4 h-4" /> Add step
                  </button>
                </div>
              </div>

              {/* Sticky footer */}
              <div className="p-5 border-t border-ink-100 flex justify-end gap-2 bg-white flex-shrink-0">
                <button
                  onClick={closeModal}
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
          </div>,
          document.body,
        )}
    </div>
  );
}
