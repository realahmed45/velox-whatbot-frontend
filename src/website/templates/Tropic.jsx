/**
 * Tropic — lush and playful. Deep jungle green with a lime highlight, big
 * rounded cards, a floating pill nav and a bento layout. Fraunces (soft, heavy
 * serif) over Outfit. Feels like a design-led island resort or villa.
 */
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, BedDouble, Clock, Mail, MapPin, Menu, Phone, Sparkles, Users, X } from "lucide-react";
import {
  Img, Lightbox, MapFrame, PAGES, PageLink, Reveal, WhatsAppFab, WhatsAppIcon,
  formatPrice, paragraphs, useBooking, useBp, useEnquiry, useFonts, useFrameHeight,
  useGallery, useLightbox, useMenu, useSite, useWhatsApp, year,
} from "../shared";

const DISPLAY = "'Fraunces', Georgia, serif";
const SANS = "'Outfit', system-ui, sans-serif";
const CREAM = "#f3efe2";
const INK = "#10261c";
const MUTED = "#5b6b61";
const LIME = "#d6f06a";

export default function Tropic() {
  useFonts("tropic", "family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700;9..144,800&family=Outfit:wght@300;400;500;600;700");
  const { site, page } = useSite();
  const green = site.accent || "#1c4a35";
  const gallery = useGallery();
  const lb = useLightbox();
  return (
    <div style={{ fontFamily: SANS, background: CREAM, color: INK }} className="min-h-full antialiased">
      <Nav green={green} />
      <main>
        {page === "home" && <Home green={green} onPhoto={lb.open} />}
        {page === "rooms" && <Rooms green={green} />}
        {page === "gallery" && <Gallery green={green} onPhoto={lb.open} />}
        {page === "about" && <About green={green} />}
        {page === "contact" && <Contact green={green} />}
      </main>
      <Footer green={green} />
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
    <a href={href} {...rest} className="inline-flex items-center gap-2 rounded-full px-7 py-4 text-[15px] font-semibold transition hover:-translate-y-0.5 hover:shadow-lg" style={{ background: bg, color }}>
      {children}
    </a>
  );
}

function Nav({ green }) {
  const { site, page } = useSite();
  const { md } = useBp();
  const [open, setOpen] = useMenu();
  const wa = useWhatsApp()();
  return (
    <>
      <header className="fixed left-0 right-0 top-4 z-40 px-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between rounded-full bg-white/90 py-2 pl-6 pr-2 shadow-[0_8px_30px_-12px_rgba(16,38,28,0.35)] backdrop-blur">
          <PageLink page="home" className="text-xl font-bold" style={{ fontFamily: DISPLAY, color: green }}>{site.hotel.name}</PageLink>
          {md ? (
            <nav className="flex items-center gap-1">
              {PAGES.map((p) => (
                <PageLink key={p.id} page={p.id} className="rounded-full px-4 py-2 text-[14px] font-medium transition" style={{ background: page === p.id ? CREAM : "transparent", color: INK }}>
                  {p.label}
                </PageLink>
              ))}
              {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="ml-2 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-semibold" style={{ background: green, color: LIME }}><WhatsAppIcon size={16} /> Book now</a>}
            </nav>
          ) : (
            <button type="button" onClick={() => setOpen(!open)} aria-label="Menu" className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: green, color: LIME }}>
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}
        </div>
      </header>
      {open && !md && (
        <div className="fixed inset-0 z-30 flex flex-col justify-end p-6 pb-28" style={{ background: green }}>
          {PAGES.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.05} y={14}>
              <PageLink page={p.id} className="block py-2 text-5xl font-bold" style={{ fontFamily: DISPLAY, color: page === p.id ? LIME : "#fff" }}>{p.label}</PageLink>
            </Reveal>
          ))}
          {wa && <div className="mt-8"><Pill href={wa} target="_blank" rel="noopener noreferrer" bg={LIME} color={INK}><WhatsAppIcon size={18} /> Book on WhatsApp</Pill></div>}
        </div>
      )}
    </>
  );
}

