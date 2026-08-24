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
import FacebookPagePicker from "@/components/FacebookPagePicker";
import useChannelCallbackParams from "@/hooks/useChannelCallbackParams";
import { CHANNEL_COUNT_PHRASE } from "@/data/otaChannels";
import {
  WhatsAppMark,
  InstagramMark,
  MessengerMark,
  TelegramMark,
} from "@/components/ChannelMarks";


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

  // The provider callback returns here (?from=channels) with either the
  // headless Messenger page-pick handoff or a connected/error result.
  const { picker, closePicker, handlePicked } = useChannelCallbackParams({
    onConnected: load,
  });

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
      const { data } = await api.get(`/channels/${key}/connect`, {
        params: { from: "channels" },
      });
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

      {/* Facebook Page picker — headless Messenger connect */}
      {picker && (
        <FacebookPagePicker
          tempToken={picker.tempToken}
          userProfile={picker.userProfile}
          onDone={handlePicked}
          onCancel={closePicker}
        />
      )}

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
