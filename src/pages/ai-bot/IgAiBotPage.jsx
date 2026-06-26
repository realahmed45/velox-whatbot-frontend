/**
 * Instagram AI Bot — ManyChat-style, simplified.
 *
 * The creator teaches the bot about their business by:
 *   ✍️  writing a short description, and/or
 *   📄  uploading a PDF/menu/price list, and/or
 *   🔗  pasting their website link, and/or
 *   🛒  connecting Shopify (auto-imports their live catalog).
 *
 * Plus a simple tone picker and an FAQ list. No keywords, no reply-behaviour,
 * no temperature/token knobs — the bot "just works".
 *
 * Knowledge persists to workspace.aiKnowledge (content + sources[]).
 * Personality + FAQs persist to workspace.aiSettings.
 */
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Sparkles,
  Save,
  Plus,
  Trash2,
  Instagram,
  Loader2,
  Send,
  X,
  Play,
  FileText,
  Globe,
  Upload,
  Check,
  RefreshCw,
  Pencil,
  HelpCircle,
  Image as ImageIcon,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { ShopifyIcon } from "@/components/icons/BrandIcons";

const DEFAULTS = {
  enabled: true,
  provider: "groq",
  model: "llama-3.3-70b-versatile",
  systemPrompt:
    "You are a warm, on-brand Instagram support voice. Reply like a real creator — short, friendly, 1 emoji max. Stay on-brand and never sound robotic.",
  businessContext: "",
  faqs: [],
  temperature: 0.55,
  maxTokens: 220,
  handoffKeywords: ["human", "agent", "support", "complain"],
};

const TONE_PRESETS = [
  {
    id: "creator",
    label: "Friendly",
    emoji: "✨",
    prompt:
      "You are an authentic creator replying to DMs. Be warm, casual, use 1 emoji per reply. Match the energy of the follower.",
  },
  {
    id: "professional",
    label: "Professional",
    emoji: "💼",
    prompt:
      "You are a professional brand assistant. Be clear, polite and helpful. Keep replies concise (1–2 lines), minimal emoji.",
  },
  {
    id: "playful",
    label: "Playful",
    emoji: "💫",
    prompt:
      "You are a witty Instagram brand voice. Use clever, fun replies. Drop emojis when it fits the mood.",
  },
  {
    id: "luxury",
    label: "Luxury",
    emoji: "🖤",
    prompt:
      "You are a premium luxury brand. Refined, polished, no slang, minimal emoji use. Sound elevated.",
  },
];

const SOURCE_META = {
  website: {
    Icon: Globe,
    tint: "text-blue-600 bg-blue-50 border-blue-200",
  },
  text: {
    Icon: FileText,
    tint: "text-violet-600 bg-violet-50 border-violet-200",
  },
  image: {
    Icon: ImageIcon,
    tint: "text-amber-600 bg-amber-50 border-amber-200",
  },
  shopify: {
    Icon: ShopifyIcon,
    tint: "bg-green-50 border-green-200",
    brand: true,
  },
  products: {
    Icon: ShopifyIcon,
    tint: "bg-green-50 border-green-200",
    brand: true,
  },
};

const IMAGE_RE = /\.(png|jpe?g|gif|webp|bmp|heic)$/i;

