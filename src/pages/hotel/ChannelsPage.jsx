/**
 * Channels — connect the messaging channels your AI concierge answers on:
 * WhatsApp, Instagram, Facebook Messenger and Telegram.
 *
 * WhatsApp/Messenger use the hosted /channels OAuth flow; Instagram keeps its
 * existing OAuth page; Telegram can't be OAuth'd at all — the hotel adds our
 * bot to their group/channel as an admin and sends it a short code, so it gets
 * a guided pairing modal that polls until the link completes.
 */
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import toast from "react-hot-toast";
import { Check, Loader2, MessageCircle, Plug, Unplug } from "lucide-react";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import ChannelWall from "@/components/ChannelWall";
import { CHANNEL_COUNT_PHRASE } from "@/data/otaChannels";

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

function MessengerMark({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 0C5.24 0 0 4.95 0 11.64c0 3.5 1.44 6.53 3.78 8.62c.2.18.32.42.32.69l.07 2.14c.02.68.72 1.13 1.35.86l2.39-1.05c.2-.09.43-.11.65-.05c1.09.3 2.25.46 3.44.46c6.76 0 12-4.95 12-11.64S18.76 0 12 0m7.2 8.93l-3.52 5.6c-.56.89-1.76 1.11-2.6.48l-2.8-2.1a.72.72 0 0 0-.87 0l-3.79 2.87c-.5.38-1.16-.22-.82-.75l3.52-5.6c.56-.89 1.76-1.11 2.6-.48l2.8 2.1c.26.19.61.19.87 0l3.79-2.87c.5-.38 1.16.22.82.75"
      />
    </svg>
  );
}
function TelegramMark({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12a12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0m4.962 7.224c.1-.002.321.023.465.14a.5.5 0 0 1 .171.325c.016.093.036.306.02.472c-.18 1.898-.962 6.502-1.36 8.627c-.168.9-.499 1.201-.82 1.23c-.696.065-1.225-.46-1.9-.902c-1.056-.693-1.653-1.124-2.678-1.8c-1.185-.78-.417-1.21.258-1.91c.177-.184 3.247-2.977 3.307-3.23c.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345c-.48.33-.913.49-1.302.48c-.428-.008-1.252-.241-1.865-.44c-.752-.245-1.349-.374-1.297-.789c.027-.216.325-.437.893-.663c3.498-1.524 5.83-2.529 6.998-3.014c3.332-1.386 4.025-1.627 4.476-1.635"
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
    desc: "Turn profile visitors into guests — the AI answers DMs and comments about rooms, rates and availability.",
  },
  {
    key: "messenger",
    name: "Facebook Messenger",
    Mark: MessengerMark,
    tint: "bg-blue-50 text-blue-600",
    ring: "hover:border-blue-300",
    desc: "Most hotels already get enquiries on their Facebook Page. The AI answers those too.",
  },
  {
    key: "telegram",
    name: "Telegram",
    Mark: TelegramMark,
    tint: "bg-sky-50 text-sky-600",
    ring: "hover:border-sky-300",
    desc: "Popular with European and Russian travellers. Connects by adding our bot to your group or channel.",
    pairing: true,
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

  // ── Telegram pairing ───────────────────────────────────────────────────────
  // Generate a code, show the hotel what to do, then poll until Zernio reports
  // the channel linked. Polling stops on success, expiry, or when they close.
  const [tg, setTg] = useState(null); // { code, botUsername, status }
  const startTelegramPairing = async () => {
    setBusy("telegram");
    try {
      const { data } = await api.get("/channels/telegram/code");
      setTg({
        code: data.code,
        botUsername: data.botUsername,
        instructions: data.instructions || [],
        status: "pending",
      });
    } catch (e) {
      toast.error(
        e?.response?.data?.message || "Couldn't start Telegram pairing",
      );
    } finally {
      setBusy(null);
    }
  };

  useEffect(() => {
    if (!tg?.code || tg.status !== "pending") return undefined;
    let stopped = false;
    const tick = async () => {
      try {
        const { data } = await api.get("/channels/telegram/status", {
          params: { code: tg.code },
        });
        if (stopped) return;
        if (data.status === "connected") {
          setTg((t) => ({ ...t, status: "connected" }));
          toast.success("Telegram connected");
          load();
        } else if (data.status === "expired") {
          setTg((t) => ({ ...t, status: "expired" }));
        }
      } catch {
        /* transient — keep polling until the code expires */
      }
    };
    const id = setInterval(tick, 3000);
    return () => {
      stopped = true;
      clearInterval(id);
    };
  }, [tg?.code, tg?.status, load]);

  const connect = async (key) => {
    if (key === "instagram") {
      // Instagram keeps its existing OAuth connect flow.
      navigate("/onboarding/instagram");
      return;
    }
    if (key === "telegram") {
      // Telegram can't be OAuth'd — it pairs by adding our bot and sending a
      // code, so it gets its own guided modal instead of a redirect.
      startTelegramPairing();
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

      {/* Booking channels are a different thing from messaging channels — the
          OTAs your rooms sell on. Shown here so "Channels" covers both. */}
      <div className="mt-8">
        <ChannelWall
          title="Where your rooms sell"
          subtitle={`Your availability and rates sync to ${CHANNEL_COUNT_PHRASE} through one connection. Set these up under Property & Rooms.`}
        />
      </div>

      {/* Telegram pairing modal */}
      {tg && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink-950/50 p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tg-title"
          onClick={(e) => e.target === e.currentTarget && setTg(null)}
        >
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <TelegramMark className="w-6 h-6" />
              </div>
              <h2 id="tg-title" className="text-lg font-black text-ink-900">
                Connect Telegram
              </h2>
            </div>

            {tg.status === "connected" ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6" />
                </div>
                <p className="font-bold text-ink-900">Telegram is connected</p>
                <p className="text-sm text-ink-500 mt-1">
                  Your AI will now answer guests there.
                </p>
                <button
                  onClick={() => setTg(null)}
                  className="mt-5 w-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl px-4 py-2.5"
                >
                  Done
                </button>
              </div>
            ) : tg.status === "expired" ? (
              <div className="text-center py-4">
                <p className="font-bold text-ink-900">That code expired</p>
                <p className="text-sm text-ink-500 mt-1">
                  Codes last 15 minutes. Generate a new one to try again.
                </p>
                <button
                  onClick={startTelegramPairing}
                  className="mt-5 w-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl px-4 py-2.5"
                >
                  Get a new code
                </button>
              </div>
            ) : (
              <>
                <ol className="space-y-3 mb-5">
                  {(tg.instructions || []).map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm text-ink-700">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-ink-100 text-ink-700 font-bold text-xs flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>

                <div className="rounded-xl border border-ink-100 bg-ink-50 p-4 text-center">
                  <p className="text-[11px] uppercase tracking-wider font-bold text-ink-500 mb-1">
                    Your code
                  </p>
                  <p className="text-2xl font-black tracking-widest text-ink-900 font-mono">
                    {tg.code}
                  </p>
                  <button
                    onClick={() => {
                      try {
                        navigator.clipboard.writeText(tg.code);
                        toast.success("Code copied");
                      } catch {
                        /* clipboard unavailable — the code is on screen */
                      }
                    }}
                    className="mt-2 text-xs font-bold text-brand-600 hover:text-brand-700"
                  >
                    Copy code
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 mt-4 text-sm text-ink-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Waiting for you to send the code…
                </div>

                <button
                  onClick={() => setTg(null)}
                  className="mt-4 w-full border border-ink-200 text-ink-700 font-bold text-sm rounded-xl px-4 py-2.5 hover:bg-ink-50"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
