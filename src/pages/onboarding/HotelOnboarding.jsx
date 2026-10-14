/**
 * Hotel onboarding — built on Airbnb's listing flow.
 *
 * Airbnb gets a first-time host from nothing to a live listing with three
 * ideas, and this copies all three:
 *
 *   1. Three named phases, shown up front so the end is visible from the start:
 *      "Tell us about your hotel" → "Make it stand out" → "Finish up".
 *   2. ONE question per screen. Big tappable cards and +/− steppers instead of
 *      forms, so nothing is ever a wall of fields.
 *   3. A fixed footer: Back on the left, Next on the right, and a three-part
 *      progress bar above it.
 *
 * The old wizard asked ~16 property fields and ~10 per room type. This asks
 * only what a guest-facing AI and a calendar actually need on day one — type,
 * name, location, rooms with a count and a price — and leaves everything else
 * to Settings, where it already lives.
 *
 * Saving happens as you go (the property when the location is confirmed, the
 * rooms when they're confirmed) so a refresh or a WhatsApp OAuth round trip
 * never loses work. Answers are mirrored to sessionStorage, and the OAuth
 * return URL (?step=messaging, hardcoded in channelController.js) lands back
 * on the WhatsApp screen.
 */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Building2,
  Castle,
  Check,
  Home,
  Hotel,
  Loader2,
  Minus,
  Palmtree,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import OtaLogo from "@/components/OtaLogo";
import WhatsAppConnectModal from "@/components/WhatsAppConnectModal";
import { LIVE_OTA_CHANNELS } from "@/data/otaChannels";

const KEY = "botlify.onboarding.simple.v1";

const TYPES = [
  { value: "hotel", label: "Hotel", Icon: Hotel },
  { value: "villa", label: "Villa", Icon: Palmtree },
  { value: "guesthouse", label: "Guesthouse", Icon: Home },
  { value: "resort", label: "Resort", Icon: Castle },
  { value: "hostel", label: "Hostel", Icon: Users },
  { value: "apartment", label: "Apartment", Icon: Building2 },
];

const CURRENCIES = ["IDR", "USD", "EUR", "GBP", "AUD", "SGD", "MYR", "THB"];

const ID_HINT = {
  booking: "The number in your Booking.com extranet URL",
  airbnb: "The number at the end of your listing's web address",
  expedia: "From Expedia Partner Central",
};

/**
 * The screens, in order. `phase` drives the three-part progress bar; `intro`
 * screens are the big phase title cards Airbnb shows between sections.
 */
const SCREENS = [
  { id: "welcome", phase: 0 },
  { id: "phase1", phase: 1, intro: true },
  { id: "type", phase: 1 },
  { id: "name", phase: 1 },
  { id: "location", phase: 1 },
  { id: "phase2", phase: 2, intro: true },
  { id: "rooms", phase: 2 },
  { id: "phase3", phase: 3, intro: true },
  { id: "channels", phase: 3 },
  { id: "pickup", phase: 3 },
  { id: "messaging", phase: 3 },
  { id: "done", phase: 3 },
];
const indexOf = (id) => SCREENS.findIndex((s) => s.id === id);

const blankRoom = () => ({ name: "", units: 1, price: "" });

const initial = () => ({
  screen: "welcome",
  type: "",
  name: "",
  city: "",
  country: "Indonesia",
  address: "",
  currency: "IDR",
  rooms: [{ name: "Standard Room", units: 1, price: "" }],
  otas: {}, // { booking: "1234567", airbnb: "" }
  ownTaxi: null,
  driver: { name: "", phone: "" },
  propertyId: null,
  roomIds: [], // server ids, parallel to rooms[]
});

function load() {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? { ...initial(), ...JSON.parse(raw) } : initial();
  } catch {
    return initial();
  }
}
function persist(s) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* private mode — the flow still works, it just won't survive a refresh */
  }
}

