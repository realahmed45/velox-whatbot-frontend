import { useEffect, useState } from "react";
import api from "@/services/api";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import {
  Save,
  Instagram,
  Loader2,
  Trash2,
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
} from "lucide-react";
import StatHero from "@/components/ui/StatHero";
import PasswordStrength from "@/components/auth/PasswordStrength";
import { checkPassword } from "@/utils/passwordPolicy";
import { useNavigate } from "react-router-dom";

const SUPPORT_EMAIL = "contactus@botlify.site";

export default function SettingsPage() {
  const { workspace, fetchWorkspace } = useWorkspaceStore();
  const { activeWorkspace } = useAuthStore();
  const [tab, setTab] = useState("general");

  const TABS = [
    { id: "general", label: "General" },
    { id: "instagram", label: "Instagram" },
    { id: "automation", label: "Automations" },
    { id: "security", label: "Security" },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <StatHero
        icon={SettingsIcon}
        title="Settings"
        subtitle="Workspace, Instagram, and automation defaults"
      />
      <div className="flex gap-1 bg-ink-100 rounded-xl p-1 mb-5 sm:mb-6 max-w-md">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap ${tab === t.id ? "bg-white text-ink-900 shadow-sm" : "text-ink-500 hover:text-ink-700"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "general" && (
        <GeneralSettings
          workspace={workspace}
          onSave={() => fetchWorkspace(activeWorkspace)}
        />
      )}
      {tab === "instagram" && (
        <InstagramSettings
          workspace={workspace}
          onSave={() => fetchWorkspace(activeWorkspace)}
        />
      )}
      {tab === "automation" && (
        <AutomationSettings
          workspace={workspace}
          onSave={() => fetchWorkspace(activeWorkspace)}
        />
      )}
      {tab === "security" && <SecuritySettings />}
    </div>
  );
}

function SecuritySettings() {
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
          Sign out of Botlify on this device.
        </p>
        <button
          onClick={doLogout}
          className="inline-flex items-center gap-2 rounded-xl border border-red-200 text-red-600 font-bold text-sm px-4 py-2.5 hover:bg-red-50 transition"
        >
          <LogOut className="w-4 h-4" /> Log out
        </button>
      </div>

      {/* Support */}
      <div className="card p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-1.5">
          <LifeBuoy className="w-4 h-4 text-ink-500" />
          <h3 className="text-sm font-bold text-ink-900">Need help?</h3>
        </div>
        <p className="text-xs text-ink-500">
          Questions, account issues, or security concerns — email us at{" "}
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
        <label className="label">Workspace name</label>
        <input
          className="input"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
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
      </div>
      <div>
        <label className="label">
          Default language{" "}
          <span className="text-xs text-ink-400">(AI replies, captions)</span>
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
      </div>
      <button onClick={save} disabled={loading} className="btn-primary gap-2">
        <Save className="w-4 h-4" />
        {loading ? "Saving…" : "Save changes"}
      </button>
    </div>
  );
}

