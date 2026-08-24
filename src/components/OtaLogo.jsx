/**
 * OtaLogo — brand marks for the booking channels Botlify distributes to.
 *
 * These are ORIGINAL, simplified marks drawn as inline SVG: each brand's
 * letterform/glyph rendered in that brand's exact colour on a rounded tile.
 * Deliberately not the OTAs' real trademarked logos (we have no licence to
 * ship those) and deliberately NOT hotlinked from a CDN — a strict CSP and a
 * hotelier on Indonesian mobile data both punish external image requests.
 *
 * Every mark is a self-contained <svg> with no external refs, so it renders
 * identically in the wizard, the marketing pages and a print stylesheet.
 *
 * Usage:  <OtaLogo channelKey="booking" size={40} />
 */

/* Brand colours — sourced from each brand's public style guide. */
export const BRAND_COLORS = {
  booking: { bg: "#003b95", fg: "#ffffff" },
  airbnb: { bg: "#FF5A5F", fg: "#ffffff" },
  agoda: { bg: "#5392F9", fg: "#ffffff" },
  expedia: { bg: "#00355F", fg: "#FFC94D" },
  vrbo: { bg: "#3D67FF", fg: "#ffffff" },
  traveloka: { bg: "#0770E3", fg: "#ffffff" },
  tiket: { bg: "#0064D2", fg: "#ffffff" },
  trip: { bg: "#287DFA", fg: "#ffffff" },
  hostelworld: { bg: "#F05A28", fg: "#ffffff" },
  google: { bg: "#4285F4", fg: "#ffffff" },
};

/** Neutral fallback so an unknown key never renders a broken box. */
const FALLBACK = { bg: "#475569", fg: "#ffffff" };

export function brandColor(key) {
  return BRAND_COLORS[key] || FALLBACK;
}

/**
 * A rounded brand tile. `children` are drawn in a 0 0 48 48 viewBox on top of
 * the brand-coloured plate.
 */
function Tile({ bg, size, title, radius = 11, children }) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      role="img"
      aria-label={title}
      className="shrink-0"
    >
      <title>{title}</title>
      <rect width="48" height="48" rx={radius} fill={bg} />
      {children}
    </svg>
  );
}

/**
 * Lettermark tile — the workhorse. A brand-coloured plate with the brand's
 * initial(s) set in heavy Inter, optically centred.
 */
function LetterMark({ brand, label, text, size, weight = 800, fontSize = 24 }) {
  const { bg, fg } = brandColor(brand);
  return (
    <Tile bg={bg} size={size} title={label}>
      <text
        x="24"
        y="24"
        textAnchor="middle"
        dominantBaseline="central"
        fill={fg}
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight={weight}
        fontSize={fontSize}
        letterSpacing="-0.5"
      >
        {text}
      </text>
    </Tile>
  );
}

/* ── Per-brand marks ──────────────────────────────────────────────────────── */

/** Booking.com — the deep-blue plate with a bold "B". */
function BookingMark({ size }) {
  return <LetterMark brand="booking" label="Booking.com" text="B" size={size} />;
}

/**
 * Airbnb — a simplified looped "bélo"-style glyph: a rounded arch whose legs
 * curl back inward. Drawn from scratch as a single stroked path.
 */
function AirbnbMark({ size }) {
  const { bg, fg } = brandColor("airbnb");
  return (
    <Tile bg={bg} size={size} title="Airbnb">
      <path
        d="M24 13c2 0 3.3 1.5 4.6 4 2.2 4.2 4.6 9 5.3 11.4.8 2.8-.9 5.3-3.5 5.3-2 0-3.9-1.3-6.4-4-2.5 2.7-4.4 4-6.4 4-2.6 0-4.3-2.5-3.5-5.3.7-2.4 3.1-7.2 5.3-11.4C20.7 14.5 22 13 24 13Z"
        fill="none"
        stroke={fg}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Tile>
  );
}

/** Agoda — the blue plate with a rounded "a". */
function AgodaMark({ size }) {
  return (
    <LetterMark brand="agoda" label="Agoda" text="a" size={size} fontSize={28} />
  );
}

/**
 * Expedia — navy plate with a gold aeroplane-wing chevron rising to the right,
 * echoing the brand's travel mark.
 */
