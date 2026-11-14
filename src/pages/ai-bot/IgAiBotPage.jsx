/**
 * AI assistant — how your AI concierge answers guests inside Airbnb,
 * Booking.com and Expedia, and on WhatsApp.
 *
 * Six short sections, one per sub-tab (?aiTab= when embedded in Settings):
 *
 *   On / off       — the main switch + the per-channel switches
 *                    (Booking-site AI replies, WhatsApp AI replies). These save
 *                    instantly.
 *   Tone & rules   — brand voice and hard limits
 *   Handoff        — words that hand a conversation to the front desk
 *   FAQs           — exact answers not implied by the property data
 *   What it knows  — read-only view of the property record it reads live
 *                    (GET /hotel/properties + /hotel/properties/:id/rooms)
 *   Try it         — sandbox chat, nothing is sent to guests
 *
 * Tone, rules, handoff words and FAQs save together with the Save button.
 * PUT /workspaces/:id replaces `aiSettings` wholesale, so retired keys (product
 * catalog, legacy persona fields…) are round-tripped verbatim from the stored
 * settings and the legacy knowledge text is re-sent untouched.
 */
import { useEffect, useRef, useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Sparkles,
  Save,
  Plus,
  Trash2,
  Loader2,
  HelpCircle,
  Check,
  Bot,
  BookOpen,
  ShieldCheck,
  X,
  Send,
  MessageSquare,
  Hotel,
  Clock,
  BedDouble,
  Wallet,
  ScrollText,
  UserCog,
  ExternalLink,
  Power,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import {
  TEMPLATES_BY_CATEGORY,
  FAQ_TEMPLATE_COUNT,
} from "@/data/faqTemplates";
import { usePropertyStore } from "@/store/propertyStore";
import { AnimatePresence, motion } from "framer-motion";
import { PulseDot, Reveal, SlidingTabs } from "@/components/fx";
import AiChannelToggles from "@/pages/settings/AiChannelToggles";

// Shared pop for popovers + modal panels (design system spring).
const pop = {
  initial: { opacity: 0, y: 8, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 6, scale: 0.97 },
  transition: { type: "spring", stiffness: 420, damping: 30 },
};

const DEFAULTS = {
  enabled: true,
  businessContext: "",
  faqs: [],
};

const TABS = [
  { id: "status", label: "On / off", icon: Power },
  {
    id: "voice",
    label: "Tone & rules",
    icon: Bot,
    ready: (cfg) => !!(cfg.brandVoice || cfg.guardrails),
  },
  {
    id: "handoff",
    label: "Handoff",
    icon: UserCog,
    ready: (cfg) => (cfg.handoffKeywords?.length || 0) > 0,
  },
  {
    id: "faqs",
    label: "FAQs",
    icon: HelpCircle,
    ready: (cfg) => (cfg.faqs?.length || 0) > 0,
  },
  { id: "knows", label: "What it knows", icon: BookOpen },
  { id: "test", label: "Try it", icon: MessageSquare },
];
const DEFAULT_TAB = "status";
// Sections whose edits go through the Save button.
const EDIT_TABS = ["voice", "handoff", "faqs"];

// The fields the Save button owns — used to tell whether there's anything to save.
const editable = (c) =>
  JSON.stringify({
    brandVoice: c.brandVoice || "",
    guardrails: c.guardrails || "",
    handoffKeywords: c.handoffKeywords || [],
    faqs: c.faqs || [],
  });

// Brand-voice presets. Tone is a preference we can't derive from data, but it
// also doesn't deserve a blank textarea — one tap covers almost everyone.
const VOICE_PRESETS = [
  {
    id: "warm",
    label: "Warm",
    text: "warm and welcoming; friendly but never gushing; concise 1-2 lines; at most 1 emoji; mirror the guest's language",
  },
  {
    id: "professional",
    label: "Professional",
    text: "professional and precise; courteous, no emoji; concise 1-2 lines; mirror the guest's language",
  },
  {
    id: "casual",
    label: "Casual",
    text: "relaxed and casual; short conversational lines; light emoji use is fine; mirror the guest's language",
  },
];

export default function IgAiBotPage({ paramKey = "aiTab" } = {}) {
  const { activeWorkspace } = useAuthStore();
  const { workspace, fetchWorkspace } = useWorkspaceStore();

  const [cfg, setCfg] = useState(DEFAULTS);
  // The legacy free-text knowledge blob. No longer editable here — the property
  // record replaced it — but still round-tripped on save so an existing value
  // isn't destroyed.
  const [bizText, setBizText] = useState("");
  const [saving, setSaving] = useState(false);
  const [masterSaving, setMasterSaving] = useState(false);
  const [savedEditable, setSavedEditable] = useState(() => editable(DEFAULTS));
  const [newFaq, setNewFaq] = useState({ question: "", answer: "" });
  const [showTemplates, setShowTemplates] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTabState] = useState(() => {
    const t = searchParams.get(paramKey);
    return TABS.some((x) => x.id === t) ? t : DEFAULT_TAB;
  });

  // ── What the assistant already knows ────────────────────────────
  const properties = usePropertyStore((st) => st.properties);
  const fetchProperties = usePropertyStore((st) => st.fetchProperties);
  const activePropertyId = usePropertyStore((st) => st.activeId)(activeWorkspace);
  const property =
    properties.find((x) => String(x._id) === String(activePropertyId)) ||
    properties[0] ||
    null;
  const [rooms, setRooms] = useState([]);
  const [loadingKnows, setLoadingKnows] = useState(true);

  useEffect(() => {
    if (activeWorkspace) fetchProperties(activeWorkspace);
  }, [activeWorkspace, fetchProperties]);

  useEffect(() => {
    let alive = true;
    if (!property?._id) {
      setRooms([]);
      // Only stop the spinner once the property list itself has settled.
      if (properties.length === 0) setLoadingKnows(false);
      return () => {
        alive = false;
      };
    }
    setLoadingKnows(true);
    api
      .get(`/hotel/properties/${property._id}/rooms`)
      .then(({ data }) => {
        if (alive) setRooms(data.roomTypes || data.rooms || []);
      })
      .catch(() => alive && setRooms([]))
      .finally(() => alive && setLoadingKnows(false));
    return () => {
      alive = false;
    };
  }, [property?._id, properties.length]);

  // Keep the tab and the URL in sync. When embedded in Settings this MUST use a
  // different param than Settings' own ?tab= — otherwise selecting a tab here
  // overwrote it, stopped matching "assistant", and bounced the user back to
  // Property & Rooms.
  const setTab = (id) => {
    setTabState(id);
    const next = new URLSearchParams(searchParams);
    if (id === DEFAULT_TAB) next.delete(paramKey);
    else next.set(paramKey, id);
    setSearchParams(next, { replace: true });
  };
  useEffect(() => {
    const t = searchParams.get(paramKey);
    if (t && TABS.some((x) => x.id === t) && t !== tab) setTabState(t);
    if (!t && tab !== DEFAULT_TAB) setTabState(DEFAULT_TAB);
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const stored = workspace?.aiSettings;
    const seeded =
      stored && Object.keys(stored).length
        ? { ...DEFAULTS, ...stored }
        : DEFAULTS;
    setCfg(seeded);
    setSavedEditable(editable(seeded));
    setBizText(workspace?.aiKnowledge?.content || "");
  }, [workspace?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (patch) => setCfg((c) => ({ ...c, ...patch }));
  const dirty = useMemo(() => editable(cfg) !== savedEditable, [cfg, savedEditable]);

  /* ── Main switch — saves straight away ───────────────────────────── */
  const toggleMaster = async () => {
    if (!activeWorkspace || masterSaving) return;
    const next = !cfg.enabled;
    set({ enabled: next });
    setMasterSaving(true);
    try {
      // Dotted key: flips only this flag, leaving unsaved edits alone.
      await api.put(`/workspaces/${activeWorkspace}`, {
        "aiSettings.enabled": next,
      });
      await api.put(`/workspaces/${activeWorkspace}/ai-knowledge`, {
        content: bizText,
        enabled: next,
      });
      await fetchWorkspace(activeWorkspace);
      toast.success(next ? "AI assistant is on" : "AI assistant paused");
    } catch (e) {
      set({ enabled: !next });
      toast.error(e?.response?.data?.message || "Couldn't update the AI assistant");
    } finally {
      setMasterSaving(false);
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
    toast.success(`Added ${toAdd.length} FAQ${toAdd.length > 1 ? "s" : ""}`);
  };

  /* ── Save ───────────────────────────────────────────────────────── */
  const save = async () => {
    setSaving(true);
    try {
      // PUT /workspaces/:id replaces `aiSettings` wholesale (findByIdAndUpdate
      // with the object as-is), so anything we no longer render must still be
      // sent back untouched or it would be wiped. `cfg` was seeded from the
      // stored settings and we never mutate the retired keys, so spreading it
      // preserves productCatalog, aiRole, goals, ctaLink & friends verbatim.
      await api.put(`/workspaces/${activeWorkspace}`, {
        aiSettings: { ...cfg },
      });
      await api.put(`/workspaces/${activeWorkspace}/ai-knowledge`, {
        content: bizText,
        enabled: cfg.enabled,
      });
      setSavedEditable(editable(cfg));
      await fetchWorkspace(activeWorkspace);
      toast.success("AI assistant saved");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const showSaveBar = EDIT_TABS.includes(tab) || dirty;

  return (
    <div className="relative min-h-full">
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-24 space-y-6">
        {/* ── Page header ────────────────────────────────────────── */}
        <Reveal>
          <div className="group flex items-center gap-3.5">
            <div className="relative shrink-0">
              <div aria-hidden className="absolute inset-0 rounded-2xl bg-sunset opacity-30 blur-xl" />
              <div className="relative w-11 h-11 rounded-2xl bg-sunset text-white grid place-items-center shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]">
                <Bot className="w-5 h-5" strokeWidth={1.8} />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-ink-900">
                  AI{" "}
                  <span className="font-serif italic font-normal">assistant</span>
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 text-[12px] font-medium ${
                    cfg.enabled ? "text-emerald-700" : "text-ink-500"
                  }`}
                >
                  {cfg.enabled ? (
                    <PulseDot color="bg-emerald-500" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-ink-300" />
                  )}
                  {cfg.enabled ? "Live" : "Paused"}
                </span>
              </div>
              <p className="text-sm text-ink-500 mt-1">
                Answers guests inside Airbnb, Booking.com and Expedia, and on
                WhatsApp — in your voice.
              </p>
            </div>
          </div>
        </Reveal>

        {/* ── Section tabs ───────────────────────────────────────── */}
        <div className="sticky top-0 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 bg-[#F7F5F2]/70 backdrop-blur-xl">
          <div className="overflow-x-auto no-scrollbar">
            <SlidingTabs
              size="sm"
              className="whitespace-nowrap"
              value={tab}
              onChange={setTab}
              items={TABS.map((t) => ({
                value: t.id,
                icon: t.icon,
                label: (
                  <span className="inline-flex items-center gap-1.5">
                    {t.label}
                    {t.ready?.(cfg) && (
                      <Check className="w-3 h-3 text-emerald-500" />
                    )}
                  </span>
                ),
              }))}
            />
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >

        {/* ── On / off ───────────────────────────────────────────── */}
        {tab === "status" && (
          <div className="space-y-6">
            <Section
              icon={Power}
              title="AI assistant"
              subtitle="The main switch. Off = every guest message waits in your Inbox for you."
            >
              <div className="flex items-center justify-between gap-4">
                <p className="text-[13px] text-ink-700">
                  {cfg.enabled
                    ? "On — your AI answers guests day and night."
                    : "Paused — nothing is sent automatically."}
                </p>
                <button
                  type="button"
                  role="switch"
                  aria-checked={!!cfg.enabled}
                  aria-label="AI assistant"
                  onClick={toggleMaster}
                  disabled={masterSaving || !activeWorkspace}
                  className={`relative w-14 h-8 rounded-full transition-colors duration-300 shrink-0 disabled:opacity-60 shadow-[inset_0_1px_2px_rgba(15,23,42,0.15)] active:scale-95 ${
                    cfg.enabled ? "bg-emerald-500" : "bg-ink-300"
                  }`}
                >
                  <motion.span
                    layout
                    transition={{ type: "spring", stiffness: 520, damping: 30 }}
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-[0_2px_6px_rgba(15,23,42,0.25),inset_0_1px_0_#fff] ${
                      cfg.enabled ? "right-1" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </Section>

            <Section
              icon={MessageSquare}
              title="Where it replies"
              subtitle="Switch AI replies on or off per channel. Changes save instantly."
            >
              <AiChannelToggles
                workspace={workspace}
                onSave={() => fetchWorkspace(activeWorkspace)}
                onChanged={(field, value) => set({ [field]: value })}
                masterOn={!!cfg.enabled}
              />
            </Section>

            <Link
              to="/dashboard/settings?tab=channels"
              className="group inline-flex items-center gap-1.5 text-xs font-semibold text-sunset-flame hover:text-sunset-magenta transition-colors"
            >
              Reply hours, reply delay and holiday mode are under Channels
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-500 ease-spring group-hover:translate-x-0.5" />
            </Link>
          </div>
        )}

        {/* ── What it knows tab ──────────────────────────────────── */}
        {tab === "knows" && (
        <div className="space-y-6">
          <Section
            icon={BookOpen}
            title="What your assistant knows"
            subtitle="Read live from your property record — typed in Property & Rooms or synced from Airbnb, Booking.com and Expedia. Nothing to repeat here."
          >
            {loadingKnows ? (
              <div className="space-y-4 py-2">
                <span className="sr-only">Reading your property…</span>
                {[0, 1, 2].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-3 w-32 rounded-md bg-ink-900/[0.06] animate-pulse" />
                    <div className="h-3 w-full max-w-md rounded-md bg-ink-900/[0.06] animate-pulse" />
                    <div className="h-3 w-2/3 max-w-sm rounded-md bg-ink-900/[0.06] animate-pulse" />
                  </div>
                ))}
              </div>
            ) : !property ? (
              <div className="py-8 text-center">
                <div className="relative mx-auto w-12 h-12">
                  <div aria-hidden className="absolute inset-0 rounded-2xl bg-sunset opacity-20 blur-2xl" />
                  <div className="relative w-12 h-12 rounded-2xl bg-sunset-soft text-sunset-flame grid place-items-center">
                    <Hotel className="w-6 h-6" strokeWidth={1.8} />
                  </div>
                </div>
                <p className="font-display text-base font-semibold text-ink-900 mt-3">
                  No property yet
                </p>
                <p className="text-sm text-ink-500 mt-1 max-w-sm mx-auto">
                  Add your property and rooms once — your assistant picks it all
                  up automatically from there.
                </p>
                <a
                  href="/dashboard/settings?tab=property"
                  className="btn-primary inline-flex items-center gap-1.5 mt-4"
                >
                  Add your property <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Identity + location */}
                <KnowsCard icon={Hotel} title="Property">
                  <KnowsRow label="Name" value={property.name} />
                  <KnowsRow
                    label="Type"
                    value={
                      property.propertyType
                        ? property.propertyType.charAt(0).toUpperCase() +
                          property.propertyType.slice(1)
                        : null
                    }
                  />
                  <KnowsRow
                    label="Location"
                    value={
                      [property.address, property.city, property.country]
                        .filter(Boolean)
                        .join(", ") || null
                    }
                  />
                  <KnowsRow label="Timezone" value={property.timezone} />
                  {property.amenities?.length > 0 && (
                    <div className="pt-1">
                      <p className="text-[11px] font-semibold text-ink-400 mb-1.5">
                        Amenities
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {(property.amenities || []).map((a) => (
                          <span
                            key={a}
                            className="text-[11px] font-normal px-2 py-0.5 rounded-lg bg-white/70 ring-1 ring-ink-900/[0.06] text-ink-600"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </KnowsCard>

                {/* Check-in / check-out */}
                <KnowsCard icon={Clock} title="Check-in & check-out">
                  <KnowsRow label="Check-in from" value={property.checkInTime} />
                  <KnowsRow label="Check-out by" value={property.checkOutTime} />
                  <KnowsRow
                    label="Quiet hours"
                    value={property.rules?.quietHours}
                  />
                </KnowsCard>

                {/* Rooms + rates */}
                <KnowsCard
                  icon={BedDouble}
                  title={`Room types (${rooms.length})`}
                >
                  {rooms.length === 0 ? (
                    <p className="text-xs text-ink-400">
                      No room types yet — add them in Property &amp; Rooms and
                      your assistant can quote them instantly.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {rooms.map((r) => (
                        <div
                          key={r._id}
                          className="flex items-start justify-between gap-3 rounded-xl bg-white/60 ring-1 ring-ink-900/[0.06] px-3 py-2 transition-colors hover:bg-white/90"
                        >
                          <div className="min-w-0">
                            <p className="text-[13px] font-medium text-ink-900 truncate">
                              {r.name}
                            </p>
                            <p className="text-[11px] text-ink-500">
                              {[
                                r.maxOccupancy
                                  ? `Sleeps ${r.maxOccupancy}`
                                  : null,
                                r.bedConfig || null,
                                r.breakfast?.included
                                  ? "Breakfast included"
                                  : null,
                                r.cancellation?.policy === "non_refundable"
                                  ? "Non-refundable"
                                  : r.cancellation?.policy === "flexible"
                                    ? "Flexible cancellation"
                                    : r.cancellation?.freeUntilDays
                                      ? `Free cancellation until ${r.cancellation.freeUntilDays}d before`
                                      : null,
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          </div>
                          {r.baseRate > 0 && (
                            <span className="text-[13px] font-semibold text-ink-900 shrink-0 tabular-nums">
                              {r.currency || property.currency} {r.baseRate}
                              <span className="text-[10px] font-medium text-ink-400">
                                /night
                              </span>
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </KnowsCard>

                {/* Payment */}
                <KnowsCard icon={Wallet} title="How guests can pay">
                  {(() => {
                    const pm = property.paymentMethods || {};
                    const labels = {
                      cash: "Cash",
                      card: "Card",
                      bankTransfer: "Bank transfer",
                      qris: "QRIS",
                      eWallet: "E-wallet",
                      payAtProperty: "Pay at property",
                    };
                    const on = Object.keys(labels).filter((k) => pm[k]);
                    return on.length === 0 ? (
                      <p className="text-xs text-ink-400">
                        Not set yet — add it in Property &amp; Rooms.
                      </p>
                    ) : (
                      <>
                        <div className="flex flex-wrap gap-1.5">
                          {on.map((k) => (
                            <span
                              key={k}
                              className="badge-green text-[11px] font-normal"
                            >
                              {labels[k]}
                            </span>
                          ))}
                        </div>
                        {pm.depositRequired && (
                          <p className="text-[11px] text-ink-500 mt-2">
                            Deposit required
                            {pm.depositPercent ? ` — ${pm.depositPercent}%` : ""}
                          </p>
                        )}
                      </>
                    );
                  })()}
                </KnowsCard>

                {/* House rules */}
                <KnowsCard icon={ScrollText} title="House rules">
                  {(() => {
                    const r = property.rules || {};
                    const bits = [
                      r.childrenWelcome ? "Children welcome" : "No children",
                      r.petsAllowed
                        ? `Pets allowed${r.petFee ? ` (fee ${r.petFee})` : ""}`
                        : "No pets",
                      r.smokingAllowed ? "Smoking allowed" : "No smoking",
                      r.partiesAllowed ? "Parties allowed" : "No parties",
                      r.cotsAvailable ? "Cots available" : null,
                      r.minAge ? `Minimum check-in age ${r.minAge}` : null,
                    ].filter(Boolean);
                    return (
                      <>
                        <div className="flex flex-wrap gap-1.5">
                          {bits.map((b) => (
                            <span
                              key={b}
                              className="badge-gray text-[11px] font-medium"
                            >
                              {b}
                            </span>
                          ))}
                        </div>
                        {property.policies && (
                          <p className="text-xs text-ink-600 mt-2.5 leading-relaxed whitespace-pre-line">
                            {property.policies}
                          </p>
                        )}
                      </>
                    );
                  })()}
                </KnowsCard>

                <a
                  href="/dashboard/settings?tab=property"
                  className="group inline-flex items-center gap-1.5 text-xs font-semibold text-sunset-flame hover:text-sunset-magenta transition-colors"
                >
                  Edit in Property &amp; Rooms
                  <ExternalLink className="w-3.5 h-3.5 transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </div>
            )}
          </Section>
        </div>
        )}

        {/* ── Tone & rules tab ───────────────────────────────────── */}
        {tab === "voice" && (
        <div className="space-y-6">
          <Section
            icon={Bot}
            title="Tone of voice"
            subtitle="How your assistant sounds to guests. Pick a preset or write your own."
          >
            <div className="flex flex-wrap gap-2">
              {VOICE_PRESETS.map((v) => {
                const on = cfg.brandVoice === v.text;
                return (
                  <button
                    key={v.id}
                    onClick={() => set({ brandVoice: on ? "" : v.text })}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-medium ring-1 transition-all duration-300 ease-spring hover:-translate-y-0.5 active:scale-[0.96] ${
                      on
                        ? "bg-sunset-soft ring-sunset-flame/40 text-ink-900 shadow-[0_8px_20px_-12px_rgba(255,106,43,0.6)]"
                        : "bg-white/70 ring-ink-900/[0.08] text-ink-600 hover:bg-white hover:ring-sunset-flame/30"
                    }`}
                  >
                    {on && <Check className="w-3.5 h-3.5 text-sunset-flame" />}
                    {v.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-4">
              <PersonaField
                label="Anything else about the voice (optional)"
                hint="Only if a preset isn't quite right."
                value={cfg.brandVoice || ""}
                onChange={(v) => set({ brandVoice: v })}
                rows={2}
                placeholder="warm and professional; concise 1-2 lines; at most 1 emoji; mirror the guest's language"
              />
            </div>
          </Section>

          <Section
            icon={ShieldCheck}
            title="What it must never do"
            subtitle="Your assistant never invents rates or policies. Add any limits specific to your hotel."
          >
            <PersonaField
              label="Guardrails"
              hint="Things the assistant must NEVER do."
              value={cfg.guardrails || ""}
              onChange={(v) => set({ guardrails: v })}
              rows={3}
              danger
              placeholder="never promise refunds or upgrades; never share another guest's details; hand complaints to the front desk"
            />
          </Section>
        </div>
        )}

        {/* ── FAQs tab ───────────────────────────────────────────── */}
        {tab === "faqs" && (
        <Section
          icon={HelpCircle}
          title="Exact-answer FAQs"
          subtitle="Questions that need a precise reply — parking, early check-in, airport pick-up. Your assistant answers these word-for-word."
        >
          {/* Browse the template library */}
          <button
            onClick={() => setShowTemplates(true)}
            className="card-hover w-full mb-3 p-3 flex items-center gap-3 text-left group/tpl active:scale-[0.99]"
          >
            <span className="w-9 h-9 rounded-xl bg-sunset-soft text-sunset-flame grid place-items-center shrink-0 transition-transform duration-500 ease-spring group-hover/tpl:-translate-y-0.5 group-hover/tpl:rotate-[-8deg]">
              <Sparkles className="w-4 h-4" strokeWidth={1.8} />
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-semibold text-ink-900">
                Browse {FAQ_TEMPLATE_COUNT}+ ready-made FAQs
              </span>
              <span className="block text-xs text-ink-500">
                Pick from ready-made hotel questions — toggle on, then edit to
                fit your property.
              </span>
            </span>
            <Plus className="w-4 h-4 text-sunset-flame ml-auto shrink-0 transition-transform duration-500 ease-spring group-hover/tpl:scale-125 group-hover/tpl:rotate-90" />
          </button>

          {(cfg.faqs?.length || 0) > 0 && (
            <div className="space-y-2 mb-3">
              <AnimatePresence initial={false}>
              {(cfg.faqs || []).map((f, i) => (
                <motion.div
                  key={i}
                  layout
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  className="rounded-xl bg-white/60 ring-1 ring-ink-900/[0.06] p-3 transition-colors hover:bg-white/90"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[13px] font-semibold text-ink-900">
                      {f.question}
                    </p>
                    <button
                      onClick={() => removeFaq(i)}
                      className="group/del -m-1.5 p-1.5 rounded-lg text-ink-300 hover:text-rose-600 hover:bg-rose-50 active:scale-90 transition-all duration-300 ease-spring shrink-0"
                    >
                      <Trash2 className="w-4 h-4 transition-transform duration-500 ease-spring group-hover/del:rotate-[-12deg]" />
                    </button>
                  </div>
                  <p className="text-[13px] text-ink-500 mt-1 leading-relaxed">{f.answer}</p>
                </motion.div>
              ))}
              </AnimatePresence>
            </div>
          )}

          <div className="rounded-2xl border border-dashed border-ink-900/[0.12] bg-white/40 p-3 space-y-2.5">
            <input
              className="input w-full"
              value={newFaq.question}
              onChange={(e) =>
                setNewFaq((v) => ({ ...v, question: e.target.value }))
              }
              placeholder="Question — e.g. Is parking free?"
            />
            <textarea
              className="textarea w-full min-h-[60px]"
              value={newFaq.answer}
              onChange={(e) =>
                setNewFaq((v) => ({ ...v, answer: e.target.value }))
              }
              placeholder="Answer — e.g. Yes, free private parking for all guests."
            />
            <button
              onClick={addFaq}
              className="btn-secondary group/add inline-flex items-center gap-1.5 text-sm"
            >
              <Plus className="w-4 h-4 transition-transform duration-500 ease-spring group-hover/add:rotate-90" /> Add FAQ
            </button>
          </div>
        </Section>
        )}

        {/* ── Handoff tab ────────────────────────────────────────── */}
        {tab === "handoff" && (
        <Section
          icon={UserCog}
          title="When to fetch a human"
          subtitle="If a guest's message contains any of these words, your assistant stops and flags the conversation for your front desk."
        >
          <div className="flex flex-wrap gap-1.5 mb-3">
            <AnimatePresence initial={false}>
            {(cfg.handoffKeywords || []).map((k, i) => (
              <motion.span
                key={`${k}-${i}`}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 500, damping: 28 }}
                className="inline-flex items-center gap-1.5 text-[13px] font-normal pl-2.5 pr-1.5 py-1 rounded-xl bg-white/80 ring-1 ring-ink-900/[0.07] text-ink-700 shadow-[inset_0_1px_0_#fff]"
              >
                {k}
                <button
                  onClick={() =>
                    set({
                      handoffKeywords: (cfg.handoffKeywords || []).filter(
                        (_, x) => x !== i,
                      ),
                    })
                  }
                  className="p-0.5 rounded-md text-ink-400 hover:text-rose-600 hover:bg-rose-50 hover:rotate-90 active:scale-90 transition-all duration-300 ease-spring"
                  aria-label={`Remove ${k}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.span>
            ))}
            </AnimatePresence>
            {(cfg.handoffKeywords || []).length === 0 && (
              <p className="text-xs text-ink-400">
                No keywords — your assistant will handle every message itself.
              </p>
            )}
          </div>
          <input
            type="text"
            placeholder="Type a word and press Enter (e.g. manager, complaint, refund)"
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              e.preventDefault();
              const v = e.target.value.trim().toLowerCase();
              if (!v) return;
              if ((cfg.handoffKeywords || []).includes(v)) {
                e.target.value = "";
                return;
              }
              set({ handoffKeywords: [...(cfg.handoffKeywords || []), v] });
              e.target.value = "";
            }}
            className="input w-full"
          />
          <p className="text-[11px] text-ink-400 mt-1.5">
            Press Enter to add. Matching is case-insensitive.
          </p>
        </Section>
        )}

        {/* ── Test bot tab ───────────────────────────────────────── */}
        {tab === "test" && (
          <div className="space-y-6">
            <Playground workspaceId={activeWorkspace} enabled={cfg.enabled} />
            <p className="text-xs text-ink-500 leading-relaxed px-1">
              Replies check your FAQs first, then your live property and room
              data. Your assistant never makes up prices or policies.
            </p>
          </div>
        )}
        </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Sticky save bar (stays inside the content column) ──── */}
      {showSaveBar && (
      <div className="sticky bottom-0 z-20 border-t border-white/70 bg-white/60 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_-1px_0_rgba(15,23,42,0.05),0_-12px_30px_-20px_rgba(15,23,42,0.18)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          <p className="text-xs text-ink-500 hidden sm:flex items-center gap-2">
            {dirty ? (
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            ) : (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            )}
            {dirty
              ? "You have unsaved changes."
              : "Tone, rules, handoff words and FAQs are saved."}
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
      )}

      <AnimatePresence>
        {showTemplates && (
          <TemplatesModal
            key="faq-templates"
            isOn={isTemplateOn}
            onToggle={toggleTemplate}
            onAddCategory={addWholeCategory}
            onClose={() => setShowTemplates(false)}
          />
        )}
      </AnimatePresence>
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
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-night-950/40 backdrop-blur-md"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        {...pop}
        className="glass-strong w-full max-w-4xl max-h-[88vh] rounded-3xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-4 border-b border-ink-900/[0.06]">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-9 h-9 rounded-xl bg-sunset text-white grid place-items-center shrink-0">
              <Sparkles className="w-4 h-4" strokeWidth={1.8} />
            </span>
            <div className="min-w-0">
              <h3 className="font-display font-semibold tracking-[-0.02em] text-ink-900 leading-snug">
                FAQ template library
              </h3>
              <p className="text-xs text-ink-500">
                Toggle any on — it's copied to your FAQs where you can edit it.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-ink-900/[0.05] grid place-items-center text-ink-400 hover:text-ink-700 hover:rotate-90 active:scale-90 transition-all duration-300 ease-spring shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* category rail */}
          <div className="w-32 sm:w-52 shrink-0 border-r border-ink-900/[0.06] overflow-y-auto p-1.5 sm:p-2 bg-white/30 space-y-0.5">
            {TEMPLATES_BY_CATEGORY.map((c) => (
              <button
                key={c.key}
                onClick={() => setActiveCat(c.key)}
                className={`relative isolate w-full text-left px-2.5 sm:px-3 py-2 rounded-xl text-[13px] sm:text-sm flex items-center gap-2 transition-colors ${
                  c.key === activeCat
                    ? "text-ink-900 font-semibold"
                    : "text-ink-600 hover:bg-white/70"
                }`}
              >
                {c.key === activeCat && (
                  <motion.span
                    layoutId="faq-cat-pill"
                    className="absolute inset-0 -z-10 rounded-xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.08),0_4px_12px_-4px_rgba(15,23,42,0.12),inset_0_1px_0_#fff] ring-1 ring-sunset-flame/20"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  />
                )}
                <span>{c.emoji}</span>
                <span className="truncate">{c.label}</span>
                <span className="ml-auto text-[10px] text-ink-400 tabular-nums">
                  {c.items.length}
                </span>
              </button>
            ))}
          </div>

          {/* template list */}
          <div className="flex-1 min-w-0 overflow-y-auto p-3 sm:p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <p className="text-sm font-semibold text-ink-800 min-w-0 truncate">
                {cat.emoji} {cat.label}
              </p>
              <button
                onClick={() => onAddCategory(cat.items)}
                className="btn-secondary shrink-0 text-xs px-2.5 py-1.5"
              >
                Add all
              </button>
            </div>
            <motion.div
              key={cat.key}
              className="space-y-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {cat.items.map((tpl, i) => {
                const on = isOn(tpl);
                return (
                  <button
                    key={i}
                    onClick={() => onToggle(tpl)}
                    className={`w-full text-left rounded-xl ring-1 p-3 flex items-start gap-3 transition-all duration-300 ease-spring hover:-translate-y-0.5 active:scale-[0.99] ${
                      on
                        ? "ring-sunset-flame/35 bg-sunset-soft shadow-[0_10px_24px_-16px_rgba(255,106,43,0.6)]"
                        : "ring-ink-900/[0.07] bg-white/70 hover:bg-white hover:ring-ink-900/[0.12]"
                    }`}
                  >
                    <span
                      className={`mt-0.5 w-5 h-5 rounded-md grid place-items-center shrink-0 transition-all duration-300 ease-spring ${
                        on
                          ? "bg-sunset text-white scale-100"
                          : "ring-1 ring-inset ring-ink-300 text-transparent scale-95"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[13px] font-semibold text-ink-900">
                        {tpl.question}
                      </span>
                      <span className="block text-xs text-ink-500 mt-0.5">
                        {tpl.answer}
                      </span>
                    </span>
                  </button>
                );
              })}
            </motion.div>
          </div>
        </div>

        {/* footer */}
        <div className="px-4 sm:px-5 py-3 border-t border-ink-900/[0.06] flex items-center justify-between gap-3">
          <p className="text-xs text-ink-500">
            Remember to <b>Save changes</b> after you've picked your FAQs.
          </p>
          <button onClick={onClose} className="btn-primary shrink-0 px-4 py-2 text-sm">
            Done
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * One group in the read-only "what it knows" spec sheet.
 *
 * Deliberately not a card: a hairline rule and a quiet label read as a
 * reference sheet, which is what this is — nothing here is editable.
 */
function KnowsCard({ icon: Icon, title, children }) {
  return (
    <section className="border-t border-ink-900/[0.06] pt-4 first:border-t-0 first:pt-0">
      <div className="flex items-center gap-2 mb-2.5">
        <Icon className="w-3.5 h-3.5 text-sunset-flame shrink-0" strokeWidth={1.8} />
        <h4 className="text-[11px] uppercase tracking-wider font-semibold text-ink-400">
          {title}
        </h4>
      </div>
      <dl className="space-y-1.5">{children}</dl>
    </section>
  );
}

/**
 * A label/value line in the spec sheet — a two-column definition row on
 * anything wider than a phone, stacked below that. Renders nothing when we
 * don't hold the value.
 */
function KnowsRow({ label, value }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="sm:grid sm:grid-cols-[10rem_1fr] sm:gap-4 sm:items-baseline">
      <dt className="text-[12px] text-ink-400 sm:text-right">{label}</dt>
      <dd className="text-[13px] text-ink-800 min-w-0 truncate">{value}</dd>
    </div>
  );
}

/** Labelled textarea used by the tone and guardrail fields. */
function PersonaField({ label, hint, value, onChange, rows = 2, placeholder, danger }) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-1">
        <label className="text-[13px] font-semibold text-ink-800">{label}</label>
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
        className={`textarea w-full leading-relaxed ${
          danger ? "!border-rose-200 focus:!border-rose-400" : ""
        }`}
      />
    </div>
  );
}

/* Playground — try the real bot in a sandbox chat. No message is sent. (Phase 2) */
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
          intent: data?.intent,
          tags: data?.tags,
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
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-ink-900/[0.06]">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-9 h-9 rounded-xl bg-sunset text-white grid place-items-center shrink-0">
            <MessageSquare className="w-4 h-4" strokeWidth={1.8} />
          </span>
          <div className="min-w-0">
            <h2 className="font-display font-semibold tracking-[-0.02em] text-ink-900 text-[15px] leading-snug">
              Try your assistant
            </h2>
            <p className="text-xs text-ink-500 mt-0.5">
              Ask it what a guest would. Nothing is sent to real guests.
            </p>
          </div>
        </div>
        {msgs.length > 0 && (
          <button
            onClick={() => setMsgs([])}
            className="btn-ghost shrink-0 text-xs px-2.5 py-1.5"
          >
            Clear
          </button>
        )}
      </div>

      {/* chat window */}
      <div
        ref={scrollRef}
        className="h-72 overflow-y-auto px-3 sm:px-4 py-4 bg-ink-900/[0.02] space-y-2.5"
      >
        {msgs.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-6">
            <div className="relative mb-3">
              <div aria-hidden className="absolute inset-0 rounded-2xl bg-sunset opacity-20 blur-2xl" />
              <div className="relative w-12 h-12 rounded-2xl bg-white ring-1 ring-ink-900/[0.06] shadow-[inset_0_1px_0_#fff] grid place-items-center">
                <Bot className="w-6 h-6 text-sunset-flame" strokeWidth={1.8} />
              </div>
            </div>
            <p className="font-display text-sm font-semibold text-ink-800">
              Ask a guest question
            </p>
            <p className="text-xs text-ink-400 mt-1 max-w-xs">
              Try "Do you have a double room for 2 nights from Friday?" or
              "What time is check-in?" to see how it replies.
            </p>
          </div>
        )}
        {msgs.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            style={{ originX: m.role === "user" ? 1 : 0 }}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-sunset text-white rounded-br-md shadow-[0_8px_20px_-12px_rgba(255,61,119,0.6)]"
                  : m.error
                    ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200 rounded-bl-md"
                    : "bg-white/90 text-ink-800 ring-1 ring-ink-900/[0.06] shadow-[inset_0_1px_0_#fff] rounded-bl-md"
              }`}
            >
              {m.escalate && (
                <span className="block text-[10px] font-bold uppercase tracking-wide text-amber-600 mb-0.5">
                  ⚡ Would hand off to a human
                </span>
              )}
              {m.content}
            </div>
          </motion.div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-white/90 ring-1 ring-ink-900/[0.06] rounded-2xl rounded-bl-md px-4 py-3">
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
      <div className="p-3 border-t border-ink-900/[0.06] flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a test message…"
          className="input flex-1 min-w-0"
        />
        <button
          onClick={send}
          disabled={sending || !input.trim()}
          className="group w-10 h-10 rounded-xl bg-sunset text-white grid place-items-center shadow-[0_8px_20px_-10px_rgba(255,61,119,0.7)] hover:-translate-y-0.5 active:scale-90 disabled:opacity-40 disabled:hover:translate-y-0 transition-all duration-300 ease-spring shrink-0"
          aria-label="Send"
        >
          <Send className="w-4 h-4 transition-transform duration-500 ease-spring group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      </div>
      {!enabled && (
        <p className="px-4 pb-3 text-[11px] text-amber-600">
          Your assistant is paused — testing still works here, but it won't
          reply to real guests until you switch it on under On / off.
        </p>
      )}
    </div>
  );
}

function Section({ title, subtitle, icon: Icon, children }) {
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-start gap-3 mb-4">
        <span className="w-10 h-10 rounded-xl bg-sunset-soft text-sunset-flame grid place-items-center shrink-0">
          <Icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
        </span>
        <div className="min-w-0">
          <h2 className="font-display font-semibold tracking-[-0.02em] text-ink-900 text-[15px] leading-snug">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-ink-500 mt-1 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
