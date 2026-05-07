/**
 * WhatsApp Broadcasts — distinct UI.
 *
 * Marketing-quota aware, template-style copy, business-tone presentation.
 * Persists `channel: "whatsapp"` so the listing stays scoped per channel.
 */
import { useEffect, useState } from "react";
import api from "@/services/api";
import toast from "react-hot-toast";
import {
  Plus,
  Send,
  Trash2,
  X,
  Users,
  Calendar,
  Megaphone,
  CheckCheck,
  ShieldCheck,
  Briefcase,
  TrendingUp,
} from "lucide-react";
import dayjs from "dayjs";
import EmptyState from "@/components/ui/EmptyState";

const STATUS_BADGE = {
  draft: "bg-ink-100 text-ink-600 border-ink-200",
  scheduled: "bg-sky-100 text-sky-700 border-sky-200",
  sending: "bg-amber-100 text-amber-700 border-amber-200",
  sent: "bg-teal-100 text-teal-700 border-teal-200",
  cancelled: "bg-ink-100 text-ink-500 border-ink-200",
  failed: "bg-red-100 text-red-700 border-red-200",
};

export default function WaBroadcastsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/broadcasts?channel=whatsapp");
      setCampaigns(data.campaigns || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const send = async (id) => {
    if (!window.confirm("Send this WhatsApp broadcast now?")) return;
    try {
      await api.post(`/broadcasts/${id}/send`);
      toast.success("Broadcast queued");
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

  // Aggregate
  const totalSent = campaigns.reduce((s, c) => s + (c.stats?.sent || 0), 0);
  const totalDelivered = campaigns.reduce(
    (s, c) => s + (c.stats?.delivered || 0),
    0,
  );

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-5">
      {/* WA-themed hero */}
      <div className="relative overflow-hidden border border-teal-200 bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 p-6">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-emerald-300/25 blur-3xl" />
        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-teal-600 flex items-center justify-center shadow">
              <Megaphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-ink-900">
                WhatsApp Broadcasts
              </h1>
              <p className="text-sm text-ink-600 mt-1 max-w-xl">
                Send transactional or marketing messages to opted-in customers.
                Subject to your plan's marketing quota.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm px-5 py-2.5 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New broadcast
          </button>
        </div>

        {/* Compliance notice */}
        <div className="relative mt-4 grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="bg-white border border-teal-200 px-3 py-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-700" />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-teal-700 font-bold">
                Compliance
              </p>
              <p className="text-xs font-bold text-ink-900">Opt-in required</p>
            </div>
          </div>
          <div className="bg-white border border-teal-200 px-3 py-2 flex items-center gap-2">
            <CheckCheck className="w-4 h-4 text-teal-700" />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-teal-700 font-bold">
                Delivered
              </p>
              <p className="text-xs font-bold text-ink-900">
                {totalDelivered.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="bg-white border border-teal-200 px-3 py-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-teal-700" />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-teal-700 font-bold">
                Total sent
              </p>
              <p className="text-xs font-bold text-ink-900">
                {totalSent.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns table */}
      {loading ? (
        <div className="text-center py-12 text-ink-400">Loading…</div>
      ) : campaigns.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No broadcasts yet"
          description="Send announcements, transactional updates or marketing offers to your WhatsApp customer base."
          action={
            <button
              onClick={() => setShowModal(true)}
              className="bg-teal-600 text-white px-4 py-2 font-bold text-sm flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Create broadcast
            </button>
          }
        />
      ) : (
        <div className="bg-white border border-ink-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-teal-50/60 border-b border-teal-100 text-left">
                <th className="px-4 py-2.5 text-[11px] uppercase font-bold text-teal-800 tracking-wide">
                  Campaign
                </th>
                <th className="px-4 py-2.5 text-[11px] uppercase font-bold text-teal-800 tracking-wide">
                  Status
                </th>
                <th className="px-4 py-2.5 text-[11px] uppercase font-bold text-teal-800 tracking-wide">
                  Targets
                </th>
                <th className="px-4 py-2.5 text-[11px] uppercase font-bold text-teal-800 tracking-wide">
                  Delivered
                </th>
                <th className="px-4 py-2.5 text-[11px] uppercase font-bold text-teal-800 tracking-wide">
                  Created
                </th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {campaigns.map((c) => (
                <tr key={c._id} className="hover:bg-teal-50/30">
                  <td className="px-4 py-3">
                    <p className="font-bold text-ink-900 text-sm">{c.name}</p>
                    <p className="text-xs text-ink-500 line-clamp-1 max-w-md">
                      {c.message}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 border ${STATUS_BADGE[c.status] || ""}`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-600 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {c.stats?.totalTargeted || 0}
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-600">
                    {c.stats?.delivered || 0}/{c.stats?.sent || 0}
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-500">
                    {c.scheduledAt ? (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {dayjs(c.scheduledAt).format("D MMM HH:mm")}
                      </span>
                    ) : (
                      dayjs(c.createdAt).format("D MMM YYYY")
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      {c.status === "draft" && (
                        <button
                          onClick={() => send(c._id)}
                          className="bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold px-2.5 py-1 flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          Send
                        </button>
                      )}
                      {["draft", "scheduled"].includes(c.status) && (
                        <button
                          onClick={() => del(c._id)}
                          className="text-ink-300 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
        channel: "whatsapp",
      };
      if (form.scheduledAt) payload.scheduledAt = form.scheduledAt;
      const { data } = await api.post("/broadcasts", payload);
      onCreated(data.campaign);
      toast.success("Broadcast created");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md p-6 border-t-4 border-teal-600">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-teal-600" />
            <h2 className="font-bold text-ink-900">New WhatsApp Broadcast</h2>
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
            <label className="label">Campaign name</label>
            <input
              className="input"
              required
              placeholder="Eid Special Offer"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Message body</label>
            <textarea
              className="input resize-none"
              rows={4}
              required
              placeholder="Hello {{name}}, your order is on its way…"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
            <p className="text-[10px] text-ink-400 mt-1">
              Use {"{{name}}"} to personalise. Marketing messages count against
              your monthly WA quota.
            </p>
          </div>
          <div>
            <label className="label">Target audience</label>
            <select
              className="input"
              value={form.targetType}
              onChange={(e) => setForm({ ...form, targetType: e.target.value })}
            >
              <option value="all">All opted-in customers</option>
              <option value="tag">Customers tagged with…</option>
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
            <label className="label">Send at (optional)</label>
            <input
              type="datetime-local"
              className="input"
              value={form.scheduledAt}
              onChange={(e) =>
                setForm({ ...form, scheduledAt: e.target.value })
              }
            />
          </div>
          <div className="bg-teal-50 border border-teal-200 px-3 py-2 text-[11px] text-teal-800">
            <ShieldCheck className="w-3 h-3 inline mr-1" />
            Only contacts who opted in to your business messages will receive
            this.
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
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm py-2 disabled:opacity-60"
            >
              {loading ? "Creating…" : "Create broadcast"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
