/**
 * The hotel's own booking page — /book/:slug.
 *
 * This is the part of Botlify that owes nothing to an OTA: the hotel's rooms,
 * its live availability, its guest, and no commission to anybody. It is also
 * the first page a guest ever sees of a hotel, so it is built to look like the
 * hotel's own site rather than like our dashboard.
 *
 * Public: no login, no session, no workspace header — so it uses a bare axios
 * client. The shared app client attaches auth that would be meaningless here.
 *
 * Three steps, one screen: pick your dates, pick a room, leave your details.
 * Availability is asked for only once dates exist, because "is it free?" has no
 * meaning before then.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  BedDouble,
  Check,
  Loader2,
  MapPin,
  Minus,
  Plus,
  Star,
  Users,
} from "lucide-react";

const API =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
  "https://velox-whatbot-backend.onrender.com/api";

/** Today and tomorrow as yyyy-mm-dd, for the date inputs. */
const isoDay = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

const money = (n, currency) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);

export default function PublicBookingPage() {
  const { slug } = useParams();

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [checkIn, setCheckIn] = useState(isoDay(1));
  const [checkOut, setCheckOut] = useState(isoDay(3));
  const [adults, setAdults] = useState(2);

  const [rooms, setRooms] = useState(null); // null until dates are checked
  const [checking, setChecking] = useState(false);
  const [picked, setPicked] = useState(null);

  const [guest, setGuest] = useState({
    guestName: "",
    guestPhone: "",
    guestEmail: "",
    specialRequests: "",
  });
  const [booking, setBooking] = useState(false);
  const [confirmed, setConfirmed] = useState(null);
  const [error, setError] = useState("");

  // ── The hotel itself ──────────────────────────────────────────────────
  useEffect(() => {
    let alive = true;
    axios
      .get(`${API}/book/${slug}`)
      .then(({ data }) => {
        if (!alive) return;
        setHotel(data);
      })
      .catch(() => {
        if (alive) setNotFound(true);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [slug]);

  // ── Live availability for the chosen dates ────────────────────────────
  const checkDates = useCallback(async () => {
    if (!checkIn || !checkOut || checkOut <= checkIn) {
      setError("Check-out needs to be after check-in.");
      return;
    }
    setChecking(true);
    setError("");
    setPicked(null);
    try {
      const { data } = await axios.get(`${API}/book/${slug}/availability`, {
        params: { checkIn, checkOut, adults },
      });
      setRooms(data.rooms || []);
    } catch (e) {
      setError(
        e?.response?.data?.message || "We couldn't check those dates just now.",
      );
      setRooms([]);
    } finally {
      setChecking(false);
    }
  }, [slug, checkIn, checkOut, adults]);

  const submit = async () => {
    if (!picked) return;
    setBooking(true);
    setError("");
    try {
      const { data } = await axios.post(`${API}/book/${slug}/book`, {
        roomTypeId: picked.id,
        checkIn,
        checkOut,
        adults,
        ...guest,
      });
      setConfirmed(data);
    } catch (e) {
      setError(
        e?.response?.data?.message || "We couldn't complete that booking.",
      );
      // The room may have just gone — re-read availability so the page is honest.
      checkDates();
    } finally {
      setBooking(false);
    }
  };

  const nights = useMemo(() => {
    const a = new Date(checkIn);
    const b = new Date(checkOut);
    const n = Math.round((b - a) / 86400000);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [checkIn, checkOut]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFAF8]">
        {/* Shimmer skeleton in the page's own shape — hero, then the date bar. */}
        <div className="h-56 sm:h-72 bg-ink-900/[0.06] animate-pulse" />
        <div className="max-w-3xl mx-auto px-4 sm:px-5 -mt-8 relative">
          <div className="rounded-3xl bg-white/80 p-5 shadow-[inset_0_1px_0_#fff,0_0_0_1px_rgba(15,23,42,0.06),0_20px_50px_-24px_rgba(15,23,42,0.25)] backdrop-blur-xl">
            <div className="grid sm:grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-[62px] rounded-xl bg-ink-900/[0.06] animate-pulse" />
              ))}
            </div>
          </div>
          <div className="mt-6 h-28 rounded-3xl bg-ink-900/[0.05] animate-pulse" />
          <span className="sr-only" role="status">
            <Loader2 className="w-4 h-4" /> Loading
          </span>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#FBFAF8] p-6">
        <div aria-hidden className="absolute h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(15,23,42,0.07),transparent_65%)]" />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-sm text-center"
        >
          <span className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-white/80 text-ink-700 shadow-[inset_0_1px_0_#fff,0_0_0_1px_rgba(15,23,42,0.06),0_14px_30px_-14px_rgba(15,23,42,0.3)] backdrop-blur-xl">
            <BedDouble className="h-6 w-6" strokeWidth={1.6} />
          </span>
          <p className="font-display text-xl font-semibold tracking-[-0.02em] text-ink-900">
            This booking page isn't available
          </p>
          <p className="text-sm text-ink-500 mt-2">
            The link may have changed. Try contacting the property directly.
          </p>
        </motion.div>
      </div>
    );
  }

  const p = hotel.property;
  const currency = p.currency || "USD";
  const hero = p.photos?.[0]?.url;

  // ── Booked ────────────────────────────────────────────────────────────
  if (confirmed) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#FBFAF8] flex items-center justify-center p-4 sm:p-5">
        {/* The hotel's own photo, softly blurred behind the confirmation. */}
        {hero && (
          <div aria-hidden className="absolute inset-0">
            <img src={hero} alt="" className="h-full w-full object-cover scale-110 blur-2xl opacity-40" />
            <div className="absolute inset-0 bg-[#FBFAF8]/60" />
          </div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className="relative max-w-md w-full rounded-[28px] bg-white/80 p-6 sm:p-8 text-center backdrop-blur-2xl backdrop-saturate-150 shadow-[inset_0_1px_0_#fff,0_0_0_1px_rgba(15,23,42,0.06),0_30px_80px_-30px_rgba(15,23,42,0.35)]"
        >
          {/* Check that pops, with a ring that blooms outward once. */}
          <div className="relative mx-auto mb-5 h-16 w-16">
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-full bg-emerald-400/30"
              initial={{ scale: 0.6, opacity: 0.8 }}
              animate={{ scale: 2.1, opacity: 0 }}
              transition={{ duration: 1.1, delay: 0.25, ease: "easeOut" }}
            />
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 16, delay: 0.15 }}
              className="relative grid h-16 w-16 place-items-center rounded-full bg-emerald-500 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_12px_30px_-10px_rgba(16,185,129,0.7)]"
            >
              <motion.svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <motion.path
                  d="M5 12.5l4.5 4.5L19 7.5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.45, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                />
              </motion.svg>
            </motion.div>
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-[-0.03em] text-ink-900">
            You're <span className="font-serif font-normal italic">booked</span>
          </h1>
          <p className="text-sm text-ink-500 mt-1.5">
            {p.name} has your reservation. A confirmation is on its way.
          </p>
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: 0.45 } } }}
            className="mt-6 rounded-2xl bg-ink-900/[0.03] ring-1 ring-ink-900/[0.06] p-4 text-left divide-y divide-ink-900/[0.06]"
          >
            <Row label="Reference" value={confirmed.code} mono />
            <Row label="Room" value={confirmed.roomName} />
            <Row
              label="Dates"
              value={`${new Date(confirmed.checkIn).toLocaleDateString()} → ${new Date(
                confirmed.checkOut,
              ).toLocaleDateString()}`}
            />
            <Row label="Nights" value={confirmed.nights} />
            <Row
              label="Total"
              value={money(confirmed.total, confirmed.currency)}
              strong
            />
          </motion.div>
          <p className="text-xs text-ink-400 mt-5">
            Booked directly with {p.name} — no booking fee.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFAF8] pb-20">
      {/* Hero */}
      <div className="relative h-60 sm:h-80 bg-ink-200 overflow-hidden">
        {hero ? (
          <motion.img
            src={hero}
            alt={p.name}
            className="w-full h-full object-cover"
            loading="eager"
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          />
        ) : (
          <div className="w-full h-full bg-[linear-gradient(135deg,#2a2622_0%,#5b4b3d_55%,#a08466_100%)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5 pb-12 sm:p-7 sm:pb-14">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl mx-auto"
          >
            {p.starRating > 0 && (
              <div className="flex items-center gap-0.5 mb-2">
                {Array.from({ length: p.starRating }).map((_, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0.4 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 420, damping: 14, delay: 0.35 + i * 0.06 }}
                  >
                    <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                  </motion.span>
                ))}
              </div>
            )}
            <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-white leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]">
              {p.name}
            </h1>
            {(p.city || p.country) && (
              <p className="text-sm text-white/85 mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/20 backdrop-blur-md">
                <MapPin className="w-3.5 h-3.5" />
                {[p.city, p.country].filter(Boolean).join(", ")}
              </p>
            )}
          </motion.div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-5 -mt-8 relative">
        {/* Dates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 26, delay: 0.25 }}
          className={glassPanel + " p-4 sm:p-5"}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-500">Check in</label>
              <input
                type="date"
                value={checkIn}
                min={isoDay(0)}
                onChange={(e) => setCheckIn(e.target.value)}
                className={"input mt-1.5 " + fieldTone}
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-500">Check out</label>
              <input
                type="date"
                value={checkOut}
                min={checkIn}
                onChange={(e) => setCheckOut(e.target.value)}
                className={"input mt-1.5 " + fieldTone}
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-500">Guests</label>
              <div className="mt-1.5 flex items-center gap-1 rounded-xl bg-white/80 px-1 h-[42px] ring-1 ring-ink-900/10 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)]">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.82 }}
                  onClick={() => setAdults((n) => Math.max(1, n - 1))}
                  className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 hover:bg-ink-900/[0.05] hover:text-ink-900 transition-colors"
                  aria-label="Fewer guests"
                >
                  <Minus className="w-3.5 h-3.5" />
                </motion.button>
                <span className="relative flex-1 overflow-hidden text-center text-sm font-semibold tabular-nums text-ink-900 h-5">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={adults}
                      className="absolute inset-0"
                      initial={{ y: 14, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -14, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      {adults}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.82 }}
                  onClick={() => setAdults((n) => Math.min(12, n + 1))}
                  className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 hover:bg-ink-900/[0.05] hover:text-ink-900 transition-colors"
                  aria-label="More guests"
                >
                  <Plus className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={checkDates}
                disabled={checking}
                className={hotelBtn + " w-full h-[42px] text-sm"}
              >
                {checking ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "See rooms"
                )}
              </button>
            </div>
          </div>
          <AnimatePresence initial={false}>
            {nights > 0 && (
              <motion.p
                key="nights"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs text-ink-500 mt-2.5 inline-flex items-center gap-1.5"
              >
                <span className="h-1 w-1 rounded-full bg-ink-400" />
                <span className="tabular-nums">
                  {nights} night{nights === 1 ? "" : "s"}
                </span>
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              key="err"
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ type: "spring", stiffness: 420, damping: 30 }}
              className="mt-4 rounded-2xl bg-amber-50/90 p-3.5 ring-1 ring-amber-200 backdrop-blur"
            >
              <p className="text-sm text-amber-900">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* About — shown before any search, so the page is never bare */}
        {rooms === null && p.description && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={glassPanel + " mt-6 p-5 sm:p-6"}
          >
            <p className="text-[15px] text-ink-600 leading-relaxed">
              {p.description}
            </p>
            {p.amenities?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
                {p.amenities.map((a, i) => (
                  <motion.span
                    key={a}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 + i * 0.03 }}
                    className="text-xs font-medium px-2.5 py-1 rounded-full bg-white text-ink-600 ring-1 ring-ink-900/[0.07] shadow-[inset_0_1px_0_#fff]"
                  >
                    {a}
                  </motion.span>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Rooms */}
        {rooms !== null && (
          <div className="mt-7">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-400 mb-3">
              {rooms.some((r) => r.bookable)
                ? "Available rooms"
                : "No rooms free"}
            </h2>

            {rooms.length === 0 || !rooms.some((r) => r.bookable) ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={glassPanel + " p-7 text-center"}
              >
                <span className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-xl bg-ink-900/[0.05] text-ink-500">
                  <BedDouble className="h-5 w-5" strokeWidth={1.7} />
                </span>
                <p className="font-display font-semibold text-ink-900">
                  Nothing free for those dates
                </p>
                <p className="text-sm text-ink-500 mt-1">
                  Try different dates — or message the property and they'll see
                  what they can do.
                </p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {rooms.map((r, i) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <RoomCard
                      room={r}
                      currency={currency}
                      selected={picked?.id === r.id}
                      onSelect={() => setPicked(r)}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Guest details */}
        <AnimatePresence>
          {picked && (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className={glassPanel + " mt-6 p-5 sm:p-6"}
            >
              <h2 className="font-display text-lg font-semibold tracking-[-0.02em] text-ink-900">Your details</h2>
              <p className="text-sm text-ink-500 mt-0.5">
                {picked.name} · {nights} night{nights === 1 ? "" : "s"} ·{" "}
                <span className="font-semibold tabular-nums text-ink-900">
                  {money(picked.total, currency)}
                </span>
              </p>

              <div className="grid sm:grid-cols-2 gap-3 mt-4">
                <input
                  className={"input " + fieldTone}
                  placeholder="Full name"
                  value={guest.guestName}
                  onChange={(e) =>
                    setGuest((g) => ({ ...g, guestName: e.target.value }))
                  }
                />
                <input
                  className={"input " + fieldTone}
                  type="tel"
                  placeholder="Phone (WhatsApp)"
                  value={guest.guestPhone}
                  onChange={(e) =>
                    setGuest((g) => ({ ...g, guestPhone: e.target.value }))
                  }
                />
                <input
                  className={"input sm:col-span-2 " + fieldTone}
                  type="email"
                  placeholder="Email"
                  value={guest.guestEmail}
                  onChange={(e) =>
                    setGuest((g) => ({ ...g, guestEmail: e.target.value }))
                  }
                />
                <textarea
                  className={"input sm:col-span-2 min-h-[72px] " + fieldTone}
                  placeholder="Anything we should know? (optional)"
                  value={guest.specialRequests}
                  onChange={(e) =>
                    setGuest((g) => ({ ...g, specialRequests: e.target.value }))
                  }
                />
              </div>

              <button
                onClick={submit}
                disabled={
                  booking ||
                  !guest.guestName.trim() ||
                  (!guest.guestPhone.trim() && !guest.guestEmail.trim())
                }
                className={hotelBtn + " group mt-5 w-full px-4 py-3.5 text-[15px]"}
              >
                {booking ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Check className="w-5 h-5 transition-transform duration-500 ease-spring group-hover:scale-125 group-hover:-rotate-6" />
                )}
                Confirm booking
              </button>
              <p className="text-xs text-ink-400 mt-2.5 text-center">
                No booking fee. You pay the property directly.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-[11px] tracking-wide text-ink-400 mt-10">
          Booking powered by Botlify
        </p>
      </div>
    </div>
  );
}

// Guest-facing surfaces: light liquid glass in neutral, hotel-agnostic tones —
// the hotel's photos carry the colour, not our brand gradient.
const glassPanel =
  "rounded-3xl bg-white/75 backdrop-blur-2xl backdrop-saturate-150 shadow-[inset_0_1px_0_#fff,0_0_0_1px_rgba(15,23,42,0.06),0_20px_50px_-24px_rgba(15,23,42,0.25)]";

const fieldTone = "focus:!border-ink-800/50 focus:!shadow-[0_0_0_4px_rgba(15,23,42,0.08)]";

const hotelBtn =
  "relative inline-flex items-center justify-center gap-1.5 overflow-hidden rounded-xl bg-ink-900 font-semibold text-white " +
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_10px_24px_-12px_rgba(15,23,42,0.7)] " +
  "transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:bg-ink-800 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_16px_32px_-14px_rgba(15,23,42,0.8)] " +
  "active:scale-[0.97] active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none";

function RoomCard({ room, currency, selected, onSelect }) {
  const photo = room.photos?.[0]?.url;
  return (
    <motion.div
      layout
      whileHover={room.bookable ? { y: -3 } : undefined}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
      className={`group relative rounded-3xl overflow-hidden bg-white/80 backdrop-blur-xl transition-shadow duration-500 ${
        selected
          ? "shadow-[inset_0_1px_0_#fff,0_0_0_2px_rgba(15,23,42,0.85),0_24px_50px_-24px_rgba(15,23,42,0.45)]"
          : "shadow-[inset_0_1px_0_#fff,0_0_0_1px_rgba(15,23,42,0.07),0_10px_30px_-18px_rgba(15,23,42,0.25)] hover:shadow-[inset_0_1px_0_#fff,0_0_0_1px_rgba(15,23,42,0.12),0_22px_44px_-22px_rgba(15,23,42,0.4)]"
      } ${room.bookable ? "" : "opacity-75"}`}
    >
      <div className="flex flex-col sm:flex-row">
        {photo && (
          <div className="relative overflow-hidden sm:w-48 h-40 sm:h-auto shrink-0">
            <img
              src={photo}
              alt={room.name}
              className="h-full w-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
              loading="lazy"
            />
            <AnimatePresence>
              {selected && (
                <motion.span
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 18 }}
                  className="absolute left-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-ink-900 text-white shadow-lg ring-2 ring-white"
                >
                  <Check className="h-4 w-4" strokeWidth={2.6} />
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        )}
        <div className="flex-1 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-display text-[17px] font-semibold tracking-[-0.02em] text-ink-900">{room.name}</p>
              <p className="text-xs text-ink-500 mt-1 inline-flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="inline-flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  up to {room.maxOccupancy}
                </span>
                {room.bedConfig && (
                  <span className="inline-flex items-center gap-1">
                    <BedDouble className="w-3.5 h-3.5" />
                    {room.bedConfig}
                  </span>
                )}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-display text-lg font-semibold tabular-nums text-ink-900">
                {money(room.total, currency)}
              </p>
              <p className="text-xs text-ink-400">
                {room.nights} night{room.nights === 1 ? "" : "s"} total
              </p>
            </div>
          </div>

          {room.description && (
            <p className="text-sm text-ink-500 mt-2 line-clamp-2">
              {room.description}
            </p>
          )}

          <div className="mt-4 flex items-center justify-between gap-3">
            {room.bookable ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/15">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {room.available} left
              </span>
            ) : (
              <span className="text-xs font-semibold text-ink-400">
                {room.reason === "too_many_guests"
                  ? "Too small for your party"
                  : "Sold out"}
              </span>
            )}
            <motion.button
              onClick={onSelect}
              disabled={!room.bookable}
              whileTap={room.bookable ? { scale: 0.94 } : undefined}
              className={`inline-flex min-h-[40px] items-center gap-1.5 font-semibold text-sm rounded-xl px-4 py-2.5 transition-all duration-300 ease-spring disabled:opacity-40 ${
                selected
                  ? "bg-ink-900 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]"
                  : "bg-white text-ink-900 ring-1 ring-ink-900/15 shadow-[inset_0_1px_0_#fff] hover:-translate-y-0.5 hover:ring-ink-900/40"
              }`}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {selected && (
                  <motion.span
                    key="tick"
                    initial={{ scale: 0, width: 0 }}
                    animate={{ scale: 1, width: "auto" }}
                    exit={{ scale: 0, width: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 22 }}
                    className="inline-flex"
                  >
                    <Check className="h-4 w-4" strokeWidth={2.4} />
                  </motion.span>
                )}
              </AnimatePresence>
              {selected ? "Selected" : "Choose"}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Row({ label, value, mono, strong }) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0 } }}
      className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0"
    >
      <span className="text-xs text-ink-500">{label}</span>
      <span
        className={`text-sm text-right ${mono ? "font-mono tracking-wide" : ""} ${
          strong ? "font-display text-base font-semibold tabular-nums text-ink-900" : "font-medium text-ink-700"
        }`}
      >
        {value}
      </span>
    </motion.div>
  );
}
