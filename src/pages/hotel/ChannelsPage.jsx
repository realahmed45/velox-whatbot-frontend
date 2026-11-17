/**
 * Channels — connect the messaging channel your AI concierge answers on.
 *
 * Two sections, in pitch order:
 *   1. Booking sites — Airbnb, Booking.com, Expedia, Trip.com. One connection syncs
 *      rooms/rates/availability AND brings guest messages into the inbox,
 *      where the AI answers them.
 *   2. WhatsApp — the one direct messaging channel hotels connect.
 *
 * Messenger and Telegram are kept in CHANNELS (and their connect code below)
 * so they can be switched back on, but only ACTIVE_CHANNEL_KEYS are shown.
 * WhatsApp connects through WasenderAPI (WhatsAppConnectModal: phone number →
 * scan a QR code, or paste an existing session's API key); Messenger uses the hosted /channels OAuth flow;
 * Telegram pairs via a short code in a guided modal that polls until the link
 * completes.
 *
 * WuBook (WooDoo) is the channel manager: WubookConnectCard takes the hotel's
 * WuBook property code and imports rooms + linked sites. The older Zodomus
 * card is kept but only rendered while WuBook isn't configured (it also hides
 * itself when the backend reports Zodomus isn't switched on).
 */
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import api from "@/services/api";
import toast from "react-hot-toast";
import {
  ArrowRight,
  Check,
  Globe2,
  Link2,
  Loader2,
  MessageCircle,
  Plug,
  Unplug,
} from "lucide-react";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import ChannelWall from "@/components/ChannelWall";
import FacebookPagePicker from "@/components/FacebookPagePicker";
import WhatsAppConnectModal from "@/components/WhatsAppConnectModal";
import WhatsAppHealthStrip from "@/components/WhatsAppHealthStrip";
import WubookConnectCard from "@/components/WubookConnectCard";
import EmailRelayCard from "@/components/EmailRelayCard";
import useChannelCallbackParams from "@/hooks/useChannelCallbackParams";
import { CHANNEL_COUNT_PHRASE, OTA_CHANNELS } from "@/data/otaChannels";
import { Magnetic, PulseDot, Reveal, Spotlight } from "@/components/fx";
import {
  WhatsAppMark,
  MessengerMark,
  TelegramMark,
} from "@/components/ChannelMarks";

const spring = { type: "spring", stiffness: 420, damping: 30 };

const CHANNELS = [
  {
    key: "whatsapp",
    name: "WhatsApp",
    Mark: WhatsAppMark,
    tint: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/15",
    ring: "hover:shadow-[inset_0_1px_0_#fff,0_0_0_1px_rgba(16,185,129,0.28),0_18px_40px_-16px_rgba(16,185,129,0.35)]",
    desc: "Guests who message you directly get instant answers. Your AI quotes rooms and confirms reservations on your WhatsApp number.",
  },
  {
    key: "messenger",
    name: "Facebook Messenger",
    Mark: MessengerMark,
    tint: "bg-blue-50 text-blue-600 ring-1 ring-blue-500/15",
    ring: "hover:shadow-[inset_0_1px_0_#fff,0_0_0_1px_rgba(59,130,246,0.28),0_18px_40px_-16px_rgba(59,130,246,0.35)]",
    desc: "Most hotels already get enquiries on their Facebook Page. The AI answers those too.",
  },
  {
    key: "telegram",
    name: "Telegram",
    Mark: TelegramMark,
    tint: "bg-sky-50 text-sky-600 ring-1 ring-sky-500/15",
    ring: "hover:shadow-[inset_0_1px_0_#fff,0_0_0_1px_rgba(14,165,233,0.28),0_18px_40px_-16px_rgba(14,165,233,0.35)]",
    desc: "Popular with European and Russian travellers. Connects by adding our bot to your group or channel.",
    pairing: true,
  },
];

// Which messaging channels hotels can connect today.
const ACTIVE_CHANNEL_KEYS = ["whatsapp"];
const VISIBLE_CHANNELS = CHANNELS.filter((c) =>
  ACTIVE_CHANNEL_KEYS.includes(c.key),
);

