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
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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

export function paragraphs(text) {
  return String(text || "")
    .split(/\n{2,}|\r\n\r\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** <img> that degrades to a soft gradient instead of a broken-image icon. */
export function Img({ src, alt = "", className = "", style, fallback = "#d6d3cd" }) {
  const [broken, setBroken] = useState(!src);
  useEffect(() => setBroken(!src), [src]);
  if (broken) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={className}
        style={{
          ...style,
          background: `linear-gradient(135deg, ${fallback}, rgba(0,0,0,0.08))`,
        }}
      />
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
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
  if (still) {
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
  const link = wa();
  if (!link) return null;
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="group fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full shadow-[0_10px_30px_-6px_rgba(0,0,0,0.35)] transition hover:scale-105"
      style={{ background: "#25D366", color: "#fff", padding: "14px" }}
    >
      {!still && (
        <span
          className="absolute inset-0 rounded-full animate-ping"
          style={{ background: "#25D366", opacity: 0.25 }}
        />
      )}
      <WhatsAppIcon size={28} color="#fff" />
      <span className="relative hidden pr-1 text-sm font-semibold group-hover:inline">
        {label}
      </span>
    </a>
  );
}

/** Full-screen photo viewer with keyboard + swipe-free arrows. */
export function Lightbox({ images, index, onClose, onIndex }) {
  const open = index !== null && index !== undefined && images?.length;
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndex((index + 1) % images.length);
      if (e.key === "ArrowLeft") onIndex((index - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, index, images, onClose, onIndex]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onIndex((index - 1 + images.length) % images.length);
                }}
                className="absolute left-3 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-7 w-7" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onIndex((index + 1) % images.length);
                }}
                className="absolute right-3 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                aria-label="Next photo"
              >
                <ChevronRight className="h-7 w-7" />
              </button>
            </>
          )}
          <motion.figure
            key={index}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="max-h-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[index].url}
              alt={images[index].caption || ""}
              className="max-h-[80vh] w-auto rounded-lg object-contain"
            />
            {(images[index].caption || images.length > 1) && (
              <figcaption className="mt-3 flex justify-between gap-4 text-sm text-white/70">
                <span>{images[index].caption}</span>
                <span>
                  {index + 1} / {images.length}
                </span>
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
  const g = site?.content?.gallery || [];
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
