/**
 * Noir — dark luxury. Near-black canvas, champagne-gold accent, Playfair
 * Display set wide in capitals over Manrope. Feels like a five-star city hotel.
 */
import { ArrowRight, ArrowUpRight, Mail, MapPin, Menu, Phone, Star, X } from "lucide-react";
import {
  Counter, DrawLine, Img, KenBurns, Lightbox, MapFrame, MobileBookBar, PageLink, Reveal, RevealText, Rise, SIZES,
  ScrollProgress, ServiceIcon, WhatsAppFab, WhatsAppIcon, directionsHref, formatPrice, paragraphs, roomFacts, servicePrice,
  useActivePage, useBookCta, useBooking, useBp, useEnquiry, useFonts, useFrameHeight, useGallery, useLightbox, useMenu,
  useNavPages, useReviews, useRooms, useScrolled, useServiceCta, useServices, useSite, useWhatsApp, year,
} from "../shared";

const SERIF = "'Playfair Display', Georgia, serif";
const SANS = "'Manrope', system-ui, sans-serif";
const BG = "#0b0b0c";
const PANEL = "#141416";
const TEXT = "#ece7df";
// Lifted from #8f8a82 so small body text clears WCAG AA on the black canvas.
const MUTED = "#a39e95";
const LINE = "rgba(201,169,110,0.22)";

export default function Noir() {
  useFonts("noir", "family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Manrope:wght@300;400;500;600;700");
  const { site } = useSite();
  const page = useActivePage();
  const gold = site.accent || "#c9a96e";
  const gallery = useGallery();
  const lb = useLightbox();
  return (
    <div style={{ fontFamily: SANS, background: BG, color: TEXT }} className="min-h-full antialiased">
      <Nav gold={gold} />
      <main>
        {page === "home" && <Home gold={gold} onPhoto={lb.open} />}
        {page === "rooms" && <Rooms gold={gold} />}
        {page === "services" && <ServicesPage gold={gold} />}
        {page === "gallery" && <Gallery gold={gold} onPhoto={lb.open} />}
        {page === "about" && <About gold={gold} />}
        {page === "contact" && <Contact gold={gold} />}
      </main>
      <Footer gold={gold} />
      <MobileBookBar bg={PANEL} fg={TEXT} muted={MUTED} accent={gold} accentFg={BG} font={SANS} displayFont={SERIF} border={LINE} radius={0} uppercase />
      <WhatsAppFab />
      <Lightbox images={gallery} index={lb.index} onClose={lb.close} onIndex={lb.setIndex} />
    </div>
  );
}

const Kicker = ({ children, gold }) => (
  <p className="inline-flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.4em]" style={{ color: gold }}>
    <span className="h-px w-10" style={{ background: gold }} />
    {children}
  </p>
);

function Title({ children, size = 54, center, className = "" }) {
  const { md } = useBp();
  return (
    <h2 className={`font-normal leading-[1.08] ${center ? "text-center" : ""} ${className}`} style={{ fontFamily: SERIF, fontSize: md ? size : size * 0.62 }}>
      {children}
    </h2>
  );
}

function GoldButton({ href, children, gold, solid, ...rest }) {
  // A gold wash sweeps in from the left on hover (transform only).
  return (
    <a
      href={href}
      {...rest}
      className="group relative inline-flex items-center gap-3 overflow-hidden px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.28em]"
      style={{ border: `1px solid ${gold}`, background: solid ? gold : "transparent", color: solid ? BG : gold, isolation: "isolate" }}
    >
      <span aria-hidden="true" className="absolute inset-0 -z-10 origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100" style={{ background: solid ? "rgba(255,255,255,0.18)" : "rgba(201,169,110,0.14)" }} />
      {children}
    </a>
  );
}

