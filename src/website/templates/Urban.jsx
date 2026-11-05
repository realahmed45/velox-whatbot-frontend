/**
 * Urban — minimal and editorial. Black on white, a strict 12-column grid,
 * numbered sections, oversized grotesk headlines with italic serif asides
 * (Inter Tight + Instrument Serif). Feels like a design hotel in a city.
 */
import { useState } from "react";
import { ArrowRight, ArrowUpRight, Menu, X } from "lucide-react";
import {
  Img, Lightbox, MapFrame, PAGES, PageLink, Reveal, WhatsAppFab, WhatsAppIcon,
  formatPrice, paragraphs, useBooking, useBp, useEnquiry, useFonts,
  useGallery, useLightbox, useMenu, useSite, useWhatsApp, year,
} from "../shared";

const GROT = "'Inter Tight', system-ui, sans-serif";
const SERIF = "'Instrument Serif', Georgia, serif";
const INK = "#0d0d0d";
const MUTED = "#6e6e6e";
const LINE = "#e4e4e4";

export default function Urban() {
  useFonts("urban", "family=Inter+Tight:wght@300;400;500;600;700;800&family=Instrument+Serif:ital@0;1");
  const { site, page } = useSite();
  const accent = site.accent || "#ff4a1c";
  const gallery = useGallery();
  const lb = useLightbox();
  return (
    <div style={{ fontFamily: GROT, background: "#fff", color: INK }} className="min-h-full antialiased">
      <Nav accent={accent} />
      <main style={{ paddingTop: 64 }}>
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

const Label = ({ children, n }) => (
  <p className="text-[11px] font-medium uppercase tracking-[0.14em]" style={{ color: MUTED }}>
    {n !== undefined && <span className="mr-2" style={{ color: INK }}>({String(n).padStart(2, "0")})</span>}
    {children}
  </p>
);

function Nav({ accent }) {
  const { site, page } = useSite();
  const { md } = useBp();
  const [open, setOpen] = useMenu();
  const wa = useWhatsApp()();
  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-40 bg-white/95 backdrop-blur" style={{ borderBottom: `1px solid ${LINE}` }}>
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5">
          <PageLink page="home" className="text-[15px] font-bold uppercase tracking-tight">{site.hotel.name}</PageLink>
          {md ? (
            <>
              <nav className="flex gap-7">
                {PAGES.map((p, i) => (
                  <PageLink key={p.id} page={p.id} className="text-[13px] font-medium transition hover:opacity-50" style={{ color: page === p.id ? INK : MUTED }}>
                    <sup className="mr-1 text-[9px]">{String(i + 1).padStart(2, "0")}</sup>{p.label}
                    {page === p.id && <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full align-middle" style={{ background: accent }} />}
                  </PageLink>
                ))}
              </nav>
              {wa ? (
                <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[13px] font-semibold uppercase">Book <ArrowUpRight className="h-4 w-4" /></a>
              ) : <span />}
            </>
          ) : (
            <button type="button" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}</button>
          )}
        </div>
      </header>
      {open && !md && (
        <div className="fixed inset-0 z-30 bg-white px-5 pt-24">
          {PAGES.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.04} y={10}>
              <PageLink page={p.id} className="flex items-baseline justify-between py-4 text-4xl font-bold uppercase tracking-tight" style={{ borderBottom: `1px solid ${LINE}`, color: page === p.id ? accent : INK }}>
                {p.label}<span className="text-sm font-normal" style={{ color: MUTED }}>{String(i + 1).padStart(2, "0")}</span>
              </PageLink>
            </Reveal>
          ))}
        </div>
      )}
    </>
  );
}

