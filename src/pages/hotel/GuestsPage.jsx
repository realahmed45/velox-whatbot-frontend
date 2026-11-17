/**
 * Guests — everyone who has ever stayed, grouped from the booking history.
 *
 * NOTE: the backend has no guest-list endpoint (no /pms/guests, no
 * /hotel/guests), so this derives the roster client-side from
 * GET /pms/guests (unified server-side profiles), falling back to folding
 * GET /hotel/bookings client-side before the sync job has first run.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import api from "@/services/api";
import toast from "react-hot-toast";
import {
  BedDouble,
  CalendarDays,
  ChevronRight,
  Moon,
  Phone,
  Search,
  Users,
  Wallet,
} from "lucide-react";
import Drawer from "@/components/ui/Drawer";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import { NumberTicker, Reveal, Spotlight } from "@/components/fx";

const PAGE_SIZE = 100;
const MAX_PAGES = 10; // up to 1,000 bookings — plenty for one property

const errMsg = (e, fallback) => e?.response?.data?.message || fallback;

const SOURCE_META = {
  booking_com: { label: "Booking.com", cls: "bg-blue-500/10 text-blue-700 ring-blue-500/20" },
  airbnb: { label: "Airbnb", cls: "bg-rose-500/10 text-rose-600 ring-rose-500/20" },
  whatsapp: { label: "WhatsApp", cls: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20" },
  tiktok: { label: "TikTok", cls: "bg-ink-900 text-white ring-ink-900" },
  direct: { label: "Direct", cls: "bg-ink-900/[0.04] text-ink-600 ring-ink-900/10" },
  manual: { label: "Manual", cls: "bg-ink-900/[0.04] text-ink-600 ring-ink-900/10" },
  other_ota: { label: "Other OTA", cls: "bg-sky-500/10 text-sky-700 ring-sky-500/20" },
};

function SourceBadge({ source }) {
  const m = SOURCE_META[source] || SOURCE_META.manual;
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${m.cls}`}
    >
      {m.label}
    </span>
  );
}

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

const money = (amount, currency) =>
  `${currency || "USD"} ${Number(amount || 0).toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })}`;

const nightsBetween = (a, b) => {
  if (!a || !b) return 0;
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.max(0, Math.round(ms / 86400000));
};

/**
 * Fold a flat booking list into one row per guest.
 * Key: normalised phone when present, else lowercased name.
 */
function groupGuests(bookings) {
  const map = new Map();
  for (const b of bookings) {
    const phone = String(b.guestPhone || "").replace(/[^\d+]/g, "");
    const name = String(b.guestName || "").trim();
    const key = phone || name.toLowerCase();
    if (!key) continue;

    let g = map.get(key);
    if (!g) {
      g = {
        key,
        name: name || "Guest",
        phone: b.guestPhone || "",
        email: b.guestEmail || "",
        stays: 0,
        nights: 0,
        revenue: 0,
        currency: b.currency || "USD",
        lastStay: null,
        sources: new Set(),
        tags: new Set(),
        bookings: [],
      };
      map.set(key, g);
    }

    // Cancelled stays still belong in the history, but never in the totals.
    const counts = b.status !== "cancelled";
    if (counts) {
      g.stays += 1;
      g.nights += b.nights || nightsBetween(b.checkIn, b.checkOut);
      g.revenue += Number(b.totalAmount || 0);
    }
    if (name && !g.name) g.name = name;
    if (!g.phone && b.guestPhone) g.phone = b.guestPhone;
    if (!g.email && b.guestEmail) g.email = b.guestEmail;
    if (b.source) g.sources.add(b.source);
    if (b.checkIn && (!g.lastStay || new Date(b.checkIn) > new Date(g.lastStay))) {
      g.lastStay = b.checkIn;
    }
    if (b.specialRequests) g.tags.add(String(b.specialRequests).slice(0, 60));
    g.bookings.push(b);
  }

  return [...map.values()]
    .map((g) => ({
      ...g,
      sources: [...g.sources],
      tags: [...g.tags],
      bookings: g.bookings.sort(
        (a, b) => new Date(b.checkIn) - new Date(a.checkIn),
      ),
      returning: g.stays > 1,
    }))
    .sort((a, b) => new Date(b.lastStay || 0) - new Date(a.lastStay || 0));
}

/* ── Guest detail panel ──────────────────────────────────────────────────── */

