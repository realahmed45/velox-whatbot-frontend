/**
 * Instagram AI Bot — distinct visual identity.
 *
 * Rose/fuchsia palette, story-bubble hero, IG-flavored copy ("DMs",
 * "comments", "story replies"). Tone presets reference creator/brand voice.
 * Persists to workspace.aiSettings.
 */
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Save,
  Bot,
  Plus,
  Trash2,
  Heart,
  MessageCircle,
  Instagram,
  Loader2,
  Wand2,
  Hash,
  AtSign,
  Send,
  X,
  Play,
  Globe,
  ShoppingBag,
  FileText,
  ExternalLink,
  CheckCircle2,
  Target,
  RefreshCw,
  Upload,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import ShopifyConnect from "@/components/integrations/ShopifyConnect";

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
  goals: ["support"],
  matchLanguage: true,
  leadCapture: false,
  engageBack: false,
  ctaLink: "",
};

const BOT_GOALS = [
  { id: "support", label: "Answer questions", emoji: "💬" },
  { id: "sales", label: "Recommend & sell", emoji: "🛍️" },
  { id: "leads", label: "Capture leads", emoji: "🎯" },
  { id: "bookings", label: "Take bookings", emoji: "📅" },
  { id: "traffic", label: "Drive to a link", emoji: "🔗" },
];

const IG_TONE_PRESETS = [
  {
    id: "creator",
    label: "Creator vibe",
    emoji: "✨",
    prompt:
      "You are an authentic creator replying to DMs. Be warm, casual, use 1 emoji per reply. Match the energy of the follower.",
  },
  {
    id: "brand",
    label: "Lifestyle brand",
    emoji: "🌸",
    prompt:
      "You are a lifestyle brand voice — aesthetic, friendly, on-trend. Keep replies short (1–2 lines) and inviting.",
  },
  {
    id: "playful",
    label: "Playful & witty",
    emoji: "💫",
    prompt:
      "You are a witty Instagram brand voice. Use clever, fun replies. Drop emojis when it fits the mood.",
  },
  {
    id: "luxury",
    label: "Premium / luxury",
    emoji: "🖤",
    prompt:
      "You are a premium luxury brand. Refined, polished, no slang, minimal emoji use. Sound elevated.",
  },
];

