/**
 * Settings — everything a hotelier needs to run Botlify, in one place.
 *
 * Hotels-only: guests are answered inside the OTA inboxes (Booking.com,
 * Airbnb, Expedia — via the booking-channel connection) and on WhatsApp.
 * Messenger / Telegram tools and the old developer-ish knobs are no longer
 * surfaced here.
 *
 * Layout: a grouped left rail on desktop, a scrollable chip strip on phones.
 * Tab ids are the ?tab= deep-link contract (CommandPalette, ConnectChannelGate
 * and the AI Assistant link to them) — keep them stable. ?tab=services opens
 * the hotel's services editor (ServicesSettings.jsx).
 */
import { useEffect, useState, lazy, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
  Car,
  Users,
  CreditCard,
  SlidersHorizontal,
  MessageCircle,
  AlertTriangle,
  ArrowRight,
  Clock,
  Sparkles,
  Wallet,
} from "lucide-react";
import HolidayModeCard from "@/components/HolidayModeCard";
import PasswordStrength from "@/components/auth/PasswordStrength";
import { checkPassword } from "@/utils/passwordPolicy";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";
import ExtrasSettings from "@/pages/settings/ExtrasSettings";

// Heavy, self-contained screens that used to own a sidebar entry. Lazy so the
// Settings bundle doesn't pull all of them in at once.
const PropertyPage = lazy(() => import("@/pages/hotel/PropertyPage"));
const ChannelsPage = lazy(() => import("@/pages/hotel/ChannelsPage"));
const TransfersPage = lazy(() => import("@/pages/hotel/TransfersPage"));
const IgAiBotPage = lazy(() => import("@/pages/ai-bot/IgAiBotPage"));
const TeamPage = lazy(() => import("@/pages/team/TeamPage"));
const BillingPage = lazy(() => import("@/pages/billing/BillingPage"));
const ServicesSettings = lazy(() => import("@/pages/settings/ServicesSettings"));
const PaymentsSettings = lazy(() => import("@/pages/settings/PaymentsSettings"));

const SUPPORT_EMAIL = "contactus@botlify.site";

// Embedded pages that render their own page title.
const OWN_HEADER = ["property", "transfers", "assistant"];

function TabFallback() {
  return (
    <div className="space-y-4 py-2" aria-busy="true">
      <div className="h-6 w-48 rounded-lg bg-neutral-100 animate-pulse" />
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 space-y-3">
        <div className="h-4 w-1/3 rounded bg-neutral-100 animate-pulse" />
        <div className="h-10 rounded-xl bg-neutral-100 animate-pulse" />
        <div className="h-10 rounded-xl bg-neutral-100 animate-pulse" />
        <div className="h-10 w-2/3 rounded-xl bg-neutral-100 animate-pulse" />
      </div>
    </div>
  );
}

