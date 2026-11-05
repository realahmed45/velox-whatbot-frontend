/**
 * Coastal — airy, light and editorial. Sand background, sea-blue accent,
 * Cormorant Garamond headlines over Jost. Feels like a boutique beach hotel.
 */
import { useState } from "react";
import { ArrowRight, BedDouble, Mail, MapPin, Menu, Phone, Ruler, Users, X } from "lucide-react";
import {
  Img, Lightbox, MapFrame, PAGES, PageLink, Reveal, WhatsAppFab, WhatsAppIcon,
  formatPrice, paragraphs, useBooking, useBp, useEnquiry, useFonts, useFrameHeight,
  useGallery, useLightbox, useMenu, useScrolled, useSite, useWhatsApp, year,
} from "../shared";

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS = "'Jost', system-ui, sans-serif";
const BG = "#f6f2ec";
const INK = "#1c2b33";
const MUTED = "#6a777d";
const LINE = "#e2dacd";

export default function Coastal() {
  useFonts("coastal", "family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:wght@300;400;500;600");
  const { site, page } = useSite();
  const accent = site.accent || "#2f6f86";
  const gallery = useGallery();
  const lb = useLightbox();

  return (
    <div style={{ fontFamily: SANS, background: BG, color: INK }} className="min-h-full antialiased">
      <Nav accent={accent} />
      <main>
        {page === "home" && <Home accent={accent} onPhoto={lb.open} />}
        {page === "rooms" && <Rooms accent={accent} />}
        {page === "gallery" && <Gallery onPhoto={lb.open} />}
        {page === "about" && <About accent={accent} />}
        {page === "contact" && <Contact accent={accent} />}
      </main>
      <Footer accent={accent} />
      <WhatsAppFab />
      <Lightbox images={gallery} index={lb.index} onClose={lb.close} onIndex={lb.setIndex} />
    </div>
  );
}

function Nav({ accent }) {
  const { site, page } = useSite();
  const { md } = useBp();
  const scrolled = useScrolled(60);
  const [open, setOpen] = useMenu();
  const wa = useWhatsApp()();
  const overHero = page === "home" && !scrolled && !open;
  const fg = overHero ? "#fff" : INK;
  return (
    <>
      <header
        className="fixed left-0 right-0 top-0 z-40 transition-all duration-500"
        style={{
          background: overHero ? "transparent" : "rgba(246,242,236,0.92)",
          backdropFilter: overHero ? "none" : "blur(12px)",
          borderBottom: overHero ? "1px solid transparent" : `1px solid ${LINE}`,
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6" style={{ height: 76 }}>
          <PageLink page="home" style={{ fontFamily: SERIF, color: fg }} className="text-[26px] font-medium tracking-wide">
            {site.hotel.name}
          </PageLink>
          {md ? (
            <nav className="flex items-center gap-8">
              {PAGES.map((p) => (
                <PageLink
                  key={p.id}
                  page={p.id}
                  className="text-[13px] uppercase tracking-[0.18em] transition-opacity hover:opacity-60"
                  style={{ color: fg, borderBottom: page === p.id ? `1px solid ${fg}` : "1px solid transparent", paddingBottom: 2 }}
                >
                  {p.label}
                </PageLink>
              ))}
              {wa && (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full px-5 py-2.5 text-[13px] uppercase tracking-[0.14em] transition hover:opacity-90"
                  style={{ background: overHero ? "#fff" : accent, color: overHero ? INK : "#fff" }}
                >
                  Book now
                </a>
              )}
            </nav>
          ) : (
            <button type="button" onClick={() => setOpen(!open)} aria-label="Menu" style={{ color: fg }}>
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          )}
        </div>
      </header>
      {open && !md && (
        <div className="fixed inset-0 z-30 flex flex-col justify-center px-8" style={{ background: BG }}>
          {PAGES.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.05} y={12}>
              <PageLink page={p.id} className="block py-3 text-4xl" style={{ fontFamily: SERIF, color: page === p.id ? accent : INK }}>
                {p.label}
              </PageLink>
            </Reveal>
          ))}
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 self-start rounded-full px-6 py-3 text-white" style={{ background: accent }}>
              <WhatsAppIcon size={18} /> Book on WhatsApp
            </a>
          )}
        </div>
      )}
    </>
  );
}

