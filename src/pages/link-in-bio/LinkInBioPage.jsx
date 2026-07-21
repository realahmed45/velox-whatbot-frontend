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
  User,
  Palette,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import StatHero from "@/components/ui/StatHero";

const THEMES = [
  { key: "brand", label: "Brand (Orange)" },
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
          accentColor: "#ff5722",
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

  if (loading)
    return (
      <div className="p-4 sm:p-8 max-w-6xl mx-auto">
        <div className="h-40 rounded-3xl bg-ink-100 animate-pulse" />
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div className="h-80 rounded-2xl bg-ink-100 animate-pulse" />
          <div className="h-80 rounded-2xl bg-ink-100 animate-pulse" />
        </div>
      </div>
    );

  const activeLinks = page.links.filter((l) => l.enabled).length;

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <StatHero
          icon={Link2}
          eyebrow="Growth"
          title="Link in bio"
          subtitle="Create a mini landing page for your Instagram bio link."
          stats={[
            { label: "Total links", value: page.links.length, accent: true },
            { label: "Active links", value: activeLinks },
            {
              label: "Status",
              value: page.enabled ? "Live" : "Off",
            },
          ]}
        >
          {publicUrl && (
            <>
              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold px-3.5 py-2.5 rounded-xl border border-white/20 bg-white/10 text-white hover:bg-white/20 flex items-center gap-1.5 transition backdrop-blur"
              >
                <Eye className="w-3.5 h-3.5" /> Preview
              </a>
              <button
                onClick={copyUrl}
                className="text-xs font-bold px-3.5 py-2.5 rounded-xl border border-white/20 bg-white/10 text-white hover:bg-white/20 flex items-center gap-1.5 transition backdrop-blur"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                Copy link
              </button>
            </>
          )}
          <button
            onClick={save}
            disabled={saving}
            className="text-xs font-bold px-3.5 py-2.5 rounded-xl bg-white text-brand-700 hover:bg-brand-50 flex items-center gap-1.5 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Save className="w-3.5 h-3.5" /> {saving ? "Saving…" : "Save"}
          </button>
        </StatHero>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Editor */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-ink-100 bg-white shadow-sm hover:border-brand-300 hover:shadow-md transition p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-ink-900">Page details</h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-600 mb-1.5">
                Username / Slug
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2.5 bg-ink-50 rounded-l-xl text-sm text-ink-500 border border-r-0 border-ink-200 whitespace-nowrap">
                  botlify.site/@
                </span>
                <input
                  className="flex-1 min-w-0 text-sm rounded-r-xl border border-ink-200 bg-white px-3 py-2.5 text-ink-900 placeholder:text-ink-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:outline-none transition"
                  value={page.slug || ""}
                  onChange={(e) =>
                    setPage({ ...page, slug: e.target.value.toLowerCase() })
                  }
                  placeholder="yourbrand"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-600 mb-1.5">
                Display name
              </label>
              <input
                className="w-full text-sm rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-ink-900 placeholder:text-ink-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:outline-none transition"
                value={page.displayName || ""}
                onChange={(e) =>
                  setPage({ ...page, displayName: e.target.value })
                }
              />
            </div>

            <div>
              <label className="flex items-center justify-between text-xs font-semibold text-ink-600 mb-1.5">
                <span>Bio</span>
                <span className="text-ink-400 font-normal">
                  {(page.bio || "").length}/200
                </span>
              </label>
              <textarea
                className="w-full text-sm rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-ink-900 placeholder:text-ink-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:outline-none transition resize-none"
                rows="3"
                maxLength={200}
                value={page.bio || ""}
                onChange={(e) => setPage({ ...page, bio: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-600 mb-1.5">
                Avatar URL
              </label>
              <input
                className="w-full text-sm rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-ink-900 placeholder:text-ink-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:outline-none transition"
                value={page.avatarUrl || ""}
                onChange={(e) =>
                  setPage({ ...page, avatarUrl: e.target.value })
                }
                placeholder="https://…"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink-600 mb-1.5">
                  Theme
                </label>
                <select
                  className="w-full text-sm rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-ink-900 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:outline-none transition"
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
                <label className="flex items-center gap-1.5 text-xs font-semibold text-ink-600 mb-1.5">
                  <Palette className="w-3.5 h-3.5 text-ink-400" /> Accent color
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-2 py-1.5 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100 transition">
                  <input
                    type="color"
                    className="h-8 w-9 rounded-lg border-0 bg-transparent p-0 cursor-pointer"
                    value={page.accentColor || "#ff5722"}
                    onChange={(e) =>
                      setPage({ ...page, accentColor: e.target.value })
                    }
                  />
                  <span className="text-xs font-mono text-ink-500 uppercase">
                    {page.accentColor || "#ff5722"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-ink-100 bg-white shadow-sm hover:border-brand-300 hover:shadow-md transition p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Link2 className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-ink-900">Links</h3>
                <span className="chip bg-ink-100 text-ink-600 text-xs">
                  {page.links.length}
                </span>
              </div>
              <button
                onClick={addLink}
                className="text-xs font-bold px-3 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white flex items-center gap-1.5 transition shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Add link
              </button>
            </div>

            <div className="space-y-3">
              {page.links.map((link, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-ink-100 bg-ink-50/40 p-3 space-y-2.5 hover:border-brand-200 transition"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col text-ink-300">
                      <button
                        onClick={() => moveLink(i, -1)}
                        disabled={i === 0}
                        className="hover:text-brand-500 disabled:opacity-30 disabled:hover:text-ink-300 transition"
                        title="Move up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveLink(i, 1)}
                        disabled={i === page.links.length - 1}
                        className="hover:text-brand-500 disabled:opacity-30 disabled:hover:text-ink-300 transition"
                        title="Move down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <GripVertical className="w-4 h-4 text-ink-300 flex-shrink-0" />
                    <input
                      className="flex-1 min-w-0 text-sm rounded-lg border border-ink-200 bg-white px-3 py-2 text-ink-900 placeholder:text-ink-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:outline-none transition"
                      placeholder="Title"
                      value={link.title}
                      onChange={(e) => updateLink(i, { title: e.target.value })}
                    />
                    <label className="flex items-center gap-1.5 text-xs font-medium text-ink-600 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        className="accent-brand-500 w-3.5 h-3.5"
                        checked={link.enabled}
                        onChange={(e) =>
                          updateLink(i, { enabled: e.target.checked })
                        }
                      />
                      Active
                    </label>
                    <button
                      onClick={() => removeLink(i)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-ink-400 hover:text-red-500 transition"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    className="w-full text-sm rounded-lg border border-ink-200 bg-white px-3 py-2 text-ink-900 placeholder:text-ink-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:outline-none transition"
                    placeholder="https://…"
                    value={link.url}
                    onChange={(e) => updateLink(i, { url: e.target.value })}
                  />
                  {link.clicks > 0 && (
                    <p className="text-xs text-ink-500 font-medium">
                      {link.clicks} clicks
                    </p>
                  )}
                </div>
              ))}
              {page.links.length === 0 && (
                <div className="text-center py-10 rounded-xl border border-dashed border-ink-200 bg-ink-50/40">
                  <div className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center mx-auto mb-3">
                    <Link2 className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-semibold text-ink-700">
                    No links yet
                  </p>
                  <p className="text-xs text-ink-400 mt-1">
                    Add your first link to get started.
                  </p>
                  <button
                    onClick={addLink}
                    className="mt-4 text-xs font-bold px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white inline-flex items-center gap-1.5 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add link
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="md:sticky md:top-6 h-fit">
          <p className="flex items-center gap-1.5 text-xs text-ink-500 mb-3 font-bold uppercase tracking-wider">
            <Eye className="w-3.5 h-3.5" /> Live preview
          </p>
          <div
            className={`rounded-2xl p-6 shadow-xl border ${
              page.theme === "dark"
                ? "bg-ink-900 text-white border-ink-800"
                : page.theme === "gradient"
                  ? "bg-gradient-to-br from-brand-400 via-brand-500 to-amber-500 text-white border-transparent"
                  : page.theme === "light"
                    ? "bg-white text-ink-900 border-ink-200"
                    : "bg-brand-gradient text-white border-transparent"
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
                      className="w-full py-3 px-4 rounded-xl bg-white/10 backdrop-blur hover:bg-white/20 text-center font-medium transition cursor-pointer"
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
