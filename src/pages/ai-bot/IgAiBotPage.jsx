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
import {
  TEMPLATES_BY_CATEGORY,
  FAQ_TEMPLATE_COUNT,
} from "@/data/faqTemplates";
import { X, Sparkle, ShoppingBag, Send, MessageSquare } from "lucide-react";

const DEFAULTS = {
  enabled: true,
  businessContext: "",
  faqs: [],
};

const SOURCE_META = {
  website: { Icon: Globe, tint: "text-ink-600 bg-ink-100" },
  text: { Icon: FileText, tint: "text-brand-600 bg-brand-50" },
  document: { Icon: FileText, tint: "text-brand-600 bg-brand-50" },
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
  const [showTemplates, setShowTemplates] = useState(false);
  const [drafting, setDrafting] = useState(false);
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

  // Toggle a library template on/off. "On" = a FAQ with the same question
  // already exists (case-insensitive). Adding copies question+answer into the
  // user's own faqs where they can edit it; toggling off removes that entry.
  const isTemplateOn = (tpl) =>
    (cfg.faqs || []).some(
      (f) => f.question.trim().toLowerCase() === tpl.question.trim().toLowerCase(),
    );
  const toggleTemplate = (tpl) => {
    const on = isTemplateOn(tpl);
    if (on) {
      set({
        faqs: (cfg.faqs || []).filter(
          (f) =>
            f.question.trim().toLowerCase() !==
            tpl.question.trim().toLowerCase(),
        ),
      });
    } else {
      set({
        faqs: [
          ...(cfg.faqs || []),
          { question: tpl.question, answer: tpl.answer },
        ],
      });
    }
  };
  const addWholeCategory = (items) => {
    const existing = new Set(
      (cfg.faqs || []).map((f) => f.question.trim().toLowerCase()),
    );
    const toAdd = items.filter(
      (t) => !existing.has(t.question.trim().toLowerCase()),
    );
    if (!toAdd.length) return toast("All of these are already added");
    set({
      faqs: [
        ...(cfg.faqs || []),
        ...toAdd.map((t) => ({ question: t.question, answer: t.answer })),
      ],
    });
    toast.success(`Added ${toAdd.length} FAQ${toAdd.length > 1 ? "s" : ""} ✓`);
  };

  /* ── Persona auto-draft (Phase 1) ───────────────────────────────── */
  const draftPersona = async () => {
    setDrafting(true);
    try {
      // Save any typed business context first so the draft can use it.
      await api
        .put(`/workspaces/${activeWorkspace}/ai-knowledge`, {
          content: bizText,
          enabled: cfg.enabled,
        })
        .catch(() => {});
      const { data } = await api.post(
        `/workspaces/${activeWorkspace}/ai/draft-persona`,
      );
      if (data?.persona) {
        set({
          aiRole: data.persona.aiRole || cfg.aiRole || "",
          brandVoice: data.persona.brandVoice || cfg.brandVoice || "",
          guardrails: data.persona.guardrails || cfg.guardrails || "",
        });
        toast.success("Drafted from your Instagram ✨ — tweak & save");
      } else {
        toast.error("Couldn't draft — fill the fields manually");
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Draft failed");
    } finally {
      setDrafting(false);
    }
  };

  /* ── Product catalog (Phase 3) ──────────────────────────────────── */
  const catalog = Array.isArray(cfg.productCatalog) ? cfg.productCatalog : [];
  const addProduct = () =>
    set({
      productCatalog: [
        ...catalog,
        { name: "", price: "", description: "", inStock: true },
      ],
    });
  const updateProduct = (i, patch) =>
    set({
      productCatalog: catalog.map((p, x) => (x === i ? { ...p, ...patch } : p)),
    });
  const removeProduct = (i) =>
    set({ productCatalog: catalog.filter((_, x) => x !== i) });

  /* ── Save ───────────────────────────────────────────────────────── */
  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/workspaces/${activeWorkspace}`, {
        aiSettings: { ...cfg },
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

      <div className="relative max-w-4xl mx-auto p-4 sm:p-6 pb-6 space-y-6">
        {/* ── Hero ───────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-ink-900 to-ink-800 text-white px-5 py-5 sm:px-6 shadow-lg shadow-ink-900/10">
          <div className="pointer-events-none absolute -top-16 right-8 w-56 h-56 rounded-full bg-brand-500/20 blur-3xl" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-brand-900/40 to-transparent" />

          <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
              <Bot className="w-6 h-6 text-brand-300" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight">AI Bot</h1>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-brand-200">
                  <Sparkles className="w-3 h-3" /> AI-powered
                </span>
                {igHandle && (
                  <span className="text-xs text-white/60">@{igHandle}</span>
                )}
                <AiBotHelp />
              </div>
              <p className="text-sm text-white/70 mt-1 max-w-md">
                Teach it about your business once. It answers DMs, comments &
                story replies 24/7 — in your voice, with advanced AI.
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
        {/* ── Persona: role · voice · guardrails (Phase 1) ────────── */}
        <Section
          icon={Bot}
          title="Bot personality"
          subtitle="Shape exactly how your bot sounds and what it must never do. Auto-draft it from your Instagram, then fine-tune."
        >
          <div className="mb-4">
            <button
              onClick={draftPersona}
              disabled={drafting}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-accent-500 text-white text-sm font-bold px-4 py-2.5 shadow-glow disabled:opacity-60 transition hover:brightness-105"
            >
              {drafting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkle className="w-4 h-4" />
              )}
              {drafting ? "Reading your Instagram…" : "Auto-draft from my Instagram"}
            </button>
            <p className="text-[11px] text-ink-400 mt-1.5">
              We read your profile + business info to draft all three fields. You
              stay in full control — edit anything.
            </p>
          </div>

          <div className="space-y-4">
            <PersonaField
              label="AI Role"
              hint="Who the bot is."
              value={cfg.aiRole || ""}
              onChange={(v) => set({ aiRole: v })}
              rows={2}
              placeholder="You are the friendly assistant for [brand], a Karachi skincare shop. You help followers over DM."
            />
            <PersonaField
              label="Brand voice"
              hint="Tone & formatting rules."
              value={cfg.brandVoice || ""}
              onChange={(v) => set({ brandVoice: v })}
              rows={2}
              placeholder="warm and friendly; concise 1-2 lines; at most 1 emoji; mirror the customer's language; never pushy"
            />
            <PersonaField
              label="Guardrails"
              hint="Things the bot must NEVER do."
              value={cfg.guardrails || ""}
              onChange={(v) => set({ guardrails: v })}
              rows={2}
              danger
              placeholder="never quote a price you weren't given; never promise refunds; never share personal data; hand off complaints to a human"
            />
          </div>
        </Section>

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
          {/* Browse the template library */}
          <button
            onClick={() => setShowTemplates(true)}
            className="w-full mb-3 rounded-xl border border-brand-200 bg-gradient-to-br from-brand-50 to-accent-50/40 p-3.5 flex items-center gap-3 text-left hover:border-brand-300 hover:shadow-card transition group"
          >
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shrink-0 shadow-glow">
              <Sparkle className="w-5 h-5 text-white" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold text-ink-900">
                Browse {FAQ_TEMPLATE_COUNT}+ ready-made FAQs
              </span>
              <span className="block text-xs text-ink-500">
                Pick from templates for stores, creators & services — toggle on,
                then edit to fit your business.
              </span>
            </span>
            <Plus className="w-4 h-4 text-brand-500 ml-auto shrink-0 group-hover:scale-110 transition" />
          </button>

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

        {/* ── Product catalog (Phase 3) ──────────────────────────── */}
        <Section
          icon={ShoppingBag}
          title="Product catalog"
          subtitle="Add products with exact prices so the bot can recommend and quote them — never guessing."
        >
          {catalog.length > 0 && (
            <div className="space-y-2 mb-3">
              {catalog.map((p, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-ink-100 bg-white p-3"
                >
                  <div className="flex gap-2">
                    <input
                      className="flex-1 rounded-lg border border-ink-200 px-3 py-2 text-sm font-semibold outline-none focus:border-brand-400"
                      value={p.name}
                      onChange={(e) => updateProduct(i, { name: e.target.value })}
                      placeholder="Product name"
                    />
                    <input
                      className="w-28 rounded-lg border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
                      value={p.price}
                      onChange={(e) =>
                        updateProduct(i, { price: e.target.value })
                      }
                      placeholder="Rs 2,500"
                    />
                    <button
                      onClick={() => removeProduct(i)}
                      className="text-ink-300 hover:text-red-500 transition px-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      className="flex-1 rounded-lg border border-ink-200 px-3 py-1.5 text-xs outline-none focus:border-brand-400"
                      value={p.description || ""}
                      onChange={(e) =>
                        updateProduct(i, { description: e.target.value })
                      }
                      placeholder="Short description (sizes, colours, details…)"
                    />
                    <button
                      onClick={() =>
                        updateProduct(i, { inStock: !(p.inStock !== false) })
                      }
                      className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg border transition ${
                        p.inStock !== false
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-ink-100 text-ink-500 border-ink-200"
                      }`}
                    >
                      {p.inStock !== false ? "In stock" : "Out of stock"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={addProduct}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-lg px-3 py-2 transition"
          >
            <Plus className="w-4 h-4" /> Add product
          </button>
        </Section>

        {/* ── Playground (Phase 2) ───────────────────────────────── */}
        <Playground workspaceId={activeWorkspace} enabled={cfg.enabled} />

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

      {/* ── Sticky save bar (stays inside the content column) ──── */}
      <div className="sticky bottom-0 z-20 border-t border-ink-100 bg-white/90 backdrop-blur-xl">
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

      {showTemplates && (
        <TemplatesModal
          isOn={isTemplateOn}
          onToggle={toggleTemplate}
          onAddCategory={addWholeCategory}
          onClose={() => setShowTemplates(false)}
        />
      )}
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────────── */

function TemplatesModal({ isOn, onToggle, onAddCategory, onClose }) {
  const [activeCat, setActiveCat] = useState(TEMPLATES_BY_CATEGORY[0].key);
  const cat =
    TEMPLATES_BY_CATEGORY.find((c) => c.key === activeCat) ||
    TEMPLATES_BY_CATEGORY[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-ink-950/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[88vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-ink-100">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shrink-0">
              <Sparkle className="w-5 h-5 text-white" />
            </span>
            <div className="min-w-0">
              <h3 className="font-black text-ink-900 leading-tight">
                FAQ template library
              </h3>
              <p className="text-xs text-ink-500">
                Toggle any on — it's copied to your FAQs where you can edit it.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-ink-100 flex items-center justify-center text-ink-400 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* category rail */}
          <div className="w-40 sm:w-52 shrink-0 border-r border-ink-100 overflow-y-auto py-2 bg-ink-50/40">
            {TEMPLATES_BY_CATEGORY.map((c) => (
              <button
                key={c.key}
                onClick={() => setActiveCat(c.key)}
                className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition ${
                  c.key === activeCat
                    ? "bg-brand-50 text-brand-700 font-bold border-r-2 border-brand-500"
                    : "text-ink-600 hover:bg-ink-100"
                }`}
              >
                <span>{c.emoji}</span>
                <span className="truncate">{c.label}</span>
                <span className="ml-auto text-[10px] text-ink-400">
                  {c.items.length}
                </span>
              </button>
            ))}
          </div>

          {/* template list */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-ink-800">
                {cat.emoji} {cat.label}
              </p>
              <button
                onClick={() => onAddCategory(cat.items)}
                className="text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-lg px-2.5 py-1.5 transition"
              >
                Add all
              </button>
            </div>
            <div className="space-y-2">
              {cat.items.map((tpl, i) => {
                const on = isOn(tpl);
                return (
                  <button
                    key={i}
                    onClick={() => onToggle(tpl)}
                    className={`w-full text-left rounded-xl border p-3 transition flex items-start gap-3 ${
                      on
                        ? "border-brand-300 bg-brand-50/60"
                        : "border-ink-100 bg-white hover:border-ink-200"
                    }`}
                  >
                    <span
                      className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                        on
                          ? "bg-brand-500 border-brand-500 text-white"
                          : "border-ink-300 text-transparent"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-ink-900">
                        {tpl.question}
                      </span>
                      <span className="block text-xs text-ink-500 mt-0.5">
                        {tpl.answer}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* footer */}
        <div className="px-5 py-3 border-t border-ink-100 flex items-center justify-between gap-3">
          <p className="text-xs text-ink-500">
            Remember to <b>Save changes</b> after you've picked your FAQs.
          </p>
          <button onClick={onClose} className="btn-primary px-4 py-2 text-sm">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

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

function PersonaField({ label, hint, value, onChange, rows = 2, placeholder, danger }) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-1">
        <label className="text-sm font-bold text-ink-800">{label}</label>
        <span
          className={`text-[11px] ${danger ? "text-rose-500" : "text-ink-400"}`}
        >
          {hint}
        </span>
      </div>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm leading-relaxed outline-none transition focus:ring-2 ${
          danger
            ? "border-rose-200 focus:border-rose-400 focus:ring-rose-100"
            : "border-ink-200 focus:border-brand-400 focus:ring-brand-100"
        }`}
      />
    </div>
  );
}

/* Playground — try the real bot in a sandbox chat. No DM is sent. (Phase 2) */
function Playground({ workspaceId, enabled }) {
  const [msgs, setMsgs] = useState([]); // {role:'user'|'assistant', content}
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 9e9, behavior: "smooth" });
  }, [msgs, sending]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    const history = msgs.map((m) => ({ role: m.role, content: m.content }));
    setMsgs((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setSending(true);
    try {
      const { data } = await api.post(
        `/workspaces/${workspaceId}/ai/playground`,
        { message: text, history },
      );
      setMsgs((m) => [
        ...m,
        {
          role: "assistant",
          content:
            data?.reply ||
            (data?.escalate ? "(would hand off to a human)" : "(no reply)"),
          escalate: data?.escalate,
        },
      ]);
    } catch (e) {
      setMsgs((m) => [
        ...m,
        {
          role: "assistant",
          content:
            e?.response?.data?.message ||
            "Something went wrong — save your changes and try again.",
          error: true,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rounded-2xl border border-ink-100 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-ink-100 bg-gradient-to-r from-brand-50/60 to-accent-50/40">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <MessageSquare className="w-5 h-5" />
          </span>
          <div>
            <h2 className="font-black text-ink-900 text-[15px] leading-tight">
              Test your bot
            </h2>
            <p className="text-xs text-ink-500 mt-0.5">
              A safe sandbox — try messages before going live. No real DM is
              sent.
            </p>
          </div>
        </div>
        {msgs.length > 0 && (
          <button
            onClick={() => setMsgs([])}
            className="text-xs font-semibold text-ink-400 hover:text-ink-700 transition"
          >
            Clear
          </button>
        )}
      </div>

      {/* chat window */}
      <div
        ref={scrollRef}
        className="h-72 overflow-y-auto px-4 py-4 bg-ink-50/40 space-y-2.5"
      >
        {msgs.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-6">
            <div className="w-12 h-12 rounded-2xl bg-white border border-ink-100 flex items-center justify-center mb-3">
              <Bot className="w-6 h-6 text-brand-500" />
            </div>
            <p className="text-sm font-semibold text-ink-700">
              Say hi to your bot 👋
            </p>
            <p className="text-xs text-ink-400 mt-1 max-w-xs">
              Try "Do you ship to Lahore?" or "How much is your serum?" to see
              how it replies with your current setup.
            </p>
          </div>
        )}
        {msgs.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-brand-500 text-white rounded-br-sm"
                  : m.error
                    ? "bg-rose-50 text-rose-700 border border-rose-200 rounded-bl-sm"
                    : "bg-white text-ink-800 border border-ink-100 rounded-bl-sm"
              }`}
            >
              {m.escalate && (
                <span className="block text-[10px] font-bold uppercase tracking-wide text-amber-600 mb-0.5">
                  ⚡ Would hand off to a human
                </span>
              )}
              {m.content}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-white border border-ink-100 rounded-2xl rounded-bl-sm px-4 py-3">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-ink-300 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-ink-300 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-ink-300 animate-bounce" style={{ animationDelay: "300ms" }} />
              </span>
            </div>
          </div>
        )}
      </div>

      {/* input */}
      <div className="p-3 border-t border-ink-100 flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a test message…"
          className="flex-1 rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
        <button
          onClick={send}
          disabled={sending || !input.trim()}
          className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600 disabled:opacity-40 transition shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
      {!enabled && (
        <p className="px-4 pb-3 text-[11px] text-amber-600">
          Note: the bot is currently paused — testing still works here, but it
          won't reply to real DMs until you turn it on and save.
        </p>
      )}
    </div>
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

/* Contextual help popover for the AI Bot hero (dark-styled). */
function AiBotHelp() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onClick = (e) =>
      ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const tips = [
    "The AI bot replies when no automation rule matches an incoming message.",
    "Add your website and FAQs under Knowledge so answers sound like your business.",
    "It answers DMs, comments and story replies 24/7 — in the tone you set.",
    "Instagram only allows replies within 24 hours of a person's last message.",
    "Watch the readiness meter, then Save before turning the bot Live.",
  ];

  return (
    <div className="relative inline-flex" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 rounded-lg bg-white/10 border border-white/15 px-2 py-0.5 text-[11px] font-semibold text-white/85 hover:bg-white/15 transition"
        aria-label="Help"
      >
        <HelpCircle className="w-3.5 h-3.5" /> Help
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-72 sm:w-80 rounded-xl border border-ink-100 bg-white shadow-card-lg p-4 text-left">
          <p className="text-sm font-black text-ink-900 mb-2">AI Bot</p>
          <ul className="space-y-2">
            {tips.map((t, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-[13px] text-ink-600 leading-snug"
              >
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