function Eyebrow({ children, color = MUTED }) {
  return (
    <p className="text-[12px] uppercase tracking-[0.28em]" style={{ color }}>
      {children}
    </p>
  );
}

function H({ children, size = 52, className = "", style }) {
  const { md } = useBp();
  return (
    <h2
      className={`font-normal leading-[1.05] ${className}`}
      style={{ fontFamily: SERIF, fontSize: md ? size : size * 0.68, ...style }}
    >
      {children}
    </h2>
  );
}

function CtaButtons({ accent, light = false, room }) {
  const wa = useWhatsApp()(room);
  const book = useBooking();
  return (
    <div className="flex flex-wrap gap-3">
      {wa && (
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[13px] uppercase tracking-[0.16em] transition hover:-translate-y-0.5"
          style={{ background: light ? "#fff" : accent, color: light ? INK : "#fff" }}
        >
          <WhatsAppIcon size={16} /> Book on WhatsApp
        </a>
      )}
      {book && (
        <a
          {...book}
          className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[13px] uppercase tracking-[0.16em] transition hover:-translate-y-0.5"
          style={{ border: `1px solid ${light ? "rgba(255,255,255,0.7)" : INK}`, color: light ? "#fff" : INK }}
        >
          Check availability
        </a>
      )}
    </div>
  );
}