export default function HotelOnboarding() {
  const navigate = useNavigate();
  const { user, activeWorkspace, setActiveWorkspace } = useAuthStore();
  const { fetchWorkspace } = useWorkspaceStore();

  const [s, setS] = useState(() => {
    const saved = load();
    // Returning from the WhatsApp OAuth round trip.
    const wanted = new URLSearchParams(window.location.search).get("step");
    if (wanted === "messaging") return { ...saved, screen: "messaging" };
    return saved;
  });
  const [busy, setBusy] = useState(false);
  const [waOpen, setWaOpen] = useState(false);
  const [waConnected, setWaConnected] = useState(false);
  const [ready, setReady] = useState(false);

  const set = (fields) =>
    setS((cur) => {
      const next = { ...cur, ...fields };
      persist(next);
      return next;
    });

  const idx = indexOf(s.screen);
  const screen = SCREENS[idx] || SCREENS[0];

  // ── A workspace must exist before anything is saved ──────────────────
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        let wsId = activeWorkspace;
        if (!wsId) {
          const { data } = await api.post("/workspaces/ensure", {
            name: user?.name ? `${user.name}'s Hotel` : undefined,
          });
          wsId = data.workspace._id;
          setActiveWorkspace(wsId);
          fetchWorkspace(wsId);
        }
        // Someone who already finished setup doesn't get walked through it
        // again — unless they're mid-flow (a saved screen or the OAuth return).
        const { data } = await api.get("/hotel/properties");
        const props = data.properties || [];
        const midFlow =
          s.screen !== "welcome" ||
          new URLSearchParams(window.location.search).get("step");
        if (props.length && !midFlow) {
          navigate("/dashboard", { replace: true });
          return;
        }
        if (props.length && !s.propertyId) set({ propertyId: props[0]._id });
      } catch {
        /* still let them through — saving will surface any real problem */
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Has WhatsApp been connected (possibly in an OAuth round trip)?
  useEffect(() => {
    if (s.screen !== "messaging") return;
    api
      .get("/channels/status")
      .then(({ data }) => setWaConnected(data?.whatsapp?.status === "connected"))
      .catch(() => {});
  }, [s.screen, waOpen]);

  const go = (id) => {
    set({ screen: id });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const next = () => go(SCREENS[Math.min(idx + 1, SCREENS.length - 1)].id);
  const back = () => go(SCREENS[Math.max(idx - 1, 0)].id);

  // ── Saving ────────────────────────────────────────────────────────────
  const saveProperty = async () => {
    const body = {
      name: s.name.trim(),
      propertyType: s.type || "hotel",
      city: s.city.trim(),
      country: s.country.trim(),
      address: s.address.trim(),
      currency: s.currency,
    };
    const { data } = s.propertyId
      ? await api.put(`/hotel/properties/${s.propertyId}`, body)
      : await api.post("/hotel/properties", body);
    const id = data?.property?._id || s.propertyId;
    set({ propertyId: id });
    return id;
  };

  const saveRooms = async () => {
    const ids = [...(s.roomIds || [])];
    for (let i = 0; i < s.rooms.length; i++) {
      const r = s.rooms[i];
      const payload = {
        name: r.name.trim(),
        unitsCount: Math.max(1, Number(r.units) || 1),
        baseRate: Number(r.price),
        currency: s.currency,
        maxAdults: 2,
        maxOccupancy: 2,
      };
      if (ids[i]) {
        await api.put(`/hotel/rooms/${ids[i]}`, payload);
      } else {
        const { data } = await api.post(
          `/hotel/properties/${s.propertyId}/rooms`,
          payload,
        );
        ids[i] = (data?.roomType || data?.room)?._id;
      }
    }
    // Rooms removed in the UI after being saved. There's no delete route —
    // a room is switched off, which also keeps any booking history intact.
    for (const extra of ids.slice(s.rooms.length)) {
      if (extra)
        await api.put(`/hotel/rooms/${extra}`, { active: false }).catch(() => {});
    }
    set({ roomIds: ids.slice(0, s.rooms.length) });
  };

  const saveChannels = async () => {
    const requestedOtas = Object.entries(s.otas)
      .filter(([, v]) => String(v).trim())
      .map(([k]) => k);
    if (!requestedOtas.length) return;
    // Recorded now; the connection itself is made through the channel
    // manager, so it's tracked from here on and shown on the dashboard.
    await api.put(`/hotel/properties/${s.propertyId}`, { requestedOtas });
  };

  const savePickup = async () => {
    await api.put(`/hotel/properties/${s.propertyId}`, {
      transfers: { hasOwnService: !!s.ownTaxi },
    });
    if (s.ownTaxi && s.driver.name.trim() && s.driver.phone.trim()) {
      await api
        .post("/drivers", {
          name: s.driver.name.trim(),
          phone: s.driver.phone.trim(),
        })
        .catch(() => {});
    }
  };

  const finish = async () => {
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    if (activeWorkspace) await fetchWorkspace(activeWorkspace, { force: true });
    navigate("/dashboard", { replace: true });
  };

  // Next, with whatever saving this screen needs first.
  const onNext = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (s.screen === "location") await saveProperty();
      if (s.screen === "rooms") await saveRooms();
      if (s.screen === "channels") await saveChannels();
      if (s.screen === "pickup") await savePickup();
      if (s.screen === "done") return finish();
      next();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Couldn't save that — try again.");
    } finally {
      setBusy(false);
    }
  };

  // ── What makes Next available ─────────────────────────────────────────
  const canNext = useMemo(() => {
    switch (s.screen) {
      case "type":
        return !!s.type;
      case "name":
        return s.name.trim().length > 1;
      case "location":
        return s.city.trim() && s.country.trim();
      case "rooms":
        return (
          s.rooms.length > 0 &&
          s.rooms.every((r) => r.name.trim() && Number(r.price) > 0)
        );
      case "pickup":
        return s.ownTaxi === false || (s.ownTaxi === true && s.driver.name.trim() && s.driver.phone.trim());
      default:
        return true;
    }
  }, [s]);

  if (!ready) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-7 h-7 text-brand-500 animate-spin" />
      </div>
    );
  }

  const nextLabel =
    s.screen === "welcome"
      ? "Get started"
      : s.screen === "done"
        ? "Go to my dashboard"
        : (s.screen === "channels" && !Object.values(s.otas).some((v) => String(v).trim())) ||
            (s.screen === "messaging" && !waConnected)
          ? "Skip for now"
          : "Next";

  return (
    <div className="pb-36">
      <div className="max-w-2xl mx-auto px-5 sm:px-6 pt-10 sm:pt-16">
        {screen.id === "welcome" && <Welcome />}
        {screen.intro && <PhaseIntro phase={screen.phase} />}

        {screen.id === "type" && (
          <Question title="Which of these best describes your place?">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {TYPES.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => set({ type: value })}
                  className={`text-left rounded-2xl border-2 p-4 h-28 flex flex-col justify-between transition ${
                    s.type === value
                      ? "border-ink-900 bg-ink-50"
                      : "border-ink-200 hover:border-ink-400"
                  }`}
                >
                  <Icon className="w-7 h-7 text-ink-800" />
                  <span className="font-bold text-ink-900">{label}</span>
                </button>
              ))}
            </div>
          </Question>
        )}

        {screen.id === "name" && (
          <Question
            title="What's your place called?"
            sub="The name guests see — your AI will introduce itself with it too."
          >
            <input
              autoFocus
              value={s.name}
              onChange={(e) => set({ name: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && canNext && onNext()}
              placeholder="e.g. Sunset Beach Resort"
              className="w-full text-2xl font-bold border-2 border-ink-200 focus:border-ink-900 rounded-2xl px-5 py-4 outline-none transition"
              maxLength={80}
            />
          </Question>
        )}

        {screen.id === "location" && (
          <Question
            title="Where's your place located?"
            sub="Shared with guests once they've booked."
          >
            <div className="rounded-2xl border-2 border-ink-200 divide-y-2 divide-ink-200 overflow-hidden">
              <Field label="Street address (optional)">
                <input
                  value={s.address}
                  onChange={(e) => set({ address: e.target.value })}
                  placeholder="Jl. Kayu Aya No. 12"
                  className="w-full outline-none text-ink-900 bg-transparent"
                />
              </Field>
              <Field label="City">
                <input
                  autoFocus
                  value={s.city}
                  onChange={(e) => set({ city: e.target.value })}
                  placeholder="Seminyak"
                  className="w-full outline-none text-ink-900 bg-transparent"
                />
              </Field>
              <Field label="Country">
                <input
                  value={s.country}
                  onChange={(e) => set({ country: e.target.value })}
                  placeholder="Indonesia"
                  className="w-full outline-none text-ink-900 bg-transparent"
                />
              </Field>
            </div>
          </Question>
        )}

        {screen.id === "rooms" && (
          <Question
            title="What rooms do you have?"
            sub="One line per kind of room. Ten identical doubles is one line with 10 of them."
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-ink-600">Prices in</span>
              <select
                value={s.currency}
                onChange={(e) => set({ currency: e.target.value })}
                className="border-2 border-ink-200 rounded-xl px-3 py-1.5 text-sm font-bold outline-none focus:border-ink-900"
              >
                {CURRENCIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              {s.rooms.map((r, i) => {
                const update = (fields) =>
                  set({
                    rooms: s.rooms.map((x, j) => (j === i ? { ...x, ...fields } : x)),
                  });
                return (
                  <div key={i} className="rounded-2xl border-2 border-ink-200 p-4">
                    <div className="flex items-center gap-2">
                      <input
                        value={r.name}
                        onChange={(e) => update({ name: e.target.value })}
                        placeholder="Room name, e.g. Deluxe Double"
                        className="flex-1 font-bold text-ink-900 outline-none text-[17px] bg-transparent"
                      />
                      {s.rooms.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            set({ rooms: s.rooms.filter((_, j) => j !== i) })
                          }
                          className="p-1.5 text-ink-400 hover:text-rose-600"
                          aria-label="Remove room"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="mt-3 pt-3 border-t border-ink-100 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-ink-600">How many</span>
                        <Stepper
                          value={r.units}
                          onChange={(units) => update({ units })}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-ink-600">Per night</span>
                        <div className="flex items-center border-2 border-ink-200 focus-within:border-ink-900 rounded-xl px-3 py-1.5">
                          <span className="text-xs font-bold text-ink-400 mr-1.5">
                            {s.currency}
                          </span>
                          <input
                            inputMode="numeric"
                            value={r.price}
                            onChange={(e) =>
                              update({ price: e.target.value.replace(/[^0-9.]/g, "") })
                            }
                            placeholder="0"
                            className="w-24 outline-none font-bold text-ink-900 bg-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => set({ rooms: [...s.rooms, blankRoom()] })}
              className="mt-3 w-full rounded-2xl border-2 border-dashed border-ink-300 hover:border-ink-500 py-3.5 font-bold text-ink-700 inline-flex items-center justify-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              Add another room
            </button>
          </Question>
        )}

        {screen.id === "channels" && (
          <Question
            title="Where do you already sell?"
            sub="Pick the ones you're on. Bookings from them will land in Botlify on one calendar — no more double bookings."
          >
            <div className="space-y-3">
              {LIVE_OTA_CHANNELS.map((c) => {
                const on = c.key in s.otas;
                return (
                  <div
                    key={c.key}
                    className={`rounded-2xl border-2 transition ${
                      on ? "border-ink-900 bg-ink-50" : "border-ink-200 hover:border-ink-400"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        const otas = { ...s.otas };
                        if (on) delete otas[c.key];
                        else otas[c.key] = "";
                        set({ otas });
                      }}
                      className="w-full flex items-center gap-3.5 p-4 text-left"
                    >
                      <OtaLogo channelKey={c.key} name={c.name} size={36} />
                      <span className="flex-1 font-bold text-ink-900 text-[17px]">
                        {c.name}
                      </span>
                      <span
                        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${
                          on ? "bg-ink-900 border-ink-900" : "border-ink-300"
                        }`}
                      >
                        {on && <Check className="w-4 h-4 text-white" />}
                      </span>
                    </button>
                    {on && (
                      <div className="px-4 pb-4">
                        <input
                          autoFocus
                          value={s.otas[c.key]}
                          onChange={(e) =>
                            set({ otas: { ...s.otas, [c.key]: e.target.value } })
                          }
                          placeholder={`Your ${c.name} property ID`}
                          className="w-full border-2 border-ink-200 focus:border-ink-900 rounded-xl px-3.5 py-2.5 outline-none bg-white"
                        />
                        <p className="text-xs text-ink-500 mt-1.5">{ID_HINT[c.key]}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-ink-400 mt-4">
              Not on any yet? Skip — you can connect them any time in Settings.
            </p>
          </Question>
        )}

        {screen.id === "pickup" && (
          <Question
            title="Who drives your guests from the airport?"
            sub="When a guest asks for a pickup, the AI books the driver and sends the guest their number."
          >
            <div className="grid sm:grid-cols-2 gap-3">
              <Choice
                active={s.ownTaxi === true}
                onClick={() => set({ ownTaxi: true })}
                title="We have our own driver"
                body="We'll send them each pickup."
              />
              <Choice
                active={s.ownTaxi === false}
                onClick={() => set({ ownTaxi: false })}
                title="Use a Botlify driver"
                body="We find one for you. Nothing to set up."
              />
            </div>
            {s.ownTaxi === true && (
              <div className="mt-4 rounded-2xl border-2 border-ink-200 divide-y-2 divide-ink-200 overflow-hidden">
                <Field label="Driver's name">
                  <input
                    autoFocus
                    value={s.driver.name}
                    onChange={(e) => set({ driver: { ...s.driver, name: e.target.value } })}
                    placeholder="Wayan"
                    className="w-full outline-none text-ink-900 bg-transparent"
                  />
                </Field>
                <Field label="Driver's WhatsApp number">
                  <input
                    type="tel"
                    value={s.driver.phone}
                    onChange={(e) => set({ driver: { ...s.driver, phone: e.target.value } })}
                    placeholder="+62 812 3456 7890"
                    className="w-full outline-none text-ink-900 bg-transparent"
                  />
                </Field>
              </div>
            )}
          </Question>
        )}

        {screen.id === "messaging" && (
          <Question
            title="Let your AI answer on WhatsApp"
            sub="Where most guests message you. It replies 24/7, in any language, and books rooms for you."
          >
            {waConnected ? (
              <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-5 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </span>
                <div>
                  <p className="font-bold text-ink-900">WhatsApp is connected</p>
                  <p className="text-sm text-ink-600">Your AI is answering guests there now.</p>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setWaOpen(true)}
                className="w-full rounded-2xl border-2 border-ink-200 hover:border-ink-900 p-5 flex items-center gap-4 text-left transition"
              >
                <span className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl">
                  💬
                </span>
                <div className="flex-1">
                  <p className="font-bold text-ink-900 text-[17px]">Connect WhatsApp</p>
                  <p className="text-sm text-ink-500">About a minute. You keep your number.</p>
                </div>
              </button>
            )}
            <p className="text-xs text-ink-400 mt-4">
              Instagram, Messenger and Telegram can be added any time in Settings.
            </p>
          </Question>
        )}

        {screen.id === "done" && (
          <div className="text-center pt-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto">
              <Check className="w-9 h-9" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-ink-900 mt-6">
              {s.name || "Your hotel"} is ready
            </h1>
            <p className="text-lg text-ink-500 mt-3 max-w-md mx-auto">
              Your calendar is live and your AI knows your rooms and prices.
              Everything else can be fine-tuned in Settings.
            </p>
            <div className="mt-8 grid sm:grid-cols-3 gap-3 text-left">
              <Summary label="Rooms" value={`${s.rooms.reduce((n, r) => n + (Number(r.units) || 0), 0)} across ${s.rooms.length} type${s.rooms.length === 1 ? "" : "s"}`} />
              <Summary
                label="Booking channels"
                value={
                  Object.keys(s.otas).length
                    ? LIVE_OTA_CHANNELS.filter((c) => c.key in s.otas).map((c) => c.name).join(", ")
                    : "Direct bookings"
                }
              />
              <Summary label="Airport pickups" value={s.ownTaxi ? "Your driver" : "Botlify drivers"} />
            </div>
          </div>
        )}
      </div>

      {/* ── Fixed footer: progress, Back, Next ──────────────────────── */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-ink-100 z-30">
        <ProgressBar screenIndex={idx} />
        <div className="max-w-5xl mx-auto px-5 sm:px-8 h-20 flex items-center justify-between">
          {idx > 0 && s.screen !== "done" ? (
            <button
              type="button"
              onClick={back}
              className="font-bold text-ink-900 underline underline-offset-4 hover:text-ink-600"
            >
              Back
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onNext}
            disabled={!canNext || busy}
            className="inline-flex items-center gap-2 bg-ink-900 hover:bg-black text-white font-bold rounded-xl px-7 py-3.5 transition disabled:bg-ink-200 disabled:text-ink-400"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            {nextLabel}
          </button>
        </div>
      </footer>

      {waOpen && (
        <WhatsAppConnectModal
          from="onboarding"
          onClose={(result) => {
            setWaOpen(false);
            if (result?.connected) {
              setWaConnected(true);
              toast.success("WhatsApp connected");
            }
          }}
        />
      )}
    </div>
  );
}

/* ── Pieces ──────────────────────────────────────────────────────────── */

function Welcome() {
  const steps = [
    ["Tell us about your hotel", "What kind of place it is and where it is."],
    ["Make it stand out", "Your rooms and what they cost a night."],
    ["Finish up", "Connect where you sell, and switch your AI on."],
  ];
  return (
    <div>
      <h1 className="text-4xl sm:text-5xl font-black text-ink-900 leading-tight">
        It's easy to get started on Botlify
      </h1>
      <div className="mt-10 divide-y divide-ink-100">
        {steps.map(([title, body], i) => (
          <div key={title} className="flex gap-5 py-6">
            <span className="text-2xl font-black text-ink-900 w-6">{i + 1}</span>
            <div>
              <p className="text-xl font-bold text-ink-900">{title}</p>
              <p className="text-ink-500 mt-1">{body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const PHASES = {
  1: {
    title: "Tell us about your hotel",
    body: "We'll ask what kind of place you have and where it is. That's what your AI needs to start talking to guests.",
  },
  2: {
    title: "Make it stand out",
    body: "Now your rooms — how many of each, and the price per night. Your AI quotes these and your calendar is built from them.",
  },
  3: {
    title: "Finish up",
    body: "Last bits: where you already sell, who handles airport pickups, and switching your AI on.",
  },
};

function PhaseIntro({ phase }) {
  const p = PHASES[phase];
  return (
    <div className="pt-6">
      <p className="text-sm font-bold text-ink-500">Step {phase}</p>
      <h1 className="text-4xl sm:text-5xl font-black text-ink-900 mt-2 leading-tight">
        {p.title}
      </h1>
      <p className="text-lg text-ink-500 mt-5 leading-relaxed">{p.body}</p>
    </div>
  );
}

function Question({ title, sub, children }) {
  return (
    <div>
      <h1 className="text-3xl sm:text-[34px] font-black text-ink-900 leading-tight">
        {title}
      </h1>
      {sub && <p className="text-ink-500 mt-2 text-[17px]">{sub}</p>}
      <div className="mt-8">{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block px-4 py-3 bg-white">
      <span className="block text-xs text-ink-500">{label}</span>
      <div className="mt-0.5 text-[17px]">{children}</div>
    </label>
  );
}

function Choice({ active, onClick, title, body }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-2xl border-2 p-5 transition ${
        active ? "border-ink-900 bg-ink-50" : "border-ink-200 hover:border-ink-400"
      }`}
    >
      <p className="font-bold text-ink-900 text-[17px]">{title}</p>
      <p className="text-sm text-ink-500 mt-1">{body}</p>
    </button>
  );
}

function Stepper({ value, onChange, min = 1, max = 500 }) {
  const n = Number(value) || min;
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, n - 1))}
        disabled={n <= min}
        className="w-8 h-8 rounded-full border border-ink-300 flex items-center justify-center text-ink-700 hover:border-ink-900 disabled:opacity-30"
        aria-label="Fewer"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className="w-6 text-center font-bold text-ink-900">{n}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, n + 1))}
        disabled={n >= max}
        className="w-8 h-8 rounded-full border border-ink-300 flex items-center justify-center text-ink-700 hover:border-ink-900 disabled:opacity-30"
        aria-label="More"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function Summary({ label, value }) {
  return (
    <div className="rounded-2xl border border-ink-200 p-4">
      <p className="text-xs font-bold text-ink-500">{label}</p>
      <p className="font-bold text-ink-900 mt-1">{value}</p>
    </div>
  );
}

/** Airbnb's three-segment bar: each phase fills as its screens are passed. */
function ProgressBar({ screenIndex }) {
  const segments = [1, 2, 3].map((phase) => {
    const screens = SCREENS.map((sc, i) => ({ ...sc, i })).filter(
      (sc) => sc.phase === phase,
    );
    const first = screens[0].i;
    const last = screens[screens.length - 1].i;
    if (screenIndex >= last) return 1;
    if (screenIndex < first) return 0;
    return (screenIndex - first + 1) / (last - first + 1);
  });
  return (
    <div className="flex gap-1.5">
      {segments.map((fill, i) => (
        <div key={i} className="flex-1 h-1.5 bg-ink-100 overflow-hidden">
          <div
            className="h-full bg-ink-900 transition-all duration-500"
            style={{ width: `${fill * 100}%` }}
          />
        </div>
      ))}
    </div>
  );
}