export default function IgAiBotPage() {
  const { activeWorkspace } = useAuthStore();
  const { workspace, fetchWorkspace } = useWorkspaceStore();
  const navigate = useNavigate();

  const [cfg, setCfg] = useState(DEFAULTS);
  const [bizText, setBizText] = useState("");
  const [sources, setSources] = useState([]);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(null); // 'doc' | 'url' | 'shopify'
  const [urlInput, setUrlInput] = useState("");
  const [showUrl, setShowUrl] = useState(false);
  const [newFaq, setNewFaq] = useState({ question: "", answer: "" });
  const fileRef = useRef(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const [testerOpen, setTesterOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("test") === "1") setTesterOpen(true);
  }, [searchParams]);

  const closeTester = () => {
    setTesterOpen(false);
    if (searchParams.get("test")) {
      searchParams.delete("test");
      setSearchParams(searchParams, { replace: true });
    }
  };

  useEffect(() => {
    const stored = workspace?.aiSettings;
    setCfg(stored && Object.keys(stored).length ? { ...DEFAULTS, ...stored } : DEFAULTS);
    setBizText(workspace?.aiKnowledge?.content || "");
    setSources(workspace?.aiKnowledge?.sources || []);
  }, [workspace?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (patch) => setCfg((c) => ({ ...c, ...patch }));

  const igHandle = workspace?.instagram?.username;
  const shopifyConnected = !!workspace?.integrations?.shopify?.storeUrl;

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

  const syncShopify = async () => {
    if (!shopifyConnected) {
      toast("Connect Shopify first — taking you there…", { icon: "🛒" });
      navigate("/dashboard/apps");
      return;
    }
    setBusy("shopify");
    try {
      const { data } = await api.post(
        `/workspaces/${activeWorkspace}/ai-knowledge/sync-shopify`,
      );
      setSources((s) => [...s.filter((x) => x.type !== "shopify"), data.source]);
      set({ enabled: true });
      toast.success(`Imported ${data.productCount} products from Shopify 🛍️`);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Couldn't sync Shopify");
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
    set({ faqs: [...cfg.faqs, { ...newFaq }] });
    setNewFaq({ question: "", answer: "" });
  };
  const removeFaq = (i) => set({ faqs: cfg.faqs.filter((_, x) => x !== i) });

  /* ── Save ───────────────────────────────────────────────────────── */
  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/workspaces/${activeWorkspace}`, { aiSettings: cfg });
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

  const activeTone =
    TONE_PRESETS.find((t) => t.prompt === cfg.systemPrompt)?.id || null;

  return (
    <div className="relative min-h-full">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 right-0 w-[36rem] h-[36rem] rounded-full bg-brand-200/40 blur-[130px]" />
        <div className="absolute top-1/2 -left-24 w-[30rem] h-[30rem] rounded-full bg-amber-200/30 blur-[130px]" />
      </div>

      <div className="relative max-w-3xl mx-auto p-4 sm:p-6 space-y-5">
        {/* ── Hero ───────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl shadow-glass p-6">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-brand-300/25 blur-3xl" />
          <div className="relative flex items-start gap-4">
            <div className="relative w-16 h-16 flex-shrink-0 rounded-2xl bg-white/70 border border-brand-100 ring-1 ring-brand-200/60 flex items-center justify-center shadow-glow">
              <img
                src="/logo.png"
                alt="Botlify"
                className="w-12 h-12 object-contain animate-float"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-ink-900">
                  AI Bot
                </h1>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-700 border border-brand-300">
                  <Instagram className="w-3 h-3" /> @{igHandle || "your.handle"}
                </span>
              </div>
              <p className="text-sm text-ink-600 mt-1">
                Teach it about your business once. It replies to DMs, comments &
                story mentions — 24/7, in your voice.
              </p>
            </div>

            {/* Enabled toggle */}
            <button
              onClick={() => set({ enabled: !cfg.enabled })}
              className={`relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full transition ${
                cfg.enabled ? "bg-brand-500" : "bg-ink-200"
              }`}
              aria-label="Toggle AI bot"
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                  cfg.enabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="relative mt-4 flex items-center gap-2">
            <button
              onClick={() => setTesterOpen(true)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-lg px-3 py-1.5 transition"
            >
              <Play className="w-4 h-4" /> Preview bot
            </button>
            <span className="text-xs text-ink-400">
              {cfg.enabled ? "Bot is live" : "Bot is paused"}
            </span>
          </div>
        </div>

        {/* ── Knowledge ──────────────────────────────────────────── */}
        <IgSection title="Teach your bot about your business" icon={Sparkles}>
          <p className="text-sm text-ink-600 mb-4">
            The more it knows, the better it replies. Add any of these — mix and
            match. We read everything and turn it into your bot's knowledge.
          </p>

          {/* Add knowledge — professional source cards */}
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt,.md,.png,.jpg,.jpeg,.gif,.webp,.bmp,.heic,application/pdf,image/*,text/plain"
            className="hidden"
            onChange={(e) => uploadDoc(e.target.files?.[0])}
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <SourceCard
              title="Upload a file"
              hint="PDF, Word, menu, price list or image"
              tint="from-violet-500 to-indigo-500"
              Icon={Upload}
              loading={busy === "doc"}
              onClick={() => fileRef.current?.click()}
            />
            <SourceCard
              title="Add your website"
              hint="We read every page for you"
              tint="from-sky-500 to-blue-600"
              Icon={Globe}
              loading={busy === "url"}
              active={showUrl}
              onClick={() => setShowUrl((v) => !v)}
            />
            <SourceCard
              title={shopifyConnected ? "Sync Shopify" : "Connect Shopify"}
              hint={
                shopifyConnected
                  ? "Import your live catalog"
                  : "For product stores"
              }
              tint="from-green-500 to-emerald-600"
              brandIcon={<ShopifyIcon className="w-6 h-6" />}
              loading={busy === "shopify"}
              onClick={syncShopify}
            />
          </div>

          {/* Website URL input */}
          {showUrl && (
            <div className="mt-3 flex items-center gap-2">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && importUrl()}
                  placeholder="yourbusiness.com"
                  className="w-full rounded-xl border border-ink-200 bg-white pl-9 pr-3 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none"
                  autoFocus
                />
              </div>
              <button
                onClick={importUrl}
                disabled={busy === "url" || !urlInput.trim()}
                className="rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-5 py-2.5 disabled:opacity-50 transition flex items-center gap-1.5"
              >
                {busy === "url" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Reading…
                  </>
                ) : (
                  <>
                    Import <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Write text */}
          <div className="mt-5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-ink-500 mb-1.5">
              <Pencil className="w-3.5 h-3.5" /> Or write it yourself
            </label>
            <textarea
              value={bizText}
              onChange={(e) => setBizText(e.target.value)}
              rows={5}
              maxLength={12000}
              placeholder={
                "What does your page sell or talk about? Products, drops, shipping policy, opening hours, links — the more context, the better the bot replies.\n\nExample:\n• Streetwear drop every Friday 8pm PKT\n• Sizes XS–XXL, ships across PK in 3 days\n• Returns within 7 days, unworn only"
              }
              className="w-full rounded-xl border border-ink-200 bg-white/80 px-3.5 py-3 text-sm text-ink-800 placeholder:text-ink-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none resize-y"
            />
            <p className="text-[11px] text-ink-400 mt-1">
              {bizText.length.toLocaleString()} characters
            </p>
          </div>

          {/* Sources list */}
          {sources.length > 0 && (
            <div className="mt-5 space-y-2">
              <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide">
                Your bot knows ({sources.length})
              </p>
              {sources.map((s) => {
                const isImg =
                  s.type === "image" ||
                  (s.type === "text" && IMAGE_RE.test(s.label || ""));
                const meta =
                  (isImg ? SOURCE_META.image : SOURCE_META[s.type]) ||
                  SOURCE_META.text;
                const Icon = meta.Icon;
                return (
                  <div
                    key={s._id}
                    className="group flex items-center gap-3 rounded-xl border border-ink-100 bg-white/80 px-3 py-2.5 hover:border-ink-200 transition"
                  >
                    {s.imageUrl ? (
                      <img
                        src={s.imageUrl}
                        alt={s.label || "image"}
                        className="w-9 h-9 rounded-lg object-cover border border-ink-100 flex-shrink-0"
                      />
                    ) : (
                      <span
                        className={`w-9 h-9 rounded-lg flex items-center justify-center border ${meta.tint}`}
                      >
                        {meta.brand ? (
                          <Icon className="w-5 h-5" />
                        ) : (
                          <Icon className="w-[18px] h-[18px]" />
                        )}
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink-800 truncate">
                        {s.label || s.url || "Knowledge source"}
                      </p>
                      <p className="text-[11px] text-ink-400 flex items-center gap-1.5">
                        {s.status === "ready" ? (
                          <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                            <Check className="w-3 h-3" /> Ready
                          </span>
                        ) : s.status === "processing" ? (
                          <span className="inline-flex items-center gap-1 text-amber-600">
                            <Loader2 className="w-3 h-3 animate-spin" />{" "}
                            Processing…
                          </span>
                        ) : (
                          <span className="text-red-500">Couldn't read</span>
                        )}
                        {s.charCount
                          ? ` · ${s.charCount.toLocaleString()} chars learned`
                          : ""}
                      </p>
                    </div>
                    {(s.type === "website" || s.type === "shopify") && (
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
                    )}
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

          {/* Shopify product mini-preview — shown once Shopify source is synced */}
          {shopifyConnected && sources.some((s) => s.type === "shopify" && s.status === "ready") && (
            <ShopifyProductsPreview />
          )}
        </IgSection>

        {/* ── Tone ───────────────────────────────────────────────── */}
        <IgSection title="Bot personality" icon={Instagram}>
          <p className="text-sm text-ink-600 mb-3">
            Pick how your bot should sound.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {TONE_PRESETS.map((t) => (
              <button
                key={t.id}
                onClick={() => set({ systemPrompt: t.prompt })}
                className={`rounded-xl border px-3 py-3 text-center transition ${
                  activeTone === t.id
                    ? "border-brand-400 bg-brand-50 ring-2 ring-brand-100"
                    : "border-ink-200 bg-white/70 hover:border-brand-200"
                }`}
              >
                <div className="text-xl mb-1">{t.emoji}</div>
                <div className="text-xs font-semibold text-ink-800">
                  {t.label}
                </div>
              </button>
            ))}
          </div>
        </IgSection>

        {/* ── FAQs ───────────────────────────────────────────────── */}
        <IgSection title="Quick answers (FAQs)" icon={HelpCircle}>
          <p className="text-sm text-ink-600 mb-3">
            Add exact answers for common questions. The bot replies with these
            instantly — word for word.
          </p>

          {cfg.faqs.length > 0 && (
            <div className="space-y-2 mb-4">
              {cfg.faqs.map((f, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-ink-100 bg-white/80 px-3.5 py-2.5 flex items-start gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink-800">
                      {f.question}
                    </p>
                    <p className="text-sm text-ink-600 mt-0.5">{f.answer}</p>
                  </div>
                  <button
                    onClick={() => removeFaq(i)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-400 hover:text-red-600 hover:bg-red-50 transition flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <input
              value={newFaq.question}
              onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
              placeholder="Question — e.g. Do you ship nationwide?"
              className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none"
            />
            <div className="flex items-center gap-2">
              <input
                value={newFaq.answer}
                onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && addFaq()}
                placeholder="Answer — e.g. Yes! 3–5 days across Pakistan."
                className="flex-1 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none"
              />
              <button
                onClick={addFaq}
                className="rounded-lg bg-ink-900 hover:bg-ink-800 text-white text-sm font-semibold px-4 py-2 flex items-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
          </div>
        </IgSection>

        {/* ── Save bar ───────────────────────────────────────────── */}
        <div className="sticky bottom-4 z-10">
          <div className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur-xl shadow-glass p-3 flex items-center justify-between gap-3">
            <p className="text-xs text-ink-500 pl-2">
              Changes apply to your live Instagram bot.
            </p>
            <button
              onClick={save}
              disabled={saving}
              className="rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm px-5 py-2.5 flex items-center gap-2 shadow-glow disabled:opacity-60 transition"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save bot
                </>
              )}
            </button>
          </div>
        </div>

        <BotTester open={testerOpen} onClose={closeTester} igHandle={igHandle} />
      </div>
    </div>
  );
}

// ─── Shopify product mini-preview for AI bot page ───────────────────────────
function ShopifyProductsPreview() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/integrations/shopify/products")
      .then(({ data }) => setProducts(data.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-2">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-xl border border-ink-100 bg-ink-50 aspect-square animate-pulse" />
      ))}
    </div>
  );

  if (!products.length) return null;

  return (
    <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-5 h-5 rounded-md bg-emerald-500 flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </span>
        <p className="text-xs font-bold text-emerald-900">
          {products.length} products imported — bot knows your full catalog
        </p>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {products.slice(0, 6).map((p) => (
          <a
            key={p.id}
            href={p.url}
            target="_blank"
            rel="noreferrer"
            className="group rounded-lg overflow-hidden border border-emerald-200/60 bg-white hover:border-emerald-400 hover:shadow transition"
          >
            {p.image ? (
              <img src={p.image} alt={p.title} className="w-full aspect-square object-cover" />
            ) : (
              <div className="w-full aspect-square bg-ink-50 flex items-center justify-center text-ink-300">
                <ShopifyIcon className="w-5 h-5" />
              </div>
            )}
            <div className="p-1.5">
              <p className="text-[10px] font-semibold text-ink-800 truncate leading-tight">{p.title}</p>
              {p.price && <p className="text-[10px] text-emerald-700 font-bold">{p.price}</p>}
            </div>
          </a>
        ))}
        {products.length > 6 && (
          <div className="rounded-lg border border-dashed border-emerald-200 bg-white flex items-center justify-center aspect-square">
            <p className="text-[10px] text-emerald-600 font-semibold text-center">+{products.length - 6} more</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SourceCard({ title, hint, Icon, brandIcon, tint, loading, active, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`group relative overflow-hidden rounded-2xl border bg-white/80 p-4 text-left transition disabled:opacity-70 ${
        active
          ? "border-brand-400 ring-2 ring-brand-100"
          : "border-ink-200 hover:border-brand-300 hover:shadow-glass"
      }`}
    >
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 shadow-sm ${
          brandIcon
            ? "bg-white border border-ink-100"
            : `bg-gradient-to-br ${tint} text-white`
        }`}
      >
        {loading ? (
          <Loader2
            className={`w-5 h-5 animate-spin ${brandIcon ? "text-ink-500" : "text-white"}`}
          />
        ) : brandIcon ? (
          brandIcon
        ) : (
          <Icon className="w-5 h-5" />
        )}
      </div>
      <p className="text-sm font-bold text-ink-900">{title}</p>
      <p className="text-[12px] text-ink-500 mt-0.5 leading-snug">{hint}</p>
      <ArrowRight className="absolute top-4 right-4 w-4 h-4 text-ink-300 group-hover:text-brand-500 group-hover:translate-x-0.5 transition" />
    </button>
  );
}