function InstagramSettings({ workspace, onSave }) {
  const ig = workspace?.instagram;
  const [oauthLoading, setOauthLoading] = useState(false);
  const [diagLoading, setDiagLoading] = useState(false);
  const [diag, setDiag] = useState(null);
  const [resubLoading, setResubLoading] = useState(false);

  const startOAuth = async () => {
    setOauthLoading(true);
    try {
      const { data } = await api.get("/instagram/connect/oauth-url");
      window.location.href = data.url;
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Connection failed. Please try again.",
      );
      setOauthLoading(false);
    }
  };

  const disconnect = async () => {
    if (!window.confirm("Disconnect Instagram? Automations will stop.")) return;
    try {
      await api.delete("/instagram/connect");
      toast.success("Disconnected");
      onSave();
    } catch {
      toast.error("Failed to disconnect");
    }
  };

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

  return (
    <div className="card p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {ig?.profilePicture ? (
            <img
              src={ig.profilePicture}
              className="w-10 h-10 rounded-full border border-pink-200 object-cover"
              alt=""
            />
          ) : (
            <div className="w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center">
              <Instagram className="w-5 h-5 text-pink-500" />
            </div>
          )}
          <div>
            <p className="font-semibold text-sm text-ink-900">
              {ig?.status === "connected" ? `@${ig.username}` : "Not connected"}
            </p>
            <span
              className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                ig?.status === "connected"
                  ? "bg-green-100 text-green-700"
                  : "bg-ink-100 text-ink-500"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${ig?.status === "connected" ? "bg-green-500" : "bg-ink-400"}`}
              />
              {ig?.status === "connected" ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>
        {ig?.status === "connected" && (
          <button
            onClick={disconnect}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition"
          >
            <Trash2 className="w-3 h-3" />
            Disconnect
          </button>
        )}
      </div>

      {ig?.status !== "connected" && (
        <button
          onClick={startOAuth}
          disabled={oauthLoading}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 text-white font-semibold py-3 rounded-md hover:opacity-90 transition disabled:opacity-60"
        >
          {oauthLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Instagram className="w-4 h-4" />
          )}
          Connect Instagram
        </button>
      )}

      {ig?.status === "connected" && (
        <>
          {ig?.connectedAt && (
            <p className="text-xs text-ink-400">
              Connected {new Date(ig.connectedAt).toLocaleDateString()}
            </p>
          )}

          <div className="border border-ink-100 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-ink-800">
                  Automation Health
                </p>
                <p className="text-xs text-ink-500 mt-0.5">
                  Check if Instagram is delivering DMs and events to Botlify
                </p>
              </div>
              <button
                onClick={runDiagnose}
                disabled={diagLoading}
                className="flex items-center gap-1.5 text-xs font-medium bg-ink-50 hover:bg-ink-100 border border-ink-200 px-3 py-1.5 rounded-lg transition disabled:opacity-60"
              >
                {diagLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
                Run Diagnostics
              </button>
            </div>

            {diag && (
              <div className="space-y-2">
                {diag.checks?.map((c, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2 p-2.5 rounded-lg text-xs ${c.ok ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-800"}`}
                  >
                    <span className="mt-0.5 shrink-0">
                      {c.ok ? "✅" : "⚠️"}
                    </span>
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
                      Some events aren't coming through. Try this:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 pl-1">
                      <li>
                        Make sure your Instagram is a{" "}
                        <strong>Business or Creator</strong> account.
                      </li>
                      <li>
                        Click <strong>Re-subscribe Webhook</strong> below to
                        refresh the connection.
                      </li>
                      <li>
                        Send a test DM from another account — it should appear in
                        your Inbox within a few seconds.
                      </li>
                      <li>
                        Still stuck? Disconnect and reconnect Instagram from the
                        top of this page.
                      </li>
                    </ol>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={resubscribe}
              disabled={resubLoading}
              className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold py-2.5 rounded-lg transition disabled:opacity-60"
            >
              {resubLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              Re-subscribe Webhook
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function AutomationSettings({ workspace, onSave }) {
  const [form, setForm] = useState({
    automationEnabled: workspace?.settings?.automationEnabled ?? true,
    minDelayMinutes: workspace?.settings?.minDelayMinutes ?? 1,
    maxDelayMinutes: workspace?.settings?.maxDelayMinutes ?? 5,
    activeHourStart: workspace?.settings?.activeHourStart ?? 8,
    activeHourEnd: workspace?.settings?.activeHourEnd ?? 22,
  });
  const [vip, setVip] = useState({
    enabled: workspace?.vipComments?.enabled ?? false,
    usernamesText: (workspace?.vipComments?.usernames || []).join(", "),
    autoDmTemplate: workspace?.vipComments?.autoDmTemplate || "",
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
    if (workspace?.vipComments)
      setVip({
        enabled: workspace.vipComments.enabled ?? false,
        usernamesText: (workspace.vipComments.usernames || []).join(", "),
        autoDmTemplate: workspace.vipComments.autoDmTemplate || "",
      });
  }, [workspace]);

  const save = async () => {
    setLoading(true);
    try {
      const usernames = vip.usernamesText
        .split(/[,\n]/)
        .map((u) => u.trim())
        .filter(Boolean);
      await api.put("/instagram/settings", {
        ...form,
        vipComments: {
          enabled: vip.enabled,
          usernames,
          autoDmTemplate: vip.autoDmTemplate,
        },
      });
      toast.success("Automation settings saved");
      onSave();
    } catch (err) {
      toast.error("Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6 space-y-5">
      {/* Master toggle */}
      <div className="flex items-center justify-between py-2">
        <div>
          <p className="font-medium text-ink-800 text-sm">Enable Automation</p>
          <p className="text-xs text-ink-500">
            Turn all DM automations on or off globally
          </p>
        </div>
        <button
          onClick={() =>
            setForm((f) => ({ ...f, automationEnabled: !f.automationEnabled }))
          }
          className={`relative w-11 h-6 rounded-full transition-colors ${
            form.automationEnabled ? "bg-brand-600" : "bg-ink-300"
          }`}
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
          Random delay before sending automated DMs (avoids spam detection)
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
          Only send automated DMs within this window
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

      {/* VIP Comment Prioritizer (B4) */}
      <div className="border-t border-ink-100 pt-5">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="font-medium text-ink-800 text-sm">
              VIP Comment Prioritizer
            </p>
            <p className="text-xs text-ink-500">
              Flag comments from specific usernames as VIP (adds "vip" tag +
              optional auto-DM).
            </p>
          </div>
          <button
            type="button"
            onClick={() => setVip((v) => ({ ...v, enabled: !v.enabled }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full ${vip.enabled ? "bg-brand-600" : "bg-ink-300"}`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${vip.enabled ? "translate-x-5" : "translate-x-0"}`}
            />
          </button>
        </div>
        <label className="label text-xs">
          VIP Instagram usernames (comma-separated)
        </label>
        <textarea
          rows={2}
          className="input text-sm"
          placeholder="@selenagomez, @cristiano, ..."
          value={vip.usernamesText}
          onChange={(e) => setVip({ ...vip, usernamesText: e.target.value })}
          disabled={!vip.enabled}
        />
        <label className="label text-xs mt-3">
          Auto-DM template (optional)
        </label>
        <input
          className="input text-sm"
          placeholder="Hey {name}! Thanks for commenting — huge fan. DM us anytime 💙"
          value={vip.autoDmTemplate}
          onChange={(e) => setVip({ ...vip, autoDmTemplate: e.target.value })}
          disabled={!vip.enabled}
          maxLength={500}
        />
      </div>

      <button onClick={save} disabled={loading} className="btn-primary gap-2">
        <Save className="w-4 h-4" />
        {loading ? "Saving…" : "Save settings"}
      </button>
    </div>
  );
}
