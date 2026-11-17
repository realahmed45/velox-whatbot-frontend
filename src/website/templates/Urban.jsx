/**
 * Urban — minimal and editorial. Black on white, a strict 12-column grid,
 * numbered sections, oversized grotesk headlines with italic serif asides
 * (Inter Tight + Instrument Serif). Feels like a design hotel in a city.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Menu, X } from "lucide-react";
import {
  Counter, DrawLine, Img, KenBurns, Lightbox, MapFrame, MobileBookBar, PageLink, Reveal, RevealText, Rise, SIZES,
  ScrollProgress, ServiceIcon, WhatsAppFab, WhatsAppIcon, directionsHref, formatPrice, paragraphs, roomFacts, servicePrice,
  useActivePage, useBookCta, useBooking, useBp, useCalm, useEnquiry, useFonts, useGallery, useLightbox, useMenu, useNavPages,
  useReviews, useRooms, useScrolled, useServiceCta, useServices, useSite, useWhatsApp, year,
} from "../shared";

const GROT = "'Inter Tight', system-ui, sans-serif";
const SERIF = "'Instrument Serif', Georgia, serif";
const INK = "#0d0d0d";
const MUTED = "#646464";
const LINE = "#e4e4e4";

export default function Urban() {
  useFonts("urban", "family=Inter+Tight:wght@300;400;500;600;700;800&family=Instrument+Serif:ital@0;1");
  const { site } = useSite();
  const page = useActivePage();
  const accent = site.accent || "#ff4a1c";
  const gallery = useGallery();
  const lb = useLightbox();
  return (
    <div style={{ fontFamily: GROT, background: "#fff", color: INK }} className="min-h-full antialiased">
      <Nav accent={accent} />
      <main style={{ paddingTop: 64 }}>
        {page === "home" && <Home accent={accent} onPhoto={lb.open} />}
        {page === "rooms" && <Rooms accent={accent} />}
        {page === "services" && <ServicesPage accent={accent} />}
        {page === "gallery" && <Gallery onPhoto={lb.open} />}
        {page === "about" && <About accent={accent} />}
        {page === "contact" && <Contact accent={accent} />}
      </main>
      <Footer accent={accent} />
      <MobileBookBar bg="#ffffff" fg={INK} muted={MUTED} accent={INK} accentFg="#ffffff" font={GROT} border={LINE} />
      <WhatsAppFab />
      <Lightbox images={gallery} index={lb.index} onClose={lb.close} onIndex={lb.setIndex} />
    </div>
  );
}

const Label = ({ children, n }) => (
  <p className="text-[11px] font-medium uppercase tracking-[0.14em]" style={{ color: MUTED }}>
    {n !== undefined && <span className="mr-2" style={{ color: INK }}>({String(n).padStart(2, "0")})</span>}
    {children}
  </p>
);

function Nav({ accent }) {
  const { site } = useSite();
  const page = useActivePage();
  const pages = useNavPages();
  const { md, lg } = useBp();
  const wide = pages.length > 5 ? lg : md;
  const scrolled = useScrolled(20);
  const [open, setOpen] = useMenu();
  const cta = useBookCta();
  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-40" style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(14px) saturate(160%)", WebkitBackdropFilter: "blur(14px) saturate(160%)", borderBottom: `1px solid ${LINE}` }}>
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-6 px-5">
          <PageLink page="home" className="group flex min-w-0 items-center gap-2 text-[15px] font-bold uppercase tracking-tight">
            <span className="h-2 w-2 shrink-0 rounded-full transition-transform duration-500 group-hover:scale-150" style={{ background: accent }} aria-hidden="true" />
            <span className="truncate">{site.hotel.name}</span>
          </PageLink>
          {wide ? (
            <>
              <nav className="flex gap-6">
                {pages.map((p, i) => (
                  <PageLink key={p.id} page={p.id} className="group relative py-1 text-[13px] font-medium transition-colors duration-300 hover:text-[#0d0d0d]" style={{ color: page === p.id ? INK : MUTED }}>
                    <sup className="mr-1 text-[9px]">{String(i + 1).padStart(2, "0")}</sup>{p.label}
                    <span aria-hidden="true" className={`absolute -bottom-0.5 left-0 right-0 h-[2px] origin-left transition-transform duration-500 ${page === p.id ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} style={{ background: page === p.id ? accent : INK }} />
                  </PageLink>
                ))}
              </nav>
              {cta ? (
                <a href={cta.href} target={cta.target} rel={cta.rel} className="group inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold uppercase text-white transition-transform duration-300 hover:-translate-y-0.5" style={{ background: INK }}>Book now <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" style={{ color: accent }} /></a>
              ) : <span />}
            </>
          ) : (
            <button type="button" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} className="-mr-2 ml-3 shrink-0 p-2">{open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}</button>
          )}
        </div>
        {scrolled && <ScrollProgress color={accent} height={2} />}
      </header>
      {open && !wide && (
        <div className="fixed inset-0 z-30 overflow-y-auto bg-white px-5 pb-10 pt-24">
          {pages.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.04} y={10}>
              <PageLink page={p.id} className="flex items-baseline justify-between py-4 text-4xl font-bold uppercase tracking-tight" style={{ borderBottom: `1px solid ${LINE}`, color: page === p.id ? accent : INK }}>
                {p.label}<span className="text-sm font-normal" style={{ color: MUTED }}>{String(i + 1).padStart(2, "0")}</span>
              </PageLink>
            </Reveal>
          ))}
          {cta && (
            <a href={cta.href} target={cta.target} rel={cta.rel} className="mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white" style={{ background: INK }}>
              {cta.kind === "whatsapp" && <WhatsAppIcon size={16} />} {cta.label} <ArrowUpRight className="h-4 w-4" style={{ color: accent }} />
            </a>
          )}
        </div>
      )}
    </>
  );
}

/** Booking-first buttons; WhatsApp first when there's no booking page. */
function CtaRow({ accent, className = "" }) {
  const wa = useWhatsApp()();
  const book = useBooking();
  const solid = "inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-85";
  const ghost = "inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition-colors hover:bg-black hover:text-white";
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {book && <a {...book} className={solid} style={{ background: INK }}>Book now <ArrowUpRight className="h-4 w-4" style={{ color: accent }} /></a>}
      {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className={book ? ghost : solid} style={book ? { border: `1px solid ${INK}` } : { background: INK }}><WhatsAppIcon size={16} /> {book ? "WhatsApp" : "Book on WhatsApp"}</a>}
      {!book && !wa && <PageLink page="contact" className={solid} style={{ background: INK }}>Contact us <ArrowRight className="h-4 w-4" style={{ color: accent }} /></PageLink>}
    </div>
  );
}