function GuestPanel({ guest, onClose }) {
  return (
    <Drawer open={!!guest} onClose={onClose} title={guest?.name || "Guest"}>
      {guest && (
        <div className="space-y-5">
          <div className="flex items-center gap-3.5">
            <div className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-full bg-[#FF5A1F] font-geist text-xl font-semibold text-white shadow-[0_10px_22px_-10px_rgba(255,90,31,0.7)]">
              {(guest.name?.[0] || "G").toUpperCase()}
            </div>
            <div className="min-w-0">
              {guest.phone && (
                <p className="flex items-center gap-2 text-sm text-ink-600">
                  <Phone className="h-3.5 w-3.5 text-ink-400" strokeWidth={1.8} />
                  {guest.phone}
                </p>
              )}
              {guest.email && (
                <p className="mt-1 truncate text-sm text-ink-600">{guest.email}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-2xl bg-white/80 p-3 ring-1 ring-ink-900/[0.06] shadow-[inset_0_1px_0_#fff]">
              <p className="text-[11px] text-ink-500">Stays</p>
              <p className="mt-0.5 font-geist text-xl font-semibold tracking-[-0.02em] text-ink-900">
                <NumberTicker value={guest.stays} duration={0.8} />
              </p>
            </div>
            <div className="rounded-2xl bg-white/80 p-3 ring-1 ring-ink-900/[0.06] shadow-[inset_0_1px_0_#fff]">
              <p className="text-[11px] text-ink-500">Nights</p>
              <p className="mt-0.5 font-geist text-xl font-semibold tracking-[-0.02em] text-ink-900">
                <NumberTicker value={guest.nights} duration={0.8} />
              </p>
            </div>
            <div className="rounded-2xl bg-[#0A0A0A] p-3">
              <p className="text-[11px] text-white/55">Revenue</p>
              <p className="mt-1 truncate font-geist text-sm font-semibold tabular-nums text-white sm:text-base">
                {money(guest.revenue, guest.currency)}
              </p>
            </div>
          </div>

          {guest.tags.length > 0 && (
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-500">Preferences</p>
              <div className="flex flex-wrap gap-1.5">
                {guest.tags.map((t) => (
                  <span key={t} className="badge-gray">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-500">Stay history</p>
            <div className="space-y-2">
              {guest.bookings.map((b, i) => (
                <motion.div
                  key={b._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: Math.min(i, 10) * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-start justify-between gap-3 rounded-2xl bg-white/75 p-3.5 ring-1 ring-ink-900/[0.06] shadow-[inset_0_1px_0_#fff] transition-colors duration-300 hover:bg-white"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold tabular-nums text-[#0A0A0A]">
                      {fmtDate(b.checkIn)} → {fmtDate(b.checkOut)}
                    </p>
                    <p className="text-xs text-ink-500 mt-0.5 truncate">
                      {[b.roomTypeId?.name, b.code].filter(Boolean).join(" · ") ||
                        "—"}
                    </p>
                    <div className="mt-1.5">
                      <SourceBadge source={b.source} />
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-sm font-semibold tabular-nums text-[#0A0A0A]">
                      {money(b.totalAmount, b.currency)}
                    </p>
                    {b.status === "cancelled" && (
                      <span className="badge-red mt-1">Cancelled</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */

export default function GuestsPage() {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [guests, setGuests] = useState([]);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Unified profiles built server-side (one person across every channel).
      const { data } = await api.get("/pms/guests", { params: { limit: 100 } });
      const profiles = (data.guests || []).map((g) => ({
        id: g._id,
        name: g.name || "Guest",
        phone: g.phone || "",
        email: g.email || "",
        stays: g.stats?.staysCount || 0,
        nights: g.stats?.nightsTotal || 0,
        revenue: g.stats?.revenueTotal || 0,
        currency: g.stats?.currency || "USD",
        lastStay: g.stats?.lastStayAt || null,
        channels: [...new Set((g.identities || []).map((i) => i.channel))],
        // The list keys rows on `key` and reads `sources` / `returning` —
        // the same fields the booking-folded fallback produces.
        key: String(g._id),
        sources: [...new Set((g.identities || []).map((i) => i.channel).filter(Boolean))],
        returning: (g.stats?.staysCount || 0) > 1,
        preferences: g.preferences || [],
        tags: g.tags || [],
        bookings: [],
      }));

      // The hourly sync builds these profiles. Until it has run for a brand-new
      // hotel the list is empty, so fall back to folding the booking history
      // client-side — the guest list is never blank when bookings exist.
      if (profiles.length) {
        setGuests(profiles);
      } else {
        const all = [];
        for (let page = 1; page <= MAX_PAGES; page += 1) {
          const { data: bd } = await api.get("/hotel/bookings", {
            params: { page, limit: PAGE_SIZE },
          });
          const rows = bd.bookings || [];
          all.push(...rows);
          if (rows.length < PAGE_SIZE || page >= (bd.pages || 1)) break;
        }
        setGuests(groupGuests(all));
      }
      setFailed(false);
    } catch (e) {
      setFailed(true);
      toast.error(errMsg(e, "Couldn't load your guests"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return guests;
    return guests.filter(
      (g) =>
        g.name.toLowerCase().includes(term) ||
        g.phone.toLowerCase().includes(term) ||
        g.email.toLowerCase().includes(term),
    );
  }, [guests, q]);

  // Read-only roster summary for the KPI strip.
  const summary = useMemo(
    () => ({
      total: guests.length,
      returning: guests.filter((g) => g.returning).length,
      stays: guests.reduce((n, g) => n + (Number(g.stays) || 0), 0),
      nights: guests.reduce((n, g) => n + (Number(g.nights) || 0), 0),
    }),
    [guests],
  );

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-12 pt-6 font-geist sm:px-6 sm:pt-8 lg:px-8">
      <Reveal className="mb-6 flex flex-wrap items-end justify-between gap-4 sm:mb-8">
        <div className="flex min-w-0 items-center gap-3.5">
          <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl bg-[#0A0A0A] text-[#FF5A1F] shadow-[0_14px_28px_-14px_rgba(10,10,10,0.7)]">
            <Users className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <h1 className="font-geist text-[28px] font-semibold leading-tight tracking-[-0.045em] text-[#0A0A0A] sm:text-[36px]">
              Guests
            </h1>
            <p className="mt-0.5 text-sm text-black/55">
              Everyone who has{" "}
              <span className="font-semibold text-[#FF5A1F]">stayed</span> with
              you.
            </p>
          </div>
        </div>
        <div className="group relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 transition-all duration-500 ease-spring group-focus-within:rotate-[-12deg] group-focus-within:scale-110 group-focus-within:text-[#FF5A1F]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name or phone"
            className="input rounded-xl bg-white py-3 pl-10"
            aria-label="Search guests"
          />
        </div>
      </Reveal>

      {/* KPI strip */}
      {!loading && !failed && guests.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {[
            { label: "Guests", value: summary.total, icon: Users, hero: true },
            { label: "Returning", value: summary.returning, icon: ChevronRight },
            { label: "Stays", value: summary.stays, icon: BedDouble },
            { label: "Nights", value: summary.nights, icon: Moon },
          ].map((k, i) => (
            <Reveal key={k.label} delay={i * 0.05} className="h-full">
              <div
                className={`group relative h-full overflow-hidden rounded-2xl p-4 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 sm:p-5 ${
                  k.hero
                    ? "bg-[#0A0A0A] text-white shadow-[0_24px_48px_-28px_rgba(10,10,10,0.8)]"
                    : "bg-white ring-1 ring-black/[0.06] hover:shadow-[0_20px_40px_-26px_rgba(255,90,31,0.55)] hover:ring-[#FF5A1F]/25"
                }`}
              >
                {k.hero && (
                  <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#FF5A1F] opacity-30 blur-2xl" />
                )}
                <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-[#FF5A1F] transition-transform duration-500 group-hover:scale-x-100" />
                <div className="relative flex items-start justify-between gap-2">
                  <p className={`text-[11px] font-semibold uppercase tracking-[0.08em] ${k.hero ? "text-white/55" : "text-black/45"}`}>
                    {k.label}
                  </p>
                  <span
                    className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg] ${
                      k.hero ? "bg-[#FF5A1F] text-white" : "bg-[#FFF1EA] text-[#FF5A1F]"
                    }`}
                  >
                    <k.icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                  </span>
                </div>
                <p className={`relative mt-3 font-geist text-3xl font-semibold tracking-[-0.04em] tabular-nums sm:text-[34px] ${k.hero ? "text-white" : "text-[#0A0A0A]"}`}>
                  <NumberTicker value={k.value} />
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      )}

      {loading ? (
        <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/[0.06]">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 border-b border-ink-900/[0.05] px-4 py-4 last:border-0"
            >
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-2.5 w-1/4" />
              </div>
              <Skeleton className="hidden h-6 w-40 rounded-lg sm:block" />
            </div>
          ))}
        </div>
      ) : failed ? (
        <EmptyState
          icon={Users}
          title="Couldn't load guests"
          description="We couldn't reach your booking history. Check your connection and try again."
          action={
            <button type="button" onClick={load} className="btn bg-[#FF5A1F] text-white shadow-[0_10px_24px_-12px_rgba(255,90,31,0.8)] hover:bg-[#E84A12] hover:-translate-y-0.5 active:scale-[0.97]">
              Try again
            </button>
          }
        />
      ) : guests.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No guests yet"
          description="Once you take your first booking, every guest will appear here with their stay history."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matches"
          description={`No guest matches "${q}". Try a different name or phone number.`}
        />
      ) : (
        <Reveal y={16} className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/[0.06] shadow-[0_24px_48px_-36px_rgba(10,10,10,0.35)]">
          <div className="flex items-center justify-between border-b border-black/[0.06] bg-[#FAFAFA] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-black/45">
            <span>
              <span className="tabular-nums">{filtered.length}</span> guest{filtered.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="divide-y divide-black/[0.05]">
          {filtered.map((g, i) => (
            <Spotlight
              as={motion.button}
              key={g.key}
              type="button"
              onClick={() => setSelected(g)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: Math.min(i, 12) * 0.03, ease: [0.16, 1, 0.3, 1] }}
              whileTap={{ scale: 0.985 }}
              className="group flex w-full items-center gap-3 px-4 py-3.5 text-left transition-[background-color,box-shadow] duration-200 hover:bg-[#FFF1EA]/50 hover:shadow-[inset_3px_0_0_#FF5A1F]"
            >
              <div className="relative flex-shrink-0">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-[#0A0A0A] font-geist text-sm font-semibold text-white ring-2 ring-white transition-[transform,background-color] group-hover:bg-[#FF5A1F] duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:scale-105 group-hover:rotate-[-6deg]">
                  {(g.name[0] || "G").toUpperCase()}
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-[15px] font-semibold tracking-[-0.01em] text-[#0A0A0A]">
                    {g.name}
                  </p>
                  {g.returning && <span className="badge-brand">Returning</span>}
                </div>
                <p className="mt-0.5 truncate text-xs text-ink-500">
                  {g.phone || g.email || "No contact details"}
                </p>
                {g.sources.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {g.sources.slice(0, 3).map((s) => (
                      <SourceBadge key={s} source={s} />
                    ))}
                  </div>
                )}
              </div>

              <div className="hidden flex-shrink-0 items-center gap-5 text-right sm:flex">
                <div>
                  <p className="flex items-center justify-end gap-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-black/40">
                    <BedDouble className="h-3 w-3" strokeWidth={1.8} /> Stays
                  </p>
                  <p className="text-sm font-semibold tabular-nums text-[#0A0A0A]">{g.stays}</p>
                </div>
                <div>
                  <p className="flex items-center justify-end gap-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-black/40">
                    <Moon className="h-3 w-3" strokeWidth={1.8} /> Nights
                  </p>
                  <p className="text-sm font-semibold tabular-nums text-[#0A0A0A]">{g.nights}</p>
                </div>
                <div>
                  <p className="flex items-center justify-end gap-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-black/40">
                    <Wallet className="h-3 w-3" strokeWidth={1.8} /> Revenue
                  </p>
                  <p className="text-sm font-semibold tabular-nums text-[#0A0A0A]">
                    {money(g.revenue, g.currency)}
                  </p>
                </div>
                <div className="min-w-[80px]">
                  <p className="flex items-center justify-end gap-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-black/40">
                    <CalendarDays className="h-3 w-3" strokeWidth={1.8} /> Last
                  </p>
                  <p className="text-sm font-semibold tabular-nums text-[#0A0A0A]">
                    {fmtDate(g.lastStay)}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-ink-300 transition-all duration-500 ease-spring group-hover:translate-x-1 group-hover:text-[#FF5A1F]" />
              </div>

              {/* compact summary on phones */}
              <div className="flex-shrink-0 text-right sm:hidden">
                <p className="text-sm font-semibold tabular-nums text-[#0A0A0A]">{g.stays}</p>
                <p className="text-[10px] text-ink-400">
                  stay{g.stays === 1 ? "" : "s"}
                </p>
              </div>
            </Spotlight>
          ))}
          </div>
        </Reveal>
      )}

      <GuestPanel guest={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
