/**
 * Heritage — warm and classic. Paper-textured cream, deep burgundy and brass,
 * arched window frames, ornamental dividers and a monogram crest. Cinzel
 * capitals over EB Garamond. Feels like a historic manor or colonial hotel.
 */
import { ArrowRight, Mail, MapPin, Menu, Phone, X } from "lucide-react";
import {
  Img, Lightbox, MapFrame, PAGES, PageLink, Reveal, WhatsAppFab, WhatsAppIcon,
  formatPrice, paragraphs, useBooking, useBp, useEnquiry, useFonts, useFrameHeight,
  useGallery, useLightbox, useMenu, useScrolled, useSite, useWhatsApp, year,
} from "../shared";

const CAPS = "'Cinzel', Georgia, serif";
const BODY = "'EB Garamond', Georgia, serif";
const PAPER = "#f2e9d8";
const INK = "#2a1c13";
const MUTED = "#6e5b4b";
const BRASS = "#a8834a";
const LINE = "rgba(168,131,74,0.35)";
// Subtle paper grain — an inline SVG noise tile, no image request.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.35 0 0 0 0 0.25 0 0 0 0 0.15 0 0 0 0.07 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function Heritage() {
  useFonts("heritage", "family=Cinzel:wght@400;500;600;700&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500");
  const { site, page } = useSite();
  const wine = site.accent || "#7a2b25";
  const gallery = useGallery();
  const lb = useLightbox();
  return (
    <div style={{ fontFamily: BODY, backgroundColor: PAPER, backgroundImage: GRAIN, color: INK }} className="min-h-full text-[18px] antialiased">
      <Nav wine={wine} />
      <main>
        {page === "home" && <Home wine={wine} onPhoto={lb.open} />}
        {page === "rooms" && <Rooms wine={wine} />}
        {page === "gallery" && <Gallery wine={wine} onPhoto={lb.open} />}
        {page === "about" && <About wine={wine} />}
        {page === "contact" && <Contact wine={wine} />}
      </main>
      <Footer wine={wine} />
      <WhatsAppFab />
      <Lightbox images={gallery} index={lb.index} onClose={lb.close} onIndex={lb.setIndex} />
    </div>
  );
}

function Ornament({ color = BRASS, className = "" }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden="true">
      <span className="h-px w-16" style={{ background: color }} />
      <svg width="34" height="14" viewBox="0 0 34 14" fill="none" stroke={color} strokeWidth="1.1">
        <path d="M1 7h8M25 7h8" />
        <path d="M17 1l5 6-5 6-5-6 5-6z" />
        <circle cx="17" cy="7" r="1.4" fill={color} />
      </svg>
      <span className="h-px w-16" style={{ background: color }} />
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
  <p className={`text-[12px] uppercase tracking-[0.32em] ${className}`} style={{ fontFamily: CAPS, color: BRASS, ...style }}>{children}</p>
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
    <a href={href} {...rest} className="inline-flex items-center gap-2 px-7 py-3.5 text-[12px] uppercase tracking-[0.24em] transition hover:opacity-90" style={{ fontFamily: CAPS, background: ghost ? "transparent" : wine, color: ghost ? INK : PAPER, border: `1px solid ${ghost ? INK : wine}`, boxShadow: ghost ? "none" : `inset 0 0 0 3px ${wine}, inset 0 0 0 4px rgba(242,233,216,0.45)` }}>
      {children}
    </a>
  );
}

