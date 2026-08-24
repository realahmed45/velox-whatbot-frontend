/**
 * Wizard persistence — survives a refresh mid-setup without a server round-trip.
 *
 * sessionStorage only (per-tab, cleared when the browser closes): setup is a
 * one-sitting task and we never want a stale property id leaking into a new
 * session. Every access is wrapped — Safari private mode throws on access.
 *
 * Three steps, not five. Step 1 forks at the very start — "connect a booking
 * channel" (import everything from an OTA) or "enter details myself" — and the
 * whole property + rooms path completes INSIDE it as sub-panes. The old
 * property / rooms / channels screens still exist as the content of those
 * panes; they're just no longer top-level steps.
 */
const KEY = "botlify.onboarding.wizard.v1";

export const STEPS = [
  { key: "setup", label: "Your hotel" },
  { key: "messaging", label: "Guest channels" },
  { key: "done", label: "Done" },
];

export const TOTAL_STEPS = STEPS.length;

/**
 * ?step=<name> → step index. The provider OAuth round trip (WhatsApp /
 * Messenger) returns to `/onboarding/hotel?step=messaging`, which the backend
 * hardcodes in channelController.js — `messaging` MUST stay mapped.
 *
 * The retired 5-step names are kept as aliases so a stale link, a bookmark or
 * an in-flight OAuth redirect issued before this change still lands somewhere
 * sensible instead of bouncing the owner out to the dashboard.
 */
export const STEP_BY_NAME = {
  setup: 0,
  messaging: 1,
  done: 2,
  // Legacy aliases from the 5-step wizard.
  property: 0,
  rooms: 0,
  channels: 0,
};

/**
 * Sub-panes of step 1. Persisted so a refresh mid-fork doesn't restart it.
 *
 * CHOOSE is now the import-first screen ("bring your hotel across"), not a
 * 50/50 fork — REVIEW is the "is this right?" moment straight after an import
 * lands, where a missing rate is fixed inline before anything is confirmed.
 */
export const SETUP_PANES = {
  CHOOSE: "choose",
  MANUAL_PROPERTY: "manual-property",
  IMPORT: "import",
  REVIEW: "review",
  ROOMS: "rooms",
};

export const emptyState = {
  step: 0,
  /** Which fork they picked in step 1: null | "ota" | "manual". */
  setupPath: null,
  /** Current sub-pane of step 1 — see SETUP_PANES. */
  setupPane: SETUP_PANES.CHOOSE,
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
    const merged = { ...emptyState, ...parsed };
    // A state saved by the old 5-step wizard can carry a step of 3 or 4.
    if (typeof merged.step !== "number" || merged.step < 0) merged.step = 0;
    if (merged.step > TOTAL_STEPS - 1) merged.step = TOTAL_STEPS - 1;
    return merged;
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
