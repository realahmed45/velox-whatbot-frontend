/**
 * Channels — connect the messaging channels your AI concierge answers on:
 * WhatsApp and Instagram. WhatsApp uses the /channels connect flow;
 * Instagram keeps its existing OAuth connect flow.
 */
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import toast from "react-hot-toast";
import { Check, Loader2, MessageCircle, Plug, Unplug } from "lucide-react";
import { useConfirm } from "@/components/ui/ConfirmDialog";

/* Brand marks */
function WhatsAppMark({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967c-.273-.099-.471-.148-.67.15c-.197.297-.767.966-.94 1.164c-.173.199-.347.223-.644.075c-.297-.15-1.255-.463-2.39-1.475c-.883-.788-1.48-1.761-1.653-2.059c-.173-.297-.018-.458.13-.606c.134-.133.298-.347.446-.52c.149-.174.198-.298.298-.497c.099-.198.05-.371-.025-.52c-.075-.149-.669-1.612-.916-2.207c-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372c-.272.297-1.04 1.016-1.04 2.479c0 1.462 1.065 2.875 1.213 3.074c.149.198 2.096 3.2 5.077 4.487c.709.306 1.262.489 1.694.625c.712.227 1.36.195 1.871.118c.571-.085 1.758-.719 2.006-1.413c.248-.694.248-1.289.173-1.413c-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214l-3.741.982l.998-3.648l-.235-.374a9.86 9.86 0 0 1-1.511-5.26c.001-5.45 4.436-9.884 9.888-9.884c2.64 0 5.122 1.03 6.988 2.898a9.83 9.83 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.884 9.884m8.413-18.297A11.8 11.8 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.9 11.9 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 0 0-3.48-8.413"
      />
    </svg>
  );
}
function InstagramMark({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2.16c3.2 0 3.58 0 4.85.07c1.17.05 1.8.25 2.23.41c.56.22.96.48 1.38.9c.42.42.68.82.9 1.38c.16.42.36 1.06.41 2.23c.07 1.27.07 1.65.07 4.85s0 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23a3.7 3.7 0 0 1-.9 1.38a3.7 3.7 0 0 1-1.38.9c-.42.16-1.06.36-2.23.41c-1.27.07-1.65.07-4.85.07s-3.58 0-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9a3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23c-.07-1.27-.07-1.65-.07-4.85s0-3.58.07-4.85c.05-1.17.25-1.8.41-2.23c.22-.56.48-.96.9-1.38c.42-.42.82-.68 1.38-.9c.42-.16 1.06-.36 2.23-.41c1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07a8.94 8.94 0 0 0-2.96.57a5.96 5.96 0 0 0-2.16 1.4A5.96 5.96 0 0 0 .54 4.2a8.94 8.94 0 0 0-.57 2.95C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95a8.94 8.94 0 0 0 .57 2.96a5.96 5.96 0 0 0 1.4 2.16a5.96 5.96 0 0 0 2.16 1.4a8.94 8.94 0 0 0 2.95.57C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07a8.94 8.94 0 0 0 2.96-.57a6.22 6.22 0 0 0 3.56-3.56a8.94 8.94 0 0 0 .57-2.95c.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95a8.94 8.94 0 0 0-.57-2.96a5.96 5.96 0 0 0-1.4-2.16a5.96 5.96 0 0 0-2.16-1.4a8.94 8.94 0 0 0-2.95-.57C15.67.01 15.26 0 12 0m0 5.84A6.16 6.16 0 1 0 18.16 12A6.16 6.16 0 0 0 12 5.84M12 16a4 4 0 1 1 4-4a4 4 0 0 1-4 4m6.41-11.85a1.44 1.44 0 1 0 1.44 1.44a1.44 1.44 0 0 0-1.44-1.44"
      />
    </svg>
  );
}

const CHANNELS = [
  {
    key: "whatsapp",
    name: "WhatsApp",
    Mark: WhatsAppMark,
    tint: "bg-emerald-50 text-emerald-600",
    ring: "hover:border-emerald-300",
    desc: "Where most guests book. Your AI answers, quotes rooms and confirms reservations on your WhatsApp number.",
  },
  {
    key: "instagram",
    name: "Instagram",
    Mark: InstagramMark,
    tint: "bg-purple-50 text-purple-600",
    ring: "hover:border-purple-300",
    desc: "Turn profile visitors into guests — the AI replies to DMs, story replies and comments.",
  },
];

export default function ChannelsPage() {
  const confirm = useConfirm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [statusMap, setStatusMap] = useState({});
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/channels/status");
      setStatusMap(data || {});
    } catch {
      toast.error("Couldn't load channel status");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const connect = async (key) => {
    if (key === "instagram") {
      // Instagram keeps its existing OAuth connect flow.
      navigate("/onboarding/instagram");
      return;
    }
    setBusy(key);
    try {
      const { data } = await api.get(`/channels/${key}/connect`);
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error("No connect URL returned");
    } catch (e) {
      toast.error(
        e?.response?.data?.message || "Couldn't start the connection",
      );
      setBusy(null);
    }
  };

  const disconnect = async (key, name) => {
    const ok = await confirm({
      title: `Disconnect ${name}?`,
      description:
        "The AI will stop answering guests on this channel until you reconnect.",
      confirmLabel: "Disconnect",
      danger: true,
    });
    if (!ok) return;
    setBusy(key);
    try {
      await api.delete(`/channels/${key}`);
      toast.success(`${name} disconnected`);
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Couldn't disconnect");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl bg-brand-500/10 flex items-center justify-center">
          <MessageCircle className="w-6 h-6 text-brand-500" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-ink-900">Channels</h1>
          <p className="text-sm text-ink-500">
            Connect the channels your AI concierge answers guests on.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-7 h-7 text-brand-500 animate-spin" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {CHANNELS.map((ch) => {
            const st = statusMap[ch.key] || {};
            const connected = st.status === "connected";
            const Mark = ch.Mark;
            return (
              <div
                key={ch.key}
                className={`rounded-2xl border border-ink-100 bg-white p-5 flex flex-col transition ${ch.ring}`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center ${ch.tint}`}
                  >
                    <Mark className="w-6 h-6" />
                  </div>
                  {connected ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                      <Check className="w-3 h-3" /> Connected
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-ink-400 bg-ink-50 border border-ink-100 rounded-full px-2 py-0.5">
                      Not connected
                    </span>
                  )}
                </div>
                <p className="font-black text-ink-900 mt-3">{ch.name}</p>
                <p className="text-sm text-ink-500 mt-1 flex-1">{ch.desc}</p>
                {connected && (st.username || st.phoneNumber) && (
                  <p className="text-xs font-semibold text-ink-700 mt-3 truncate">
                    {ch.key === "whatsapp" && st.phoneNumber
                      ? st.phoneNumber
                      : `@${st.username}`}
                  </p>
                )}
                <div className="mt-4">
                  {connected ? (
                    <button
                      onClick={() => disconnect(ch.key, ch.name)}
                      disabled={busy === ch.key}
                      className="w-full inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl px-4 py-2.5 transition disabled:opacity-60"
                    >
                      {busy === ch.key ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Unplug className="w-4 h-4" />
                      )}
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={() => connect(ch.key)}
                      disabled={busy === ch.key}
                      className="w-full inline-flex items-center justify-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl px-4 py-2.5 transition disabled:opacity-60"
                    >
                      {busy === ch.key ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plug className="w-4 h-4" />
                      )}
                      Connect {ch.name}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-ink-400 mt-6 text-center">
        The AI answers on every connected channel — quotes prices, checks
        availability and books rooms, 24/7.
      </p>
    </div>
  );
}