function Nav({ wine }) {
  const { site, page } = useSite();
  const { md } = useBp();
  const scrolled = useScrolled(80);
  const [open, setOpen] = useMenu();
  const c = site.content.contact || {};
  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-40 transition-shadow" style={{ backgroundColor: PAPER, backgroundImage: GRAIN, boxShadow: scrolled ? "0 6px 24px -14px rgba(42,28,19,0.5)" : "none" }}>
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
                {PAGES.map((p, i) => (
                  <span key={p.id} className="flex items-center gap-2">
                    {i > 0 && <span style={{ color: BRASS }}>·</span>}
                    <PageLink page={p.id} className="px-2 text-[12px] uppercase tracking-[0.24em] transition hover:opacity-60" style={{ fontFamily: CAPS, color: page === p.id ? wine : INK }}>{p.label}</PageLink>
                  </span>
                ))}
              </nav>
            </div>
          ) : (
            <div className="flex h-16 items-center justify-between">
              <PageLink page="home" className="text-lg uppercase tracking-[0.16em]" style={{ fontFamily: CAPS }}>{site.hotel.name}</PageLink>
              <button type="button" onClick={() => setOpen(!open)} aria-label="Menu" style={{ color: wine }}>{open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}</button>
            </div>
          )}
        </div>
      </header>
      {open && !md && (
        <div className="fixed inset-0 z-30 flex flex-col items-center justify-center gap-5" style={{ backgroundColor: PAPER, backgroundImage: GRAIN }}>
          <Crest wine={wine} size={64} />
          {PAGES.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.05} y={10}>
              <PageLink page={p.id} className="text-2xl uppercase tracking-[0.2em]" style={{ fontFamily: CAPS, color: page === p.id ? wine : INK }}>{p.label}</PageLink>
            </Reveal>
          ))}
          <Ornament className="mt-4" />
        </div>
      )}
    </>
  );
}

function Arch({ src, alt = "", className = "", ratio = "3/4" }) {
  return (
    <div className={`relative p-2 ${className}`} style={{ border: `1px solid ${BRASS}`, borderRadius: "999px 999px 4px 4px" }}>
      <div className="overflow-hidden" style={{ borderRadius: "999px 999px 2px 2px" }}>
        <Img src={src} alt={alt} className="w-full object-cover transition duration-[1200ms] hover:scale-105" style={{ aspectRatio: ratio }} />
      </div>
    </div>
  );
}

