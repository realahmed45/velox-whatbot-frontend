/**
 * Tropic — lush and playful. Deep jungle green with a lime highlight, big
 * rounded cards, a floating pill nav and a bento layout. Fraunces (soft, heavy
 * serif) over Outfit. Feels like a design-led island resort or villa.
 */
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, BedDouble, Clock, Mail, MapPin, Menu, Phone, Sparkles, Users, X } from "lucide-react";
import {
  Counter, Img, KenBurns, Lightbox, MapFrame, MobileBookBar, PageLink, Reveal, RevealText, Rise, SIZES, ScrollProgress,
  ServiceIcon, WhatsAppFab, WhatsAppIcon, directionsHref, formatPrice, paragraphs, servicePrice, useActivePage, useBookCta,
  useBooking, useBp, useCalm, useCheapestRoom, useEnquiry, useFonts, useFrameHeight, useGallery, useLightbox, useMenu,
  useNavPages, useReviews, useRooms, useScrolled, useServiceCta, useServices, useSite, useWhatsApp, year,
} from "../shared";

const DISPLAY = "'Fraunces', Georgia, serif";
const SANS = "'Outfit', system-ui, sans-serif";
const CREAM = "#f3efe2";
const INK = "#10261c";
const MUTED = "#5b6b61";
const LIME = "#d6f06a";

export default function Tropic() {
  useFonts("tropic", "family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700;9..144,800&family=Outfit:wght@300;400;500;600;700");
  const { site } = useSite();
  const page = useActivePage();
  const green = site.accent || "#1c4a35";
  const gallery = useGallery();
  const lb = useLightbox();
  return (
    <div style={{ fontFamily: SANS, background: CREAM, color: INK }} className="min-h-full antialiased">
      <Nav green={green} />
      <main>
        {page === "home" && <Home green={green} onPhoto={lb.open} />}
        {page === "rooms" && <Rooms green={green} />}
        {page === "services" && <ServicesPage green={green} />}
        {page === "gallery" && <Gallery green={green} onPhoto={lb.open} />}
        {page === "about" && <About green={green} />}
        {page === "contact" && <Contact green={green} />}
      </main>
      <Footer green={green} />
      <MobileBookBar bg="#ffffff" fg={INK} muted={MUTED} accent={green} accentFg={LIME} font={SANS} displayFont={DISPLAY} border="rgba(16,38,28,0.1)" />
      <WhatsAppFab />
      <Lightbox images={gallery} index={lb.index} onClose={lb.close} onIndex={lb.setIndex} />
    </div>
  );
}

function Big({ children, size = 64, className = "", style }) {
  const { md } = useBp();
  return (
    <h2 className={`font-bold leading-[0.98] tracking-tight ${className}`} style={{ fontFamily: DISPLAY, fontSize: md ? size : size * 0.6, ...style }}>
      {children}
    </h2>
  );
}

const Tag = ({ children, bg = "#fff", color = INK }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-medium" style={{ background: bg, color }}>
    {children}
  </span>
);

function Pill({ href, children, bg, color, ...rest }) {
  return (
    <a href={href} {...rest} className="inline-flex items-center gap-2 rounded-full px-7 py-4 text-[15px] font-semibold shadow-[0_8px_24px_-14px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:-translate-y-0.5 active:scale-[0.97]" style={{ background: bg, color }}>
      {children}
    </a>
  );
}

/** Booking-first button pair; WhatsApp-first when there's no booking page. */
function CtaPills({ green, onDark = true }) {
  const wa = useWhatsApp()();
  const book = useBooking();
  return (
    <div className="flex flex-wrap gap-3">
      {book && <Pill {...book} bg={LIME} color={INK}>Book now <ArrowUpRight className="h-4 w-4" /></Pill>}
      {wa && (
        <Pill href={wa} target="_blank" rel="noopener noreferrer" bg={book ? "#fff" : LIME} color={INK}>
          <WhatsAppIcon size={18} /> {book ? "WhatsApp us" : "Book on WhatsApp"}
        </Pill>
      )}
      {!book && !wa && (
        <PageLink page="contact" className="inline-flex items-center gap-2 rounded-full px-7 py-4 text-[15px] font-semibold" style={{ background: onDark ? LIME : green, color: onDark ? INK : LIME }}>
          Get in touch <ArrowRight className="h-4 w-4" />
        </PageLink>
      )}
    </div>
  );
}

