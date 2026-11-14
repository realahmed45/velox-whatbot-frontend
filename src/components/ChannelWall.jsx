/**
 * ChannelWall — the chip wall of booking channels Botlify distributes to.
 *
 * One shared component so the channel list never drifts between the marketing
 * pages, the pricing pages and the onboarding wizard. Data lives in
 * `@/data/otaChannels`.
 *
 * Chips carry the brand marks from `@/components/OtaLogo` — original, inline
 * SVG recreations in each brand's colour (we don't ship the OTAs' real
 * trademarked logos, and nothing is hotlinked from a CDN).
 *
 * Props
 *  variant   "card" (bordered white card w/ heading) | "bare" (chips only)
 *  size      "full" (default chips) | "compact" (smaller, no initial bubble)
 *  showMore  render the trailing "more coming soon" chip (default true)
 *  title     heading text for the card variant
 *  subtitle  optional line under the chips
 *  icon      lucide icon for the card heading (default Globe2)
 *  align     "left" (default) | "center" — chip + text alignment
 *  dark      dark-surface palette for the card/bare chips
 */
import { Globe2 } from "lucide-react";
import OtaLogo from "@/components/OtaLogo";
import {
  OTA_CHANNELS,
  MORE_CHANNELS_LABEL,
  CHANNEL_TOTAL_LABEL,
  LIVE_OTA_CHANNELS,
} from "@/data/otaChannels";

function Chip({ channel, size, dark }) {
  const compact = size === "compact";

  if (dark) {
    return (
      <span
        className={`inline-flex items-center gap-2 rounded-full bg-white/[0.06] font-semibold text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] ring-1 ring-white/10 backdrop-blur transition duration-500 ease-spring hover:-translate-y-0.5 hover:bg-white/[0.1] hover:text-white ${
          compact ? "pl-1 pr-2.5 py-1 text-[11px]" : "pl-1.5 pr-3 py-1.5 text-xs"
        }`}
      >
        <OtaLogo
          channelKey={channel.key}
          name={channel.name}
          size={compact ? 18 : 22}
        />
        {channel.name}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition duration-500 ease-spring hover:-translate-y-0.5 ${channel.tint} ${
        compact ? "pl-1 pr-2.5 py-1 text-[11px]" : "pl-1.5 pr-3 py-1.5 text-xs"
      }`}
    >
      <OtaLogo
        channelKey={channel.key}
        name={channel.name}
        size={compact ? 18 : 22}
      />
      {channel.name}
    </span>
  );
}

function MoreChip({ size, dark }) {
  const compact = size === "compact";
  const base = compact
    ? "px-2.5 py-1 text-[11px]"
    : "px-3 py-1.5 text-xs";
  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold ${base} ${
        dark
          ? "border-white/10 bg-white/[0.04] text-white/60 border-dashed"
          : "border-dashed border-ink-900/15 bg-white/60 text-ink-500"
      }`}
    >
      {MORE_CHANNELS_LABEL}
    </span>
  );
}

export default function ChannelWall({
  variant = "card",
  size = "full",
  showMore = true,
  title = "Where your rooms can sell",
  subtitle,
  icon: Icon = Globe2,
  align = "left",
  dark = false,
  className = "",
}) {
  const chips = (
    <div
      className={`flex flex-wrap gap-2 ${
        align === "center" ? "justify-center" : ""
      }`}
    >
      {LIVE_OTA_CHANNELS.map((c) => (
        <Chip key={c.key} channel={c} size={size} dark={dark} />
      ))}
      {showMore && <MoreChip size={size} dark={dark} />}
    </div>
  );

  const sub = subtitle ? (
    <p
      className={`mt-3 text-sm ${dark ? "text-white/60" : "text-ink-500"} ${
        align === "center" ? "text-center" : ""
      }`}
    >
      {subtitle}
    </p>
  ) : null;

  if (variant === "bare") {
    return (
      <div className={className}>
        {chips}
        {sub}
      </div>
    );
  }

  return (
    <div
      className={`p-5 sm:p-6 ${dark ? "card-dark" : "card"} ${className}`}
    >
      {title && (
        <div
          className={`flex items-center gap-2 mb-4 ${
            align === "center" ? "justify-center" : ""
          }`}
        >
          <span
            className={`grid h-7 w-7 place-items-center rounded-lg ${
              dark ? "bg-white/[0.08] text-sunset-gold" : "bg-sunset-soft text-sunset-flame"
            }`}
          >
            <Icon className="h-4 w-4" strokeWidth={1.8} />
          </span>
          <p
            className={`font-display text-sm font-semibold tracking-[-0.01em] ${
              dark ? "text-white" : "text-ink-900"
            }`}
          >
            {title}
          </p>
        </div>
      )}
      {chips}
      {sub}
    </div>
  );
}

export { CHANNEL_TOTAL_LABEL };
