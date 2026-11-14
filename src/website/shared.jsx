/**
 * Shared toolkit for the hotel website templates.
 *
 * Every template is a plain React component that takes the same `site` object
 * (see backend services/website/siteBuilder.js → buildSite) and renders five
 * pages: home, rooms, gallery, about, contact. They're rendered in three
 * places — the live site (botlify.site/<slug>), the full-screen preview, and
 * scaled-down thumbnails — so layout must never depend on the browser
 * viewport. Templates read the width of their own frame through useBp()
 * instead of Tailwind's md:/lg: prefixes; that's what makes the "mobile"
 * preview inside a desktop browser actually show the mobile layout.
 */
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export const PAGES = [
  { id: "home", label: "Home" },
  { id: "rooms", label: "Rooms" },
  { id: "gallery", label: "Gallery" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

export const SiteCtx = createContext({
  site: null,
  width: 1280,
  height: 800,
  scrollRoot: null, // ref to the scrolling element; null = window
  embedded: false,
  still: false,
  page: "home",
  go: () => {},
  href: () => "#",
});

export const useSite = () => useContext(SiteCtx);

/** Breakpoints measured against the template's own frame, not the window. */
export function useBp() {
  const { width } = useSite();
  return { sm: width >= 640, md: width >= 820, lg: width >= 1080, xl: width >= 1320, width };
}

/** Pick a value by breakpoint: bp({ base: 1, md: 2, lg: 3 }). */
export function useResponsive() {
  const b = useBp();
  return (map) => {
    if (b.xl && map.xl !== undefined) return map.xl;
    if (b.lg && map.lg !== undefined) return map.lg;
    if (b.md && map.md !== undefined) return map.md;
    if (b.sm && map.sm !== undefined) return map.sm;
    return map.base;
  };
}

/** Inject a Google Fonts stylesheet once per document. */
export function useFonts(id, families) {
  useEffect(() => {
    const key = `site-font-${id}`;
    if (document.getElementById(key)) return;
    const pre = document.createElement("link");
    pre.rel = "preconnect";
    pre.href = "https://fonts.gstatic.com";
    pre.crossOrigin = "anonymous";
    const link = document.createElement("link");
    link.id = key;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
    document.head.appendChild(pre);
    document.head.appendChild(link);
  }, [id, families]);
}

export function waLink(number, text) {
  const digits = String(number || "").replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

/** WhatsApp link with a sensible prefilled message for this hotel. */
export function useWhatsApp() {
  const { site } = useSite();
  const name = site?.hotel?.name || "there";
  return useCallback(
    (room) =>
      waLink(
        site?.whatsapp,
        room
          ? `Hi ${name}! I'd like to book the ${room}. Is it available for my dates?`
          : `Hi ${name}! I'd like to book a stay. Are you available?`,
      ),
    [site?.whatsapp, name],
  );
}

export function formatPrice(n, currency = "USD") {
  const v = Number(n) || 0;
  if (!v) return null;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(v);
  } catch {
    return `${currency} ${Math.round(v).toLocaleString()}`;
  }
}

export function mapSrc(query) {
  return `https://www.google.com/maps?q=${encodeURIComponent(query || "")}&output=embed`;
}

/** Google Maps directions link (opens the app on phones). */
export function directionsHref(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query || "")}`;
}

export function paragraphs(text) {
  return String(text || "")
    .split(/\n{2,}|\r\n\r\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/**
 * Responsive image helpers. Unsplash (stock photos) and Cloudinary (hotel
 * uploads) both resize on the fly, so we hand the browser a srcset and let it
 * download only the width it needs.
 */
const WIDTHS = [480, 800, 1200, 1600, 2200];

export const SIZES = {
  full: "100vw",
  half: "(min-width: 820px) 50vw, 100vw",
  third: "(min-width: 1080px) 33vw, (min-width: 820px) 50vw, 100vw",
  quarter: "(min-width: 820px) 25vw, 50vw",
  thumb: "(min-width: 1080px) 33vw, 50vw",
};

export function resizedUrl(src, w) {
  if (!src || typeof src !== "string") return null;
  try {
    if (src.startsWith("https://images.unsplash.com/")) {
      const u = new URL(src);
      u.searchParams.set("w", String(w));
      if (!u.searchParams.has("auto")) u.searchParams.set("auto", "format");
      if (!u.searchParams.has("q")) u.searchParams.set("q", "75");
      return u.toString();
    }
    const m = src.match(/^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/);
    if (m) {
      // Only add a transform when the URL doesn't already carry one.
      const first = m[2].split("/")[0];
      if (/^v\d+$/.test(first) || first.includes(".")) {
        return `${m[1]}f_auto,q_auto,c_limit,w_${w}/${m[2]}`;
      }
    }
  } catch {
    /* not a URL we can resize */
  }
  return null;
}

function srcSetFor(src) {
  if (!resizedUrl(src, 800)) return undefined;
  return WIDTHS.map((w) => `${resizedUrl(src, w)} ${w}w`).join(", ");
}

/**
 * <img> that degrades to a soft gradient instead of a broken-image icon.
 * `priority` loads it eagerly (hero images); `sizes` describes the rendered
 * width so the srcset picks the right file.
 */
export function Img({ src, alt = "", className = "", style, fallback = "#d6d3cd", sizes = SIZES.full, priority = false }) {
  const { still } = useSite();
  const [broken, setBroken] = useState(!src);
  useEffect(() => setBroken(!src), [src]);
  if (broken) {
    return (
      <div
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : true}
        className={className}
        style={{
          ...style,
          background: `radial-gradient(120% 90% at 20% 10%, rgba(255,255,255,0.35), transparent 60%), linear-gradient(135deg, ${fallback}, rgba(0,0,0,0.12))`,
        }}
      />
    );
  }
  const srcSet = srcSetFor(src);
  return (
    <img
      src={srcSet ? resizedUrl(src, 1600) : src}
      srcSet={srcSet}
      // Thumbnails are a scaled-down screenshot, so a small file is plenty.
      sizes={srcSet ? (still ? "480px" : sizes) : undefined}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchpriority={priority ? "high" : undefined}
      decoding="async"
      className={className}
      style={style}
      onError={() => setBroken(true)}
    />
  );
}

/** Fade/slide in when scrolled into view. Static in thumbnails. */
export function Reveal({ children, className = "", style, delay = 0, y = 24, as = "div" }) {
  const { still } = useSite();
  const reduce = useReducedMotion();
  if (still || reduce) {
    const Tag = as;
    return (
      <Tag className={className} style={style}>
        {children}
      </Tag>
    );
  }
  const M = motion[as] || motion.div;
  return (
    <M
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </M>
  );
}

/** An internal link to one of the site's five pages. */
export function PageLink({ page, children, className = "", style, onClick }) {
  const { go, href } = useSite();
  return (
    <a
      href={href(page)}
      className={className}
      style={style}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey) return;
        e.preventDefault();
        onClick?.();
        go(page);
      }}
    >
      {children}
    </a>
  );
}

export function WhatsAppIcon({ size = 22, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill={color} aria-hidden="true">
      <path d="M16.04 3C9 3 3.3 8.7 3.3 15.73c0 2.25.59 4.45 1.71 6.39L3.2 28.8l6.86-1.8a12.7 12.7 0 0 0 5.98 1.52h.01c7.03 0 12.74-5.7 12.74-12.74C28.79 8.7 23.08 3 16.04 3Zm0 23.37h-.01a10.6 10.6 0 0 1-5.4-1.48l-.39-.23-4.07 1.07 1.09-3.97-.25-.41a10.56 10.56 0 0 1-1.62-5.62c0-5.85 4.76-10.6 10.62-10.6a10.6 10.6 0 0 1 10.6 10.61c0 5.85-4.76 10.63-10.57 10.63Zm5.82-7.95c-.32-.16-1.89-.93-2.18-1.04-.29-.1-.5-.16-.72.16-.21.32-.82 1.04-1.01 1.25-.18.21-.37.24-.69.08-.32-.16-1.34-.5-2.56-1.58-.95-.84-1.59-1.89-1.77-2.21-.19-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.18.21-.32.32-.53.1-.21.05-.4-.03-.56-.08-.16-.72-1.73-.98-2.37-.26-.62-.52-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.29.32-1.12 1.09-1.12 2.66 0 1.57 1.14 3.08 1.3 3.3.16.21 2.25 3.43 5.44 4.81.76.33 1.35.52 1.81.67.76.24 1.46.21 2 .13.61-.09 1.89-.77 2.15-1.52.27-.75.27-1.39.19-1.52-.08-.13-.29-.21-.61-.37Z" />
    </svg>
  );
}

/** Floating "chat on WhatsApp" button, bottom-right on every page. */
export function WhatsAppFab({ label = "Chat with us" }) {
  const wa = useWhatsApp();
  const { still } = useSite();
  const bar = useShowMobileBar();
  const link = wa();
  // On phones the sticky booking bar already carries WhatsApp.
  if (!link || bar) return null;
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="group fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full shadow-[0_10px_30px_-6px_rgba(0,0,0,0.35)] transition-transform hover:scale-105"
      style={{ background: "#25D366", color: "#fff", padding: "14px" }}
    >
      {!still && (
        // A few pulses to draw the eye, then it rests (no endless loop).
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full animate-ping"
          style={{ background: "#25D366", opacity: 0.25, animationIterationCount: 3 }}
        />
      )}
      <WhatsAppIcon size={28} color="#fff" />
      <span className="relative hidden pr-1 text-sm font-semibold group-hover:inline group-focus-visible:inline">
        {label}
      </span>
    </a>
  );
}

/**
 * The hotel's primary booking action: the direct booking page when it has
 * one, otherwise WhatsApp (naming the room when given). null when neither.
 */
export function useBookCta(room) {
  const book = useBooking();
  const wa = useWhatsApp()(room);
  if (book) return { ...book, kind: "booking", label: "Book now" };
  if (wa) return { href: wa, target: "_blank", rel: "noopener noreferrer", kind: "whatsapp", label: "Book on WhatsApp" };
  return null;
}

/** Rooms that are safe to render (they have a name). */
export function useRooms() {
  const { site } = useSite();
  return (site?.rooms || []).filter((r) => r && r.name);
}

/** The cheapest priced room, for "from $X / night" labels. */
export function useCheapestRoom() {
  const rooms = useRooms();
  return rooms.filter((r) => Number(r.price) > 0).sort((a, b) => a.price - b.price)[0] || null;
}

/** Reviews that actually have a quote. */
export function useReviews() {
  const { site } = useSite();
  return (site?.content?.testimonials || []).filter((t) => t && t.quote);
}

/** ["Sleeps 2", "1 king bed", "28 m²"] from whatever the room has. */
export function roomFacts(room, { sleeps = "Sleeps" } = {}) {
  return [
    Number(room?.maxOccupancy) > 0 && `${sleeps} ${room.maxOccupancy}`,
    room?.bedConfig,
    Number(room?.sizeSqm) > 0 && `${room.sizeSqm} m²`,
  ].filter(Boolean);
}

/** Phone-width frames only (live or preview), never in desktop thumbnails. */
export function useShowMobileBar() {
  const { still } = useSite();
  const { md } = useBp();
  const cta = useBookCta();
  return !still && !md && !!cta;
}

const BAR_H = 68;

/**
 * Sticky "Book now" bar for phones, themed by each template. It leaves a
 * spacer of its own height at the end of the page, so at the bottom of the
 * scroll it sits exactly over the spacer and never hides the footer.
 */
export function MobileBookBar({
  bg = "#ffffff",
  fg = "#111111",
  muted = "rgba(0,0,0,0.6)",
  accent = "#111111",
  accentFg = "#ffffff",
  font,
  displayFont,
  radius = 999,
  border = "rgba(0,0,0,0.08)",
  uppercase = false,
}) {
  const show = useShowMobileBar();
  const cta = useBookCta();
  const wa = useWhatsApp()();
  const cheapest = useCheapestRoom();
  const { site } = useSite();
  if (!show || !cta) return null;
  const price = cheapest ? formatPrice(cheapest.price, cheapest.currency) : null;
  const pad = "env(safe-area-inset-bottom, 0px)";
  return (
    <>
      <div aria-hidden="true" style={{ height: `calc(${BAR_H}px + ${pad})` }} />
      <div
        className="fixed inset-x-0 bottom-0 z-20"
        style={{ background: bg, color: fg, borderTop: `1px solid ${border}`, paddingBottom: pad, boxShadow: "0 -10px 30px -18px rgba(0,0,0,0.45)", fontFamily: font }}
      >
        <div className="mx-auto flex items-center gap-3 px-4" style={{ height: BAR_H, maxWidth: 640 }}>
          <div className="min-w-0 flex-1 leading-tight">
            {price ? (
              <>
                <span className="block text-[11px] uppercase tracking-[0.14em]" style={{ color: muted }}>From</span>
                <span className="block truncate text-[17px] font-semibold" style={{ fontFamily: displayFont || font }}>
                  {price}
                  <span className="text-[12px] font-normal" style={{ color: muted, fontFamily: font }}> / night</span>
                </span>
              </>
            ) : (
              <span className="block truncate text-[16px] font-semibold" style={{ fontFamily: displayFont || font }}>{site?.hotel?.name}</span>
            )}
          </div>
          {cta.kind === "booking" && wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with us on WhatsApp"
              className="flex h-11 w-11 shrink-0 items-center justify-center"
              style={{ background: "#25D366", color: "#fff", borderRadius: radius }}
            >
              <WhatsAppIcon size={22} color="#fff" />
            </a>
          )}
          <a
            href={cta.href}
            target={cta.target}
            rel={cta.rel}
            className={`inline-flex h-11 shrink-0 items-center justify-center gap-2 px-5 font-semibold ${uppercase ? "text-[12px] uppercase tracking-[0.16em]" : "text-[15px]"}`}
            style={{ background: accent, color: accentFg, borderRadius: radius }}
          >
            {cta.kind === "whatsapp" && <WhatsAppIcon size={16} />}
            Book now
          </a>
        </div>
      </div>
    </>
  );
}

/** Full-screen photo viewer: keyboard arrows, swipe, focus handling, scroll lock. */
export function Lightbox({ images, index, onClose, onIndex }) {
  const n = images?.length || 0;
  const open = index !== null && index !== undefined && n > 0 && !!images[index];
  const { embedded } = useSite();
  const closeRef = useRef(null);
  const touchX = useRef(null);
  const next = useCallback(() => onIndex((index + 1) % n), [index, n, onIndex]);
  const prev = useCallback(() => onIndex((index - 1 + n) % n), [index, n, onIndex]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && n > 1) next();
      if (e.key === "ArrowLeft" && n > 1) prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, n, next, prev, onClose]);

  // Focus the close button on open and hand focus back on close; lock page scroll.
  useEffect(() => {
    if (!open) return undefined;
    const before = document.activeElement;
    closeRef.current?.focus({ preventScroll: true });
    const prevOverflow = document.body.style.overflow;
    if (!embedded) document.body.style.overflow = "hidden";
    return () => {
      if (!embedded) document.body.style.overflow = prevOverflow;
      before?.focus?.({ preventScroll: true });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Warm up the neighbouring photos so arrowing through feels instant.
  useEffect(() => {
    if (!open || n < 2) return;
    [images[(index + 1) % n], images[(index - 1 + n) % n]].forEach((im) => {
      const src = resizedUrl(im?.url, 1600) || im?.url;
      if (src) new Image().src = src;
    });
  }, [open, index, images, n]);

  const cur = open ? images[index] : null;
  const src = cur ? resizedUrl(cur.url, 1600) || cur.url : null;
  const btn =
    "absolute z-10 rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          onTouchStart={(e) => {
            touchX.current = e.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(e) => {
            const x0 = touchX.current;
            const x1 = e.changedTouches[0]?.clientX;
            touchX.current = null;
            if (x0 == null || x1 == null || n < 2) return;
            if (x1 - x0 > 50) prev();
            else if (x0 - x1 > 50) next();
          }}
        >
          <button ref={closeRef} type="button" onClick={onClose} className={`${btn} right-4 top-4`} aria-label="Close photo viewer">
            <X className="h-6 w-6" />
          </button>
          {n > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className={`${btn} left-2`}
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-7 w-7" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className={`${btn} right-2`}
                aria-label="Next photo"
              >
                <ChevronRight className="h-7 w-7" />
              </button>
            </>
          )}
          <motion.figure
            key={index}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.22 }}
            className="flex max-h-full max-w-6xl flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={src}
              alt={cur.caption || `Photo ${index + 1} of ${n}`}
              decoding="async"
              className="max-h-[80vh] w-auto max-w-full rounded-md object-contain"
            />
            {(cur.caption || n > 1) && (
              <figcaption className="mt-3 flex w-full justify-between gap-4 px-1 text-sm text-white/80" aria-live="polite">
                <span>{cur.caption}</span>
                {n > 1 && (
                  <span className="tabular-nums">
                    {index + 1} / {n}
                  </span>
                )}
              </figcaption>
            )}
          </motion.figure>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Lightbox state helper. */
export function useLightbox() {
  const [index, setIndex] = useState(null);
  return { index, open: setIndex, close: () => setIndex(null), setIndex };
}

/** Lock page scroll while a mobile menu is open (live site only). */
export function useMenu() {
  const [open, setOpen] = useState(false);
  const { page, embedded } = useSite();
  useEffect(() => setOpen(false), [page]);
  useEffect(() => {
    if (embedded || !open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, embedded]);
  return [open, setOpen];
}

/** Gallery list with hero/about images folded in if the gallery is empty. */
export function useGallery() {
  const { site } = useSite();
  const g = (site?.content?.gallery || []).filter((x) => x && x.url);
  if (g.length) return g;
  return [site?.content?.hero?.image, site?.content?.about?.image]
    .filter(Boolean)
    .map((url) => ({ url, caption: "" }));
}

export function MapFrame({ className = "", style, query, title = "Map" }) {
  const { still } = useSite();
  if (still) {
    return <div className={className} style={{ ...style, background: "#d9dee2" }} />;
  }
  return (
    <iframe
      title={title}
      src={mapSrc(query)}
      className={className}
      style={{ border: 0, ...style }}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
    />
  );
}

export const year = () => new Date().getFullYear();

/** Has the page scrolled past `t` px? Works in the live site and in previews. */
export function useScrolled(t = 40) {
  const { scrollRoot, still, page } = useSite();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    if (still) return undefined;
    const el = scrollRoot?.current || window;
    const get = () => (el === window ? window.scrollY : el.scrollTop);
    const on = () => setScrolled(get() > t);
    on();
    el.addEventListener("scroll", on, { passive: true });
    return () => el.removeEventListener("scroll", on);
  }, [scrollRoot, still, t, page]);
  return scrolled;
}

/** A height in px relative to the frame (vh doesn't work inside previews). */
export function useFrameHeight(fraction = 1, min = 520) {
  const { height } = useSite();
  return Math.max(min, Math.round((height || 800) * fraction));
}

/** The direct booking page link, if the hotel has one. */
export function useBooking() {
  const { site, embedded } = useSite();
  if (!site?.bookingUrl) return null;
  return {
    href: site.bookingUrl,
    target: embedded ? "_blank" : undefined,
    rel: embedded ? "noopener noreferrer" : undefined,
  };
}

/**
 * The contact form. There's no inbox behind a static site, so it does the
 * most useful thing: opens WhatsApp with the enquiry already written (or an
 * email when the hotel has no WhatsApp number).
 */
export function useEnquiry() {
  const { site } = useSite();
  const [v, setV] = useState({ name: "", checkIn: "", checkOut: "", guests: "2", message: "" });
  const set = (k) => (e) => setV((cur) => ({ ...cur, [k]: e.target.value }));
  const text = [
    `Hi ${site?.hotel?.name || ""}! I'd like to enquire about a stay.`,
    v.name && `Name: ${v.name}`,
    (v.checkIn || v.checkOut) && `Dates: ${v.checkIn || "?"} to ${v.checkOut || "?"}`,
    v.guests && `Guests: ${v.guests}`,
    v.message,
  ]
    .filter(Boolean)
    .join("\n");
  const submit = (e) => {
    e?.preventDefault?.();
    const wa = waLink(site?.whatsapp, text);
    const email = site?.content?.contact?.email;
    const target = wa || (email ? `mailto:${email}?subject=${encodeURIComponent("Booking enquiry")}&body=${encodeURIComponent(text)}` : null);
    if (target) window.open(target, "_blank", "noopener");
  };
  return { v, set, submit, via: site?.whatsapp ? "WhatsApp" : "email" };
}