function Nav({ green }) {
  const { site } = useSite();
  const page = useActivePage();
  const pages = useNavPages();
  const { md, lg } = useBp();
  const wide = pages.length > 5 ? lg : md;
  const scrolled = useScrolled(30);
  const [open, setOpen] = useMenu();
  const cta = useBookCta();
  return (
    <>
      <header className="fixed left-0 right-0 top-4 z-40 px-4">
        <div
          className="relative mx-auto flex max-w-6xl items-center justify-between overflow-hidden rounded-full py-2 pl-6 pr-2"
          style={{ background: scrolled ? "rgba(255,255,255,0.86)" : "rgba(255,255,255,0.94)", backdropFilter: "blur(14px) saturate(150%)", WebkitBackdropFilter: "blur(14px) saturate(150%)", boxShadow: "0 10px 34px -14px rgba(16,38,28,0.4), inset 0 0 0 1px rgba(255,255,255,0.6)" }}
        >
          <PageLink page="home" className="min-w-0 truncate text-xl font-bold" style={{ fontFamily: DISPLAY, color: green }}>{site.hotel.name}</PageLink>
          {wide ? (
            <nav className="flex shrink-0 items-center gap-1">
              {pages.map((p) => (
                <PageLink key={p.id} page={p.id} className="group relative rounded-full px-4 py-2 text-[14px] font-medium" style={{ color: INK }}>
                  <span aria-hidden="true" className={`absolute inset-0 rounded-full transition-[transform,opacity] duration-300 ${page === p.id ? "scale-100 opacity-100" : "scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-60"}`} style={{ background: CREAM }} />
                  <span className="relative">{p.label}</span>
                </PageLink>
              ))}
              {cta && <a href={cta.href} target={cta.target} rel={cta.rel} className="ml-2 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-semibold transition-transform duration-300 hover:scale-[1.04]" style={{ background: green, color: LIME }}>{cta.kind === "whatsapp" && <WhatsAppIcon size={16} />} Book now</a>}
            </nav>
          ) : (
            <button type="button" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} className="ml-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: green, color: LIME }}>
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}
          {scrolled && <ScrollProgress color={green} height={2} style={{ opacity: 0.55 }} />}
        </div>
      </header>
      {open && !wide && (
        <div className="fixed inset-0 z-30 flex flex-col justify-end overflow-y-auto p-6 pb-28 pt-28" style={{ background: green }}>
          {pages.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.05} y={14}>
              <PageLink page={p.id} className="block py-1.5 text-[44px] font-bold leading-tight" style={{ fontFamily: DISPLAY, color: page === p.id ? LIME : "#fff" }}>{p.label}</PageLink>
            </Reveal>
          ))}
          {cta && <div className="mt-8"><Pill href={cta.href} target={cta.target} rel={cta.rel} bg={LIME} color={INK}>{cta.kind === "whatsapp" && <WhatsAppIcon size={18} />} {cta.label}</Pill></div>}
        </div>
      )}
    </>
  );
}

/**
 * Amenity ticker. A pure CSS transform animation (compositor-only, no JS per
 * frame), paused whenever it's off-screen and frozen for reduced motion.
 */
const MARQUEE_CSS = `@keyframes tropic-marquee{from{transform:translate3d(0,0,0)}to{transform:translate3d(-50%,0,0)}}
.tropic-marquee{animation:tropic-marquee var(--dur) linear infinite}
@media (prefers-reduced-motion: reduce){.tropic-marquee{animation:none}}`;

function Marquee({ items, green }) {
  const { still } = useSite();
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (still || !ref.current || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "80px" });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [still]);
  const row = [...items, ...items];
  return (
    <div ref={ref} className="overflow-hidden py-5" style={{ background: green }}>
      <style>{MARQUEE_CSS}</style>
      <p className="sr-only">Amenities: {items.join(", ")}</p>
      <div
        aria-hidden="true"
        className={`flex w-max gap-10 whitespace-nowrap ${still ? "" : "tropic-marquee"}`}
        style={{ "--dur": `${Math.max(24, items.length * 4)}s`, animationPlayState: visible ? "running" : "paused" }}
      >
        {row.map((a, i) => (
          <span key={i} className="flex items-center gap-10 text-2xl font-semibold" style={{ fontFamily: DISPLAY, color: LIME }}>
            {a} <Sparkles className="h-5 w-5" style={{ color: "#fff", opacity: 0.6 }} />
          </span>
        ))}
      </div>
    </div>
  );
}

