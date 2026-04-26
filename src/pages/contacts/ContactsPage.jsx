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
  MessageSquare,
  Instagram,
  StickyNote,
  Tag as TagIcon,
} from "lucide-react";
import dayjs from "dayjs";
import { clsx } from "clsx";

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    loadContacts(); /* eslint-disable-line */
  }, [page, search, tagFilter]);

  const loadContacts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.set("search", search);
      if (tagFilter) params.set("tag", tagFilter);
      const { data } = await api.get(`/contacts?${params}`);
      setContacts(data.contacts || []);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  };

  const updateContact = (updated) => {
    setContacts((cs) => cs.map((x) => (x._id === updated._id ? updated : x)));
    if (selected?._id === updated._id) setSelected(updated);
  };

  const exportCSV = async () => {
    try {
      const { data } = await api.get("/contacts/export", {
        responseType: "blob",
      });
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = "contacts.csv";
      a.click();
    } catch {
      toast.error("Export failed");
    }
  };

  const deleteContact = async (id) => {
    if (!window.confirm("Delete this contact? This cannot be undone.")) return;
    try {
      await api.delete(`/contacts/${id}`);
      setContacts((c) => c.filter((x) => x._id !== id));
      if (selected?._id === id) setSelected(null);
      toast.success("Contact deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="flex h-full bg-ink-50">
      <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-ink-900">Contacts</h1>
            <p className="text-sm text-ink-500">
              {total.toLocaleString()} total
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportCSV} className="btn-secondary text-sm">
              <Download className="w-4 h-4" /> Export
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="btn-primary text-sm"
            >
              <Plus className="w-4 h-4" /> Add contact
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-400" />
            <input
              className="input pl-8 text-sm"
              placeholder="Search name, username, phone…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <input
            className="input text-sm w-40"
            placeholder="Filter by tag"
            value={tagFilter}
            onChange={(e) => {
              setTagFilter(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* Table */}
        <div className="card overflow-hidden flex-1 flex flex-col">
          <div className="overflow-auto flex-1">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-50 text-left sticky top-0 z-10">
                  <th className="px-4 py-3 text-[11px] font-semibold text-ink-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-ink-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-ink-500 uppercase tracking-wider">
                    Tags
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-ink-500 uppercase tracking-wider">
                    Added
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-ink-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 w-12" />
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-12 text-ink-400 text-sm"
                    >
                      Loading…
                    </td>
                  </tr>
                ) : contacts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-100 to-accent-100 flex items-center justify-center mb-3">
                          <MessageSquare className="w-5 h-5 text-brand-600" />
                        </div>
                        <p className="text-sm font-semibold text-ink-800">
                          No contacts yet
                        </p>
                        <p className="text-xs text-ink-500 mt-1 max-w-sm">
                          Contacts appear automatically as people DM your
                          Instagram. You can also add one manually.
                        </p>
                        <button
                          onClick={() => setShowAdd(true)}
                          className="btn-primary text-xs mt-4 gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add contact
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  contacts.map((c) => (
                    <tr
                      key={c._id}
                      className="hover:bg-brand-50/40 cursor-pointer"
                      onClick={() => setSelected(c)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-brand-gradient text-white flex items-center justify-center text-xs font-semibold">
                            {(c.name || c.username || "?")[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-ink-800 leading-tight">
                              {c.name || c.username || "—"}
                            </p>
                            <p className="text-[11px] text-ink-400 font-mono">
                              {c.username
                                ? `@${c.username}`
                                : c.phone || c.igUserId || ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {c.source === "instagram" || c.igUserId ? (
                          <span className="chip bg-brand-50 text-brand-700 text-[10px]">
                            <Instagram className="w-2.5 h-2.5" /> Instagram
                          </span>
                        ) : (
                          <span className="chip bg-ink-100 text-ink-600 text-[10px]">
                            {c.source || "manual"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {(c.tags || []).slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="chip bg-ink-100 text-ink-700 text-[10px]"
                            >
                              #{t}
                            </span>
                          ))}
                          {c.tags?.length > 3 && (
                            <span className="chip bg-ink-100 text-ink-500 text-[10px]">
                              +{c.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-ink-400 text-xs">
                        {dayjs(c.createdAt).format("D MMM YYYY")}
                      </td>
                      <td className="px-4 py-3">
                        {c.optedOut ? (
                          <span className="chip bg-red-100 text-red-700 text-[10px]">
                            Opted Out
                          </span>
                        ) : (
                          <span className="chip bg-emerald-100 text-emerald-700 text-[10px]">
                            Active
                          </span>
                        )}
                      </td>
                      <td
                        className="px-4 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => deleteContact(c._id)}
                          className="p-1 rounded text-ink-300 hover:text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {total > 20 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-ink-100 bg-white">
              <p className="text-xs text-ink-500">
                Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of{" "}
                {total.toLocaleString()}
              </p>
              <div className="flex gap-2">
                <button
                  className="btn-secondary text-xs"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </button>
                <button
                  className="btn-secondary text-xs"
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
        <ContactDetailPanel
          contact={selected}
          onClose={() => setSelected(null)}
          onUpdate={updateContact}
        />
      )}
      {showAdd && (
        <AddContactModal
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

function ContactDetailPanel({ contact, onClose, onUpdate }) {
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
      toast.error("Save failed");
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
      toast.success("Opted out — no more auto-DMs");
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
      toast.success("Note added");
    } catch {
      toast.error("Failed");
    }
  };

  return (
    <div className="w-96 flex-shrink-0 bg-white border-l border-ink-100 flex flex-col">
      <div className="h-14 flex items-center justify-between px-4 border-b border-ink-100">
        <h2 className="font-semibold text-ink-900">Contact details</h2>
        <button
          onClick={onClose}
          className="p-1.5 rounded text-ink-400 hover:bg-ink-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Avatar */}
        <div className="text-center pb-4 border-b border-ink-100">
          <div className="w-16 h-16 bg-brand-gradient rounded-full flex items-center justify-center mx-auto mb-2 text-2xl font-bold text-white shadow-glow">
            {(contact.name || contact.username || "?")[0]?.toUpperCase()}
          </div>
          <p className="font-semibold text-ink-900">
            {contact.name || contact.username || "Unknown"}
          </p>
          {contact.username && (
            <p className="text-xs text-ink-400">@{contact.username}</p>
          )}
          {contact.phone && (
            <p className="text-xs text-ink-400 font-mono">{contact.phone}</p>
          )}
        </div>

        {/* Opt-out controls */}
        <div
          className={clsx(
            "rounded-lg p-3",
            contact.optedOut
              ? "bg-red-50 border border-red-200"
              : "bg-emerald-50 border border-emerald-200",
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink-900">
                {contact.optedOut ? "Opted out" : "Subscribed"}
              </p>
              <p className="text-[11px] text-ink-500">
                {contact.optedOut
                  ? "Automations won't send DMs to this contact."
                  : "This contact receives automated DMs."}
              </p>
            </div>
            {contact.optedOut ? (
              <button onClick={optIn} className="btn-secondary text-xs">
                <UserCheck className="w-3 h-3" /> Opt in
              </button>
            ) : (
              <button
                onClick={optOut}
                className="btn text-xs bg-red-500 text-white hover:bg-red-600"
              >
                <UserX className="w-3 h-3" /> Opt out
              </button>
            )}
          </div>
        </div>

        {/* Basic info */}
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
          className="btn-primary w-full text-sm"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>

        {/* Tags */}
        <div>
          <label className="label flex items-center gap-1">
            <TagIcon className="w-3.5 h-3.5" /> Tags
          </label>
          <div className="flex flex-wrap gap-1 mb-2">
            {(contact.tags || []).map((t) => (
              <span
                key={t}
                className="chip bg-brand-50 text-brand-700 text-[11px]"
              >
                #{t}
                <button
                  onClick={() => removeTag(t)}
                  className="ml-1 hover:text-red-500"
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
              placeholder="add tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
            />
            <button onClick={addTag} className="btn-secondary text-xs">
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Notes */}
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
                <div key={i} className="bg-ink-50 rounded-lg p-2 text-xs">
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
              placeholder="Add a note..."
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
            />
            <button
              onClick={addNote}
              className="btn-secondary text-xs self-stretch"
            >
              Add
            </button>
          </div>
        </div>

        {/* Recent activity */}
        {contact.lastTriggerType && (
          <div>
            <label className="label flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" /> Last activity
            </label>
            <div className="bg-ink-50 rounded-lg p-2 text-xs">
              <p className="text-ink-700">
                Triggered: <b>{contact.lastTriggerType}</b>
              </p>
              {contact.lastInteraction && (
                <p className="text-[10px] text-ink-400 mt-1">
                  {dayjs(contact.lastInteraction).fromNow()}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AddContactModal({ onClose, onAdded }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    tags: "",
  });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.phone) {
      toast.error("Phone required");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/contacts", {
        ...form,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      onAdded(data.contact);
      toast.success("Contact added");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ink-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-hero">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-ink-900">Add contact</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-ink-400 hover:bg-ink-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="label">Phone number *</label>
            <input
              className="input"
              placeholder="923001234567"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Name</label>
            <input
              className="input"
              placeholder="Ahmed Ali"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              placeholder="ahmed@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Tags (comma-separated)</label>
            <input
              className="input"
              placeholder="vip, lahore"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={loading}
            >
              {loading ? "Adding…" : "Add contact"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
