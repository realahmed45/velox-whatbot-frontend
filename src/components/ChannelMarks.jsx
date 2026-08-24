/**
 * Shared channel brand marks — WhatsApp, Instagram, Facebook Messenger and
 * Telegram. Extracted so the Channels screen and the guest inbox draw the exact
 * same glyphs instead of each keeping its own copy of the paths.
 *
 * Every mark takes `className` and paints with `currentColor`, so the caller
 * controls size and tint.
 */
export function WhatsAppMark({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967c-.273-.099-.471-.148-.67.15c-.197.297-.767.966-.94 1.164c-.173.199-.347.223-.644.075c-.297-.15-1.255-.463-2.39-1.475c-.883-.788-1.48-1.761-1.653-2.059c-.173-.297-.018-.458.13-.606c.134-.133.298-.347.446-.52c.149-.174.198-.298.298-.497c.099-.198.05-.371-.025-.52c-.075-.149-.669-1.612-.916-2.207c-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372c-.272.297-1.04 1.016-1.04 2.479c0 1.462 1.065 2.875 1.213 3.074c.149.198 2.096 3.2 5.077 4.487c.709.306 1.262.489 1.694.625c.712.227 1.36.195 1.871.118c.571-.085 1.758-.719 2.006-1.413c.248-.694.248-1.289.173-1.413c-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214l-3.741.982l.998-3.648l-.235-.374a9.86 9.86 0 0 1-1.511-5.26c.001-5.45 4.436-9.884 9.888-9.884c2.64 0 5.122 1.03 6.988 2.898a9.83 9.83 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.884 9.884m8.413-18.297A11.8 11.8 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.9 11.9 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 0 0-3.48-8.413"
      />
    </svg>
  );
}
export function InstagramMark({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2.16c3.2 0 3.58 0 4.85.07c1.17.05 1.8.25 2.23.41c.56.22.96.48 1.38.9c.42.42.68.82.9 1.38c.16.42.36 1.06.41 2.23c.07 1.27.07 1.65.07 4.85s0 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23a3.7 3.7 0 0 1-.9 1.38a3.7 3.7 0 0 1-1.38.9c-.42.16-1.06.36-2.23.41c-1.27.07-1.65.07-4.85.07s-3.58 0-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9a3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23c-.07-1.27-.07-1.65-.07-4.85s0-3.58.07-4.85c.05-1.17.25-1.8.41-2.23c.22-.56.48-.96.9-1.38c.42-.42.82-.68 1.38-.9c.42-.16 1.06-.36 2.23-.41c1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07a8.94 8.94 0 0 0-2.96.57a5.96 5.96 0 0 0-2.16 1.4A5.96 5.96 0 0 0 .54 4.2a8.94 8.94 0 0 0-.57 2.95C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95a8.94 8.94 0 0 0 .57 2.96a5.96 5.96 0 0 0 1.4 2.16a5.96 5.96 0 0 0 2.16 1.4a8.94 8.94 0 0 0 2.95.57C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07a8.94 8.94 0 0 0 2.96-.57a6.22 6.22 0 0 0 3.56-3.56a8.94 8.94 0 0 0 .57-2.95c.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95a8.94 8.94 0 0 0-.57-2.96a5.96 5.96 0 0 0-1.4-2.16a5.96 5.96 0 0 0-2.16-1.4a8.94 8.94 0 0 0-2.95-.57C15.67.01 15.26 0 12 0m0 5.84A6.16 6.16 0 1 0 18.16 12A6.16 6.16 0 0 0 12 5.84M12 16a4 4 0 1 1 4-4a4 4 0 0 1-4 4m6.41-11.85a1.44 1.44 0 1 0 1.44 1.44a1.44 1.44 0 0 0-1.44-1.44"
      />
    </svg>
  );
}

export function MessengerMark({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 0C5.24 0 0 4.95 0 11.64c0 3.5 1.44 6.53 3.78 8.62c.2.18.32.42.32.69l.07 2.14c.02.68.72 1.13 1.35.86l2.39-1.05c.2-.09.43-.11.65-.05c1.09.3 2.25.46 3.44.46c6.76 0 12-4.95 12-11.64S18.76 0 12 0m7.2 8.93l-3.52 5.6c-.56.89-1.76 1.11-2.6.48l-2.8-2.1a.72.72 0 0 0-.87 0l-3.79 2.87c-.5.38-1.16-.22-.82-.75l3.52-5.6c.56-.89 1.76-1.11 2.6-.48l2.8 2.1c.26.19.61.19.87 0l3.79-2.87c.5-.38 1.16.22.82.75"
      />
    </svg>
  );
}
export function TelegramMark({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12a12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0m4.962 7.224c.1-.002.321.023.465.14a.5.5 0 0 1 .171.325c.016.093.036.306.02.472c-.18 1.898-.962 6.502-1.36 8.627c-.168.9-.499 1.201-.82 1.23c-.696.065-1.225-.46-1.9-.902c-1.056-.693-1.653-1.124-2.678-1.8c-1.185-.78-.417-1.21.258-1.91c.177-.184 3.247-2.977 3.307-3.23c.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345c-.48.33-.913.49-1.302.48c-.428-.008-1.252-.241-1.865-.44c-.752-.245-1.349-.374-1.297-.789c.027-.216.325-.437.893-.663c3.498-1.524 5.83-2.529 6.998-3.014c3.332-1.386 4.025-1.627 4.476-1.635"
      />
    </svg>
  );
}


/**
 * Every guest channel Botlify answers on, in the order they're shown.
 * `key` matches the backend `channelType` / `/channels/status` keys.
 */
export const CHANNEL_META = {
  whatsapp: {
    key: "whatsapp",
    name: "WhatsApp",
    shortName: "WhatsApp",
    Mark: WhatsAppMark,
    tint: "bg-emerald-50 text-emerald-600",
    ring: "hover:border-emerald-300",
    dot: "bg-emerald-500",
    solid: "bg-emerald-500 text-white",
  },
  instagram: {
    key: "instagram",
    name: "Instagram",
    shortName: "Instagram",
    Mark: InstagramMark,
    tint: "bg-purple-50 text-purple-600",
    ring: "hover:border-purple-300",
    dot: "bg-purple-500",
    solid: "bg-purple-500 text-white",
  },
  messenger: {
    key: "messenger",
    name: "Facebook Messenger",
    shortName: "Messenger",
    Mark: MessengerMark,
    tint: "bg-blue-50 text-blue-600",
    ring: "hover:border-blue-300",
    dot: "bg-blue-500",
    solid: "bg-blue-500 text-white",
  },
  telegram: {
    key: "telegram",
    name: "Telegram",
    shortName: "Telegram",
    Mark: TelegramMark,
    tint: "bg-sky-50 text-sky-600",
    ring: "hover:border-sky-300",
    dot: "bg-sky-500",
    solid: "bg-sky-500 text-white",
  },
};

/** Display order for channel tabs / lists. */
export const CHANNEL_ORDER = [
  "whatsapp",
  "instagram",
  "messenger",
  "telegram",
];

/** Safe lookup — unknown channelType values fall back to Instagram (legacy). */
export function channelMeta(key) {
  return CHANNEL_META[key] || CHANNEL_META.instagram;
}
