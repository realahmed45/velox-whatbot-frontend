# Botlify 2026 — "Bali sunset" design system

The single source of truth for how every Botlify screen looks and moves.
Built Nov 2026. If a page disagrees with this file, the page is wrong.

## What Botlify is (the pitch — use these words, nothing else)

**Botlify is the AI channel manager for hotels.** It syncs rooms, rates and
availability across Airbnb, Booking.com and Expedia — and its AI answers every
guest message *inside* those OTA inboxes and on WhatsApp, 24/7, replacing the
human work of guest messaging.

- Core promise: "Your guests message on Airbnb, Booking.com or WhatsApp. Botlify
  answers — instantly, accurately, in their language — and books them."
- **Instagram is gone.** Never mention, show or link Instagram anywhere in the
  UI or marketing. Messaging channels = the OTA inboxes (Airbnb, Booking.com,
  Expedia) + WhatsApp.
- Live OTAs to name: Booking.com, Airbnb, Expedia. Others are "coming".

## The idea

Botlify is an AI concierge for hotels, starting in Bali. The brand is a Bali
sunset seen through liquid glass:

- **One gradient**, four stops: gold `#FFB547` → flame `#FF6A2B` → magenta
  `#FF3D77` → twilight violet `#7C5CFF`. Tailwind: `bg-sunset`, `text-sunset`
  (class), `bg-sunset-soft` (12–16% tint). Colours: `sunset-gold`,
  `sunset-flame`, `sunset-coral`, `sunset-magenta`, `sunset-violet`.
  Use the full gradient **sparingly**: primary buttons, the logo, one hero
  word, progress fills, active indicators. Never as a big flat panel.
- **Liquid glass surfaces**: frosted fill + a specular 1px top highlight + a
  hairline ring, floating over a slow aurora. On light: `.card`, `.glass`,
  `.glass-strong`. On dark: `.card-dark`, `.glass-dark`.
- **Springy motion**: every control reacts — lift, press-squash, icon hop.
  Easing `ease-spring` (`cubic-bezier(.34,1.56,.64,1)`) for physical things,
  `ease-out-expo` for reveals. Everything respects `prefers-reduced-motion`
  (handled globally in index.css and inside the FX components).

**Everything is LIGHT** (Nov 2026 update — the dark marketing look was
rejected as too dark). Dark is reserved for small accents only: the dashboard
sidebar, a code block, at most one contrasting band per page.

Canvases:
- **Dashboard (logged-in app)**: LIGHT. Warm paper canvas `var(--canvas)`
  (#F7F5F2) with a faint aurora + dot grid behind (already rendered by
  `DashboardLayout`). Content sits on light glass cards. Sidebar is night glass.
  Hotel staff read this all day — contrast and density beat spectacle.
- **Marketing + auth + onboarding**: LIGHT and airy. White / warm paper
  (`bg-[#FBFAF8]` or `var(--canvas)`), `<Aurora />` (light, static), ink type
  (`text-ink-950` headings, `text-ink-600` body), `.card` panels,
  `.btn-secondary` secondary buttons. No `bg-night-*` page backgrounds, no
  `.card-dark` panels, no white-on-dark text blocks.

## Performance rules (the site lagged — these are mandatory)

- **No animated `filter: blur`** in framer-motion (initial/animate/exit). Animate
  only `opacity` and `transform` (x, y, scale, rotate).
- **No `backdrop-blur` on cards or list rows.** Allowed only on a few
  overlays: sticky headers/nav, modals, dropdowns.
- **No infinite animations on large or blurred elements.** Infinite loops only
  on tiny things (a typing dot, a status ping).
- No scroll-jacking / sticky horizontal scroll sections, no custom cursors, no
  grain overlays, no parallax on big sections.
- Reveal on scroll at most once per element, short (≤0.5s), small offset.
- Static blurred decorative blobs are fine (painted once) — keep them few.

## Type

- Headings: `font-display` (Inter Tight), tight tracking: page titles
  `text-2xl sm:text-3xl font-semibold tracking-[-0.03em]`; heroes up to
  `text-6xl md:text-8xl tracking-[-0.05em] leading-[0.95]`.
- Editorial accent: `font-serif italic` (Instrument Serif) for **one or two
  words** in a headline or a soft subtitle, e.g.
  `Good morning, <span className="font-serif italic font-normal">Made</span>`.
  Never for body copy, never for UI labels.
- Body: Inter (`font-sans`), `text-sm`/`text-[15px]`, `text-ink-600` on light,
  `text-white/60` on dark. Numbers: `tabular-nums`. Codes/IDs: `font-mono`.

## Shared CSS classes (index.css — already restyled, just use them)