function Home({ green, onPhoto }) {
  const { site } = useSite();
  const { md, lg } = useBp();
  const h = useFrameHeight(0.94, 600);
  const c = site.content;
  const gallery = useGallery();
  const rooms = useRooms();
  const cheapest = useCheapestRoom();
  const intro = paragraphs(c.about?.body)[0];
  // The bento needs 4 photos on wide screens (one 2x2, one 2x1, two singles).
  const bento = md && gallery.length >= 4;
  const shown = gallery.slice(0, gallery.length >= 4 ? 4 : Math.min(gallery.length, md ? 3 : 2));
  return (
    <>
      <section className="p-3" style={{ paddingTop: 12 }}>
        <div className="relative flex items-end overflow-hidden rounded-[36px]" style={{ minHeight: h, background: green }}>
          <KenBurns className="absolute inset-0" from={1.15} duration={9}>
            <Img src={c.hero?.image} alt={site.hotel.name} priority fallback={green} className="h-full w-full object-cover" />
          </KenBurns>
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(8,24,16,0.18) 0%, rgba(8,24,16,0.05) 35%, rgba(8,24,16,0.78))" }} />
          <div className="relative w-full p-6" style={{ padding: md ? 56 : 24, paddingTop: 110 }}>
            <Rise delay={0.15} className="flex flex-wrap gap-2">
              {site.hotel.city && <Tag bg="rgba(255,255,255,0.2)" color="#fff"><MapPin className="h-3.5 w-3.5" /> {site.hotel.city}</Tag>}
              {site.hotel.typeLabel && <Tag bg="rgba(255,255,255,0.2)" color="#fff">{site.hotel.typeLabel}</Tag>}
              {Number(site.hotel.starRating) > 0 && <Tag bg={LIME} color={INK}><Counter value={Math.min(5, site.hotel.starRating)} duration={1} />★</Tag>}
            </Rise>
            <RevealText
              text={c.hero?.title || site.hotel.name}
              className="mt-6 max-w-4xl font-extrabold leading-[0.94] tracking-tight text-white"
              style={{ fontFamily: DISPLAY, fontSize: lg ? 112 : md ? 84 : 46 }}
              delay={0.25}
              stagger={0.09}
            />
            <div className={`mt-8 ${md ? "flex items-end justify-between gap-10" : "space-y-6"}`}>
              {c.hero?.subtitle && <Rise delay={0.7} as="p" className="max-w-lg text-lg font-light text-white/90">{c.hero.subtitle}</Rise>}
              <Rise delay={0.85}><CtaPills green={green} /></Rise>
            </div>
          </div>
          {cheapest && md && formatPrice(cheapest.price, cheapest.currency) && (
            <PriceBadge>
              <span className="text-xs font-semibold uppercase tracking-wider">from</span>
              <span className="text-2xl font-bold leading-none" style={{ fontFamily: DISPLAY }}>{formatPrice(cheapest.price, cheapest.currency)}</span>
              <span className="text-xs">per night</span>
            </PriceBadge>
          )}
        </div>
      </section>

      {c.amenities?.length > 0 && <div className="mt-3"><Marquee items={c.amenities} green={green} /></div>}

      <section className="mx-auto max-w-6xl px-4" style={{ paddingTop: md ? 110 : 64 }}>
        <div className={`grid gap-4 ${lg ? "grid-cols-3" : md ? "grid-cols-2" : "grid-cols-1"}`}>
          <Reveal className={`rounded-[28px] p-8 text-white ${lg ? "row-span-2" : ""}`} style={{ background: green, padding: md ? 44 : 28 }}>
            <Tag bg={LIME} color={INK}>Hello</Tag>
            <Big className="mt-6 text-white" size={48}>{c.about?.heading || `Welcome to ${site.hotel.name}`}</Big>
            {intro && <p className="mt-6 font-light leading-relaxed text-white/80">{intro}</p>}
            <PageLink page="about" className="mt-8 inline-flex items-center gap-2 font-semibold" style={{ color: LIME }}>More about us <ArrowRight className="h-4 w-4" /></PageLink>
          </Reveal>
          <Reveal delay={0.05} className={`overflow-hidden rounded-[28px] ${lg ? "col-span-2" : ""}`}>
            <Img src={c.about?.image || gallery[1]?.url || c.hero?.image} alt={site.hotel.name} sizes={lg ? "66vw" : SIZES.half} fallback={LIME} className="h-full min-h-[280px] w-full object-cover" />
          </Reveal>
          <Reveal delay={0.1} className="rounded-[28px] bg-white p-8">
            <Clock className="h-7 w-7" style={{ color: green }} aria-hidden="true" />
            <p className="mt-5 text-4xl font-bold" style={{ fontFamily: DISPLAY }}>{site.hotel.checkIn || "Flexible"}</p>
            <p className="mt-1" style={{ color: MUTED }}>{site.hotel.checkIn ? `Check-in${site.hotel.checkOut ? ` · out by ${site.hotel.checkOut}` : ""}` : "Check-in times — just ask us"}</p>
          </Reveal>
          <Reveal delay={0.15} className="rounded-[28px] p-8" style={{ background: LIME }}>
            <BedDouble className="h-7 w-7" aria-hidden="true" />
            <p className="mt-5 text-4xl font-bold" style={{ fontFamily: DISPLAY }}>
              {cheapest ? `From ${formatPrice(cheapest.price, cheapest.currency)}` : rooms.length ? `${rooms.length} ${rooms.length === 1 ? "room type" : "room types"}` : "Book direct"}
            </p>
            <p className="mt-1" style={{ color: INK }}>{cheapest ? "per night · best rate when you book direct" : "Best rate when you book direct"}</p>
          </Reveal>
        </div>
      </section>

      {rooms.length > 0 && (
        <section className="mx-auto max-w-6xl px-4" style={{ paddingTop: md ? 120 : 72 }}>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <Reveal><Tag bg="#fff">Stay</Tag><Big className="mt-5">Pick your room</Big></Reveal>
            <PageLink page="rooms" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold">{rooms.length > 3 ? `All ${rooms.length} rooms` : "Room details"} <ArrowRight className="h-4 w-4" /></PageLink>
          </div>
          <div className={`mt-12 grid gap-5 ${lg && rooms.length >= 3 ? "grid-cols-3" : md ? "grid-cols-2" : "grid-cols-1"}`}>
            {rooms.slice(0, lg ? 3 : md ? 2 : 3).map((r, i) => <RoomCard key={r.id || i} room={r} green={green} delay={i * 0.08} />)}
          </div>
        </section>
      )}

      <Services green={green} limit={6} />

      {c.highlights?.length > 0 && (
        <section className="mx-auto max-w-6xl px-4" style={{ paddingTop: md ? 120 : 72 }}>
          <div className={`grid gap-5 ${md ? "grid-cols-3" : "grid-cols-1"}`}>
            {c.highlights.slice(0, 3).map((x, i) => {
              const bg = [green, "#fff", LIME][i % 3];
              const fg = i % 3 === 0 ? "#fff" : INK;
              return (
                <Reveal key={i} delay={i * 0.08} className="rounded-[28px] p-8" style={{ background: bg, color: fg, minHeight: 260 }}>
                  <span className="text-6xl font-extrabold opacity-30" style={{ fontFamily: DISPLAY }}>{i + 1}</span>
                  <p className="mt-6 text-2xl font-bold" style={{ fontFamily: DISPLAY }}>{x.title}</p>
                  <p className="mt-3 font-light leading-relaxed" style={{ opacity: 0.85 }}>{x.body}</p>
                </Reveal>
              );
            })}
          </div>
        </section>
      )}

      {gallery.length > 0 && (
        <section className="mx-auto max-w-6xl px-4" style={{ paddingTop: md ? 120 : 72 }}>
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div><Tag bg="#fff">Gallery</Tag><Big className="mt-5">Take a look around</Big></div>
            <PageLink page="gallery" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold">{gallery.length > 4 ? `All ${gallery.length} photos` : "Gallery"} <ArrowRight className="h-4 w-4" /></PageLink>
          </Reveal>
          <div
            className="mt-12 grid gap-4"
            style={{ gridTemplateColumns: `repeat(${bento ? 4 : md ? shown.length : Math.min(2, shown.length)}, minmax(0, 1fr))`, gridAutoRows: md ? 220 : 170 }}
          >
            {shown.map((g, i) => (
              <button
                key={g.url + i}
                type="button"
                onClick={() => onPhoto(i)}
                aria-label={`Open photo${g.caption ? `: ${g.caption}` : ` ${i + 1}`}`}
                className={`group overflow-hidden rounded-[24px] ${bento && i === 0 ? "col-span-2 row-span-2" : ""} ${bento && i === 3 ? "col-span-2" : ""}`}
              >
                <Img src={g.url} alt={g.caption || ""} sizes={bento && (i === 0 || i === 3) ? SIZES.half : SIZES.quarter} className="h-full w-full object-cover transition-transform duration-[1300ms] ease-out group-hover:scale-[1.07]" />
              </button>
            ))}
          </div>
        </section>
      )}

      <Reviews green={green} />
      <Cta green={green} />
    </>
  );
}

