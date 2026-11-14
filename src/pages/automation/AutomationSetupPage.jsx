import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import TimezonePicker from "@/components/TimezonePicker";
import toast from "react-hot-toast";
import {
  Loader2,
  Zap,
  Save,
  Plus,
  Trash2,
  MessageCircle,
  Clock,
  CircleDot,
  AlertTriangle,
  LifeBuoy,
} from "lucide-react";
import PlanGate from "@/components/PlanGate";
import StatHero from "@/components/ui/StatHero";
import HolidayModeCard from "@/components/HolidayModeCard";
import AutomationsHubGallery from "./AutomationsHubGallery";
import { clsx } from "clsx";
import { ArrowLeft } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { SlidingTabs } from "@/components/fx";

// Quick automations for guest messages (welcome, keywords, fallback, hours,
// holiday). They apply to every guest message the engine handles.
const ALL_TABS = [
  {
    id: "welcome",
    label: "Welcome message",
    desc: "Send an instant reply when someone messages you for the first time.",
    category: "popular",
    icon: MessageCircle,
    plan: "ig_starter",
  },
  {
    id: "dm_kw",
    label: "Keyword replies",
    desc: "Reply automatically when a guest sends a specific word or phrase.",
    category: "popular",
    icon: MessageCircle,
    plan: "ig_starter",
  },
  {
    id: "fallback",
    label: "Default reply",
    desc: "A professional catch-all when no other automation matches.",
    category: "settings",
    icon: CircleDot,
    plan: "ig_starter",
  },
  {
    id: "hours",
    label: "Business hours",
    desc: "Different replies during and outside your working hours.",
    category: "settings",
    icon: Clock,
    plan: "ig_pro",
  },
  {
    id: "holiday",
    label: "Holiday / away mode",
    desc: "One switch — pause everything and reply 'a manager will get back to you'.",
    category: "settings",
    icon: LifeBuoy,
    plan: "ig_starter",
  },
];

// Strong, ready-to-use example copy for each automation. Users can one-click
// insert these instead of staring at a blank box. {name}/{first_name} are
// personalized at send time; the backend also falls back to sensible defaults
// if a field is left blank, so an enabled automation never sends nothing.
const EXAMPLES = {
  welcome:
    "Hey {first_name}! 👋 Thanks so much for reaching out. How can we help you today?",
  dmReply:
    "Great question, {first_name}! Here's everything you need to know 👇",
  fallback:
    "Thanks for your message, {first_name}! 🙏 A team member will get back to you shortly. Meanwhile, is there something specific we can help with?",
  away:
    "Thanks for reaching out! We're away right now but we've got your message and will reply as soon as we're back. 🙌",
};

// Small helper: shows an example line with a one-click "Use this" button.
function ExampleRow({ text, onUse }) {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-sunset-soft ring-1 ring-sunset-flame/15 px-3 py-2 mt-1.5">
      <p className="text-xs text-ink-600 leading-relaxed flex-1 min-w-0">
        <span className="font-semibold text-sunset-flame">Example: </span>
        {text}
      </p>
      <button
        type="button"
        onClick={() => onUse(text)}
        className="shrink-0 rounded-lg bg-white/80 px-2 py-1 text-[11px] font-semibold text-ink-800 ring-1 ring-ink-900/[0.07] shadow-[inset_0_1px_0_#fff] hover:-translate-y-0.5 hover:bg-white active:scale-95 transition-all duration-300 ease-spring"
      >
        Use this
      </button>
    </div>
  );
}

// Warns when an automation is enabled but its message is blank.
function EmptyWarn({ show }) {
  if (!show) return null;
  return (
    <p className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50/80 ring-1 ring-amber-200/80 rounded-xl px-2.5 py-1.5 mt-1.5">
      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
      This is on but the message is empty — we'll send a friendly default until
      you add your own.
    </p>
  );
}

