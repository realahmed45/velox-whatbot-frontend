import { useState, useEffect } from "react";
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
  Hash,
  MessageCircle,
  Heart,
  Share2,
  Link as LinkIcon,
  Radio,
  Target,
  Clock,
  CircleDot,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Stethoscope,
} from "lucide-react";
import PlanGate from "@/components/PlanGate";
import InstagramConstraintsInfo from "@/components/InstagramConstraintsInfo";
import { clsx } from "clsx";

const TABS = [
  { id: "welcome", label: "Welcome DM", icon: MessageCircle, plan: "starter" },
  { id: "comment_kw", label: "Comment keywords", icon: Hash, plan: "starter" },
  { id: "dm_kw", label: "DM keywords", icon: MessageCircle, plan: "starter" },
  { id: "story_reply", label: "Story replies", icon: Heart, plan: "growth" },
  { id: "story_mention", label: "Story mentions", icon: Heart, plan: "growth" },
  { id: "share", label: "Share to story", icon: Share2, plan: "growth" },
  { id: "ref_url", label: "Tracked links", icon: LinkIcon, plan: "growth" },
  { id: "live", label: "Live comments", icon: Radio, plan: "growth" },
  { id: "starters", label: "Chat starters", icon: Target, plan: "growth" },
  { id: "fallback", label: "Fallback reply", icon: CircleDot, plan: "starter" },
  { id: "hours", label: "Business hours", icon: Clock, plan: "growth" },
];

