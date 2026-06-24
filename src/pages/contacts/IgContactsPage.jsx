/**
 * Instagram audience — Botlify orange/white theme, glass cards.
 * Responsive: card grid reflows; the detail panel becomes a slide-over
 * drawer on mobile and an inline side panel on desktop.
 * Calls /contacts?channel=instagram to filter to IG-sourced contacts only.
 */
import { useEffect, useState } from "react";
import api from "@/services/api";
import toast from "react-hot-toast";
import {
  Plus,
  Search,
  Download,
  Trash2,
  X,
  UserX,
  UserCheck,
  Instagram,
  StickyNote,
  Tag as TagIcon,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { clsx } from "clsx";
dayjs.extend(relativeTime);

function Avatar({ initial, size = "w-11 h-11", text = "text-sm" }) {
  return (
    <div
      className={clsx(
        size,
        text,
        "rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center font-bold text-white shadow-sm flex-shrink-0",
      )}
    >
      {initial}
    </div>
  );
}

export default function IgContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [page, search, tagFilter]);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 20,
        channel: "instagram",
      });
      if (search) params.set("search", search);
      if (tagFilter) params.set("tag", tagFilter);
      const { data } = await api.get(`/contacts?${params}`);
      setContacts(data.contacts || []);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  };

  const updateContact = (u) => {
    setContacts((cs) => cs.map((x) => (x._id === u._id ? u : x)));
    if (selected?._id === u._id) setSelected(u);
  };

  const exportCSV = async () => {
    try {
      const { data } = await api.get("/contacts/export?channel=instagram", {
        responseType: "blob",
      });
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = "instagram-contacts.csv";
      a.click();
    } catch {
      toast.error("Export failed");
    }
  };

  const deleteContact = async (id) => {
    if (!window.confirm("Remove this follower from your contacts?")) return;
    try {
      await api.delete(`/contacts/${id}`);
      setContacts((c) => c.filter((x) => x._id !== id));
      if (selected?._id === id) setSelected(null);
      toast.success("Removed");
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="flex h-full relative">
      {/* Ambient glass backdrop */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 right-0 w-[36rem] h-[36rem] rounded-full bg-brand-200/35 blur-[130px]" />
        <div className="absolute bottom-0 -left-24 w-[30rem] h-[30rem] rounded-full bg-amber-200/25 blur-[130px]" />
      </div>

      <div className="relative flex-1 flex flex-col p-4 sm:p-8 overflow-hidden max-w-6xl mx-auto w-full">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl shadow-glass p-5 mb-5">
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-brand-300/25 blur-3xl" />
          <div className="relative flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-brand-500 flex items-center justify-center shadow-glow">
                <Instagram className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-ink-900">
                  Instagram audience
                </h1>
                <p className="text-sm text-ink-600">
                  {total.toLocaleString()} followers and DMers in your contacts.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={exportCSV}
                className="text-xs font-bold px-3.5 py-2 rounded-lg border border-ink-200 text-ink-700 hover:border-brand-300 hover:text-brand-600 flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" /> Export
              </button>
              <button
                onClick={() => setShowAdd(true)}
                className="text-xs font-bold px-3.5 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white shadow-glow flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Add follower
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              className="input !pl-9 text-sm"
              placeholder="Search name or @username…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <input
            className="input text-sm sm:w-40"
            placeholder="Filter by tag"
            value={tagFilter}
            onChange={(e) => {
              setTagFilter(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* Card grid */}
        <div className="flex-1 overflow-auto -mx-1 px-1">
          {loading ? (
            <p className="text-center py-12 text-ink-400 text-sm">Loading…</p>
          ) : contacts.length === 0 ? (
            <div className="text-center py-16">
              <img
                src="/logo.png"
                alt=""
                className="w-16 mx-auto mb-3 object-contain animate-float drop-shadow"
              />
              <p className="font-bold text-ink-800">No followers yet</p>
              <p className="text-xs text-ink-500 mt-1 max-w-sm mx-auto">
                Once people DM your IG or trigger a comment automation, they'll
                show up here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {contacts.map((c) => {
                const initial = (c.name || c.username || "?")[0]?.toUpperCase();
                return (
                  <button
                    key={c._id}
                    onClick={() => setSelected(c)}
                    className="group text-left rounded-xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-glass hover:border-brand-300 hover:bg-white/90 transition p-3.5"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar initial={initial} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="font-bold text-ink-900 text-sm truncate">
                            {c.name || c.username || "—"}
                          </p>
                          {c.optedOut && (
                            <span className="text-[9px] font-bold text-red-600 bg-red-50 rounded px-1 py-0.5">
                              OFF
                            </span>
                          )}
                        </div>
                        {c.username && (
                          <p className="text-[11px] text-brand-600 font-medium truncate">
                            @{c.username}
                          </p>
                        )}
                        <p className="text-[10px] text-ink-400 mt-0.5">
                          Joined {dayjs(c.createdAt).fromNow()}
                        </p>
                      </div>
                    </div>
                    {c.lastTriggerType && (
                      <div className="mt-2 flex items-center gap-1 text-[10px] text-brand-700 bg-brand-50 rounded-full px-2 py-0.5 w-fit">
                        <Sparkles className="w-2.5 h-2.5" />
                        DMed via {c.lastTriggerType}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(c.tags || []).slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="text-[10px] font-bold bg-brand-100 text-brand-700 rounded-full px-1.5 py-0.5"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {total > 20 && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-ink-100">
              <p className="text-xs text-ink-500">
                {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of{" "}
                {total.toLocaleString()}
              </p>
              <div className="flex gap-2">
                <button
                  className="text-xs font-bold px-3 py-1.5 rounded-lg border border-ink-200 hover:border-brand-300 disabled:opacity-50"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </button>
                <button
                  className="text-xs font-bold px-3 py-1.5 rounded-lg border border-ink-200 hover:border-brand-300 disabled:opacity-50"
                  disabled={page * 20 >= total}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {selected && (
        <DetailPanel
          contact={selected}
          onClose={() => setSelected(null)}
          onUpdate={updateContact}
          onDelete={deleteContact}
        />
      )}
      {showAdd && (
        <AddModal
          onClose={() => setShowAdd(false)}
          onAdded={(c) => {
            setContacts((cs) => [c, ...cs]);
            setShowAdd(false);
          }}
        />
      )}
    </div>
  );
}

function DetailPanel({ contact, onClose, onUpdate, onDelete }) {
  const [form, setForm] = useState({
    name: contact.name || "",
    email: contact.email || "",
  });
  const [tagInput, setTagInput] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.put(`/contacts/${contact._id}`, form);
      onUpdate(data.contact);
      toast.success("Saved");
    } catch {
      toast.error("Failed");
    } finally {
      setSaving(false);
    }
  };
  const addTag = async () => {
    const t = tagInput.trim().toLowerCase();
    if (!t) return;
    try {
      const { data } = await api.post(`/contacts/${contact._id}/tags`, {
        tag: t,
      });
      onUpdate(data.contact);
      setTagInput("");
    } catch {
      toast.error("Failed");
    }
  };
  const removeTag = async (tag) => {
    try {
      const { data } = await api.delete(
        `/contacts/${contact._id}/tags/${encodeURIComponent(tag)}`,
      );
      onUpdate(data.contact);
    } catch {
      toast.error("Failed");
    }
  };
  const optOut = async () => {
    try {
      const { data } = await api.post(`/contacts/${contact._id}/opt-out`);
      onUpdate(data.contact);
      toast.success("Opted out");
    } catch {
      toast.error("Failed");
    }
  };
  const optIn = async () => {
    try {
      const { data } = await api.post(`/contacts/${contact._id}/opt-in`);
      onUpdate(data.contact);
      toast.success("Opted in");
    } catch {
      toast.error("Failed");
    }
  };
  const addNote = async () => {
    if (!noteInput.trim()) return;
    try {
      const { data } = await api.post(`/contacts/${contact._id}/notes`, {
        content: noteInput.trim(),
      });
      onUpdate(data.contact);
      setNoteInput("");
    } catch {
      toast.error("Failed");
    }
  };

  return (
    <div className="fixed inset-0 z-40 md:static md:z-auto md:w-96 md:flex-shrink-0">
      {/* mobile backdrop */}
      <div
        className="md:hidden absolute inset-0 bg-ink-950/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute right-0 inset-y-0 w-full max-w-sm md:static md:max-w-none md:w-full h-full bg-white border-l border-ink-100 flex flex-col shadow-2xl md:shadow-none">
        <div className="h-14 flex items-center justify-between px-4 border-b border-ink-100 bg-white/80 backdrop-blur-xl">
          <h2 className="font-bold text-ink-900 text-sm">Follower details</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-400 hover:bg-ink-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="text-center pb-4 border-b border-ink-100">
            <Avatar
              initial={(contact.name ||
                contact.username ||
                "?")[0]?.toUpperCase()}
              size="w-16 h-16 mx-auto mb-2"
              text="text-2xl"
            />
            <p className="font-bold text-ink-900">
              {contact.name || contact.username || "Unknown"}
            </p>
            {contact.username && (
              <a
                href={`https://instagram.com/${contact.username}`}
                target="_blank"
                rel="noopener"
                className="text-xs text-brand-600 hover:underline inline-flex items-center gap-0.5"
              >
                @{contact.username} <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>

          <div
            className={clsx(
              "p-3 rounded-xl",
              contact.optedOut
                ? "bg-red-50 border border-red-200"
                : "bg-emerald-50 border border-emerald-200",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-ink-900">
                  {contact.optedOut ? "Auto-DM disabled" : "Auto-DM enabled"}
                </p>
                <p className="text-[10px] text-ink-500">
                  {contact.optedOut
                    ? "We won't DM this follower automatically."
                    : "Bot can DM this follower."}
                </p>
              </div>
              {contact.optedOut ? (
                <button
                  onClick={optIn}
                  className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg border border-emerald-300 text-emerald-700 hover:bg-emerald-100 inline-flex items-center gap-1"
                >
                  <UserCheck className="w-3 h-3" /> Enable
                </button>
              ) : (
                <button
                  onClick={optOut}
                  className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 inline-flex items-center gap-1"
                >
                  <UserX className="w-3 h-3" /> Disable
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="label">Display name</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="w-full text-sm font-bold py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white shadow-glow disabled:opacity-60 transition"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>

          <div>
            <label className="label flex items-center gap-1">
              <TagIcon className="w-3.5 h-3.5" /> Tags
            </label>
            <div className="flex flex-wrap gap-1 mb-2">
              {(contact.tags || []).map((t) => (
                <span
                  key={t}
                  className="text-[10px] font-bold bg-brand-100 text-brand-700 rounded-full px-2 py-0.5 inline-flex items-center gap-0.5"
                >
                  #{t}
                  <button
                    onClick={() => removeTag(t)}
                    className="hover:text-red-500"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
              {contact.tags?.length === 0 && (
                <p className="text-xs text-ink-400">No tags yet.</p>
              )}
            </div>
            <div className="flex gap-1.5">
              <input
                className="input text-xs"
                placeholder="add tag…"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addTag())
                }
              />
              <button
                onClick={addTag}
                className="text-xs px-2.5 rounded-lg border border-ink-200 text-brand-600 hover:bg-brand-50 transition"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div>
            <label className="label flex items-center gap-1">
              <StickyNote className="w-3.5 h-3.5" /> Notes
            </label>
            <div className="space-y-2 mb-2 max-h-40 overflow-y-auto">
              {(contact.notes || []).length === 0 && (
                <p className="text-xs text-ink-400">No notes yet.</p>
              )}
              {(contact.notes || [])
                .slice()
                .reverse()
                .map((n, i) => (
                  <div
                    key={i}
                    className="bg-brand-50/50 border border-brand-100 rounded-lg p-2 text-xs"
                  >
                    <p className="text-ink-800 whitespace-pre-wrap">
                      {n.content}
                    </p>
                    <p className="text-[10px] text-ink-400 mt-1">
                      {n.addedAt ? dayjs(n.addedAt).format("D MMM, h:mm A") : ""}
                    </p>
                  </div>
                ))}
            </div>
            <div className="flex gap-1.5">
              <textarea
                className="textarea text-xs"
                rows={2}
                placeholder="Note…"
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
              />
              <button
                onClick={addNote}
                className="text-xs px-2.5 rounded-lg border border-ink-200 text-brand-600 hover:bg-brand-50 transition"
              >
                Add
              </button>
            </div>
          </div>

          <button
            onClick={() => onDelete(contact._id)}
            className="w-full text-xs text-red-600 hover:bg-red-50 rounded-lg py-2 flex items-center justify-center gap-1 transition"
          >
            <Trash2 className="w-3 h-3" /> Remove follower
          </button>
        </div>
      </div>
    </div>
  );
}

function AddModal({ onClose, onAdded }) {
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    tags: "",
  });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.username) {
      toast.error("Username required");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/contacts", {
        ...form,
        source: "instagram",
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      onAdded(data.contact);
      toast.success("Added");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ink-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-hero">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-ink-900">Add follower</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-400 hover:bg-ink-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="label">@username *</label>
            <input
              className="input"
              placeholder="creatorhandle"
              required
              value={form.username}
              onChange={(e) =>
                setForm({ ...form, username: e.target.value.replace(/^@/, "") })
              }
            />
          </div>
          <div>
            <label className="label">Display name</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Tags (comma-separated)</label>
            <input
              className="input"
              placeholder="vip, story-watcher"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 text-sm font-bold rounded-lg border border-ink-200 py-2.5 hover:bg-ink-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 text-sm font-bold rounded-lg bg-brand-500 hover:bg-brand-600 text-white py-2.5 shadow-glow disabled:opacity-60 transition"
            >
              {loading ? "Adding…" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
