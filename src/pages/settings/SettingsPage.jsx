import { useEffect, useState } from "react";
import api from "@/services/api";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import { Save, Instagram, AlertCircle, Loader2, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const { workspace, fetchWorkspace } = useWorkspaceStore();
  const { activeWorkspace } = useAuthStore();
  const [tab, setTab] = useState("general");

  const TABS = [
    { id: "general", label: "General" },
    { id: "instagram", label: "Instagram" },
    { id: "automation", label: "Automation" },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-4 sm:mb-6">Settings</h1>
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-4 sm:mb-6 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium transition whitespace-nowrap ${tab === t.id ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
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
    </div>
  );
}

function GeneralSettings({ workspace, onSave }) {
  const [form, setForm] = useState({
    name: workspace?.name || "",
    timezone: workspace?.timezone || "Asia/Karachi",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (workspace)
      setForm({
        name: workspace.name,
        timezone: workspace.timezone || "Asia/Karachi",
      });
  }, [workspace]);

  const save = async () => {
    setLoading(true);
    try {
      await api.put(`/workspaces/${workspace._id}`, {
        name: form.name,
        timezone: form.timezone,
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
            <p className="font-semibold text-sm text-gray-900">
              {ig?.status === "connected" ? `@${ig.username}` : "Not connected"}
            </p>
            <span
              className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                ig?.status === "connected"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${ig?.status === "connected" ? "bg-green-500" : "bg-gray-400"}`}
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
        <p className="text-xs text-gray-400">
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
          <p className="font-medium text-gray-800 text-sm">Enable Automation</p>
          <p className="text-xs text-gray-500">
            Turn all DM automations on or off globally
          </p>
        </div>
        <button
          onClick={() =>
            setForm((f) => ({ ...f, automationEnabled: !f.automationEnabled }))
          }
          className={`relative w-11 h-6 rounded-full transition-colors ${
            form.automationEnabled ? "bg-brand-600" : "bg-gray-300"
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
        <p className="text-xs text-gray-400 mb-3">
          Random delay before sending automated DMs (avoids spam detection)
        </p>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="text-xs text-gray-500">Min</label>
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
          <span className="text-gray-400 mt-5">–</span>
          <div className="flex-1">
            <label className="text-xs text-gray-500">Max</label>
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
        <p className="text-xs text-gray-400 mb-3">
          Only send automated DMs within this window
        </p>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="text-xs text-gray-500">From (hour 0–23)</label>
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
          <span className="text-gray-400 mt-5">–</span>
          <div className="flex-1">
            <label className="text-xs text-gray-500">To (hour 0–23)</label>
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
