/**
 * Settings — one screen, every knob, behind tabs.
 *
 * Folds in what used to be separate sidebar destinations: Property & Rooms,
 * Channels, Transfers, the AI Assistant config, Team and Billing — plus the
 * hotel Extras catalog and smart-pricing guard rails.
 *
 * Instagram is no longer a top-level concern: connecting it happens on the
 * Channels board alongside WhatsApp, Messenger and Telegram, and its delivery
 * diagnostics live in ChannelHealth under that same tab.
 */
import { useEffect, useState, lazy, Suspense } from "react";
import api from "@/services/api";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import {
  Save,
  Instagram,
  Loader2,
  RefreshCw,
  Settings as SettingsIcon,
  Shield,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  LogOut,
  CheckCircle2,
  LifeBuoy,
  Hotel,
  Radio,
  Bot,
  PackagePlus,
  Tag,
  Car,
  Users,
  CreditCard,
  SlidersHorizontal,
} from "lucide-react";
import StatHero from "@/components/ui/StatHero";
import HolidayModeCard from "@/components/HolidayModeCard";
import PasswordStrength from "@/components/auth/PasswordStrength";
import { checkPassword } from "@/utils/passwordPolicy";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";
import ExtrasSettings from "@/pages/settings/ExtrasSettings";
import PricingSettings from "@/pages/settings/PricingSettings";

// Heavy, self-contained screens that used to own a sidebar entry. Lazy so the
// Settings bundle doesn't pull all of them in at once.
const PropertyPage = lazy(() => import("@/pages/hotel/PropertyPage"));
const ChannelsPage = lazy(() => import("@/pages/hotel/ChannelsPage"));
const TransfersPage = lazy(() => import("@/pages/hotel/TransfersPage"));
const IgAiBotPage = lazy(() => import("@/pages/ai-bot/IgAiBotPage"));
const TeamPage = lazy(() => import("@/pages/team/TeamPage"));
const BillingPage = lazy(() => import("@/pages/billing/BillingPage"));

const SUPPORT_EMAIL = "contactus@botlify.site";

// Tabs whose content is a whole page lifted in from a former route.
const EMBEDDED = [
  "property",
  "channels",
  "assistant",
  "transfers",
  "team",
  "billing",
];

function TabFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
    </div>
  );
}

