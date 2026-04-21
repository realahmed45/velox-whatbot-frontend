import { useState, useEffect } from "react";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import { Loader2, MessageCircle, Zap, Save, Plus, Trash2, Hash } from "lucide-react";

export default function AutomationSetupPage() {
  const { activeWorkspace } = useAuthStore();
  const [messages, setMessages] = useState({
    greeting: "",
    followUp1: "",
    followUp2: "",
    followUp3: "",
    followUpIntervalHours: 3,
  });
  const [automationEnabled, setAutomationEnabled] = useState(true);
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingMsgs, setSavingMsgs] = useState(false);
  const [savingKeywords, setSavingKeywords] = useState(false);

  useEffect(() => {
    if (!activeWorkspace) return;
    Promise.all([
      api.get(`/workspaces/${activeWorkspace}`),
      api.get(`/workspaces/${activeWorkspace}/keyword-triggers`),
    ])
      .then(([{ data: wsData }, { data: kwData }]) => {
        const ws = wsData.workspace;
        if (ws.dmMessages) {
          setMessages({
            greeting: ws.dmMessages.greeting || "",
            followUp1: ws.dmMessages.followUp1 || "",
            followUp2: ws.dmMessages.followUp2 || "",
            followUp3: ws.dmMessages.followUp3 || "",
            followUpIntervalHours: ws.dmMessages.followUpIntervalHours ?? 3,
          });
        }
        if (ws.settings) setAutomationEnabled(ws.settings.automationEnabled ?? true);
        setKeywords(kwData.keywordTriggers || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeWorkspace]);

  const saveMessages = async () => {
    setSavingMsgs(true);
    try {
      await api.put(`/workspaces/${activeWorkspace}/dm-messages`, messages);
      toast.success("Messages saved!");
    } catch {
      toast.error("Failed to save messages");
    } finally {
      setSavingMsgs(false);
    }
  };

  const toggleAutomation = async () => {
    const newValue = !automationEnabled;
    try {
      await api.put(`/workspaces/${activeWorkspace}/automation-settings`, {
        automationEnabled: newValue,
      });
      setAutomationEnabled(newValue);
    } catch {
      toast.error("Failed to update automation");
    }
  };

  const addKeyword = () => {
    setKeywords((k) => [...k, { keyword: "", replyMessage: "", enabled: true, matchType: "contains" }]);
  };

  const removeKeyword = (i) => setKeywords((k) => k.filter((_, idx) => idx !== i));

  const updateKeyword = (i, field, value) =>
    setKeywords((k) => k.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));

  const saveKeywords = async () => {
    for (const t of keywords) {
      if (!t.keyword.trim()) { toast.error("Each keyword trigger needs a keyword"); return; }
      if (!t.replyMessage.trim()) { toast.error("Each keyword trigger needs a reply message"); return; }
    }
    setSavingKeywords(true);
    try {
      await api.put(`/workspaces/${activeWorkspace}/keyword-triggers`, { keywordTriggers: keywords });
      toast.success("Keyword triggers saved!");
    } catch {
      toast.error("Failed to save keyword triggers");
    } finally {
      setSavingKeywords(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Zap className="w-6 h-6 text-purple-600" />
          Setup Automation
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Configure auto-reply DMs triggered by comments and messages.
        </p>
      </div>

      {/* Toggle automation */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-900">Automation Active</p>
          <p className="text-xs text-gray-400">When off, no DMs will be sent automatically</p>
        </div>
        <button
          onClick={toggleAutomation}
          className={`relative w-12 h-6 rounded-full transition-colors ${automationEnabled ? "bg-purple-600" : "bg-gray-300"}`}
        >
          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${automationEnabled ? "translate-x-6" : "translate-x-0.5"}`} />
        </button>
      </div>

      {/* Keyword Triggers */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <div>
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <Hash className="w-4 h-4 text-purple-500" />
            Comment Keyword Triggers
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            When someone comments a keyword on your post, they instantly receive a DM.
            This is the <span className="font-semibold text-purple-600">industry-standard</span> way to automate Instagram DMs.
          </p>
          <div className="mt-2 bg-purple-50 border border-purple-100 rounded-lg p-3 text-xs text-purple-700">
            💡 <strong>How to use:</strong> Add a post caption like <em>"Comment 'DM' to get our full price list sent to your inbox!"</em> — anyone who comments gets an instant DM.
          </div>
        </div>

        {keywords.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">No keyword triggers yet. Add one below.</p>
        )}

        {keywords.map((trigger, i) => (
          <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Keyword</label>
                <input
                  className="input"
                  placeholder='e.g. "DM", "price", "info"'
                  value={trigger.keyword}
                  onChange={(e) => updateKeyword(i, "keyword", e.target.value)}
                />
              </div>
              <div className="flex-shrink-0 pt-5">
                <select
                  className="input text-xs"
                  value={trigger.matchType}
                  onChange={(e) => updateKeyword(i, "matchType", e.target.value)}
                >
                  <option value="contains">Contains</option>
                  <option value="exact">Exact match</option>
                </select>
              </div>
              <div className="flex-shrink-0 pt-5 flex items-center gap-2">
                <button
                  onClick={() => updateKeyword(i, "enabled", !trigger.enabled)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${trigger.enabled ? "bg-green-500" : "bg-gray-300"}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${trigger.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
                <button onClick={() => removeKeyword(i)} className="text-red-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Reply DM</label>
              <textarea
                className="input min-h-[60px] resize-y text-sm"
                placeholder="The DM to send when this keyword is commented. Use {name} for their name."
                value={trigger.replyMessage}
                onChange={(e) => updateKeyword(i, "replyMessage", e.target.value)}
              />
            </div>
          </div>
        ))}

        <div className="flex gap-3 pt-1">
          <button onClick={addKeyword} className="flex items-center gap-2 text-sm text-purple-600 border border-purple-200 rounded-lg px-4 py-2 hover:bg-purple-50 transition">
            <Plus className="w-4 h-4" /> Add Keyword Trigger
          </button>
          <button onClick={saveKeywords} disabled={savingKeywords} className="btn-primary flex items-center gap-2">
            {savingKeywords ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Triggers
          </button>
        </div>
      </div>

      {/* DM Messages section */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-5">
        <h2 className="font-bold text-gray-900 flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-pink-500" />
          Greeting & Follow-up Messages
        </h2>
        <p className="text-xs text-gray-400 -mt-3">
          Sent when someone DMs you directly. Use{" "}
          <code className="bg-gray-100 px-1 rounded">{"{name}"}</code> for their first name.
        </p>

        <MessageField
          label="Greeting Message"
          hint="First auto-reply when someone DMs you"
          value={messages.greeting}
          onChange={(v) => setMessages((m) => ({ ...m, greeting: v }))}
        />
        <MessageField
          label="Follow-up #1"
          hint="Sent if no reply after the interval"
          value={messages.followUp1}
          onChange={(v) => setMessages((m) => ({ ...m, followUp1: v }))}
        />
        <MessageField
          label="Follow-up #2"
          hint="Sent if still no reply after another interval"
          value={messages.followUp2}
          onChange={(v) => setMessages((m) => ({ ...m, followUp2: v }))}
        />
        <MessageField
          label="Follow-up #3 (final)"
          hint="Last automated message in the sequence"
          value={messages.followUp3}
          onChange={(v) => setMessages((m) => ({ ...m, followUp3: v }))}
        />

        <div>
          <label className="label">Follow-up interval (hours)</label>
          <input
            type="number" min={1} max={72} className="input w-32"
            value={messages.followUpIntervalHours}
            onChange={(e) => setMessages((m) => ({ ...m, followUpIntervalHours: +e.target.value }))}
          />
          <p className="text-xs text-gray-400 mt-1">Time between each follow-up message</p>
        </div>

        <button onClick={saveMessages} disabled={savingMsgs} className="btn-primary flex items-center gap-2">
          {savingMsgs ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Messages
        </button>
      </div>
    </div>
  );
}

function MessageField({ label, hint, value, onChange }) {
  return (
    <div>
      <label className="label">{label}</label>
      <p className="text-xs text-gray-400 mb-1">{hint}</p>
      <textarea
        className="input min-h-[70px] resize-y"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your message..."
      />
    </div>
  );
}
