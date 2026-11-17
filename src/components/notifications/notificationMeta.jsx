import {
  MessageSquare,
  Hand,
  BedDouble,
  CalendarX2,
  Radio,
  AlertTriangle,
  PlugZap,
  Unplug,
  Star,
  Car,
  Bell,
} from "lucide-react";
import { clsx } from "clsx";
import OtaLogo from "@/components/OtaLogo";
import { WhatsAppMark } from "@/components/ChannelMarks";

/**
 * Per-type look: icon + tile colours. Colour carries meaning (DESIGN_SYSTEM):
 * orange = brand/action, emerald = confirmed/live, rose = error/cancelled,
 * amber = pending/attention, sky = info.
 */
export const TYPE_META = {
  "message.new": { icon: MessageSquare, label: "New message", tile: "bg-[#FFF1EA] text-[#FF5A1F]" },
  "guest.needs_human": { icon: Hand, label: "Needs you", tile: "bg-amber-50 text-amber-600" },
  "booking.new": { icon: BedDouble, label: "New booking", tile: "bg-emerald-50 text-emerald-600" },
  "booking.cancelled": { icon: CalendarX2, label: "Cancelled", tile: "bg-rose-50 text-rose-600" },
  "channel.live": { icon: Radio, label: "Channel live", tile: "bg-emerald-50 text-emerald-600" },
  "channel.error": { icon: AlertTriangle, label: "Channel issue", tile: "bg-rose-50 text-rose-600" },
  "whatsapp.connected": { icon: PlugZap, label: "WhatsApp connected", tile: "bg-emerald-50 text-emerald-600" },
  "whatsapp.disconnected": { icon: Unplug, label: "WhatsApp disconnected", tile: "bg-rose-50 text-rose-600" },
  "review.new": { icon: Star, label: "New review", tile: "bg-amber-50 text-amber-600" },
  "transfer.new": { icon: Car, label: "Transfer request", tile: "bg-sky-50 text-sky-600" },
  system: { icon: Bell, label: "Botlify", tile: "bg-neutral-100 text-neutral-700" },
};

export const typeMeta = (type) => TYPE_META[type] || TYPE_META.system;

/** Backend channel keys → OtaLogo keys. */
const OTA_KEYS = {
  airbnb: "airbnb",
  booking_com: "booking",
  booking: "booking",
  expedia: "expedia",
  trip_com: "trip",
  trip: "trip",
  agoda: "agoda",
  vrbo: "vrbo",
};

const CHANNEL_NAMES = {
  whatsapp: "WhatsApp",
  airbnb: "Airbnb",
  booking_com: "Booking.com",
  booking: "Booking.com",
  expedia: "Expedia",
  trip_com: "Trip.com",
  trip: "Trip.com",
  agoda: "Agoda",
  vrbo: "Vrbo",
};

export const channelName = (c) => CHANNEL_NAMES[c] || null;

/** Small channel brand mark — WhatsApp glyph or an OTA tile. */
export function ChannelLogo({ channel, size = 16, className }) {
  if (!channel) return null;
  if (channel === "whatsapp") {
    return (
      <span
        className={clsx("grid shrink-0 place-items-center rounded-[5px] bg-[#25D366] text-white", className)}
        style={{ width: size, height: size }}
        title="WhatsApp"
      >
        <WhatsAppMark className="h-[70%] w-[70%]" />
      </span>
    );
  }
  const key = OTA_KEYS[channel];
  if (!key) return null;
  return (
    <span className={clsx("inline-flex shrink-0 overflow-hidden rounded-[5px]", className)} title={channelName(channel) || key}>
      <OtaLogo channelKey={key} size={size} />
    </span>
  );
}

/** Type tile with an optional channel mark tucked in the corner. */
export function NotificationIcon({ notification, size = "md" }) {
  const meta = typeMeta(notification?.type);
  const Icon = meta.icon;
  const big = size === "lg";
  return (
    <span className="relative shrink-0">
      <span
        className={clsx(
          "grid place-items-center rounded-xl ring-1 ring-inset ring-black/[0.04]",
          big ? "h-10 w-10" : "h-9 w-9",
          meta.tile,
        )}
      >
        <Icon className={big ? "h-[18px] w-[18px]" : "h-4 w-4"} strokeWidth={2} />
      </span>
      {notification?.channel && (
        <span className="absolute -bottom-1 -right-1 rounded-[7px] bg-white p-[2px] shadow-[0_1px_2px_rgba(10,10,10,0.15)]">
          <ChannelLogo channel={notification.channel} size={14} />
        </span>
      )}
    </span>
  );
}

/** "now", "5m", "3h", "Yesterday", "Mon", "12 Nov". */
export function relativeTime(iso, now = Date.now()) {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "";
  const diff = Math.max(0, now - t);
  const min = Math.floor(diff / 60000);
  if (min < 1) return "now";
  if (min < 60) return `${min}m`;
  const hrs = Math.floor(min / 60);
  const d = new Date(t);
  const today = new Date(now);
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  if (t >= startOfToday) return `${hrs}h`;
  if (t >= startOfToday - 86400000) return "Yesterday";
  if (t >= startOfToday - 6 * 86400000) return d.toLocaleDateString(undefined, { weekday: "short" });
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

/** Split into Today / Earlier groups, keeping order. */
export function groupByDay(items, now = Date.now()) {
  const today = new Date(now);
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const groups = { Today: [], Earlier: [] };
  for (const n of items) {
    (new Date(n.createdAt).getTime() >= start ? groups.Today : groups.Earlier).push(n);
  }
  return Object.entries(groups).filter(([, list]) => list.length > 0);
}
