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
  instagram: { label: "Instagram", cls: "bg-purple-500/10 text-purple-700 ring-purple-500/20" },
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
            <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-full bg-sunset font-display text-lg font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_10px_22px_-10px_rgba(255,61,119,0.6)]">
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
              <p className="mt-0.5 font-display text-xl font-semibold tracking-[-0.02em] text-ink-900">
                <NumberTicker value={guest.stays} duration={0.8} />
              </p>
            </div>
            <div className="rounded-2xl bg-white/80 p-3 ring-1 ring-ink-900/[0.06] shadow-[inset_0_1px_0_#fff]">
              <p className="text-[11px] text-ink-500">Nights</p>
              <p className="mt-0.5 font-display text-xl font-semibold tracking-[-0.02em] text-ink-900">
                <NumberTicker value={guest.nights} duration={0.8} />
              </p>
            </div>
            <div className="rounded-2xl bg-sunset-soft p-3 ring-1 ring-sunset-flame/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
              <p className="text-[11px] text-ink-500">Revenue</p>
              <p className="mt-1 truncate font-display text-sm font-semibold tabular-nums text-ink-900 sm:text-base">
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
                  initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.5, delay: Math.min(i, 10) * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-start justify-between gap-3 rounded-2xl bg-white/75 p-3.5 ring-1 ring-ink-900/[0.06] shadow-[inset_0_1px_0_#fff] transition-colors duration-300 hover:bg-white"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold tabular-nums text-ink-900">
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
                    <p className="text-sm font-semibold tabular-nums text-ink-900">
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

  return (
    <div className="mx-auto max-w-5xl px-4 pb-10 pt-6 sm:px-6 sm:pt-8 lg:px-8">
      <Reveal className="mb-6 flex flex-wrap items-center justify-between gap-4 sm:mb-8">
        <div className="flex min-w-0 items-center gap-3.5">
          <div className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-sunset text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_10px_22px_-10px_rgba(255,61,119,0.6)]">
            <Users className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-semibold tracking-[-0.03em] text-ink-900 sm:text-3xl">
              Guests
            </h1>
            <p className="mt-0.5 text-sm text-ink-500">
              Everyone who has{" "}
              <span className="font-serif text-[1.05em] italic text-ink-700">stayed</span> with
              you.
            </p>
          </div>
        </div>
        <div className="group relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 transition-all duration-500 ease-spring group-focus-within:rotate-[-12deg] group-focus-within:scale-110 group-focus-within:text-sunset-flame" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name or phone"
            className="input rounded-2xl py-2.5 pl-10"
            aria-label="Search guests"
          />
        </div>
      </Reveal>

      {loading ? (
        <div className="card overflow-hidden">
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
            <button type="button" onClick={load} className="btn-primary">
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
        <Reveal y={16} className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-ink-900/[0.06] bg-white/60 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-ink-400 backdrop-blur">
            <span>
              <span className="tabular-nums">{filtered.length}</span> guest{filtered.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="divide-y divide-ink-900/[0.05]">
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
              className="group flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors duration-300 hover:bg-white/80"
            >
              <div className="relative flex-shrink-0">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-sunset font-display text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_6px_14px_-8px_rgba(255,61,119,0.6)] transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:scale-105 group-hover:rotate-[-6deg]">
                  {(g.name[0] || "G").toUpperCase()}
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-semibold text-ink-900">
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
                  <p className="flex items-center justify-end gap-1 text-[10px] font-semibold uppercase tracking-wider text-ink-400">
                    <BedDouble className="h-3 w-3" strokeWidth={1.8} /> Stays
                  </p>
                  <p className="text-sm font-semibold tabular-nums text-ink-900">{g.stays}</p>
                </div>
                <div>
                  <p className="flex items-center justify-end gap-1 text-[10px] font-semibold uppercase tracking-wider text-ink-400">
                    <Moon className="h-3 w-3" strokeWidth={1.8} /> Nights
                  </p>
                  <p className="text-sm font-semibold tabular-nums text-ink-900">{g.nights}</p>
                </div>
                <div>
                  <p className="flex items-center justify-end gap-1 text-[10px] font-semibold uppercase tracking-wider text-ink-400">
                    <Wallet className="h-3 w-3" strokeWidth={1.8} /> Revenue
                  </p>
                  <p className="text-sm font-semibold tabular-nums text-ink-900">
                    {money(g.revenue, g.currency)}
                  </p>
                </div>
                <div className="min-w-[80px]">
                  <p className="flex items-center justify-end gap-1 text-[10px] font-semibold uppercase tracking-wider text-ink-400">
                    <CalendarDays className="h-3 w-3" strokeWidth={1.8} /> Last
                  </p>
                  <p className="text-sm font-semibold tabular-nums text-ink-900">
                    {fmtDate(g.lastStay)}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-ink-300 transition-all duration-500 ease-spring group-hover:translate-x-1 group-hover:text-sunset-flame" />
              </div>

              {/* compact summary on phones */}
              <div className="flex-shrink-0 text-right sm:hidden">
                <p className="text-sm font-semibold tabular-nums text-ink-900">{g.stays}</p>
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