function ExpediaMark({ size }) {
  const { bg, fg } = brandColor("expedia");
  return (
    <Tile bg={bg} size={size} title="Expedia">
      <path
        d="M13 30.5 24 15l11 15.5-11-5.2-11 5.2Z"
        fill={fg}
        strokeLinejoin="round"
      />
      <path d="M15 34.5h18" stroke={fg} strokeWidth="2.4" strokeLinecap="round" />
    </Tile>
  );
}

/** Vrbo — blue plate with a bold "V". */
function VrboMark({ size }) {
  return <LetterMark brand="vrbo" label="Vrbo" text="V" size={size} />;
}

/**
 * Traveloka — blue plate with a simplified paper-plane, the brand's travel
 * motif.
 */
function TravelokaMark({ size }) {
  const { bg, fg } = brandColor("traveloka");
  return (
    <Tile bg={bg} size={size} title="Traveloka">
      <path d="M35 14 13 24.2l8.4 2.9L35 14Z" fill={fg} />
      <path d="M35 14 21.4 27.1l1 7.4L35 14Z" fill={fg} fillOpacity="0.72" />
    </Tile>
  );
}

/** Tiket.com — blue plate with a ticket glyph (notched rectangle). */
function TiketMark({ size }) {
  const { bg, fg } = brandColor("tiket");
  return (
    <Tile bg={bg} size={size} title="Tiket.com">
      <path
        d="M13 19.5a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2v2.2a2.3 2.3 0 0 0 0 4.6v2.2a2 2 0 0 1-2 2H15a2 2 0 0 1-2-2v-2.2a2.3 2.3 0 0 0 0-4.6v-2.2Z"
        fill={fg}
      />
      <path
        d="M24 20v8"
        stroke={bg}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeDasharray="2 2.6"
      />
    </Tile>
  );
}

/** Trip.com — blue plate with a bold "T". */
function TripMark({ size }) {
  return <LetterMark brand="trip" label="Trip.com" text="T" size={size} />;
}

/**
 * Hostelworld — orange plate with a simple bunk-bed glyph, the clearest
 * shorthand for a hostel.
 */
function HostelworldMark({ size }) {
  const { bg, fg } = brandColor("hostelworld");
  return (
    <Tile bg={bg} size={size} title="Hostelworld">
      <path
        d="M14 14v20M34 14v20"
        stroke={fg}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <rect x="16" y="18" width="16" height="3.6" rx="1.4" fill={fg} />
      <rect x="16" y="27" width="16" height="3.6" rx="1.4" fill={fg} />
    </Tile>
  );
}

/**
 * Google Hotel Ads — the four Google colours as a rotating ring around a
 * neutral plate, so it reads as Google without copying the "G" mark.
 */
function GoogleMark({ size }) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      role="img"
      aria-label="Google Hotel Ads"
      className="shrink-0"
    >
      <title>Google Hotel Ads</title>
      <rect width="48" height="48" rx="11" fill="#ffffff" />
      <rect
        width="47"
        height="47"
        x="0.5"
        y="0.5"
        rx="10.5"
        fill="none"
        stroke="#e2e8f0"
      />
      {/* Four arcs in the Google palette. */}
      <g fill="none" strokeWidth="4.6" strokeLinecap="round">
        <path d="M34 17.6A12 12 0 0 0 14.6 20" stroke="#4285F4" />
        <path d="M14.6 20A12 12 0 0 0 15.4 30" stroke="#FBBC05" />
        <path d="M15.4 30a12 12 0 0 0 18.2 3.4" stroke="#34A853" />
        <path d="M33.6 33.4A12 12 0 0 0 36 24h-11" stroke="#EA4335" />
      </g>
    </svg>
  );
}

const MARKS = {
  booking: BookingMark,
  airbnb: AirbnbMark,
  agoda: AgodaMark,
  expedia: ExpediaMark,
  vrbo: VrboMark,
  traveloka: TravelokaMark,
  tiket: TiketMark,
  trip: TripMark,
  hostelworld: HostelworldMark,
  google: GoogleMark,
};

/**
 * The public component. Falls back to a neutral lettermark built from the
 * channel name so a new entry in otaChannels.js never renders empty.
 */
export default function OtaLogo({ channelKey, name = "", size = 40 }) {
  const Mark = MARKS[channelKey];
  if (Mark) return <Mark size={size} />;
  const initial = (name || channelKey || "?").slice(0, 1).toUpperCase();
  return (
    <LetterMark
      brand={channelKey}
      label={name || channelKey}
      text={initial}
      size={size}
    />
  );
}