function Nav({ gold }) {
  const { site } = useSite();
  const page = useActivePage();
  const pages = useNavPages();
  const { lg } = useBp();
  const scrolled = useScrolled(40);
  const [open, setOpen] = useMenu();
  const cta = useBookCta();
  const half = Math.ceil(pages.length / 2);
  const left = pages.slice(0, half);
  const right = pages.slice(half);
  const solid = scrolled || page !== "home";
  const link = (p) => (
    <PageLink key={p.id} page={p.id} className="group relative py-1 text-[11px] font-semibold uppercase tracking-[0.28em] transition-opacity duration-300 hover:opacity-100" style={{ color: page === p.id ? gold : TEXT, opacity: page === p.id ? 1 : 0.78 }}>
      {p.label}
      <span aria-hidden="true" className={`absolute -bottom-1 left-0 right-[0.28em] h-px origin-center transition-transform duration-500 ${page === p.id ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} style={{ background: gold }} />
    </PageLink>
  );
  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-40">
        <div aria-hidden="true" className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.65), transparent)" }} />
        <div
          aria-hidden="true"
          className="absolute inset-0 transition-opacity duration-500"
          style={{ opacity: solid ? 1 : 0, background: "rgba(11,11,12,0.78)", backdropFilter: "blur(16px) saturate(150%)", WebkitBackdropFilter: "blur(16px) saturate(150%)", borderBottom: `1px solid ${LINE}` }}
        />
        <div className="relative mx-auto flex max-w-7xl items-center justify-between px-6" style={{ height: lg ? 84 : 72 }}>
          {lg ? (
            <>
              <nav className="flex flex-1 gap-8">{left.map(link)}</nav>
              <PageLink page="home" className="text-center">
                <span className="block text-[22px] uppercase tracking-[0.32em]" style={{ fontFamily: SERIF }}>{site.hotel.name}</span>
                {site.hotel.starRating > 0 && (
                  <span className="mt-1 flex justify-center gap-1">{Array.from({ length: site.hotel.starRating }).map((_, i) => <Star key={i} className="h-2.5 w-2.5" style={{ color: gold, fill: gold }} />)}</span>
                )}
              </PageLink>
              <nav className="flex flex-1 items-center justify-end gap-8">
                {right.map(link)}
                {cta && <a href={cta.href} target={cta.target} rel={cta.rel} className="px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.3em] transition-transform duration-300 hover:-translate-y-0.5" style={{ background: gold, color: BG }}>Reserve</a>}
              </nav>
            </>
          ) : (
            <>
              <PageLink page="home" className="min-w-0 truncate text-lg uppercase tracking-[0.25em]" style={{ fontFamily: SERIF }}>{site.hotel.name}</PageLink>
              <button type="button" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} className="-mr-2 ml-3 shrink-0 p-2" style={{ color: gold }}>{open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}</button>
            </>
          )}
        </div>
        {solid && <ScrollProgress color={gold} height={1} />}
      </header>
      {open && !lg && (
        <div className="fixed inset-0 z-30 flex flex-col items-center justify-center gap-6 overflow-y-auto py-20" style={{ background: BG }}>
          {pages.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.05} y={10}>
              <PageLink page={p.id} className="text-3xl uppercase tracking-[0.2em]" style={{ fontFamily: SERIF, color: page === p.id ? gold : TEXT }}>{p.label}</PageLink>
            </Reveal>
          ))}
          {cta && <div className="mt-6"><GoldButton href={cta.href} target={cta.target} rel={cta.rel} gold={gold} solid>{cta.kind === "whatsapp" && <WhatsAppIcon size={16} />} Reserve</GoldButton></div>}
        </div>
      )}
    </>
  );
}

function Home({ gold, onPhoto }) {
  const { site } = useSite();
  const { md, lg } = useBp();
  const h = useFrameHeight(1, 620);
  const c = site.content;
  const wa = useWhatsApp()();
  const book = useBooking();
  const gallery = useGallery();
  const rooms = useRooms();
  const intro = paragraphs(c.about?.body)[0];
  const sideImage = gallery.find((g) => g.url !== c.about?.image && g.url !== c.hero?.image)?.url;
  return (
    <>
      <section className="relative flex items-center justify-center overflow-hidden text-center" style={{ minHeight: h, background: BG }}>
        <KenBurns className="absolute inset-0" from={1.16} duration={10}>
          <Img src={c.hero?.image} alt={site.hotel.name} priority fallback="#2a2620" className="h-full w-full object-cover" />
        </KenBurns>
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0.32), rgba(0,0,0,0.8))" }} />
        <div className="relative px-6" style={{ paddingTop: 96, paddingBottom: 96 }}>
          <Rise delay={0.1} className="flex justify-center">
            <Kicker gold={gold}>{[site.hotel.city, site.hotel.country].filter(Boolean).join(" · ") || site.hotel.typeLabel}</Kicker>
          </Rise>
          <RevealText
            text={c.hero?.title || site.hotel.name}
            className="mx-auto mt-8 max-w-5xl uppercase leading-[1.04]"
            style={{ fontFamily: SERIF, fontSize: lg ? 92 : md ? 68 : 36, letterSpacing: md ? "0.06em" : "0.03em" }}
            delay={0.3}
            stagger={0.1}
            duration={1.1}
          />
          <div className="mx-auto mt-8 flex max-w-xs items-center justify-center gap-3" aria-hidden="true">
            <DrawLine origin="right" className="h-px flex-1" style={{ background: gold }} delay={0.8} />
            <Star className="h-3 w-3" style={{ color: gold, fill: gold }} />
            <DrawLine className="h-px flex-1" style={{ background: gold }} delay={0.8} />
          </div>
          {c.hero?.subtitle && <Rise delay={0.9} as="p" className="mx-auto mt-7 max-w-xl text-[17px] font-light leading-relaxed" style={{ color: "rgba(236,231,223,0.9)" }}>{c.hero.subtitle}</Rise>}
          <Rise delay={1.1} className="mt-12 flex flex-wrap justify-center gap-4">
            {book && <GoldButton {...book} gold={gold} solid>Book now <ArrowRight className="h-4 w-4" /></GoldButton>}
            {wa && <GoldButton href={wa} target="_blank" rel="noopener noreferrer" gold={gold} solid={!book}><WhatsAppIcon size={16} /> {book ? "WhatsApp" : "Reserve on WhatsApp"}</GoldButton>}
            {!wa && !book && <PageLink page="contact" className="inline-flex items-center gap-3 px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.28em]" style={{ background: gold, color: BG }}>Contact us</PageLink>}
            {(!book || !wa) && rooms.length > 0 && <PageLink page="rooms" className="inline-flex items-center gap-3 px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.28em]" style={{ border: `1px solid ${gold}`, color: gold }}>Our rooms</PageLink>}
          </Rise>
        </div>
        {md && (
          <Rise delay={1.4} className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 text-[10px] uppercase tracking-[0.4em]" style={{ color: MUTED }}>
            <span aria-hidden="true" className="flex flex-col items-center gap-3">
              Scroll
              <span className="h-12 w-px" style={{ background: `linear-gradient(${gold}, transparent)` }} />
            </span>
          </Rise>
        )}
      </section>

      <section className="mx-auto max-w-4xl px-6 text-center" style={{ paddingTop: md ? 150 : 80, paddingBottom: md ? 110 : 60 }}>
        <Reveal>
          {site.hotel.typeLabel && <div className="flex justify-center"><Kicker gold={gold}>{site.hotel.typeLabel}</Kicker></div>}
          <Title center className="mt-8" size={50}>{c.about?.heading || `Welcome to ${site.hotel.name}`}</Title>
          {intro && <p className="mx-auto mt-8 max-w-2xl text-[17px] font-light leading-[1.9]" style={{ color: MUTED }}>{intro}</p>}
        </Reveal>
        <Stats gold={gold} />
      </section>

      {c.about?.image && (
        <section className={`mx-auto max-w-7xl px-6 ${md && sideImage ? "grid grid-cols-12 items-end gap-6" : "space-y-6"}`}>
          <Reveal className={md && sideImage ? "col-span-7" : ""}><Img src={c.about.image} alt={site.hotel.name} sizes={SIZES.half} className="aspect-[4/3] w-full object-cover" /></Reveal>
          {sideImage && (
            <Reveal delay={0.1} className={md ? "col-span-5" : "hidden"}>
              <Img src={sideImage} alt="" sizes="(min-width: 820px) 40vw, 100vw" className="aspect-[3/4] w-full object-cover" />
            </Reveal>
          )}
        </section>
      )}

      {rooms.length > 0 && (
        <section className="mx-auto max-w-7xl px-6" style={{ paddingTop: md ? 150 : 80, paddingBottom: md ? 120 : 64 }}>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <Reveal><Kicker gold={gold}>Accommodation</Kicker><Title className="mt-6">Signature rooms</Title></Reveal>
            <PageLink page="rooms" className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em]" style={{ color: gold }}>{rooms.length > 3 ? `All ${rooms.length} rooms` : "Room details"} <ArrowRight className="h-4 w-4" /></PageLink>
          </div>
          <div className={`mt-14 grid gap-6 ${lg && rooms.length >= 3 ? "grid-cols-3" : md ? "grid-cols-2" : "grid-cols-1"}`}>
            {rooms.slice(0, lg ? 3 : md ? 2 : 3).map((r, i) => <RoomTile key={r.id || i} room={r} gold={gold} delay={i * 0.08} />)}
          </div>
        </section>
      )}

      <Services gold={gold} limit={6} />

      {c.amenities?.length > 0 && (
        <section style={{ background: PANEL, borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}` }}>
          <div className="mx-auto max-w-7xl px-6" style={{ paddingTop: md ? 110 : 64, paddingBottom: md ? 110 : 64 }}>
            <Reveal className="text-center"><div className="flex justify-center"><Kicker gold={gold}>The details</Kicker></div><Title center className="mt-6" size={44}>Amenities</Title></Reveal>
            <div className={`mt-14 grid ${lg ? "grid-cols-4" : md ? "grid-cols-3" : "grid-cols-2"}`} style={{ borderTop: `1px solid ${LINE}`, borderLeft: `1px solid ${LINE}` }}>
              {c.amenities.map((a, i) => (
                <Reveal key={a + i} delay={(i % 4) * 0.05} y={10} className="flex flex-col justify-between gap-6 p-6" style={{ borderRight: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}`, minHeight: 130 }}>
                  <span className="text-xs" style={{ color: gold, fontFamily: SERIF }}>{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-[15px] font-medium tracking-wide">{a}</span>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {gallery.length > 0 && (
        <section style={{ paddingTop: md ? 140 : 72 }}>
          <div className="mx-auto mb-12 flex max-w-7xl flex-wrap items-end justify-between gap-4 px-6">
            <Reveal><Kicker gold={gold}>Gallery</Kicker><Title className="mt-6" size={44}>A closer look</Title></Reveal>
            <PageLink page="gallery" className="text-[11px] font-semibold uppercase tracking-[0.3em]" style={{ color: gold }}>{gallery.length > 1 ? `View all ${gallery.length}` : "View"}</PageLink>
          </div>
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4" style={{ scrollbarWidth: "none", scrollPaddingLeft: 24 }}>
            {gallery.slice(0, 12).map((g, i) => (
              <button key={g.url + i} type="button" onClick={() => onPhoto(i)} aria-label={`Open photo${g.caption ? `: ${g.caption}` : ` ${i + 1}`}`} className="group relative shrink-0 snap-start overflow-hidden" style={{ width: md ? 420 : "78vw", maxWidth: 420 }}>
                <Img src={g.url} alt={g.caption || ""} sizes="(min-width: 820px) 420px, 78vw" className="aspect-[3/4] w-full object-cover opacity-90 transition-[transform,opacity] duration-700 group-hover:scale-105 group-hover:opacity-100" />
                {g.caption && (
                  <span className="absolute inset-x-0 bottom-0 p-4 text-left text-[11px] uppercase tracking-[0.3em]" style={{ color: TEXT, background: "linear-gradient(transparent, rgba(0,0,0,0.7))" }}>{g.caption}</span>
                )}
              </button>
            ))}
          </div>
        </section>
      )}

      <Testimonials gold={gold} />
      <Cta gold={gold} />
    </>
  );
}

/** Stars and rooms, counted up under the welcome. */
function Stats({ gold }) {
  const { site } = useSite();
  const { md } = useBp();
  const rooms = useRooms();
  const services = useServices();
  const stars = Math.min(5, Number(site.hotel.starRating) || 0);
  const items = [
    stars > 0 && { k: "s", value: <Counter value={stars} duration={1.4} />, label: stars === 1 ? "Star" : "Stars" },
    rooms.length > 0 && { k: "r", value: <Counter value={rooms.length} duration={1.4} />, label: rooms.length === 1 ? "Room type" : "Room types" },
    services.length > 0 && { k: "v", value: <Counter value={services.length} duration={1.4} />, label: services.length === 1 ? "Service" : "Services" },
    site.hotel.checkIn && { k: "c", value: site.hotel.checkIn, label: "Check-in" },
  ].filter(Boolean);
  if (!items.length) return null;
  return (
    <Reveal delay={0.1} className="mx-auto mt-14 grid max-w-3xl" style={{ gridTemplateColumns: `repeat(${md ? items.length : Math.min(2, items.length)}, minmax(0, 1fr))`, borderTop: `1px solid ${LINE}` }}>
      {items.map((x, i) => (
        <div key={x.k} className="px-3 py-7" style={{ borderLeft: (md ? i : i % 2) ? `1px solid ${LINE}` : "none", borderBottom: !md && items.length > 2 && i < 2 ? `1px solid ${LINE}` : "none" }}>
          <p className="leading-none" style={{ fontFamily: SERIF, fontSize: md ? 44 : 34, color: gold }}>{x.value}</p>
          <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.32em]" style={{ color: MUTED }}>{x.label}</p>
        </div>
      ))}
    </Reveal>
  );
}

/** Services as a gilded grid. Hidden when there are none. */
function Services({ gold, limit, page = false }) {
  const { md, lg } = useBp();
  const all = useServices();
  if (!all.length) return null;
  const list = limit ? all.slice(0, limit) : all;
  const cols = lg ? 3 : md ? 2 : 1;
  return (
    <section className="mx-auto max-w-7xl px-6" style={{ paddingTop: page ? 0 : md ? 130 : 72, paddingBottom: md ? 130 : 72 }}>
      {!page && (
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal><Kicker gold={gold}>Concierge</Kicker><Title className="mt-6">Curated services</Title></Reveal>
          {all.length > list.length && (
            <PageLink page="services" className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em]" style={{ color: gold }}>All {all.length} services <ArrowRight className="h-4 w-4" /></PageLink>
          )}
        </div>
      )}
      <div className={`${page ? "" : "mt-14"} grid`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, borderTop: `1px solid ${LINE}`, borderLeft: `1px solid ${LINE}` }}>
        {list.map((s, i) => <ServiceCell key={s.name + i} service={s} gold={gold} index={i} delay={(i % cols) * 0.08} />)}
      </div>
    </section>
  );
}

function ServiceCell({ service, gold, index, delay }) {
  const cta = useServiceCta(service.name);
  const price = servicePrice(service);
  return (
    <Reveal delay={delay} className="group bs-hover relative flex flex-col overflow-hidden" style={{ borderRight: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}`, minHeight: 300, isolation: "isolate" }}>
      {/* The service photo (when there is one) surfaces softly on hover. */}
      {service.image && (
        <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-700 group-hover:opacity-100">
          <div className="bs-zoom h-full w-full">
            <Img src={service.image} alt="" sizes={SIZES.third} fallback="#2a2620" className="h-full w-full object-cover" />
          </div>
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(11,11,12,0.78), rgba(11,11,12,0.94))" }} />
        </div>
      )}
      <div className="flex flex-1 flex-col p-8">
        <div className="flex items-center justify-between">
          <span className="grid h-12 w-12 place-items-center transition-transform duration-500 group-hover:-translate-y-1" style={{ border: `1px solid ${LINE}`, color: gold }}>
            <ServiceIcon icon={service.icon} name={service.name} className="h-5 w-5" strokeWidth={1.25} />
          </span>
          <span className="text-xs" style={{ fontFamily: SERIF, color: gold }}>{String(index + 1).padStart(2, "0")}</span>
        </div>
        <h3 className="mt-8 text-[26px] leading-tight" style={{ fontFamily: SERIF }}>{service.name}</h3>
        {service.description && <p className="mt-3 text-[15px] font-light leading-relaxed" style={{ color: MUTED }}>{service.description}</p>}
        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em]" style={{ color: price ? gold : TEXT }}>
            {price ? price.label : "Ask us"}
          </p>
          {cta && (
            <a href={cta.href} target={cta.target} rel={cta.rel} className="inline-flex items-center gap-1.5 py-1 text-[11px] font-semibold uppercase tracking-[0.26em]" style={{ color: TEXT }} aria-label={`Arrange ${service.name}`}>
              Arrange <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" style={{ color: gold }} />
            </a>
          )}
        </div>
      </div>
      <span aria-hidden="true" className="absolute bottom-0 left-0 right-0 h-px origin-left scale-x-0 transition-transform duration-700 group-hover:scale-x-100" style={{ background: gold }} />
    </Reveal>
  );
}