function Mega({ children, className = "", style }) {
  const { lg, md } = useBp();
  return (
    <h1 className={`font-extrabold uppercase leading-[0.86] tracking-[-0.04em] ${className}`} style={{ fontSize: lg ? 150 : md ? 104 : 56, ...style }}>
      {children}
    </h1>
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
  const wa = useWhatsApp()();
  const book = useBooking();
  const gallery = useGallery();
  return (
    <>
      <section className="mx-auto max-w-[1400px] px-5" style={{ paddingTop: md ? 56 : 32 }}>
        <Reveal>
          <Mega>{c.hero.title || site.hotel.name}</Mega>
        </Reveal>
        <div className={`mt-8 ${md ? "grid grid-cols-12 items-end gap-5" : "space-y-6"}`}>
          <Reveal delay={0.05} className={md ? "col-span-5" : ""}>
            <p className="text-[26px] leading-[1.15]" style={{ fontFamily: SERIF }}><em>{c.hero.subtitle}</em></p>
          </Reveal>
          <Reveal delay={0.1} className={`flex flex-wrap gap-3 ${md ? "col-span-7 justify-end" : ""}`}>
            {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white transition hover:opacity-85" style={{ background: INK }}><WhatsAppIcon size={16} /> Book on WhatsApp</a>}
            {book && <a {...book} className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold" style={{ border: `1px solid ${INK}` }}>Availability <ArrowUpRight className="h-4 w-4" /></a>}
          </Reveal>
        </div>
        <Reveal delay={0.1} className="mt-10 overflow-hidden">
          <Img src={c.hero.image} alt={site.hotel.name} className="w-full object-cover" style={{ aspectRatio: md ? "21/9" : "4/5" }} />
        </Reveal>
        <div className={`grid ${md ? "grid-cols-4" : "grid-cols-2"} gap-5 py-5`} style={{ borderBottom: `1px solid ${LINE}` }}>
          {[["Location", [site.hotel.city, site.hotel.country].filter(Boolean).join(", ") || "—"], ["Type", site.hotel.typeLabel], ["Check-in", `From ${site.hotel.checkIn}`], ["Check-out", `By ${site.hotel.checkOut}`]].map(([k, v]) => (
            <div key={k}><Label>{k}</Label><p className="mt-1 text-[15px] font-medium">{v}</p></div>
          ))}
        </div>
      </section>

      <Section n={1} label="About">
        <Reveal>
          <p className="font-medium leading-[1.12] tracking-tight" style={{ fontSize: md ? 44 : 28 }}>
            {paragraphs(c.about.body)[0]}
          </p>
          <PageLink page="about" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold uppercase" style={{ borderBottom: `2px solid ${accent}` }}>Read more <ArrowRight className="h-4 w-4" /></PageLink>
        </Reveal>
      </Section>

      <Section n={2} label="Rooms">
        <RoomIndex accent={accent} />
      </Section>

      {gallery.length > 0 && (
        <Section n={3} label="Gallery">
          <div className={`grid gap-5 ${lg ? "grid-cols-3" : "grid-cols-2"}`}>
            {gallery.slice(0, lg ? 6 : 4).map((g, i) => (
              <Reveal key={g.url + i} delay={(i % 3) * 0.05}>
                <button type="button" onClick={() => onPhoto(i)} className="group block w-full text-left">
                  <div className="overflow-hidden"><Img src={g.url} alt={g.caption} className="aspect-square w-full object-cover grayscale transition duration-700 group-hover:scale-105 group-hover:grayscale-0" /></div>
                  <p className="mt-2 text-[12px]" style={{ color: MUTED }}>Fig. {String(i + 1).padStart(2, "0")}{g.caption ? ` — ${g.caption}` : ""}</p>
                </button>
              </Reveal>
            ))}
          </div>
          <PageLink page="gallery" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold uppercase" style={{ borderBottom: `2px solid ${accent}` }}>Full gallery <ArrowRight className="h-4 w-4" /></PageLink>
        </Section>
      )}

      {c.amenities?.length > 0 && (
        <Section n={4} label="Amenities">
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

      {c.testimonials?.length > 0 && (
        <Section n={5} label="Said about us">
          <div className="space-y-12">
            {c.testimonials.slice(0, 3).map((t, i) => (
              <Reveal key={i}>
                <p className="leading-[1.1]" style={{ fontFamily: SERIF, fontSize: md ? 46 : 30 }}>“{t.quote}”</p>
                <Label>{t.author}{t.source ? ` / ${t.source}` : ""}</Label>
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
  const { site } = useSite();
  const { md } = useBp();
  const wa = useWhatsApp();
  const [hover, setHover] = useState(0);
  const rooms = site.rooms;
  return (
    <div className={md && !full ? "grid grid-cols-9 gap-5" : ""}>
      <div className={md && !full ? "col-span-5" : ""} style={{ borderTop: `1px solid ${LINE}` }}>
        {rooms.map((r, i) => {
          const link = wa(r.name);
          const price = formatPrice(r.price, r.currency);
          return (
            <Reveal key={r.id} y={8} className="group" style={{ borderBottom: `1px solid ${LINE}` }}>
              <a
                href={link || undefined}
                target={link ? "_blank" : undefined}
                rel="noopener noreferrer"
                onMouseEnter={() => setHover(i)}
                className="flex items-center gap-5 py-5"
              >
                <span className="w-8 text-xs" style={{ color: MUTED }}>{String(i + 1).padStart(2, "0")}</span>
                <span className="flex-1">
                  <span className="block text-2xl font-semibold tracking-tight transition group-hover:translate-x-2" style={{ fontSize: md ? 28 : 22 }}>{r.name}</span>
                  <span className="text-sm" style={{ color: MUTED }}>Sleeps {r.maxOccupancy}{r.bedConfig ? ` · ${r.bedConfig}` : ""}</span>
                </span>
                {price && <span className="text-[15px] font-medium">{price}</span>}
                <ArrowUpRight className="h-5 w-5 transition group-hover:rotate-45" style={{ color: hover === i ? accent : INK }} />
              </a>
            </Reveal>
          );
        })}
      </div>
      {md && !full && rooms[hover] && (
        <div className="col-span-4">
          <Img key={rooms[hover].image} src={rooms[hover].image} alt={rooms[hover].name} className="aspect-[4/5] w-full object-cover" />
        </div>
      )}
    </div>
  );
}

function BigCta({ accent }) {
  const { md } = useBp();
  const wa = useWhatsApp()();
  const book = useBooking();
  const href = wa || book?.href;
  if (!href) return null;
  return (
    <section className="mx-auto max-w-[1400px] px-5" style={{ paddingTop: md ? 120 : 64 }}>
      <a href={href} target="_blank" rel="noopener noreferrer" className="group block p-8 text-white" style={{ background: INK, padding: md ? 56 : 28 }}>
        <Label>Reservations</Label>
        <p className="mt-6 flex items-end justify-between gap-6 font-extrabold uppercase leading-[0.88] tracking-[-0.04em]" style={{ fontSize: md ? 112 : 48 }}>
          <span>Book your<br />stay <em className="font-normal normal-case" style={{ fontFamily: SERIF, color: accent }}>now</em></span>
          <ArrowUpRight className="shrink-0 transition duration-500 group-hover:rotate-45" style={{ width: md ? 110 : 48, height: md ? 110 : 48, color: accent }} />
        </p>
        <p className="mt-6 text-white/60">{wa ? "Message us on WhatsApp — we confirm in minutes." : "Check dates and book online."}</p>
      </a>
    </section>
  );
}

function PageTitle({ title, aside, image }) {
  const { md } = useBp();
  return (
    <section className="mx-auto max-w-[1400px] px-5" style={{ paddingTop: md ? 56 : 32 }}>
      <Reveal><Mega>{title}</Mega></Reveal>
      {aside && <p className="mt-6 max-w-xl text-[24px] leading-tight" style={{ fontFamily: SERIF }}><em>{aside}</em></p>}
      {image && <Reveal delay={0.08} className="mt-10"><Img src={image} alt="" className="w-full object-cover" style={{ aspectRatio: md ? "3/1" : "4/3" }} /></Reveal>}
    </section>
  );
}

function Rooms({ accent }) {
  const { site } = useSite();
  const { md } = useBp();
  const wa = useWhatsApp();
  const book = useBooking();
  return (
    <>
      <PageTitle title="Rooms" aside={`${site.rooms.length} ways to stay at ${site.hotel.name}.`} />
      {site.rooms.map((r, i) => {
        const price = formatPrice(r.price, r.currency);
        const link = wa(r.name);
        return (
          <Section key={r.id} n={i + 1} label={r.name}>
            <div className={md ? "grid grid-cols-9 gap-5" : "space-y-6"}>
              <Reveal className={md ? "col-span-5" : ""}><Img src={r.image} alt={r.name} className="aspect-[4/3] w-full object-cover" /></Reveal>
              <Reveal delay={0.08} className={md ? "col-span-4 flex flex-col" : ""}>
                <h2 className="text-4xl font-bold tracking-tight">{r.name}</h2>
                <p className="mt-4 leading-relaxed" style={{ color: MUTED }}>{r.description}</p>
                <dl className="mt-6" style={{ borderTop: `1px solid ${LINE}` }}>
                  {[["Guests", r.maxOccupancy], ["Bed", r.bedConfig], ["Size", r.sizeSqm && `${r.sizeSqm} m²`], ["Breakfast", r.breakfastIncluded ? "Included" : null], ["Features", r.amenities?.join(", ")]].filter(([, v]) => v).map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-6 py-3 text-sm" style={{ borderBottom: `1px solid ${LINE}` }}><dt style={{ color: MUTED }}>{k}</dt><dd className="text-right font-medium">{v}</dd></div>
                  ))}
                </dl>
                <div className="mt-auto flex flex-wrap items-center gap-4 pt-8">
                  {price && <p className="text-3xl font-bold tracking-tight">{price}<span className="text-sm font-normal" style={{ color: MUTED }}> / night</span></p>}
                  {link && <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white" style={{ background: INK }}><WhatsAppIcon size={15} /> Book on WhatsApp</a>}
                  {book && <a {...book} className="text-sm font-semibold" style={{ borderBottom: `2px solid ${accent}` }}>Book online</a>}
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
      <section className={`mx-auto grid max-w-[1400px] gap-5 px-5 ${lg ? "grid-cols-3" : md ? "grid-cols-2" : "grid-cols-1"}`} style={{ paddingTop: md ? 64 : 32 }}>
        {gallery.map((g, i) => (
          <Reveal key={g.url + i} delay={(i % 3) * 0.05}>
            <button type="button" onClick={() => onPhoto(i)} className="group block w-full text-left">
              <div className="overflow-hidden"><Img src={g.url} alt={g.caption} className="w-full object-cover transition duration-700 group-hover:scale-105" style={{ aspectRatio: i % 4 === 0 ? "4/5" : "1/1" }} /></div>
              <p className="mt-2 flex justify-between text-[12px]" style={{ color: MUTED }}><span>{g.caption || site.hotel.name}</span><span>Fig. {String(i + 1).padStart(2, "0")}</span></p>
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
      <PageTitle title="About" aside={c.about.heading} image={c.about.image} />
      <Section n={1} label="Story">
        {paragraphs(c.about.body).map((p, i) => (
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
            <p className="text-xl font-semibold">{loc.address}</p>
            {loc.directions && <p className="mt-3 leading-relaxed" style={{ color: MUTED }}>{loc.directions}</p>}
          </div>
          <MapFrame query={loc.mapQuery || loc.address || site.hotel.name} className={`h-[420px] w-full ${md ? "col-span-6" : ""}`} style={{ filter: "grayscale(1)" }} />
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
  const input = "w-full bg-transparent py-4 text-lg outline-none placeholder:text-[#a5a5a5]";
  const st = { borderBottom: `1px solid ${INK}` };
  return (
    <>
      <PageTitle title="Contact" aside="Questions, dates, special requests — ask away." />
      <Section n={1} label="Direct">
        <div className={`grid gap-5 ${md ? "grid-cols-3" : "grid-cols-1"}`}>
          {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="group p-6 text-white" style={{ background: "#25D366" }}><Label><span className="text-white/80">WhatsApp</span></Label><p className="mt-8 flex items-center justify-between text-xl font-semibold">+{site.whatsapp}<ArrowUpRight className="h-5 w-5 transition group-hover:rotate-45" /></p></a>}
          {c.phone && <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="p-6" style={{ border: `1px solid ${LINE}` }}><Label>Phone</Label><p className="mt-8 text-xl font-semibold">{c.phone}</p></a>}
          {c.email && <a href={`mailto:${c.email}`} className="p-6" style={{ border: `1px solid ${LINE}` }}><Label>Email</Label><p className="mt-8 break-all text-xl font-semibold">{c.email}</p></a>}
        </div>
      </Section>
      <Section n={2} label="Enquiry">
        <form onSubmit={f.submit} className="max-w-3xl">
          <input className={input} style={st} placeholder="Name" value={f.v.name} onChange={f.set("name")} />
          <div className="grid grid-cols-2 gap-5">
            <input type="date" className={input} style={st} value={f.v.checkIn} onChange={f.set("checkIn")} aria-label="Arrival" />
            <input type="date" className={input} style={st} value={f.v.checkOut} onChange={f.set("checkOut")} aria-label="Departure" />
          </div>
          <input className={input} style={st} placeholder="Guests" value={f.v.guests} onChange={f.set("guests")} />
          <textarea className={input} style={st} rows={3} placeholder="Message" value={f.v.message} onChange={f.set("message")} />
          <button type="submit" className="mt-8 inline-flex items-center gap-2 rounded-full px-7 py-4 text-sm font-semibold text-white" style={{ background: INK }}>Send via {f.via} <ArrowRight className="h-4 w-4" style={{ color: accent }} /></button>
        </form>
      </Section>
      <Section n={3} label="Find us">
        <p className="mb-5 text-xl font-semibold">{site.content.location?.address}</p>
        <MapFrame query={site.content.location?.mapQuery || site.hotel.name} className="h-[380px] w-full" style={{ filter: "grayscale(1)" }} />
      </Section>
    </>
  );
}

function Footer({ accent }) {
  const { site } = useSite();
  const { md } = useBp();
  return (
    <footer className="mx-auto max-w-[1400px] px-5" style={{ paddingTop: md ? 120 : 64 }}>
      <div className={`grid gap-5 py-8 ${md ? "grid-cols-4" : "grid-cols-2"}`} style={{ borderTop: `1px solid ${INK}` }}>
        <div><Label>Address</Label><p className="mt-2 text-sm">{site.content.location?.address}</p></div>
        <div><Label>Contact</Label><p className="mt-2 text-sm">{site.content.contact?.phone}<br />{site.content.contact?.email}</p></div>
        <div className={md ? "col-span-2" : "col-span-2"}><Label>Index</Label><div className="mt-2 flex flex-wrap gap-x-5 gap-y-1">{PAGES.map((p) => <PageLink key={p.id} page={p.id} className="text-sm hover:opacity-50">{p.label}</PageLink>)}</div></div>
      </div>
      <p className="select-none overflow-hidden whitespace-nowrap font-extrabold uppercase leading-[0.8] tracking-[-0.05em]" style={{ fontSize: md ? 168 : 64 }}>{site.hotel.name}</p>
      <div className="flex flex-wrap justify-between gap-2 py-6 text-xs" style={{ color: MUTED }}>
        <span>© {year()} {site.hotel.name}</span>
        <span>Website by <a href="https://botlify.site" style={{ borderBottom: `1px solid ${accent}` }}>Botlify</a></span>
      </div>
    </footer>
  );
}
