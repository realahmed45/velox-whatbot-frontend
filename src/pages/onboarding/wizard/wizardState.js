/**
 * Wizard persistence — survives a refresh mid-setup without a server round-trip.
 *
 * sessionStorage only (per-tab, cleared when the browser closes): setup is a
 * one-sitting task and we never want a stale property id leaking into a new
 * session. Every access is wrapped — Safari private mode throws on access.
 */
const KEY = "botlify.onboarding.wizard.v1";

export const STEPS = [
  { key: "property", label: "Property" },
  { key: "rooms", label: "Rooms" },
  { key: "channels", label: "Channels" },
  { key: "messaging", label: "Messaging" },
  { key: "done", label: "Done" },
];

export const TOTAL_STEPS = STEPS.length;

export const emptyState = {
  step: 0,
  propertyId: null,
  propertyName: "",
  currency: "USD",
  bookingSlug: null,
  roomsAdded: 0,
  channelsImported: false,
  channelsSkipped: false,
  /**
   * Which OTAs the hotel says it's already listed on — keys from
   * `@/data/otaChannels`. Intent, not a live connection: the actual sync runs
   * through Channex, which may not be switched on for the account yet. Used to
   * personalise the Done screen and to tell onboarding what to set up.
   */
  channelsSelected: [],
  messagingConnected: [],
};

export function loadWizard() {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return { ...emptyState };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return { ...emptyState };
    return { ...emptyState, ...parsed };
  } catch {
    return { ...emptyState };
  }
}

export function saveWizard(state) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* private mode / quota — progress simply won't survive a refresh */
  }
}

export function clearWizard() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