/** Brand chip for an OTA key, reusing the shared OTA tints when we know it. */
function OtaChip({ ota, name, size = "md" }) {
  const meta = OTA_CHANNELS.find((c) => c.key === ota);
  const label = meta?.short || (name || ota || "?").slice(0, 2);
  const dims = size === "sm" ? "h-7 w-7 text-[10px]" : "h-9 w-9 text-xs";
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-xl border font-bold ${dims} ${
        meta?.tint || "bg-ink-50 text-ink-700 border-ink-100"
      }`}
    >
      {label}
    </span>
  );
}

/**
 * "Connect a booking site" — the Zodomus channel-manager connection.
 * Hidden entirely when the backend says Zodomus isn't available yet.
 */
function ZodomusConnectCard({ onConnected }) {
  const [state, setState] = useState("loading"); // loading | ready | hidden
  const [channels, setChannels] = useState([]);
  const [ota, setOta] = useState("");
  const [otaPropertyId, setOtaPropertyId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [last, setLast] = useState(null); // { name, rooms }

  useEffect(() => {
    let alive = true;
    api
      .get("/hotel/zodomus/channels")
      .then(({ data }) => {
        if (!alive) return;
        const list = Array.isArray(data?.channels) ? data.channels : [];
        setChannels(list);
        if (list[0]?.ota) setOta(list[0].ota);
        setState("ready");
      })
      .catch(() => alive && setState("hidden"));
    return () => {
      alive = false;
    };
  }, []);

  if (state !== "ready") return null;

  const selected = channels.find((c) => c.ota === ota);

  const submit = async (e) => {
    e.preventDefault();
    if (!ota || !otaPropertyId.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await api.post("/hotel/zodomus/connect", {
        ota,
        otaPropertyId: otaPropertyId.trim(),
      });
      const name = selected?.name || ota;
      const rooms = Array.isArray(data?.rooms) ? data.rooms.length : 0;
      toast.success(
        `${name} connected — ${rooms} room${rooms === 1 ? "" : "s"} mapped`,
      );
      setLast({ name, rooms });
      setOtaPropertyId("");
      onConnected?.(data);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Couldn't connect that booking site",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Reveal>
      <Spotlight className="card relative mt-5 overflow-hidden p-5 sm:p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#FF5A1F] opacity-[0.12] blur-3xl"
        />
        <div className="relative flex items-start gap-3">
          <div className="group grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#FF5A1F] text-white shadow-[0_8px_20px_-8px_rgba(255,90,31,0.6)]">
            <Link2 className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <h3 className="font-geist text-[17px] font-semibold tracking-[-0.02em] text-ink-900">
              Connect a booking site
            </h3>
            <p className="mt-0.5 text-[13px] text-ink-500">
              Link your listing directly — rooms, rates and bookings sync in
              both directions.
            </p>
          </div>
        </div>

        {channels.length > 0 && (
          <div
            className="relative mt-5 flex flex-wrap gap-2"
            role="radiogroup"
            aria-label="Booking site"
          >
            {channels.map((c) => {
              const active = c.ota === ota;
              return (
                <motion.button
                  key={c.channelId ?? c.ota}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setOta(c.ota)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  transition={spring}
                  className={`relative inline-flex min-h-[44px] items-center gap-2 rounded-2xl py-1.5 pl-1.5 pr-3.5 text-sm font-medium transition-colors ${
                    active
                      ? "text-ink-900"
                      : "bg-white/60 text-ink-600 ring-1 ring-ink-900/[0.07] hover:bg-white hover:text-ink-900"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="zodomus-ota-pill"
                      transition={spring}
                      className="absolute inset-0 -z-0 rounded-2xl bg-white shadow-[inset_0_1px_0_#fff,0_0_0_1.5px_rgba(255,90,31,0.55),0_10px_24px_-12px_rgba(255,90,31,0.5)]"
                    />
                  )}
                  <span className="relative">
                    <OtaChip ota={c.ota} name={c.name} size="sm" />
                  </span>
                  <span className="relative">{c.name}</span>
                  {active && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={spring}
                      className="relative grid h-4 w-4 place-items-center rounded-full bg-[#FF5A1F] text-white"
                    >
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    </motion.span>
                  )}
                </motion.button>
              );
            })}
          </div>
        )}

        <form onSubmit={submit} className="relative mt-4">
          <label htmlFor="zodomus-prop-id" className="label">
            {selected?.name ? `${selected.name} property ID` : "Property ID"}
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="zodomus-prop-id"
              className="input font-mono sm:flex-1"
              placeholder="e.g. 1234567"
              value={otaPropertyId}
              onChange={(e) => setOtaPropertyId(e.target.value)}
              autoComplete="off"
              inputMode="text"
            />
            <button
              type="submit"
              disabled={submitting || !ota || !otaPropertyId.trim()}
              className="btn bg-[#FF5A1F] text-white shadow-[0_10px_24px_-12px_rgba(255,90,31,0.8)] hover:bg-[#E84A12] hover:-translate-y-0.5 active:scale-[0.97] group min-h-[44px] justify-center disabled:pointer-events-none disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plug className="h-4 w-4 transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-12deg]" />
              )}
              Connect
              {!submitting && (
                <ArrowRight className="h-4 w-4 transition-transform duration-500 ease-spring group-hover:translate-x-0.5" />
              )}
            </button>
          </div>
          <p className="mt-2 text-xs text-ink-500">
            Find your property ID in your Booking.com extranet (top left) or
            your Airbnb listing URL.
          </p>
        </form>

        <AnimatePresence>
          {last && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={spring}
              className="relative mt-4 flex items-center gap-2.5 rounded-xl bg-emerald-50/80 px-3.5 py-2.5 text-[13px] text-emerald-800 ring-1 ring-emerald-500/20"
            >
              <PulseDot color="bg-emerald-500" />
              <span className="min-w-0">
                <span className="font-semibold">{last.name}</span> connected —{" "}
                {last.rooms} room{last.rooms === 1 ? "" : "s"} mapped
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </Spotlight>
    </Reveal>
  );
}