/** Section title + one plain-English line, shown above every tab's content. */
function SectionHeader({ title, subtitle, icon: Icon }) {
  return (
    <div className="mb-6 flex items-start gap-3.5 border-b border-neutral-200/70 pb-5 font-geist">
      {Icon && (
        <span className="hidden sm:grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#0A0A0A] text-[#FF5A1F]">
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
        </span>
      )}
      <div className="min-w-0">
        <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-[#0A0A0A]">
          {title}
        </h2>
        {subtitle && (
          <p className="text-[14px] text-neutral-500 mt-0.5 max-w-2xl">{subtitle}</p>
        )}
      </div>
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
          id: "services",
          label: "Services",
          icon: Sparkles,
          subtitle:
            "Massage, airport pickup, tours and more — shown on your website and offered by your AI.",
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
      ],
    },
    {
      label: "Guests & AI",
      tabs: [
        {
          id: "channels",
          label: "Channels",
          icon: MessageCircle,
          subtitle:
            "Connect Airbnb, Booking.com, Expedia and WhatsApp, and set when your AI answers.",
        },
        {
          id: "assistant",
          label: "AI assistant",
          icon: Bot,
          subtitle:
            "Switch AI replies on or off, set how it sounds and when it hands over to you.",
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
                id: "payments",
                label: "Guest payments",
                icon: Wallet,
                subtitle:
                  "Let guests pay online when your AI books — money goes straight to your account.",
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
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-10">
        <header className="mb-6 lg:mb-8 font-geist">
          <h1 className="text-[26px] sm:text-[30px] font-semibold tracking-[-0.03em] text-[#0A0A0A]">
            Settings<span className="text-[#FF5A1F]">.</span>
          </h1>
          <p className="text-[14px] sm:text-[15px] text-neutral-500 mt-1">
            Your hotel, channels, AI assistant and account — all in one place.
          </p>
        </header>

        <div className="lg:flex lg:gap-10">
          {/* Left rail (desktop) / chip strip (phones & tablets). */}
          <nav
            aria-label="Settings sections"
            className="lg:w-[220px] lg:shrink-0 mb-6 lg:mb-0 font-geist"
          >
            {/* Phones/tablets: one scrollable row of chips with a sliding pill. */}
            <div className="lg:hidden -mx-4 px-4 overflow-x-auto no-scrollbar pb-1">
              <div className="inline-flex gap-1 rounded-2xl bg-neutral-100 p-1">
                {TABS.map((t) => {
                  const Icon = t.icon;
                  const active = tab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      aria-current={active ? "page" : undefined}
                      className={`relative shrink-0 inline-flex min-h-[40px] items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 text-[13.5px] font-semibold transition-colors active:scale-[0.97] ${
                        active ? "text-white" : "text-neutral-500 hover:text-[#0A0A0A]"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="settings-tab-pill-m"
                          className="absolute inset-0 rounded-xl bg-[#0A0A0A]"
                          transition={{ type: "spring", stiffness: 500, damping: 38 }}
                        />
                      )}
                      <Icon
                        className={`relative h-3.5 w-3.5 ${active ? "text-[#FF5A1F]" : ""}`}
                        strokeWidth={2}
                      />
                      <span className="relative">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Desktop: grouped vertical rail, sticky while scrolling. */}
            <div className="hidden lg:block sticky top-6 space-y-6">
              {GROUPS.filter((g) => g.tabs.length).map((g) => (
                <div key={g.label}>
                  <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
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
                          className={`relative w-full flex min-h-[40px] items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[14px] transition-colors active:scale-[0.98] ${
                            active
                              ? "text-white font-semibold"
                              : "text-neutral-600 hover:bg-neutral-100 hover:text-[#0A0A0A]"
                          }`}
                        >
                          {active && (
                            <motion.span
                              layoutId="settings-tab-pill"
                              className="absolute inset-0 rounded-xl bg-[#0A0A0A] shadow-[0_6px_16px_-8px_rgba(10,10,10,0.5)]"
                              transition={{ type: "spring", stiffness: 500, damping: 38 }}
                            />
                          )}
                          <Icon
                            className={`relative h-4 w-4 shrink-0 ${
                              active ? "text-[#FF5A1F]" : "text-neutral-400"
                            }`}
                            strokeWidth={2}
                          />
                          <span className="relative truncate">{t.label}</span>
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
            <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tab}
              // Opacity only: a lingering transform/filter here would trap the
              // fixed-position modals of embedded pages inside this box.
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
            {/* Pages lifted in from former routes already carry their own
                title, so only the native sections get one here. */}
            {!OWN_HEADER.includes(tab) && (
              <SectionHeader
                title={current?.label}
                subtitle={current?.subtitle}
                icon={current?.icon}
              />
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
              {tab === "services" && (
                <div className="max-w-4xl">
                  <ServicesSettings />
                </div>
              )}
              {tab === "extras" && <ExtrasSettings />}
              {tab === "transfers" && (
                <div className="settings-embed">
                  <TransfersPage />
                </div>
              )}

              {tab === "channels" && (
                <div className="space-y-6">
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
              {tab === "payments" && isOwner && <PaymentsSettings />}
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
            </motion.div>
            </AnimatePresence>
          </main>
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
      <div className="group card p-4 flex items-center gap-3">
        <div className="relative w-11 h-11 shrink-0">
          <span aria-hidden className="absolute inset-0 rounded-xl bg-sunset opacity-30 blur-lg" />
          <div className="relative w-11 h-11 rounded-xl bg-sunset text-white flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]">
            <Shield className="w-5 h-5" strokeWidth={1.8} />
          </div>
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-ink-900 truncate">{user?.name}</p>
          <p className="text-xs text-ink-500 truncate">{user?.email}</p>
        </div>
        <div className="ml-auto flex flex-wrap gap-1.5 justify-end">
          {user?.isEmailVerified && (
            <span className="badge-green inline-flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Verified
            </span>
          )}
          {hasGoogle && (
            <span className="badge-gray">
              Google linked
            </span>
          )}
        </div>
      </div>

      {/* Password */}
      <div className="card p-4 sm:p-5 space-y-4">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-sunset-soft text-sunset-flame">
            <KeyRound className="w-4 h-4" strokeWidth={1.8} />
          </span>
          <h3 className="text-sm font-semibold text-ink-900">
            {hasPassword ? "Change password" : "Set a password"}
          </h3>
        </div>

        {!loadingMe && !hasPassword && (
          <div className="bg-amber-50/80 ring-1 ring-amber-500/20 text-amber-800 text-xs p-3 rounded-xl">
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
      <div className="group card p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-sky-50 text-sky-600 transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]">
            <Shield className="w-4 h-4" strokeWidth={1.8} />
          </span>
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
      <div className="group card p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-sunset-soft text-sunset-flame transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-14deg]">
            <LifeBuoy className="w-4 h-4" strokeWidth={1.8} />
          </span>
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
      <div className="rounded-2xl bg-rose-50/80 ring-1 ring-rose-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] p-4 sm:p-5 space-y-4">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-rose-100 text-rose-600">
            <AlertTriangle className="w-4 h-4" strokeWidth={1.8} />
          </span>
          <h3 className="text-sm font-semibold text-rose-700">Danger zone</h3>
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
            className="btn shrink-0 bg-white text-rose-600 ring-1 ring-rose-500/25 shadow-[inset_0_1px_0_#fff] hover:-translate-y-0.5 hover:bg-rose-50 hover:shadow-[0_10px_24px_-12px_rgba(225,29,72,0.45)]"
          >
            <LogOut className="w-4 h-4" /> Log out
          </button>
        </div>

        {onGoToTeam && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-rose-500/15 pt-4">
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
              className="btn shrink-0 bg-white text-rose-600 ring-1 ring-rose-500/25 shadow-[inset_0_1px_0_#fff] hover:-translate-y-0.5 hover:bg-rose-50 hover:shadow-[0_10px_24px_-12px_rgba(225,29,72,0.45)]"
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
 * The on/off switches live in Settings → AI assistant; the old global
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
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-sunset-soft text-sunset-flame">
            <Clock className="w-4 h-4" strokeWidth={1.8} />
          </span>
          <h3 className="text-sm font-semibold text-ink-900">Reply timing</h3>
        </div>
        <p className="text-xs text-ink-500 mt-0.5">
          How fast your AI answers, and during which hours.
        </p>
      </div>

      {/* Delay range */}
      <div className="border-t border-ink-900/[0.06] pt-4">
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