export default function SettingsPage() {
  const { workspace, fetchWorkspace } = useWorkspaceStore();
  const { activeWorkspace } = useAuthStore();
  const { isOwner } = usePermissions();
  // ?tab= keeps a tab shareable/deep-linkable now that these are no longer
  // routes of their own.
  const [params, setParams] = useSearchParams();

  // Grouped so ten sections read as three short lists instead of one long
  // strip that runs off the edge of the screen.
  const GROUPS = [
    {
      heading: "Property",
      items: [
        { id: "property", label: "Property & Rooms", icon: Hotel },
        { id: "extras", label: "Extras", icon: PackagePlus },
        { id: "transfers", label: "Transfers", icon: Car },
        { id: "pricing", label: "Pricing", icon: Tag },
      ],
    },
    {
      heading: "Channels & AI",
      items: [
        { id: "channels", label: "Channels", icon: Radio },
        { id: "assistant", label: "AI Assistant", icon: Bot },
      ],
    },
    {
      heading: "Account",
      items: [
        ...(isOwner ? [{ id: "team", label: "Team", icon: Users }] : []),
        ...(isOwner
          ? [{ id: "billing", label: "Plan & Billing", icon: CreditCard }]
          : []),
        { id: "general", label: "General", icon: SlidersHorizontal },
        { id: "security", label: "Security", icon: Shield },
      ],
    },
  ].filter((g) => g.items.length > 0);

  const TABS = GROUPS.flatMap((g) => g.items);

  const urlTab = params.get("tab");
  const tab = TABS.some((t) => t.id === urlTab) ? urlTab : "property";
  const setTab = (id) => setParams(id === "property" ? {} : { tab: id }, { replace: true });

  return (
    <div className="p-4 sm:p-8 max-w-[1400px] mx-auto">
      <StatHero
        icon={SettingsIcon}
        title="Settings"
        subtitle="Your property, channels, assistant and account — all in one place"
      />

      {/* Vertical nav beside the content on desktop; a wrapped, fully visible
          grid of chips above it on phones. Ten sections never scroll sideways
          and nothing gets cut off. */}
      <div className="mt-5 sm:mt-6 lg:flex lg:items-start lg:gap-8">
        <nav className="lg:w-56 xl:w-60 lg:shrink-0 lg:sticky lg:top-6 mb-5 lg:mb-0">
          {GROUPS.map((g) => (
            <div key={g.heading} className="mb-4 lg:mb-5 last:mb-0">
              <p className="px-1 lg:px-3 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-400">
                {g.heading}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 lg:flex lg:flex-col lg:gap-0.5">
                {g.items.map((t) => {
                  const Icon = t.icon;
                  const active = tab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-2 w-full text-left px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                        active
                          ? "bg-white text-ink-900 shadow-sm ring-1 ring-ink-100 lg:ring-0 lg:bg-brand-50 lg:text-brand-700"
                          : "bg-ink-100 text-ink-500 hover:text-ink-700 lg:bg-transparent lg:hover:bg-ink-50"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${active ? "text-brand-600" : "text-ink-400"}`}
                      />
                      <span className="truncate">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="min-w-0 flex-1">
      {/* Embedded pages bring their own max-width + padding (they used to be
          routes). Pull that back in so a tab doesn't look double-inset — only
          out to the page edge on phones, where the nav sits above rather than
          beside the content. */}
      <Suspense fallback={<TabFallback />}>
        {EMBEDDED.includes(tab) && (
          <div className="-mx-4 sm:-mx-8 lg:mx-0 [&>div]:max-w-none [&_.max-w-5xl]:max-w-none [&_.max-w-4xl]:max-w-none [&_.max-w-3xl]:max-w-none">
            {tab === "property" && <PropertyPage />}
            {tab === "channels" && (
              <>
                <ChannelsPage />
                {/* Instagram-only delivery tools, tucked under the board. */}
                <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-8">
                  <ChannelHealth
                    workspace={workspace}
                    onSave={() => fetchWorkspace(activeWorkspace)}
                  />
                </div>
              </>
            )}
            {tab === "assistant" && <IgAiBotPage />}
            {tab === "transfers" && <TransfersPage />}
            {tab === "team" && isOwner && <TeamPage />}
            {tab === "billing" && isOwner && <BillingPage />}
          </div>
        )}
        {tab === "extras" && <ExtrasSettings />}
        {tab === "pricing" && <PricingSettings />}
      </Suspense>

      {tab === "general" && (
        <>
          <GeneralSettings
            workspace={workspace}
            onSave={() => fetchWorkspace(activeWorkspace)}
          />
          <HolidayModeCard
            workspace={workspace}
            onSave={() => fetchWorkspace(activeWorkspace)}
          />
          <AutomationSettings
            workspace={workspace}
            onSave={() => fetchWorkspace(activeWorkspace)}
          />
        </>
      )}
      {tab === "security" && (
        <SecuritySettings onGoToTeam={isOwner ? () => setTab("team") : undefined} />
      )}
        </div>
      </div>
    </div>
  );
}

function SecuritySettings({ onGoToTeam }) {
  const { user, setUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const [hasPassword, setHasPassword] = useState(user?.hasPassword ?? true);
  const [hasGoogle, setHasGoogle] = useState(user?.hasGoogle ?? false);
  const [loadingMe, setLoadingMe] = useState(true);
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [show, setShow] = useState({ current: false, next: false });
  const [saving, setSaving] = useState(false);

  // Fetch fresh account status so we know whether to show "set" vs "change".
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await api.get("/auth/me");
        if (!alive) return;
        setHasPassword(!!data.user?.hasPassword);
        setHasGoogle(!!data.user?.hasGoogle);
        setUser({ ...user, ...data.user });
      } catch {
        /* keep optimistic defaults */
      } finally {
        if (alive) setLoadingMe(false);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const strength = checkPassword(form.next, {
    email: user?.email,
    name: user?.name,
  });

  const save = async () => {
    if (form.next !== form.confirm) {
      return toast.error("New passwords don't match");
    }
    if (!strength.ok) {
      return toast.error(strength.message || "Choose a stronger password");
    }
    setSaving(true);
    try {
      if (hasPassword) {
        await api.put("/auth/password", {
          currentPassword: form.current,
          newPassword: form.next,
        });
        toast.success("Password changed");
      } else {
        await api.post("/auth/set-password", { newPassword: form.next });
        toast.success("Password set — you can now sign in with it");
        setHasPassword(true);
        setUser({ ...user, hasPassword: true });
      }
      setForm({ current: "", next: "", confirm: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  const doLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="space-y-5">
      {/* Account identity */}
      <div className="card p-5 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
          <Shield className="w-5 h-5 text-brand-500" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-ink-900 truncate">{user?.name}</p>
          <p className="text-xs text-ink-500 truncate">{user?.email}</p>
        </div>
        <div className="ml-auto flex flex-wrap gap-1.5 justify-end">
          {user?.isEmailVerified && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-3 h-3" /> Verified
            </span>
          )}
          {hasGoogle && (
            <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-ink-100 text-ink-600">
              Google linked
            </span>
          )}
        </div>
      </div>

      {/* Password */}
      <div className="card p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-ink-500" />
          <h3 className="text-sm font-bold text-ink-900">
            {hasPassword ? "Change password" : "Set a password"}
          </h3>
        </div>

        {!loadingMe && !hasPassword && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-lg">
            You signed up with Google, so you don't have a password yet. Set one
            to also be able to sign in with your email.
          </div>
        )}

        {hasPassword && (
          <div>
            <div className="flex items-center justify-between">
              <label className="label">Current password</label>
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-[11px] font-semibold text-brand-600 hover:underline"
              >
                Forgot your password?
              </button>
            </div>
            <div className="relative">
              <input
                type={show.current ? "text" : "password"}
                className="input pr-10"
                autoComplete="current-password"
                value={form.current}
                onChange={(e) =>
                  setForm({ ...form, current: e.target.value })
                }
              />
              <button
                type="button"
                onClick={() => setShow((s) => ({ ...s, current: !s.current }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
              >
                {show.current ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        )}

        <div>
          <label className="label">New password</label>
          <div className="relative">
            <input
              type={show.next ? "text" : "password"}
              className="input pr-10"
              autoComplete="new-password"
              value={form.next}
              onChange={(e) => setForm({ ...form, next: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShow((s) => ({ ...s, next: !s.next }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
            >
              {show.next ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          <PasswordStrength
            password={form.next}
            email={user?.email}
            name={user?.name}
          />
        </div>

        <div>
          <label className="label">Confirm new password</label>
          <input
            type="password"
            className="input"
            autoComplete="new-password"
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          />
          {form.confirm && form.confirm !== form.next && (
            <p className="text-[11px] text-red-500 mt-1">
              Passwords don't match.
            </p>
          )}
        </div>

        <button
          onClick={save}
          disabled={saving || loadingMe}
          className="btn-primary gap-2 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Lock className="w-4 h-4" />
          )}
          {hasPassword ? "Update password" : "Set password"}
        </button>
      </div>

      {/* Session */}
      <div className="card p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-2">
          <LogOut className="w-4 h-4 text-ink-500" />
          <h3 className="text-sm font-bold text-ink-900">Session</h3>
        </div>
        <p className="text-xs text-ink-500">
          Sign out of your hotel account on this device. Bookings, guest
          messages and your channels keep running while you're signed out.
        </p>
        <button
          onClick={doLogout}
          className="inline-flex items-center gap-2 rounded-xl border border-red-200 text-red-600 font-bold text-sm px-4 py-2.5 hover:bg-red-50 transition"
        >
          <LogOut className="w-4 h-4" /> Log out
        </button>
      </div>

      {/* Who else can sign in — owners only; staff can't manage the team. */}
      {onGoToTeam && (
      <div className="card p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-1.5">
          <Shield className="w-4 h-4 text-ink-500" />
          <h3 className="text-sm font-bold text-ink-900">
            Who else can get in
          </h3>
        </div>
        <p className="text-xs text-ink-500">
          Everyone with access to your property is listed under{" "}
          <button
            type="button"
            onClick={onGoToTeam}
            className="font-semibold text-brand-600 hover:underline"
          >
            Settings → Team
          </button>
          . Removing someone there cuts their access immediately. Staff can
          never reach billing or delete your property.
        </p>
      </div>
      )}

      {/* Support */}
      <div className="card p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-1.5">
          <LifeBuoy className="w-4 h-4 text-ink-500" />
          <h3 className="text-sm font-bold text-ink-900">Need help?</h3>
        </div>
        <p className="text-xs text-ink-500">
          Questions about your hotel account, billing or security — email us at{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="font-semibold text-brand-600 hover:underline"
          >
            {SUPPORT_EMAIL}
          </a>
          . We usually reply within a day.
        </p>
      </div>
    </div>
  );
}

/**
 * General — the property-level basics: what the hotel is called inside Botlify,
 * which timezone its nights roll over in, and which language the AI concierge
 * answers guests in. Room types, photos and address live under Property &
 * Rooms; this is deliberately the short tab.
 */
function GeneralSettings({ workspace, onSave }) {
  const [form, setForm] = useState({
    name: workspace?.name || "",
    timezone: workspace?.timezone || "Asia/Karachi",
    language: workspace?.language || "en",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (workspace)
      setForm({
        name: workspace.name,
        timezone: workspace.timezone || "Asia/Karachi",
        language: workspace.language || "en",
      });
  }, [workspace]);

  const save = async () => {
    setLoading(true);
    try {
      await api.put(`/workspaces/${workspace._id}`, {
        name: form.name,
        timezone: form.timezone,
        language: form.language,
      });
      toast.success("Settings saved");
      onSave();
    } catch (err) {
      toast.error("Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-4 sm:p-6 space-y-4">
      <div>
        <label className="label">Property name</label>
        <input
          className="input"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Seaview Boutique Hotel"
        />
        <p className="text-xs text-ink-400 mt-1.5">
          How your hotel appears across Botlify and on your direct-booking page.
        </p>
      </div>
      <div>
        <label className="label">Timezone</label>
        <select
          className="input"
          value={form.timezone}
          onChange={(e) => setForm({ ...form, timezone: e.target.value })}
        >
          <option value="Asia/Karachi">Asia/Karachi (PKT +5)</option>
          <option value="Asia/Dubai">Asia/Dubai (GST +4)</option>
          <option value="UTC">UTC</option>
          <option value="America/New_York">America/New_York (ET)</option>
        </select>
        <p className="text-xs text-ink-400 mt-1.5">
          Sets when a night rolls over — check-ins, check-outs and today's
          arrivals all follow this.
        </p>
      </div>
      <div>
        <label className="label">
          Default language{" "}
          <span className="text-xs text-ink-400">
            (how your AI answers guests)
          </span>
        </label>
        <select
          className="input"
          value={form.language}
          onChange={(e) => setForm({ ...form, language: e.target.value })}
        >
          <option value="en">English</option>
          <option value="ur">Urdu (Roman)</option>
          <option value="ar">Arabic</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="hi">Hindi</option>
        </select>
        <p className="text-xs text-ink-400 mt-1.5">
          Your AI still mirrors a guest who writes in another language — this is
          just the fallback.
        </p>
      </div>
      <button onClick={save} disabled={loading} className="btn-primary gap-2">
        <Save className="w-4 h-4" />
        {loading ? "Saving…" : "Save changes"}
      </button>
    </div>
  );
}

/**
 * ChannelHealth — the Instagram-specific troubleshooting tools, kept because
 * they're genuinely useful, but no longer presented as the main event.
 *
 * Instagram is one of four messaging channels now. Connecting and disconnecting
 * every channel happens on the Channels board above (ChannelsPage); this panel
 * sits underneath it and only appears once Instagram is actually connected,
 * because the diagnose + webhook-resubscribe endpoints are Instagram-only. If a
 * hotel never connects Instagram they never see it.
 */
function ChannelHealth({ workspace, onSave }) {
  const ig = workspace?.instagram;
  const [diagLoading, setDiagLoading] = useState(false);
  const [diag, setDiag] = useState(null);
  const [resubLoading, setResubLoading] = useState(false);

  const runDiagnose = async () => {
    setDiagLoading(true);
    try {
      const { data } = await api.get("/instagram/diagnose");
      setDiag(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Diagnose failed");
    } finally {
      setDiagLoading(false);
    }
  };

  const resubscribe = async () => {
    setResubLoading(true);
    try {
      const { data } = await api.post("/instagram/webhook/resubscribe");
      toast.success(data.message || "Webhook re-subscribed!");
      onSave();
      runDiagnose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Resubscribe failed");
    } finally {
      setResubLoading(false);
    }
  };

  // Instagram-only tools — nothing to show until Instagram is connected.
  if (ig?.status !== "connected") return null;

  return (
    <div className="card p-5 sm:p-6 space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Instagram className="w-4.5 h-4.5" />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-ink-900">
              Instagram message delivery
            </h3>
            <p className="text-xs text-ink-500">
              Not seeing guest DMs from{" "}
              {ig?.username ? `@${ig.username}` : "Instagram"} in your inbox?
              Check the connection here.
            </p>
          </div>
        </div>
        <button
          onClick={runDiagnose}
          disabled={diagLoading}
          className="flex items-center gap-1.5 text-xs font-semibold bg-ink-50 hover:bg-ink-100 border border-ink-200 px-3 py-1.5 rounded-lg transition disabled:opacity-60 shrink-0"
        >
          {diagLoading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <RefreshCw className="w-3 h-3" />
          )}
          Run check
        </button>
      </div>

      {diag && (
        <div className="space-y-2">
          {diag.checks?.map((c, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 p-2.5 rounded-lg text-xs ${c.ok ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-800"}`}
            >
              <span className="mt-0.5 shrink-0">{c.ok ? "✅" : "⚠️"}</span>
              <div>
                <p className="font-medium">{c.label}</p>
                {!c.ok && c.hint && (
                  <p className="mt-0.5 text-amber-700">{c.hint}</p>
                )}
              </div>
            </div>
          ))}
          {diag.checks?.some((c) => !c.ok) && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 space-y-1.5">
              <p className="font-semibold">
                Guest messages aren't coming through. Try this:
              </p>
              <ol className="list-decimal list-inside space-y-1 pl-1">
                <li>
                  Make sure your hotel's Instagram is a{" "}
                  <strong>Business account</strong>, not a personal one.
                </li>
                <li>
                  Click <strong>Re-subscribe</strong> below to refresh the
                  connection.
                </li>
                <li>
                  Send a test DM from another account — it should land in your
                  inbox within a few seconds.
                </li>
                <li>
                  Still stuck? Disconnect and reconnect Instagram on the
                  Channels board above.
                </li>
              </ol>
            </div>
          )}
        </div>
      )}

      <button
        onClick={resubscribe}
        disabled={resubLoading}
        className="w-full flex items-center justify-center gap-2 bg-ink-900 hover:bg-ink-800 text-white text-xs font-semibold py-2.5 rounded-lg transition disabled:opacity-60"
      >
        {resubLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <RefreshCw className="w-3.5 h-3.5" />
        )}
        Re-subscribe to Instagram messages
      </button>
    </div>
  );
}

