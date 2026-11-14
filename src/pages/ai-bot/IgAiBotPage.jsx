/**
 * AI Assistant — your concierge's brain.
 *
 * The hotelier already told us everything about the property: rooms, rates,
 * policies, amenities — either by hand in Property & Rooms or synced from the
 * OTAs they connected. So this screen does NOT ask for it again. It SHOWS what
 * the assistant already knows (read-only, sourced from
 * GET /hotel/properties and /hotel/properties/:id/rooms) and only asks for the
 * handful of things that genuinely cannot be derived from that data:
 *
 *   🗣  tone / brand voice        — a preference, not a fact
 *   🚫  guardrails                — what it must never do
 *   ❓  custom FAQs               — answers not implied by the property data
 *   🙋  handoff keywords          — when to fetch a human
 *
 * Removed on purpose: product catalog, free-text "business context", the
 * legacy persona fields and the knowledge-source uploader — every one
 * of those is either answered by the property/room record or belongs to the
 * old chatbot product. Their stored values are preserved verbatim on save so
 * nothing is destroyed server-side (workspace.aiSettings is replaced wholesale
 * by PUT /workspaces/:id, so we must send the untouched keys back).
 */
import { useEffect, useRef, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
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

// Tabs. "Knows" leads deliberately: the first thing a hotelier should see is
// that Botlify already has their property, not another empty form.
const TABS = [
  { id: "knows", label: "What it knows", icon: BookOpen },
  {
    id: "voice",
    label: "Tone & rules",
    icon: Bot,
    ready: (cfg) => !!(cfg.brandVoice || cfg.guardrails),
  },
  {
    id: "faqs",
    label: "Custom FAQs",
    icon: HelpCircle,
    ready: (cfg) => (cfg.faqs?.length || 0) > 0,
  },
  { id: "handoff", label: "Handoff", icon: UserCog },
  { id: "test", label: "Test bot", icon: MessageSquare },
];

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
  const [newFaq, setNewFaq] = useState({ question: "", answer: "" });
  const [showTemplates, setShowTemplates] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTabState] = useState(() => {
    const t = searchParams.get(paramKey);
    return TABS.some((x) => x.id === t) ? t : "knows";
  });

  // ── What the assistant already knows ────────────────────────────
  // Sourced from the hotel record the user already filled in / imported from
  // their OTAs. Read-only here by design.
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
    if (id === "knows") next.delete(paramKey);
    else next.set(paramKey, id);
    setSearchParams(next, { replace: true });
  };
  useEffect(() => {
    const t = searchParams.get(paramKey);
    if (t && TABS.some((x) => x.id === t) && t !== tab) setTabState(t);
    if (!t && tab !== "knows") setTabState("knows");
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const stored = workspace?.aiSettings;
    setCfg(
      stored && Object.keys(stored).length
        ? { ...DEFAULTS, ...stored }
        : DEFAULTS,
    );
    setBizText(workspace?.aiKnowledge?.content || "");
  }, [workspace?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (patch) => setCfg((c) => ({ ...c, ...patch }));

  // How "ready" is the bot? Drives the readiness meter.
  // Readiness is now mostly earned by data we already hold: a property with
  // rooms IS a ready assistant. Tone and guardrails are the only manual lifts.
  const readiness = useMemo(() => {
    let score = 0;
    if (property) score += 40;
    if (rooms.length > 0) score += 30;
    if (cfg.brandVoice) score += 15;
    if (cfg.guardrails) score += 15;
    return Math.min(100, score);
  }, [property, rooms.length, cfg.brandVoice, cfg.guardrails]);

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
      await fetchWorkspace(activeWorkspace);
      toast.success("AI bot saved ✓");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-full">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-24 space-y-6">
        {/* ── Page header ────────────────────────────────────────── */}
        <Reveal>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-4">
            <div className="group flex items-center gap-3.5 flex-1 min-w-0">
              <div className="relative shrink-0">
                <div aria-hidden className="absolute inset-0 rounded-2xl bg-sunset opacity-30 blur-xl" />
                <div className="relative w-11 h-11 rounded-2xl bg-sunset text-white grid place-items-center shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]">
                  <Bot className="w-5 h-5" strokeWidth={1.8} />
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-ink-900">
                    AI{" "}
                    <span className="font-serif italic font-normal">Assistant</span>
                  </h1>
                  <span className="badge-brand inline-flex items-center gap-1 text-[10px] uppercase tracking-wider">
                    <Sparkles className="w-2.5 h-2.5" /> AI
                  </span>
                  <AiBotHelp />
                </div>
                <p className="text-sm text-ink-500 mt-1">
                  Knows your property, rooms and policies. Answers guests 24/7 — in
                  your voice.
                </p>
              </div>
            </div>

            {/* Readiness + master toggle — compact glass chip */}
            <div className="card shrink-0 flex items-center gap-4 ml-auto px-3.5 py-2.5">
              <div className="hidden sm:flex items-center gap-2">
                <div className="h-1.5 w-24 rounded-full bg-ink-900/[0.07] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-sunset"
                    initial={false}
                    animate={{ width: `${readiness}%` }}
                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                  />
                </div>
                <span className="text-[12px] font-semibold text-ink-700 tabular-nums">
                  {readiness}%
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => set({ enabled: !cfg.enabled })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 active:scale-95 ${
                    cfg.enabled ? "bg-emerald-500" : "bg-ink-900/15"
                  }`}
                  aria-label="Toggle AI assistant"
                >
                  <span
                    className={`inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-sm transition-transform duration-500 ease-spring ${
                      cfg.enabled ? "translate-x-[1.375rem]" : "translate-x-1"
                    }`}
                  />
                </button>
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
            </div>
          </div>
        </Reveal>

        {/* ── Tab bar (no endless scroll — jump to any section) ───── */}
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

        {/* ── What it knows tab ──────────────────────────────────── */}
        {tab === "knows" && (
        <div className="space-y-6">
          <Section
            icon={BookOpen}
            title="What your assistant knows"
            subtitle="Everything below is already in your property record — typed in Property & Rooms or synced from the OTAs you connected. Your assistant reads it live, so you never have to repeat it here."
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
            subtitle="The one thing we can't read off your property record — how you want your assistant to sound."
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
            subtitle="Hard limits. Your assistant already refuses to invent rates or policies — add anything specific to your hotel."
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
          subtitle="For questions that need a precise reply (check-in time, parking, breakfast, cancellation policy) — your assistant answers these word-for-word."
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
              placeholder="Question — e.g. Do you offer cash on delivery?"
            />
            <textarea
              className="textarea w-full min-h-[60px]"
              value={newFaq.answer}
              onChange={(e) =>
                setNewFaq((v) => ({ ...v, answer: e.target.value }))
              }
              placeholder="Answer — e.g. Yes! COD is available across Pakistan 🚚"
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
          subtitle="If a guest's message contains any of these words, your assistant stops replying and flags the conversation for your team."
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
            <div className="card p-4 flex items-start gap-3">
              <span className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 grid place-items-center shrink-0">
                <ShieldCheck className="w-4 h-4" strokeWidth={1.8} />
              </span>
              <div className="text-[13px] text-ink-500 leading-relaxed">
                <span className="font-semibold text-ink-900">How replies work: </span>
                the bot first checks your custom FAQs for an exact match, then
                your live property and room data — rates, availability,
                policies. It never makes up prices or policies you haven't
                given it.
                <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-400">
                  <Sparkles className="w-3.5 h-3.5 text-sunset-flame" />
                  Powered by Google Gemini
                </div>
              </div>
            </div>
          </div>
        )}
        </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Sticky save bar (stays inside the content column) ──── */}
      <div className="sticky bottom-0 z-20 border-t border-white/70 bg-white/60 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_-1px_0_rgba(15,23,42,0.05),0_-12px_30px_-20px_rgba(15,23,42,0.18)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          <p className="text-xs text-ink-500 hidden sm:flex items-center gap-2">
            {cfg.enabled ? (
              <PulseDot color="bg-emerald-500" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-ink-300" />
            )}
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

// Full-screen "AI is working" overlay — blurs the page so the user knows
// something is cooking while a document/import/draft is processing.
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
              Test your bot
            </h2>
            <p className="text-xs text-ink-500 mt-0.5">
              A safe sandbox — try messages before going live. No real guest message is
              sent.
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
              Say hi to your bot 👋
            </p>
            <p className="text-xs text-ink-400 mt-1 max-w-xs">
              Try "Do you ship to Lahore?" or "How much is your serum?" to see
              how it replies with your current setup.
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
          Note: the bot is currently paused — testing still works here, but it
          won't reply to real guests until you turn it on and save.
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
    "Your AI assistant replies when no rule matches an incoming guest message.",
    "Add your website and FAQs under Knowledge so answers match your hotel.",
    "It answers guests on WhatsApp 24/7 — in the tone you set.",
    "WhatsApp only allows free replies within 24 hours of a guest's last message.",
    "Watch the readiness meter, then Save before turning the assistant Live.",
  ];

  return (
    <div className="relative inline-flex" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="group/help inline-flex items-center gap-1 rounded-lg bg-white/70 ring-1 ring-ink-900/[0.07] shadow-[inset_0_1px_0_#fff] px-2 py-0.5 text-[11px] font-semibold text-ink-600 hover:bg-white hover:text-ink-900 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 ease-spring"
        aria-label="Help"
        aria-expanded={open}
      >
        <HelpCircle className="w-3.5 h-3.5 transition-transform duration-500 ease-spring group-hover/help:rotate-[-12deg]" /> Help
      </button>
      <AnimatePresence>
      {open && (
        <motion.div
          {...pop}
          style={{ originX: 0, originY: 0 }}
          className="glass-strong absolute left-0 top-full z-50 mt-2 w-[min(18rem,calc(100vw-2rem))] sm:w-80 rounded-2xl p-4 text-left"
        >
          <p className="text-[13px] font-semibold text-ink-900 mb-2">AI Assistant</p>
          <ul className="space-y-2">
            {tips.map((t, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-[13px] text-ink-600 leading-snug"
              >
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-sunset shrink-0" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