function ServicesPage({ gold }) {
  const { site } = useSite();
  const { md } = useBp();
  const services = useServices();
  return (
    <>
      <PageHead kicker="Concierge" title="Services" image={services.find((s) => s.image)?.image || site.content.gallery?.[3]?.url || site.content.hero?.image} gold={gold} />
      <Reveal className="mx-auto max-w-3xl px-6 text-center" style={{ paddingBottom: md ? 72 : 44 }}>
        <p className="text-xl italic leading-relaxed" style={{ fontFamily: SERIF, color: "rgba(236,231,223,0.9)" }}>
          Transfers, treatments and excursions — our team arranges every detail before you arrive.
        </p>
      </Reveal>
      <Services gold={gold} page />
      <Cta gold={gold} />
    </>
  );
}

function RoomTile({ room, gold, delay }) {
  const cta = useBookCta(room.name);
  const price = formatPrice(room.price, room.currency);
  const facts = roomFacts(room).slice(0, 2);
  return (
    <Reveal delay={delay} className="group relative overflow-hidden" style={{ background: PANEL }}>
      <Img src={room.image} alt={room.name} sizes={SIZES.third} fallback="#2a2620" className="aspect-[3/4] w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.08]" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 35%, rgba(0,0,0,0.92))" }} aria-hidden="true" />
      <span aria-hidden="true" className="pointer-events-none absolute inset-4 scale-[0.98] opacity-0 transition-[transform,opacity] duration-700 group-hover:scale-100 group-hover:opacity-100" style={{ border: `1px solid ${gold}` }} />
      <div className="absolute inset-x-0 bottom-0 p-7">
        {price && <p className="text-[11px] font-semibold uppercase tracking-[0.3em]" style={{ color: gold }}>From {price} / night</p>}
        <h3 className="mt-2 text-3xl" style={{ fontFamily: SERIF }}>{room.name}</h3>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.25em]" style={{ color: "rgba(236,231,223,0.85)" }}>
          {facts.map((f) => <span key={f}>{f}</span>)}
          {cta && <a href={cta.href} target={cta.target} rel={cta.rel} className="inline-flex items-center gap-1 py-1" style={{ color: gold }} aria-label={`Reserve the ${room.name}`}>Reserve <ArrowUpRight className="h-3.5 w-3.5" /></a>}
        </div>
      </div>
    </Reveal>
  );
}