function PriceBadge({ children }) {
  const calm = useCalm();
  return (
    <motion.div
      className="absolute right-10 top-28 flex h-36 w-36 flex-col items-center justify-center rounded-full text-center"
      style={{ background: LIME, color: INK, boxShadow: "0 18px 40px -18px rgba(0,0,0,0.55)" }}
      initial={calm ? false : { rotate: -30, scale: 0.6, opacity: 0 }}
      animate={{ rotate: -8, scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 150, damping: 13, delay: 1 }}
      whileHover={calm ? undefined : { rotate: 0, scale: 1.06 }}
    >
      {children}
    </motion.div>
  );
}

const CARD_THEMES = [
  { bg: "#fff", fg: INK, sub: MUTED, chip: CREAM, icon: CREAM, iconFg: null },
  { bg: "#fff", fg: INK, sub: MUTED, chip: CREAM, icon: LIME, iconFg: INK },
  { bg: null, fg: "#fff", sub: "rgba(255,255,255,0.82)", chip: "rgba(255,255,255,0.14)", icon: LIME, iconFg: INK },
  { bg: "#fff", fg: INK, sub: MUTED, chip: CREAM, icon: CREAM, iconFg: null },
  { bg: LIME, fg: INK, sub: "rgba(16,38,28,0.8)", chip: "rgba(255,255,255,0.6)", icon: "#fff", iconFg: null },
];

/** Services as playful bento cards. Hidden when there are none. */
function Services({ green, limit, page = false }) {
  const { md, lg } = useBp();
  const all = useServices();
  if (!all.length) return null;
  const list = limit ? all.slice(0, limit) : all;
  return (
    <section className="mx-auto max-w-6xl px-4" style={{ paddingTop: page ? (md ? 56 : 32) : md ? 120 : 72 }}>
      {!page && (
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal><Tag bg="#fff"><Sparkles className="h-3.5 w-3.5" style={{ color: green }} /> Extras</Tag><Big className="mt-5">Make it your trip</Big></Reveal>
          {all.length > list.length && (
            <PageLink page="services" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold transition-transform duration-300 hover:-translate-y-0.5">All {all.length} services <ArrowRight className="h-4 w-4" /></PageLink>
          )}
        </div>
      )}
      <div className={`${page ? "" : "mt-12"} grid gap-4 ${lg ? "grid-cols-3" : md ? "grid-cols-2" : "grid-cols-1"}`}>
        {list.map((s, i) => <ServiceCard key={s.name + i} service={s} green={green} theme={CARD_THEMES[i % CARD_THEMES.length]} delay={(i % 3) * 0.07} />)}
      </div>
    </section>
  );
}

