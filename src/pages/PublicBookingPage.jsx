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
      <div className="min-h-screen flex items-center justify-center bg-ink-50">
        <Loader2 className="w-7 h-7 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-50 p-6">
        <div className="max-w-sm text-center">
          <p className="font-black text-ink-900 text-lg">
            This booking page isn't available
          </p>
          <p className="text-sm text-ink-500 mt-1">
            The link may have changed. Try contacting the property directly.
          </p>
        </div>
      </div>
    );
  }

  const p = hotel.property;
  const currency = p.currency || "USD";
  const hero = p.photos?.[0]?.url;

  // ── Booked ────────────────────────────────────────────────────────────
  if (confirmed) {
    return (
      <div className="min-h-screen bg-ink-50 flex items-center justify-center p-5">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-card p-7 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <Check className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-black text-ink-900">You're booked</h1>
          <p className="text-sm text-ink-500 mt-1">
            {p.name} has your reservation. A confirmation is on its way.
          </p>
          <div className="mt-5 rounded-2xl border border-ink-100 p-4 text-left space-y-1.5">
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
          </div>
          <p className="text-xs text-ink-400 mt-4">
            Booked directly with {p.name} — no booking fee.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-50 pb-20">
      {/* Hero */}
      <div className="relative h-56 sm:h-72 bg-ink-200 overflow-hidden">
        {hero ? (
          <img
            src={hero}
            alt={p.name}
            className="w-full h-full object-cover"
            loading="eager"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-400 to-brand-600" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
          <div className="max-w-3xl mx-auto">
            {p.starRating > 0 && (
              <div className="flex items-center gap-0.5 mb-1.5">
                {Array.from({ length: p.starRating }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5 text-amber-300 fill-amber-300"
                  />
                ))}
              </div>
            )}
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {p.name}
            </h1>
            {(p.city || p.country) && (
              <p className="text-sm text-white/80 mt-1 inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {[p.city, p.country].filter(Boolean).join(", ")}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-5 -mt-6 relative">
        {/* Dates */}
        <div className="bg-white rounded-2xl shadow-card p-4 sm:p-5">
          <div className="grid sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-bold text-ink-500">Check in</label>
              <input
                type="date"
                value={checkIn}
                min={isoDay(0)}
                onChange={(e) => setCheckIn(e.target.value)}
                className="input mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-ink-500">Check out</label>
              <input
                type="date"
                value={checkOut}
                min={checkIn}
                onChange={(e) => setCheckOut(e.target.value)}
                className="input mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-ink-500">Guests</label>
              <div className="mt-1 flex items-center gap-1 border border-ink-200 rounded-xl px-2 h-[42px]">
                <button
                  type="button"
                  onClick={() => setAdults((n) => Math.max(1, n - 1))}
                  className="p-1.5 text-ink-400 hover:text-ink-800 transition"
                  aria-label="Fewer guests"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="flex-1 text-center text-sm font-bold text-ink-900">
                  {adults}
                </span>
                <button
                  type="button"
                  onClick={() => setAdults((n) => Math.min(12, n + 1))}
                  className="p-1.5 text-ink-400 hover:text-ink-800 transition"
                  aria-label="More guests"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={checkDates}
                disabled={checking}
                className="w-full inline-flex items-center justify-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl h-[42px] transition disabled:opacity-60"
              >
                {checking ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "See rooms"
                )}
              </button>
            </div>
          </div>
          {nights > 0 && (
            <p className="text-xs text-ink-400 mt-2">
              {nights} night{nights === 1 ? "" : "s"}
            </p>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3.5">
            <p className="text-sm text-amber-900">{error}</p>
          </div>
        )}

        {/* About — shown before any search, so the page is never bare */}
        {rooms === null && p.description && (
          <div className="mt-6 bg-white rounded-2xl p-5 border border-ink-100">
            <p className="text-sm text-ink-600 leading-relaxed">
              {p.description}
            </p>
            {p.amenities?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3.5">
                {p.amenities.map((a) => (
                  <span
                    key={a}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-ink-50 text-ink-600"
                  >
                    {a}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Rooms */}
        {rooms !== null && (
          <div className="mt-6">
            <h2 className="text-sm font-black uppercase tracking-wide text-ink-400 mb-3">
              {rooms.some((r) => r.bookable)
                ? "Available rooms"
                : "No rooms free"}
            </h2>

            {rooms.length === 0 || !rooms.some((r) => r.bookable) ? (
              <div className="bg-white rounded-2xl border border-ink-100 p-6 text-center">
                <p className="font-bold text-ink-900">
                  Nothing free for those dates
                </p>
                <p className="text-sm text-ink-500 mt-1">
                  Try different dates — or message the property and they'll see
                  what they can do.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {rooms.map((r) => (
                  <RoomCard
                    key={r.id}
                    room={r}
                    currency={currency}
                    selected={picked?.id === r.id}
                    onSelect={() => setPicked(r)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Guest details */}
        {picked && (
          <div className="mt-6 bg-white rounded-2xl shadow-card p-5">
            <h2 className="font-black text-ink-900">Your details</h2>
            <p className="text-sm text-ink-500 mt-0.5">
              {picked.name} · {nights} night{nights === 1 ? "" : "s"} ·{" "}
              <span className="font-bold text-ink-900">
                {money(picked.total, currency)}
              </span>
            </p>

            <div className="grid sm:grid-cols-2 gap-3 mt-4">
              <input
                className="input"
                placeholder="Full name"
                value={guest.guestName}
                onChange={(e) =>
                  setGuest((g) => ({ ...g, guestName: e.target.value }))
                }
              />
              <input
                className="input"
                type="tel"
                placeholder="Phone (WhatsApp)"
                value={guest.guestPhone}
                onChange={(e) =>
                  setGuest((g) => ({ ...g, guestPhone: e.target.value }))
                }
              />
              <input
                className="input sm:col-span-2"
                type="email"
                placeholder="Email"
                value={guest.guestEmail}
                onChange={(e) =>
                  setGuest((g) => ({ ...g, guestEmail: e.target.value }))
                }
              />
              <textarea
                className="input sm:col-span-2 min-h-[72px]"
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
              className="mt-4 w-full inline-flex items-center justify-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white font-black rounded-xl px-4 py-3.5 transition disabled:opacity-50"
            >
              {booking ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Check className="w-5 h-5" />
              )}
              Confirm booking
            </button>
            <p className="text-xs text-ink-400 mt-2 text-center">
              No booking fee. You pay the property directly.
            </p>
          </div>
        )}

        <p className="text-center text-xs text-ink-400 mt-8">
          Booking powered by Botlify
        </p>
      </div>
    </div>
  );
}

function RoomCard({ room, currency, selected, onSelect }) {
  const photo = room.photos?.[0]?.url;
  return (
    <div
      className={`rounded-2xl border bg-white overflow-hidden transition ${
        selected ? "border-brand-400 ring-1 ring-brand-200" : "border-ink-100"
      }`}
    >
      <div className="flex flex-col sm:flex-row">
        {photo && (
          <img
            src={photo}
            alt={room.name}
            className="sm:w-44 h-36 sm:h-auto object-cover"
            loading="lazy"
          />
        )}
        <div className="flex-1 p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-black text-ink-900">{room.name}</p>
              <p className="text-xs text-ink-500 mt-0.5 inline-flex items-center gap-2">
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
              <p className="font-black text-ink-900">
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

          <div className="mt-3 flex items-center justify-between gap-3">
            {room.bookable ? (
              <span className="text-xs font-bold text-emerald-700">
                {room.available} left
              </span>
            ) : (
              <span className="text-xs font-bold text-ink-400">
                {room.reason === "too_many_guests"
                  ? "Too small for your party"
                  : "Sold out"}
              </span>
            )}
            <button
              onClick={onSelect}
              disabled={!room.bookable}
              className={`font-bold text-sm rounded-xl px-4 py-2.5 transition disabled:opacity-40 ${
                selected
                  ? "bg-brand-600 text-white"
                  : "bg-brand-500 hover:bg-brand-600 text-white"
              }`}
            >
              {selected ? "Selected" : "Choose"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mono, strong }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-ink-500">{label}</span>
      <span
        className={`text-sm ${mono ? "font-mono" : ""} ${
          strong ? "font-black text-ink-900" : "font-semibold text-ink-700"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