export default function IgAiBotPage() {
  const { activeWorkspace } = useAuthStore();
  const { workspace, fetchWorkspace } = useWorkspaceStore();

  const [cfg, setCfg] = useState(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [kwInput, setKwInput] = useState("");
  const [newFaq, setNewFaq] = useState({ question: "", answer: "" });

  // Knowledge: imported website sources + product catalog
  const [sources, setSources] = useState([]);
  const [importUrl, setImportUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [products, setProducts] = useState("");
  const productsRef = useRef("");
  const [syncingShopify, setSyncingShopify] = useState(false);
  const shopifyConnected = !!workspace?.integrations?.shopify?.storeUrl;
  const shopifyOrderTracking =
    !!workspace?.integrations?.shopify?.scopes?.orders;
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [resyncingId, setResyncingId] = useState(null);
  const fileRef = useRef(null);
  const stats = workspace?.aiStats || {};

  const [searchParams, setSearchParams] = useSearchParams();
  const [testerOpen, setTesterOpen] = useState(false);

  // Open the tester automatically when the sidebar "Test the bot" link is used.
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
    if (stored && Object.keys(stored).length)
      setCfg({ ...DEFAULTS, ...stored });
    else setCfg(DEFAULTS);

    setSources(workspace?.aiKnowledge?.sources || []);
    const cat = workspace?.smartOrders?.catalog || "";
    setProducts(cat);
    productsRef.current = cat;
  }, [workspace?._id]);

  const set = (patch) => setCfg((c) => ({ ...c, ...patch }));

  const importSite = async () => {
    const url = importUrl.trim();
    if (!url || importing) return;
    setImporting(true);
    try {
      const { data } = await api.post(
        `/workspaces/${activeWorkspace}/ai-knowledge/import-url`,
        { url },
      );
      setSources((s) => [...s, data.source]);
      setImportUrl("");
      toast.success(
        `Profile updated from ${data.source.label || "your website"}`,
      );
    } catch (e) {
      toast.error(e?.response?.data?.message || "We couldn't add that website. Check the URL and try again.");
    } finally {
      setImporting(false);
    }
  };

  const uploadDoc = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingDoc(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post(
        `/workspaces/${activeWorkspace}/ai-knowledge/import-doc`,
        fd,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      setSources((s) => [...s, data.source]);
      toast.success(`Added ${data.source.label}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "We couldn't upload that file. Try again.");
    } finally {
      setUploadingDoc(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const resyncSource = async (id) => {
    setResyncingId(id);
    try {
      const { data } = await api.post(
        `/workspaces/${activeWorkspace}/ai-knowledge/sources/${id}/resync`,
      );
      setSources((s) => s.map((x) => (x._id === id ? data.source : x)));
      toast.success("Content updated");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Re-sync failed");
    } finally {
      setResyncingId(null);
    }
  };

  const syncShopify = async () => {
    if (syncingShopify) return;
    setSyncingShopify(true);
    try {
      const { data } = await api.post(
        `/workspaces/${activeWorkspace}/ai-knowledge/sync-shopify`,
      );
      setSources((s) => [...s.filter((x) => x.type !== "shopify"), data.source]);
      toast.success(`Catalog updated · ${data.productCount} products`);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Shopify sync failed");
    } finally {
      setSyncingShopify(false);
    }
  };

  const toggleGoal = (id) => {
    const has = (cfg.goals || []).includes(id);
    const next = has
      ? cfg.goals.filter((g) => g !== id)
      : [...(cfg.goals || []), id];
    set({ goals: next.length ? next : ["support"] });
  };

  const removeSource = async (id) => {
    const prev = sources;
    setSources((s) => s.filter((x) => x._id !== id));
    try {
      await api.delete(
        `/workspaces/${activeWorkspace}/ai-knowledge/sources/${id}`,
      );
    } catch {
      setSources(prev);
      toast.error("Couldn't remove source");
    }
  };

  const addKeyword = () => {
    const k = kwInput.trim().toLowerCase();
    if (!k || cfg.handoffKeywords.includes(k)) return setKwInput("");
    set({ handoffKeywords: [...cfg.handoffKeywords, k] });
    setKwInput("");
  };
  const removeKeyword = (k) =>
    set({ handoffKeywords: cfg.handoffKeywords.filter((x) => x !== k) });

  const addFaq = () => {
    if (!newFaq.question.trim() || !newFaq.answer.trim())
      return toast.error("Both question and answer required");
    set({ faqs: [...cfg.faqs, { ...newFaq }] });
    setNewFaq({ question: "", answer: "" });
  };
  const removeFaq = (i) => set({ faqs: cfg.faqs.filter((_, x) => x !== i) });

  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/workspaces/${activeWorkspace}`, { aiSettings: cfg });
      // Persist the product catalog only when it changed.
      if (products !== productsRef.current) {
        await api.put(`/workspaces/${activeWorkspace}/smart-orders`, {
          enabled: !!products.trim(),
          catalog: products,
        });
        productsRef.current = products;
      }
      await fetchWorkspace(activeWorkspace);
      toast.success("Instagram AI bot updated");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const igHandle = workspace?.instagram?.username;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-5">
      {/* ── IG-themed hero (gradient + story bubble row) ─────────── */}
      <div className="relative overflow-hidden border border-rose-200/60 bg-gradient-to-br from-rose-50 via-fuchsia-50 to-violet-50 p-6">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-fuchsia-300/30 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-rose-300/20 blur-3xl" />

        <div className="relative flex items-start gap-4">
          {/* Story-ring avatar */}
          <div className="relative w-14 h-14 flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-400 via-rose-500 to-fuchsia-600 p-[2px]">
              <div className="w-full h-full bg-white p-[2px]">
                <div className="w-full h-full bg-gradient-to-br from-rose-500 via-fuchsia-500 to-violet-600 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-ink-900">
                Instagram AI Bot
              </h1>
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 bg-rose-500/10 text-rose-700 border border-rose-300">
                <Instagram className="w-3 h-3" /> @{igHandle || "your.handle"}
              </span>
            </div>
            <p className="text-sm text-ink-600 mt-1">
              Auto-replies to <strong>DMs</strong>, <strong>comments</strong>,{" "}
              <strong>story mentions</strong> and <strong>shared posts</strong>{" "}
              in your brand voice.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={!!cfg.enabled}
                onChange={(e) => set({ enabled: e.target.checked })}
              />
              <span className="w-11 h-6 bg-ink-200 peer-checked:bg-gradient-to-r peer-checked:from-rose-500 peer-checked:to-fuchsia-600 transition relative">
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white shadow transition ${cfg.enabled ? "translate-x-5" : ""}`}
                />
              </span>
              <span className="text-xs font-bold text-ink-700">
                {cfg.enabled ? "Live" : "Paused"}
              </span>
            </label>
            <button
              type="button"
              onClick={() => setTesterOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-ink-900 text-white hover:bg-ink-800 transition"
            >
              <Play className="w-3.5 h-3.5" /> Preview
            </button>
          </div>
        </div>

        {/* Stat row — real value metrics (this month) */}
        <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          {[
            { k: "Replies this month", v: stats.repliesThisMonth || 0 },
            { k: "Instant FAQ answers", v: stats.faqHits || 0 },
            { k: "Handed to you", v: stats.handoffs || 0 },
            { k: "Leads captured", v: stats.leadsCaptured || 0 },
          ].map((s) => (
            <div
              key={s.k}
              className="bg-white/70 backdrop-blur border border-rose-200/50 px-3 py-2"
            >
              <p className="text-[10px] uppercase tracking-wider text-rose-600 font-bold">
                {s.k}
              </p>
              <p className="text-lg font-black text-ink-900">
                {Number(s.v).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tone presets ──────────────────────────────────────────── */}
      <IgSection title="Brand voice" icon={Wand2}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {IG_TONE_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => set({ systemPrompt: p.prompt })}
              className={`text-left p-3 border-2 transition text-xs ${
                cfg.systemPrompt === p.prompt
                  ? "border-rose-500 bg-rose-50"
                  : "border-ink-100 hover:border-rose-300"
              }`}
            >
              <p className="font-bold text-ink-900">
                <span className="mr-1">{p.emoji}</span>
                {p.label}
              </p>
              <p className="text-[11px] text-ink-500 mt-1 line-clamp-2">
                {p.prompt}
              </p>
            </button>
          ))}
        </div>
        <div className="mt-4">
          <label className="label">Custom system prompt</label>
          <textarea
            className="input min-h-[110px] font-mono text-xs"
            value={cfg.systemPrompt}
            onChange={(e) => set({ systemPrompt: e.target.value })}
          />
        </div>
      </IgSection>

      {/* ── Bot goals & smart options ────────────────────────────── */}
      <IgSection title="What should your bot do?" icon={Target}>
        <p className="text-xs text-ink-500 mb-3">
          Pick the jobs your bot should focus on. It shapes how every reply is
          written.
        </p>
        <div className="flex flex-wrap gap-2 mb-5">
          {BOT_GOALS.map((g) => {
            const active = (cfg.goals || []).includes(g.id);
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => toggleGoal(g.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-2 transition ${
                  active
                    ? "border-rose-500 bg-rose-50 text-rose-700"
                    : "border-ink-100 text-ink-600 hover:border-rose-300"
                }`}
              >
                <span>{g.emoji}</span>
                {g.label}
              </button>
            );
          })}
        </div>

        <div className="space-y-2">
          <OptionToggle
            label="Reply in the follower's language"
            hint="Auto-detects and matches their language."
            checked={!!cfg.matchLanguage}
            onChange={(v) => set({ matchLanguage: v })}
          />
          <OptionToggle
            label="Collect leads"
            hint="Politely asks for name & contact when someone's interested."
            checked={!!cfg.leadCapture}
            onChange={(v) => set({ leadCapture: v })}
          />
          <OptionToggle
            label="Keep the conversation going"
            hint="Ends replies with a friendly question or next step."
            checked={!!cfg.engageBack}
            onChange={(v) => set({ engageBack: v })}
          />
        </div>

        {(cfg.goals?.includes("traffic") || cfg.goals?.includes("bookings")) && (
          <div className="mt-4">
            <label className="label">Link to share (booking page, shop…)</label>
            <input
              className="input"
              value={cfg.ctaLink}
              onChange={(e) => set({ ctaLink: e.target.value })}
              placeholder="https://calendly.com/yourbrand"
            />
          </div>
        )}
      </IgSection>

      {/* ── Business profile ────────────────────────────────────────── */}
      <IgSection title="Business profile" icon={Wand2}>
        <p className="text-xs text-ink-500 mb-4">
          Help us represent your brand accurately in every conversation.
        </p>

        <div className="border border-rose-200 bg-rose-50/40 p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <Globe className="w-4 h-4 text-rose-600" />
            <p className="text-sm font-bold text-ink-900">Website</p>
          </div>
          <p className="text-xs text-ink-500 mb-3">
            Enter your website and we&apos;ll personalize your automated replies.
          </p>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && importSite()}
              placeholder="yourbrand.com"
              disabled={importing}
            />
            <button
              type="button"
              onClick={importSite}
              disabled={importing || !importUrl.trim()}
              className="!py-2.5 !px-4 bg-ink-900 text-white font-bold text-xs flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
            >
              {importing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Adding…
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Add
                </>
              )}
            </button>
          </div>

          {/* Upload a document (menu, price list, brochure) */}
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.txt,.md,application/pdf,text/plain"
            className="hidden"
            onChange={uploadDoc}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploadingDoc}
            className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold text-ink-600 hover:text-rose-600 disabled:opacity-50"
          >
            {uploadingDoc ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading…
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" /> Upload a document
              </>
            )}
          </button>

          {/* Imported sources */}
          {sources.length > 0 && (
            <div className="mt-3 space-y-2">
              {sources.map((s) => (
                <div
                  key={s._id}
                  className="bg-white border border-ink-100 px-3 py-2 flex items-center gap-3"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-ink-900 truncate">
                      {s.label || s.url}
                    </p>
                    <p className="text-[10px] text-ink-400 truncate">
                      {s.url || s.label} · Active
                    </p>
                  </div>
                  {(s.type === "website" || s.type === "shopify") && (
                    <button
                      type="button"
                      onClick={() => resyncSource(s._id)}
                      disabled={resyncingId === s._id}
                      title="Re-sync"
                      className="text-ink-300 hover:text-rose-600 p-1 disabled:opacity-50"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${resyncingId === s._id ? "animate-spin" : ""}`}
                      />
                    </button>
                  )}
                  {s.url && (
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-ink-300 hover:text-ink-600 p-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => removeSource(s._id)}
                    className="text-ink-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Business info notes */}
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-1.5">
            <FileText className="w-4 h-4 text-ink-500" />
            <label className="label !mb-0">Additional details</label>
          </div>
          <textarea
            className="input min-h-[120px]"
            value={cfg.businessContext}
            onChange={(e) => set({ businessContext: e.target.value })}
            placeholder={`Example:\n• Streetwear drop every Friday 8pm PKT\n• Sizes XS–XXL, ships across PK in 3 days\n• Collabs: DM with "collab" + media kit\n• Returns within 7 days, unworn only`}
          />
          <p className="text-[10px] text-ink-400 mt-1">
            {cfg.businessContext.length} characters
          </p>
        </div>
      </IgSection>

      {/* ── Products / catalog ───────────────────────────────────── */}
      <IgSection title="Products & pricing" icon={ShoppingBag}>
        <p className="text-xs text-ink-500 mb-3">
          Connect Shopify or add your catalog so customers get accurate product
          information in DMs.
        </p>

        <div className="mb-3">
          <ShopifyConnect
            connected={shopifyConnected}
            storeUrl={workspace?.integrations?.shopify?.storeUrl}
            orderTracking={shopifyOrderTracking}
            onConnected={async () => {
              await fetchWorkspace(activeWorkspace);
              syncShopify();
            }}
            compact
          />
          {shopifyConnected && (
            <button
              type="button"
              onClick={syncShopify}
              disabled={syncingShopify}
              className="mt-2 !py-1.5 !px-3 bg-emerald-600 text-white font-bold text-xs inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              {syncingShopify ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Syncing catalog…
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh catalog
                </>
              )}
            </button>
          )}
        </div>

        <textarea
          className="input min-h-[120px] font-mono text-xs"
          value={products}
          onChange={(e) => setProducts(e.target.value)}
          placeholder={`Oversized Tee — Rs 2,500 (S, M, L, XL)\nCargo Pants — Rs 4,200\nFree shipping over Rs 5,000`}
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-[10px] text-ink-400">
            {products.length} / 5000 characters
          </p>
          <p className="text-[10px] text-ink-400">
            Manual list works even without Shopify
          </p>
        </div>
      </IgSection>

      {/* ── FAQs ──────────────────────────────────────────────────── */}
      <IgSection
        title={`Saved replies (${cfg.faqs.length})`}
        icon={MessageCircle}
      >
        <p className="text-xs text-ink-500 mb-3">
          Pre-written answers for the most common DMs. The bot uses these first
          before falling back to AI.
        </p>

        <div className="space-y-2 mb-4">
          {cfg.faqs.map((f, i) => (
            <div
              key={i}
              className="border border-rose-100 bg-rose-50/30 p-3 flex items-start gap-3"
            >
              <Hash className="w-3.5 h-3.5 text-rose-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-ink-900">{f.question}</p>
                <p className="text-xs text-ink-600 mt-1">↳ {f.answer}</p>
              </div>
              <button
                type="button"
                onClick={() => removeFaq(i)}
                className="text-ink-400 hover:text-rose-600 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {cfg.faqs.length === 0 && (
            <p className="text-[11px] text-ink-400 italic">
              No saved replies yet — start with "How much?", "Where do you
              ship?", "Do you collab?".
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2">
          <input
            className="input"
            placeholder="Question (e.g. How much?)"
            value={newFaq.question}
            onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
          />
          <input
            className="input"
            placeholder="Reply"
            value={newFaq.answer}
            onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
          />
          <button
            type="button"
            onClick={addFaq}
            className="!py-2.5 !px-4 bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white font-bold text-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </IgSection>

      {/* ── Handoff ──────────────────────────────────────────────── */}
      <IgSection title="Hand off to me" icon={AtSign}>
        <p className="text-xs text-ink-500 mb-3">
          When a follower says any of these, the bot pauses so you can step in
          personally.
        </p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {cfg.handoffKeywords.map((k) => (
            <span
              key={k}
              className="inline-flex items-center gap-1 text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-200 px-2 py-1"
            >
              #{k}
              <button
                onClick={() => removeKeyword(k)}
                className="hover:text-rose-900"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2 max-w-md">
          <input
            className="input flex-1"
            value={kwInput}
            onChange={(e) => setKwInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addKeyword()}
            placeholder="Add trigger word"
          />
          <button
            onClick={addKeyword}
            className="!py-2 !px-3 bg-rose-500 text-white"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </IgSection>

      {/* ── Sticky save ──────────────────────────────────────────── */}
      <div className="sticky bottom-3 z-10">
        <div className="bg-white border border-rose-200 shadow-card p-3 flex items-center justify-between">
          <div className="text-xs text-ink-500 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            Applies to all incoming{" "}
            <strong className="text-ink-700">Instagram</strong> messages.
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white font-bold text-sm px-5 py-2.5 flex items-center gap-2 disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Instagram bot
              </>
            )}
          </button>
        </div>
      </div>

      <BotTester open={testerOpen} onClose={closeTester} igHandle={igHandle} />
    </div>
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
          text: `Preview how @${igHandle || "your.handle"} responds to customers. Nothing is sent to Instagram.`,
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
          ...data.replies.map((r) => ({ from: "bot", text: r })),
        ]);
      } else {
        setMsgs((m) => [
          ...m,
          {
            from: "system",
            text: "No reply was generated. Check your automation rules or welcome message.",
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
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right">
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-ink-100 bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white flex-shrink-0">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            <div className="leading-tight">
              <p className="font-bold text-sm">Preview</p>
              <p className="text-[10px] text-white/80">
                See how your brand replies · nothing sent to Instagram
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-white/15"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-3 bg-ink-50"
        >
          {msgs.map((m, i) =>
            m.from === "system" ? (
              <div
                key={i}
                className="mx-auto max-w-[90%] text-center text-[11px] text-ink-500 bg-amber-50 border border-amber-200 px-3 py-2"
              >
                {m.text}
              </div>
            ) : (
              <div
                key={i}
                className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 text-sm whitespace-pre-wrap ${
                    m.from === "user"
                      ? "bg-gradient-to-br from-rose-500 to-fuchsia-600 text-white rounded-2xl rounded-br-sm"
                      : "bg-white border border-ink-100 text-ink-800 rounded-2xl rounded-bl-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ),
          )}
          {sending && (
            <div className="flex justify-start">
              <div className="bg-white border border-ink-100 px-3 py-2 rounded-2xl rounded-bl-sm">
                <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
              </div>
            </div>
          )}
        </div>

        {/* Composer */}
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
              className="!py-2.5 !px-4 bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OptionToggle({ label, hint, checked, onChange }) {
  return (
    <label className="flex items-start gap-3 p-3 border border-ink-100 hover:border-rose-200 cursor-pointer select-none transition">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="mt-0.5 flex-shrink-0 w-10 h-5 rounded-full bg-ink-200 peer-checked:bg-gradient-to-r peer-checked:from-rose-500 peer-checked:to-fuchsia-600 transition relative">
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white shadow rounded-full transition ${checked ? "translate-x-5" : ""}`}
        />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-semibold text-ink-900">{label}</span>
        {hint && <span className="block text-[11px] text-ink-500">{hint}</span>}
      </span>
    </label>
  );
}

function IgSection({ title, icon: Icon, children }) {
  return (
    <div className="bg-white border border-ink-100 p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-8 h-8 bg-gradient-to-br from-rose-500 to-fuchsia-600 text-white flex items-center justify-center">
          <Icon className="w-4 h-4" />
        </span>
        <h2 className="font-bold text-ink-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}