export default function AutomationSetupPage() {
  const { activeWorkspace } = useAuthStore();
  const { workspace, fetchWorkspace } = useWorkspaceStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [cfg, setCfg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const TABS = ALL_TABS;

  const tabParam = searchParams.get("tab");
  const isGallery = !tabParam || !TABS.some((x) => x.id === tabParam);

  const [tab, setTab] = useState(() => {
    const t = searchParams.get("tab");
    return TABS.some((x) => x.id === t) ? t : TABS[0]?.id || "welcome";
  });

  const openTab = (id) => {
    setTab(id);
    const next = new URLSearchParams(searchParams);
    next.set("tab", id);
    setSearchParams(next, { replace: true });
  };

  const backToGallery = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("tab");
    setSearchParams(next, { replace: true });
  };

  // Ensure current tab is valid (fallback to first if not found)
  useEffect(() => {
    if (!TABS.some((t) => t.id === tab)) setTab(TABS[0]?.id || "welcome");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // Sync tab → URL when editing (gallery has no tab param)
  useEffect(() => {
    if (isGallery) return;
    const current = searchParams.get("tab");
    if (current !== tab) {
      const next = new URLSearchParams(searchParams);
      next.set("tab", tab);
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, isGallery]);

  // Sync URL → tab when user navigates externally
  useEffect(() => {
    const t = searchParams.get("tab");
    if (t && TABS.some((x) => x.id === t) && t !== tab) setTab(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const isLifetime = workspace?.subscription?.lifetime === true;
  const plan = isLifetime
    ? "ig_pro"
    : workspace?.subscription?.plan || "ig_starter";

  const reload = async () => {
    try {
      const { data } = await api.get(
        `/workspaces/${activeWorkspace}/automation-config`,
      );
      setCfg(data);
    } catch {
      toast.error("Failed to load automation config");
    }
  };

  useEffect(() => {
    if (!activeWorkspace) return;
    setLoading(true);
    reload().finally(() => setLoading(false));
  }, [activeWorkspace]);

  const save = async (path, body, label = "Saved") => {
    setSaving(true);
    try {
      await api.put(`/workspaces/${activeWorkspace}${path}`, body);
      toast.success(label);
      await fetchWorkspace(activeWorkspace);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !cfg) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 max-w-6xl mx-auto space-y-6" aria-busy="true">
        <span className="sr-only">Loading automations…</span>
        <div className="h-24 rounded-3xl bg-ink-900/[0.06] animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="card p-5 space-y-3">
              <div className="h-11 w-11 rounded-xl bg-ink-900/[0.06] animate-pulse" />
              <div className="h-3.5 w-1/2 rounded-md bg-ink-900/[0.06] animate-pulse" />
              <div className="h-3 w-full rounded-md bg-ink-900/[0.06] animate-pulse" />
              <div className="h-3 w-3/4 rounded-md bg-ink-900/[0.06] animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const activeTab = TABS.find((t) => t.id === tab);

  const headerSubtitle = isGallery
    ? "Instant replies for guest messages — welcome, keywords, fallback, hours and more."
    : activeTab?.desc || "Configure this automation.";

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-10 max-w-6xl mx-auto">
      {!isGallery && (
        <button
          type="button"
          onClick={backToGallery}
          className="group inline-flex items-center gap-1.5 rounded-lg px-2 py-1 -ml-2 text-xs font-semibold text-ink-500 hover:text-ink-900 hover:bg-white/70 active:scale-95 transition-all duration-300 ease-spring mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-500 ease-spring group-hover:-translate-x-1" /> All automations
        </button>
      )}

      <StatHero
        icon={Zap}
        title={
          isGallery ? "Automations" : activeTab?.label || "Automation"
        }
        subtitle={headerSubtitle}
        help={{
          title: "Automations",
          tips: [
            "These reply to guest messages instantly, without anyone at the desk.",
            "Pick a type: welcome message, keyword replies, business hours or a catch-all default reply.",
            "Toggle any automation on or off, and add your own message or use the one-click example.",
            "Connect WhatsApp under Channels first, or nothing will fire.",
            "The default reply is the safety net when nothing else matches — your AI concierge handles the rest.",
          ],
        }}
      />

      {isGallery ? (
        <AutomationsHubGallery
          tabs={TABS}
          onOpenTab={openTab}
          plan={plan}
          lifetime={isLifetime}
        />
      ) : (
        <>
          <div className={clsx("mb-5 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto no-scrollbar")}>
            <SlidingTabs
              size="sm"
              className="whitespace-nowrap"
              value={tab}
              onChange={openTab}
              items={TABS.map((t) => ({
                value: t.id,
                label: t.label,
                icon: t.icon,
              }))}
            />
          </div>

          <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <PlanGate
              currentPlan={plan}
              requiredPlan={activeTab.plan}
              feature={activeTab.label}
              lifetime={isLifetime}
            >
              {tab === "welcome" && (
                <WelcomeTab
                  cfg={cfg}
                  save={save}
                  saving={saving}
                  setCfg={setCfg}
                />
              )}
              {tab === "dm_kw" && (
                <DmKwTab cfg={cfg} save={save} setCfg={setCfg} />
              )}
              {tab === "fallback" && (
                <FallbackTab cfg={cfg} save={save} setCfg={setCfg} />
              )}
              {tab === "hours" && (
                <HoursTab cfg={cfg} save={save} setCfg={setCfg} />
              )}
              {tab === "holiday" && (
                <HolidayModeCard
                  workspace={workspace}
                  onSave={() => fetchWorkspace(activeWorkspace)}
                />
              )}
            </PlanGate>
          </motion.div>
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

/* ---------- Tab panels ---------- */

function Card({ title, desc, children }) {
  return (
    <div className="card p-5 sm:p-6">
      <h2 className="font-display text-lg font-semibold tracking-[-0.02em] text-ink-900">{title}</h2>
      {desc && (
        <p className="text-sm text-ink-500 mt-1 leading-relaxed">{desc}</p>
      )}
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
}

function WelcomeTab({ cfg, save, saving, setCfg }) {
  const m = cfg.dmMessages || {};
  const enabled = m.enabled !== false;
  return (
    <Card
      title="Welcome message"
      desc="The very first message a guest gets when they write to you for the first time."
    >
      <label className="flex items-center gap-3">
        <label className="toggle">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) =>
              setCfg({
                ...cfg,
                dmMessages: { ...m, enabled: e.target.checked },
              })
            }
          />
          <span className="slider" />
        </label>
        <span className="text-sm text-ink-700">
          {enabled ? "On — welcome message will be sent" : "Off — no welcome message"}
        </span>
      </label>
      <label className="label">Greeting message</label>
      <textarea
        className="textarea min-h-[100px]"
        value={m.greeting || ""}
        onChange={(e) =>
          setCfg({ ...cfg, dmMessages: { ...m, greeting: e.target.value } })
        }
        placeholder="Hey {first_name}! 👋 Thanks so much for reaching out. How can we help you today?"
      />
      <EmptyWarn show={enabled && !m.greeting?.trim()} />
      <ExampleRow
        text={EXAMPLES.welcome}
        onUse={(t) =>
          setCfg({ ...cfg, dmMessages: { ...m, greeting: t } })
        }
      />
      <p className="text-xs text-ink-400 mt-1.5">
        Use {"{name}"} or {"{first_name}"} to personalize.
      </p>
      <button
        disabled={saving}
        onClick={() => save("/dm-messages", cfg.dmMessages, "Welcome message saved")}
        className="btn-primary mt-2"
      >
        <Save className="w-4 h-4" /> Save
      </button>
    </Card>
  );
}

function DmKwTab({ cfg, save, setCfg }) {
  const list = cfg.dmKeywordTriggers || [];
  const add = () =>
    setCfg({
      ...cfg,
      dmKeywordTriggers: [
        ...list,
        { keyword: "", replyMessage: "", matchType: "contains", enabled: true },
      ],
    });
  const update = (i, patch) =>
    setCfg({
      ...cfg,
      dmKeywordTriggers: list.map((x, j) => (i === j ? { ...x, ...patch } : x)),
    });
  const remove = (i) =>
    setCfg({ ...cfg, dmKeywordTriggers: list.filter((_, j) => j !== i) });
  return (
    <Card
      title="Keyword replies"
      desc="A guest sends a message containing a word like ‘price’ → instant auto-reply. Perfect for FAQs."
    >
      {list.map((k, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
          className="rounded-xl bg-white/60 ring-1 ring-ink-900/[0.07] p-3 space-y-2 transition-colors hover:bg-white/85"
        >
          <div className="flex items-center justify-between pb-2 border-b border-ink-900/[0.06]">
            <label className="flex items-center gap-2 text-xs font-medium">
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={k.enabled !== false}
                  onChange={(e) => update(i, { enabled: e.target.checked })}
                />
                <span className="slider" />
              </label>
              <span
                className={
                  k.enabled !== false ? "text-emerald-600" : "text-ink-400"
                }
              >
                {k.enabled !== false ? "Active" : "Paused"}
              </span>
            </label>
            <button
              onClick={() => remove(i)}
              className="btn-ghost group/del text-rose-500 hover:text-rose-600 hover:bg-rose-50"
            >
              <Trash2 className="w-4 h-4 transition-transform duration-500 ease-spring group-hover/del:rotate-[-12deg]" />
            </button>
          </div>
          <div className="flex gap-2">
            <input
              className="input"
              placeholder="keyword"
              value={k.keyword}
              onChange={(e) => update(i, { keyword: e.target.value })}
            />
            <select
              className="input max-w-[120px] sm:max-w-[140px]"
              value={k.matchType}
              onChange={(e) => update(i, { matchType: e.target.value })}
            >
              <option value="contains">contains</option>
              <option value="exact">exact</option>
              <option value="starts_with">starts with</option>
            </select>
          </div>
          <textarea
            className="textarea"
            placeholder="e.g. Thanks {first_name}! Here's the info you asked for 👇"
            value={k.replyMessage}
            onChange={(e) => update(i, { replyMessage: e.target.value })}
          />
        </motion.div>
      ))}
      <div className="flex flex-wrap gap-2 justify-between">
        <button onClick={add} className="btn-secondary group/add">
          <Plus className="w-4 h-4 transition-transform duration-500 ease-spring group-hover/add:rotate-90" /> Add
        </button>
        <button
          onClick={() =>
            save(
              "/dm-keyword-triggers",
              { dmKeywordTriggers: list },
              "Keyword replies saved",
            )
          }
          className="btn-primary"
        >
          <Save className="w-4 h-4" /> Save all
        </button>
      </div>
    </Card>
  );
}

function FallbackTab({ cfg, save, setCfg }) {
  const f = cfg.fallbackReply || {
    enabled: false,
    message: "",
    cooldownHours: 24,
  };
  const update = (patch) =>
    setCfg({ ...cfg, fallbackReply: { ...f, ...patch } });
  return (
    <Card
      title="Fallback auto-reply"
      desc="The safety net. If a message doesn’t match any of your other triggers, Botlify sends this reply — once every X hours per person."
    >
      <label className="flex items-center gap-3">
        <label className="toggle">
          <input
            type="checkbox"
            checked={!!f.enabled}
            onChange={(e) => update({ enabled: e.target.checked })}
          />
          <span className="slider" />
        </label>
        <span className="text-sm text-ink-700">Enable fallback</span>
      </label>
      <label className="label">Fallback message</label>
      <textarea
        className="textarea min-h-[100px]"
        placeholder="Thanks for your message, {first_name}! 🙏 A team member will get back to you shortly."
        value={f.message || ""}
        onChange={(e) => update({ message: e.target.value })}
      />
      <EmptyWarn show={!!f.enabled && !f.message?.trim()} />
      <ExampleRow text={EXAMPLES.fallback} onUse={(t) => update({ message: t })} />
      <label className="label mt-3">
        Cooldown (hours): {f.cooldownHours || 24}
      </label>
      <input
        type="range"
        min="1"
        max="168"
        value={f.cooldownHours || 24}
        onChange={(e) => update({ cooldownHours: Number(e.target.value) })}
        className="w-full accent-[#FF6A2B]"
      />
      <button
        onClick={() => save("/fallback-reply", cfg.fallbackReply, "Saved")}
        className="btn-primary"
      >
        <Save className="w-4 h-4" /> Save
      </button>
    </Card>
  );
}

function HoursTab({ cfg, save, setCfg }) {
  const bh = cfg.businessHours || {
    enabled: false,
    timezone: "Asia/Karachi",
    schedule: [],
  };
  const aw = cfg.awayReply || { enabled: false, message: "" };
  const DAYS = [
    { k: "mon", l: "Monday" },
    { k: "tue", l: "Tuesday" },
    { k: "wed", l: "Wednesday" },
    { k: "thu", l: "Thursday" },
    { k: "fri", l: "Friday" },
    { k: "sat", l: "Saturday" },
    { k: "sun", l: "Sunday" },
  ];
  const scheduleArr = Array.isArray(bh.schedule) ? bh.schedule : [];
  const getDay = (k) =>
    scheduleArr.find((d) => d.day === k) || {
      day: k,
      enabled: false,
      start: "09:00",
      end: "18:00",
    };
  const setDay = (k, patch) => {
    const existing = scheduleArr.find((d) => d.day === k);
    const next = existing
      ? scheduleArr.map((d) => (d.day === k ? { ...d, ...patch } : d))
      : [...scheduleArr, { ...getDay(k), ...patch }];
    setCfg({ ...cfg, businessHours: { ...bh, schedule: next } });
  };
  return (
    <div className="space-y-5">
      <Card
        title="Business hours"
        desc="Tell Botlify when your team is online and available to reply."
      >
        <label className="flex items-center gap-3">
          <label className="toggle">
            <input
              type="checkbox"
              checked={!!bh.enabled}
              onChange={(e) =>
                setCfg({
                  ...cfg,
                  businessHours: { ...bh, enabled: e.target.checked },
                })
              }
            />
            <span className="slider" />
          </label>
          <span className="text-sm text-ink-700">Enable business hours</span>
        </label>
        <div>
          <label className="label">Timezone</label>
          <TimezonePicker
            value={bh.timezone || "Asia/Karachi"}
            onChange={(tz) =>
              setCfg({ ...cfg, businessHours: { ...bh, timezone: tz } })
            }
          />
        </div>
        <div className="space-y-2 mt-2">
          <label className="label">Weekly schedule</label>
          {DAYS.map(({ k, l }) => {
            const d = getDay(k);
            return (
              <div
                key={k}
                className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl bg-white/60 ring-1 ring-ink-900/[0.07] px-3 py-2 transition-colors hover:bg-white/85"
              >
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={!!d.enabled}
                    onChange={(e) => setDay(k, { enabled: e.target.checked })}
                  />
                  <span className="slider" />
                </label>
                <span className="text-sm font-medium text-ink-700 w-20 sm:w-24">{l}</span>
                <input
                  type="time"
                  className="input flex-1 min-w-[6.5rem]"
                  value={d.start || "09:00"}
                  disabled={!d.enabled}
                  onChange={(e) => setDay(k, { start: e.target.value })}
                />
                <span className="text-ink-400 text-xs">to</span>
                <input
                  type="time"
                  className="input flex-1 min-w-[6.5rem]"
                  value={d.end || "18:00"}
                  disabled={!d.enabled}
                  onChange={(e) => setDay(k, { end: e.target.value })}
                />
              </div>
            );
          })}
        </div>
        <button
          onClick={() =>
            save("/business-hours", cfg.businessHours, "Hours saved")
          }
          className="btn-primary"
        >
          <Save className="w-4 h-4" /> Save hours
        </button>
      </Card>
      <Card
        title="Away reply"
        desc="Used outside your business hours, so no one feels ignored."
      >
        <label className="flex items-center gap-3">
          <label className="toggle">
            <input
              type="checkbox"
              checked={!!aw.enabled}
              onChange={(e) =>
                setCfg({
                  ...cfg,
                  awayReply: { ...aw, enabled: e.target.checked },
                })
              }
            />
            <span className="slider" />
          </label>
          <span className="text-sm text-ink-700">Enable away reply</span>
        </label>
        <label className="label">Away message</label>
        <textarea
          className="textarea min-h-[100px]"
          placeholder="Thanks for reaching out! We're away right now but we'll reply as soon as we're back. 🙌"
          value={aw.message || ""}
          onChange={(e) =>
            setCfg({ ...cfg, awayReply: { ...aw, message: e.target.value } })
          }
        />
        <EmptyWarn show={!!aw.enabled && !aw.message?.trim()} />
        <ExampleRow
          text={EXAMPLES.away}
          onUse={(t) => setCfg({ ...cfg, awayReply: { ...aw, message: t } })}
        />
        <button
          onClick={() => save("/away-reply", cfg.awayReply, "Away reply saved")}
          className="btn-primary mt-2"
        >
          <Save className="w-4 h-4" /> Save away
        </button>
      </Card>
    </div>
  );
}