function BotTester({ open, onClose, igHandle }) {
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (open && msgs.length === 0) {
      setMsgs([
        {
          from: "bot",
          text: `Hey! I'm @${igHandle || "your.handle"}'s bot. Send a DM like a follower would — try a keyword, "hi", or a question — and I'll reply exactly how I would in real life. (Nothing is actually sent to Instagram.)`,
        },
      ]);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [msgs, sending]);

  const send = async () => {
    const t = text.trim();
    if (!t || sending) return;
    setMsgs((m) => [...m, { from: "user", text: t }]);
    setText("");
    setSending(true);
    try {
      const { data } = await api.post("/instagram/test/trigger", {
        triggerType: "direct_message",
        text: t,
        dryRun: true,
      });
      if (data.replies?.length) {
        setMsgs((m) => [
          ...m,
          ...data.replies.map((r) => {
            const img = /^\[image\]\s+(\S+)/.exec(r);
            return img
              ? { from: "bot", image: img[1] }
              : { from: "bot", text: r };
          }),
        ]);
      } else {
        setMsgs((m) => [
          ...m,
          {
            from: "system",
            text: "No automation matched this message. Add a keyword rule, enable the AI bot, or set a fallback reply.",
          },
        ]);
      }
    } catch (e) {
      setMsgs((m) => [
        ...m,
        {
          from: "system",
          text: e?.response?.data?.message || "Test failed. Try again.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right">
        <div className="flex items-center justify-between px-4 h-16 border-b border-ink-100 bg-gradient-to-r from-brand-500 to-brand-600 text-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src="/logo.png"
                alt="Botlify"
                className="w-9 h-9 rounded-full object-contain bg-white p-1 ring-2 ring-white/30"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-brand-500" />
            </div>
            <div className="leading-tight">
              <p className="font-bold text-sm">@{igHandle || "your.handle"}</p>
              <p className="text-[10px] text-white/85 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-300" />
                Bot preview · nothing sent to Instagram
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/15"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-3 bg-ink-50"
        >
          {msgs.map((m, i) =>
            m.from === "system" ? (
              <div
                key={i}
                className="mx-auto max-w-[90%] text-center text-[11px] text-ink-500 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2"
              >
                {m.text}
              </div>
            ) : (
              <div
                key={i}
                className={`flex items-end gap-2 ${m.from === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.from === "bot" && (
                  <img
                    src="/logo.png"
                    alt=""
                    className="w-6 h-6 rounded-full object-contain bg-white border border-ink-100 flex-shrink-0"
                  />
                )}
                {m.image ? (
                  <a
                    href={m.image}
                    target="_blank"
                    rel="noreferrer"
                    className="block max-w-[70%] overflow-hidden rounded-2xl rounded-bl-md border border-ink-100 bg-white"
                  >
                    <img
                      src={m.image}
                      alt="Bot sent"
                      className="w-full h-auto object-cover"
                    />
                  </a>
                ) : (
                  <div
                    className={`max-w-[78%] px-3.5 py-2 text-sm whitespace-pre-wrap leading-relaxed rounded-2xl ${
                      m.from === "user"
                        ? "bg-brand-500 text-white rounded-br-md"
                        : "bg-white border border-ink-100 text-ink-800 rounded-bl-md"
                    }`}
                  >
                    {m.text}
                  </div>
                )}
              </div>
            ),
          )}
          {sending && (
            <div className="flex justify-start">
              <div className="bg-white border border-ink-100 px-3 py-2 rounded-2xl rounded-bl-md">
                <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
              </div>
            </div>
          )}
        </div>

        <div className="p-3 border-t border-ink-100 flex-shrink-0">
          <p className="text-[10px] text-ink-400 mb-2">
            Tip: save your changes above before testing — the tester uses your
            last saved config.
          </p>
          <div className="flex items-center gap-2">
            <input
              className="input flex-1"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type a DM as a follower…"
              autoFocus
            />
            <button
              onClick={send}
              disabled={sending || !text.trim()}
              className="!py-2.5 !px-4 rounded-lg bg-brand-500 hover:bg-brand-600 text-white disabled:opacity-50 transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function IgSection({ title, icon: Icon, children }) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl shadow-glass p-5 sm:p-6">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="w-9 h-9 rounded-lg bg-brand-500 text-white flex items-center justify-center shadow-glow">
          <Icon className="w-[18px] h-[18px]" />
        </span>
        <h2 className="font-bold text-ink-900 text-[15px]">{title}</h2>
      </div>
      {children}
    </div>
  );
}
