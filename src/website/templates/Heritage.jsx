/**
 * Heritage — warm and classic. Paper-textured cream, deep burgundy and brass,
 * arched window frames, ornamental dividers and a monogram crest. Cinzel
 * capitals over EB Garamond. Feels like a historic manor or colonial hotel.
 */
import { ArrowRight, Mail, MapPin, Menu, Phone, X } from "lucide-react";
import {
  Counter, DrawLine, Img, KenBurns, Lightbox, MapFrame, MobileBookBar, PageLink, Reveal, RevealText, Rise, SIZES,
  ScrollProgress, ServiceIcon, WhatsAppFab, WhatsAppIcon, directionsHref, formatPrice, paragraphs, servicePrice,
  useActivePage, useBookCta, useBooking, useBp, useEnquiry, useFonts, useFrameHeight, useGallery, useLightbox, useMenu,
  useNavPages, useReviews, useRooms, useScrolled, useServiceCta, useServices, useSite, useWhatsApp, year,
} from "../shared";

const CAPS = "'Cinzel', Georgia, serif";
const BODY = "'EB Garamond', Georgia, serif";
const PAPER = "#f2e9d8";
const INK = "#2a1c13";
const MUTED = "#655242";
const BRASS = "#a8834a";
// Brass is decorative; small text set in it uses this deeper tone for AA contrast.
const BRASS_TEXT = "#7d5f2f";
const LINE = "rgba(168,131,74,0.35)";
// Subtle paper grain — an inline SVG noise tile, no image request.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.35 0 0 0 0 0.25 0 0 0 0 0.15 0 0 0 0.07 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function Heritage() {
  useFonts("heritage", "family=Cinzel:wght@400;500;600;700&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500");
  const { site } = useSite();
  const page = useActivePage();
  const wine = site.accent || "#7a2b25";
  const gallery = useGallery();
  const lb = useLightbox();
  return (
    <div style={{ fontFamily: BODY, backgroundColor: PAPER, backgroundImage: GRAIN, color: INK }} className="min-h-full text-[18px] antialiased">
      <Nav wine={wine} />
      <main>
        {page === "home" && <Home wine={wine} onPhoto={lb.open} />}
        {page === "rooms" && <Rooms wine={wine} />}
        {page === "services" && <ServicesPage wine={wine} />}
        {page === "gallery" && <Gallery wine={wine} onPhoto={lb.open} />}
        {page === "about" && <About wine={wine} />}
        {page === "contact" && <Contact wine={wine} />}
      </main>
      <Footer wine={wine} />
      <MobileBookBar bg={PAPER} fg={INK} muted={MUTED} accent={wine} accentFg={PAPER} font={BODY} displayFont={CAPS} border={LINE} radius={2} uppercase />
      <WhatsAppFab />
      <Lightbox images={gallery} index={lb.index} onClose={lb.close} onIndex={lb.setIndex} />
    </div>
  );
}

function Ornament({ color = BRASS, className = "" }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden="true">
      <DrawLine origin="right" className="h-px w-16" style={{ background: color }} />
      <svg width="34" height="14" viewBox="0 0 34 14" fill="none" stroke={color} strokeWidth="1.1" className="shrink-0">
        <path d="M1 7h8M25 7h8" />
        <path d="M17 1l5 6-5 6-5-6 5-6z" />
        <circle cx="17" cy="7" r="1.4" fill={color} />
      </svg>
      <DrawLine className="h-px w-16" style={{ background: color }} />
    </div>
  );
}

function Crest({ wine, size = 56 }) {
  const { site } = useSite();
  return (
    <span className="inline-flex items-center justify-center rounded-full" style={{ width: size, height: size, border: `1px solid ${BRASS}`, boxShadow: `inset 0 0 0 3px ${PAPER}, inset 0 0 0 4px ${BRASS}`, color: wine, fontFamily: CAPS, fontSize: size * 0.42 }}>
      {(site.hotel.name || "H").trim().charAt(0).toUpperCase()}
    </span>
  );
}

const Caps = ({ children, className = "", style }) => (
  <p className={`text-[12px] uppercase tracking-[0.32em] ${className}`} style={{ fontFamily: CAPS, color: BRASS_TEXT, ...style }}>{children}</p>
);

function Heading({ children, size = 44, center, className = "" }) {
  const { md } = useBp();
  return (
    <h2 className={`font-normal uppercase leading-[1.15] tracking-[0.06em] ${center ? "text-center" : ""} ${className}`} style={{ fontFamily: CAPS, fontSize: md ? size : size * 0.66 }}>
      {children}
    </h2>
  );
}

function Button({ href, children, wine, ghost, ...rest }) {
  return (
    <a href={href} {...rest} className="inline-flex items-center gap-2 px-7 py-3.5 text-[12px] uppercase tracking-[0.24em] transition-transform duration-300 hover:-translate-y-0.5 active:scale-[0.98]" style={{ fontFamily: CAPS, background: ghost ? "transparent" : wine, color: ghost ? INK : PAPER, border: `1px solid ${ghost ? INK : wine}`, boxShadow: ghost ? "none" : `inset 0 0 0 3px ${wine}, inset 0 0 0 4px rgba(242,233,216,0.45)` }}>
      {children}
    </a>
  );
}

