/**
 * WhatsApp Customers — business-style contact table with phone, opt-in
 * compliance status, and country flags. Calls /contacts?channel=whatsapp.
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
  Phone,
  ShieldCheck,
  StickyNote,
  Tag as TagIcon,
  Users,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";
import dayjs from "dayjs";
import { clsx } from "clsx";

const fmtPhone = (p) => {
  if (!p) return "";
  const s = p.replace(/\D/g, "");
  if (s.length > 10)
    return `+${s.slice(0, s.length - 10)} ${s.slice(-10, -7)} ${s.slice(-7, -4)} ${s.slice(-4)}`;
  return p;
};

export default function WaContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [page, search, tagFilter, statusFilter]);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 20,
        channel: "whatsapp",
      });
      if (search) params.set("search", search);
      if (tagFilter) params.set("tag", tagFilter);
      const { data } = await api.get(`/contacts?${params}`);
      let list = data.contacts || [];
      if (statusFilter === "active") list = list.filter((c) => !c.optedOut);
      if (statusFilter === "opted_out") list = list.filter((c) => c.optedOut);
      setContacts(list);
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
      const { data } = await api.get("/contacts/export?channel=whatsapp", {
        responseType: "blob",
      });
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = "whatsapp-customers.csv";
      a.click();
    } catch {
      toast.error("Export failed");
    }
  };

  const deleteContact = async (id) => {
    if (
      !window.confirm(
        "Permanently delete this customer? This cannot be undone.",
      )
    )
      return;
    try {
      await api.delete(`/contacts/${id}`);
      setContacts((c) => c.filter((x) => x._id !== id));
      if (selected?._id === id) setSelected(null);
      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const optedInPct =
    total > 0
      ? Math.round(
          (contacts.filter((c) => !c.optedOut).length / contacts.length) * 100,
        )
      : 0;

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col p-4 sm:p-8 overflow-hidden max-w-6xl mx-auto w-full">
        {/* WA hero */}
        <div className="border border-teal-200 bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 p-5 mb-5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-teal-600 flex items-center justify-center shadow">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-ink-900">
                  WhatsApp customer list
                </h1>
                <p className="text-sm text-ink-600">
                  {total.toLocaleString()} total · {optedInPct}% opted-in.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={exportCSV}
                className="text-xs font-bold px-3 py-2 border border-teal-200 text-teal-700 hover:bg-teal-50 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
              <button
                onClick={() => setShowAdd(true)}
                className="text-xs font-bold px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add customer
              </button>
            </div>
          </div>
        </div>

        {/* Compliance banner */}
        <div className="bg-emerald-50 border-l-4 border-emerald-500 border-y border-r border-emerald-100 p-3 mb-4 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-ink-700">
            <p className="font-bold text-ink-900">Opt-in policy enforced</p>
            <p>
              Only opted-in customers receive broadcasts. Manage opt-outs from
              each customer's profile to stay GDPR &amp; WhatsApp Business
              policy compliant.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-teal-500" />
            <input
              className="input pl-8 text-sm !border-teal-200 focus:!border-teal-500"
              placeholder="Name or phone…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <input
            className="input text-sm w-32 !border-teal-200 focus:!border-teal-500"
            placeholder="Tag"
            value={tagFilter}
            onChange={(e) => {
              setTagFilter(e.target.value);
              setPage(1);
            }}
          />
          <div className="flex border border-teal-200">
            {[
              { v: "all", l: "All" },
              { v: "active", l: "Opted-in" },
              { v: "opted_out", l: "Opted-out" },
            ].map((o) => (
              <button
                key={o.v}
                onClick={() => setStatusFilter(o.v)}
                className={clsx(
                  "text-[11px] font-bold px-3 py-1.5",
                  statusFilter === o.v
                    ? "bg-teal-600 text-white"
                    : "bg-white text-teal-700 hover:bg-teal-50",
                )}
              >
                {o.l}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-teal-100 overflow-hidden flex-1 flex flex-col">
          <div className="overflow-auto flex-1">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-teal-50 border-b border-teal-100 text-left sticky top-0 z-10">
                  <th className="px-4 py-2.5 text-[11px] font-bold text-teal-800 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-2.5 text-[11px] font-bold text-teal-800 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-4 py-2.5 text-[11px] font-bold text-teal-800 uppercase tracking-wider">
                    Tags
                  </th>
                  <th className="px-4 py-2.5 text-[11px] font-bold text-teal-800 uppercase tracking-wider">
                    Added
                  </th>
                  <th className="px-4 py-2.5 text-[11px] font-bold text-teal-800 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-2.5 w-12" />
                </tr>
              </thead>
              <tbody className="divide-y divide-teal-50">
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
                    <td colSpan={6} className="py-16">
                      <div className="text-center">
                        <Phone className="w-10 h-10 text-teal-300 mx-auto mb-2" />
                        <p className="font-bold text-ink-800">
                          No customers yet
                        </p>
                        <p className="text-xs text-ink-500 mt-1 max-w-sm mx-auto">
                          Customers appear here when they message your WhatsApp
                          number, or you can import them.
                        </p>
                        <button
                          onClick={() => setShowAdd(true)}
                          className="text-xs font-bold mt-4 px-3 py-1.5 bg-teal-600 text-white"
                        >
                          <Plus className="w-3 h-3 inline" /> Add customer
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  contacts.map((c) => (
                    <tr
                      key={c._id}
                      className="hover:bg-teal-50/40 cursor-pointer"
                      onClick={() => setSelected(c)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-teal-600 text-white flex items-center justify-center text-xs font-bold">
                            {(c.name || c.phone || "?")[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-ink-900 leading-tight">
                              {c.name || "Unnamed"}
                            </p>
                            {c.email && (
                              <p className="text-[11px] text-ink-400">
                                {c.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-ink-700">
                        {fmtPhone(c.phone)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {(c.tags || []).slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="text-[10px] font-bold bg-teal-100 text-teal-800 px-1.5 py-0.5"
                            >
                              {t}
                            </span>
                          ))}
                          {c.tags?.length > 3 && (
                            <span className="text-[10px] font-bold bg-ink-100 text-ink-500 px-1.5 py-0.5">
                              +{c.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-ink-500 text-xs">
                        {dayjs(c.createdAt).format("D MMM YYYY")}
                      </td>
                      <td className="px-4 py-3">
                        {c.optedOut ? (
                          <span className="text-[10px] font-bold bg-red-100 text-red-800 px-1.5 py-0.5 inline-flex items-center gap-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" /> Opted-out
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 inline-flex items-center gap-0.5">
                            <ShieldCheck className="w-2.5 h-2.5" /> Opted-in
                          </span>
                        )}
                      </td>
                      <td
                        className="px-4 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => deleteContact(c._id)}
                          className="p-1 text-ink-300 hover:text-red-500 hover:bg-red-50"
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
            <div className="flex items-center justify-between px-4 py-3 border-t border-teal-100">
              <p className="text-xs text-ink-500">
                {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of{" "}
                {total.toLocaleString()}
              </p>
              <div className="flex gap-2">
                <button
                  className="text-xs font-bold px-3 py-1.5 border border-teal-200 disabled:opacity-50"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </button>
                <button
                  className="text-xs font-bold px-3 py-1.5 border border-teal-200 disabled:opacity-50"
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
    <div className="w-96 flex-shrink-0 bg-white border-l border-teal-100 flex flex-col">
      <div className="h-14 flex items-center justify-between px-4 border-b border-teal-100 bg-teal-600 text-white">
        <h2 className="font-bold text-sm">Customer details</h2>
        <button
          onClick={onClose}
          className="p-1.5 text-white/70 hover:bg-teal-700"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-center pb-4 border-b border-teal-100">
          <div className="w-16 h-16 bg-teal-600 mx-auto mb-2 flex items-center justify-center text-2xl font-bold text-white">
            {(contact.name || contact.phone || "?")[0]?.toUpperCase()}
          </div>
          <p className="font-bold text-ink-900">{contact.name || "Unnamed"}</p>
          <p className="text-xs text-ink-500 font-mono mt-0.5">
            <Phone className="w-3 h-3 inline mr-0.5" />
            {fmtPhone(contact.phone)}
          </p>
        </div>

        <div
          className={clsx(
            "p-3 border-l-4",
            contact.optedOut
              ? "bg-red-50 border-red-500 border-y border-r border-red-200"
              : "bg-emerald-50 border-emerald-500 border-y border-r border-emerald-200",
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-bold text-ink-900">
                {contact.optedOut
                  ? "Opted out (cannot message)"
                  : "Opted in (compliant)"}
              </p>
              <p className="text-[10px] text-ink-500">
                {contact.optedOut
                  ? "Per WhatsApp policy, no broadcasts will be sent."
                  : "Customer agreed to receive WhatsApp messages."}
              </p>
            </div>
            {contact.optedOut ? (
              <button
                onClick={optIn}
                className="text-[11px] font-bold px-2 py-1 border border-emerald-300 text-emerald-700"
              >
                <UserCheck className="w-3 h-3 inline" /> Opt in
              </button>
            ) : (
              <button
                onClick={optOut}
                className="text-[11px] font-bold px-2 py-1 bg-red-500 text-white"
              >
                <UserX className="w-3 h-3 inline" /> Opt out
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
          className="w-full text-sm font-bold py-2 bg-teal-600 hover:bg-teal-700 text-white"
        >
          {saving ? "Saving…" : "Save"}
        </button>

        <div>
          <label className="label flex items-center gap-1">
            <TagIcon className="w-3.5 h-3.5" /> Tags
          </label>
          <div className="flex flex-wrap gap-1 mb-2">
            {(contact.tags || []).map((t) => (
              <span
                key={t}
                className="text-[10px] font-bold bg-teal-100 text-teal-800 px-1.5 py-0.5 inline-flex items-center gap-0.5"
              >
                {t}
                <button
                  onClick={() => removeTag(t)}
                  className="hover:text-red-500"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
            {contact.tags?.length === 0 && (
              <p className="text-xs text-ink-400">No tags.</p>
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
              className="text-xs px-2 border border-teal-200 text-teal-700"
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
              <p className="text-xs text-ink-400">No notes.</p>
            )}
            {(contact.notes || [])
              .slice()
              .reverse()
              .map((n, i) => (
                <div
                  key={i}
                  className="bg-teal-50/40 border border-teal-100 p-2 text-xs"
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
              placeholder="Internal note…"
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
            />
            <button
              onClick={addNote}
              className="text-xs px-2 border border-teal-200 text-teal-700 self-stretch"
            >
              Add
            </button>
          </div>
        </div>

        {contact.lastTriggerType && (
          <div>
            <label className="label flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" /> Last activity
            </label>
            <div className="bg-teal-50/40 border border-teal-100 p-2 text-xs">
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

        <button
          onClick={() => onDelete(contact._id)}
          className="w-full text-xs text-red-600 hover:bg-red-50 py-2 flex items-center justify-center gap-1"
        >
          <Trash2 className="w-3 h-3" /> Delete customer
        </button>
      </div>
    </div>
  );
}

function AddModal({ onClose, onAdded }) {
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
        source: "whatsapp",
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
          <h2 className="font-black text-ink-900">Add customer</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-ink-400 hover:bg-ink-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="label">Phone (with country code) *</label>
            <input
              className="input font-mono"
              placeholder="923001234567"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <p className="text-[10px] text-ink-400 mt-1">
              Customer must opt in before broadcasts can be sent.
            </p>
          </div>
          <div>
            <label className="label">Name</label>
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
              placeholder="vip, lahore"
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
              className="flex-1 text-sm font-bold bg-teal-600 hover:bg-teal-700 text-white py-2"
            >
              {loading ? "Adding…" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
