/**
 * Instagram AI Bot — modern rebuild.
 *
 * The creator teaches the bot about their business by:
 *   ✍️  writing a short description, and/or
 *   📄  uploading a PDF / menu / price list, and/or
 *   🔗  pasting their website link.
 *
 * Plus an FAQ list for exact-answer questions. No personality picker, no
 * Shopify, no preview tester, no temperature/token knobs — the bot runs on
 * GPT-4o-mini and "just works". Knowledge persists to workspace.aiKnowledge
 * (content + sources[]); enable flag + FAQs persist to workspace.aiSettings.
 */
import { useEffect, useRef, useState, useMemo } from "react";
import {
  Sparkles,
  Save,
  Plus,
  Trash2,
  Loader2,
  FileText,
  Globe,
  Upload,
  RefreshCw,
  HelpCircle,
  Image as ImageIcon,
  Check,
  Bot,
  BookOpen,
  Zap,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";

const DEFAULTS = {
  enabled: true,
  provider: "openai",
  model: "gpt-4o-mini",
  businessContext: "",
  faqs: [],
};

const SOURCE_META = {
  website: { Icon: Globe, tint: "text-blue-600 bg-blue-50" },
  text: { Icon: FileText, tint: "text-violet-600 bg-violet-50" },
  document: { Icon: FileText, tint: "text-violet-600 bg-violet-50" },
  image: { Icon: ImageIcon, tint: "text-amber-600 bg-amber-50" },
};

const IMAGE_RE = /\.(png|jpe?g|gif|webp|bmp|heic)$/i;

export default function IgAiBotPage() {
  const { activeWorkspace } = useAuthStore();
  const { workspace, fetchWorkspace } = useWorkspaceStore();

  const [cfg, setCfg] = useState(DEFAULTS);
  const [bizText, setBizText] = useState("");
  const [sources, setSources] = useState([]);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(null); // 'doc' | 'url' | sourceId
  const [urlInput, setUrlInput] = useState("");
  const [showUrl, setShowUrl] = useState(false);
  const [newFaq, setNewFaq] = useState({ question: "", answer: "" });
  const fileRef = useRef(null);

  useEffect(() => {
    const stored = workspace?.aiSettings;
    setCfg(
      stored && Object.keys(stored).length
        ? { ...DEFAULTS, ...stored }
        : DEFAULTS,
    );
    setBizText(workspace?.aiKnowledge?.content || "");
    setSources(workspace?.aiKnowledge?.sources || []);
  }, [workspace?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (patch) => setCfg((c) => ({ ...c, ...patch }));
  const igHandle = workspace?.instagram?.username;

  // How "ready" is the bot? Drives the readiness meter.
  const readiness = useMemo(() => {
    let score = 0;
    if (bizText.trim().length > 40) score += 40;
    if (sources.length > 0) score += 30;
    if ((cfg.faqs?.length || 0) > 0) score += 30;
    return Math.min(100, score);
  }, [bizText, sources, cfg.faqs]);

  /* ── Knowledge: imports ─────────────────────────────────────────── */
  const refreshSources = async () => {
    await fetchWorkspace(activeWorkspace);
    const ws = useWorkspaceStore.getState().workspace;
    setSources(ws?.aiKnowledge?.sources || []);
  };

  const uploadDoc = async (file) => {
    if (!file) return;
    setBusy("doc");
    const fd = new FormData();
    fd.append("file", file);
    try {
      const { data } = await api.post(
        `/workspaces/${activeWorkspace}/ai-knowledge/import-doc`,
        fd,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      setSources((s) => [...s, data.source]);
      set({ enabled: true });
      toast.success("Document added — your bot just learned it 🎓");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Couldn't read that file");
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const importUrl = async () => {
    const url = urlInput.trim();
    if (!url) return;
    setBusy("url");
    try {
      const { data } = await api.post(
        `/workspaces/${activeWorkspace}/ai-knowledge/import-url`,
        { url },
      );
      setSources((s) => [...s, data.source]);
      setUrlInput("");
      setShowUrl(false);
      set({ enabled: true });
      toast.success("Website imported — bot updated 🌐");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Couldn't import that website");
    } finally {
      setBusy(null);
    }
  };

  const resyncSource = async (id) => {
    setBusy(id);
    try {
      await api.post(
        `/workspaces/${activeWorkspace}/ai-knowledge/sources/${id}/resync`,
      );
      await refreshSources();
      toast.success("Source refreshed");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Couldn't refresh");
    } finally {
      setBusy(null);
    }
  };

  const removeSource = async (id) => {
    setSources((s) => s.filter((x) => x._id !== id));
    try {
      await api.delete(
        `/workspaces/${activeWorkspace}/ai-knowledge/sources/${id}`,
      );
    } catch {
      refreshSources();
    }
  };

  /* ── FAQs ───────────────────────────────────────────────────────── */
  const addFaq = () => {
    if (!newFaq.question.trim() || !newFaq.answer.trim())
      return toast.error("Add both a question and an answer");
    set({ faqs: [...(cfg.faqs || []), { ...newFaq }] });
    setNewFaq({ question: "", answer: "" });
  };
  const removeFaq = (i) =>
    set({ faqs: (cfg.faqs || []).filter((_, x) => x !== i) });

  /* ── Save ───────────────────────────────────────────────────────── */
  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/workspaces/${activeWorkspace}`, {
        aiSettings: { ...cfg, model: "gpt-4o-mini", provider: "openai" },
      });
      await api.put(`/workspaces/${activeWorkspace}/ai-knowledge`, {
        content: bizText,
        enabled: cfg.enabled,
      });
      await fetchWorkspace(activeWorkspace);
      toast.success("AI bot saved ✓");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-full bg-ink-50/40">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 right-0 w-[40rem] h-[40rem] rounded-full bg-brand-500/10 blur-[140px]" />
        <div className="absolute top-1/3 -left-32 w-[32rem] h-[32rem] rounded-full bg-brand-400/10 blur-[140px]" />
      </div>

      <div className="relative max-w-4xl mx-auto p-4 sm:p-6 pb-28 space-y-6">
        {/* ── Hero ───────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink-900 via-ink-900 to-brand-900 text-white p-6 sm:p-8 shadow-xl">
          <div className="absolute -top-16 -right-10 w-56 h-56 rounded-full bg-brand-500/30 blur-3xl" />
          <div className="absolute -bottom-20 left-10 w-56 h-56 rounded-full bg-brand-600/15 blur-3xl" />

          <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center shrink-0">
              <Bot className="w-8 h-8 text-brand-300" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black tracking-tight">AI Bot</h1>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-brand-200">
                  <Sparkles className="w-3 h-3" /> GPT-4o
                </span>
                {igHandle && (
                  <span className="text-xs text-white/60">@{igHandle}</span>
                )}
              </div>
              <p className="text-sm text-white/70 mt-1 max-w-md">
                Teach it about your business once. It answers DMs, comments &
                story replies 24/7 — in your voice, powered by GPT-4o-mini.
              </p>
            </div>

            {/* Master toggle */}
            <div className="shrink-0 flex flex-col items-start sm:items-end gap-2">
              <button
                onClick={() => set({ enabled: !cfg.enabled })}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
                  cfg.enabled ? "bg-brand-500" : "bg-white/20"
                }`}
                aria-label="Toggle AI bot"
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition ${
                    cfg.enabled ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                  cfg.enabled ? "text-emerald-300" : "text-white/50"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    cfg.enabled ? "bg-emerald-400 animate-pulse" : "bg-white/40"
                  }`}
                />
                {cfg.enabled ? "Live" : "Paused"}
              </span>
            </div>
          </div>

          {/* Readiness meter */}
          <div className="relative mt-6 rounded-2xl bg-white/[0.06] border border-white/10 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-white/80">
                Bot readiness
              </span>
              <span className="text-xs font-mono text-brand-300">
                {readiness}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-500"
                style={{ width: `${readiness}%` }}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[11px]">
              <ReadyChip
                ok={bizText.trim().length > 40}
                label="Business description"
              />
              <ReadyChip ok={sources.length > 0} label="Knowledge source" />
              <ReadyChip ok={(cfg.faqs?.length || 0) > 0} label="FAQs" />
            </div>
          </div>
        </div>

        {/* ── Business description ───────────────────────────────── */}
        <Section
          icon={BookOpen}
          title="What does your business do?"
          subtitle="A short description the bot uses to answer anything not covered by a source or FAQ."
        >
          <textarea
            className="w-full rounded-xl border border-ink-200 bg-white px-3.5 py-3 text-sm leading-relaxed focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none min-h-[120px]"
            value={bizText}
            onChange={(e) => setBizText(e.target.value)}
            placeholder="e.g. We're a Karachi-based skincare brand. We sell natural face serums and moisturizers. Orders ship in 2–3 days across Pakistan. COD available. DM us for custom bundles!"
          />
          <p className="text-xs text-ink-400 mt-1.5">
            {bizText.trim().length} characters · The more detail, the smarter
            the replies.
          </p>
        </Section>

        {/* ── Knowledge sources ──────────────────────────────────── */}
        <Section
          icon={Zap}
          title="Add knowledge sources"
          subtitle="Upload a menu/price list or import your website — the bot reads it and answers from it."
        >
          <input
            ref={fileRef}
            type="file"
            hidden
            accept=".pdf,.doc,.docx,.txt,.csv,.png,.jpg,.jpeg"
            onChange={(e) => uploadDoc(e.target.files?.[0])}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SourceButton
              Icon={Upload}
              title="Upload a file"
              hint="PDF, menu, price list, docs"
              loading={busy === "doc"}
              onClick={() => fileRef.current?.click()}
            />
            <SourceButton
              Icon={Globe}
              title="Import a website"
              hint="Paste any page URL"
              loading={busy === "url"}
              onClick={() => setShowUrl((v) => !v)}
              active={showUrl}
            />
          </div>

          {showUrl && (
            <div className="flex gap-2 mt-3">
              <input
                className="flex-1 rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && importUrl()}
                placeholder="https://yourbrand.com/about"
                autoFocus
              />
              <button
                onClick={importUrl}
                disabled={busy === "url" || !urlInput.trim()}
                className="btn-primary shrink-0"
              >
                {busy === "url" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Import"
                )}
              </button>
            </div>
          )}

          {/* Source list */}
          {sources.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold text-ink-500">
                Your bot knows ({sources.length})
              </p>
              {sources.map((s) => {
                const isImage = IMAGE_RE.test(s.title || s.url || "");
                const meta =
                  SOURCE_META[isImage ? "image" : s.type] || SOURCE_META.text;
                const Icon = meta.Icon;
                const ready = s.status ? s.status === "ready" : true;
                return (
                  <div
                    key={s._id}
                    className="flex items-center gap-3 rounded-xl border border-ink-100 bg-white px-3 py-2.5"
                  >
                    <span
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${meta.tint}`}
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink-900 truncate">
                        {s.title || s.url || "Untitled source"}
                      </p>
                      <p className="text-[11px] text-ink-400 flex items-center gap-1">
                        {ready ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" /> Ready
                          </>
                        ) : (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />{" "}
                            Processing…
                          </>
                        )}
                        {s.type ? ` · ${s.type}` : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => resyncSource(s._id)}
                      disabled={busy === s._id}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-400 hover:text-brand-600 hover:bg-brand-50 transition"
                      title="Refresh"
                    >
                      {busy === s._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => removeSource(s._id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-400 hover:text-red-600 hover:bg-red-50 transition"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        {/* ── FAQs ───────────────────────────────────────────────── */}
        <Section
          icon={HelpCircle}
          title="Exact-answer FAQs"
          subtitle="For questions that need a precise reply (price, hours, shipping) — the bot answers these word-for-word."
        >
          {(cfg.faqs?.length || 0) > 0 && (
            <div className="space-y-2 mb-3">
              {cfg.faqs.map((f, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-ink-100 bg-white p-3.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-ink-900">
                      {f.question}
                    </p>
                    <button
                      onClick={() => removeFaq(i)}
                      className="text-ink-300 hover:text-red-500 transition shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-ink-600 mt-1">{f.answer}</p>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-xl border border-dashed border-ink-200 bg-ink-50/50 p-3.5 space-y-2.5">
            <input
              className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none"
              value={newFaq.question}
              onChange={(e) =>
                setNewFaq((v) => ({ ...v, question: e.target.value }))
              }
              placeholder="Question — e.g. Do you offer cash on delivery?"
            />
            <textarea
              className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none min-h-[60px]"
              value={newFaq.answer}
              onChange={(e) =>
                setNewFaq((v) => ({ ...v, answer: e.target.value }))
              }
              placeholder="Answer — e.g. Yes! COD is available across Pakistan 🚚"
            />
            <button
              onClick={addFaq}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-lg px-3 py-2 transition"
            >
              <Plus className="w-4 h-4" /> Add FAQ
            </button>
          </div>
        </Section>

        {/* How it answers — trust/explainer */}
        <div className="rounded-2xl border border-ink-100 bg-white p-5 flex items-start gap-3">
          <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </span>
          <div className="text-sm text-ink-600 leading-relaxed">
            <span className="font-bold text-ink-900">How replies work: </span>
            the bot first checks your FAQs for an exact match, then your
            knowledge sources, then your business description — and only replies
            about your business. It never makes up prices or policies you
            haven't given it.
          </div>
        </div>
      </div>

      {/* ── Sticky save bar ────────────────────────────────────── */}
      <div className="fixed bottom-0 inset-x-0 sm:left-[var(--sidebar-w,0)] z-20 border-t border-ink-100 bg-white/90 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <p className="text-xs text-ink-500 hidden sm:block">
            {cfg.enabled
              ? "Bot is live — it replies automatically to new messages."
              : "Bot is paused — turn it on above when you're ready."}
          </p>
          <button
            onClick={save}
            disabled={saving}
            className="btn-primary ml-auto min-w-[130px] justify-center"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" /> Save changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────────── */

function ReadyChip({ ok, label }) {
  return (
    <span
      className={`inline-flex items-center gap-1 ${
        ok ? "text-emerald-300" : "text-white/40"
      }`}
    >
      {ok ? (
        <Check className="w-3 h-3" />
      ) : (
        <span className="w-3 h-3 rounded-full border border-white/30" />
      )}
      {label}
    </span>
  );
}

function SourceButton({ Icon, title, hint, loading, onClick, active }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex items-center gap-3 rounded-xl border p-3.5 text-left transition ${
        active
          ? "border-brand-400 bg-brand-50"
          : "border-ink-200 bg-white hover:border-brand-300 hover:bg-brand-50/40"
      }`}
    >
      <span className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 group-hover:bg-brand-500 group-hover:text-white transition-colors">
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Icon className="w-5 h-5" />
        )}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-bold text-ink-900">{title}</p>
        <p className="text-xs text-ink-500">{hint}</p>
      </div>
    </button>
  );
}

function Section({ title, subtitle, icon: Icon, children }) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-6 shadow-sm">
      <div className="flex items-start gap-3 mb-4">
        <span className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-brand-500/30">
          <Icon className="w-5 h-5" />
        </span>
        <div>
          <h2 className="font-black text-ink-900 text-[15px] leading-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-ink-500 mt-0.5 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
