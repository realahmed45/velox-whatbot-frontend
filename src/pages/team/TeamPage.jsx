import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Magnetic, Reveal, Spotlight } from "@/components/fx";
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
import { useConfirm } from "@/components/ui/ConfirmDialog";
import {
  PERMISSION_LIST as FALLBACK_PERMISSIONS,
  permissionLabel,
} from "@/data/permissions";

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
          Which parts of the hotel can they open?
        </label>
        <button
          type="button"
          onClick={onToggleAll}
          className="rounded-lg px-2 py-1 text-[11px] font-semibold text-sunset-flame transition-all duration-300 ease-spring hover:bg-sunset-soft active:scale-95"
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
              className={`group w-full flex items-start gap-3 text-left rounded-xl p-3 ring-1 transition-all duration-300 ease-spring active:scale-[0.98] ${
                on
                  ? "bg-white ring-sunset-flame/35 shadow-[0_8px_20px_-12px_rgba(255,106,43,0.5),inset_0_1px_0_#fff]"
                  : "bg-white/60 ring-ink-900/[0.08] hover:bg-white hover:ring-sunset-flame/20 hover:-translate-y-px"
              }`}
            >
              <span
                className={`mt-0.5 rounded-md flex items-center justify-center shrink-0 transition-all duration-300 ease-spring ${
                  on
                    ? "bg-sunset text-white scale-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
                    : "ring-1 ring-ink-900/20 bg-white group-hover:scale-110"
                }`}
                style={{ width: 18, height: 18 }}
              >
                <AnimatePresence>
                  {on && (
                    <motion.span
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 600, damping: 22 }}
                      className="flex"
                    >
                      <Check className="w-3 h-3" strokeWidth={3} />
                    </motion.span>
                  )}
                </AnimatePresence>
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
  const confirm = useConfirm();
  const { workspace, fetchWorkspace } = useWorkspaceStore();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ email: "", role: "agent", permissions: [] });
  const [saving, setSaving] = useState(false);
  const [invites, setInvites] = useState([]);
  // Seeded from the local mirror so the invite modal is never empty; the
  // backend catalogue replaces it as soon as it lands.
  const [permCatalogue, setPermCatalogue] = useState(FALLBACK_PERMISSIONS);
  // Member whose permissions are being edited (null = closed), plus a working copy.
  const [editMember, setEditMember] = useState(null);
  const [editPerms, setEditPerms] = useState([]);
  const [savingPerms, setSavingPerms] = useState(false);

  useEffect(() => {
    api
      .get("/workspaces/permissions")
      .then(({ data }) => {
        if (data.permissions?.length) setPermCatalogue(data.permissions);
      })
      .catch(() => {
        /* keep the local mirror — invite still works */
      });
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
      toast.success("Access updated");
      setEditMember(null);
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update access");
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
    const ok = await confirm({
      title: "Remove this person from your team?",
      description:
        "They'll lose access to your property immediately. Bookings and guest messages they handled stay exactly as they are.",
      confirmLabel: "Remove",
      cancelLabel: "Cancel",
      danger: true,
    });
    if (!ok) return;
    try {
      await api.delete(`/workspaces/${workspace._id}/members/${userId}`);
      toast.success("Removed from your team");
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

  const backdropAnim = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  };
  const modalPop = {
    initial: { opacity: 0, y: 16, scale: 0.96, filter: "blur(4px)" },
    animate: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
    exit: { opacity: 0, y: 10, scale: 0.97, filter: "blur(4px)" },
    transition: { type: "spring", stiffness: 420, damping: 30 },
  };

  const seat = (name, email) => (name || email || "?")[0]?.toUpperCase() || "?";

  return (
    <div className="px-4 sm:px-8 pt-6 sm:pt-8 pb-10 max-w-4xl mx-auto space-y-6">
      <StatHero
        icon={Users}
        title="Team"
        subtitle="Add your front desk, managers and housekeeping — and choose what each one can open"
        help={{
          title: "Team",
          tips: [
            "Invite staff by email; they get a link to join that expires in 7 days.",
            "Tick exactly which parts of the hotel each person can open when you invite them.",
            "Staff only see the areas you grant, and can't touch billing or delete the property.",
            "Edit anyone's access later with the sliders icon; changes apply immediately.",
            "You're the owner — you always have everything, including billing.",
          ],
        }}
        stats={[
          { label: "Staff", value: members.length + (owner ? 1 : 0), accent: true },
          { label: "Pending", value: invites.length },
        ]}
      >
        <Magnetic strength={0.25}>
          <button
            onClick={() => setShowModal(true)}
            className="group btn-primary"
          >
            <UserPlus className="w-4 h-4 transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]" />{" "}
            Invite staff
          </button>
        </Magnetic>
      </StatHero>

      {/* Members */}
      <Reveal y={16}>
      <section className="card overflow-hidden">
        <div className="px-4 sm:px-5 py-3 border-b border-ink-900/[0.06] bg-white/60 backdrop-blur flex items-center gap-2">
          <Users className="w-4 h-4 text-sunset-flame" strokeWidth={1.8} />
          <h2 className="font-display text-sm font-semibold tracking-[-0.01em] text-ink-900">Staff</h2>
        </div>

        <div className="divide-y divide-ink-900/[0.06]">
        {owner && (
          <div className="group flex items-center gap-3 px-4 sm:px-5 py-3.5">
            <div className="relative w-10 h-10 shrink-0">
              <span aria-hidden className="absolute inset-0 rounded-full bg-sunset opacity-40 blur-md" />
              <div className="relative w-10 h-10 rounded-full bg-sunset flex items-center justify-center text-white font-bold ring-2 ring-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition-transform duration-500 ease-spring group-hover:scale-110 group-hover:rotate-6">
                {seat(owner.name, owner.email)}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-ink-900 truncate">
                {owner.name || owner.email}
              </p>
              <p className="text-xs text-ink-500 truncate">
                {owner.email}
                <span className="text-ink-400">
                  {" · full access to everything"}
                </span>
              </p>
            </div>
            <span className="badge-brand inline-flex items-center gap-1 shrink-0">
              <Shield className="w-3 h-3" /> Owner
            </span>
          </div>
        )}

        {members.map((m, idx) => {
          const u = m.user || {};
          return (
            <motion.div
              key={m.user?._id || m._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx, 10) * 0.04, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="group flex flex-wrap sm:flex-nowrap items-start gap-3 px-4 sm:px-5 py-3.5 hover:bg-white/80 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ink-100 to-ink-200 ring-2 ring-white flex items-center justify-center font-bold text-ink-600 shrink-0 transition-transform duration-500 ease-spring group-hover:scale-110 group-hover:-rotate-6">
                {seat(u.name, u.email)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink-900 truncate">
                  {u.name || u.email}
                </p>
                <p className="text-xs text-ink-500 truncate">{u.email}</p>
                {m.role === "agent" &&
                  ((m.permissions?.length || 0) === 0 ? (
                    <p className="text-[11px] text-ink-400 mt-1">
                      No areas granted yet
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {m.permissions.map((k) => (
                        <span
                          key={k}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/80 text-ink-600 ring-1 ring-ink-900/[0.08]"
                        >
                          {permissionLabel(k)}
                        </span>
                      ))}
                    </div>
                  ))}
              </div>
              <div className="ml-auto flex items-center gap-1 shrink-0">
              <span className="badge-gray shrink-0 mr-1">
                {m.role === "agent" ? "Staff" : "Owner"}
              </span>
              {m.role === "agent" && (
                <button
                  onClick={() => openEdit(m)}
                  className="group/ic grid h-10 w-10 sm:h-9 sm:w-9 place-items-center -mt-1 rounded-xl text-ink-400 hover:text-sunset-flame hover:bg-sunset-soft transition-all duration-300 ease-spring active:scale-90 shrink-0"
                  title="Edit access"
                >
                  <SlidersHorizontal className="w-4 h-4 transition-transform duration-500 ease-spring group-hover/ic:rotate-90" />
                </button>
              )}
              <button
                onClick={() => remove(u._id || m.user)}
                className="group/ic grid h-10 w-10 sm:h-9 sm:w-9 place-items-center -mt-1 rounded-xl text-ink-400 hover:text-rose-600 hover:bg-rose-50 transition-all duration-300 ease-spring active:scale-90 shrink-0"
                title="Remove from team"
              >
                <Trash2 className="w-4 h-4 transition-transform duration-500 ease-spring group-hover/ic:-translate-y-0.5 group-hover/ic:rotate-[-12deg]" />
              </button>
              </div>
            </motion.div>
          );
        })}
        </div>

        {members.length === 0 && !owner && (
          <div className="flex flex-col items-center text-center px-6 py-12">
            <div className="relative mb-4">
              <span aria-hidden className="absolute inset-0 rounded-2xl bg-sunset opacity-20 blur-2xl" />
              <span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-sunset-soft text-sunset-flame">
                <Users className="w-5 h-5" strokeWidth={1.8} />
              </span>
            </div>
            <p className="text-ink-500 text-sm">
              No staff yet — invite your front desk to get started.
            </p>
          </div>
        )}
      </section>
      </Reveal>

      {/* Pending invites */}
      {invites.length > 0 && (
        <Reveal y={16} delay={0.05}>
        <section className="card overflow-hidden">
          <div className="px-4 sm:px-5 py-3 border-b border-ink-900/[0.06] bg-white/60 backdrop-blur flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" strokeWidth={1.8} />
            <h2 className="font-display text-sm font-semibold tracking-[-0.01em] text-ink-900">
              Pending invites ({invites.length})
            </h2>
          </div>
          <div className="divide-y divide-ink-900/[0.06]">
          <AnimatePresence initial={false}>
          {invites.map((i) => (
            <motion.div
              key={i.email}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 24, transition: { duration: 0.2 } }}
              className="group flex items-center gap-3 px-4 sm:px-5 py-3.5 hover:bg-white/80 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-amber-50 ring-1 ring-amber-500/15 flex items-center justify-center text-amber-600 shrink-0 transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-10deg]">
                <Mail className="w-4 h-4" strokeWidth={1.8} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink-900 truncate">{i.email}</p>
                <p className="text-xs text-ink-500">
                  {i.expired ? (
                    <span className="text-rose-500 font-medium">Expired</span>
                  ) : (
                    "Invite sent · awaiting acceptance"
                  )}{" "}
                  · {i.role === "agent" ? "Staff" : i.role}
                </p>
              </div>
              <button
                onClick={() => revokeInvite(i.email)}
                className="shrink-0 text-xs font-semibold px-3 py-2 rounded-xl bg-white/80 ring-1 ring-ink-900/[0.08] text-ink-600 transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:ring-rose-500/30 hover:text-rose-600 hover:bg-rose-50 active:scale-95"
              >
                Revoke
              </button>
            </motion.div>
          ))}
          </AnimatePresence>
          </div>
        </section>
        </Reveal>
      )}

      {/* Roles explainer */}
      <Reveal y={16} delay={0.08}>
      <Spotlight className="card p-5 text-sm text-ink-600 leading-relaxed">
        <p className="font-display font-semibold tracking-[-0.01em] text-ink-900 mb-1.5">Roles</p>
        <p>
          <span className="font-semibold text-sunset-flame">Owner</span> — that's
          you. Everything, always: every booking, the calendar and rates, the
          channel manager, the AI assistant, your team and billing. There's
          nothing to tick.
        </p>
        <p className="mt-2">
          <span className="font-semibold text-ink-800">Staff</span> — your front
          desk, managers and housekeeping. They only see the areas you tick, and
          can never reach billing or delete your property. Give the front desk{" "}
          <span className="font-semibold">Bookings</span> and{" "}
          <span className="font-semibold">Guest messages</span>; housekeeping
          usually only needs <span className="font-semibold">Calendar &amp; rates</span>{" "}
          for the housekeeping board.
        </p>
      </Spotlight>
      </Reveal>

      {createPortal(
          <AnimatePresence>
          {showModal && (
          <motion.div
            {...backdropAnim}
            className="fixed inset-0 z-[100] bg-night-950/40 backdrop-blur-md flex items-end sm:items-center justify-center p-3 sm:p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              {...modalPop}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong w-full max-w-md rounded-3xl flex flex-col max-h-[90vh] overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-ink-900/[0.06] shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sunset text-white flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_6px_16px_-6px_rgba(255,61,119,0.55)]">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <h2 className="font-display font-semibold tracking-[-0.02em] text-ink-900">Invite a staff member</h2>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="grid h-9 w-9 place-items-center rounded-xl text-ink-400 hover:text-ink-700 hover:bg-ink-900/[0.05] hover:rotate-90 transition-all duration-300 ease-spring active:scale-90"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="label !mb-0">
                    Email address
                  </label>
                  <div className="relative mt-1.5">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                    <input
                      className="input pl-9"
                      type="email"
                      placeholder="frontdesk@yourhotel.com"
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
                    will only see the areas you tick. Leave everything unticked
                    and they'll start with Bookings and Guest messages.
                  </p>
                </div>
              </div>
              <div className="px-5 py-4 border-t border-ink-900/[0.06] flex justify-end gap-2 shrink-0 bg-white/40">
                <button
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={invite}
                  disabled={saving || !form.email.trim()}
                  className="btn-primary"
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
            </motion.div>
          </motion.div>
          )}
          </AnimatePresence>,
          document.body,
        )}

      {createPortal(
          <AnimatePresence>
          {editMember && (
          <motion.div
            {...backdropAnim}
            className="fixed inset-0 z-[100] bg-night-950/40 backdrop-blur-md flex items-end sm:items-center justify-center p-3 sm:p-4"
            onClick={() => setEditMember(null)}
          >
            <motion.div
              {...modalPop}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong w-full max-w-md rounded-3xl flex flex-col max-h-[90vh] overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-ink-900/[0.06] shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-sunset text-white flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_6px_16px_-6px_rgba(255,61,119,0.55)]">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-display font-semibold tracking-[-0.02em] text-ink-900 truncate">
                      Edit access
                    </h2>
                    <p className="text-xs text-ink-500 truncate">
                      {editMember.user?.name || editMember.user?.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditMember(null)}
                  className="grid h-9 w-9 place-items-center rounded-xl text-ink-400 hover:text-ink-700 hover:bg-ink-900/[0.05] hover:rotate-90 transition-all duration-300 ease-spring active:scale-90 shrink-0"
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
                  you tick next time they load Botlify.
                </p>
              </div>
              <div className="px-5 py-4 border-t border-ink-900/[0.06] flex justify-end gap-2 shrink-0 bg-white/40">
                <button
                  onClick={() => setEditMember(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEditPerms}
                  disabled={savingPerms}
                  className="btn-primary"
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
            </motion.div>
          </motion.div>
          )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
