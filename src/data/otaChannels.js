/**
 * Canonical OTA / booking-channel list — ONE source of truth.
 *
 * Botlify distributes to these channels through its connectivity partner
 * (Channex). We name the 10 the product treats as first-class booking sources
 * and state the rest honestly as "50+ more" through the same connection.
 *
 * Honest-claims rule: we connect *via a connectivity partner*. Say "60+
 * channels", never "every OTA in the world", and never imply a direct
 * partnership with an OTA we don't have one with.
 *
 * No brand marks — we don't have rights to OTA logos. Chips use coloured
 * initials on a tint instead (see ChannelWall.jsx).
 */

/** The 10 named channels, in the order we always show them. */
export const OTA_CHANNELS = [
  {
    key: "booking",
    name: "Booking.com",
    short: "B",
    tint: "bg-blue-50 text-blue-700 border-blue-100",
  },
  {
    key: "airbnb",
    name: "Airbnb",
    short: "A",
    tint: "bg-rose-50 text-rose-700 border-rose-100",
  },
  {
    key: "agoda",
    name: "Agoda",
    short: "Ag",
    tint: "bg-indigo-50 text-indigo-700 border-indigo-100",
  },
  {
    key: "expedia",
    name: "Expedia",
    short: "E",
    tint: "bg-amber-50 text-amber-700 border-amber-100",
  },
  {
    key: "vrbo",
    name: "Vrbo",
    short: "V",
    tint: "bg-sky-50 text-sky-700 border-sky-100",
  },
  {
    key: "traveloka",
    name: "Traveloka",
    short: "Tr",
    tint: "bg-cyan-50 text-cyan-700 border-cyan-100",
  },
  {
    key: "tiket",
    name: "Tiket.com",
    short: "Ti",
    tint: "bg-teal-50 text-teal-700 border-teal-100",
  },
  {
    key: "trip",
    name: "Trip.com",
    short: "Tc",
    tint: "bg-violet-50 text-violet-700 border-violet-100",
  },
  {
    key: "hostelworld",
    name: "Hostelworld",
    short: "Hw",
    tint: "bg-orange-50 text-orange-700 border-orange-100",
  },
  {
    key: "google",
    name: "Google Hotel Ads",
    short: "G",
    tint: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
];

/** Headline figure used in copy everywhere. */
export const CHANNEL_TOTAL_LABEL = "60+";

/** Copy for the trailing "and 50 more" chip / phrase. */
export const MORE_CHANNELS_LABEL = "and 50 more";

/** Longer form for prose, e.g. "…plus 50+ more through one connection." */
export const MORE_CHANNELS_PHRASE = "50+ more through one connection";

/**
 * Comma-joined channel names.
 * @param {number} [limit] only the first N names (undefined = all 10)
 * @param {boolean} [withMore] append " and 50 more"
 */
export function channelNames(limit, withMore = false) {
  const list = OTA_CHANNELS.slice(0, limit ?? OTA_CHANNELS.length).map(
    (c) => c.name,
  );
  const joined =
    list.length > 1
      ? `${list.slice(0, -1).join(", ")} and ${list[list.length - 1]}`
      : list[0] || "";
  return withMore ? `${joined} — ${MORE_CHANNELS_PHRASE}` : joined;
}

/** e.g. "60+ channels" */
export const CHANNEL_COUNT_PHRASE = `${CHANNEL_TOTAL_LABEL} booking channels`;