function Marquee({ items, green }) {
  const { still } = useSite();
  const row = [...items, ...items];
  return (
    <div className="overflow-hidden py-5" style={{ background: green }}>
      <motion.div
        className="flex w-max gap-10 whitespace-nowrap"
        animate={still ? undefined : { x: ["0%", "-50%"] }}
        transition={{ duration: Math.max(20, items.length * 4), ease: "linear", repeat: Infinity }}
      >
        {row.map((a, i) => (
          <span key={i} className="flex items-center gap-10 text-2xl font-semibold" style={{ fontFamily: DISPLAY, color: LIME }}>
            {a} <Sparkles className="h-5 w-5" style={{ color: "#fff", opacity: 0.6 }} />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function Home({ green, onPhoto }) {
  const { site } = useSite();
  const { md, lg } = useBp();
  const h = useFrameHeight(0.94, 600);
  const c = site.content;
  const wa = useWhatsApp()();
  const book = useBooking();
  const gallery = useGallery();
  const cheapest = site.rooms.filter((r) => r.price).sort((a, b) => a.price - b.price)[0];
  return (
    <>
      <section className="p-3" style={{ paddingTop: 12 }}>
        <div className="relative flex items-end overflow-hidden rounded-[36px]" style={{ minHeight: h }}>
          <Img src={c.hero.image} alt={site.hotel.name} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(8,24,16,0.1) 30%, rgba(8,24,16,0.75))" }} />
          <div className="relative w-full p-6" style={{ padding: md ? 56 : 24 }}>
            <Reveal>
              <div className="flex flex-wrap gap-2">
                {site.hotel.city && <Tag bg="rgba(255,255,255,0.18)" color="#fff"><MapPin className="h-3.5 w-3.5" /> {site.hotel.city}</Tag>}
                <Tag bg="rgba(255,255,255,0.18)" color="#fff">{site.hotel.typeLabel}</Tag>
              </div>
              <h1 className="mt-6 max-w-4xl font-extrabold leading-[0.92] tracking-tight text-white" style={{ fontFamily: DISPLAY, fontSize: lg ? 112 : md ? 84 : 52 }}>
                {c.hero.title || site.hotel.name}
              </h1>
              <div className={`mt-8 ${md ? "flex items-end justify-between gap-10" : "space-y-6"}`}>
                {c.hero.subtitle && <p className="max-w-lg text-lg font-light text-white/90">{c.hero.subtitle}</p>}
                <div className="flex flex-wrap gap-3">
                  {wa && <Pill href={wa} target="_blank" rel="noopener noreferrer" bg={LIME} color={INK}><WhatsAppIcon size={18} /> Book on WhatsApp</Pill>}
                  {book && <Pill {...book} bg="#fff" color={INK}>Check dates <ArrowUpRight className="h-4 w-4" /></Pill>}
                </div>
              </div>
            </Reveal>
          </div>
          {cheapest && md && (
            <motion.div
              className="absolute right-10 top-28 flex h-36 w-36 flex-col items-center justify-center rounded-full text-center"
              style={{ background: LIME, color: INK }}
              initial={{ rotate: -12, scale: 0.9 }}
              animate={{ rotate: -8, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-xs font-semibold uppercase tracking-wider">from</span>
              <span className="text-2xl font-bold leading-none" style={{ fontFamily: DISPLAY }}>{formatPrice(cheapest.price, cheapest.currency)}</span>
              <span className="text-xs">per night</span>
            </motion.div>
          )}
        </div>
      </section>

      {c.amenities?.length > 0 && <div className="mt-3"><Marquee items={c.amenities} green={green} /></div>}

      <section className="mx-auto max-w-6xl px-4" style={{ paddingTop: md ? 110 : 64 }}>
        <div className={`grid gap-4 ${lg ? "grid-cols-3" : md ? "grid-cols-2" : "grid-cols-1"}`}>
          <Reveal className={`rounded-[28px] p-8 text-white ${lg ? "row-span-2" : ""}`} style={{ background: green, padding: md ? 44 : 28 }}>
            <Tag bg={LIME} color={INK}>Hello</Tag>
            <Big className="mt-6 text-white" size={48}>{c.about.heading}</Big>
            <p className="mt-6 font-light leading-relaxed text-white/80">{paragraphs(c.about.body)[0]}</p>
            <PageLink page="about" className="mt-8 inline-flex items-center gap-2 font-semibold" style={{ color: LIME }}>More about us <ArrowRight className="h-4 w-4" /></PageLink>
          </Reveal>
          <Reveal delay={0.05} className={`overflow-hidden rounded-[28px] ${lg ? "col-span-2" : ""}`}>
            <Img src={c.about.image} alt="" className="h-full min-h-[280px] w-full object-cover" />
          </Reveal>
          <Reveal delay={0.1} className="rounded-[28px] bg-white p-8">
            <Clock className="h-7 w-7" style={{ color: green }} />
            <p className="mt-5 text-4xl font-bold" style={{ fontFamily: DISPLAY }}>{site.hotel.checkIn}</p>
            <p className="mt-1" style={{ color: MUTED }}>Check-in · out by {site.hotel.checkOut}</p>
          </Reveal>
          <Reveal delay={0.15} className="rounded-[28px] p-8" style={{ background: LIME }}>
            <BedDouble className="h-7 w-7" />
            <p className="mt-5 text-4xl font-bold" style={{ fontFamily: DISPLAY }}>{site.rooms.length} {site.rooms.length === 1 ? "room type" : "room types"}</p>
            <p className="mt-1" style={{ color: INK }}>Book direct for the best rate</p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4" style={{ paddingTop: md ? 120 : 72 }}>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal><Tag bg="#fff">Stay</Tag><Big className="mt-5">Pick your room</Big></Reveal>
          <PageLink page="rooms" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold">All rooms <ArrowRight className="h-4 w-4" /></PageLink>
        </div>
        <div className={`mt-12 grid gap-5 ${lg ? "grid-cols-3" : md ? "grid-cols-2" : "grid-cols-1"}`}>
          {site.rooms.slice(0, 3).map((r, i) => <RoomCard key={r.id} room={r} green={green} delay={i * 0.08} />)}
        </div>
      </section>

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
            <PageLink page="gallery" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold">All photos <ArrowRight className="h-4 w-4" /></PageLink>
          </Reveal>
          <div className={`mt-12 grid gap-4 ${md ? "grid-cols-4" : "grid-cols-2"}`} style={{ gridAutoRows: md ? 220 : 160 }}>
            {gallery.slice(0, 6).map((g, i) => (
              <button key={g.url + i} type="button" onClick={() => onPhoto(i)} className={`group overflow-hidden rounded-[24px] ${md && i === 0 ? "col-span-2 row-span-2" : ""} ${md && i === 3 ? "col-span-2" : ""}`}>
                <Img src={g.url} alt={g.caption} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
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

function RoomCard({ room, green, delay }) {
  const wa = useWhatsApp()(room.name);
  const price = formatPrice(room.price, room.currency);
  return (
    <Reveal delay={delay} className="group overflow-hidden rounded-[28px] bg-white p-3">
      <div className="relative overflow-hidden rounded-[22px]">
        <Img src={room.image} alt={room.name} className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-105" />
        {price && <span className="absolute left-3 top-3 rounded-full px-3 py-1.5 text-sm font-semibold" style={{ background: LIME, color: INK }}>{price} / night</span>}
      </div>
      <div className="p-4">
        <h3 className="text-2xl font-bold" style={{ fontFamily: DISPLAY }}>{room.name}</h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm" style={{ color: MUTED }}><Users className="h-4 w-4" /> Up to {room.maxOccupancy} guests{room.bedConfig ? ` · ${room.bedConfig}` : ""}</p>
        <p className="mt-3 line-clamp-2 font-light" style={{ color: MUTED }}>{room.description}</p>
        {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="mt-5 flex w-full items-center justify-center gap-2 rounded-full py-3.5 font-semibold" style={{ background: green, color: LIME }}><WhatsAppIcon size={16} /> Book this room</a>}
      </div>
    </Reveal>
  );
}

function Reviews({ green }) {
  const { site } = useSite();
  const { md } = useBp();
  const list = site.content.testimonials || [];
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
              <span><span className="block font-semibold">{t.author}</span>{t.source && <span className="text-sm" style={{ color: MUTED }}>{t.source}</span>}</span>
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
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full" style={{ background: LIME, opacity: 0.18 }} />
        <div className="absolute -bottom-24 right-40 h-48 w-48 rounded-full" style={{ background: LIME, opacity: 0.1 }} />
        <Big className="relative max-w-2xl text-white" size={60}>Your days at {site.hotel.name} start with a message.</Big>
        <p className="relative mt-5 max-w-lg font-light text-white/80">Tell us your dates on WhatsApp — we'll hold your room and answer anything you need.</p>
        <div className="relative mt-10 flex flex-wrap gap-3">
          {wa && <Pill href={wa} target="_blank" rel="noopener noreferrer" bg={LIME} color={INK}><WhatsAppIcon size={18} /> Chat on WhatsApp</Pill>}
          {book && <Pill {...book} bg="#fff" color={INK}>Book online <ArrowUpRight className="h-4 w-4" /></Pill>}
        </div>
      </Reveal>
    </section>
  );
}

function PageHead({ tag, title, image, green }) {
  const { md } = useBp();
  return (
    <section className="p-3">
      <div className="relative flex items-end overflow-hidden rounded-[36px]" style={{ minHeight: md ? 460 : 340 }}>
        <Img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(8,24,16,0.2), rgba(8,24,16,0.7))" }} />
        <Reveal className="relative p-8" style={{ padding: md ? 56 : 24 }}>
          <Tag bg={LIME} color={green}>{tag}</Tag>
          <h1 className="mt-5 font-extrabold leading-none tracking-tight text-white" style={{ fontFamily: DISPLAY, fontSize: md ? 92 : 52 }}>{title}</h1>
        </Reveal>
      </div>
    </section>
  );
}

function Rooms({ green }) {
  const { site } = useSite();
  const { md, lg } = useBp();
  const wa = useWhatsApp();
  const book = useBooking();
  return (
    <>
      <PageHead tag={site.hotel.name} title="Rooms" image={site.rooms[1]?.image || site.rooms[0]?.image || site.content.hero.image} green={green} />
      <section className="mx-auto max-w-6xl space-y-5 px-4" style={{ paddingTop: md ? 72 : 40 }}>
        {site.rooms.map((r, i) => {
          const price = formatPrice(r.price, r.currency);
          const link = wa(r.name);
          return (
            <Reveal key={r.id} className={`overflow-hidden rounded-[32px] bg-white p-3 ${lg ? "grid grid-cols-2 gap-6" : ""}`}>
              <Img src={r.image} alt={r.name} className={`w-full rounded-[24px] object-cover ${lg && i % 2 ? "order-2" : ""}`} style={{ aspectRatio: lg ? "auto" : "4/3", minHeight: lg ? 420 : undefined }} />
              <div className="flex flex-col justify-center p-5" style={{ padding: md ? 32 : 16 }}>
                <div className="flex flex-wrap gap-2">
                  <Tag bg={CREAM}><Users className="h-3.5 w-3.5" /> {r.maxOccupancy} guests</Tag>
                  {r.bedConfig && <Tag bg={CREAM}><BedDouble className="h-3.5 w-3.5" /> {r.bedConfig}</Tag>}
                  {r.sizeSqm && <Tag bg={CREAM}>{r.sizeSqm} m²</Tag>}
                  {r.breakfastIncluded && <Tag bg={LIME}>Breakfast included</Tag>}
                </div>
                <h2 className="mt-5 font-bold leading-none" style={{ fontFamily: DISPLAY, fontSize: md ? 52 : 36 }}>{r.name}</h2>
                <p className="mt-4 font-light leading-relaxed" style={{ color: MUTED }}>{r.description}</p>
                {r.amenities?.length > 0 && <p className="mt-3 text-sm" style={{ color: MUTED }}>{r.amenities.join(" · ")}</p>}
                <div className="mt-7 flex flex-wrap items-center gap-4">
                  {price && <p className="text-3xl font-bold" style={{ fontFamily: DISPLAY, color: green }}>{price}<span className="text-base font-normal" style={{ color: MUTED }}> /night</span></p>}
                  {link && <Pill href={link} target="_blank" rel="noopener noreferrer" bg={green} color={LIME}><WhatsAppIcon size={16} /> Book on WhatsApp</Pill>}
                  {book && <a {...book} className="font-semibold underline underline-offset-4">Book online</a>}
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
      <PageHead tag={`${gallery.length} photos`} title="Gallery" image={gallery[0]?.url || site.content.hero.image} green={green} />
      <section className={`mx-auto grid max-w-6xl grid-flow-dense gap-4 px-4 ${lg ? "grid-cols-4" : md ? "grid-cols-3" : "grid-cols-2"}`} style={{ paddingTop: md ? 56 : 32, gridAutoRows: md ? 240 : 170 }}>
        {gallery.map((g, i) => (
          <Reveal key={g.url + i} delay={(i % 4) * 0.05} className={`${i % 5 === 0 ? "col-span-2 row-span-2" : ""} ${i % 5 === 3 && md ? "row-span-2" : ""}`}>
            <button type="button" onClick={() => onPhoto(i)} className="group relative block h-full w-full overflow-hidden rounded-[24px]">
              <Img src={g.url} alt={g.caption} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
              {g.caption && <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-sm font-medium opacity-0 transition group-hover:opacity-100">{g.caption}</span>}
            </button>
          </Reveal>
        ))}
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
      <PageHead tag="Our story" title="About us" image={c.about.image} green={green} />
      <section className={`mx-auto max-w-6xl px-4 ${md ? "grid grid-cols-5 gap-5" : "space-y-5"}`} style={{ paddingTop: md ? 72 : 40 }}>
        <Reveal className={`rounded-[32px] bg-white p-8 ${md ? "col-span-3" : ""}`} style={{ padding: md ? 48 : 28 }}>
          <Big size={46}>{c.about.heading}</Big>
          {paragraphs(c.about.body).map((p, i) => <p key={i} className="mt-5 text-[17px] font-light leading-relaxed" style={{ color: MUTED }}>{p}</p>)}
        </Reveal>
        <div className={`space-y-5 ${md ? "col-span-2" : ""}`}>
          <Reveal delay={0.05} className="rounded-[32px] p-8" style={{ background: green, color: "#fff" }}>
            <p className="text-sm uppercase tracking-wider" style={{ color: LIME }}>Check-in / out</p>
            <p className="mt-3 text-4xl font-bold" style={{ fontFamily: DISPLAY }}>{site.hotel.checkIn} — {site.hotel.checkOut}</p>
          </Reveal>
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
        </div>
        <MapFrame query={loc.mapQuery || loc.address || site.hotel.name} className={`h-[380px] w-full rounded-[24px] ${md ? "col-span-3" : ""}`} />
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
      <PageHead tag="Say hello" title="Contact" image={site.content.gallery?.[4]?.url || site.content.hero.image} green={green} />
      <section className={`mx-auto max-w-6xl px-4 ${md ? "grid grid-cols-5 gap-5" : "space-y-5"}`} style={{ paddingTop: md ? 72 : 40 }}>
        <div className={`space-y-5 ${md ? "col-span-2" : ""}`}>
          {wa && (
            <Reveal className="rounded-[32px] p-8" style={{ background: "#25D366", color: "#fff" }}>
              <WhatsAppIcon size={34} />
              <p className="mt-5 text-3xl font-bold" style={{ fontFamily: DISPLAY }}>WhatsApp us</p>
              <p className="mt-1 text-white/85">Fastest reply — usually minutes.</p>
              <a href={wa} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold" style={{ color: "#128C7E" }}>+{site.whatsapp} <ArrowUpRight className="h-4 w-4" /></a>
            </Reveal>
          )}
          <Reveal delay={0.05} className="space-y-4 rounded-[32px] bg-white p-8">
            {c.phone && <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 font-medium"><Phone className="h-5 w-5" style={{ color: green }} /> {c.phone}</a>}
            {c.email && <a href={`mailto:${c.email}`} className="flex items-center gap-3 font-medium"><Mail className="h-5 w-5" style={{ color: green }} /> {c.email}</a>}
            {site.content.location?.address && <p className="flex items-start gap-3 font-medium"><MapPin className="mt-0.5 h-5 w-5 shrink-0" style={{ color: green }} /> {site.content.location.address}</p>}
          </Reveal>
        </div>
        <Reveal delay={0.1} className={`rounded-[32px] bg-white ${md ? "col-span-3" : ""}`} style={{ padding: md ? 44 : 24 }}>
          <form onSubmit={f.submit}>
            <Big size={40}>Plan your stay</Big>
            <div className="mt-8 grid gap-3">
              <input className={input} style={st} placeholder="Your name" value={f.v.name} onChange={f.set("name")} />
              <div className="grid grid-cols-2 gap-3">
                <input type="date" className={input} style={st} value={f.v.checkIn} onChange={f.set("checkIn")} aria-label="Arrival" />
                <input type="date" className={input} style={st} value={f.v.checkOut} onChange={f.set("checkOut")} aria-label="Departure" />
              </div>
              <input className={input} style={st} placeholder="Guests" value={f.v.guests} onChange={f.set("guests")} />
              <textarea className={input} style={st} rows={4} placeholder="Tell us anything" value={f.v.message} onChange={f.set("message")} />
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
  const { md } = useBp();
  return (
    <footer className="p-3" style={{ paddingTop: md ? 110 : 64 }}>
      <div className="rounded-[36px] text-white" style={{ background: INK, padding: md ? 56 : 28 }}>
        <div className={md ? "flex items-end justify-between gap-10" : "space-y-8"}>
          <p className="font-extrabold leading-none" style={{ fontFamily: DISPLAY, fontSize: md ? 72 : 44, color: LIME }}>{site.hotel.name}</p>
          <nav className="flex flex-wrap gap-2">
            {PAGES.map((p) => <PageLink key={p.id} page={p.id} className="rounded-full px-4 py-2 text-sm" style={{ border: "1px solid rgba(255,255,255,0.2)" }}>{p.label}</PageLink>)}
          </nav>
        </div>
        <div className="mt-10 flex flex-wrap justify-between gap-3 pt-6 text-sm text-white/50" style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}>
          <span>{site.content.location?.address}</span>
          <span>© {year()} {site.hotel.name} · Website by <a href="https://botlify.site" className="underline">Botlify</a></span>
        </div>
      </div>
    </footer>
  );
}