export default function AutomationSetupPage() {
  const { activeWorkspace } = useAuthStore();
  const { workspace, fetchWorkspace } = useWorkspaceStore();
  const [cfg, setCfg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("welcome");
  const [saving, setSaving] = useState(false);

  const plan = workspace?.subscription?.plan || "starter";

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
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
      </div>
    );
  }

  const activeTab = TABS.find((t) => t.id === tab);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-brand-gradient rounded-xl flex items-center justify-center shadow-glow flex-shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight">
              Automation
            </h1>
            <p className="text-ink-500 text-sm mt-1">
              Set up triggers that auto-reply to Instagram comments, DMs,
              stories & more.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-5">
        <InstagramConstraintsInfo compact />
      </div>

      <DiagnosticsPanel workspaceId={activeWorkspace} />

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-5">
        {/* Tabs */}
        <nav className="card p-2 h-fit lg:sticky lg:top-4">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={clsx(
                  "w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition mb-0.5",
                  tab === t.id
                    ? "bg-brand-50 text-brand-700"
                    : "text-ink-600 hover:bg-ink-50",
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="flex-1 text-left">{t.label}</span>
                {t.plan !== "starter" && plan === "starter" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-500" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Panel */}
        <div>
          <PlanGate
            currentPlan={plan}
            requiredPlan={activeTab.plan}
            feature={activeTab.label}
          >
            {tab === "welcome" && (
              <WelcomeTab
                cfg={cfg}
                save={save}
                saving={saving}
                setCfg={setCfg}
              />
            )}
            {tab === "comment_kw" && (
              <CommentKwTab
                cfg={cfg}
                setCfg={setCfg}
                workspace={activeWorkspace}
                reload={reload}
              />
            )}
            {tab === "dm_kw" && (
              <DmKwTab cfg={cfg} save={save} setCfg={setCfg} />
            )}
            {tab === "story_reply" && (
              <StoryReplyTab cfg={cfg} save={save} setCfg={setCfg} />
            )}
            {tab === "story_mention" && (
              <StoryMentionTab cfg={cfg} save={save} setCfg={setCfg} />
            )}
            {tab === "share" && (
              <ShareTab cfg={cfg} save={save} setCfg={setCfg} />
            )}
            {tab === "ref_url" && (
              <RefUrlTab cfg={cfg} save={save} setCfg={setCfg} />
            )}
            {tab === "live" && (
              <LiveTab cfg={cfg} save={save} setCfg={setCfg} />
            )}
            {tab === "starters" && (
              <StartersTab cfg={cfg} save={save} setCfg={setCfg} />
            )}
            {tab === "fallback" && (
              <FallbackTab cfg={cfg} save={save} setCfg={setCfg} />
            )}
            {tab === "hours" && (
              <HoursTab cfg={cfg} save={save} setCfg={setCfg} />
            )}
          </PlanGate>
        </div>
      </div>
    </div>
  );
}

/* ---------- Tab panels ---------- */

function DiagnosticsPanel({ workspaceId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resubbing, setResubbing] = useState(false);
  const [simulating, setSimulating] = useState(false);

  const run = async () => {
    if (!workspaceId) return;
    setLoading(true);
    try {
      const { data } = await api.get("/instagram/diagnose");
      setData(data);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Diagnose failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  const resubscribe = async () => {
    setResubbing(true);
    try {
      const { data } = await api.post("/instagram/webhook/resubscribe");
      toast.success(data.message || "Webhook re-subscribed");
      await run();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Re-subscribe failed");
    } finally {
      setResubbing(false);
    }
  };

  const simulate = async () => {
    setSimulating(true);
    try {
      await api.post("/instagram/test/trigger", {
        triggerType: "direct_message",
        text: "hi",
        username: "demo_user",
      });
      toast.success("Simulated DM sent. Check the Inbox tab.");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Simulate failed");
    } finally {
      setSimulating(false);
    }
  };

  if (!data) {
    return (
      <div className="card p-4 mb-5 flex items-center gap-2 text-sm text-ink-500">
        <Stethoscope className="w-4 h-4" />
        {loading ? "Running automation health check..." : "Loading health..."}
      </div>
    );
  }

  const failed = data.checks?.filter((c) => !c.ok) || [];

  return (
    <div
      className={clsx(
        "card p-4 mb-5 border",
        data.ok
          ? "border-emerald-200 bg-emerald-50/40"
          : "border-amber-200 bg-amber-50/40",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          {data.ok ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <p className="text-sm font-semibold text-ink-900">
              {data.ok
                ? "Automation is healthy"
                : `${failed.length} issue${failed.length === 1 ? "" : "s"} blocking your automations`}
            </p>
            <p className="text-xs text-ink-500 mt-0.5">
              {data.ok
                ? "Triggers will fire as soon as events arrive from Instagram."
                : "Fix the items below so Instagram events reach Botlify."}
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={run}
            disabled={loading}
            className="btn-secondary text-xs"
          >
            <RefreshCw
              className={clsx("w-3.5 h-3.5", loading && "animate-spin")}
            />
            Recheck
          </button>
          <button
            onClick={simulate}
            disabled={simulating}
            className="btn-secondary text-xs"
            title="Simulate an inbound DM to test your automation end-to-end without needing Instagram"
          >
            <Stethoscope
              className={clsx("w-3.5 h-3.5", simulating && "animate-pulse")}
            />
            Simulate DM
          </button>
          <button
            onClick={resubscribe}
            disabled={resubbing}
            className="btn-primary text-xs"
          >
            <RefreshCw
              className={clsx("w-3.5 h-3.5", resubbing && "animate-spin")}
            />
            Re-subscribe webhook
          </button>
        </div>
      </div>

      {!data.ok && (
        <ul className="mt-3 space-y-1.5 pl-7">
          {data.checks.map((c, i) => (
            <li key={i} className="text-xs flex items-start gap-2">
              {c.ok ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
              )}
              <span className={c.ok ? "text-ink-600" : "text-ink-900"}>
                <span className="font-medium">{c.label}</span>
                {!c.ok && c.hint && (
                  <span className="text-ink-500"> — {c.hint}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* Meta-verified subscription details */}
      {data.instagram && (
        <div className="mt-3 pl-7 text-xs text-ink-500 space-y-0.5">
          <div>
            <span className="font-medium text-ink-700">
              Meta-verified fields:
            </span>{" "}
            {data.instagram.subscribedFields?.length ? (
              <span className="font-mono text-ink-800">
                {data.instagram.subscribedFields.join(", ")}
              </span>
            ) : (
              <span className="text-amber-700">
                none — Meta is NOT sending events to this server
              </span>
            )}
          </div>
          <div>
            <span className="font-medium text-ink-700">
              Last webhook received:
            </span>{" "}
            {data.instagram.lastWebhookAt ? (
              <span>
                {new Date(data.instagram.lastWebhookAt).toLocaleString()} (
                {data.instagram.lastWebhookType || "event"})
              </span>
            ) : (
              <span className="text-amber-700">never</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ title, desc, children }) {
  return (
    <div className="card p-5">
      <h2 className="font-semibold text-ink-900">{title}</h2>
      {desc && <p className="text-sm text-ink-500 mt-1">{desc}</p>}
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
}

function WelcomeTab({ cfg, save, saving, setCfg }) {
  const m = cfg.dmMessages || {};
  const enabled = m.enabled !== false;
  return (
    <Card
      title="Welcome DM"
      desc="The very first message someone gets when they DM you for the first time."
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
          {enabled ? "On — welcome DM will be sent" : "Off — no welcome DM"}
        </span>
      </label>
      <label className="label">Greeting message</label>
      <textarea
        className="textarea min-h-[100px]"
        value={m.greeting || ""}
        onChange={(e) =>
          setCfg({ ...cfg, dmMessages: { ...m, greeting: e.target.value } })
        }
        placeholder="Hi {name}! Thanks for reaching out 👋"
      />
      <p className="text-xs text-ink-400">
        Use {"{name}"} or {"{first_name}"} to personalize.
      </p>
      <button
        disabled={saving}
        onClick={() => save("/dm-messages", cfg.dmMessages, "Welcome DM saved")}
        className="btn-primary mt-2"
      >
        <Save className="w-4 h-4" /> Save
      </button>
    </Card>
  );
}

function CommentKwTab({ cfg, setCfg, workspace, reload }) {
  const list = cfg.keywordTriggers || [];
  const add = () =>
    setCfg({
      ...cfg,
      keywordTriggers: [
        ...list,
        { keyword: "", replyMessage: "", matchType: "contains", enabled: true },
      ],
    });
  const update = (i, patch) =>
    setCfg({
      ...cfg,
      keywordTriggers: list.map((x, j) => (i === j ? { ...x, ...patch } : x)),
    });
  const remove = (i) =>
    setCfg({ ...cfg, keywordTriggers: list.filter((_, j) => j !== i) });
  const saveAll = async () => {
    try {
      await api.put(`/workspaces/${workspace}/keyword-triggers`, {
        keywordTriggers: list,
      });
      toast.success("Comment keywords saved");
      reload();
    } catch {
      toast.error("Save failed");
    }
  };
  return (
    <Card
      title="Comment keywords"
      desc="Someone comments a word like ‘info’ on your post → you auto-DM them the details. Classic ManyChat-style magic."
    >
      {list.length === 0 && (
        <p className="text-sm text-ink-400">No triggers yet. Click Add.</p>
      )}
      {list.map((k, i) => (
        <div key={i} className="border border-ink-200 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-ink-100">
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
              className="btn-ghost text-red-500"
            >
              <Trash2 className="w-4 h-4" />
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
              className="input max-w-[140px]"
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
            placeholder="DM reply message..."
            value={k.replyMessage}
            onChange={(e) => update(i, { replyMessage: e.target.value })}
          />
        </div>
      ))}
      <div className="flex justify-between">
        <button onClick={add} className="btn-secondary">
          <Plus className="w-4 h-4" /> Add trigger
        </button>
        <button onClick={saveAll} className="btn-primary">
          <Save className="w-4 h-4" /> Save all
        </button>
      </div>
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
      title="DM keywords"
      desc="Someone sends you a DM containing a word like ‘price’ → instant auto-reply. Perfect for FAQs."
    >
      {list.map((k, i) => (
        <div key={i} className="border border-ink-200 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-ink-100">
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
              className="btn-ghost text-red-500"
            >
              <Trash2 className="w-4 h-4" />
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
              className="input max-w-[140px]"
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
            placeholder="Reply..."
            value={k.replyMessage}
            onChange={(e) => update(i, { replyMessage: e.target.value })}
          />
        </div>
      ))}
      <div className="flex justify-between">
        <button onClick={add} className="btn-secondary">
          <Plus className="w-4 h-4" /> Add
        </button>
        <button
          onClick={() =>
            save(
              "/dm-keyword-triggers",
              { dmKeywordTriggers: list },
              "DM keywords saved",
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

function EnableReplyCard({ title, desc, trig, setTrig, onSave, path }) {
  return (
    <Card title={title} desc={desc}>
      <label className="flex items-center gap-3">
        <label className="toggle">
          <input
            type="checkbox"
            checked={!!trig.enabled}
            onChange={(e) => setTrig({ ...trig, enabled: e.target.checked })}
          />
          <span className="slider" />
        </label>
        <span className="text-sm text-ink-700">Enable</span>
      </label>
      <textarea
        className="textarea min-h-[100px]"
        placeholder="Reply message..."
        value={trig.replyMessage || ""}
        onChange={(e) => setTrig({ ...trig, replyMessage: e.target.value })}
      />
      <button className="btn-primary" onClick={onSave}>
        <Save className="w-4 h-4" /> Save
      </button>
    </Card>
  );
}

function StoryReplyTab({ cfg, save, setCfg }) {
  const t = cfg.storyReplyTrigger || {};
  return (
    <EnableReplyCard
      title="Story replies"
      desc="Whenever someone replies to your story, send them a DM automatically."
      trig={t}
      setTrig={(v) => setCfg({ ...cfg, storyReplyTrigger: v })}
      onSave={() =>
        save("/story-reply-trigger", cfg.storyReplyTrigger, "Saved")
      }
      path="/story-reply-trigger"
    />
  );
}
function StoryMentionTab({ cfg, save, setCfg }) {
  const t = cfg.storyMentionTrigger || {};
  return (
    <EnableReplyCard
      title="Story mentions"
      desc="When someone tags you in their story, send them a thank-you or offer DM."
      trig={t}
      setTrig={(v) => setCfg({ ...cfg, storyMentionTrigger: v })}
      onSave={() =>
        save("/story-mention-trigger", cfg.storyMentionTrigger, "Saved")
      }
    />
  );
}
function ShareTab({ cfg, save, setCfg }) {
  const t = cfg.shareToStoryTrigger || {};
  return (
    <EnableReplyCard
      title="Share to story"
      desc="When someone shares your post or story to their own story, Botlify sends them a friendly DM."
      trig={t}
      setTrig={(v) => setCfg({ ...cfg, shareToStoryTrigger: v })}
      onSave={() =>
        save("/share-to-story-trigger", cfg.shareToStoryTrigger, "Saved")
      }
    />
  );
}

function RefUrlTab({ cfg, save, setCfg }) {
  const list = cfg.refUrlTriggers || [];
  const add = () =>
    setCfg({
      ...cfg,
      refUrlTriggers: [
        ...list,
        { code: "", label: "", replyMessage: "", enabled: true },
      ],
    });
  const update = (i, patch) =>
    setCfg({
      ...cfg,
      refUrlTriggers: list.map((x, j) => (i === j ? { ...x, ...patch } : x)),
    });
  const remove = (i) =>
    setCfg({ ...cfg, refUrlTriggers: list.filter((_, j) => j !== i) });
  return (
    <Card
      title="Tracked links (Ref URLs)"
      desc="Give each ad or campaign its own link. When someone clicks and messages you, they get a reply tailored to that campaign."
    >
      {list.map((r, i) => (
        <div key={i} className="border border-ink-200 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-ink-100">
            <label className="flex items-center gap-2 text-xs font-medium">
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={r.enabled !== false}
                  onChange={(e) => update(i, { enabled: e.target.checked })}
                />
                <span className="slider" />
              </label>
              <span
                className={
                  r.enabled !== false ? "text-emerald-600" : "text-ink-400"
                }
              >
                {r.enabled !== false ? "Active" : "Paused"}
              </span>
            </label>
            <button
              onClick={() => remove(i)}
              className="btn-ghost text-red-500 text-xs"
            >
              <Trash2 className="w-3 h-3" /> Remove
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              className="input"
              placeholder="code (e.g. FBAD1)"
              value={r.code}
              onChange={(e) => update(i, { code: e.target.value })}
            />
            <input
              className="input"
              placeholder="label (internal)"
              value={r.label}
              onChange={(e) => update(i, { label: e.target.value })}
            />
          </div>
          <textarea
            className="textarea"
            placeholder="Reply..."
            value={r.replyMessage}
            onChange={(e) => update(i, { replyMessage: e.target.value })}
          />
        </div>
      ))}
      <div className="flex justify-between">
        <button onClick={add} className="btn-secondary">
          <Plus className="w-4 h-4" /> Add
        </button>
        <button
          onClick={() =>
            save(
              "/ref-url-triggers",
              { refUrlTriggers: list },
              "Ref URLs saved",
            )
          }
          className="btn-primary"
        >
          <Save className="w-4 h-4" /> Save
        </button>
      </div>
    </Card>
  );
}

function LiveTab({ cfg, save, setCfg }) {
  const list = cfg.liveCommentTriggers || [];
  const add = () =>
    setCfg({
      ...cfg,
      liveCommentTriggers: [
        ...list,
        { keyword: "", replyMessage: "", enabled: true },
      ],
    });
  const update = (i, patch) =>
    setCfg({
      ...cfg,
      liveCommentTriggers: list.map((x, j) =>
        i === j ? { ...x, ...patch } : x,
      ),
    });
  const remove = (i) =>
    setCfg({ ...cfg, liveCommentTriggers: list.filter((_, j) => j !== i) });
  return (
    <Card
      title="Live stream comments"
      desc="During an Instagram Live, if a viewer types a keyword in the comments, they instantly get a DM from you."
    >
      {list.map((k, i) => (
        <div key={i} className="border border-ink-200 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-ink-100">
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
              className="btn-ghost text-red-500 text-xs"
            >
              <Trash2 className="w-3 h-3" /> Remove
            </button>
          </div>
          <input
            className="input"
            placeholder="keyword"
            value={k.keyword}
            onChange={(e) => update(i, { keyword: e.target.value })}
          />
          <textarea
            className="textarea"
            placeholder="Reply..."
            value={k.replyMessage}
            onChange={(e) => update(i, { replyMessage: e.target.value })}
          />
        </div>
      ))}
      <div className="flex justify-between">
        <button onClick={add} className="btn-secondary">
          <Plus className="w-4 h-4" /> Add
        </button>
        <button
          onClick={() =>
            save(
              "/live-comment-triggers",
              { liveCommentTriggers: list },
              "Saved",
            )
          }
          className="btn-primary"
        >
          <Save className="w-4 h-4" /> Save
        </button>
      </div>
    </Card>
  );
}

function StartersTab({ cfg, save, setCfg }) {
  const s = cfg.conversationStarters || {
    enabled: false,
    greeting: "",
    options: [],
  };
  const update = (patch) =>
    setCfg({ ...cfg, conversationStarters: { ...s, ...patch } });
  const addOption = () =>
    update({
      options: [
        ...(s.options || []),
        { label: "", payload: "", replyMessage: "" },
      ],
    });
  return (
    <Card
      title="Conversation starters"
      desc="Show clickable buttons (like ‘See pricing’, ‘Book a call’) at the top of every new chat so people know exactly what to ask."
    >
      <label className="flex items-center gap-3">
        <label className="toggle">
          <input
            type="checkbox"
            checked={!!s.enabled}
            onChange={(e) => update({ enabled: e.target.checked })}
          />
          <span className="slider" />
        </label>
        <span className="text-sm text-ink-700">Enable starters</span>
      </label>
      <label className="label">Greeting</label>
      <input
        className="input"
        value={s.greeting || ""}
        onChange={(e) => update({ greeting: e.target.value })}
      />
      {(s.options || []).map((o, i) => (
        <div key={i} className="border border-ink-200 rounded-lg p-3 space-y-2">
          <input
            className="input"
            placeholder="Button label"
            value={o.label}
            onChange={(e) =>
              update({
                options: s.options.map((x, j) =>
                  i === j ? { ...x, label: e.target.value } : x,
                ),
              })
            }
          />
          <textarea
            className="textarea"
            placeholder="Reply..."
            value={o.replyMessage}
            onChange={(e) =>
              update({
                options: s.options.map((x, j) =>
                  i === j ? { ...x, replyMessage: e.target.value } : x,
                ),
              })
            }
          />
          <button
            className="btn-ghost text-red-500 text-xs"
            onClick={() =>
              update({ options: s.options.filter((_, j) => j !== i) })
            }
          >
            <Trash2 className="w-3 h-3" /> Remove
          </button>
        </div>
      ))}
      <div className="flex justify-between">
        <button onClick={addOption} className="btn-secondary">
          <Plus className="w-4 h-4" /> Add option
        </button>
        <button
          onClick={() =>
            save("/conversation-starters", cfg.conversationStarters, "Saved")
          }
          className="btn-primary"
        >
          <Save className="w-4 h-4" /> Save
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
      <textarea
        className="textarea min-h-[100px]"
        placeholder="Fallback message..."
        value={f.message || ""}
        onChange={(e) => update({ message: e.target.value })}
      />
      <label className="label">Cooldown (hours): {f.cooldownHours || 24}</label>
      <input
        type="range"
        min="1"
        max="168"
        value={f.cooldownHours || 24}
        onChange={(e) => update({ cooldownHours: Number(e.target.value) })}
        className="w-full"
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
                className="flex items-center gap-3 rounded-xl border border-ink-200 bg-white px-3 py-2"
              >
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={!!d.enabled}
                    onChange={(e) => setDay(k, { enabled: e.target.checked })}
                  />
                  <span className="slider" />
                </label>
                <span className="text-sm text-ink-700 w-24">{l}</span>
                <input
                  type="time"
                  className="input flex-1"
                  value={d.start || "09:00"}
                  disabled={!d.enabled}
                  onChange={(e) => setDay(k, { start: e.target.value })}
                />
                <span className="text-ink-400 text-xs">to</span>
                <input
                  type="time"
                  className="input flex-1"
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
        <textarea
          className="textarea min-h-[100px]"
          placeholder="We're away. We'll get back to you soon!"
          value={aw.message || ""}
          onChange={(e) =>
            setCfg({ ...cfg, awayReply: { ...aw, message: e.target.value } })
          }
        />
        <button
          onClick={() => save("/away-reply", cfg.awayReply, "Away reply saved")}
          className="btn-primary"
        >
          <Save className="w-4 h-4" /> Save away
        </button>
      </Card>
    </div>
  );
}