| Class | Use |
|---|---|
| `.btn-primary` | Main action. Sunset gradient, sheen sweep on hover, lift, press-squash. One per view region. |
| `.btn-secondary` | Frosted white chip. |
| `.btn-ghost` | Quiet action. |
| `.btn-danger` | Destructive. |
| `.btn-glass-dark` | Secondary on dark canvases. |
| `.input` / `.textarea` / `.label` | All form fields. Focus = flame border + soft glow. |
| `.card` | Light liquid-glass container (rounded-2xl). |
| `.card-hover` | Card that lifts with a sunset edge on hover (clickable cards). |
| `.card-dark` | Dark liquid-glass container. |
| `.toggle` (+ `input` + `.slider`) | Springy switch; knob stretches when pressed. |
| `.badge-green/-yellow/-red/-blue/-gray/-brand/-premium` | Status pills (soft fill + inset ring). |
| `.spotlight` | Add with `<Spotlight>`; cursor-following glow. |
| `.text-sunset` | Gradient text (one word!). |
| `.divider` | Fading hairline. |
| `.bg-dot-grid` / `.bg-dot-grid-dark` | Texture. |
| `.mask-fade-x` / `.mask-fade-b` | Edge fades. |
| `.grain` | Film grain overlay (needs `relative`). |

## FX components — `import { … } from "@/components/fx"`

- `<Aurora variant="light|dark" fixed? />` drifting sunset blobs (parent needs `relative isolate` unless `fixed`).
- `<Spotlight as="div" className="card …">` cursor glow on any card. Use on
  stat cards, feature cards, list rows that are clickable.
- `<Magnetic strength={0.3}>` wrap a primary CTA or icon button so it leans toward the pointer.
- `<Tilt max={6}>` 3-D tilt + glare for hero mockups / showcase cards only.
- `<Reveal delay={i*0.06}>` / `<RevealGroup step={0.06}>` blur-up on scroll; stagger lists and grids.
- `<NumberTicker value={n} prefix="$" decimals={0} />` count-up for KPIs.
- `<SlidingTabs items={[{value,label,icon}]} value onChange dark? size="sm|md" />` springy segmented control — replace hand-rolled tab rows with it.
- `<Marquee speed={30}>` infinite strip.
- `<PulseDot color="bg-emerald-500" />` live status.
- `framer-motion` is available for anything bespoke (`AnimatePresence` for
  modals/dropdowns: scale .96→1 + blur 4px→0 + spring stiffness ~420 damping ~30).

## Patterns

- **Page header**: title (`font-display`, with an optional serif-italic word),
  one-line `text-ink-500` subtitle, actions right. Generous top spacing
  (`pt-6 sm:pt-8`), content max width ~`max-w-7xl` with `px-4 sm:px-6 lg:px-8`.
- **KPI / stat cards**: `<Spotlight className="card p-5">`, small label
  `text-[13px] text-ink-500`, big number `font-display text-3xl tabular-nums`
  via `<NumberTicker>`, a tiny icon tile `rounded-xl bg-sunset-soft
  text-sunset-flame` that hops on hover (`group-hover:-translate-y-0.5
  group-hover:rotate-[-8deg] transition-transform duration-500 ease-spring`).
- **Icon tiles**: `h-10 w-10 rounded-xl grid place-items-center` with
  `bg-sunset-soft` + coloured icon, or `bg-sunset text-white` for the hero
  one. Icons from lucide-react, `strokeWidth={1.8}`.
- **Lists/tables**: rows on a `.card`, `divide-y divide-ink-900/[0.06]`, row
  hover `hover:bg-white/80 transition-colors`, sticky header
  `bg-white/70 backdrop-blur`. Status via badge classes.
- **Empty states**: centred, an icon tile inside a soft sunset halo
  (`bg-sunset opacity-20 blur-2xl` behind), display-font title, one sentence,
  one `.btn-primary`.
- **Modals/drawers**: `.glass-strong rounded-3xl`, backdrop
  `bg-night-950/40 backdrop-blur-md`, AnimatePresence spring pop.
- **Loading**: shimmer skeletons (`bg-ink-900/[0.06]` + `animate-pulse`), never
  bare spinners for page loads.
- **Hover rules**: clickable things move (lift 2–3px or icon hop); static
  things don't. Press = scale .96. Durations 300–500ms with spring.
- **Colour for meaning**: emerald = confirmed/live, amber = pending,
  rose = error/cancelled, sky = info. Sunset = brand/action only.

## Hard rules

1. **Never change behaviour.** Restyle markup and classes only: keep every
   handler, API call, state, prop, route, permission check, test id and text
   meaning. If copy is clearly wrong you may tighten it, never remove
   information.
2. Never import from `three` or `vanta` (removed from the new design).
3. Don't edit `index.css`, `tailwind.config.js`, `components/fx`, `Logo`,
   `BotlifyMark`, `Sidebar`, `Header`, `DashboardLayout` or `LandingPage` —
   they're owned by the system. Need something new? Compose Tailwind classes
   locally.
4. Replace legacy orange-only styling (`bg-brand-500` buttons, `from-brand-*
   to-brand-*` gradients, `shadow-glow`) with the system classes above.
   `brand-*` colours still exist for small text accents.
5. Keep it accessible: visible focus (global), contrast AA, `aria-*` intact,
   hit targets ≥ 40px on touch.
6. Mobile first: every screen must work at 360px wide with no horizontal scroll.
7. The app must build: `npx vite build` from `frontend/`.
