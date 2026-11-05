/**
 * Settings — everything a hotelier needs to run Botlify, in one place.
 *
 * Hotels-only: WhatsApp is the single guest messaging channel (OTA guest
 * messages from Booking.com / Airbnb arrive through the booking-channel
 * connection on the same WhatsApp tab). Instagram / Messenger / Telegram tools
 * and the old developer-ish knobs are no longer surfaced here; their pages and
 * routes still exist, they're just not part of Settings.
 *
 * Layout: a grouped left rail on desktop, a scrollable chip strip on phones.
 * Tab ids are the ?tab= deep-link contract (CommandPalette, ConnectChannelGate
 * and the AI Assistant link to them) — keep them stable.
 */
import { useEffect, useState, lazy, Suspense } from "react";
import api from "@/services/api";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import {
  Save,
  Loader2,
  Shield,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  LogOut,
  CheckCircle2,
  LifeBuoy,
  Hotel,
  Bot,
  PackagePlus,
  Tag,
  Car,
  Users,
  CreditCard,
  SlidersHorizontal,
  MessageCircle,
  PauseCircle,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Clock,
} from "lucide-react";
import HolidayModeCard from "@/components/HolidayModeCard";
import PasswordStrength from "@/components/auth/PasswordStrength";
import { checkPassword } from "@/utils/passwordPolicy";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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

// Embedded pages that render their own page title.
const OWN_HEADER = ["property", "transfers", "assistant"];

function TabFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
    </div>
  );
}

