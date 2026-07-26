import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import api from "@/services/api";
import toast from "react-hot-toast";
import { useWorkspaceStore } from "@/store/workspaceStore";
import {
  Users,
  Mail,
  Shield,
  Trash2,
  Plus,
  X,
  Clock,
  UserPlus,
  Loader2,
  Send,
  Check,
  SlidersHorizontal,
} from "lucide-react";
import StatHero from "@/components/ui/StatHero";

/**
 * Shared permission checkbox grid used by both the invite and edit modals.
 * `selected` is the current key list; `onToggle`/`onToggleAll` mutate it.
 */
function PermissionGrid({ catalogue, selected, onToggle, onToggleAll }) {
  const allOn = catalogue.length > 0 && selected.length === catalogue.length;
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-ink-700">
          What can they access?
        </label>
        <button
          type="button"
          onClick={onToggleAll}
          className="text-[11px] font-bold text-brand-600 hover:underline"
        >
          {allOn ? "Clear all" : "Select all"}
        </button>
      </div>
      <div className="mt-2 space-y-1.5">
        {catalogue.map((p) => {
          const on = selected.includes(p.key);
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => onToggle(p.key)}
              className={`w-full flex items-start gap-3 text-left rounded-xl border p-3 transition ${
                on
                  ? "border-brand-300 bg-brand-50"
                  : "border-ink-200 hover:border-brand-200"
              }`}
            >
              <span
                className={`mt-0.5 rounded-md border flex items-center justify-center shrink-0 ${
                  on
                    ? "bg-brand-500 border-brand-500 text-white"
                    : "border-ink-300"
                }`}
                style={{ width: 18, height: 18 }}
              >
                {on && <Check className="w-3 h-3" />}
              </span>
              <span>
                <span className="block text-sm font-semibold text-ink-900">
                  {p.label}
                </span>
                <span className="block text-[11px] text-ink-500 leading-snug">
                  {p.desc}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function TeamPage() {
  const { workspace, fetchWorkspace } = useWorkspaceStore();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ email: "", role: "agent", permissions: [] });
  const [saving, setSaving] = useState(false);
  const [invites, setInvites] = useState([]);
  const [permCatalogue, setPermCatalogue] = useState([]);
  // Member whose permissions are being edited (null = closed), plus a working copy.
  const [editMember, setEditMember] = useState(null);
  const [editPerms, setEditPerms] = useState([]);
  const [savingPerms, setSavingPerms] = useState(false);

  useEffect(() => {
    api
      .get("/workspaces/permissions")
      .then(({ data }) => setPermCatalogue(data.permissions || []))
      .catch(() => {});
  }, []);

  const togglePerm = (key) =>
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(key)
        ? f.permissions.filter((p) => p !== key)
        : [...f.permissions, key],
    }));

  const toggleAllInvite = () =>
    setForm((f) => ({
      ...f,
      permissions:
        f.permissions.length === permCatalogue.length
          ? []
          : permCatalogue.map((p) => p.key),
    }));

  const openEdit = (m) => {
    setEditMember(m);
    setEditPerms(m.permissions || []);
  };

  const toggleEditPerm = (key) =>
    setEditPerms((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key],
    );

  const toggleAllEdit = () =>
    setEditPerms((prev) =>
      prev.length === permCatalogue.length
        ? []
        : permCatalogue.map((p) => p.key),
    );

  const saveEditPerms = async () => {
    const userId = editMember.user?._id || editMember.user;
    setSavingPerms(true);
    try {
      await api.put(
        `/workspaces/${workspace._id}/members/${userId}/permissions`,
        { permissions: editPerms },
      );
      toast.success("Permissions updated");
      setEditMember(null);
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update permissions");
    } finally {
      setSavingPerms(false);
    }
  };

  const owner = workspace?.owner;
  const ownerId = owner?._id || owner;
  // The owner may also appear in members — don't render them twice.
  const members = (workspace?.members || []).filter((m) => {
    const uid = m.user?._id || m.user;
    return String(uid) !== String(ownerId);
  });

  const loadInvites = useCallback(async () => {
    if (!workspace?._id) return;
    try {
      const { data } = await api.get(`/workspaces/${workspace._id}/invites`);
      setInvites(data.invites || []);
    } catch {
      /* non-owners get 403 — fine, just show nothing */
    }
  }, [workspace?._id]);

  useEffect(() => {
    if (workspace?._id) {
      fetchWorkspace(workspace._id);
      loadInvites();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace?._id]);

  const refresh = () => {
    if (workspace?._id) fetchWorkspace(workspace._id);
    loadInvites();
  };

  const invite = async () => {
    if (!form.email.trim()) return toast.error("Email required");
    setSaving(true);
    try {
      await api.post(`/workspaces/${workspace._id}/members/invite`, form);
      toast.success(`Invitation sent to ${form.email}`);
      setShowModal(false);
      setForm({ email: "", role: "agent", permissions: [] });
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send invite");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (userId) => {
    if (!window.confirm("Remove this team member?")) return;
    try {
      await api.delete(`/workspaces/${workspace._id}/members/${userId}`);
      toast.success("Member removed");
      refresh();
    } catch {
      toast.error("Failed to remove");
    }
  };

  const revokeInvite = async (email) => {
    try {
      await api.delete(
        `/workspaces/${workspace._id}/invites/${encodeURIComponent(email)}`,
      );
      toast.success("Invite revoked");
      loadInvites();
    } catch {
      toast.error("Failed to revoke");
    }
  };

  const seat = (name, email) => (name || email || "?")[0]?.toUpperCase() || "?";

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6">
      <StatHero
        icon={Users}
        title="Team"
        subtitle="Invite teammates to help manage your inbox and automations"
        stats={[
          { label: "Members", value: members.length + (owner ? 1 : 0), accent: true },
          { label: "Pending", value: invites.length },
        ]}
      >
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-white text-ink-900 font-bold text-sm px-4 py-2 hover:bg-white/90 transition"
        >
          <UserPlus className="w-4 h-4" /> Invite
        </button>
      </StatHero>

      {/* Members */}
      <section className="rounded-2xl border border-ink-100 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-ink-100">
          <h2 className="text-sm font-bold text-ink-900">Members</h2>
        </div>

        {owner && (
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-ink-50">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold shadow-sm">
              {seat(owner.name, owner.email)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-ink-900 truncate">
                {owner.name || owner.email}
              </p>
              <p className="text-xs text-ink-500 truncate">{owner.email}</p>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-100">
              <Shield className="w-3 h-3" /> Owner
            </span>
          </div>
        )}

        {members.map((m) => {
          const u = m.user || {};
          return (
            <div
              key={m.user?._id || m._id}
              className="flex items-center gap-3 px-5 py-3.5 border-b border-ink-50 last:border-b-0 hover:bg-ink-50/50 transition"
            >
              <div className="w-10 h-10 rounded-full bg-ink-100 flex items-center justify-center font-bold text-ink-600">
                {seat(u.name, u.email)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink-900 truncate">
                  {u.name || u.email}
                </p>
                <p className="text-xs text-ink-500 truncate">
                  {u.email}
                  {m.role === "agent" && (
                    <span className="text-ink-400">
                      {" · "}
                      {(m.permissions?.length || 0) === 0
                        ? "no access yet"
                        : `${m.permissions.length} area${
                            m.permissions.length === 1 ? "" : "s"
                          }`}
                    </span>
                  )}
                </p>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-ink-100 text-ink-600 capitalize">
                {m.role}
              </span>
              {m.role === "agent" && (
                <button
                  onClick={() => openEdit(m)}
                  className="p-2 rounded-lg text-ink-400 hover:text-brand-600 hover:bg-brand-50 transition"
                  title="Edit permissions"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => remove(u._id || m.user)}
                className="p-2 rounded-lg text-ink-400 hover:text-red-600 hover:bg-red-50 transition"
                title="Remove member"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}

        {members.length === 0 && !owner && (
          <p className="text-center text-ink-400 text-sm py-10">
            No team members yet.
          </p>
        )}
      </section>

      {/* Pending invites */}
      {invites.length > 0 && (
        <section className="rounded-2xl border border-ink-100 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-ink-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold text-ink-900">
              Pending invites ({invites.length})
            </h2>
          </div>
          {invites.map((i) => (
            <div
              key={i.email}
              className="flex items-center gap-3 px-5 py-3.5 border-b border-ink-50 last:border-b-0"
            >
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                <Mail className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink-900 truncate">{i.email}</p>
                <p className="text-xs text-ink-500">
                  {i.expired ? (
                    <span className="text-red-500 font-medium">Expired</span>
                  ) : (
                    "Invite sent · awaiting acceptance"
                  )}{" "}
                  · {i.role}
                </p>
              </div>
              <button
                onClick={() => revokeInvite(i.email)}
                className="text-xs font-bold px-3 py-1.5 rounded-lg border border-ink-200 text-ink-600 hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition"
              >
                Revoke
              </button>
            </div>
          ))}
        </section>
      )}

      {/* Roles explainer */}
      <div className="rounded-2xl border border-ink-100 bg-white p-5 text-sm text-ink-600 leading-relaxed">
        <p className="font-bold text-ink-900 mb-1.5">Roles</p>
        <p>
          <span className="font-semibold text-brand-700">Owner</span> — full
          access: billing, settings, automations, and team.{" "}
          <span className="font-semibold text-ink-800">Agent</span> — can view
          and reply to the inbox and manage contacts, but can't change billing
          or delete the workspace.
        </p>
      </div>

      {showModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] bg-ink-950/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-ink-100 flex flex-col max-h-[90vh] overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-brand-500 text-white flex items-center justify-center">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <h2 className="font-black text-ink-900">Invite a teammate</h2>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg text-ink-400 hover:bg-ink-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="text-xs font-bold text-ink-700">
                    Email address
                  </label>
                  <div className="relative mt-1.5">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                    <input
                      className="w-full rounded-xl border border-ink-200 pl-9 pr-3 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition"
                      type="email"
                      placeholder="teammate@example.com"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <PermissionGrid
                    catalogue={permCatalogue}
                    selected={form.permissions}
                    onToggle={togglePerm}
                    onToggleAll={toggleAllInvite}
                  />
                  <p className="text-[11px] text-ink-400 mt-2">
                    They'll get an email link to join (expires in 7 days) and
                    will only see the areas you tick.
                  </p>
                </div>
              </div>
              <div className="px-5 py-4 border-t border-ink-100 flex justify-end gap-2 shrink-0">
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-ink-200 text-ink-700 font-bold text-sm px-4 py-2.5 hover:bg-ink-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={invite}
                  disabled={saving || !form.email.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm px-4 py-2.5 disabled:opacity-50 transition"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Sending…
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Send invite
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {editMember &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] bg-ink-950/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setEditMember(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-ink-100 flex flex-col max-h-[90vh] overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-brand-500 text-white flex items-center justify-center shrink-0">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-black text-ink-900 truncate">
                      Edit permissions
                    </h2>
                    <p className="text-xs text-ink-500 truncate">
                      {editMember.user?.name || editMember.user?.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditMember(null)}
                  className="p-1.5 rounded-lg text-ink-400 hover:bg-ink-100 transition shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="px-5 py-4 overflow-y-auto flex-1">
                <PermissionGrid
                  catalogue={permCatalogue}
                  selected={editPerms}
                  onToggle={toggleEditPerm}
                  onToggleAll={toggleAllEdit}
                />
                <p className="text-[11px] text-ink-400 mt-2">
                  Changes take effect immediately — they'll only see the areas
                  you tick next time they load the app.
                </p>
              </div>
              <div className="px-5 py-4 border-t border-ink-100 flex justify-end gap-2 shrink-0">
                <button
                  onClick={() => setEditMember(null)}
                  className="rounded-xl border border-ink-200 text-ink-700 font-bold text-sm px-4 py-2.5 hover:bg-ink-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEditPerms}
                  disabled={savingPerms}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm px-4 py-2.5 disabled:opacity-50 transition"
                >
                  {savingPerms ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving…
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Save changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
