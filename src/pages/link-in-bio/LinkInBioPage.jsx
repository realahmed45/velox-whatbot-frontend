import { useEffect, useState } from "react";
import api from "@/services/api";
import toast from "react-hot-toast";
import {
  Link2,
  Plus,
  Trash2,
  GripVertical,
  Eye,
  Copy,
  Check,
  Save,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";

const THEMES = [
  { key: "brand", label: "Brand (Purple)" },
  { key: "gradient", label: "Gradient" },
  { key: "light", label: "Light" },
  { key: "dark", label: "Dark" },
];

const BLANK_LINK = { title: "", url: "", enabled: true, order: 0 };

export default function LinkInBioPage() {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/bio");
      setPage(
        data.page || {
          slug: "",
          displayName: "",
          bio: "",
          avatarUrl: "",
          theme: "brand",
          accentColor: "#6366f1",
          links: [],
          enabled: true,
        },
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!page.slug || !/^[a-z0-9_-]{3,32}$/.test(page.slug)) {
      return toast.error("Slug: 3-32 chars, a-z 0-9 _ -");
    }
    setSaving(true);
    try {
      const { data } = await api.post("/bio", page);
      setPage(data.page);
      toast.success("Saved");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const updateLink = (i, patch) =>
    setPage((p) => ({
      ...p,
      links: p.links.map((l, idx) => (idx === i ? { ...l, ...patch } : l)),
    }));

  const addLink = () =>
    setPage((p) => ({
      ...p,
      links: [...p.links, { ...BLANK_LINK, order: p.links.length }],
    }));

  const removeLink = (i) =>
    setPage((p) => ({ ...p, links: p.links.filter((_, idx) => idx !== i) }));

  const moveLink = (i, dir) =>
    setPage((p) => {
      const links = [...p.links];
      const j = i + dir;
      if (j < 0 || j >= links.length) return p;
      [links[i], links[j]] = [links[j], links[i]];
      return { ...p, links: links.map((l, idx) => ({ ...l, order: idx })) };
    });

  const publicUrl = page?.slug ? `${window.location.origin}/@${page.slug}` : "";

  const copyUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="p-6 text-ink-400">Loading…</div>;

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      <PageHeader
        icon={Link2}
        title="Link in bio"
        subtitle="Create a mini landing page for your Instagram bio link"
      >
        {publicUrl && (
          <>
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary gap-2"
            >
              <Eye className="w-4 h-4" /> Preview
            </a>
            <button onClick={copyUrl} className="btn-secondary gap-2">
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              Copy link
            </button>
          </>
        )}
        <button
          onClick={save}
          disabled={saving}
          className="btn-primary gap-2"
        >
          <Save className="w-4 h-4" /> {saving ? "Saving…" : "Save"}
        </button>
      </PageHeader>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Editor */}
        <div className="space-y-4">
          <div className="card space-y-3">
            <h3 className="font-semibold text-ink-900">Page Details</h3>
            <div>
              <label className="label">Username / Slug</label>
              <div className="flex items-center">
                <span className="px-3 py-2 bg-ink-100 rounded-l text-sm text-ink-600 border border-r-0 border-ink-200">
                  botlify.site/@
                </span>
                <input
                  className="input rounded-l-none"
                  value={page.slug || ""}
                  onChange={(e) =>
                    setPage({ ...page, slug: e.target.value.toLowerCase() })
                  }
                  placeholder="yourbrand"
                />
              </div>
            </div>
            <div>
              <label className="label">Display Name</label>
              <input
                className="input"
                value={page.displayName || ""}
                onChange={(e) =>
                  setPage({ ...page, displayName: e.target.value })
                }
              />
            </div>
            <div>
              <label className="label">Bio (max 200)</label>
              <textarea
                className="input"
                rows="3"
                maxLength={200}
                value={page.bio || ""}
                onChange={(e) => setPage({ ...page, bio: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Avatar URL</label>
              <input
                className="input"
                value={page.avatarUrl || ""}
                onChange={(e) =>
                  setPage({ ...page, avatarUrl: e.target.value })
                }
                placeholder="https://…"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Theme</label>
                <select
                  className="input"
                  value={page.theme}
                  onChange={(e) => setPage({ ...page, theme: e.target.value })}
                >
                  {THEMES.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Accent Color</label>
                <input
                  type="color"
                  className="input h-10 p-1"
                  value={page.accentColor || "#6366f1"}
                  onChange={(e) =>
                    setPage({ ...page, accentColor: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-ink-900">Links</h3>
              <button
                onClick={addLink}
                className="text-sm text-brand-600 font-medium hover:underline flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add link
              </button>
            </div>
            <div className="space-y-2">
              {page.links.map((link, i) => (
                <div
                  key={i}
                  className="border border-ink-200 rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col">
                      <button
                        onClick={() => moveLink(i, -1)}
                        className="text-ink-400 hover:text-ink-700"
                      >
                        <GripVertical className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      className="input text-sm flex-1"
                      placeholder="Title"
                      value={link.title}
                      onChange={(e) => updateLink(i, { title: e.target.value })}
                    />
                    <label className="flex items-center gap-1 text-xs">
                      <input
                        type="checkbox"
                        checked={link.enabled}
                        onChange={(e) =>
                          updateLink(i, { enabled: e.target.checked })
                        }
                      />
                      Active
                    </label>
                    <button
                      onClick={() => removeLink(i)}
                      className="p-1 rounded hover:bg-red-50 text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    className="input text-sm"
                    placeholder="https://…"
                    value={link.url}
                    onChange={(e) => updateLink(i, { url: e.target.value })}
                  />
                  {link.clicks > 0 && (
                    <p className="text-xs text-ink-500">{link.clicks} clicks</p>
                  )}
                </div>
              ))}
              {page.links.length === 0 && (
                <p className="text-sm text-ink-400 text-center py-4">
                  No links yet. Add your first.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="md:sticky md:top-6 h-fit">
          <p className="text-xs text-ink-500 mb-2 font-semibold uppercase tracking-wider">
            Live Preview
          </p>
          <div
            className={`rounded-lg p-6 shadow-lg border ${
              page.theme === "dark"
                ? "bg-ink-900 text-white"
                : page.theme === "gradient"
                  ? "bg-gradient-to-br from-brand-500 via-pink-500 to-orange-500 text-white"
                  : page.theme === "light"
                    ? "bg-white text-ink-900 border-ink-200"
                    : "bg-brand-gradient text-white"
            }`}
          >
            <div className="flex flex-col items-center text-center">
              {page.avatarUrl ? (
                <img
                  src={page.avatarUrl}
                  alt="avatar"
                  className="w-20 h-20 rounded-full object-cover border-4 border-white/20 mb-3"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold mb-3">
                  {(page.displayName || page.slug || "?")[0]?.toUpperCase()}
                </div>
              )}
              <h2 className="text-xl font-bold">
                {page.displayName || `@${page.slug || "yourbrand"}`}
              </h2>
              {page.bio && (
                <p className="text-sm opacity-80 mt-1">{page.bio}</p>
              )}
              <div className="w-full mt-5 space-y-2">
                {page.links
                  .filter((l) => l.enabled && l.title)
                  .map((link, i) => (
                    <div
                      key={i}
                      className="w-full py-3 px-4 rounded-md bg-white/10 backdrop-blur hover:bg-white/20 text-center font-medium transition cursor-pointer"
                      style={
                        page.theme === "light"
                          ? {
                              background: page.accentColor + "20",
                              color: page.accentColor,
                            }
                          : {}
                      }
                    >
                      {link.title}
                    </div>
                  ))}
                {page.links.filter((l) => l.enabled && l.title).length ===
                  0 && (
                  <p className="text-sm opacity-60">
                    Add links to see them here
                  </p>
                )}
              </div>
              <p className="text-[10px] opacity-50 mt-6">Powered by Botlify</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
