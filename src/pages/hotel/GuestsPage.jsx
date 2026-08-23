/**
 * Guests — everyone who has ever stayed, grouped from the booking history.
 *
 * NOTE: the backend has no guest-list endpoint (no /pms/guests, no
 * /hotel/guests), so this derives the roster client-side from
 * GET /pms/guests (unified server-side profiles), falling back to folding
 * GET /hotel/bookings client-side before the sync job has first run.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import api from "@/services/api";
import toast from "react-hot-toast";
import {
  BedDouble,
  CalendarDays,
  Moon,
  Phone,
  Search,
  Users,
  Wallet,
} from "lucide-react";
import Drawer from "@/components/ui/Drawer";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";

const PAGE_SIZE = 100;
const MAX_PAGES = 10; // up to 1,000 bookings — plenty for one property

const errMsg = (e, fallback) => e?.response?.data?.message || fallback;

const SOURCE_META = {
  booking_com: { label: "Booking.com", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  airbnb: { label: "Airbnb", cls: "bg-rose-50 text-rose-600 border-rose-200" },
  whatsapp: { label: "WhatsApp", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  instagram: { label: "Instagram", cls: "bg-purple-50 text-purple-700 border-purple-200" },
  tiktok: { label: "TikTok", cls: "bg-ink-900 text-white border-ink-900" },
  direct: { label: "Direct", cls: "bg-ink-50 text-ink-600 border-ink-200" },
  manual: { label: "Manual", cls: "bg-ink-50 text-ink-600 border-ink-200" },
  other_ota: { label: "Other OTA", cls: "bg-sky-50 text-sky-700 border-sky-200" },
};

function SourceBadge({ source }) {
  const m = SOURCE_META[source] || SOURCE_META.manual;
  return (
    <span
      className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full border ${m.cls}`}
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
          <div>
            {guest.phone && (
              <p className="text-sm text-ink-600 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-ink-400" />
                {guest.phone}
              </p>
            )}
            {guest.email && (
              <p className="text-sm text-ink-600 mt-1 truncate">{guest.email}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-ink-50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink-500">
                Stays
              </p>
              <p className="text-xl font-bold text-ink-900 mt-0.5">
                {guest.stays}
              </p>
            </div>
            <div className="rounded-lg bg-ink-50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink-500">
                Nights
              </p>
              <p className="text-xl font-bold text-ink-900 mt-0.5">
                {guest.nights}
              </p>
            </div>
            <div className="rounded-lg bg-ink-50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink-500">
                Revenue
              </p>
              <p className="text-base font-bold text-ink-900 mt-1 truncate">
                {money(guest.revenue, guest.currency)}
              </p>
            </div>
          </div>

          {guest.tags.length > 0 && (
            <div>
              <p className="text-xs font-bold text-ink-600 mb-2">Preferences</p>
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
            <p className="text-xs font-bold text-ink-600 mb-2">Stay history</p>
            <div className="space-y-2">
              {guest.bookings.map((b) => (
                <div
                  key={b._id}
                  className="rounded-lg border border-ink-100 p-3 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink-900">
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
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-ink-900">
                      {money(b.totalAmount, b.currency)}
                    </p>
                    {b.status === "cancelled" && (
                      <span className="badge-red mt-1">Cancelled</span>
                    )}
                  </div>
                </div>
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 sm:mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-brand-500" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-black text-ink-900 tracking-tight">
              Guests
            </h1>
            <p className="text-sm text-ink-500 mt-0.5">
              Everyone who has stayed with you.
            </p>
          </div>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name or phone"
            className="input pl-9 py-2"
            aria-label="Search guests"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
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
        <div className="card divide-y divide-ink-100">
          {filtered.map((g) => (
            <button
              key={g.key}
              type="button"
              onClick={() => setSelected(g)}
              className="w-full text-left px-4 py-3.5 hover:bg-ink-50/80 transition flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-full bg-brand-gradient flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {(g.name[0] || "G").toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-ink-900 truncate">
                    {g.name}
                  </p>
                  {g.returning && <span className="badge-brand">Returning</span>}
                </div>
                <p className="text-xs text-ink-500 truncate mt-0.5">
                  {g.phone || g.email || "No contact details"}
                </p>
                {g.sources.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {g.sources.slice(0, 3).map((s) => (
                      <SourceBadge key={s} source={s} />
                    ))}
                  </div>
                )}
              </div>

              <div className="hidden sm:flex items-center gap-5 flex-shrink-0 text-right">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400 flex items-center gap-1 justify-end">
                    <BedDouble className="w-3 h-3" /> Stays
                  </p>
                  <p className="text-sm font-bold text-ink-900">{g.stays}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400 flex items-center gap-1 justify-end">
                    <Moon className="w-3 h-3" /> Nights
                  </p>
                  <p className="text-sm font-bold text-ink-900">{g.nights}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400 flex items-center gap-1 justify-end">
                    <Wallet className="w-3 h-3" /> Revenue
                  </p>
                  <p className="text-sm font-bold text-ink-900">
                    {money(g.revenue, g.currency)}
                  </p>
                </div>
                <div className="min-w-[80px]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400 flex items-center gap-1 justify-end">
                    <CalendarDays className="w-3 h-3" /> Last
                  </p>
                  <p className="text-sm font-bold text-ink-900">
                    {fmtDate(g.lastStay)}
                  </p>
                </div>
              </div>

              {/* compact summary on phones */}
              <div className="sm:hidden text-right flex-shrink-0">
                <p className="text-sm font-bold text-ink-900">{g.stays}</p>
                <p className="text-[10px] text-ink-400">
                  stay{g.stays === 1 ? "" : "s"}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      <GuestPanel guest={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
