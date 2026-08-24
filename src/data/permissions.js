/**
 * Staff permission catalogue — the FALLBACK copy of the backend's
 * `PERMISSION_LIST` (see backend `src/config/permissions.js`).
 *
 * The live list is fetched from `GET /api/workspaces/permissions`; this mirror
 * only renders if that request fails, so the invite modal is never an empty
 * box. Keys must stay identical to the backend's — they're stored on member and
 * invite records.
 *
 * Legacy Instagram-era keys (`contacts`, `automations`, `broadcasts`,
 * `content`, `integrations`) still validate server-side so existing staff keep
 * working, but they are deliberately NOT offered for new invites.
 */

/** The six areas a hotel actually staffs, in the order we always show them. */
export const PERMISSION_LIST = [
  {
    key: "bookings",
    label: "Bookings",
    desc: "See reservations, check guests in and out, add extras",
  },
  {
    key: "inbox",
    label: "Guest messages",
    desc: "Reply to guests on WhatsApp, Instagram, Messenger & Telegram",
  },
  {
    key: "calendar",
    label: "Calendar & rates",
    desc: "Availability, nightly rates and the housekeeping board",
  },
  {
    key: "guests",
    label: "Guests",
    desc: "Guest profiles, stay history and preferences",
  },
  {
    key: "analytics",
    label: "Reports",
    desc: "Occupancy, revenue and channel performance",
  },
  {
    key: "settings",
    label: "Settings",
    desc: "Property details, rooms, channels and extras",
  },
];

/**
 * Labels for permission keys we no longer offer but may still be stored on an
 * existing staff member — so their granted areas render as words, not raw keys.
 */
export const LEGACY_PERMISSION_LABELS = {
  contacts: "Guests (legacy)",
  automations: "AI assistant (legacy)",
  broadcasts: "Guest campaigns (legacy)",
  content: "Content (legacy)",
  integrations: "Apps & webhooks (legacy)",
};

/** Human label for any permission key, current or legacy. */
export function permissionLabel(key) {
  const known = PERMISSION_LIST.find((p) => p.key === key);
  return known?.label || LEGACY_PERMISSION_LABELS[key] || key;
}