function ServiceCard({ service, green, theme, delay }) {
  const cta = useServiceCta(service.name);
  const price = servicePrice(service);
  const dark = theme.bg === null;
  return (
    <Reveal delay={delay} className="h-full">
      <div className="bs-lift group flex h-full flex-col rounded-[28px] p-7" style={{ background: theme.bg || green, color: theme.fg, minHeight: 250, "--bs-shadow": "0 30px 50px -30px rgba(16,38,28,0.45)" }}>
        <div className="flex items-start justify-between gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110" style={{ background: theme.icon, color: theme.iconFg || green }}>
            <ServiceIcon icon={service.icon} name={service.name} className="h-6 w-6" strokeWidth={1.75} />
          </span>
          <span className="rounded-full px-3 py-1.5 text-right text-[13px] font-semibold" style={{ background: theme.chip }}>
            {price ? price.label : "Ask us"}
          </span>
        </div>
        <h3 className="mt-6 text-[26px] font-bold leading-tight" style={{ fontFamily: DISPLAY }}>{service.name}</h3>
        {service.description && <p className="mt-2 font-light leading-relaxed" style={{ color: theme.sub }}>{service.description}</p>}
        {cta && (
          <a href={cta.href} target={cta.target} rel={cta.rel} className="mt-auto inline-flex items-center gap-2 self-start pt-6 font-semibold" aria-label={`Arrange ${service.name}`}>
            <span className="grid h-10 w-10 place-items-center rounded-full transition-transform duration-500 group-hover:rotate-45" style={{ background: dark ? LIME : green, color: dark ? INK : LIME }}>
              <ArrowUpRight className="h-4 w-4" />
            </span>
            {cta.kind === "whatsapp" ? "Arrange it" : "Book your stay"}
          </a>
        )}
      </div>
    </Reveal>
  );
}

function ServicesPage({ green }) {
  const { site } = useSite();
  const services = useServices();
  return (
    <>
      <PageHead tag={`${services.length} ${services.length === 1 ? "service" : "services"}`} title="Services" image={services.find((s) => s.image)?.image || site.content.gallery?.[1]?.url || site.content.hero?.image} green={green} />
      <Services green={green} page />
      <Cta green={green} />
    </>
  );
}

