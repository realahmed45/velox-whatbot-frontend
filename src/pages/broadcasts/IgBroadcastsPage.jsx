/**
 * Instagram Broadcasts — distinct UI.
 *
 * IG broadcasts are subject to the **24-hour messaging window**: you can
 * only proactively DM users who messaged your account in the last 24h.
 * This page makes that constraint front and centre.
 */
import { useEffect, useState } from "react";
import api from "@/services/api";
import toast from "react-hot-toast";
import {
  Plus,
  Send,
  Trash2,
  X,
  Heart,
  Calendar,
  Instagram,
  AlertTriangle,
  Sparkles,
  Camera,
} from "lucide-react";
import dayjs from "dayjs";
import EmptyState from "@/components/ui/EmptyState";
import StatHero from "@/components/ui/StatHero";

const STATUS_BADGE = {
  draft: "bg-ink-100 text-ink-600",
  scheduled: "bg-brand-100 text-brand-700",
  sending: "bg-amber-100 text-amber-700",
  sent: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-ink-100 text-ink-500",
  failed: "bg-red-100 text-red-700",
};

export default function IgBroadcastsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/broadcasts?channel=instagram");
      setCampaigns(data.campaigns || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const sendCampaign = async (id) => {
    if (
      !window.confirm(
        "Send this DM blast now? Only users who messaged you in the last 24h will receive it.",
      )
    )
      return;
    try {
      await api.post(`/broadcasts/${id}/send`);
      toast.success("DM blast queued");
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to send");
    }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this campaign?")) return;
    try {
      await api.delete(`/broadcasts/${id}`);
      setCampaigns((cs) => cs.filter((c) => c._id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Failed");
    }
  };

  const sentCount = campaigns.filter((c) => c.status === "sent").length;
  const scheduledCount = campaigns.filter(
    (c) => c.status === "scheduled",
  ).length;
  const draftCount = campaigns.filter((c) => c.status === "draft").length;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Hero */}
      <StatHero
        icon={Send}
        title="Instagram DM Blasts"
        subtitle="Send a one-off DM to followers who interacted with you recently. Perfect for drops, restocks, story teasers and exclusive offers."
        stats={[
          { label: "Campaigns", value: campaigns.length },
          { label: "Sent", value: sentCount },
          { label: "Scheduled", value: scheduledCount, accent: true },
          { label: "Drafts", value: draftCount },
        ]}
      >
        <button
          onClick={() => setShowModal(true)}
          className="bg-white text-ink-900 hover:bg-brand-50 font-bold text-sm px-5 py-2.5 rounded-xl shadow-sm flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          New blast
        </button>
      </StatHero>

      {/* 24h window warning */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
        </div>
        <div className="text-xs text-ink-700 leading-relaxed pt-0.5">
          <strong className="text-amber-700">24-hour window:</strong>{" "}
          Instagram only allows you to message users who DM'd you in the last 24
          hours. Followers outside this window won't receive your blast — that's
          a Meta policy, not a bug.
        </div>
      </div>

      {/* Campaigns */}
      {loading ? (
        <div className="text-center py-16 text-ink-400 text-sm">Loading…</div>
      ) : campaigns.length === 0 ? (
        <EmptyState
          icon={Instagram}
          title="No DM blasts yet"
          description="Send a personal DM to your engaged followers — perfect for product drops, story responses, and creator updates."
          action={
            <button
              onClick={() => setShowModal(true)}
              className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2.5 rounded-xl shadow-sm font-bold text-sm flex items-center gap-2 mx-auto transition"
            >
              <Plus className="w-4 h-4" />
              Create blast
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((c) => (
            <div
              key={c._id}
              className="group rounded-2xl border border-ink-100 bg-white shadow-sm p-5 hover:border-brand-300 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                      <Camera className="w-4 h-4 text-brand-500" />
                    </div>
                    <h3 className="font-bold text-sm text-ink-900 truncate">
                      {c.name}
                    </h3>
                    <span
                      className={`text-[10px] uppercase tracking-wide font-bold px-2 py-0.5 rounded-full ${STATUS_BADGE[c.status] || ""}`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <p className="text-xs text-ink-500 line-clamp-2 mb-3 leading-relaxed">
                    {c.message}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-ink-400">
                    <span className="flex items-center gap-1">
                      <Send className="w-3 h-3 text-brand-400" />
                      {c.stats?.totalTargeted || 0} reached
                    </span>
                    {c.scheduledAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {dayjs(c.scheduledAt).format("D MMM HH:mm")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  {c.status === "draft" && (
                    <button
                      onClick={() => sendCampaign(c._id)}
                      className="bg-brand-500 hover:bg-brand-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition"
                    >
                      <Send className="w-3 h-3" />
                      Blast
                    </button>
                  )}
                  {["draft", "scheduled"].includes(c.status) && (
                    <button
                      onClick={() => del(c._id)}
                      className="text-ink-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <CreateModal
          onClose={() => setShowModal(false)}
          onCreated={(c) => {
            setCampaigns((cs) => [c, ...cs]);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

function CreateModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: "",
    message: "",
    targetType: "all",
    tag: "",
    scheduledAt: "",
  });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const targetSegment =
        form.targetType === "tag"
          ? { type: "tag", tags: [form.tag] }
          : { type: "all" };
      const payload = {
        name: form.name,
        message: form.message,
        targetSegment,
        channel: "instagram",
      };
      if (form.scheduledAt) payload.scheduledAt = form.scheduledAt;
      const { data } = await api.post("/broadcasts", payload);
      onCreated(data.campaign);
      toast.success("Blast created");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ink-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-hero border border-ink-100">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-brand-500" />
            </div>
            <h2 className="font-bold text-ink-900">New IG DM Blast</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-400 hover:bg-ink-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="label">Blast name (internal)</label>
            <input
              className="input"
              required
              placeholder="Friday drop teaser"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">DM message</label>
            <textarea
              className="input resize-none"
              rows={4}
              required
              placeholder="Hey {{name}} ✨ exclusive early access just for you…"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
            <p className="text-[10px] text-ink-400 mt-1">
              Use {"{{name}}"} for personalisation. Keep it casual +
              emoji-friendly.
            </p>
          </div>
          <div>
            <label className="label">Audience</label>
            <select
              className="input"
              value={form.targetType}
              onChange={(e) => setForm({ ...form, targetType: e.target.value })}
            >
              <option value="all">All recently-engaged followers</option>
              <option value="tag">Filter by tag</option>
            </select>
          </div>
          {form.targetType === "tag" && (
            <input
              className="input"
              placeholder="Tag (e.g. vip)"
              value={form.tag}
              onChange={(e) => setForm({ ...form, tag: e.target.value })}
            />
          )}
          <div>
            <label className="label">Schedule (optional)</label>
            <input
              type="datetime-local"
              className="input"
              value={form.scheduledAt}
              onChange={(e) =>
                setForm({ ...form, scheduledAt: e.target.value })
              }
            />
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-[11px] text-amber-800 leading-relaxed">
            Reminder: only followers who DM'd you within 24h will receive this.
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-ink-200 text-ink-700 font-bold text-sm py-2.5 hover:border-brand-300 hover:bg-ink-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm py-2.5 shadow-sm disabled:opacity-60 transition"
            >
              {loading ? "Creating…" : "Create blast"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
