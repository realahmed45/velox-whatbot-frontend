/**
 * Instagram Followers — IG-flavoured contact list.
 *
 * Story-ring avatars, @username column, "DMed via" comment-trigger badge.
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
  Heart,
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
    <div className="flex h-full">
      <div className="flex-1 flex flex-col p-4 sm:p-8 overflow-hidden max-w-6xl mx-auto w-full">
        {/* IG hero */}
        <div className="relative overflow-hidden border border-rose-200 bg-gradient-to-br from-rose-50 via-fuchsia-50 to-violet-50 p-5 mb-5">
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-fuchsia-300/30 blur-3xl" />
          <div className="relative flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-500 via-fuchsia-600 to-violet-600 flex items-center justify-center shadow">
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
                className="text-xs font-bold px-3 py-2 border border-rose-200 text-rose-700 hover:bg-rose-50 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Export
              </button>
              <button
                onClick={() => setShowAdd(true)}
                className="text-xs font-bold px-3 py-2 bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add follower
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-rose-400" />
            <input
              className="input pl-8 text-sm !border-rose-200 focus:!border-rose-400"
              placeholder="Search name or @username…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <input
            className="input text-sm w-40 !border-rose-200 focus:!border-rose-400"
            placeholder="Filter by tag"
            value={tagFilter}
            onChange={(e) => {
              setTagFilter(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* Card grid */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <p className="text-center py-12 text-ink-400 text-sm">Loading…</p>
          ) : contacts.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="w-12 h-12 text-rose-300 mx-auto mb-3" />
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
                    className="group text-left bg-white border border-rose-100 hover:border-rose-300 hover:shadow-sm transition p-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="relative w-11 h-11 flex-shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-tr from-amber-400 via-rose-500 to-fuchsia-600 p-[1.5px]">
                          <div className="w-full h-full bg-white p-[1.5px]">
                            <div className="w-full h-full bg-gradient-to-br from-rose-500 to-fuchsia-600 flex items-center justify-center text-sm font-bold text-white">
                              {initial}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="font-bold text-ink-900 text-sm truncate">
                            {c.name || c.username || "—"}
                          </p>
                          {c.optedOut && (
                            <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1 py-0.5">
                              OFF
                            </span>
                          )}
                        </div>
                        {c.username && (
                          <p className="text-[11px] text-rose-600 font-medium truncate">
                            @{c.username}
                          </p>
                        )}
                        <p className="text-[10px] text-ink-400 mt-0.5">
                          Joined {dayjs(c.createdAt).fromNow()}
                        </p>
                      </div>
                    </div>
                    {c.lastTriggerType && (
                      <div className="mt-2 flex items-center gap-1 text-[10px] text-fuchsia-700 bg-fuchsia-50 px-1.5 py-0.5 w-fit">
                        <Sparkles className="w-2.5 h-2.5" />
                        DMed via {c.lastTriggerType}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(c.tags || []).slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="text-[10px] font-bold bg-rose-100 text-rose-700 px-1.5 py-0.5"
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
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-rose-100">
              <p className="text-xs text-ink-500">
                {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of{" "}
                {total.toLocaleString()}
              </p>
              <div className="flex gap-2">
                <button
                  className="text-xs font-bold px-3 py-1.5 border border-rose-200 disabled:opacity-50"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </button>
                <button
                  className="text-xs font-bold px-3 py-1.5 border border-rose-200 disabled:opacity-50"
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
    <div className="w-96 flex-shrink-0 bg-white border-l border-rose-100 flex flex-col">
      <div className="h-14 flex items-center justify-between px-4 border-b border-rose-100 bg-gradient-to-r from-rose-50 to-fuchsia-50">
        <h2 className="font-bold text-ink-900 text-sm">Follower details</h2>
        <button
          onClick={onClose}
          className="p-1.5 text-ink-400 hover:bg-rose-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-center pb-4 border-b border-rose-100">
          <div className="relative w-16 h-16 mx-auto mb-2">
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-400 via-rose-500 to-fuchsia-600 p-[2.5px]">
              <div className="w-full h-full bg-white p-[2px]">
                <div className="w-full h-full bg-gradient-to-br from-rose-500 to-fuchsia-600 flex items-center justify-center text-2xl font-bold text-white">
                  {(contact.name || contact.username || "?")[0]?.toUpperCase()}
                </div>
              </div>
            </div>
          </div>
          <p className="font-bold text-ink-900">
            {contact.name || contact.username || "Unknown"}
          </p>
          {contact.username && (
            <a
              href={`https://instagram.com/${contact.username}`}
              target="_blank"
              rel="noopener"
              className="text-xs text-rose-600 hover:underline inline-flex items-center gap-0.5"
            >
              @{contact.username} <ExternalLink className="w-2.5 h-2.5" />
            </a>
          )}
        </div>

        <div
          className={clsx(
            "p-3",
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
                className="text-[11px] font-bold px-2 py-1 border border-emerald-300 text-emerald-700"
              >
                <UserCheck className="w-3 h-3 inline" /> Enable
              </button>
            ) : (
              <button
                onClick={optOut}
                className="text-[11px] font-bold px-2 py-1 bg-red-500 text-white"
              >
                <UserX className="w-3 h-3 inline" /> Disable
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
          className="w-full text-sm font-bold py-2 bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white"
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
                className="text-[10px] font-bold bg-rose-100 text-rose-700 px-1.5 py-0.5 inline-flex items-center gap-0.5"
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
          <div className="flex gap-1">
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
              className="text-xs px-2 border border-rose-200 text-rose-700"
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
                  className="bg-rose-50/40 border border-rose-100 p-2 text-xs"
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
          <div className="flex gap-1">
            <textarea
              className="textarea text-xs"
              rows={2}
              placeholder="Note…"
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
            />
            <button
              onClick={addNote}
              className="text-xs px-2 border border-rose-200 text-rose-700"
            >
              Add
            </button>
          </div>
        </div>

        <button
          onClick={() => onDelete(contact._id)}
          className="w-full text-xs text-red-600 hover:bg-red-50 py-2 flex items-center justify-center gap-1"
        >
          <Trash2 className="w-3 h-3" /> Remove follower
        </button>
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
      <div className="bg-white w-full max-w-md p-6 shadow-hero">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-ink-900">Add follower</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-ink-400 hover:bg-ink-100"
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
              className="flex-1 text-sm font-bold border border-ink-200 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 text-sm font-bold bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white py-2"
            >
              {loading ? "Adding…" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