function Mega({ children, className = "", style }) {
  const { lg, md } = useBp();
  return (
    <RevealText
      text={children}
      className={`font-extrabold uppercase leading-[0.9] tracking-[-0.04em] ${className}`}
      style={{ fontSize: lg ? 150 : md ? 104 : 52, ...style }}
      delay={0.1}
      stagger={0.09}
      duration={1}
    />
  );
}

function Section({ n, label, children, className = "" }) {
  const { md } = useBp();
  return (
    <section className={`mx-auto max-w-[1400px] px-5 ${className}`} style={{ paddingTop: md ? 120 : 64 }}>
      <div className={md ? "grid grid-cols-12 gap-5" : ""} style={{ borderTop: `1px solid ${INK}`, paddingTop: 20 }}>
        <div className={md ? "col-span-3" : "mb-8"}><Label n={n}>{label}</Label></div>
        <div className={md ? "col-span-9" : ""}>{children}</div>
      </div>
    </section>
  );
}

function Home({ accent, onPhoto }) {
  const { site } = useSite();
  const { md, lg } = useBp();
  const c = site.content;
  const gallery = useGallery();
  const rooms = useRooms();
  const reviews = useReviews();
  const services = useServices();
  const intro = paragraphs(c.about?.body)[0];
  const cols = lg ? 3 : 2;
  // Whole rows only: 6/3 on wide screens, 4/2 on narrow ones.
  const shown = gallery.slice(0, gallery.length >= cols * 2 ? cols * 2 : gallery.length >= cols ? cols : gallery.length);
  const facts = [
    ["Location", [site.hotel.city, site.hotel.country].filter(Boolean).join(", ")],
    ["Type", site.hotel.typeLabel],
    ["Check-in", site.hotel.checkIn && `From ${site.hotel.checkIn}`],
    ["Check-out", site.hotel.checkOut && `By ${site.hotel.checkOut}`],
    ["Rooms", rooms.length > 0 && <><Counter value={rooms.length} duration={1.2} /> {rooms.length === 1 ? "room type" : "room types"}</>],
  ].filter(([, v]) => v).slice(0, 4);
  let n = 0;
  return (
    <>
      <section className="mx-auto max-w-[1400px] px-5" style={{ paddingTop: md ? 56 : 32 }}>
        <Mega>{c.hero?.title || site.hotel.name}</Mega>
        <div className={`mt-8 ${md ? "grid grid-cols-12 items-end gap-5" : "space-y-6"}`}>
          <Rise delay={0.55} className={md ? "col-span-5" : ""}>
            {c.hero?.subtitle && <p className="text-[26px] leading-[1.15]" style={{ fontFamily: SERIF }}><em>{c.hero.subtitle}</em></p>}
          </Rise>
          <Rise delay={0.7} className={md ? "col-span-7" : ""}>
            <CtaRow accent={accent} className={md ? "justify-end" : ""} />
          </Rise>
        </div>
        <Rise delay={0.4} y={30} className="relative mt-10 overflow-hidden" style={{ aspectRatio: md ? "21/9" : "4/5", background: "#e9e9e9" }}>
          <KenBurns className="absolute inset-0" from={1.18} duration={10}>
            <Img src={c.hero?.image} alt={site.hotel.name} priority fallback="#e9e9e9" className="h-full w-full object-cover" />
          </KenBurns>
          {Number(site.hotel.starRating) > 0 && (
            <span className="absolute bottom-4 left-4 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold uppercase tracking-[0.08em]">
              <Counter value={Math.min(5, site.hotel.starRating)} duration={1} /><span style={{ color: accent }}>★</span> {site.hotel.typeLabel || "Hotel"}
            </span>
          )}
        </Rise>
        {facts.length > 0 && (
          <div className={`grid ${md ? "grid-cols-4" : "grid-cols-2"} gap-5 py-5`} style={{ borderBottom: `1px solid ${LINE}` }}>
            {facts.map(([k, v], i) => (
              <Reveal key={k} delay={i * 0.06} y={10}><Label>{k}</Label><p className="mt-1 text-[15px] font-medium">{v}</p></Reveal>
            ))}
          </div>
        )}
      </section>

      {intro && (
        <Section n={++n} label="About">
          <Reveal>
            <p className="font-medium leading-[1.12] tracking-tight" style={{ fontSize: md ? 44 : 26 }}>
              {intro}
            </p>
            <PageLink page="about" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold uppercase" style={{ borderBottom: `2px solid ${accent}` }}>Read more <ArrowRight className="h-4 w-4" /></PageLink>
          </Reveal>
        </Section>
      )}

      {rooms.length > 0 && (
        <Section n={++n} label="Rooms">
          <RoomIndex accent={accent} />
        </Section>
      )}

      {services.length > 0 && (
        <Section n={++n} label="Services">
          <ServiceIndex accent={accent} limit={6} />
        </Section>
      )}

      {shown.length > 0 && (
        <Section n={++n} label="Gallery">
          <div className={`grid gap-5 ${shown.length === 1 ? "grid-cols-1" : lg && shown.length >= 3 ? "grid-cols-3" : "grid-cols-2"}`}>
            {shown.map((g, i) => (
              <Reveal key={g.url + i} delay={(i % 3) * 0.05}>
                <button type="button" onClick={() => onPhoto(i)} aria-label={`Open photo${g.caption ? `: ${g.caption}` : ` ${i + 1}`}`} className="group block w-full text-left">
                  <div className="relative overflow-hidden">
                    <Img src={g.url} alt={g.caption || ""} sizes={SIZES.thumb} className="aspect-square w-full object-cover transition-transform duration-[1300ms] ease-out group-hover:scale-[1.06]" />
                    {md && <span aria-hidden="true" className="absolute inset-0 transition-opacity duration-700 group-hover:opacity-0 group-focus-visible:opacity-0" style={{ background: "#fff", mixBlendMode: "saturation" }} />}
                  </div>
                  <p className="mt-2 text-[12px]" style={{ color: MUTED }}>Fig. {String(i + 1).padStart(2, "0")}{g.caption ? ` — ${g.caption}` : ""}</p>
                </button>
              </Reveal>
            ))}
          </div>
          <PageLink page="gallery" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold uppercase" style={{ borderBottom: `2px solid ${accent}` }}>Full gallery <ArrowRight className="h-4 w-4" /></PageLink>
        </Section>
      )}

      {c.amenities?.length > 0 && (
        <Section n={++n} label="Amenities">
          <div className={`grid ${md ? "grid-cols-3" : "grid-cols-1"}`} style={{ borderTop: `1px solid ${LINE}` }}>
            {c.amenities.map((a, i) => (
              <Reveal key={a + i} y={8} delay={(i % 3) * 0.03} className="flex items-center justify-between py-4 pr-6" style={{ borderBottom: `1px solid ${LINE}` }}>
                <span className="text-lg font-medium">{a}</span>
                <span className="text-xs" style={{ color: MUTED }}>{String(i + 1).padStart(2, "0")}</span>
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {reviews.length > 0 && (
        <Section n={++n} label="Said about us">
          <div className="space-y-12">
            {reviews.slice(0, 3).map((t, i) => (
              <Reveal key={i}>
                <p className="leading-[1.1]" style={{ fontFamily: SERIF, fontSize: md ? 46 : 30 }}>“{t.quote}”</p>
                {(t.author || t.source) && <div className="mt-4"><Label>{[t.author, t.source].filter(Boolean).join(" / ")}</Label></div>}
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      <BigCta accent={accent} />
    </>
  );
}

/** The rooms as an index: hover a row to see the room (desktop). */
function RoomIndex({ accent, full }) {
  const { md } = useBp();
  const book = useBooking();
  const wa = useWhatsApp();
  const [hover, setHover] = useState(0);
  const rooms = useRooms();
  return (
    <div className={md && !full ? "grid grid-cols-9 gap-5" : ""}>
      <div className={md && !full ? "col-span-5" : ""} style={{ borderTop: `1px solid ${LINE}` }}>
        {rooms.map((r, i) => {
          const link = book?.href || wa(r.name);
          const ext = book ? book.target : "_blank";
          const price = formatPrice(r.price, r.currency);
          const facts = roomFacts(r).join(" · ");
          const inner = (
            <>
              {md || !r.image ? (
                <span className="w-8 shrink-0 text-xs" style={{ color: MUTED }}>{String(i + 1).padStart(2, "0")}</span>
              ) : (
                <Img src={r.image} alt="" sizes="64px" className="h-16 w-16 shrink-0 object-cover" />
              )}
              <span className="min-w-0 flex-1">
                <span className="block font-semibold tracking-tight transition-transform duration-500 group-hover:translate-x-2" style={{ fontSize: md ? 28 : 20 }}>{r.name}</span>
                {facts && <span className="block text-sm" style={{ color: MUTED }}>{facts}</span>}
              </span>
              {price && (
                <span className="shrink-0 text-right">
                  <span className="block text-[11px] uppercase tracking-[0.1em]" style={{ color: MUTED }}>from</span>
                  <span className="text-[15px] font-semibold">{price}</span>
                </span>
              )}
              {link && <ArrowUpRight className="h-5 w-5 shrink-0 transition-transform group-hover:rotate-45" style={{ color: hover === i ? accent : INK }} aria-hidden="true" />}
            </>
          );
          return (
            <Reveal key={r.id || i} y={8} className="group" style={{ borderBottom: `1px solid ${LINE}` }}>
              {link ? (
                <a href={link} target={ext} rel="noopener noreferrer" onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} className="flex items-center gap-4 py-5" aria-label={`Book the ${r.name}${price ? `, from ${price} per night` : ""}`}>
                  {inner}
                </a>
              ) : (
                <div onMouseEnter={() => setHover(i)} className="flex items-center gap-4 py-5">{inner}</div>
              )}
            </Reveal>
          );
        })}
      </div>
      {md && !full && rooms[hover] && (
        <div className="col-span-4">
          <div className="sticky top-24 overflow-hidden">
            <Preview k={`${hover}-${rooms[hover].image}`} src={rooms[hover].image} alt={rooms[hover].name} />
          </div>
        </div>
      )}
    </div>
  );
}

/** Cross-fading preview for the hover indexes (opacity + scale only). */
function Preview({ k, src, alt }) {
  const calm = useCalm();
  return (
    <motion.div key={k} initial={calm ? false : { opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
      <Img src={src} alt={alt} sizes="30vw" fallback="#e9e9e9" className="aspect-[4/5] w-full object-cover" />
    </motion.div>
  );
}

/** Services as an index: icon, name, price, arrow. Hover a row to preview its photo. */
function ServiceIndex({ accent, limit }) {
  const { md } = useBp();
  const all = useServices();
  const [hover, setHover] = useState(0);
  if (!all.length) return null;
  const list = limit ? all.slice(0, limit) : all;
  const withImage = list.some((s) => s.image);
  const side = md && withImage;
  const cur = list[hover]?.image ? list[hover] : list.find((s) => s.image);
  return (
    <>
      <div className={side ? "grid grid-cols-9 gap-5" : ""}>
        <div className={side ? "col-span-5" : ""} style={{ borderTop: `1px solid ${LINE}` }}>
          {list.map((s, i) => <ServiceRow key={s.name + i} service={s} index={i} accent={accent} active={hover === i} onHover={() => setHover(i)} />)}
        </div>
        {side && cur && (
          <div className="col-span-4">
            <div className="sticky top-24 overflow-hidden">
              <Preview k={cur.image} src={cur.image} alt={cur.name} />
            </div>
          </div>
        )}
      </div>
      {all.length > list.length && (
        <PageLink page="services" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold uppercase" style={{ borderBottom: `2px solid ${accent}` }}>All {all.length} services <ArrowRight className="h-4 w-4" /></PageLink>
      )}
    </>
  );
}

function ServiceRow({ service, index, accent, active, onHover }) {
  const { md } = useBp();
  const cta = useServiceCta(service.name);
  const price = servicePrice(service);
  const inner = (
    <>
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full transition-colors duration-300" style={{ border: `1px solid ${active ? INK : LINE}` }}>
        <ServiceIcon icon={service.icon} name={service.name} className="h-5 w-5" style={{ color: active ? accent : INK }} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="bs-shift block font-semibold tracking-tight" style={{ fontSize: md ? 26 : 19 }}>{service.name}</span>
        {service.description && <span className="mt-0.5 block text-sm leading-snug" style={{ color: MUTED }}>{service.description}</span>}
      </span>
      <span className="shrink-0 text-right">
        {price ? (
          <>
            <span className="block text-[11px] uppercase tracking-[0.1em]" style={{ color: MUTED }}>from</span>
            <span className="text-[15px] font-semibold">{price.amount}</span>
            {price.unit && <span className="block text-[11px]" style={{ color: MUTED }}>{price.unit}</span>}
          </>
        ) : (
          <span className="text-[13px] font-semibold uppercase tracking-[0.08em]">Ask us</span>
        )}
      </span>
      {cta && <ArrowUpRight className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:rotate-45" style={{ color: active ? accent : INK }} aria-hidden="true" />}
    </>
  );
  return (
    <Reveal y={8} delay={(index % 6) * 0.04} className="group bs-hover" style={{ borderBottom: `1px solid ${LINE}` }}>
      {cta ? (
        <a href={cta.href} target={cta.target} rel={cta.rel} onMouseEnter={onHover} onFocus={onHover} className="flex items-center gap-4 py-5" aria-label={`Arrange ${service.name}${price ? `, ${price.label}` : ""}`}>
          {inner}
        </a>
      ) : (
        <div onMouseEnter={onHover} className="flex items-center gap-4 py-5">{inner}</div>
      )}
    </Reveal>
  );
}

function ServicesPage({ accent }) {
  const { site } = useSite();
  const services = useServices();
  return (
    <>
      <PageTitle title="Services" aside={`${services.length} ways ${site.hotel.name} makes your stay easier.`} image={services.find((s) => s.image)?.image} />
      <Section n={1} label="Arrange anything">
        <ServiceIndex accent={accent} />
      </Section>
      <BigCta accent={accent} />
    </>
  );
}

function BigCta({ accent }) {
  const { md } = useBp();
  const cta = useBookCta();
  if (!cta) return null;
  return (
    <section className="mx-auto max-w-[1400px] px-5" style={{ paddingTop: md ? 120 : 64 }}>
      <a href={cta.href} target={cta.target} rel={cta.rel} className="group relative block overflow-hidden p-8 text-white" style={{ background: INK, padding: md ? 56 : 28, isolation: "isolate" }}>
        <span aria-hidden="true" className="absolute inset-0 -z-10 origin-bottom scale-y-0 transition-transform duration-700 ease-out group-hover:scale-y-100" style={{ background: "#1c1c1c" }} />
        <DrawLine className="absolute left-0 top-0 h-[3px] w-full" style={{ background: accent }} />
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/70">Reservations</p>
        <p className="mt-6 flex items-end justify-between gap-6 font-extrabold uppercase leading-[0.88] tracking-[-0.04em]" style={{ fontSize: md ? 112 : 48 }}>
          <span>Book your<br />stay <em className="font-normal normal-case" style={{ fontFamily: SERIF, color: accent }}>now</em></span>
          <ArrowUpRight className="shrink-0 transition duration-500 group-hover:rotate-45" style={{ width: md ? 110 : 48, height: md ? 110 : 48, color: accent }} />
        </p>
        <p className="mt-6 text-white/70">{cta.kind === "whatsapp" ? "Message us on WhatsApp — we confirm in minutes." : "Check dates and book direct for our best rate."}</p>
      </a>
    </section>
  );
}

function PageTitle({ title, aside, image }) {
  const { md } = useBp();
  return (
    <section className="mx-auto max-w-[1400px] px-5" style={{ paddingTop: md ? 56 : 32 }}>
      <Mega>{title}</Mega>
      {aside && <Rise delay={0.4} as="p" className="mt-6 max-w-xl text-[24px] leading-tight" style={{ fontFamily: SERIF }}><em>{aside}</em></Rise>}
      {image && (
        <Rise delay={0.3} y={26} className="relative mt-10 overflow-hidden" style={{ aspectRatio: md ? "3/1" : "4/3", background: "#e9e9e9" }}>
          <KenBurns key={image} className="absolute inset-0" from={1.12} duration={8}>
            <Img src={image} alt="" priority fallback="#e9e9e9" className="h-full w-full object-cover" />
          </KenBurns>
        </Rise>
      )}
    </section>
  );
}

function Rooms({ accent }) {
  const { site } = useSite();
  const { md } = useBp();
  const wa = useWhatsApp();
  const book = useBooking();
  const rooms = useRooms();
  return (
    <>
      <PageTitle title="Rooms" aside={rooms.length > 1 ? `${rooms.length} ways to stay at ${site.hotel.name}.` : `Stay at ${site.hotel.name}.`} />
      {rooms.length === 0 && (
        <Section n={1} label="Coming soon">
          <p className="max-w-2xl font-medium leading-[1.15] tracking-tight" style={{ fontSize: md ? 36 : 24 }}>We're adding our room details. Tell us your dates and we'll suggest the right room.</p>
          <CtaRow accent={accent} className="mt-8" />
        </Section>
      )}
      {rooms.map((r, i) => {
        const price = formatPrice(r.price, r.currency);
        const link = wa(r.name);
        return (
          <Section key={r.id || i} n={i + 1} label={r.name}>
            <div className={md ? "grid grid-cols-9 gap-5" : "space-y-6"}>
              <Reveal className={md ? "col-span-5" : ""}><div className="bs-zoom"><Img src={r.image} alt={r.name} sizes="(min-width: 820px) 45vw, 100vw" fallback="#e9e9e9" className="aspect-[4/3] w-full object-cover" /></div></Reveal>
              <Reveal delay={0.08} className={md ? "col-span-4 flex flex-col" : ""}>
                <h2 className="text-4xl font-bold tracking-tight">{r.name}</h2>
                {r.description && <p className="mt-4 leading-relaxed" style={{ color: MUTED }}>{r.description}</p>}
                <dl className="mt-6" style={{ borderTop: `1px solid ${LINE}` }}>
                  {[["Guests", Number(r.maxOccupancy) > 0 && `Up to ${r.maxOccupancy}`], ["Bed", r.bedConfig], ["Size", Number(r.sizeSqm) > 0 && `${r.sizeSqm} m²`], ["Breakfast", r.breakfastIncluded ? "Included" : null], ["Features", r.amenities?.join(", ")]].filter(([, v]) => v).map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-6 py-3 text-sm" style={{ borderBottom: `1px solid ${LINE}` }}><dt style={{ color: MUTED }}>{k}</dt><dd className="text-right font-medium">{v}</dd></div>
                  ))}
                </dl>
                <div className="mt-auto flex flex-wrap items-center gap-4 pt-8">
                  {price && <p className="text-3xl font-bold tracking-tight"><span className="text-sm font-normal" style={{ color: MUTED }}>from </span>{price}<span className="text-sm font-normal" style={{ color: MUTED }}> / night</span></p>}
                  {book && <a {...book} className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white" style={{ background: INK }}>Book now <ArrowUpRight className="h-4 w-4" style={{ color: accent }} /></a>}
                  {link && (book
                    ? <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ borderBottom: `2px solid ${accent}` }}><WhatsAppIcon size={14} /> Ask on WhatsApp</a>
                    : <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white" style={{ background: INK }}><WhatsAppIcon size={15} /> Book on WhatsApp</a>)}
                </div>
              </Reveal>
            </div>
          </Section>
        );
      })}
      <BigCta accent={accent} />
    </>
  );
}

function Gallery({ onPhoto }) {
  const { site } = useSite();
  const { md, lg } = useBp();
  const gallery = useGallery();
  return (
    <>
      <PageTitle title="Gallery" aside={`Inside ${site.hotel.name}.`} />
      {gallery.length === 0 && <p className="mx-auto max-w-[1400px] px-5 py-16 text-lg" style={{ color: MUTED }}>Photos coming soon.</p>}
      <section className={`mx-auto grid max-w-[1400px] gap-x-5 gap-y-8 px-5 ${lg ? "grid-cols-3" : "grid-cols-2"}`} style={{ paddingTop: md ? 64 : 32 }}>
        {gallery.map((g, i) => (
          <Reveal key={g.url + i} delay={(i % 3) * 0.05}>
            <button type="button" onClick={() => onPhoto(i)} aria-label={`Open photo${g.caption ? `: ${g.caption}` : ` ${i + 1}`}`} className="group block w-full text-left">
              <div className="overflow-hidden"><Img src={g.url} alt={g.caption || ""} sizes={SIZES.thumb} className="w-full object-cover transition-transform duration-[1300ms] ease-out group-hover:scale-[1.06]" style={{ aspectRatio: "4/5" }} /></div>
              <p className="mt-2 flex justify-between gap-3 text-[12px]" style={{ color: MUTED }}><span className="truncate">{g.caption || site.hotel.name}</span><span className="shrink-0">Fig. {String(i + 1).padStart(2, "0")}</span></p>
            </button>
          </Reveal>
        ))}
      </section>
    </>
  );
}

function About({ accent }) {
  const { site } = useSite();
  const { md } = useBp();
  const c = site.content;
  const loc = c.location || {};
  return (
    <>
      <PageTitle title="About" aside={c.about?.heading} image={c.about?.image || c.hero?.image} />
      <Section n={1} label="Story">
        {paragraphs(c.about?.body).map((p, i) => (
          <Reveal key={i}><p className={i === 0 ? "font-medium leading-[1.15] tracking-tight" : "mt-6 max-w-2xl text-lg leading-relaxed"} style={{ fontSize: i === 0 ? (md ? 36 : 24) : undefined, color: i ? MUTED : INK, marginTop: i ? 24 : 0 }}>{p}</p></Reveal>
        ))}
      </Section>
      {c.amenities?.length > 0 && (
        <Section n={2} label="Amenities">
          <p className="text-2xl font-medium leading-snug tracking-tight">{c.amenities.join(" / ")}</p>
        </Section>
      )}
      <Section n={3} label="Location">
        <div className={md ? "grid grid-cols-9 gap-5" : "space-y-6"}>
          <div className={md ? "col-span-3" : ""}>
            {loc.address && <p className="text-xl font-semibold">{loc.address}</p>}
            {loc.directions && <p className="mt-3 leading-relaxed" style={{ color: MUTED }}>{loc.directions}</p>}
            <a href={directionsHref(loc.mapQuery || loc.address || site.hotel.name)} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold uppercase" style={{ borderBottom: `2px solid ${accent}` }}>Get directions <ArrowUpRight className="h-4 w-4" /></a>
          </div>
          <MapFrame title={`Map showing ${site.hotel.name}`} query={loc.mapQuery || loc.address || site.hotel.name} className={`${md ? "h-[420px]" : "h-[300px]"} w-full ${md ? "col-span-6" : ""}`} style={{ filter: "grayscale(1)" }} />
        </div>
      </Section>
      <BigCta accent={accent} />
    </>
  );
}

function Contact({ accent }) {
  const { site } = useSite();
  const { md } = useBp();
  const c = site.content.contact || {};
  const wa = useWhatsApp()();
  const f = useEnquiry();
  const input = "w-full bg-transparent py-4 text-lg outline-none placeholder:text-[#767676]";
  const st = { borderBottom: `1px solid ${INK}` };
  return (
    <>
      <PageTitle title="Contact" aside="Questions, dates, special requests — ask away." />
      <Section n={1} label="Direct">
        <div className={`grid gap-5 ${md ? "grid-cols-3" : "grid-cols-1"}`}>
          {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="group p-6 text-white" style={{ background: "#075E54" }}><Label><span className="text-white/80">WhatsApp</span></Label><p className="mt-8 flex items-center justify-between text-xl font-semibold">+{site.whatsapp}<ArrowUpRight className="h-5 w-5 transition group-hover:rotate-45" /></p></a>}
          {c.phone && <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="p-6" style={{ border: `1px solid ${LINE}` }}><Label>Phone</Label><p className="mt-8 text-xl font-semibold">{c.phone}</p></a>}
          {c.email && <a href={`mailto:${c.email}`} className="p-6" style={{ border: `1px solid ${LINE}` }}><Label>Email</Label><p className="mt-8 break-all text-xl font-semibold">{c.email}</p></a>}
        </div>
      </Section>
      <Section n={2} label="Enquiry">
        <form onSubmit={f.submit} className="max-w-3xl">
          <input className={input} style={st} aria-label="Your name" autoComplete="name" placeholder="Name" value={f.v.name} onChange={f.set("name")} />
          <div className="grid grid-cols-2 gap-5">
            <input type="date" className={input} style={st} value={f.v.checkIn} onChange={f.set("checkIn")} aria-label="Arrival" />
            <input type="date" className={input} style={st} value={f.v.checkOut} onChange={f.set("checkOut")} aria-label="Departure" />
          </div>
          <input className={input} style={st} aria-label="Number of guests" inputMode="numeric" placeholder="Guests" value={f.v.guests} onChange={f.set("guests")} />
          <textarea className={input} style={st} rows={3} aria-label="Message" placeholder="Message" value={f.v.message} onChange={f.set("message")} />
          <button type="submit" className="mt-8 inline-flex items-center gap-2 rounded-full px-7 py-4 text-sm font-semibold text-white" style={{ background: INK }}>Send via {f.via} <ArrowRight className="h-4 w-4" style={{ color: accent }} /></button>
        </form>
      </Section>
      <Section n={3} label="Find us">
        {site.content.location?.address && <p className="mb-5 text-xl font-semibold">{site.content.location.address}</p>}
        <MapFrame title={`Map showing ${site.hotel.name}`} query={site.content.location?.mapQuery || site.content.location?.address || site.hotel.name} className={`${md ? "h-[380px]" : "h-[300px]"} w-full`} style={{ filter: "grayscale(1)" }} />
      </Section>
    </>
  );
}

function Footer({ accent }) {
  const { site } = useSite();
  const pages = useNavPages();
  const { md } = useBp();
  return (
    <footer className="mx-auto max-w-[1400px] px-5" style={{ paddingTop: md ? 120 : 64 }}>
      <div className={`grid gap-5 py-8 ${md ? "grid-cols-4" : "grid-cols-2"}`} style={{ borderTop: `1px solid ${INK}` }}>
        {site.content.location?.address && <div><Label>Address</Label><p className="mt-2 text-sm">{site.content.location.address}</p></div>}
        {(site.content.contact?.phone || site.content.contact?.email) && (
          <div>
            <Label>Contact</Label>
            {site.content.contact?.phone && <p className="mt-2 text-sm"><a href={`tel:${site.content.contact.phone.replace(/\s/g, "")}`} className="hover:opacity-60">{site.content.contact.phone}</a></p>}
            {site.content.contact?.email && <p className="mt-1 break-all text-sm"><a href={`mailto:${site.content.contact.email}`} className="hover:opacity-60">{site.content.contact.email}</a></p>}
          </div>
        )}
        <div className={md ? "col-span-2" : "col-span-2"}><Label>Index</Label><div className="mt-2 flex flex-wrap gap-x-5 gap-y-1">{pages.map((p) => <PageLink key={p.id} page={p.id} className="text-sm transition-opacity hover:opacity-50">{p.label}</PageLink>)}</div></div>
      </div>
      <Reveal y={40}>
        <p aria-hidden="true" className="select-none overflow-hidden whitespace-nowrap font-extrabold uppercase leading-[0.8] tracking-[-0.05em]" style={{ fontSize: md ? 168 : 64 }}>{site.hotel.name}</p>
      </Reveal>
      <div className="flex flex-wrap justify-between gap-2 py-6 text-xs" style={{ color: MUTED }}>
        <span>© {year()} {site.hotel.name}</span>
        <span>Website by <a href="https://botlify.site" style={{ borderBottom: `1px solid ${accent}` }}>Botlify</a></span>
      </div>
    </footer>
  );
}