function Home({ wine, onPhoto }) {
  const { site } = useSite();
  const { md, lg } = useBp();
  const h = useFrameHeight(0.9, 560);
  const c = site.content;
  const wa = useWhatsApp()();
  const book = useBooking();
  const gallery = useGallery();
  const ps = paragraphs(c.about.body);
  return (
    <>
      <section className="mx-auto max-w-6xl px-6" style={{ paddingTop: md ? 170 : 96 }}>
        <div className={md ? "grid grid-cols-12 items-center gap-12" : "space-y-10"} style={{ minHeight: md ? h - 170 : undefined }}>
          <Reveal className={md ? "col-span-6" : "text-center"}>
            <Caps>{[site.hotel.typeLabel, site.hotel.city].filter(Boolean).join(" · ")}</Caps>
            <h1 className="mt-6 font-normal uppercase leading-[1.05] tracking-[0.04em]" style={{ fontFamily: CAPS, fontSize: lg ? 72 : md ? 58 : 38 }}>{c.hero.title || site.hotel.name}</h1>
            <Ornament className={`mt-6 ${md ? "justify-start" : ""}`} />
            {c.hero.subtitle && <p className="mt-6 text-[22px] italic leading-snug" style={{ color: MUTED }}>{c.hero.subtitle}</p>}
            <div className={`mt-10 flex flex-wrap gap-4 ${md ? "" : "justify-center"}`}>
              {wa && <Button href={wa} target="_blank" rel="noopener noreferrer" wine={wine}><WhatsAppIcon size={15} /> Reserve on WhatsApp</Button>}
              {book ? <Button {...book} wine={wine} ghost>Check availability</Button> : <PageLink page="rooms" className="inline-flex items-center px-7 py-3.5 text-[12px] uppercase tracking-[0.24em]" style={{ fontFamily: CAPS, border: `1px solid ${INK}` }}>Our rooms</PageLink>}
            </div>
          </Reveal>
          <Reveal delay={0.1} className={md ? "col-span-6" : ""}>
            <Arch src={c.hero.image} alt={site.hotel.name} ratio={md ? "4/5" : "3/4"} />
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 text-center" style={{ paddingTop: md ? 130 : 72 }}>
        <Reveal>
          <Crest wine={wine} />
          <Heading center className="mt-6">{c.about.heading}</Heading>
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

      <section className="mx-auto max-w-6xl px-6" style={{ paddingTop: md ? 130 : 72 }}>
        <Reveal className="text-center"><Caps>Accommodation</Caps><Heading center className="mt-4">Our rooms</Heading><Ornament className="mt-5" /></Reveal>
        <div className={`mt-14 grid gap-10 ${lg ? "grid-cols-3" : md ? "grid-cols-2" : "grid-cols-1"}`}>
          {site.rooms.slice(0, 3).map((r, i) => <RoomCard key={r.id} room={r} wine={wine} delay={i * 0.08} />)}
        </div>
        <div className="mt-12 text-center"><PageLink page="rooms" className="italic underline underline-offset-4" style={{ color: wine }}>View all rooms</PageLink></div>
      </section>

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

      {gallery.length > 0 && (
        <section className="mx-auto max-w-6xl px-6" style={{ paddingTop: md ? 130 : 72 }}>
          <Reveal className="text-center"><Caps>Gallery</Caps><Heading center className="mt-4">Scenes from the house</Heading><Ornament className="mt-5" /></Reveal>
          <div className={`mt-14 grid gap-6 ${md ? "grid-cols-3" : "grid-cols-2"}`}>
            {gallery.slice(0, 6).map((g, i) => (
              <Reveal key={g.url + i} delay={(i % 3) * 0.06} style={{ transform: `rotate(${[-1.2, 0.8, -0.6, 1, -0.9, 0.5][i % 6]}deg)` }}>
                <button type="button" onClick={() => onPhoto(i)} className="block w-full bg-white p-3 pb-4 text-center shadow-[0_10px_30px_-12px_rgba(42,28,19,0.45)]">
                  <Img src={g.url} alt={g.caption} className="aspect-square w-full object-cover" />
                  <span className="mt-3 block text-[15px] italic" style={{ color: MUTED }}>{g.caption || site.hotel.name}</span>
                </button>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {c.testimonials?.length > 0 && (
        <section className="mx-auto max-w-3xl px-6 text-center" style={{ paddingTop: md ? 130 : 72 }}>
          <Caps>From our guestbook</Caps>
          {c.testimonials.slice(0, 2).map((t, i) => (
            <Reveal key={i} className="mt-10">
              <p className="text-[28px] italic leading-snug">“{t.quote}”</p>
              <p className="mt-4 text-[12px] uppercase tracking-[0.26em]" style={{ fontFamily: CAPS, color: MUTED }}>{t.author}{t.source ? ` · ${t.source}` : ""}</p>
              {i < Math.min(2, c.testimonials.length) - 1 && <Ornament className="mt-10" />}
            </Reveal>
          ))}
        </section>
      )}

      <Cta wine={wine} />
    </>
  );
}

function RoomCard({ room, wine, delay }) {
  const wa = useWhatsApp()(room.name);
  const price = formatPrice(room.price, room.currency);
  return (
    <Reveal delay={delay} className="text-center">
      <Arch src={room.image} alt={room.name} ratio="4/5" />
      <h3 className="mt-6 text-[22px] uppercase tracking-[0.1em]" style={{ fontFamily: CAPS }}>{room.name}</h3>
      <p className="mt-1 italic" style={{ color: MUTED }}>For up to {room.maxOccupancy} guests{price ? ` · from ${price} a night` : ""}</p>
      {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-[12px] uppercase tracking-[0.24em]" style={{ fontFamily: CAPS, color: wine, borderBottom: `1px solid ${wine}` }}>Reserve this room</a>}
    </Reveal>
  );
}

function Cta({ wine }) {
  const { site } = useSite();
  const { md } = useBp();
  const wa = useWhatsApp()();
  const book = useBooking();
  return (
    <section className="mx-auto max-w-5xl px-6" style={{ paddingTop: md ? 130 : 72 }}>
      <Reveal className="text-center" style={{ border: `1px solid ${BRASS}`, outline: `1px solid ${BRASS}`, outlineOffset: 6, padding: md ? 64 : 28 }}>
        <Caps>Reservations</Caps>
        <Heading center className="mt-4" size={38}>We would be delighted to welcome you</Heading>
        <p className="mx-auto mt-5 max-w-xl italic" style={{ color: MUTED }}>Write to us on WhatsApp with your dates, and we shall reply personally — usually within minutes.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          {wa && <Button href={wa} target="_blank" rel="noopener noreferrer" wine={wine}><WhatsAppIcon size={15} /> Reserve on WhatsApp</Button>}
          {book && <Button {...book} wine={wine} ghost>Book online</Button>}
        </div>
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
        <h1 className="mt-4 font-normal uppercase tracking-[0.06em]" style={{ fontFamily: CAPS, fontSize: md ? 64 : 38 }}>{title}</h1>
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
  return (
    <>
      <PageHead caps={site.hotel.name} title="Rooms & Suites" wine={wine} />
      <section className="mx-auto max-w-6xl px-6">
        {site.rooms.map((r, i) => {
          const price = formatPrice(r.price, r.currency);
          const link = wa(r.name);
          return (
            <div key={r.id} className={md ? "grid grid-cols-12 items-center gap-14" : "space-y-8"} style={{ paddingTop: md ? 100 : 56 }}>
              <Reveal className={md ? `col-span-5 ${i % 2 ? "order-2" : ""}` : ""}><Arch src={r.image} alt={r.name} ratio="4/5" /></Reveal>
              <Reveal delay={0.08} className={md ? "col-span-7" : ""}>
                <Caps>Chamber {["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][i] || i + 1}</Caps>
                <Heading className="mt-3" size={40}>{r.name}</Heading>
                <p className="mt-5 text-[20px] leading-[1.7]" style={{ color: MUTED }}>{r.description}</p>
                <ul className="mt-6 space-y-1 italic">
                  <li>❦ For up to {r.maxOccupancy} guests</li>
                  {r.bedConfig && <li>❦ {r.bedConfig}</li>}
                  {r.sizeSqm && <li>❦ {r.sizeSqm} square metres</li>}
                  {r.breakfastIncluded && <li>❦ Breakfast is included</li>}
                  {r.amenities?.length > 0 && <li>❦ {r.amenities.join(", ")}</li>}
                </ul>
                <div className="mt-8 flex flex-wrap items-center gap-5 pt-6" style={{ borderTop: `1px solid ${LINE}` }}>
                  {price && <p className="text-2xl italic">{price} <span className="text-base" style={{ color: MUTED }}>per night</span></p>}
                  {link && <Button href={link} target="_blank" rel="noopener noreferrer" wine={wine}><WhatsAppIcon size={15} /> Reserve</Button>}
                  {book && <a {...book} className="italic underline underline-offset-4" style={{ color: wine }}>or book online</a>}
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
      <section className={`mx-auto grid max-w-6xl gap-8 px-6 ${lg ? "grid-cols-3" : md ? "grid-cols-2" : "grid-cols-1"}`} style={{ paddingTop: md ? 80 : 48 }}>
        {gallery.map((g, i) => (
          <Reveal key={g.url + i} delay={(i % 3) * 0.06}>
            <button type="button" onClick={() => onPhoto(i)} className="block w-full p-3 text-center" style={{ border: `1px solid ${LINE}`, background: "rgba(255,255,255,0.45)" }}>
              <div className="overflow-hidden"><Img src={g.url} alt={g.caption} className="aspect-[4/3] w-full object-cover transition duration-700 hover:scale-105" /></div>
              <span className="mt-3 block italic" style={{ color: MUTED }}>{g.caption || `Plate ${i + 1}`}</span>
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
      <PageHead caps="Our story" title={c.about.heading || `About ${site.hotel.name}`} wine={wine} />
      <section className={`mx-auto max-w-6xl px-6 ${md ? "grid grid-cols-12 gap-14" : "space-y-10"}`} style={{ paddingTop: md ? 80 : 48 }}>
        <Reveal className={md ? "col-span-5" : ""}><Arch src={c.about.image} ratio="3/4" /></Reveal>
        <Reveal delay={0.08} className={md ? "col-span-7" : ""}>
          {paragraphs(c.about.body).map((p, i) => <p key={i} className="mb-6 text-[20px] leading-[1.75]" style={{ color: i ? MUTED : INK }}>{p}</p>)}
          <div className="mt-8 grid grid-cols-2 text-center" style={{ border: `1px solid ${LINE}` }}>
            <div className="p-5" style={{ borderRight: `1px solid ${LINE}` }}><Caps>Arrival</Caps><p className="mt-2 text-3xl italic">from {site.hotel.checkIn}</p></div>
            <div className="p-5"><Caps>Departure</Caps><p className="mt-2 text-3xl italic">by {site.hotel.checkOut}</p></div>
          </div>
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
        </Reveal>
        <Reveal delay={0.08} className={md ? "col-span-8" : ""}>
          <div className="p-2" style={{ border: `1px solid ${BRASS}` }}><MapFrame query={loc.mapQuery || loc.address || site.hotel.name} className="h-[400px] w-full" style={{ filter: "sepia(0.35)" }} /></div>
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
  const input = "w-full bg-transparent px-1 py-3 text-[19px] outline-none placeholder:italic placeholder:text-[#9b8775]";
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
              <input className={input} style={st} placeholder="Your name" value={f.v.name} onChange={f.set("name")} />
              <div className="grid grid-cols-2 gap-5">
                <input type="date" className={input} style={st} value={f.v.checkIn} onChange={f.set("checkIn")} aria-label="Arrival" />
                <input type="date" className={input} style={st} value={f.v.checkOut} onChange={f.set("checkOut")} aria-label="Departure" />
              </div>
              <input className={input} style={st} placeholder="Number of guests" value={f.v.guests} onChange={f.set("guests")} />
              <textarea className={input} style={st} rows={3} placeholder="Your wishes" value={f.v.message} onChange={f.set("message")} />
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
  const { md } = useBp();
  return (
    <footer className="text-center" style={{ marginTop: md ? 130 : 72, background: INK, color: "rgba(242,233,216,0.8)" }}>
      <div className="mx-auto max-w-4xl px-6" style={{ paddingTop: 72, paddingBottom: 40 }}>
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full text-2xl" style={{ border: "1px solid #e3c48e", color: "#e3c48e", fontFamily: CAPS }}>{(site.hotel.name || "H").charAt(0)}</span>
        <p className="mt-5 text-2xl uppercase tracking-[0.2em] text-[#f2e9d8]" style={{ fontFamily: CAPS }}>{site.hotel.name}</p>
        <p className="mt-2 italic">{site.content.location?.address}</p>
        <nav className="mt-8 flex flex-wrap justify-center gap-6">
          {PAGES.map((p) => <PageLink key={p.id} page={p.id} className="text-[12px] uppercase tracking-[0.24em] hover:text-white" style={{ fontFamily: CAPS }}>{p.label}</PageLink>)}
        </nav>
        <Ornament color="#e3c48e" className="mt-10" />
        <p className="mt-6 text-sm italic" style={{ color: "rgba(242,233,216,0.5)" }}>© {year()} {site.hotel.name} · Website by <a href="https://botlify.site" className="underline" style={{ color: wine === INK ? "#fff" : "rgba(242,233,216,0.7)" }}>Botlify</a></p>
      </div>
    </footer>
  );
}