/**
 * Reply behaviour — the global guard rails on the AI concierge, applied on every
 * connected channel (WhatsApp, Instagram, Messenger, Telegram).
 *
 * Persists to `PUT /instagram/settings` — the route name is historical; it
 * writes workspace.settings, which every channel's reply pipeline reads.
 */
function AutomationSettings({ workspace, onSave }) {
  const [form, setForm] = useState({
    automationEnabled: workspace?.settings?.automationEnabled ?? true,
    minDelayMinutes: workspace?.settings?.minDelayMinutes ?? 1,
    maxDelayMinutes: workspace?.settings?.maxDelayMinutes ?? 5,
    activeHourStart: workspace?.settings?.activeHourStart ?? 8,
    activeHourEnd: workspace?.settings?.activeHourEnd ?? 22,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (workspace?.settings)
      setForm({
        automationEnabled: workspace.settings.automationEnabled ?? true,
        minDelayMinutes: workspace.settings.minDelayMinutes ?? 1,
        maxDelayMinutes: workspace.settings.maxDelayMinutes ?? 5,
        activeHourStart: workspace.settings.activeHourStart ?? 8,
        activeHourEnd: workspace.settings.activeHourEnd ?? 22,
      });
  }, [workspace]);

  const save = async () => {
    setLoading(true);
    try {
      await api.put("/instagram/settings", form);
      toast.success("Reply settings saved");
      onSave();
    } catch (err) {
      toast.error("Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-4 sm:p-6 space-y-5">
      <div>
        <h3 className="text-sm font-bold text-ink-900">Reply behaviour</h3>
        <p className="text-xs text-ink-500 mt-0.5">
          Applies to your AI concierge on every connected channel — WhatsApp,
          Instagram, Messenger and Telegram.
        </p>
      </div>

      {/* Master toggle */}
      <div className="flex items-center justify-between gap-4 py-2 border-t border-ink-100 pt-4">
        <div className="min-w-0">
          <p className="font-medium text-ink-800 text-sm">
            Let the AI answer guests
          </p>
          <p className="text-xs text-ink-500">
            Turn this off and every message waits for a human in the inbox.
          </p>
        </div>
        <button
          onClick={() =>
            setForm((f) => ({ ...f, automationEnabled: !f.automationEnabled }))
          }
          className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
            form.automationEnabled ? "bg-brand-600" : "bg-ink-300"
          }`}
          aria-label="Toggle AI replies"
        >
          <span
            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
              form.automationEnabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Delay range */}
      <div>
        <label className="label">Reply delay range (minutes)</label>
        <p className="text-xs text-ink-400 mb-3">
          A short random pause before the AI replies, so answers feel like your
          front desk rather than a machine.
        </p>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="text-xs text-ink-500">Min</label>
            <input
              type="number"
              min={0}
              max={60}
              className="input"
              value={form.minDelayMinutes}
              onChange={(e) =>
                setForm({ ...form, minDelayMinutes: +e.target.value })
              }
            />
          </div>
          <span className="text-ink-400 mt-5">–</span>
          <div className="flex-1">
            <label className="text-xs text-ink-500">Max</label>
            <input
              type="number"
              min={0}
              max={120}
              className="input"
              value={form.maxDelayMinutes}
              onChange={(e) =>
                setForm({ ...form, maxDelayMinutes: +e.target.value })
              }
            />
          </div>
        </div>
      </div>

      {/* Active hours */}
      <div>
        <label className="label">Active hours</label>
        <p className="text-xs text-ink-400 mb-3">
          When the AI replies on its own. Outside this window guests get your
          away message and the enquiry waits for the front desk. Running a 24/7
          desk? Set 0 to 23.
        </p>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="text-xs text-ink-500">From (hour 0–23)</label>
            <input
              type="number"
              min={0}
              max={23}
              className="input"
              value={form.activeHourStart}
              onChange={(e) =>
                setForm({ ...form, activeHourStart: +e.target.value })
              }
            />
          </div>
          <span className="text-ink-400 mt-5">–</span>
          <div className="flex-1">
            <label className="text-xs text-ink-500">To (hour 0–23)</label>
            <input
              type="number"
              min={0}
              max={23}
              className="input"
              value={form.activeHourEnd}
              onChange={(e) =>
                setForm({ ...form, activeHourEnd: +e.target.value })
              }
            />
          </div>
        </div>
      </div>

      <button onClick={save} disabled={loading} className="btn-primary gap-2">
        <Save className="w-4 h-4" />
        {loading ? "Saving…" : "Save settings"}
      </button>
    </div>
  );
}