function Nav({ wine }) {
  const { site } = useSite();
  const page = useActivePage();
  const pages = useNavPages();
  const { md: mdBp, lg } = useBp();
  const md = pages.length > 5 ? lg : mdBp;
  const scrolled = useScrolled(80);
  const [open, setOpen] = useMenu();
  const c = site.content.contact || {};
  const cta = useBookCta();
  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-40" style={{ backgroundColor: scrolled ? "rgba(242,233,216,0.86)" : PAPER, backgroundImage: GRAIN, backdropFilter: scrolled ? "blur(12px) saturate(130%)" : undefined, WebkitBackdropFilter: scrolled ? "blur(12px) saturate(130%)" : undefined, boxShadow: scrolled ? "0 6px 24px -14px rgba(42,28,19,0.5)" : "none" }}>
        {md && !scrolled && (
          <div className="text-center text-[13px] italic" style={{ background: wine, color: "rgba(242,233,216,0.85)", padding: "6px 0" }}>
            {[site.content.location?.address, c.phone].filter(Boolean).join("  ·  ") || `Welcome to ${site.hotel.name}`}
          </div>
        )}
        <div className="mx-auto max-w-6xl px-6" style={{ borderBottom: `1px solid ${LINE}` }}>
          {md ? (
            <div className="flex flex-col items-center py-4">
              <PageLink page="home" className="flex items-center gap-4">
                {!scrolled && <Crest wine={wine} size={44} />}
                <span className="text-[24px] uppercase tracking-[0.2em]" style={{ fontFamily: CAPS }}>{site.hotel.name}</span>
              </PageLink>
              <nav className="mt-3 flex items-center gap-2">
                {pages.map((p, i) => (
                  <span key={p.id} className="flex items-center gap-2">
                    {i > 0 && <span style={{ color: BRASS }} aria-hidden="true">·</span>}
                    <PageLink page={p.id} className="group relative px-2 py-1 text-[12px] uppercase tracking-[0.22em]" style={{ fontFamily: CAPS, color: page === p.id ? wine : INK }}>
                      {p.label}
                      <span aria-hidden="true" className={`absolute bottom-0 left-2 right-2 h-px origin-center transition-transform duration-500 ${page === p.id ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} style={{ background: BRASS }} />
                    </PageLink>
                  </span>
                ))}
                {cta && (
                  <>
                    <span style={{ color: BRASS }} aria-hidden="true">·</span>
                    <a href={cta.href} target={cta.target} rel={cta.rel} className="ml-2 px-4 py-1.5 text-[11px] uppercase tracking-[0.24em] transition-transform duration-300 hover:-translate-y-0.5" style={{ fontFamily: CAPS, background: wine, color: PAPER }}>Reserve</a>
                  </>
                )}
              </nav>
            </div>
          ) : (
            <div className="flex h-16 items-center justify-between">
              <PageLink page="home" className="min-w-0 truncate text-lg uppercase tracking-[0.16em]" style={{ fontFamily: CAPS }}>{site.hotel.name}</PageLink>
              <button type="button" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} className="-mr-2 ml-3 shrink-0 p-2" style={{ color: wine }}>{open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}</button>
            </div>
          )}
        </div>
        {scrolled && <ScrollProgress color={wine} height={2} style={{ opacity: 0.7 }} />}
      </header>
      {open && !md && (
        <div className="fixed inset-0 z-30 flex flex-col items-center justify-center gap-5 overflow-y-auto py-20" style={{ backgroundColor: PAPER, backgroundImage: GRAIN }}>
          <Crest wine={wine} size={64} />
          {pages.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.05} y={10}>
              <PageLink page={p.id} className="text-2xl uppercase tracking-[0.2em]" style={{ fontFamily: CAPS, color: page === p.id ? wine : INK }}>{p.label}</PageLink>
            </Reveal>
          ))}
          {cta && <div className="mt-4"><Button href={cta.href} target={cta.target} rel={cta.rel} wine={wine}>{cta.kind === "whatsapp" && <WhatsAppIcon size={15} />} Reserve</Button></div>}
          <Ornament className="mt-4" />
        </div>
      )}
    </>
  );
}

function Arch({ src, alt = "", className = "", ratio = "3/4", sizes = SIZES.half, priority = false, kenBurns = false }) {
  const img = <Img src={src} alt={alt} sizes={sizes} priority={priority} fallback="#e3d3b4" className="w-full object-cover" style={{ aspectRatio: ratio }} />;
  return (
    <div className={`relative p-2 ${className}`} style={{ border: `1px solid ${BRASS}`, borderRadius: "999px 999px 4px 4px" }}>
      <div className="bs-zoom" style={{ borderRadius: "999px 999px 2px 2px", transform: "translateZ(0)" }}>
        {kenBurns ? <KenBurns from={1.14} duration={9}>{img}</KenBurns> : img}
      </div>
    </div>
  );
}

function Home({ wine, onPhoto }) {
  const { site } = useSite();
  const { md, lg } = useBp();
  const h = useFrameHeight(0.9, 560);
  const c = site.content;
  const gallery = useGallery();
  const rooms = useRooms();
  const reviews = useReviews();
  const ps = paragraphs(c.about?.body);
  const gCols = md ? 3 : 2;
  const shown = gallery.slice(0, gallery.length >= gCols * 2 ? gCols * 2 : gallery.length >= gCols ? gCols : gallery.length);
  return (
    <>
      <section className="mx-auto max-w-6xl px-6" style={{ paddingTop: md ? 170 : 96 }}>
        <div className={md ? "grid grid-cols-12 items-center gap-12" : "space-y-10"} style={{ minHeight: md ? h - 170 : undefined }}>
          <div className={md ? "col-span-6" : "text-center"}>
            <Rise delay={0.1}><Caps>{[site.hotel.typeLabel, site.hotel.city].filter(Boolean).join(" · ") || "Welcome"}</Caps></Rise>
            <RevealText
              text={c.hero?.title || site.hotel.name}
              className="mt-6 font-normal uppercase leading-[1.08] tracking-[0.04em]"
              style={{ fontFamily: CAPS, fontSize: lg ? 72 : md ? 58 : 33 }}
              delay={0.2}
              stagger={0.1}
              duration={1.1}
            />
            <Ornament className={`mt-6 ${md ? "justify-start" : ""}`} />
            {c.hero?.subtitle && <Rise delay={0.7} as="p" className="mt-6 text-[22px] italic leading-snug" style={{ color: MUTED }}>{c.hero.subtitle}</Rise>}
            <Rise delay={0.85}><CtaButtons wine={wine} className={`mt-10 ${md ? "" : "justify-center"}`} rooms={rooms.length > 0} /></Rise>
            <HeroFacts wine={wine} center={!md} />
          </div>
          <Rise delay={0.2} y={30} className={md ? "col-span-6" : ""}>
            <Arch src={c.hero?.image} alt={site.hotel.name} ratio={md ? "4/5" : "3/4"} sizes={SIZES.half} priority kenBurns />
          </Rise>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 text-center" style={{ paddingTop: md ? 130 : 72 }}>
        <Reveal>
          <Crest wine={wine} />
          <Heading center className="mt-6">{c.about?.heading || `Welcome to ${site.hotel.name}`}</Heading>
          <Ornament className="mt-6" />
          {ps[0] && (
            <p className="mt-8 text-left text-[20px] leading-[1.75]" style={{ color: MUTED }}>
              <span className="float-left mr-3 mt-1 leading-[0.8]" style={{ fontFamily: CAPS, fontSize: 72, color: wine }}>{ps[0].charAt(0)}</span>
              {ps[0].slice(1)}
            </p>
          )}
          <PageLink page="about" className="mt-8 inline-flex items-center gap-2 italic" style={{ color: wine, clear: "both" }}>Read our story <ArrowRight className="h-4 w-4" /></PageLink>
        </Reveal>
      </section>

      {rooms.length > 0 && (
        <section className="mx-auto max-w-6xl px-6" style={{ paddingTop: md ? 130 : 72 }}>
          <Reveal className="text-center"><Caps>Accommodation</Caps><Heading center className="mt-4">Our rooms</Heading><Ornament className="mt-5" /></Reveal>
          <div className={`mx-auto mt-14 grid gap-x-10 gap-y-16 ${lg && rooms.length >= 3 ? "grid-cols-3" : md && rooms.length >= 2 ? "grid-cols-2" : "max-w-md grid-cols-1"}`}>
            {rooms.slice(0, lg ? 3 : md ? 2 : 3).map((r, i) => <RoomCard key={r.id || i} room={r} wine={wine} delay={i * 0.08} />)}
          </div>
          <div className="mt-12 text-center"><PageLink page="rooms" className="italic underline underline-offset-4" style={{ color: wine }}>{rooms.length > 3 ? `View all ${rooms.length} rooms` : "Room details"}</PageLink></div>
        </section>
      )}

      <Services wine={wine} limit={6} />

      {c.amenities?.length > 0 && (
        <section style={{ marginTop: md ? 130 : 72, background: wine, color: PAPER, backgroundImage: GRAIN }}>
          <div className="mx-auto max-w-5xl px-6 text-center" style={{ paddingTop: md ? 100 : 60, paddingBottom: md ? 100 : 60 }}>
            <Reveal><Caps style={{ color: "#e3c48e" }}>At your disposal</Caps><Heading center className="mt-4">Comforts of the house</Heading><Ornament color="#e3c48e" className="mt-5" /></Reveal>
            <div className={`mx-auto mt-12 grid max-w-4xl gap-x-12 text-left ${md ? "grid-cols-2" : "grid-cols-1"}`}>
              {c.amenities.map((a, i) => (
                <Reveal key={a + i} y={8} delay={(i % 2) * 0.05} className="flex items-baseline gap-4 py-3" style={{ borderBottom: "1px solid rgba(227,196,142,0.3)" }}>
                  <span style={{ color: "#e3c48e" }}>❦</span><span className="text-[20px]">{a}</span>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {shown.length > 0 && (
        <section className="mx-auto max-w-6xl px-6" style={{ paddingTop: md ? 130 : 72 }}>
          <Reveal className="text-center"><Caps>Gallery</Caps><Heading center className="mt-4">Scenes from the house</Heading><Ornament className="mt-5" /></Reveal>
          <div className={`mx-auto mt-14 grid ${md ? "gap-8" : "gap-4"} ${shown.length === 1 ? "max-w-md grid-cols-1" : md && shown.length >= 3 ? "grid-cols-3" : "grid-cols-2"}`}>
            {shown.map((g, i) => (
              <Reveal key={g.url + i} delay={(i % 3) * 0.06}>
                <button type="button" onClick={() => onPhoto(i)} aria-label={`Open photo${g.caption ? `: ${g.caption}` : ` ${i + 1}`}`} className={`bs-tilt block w-full bg-white text-center shadow-[0_10px_30px_-12px_rgba(42,28,19,0.45)] ${md ? "p-3 pb-4" : "p-2 pb-3"}`} style={{ "--bs-r": `${[-1.2, 0.8, -0.6, 1, -0.9, 0.5][i % 6]}deg` }}>
                  <Img src={g.url} alt={g.caption || ""} sizes={SIZES.thumb} className="aspect-square w-full object-cover" />
                  <span className={`mt-3 block truncate italic ${md ? "text-[15px]" : "text-[13px]"}`} style={{ color: MUTED }}>{g.caption || site.hotel.name}</span>
                </button>
              </Reveal>
            ))}
          </div>
          {gallery.length > shown.length && (
            <div className="mt-12 text-center"><PageLink page="gallery" className="italic underline underline-offset-4" style={{ color: wine }}>See all {gallery.length} photographs</PageLink></div>
          )}
        </section>
      )}

      {reviews.length > 0 && (
        <section className="mx-auto max-w-3xl px-6 text-center" style={{ paddingTop: md ? 130 : 72 }}>
          <Caps>From our guestbook</Caps>
          {reviews.slice(0, 2).map((t, i) => (
            <Reveal key={i} className="mt-10">
              <p className="italic leading-snug" style={{ fontSize: md ? 28 : 23 }}>“{t.quote}”</p>
              {(t.author || t.source) && <p className="mt-4 text-[12px] uppercase tracking-[0.26em]" style={{ fontFamily: CAPS, color: MUTED }}>{[t.author, t.source].filter(Boolean).join(" · ")}</p>}
              {i < Math.min(2, reviews.length) - 1 && <Ornament className="mt-10" />}
            </Reveal>
          ))}
        </section>
      )}

      <Cta wine={wine} />
    </>
  );
}

/** Arrival, stars and rooms — set like an engraved plaque under the hero copy. */
function HeroFacts({ wine, center }) {
  const { site } = useSite();
  const rooms = useRooms();
  const stars = Math.min(5, Number(site.hotel.starRating) || 0);
  const items = [
    stars > 0 && { k: "s", value: <><Counter value={stars} duration={1.2} /><span style={{ color: BRASS }}> ★</span></>, label: "Stars" },
    rooms.length > 0 && { k: "r", value: <Counter value={rooms.length} duration={1.2} />, label: rooms.length === 1 ? "Chamber" : "Chambers" },
    site.hotel.checkIn && { k: "c", value: site.hotel.checkIn, label: "Arrival" },
  ].filter(Boolean);
  if (!items.length) return null;
  return (
    <Rise delay={1} className={`mt-10 flex ${center ? "justify-center" : ""}`}>
      <div className="inline-flex" style={{ borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}` }}>
        {items.map((x, i) => (
          <div key={x.k} className="px-5 py-3 text-center" style={{ borderLeft: i ? `1px solid ${LINE}` : "none" }}>
            <p className="text-[26px] leading-none" style={{ fontFamily: CAPS, color: wine }}>{x.value}</p>
            <p className="mt-1.5 text-[10px] uppercase tracking-[0.26em]" style={{ fontFamily: CAPS, color: BRASS_TEXT }}>{x.label}</p>
          </div>
        ))}
      </div>
    </Rise>
  );
}

/** Services, set like a menu card — dotted leaders run to the price. Hidden when empty. */
function Services({ wine, limit, page = false }) {
  const { md } = useBp();
  const all = useServices();
  if (!all.length) return null;
  const list = limit ? all.slice(0, limit) : all;
  return (
    <section className="mx-auto max-w-6xl px-6" style={{ paddingTop: page ? (md ? 72 : 44) : md ? 130 : 72 }}>
      {!page && <Reveal className="text-center"><Caps>At your request</Caps><Heading center className="mt-4">Services of the house</Heading><Ornament className="mt-5" /></Reveal>}
      <div
        className={`mx-auto ${page ? "" : "mt-14"} max-w-5xl`}
        style={{ border: `1px solid ${BRASS}`, outline: `1px solid ${BRASS}`, outlineOffset: 6, padding: md ? "48px 56px" : "28px 20px", background: "rgba(255,255,255,0.32)" }}
      >
        <div className={`grid ${md ? "grid-cols-2 gap-x-14" : "grid-cols-1"}`}>
          {list.map((s, i) => <ServiceItem key={s.name + i} service={s} wine={wine} delay={(i % 2) * 0.06} />)}
        </div>
        {all.length > list.length && (
          <div className="mt-8 text-center"><PageLink page="services" className="italic underline underline-offset-4" style={{ color: wine }}>All {all.length} services of the house</PageLink></div>
        )}
      </div>
    </section>
  );
}

function ServiceItem({ service, wine, delay }) {
  const cta = useServiceCta(service.name);
  const price = servicePrice(service);
  return (
    <Reveal delay={delay} y={12} className="group flex gap-4 py-5" style={{ borderBottom: `1px dotted ${LINE}` }}>
      <span className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-full transition-transform duration-500 group-hover:rotate-[8deg]" style={{ border: `1px solid ${BRASS}`, boxShadow: `inset 0 0 0 3px rgba(242,233,216,0.9), inset 0 0 0 4px ${LINE}`, color: wine }}>
        <ServiceIcon icon={service.icon} name={service.name} className="h-[18px] w-[18px]" strokeWidth={1.4} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-3">
          <h3 className="shrink-0 text-[15px] uppercase tracking-[0.12em]" style={{ fontFamily: CAPS, maxWidth: "70%" }}>{service.name}</h3>
          <span aria-hidden="true" className="min-w-[24px] flex-1 translate-y-[-4px]" style={{ borderBottom: `1px dotted ${BRASS}` }} />
          <span className="shrink-0 text-right italic" style={{ color: price ? wine : MUTED }}>{price ? price.amount : "Ask us"}</span>
        </div>
        {(service.description || price?.unit) && (
          <p className="mt-1 text-[16px] italic leading-snug" style={{ color: MUTED }}>
            {service.description}
            {price?.unit && <span style={{ color: BRASS_TEXT }}>{service.description ? " — " : ""}from {price.amount} {price.unit}</span>}
          </p>
        )}
        {cta && (
          <a href={cta.href} target={cta.target} rel={cta.rel} className="mt-2 inline-flex items-center gap-1.5 py-1 text-[11px] uppercase tracking-[0.22em]" style={{ fontFamily: CAPS, color: wine }} aria-label={`Arrange ${service.name}`}>
            {cta.kind === "whatsapp" && <WhatsAppIcon size={13} />} Arrange <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        )}
      </div>
    </Reveal>
  );
}

function ServicesPage({ wine }) {
  const { site } = useSite();
  return (
    <>
      <PageHead caps={site.hotel.name} title="Services" wine={wine} />
      <Reveal className="mx-auto max-w-2xl px-6 pt-10 text-center">
        <p className="text-[22px] italic leading-snug" style={{ color: MUTED }}>Whatever you wish for during your stay, simply write to us — the house will see to it.</p>
      </Reveal>
      <Services wine={wine} page />
      <Cta wine={wine} />
    </>
  );
}

function RoomCard({ room, wine, delay }) {
  const cta = useBookCta(room.name);
  const price = formatPrice(room.price, room.currency);
  const meta = [
    Number(room.maxOccupancy) > 0 && `For up to ${room.maxOccupancy} guests`,
    room.bedConfig,
  ].filter(Boolean).join(" · ");
  return (
    <Reveal delay={delay} className="bs-hover text-center">
      <Arch src={room.image} alt={room.name} ratio="4/5" sizes={SIZES.third} />
      <h3 className="mt-6 text-[22px] uppercase tracking-[0.1em]" style={{ fontFamily: CAPS }}>{room.name}</h3>
      {meta && <p className="mt-1 italic" style={{ color: MUTED }}>{meta}</p>}
      {price && <p className="mt-1 text-[20px]">from <span style={{ color: wine }}>{price}</span> <span className="italic" style={{ color: MUTED }}>a night</span></p>}
      {room.breakfastIncluded && <p className="mt-1 text-[15px] italic" style={{ color: MUTED }}>Breakfast included</p>}
      {cta && <a href={cta.href} target={cta.target} rel={cta.rel} className="mt-4 inline-block py-1 text-[12px] uppercase tracking-[0.24em]" style={{ fontFamily: CAPS, color: wine, borderBottom: `1px solid ${wine}` }}>Reserve this room</a>}
    </Reveal>
  );
}

/** Booking-first buttons; WhatsApp first without a booking page; never empty. */
function CtaButtons({ wine, className = "", rooms = false }) {
  const wa = useWhatsApp()();
  const book = useBooking();
  const plain = "inline-flex items-center px-7 py-3.5 text-[12px] uppercase tracking-[0.24em]";
  return (
    <div className={`flex flex-wrap gap-4 ${className}`}>
      {book && <Button {...book} wine={wine}>Book now <ArrowRight className="h-4 w-4" /></Button>}
      {wa && <Button href={wa} target="_blank" rel="noopener noreferrer" wine={wine} ghost={!!book}><WhatsAppIcon size={15} /> {book ? "WhatsApp" : "Reserve on WhatsApp"}</Button>}
      {!book && !wa && <PageLink page="contact" className={plain} style={{ fontFamily: CAPS, background: wine, color: PAPER }}>Write to us</PageLink>}
      {rooms && (!book || !wa) && <PageLink page="rooms" className={plain} style={{ fontFamily: CAPS, border: `1px solid ${INK}` }}>Our rooms</PageLink>}
    </div>
  );
}

function Cta({ wine }) {
  const { site } = useSite();
  const { md } = useBp();
  const book = useBooking();
  const wa = useWhatsApp()();
  return (
    <section className="mx-auto max-w-5xl px-6" style={{ paddingTop: md ? 130 : 72 }}>
      <Reveal className="text-center" style={{ border: `1px solid ${BRASS}`, outline: `1px solid ${BRASS}`, outlineOffset: 6, padding: md ? 64 : 28 }}>
        <Caps>Reservations</Caps>
        <Heading center className="mt-4" size={38}>We would be delighted to welcome you</Heading>
        <p className="mx-auto mt-5 max-w-xl italic" style={{ color: MUTED }}>
          {book ? "Reserve directly with the house for our best rate — or write to us with any wish, and we shall reply personally." : wa ? "Write to us on WhatsApp with your dates, and we shall reply personally — usually within minutes." : "Write to us with your dates, and we shall reply personally."}
        </p>
        <CtaButtons wine={wine} className="mt-10 justify-center" />
        <p className="mt-6 text-sm italic" style={{ color: MUTED }}>{site.hotel.name}</p>
      </Reveal>
    </section>
  );
}

function PageHead({ caps, title, wine }) {
  const { md } = useBp();
  return (
    <section className="mx-auto max-w-4xl px-6 text-center" style={{ paddingTop: md ? 200 : 110 }}>
      <Reveal>
        <Crest wine={wine} />
        <Caps className="mt-6">{caps}</Caps>
        <RevealText text={title} className="mt-4 font-normal uppercase tracking-[0.06em]" style={{ fontFamily: CAPS, fontSize: md ? 64 : 36 }} delay={0.15} stagger={0.1} />
        <Ornament className="mt-6" />
      </Reveal>
    </section>
  );
}

function Rooms({ wine }) {
  const { site } = useSite();
  const { md } = useBp();
  const wa = useWhatsApp();
  const book = useBooking();
  const rooms = useRooms();
  return (
    <>
      <PageHead caps={site.hotel.name} title="Rooms & Suites" wine={wine} />
      <section className="mx-auto max-w-6xl px-6">
        {rooms.length === 0 && (
          <Reveal className="mx-auto max-w-2xl pt-14 text-center">
            <p className="text-[22px] italic leading-snug" style={{ color: MUTED }}>Our chambers are being readied for their portraits. Write to us with your dates and we shall suggest the perfect room.</p>
            <CtaButtons wine={wine} className="mt-10 justify-center" />
          </Reveal>
        )}
        {rooms.map((r, i) => {
          const price = formatPrice(r.price, r.currency);
          const link = wa(r.name);
          return (
            <div key={r.id || i} className={md ? "grid grid-cols-12 items-center gap-14" : "space-y-8"} style={{ paddingTop: md ? 100 : 56 }}>
              <Reveal className={md ? `col-span-5 ${i % 2 ? "order-2" : ""}` : ""}><Arch src={r.image} alt={r.name} ratio="4/5" sizes="(min-width: 820px) 40vw, 100vw" /></Reveal>
              <Reveal delay={0.08} className={md ? "col-span-7" : ""}>
                <Caps>Chamber {["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"][i] || i + 1}</Caps>
                <Heading className="mt-3" size={40}>{r.name}</Heading>
                {r.description && <p className="mt-5 text-[20px] leading-[1.7]" style={{ color: MUTED }}>{r.description}</p>}
                <ul className="mt-6 space-y-1 italic">
                  {Number(r.maxOccupancy) > 0 && <li><span aria-hidden="true">❦ </span>For up to {r.maxOccupancy} guests</li>}
                  {r.bedConfig && <li><span aria-hidden="true">❦ </span>{r.bedConfig}</li>}
                  {Number(r.sizeSqm) > 0 && <li><span aria-hidden="true">❦ </span>{r.sizeSqm} square metres</li>}
                  {r.breakfastIncluded && <li><span aria-hidden="true">❦ </span>Breakfast is included</li>}
                  {r.amenities?.length > 0 && <li><span aria-hidden="true">❦ </span>{r.amenities.join(", ")}</li>}
                </ul>
                <div className="mt-8 flex flex-wrap items-center gap-5 pt-6" style={{ borderTop: `1px solid ${LINE}` }}>
                  {price && <p className="text-2xl italic"><span className="text-base" style={{ color: MUTED }}>from </span>{price} <span className="text-base" style={{ color: MUTED }}>per night</span></p>}
                  {book && <Button {...book} wine={wine}>Reserve</Button>}
                  {link && (book
                    ? <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 italic underline underline-offset-4" style={{ color: wine }}><WhatsAppIcon size={14} /> or ask on WhatsApp</a>
                    : <Button href={link} target="_blank" rel="noopener noreferrer" wine={wine}><WhatsAppIcon size={15} /> Reserve</Button>)}
                </div>
              </Reveal>
            </div>
          );
        })}
      </section>
      <Cta wine={wine} />
    </>
  );
}

function Gallery({ wine, onPhoto }) {
  const { site } = useSite();
  const { md, lg } = useBp();
  const gallery = useGallery();
  return (
    <>
      <PageHead caps={site.hotel.name} title="The Gallery" wine={wine} />
      {gallery.length === 0 && <p className="mx-auto max-w-md px-6 pt-14 text-center italic" style={{ color: MUTED }}>Photographs of the house are on their way.</p>}
      <section className={`mx-auto grid max-w-6xl px-6 ${md ? "gap-8" : "gap-4"} ${lg ? "grid-cols-3" : "grid-cols-2"}`} style={{ paddingTop: md ? 80 : 48 }}>
        {gallery.map((g, i) => (
          <Reveal key={g.url + i} delay={(i % 3) * 0.06}>
            <button type="button" onClick={() => onPhoto(i)} aria-label={`Open photo${g.caption ? `: ${g.caption}` : ` ${i + 1}`}`} className={`group block w-full text-center ${md ? "p-3" : "p-2"}`} style={{ border: `1px solid ${LINE}`, background: "rgba(255,255,255,0.45)" }}>
              <div className="overflow-hidden"><Img src={g.url} alt={g.caption || ""} sizes={SIZES.thumb} className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105" /></div>
              <span className={`mt-3 block truncate italic ${md ? "" : "text-[14px]"}`} style={{ color: MUTED }}>{g.caption || `Plate ${i + 1}`}</span>
            </button>
          </Reveal>
        ))}
      </section>
    </>
  );
}

function About({ wine }) {
  const { site } = useSite();
  const { md } = useBp();
  const c = site.content;
  return (
    <>
      <PageHead caps="Our story" title={c.about?.heading || `About ${site.hotel.name}`} wine={wine} />
      <section className={`mx-auto max-w-6xl px-6 ${md ? "grid grid-cols-12 gap-14" : "space-y-10"}`} style={{ paddingTop: md ? 80 : 48 }}>
        {(c.about?.image || c.hero?.image) && <Reveal className={md ? "col-span-5" : "mx-auto max-w-sm"}><Arch src={c.about?.image || c.hero?.image} alt={site.hotel.name} ratio="3/4" sizes="(min-width: 820px) 40vw, 100vw" /></Reveal>}
        <Reveal delay={0.08} className={md ? (c.about?.image || c.hero?.image ? "col-span-7" : "col-span-12 mx-auto max-w-3xl") : ""}>
          {paragraphs(c.about?.body).map((p, i) => <p key={i} className="mb-6 text-[20px] leading-[1.75]" style={{ color: i ? MUTED : INK }}>{p}</p>)}
          {(site.hotel.checkIn || site.hotel.checkOut) && (
            <div className="mt-8 grid grid-cols-2 text-center" style={{ border: `1px solid ${LINE}` }}>
              <div className="p-5" style={{ borderRight: `1px solid ${LINE}` }}><Caps>Arrival</Caps><p className="mt-2 text-3xl italic">{site.hotel.checkIn ? `from ${site.hotel.checkIn}` : "flexible"}</p></div>
              <div className="p-5"><Caps>Departure</Caps><p className="mt-2 text-3xl italic">{site.hotel.checkOut ? `by ${site.hotel.checkOut}` : "flexible"}</p></div>
            </div>
          )}
          {c.amenities?.length > 0 && <p className="mt-8 italic leading-relaxed" style={{ color: MUTED }}>{c.amenities.join(" · ")}</p>}
        </Reveal>
      </section>
      <Location wine={wine} />
    </>
  );
}

function Location({ wine }) {
  const { site } = useSite();
  const { md } = useBp();
  const loc = site.content.location || {};
  return (
    <section className="mx-auto max-w-6xl px-6" style={{ paddingTop: md ? 120 : 64 }}>
      <Reveal className="text-center"><Caps>Location</Caps><Heading center className="mt-4" size={38}>How to find us</Heading><Ornament className="mt-5" /></Reveal>
      <div className={`mt-12 ${md ? "grid grid-cols-12 items-center gap-10" : "space-y-6"}`}>
        <Reveal className={md ? "col-span-4" : ""}>
          {loc.address && <p className="flex gap-3 text-[20px]"><MapPin className="mt-1 h-5 w-5 shrink-0" style={{ color: wine }} />{loc.address}</p>}
          {loc.directions && <p className="mt-4 italic leading-relaxed" style={{ color: MUTED }}>{loc.directions}</p>}
          <a href={directionsHref(loc.mapQuery || loc.address || site.hotel.name)} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 py-1 text-[12px] uppercase tracking-[0.24em]" style={{ fontFamily: CAPS, color: wine, borderBottom: `1px solid ${wine}` }}>
            Get directions <ArrowRight className="h-4 w-4" />
          </a>
        </Reveal>
        <Reveal delay={0.08} className={md ? "col-span-8" : ""}>
          <div className="p-2" style={{ border: `1px solid ${BRASS}` }}><MapFrame title={`Map showing ${site.hotel.name}`} query={loc.mapQuery || loc.address || site.hotel.name} className={`${md ? "h-[400px]" : "h-[300px]"} w-full`} style={{ filter: "sepia(0.35)" }} /></div>
        </Reveal>
      </div>
    </section>
  );
}

function Contact({ wine }) {
  const { site } = useSite();
  const { md } = useBp();
  const c = site.content.contact || {};
  const wa = useWhatsApp()();
  const f = useEnquiry();
  const input = "w-full bg-transparent px-1 py-3 text-[19px] outline-none placeholder:italic placeholder:text-[#7a6654]";
  const st = { borderBottom: `1px solid ${BRASS}` };
  return (
    <>
      <PageHead caps="Correspondence" title="Contact us" wine={wine} />
      <section className={`mx-auto max-w-6xl px-6 ${md ? "grid grid-cols-12 gap-14" : "space-y-12"}`} style={{ paddingTop: md ? 80 : 48 }}>
        <Reveal className={md ? "col-span-5" : ""}>
          <p className="text-[22px] italic leading-snug">Our door — and our WhatsApp — are always open. Write to us with your dates and wishes.</p>
          <div className="mt-8 space-y-5">
            {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4"><span className="flex h-11 w-11 items-center justify-center rounded-full text-white" style={{ background: "#25D366" }}><WhatsAppIcon size={20} /></span><span><Caps>WhatsApp</Caps><span className="text-[19px]">+{site.whatsapp}</span></span></a>}
            {c.phone && <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="flex items-center gap-4"><span className="flex h-11 w-11 items-center justify-center rounded-full" style={{ border: `1px solid ${BRASS}`, color: wine }}><Phone className="h-5 w-5" /></span><span><Caps>Telephone</Caps><span className="text-[19px]">{c.phone}</span></span></a>}
            {c.email && <a href={`mailto:${c.email}`} className="flex items-center gap-4"><span className="flex h-11 w-11 items-center justify-center rounded-full" style={{ border: `1px solid ${BRASS}`, color: wine }}><Mail className="h-5 w-5" /></span><span><Caps>Email</Caps><span className="text-[19px]">{c.email}</span></span></a>}
          </div>
        </Reveal>
        <Reveal delay={0.08} className={md ? "col-span-7" : ""}>
          <form onSubmit={f.submit} style={{ border: `1px solid ${BRASS}`, outline: `1px solid ${BRASS}`, outlineOffset: 5, padding: md ? 44 : 22, background: "rgba(255,255,255,0.35)" }}>
            <Heading size={30}>A letter to the house</Heading>
            <div className="mt-6 space-y-3">
              <input className={input} style={st} aria-label="Your name" autoComplete="name" placeholder="Your name" value={f.v.name} onChange={f.set("name")} />
              <div className="grid grid-cols-2 gap-5">
                <input type="date" className={input} style={st} value={f.v.checkIn} onChange={f.set("checkIn")} aria-label="Arrival" />
                <input type="date" className={input} style={st} value={f.v.checkOut} onChange={f.set("checkOut")} aria-label="Departure" />
              </div>
              <input className={input} style={st} aria-label="Number of guests" inputMode="numeric" placeholder="Number of guests" value={f.v.guests} onChange={f.set("guests")} />
              <textarea className={input} style={st} rows={3} aria-label="Your wishes" placeholder="Your wishes" value={f.v.message} onChange={f.set("message")} />
            </div>
            <button type="submit" className="mt-8 inline-flex items-center gap-2 px-7 py-3.5 text-[12px] uppercase tracking-[0.24em]" style={{ fontFamily: CAPS, background: wine, color: PAPER }}>Send via {f.via} <ArrowRight className="h-4 w-4" /></button>
          </form>
        </Reveal>
      </section>
      <Location wine={wine} />
    </>
  );
}

function Footer({ wine }) {
  const { site } = useSite();
  const pages = useNavPages();
  const { md } = useBp();
  return (
    <footer className="text-center" style={{ marginTop: md ? 130 : 72, background: INK, color: "rgba(242,233,216,0.8)" }}>
      <div className="mx-auto max-w-4xl px-6" style={{ paddingTop: 72, paddingBottom: 40 }}>
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full text-2xl" style={{ border: "1px solid #e3c48e", color: "#e3c48e", fontFamily: CAPS }}>{(site.hotel.name || "H").charAt(0)}</span>
        <p className="mt-5 text-2xl uppercase tracking-[0.2em] text-[#f2e9d8]" style={{ fontFamily: CAPS }}>{site.hotel.name}</p>
        {site.content.location?.address && <p className="mt-2 italic">{site.content.location.address}</p>}
        {(site.content.contact?.phone || site.content.contact?.email) && <p className="mt-1 italic">{[site.content.contact?.phone, site.content.contact?.email].filter(Boolean).join("  ·  ")}</p>}
        <nav className="mt-8 flex flex-wrap justify-center gap-6">
          {pages.map((p) => <PageLink key={p.id} page={p.id} className="text-[12px] uppercase tracking-[0.24em] transition-colors hover:text-white" style={{ fontFamily: CAPS }}>{p.label}</PageLink>)}
        </nav>
        <Ornament color="#e3c48e" className="mt-10" />
        <p className="mt-6 text-sm italic" style={{ color: "rgba(242,233,216,0.65)" }}>© {year()} {site.hotel.name} · Website by <a href="https://botlify.site" className="underline" style={{ color: wine === INK ? "#fff" : "rgba(242,233,216,0.7)" }}>Botlify</a></p>
      </div>
    </footer>
  );
}