function RoomCard({ room, green, delay }) {
  const cta = useBookCta(room.name);
  const price = formatPrice(room.price, room.currency);
  const guests = Number(room.maxOccupancy) > 0 ? `Up to ${room.maxOccupancy} guests` : "";
  const meta = [guests, room.bedConfig].filter(Boolean).join(" · ");
  return (
    <Reveal delay={delay} className="h-full">
    <div className="bs-lift bs-hover group flex h-full flex-col rounded-[28px] bg-white p-3" style={{ "--bs-shadow": "0 30px 50px -30px rgba(16,38,28,0.45)" }}>
      <div className="bs-zoom relative rounded-[22px]" style={{ transform: "translateZ(0)" }}>
        <Img src={room.image} alt={room.name} sizes={SIZES.third} fallback={LIME} className="aspect-[4/3] w-full object-cover" />
        {price && <span className="absolute left-3 top-3 rounded-full px-3 py-1.5 text-sm font-semibold" style={{ background: LIME, color: INK }}>from {price} / night</span>}
        {room.breakfastIncluded && <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold" style={{ color: INK }}>Breakfast included</span>}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-2xl font-bold" style={{ fontFamily: DISPLAY }}>{room.name}</h3>
        {meta && <p className="mt-1 flex items-center gap-1.5 text-sm" style={{ color: MUTED }}><Users className="h-4 w-4 shrink-0" aria-hidden="true" /> {meta}</p>}
        {room.description && <p className="mt-3 line-clamp-2 font-light" style={{ color: MUTED }}>{room.description}</p>}
        {cta && <a href={cta.href} target={cta.target} rel={cta.rel} className="mt-auto flex w-full items-center justify-center gap-2 rounded-full py-3.5 font-semibold transition-transform duration-300 active:scale-[0.98]" style={{ background: green, color: LIME, marginTop: 20 }}>{cta.kind === "whatsapp" && <WhatsAppIcon size={16} />} Book this room</a>}
      </div>
    </div>
    </Reveal>
  );
}

function Reviews({ green }) {
  const { md } = useBp();
  const list = useReviews();
  if (!list.length) return null;
  return (
    <section className="mx-auto max-w-6xl px-4" style={{ paddingTop: md ? 120 : 72 }}>
      <Reveal><Tag bg="#fff">Reviews</Tag><Big className="mt-5">Guests say it best</Big></Reveal>
      <div className={`mt-12 grid gap-5 ${md ? "grid-cols-3" : "grid-cols-1"}`}>
        {list.slice(0, 3).map((t, i) => (
          <Reveal key={i} delay={i * 0.08} className="flex flex-col justify-between rounded-[28px] bg-white p-8">
            <p className="text-xl font-medium leading-snug" style={{ fontFamily: DISPLAY }}>“{t.quote}”</p>
            <div className="mt-8 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full font-bold" style={{ background: green, color: LIME }}>{(t.author || "G").charAt(0)}</span>
              <span><span className="block font-semibold">{t.author || "Guest"}</span>{t.source && <span className="text-sm" style={{ color: MUTED }}>{t.source}</span>}</span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Cta({ green }) {
  const { site } = useSite();
  const { md } = useBp();
  const wa = useWhatsApp()();
  const book = useBooking();
  return (
    <section className="mx-auto max-w-6xl px-4" style={{ paddingTop: md ? 120 : 72 }}>
      <Reveal className="relative overflow-hidden rounded-[36px] text-white" style={{ background: green, padding: md ? 72 : 32 }}>
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full" style={{ background: LIME, opacity: 0.18 }} aria-hidden="true" />
        <div className="absolute -bottom-24 right-40 h-48 w-48 rounded-full" style={{ background: LIME, opacity: 0.1 }} aria-hidden="true" />
        <Big className="relative max-w-2xl text-white" size={60}>{book ? `Your days at ${site.hotel.name} start here.` : `Your days at ${site.hotel.name} start with a message.`}</Big>
        <p className="relative mt-5 max-w-lg font-light text-white/80">
          {book ? "Pick your dates and book direct for our best rate — or message us with any question." : wa ? "Tell us your dates on WhatsApp — we'll hold your room and answer anything you need." : "Tell us your dates and we'll take care of the rest."}
        </p>
        <div className="relative mt-10"><CtaPills green={green} /></div>
      </Reveal>
    </section>
  );
}

function PageHead({ tag, title, image, green }) {
  const { md } = useBp();
  return (
    <section className="p-3">
      <div className="relative flex items-end overflow-hidden rounded-[36px]" style={{ minHeight: md ? 460 : 340, background: green }}>
        <KenBurns key={image} className="absolute inset-0" from={1.1} duration={7}>
          <Img src={image} alt="" priority fallback={green} className="h-full w-full object-cover" />
        </KenBurns>
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(8,24,16,0.25), rgba(8,24,16,0.72))" }} />
        <div className="relative p-8" style={{ padding: md ? 56 : 24 }}>
          <Rise delay={0.1}><Tag bg={LIME} color={INK}>{tag}</Tag></Rise>
          <RevealText text={title} className="mt-5 font-extrabold leading-none tracking-tight text-white" style={{ fontFamily: DISPLAY, fontSize: md ? 92 : 50 }} delay={0.2} />
        </div>
      </div>
    </section>
  );
}

function Rooms({ green }) {
  const { site } = useSite();
  const { md, lg } = useBp();
  const wa = useWhatsApp();
  const book = useBooking();
  const rooms = useRooms();
  return (
    <>
      <PageHead tag={site.hotel.name} title="Rooms" image={rooms[1]?.image || rooms[0]?.image || site.content.hero?.image} green={green} />
      <section className="mx-auto max-w-6xl space-y-5 px-4" style={{ paddingTop: md ? 72 : 40 }}>
        {rooms.length === 0 && (
          <Reveal className="rounded-[32px] bg-white text-center" style={{ padding: md ? 56 : 28 }}>
            <Big size={44}>Rooms coming soon</Big>
            <p className="mx-auto mt-4 max-w-md font-light leading-relaxed" style={{ color: MUTED }}>We're adding our room details. Tell us your dates and we'll suggest the perfect stay.</p>
            <div className="mt-8 flex justify-center"><CtaPills green={green} onDark={false} /></div>
          </Reveal>
        )}
        {rooms.map((r, i) => {
          const price = formatPrice(r.price, r.currency);
          const link = wa(r.name);
          return (
            <Reveal key={r.id || i} className={`overflow-hidden rounded-[32px] bg-white p-3 ${lg ? "grid grid-cols-2 gap-6" : ""}`}>
              <Img src={r.image} alt={r.name} sizes={lg ? SIZES.half : SIZES.full} fallback={LIME} className={`w-full rounded-[24px] object-cover ${lg && i % 2 ? "order-2" : ""}`} style={{ aspectRatio: lg ? "auto" : "4/3", minHeight: lg ? 420 : undefined }} />
              <div className="flex flex-col justify-center p-5" style={{ padding: md ? 32 : 16 }}>
                <div className="flex flex-wrap gap-2">
                  {Number(r.maxOccupancy) > 0 && <Tag bg={CREAM}><Users className="h-3.5 w-3.5" aria-hidden="true" /> {r.maxOccupancy} guests</Tag>}
                  {r.bedConfig && <Tag bg={CREAM}><BedDouble className="h-3.5 w-3.5" aria-hidden="true" /> {r.bedConfig}</Tag>}
                  {Number(r.sizeSqm) > 0 && <Tag bg={CREAM}>{r.sizeSqm} m²</Tag>}
                  {r.breakfastIncluded && <Tag bg={LIME}>Breakfast included</Tag>}
                </div>
                <h2 className="mt-5 font-bold leading-none" style={{ fontFamily: DISPLAY, fontSize: md ? 52 : 36 }}>{r.name}</h2>
                {r.description && <p className="mt-4 font-light leading-relaxed" style={{ color: MUTED }}>{r.description}</p>}
                {r.amenities?.length > 0 && <p className="mt-3 text-sm" style={{ color: MUTED }}>{r.amenities.join(" · ")}</p>}
                <div className="mt-7 flex flex-wrap items-center gap-4">
                  {price && <p className="text-3xl font-bold" style={{ fontFamily: DISPLAY, color: green }}><span className="text-base font-normal" style={{ color: MUTED }}>from </span>{price}<span className="text-base font-normal" style={{ color: MUTED }}> /night</span></p>}
                  {book && <Pill {...book} bg={green} color={LIME}>Book now <ArrowUpRight className="h-4 w-4" /></Pill>}
                  {link && (book
                    ? <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-semibold underline underline-offset-4"><WhatsAppIcon size={15} /> Ask on WhatsApp</a>
                    : <Pill href={link} target="_blank" rel="noopener noreferrer" bg={green} color={LIME}><WhatsAppIcon size={16} /> Book on WhatsApp</Pill>)}
                </div>
              </div>
            </Reveal>
          );
        })}
      </section>
      <Cta green={green} />
    </>
  );
}

function Gallery({ green, onPhoto }) {
  const { site } = useSite();
  const { md, lg } = useBp();
  const gallery = useGallery();
  return (
    <>
      <PageHead tag={gallery.length ? `${gallery.length} photo${gallery.length === 1 ? "" : "s"}` : site.hotel.name} title="Gallery" image={gallery[0]?.url || site.content.hero?.image} green={green} />
      {gallery.length === 0 && <p className="mx-auto max-w-md px-4 py-20 text-center font-light" style={{ color: MUTED }}>Photos are on their way — check back soon.</p>}
      <section className={`mx-auto grid max-w-6xl grid-flow-dense gap-4 px-4 ${lg ? "grid-cols-4" : md ? "grid-cols-3" : "grid-cols-2"}`} style={{ paddingTop: md ? 56 : 32, gridAutoRows: md ? 240 : 170 }}>
        {gallery.map((g, i) => {
          const big = gallery.length > 2 && i % 5 === 0;
          return (
            <Reveal key={g.url + i} delay={(i % 4) * 0.05} className={`${big ? "col-span-2 row-span-2" : ""} ${i % 5 === 3 && md ? "row-span-2" : ""}`}>
              <button type="button" onClick={() => onPhoto(i)} aria-label={`Open photo${g.caption ? `: ${g.caption}` : ` ${i + 1}`}`} className="group relative block h-full w-full overflow-hidden rounded-[24px]">
                <Img src={g.url} alt={g.caption || ""} sizes={big ? SIZES.half : SIZES.quarter} className="h-full w-full object-cover transition-transform duration-[1300ms] ease-out group-hover:scale-[1.07]" />
                {g.caption && <span className={`absolute bottom-3 left-3 max-w-[85%] truncate rounded-full bg-white/90 px-3 py-1 text-sm font-medium transition-opacity ${md ? "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100" : ""}`} style={{ color: INK }}>{g.caption}</span>}
              </button>
            </Reveal>
          );
        })}
      </section>
    </>
  );
}

function About({ green }) {
  const { site } = useSite();
  const { md } = useBp();
  const c = site.content;
  return (
    <>
      <PageHead tag="Our story" title="About us" image={c.about?.image || c.hero?.image} green={green} />
      <section className={`mx-auto max-w-6xl px-4 ${md ? "grid grid-cols-5 gap-5" : "space-y-5"}`} style={{ paddingTop: md ? 72 : 40 }}>
        <Reveal className={`rounded-[32px] bg-white p-8 ${md ? "col-span-3" : ""}`} style={{ padding: md ? 48 : 28 }}>
          <Big size={46}>{c.about?.heading || `About ${site.hotel.name}`}</Big>
          {paragraphs(c.about?.body).map((p, i) => <p key={i} className="mt-5 text-[17px] font-light leading-relaxed" style={{ color: MUTED }}>{p}</p>)}
        </Reveal>
        <div className={`space-y-5 ${md ? "col-span-2" : ""}`}>
          {(site.hotel.checkIn || site.hotel.checkOut) && (
            <Reveal delay={0.05} className="rounded-[32px] p-8" style={{ background: green, color: "#fff" }}>
              <p className="text-sm uppercase tracking-wider" style={{ color: LIME }}>Check-in / out</p>
              <p className="mt-3 text-4xl font-bold" style={{ fontFamily: DISPLAY }}>{[site.hotel.checkIn, site.hotel.checkOut].filter(Boolean).join(" — ")}</p>
            </Reveal>
          )}
          {c.amenities?.length > 0 && (
            <Reveal delay={0.1} className="rounded-[32px] p-8" style={{ background: LIME }}>
              <p className="text-sm font-semibold uppercase tracking-wider">What's included</p>
              <div className="mt-4 flex flex-wrap gap-2">{c.amenities.map((a, i) => <Tag key={a + i} bg="rgba(255,255,255,0.7)">{a}</Tag>)}</div>
            </Reveal>
          )}
        </div>
      </section>
      <Location green={green} />
    </>
  );
}

function Location({ green }) {
  const { site } = useSite();
  const { md } = useBp();
  const loc = site.content.location || {};
  return (
    <section className="mx-auto max-w-6xl px-4" style={{ paddingTop: md ? 100 : 56 }}>
      <Reveal className={`overflow-hidden rounded-[32px] bg-white p-3 ${md ? "grid grid-cols-5 gap-3" : ""}`}>
        <div className={`p-6 ${md ? "col-span-2" : ""}`} style={{ padding: md ? 36 : 20 }}>
          <Tag bg={CREAM}><MapPin className="h-3.5 w-3.5" /> Location</Tag>
          <Big className="mt-5" size={40}>Getting here</Big>
          {loc.address && <p className="mt-5 text-lg font-medium">{loc.address}</p>}
          {loc.directions && <p className="mt-3 font-light leading-relaxed" style={{ color: MUTED }}>{loc.directions}</p>}
          <a href={directionsHref(loc.mapQuery || loc.address || site.hotel.name)} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full px-5 py-3 font-semibold" style={{ background: green, color: LIME }}>
            Get directions <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
        <MapFrame title={`Map showing ${site.hotel.name}`} query={loc.mapQuery || loc.address || site.hotel.name} className={`${md ? "h-[380px]" : "h-[300px]"} w-full rounded-[24px] ${md ? "col-span-3" : ""}`} />
      </Reveal>
    </section>
  );
}

function Contact({ green }) {
  const { site } = useSite();
  const { md } = useBp();
  const c = site.content.contact || {};
  const wa = useWhatsApp()();
  const f = useEnquiry();
  const input = "w-full rounded-2xl px-5 py-4 outline-none transition focus:ring-2";
  const st = { background: CREAM, "--tw-ring-color": green };
  return (
    <>
      <PageHead tag="Say hello" title="Contact" image={site.content.gallery?.[4]?.url || site.content.hero?.image} green={green} />
      <section className={`mx-auto max-w-6xl px-4 ${md ? "grid grid-cols-5 gap-5" : "space-y-5"}`} style={{ paddingTop: md ? 72 : 40 }}>
        <div className={`space-y-5 ${md ? "col-span-2" : ""}`}>
          {wa && (
            <Reveal className="rounded-[32px] p-8" style={{ background: "#075E54", color: "#fff" }}>
              <WhatsAppIcon size={34} />
              <p className="mt-5 text-3xl font-bold" style={{ fontFamily: DISPLAY }}>WhatsApp us</p>
              <p className="mt-1 text-white/85">Fastest reply — usually minutes.</p>
              <a href={wa} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold" style={{ color: "#075E54" }}>+{site.whatsapp} <ArrowUpRight className="h-4 w-4" /></a>
            </Reveal>
          )}
          {(c.phone || c.email || site.content.location?.address) && (
            <Reveal delay={0.05} className="space-y-4 rounded-[32px] bg-white p-8">
              {c.phone && <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 font-medium"><Phone className="h-5 w-5 shrink-0" style={{ color: green }} aria-hidden="true" /> {c.phone}</a>}
              {c.email && <a href={`mailto:${c.email}`} className="flex items-center gap-3 break-all font-medium"><Mail className="h-5 w-5 shrink-0" style={{ color: green }} aria-hidden="true" /> {c.email}</a>}
              {site.content.location?.address && <p className="flex items-start gap-3 font-medium"><MapPin className="mt-0.5 h-5 w-5 shrink-0" style={{ color: green }} aria-hidden="true" /> {site.content.location.address}</p>}
            </Reveal>
          )}
        </div>
        <Reveal delay={0.1} className={`rounded-[32px] bg-white ${md ? "col-span-3" : ""}`} style={{ padding: md ? 44 : 24 }}>
          <form onSubmit={f.submit}>
            <Big size={40}>Plan your stay</Big>
            <div className="mt-8 grid gap-3">
              <input className={input} style={st} aria-label="Your name" autoComplete="name" placeholder="Your name" value={f.v.name} onChange={f.set("name")} />
              <div className="grid grid-cols-2 gap-3">
                <input type="date" className={input} style={st} value={f.v.checkIn} onChange={f.set("checkIn")} aria-label="Arrival" />
                <input type="date" className={input} style={st} value={f.v.checkOut} onChange={f.set("checkOut")} aria-label="Departure" />
              </div>
              <input className={input} style={st} aria-label="Number of guests" inputMode="numeric" placeholder="Guests" value={f.v.guests} onChange={f.set("guests")} />
              <textarea className={input} style={st} rows={4} aria-label="Message" placeholder="Tell us anything" value={f.v.message} onChange={f.set("message")} />
            </div>
            <button type="submit" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full py-4 font-semibold" style={{ background: green, color: LIME }}>
              Send via {f.via} <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </Reveal>
      </section>
      <Location green={green} />
    </>
  );
}

function Footer({ green }) {
  const { site } = useSite();
  const pages = useNavPages();
  const { md } = useBp();
  return (
    <footer className="p-3" style={{ paddingTop: md ? 110 : 64 }}>
      <div className="rounded-[36px] text-white" style={{ background: INK, padding: md ? 56 : 28 }}>
        <div className={md ? "flex items-end justify-between gap-10" : "space-y-8"}>
          <p className="font-extrabold leading-none" style={{ fontFamily: DISPLAY, fontSize: md ? 72 : 44, color: LIME }}>{site.hotel.name}</p>
          <nav className="flex flex-wrap gap-2">
            {pages.map((p) => <PageLink key={p.id} page={p.id} className="rounded-full px-4 py-2 text-sm transition-transform duration-300 hover:-translate-y-0.5" style={{ border: "1px solid rgba(255,255,255,0.2)" }}>{p.label}</PageLink>)}
          </nav>
        </div>
        <div className="mt-10 flex flex-wrap justify-between gap-3 pt-6 text-sm text-white/65" style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}>
          <span>{[site.content.location?.address, site.content.contact?.phone].filter(Boolean).join(" · ")}</span>
          <span>© {year()} {site.hotel.name} · Website by <a href="https://botlify.site" className="underline">Botlify</a></span>
        </div>
      </div>
    </footer>
  );
}