function Home({ accent, onPhoto }) {
  const { site } = useSite();
  const { md, lg } = useBp();
  const h = useFrameHeight(1, 600);
  const c = site.content;
  const gallery = useGallery();
  const place = [site.hotel.city, site.hotel.country].filter(Boolean).join(", ");
  return (
    <>
      <section className="relative flex items-end overflow-hidden" style={{ minHeight: h }}>
        <Img src={c.hero.image} alt={site.hotel.name} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(10,25,35,0.35) 0%, rgba(10,25,35,0.05) 40%, rgba(10,25,35,0.65) 100%)" }} />
        <div className="relative mx-auto w-full max-w-7xl px-6 pb-16 text-white" style={{ paddingBottom: md ? 96 : 56 }}>
          <Reveal>
            {place && <Eyebrow color="rgba(255,255,255,0.85)">{place}</Eyebrow>}
            <h1 className="mt-5 max-w-4xl font-normal leading-[0.95]" style={{ fontFamily: SERIF, fontSize: lg ? 104 : md ? 80 : 54 }}>
              {c.hero.title || site.hotel.name}
            </h1>
            {c.hero.subtitle && (
              <p className="mt-6 max-w-xl text-lg font-light leading-relaxed text-white/90" style={{ fontSize: md ? 20 : 17 }}>
                {c.hero.subtitle}
              </p>
            )}
            <div className="mt-10">
              <CtaButtons accent={accent} light />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6" style={{ paddingTop: md ? 128 : 72, paddingBottom: md ? 128 : 72 }}>
        <div className={md ? "grid grid-cols-12 items-center gap-16" : "space-y-10"}>
          <Reveal className={md ? "col-span-6" : ""}>
            <Eyebrow>Welcome</Eyebrow>
            <H className="mt-5">{c.about.heading}</H>
            <p className="mt-7 text-[17px] font-light leading-[1.85]" style={{ color: MUTED }}>
              {paragraphs(c.about.body)[0]}
            </p>
            <PageLink page="about" className="mt-8 inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.18em]" style={{ color: accent }}>
              Our story <ArrowRight className="h-4 w-4" />
            </PageLink>
          </Reveal>
          <Reveal className={md ? "col-span-6" : ""} delay={0.1}>
            <div className="relative">
              <div className="absolute -bottom-5 -left-5 h-full w-full" style={{ border: `1px solid ${accent}`, opacity: 0.35 }} />
              <Img src={c.about.image} alt="" className="relative aspect-[4/5] w-full object-cover" />
            </div>
          </Reveal>
        </div>
      </section>

      {c.highlights?.length > 0 && (
        <section style={{ borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}` }}>
          <div className={`mx-auto max-w-7xl px-6 ${md ? "grid grid-cols-3" : ""}`}>
            {c.highlights.slice(0, 3).map((x, i) => (
              <Reveal key={i} delay={i * 0.08} className="py-12" style={{ paddingLeft: md && i ? 40 : 0, paddingRight: md ? 40 : 0, borderLeft: md && i ? `1px solid ${LINE}` : "none", borderTop: !md && i ? `1px solid ${LINE}` : "none" }}>
                <p style={{ fontFamily: SERIF, color: accent }} className="text-2xl italic">0{i + 1}</p>
                <p className="mt-3 text-[26px]" style={{ fontFamily: SERIF }}>{x.title}</p>
                <p className="mt-2 font-light leading-relaxed" style={{ color: MUTED }}>{x.body}</p>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-6" style={{ paddingTop: md ? 128 : 72, paddingBottom: md ? 96 : 56 }}>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <Eyebrow>Stay with us</Eyebrow>
            <H className="mt-4">Rooms &amp; suites</H>
          </Reveal>
          <PageLink page="rooms" className="inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.18em]" style={{ color: accent }}>
            All rooms <ArrowRight className="h-4 w-4" />
          </PageLink>
        </div>
        <div className={`mt-14 grid gap-10 ${lg ? "grid-cols-3" : md ? "grid-cols-2" : "grid-cols-1"}`}>
          {site.rooms.slice(0, 3).map((r, i) => (
            <RoomCard key={r.id} room={r} accent={accent} delay={i * 0.08} />
          ))}
        </div>
      </section>

      {c.amenities?.length > 0 && (
        <section style={{ background: "#ece5da" }}>
          <div className={`mx-auto max-w-7xl px-6 ${md ? "grid grid-cols-12 gap-16" : ""}`} style={{ paddingTop: md ? 112 : 64, paddingBottom: md ? 112 : 64 }}>
            <Reveal className={md ? "col-span-4" : ""}>
              <Eyebrow>Amenities</Eyebrow>
              <H className="mt-4" size={44}>Everything you need, nothing you don't</H>
            </Reveal>
            <div className={`${md ? "col-span-8 grid grid-cols-2" : "mt-10 grid grid-cols-1"} gap-x-12`}>
              {c.amenities.map((a, i) => (
                <Reveal key={a + i} delay={(i % 6) * 0.04} y={10} className="flex items-center gap-4 py-4" style={{ borderBottom: `1px solid ${LINE}` }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
                  <span className="text-[17px] font-light">{a}</span>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {gallery.length > 0 && (
        <section style={{ paddingTop: md ? 128 : 72 }}>
          <Reveal className="mx-auto max-w-7xl px-6 text-center">
            <Eyebrow>Gallery</Eyebrow>
            <H className="mt-4">Moments from {site.hotel.name}</H>
          </Reveal>
          <div className={`mt-14 grid gap-2 px-2 ${md ? "grid-cols-4" : "grid-cols-2"}`}>
            {gallery.slice(0, md ? 5 : 4).map((g, i) => (
              <button key={g.url + i} type="button" onClick={() => onPhoto(i)} className={`group relative overflow-hidden ${md && i === 0 ? "col-span-2 row-span-2" : ""}`} style={{ aspectRatio: md && i === 0 ? "auto" : "1/1" }}>
                <Img src={g.url} alt={g.caption} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              </button>
            ))}
          </div>
          <div className="mt-10 text-center">
            <PageLink page="gallery" className="inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.18em]" style={{ color: accent }}>
              View the gallery <ArrowRight className="h-4 w-4" />
            </PageLink>
          </div>
        </section>
      )}

      <Testimonials accent={accent} />
      <CtaBand accent={accent} />
    </>
  );
}

function RoomCard({ room, accent, delay = 0 }) {
  const wa = useWhatsApp()(room.name);
  const price = formatPrice(room.price, room.currency);
  return (
    <Reveal delay={delay} className="group">
      <div className="overflow-hidden">
        <Img src={room.image} alt={room.name} className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-105" />
      </div>
      <div className="mt-6 flex items-baseline justify-between gap-4">
        <h3 className="text-[30px] leading-tight" style={{ fontFamily: SERIF }}>{room.name}</h3>
        {price && (
          <p className="whitespace-nowrap text-sm" style={{ color: MUTED }}>
            from <span style={{ color: INK }}>{price}</span>
          </p>
        )}
      </div>
      <p className="mt-2 line-clamp-2 font-light leading-relaxed" style={{ color: MUTED }}>{room.description}</p>
      {wa && (
        <a href={wa} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.16em]" style={{ color: accent }}>
          Book this room <ArrowRight className="h-4 w-4" />
        </a>
      )}
    </Reveal>
  );
}

function Testimonials({ accent }) {
  const { site } = useSite();
  const { md } = useBp();
  const list = site.content.testimonials || [];
  const [i, setI] = useState(0);
  if (!list.length) return null;
  const t = list[i % list.length];
  return (
    <section className="mx-auto max-w-4xl px-6 text-center" style={{ paddingTop: md ? 128 : 72, paddingBottom: md ? 128 : 72 }}>
      <Eyebrow>Guest words</Eyebrow>
      <Reveal key={i}>
        <blockquote className="mt-8 italic leading-snug" style={{ fontFamily: SERIF, fontSize: md ? 40 : 28 }}>
          “{t.quote}”
        </blockquote>
        <p className="mt-6 text-[13px] uppercase tracking-[0.2em]" style={{ color: MUTED }}>
          {t.author}
          {t.source ? ` · ${t.source}` : ""}
        </p>
      </Reveal>
      {list.length > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {list.map((_, j) => (
            <button key={j} type="button" aria-label={`Review ${j + 1}`} onClick={() => setI(j)} className="h-2 rounded-full transition-all" style={{ width: j === i ? 28 : 8, background: j === i ? accent : LINE }} />
          ))}
        </div>
      )}
    </section>
  );
}

function CtaBand({ accent }) {
  const { site } = useSite();
  const { md } = useBp();
  return (
    <section style={{ background: accent }} className="text-white">
      <Reveal className="mx-auto max-w-5xl px-6 text-center" style={{ paddingTop: md ? 112 : 64, paddingBottom: md ? 112 : 64 }}>
        <Eyebrow color="rgba(255,255,255,0.75)">Plan your stay</Eyebrow>
        <h2 className="mt-5 font-normal leading-tight" style={{ fontFamily: SERIF, fontSize: md ? 60 : 38 }}>
          Come and stay at {site.hotel.name}
        </h2>
        <p className="mx-auto mt-5 max-w-xl font-light text-white/85">
          Message us on WhatsApp — we'll check your dates and confirm your room in minutes.
        </p>
        <div className="mt-10 flex justify-center">
          <CtaButtons accent={accent} light />
        </div>
      </Reveal>
    </section>
  );
}

function PageHero({ eyebrow, title, image }) {
  const { md } = useBp();
  return (
    <section className="relative flex items-end overflow-hidden" style={{ minHeight: md ? 440 : 320 }}>
      <Img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(10,25,35,0.45), rgba(10,25,35,0.6))" }} />
      <Reveal className="relative mx-auto w-full max-w-7xl px-6 pb-14 text-white">
        <Eyebrow color="rgba(255,255,255,0.8)">{eyebrow}</Eyebrow>
        <h1 className="mt-4 font-normal leading-none" style={{ fontFamily: SERIF, fontSize: md ? 84 : 52 }}>{title}</h1>
      </Reveal>
    </section>
  );
}

function Rooms({ accent }) {
  const { site } = useSite();
  const { md } = useBp();
  const book = useBooking();
  const wa = useWhatsApp();
  return (
    <>
      <PageHero eyebrow={site.hotel.name} title="Rooms & suites" image={site.rooms[0]?.image || site.content.hero.image} />
      <section className="mx-auto max-w-7xl px-6" style={{ paddingTop: md ? 112 : 56, paddingBottom: md ? 112 : 56 }}>
        <div className="space-y-24">
          {site.rooms.map((r, i) => {
            const price = formatPrice(r.price, r.currency);
            const link = wa(r.name);
            return (
              <div key={r.id} className={md ? "grid grid-cols-12 items-center gap-14" : "space-y-8"}>
                <Reveal className={md ? `col-span-7 ${i % 2 ? "order-2" : ""}` : ""}>
                  <Img src={r.image} alt={r.name} className="aspect-[4/3] w-full object-cover" />
                </Reveal>
                <Reveal delay={0.1} className={md ? "col-span-5" : ""}>
                  <Eyebrow>{String(i + 1).padStart(2, "0")} / {String(site.rooms.length).padStart(2, "0")}</Eyebrow>
                  <h2 className="mt-4 leading-tight" style={{ fontFamily: SERIF, fontSize: md ? 48 : 36 }}>{r.name}</h2>
                  <p className="mt-5 font-light leading-[1.8]" style={{ color: MUTED }}>{r.description}</p>
                  <div className="mt-7 flex flex-wrap gap-x-7 gap-y-3 text-sm" style={{ color: MUTED }}>
                    <span className="inline-flex items-center gap-2"><Users className="h-4 w-4" /> Sleeps {r.maxOccupancy}</span>
                    {r.bedConfig && <span className="inline-flex items-center gap-2"><BedDouble className="h-4 w-4" /> {r.bedConfig}</span>}
                    {r.sizeSqm && <span className="inline-flex items-center gap-2"><Ruler className="h-4 w-4" /> {r.sizeSqm} m²</span>}
                    {r.breakfastIncluded && <span>Breakfast included</span>}
                  </div>
                  {r.amenities?.length > 0 && (
                    <p className="mt-4 text-sm" style={{ color: MUTED }}>{r.amenities.join(" · ")}</p>
                  )}
                  <div className="mt-8 flex flex-wrap items-center gap-6" style={{ borderTop: `1px solid ${LINE}`, paddingTop: 24 }}>
                    {price && (
                      <p>
                        <span className="text-3xl" style={{ fontFamily: SERIF }}>{price}</span>
                        <span className="text-sm" style={{ color: MUTED }}> / night</span>
                      </p>
                    )}
                    {link && (
                      <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[13px] uppercase tracking-[0.14em] text-white" style={{ background: accent }}>
                        <WhatsAppIcon size={16} /> Book on WhatsApp
                      </a>
                    )}
                    {book && (
                      <a {...book} className="text-[13px] uppercase tracking-[0.14em] underline underline-offset-4">
                        Book online
                      </a>
                    )}
                  </div>
                </Reveal>
              </div>
            );
          })}
        </div>
      </section>
      <CtaBand accent={accent} />
    </>
  );
}

function Gallery({ onPhoto }) {
  const { site } = useSite();
  const { md, lg } = useBp();
  const gallery = useGallery();
  return (
    <>
      <PageHero eyebrow={site.hotel.name} title="Gallery" image={gallery[1]?.url || site.content.hero.image} />
      <section className="mx-auto max-w-7xl px-6" style={{ paddingTop: md ? 96 : 48, paddingBottom: md ? 112 : 56, columnCount: lg ? 3 : md ? 2 : 1, columnGap: 16 }}>
        {gallery.map((g, i) => (
          <Reveal key={g.url + i} delay={(i % 3) * 0.06} className="mb-4 break-inside-avoid">
            <button type="button" onClick={() => onPhoto(i)} className="group block w-full overflow-hidden text-left">
              <Img src={g.url} alt={g.caption} className="w-full object-cover transition duration-700 group-hover:scale-105" style={{ aspectRatio: i % 3 === 1 ? "3/4" : "4/3" }} />
            </button>
            {g.caption && <p className="mt-2 text-sm italic" style={{ fontFamily: SERIF, color: MUTED }}>{g.caption}</p>}
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
  return (
    <>
      <PageHero eyebrow="Our story" title={c.about.heading || `About ${site.hotel.name}`} image={c.about.image} />
      <section className="mx-auto max-w-3xl px-6" style={{ paddingTop: md ? 112 : 56, paddingBottom: md ? 80 : 40 }}>
        {paragraphs(c.about.body).map((p, i) => (
          <Reveal key={i}>
            <p className={`mb-6 font-light leading-[1.9] ${i === 0 ? "text-[22px]" : "text-[17px]"}`} style={{ fontFamily: i === 0 ? SERIF : SANS, color: i === 0 ? INK : MUTED, fontSize: i === 0 ? 26 : undefined }}>
              {p}
            </p>
          </Reveal>
        ))}
        <div className="mt-10 grid grid-cols-2 gap-6" style={{ borderTop: `1px solid ${LINE}`, paddingTop: 28 }}>
          <div><Eyebrow>Check-in</Eyebrow><p className="mt-2 text-3xl" style={{ fontFamily: SERIF }}>from {site.hotel.checkIn}</p></div>
          <div><Eyebrow>Check-out</Eyebrow><p className="mt-2 text-3xl" style={{ fontFamily: SERIF }}>by {site.hotel.checkOut}</p></div>
        </div>
      </section>
      {c.amenities?.length > 0 && (
        <section className="mx-auto max-w-3xl px-6 pb-20">
          <Eyebrow>Amenities</Eyebrow>
          <div className="mt-6 flex flex-wrap gap-3">
            {c.amenities.map((a, i) => (
              <span key={a + i} className="rounded-full px-4 py-2 text-sm" style={{ border: `1px solid ${LINE}` }}>{a}</span>
            ))}
          </div>
        </section>
      )}
      <Location accent={accent} />
    </>
  );
}

function Location({ accent }) {
  const { site } = useSite();
  const { md } = useBp();
  const loc = site.content.location || {};
  return (
    <section style={{ background: "#ece5da" }}>
      <div className={`mx-auto max-w-7xl px-6 ${md ? "grid grid-cols-12 items-center gap-14" : "space-y-8"}`} style={{ paddingTop: md ? 112 : 64, paddingBottom: md ? 112 : 64 }}>
        <Reveal className={md ? "col-span-5" : ""}>
          <Eyebrow>Location</Eyebrow>
          <H className="mt-4" size={44}>Finding us</H>
          {loc.address && (
            <p className="mt-6 flex items-start gap-3 text-[17px] font-light"><MapPin className="mt-1 h-5 w-5 shrink-0" style={{ color: accent }} /> {loc.address}</p>
          )}
          {loc.directions && <p className="mt-4 font-light leading-relaxed" style={{ color: MUTED }}>{loc.directions}</p>}
        </Reveal>
        <Reveal delay={0.1} className={md ? "col-span-7" : ""}>
          <MapFrame query={loc.mapQuery || loc.address || site.hotel.name} className="h-[420px] w-full" style={{ filter: "grayscale(0.35)" }} />
        </Reveal>
      </div>
    </section>
  );
}

function Contact({ accent }) {
  const { site } = useSite();
  const { md } = useBp();
  const c = site.content.contact || {};
  const wa = useWhatsApp()();
  const f = useEnquiry();
  const field = "w-full bg-transparent py-3 outline-none placeholder:text-[#9aa4a8]";
  const fieldStyle = { borderBottom: `1px solid ${LINE}` };
  return (
    <>
      <PageHero eyebrow="Get in touch" title="Contact" image={site.content.gallery?.[2]?.url || site.content.hero.image} />
      <section className={`mx-auto max-w-7xl px-6 ${md ? "grid grid-cols-12 gap-16" : "space-y-14"}`} style={{ paddingTop: md ? 112 : 56, paddingBottom: md ? 112 : 56 }}>
        <Reveal className={md ? "col-span-5" : ""}>
          <H size={44}>We'd love to host you</H>
          <p className="mt-5 font-light leading-relaxed" style={{ color: MUTED }}>
            The fastest way to reach us is WhatsApp — we usually reply within minutes.
          </p>
          <div className="mt-10 space-y-6">
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-full text-white" style={{ background: "#25D366" }}><WhatsAppIcon size={22} /></span>
                <span><Eyebrow>WhatsApp</Eyebrow><span className="text-lg">+{site.whatsapp}</span></span>
              </a>
            )}
            {c.phone && (
              <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-full" style={{ border: `1px solid ${LINE}` }}><Phone className="h-5 w-5" /></span>
                <span><Eyebrow>Phone</Eyebrow><span className="text-lg">{c.phone}</span></span>
              </a>
            )}
            {c.email && (
              <a href={`mailto:${c.email}`} className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-full" style={{ border: `1px solid ${LINE}` }}><Mail className="h-5 w-5" /></span>
                <span><Eyebrow>Email</Eyebrow><span className="text-lg">{c.email}</span></span>
              </a>
            )}
            {site.content.location?.address && (
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-full" style={{ border: `1px solid ${LINE}` }}><MapPin className="h-5 w-5" /></span>
                <span><Eyebrow>Address</Eyebrow><span className="text-lg">{site.content.location.address}</span></span>
              </div>
            )}
          </div>
        </Reveal>
        <Reveal delay={0.1} className={md ? "col-span-7" : ""}>
          <form onSubmit={f.submit} className="bg-white p-8" style={{ padding: md ? 48 : 28 }}>
            <p className="text-3xl" style={{ fontFamily: SERIF }}>Send an enquiry</p>
            <div className="mt-6 space-y-5">
              <input className={field} style={fieldStyle} placeholder="Your name" value={f.v.name} onChange={f.set("name")} />
              <div className="grid grid-cols-2 gap-5">
                <label className="text-xs uppercase tracking-[0.18em]" style={{ color: MUTED }}>Arrival<input type="date" className={field} style={fieldStyle} value={f.v.checkIn} onChange={f.set("checkIn")} /></label>
                <label className="text-xs uppercase tracking-[0.18em]" style={{ color: MUTED }}>Departure<input type="date" className={field} style={fieldStyle} value={f.v.checkOut} onChange={f.set("checkOut")} /></label>
              </div>
              <input className={field} style={fieldStyle} placeholder="Guests" inputMode="numeric" value={f.v.guests} onChange={f.set("guests")} />
              <textarea className={field} style={fieldStyle} rows={3} placeholder="Anything we should know?" value={f.v.message} onChange={f.set("message")} />
            </div>
            <button type="submit" className="mt-8 inline-flex items-center gap-2 rounded-full px-8 py-4 text-[13px] uppercase tracking-[0.16em] text-white" style={{ background: accent }}>
              Send via {f.via} <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </Reveal>
      </section>
      <Location accent={accent} />
    </>
  );
}

function Footer({ accent }) {
  const { site } = useSite();
  const { md } = useBp();
  const c = site.content.contact || {};
  return (
    <footer style={{ background: INK, color: "rgba(255,255,255,0.75)" }}>
      <div className={`mx-auto max-w-7xl px-6 ${md ? "grid grid-cols-3 gap-12" : "space-y-10"}`} style={{ paddingTop: 80, paddingBottom: 48 }}>
        <div>
          <p className="text-3xl text-white" style={{ fontFamily: SERIF }}>{site.hotel.name}</p>
          <p className="mt-3 font-light">{site.content.hero.subtitle}</p>
        </div>
        <div className="space-y-2 font-light">
          <Eyebrow color="rgba(255,255,255,0.5)">Visit</Eyebrow>
          <p>{site.content.location?.address}</p>
          {c.phone && <p>{c.phone}</p>}
          {c.email && <p>{c.email}</p>}
        </div>
        <div>
          <Eyebrow color="rgba(255,255,255,0.5)">Explore</Eyebrow>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {PAGES.map((p) => (
              <PageLink key={p.id} page={p.id} className="font-light hover:text-white">{p.label}</PageLink>
            ))}
          </div>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-2 px-6 py-6 text-xs" style={{ borderTop: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.45)" }}>
        <span>© {year()} {site.hotel.name}</span>
        <span>Website by <a href="https://botlify.site" className="underline" style={{ color: accent === INK ? "#fff" : "rgba(255,255,255,0.7)" }}>Botlify</a></span>
      </div>
    </footer>
  );
}
