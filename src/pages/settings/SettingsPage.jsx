import { useEffect, useState } from "react";
import api from "@/services/api";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import {
  Save,
  RefreshCw,
  ExternalLink,
  Globe,
  Clock,
  Users,
  MessageSquare,
} from "lucide-react";

export default function SettingsPage() {
  const { workspace, fetchWorkspace } = useWorkspaceStore();
  const { activeWorkspace } = useAuthStore();
  const [tab, setTab] = useState("general");

  const TABS = [
    { id: "general", label: "General" },
    { id: "whatsapp", label: "WhatsApp" },
    { id: "business-hours", label: "Business Hours" },
    { id: "team", label: "Team" },
  ];

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Settings</h1>
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${tab === t.id ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
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
      {tab === "whatsapp" && (
        <WhatsAppSettings
          workspace={workspace}
          onSave={() => fetchWorkspace(activeWorkspace)}
        />
      )}
      {tab === "business-hours" && (
        <BusinessHoursSettings workspace={workspace} />
      )}
      {tab === "team" && <TeamSettings workspace={workspace} />}
    </div>
  );
}

function GeneralSettings({ workspace, onSave }) {
  const [form, setForm] = useState({
    name: workspace?.name || "",
    timezone: workspace?.timezone || "Asia/Karachi",
    welcomeMessage: workspace?.settings?.welcomeMessage || "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (workspace)
      setForm({
        name: workspace.name,
        timezone: workspace.timezone || "Asia/Karachi",
        welcomeMessage: workspace.settings?.welcomeMessage || "",
      });
  }, [workspace]);

  const save = async () => {
    setLoading(true);
    try {
      await api.put(`/workspaces/${workspace._id}`, {
        name: form.name,
        timezone: form.timezone,
        settings: { welcomeMessage: form.welcomeMessage },
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
    <div className="card p-6 space-y-4">
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
        <label className="label">Welcome message (sent to new contacts)</label>
        <textarea
          className="input resize-none"
          rows={3}
          value={form.welcomeMessage}
          onChange={(e) => setForm({ ...form, welcomeMessage: e.target.value })}
          placeholder="Hi {{name}}! Welcome to our WhatsApp channel 👋"
        />
      </div>
      <button onClick={save} disabled={loading} className="btn-primary gap-2">
        <Save className="w-4 h-4" />
        {loading ? "Saving…" : "Save changes"}
      </button>
    </div>
  );
}

function WhatsAppSettings({ workspace, onSave }) {
  const wa = workspace?.whatsapp;
  const [provider, setProvider] = useState(wa?.type || "ultramsg");
  const [form, setForm] = useState({
    instanceId: "",
    token: "",
    phoneNumberId: "",
    accessToken: "",
    verifyToken: "",
  });
  const [loading, setLoading] = useState(false);
  const [qrUrl, setQrUrl] = useState("");

  const connectUltraMsg = async () => {
    setLoading(true);
    try {
      const { data } = await api.post(
        `/workspaces/${workspace._id}/connect-ultramsg`,
        { instanceId: form.instanceId, token: form.token },
      );
      if (data.qrUrl) setQrUrl(data.qrUrl);
      else {
        toast.success("Connected!");
        onSave();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const connectMeta = async () => {
    setLoading(true);
    try {
      await api.post(`/workspaces/${workspace._id}/connect-meta`, {
        phoneNumberId: form.phoneNumberId,
        accessToken: form.accessToken,
        verifyToken: form.verifyToken,
      });
      toast.success("Meta API connected!");
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const disconnect = async () => {
    if (!window.confirm("Disconnect WhatsApp? Bot will stop working.")) return;
    try {
      await api.post(`/workspaces/${workspace._id}/disconnect-whatsapp`);
      toast.success("Disconnected");
      onSave();
    } catch (err) {
      toast.error("Failed to disconnect");
    }
  };

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-800">WhatsApp Connection</p>
          <p className="text-sm text-gray-500">
            Current status:{" "}
            <span
              className={
                wa?.status === "connected"
                  ? "text-green-600 font-medium"
                  : "text-yellow-600 font-medium"
              }
            >
              {wa?.status || "not connected"}
            </span>
          </p>
        </div>
        {wa?.status === "connected" && (
          <button onClick={disconnect} className="btn-danger text-xs">
            Disconnect
          </button>
        )}
      </div>

      {wa?.status !== "connected" && (
        <>
          <div className="flex gap-2">
            {["ultramsg", "meta"].map((p) => (
              <button
                key={p}
                onClick={() => setProvider(p)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg border transition ${provider === p ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
              >
                {p === "ultramsg" ? "UltraMsg (QR)" : "Meta Cloud API"}
              </button>
            ))}
          </div>
          {provider === "ultramsg" ? (
            <>
              <div>
                <label className="label">Instance ID</label>
                <input
                  className="input"
                  placeholder="instance12345"
                  value={form.instanceId}
                  onChange={(e) =>
                    setForm({ ...form, instanceId: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="label">API Token</label>
                <input
                  className="input"
                  type="password"
                  value={form.token}
                  onChange={(e) => setForm({ ...form, token: e.target.value })}
                />
              </div>
              {qrUrl && (
                <img
                  src={qrUrl}
                  alt="QR"
                  className="mx-auto max-w-[220px] rounded-lg"
                />
              )}
              <button
                onClick={connectUltraMsg}
                className="btn-primary gap-2"
                disabled={loading}
              >
                <RefreshCw className="w-4 h-4" />
                {loading ? "Connecting…" : "Connect & Get QR"}
              </button>
            </>
          ) : (
            <>
              <div>
                <label className="label">Phone Number ID</label>
                <input
                  className="input"
                  value={form.phoneNumberId}
                  onChange={(e) =>
                    setForm({ ...form, phoneNumberId: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="label">Access Token</label>
                <input
                  className="input"
                  type="password"
                  value={form.accessToken}
                  onChange={(e) =>
                    setForm({ ...form, accessToken: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="label">Webhook Verify Token</label>
                <input
                  className="input"
                  value={form.verifyToken}
                  onChange={(e) =>
                    setForm({ ...form, verifyToken: e.target.value })
                  }
                />
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
                <p className="font-medium mb-1">
                  Webhook URL to set in Meta Dashboard:
                </p>
                <code className="break-all">
                  {window.location.origin}/api/whatsapp/webhook/meta
                </code>
              </div>
              <button
                onClick={connectMeta}
                className="btn-primary"
                disabled={loading}
              >
                {loading ? "Saving…" : "Save Meta Credentials"}
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}

function BusinessHoursSettings({ workspace }) {
  const DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const [hours, setHours] = useState(
    DAYS.map((day, i) => ({
      day: i + 1,
      enabled: i < 5,
      startTime: "09:00",
      endTime: "18:00",
    })),
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (workspace?.businessHours?.length) {
      setHours(
        DAYS.map((_, i) => {
          const found = workspace.businessHours.find((h) => h.day === i + 1);
          return (
            found || {
              day: i + 1,
              enabled: false,
              startTime: "09:00",
              endTime: "18:00",
            }
          );
        }),
      );
    }
  }, [workspace]);

  const save = async () => {
    setLoading(true);
    try {
      await api.put(`/workspaces/${workspace._id}`, { businessHours: hours });
      toast.success("Business hours saved");
    } catch (err) {
      toast.error("Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const update = (i, field, value) =>
    setHours((h) =>
      h.map((x, idx) => (idx === i ? { ...x, [field]: value } : x)),
    );

  return (
    <div className="card p-6 space-y-3">
      <p className="text-sm text-gray-500 mb-4">
        Set when your bot is active. Outside these hours, messages will be
        handled by the fallback (human handover or offline message).
      </p>
      {DAYS.map((day, i) => (
        <div key={day} className="flex items-center gap-4">
          <input
            type="checkbox"
            id={`day-${i}`}
            checked={hours[i]?.enabled || false}
            onChange={(e) => update(i, "enabled", e.target.checked)}
            className="w-4 h-4 accent-brand-600"
          />
          <label
            htmlFor={`day-${i}`}
            className="w-24 text-sm font-medium text-gray-700"
          >
            {day}
          </label>
          {hours[i]?.enabled && (
            <>
              <input
                type="time"
                className="input w-28 text-sm"
                value={hours[i]?.startTime || "09:00"}
                onChange={(e) => update(i, "startTime", e.target.value)}
              />
              <span className="text-gray-400 text-sm">to</span>
              <input
                type="time"
                className="input w-28 text-sm"
                value={hours[i]?.endTime || "18:00"}
                onChange={(e) => update(i, "endTime", e.target.value)}
              />
            </>
          )}
          {!hours[i]?.enabled && (
            <span className="text-xs text-gray-400">Closed</span>
          )}
        </div>
      ))}
      <button
        onClick={save}
        disabled={loading}
        className="btn-primary gap-2 mt-2"
      >
        <Save className="w-4 h-4" />
        {loading ? "Saving…" : "Save hours"}
      </button>
    </div>
  );
}

function TeamSettings({ workspace }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const inviteAgent = async () => {
    if (!email) {
      toast.error("Email required");
      return;
    }
    setLoading(true);
    try {
      await api.post(`/workspaces/${workspace?._id}/invite`, {
        email,
        role: "agent",
      });
      toast.success("Invite sent!");
      setEmail("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to invite");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6 space-y-4">
      <p className="font-semibold text-gray-800">Team Members</p>
      <div className="space-y-2">
        {workspace?.members?.map((m) => (
          <div
            key={m.user?._id || m.user}
            className="flex items-center gap-3 p-3 rounded-lg bg-gray-50"
          >
            <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 text-xs font-semibold">
              {m.user?.name?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">
                {m.user?.name || m.user?.email || "Member"}
              </p>
              <p className="text-xs text-gray-400 capitalize">{m.role}</p>
            </div>
          </div>
        ))}
        {(!workspace?.members || workspace.members.length === 0) && (
          <p className="text-sm text-gray-400">No team members yet.</p>
        )}
      </div>
      <div className="border-t border-gray-100 pt-4">
        <p className="font-medium text-sm text-gray-700 mb-3">
          Invite a team member
        </p>
        <div className="flex gap-2">
          <input
            className="input flex-1"
            type="email"
            placeholder="colleague@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            onClick={inviteAgent}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? "…" : "Invite"}
          </button>
        </div>
      </div>
    </div>
  );
}
