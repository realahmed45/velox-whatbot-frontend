import { useEffect, useState } from "react";
import api from "@/services/api";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import {
  Save,
  Instagram,
  AlertCircle,
  Loader2,
  Trash2,
  Settings as SettingsIcon,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";

export default function SettingsPage() {
  const { workspace, fetchWorkspace } = useWorkspaceStore();
  const { activeWorkspace } = useAuthStore();
  const [tab, setTab] = useState("general");

  const TABS = [
    { id: "general", label: "General" },
    { id: "instagram", label: "Instagram" },
    { id: "automation", label: "Automation" },
    { id: "branding", label: "Branding" },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <PageHeader
        icon={SettingsIcon}
        title="Settings"
        subtitle="Configure your workspace, Instagram account, and automation defaults"
      />
      <div className="flex gap-1 bg-ink-100 rounded-lg p-1 mb-5 sm:mb-6 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium transition whitespace-nowrap ${tab === t.id ? "bg-white text-ink-800 shadow-sm" : "text-ink-500 hover:text-ink-700"}`}
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
      {tab === "branding" && (
        <BrandingSettings
          workspace={workspace}
          onSave={() => fetchWorkspace(activeWorkspace)}
        />
      )}
    </div>
  );
}

function BrandingSettings({ workspace, onSave }) {
  const plan = workspace?.subscription?.plan;
  const isAgency = plan === "agency" || plan === "business";
  const [form, setForm] = useState({
    brandName: workspace?.branding?.brandName || "",
    logoUrl: workspace?.branding?.logoUrl || "",
    primaryColor: workspace?.branding?.primaryColor || "#6366f1",
    customDomain: workspace?.branding?.customDomain || "",
    hideBotlify: workspace?.branding?.hideBotlify || false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (workspace?.branding) {
      setForm({
        brandName: workspace.branding.brandName || "",
        logoUrl: workspace.branding.logoUrl || "",
        primaryColor: workspace.branding.primaryColor || "#6366f1",
        customDomain: workspace.branding.customDomain || "",
        hideBotlify: workspace.branding.hideBotlify || false,
      });
    }
  }, [workspace]);

  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/workspaces/${workspace._id}`, { branding: form });
      toast.success("Branding saved");
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-4 sm:p-6 space-y-4">
      {!isAgency && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-lg">
          <b>White-label is an Agency / Business plan feature.</b> Upgrade to
          hide Botlify branding, use your own domain, and custom logo on public
          pages.
        </div>
      )}
      <div>
        <label className="label">Brand Name</label>
        <input
          className="input"
          placeholder="Your Agency Name"
          value={form.brandName}
          onChange={(e) => setForm({ ...form, brandName: e.target.value })}
        />
      </div>
      <div>
        <label className="label">Logo URL</label>
        <input
          className="input"
          placeholder="https://…/logo.png"
          value={form.logoUrl}
          onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Primary Color</label>
          <input
            type="color"
            className="input h-10 p-1"
            value={form.primaryColor}
            onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Custom Domain</label>
          <input
            className="input"
            placeholder="app.youragency.com"
            value={form.customDomain}
            onChange={(e) => setForm({ ...form, customDomain: e.target.value })}
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.hideBotlify}
          onChange={(e) => setForm({ ...form, hideBotlify: e.target.checked })}
          disabled={!isAgency}
        />
        <span>Hide "Powered by Botlify" footer on public pages</span>
      </label>
      <button
        onClick={save}
        disabled={saving || !isAgency}
        className="btn-primary gap-2 disabled:opacity-50"
      >
        <Save className="w-4 h-4" />
        {saving ? "Saving…" : "Save branding"}
      </button>
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
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-60"
        >
          {oauthLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Instagram className="w-4 h-4" />
          )}
          Connect Instagram
        </button>
      )}

      {ig?.status === "connected" && ig?.connectedAt && (
        <p className="text-xs text-ink-400">
          Connected {new Date(ig.connectedAt).toLocaleDateString()}
        </p>
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