function Testimonials({ gold }) {
  const { md } = useBp();
  const list = useReviews();
  if (!list.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-6" style={{ paddingTop: md ? 140 : 72, paddingBottom: md ? 40 : 24 }}>
      <Reveal className="text-center"><Kicker gold={gold}>Guest reviews</Kicker></Reveal>
      <div className={`mt-12 grid gap-8 ${md ? "grid-cols-3" : "grid-cols-1"}`}>
        {list.slice(0, 3).map((t, i) => (
          <Reveal key={i} delay={i * 0.08} className="p-8" style={{ border: `1px solid ${LINE}` }}>
            <span className="block text-6xl leading-none" style={{ fontFamily: SERIF, color: gold }}>“</span>
            <p className="mt-2 text-xl italic leading-relaxed" style={{ fontFamily: SERIF }}>{t.quote}</p>
            {(t.author || t.source) && <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.3em]" style={{ color: MUTED }}>{[t.author, t.source].filter(Boolean).join(" — ")}</p>}
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Cta({ gold }) {
  const { site } = useSite();
  const { md } = useBp();
  const wa = useWhatsApp()();
  const book = useBooking();
  return (
    <section className="relative overflow-hidden" style={{ marginTop: md ? 120 : 64 }}>
      <Img src={site.content.about?.image || site.content.hero?.image} alt="" fallback="#2a2620" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0" style={{ background: "rgba(5,5,6,0.78)" }} />
      <div className="relative mx-auto max-w-7xl px-6" style={{ paddingTop: md ? 130 : 72, paddingBottom: md ? 130 : 72 }}>
        <Reveal className="mx-auto max-w-3xl p-10 text-center" style={{ border: `1px solid ${gold}`, padding: md ? 64 : 32 }}>
          <Kicker gold={gold}>Reservations</Kicker>
          <Title center className="mt-6" size={48}>An evening at {site.hotel.name} awaits</Title>
          <p className="mt-5 font-light" style={{ color: "rgba(236,231,223,0.85)" }}>{book ? "Book direct for our best rate — or write to our team, who reply personally within minutes." : "Our team confirms every reservation personally, usually within minutes."}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            {book && <GoldButton {...book} gold={gold} solid>Book now <ArrowRight className="h-4 w-4" /></GoldButton>}
            {wa && <GoldButton href={wa} target="_blank" rel="noopener noreferrer" gold={gold} solid={!book}><WhatsAppIcon size={16} /> {book ? "WhatsApp" : "Reserve on WhatsApp"}</GoldButton>}
            {!wa && !book && <PageLink page="contact" className="inline-flex items-center gap-3 px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.28em]" style={{ background: gold, color: BG }}>Contact us</PageLink>}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function PageHead({ kicker, title, image, gold }) {
  const { md } = useBp();
  return (
    <section className="relative flex items-end overflow-hidden" style={{ minHeight: md ? 520 : 360, background: BG }}>
      <KenBurns key={image} className="absolute inset-0" from={1.1} duration={8}>
        <Img src={image} alt="" priority fallback="#2a2620" className="h-full w-full object-cover" />
      </KenBurns>
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.55), rgba(11,11,12,1))" }} />
      <div className="relative mx-auto w-full max-w-7xl px-6 pb-16">
        <Rise delay={0.1}><Kicker gold={gold}>{kicker}</Kicker></Rise>
        <RevealText text={title} className="mt-6 uppercase leading-[1.02]" style={{ fontFamily: SERIF, fontSize: md ? 80 : 38, letterSpacing: md ? "0.05em" : "0.03em" }} delay={0.2} stagger={0.09} />
      </div>
    </section>
  );
}

function Rooms({ gold }) {
  const { site } = useSite();
  const { md } = useBp();
  const wa = useWhatsApp();
  const book = useBooking();
  const rooms = useRooms();
  return (
    <>
      <PageHead kicker="Accommodation" title="Rooms & suites" image={rooms[0]?.image || site.content.hero?.image} gold={gold} />
      <section className="mx-auto max-w-7xl px-6" style={{ paddingBottom: md ? 120 : 64 }}>
        {rooms.length === 0 && (
          <Reveal className="mx-auto max-w-2xl py-16 text-center">
            <Title center size={42}>Rooms coming soon</Title>
            <p className="mx-auto mt-5 max-w-md font-light leading-relaxed" style={{ color: MUTED }}>Our suites are being photographed. Write to our team with your dates and we'll arrange everything.</p>
            <div className="mt-10 flex justify-center">
              {wa(null) ? <GoldButton href={wa(null)} target="_blank" rel="noopener noreferrer" gold={gold} solid><WhatsAppIcon size={16} /> Enquire</GoldButton> : <PageLink page="contact" className="inline-flex items-center gap-3 px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.28em]" style={{ background: gold, color: BG }}>Contact us</PageLink>}
            </div>
          </Reveal>
        )}
        {rooms.map((r, i) => {
          const price = formatPrice(r.price, r.currency);
          const link = wa(r.name);
          return (
            <div key={r.id || i} className={md ? "grid grid-cols-12 items-center gap-12" : "space-y-8"} style={{ paddingTop: md ? 90 : 48, paddingBottom: md ? 90 : 48, borderBottom: `1px solid ${LINE}` }}>
              <Reveal className={md ? `col-span-7 ${i % 2 ? "order-2" : ""}` : ""}>
                <div className="bs-zoom" style={{ background: PANEL }}><Img src={r.image} alt={r.name} sizes="(min-width: 820px) 58vw, 100vw" fallback="#2a2620" className="aspect-[16/11] w-full object-cover" /></div>
              </Reveal>
              <Reveal delay={0.1} className={md ? "col-span-5" : ""}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em]" style={{ color: gold }}>Room {String(i + 1).padStart(2, "0")}</p>
                <h2 className="mt-4 text-5xl leading-tight" style={{ fontFamily: SERIF, fontSize: md ? 48 : 36 }}>{r.name}</h2>
                {r.description && <p className="mt-6 font-light leading-[1.85]" style={{ color: MUTED }}>{r.description}</p>}
                <dl className="mt-8 grid grid-cols-2 gap-px" style={{ background: LINE }}>
                  {[["Guests", Number(r.maxOccupancy) > 0 ? `Up to ${r.maxOccupancy}` : "On request"], ["Bed", r.bedConfig || "On request"], ["Size", Number(r.sizeSqm) > 0 ? `${r.sizeSqm} m²` : "—"], ["Breakfast", r.breakfastIncluded ? "Included" : "On request"]].map(([k, v]) => (
                    <div key={k} className="p-4" style={{ background: BG }}>
                      <dt className="text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: MUTED }}>{k}</dt>
                      <dd className="mt-1 text-sm">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-8 flex flex-wrap items-center gap-5">
                  {price && <p className="text-2xl" style={{ fontFamily: SERIF, color: gold }}><span className="text-sm" style={{ color: MUTED, fontFamily: SANS }}>from </span>{price}<span className="text-sm" style={{ color: MUTED, fontFamily: SANS }}> / night</span></p>}
                  {book && <GoldButton {...book} gold={gold} solid>Book now</GoldButton>}
                  {link && (book
                    ? <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] underline underline-offset-8" style={{ color: TEXT }}><WhatsAppIcon size={14} /> Ask us</a>
                    : <GoldButton href={link} target="_blank" rel="noopener noreferrer" gold={gold} solid><WhatsAppIcon size={16} /> Reserve</GoldButton>)}
                </div>
              </Reveal>
            </div>
          );
        })}
      </section>
      <Cta gold={gold} />
    </>
  );
}

function Gallery({ gold, onPhoto }) {
  const { site } = useSite();
  const { md, lg } = useBp();
  const gallery = useGallery();
  return (
    <>
      <PageHead kicker={site.hotel.name} title="Gallery" image={gallery[0]?.url || site.content.hero?.image} gold={gold} />
      {gallery.length === 0 && <p className="mx-auto max-w-md px-6 pb-24 text-center font-light" style={{ color: MUTED }}>Photographs are on their way — please check back soon.</p>}
      <section className={`mx-auto grid grid-flow-dense max-w-7xl gap-3 px-6 ${lg ? "grid-cols-3" : "grid-cols-2"}`} style={{ paddingBottom: md ? 120 : 64 }}>
        {gallery.map((g, i) => {
          const big = (lg && gallery.length >= 4 && i % 7 === 0) || (!lg && i % 5 === 0);
          return (
            <Reveal key={g.url + i} delay={(i % 3) * 0.06} className={big ? (lg ? "col-span-2 row-span-2" : "col-span-2") : ""}>
              <button type="button" onClick={() => onPhoto(i)} aria-label={`Open photo${g.caption ? `: ${g.caption}` : ` ${i + 1}`}`} className="group relative block h-full w-full overflow-hidden" style={{ background: PANEL }}>
                <Img src={g.url} alt={g.caption || ""} sizes={big ? "(min-width: 1080px) 66vw, 100vw" : SIZES.thumb} className={`${big && lg ? "absolute inset-0" : big ? "aspect-[16/10]" : "aspect-square"} h-full w-full object-cover transition-transform duration-700 group-hover:scale-105`} />
                {g.caption && (
                  <span className={`absolute inset-0 flex items-end p-5 transition-opacity ${md ? "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100" : ""}`} style={{ background: "linear-gradient(transparent 50%, rgba(0,0,0,0.75))" }}>
                    <span className="text-left text-[11px] uppercase tracking-[0.3em]" style={{ color: gold }}>{g.caption}</span>
                  </span>
                )}
              </button>
            </Reveal>
          );
        })}
      </section>
    </>
  );
}

function About({ gold }) {
  const { site } = useSite();
  const { md } = useBp();
  const c = site.content;
  const ps = paragraphs(c.about?.body);
  return (
    <>
      <PageHead kicker="Our story" title={`About ${site.hotel.name}`} image={c.about?.image || c.hero?.image} gold={gold} />
      <section className={`mx-auto max-w-7xl px-6 ${md ? "grid grid-cols-12 gap-16" : ""}`} style={{ paddingBottom: md ? 110 : 56 }}>
        <Reveal className={md ? "col-span-5" : ""}><Title size={46}>{c.about?.heading || `Welcome to ${site.hotel.name}`}</Title></Reveal>
        <Reveal delay={0.1} className={md ? "col-span-7" : "mt-8"}>
          {ps.map((p, i) => <p key={i} className="mb-6 text-[17px] font-light leading-[1.9]" style={{ color: i ? MUTED : TEXT }}>{p}</p>)}
          {(site.hotel.checkIn || site.hotel.checkOut) && (
            <div className="mt-10 grid grid-cols-2 gap-px" style={{ background: LINE }}>
              <div className="p-6" style={{ background: BG }}><p className="text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: MUTED }}>Check-in</p><p className="mt-2 text-3xl" style={{ fontFamily: SERIF, color: gold }}>{site.hotel.checkIn || "Flexible"}</p></div>
              <div className="p-6" style={{ background: BG }}><p className="text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: MUTED }}>Check-out</p><p className="mt-2 text-3xl" style={{ fontFamily: SERIF, color: gold }}>{site.hotel.checkOut || "Flexible"}</p></div>
            </div>
          )}
          {c.amenities?.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2">
              {c.amenities.map((a, i) => <span key={a + i} className="px-4 py-2 text-xs uppercase tracking-[0.2em]" style={{ border: `1px solid ${LINE}`, color: TEXT }}>{a}</span>)}
            </div>
          )}
        </Reveal>
      </section>
      <Location gold={gold} />
    </>
  );
}

function Location({ gold }) {
  const { site } = useSite();
  const { md } = useBp();
  const loc = site.content.location || {};
  return (
    <section style={{ background: PANEL, borderTop: `1px solid ${LINE}` }}>
      <div className={`mx-auto max-w-7xl px-6 ${md ? "grid grid-cols-12 items-center gap-12" : "space-y-8"}`} style={{ paddingTop: md ? 110 : 64, paddingBottom: md ? 110 : 64 }}>
        <Reveal className={md ? "col-span-4" : ""}>
          <Kicker gold={gold}>Location</Kicker>
          <Title className="mt-6" size={42}>How to find us</Title>
          {loc.address && <p className="mt-6 flex gap-3 font-light"><MapPin className="mt-0.5 h-5 w-5 shrink-0" style={{ color: gold }} />{loc.address}</p>}
          {loc.directions && <p className="mt-4 font-light leading-relaxed" style={{ color: MUTED }}>{loc.directions}</p>}
          <a href={directionsHref(loc.mapQuery || loc.address || site.hotel.name)} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em]" style={{ color: gold }}>
            Get directions <ArrowUpRight className="h-4 w-4" />
          </a>
        </Reveal>
        <Reveal delay={0.1} className={md ? "col-span-8" : ""}>
          <MapFrame title={`Map showing ${site.hotel.name}`} query={loc.mapQuery || loc.address || site.hotel.name} className={`${md ? "h-[440px]" : "h-[300px]"} w-full`} style={{ filter: "grayscale(1) invert(0.92) contrast(0.9)" }} />
        </Reveal>
      </div>
    </section>
  );
}

function Contact({ gold }) {
  const { site } = useSite();
  const { md } = useBp();
  const c = site.content.contact || {};
  const wa = useWhatsApp()();
  const f = useEnquiry();
  const input = "w-full bg-transparent px-0 py-3 text-[15px] outline-none placeholder:text-[#8f8a82]";
  const st = { borderBottom: `1px solid ${LINE}`, colorScheme: "dark" };
  const rows = [
    wa && { icon: <WhatsAppIcon size={18} />, label: "WhatsApp", value: `+${site.whatsapp}`, href: wa, ext: true },
    c.phone && { icon: <Phone className="h-[18px] w-[18px]" />, label: "Telephone", value: c.phone, href: `tel:${c.phone.replace(/\s/g, "")}` },
    c.email && { icon: <Mail className="h-[18px] w-[18px]" />, label: "Email", value: c.email, href: `mailto:${c.email}` },
    site.content.location?.address && { icon: <MapPin className="h-[18px] w-[18px]" />, label: "Address", value: site.content.location.address },
  ].filter(Boolean);
  return (
    <>
      <PageHead kicker="Concierge" title="Contact" image={site.content.gallery?.[3]?.url || site.content.hero?.image} gold={gold} />
      <section className={`mx-auto max-w-7xl px-6 ${md ? "grid grid-cols-12 gap-16" : "space-y-12"}`} style={{ paddingBottom: md ? 110 : 56 }}>
        <Reveal className={md ? "col-span-5" : ""}>
          <Title size={42}>At your service, day and night</Title>
          <div className="mt-10" style={{ borderTop: `1px solid ${LINE}` }}>
            {rows.map((r) => {
              const inner = (
                <div className="flex items-center gap-5 py-5" style={{ borderBottom: `1px solid ${LINE}` }}>
                  <span style={{ color: gold }}>{r.icon}</span>
                  <span className="flex-1">
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: MUTED }}>{r.label}</span>
                    <span className="mt-1 block">{r.value}</span>
                  </span>
                </div>
              );
              return r.href ? <a key={r.label} href={r.href} target={r.ext ? "_blank" : undefined} rel="noopener noreferrer" className="block hover:opacity-80">{inner}</a> : <div key={r.label}>{inner}</div>;
            })}
          </div>
        </Reveal>
        <Reveal delay={0.1} className={md ? "col-span-7" : ""}>
          <form onSubmit={f.submit} className="p-10" style={{ background: PANEL, border: `1px solid ${LINE}`, padding: md ? 48 : 24 }}>
            <Kicker gold={gold}>Reservation request</Kicker>
            <div className="mt-8 space-y-5">
              <input className={input} style={st} aria-label="Full name" autoComplete="name" placeholder="Full name" value={f.v.name} onChange={f.set("name")} />
              <div className="grid grid-cols-2 gap-6">
                <input type="date" className={input} style={st} value={f.v.checkIn} onChange={f.set("checkIn")} aria-label="Arrival" />
                <input type="date" className={input} style={st} value={f.v.checkOut} onChange={f.set("checkOut")} aria-label="Departure" />
              </div>
              <input className={input} style={st} aria-label="Number of guests" inputMode="numeric" placeholder="Number of guests" value={f.v.guests} onChange={f.set("guests")} />
              <textarea className={input} style={st} rows={3} aria-label="Special requests" placeholder="Special requests" value={f.v.message} onChange={f.set("message")} />
            </div>
            <button type="submit" className="mt-10 inline-flex items-center gap-3 px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.28em]" style={{ background: gold, color: BG }}>
              Send via {f.via} <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </Reveal>
      </section>
      <Location gold={gold} />
    </>
  );
}

function Footer({ gold }) {
  const { site } = useSite();
  const pages = useNavPages();
  const { md } = useBp();
  return (
    <footer style={{ borderTop: `1px solid ${LINE}` }}>
      <div className="mx-auto max-w-7xl px-6 text-center" style={{ paddingTop: 80, paddingBottom: 40 }}>
        <p className="text-2xl uppercase tracking-[0.32em]" style={{ fontFamily: SERIF }}>{site.hotel.name}</p>
        {site.content.location?.address && <p className="mt-3 text-sm" style={{ color: MUTED }}>{site.content.location.address}</p>}
        {(site.content.contact?.phone || site.content.contact?.email) && (
          <p className="mt-1 text-sm" style={{ color: MUTED }}>{[site.content.contact?.phone, site.content.contact?.email].filter(Boolean).join("  ·  ")}</p>
        )}
        <nav className={`mt-10 flex flex-wrap justify-center ${md ? "gap-10" : "gap-5"}`}>
          {pages.map((p) => <PageLink key={p.id} page={p.id} className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#a39e95] transition-colors hover:text-[#ece7df]">{p.label}</PageLink>)}
        </nav>
        <div className="mx-auto mt-12 h-px w-24" style={{ background: gold }} />
        <p className="mt-8 text-xs" style={{ color: "#8a857d" }}>
          © {year()} {site.hotel.name} · Website by <a href="https://botlify.site" className="underline">Botlify</a>
        </p>
      </div>
    </footer>
  );
}