export default function ChannelsPage({ hideHeader = false }) {
  const confirm = useConfirm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [statusMap, setStatusMap] = useState({});
  const [busy, setBusy] = useState(null);
  // WhatsApp opens the WasenderAPI connect modal.
  const [waOpen, setWaOpen] = useState(false);
  // null until GET /hotel/wubook/status answers; true hides the Zodomus card.
  const [wubookConfigured, setWubookConfigured] = useState(null);

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
    if (key === "telegram") {
      // Telegram can't be OAuth'd — it pairs by adding our bot and sending a
      // code, so it gets its own guided modal instead of a redirect.
      startTelegramPairing();
      return;
    }
    if (key === "whatsapp") {
      setWaOpen(true);
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

  const disconnect = async (key, name, provider) => {
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
      // WasenderAPI (and legacy AiSensy) numbers have their own disconnect;
      // everything else keeps the generic channel route.
      if (key === "whatsapp" && provider === "wasender") {
        await api.delete("/channels/whatsapp/wasender");
      } else if (key === "whatsapp" && provider === "aisensy") {
        await api.delete("/channels/whatsapp/aisensy");
      } else {
        await api.delete(`/channels/${key}`);
      }
      toast.success(`${name} disconnected`);
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Couldn't disconnect");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-12 pt-6 font-geist sm:px-6 sm:pt-8 lg:px-8">
      {!hideHeader && (
        <Reveal>
          <div className="group mb-8 flex items-center gap-3.5">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#0A0A0A] text-[#FF5A1F] shadow-[0_14px_28px_-14px_rgba(10,10,10,0.7)] transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]">
              <MessageCircle className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <h1 className="font-geist text-[28px] font-semibold leading-tight tracking-[-0.045em] text-[#0A0A0A] sm:text-[36px]">
                Channels
              </h1>
              <p className="text-sm text-black/55">
                Connect your booking sites and WhatsApp — your AI answers every
                guest message on them.
              </p>
            </div>
          </div>
        </Reveal>
      )}

      {/* Booking channels are a different thing from messaging channels — the
          OTAs your rooms sell on. Everything here rides the Channex connection:
          one link carries availability, rates, reservations AND guest messages.
          Onboarding deliberately doesn't ask for these; this is where a hotel
          comes to switch them on. */}
      <div className="grid gap-12 xl:grid-cols-12 xl:gap-8">
      <div className="relative min-w-0 xl:col-span-8">
        <Reveal>
          <div className="mb-1 flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className="group grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#0A0A0A] text-[#FF5A1F]">
                <Globe2 className="h-5 w-5" strokeWidth={1.8} />
              </div>
              <div className="min-w-0">
                <h2 className="font-geist text-xl font-semibold tracking-[-0.03em] text-[#0A0A0A]">
                  Booking <span className="text-[#FF5A1F]">sites</span>
                </h2>
                <p className="text-sm text-ink-500 mt-1 max-w-xl">
                  Sync + AI replies in their inbox. One connection keeps your
                  rooms, rates and availability in step across{" "}
                  {CHANNEL_COUNT_PHRASE} — and your AI answers every guest
                  message from Airbnb, Booking.com, Expedia and Trip.com right
                  inside their inbox.
                </p>
              </div>
            </div>
            <Magnetic strength={0.25}>
              <button
                onClick={() => navigate("/dashboard/property")}
                className="btn-secondary group min-h-[44px] shrink-0"
              >
                <Plug className="w-4 h-4 transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-12deg]" />
                Connect a booking channel
              </button>
            </Magnetic>
          </div>
        </Reveal>

        <WubookConnectCard
          onConfigured={setWubookConfigured}
          onConnected={load}
        />
        <div className="mt-4">
          <EmailRelayCard />
        </div>

        {wubookConfigured === false && <ZodomusConnectCard onConnected={load} />}

        <Reveal delay={0.06}>
          <div className="mt-5 rounded-2xl bg-white p-4 ring-1 ring-black/[0.06] shadow-[0_24px_48px_-36px_rgba(10,10,10,0.35)] sm:p-5">
            <ChannelWall variant="bare" />
          </div>
        </Reveal>

        <p className="text-xs text-ink-400 mt-4">
          Your OTA asks you to approve the connection from its own extranet —
          that screen belongs to them, so it can only come from you. Airbnb is
          one click; the rest take about a minute.
        </p>
      </div>

      {/* WhatsApp — the direct messaging channel */}
      <div className="relative min-w-0 pt-10 xl:col-span-4 xl:pt-0">
        <div className="divider absolute inset-x-0 top-0 xl:hidden" />
        <Reveal>
          <div className="flex items-start gap-3 min-w-0 mb-5">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#25D366] text-white shadow-[0_10px_22px_-12px_rgba(37,211,102,0.8)]">
              <WhatsAppMark className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-geist text-xl font-semibold tracking-[-0.03em] text-[#0A0A0A]">
                WhatsApp
              </h2>
              <p className="text-sm text-ink-500 mt-1 max-w-xl">
                Guests who message you directly get the same instant, accurate
                answers — and get booked.
              </p>
            </div>
          </div>
        </Reveal>

      {loading ? (
        <div
          className={`grid gap-5 ${VISIBLE_CHANNELS.length > 1 ? "md:grid-cols-2" : ""}`}
        >
          {VISIBLE_CHANNELS.map((ch) => (
            <div key={ch.key} className="card p-5">
              <div className="flex items-center justify-between">
                <div className="h-11 w-11 rounded-xl bg-ink-900/[0.06] animate-pulse" />
                <div className="h-5 w-24 rounded-full bg-ink-900/[0.06] animate-pulse" />
              </div>
              <div className="mt-4 h-4 w-32 rounded bg-ink-900/[0.06] animate-pulse" />
              <div className="mt-2 h-3 w-full rounded bg-ink-900/[0.06] animate-pulse" />
              <div className="mt-1.5 h-3 w-2/3 rounded bg-ink-900/[0.06] animate-pulse" />
              <div className="mt-5 h-11 w-full rounded-xl bg-ink-900/[0.06] animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <div
          className={`grid gap-5 ${VISIBLE_CHANNELS.length > 1 ? "md:grid-cols-2" : ""}`}
        >
          {VISIBLE_CHANNELS.map((ch, i) => {
            const st = statusMap[ch.key] || {};
            const connected = st.status === "connected";
            const Mark = ch.Mark;
            return (
              <Reveal key={ch.key} delay={i * 0.06}>
                <Spotlight
                  className={`card group relative flex h-full flex-col overflow-hidden p-5 sm:p-6 transition-[transform,box-shadow] duration-500 ease-spring hover:-translate-y-[3px] ${ch.ring}`}
                >
                  {connected && (
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl"
                    />
                  )}
                  <div className="relative flex items-center justify-between">
                    <div
                      className={`grid h-11 w-11 place-items-center rounded-xl transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg] ${ch.tint}`}
                    >
                      <Mark className="w-6 h-6" />
                    </div>
                    {connected ? (
                      <span className="badge-green inline-flex items-center gap-1.5">
                        <PulseDot color="bg-emerald-500" /> Connected
                      </span>
                    ) : (
                      <span className="badge-gray">Not connected</span>
                    )}
                  </div>
                  <p className="relative mt-4 font-geist text-[17px] font-semibold tracking-[-0.02em] text-[#0A0A0A]">
                    {ch.name}
                  </p>
                  <p className="relative text-[13px] text-ink-500 mt-1 leading-relaxed flex-1">
                    {ch.desc}
                  </p>
                  {connected && (st.username || st.phoneNumber) && (
                    <p className="relative mt-3 inline-flex max-w-full items-center gap-1.5 self-start truncate rounded-lg bg-white/70 px-2.5 py-1 font-mono text-xs font-semibold text-ink-700 ring-1 ring-ink-900/[0.06]">
                      <Check className="h-3 w-3 shrink-0 text-emerald-600" />
                      <span className="truncate">
                        {ch.key === "whatsapp" && st.phoneNumber
                          ? st.phoneNumber
                          : `@${st.username}`}
                      </span>
                    </p>
                  )}
                  {/* WhatsApp state: WasenderAPI shows number and last
                      message received;
                      older numbers can read "connected" while every send fails
                      (Meta 133005), so they keep the health check + PIN fix. */}
                  {connected && ch.key === "whatsapp" && (
                    <WhatsAppHealthStrip
                      webhookError={!!st.webhookError}
                      provider={st.provider}
                      phoneNumber={st.phoneNumber}
                      lastWebhookAt={st.lastWebhookAt}
                      webhookUrl={st.webhookUrl}
                    />
                  )}
                  <div className="relative mt-5">
                    {connected ? (
                      <button
                        onClick={() => disconnect(ch.key, ch.name, st.provider)}
                        disabled={busy === ch.key}
                        className="btn group/btn w-full min-h-[44px] justify-center text-rose-600 bg-rose-50/80 ring-1 ring-rose-500/20 hover:bg-rose-100 hover:-translate-y-0.5 disabled:opacity-60"
                      >
                        {busy === ch.key ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Unplug className="w-4 h-4 transition-transform duration-500 ease-spring group-hover/btn:rotate-[-14deg]" />
                        )}
                        Disconnect
                      </button>
                    ) : (
                      <button
                        onClick={() => connect(ch.key)}
                        disabled={busy === ch.key}
                        className="btn bg-[#FF5A1F] text-white shadow-[0_10px_24px_-12px_rgba(255,90,31,0.8)] hover:bg-[#E84A12] hover:-translate-y-0.5 active:scale-[0.97] group/btn w-full min-h-[44px] justify-center disabled:opacity-60"
                      >
                        {busy === ch.key ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plug className="w-4 h-4 transition-transform duration-500 ease-spring group-hover/btn:-translate-y-0.5 group-hover/btn:rotate-[-12deg]" />
                        )}
                        Connect {ch.name}
                      </button>
                    )}
                  </div>
                </Spotlight>
              </Reveal>
            );
          })}
        </div>
      )}

      <p className="text-xs text-ink-400 mt-6 text-center">
        Your AI answers guests on WhatsApp — quotes prices, checks availability
        and books rooms, 24/7.
      </p>
      </div>
      </div>

      {/* WhatsApp connect — WasenderAPI QR scan (or paste an API key). The
          modal shows the success toast itself; we just refresh. */}
      {waOpen && (
        <WhatsAppConnectModal
          from="channels"
          onClose={(result) => {
            setWaOpen(false);
            if (result?.connected) load();
          }}
        />
      )}

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
      <AnimatePresence>
        {tg && (
          <motion.div
            key="tg-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-night-950/40 backdrop-blur-md p-0 sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tg-title"
            onClick={(e) => e.target === e.currentTarget && setTg(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={spring}
              className="glass-strong w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-500/15">
                  <TelegramMark className="w-6 h-6" />
                </div>
                <h2
                  id="tg-title"
                  className="font-geist text-lg font-semibold tracking-[-0.02em] text-ink-900"
                >
                  Connect Telegram
                </h2>
              </div>

              <AnimatePresence mode="wait" initial={false}>
                {tg.status === "connected" ? (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={spring}
                    className="text-center py-4"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 380, damping: 14 }}
                      className="relative mx-auto mb-4 grid h-14 w-14 place-items-center"
                    >
                      <span className="absolute inset-0 rounded-full bg-emerald-400/30 blur-xl" />
                      <span className="relative grid h-14 w-14 place-items-center rounded-full bg-emerald-500 text-white shadow-[0_10px_30px_-8px_rgba(16,185,129,0.6)]">
                        <Check className="w-7 h-7" strokeWidth={2.5} />
                      </span>
                    </motion.div>
                    <p className="font-geist text-lg font-semibold text-ink-900">
                      Telegram is connected
                    </p>
                    <p className="text-sm text-ink-500 mt-1">
                      Your AI will now answer guests there.
                    </p>
                    <button
                      onClick={() => setTg(null)}
                      className="btn bg-[#FF5A1F] text-white shadow-[0_10px_24px_-12px_rgba(255,90,31,0.8)] hover:bg-[#E84A12] hover:-translate-y-0.5 active:scale-[0.97] mt-6 w-full min-h-[44px] justify-center"
                    >
                      Done
                    </button>
                  </motion.div>
                ) : tg.status === "expired" ? (
                  <motion.div
                    key="expired"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={spring}
                    className="text-center py-4"
                  >
                    <p className="font-geist text-lg font-semibold text-ink-900">
                      That code expired
                    </p>
                    <p className="text-sm text-ink-500 mt-1">
                      Codes last 15 minutes. Generate a new one to try again.
                    </p>
                    <button
                      onClick={startTelegramPairing}
                      className="btn bg-[#FF5A1F] text-white shadow-[0_10px_24px_-12px_rgba(255,90,31,0.8)] hover:bg-[#E84A12] hover:-translate-y-0.5 active:scale-[0.97] mt-6 w-full min-h-[44px] justify-center"
                    >
                      Get a new code
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="pending"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <ol className="space-y-3 mb-5">
                      {(tg.instructions || []).map((step, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ ...spring, delay: i * 0.06 }}
                          className="flex gap-3 text-sm text-ink-700"
                        >
                          <span className="flex-shrink-0 grid h-6 w-6 place-items-center rounded-full bg-[#FFF1EA] text-[#FF5A1F] font-bold text-xs">
                            {i + 1}
                          </span>
                          <span>{step}</span>
                        </motion.li>
                      ))}
                    </ol>

                    <div className="rounded-2xl bg-white/70 p-4 text-center ring-1 ring-ink-900/[0.06] shadow-[inset_0_1px_0_#fff]">
                      <p className="text-[11px] uppercase tracking-wider font-bold text-ink-500 mb-1">
                        Your code
                      </p>
                      <p className="text-2xl font-semibold tracking-widest text-ink-900 font-mono">
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
                        className="btn-ghost mt-2 text-xs font-bold text-[#E84A12] hover:text-brand-700"
                      >
                        Copy code
                      </button>
                    </div>

                    <div className="flex items-center justify-center gap-2 mt-4 text-sm text-ink-500">
                      <PulseDot color="bg-sky-500" />
                      Waiting for you to send the code…
                    </div>

                    <button
                      onClick={() => setTg(null)}
                      className="btn-secondary mt-4 w-full min-h-[44px] justify-center"
                    >
                      Cancel
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