/** Section title + one plain-English line, shown above every tab's content. */
function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h2 className="text-[17px] font-semibold tracking-tight text-ink-900">
        {title}
      </h2>
      {subtitle && (
        <p className="text-[13px] text-ink-500 mt-1 max-w-2xl">{subtitle}</p>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const { workspace, fetchWorkspace } = useWorkspaceStore();
  const { activeWorkspace } = useAuthStore();
  const { isOwner } = usePermissions();
  const [params, setParams] = useSearchParams();
  const refresh = () => fetchWorkspace(activeWorkspace);

  // Grouped navigation. `subtitle` doubles as the section's one-line intro.
  const GROUPS = [
    {
      label: "Your hotel",
      tabs: [
        {
          id: "general",
          label: "Hotel details",
          icon: SlidersHorizontal,
          subtitle:
            "Your hotel's name, timezone and the language your AI answers in.",
        },
        {
          id: "property",
          label: "Property & rooms",
          icon: Hotel,
          subtitle:
            "Rooms, rates, photos, address and the booking sites your rooms sell on.",
        },
        {
          id: "extras",
          label: "Extras",
          icon: PackagePlus,
          subtitle:
            "Add-ons guests can buy — breakfast, late check-out, tours and more.",
        },
        {
          id: "transfers",
          label: "Airport transfers",
          icon: Car,
          subtitle: "Taxi and pick-up prices your AI can offer and book.",
        },
        {
          id: "pricing",
          label: "Pricing",
          icon: Tag,
          subtitle:
            "Direct-booking prices and the limits smart pricing must stay within.",
        },
      ],
    },
    {
      label: "Guests & AI",
      tabs: [
        {
          id: "channels",
          label: "WhatsApp",
          icon: MessageCircle,
          subtitle:
            "Connect your WhatsApp number, switch AI replies on or off, and set when it answers.",
        },
        {
          id: "assistant",
          label: "AI assistant",
          icon: Bot,
          subtitle: "How your AI concierge sounds and when it hands over to you.",
        },
      ],
    },
    {
      label: "Account",
      tabs: [
        ...(isOwner
          ? [
              {
                id: "team",
                label: "Team",
                icon: Users,
                subtitle: "Invite staff and choose what they can see.",
              },
              {
                id: "billing",
                label: "Billing & plan",
                icon: CreditCard,
                subtitle: "Your plan, payment method and invoices.",
              },
            ]
          : []),
        {
          id: "security",
          label: "Account & security",
          icon: Shield,
          subtitle: "Your login, password, and signing out.",
        },
      ],
    },
  ];
  const TABS = GROUPS.flatMap((g) => g.tabs);

  const urlTab = params.get("tab");
  const tab = TABS.some((t) => t.id === urlTab) ? urlTab : "property";
  const current = TABS.find((t) => t.id === tab);
  const setTab = (id) =>
    setParams(id === "property" ? {} : { tab: id }, { replace: true });

  return (
    <div className="min-h-full">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-5 lg:mb-7">
          <h1 className="text-[22px] font-semibold tracking-tight text-ink-900">
            Settings
          </h1>
          <p className="text-[13px] text-ink-500 mt-0.5">
            Your hotel, WhatsApp, AI assistant and account.
          </p>
        </div>

        <div className="lg:flex lg:gap-8">
          {/* Left rail (desktop) / chip strip (phones & tablets). */}
          <nav
            aria-label="Settings sections"
            className="lg:w-[230px] lg:shrink-0 mb-6 lg:mb-0"
          >
            {/* Phones/tablets: one scrollable row of chips. */}
            <div className="lg:hidden -mx-4 px-4 flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {TABS.map((t) => {
                const Icon = t.icon;
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    aria-current={active ? "page" : undefined}
                    className={`shrink-0 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-[13px] transition ${
                      active
                        ? "border-brand-200 bg-brand-50 text-brand-700 font-medium"
                        : "border-ink-100 bg-white text-ink-600"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Desktop: grouped vertical list, sticky while scrolling. */}
            <div className="hidden lg:block sticky top-6 space-y-5">
              {GROUPS.filter((g) => g.tabs.length).map((g) => (
                <div key={g.label}>
                  <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
                    {g.label}
                  </p>
                  <div className="space-y-0.5">
                    {g.tabs.map((t) => {
                      const Icon = t.icon;
                      const active = tab === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => setTab(t.id)}
                          aria-current={active ? "page" : undefined}
                          className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13.5px] transition ${
                            active
                              ? "bg-brand-50 text-ink-900 font-medium"
                              : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
                          }`}
                        >
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              active ? "text-brand-500" : "text-ink-400"
                            }`}
                            strokeWidth={1.75}
                          />
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </nav>

          {/* Content pane. Embedded pages keep their own inner layouts; the
              .settings-embed class only neutralises their outer max-width. */}
          <main className="flex-1 min-w-0">
            {/* Pages lifted in from former routes already carry their own
                title, so only the native sections get one here. */}
            {!OWN_HEADER.includes(tab) && (
              <SectionHeader title={current?.label} subtitle={current?.subtitle} />
            )}

            <Suspense fallback={<TabFallback />}>
              {tab === "general" && (
                <div className="max-w-3xl">
                  <GeneralSettings workspace={workspace} onSave={refresh} />
                </div>
              )}
              {tab === "property" && (
                <div className="settings-embed">
                  <PropertyPage />
                </div>
              )}
              {tab === "extras" && <ExtrasSettings />}
              {tab === "transfers" && (
                <div className="settings-embed">
                  <TransfersPage />
                </div>
              )}
              {tab === "pricing" && <PricingSettings />}

              {tab === "channels" && (
                <div className="space-y-6">
                  <div className="max-w-3xl space-y-6">
                    <WhatsAppAiToggle workspace={workspace} onSave={refresh} />
                  </div>
                  <div className="settings-embed">
                    <ChannelsPage hideHeader />
                  </div>
                  <div className="max-w-3xl space-y-6">
                    <ReplyTimingSettings workspace={workspace} onSave={refresh} />
                    <HolidayModeCard workspace={workspace} onSave={refresh} />
                  </div>
                </div>
              )}
              {tab === "assistant" && (
                <div className="settings-embed">
                  <IgAiBotPage />
                </div>
              )}

              {tab === "team" && isOwner && (
                <div className="settings-embed">
                  <TeamPage />
                </div>
              )}
              {tab === "billing" && isOwner && (
                <div className="settings-embed">
                  <BillingPage />
                </div>
              )}
              {tab === "security" && (
                <div className="max-w-3xl">
                  <SecuritySettings
                    onGoToTeam={isOwner ? () => setTab("team") : undefined}
                  />
                </div>
              )}
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}

/**
 * WhatsApp AI replies — the one switch a hotelier reaches for when they want
 * to answer guests themselves. Writes aiSettings.whatsappAiEnabled through the
 * dotted-key path on PUT /workspaces/:id (so the rest of aiSettings is never
 * touched). Off = guest messages still land in the Inbox; nothing automated is
 * sent on WhatsApp.
 */
function WhatsAppAiToggle({ workspace, onSave }) {
  const stored = workspace?.aiSettings?.whatsappAiEnabled !== false;
  const [on, setOn] = useState(stored);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setOn(stored);
  }, [stored]);

  // Other switches that silently stop every reply — surfaced so "on" is honest.
  const automationOff = workspace?.settings?.automationEnabled === false;
  const assistantOff = workspace?.aiSettings?.enabled === false;

  const toggle = async () => {
    if (!workspace?._id || saving) return;
    const next = !on;
    setOn(next);
    setSaving(true);
    try {
      await api.put(`/workspaces/${workspace._id}`, {
        "aiSettings.whatsappAiEnabled": next,
      });
      // The legacy global automation switch drops guest messages entirely when
      // off and no longer has its own control — make sure it's on.
      if (next && automationOff) {
        await api.put("/instagram/settings", { automationEnabled: true });
      }
      toast.success(next ? "AI replies are on" : "AI replies paused");
      onSave?.();
    } catch (err) {
      setOn(!next);
      toast.error(err.response?.data?.message || "Couldn't update AI replies");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className={`card p-4 sm:p-5 border ${
        on ? "border-emerald-200" : "border-amber-200"
      }`}
    >
      <div className="flex items-start gap-4">
        <span
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
            on ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
          }`}
        >
          {on ? (
            <Sparkles className="w-5 h-5" />
          ) : (
            <PauseCircle className="w-5 h-5" />
          )}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-[15px] font-semibold text-ink-900">
                WhatsApp AI replies
              </h3>
              <p className="text-[13px] text-ink-500 mt-0.5">
                {on
                  ? "Your AI answers guests on WhatsApp automatically, day and night."
                  : "AI is paused — you'll reply to guests yourself from the Inbox."}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={on}
              aria-label="WhatsApp AI replies"
              onClick={toggle}
              disabled={saving || !workspace?._id}
              className={`relative w-14 h-8 rounded-full transition-colors shrink-0 disabled:opacity-60 ${
                on ? "bg-emerald-500" : "bg-ink-300"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  on ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {!on && (
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-amber-50 px-3 py-2 text-[12.5px] text-amber-800">
              <span>
                Guest messages still arrive in your Inbox — nothing is sent
                automatically until you switch this back on.
              </span>
              <Link
                to="/dashboard/inbox"
                className="inline-flex items-center gap-1 font-semibold text-amber-900 hover:underline"
              >
                Open Inbox <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {on && assistantOff && (
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-[12.5px] text-amber-800">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-px" />
              <span>
                Your AI assistant is switched off in the AI assistant tab, so it
                won't reply yet. Turn it on there too.
              </span>
            </div>
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
      <div className="card p-4 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
          <Shield className="w-5 h-5 text-brand-500" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-ink-900 truncate">{user?.name}</p>
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
      <div className="card p-4 sm:p-5 space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-ink-500" />
          <h3 className="text-sm font-semibold text-ink-900">
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

      {/* Who else can sign in — owners only; staff can't manage the team. */}
      {onGoToTeam && (
      <div className="card p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-1.5">
          <Shield className="w-4 h-4 text-ink-500" />
          <h3 className="text-sm font-semibold text-ink-900">
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
      <div className="card p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-1.5">
          <LifeBuoy className="w-4 h-4 text-ink-500" />
          <h3 className="text-sm font-semibold text-ink-900">Need help?</h3>
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

      {/* Danger zone */}
      <div className="rounded-2xl border border-red-200 bg-red-50/40 p-4 sm:p-5 space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <h3 className="text-sm font-semibold text-red-700">Danger zone</h3>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink-900">Log out</p>
            <p className="text-xs text-ink-500">
              Sign out on this device. Bookings and guest messages keep running
              while you're signed out.
            </p>
          </div>
          <button
            onClick={doLogout}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white text-red-600 font-bold text-sm px-4 py-2.5 hover:bg-red-50 transition shrink-0"
          >
            <LogOut className="w-4 h-4" /> Log out
          </button>
        </div>

        {onGoToTeam && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-red-100 pt-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink-900">Delete a property</p>
              <p className="text-xs text-ink-500">
                Permanently removes a property and its guests, messages and
                settings. Cancel its plan under Billing first — deleting doesn't
                stop billing.
              </p>
            </div>
            <button
              onClick={() => navigate("/accounts")}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white text-red-600 font-bold text-sm px-4 py-2.5 hover:bg-red-50 transition shrink-0"
            >
              Manage properties <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
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
    <div className="card p-4 sm:p-5 space-y-4">
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
 * Reply timing — how quickly and during which hours the AI answers guests.
 * The on/off switch now lives in WhatsAppAiToggle above; the old global
 * "automationEnabled" toggle is gone because switching it off dropped guest
 * messages entirely instead of leaving them in the Inbox.
 *
 * Persists to `PUT /instagram/settings` — the route name is historical; it
 * writes workspace.settings, which the reply pipeline reads.
 */
function ReplyTimingSettings({ workspace, onSave }) {
  const [form, setForm] = useState({
    minDelayMinutes: workspace?.settings?.minDelayMinutes ?? 1,
    maxDelayMinutes: workspace?.settings?.maxDelayMinutes ?? 5,
    activeHourStart: workspace?.settings?.activeHourStart ?? 8,
    activeHourEnd: workspace?.settings?.activeHourEnd ?? 22,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (workspace?.settings)
      setForm({
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
    <div className="card p-4 sm:p-5 space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-ink-500" />
          <h3 className="text-sm font-semibold text-ink-900">Reply timing</h3>
        </div>
        <p className="text-xs text-ink-500 mt-0.5">
          How fast your AI answers, and during which hours.
        </p>
      </div>

      {/* Delay range */}
      <div className="border-t border-ink-100 pt-4">
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
