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

const STATUS_BADGE = {
  draft: "bg-ink-100 text-ink-600",
  scheduled: "bg-fuchsia-100 text-fuchsia-700",
  sending: "bg-amber-100 text-amber-700",
  sent: "bg-rose-100 text-rose-700",
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

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-5">
      {/* IG-flavoured hero */}
      <div className="relative overflow-hidden border border-rose-200/60 bg-gradient-to-br from-rose-50 via-fuchsia-50 to-violet-50 p-6">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-fuchsia-300/30 blur-3xl" />
        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-fuchsia-600 flex items-center justify-center shadow-glow">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-ink-900">
                Instagram DM Blasts
              </h1>
              <p className="text-sm text-ink-600 mt-1 max-w-xl">
                Send a one-off DM to followers who interacted with you recently.
                Perfect for drops, restocks, story teasers and exclusive offers.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white font-bold text-sm px-5 py-2.5 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New blast
          </button>
        </div>

        {/* 24h window warning */}
        <div className="relative mt-4 bg-white/80 border border-amber-200 px-3 py-2.5 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-ink-700">
            <strong className="text-amber-700">24-hour window:</strong>{" "}
            Instagram only allows you to message users who DM'd you in the last
            24 hours. Followers outside this window won't receive your blast —
            that's a Meta policy, not a bug.
          </div>
        </div>
      </div>

      {/* Campaigns */}
      {loading ? (
        <div className="text-center py-12 text-ink-400">Loading…</div>
      ) : campaigns.length === 0 ? (
        <EmptyState
          icon={Instagram}
          title="No DM blasts yet"
          description="Send a personal DM to your engaged followers — perfect for product drops, story responses, and creator updates."
          action={
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white px-4 py-2 font-bold text-sm flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Create blast
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {campaigns.map((c) => (
            <div
              key={c._id}
              className="bg-white border border-rose-100 p-4 hover:border-rose-300 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Camera className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                    <h3 className="font-bold text-sm text-ink-900 truncate">
                      {c.name}
                    </h3>
                    <span
                      className={`text-[10px] uppercase font-bold px-1.5 py-0.5 ${STATUS_BADGE[c.status] || ""}`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <p className="text-xs text-ink-500 line-clamp-2 mb-2">
                    {c.message}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-ink-400">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-rose-400" />
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
                      className="bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white text-[11px] font-bold px-2.5 py-1 flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      Blast
                    </button>
                  )}
                  {["draft", "scheduled"].includes(c.status) && (
                    <button
                      onClick={() => del(c._id)}
                      className="text-ink-300 hover:text-rose-500 p-1"
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md p-6 border-t-4 border-rose-500">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-500" />
            <h2 className="font-bold text-ink-900">New IG DM Blast</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-ink-400 hover:text-ink-700"
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
          <div className="bg-amber-50 border border-amber-200 px-3 py-2 text-[11px] text-amber-800">
            Reminder: only followers who DM'd you within 24h will receive this.
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-ink-200 text-ink-700 font-bold text-sm py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white font-bold text-sm py-2 disabled:opacity-60"
            >
              {loading ? "Creating…" : "Create blast"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
