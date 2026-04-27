import { useEffect, useState } from "react";
import api from "@/services/api";
import toast from "react-hot-toast";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { Users, Mail, Shield, Trash2, Plus, X } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";

export default function TeamPage() {
  const { workspace, fetchWorkspace } = useWorkspaceStore();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ email: "", role: "agent" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (workspace?._id) fetchWorkspace(workspace._id);
  }, []);

  const refresh = () => workspace?._id && fetchWorkspace(workspace._id);

  const members = workspace?.members || [];
  const owner = workspace?.owner;

  const invite = async () => {
    if (!form.email.trim()) return toast.error("Email required");
    setSaving(true);
    try {
      await api.post(`/workspaces/${workspace._id}/members/invite`, form);
      toast.success("Invitation sent");
      setShowModal(false);
      setForm({ email: "", role: "agent" });
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (userId) => {
    if (!window.confirm("Remove this team member?")) return;
    try {
      await api.delete(`/workspaces/${workspace._id}/members/${userId}`);
      toast.success("Removed");
      refresh();
    } catch {
      toast.error("Failed");
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <PageHeader
        icon={Users}
        title="Team"
        subtitle="Invite agents to help manage your inbox and automations"
      >
        <button onClick={() => setShowModal(true)} className="btn-primary gap-2">
          <Plus className="w-4 h-4" /> Invite member
        </button>
      </PageHeader>

      <div className="card">
        {/* Owner */}
        {owner && (
          <div className="flex items-center gap-3 py-3 border-b border-ink-100">
            <div className="w-10 h-10 rounded-full bg-brand-gradient flex items-center justify-center text-white font-bold">
              {(owner.name || owner.email || "O")[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-medium text-ink-900">
                {owner.name || owner.email}
              </p>
              <p className="text-xs text-ink-500">{owner.email}</p>
            </div>
            <span className="chip bg-brand-100 text-brand-700 text-xs">
              <Shield className="w-3 h-3 mr-1 inline" /> Owner
            </span>
          </div>
        )}

        {members.length === 0 && !owner && (
          <p className="text-center text-ink-400 py-8">No team members yet.</p>
        )}

        {members.map((m) => {
          const u = m.user || {};
          return (
            <div
              key={m.user?._id || m._id}
              className="flex items-center gap-3 py-3 border-b border-ink-100 last:border-b-0"
            >
              <div className="w-10 h-10 rounded-full bg-ink-200 flex items-center justify-center font-semibold text-ink-600">
                {(u.name || u.email || "?")[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-medium text-ink-900">{u.name || u.email}</p>
                <p className="text-xs text-ink-500">{u.email}</p>
              </div>
              <span className="chip bg-ink-100 text-ink-600 text-xs capitalize">
                {m.role}
              </span>
              <button
                onClick={() => remove(u._id || m.user)}
                className="p-2 rounded hover:bg-red-50 text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-md max-w-md w-full">
            <div className="flex items-center justify-between p-5 border-b border-ink-100">
              <h2 className="text-lg font-semibold">Invite Team Member</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded hover:bg-ink-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="label">Email address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                  <input
                    className="input pl-9"
                    type="email"
                    placeholder="team@example.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="label">Role</label>
                <select
                  className="input"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="agent">Agent — reply to conversations</option>
                  <option value="owner">Owner — full access</option>
                </select>
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
                onClick={invite}
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? "Sending…" : "Send Invite"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
