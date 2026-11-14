/**
 * Hotel onboarding — built on Airbnb's listing flow.
 *
 * Airbnb gets a first-time host from nothing to a live listing with three
 * ideas, and this copies all three:
 *
 *   1. Three named phases, shown up front so the end is visible from the start:
 *      "Tell us about your hotel" → "Make it stand out" → "Your website & AI".
 *   2. ONE question per screen. Big tappable cards and +/− steppers instead of
 *      forms, so nothing is ever a wall of fields.
 *   3. A fixed footer: Back on the left, Next on the right, and a three-part
 *      progress bar above it.
 *
 * Two lanes into the same finish:
 *
 *   Fast lane — already on Airbnb / Booking.com / Expedia: give us the listing
 *   ID, we import the hotel and its rooms, show it all on one review screen
 *   (every field editable), "All good" → straight to the website step.
 *
 *   Manual lane — type → name → location → rooms → pickups → website step.
 *
 * Then: choose a website design (full live previews) → WhatsApp number for
 * the site → photos (or stock for now) → "your site is live at
 * botlify.site/<slug>" → connect WhatsApp → done.
 *
 * Saving happens as you go so a refresh or a WhatsApp OAuth round trip never
 * loses work. Answers are mirrored to sessionStorage, and the OAuth return URL
 * (?step=messaging, hardcoded in channelController.js) lands back on the
 * WhatsApp screen — screens are addressed by id, not index, so adding screens
 * never breaks that.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Castle,
  Check,
  CloudDownload,
  Copy,
  ExternalLink,
  Globe,
  Home,
  Hotel,
  Loader2,
  Minus,
  Palmtree,
  PenLine,
  Plus,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import api from "@/services/api";
import {
  Magnetic,
  PulseDot,
  Reveal,
  Spotlight,
  Tilt,
} from "@/components/fx";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import OtaLogo from "@/components/OtaLogo";
import WhatsAppConnectModal from "@/components/WhatsAppConnectModal";
import { LIVE_OTA_CHANNELS } from "@/data/otaChannels";
import TemplateGallery from "@/website/TemplateGallery";
import SiteRenderer from "@/website/SiteRenderer";
import { GalleryManager } from "@/website/editor";
import { SITE_HOST, siteUrl, websiteApi } from "@/website/api";
import { templateById } from "@/website/templates";

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
 * screens are the big phase title cards Airbnb shows between sections. Which
 * screen follows which is decided by nextOf() — the fast lane skips some.
 */
const SCREENS = [
  { id: "welcome", phase: 0 },
  { id: "phase1", phase: 1, intro: true },
  { id: "start", phase: 1 },
  { id: "import", phase: 1 },
  { id: "review", phase: 1 },
  { id: "type", phase: 1 },
  { id: "name", phase: 1 },
  { id: "location", phase: 1 },
  { id: "phase2", phase: 2, intro: true },
  { id: "rooms", phase: 2 },
  { id: "pickup", phase: 2 },
  { id: "phase3", phase: 3, intro: true },
  { id: "template", phase: 3 },
  { id: "whatsapp", phase: 3 },
  { id: "photos", phase: 3 },
  { id: "sitelive", phase: 3 },
  { id: "messaging", phase: 3 },
  { id: "done", phase: 3 },
];
const indexOf = (id) => SCREENS.findIndex((x) => x.id === id);

/** Where Next goes from each screen. */
function nextOf(s) {
  switch (s.screen) {
    case "welcome": return "phase1";
    case "phase1": return "start";
    case "start": return s.path === "import" ? "import" : "type";
    case "import": return "review";
    case "review": return "phase3"; // fast lane: straight to the website
    case "type": return "name";
    case "name": return "location";
    case "location": return "phase2";
    case "phase2": return "rooms";
    case "rooms": return "pickup";
    case "pickup": return "phase3";
    case "phase3": return "template";
    case "template": return "whatsapp";
    case "whatsapp": return "photos";
    case "photos": return "sitelive";
    case "sitelive": return "messaging";
    case "messaging": return "done";
    default: return "done";
  }
}

const blankRoom = () => ({ name: "", units: 1, price: "" });

const initial = () => ({
  screen: "welcome",
  trail: [], // screens visited, for Back
  path: null, // "import" | "manual"
  type: "",
  name: "",
  city: "",
  country: "Indonesia",
  address: "",
  currency: "IDR",
  rooms: [{ name: "Standard Room", units: 1, price: "" }],
  otas: {}, // { booking: "1234567", airbnb: "" }
  imported: false,
  ownTaxi: null,
  driver: { name: "", phone: "" },
  propertyId: null,
  roomIds: [], // server ids, parallel to rooms[]
  templateId: null,
  siteSlug: null,
  whatsapp: "",
  photos: [], // the hotel's own photos for the website gallery
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
  // Fast lane
  const [importChoices, setImportChoices] = useState(null);
  const [importError, setImportError] = useState("");
  // Website
  const [previewSite, setPreviewSite] = useState(null); // draft for template previews
  const [liveSite, setLiveSite] = useState(null); // the generated site
  const [choosing, setChoosing] = useState(null); // template being generated

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

  // The template gallery previews every design with the hotel's own details.
  useEffect(() => {
    if (s.screen !== "template" || previewSite) return;
    websiteApi.draft().then(setPreviewSite).catch(() => {});
  }, [s.screen, previewSite]);

  // After a refresh mid-website, fetch the generated site again.
  useEffect(() => {
    if (!["whatsapp", "photos", "sitelive"].includes(s.screen) || liveSite) return;
    websiteApi
      .get()
      .then((res) => {
        if (!res.website) return;
        setLiveSite(res.site);
        if (!s.siteSlug) set({ siteSlug: res.website.slug });
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.screen, liveSite]);

  const go = (id) => {
    setS((cur) => {
      const next = { ...cur, trail: [...(cur.trail || []), cur.screen].slice(-30), screen: id };
      persist(next);
      return next;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const next = () => go(nextOf(s));
  const back = () => {
    setS((cur) => {
      const trail = [...(cur.trail || [])];
      const prev = trail.pop() || SCREENS[Math.max(indexOf(cur.screen) - 1, 0)].id;
      const nextState = { ...cur, trail, screen: prev };
      persist(nextState);
      return nextState;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

  const saveRooms = async (propertyId = s.propertyId) => {
    const ids = [...(s.roomIds || [])];
    for (let i = 0; i < s.rooms.length; i++) {
      const r = s.rooms[i];
      const payload = {
        name: r.name.trim(),
        unitsCount: Math.max(1, Number(r.units) || 1),
        baseRate: Number(r.price),
        currency: s.currency,
      };
      if (!ids[i]) {
        payload.maxAdults = 2;
        payload.maxOccupancy = 2;
      }
      if (ids[i]) {
        await api.put(`/hotel/rooms/${ids[i]}`, payload);
      } else {
        const { data } = await api.post(
          `/hotel/properties/${propertyId}/rooms`,
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

  // The OTAs the hotel told us they're on — recorded as intent, not state.
  const saveChannels = async (propertyId = s.propertyId) => {
    const requestedOtas = Object.keys(s.otas || {});
    if (!requestedOtas.length || !propertyId) return;
    await api.put(`/hotel/properties/${propertyId}`, { requestedOtas }).catch(() => {});
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

  // ── Fast lane: import from the OTA listing ────────────────────────────
  const applyImport = (data) => {
    const p = data.property || {};
    const rts = (data.roomTypes || []).filter((r) => r.active !== false);
    set({
      imported: true,
      propertyId: p._id,
      name: p.name || s.name,
      type: p.propertyType || s.type || "hotel",
      city: p.city || "",
      country: p.country || s.country,
      address: p.address || "",
      currency: p.currency || s.currency,
      rooms: rts.length
        ? rts.map((r) => ({ name: r.name, units: r.unitsCount || 1, price: r.baseRate ? String(r.baseRate) : "" }))
        : s.rooms,
      roomIds: rts.map((r) => r._id),
    });
    setImportChoices(null);
    setImportError("");
    go("review");
  };

  const doImport = async (providerPropertyId) => {
    const requestedOtas = Object.keys(s.otas);
    const otaPropertyId = Object.values(s.otas).map((v) => String(v).trim()).find(Boolean);
    setBusy(true);
    setImportError("");
    try {
      const { data } = await api.post("/hotel/connection/import", {
        ...(providerPropertyId ? { providerPropertyId } : { otaPropertyId }),
        requestedOtas,
      });
      if (data.resolved === false) {
        setImportChoices(data.choices || []);
        if (!data.choices?.length) setImportError(data.message);
        return;
      }
      applyImport(data);
      toast.success("We brought your hotel across — check it over");
    } catch (e) {
      setImportError(
        e?.response?.data?.message ||
          "We couldn't import your listing just now.",
      );
    } finally {
      setBusy(false);
    }
  };

  // ── Website ───────────────────────────────────────────────────────────
  const chooseTemplate = async (templateId) => {
    if (busy) return;
    setBusy(true);
    setChoosing(templateId);
    try {
      const res = await websiteApi.generate({ templateId });
      setLiveSite(res.site);
      const own = (res.website.content?.gallery || []).filter((g) => !g.stock);
      set({
        templateId,
        siteSlug: res.website.slug,
        whatsapp: s.whatsapp || (res.website.whatsappNumber ? `+${res.website.whatsappNumber}` : user?.phone || ""),
        photos: s.photos?.length ? s.photos : own,
      });
      go("whatsapp");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Couldn't create your website — try again.");
    } finally {
      setBusy(false);
      setChoosing(null);
    }
  };

  const saveWhatsapp = async () => {
    const res = await websiteApi.update({ whatsappNumber: s.whatsapp });
    setLiveSite(res.site);
    set({ whatsapp: res.website.whatsappNumber ? `+${res.website.whatsappNumber}` : s.whatsapp });
  };

  const savePhotos = async () => {
    const own = (s.photos || []).filter((p) => p.url);
    if (!own.length) return; // skipped — the stock gallery stays
    const content = {
      gallery: own,
      hero: { image: own[0].url },
      about: { image: (own[1] || own[0]).url },
    };
    const res = await websiteApi.update({ content });
    setLiveSite(res.site);
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
    if (s.screen === "import") return doImport();
    setBusy(true);
    try {
      if (s.screen === "location") {
        const id = await saveProperty();
        await saveChannels(id);
      }
      if (s.screen === "rooms") await saveRooms();
      if (s.screen === "review") {
        const id = await saveProperty();
        await saveRooms(id);
      }
      if (s.screen === "pickup") await savePickup();
      if (s.screen === "whatsapp") await saveWhatsapp();
      if (s.screen === "photos") await savePhotos();
      if (s.screen === "done") return finish();
      next();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Couldn't save that — try again.");
    } finally {
      setBusy(false);
    }
  };

  // ── What makes Next available ─────────────────────────────────────────
  const roomsOk =
    s.rooms.length > 0 && s.rooms.every((r) => r.name.trim() && Number(r.price) > 0);
  const canNext = useMemo(() => {
    switch (s.screen) {
      case "start":
        return !!s.path;
      case "import":
        return (
          Object.keys(s.otas).length > 0 &&
          Object.values(s.otas).some((v) => String(v).trim()) &&
          !importChoices
        );
      case "review":
        return s.name.trim().length > 1 && s.city.trim() && roomsOk;
      case "type":
        return !!s.type;
      case "name":
        return s.name.trim().length > 1;
      case "location":
        return s.city.trim() && s.country.trim();
      case "rooms":
        return roomsOk;
      case "pickup":
        return s.ownTaxi === false || (s.ownTaxi === true && s.driver.name.trim() && s.driver.phone.trim());
      case "template":
        return !!s.templateId && !!s.siteSlug;
      case "whatsapp":
        return String(s.whatsapp).replace(/\D/g, "").length >= 8;
      default:
        return true;
    }
  }, [s, roomsOk, importChoices]);

  // Which way the flow is moving — screens slide in from the right going
  // forward and from the left going back.
  const lastIdx = useRef(idx);
  const dir = idx >= lastIdx.current ? 1 : -1;
  useEffect(() => {
    lastIdx.current = idx;
  }, [idx]);

  if (!ready) {
    return (
      <div className="max-w-2xl mx-auto px-5 sm:px-6 pt-10 sm:pt-16" aria-busy="true">
        <div className="h-4 w-24 rounded-lg bg-white/[0.06] animate-pulse" />
        <div className="mt-4 h-10 w-4/5 rounded-xl bg-white/[0.07] animate-pulse" />
        <div className="mt-3 h-5 w-3/5 rounded-lg bg-white/[0.05] animate-pulse" />
        <div className="mt-10 grid sm:grid-cols-2 gap-3">
          <div className="h-32 rounded-2xl bg-white/[0.05] ring-1 ring-white/[0.06] animate-pulse" />
          <div className="h-32 rounded-2xl bg-white/[0.05] ring-1 ring-white/[0.06] animate-pulse" />
        </div>
        <span className="sr-only">
          <Loader2 className="w-7 h-7 animate-spin" />
          Loading
        </span>
      </div>
    );
  }

  const ownPhotos = (s.photos || []).filter((p) => p.url).length;
  const nextLabel =
    s.screen === "welcome"
      ? "Get started"
      : s.screen === "done"
        ? "Go to my dashboard"
        : s.screen === "import"
          ? "Import my listing"
          : s.screen === "review"
            ? "All good — continue"
            : s.screen === "template"
              ? s.templateId ? "Next" : "Pick a design above"
              : s.screen === "photos"
                ? ownPhotos ? "Use these photos" : "Skip — use stock photos for now"
                : s.screen === "sitelive"
                  ? "Continue to WhatsApp"
                  : s.screen === "messaging" && !waConnected
                    ? "Skip for now"
                    : "Next";

  const wide = s.screen === "template";

  return (
    <div className="pb-40 text-white overflow-x-hidden">
      <div className={`${wide ? "max-w-6xl" : "max-w-2xl"} mx-auto px-4 sm:px-6 pt-8 sm:pt-16 transition-[max-width] duration-500`}>
        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <motion.div
            key={screen.id}
            custom={dir}
            variants={SLIDE}
            initial="enter"
            animate="center"
            exit="exit"
          >
        {screen.id === "welcome" && <Welcome />}
        {screen.intro && <PhaseIntro phase={screen.phase} />}

        {screen.id === "start" && (
          <Question
            title="Are you already on Airbnb, Booking.com or Expedia?"
            sub="If you are, we'll bring your hotel, rooms and prices across for you — no retyping."
          >
            <div className="grid sm:grid-cols-2 gap-3">
              <Choice
                active={s.path === "import"}
                onClick={() => set({ path: "import" })}
                title="Yes — import my listing"
                body="The fastest way. Takes about a minute."
                icon={<CloudDownload className="w-6 h-6" strokeWidth={1.8} />}
              />
              <Choice
                active={s.path === "manual"}
                onClick={() => set({ path: "manual", otas: {} })}
                title="No, I'll set it up"
                body="A few quick questions about your place."
                icon={<PenLine className="w-6 h-6" strokeWidth={1.8} />}
              />
            </div>
          </Question>
        )}

        {screen.id === "import" && (
          <Question
            title="Where are you listed?"
            sub="Pick every site you're on and add your listing ID. Bookings from them will land in Botlify on one calendar."
          >
            {!importChoices ? (
              <OtaPicker otas={s.otas} onChange={(otas) => set({ otas })} />
            ) : (
              <div>
                <p className="font-display font-semibold text-white">Which of these is yours?</p>
                <p className="text-sm text-white/55 mt-1">
                  We couldn't match that ID automatically — pick your property and we'll bring it across.
                </p>
                <div className="mt-4 space-y-2">
                  {importChoices.map((c, i) => (
                    <motion.button
                      key={c.providerPropertyId}
                      type="button"
                      disabled={busy}
                      onClick={() => doImport(c.providerPropertyId)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05, ...SPRING }}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full text-left card-dark p-4 transition-shadow duration-500 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_0_0_1px_rgba(255,106,43,0.45),0_18px_40px_-18px_rgba(255,61,119,0.55)] disabled:opacity-60"
                    >
                      <p className="font-semibold text-white">{c.name}</p>
                      <p className="text-sm text-white/55">
                        {[c.city, c.country].filter(Boolean).join(", ")}
                        {c.rooms !== undefined ? ` · ${c.rooms} room types` : ""}
                      </p>
                    </motion.button>
                  ))}
                </div>
                <button type="button" onClick={() => setImportChoices(null)} className="mt-4 min-h-[40px] text-sm font-semibold underline underline-offset-4 text-white/70 hover:text-white">
                  Try a different ID
                </button>
              </div>
            )}
            <AnimatePresence>
              {importError && (
                <motion.div
                  initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                  className="mt-5 rounded-2xl bg-amber-400/10 ring-1 ring-amber-300/25 backdrop-blur-xl p-4"
                >
                  <p className="font-semibold text-amber-100">We couldn't import it automatically</p>
                  <p className="text-sm text-white/65 mt-1">
                    {importError} We've noted where you're listed and will connect those channels for you —
                    meanwhile, set up your place in two minutes.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setImportError("");
                      setImportChoices(null);
                      set({ path: "manual" });
                      go("type");
                    }}
                    className="btn-glass-dark mt-3 text-sm"
                  >
                    Set it up manually
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </Question>
        )}

        {screen.id === "review" && (
          <Question
            title="Here's what we found"
            sub="Check it over — change anything that's not right, or just continue."
          >
            <div className={FIELD_GROUP}>
              <Field label="Name">
                <input value={s.name} onChange={(e) => set({ name: e.target.value })} className={`${FIELD_INPUT} font-semibold`} maxLength={80} />
              </Field>
              <Field label="Type">
                <select value={s.type || "hotel"} onChange={(e) => set({ type: e.target.value })} className={FIELD_INPUT}>
                  {TYPES.map((t) => <option key={t.value} value={t.value} className="text-ink-900">{t.label}</option>)}
                </select>
              </Field>
              <Field label="Street address">
                <input value={s.address} onChange={(e) => set({ address: e.target.value })} className={FIELD_INPUT} />
              </Field>
              <div className="grid grid-cols-2 divide-x divide-white/[0.08]">
                <Field label="City">
                  <input value={s.city} onChange={(e) => set({ city: e.target.value })} className={FIELD_INPUT} />
                </Field>
                <Field label="Country">
                  <input value={s.country} onChange={(e) => set({ country: e.target.value })} className={FIELD_INPUT} />
                </Field>
              </div>
            </div>
            <p className="mt-8 mb-3 font-display font-semibold text-white">Rooms &amp; nightly prices</p>
            <RoomsEditor s={s} set={set} />
            {!roomsOk && (
              <p className="mt-3 text-sm font-medium text-amber-200">
                Add a nightly price for every room — your AI quotes these to guests.
              </p>
            )}
          </Question>
        )}

        {screen.id === "type" && (
          <Question title="Which of these best describes your place?">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
              {TYPES.map(({ value, label, Icon }, i) => {
                const active = s.type === value;
                return (
                  <motion.button
                    key={value}
                    type="button"
                    onClick={() => set({ type: value })}
                    initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ delay: 0.05 + i * 0.04, ...SPRING }}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.96 }}
                    aria-pressed={active}
                    className={`group relative text-left rounded-2xl p-4 h-28 flex flex-col justify-between ${choiceCls(active)}`}
                  >
                    <span
                      className={`h-10 w-10 rounded-xl grid place-items-center transition-[transform,background-color,color] duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg] ${
                        active ? "bg-sunset text-white shadow-[0_8px_20px_-8px_rgba(255,61,119,0.8)]" : "bg-white/[0.07] text-white/80"
                      }`}
                    >
                      <Icon className="w-5 h-5" strokeWidth={1.8} />
                    </span>
                    <span className="font-semibold text-white">{label}</span>
                    <SelectedTick show={active} />
                  </motion.button>
                );
              })}
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
              className="w-full font-display text-xl sm:text-2xl font-semibold tracking-[-0.02em] text-white placeholder:text-white/25 bg-white/[0.05] ring-1 ring-white/10 hover:ring-white/20 focus:ring-2 focus:ring-sunset-flame/60 focus:bg-white/[0.08] focus:shadow-[0_0_0_6px_rgba(255,106,43,0.1),0_16px_40px_-18px_rgba(255,61,119,0.6)] rounded-2xl px-5 py-4 outline-none transition-[box-shadow,background-color] duration-300 backdrop-blur-xl"
              maxLength={80}
            />
          </Question>
        )}

        {screen.id === "location" && (
          <Question
            title="Where's your place located?"
            sub="Shown on your website map, and shared with guests once they've booked."
          >
            <div className={FIELD_GROUP}>
              <Field label="Street address (optional)">
                <input
                  value={s.address}
                  onChange={(e) => set({ address: e.target.value })}
                  placeholder="Jl. Kayu Aya No. 12"
                  className={FIELD_INPUT}
                />
              </Field>
              <Field label="City">
                <input
                  autoFocus
                  value={s.city}
                  onChange={(e) => set({ city: e.target.value })}
                  placeholder="Seminyak"
                  className={FIELD_INPUT}
                />
              </Field>
              <Field label="Country">
                <input
                  value={s.country}
                  onChange={(e) => set({ country: e.target.value })}
                  placeholder="Indonesia"
                  className={FIELD_INPUT}
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
            <RoomsEditor s={s} set={set} />
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
            <AnimatePresence initial={false}>
              {s.ownTaxi === true && (
                <motion.div
                  initial={{ opacity: 0, height: 0, filter: "blur(4px)" }}
                  animate={{ opacity: 1, height: "auto", filter: "blur(0px)" }}
                  exit={{ opacity: 0, height: 0, filter: "blur(4px)" }}
                  transition={SPRING}
                  className="overflow-hidden"
                >
                  <div className={`mt-4 ${FIELD_GROUP}`}>
                    <Field label="Driver's name">
                      <input
                        autoFocus
                        value={s.driver.name}
                        onChange={(e) => set({ driver: { ...s.driver, name: e.target.value } })}
                        placeholder="Wayan"
                        className={FIELD_INPUT}
                      />
                    </Field>
                    <Field label="Driver's WhatsApp number">
                      <input
                        type="tel"
                        value={s.driver.phone}
                        onChange={(e) => set({ driver: { ...s.driver, phone: e.target.value } })}
                        placeholder="+62 812 3456 7890"
                        className={FIELD_INPUT}
                      />
                    </Field>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Question>
        )}

        {screen.id === "template" && (
          <Question
            title="Choose your website design"
            sub="Your hotel gets its own website, free. Every design below is already filled with your details — tap Preview to click through all five pages on desktop or phone."
          >
            <AnimatePresence>
              {choosing && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mb-4 flex items-center gap-2 rounded-xl bg-white/[0.06] ring-1 ring-white/10 backdrop-blur-xl px-4 py-3 text-sm font-medium text-white/80"
                >
                  <Loader2 className="h-4 w-4 animate-spin text-sunset-gold" /> Building your website…
                </motion.div>
              )}
            </AnimatePresence>
            <TemplateGallery
              site={previewSite}
              currentId={s.templateId}
              busyId={choosing}
              onSelect={chooseTemplate}
            />
          </Question>
        )}

        {screen.id === "whatsapp" && (
          <Question
            title="Which WhatsApp number should guests message?"
            sub="Every 'Book on WhatsApp' button on your website opens a chat with this number."
          >
            <div className={FIELD_GROUP}>
              <Field label="WhatsApp number, with country code">
                <input
                  autoFocus
                  type="tel"
                  value={s.whatsapp}
                  onChange={(e) => set({ whatsapp: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && canNext && onNext()}
                  placeholder="+62 812 3456 7890"
                  className={`${FIELD_INPUT} text-xl font-semibold font-display tabular-nums`}
                />
              </Field>
            </div>
            <p className="text-xs text-white/45 mt-3">
              A local number like 0812… works too — we add your country code.
            </p>
          </Question>
        )}

        {screen.id === "photos" && (
          <Question
            title="Add photos of your place"
            sub="Upload photos or paste links. Short on time? Skip — we'll use beautiful stock photos for now, and you can swap them any time in Manage your website."
          >
            {/* The gallery manager is a light surface — give it a bright glass sheet. */}
            <div className="glass-strong rounded-3xl p-3 sm:p-5 text-ink-900">
              <GalleryManager photos={s.photos || []} onChange={(photos) => set({ photos })} max={24} />
            </div>
          </Question>
        )}

        {screen.id === "sitelive" && (
          <SiteLive slug={s.siteSlug} site={liveSite} templateId={s.templateId} />
        )}

        {screen.id === "messaging" && (
          <Question
            title="Let your AI answer on WhatsApp"
            sub="Where most guests message you. It replies 24/7, in any language, and books rooms for you."
          >
            {waConnected ? (
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={SPRING}
                className="rounded-2xl bg-emerald-400/10 ring-1 ring-emerald-300/30 backdrop-blur-xl p-5 flex items-center gap-3"
              >
                <span className="relative w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-30" />
                  <Check className="relative w-5 h-5" />
                </span>
                <div>
                  <p className="font-semibold text-white">WhatsApp is connected</p>
                  <p className="text-sm text-white/60">Your AI is answering guests there now.</p>
                </div>
              </motion.div>
            ) : (
              <motion.button
                type="button"
                onClick={() => setWaOpen(true)}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                transition={SPRING}
                className="group w-full card-dark p-5 flex items-center gap-4 text-left transition-shadow duration-500 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_0_0_1px_rgba(16,185,129,0.45),0_20px_50px_-20px_rgba(16,185,129,0.5)]"
              >
                <span className="w-12 h-12 rounded-xl bg-emerald-400/15 ring-1 ring-emerald-300/25 flex items-center justify-center text-2xl shrink-0 transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]">
                  💬
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-white text-[17px]">Connect WhatsApp</p>
                  <p className="text-sm text-white/55">About a minute. You keep your number.</p>
                </div>
                <ArrowRight className="w-5 h-5 text-white/40 shrink-0 transition-all duration-500 ease-spring group-hover:translate-x-1 group-hover:text-emerald-300" />
              </motion.button>
            )}
            <p className="text-xs text-white/45 mt-4">
              Instagram, Messenger and Telegram can be added any time in Settings.
            </p>
          </Question>
        )}

        {screen.id === "done" && (
          <div className="text-center pt-6">
            <motion.div
              initial={{ scale: 0.3, rotate: -25, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 380, damping: 14, delay: 0.1 }}
              className="relative w-16 h-16 mx-auto"
            >
              <div aria-hidden className="absolute -inset-5 rounded-full bg-sunset opacity-35 blur-2xl" />
              <div className="relative w-16 h-16 rounded-2xl bg-sunset text-white flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_16px_40px_-12px_rgba(255,61,119,0.8)]">
                <Check className="w-9 h-9" />
              </div>
            </motion.div>
            <h1 className="font-display text-3xl sm:text-5xl font-semibold tracking-[-0.04em] text-white mt-7 leading-[1.05] break-words">
              {s.name || "Your hotel"} is{" "}
              <span className="font-serif italic font-normal text-sunset pr-1">ready</span>
            </h1>
            <p className="text-base sm:text-lg text-white/60 mt-4 max-w-md mx-auto">
              Your calendar and website are live, and your AI knows your rooms and prices.
              Everything else can be fine-tuned in Settings.
            </p>
            <div className="mt-9 grid sm:grid-cols-3 gap-3 text-left">
              <Summary i={0} label="Rooms" value={`${s.rooms.reduce((n, r) => n + (Number(r.units) || 0), 0)} across ${s.rooms.length} type${s.rooms.length === 1 ? "" : "s"}`} />
              <Summary
                i={1}
                label="Website"
                value={s.siteSlug ? `${SITE_HOST}/${s.siteSlug}` : "Not set up yet"}
              />
              <Summary
                i={2}
                label="Booking channels"
                value={
                  Object.keys(s.otas).length
                    ? LIVE_OTA_CHANNELS.filter((c) => c.key in s.otas).map((c) => c.name).join(", ")
                    : "Direct bookings"
                }
              />
            </div>
          </div>
        )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Fixed footer: progress, Back, Next ──────────────────────── */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 bg-night-950/70 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        <ProgressBar screenIndex={idx} />
        <div className="max-w-5xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-3">
          {idx > 0 && s.screen !== "done" ? (
            <button
              type="button"
              onClick={back}
              className="group inline-flex items-center gap-1.5 min-h-[44px] px-2 -ml-2 rounded-xl font-semibold text-white/75 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 transition-transform duration-500 ease-spring group-hover:-translate-x-1" />
              Back
            </button>
          ) : (
            <span />
          )}
          <Magnetic strength={0.15}>
            <motion.button
              type="button"
              onClick={onNext}
              disabled={!canNext || busy}
              whileTap={!canNext || busy ? undefined : { scale: 0.95 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              className="btn-primary group h-12 px-5 sm:px-7 text-[15px] max-w-[64vw] sm:max-w-none disabled:opacity-40 disabled:saturate-50"
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
              <span className="truncate">{nextLabel}</span>
              {!busy && (
                <ArrowRight className="w-4 h-4 shrink-0 transition-transform duration-500 ease-spring group-hover:translate-x-1" />
              )}
            </motion.button>
          </Magnetic>
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

/* ── Motion + style tokens ───────────────────────────────────────────── */

const SPRING = { type: "spring", stiffness: 380, damping: 30 };

// Screen transition: slide + blur, direction-aware.
const SLIDE = {
  enter: (d) => ({ opacity: 0, x: d * 48, filter: "blur(10px)" }),
  center: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 260, damping: 30, mass: 0.9 },
  },
  exit: (d) => ({
    opacity: 0,
    x: d * -48,
    filter: "blur(10px)",
    transition: { duration: 0.22, ease: [0.4, 0, 1, 1] },
  }),
};

const FIELD_GROUP =
  "rounded-2xl overflow-hidden divide-y divide-white/[0.08] bg-white/[0.04] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_0_1px_rgba(255,255,255,0.09)]";
const FIELD_INPUT =
  "w-full outline-none text-white placeholder:text-white/30 bg-transparent";

/** Choice-card surface: lifts on hover, glows with a sunset edge when picked. */
const choiceCls = (active) =>
  `backdrop-blur-xl transition-[background-color,box-shadow] duration-500 ${
    active
      ? "bg-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_0_0_1.5px_rgba(255,106,43,0.75),0_20px_44px_-18px_rgba(255,61,119,0.65)]"
      : "bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_0_1px_rgba(255,255,255,0.09)] hover:bg-white/[0.07] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_0_0_1px_rgba(255,255,255,0.18)]"
  }`;

function SelectedTick({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.span
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 45 }}
          transition={{ type: "spring", stiffness: 520, damping: 18 }}
          className="absolute top-3 right-3 h-6 w-6 rounded-full bg-sunset grid place-items-center shadow-[0_6px_16px_-6px_rgba(255,61,119,0.9)]"
        >
          <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
        </motion.span>
      )}
    </AnimatePresence>
  );
}

/* ── Pieces ──────────────────────────────────────────────────────────── */

function Welcome() {
  const steps = [
    ["Tell us about your hotel", "Already on Airbnb or Booking.com? We'll bring it all across."],
    ["Make it stand out", "Your rooms and what they cost a night."],
    ["Your website & AI", "Pick a design for your free website, then switch your AI on."],
  ];
  return (
    <div>
      <Reveal>
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] ring-1 ring-white/10 backdrop-blur text-xs font-semibold text-white/75">
          <Sparkles className="w-3.5 h-3.5 text-sunset-gold" /> About 5 minutes
        </span>
        <h1 className="mt-5 font-display text-[40px] sm:text-6xl font-semibold tracking-[-0.045em] text-white leading-[0.98]">
          It's easy to get started on{" "}
          <span className="font-serif italic font-normal text-sunset pr-1">Botlify</span>
        </h1>
      </Reveal>
      <div className="mt-10 space-y-3">
        {steps.map(([title, body], i) => (
          <Reveal key={title} delay={0.1 + i * 0.08}>
            <div className="group card-dark flex gap-4 sm:gap-5 p-4 sm:p-5 transition-transform duration-500 ease-spring hover:-translate-y-0.5">
              <span className="h-10 w-10 shrink-0 rounded-xl grid place-items-center bg-sunset-soft ring-1 ring-white/10 font-display text-lg font-semibold text-sunset-gold tabular-nums transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="font-display text-lg sm:text-xl font-semibold tracking-[-0.02em] text-white">{title}</p>
                <p className="text-white/55 mt-1 text-[15px]">{body}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

const PHASES = {
  1: {
    title: "Tell us about your hotel",
    body: "If you're already on Airbnb, Booking.com or Expedia we'll import everything. If not, a few quick questions: what kind of place it is and where.",
  },
  2: {
    title: "Make it stand out",
    body: "Now your rooms — how many of each, and the price per night. Your AI quotes these and your calendar is built from them.",
  },
  3: {
    title: "Your website & AI",
    body: "Pick a design and your hotel gets its own website — filled in for you, with a WhatsApp booking button. Then switch your AI on.",
  },
};

const PHASE_ICONS = { 1: Hotel, 2: Sparkles, 3: Globe };

function PhaseIntro({ phase }) {
  const p = PHASES[phase];
  const Icon = PHASE_ICONS[phase] || Sparkles;
  return (
    <div className="pt-4 sm:pt-6">
      <motion.div
        initial={{ scale: 0.5, rotate: -20, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 16, delay: 0.08 }}
        className="relative h-14 w-14 mb-6"
      >
        <div aria-hidden className="absolute -inset-4 rounded-full bg-sunset opacity-30 blur-2xl" />
        <div className="relative h-14 w-14 rounded-2xl bg-sunset text-white grid place-items-center shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_14px_36px_-12px_rgba(255,61,119,0.8)]">
          <Icon className="w-7 h-7" strokeWidth={1.8} />
        </div>
      </motion.div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sunset-gold">Step {phase}</p>
      <h1 className="font-display text-4xl sm:text-6xl font-semibold tracking-[-0.045em] text-white mt-3 leading-[0.98]">
        {p.title}
      </h1>
      <p className="text-base sm:text-lg text-white/60 mt-5 leading-relaxed">{p.body}</p>
    </div>
  );
}

function Question({ title, sub, children }) {
  return (
    <div>
      <h1 className="font-display text-[28px] sm:text-[38px] font-semibold tracking-[-0.035em] text-white leading-[1.08]">
        {title}
      </h1>
      {sub && <p className="text-white/60 mt-3 text-[15px] sm:text-[17px]">{sub}</p>}
      <div className="mt-8">{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block px-4 py-3 transition-colors duration-300 hover:bg-white/[0.03] focus-within:bg-white/[0.06] focus-within:shadow-[inset_2px_0_0_#FF6A2B]">
      <span className="block text-xs text-white/50">{label}</span>
      <div className="mt-0.5 text-[17px]">{children}</div>
    </label>
  );
}

function Choice({ active, onClick, title, body, icon }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.97 }}
      transition={SPRING}
      aria-pressed={active}
      className={`group relative text-left rounded-2xl p-5 ${choiceCls(active)}`}
    >
      {icon && (
        <span
          className={`mb-4 h-11 w-11 rounded-xl grid place-items-center transition-[transform,background-color,color] duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg] ${
            active ? "bg-sunset text-white shadow-[0_8px_20px_-8px_rgba(255,61,119,0.8)]" : "bg-white/[0.07] text-white/80"
          }`}
        >
          {icon}
        </span>
      )}
      <p className="font-display font-semibold text-white text-[17px] pr-7">{title}</p>
      <p className="text-sm text-white/55 mt-1">{body}</p>
      <SelectedTick show={active} />
    </motion.button>
  );
}

/** Pick the OTAs you're on, each with its listing ID. */
function OtaPicker({ otas, onChange }) {
  return (
    <div className="space-y-3">
      {LIVE_OTA_CHANNELS.map((c, i) => {
        const on = c.key in otas;
        return (
          <motion.div
            key={c.key}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.04, 0.3), ...SPRING }}
            className={`rounded-2xl overflow-hidden ${choiceCls(on)}`}
          >
            <button
              type="button"
              onClick={() => {
                const nextOtas = { ...otas };
                if (on) delete nextOtas[c.key];
                else nextOtas[c.key] = "";
                onChange(nextOtas);
              }}
              className="group w-full flex items-center gap-3.5 p-4 text-left active:scale-[0.99] transition-transform"
            >
              <span className="rounded-xl bg-white p-1 shadow-[0_4px_14px_-6px_rgba(0,0,0,0.5)] transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-6deg]">
                <OtaLogo channelKey={c.key} name={c.name} size={32} />
              </span>
              <span className="flex-1 min-w-0 font-semibold text-white text-[17px] truncate">{c.name}</span>
              <span
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 ease-spring ${
                  on ? "bg-sunset scale-110 shadow-[0_6px_16px_-6px_rgba(255,61,119,0.9)]" : "ring-1 ring-white/25"
                }`}
              >
                {on && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
              </span>
            </button>
            <AnimatePresence initial={false}>
              {on && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={SPRING}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4">
                    <input
                      autoFocus
                      value={otas[c.key]}
                      onChange={(e) => onChange({ ...otas, [c.key]: e.target.value })}
                      placeholder={`Your ${c.name} property ID`}
                      className="w-full rounded-xl px-3.5 py-2.5 text-white placeholder:text-white/35 bg-white/[0.06] ring-1 ring-white/10 outline-none font-mono transition-[box-shadow,background-color] duration-300 focus:bg-white/[0.09] focus:ring-2 focus:ring-sunset-flame/60"
                    />
                    <p className="text-xs text-white/45 mt-1.5">{ID_HINT[c.key]}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

/** Rooms with a count and a nightly price — used by both lanes. */
function RoomsEditor({ s, set }) {
  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-white/60">Prices in</span>
        <select
          value={s.currency}
          onChange={(e) => set({ currency: e.target.value })}
          className="rounded-xl px-3 py-1.5 text-sm font-semibold text-white bg-white/[0.06] ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-sunset-flame/60 transition"
        >
          {[...new Set([s.currency, ...CURRENCIES])].map((c) => (
            <option key={c} className="text-ink-900">{c}</option>
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
              <motion.div
                key={i}
                layout
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={SPRING}
                className="card-dark p-4 focus-within:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_0_0_1px_rgba(255,106,43,0.4),0_20px_50px_-24px_rgba(255,61,119,0.5)] transition-shadow duration-500"
              >
                <div className="flex items-center gap-2">
                  <input
                    value={r.name}
                    onChange={(e) => update({ name: e.target.value })}
                    placeholder="Room name, e.g. Deluxe Double"
                    className="flex-1 min-w-0 font-semibold text-white placeholder:text-white/30 outline-none text-[17px] bg-transparent"
                  />
                  {s.rooms.length > 1 && (
                    <button
                      type="button"
                      onClick={() => set({ rooms: s.rooms.filter((_, j) => j !== i) })}
                      className="h-9 w-9 grid place-items-center rounded-lg text-white/40 hover:text-rose-300 hover:bg-rose-500/15 active:scale-90 transition duration-300 ease-spring"
                      aria-label="Remove room"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t border-white/[0.07] flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-white/55">How many</span>
                    <Stepper value={r.units} onChange={(units) => update({ units })} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white/55">Per night</span>
                    <div className="flex items-center rounded-xl px-3 py-1.5 bg-white/[0.06] ring-1 ring-white/10 focus-within:ring-2 focus-within:ring-sunset-flame/60 transition">
                      <span className="text-xs font-semibold text-white/40 mr-1.5">{s.currency}</span>
                      <input
                        inputMode="numeric"
                        value={r.price}
                        onChange={(e) => update({ price: e.target.value.replace(/[^0-9.]/g, "") })}
                        placeholder="0"
                        className="w-24 outline-none font-semibold text-white placeholder:text-white/30 bg-transparent tabular-nums"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
      </div>

      <motion.button
        type="button"
        onClick={() => set({ rooms: [...s.rooms, blankRoom()] })}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={SPRING}
        className="group mt-3 w-full rounded-2xl border border-dashed border-white/20 hover:border-sunset-flame/50 hover:bg-white/[0.03] py-3.5 font-semibold text-white/80 inline-flex items-center justify-center gap-1.5 transition-colors"
      >
        <Plus className="w-4 h-4 text-sunset-gold transition-transform duration-500 ease-spring group-hover:rotate-90" />
        Add another room
      </motion.button>
    </>
  );
}

/** "Your website is live" — the URL, a peek at it, and Open. */
function SiteLive({ slug, site, templateId }) {
  const url = slug ? siteUrl(slug) : null;
  return (
    <div className="text-center pt-2">
      <motion.div
        initial={{ scale: 0.3, rotate: -25, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 14, delay: 0.1 }}
        className="relative w-16 h-16 mx-auto"
      >
        <div aria-hidden className="absolute -inset-5 rounded-full bg-emerald-400 opacity-30 blur-2xl" />
        <div className="relative w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
          <Globe className="w-8 h-8" strokeWidth={1.8} />
        </div>
      </motion.div>
      <h1 className="font-display text-3xl sm:text-5xl font-semibold tracking-[-0.04em] text-white mt-7">
        Your website is{" "}
        <span className="font-serif italic font-normal text-sunset pr-1">live</span>
      </h1>
      <p className="text-base sm:text-lg text-white/60 mt-3">
        Share it anywhere — guests can see your rooms and book with you on WhatsApp.
      </p>
      {slug && (
        <div className="mt-6 inline-flex max-w-full items-center gap-2 rounded-2xl bg-white/[0.06] ring-1 ring-white/10 backdrop-blur-xl pl-4 pr-2 py-2">
          <PulseDot color="bg-emerald-400" />
          <span className="font-semibold font-mono text-white text-[15px] sm:text-[17px] truncate">{SITE_HOST}/{slug}</span>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(url);
              toast.success("Link copied");
            }}
            className="h-9 w-9 shrink-0 grid place-items-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 active:scale-90 transition duration-300 ease-spring"
            aria-label="Copy link"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      )}
      {site && (
        <Tilt max={5} className="mt-8 block">
          <a
            href={url || undefined}
            target="_blank"
            rel="noopener noreferrer"
            className="block overflow-hidden rounded-2xl bg-white text-left ring-1 ring-white/15 shadow-[0_40px_100px_-40px_rgba(255,61,119,0.6)]"
          >
            <div className="flex items-center gap-1.5 border-b border-ink-900/[0.06] bg-white/80 px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-[#FF5F57]" />
              <span className="h-2 w-2 rounded-full bg-[#FEBC2E]" />
              <span className="h-2 w-2 rounded-full bg-[#28C840]" />
              <span className="ml-3 text-xs font-medium text-ink-500 truncate">{SITE_HOST}/{slug}</span>
            </div>
            <SiteRenderer site={site} templateId={templateId} mode="thumb" className="aspect-[16/10] w-full" />
          </a>
        </Tilt>
      )}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-glass-dark group"
          >
            Open website{" "}
            <ExternalLink className="w-4 h-4 transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        )}
      </div>
      <p className="text-sm text-white/45 mt-4">
        {templateId ? `${templateById(templateId).name} design. ` : ""}
        Change the design, text and photos any time in <b className="text-white/75">Manage your website</b>.
      </p>
    </div>
  );
}

function Stepper({ value, onChange, min = 1, max = 500 }) {
  const n = Number(value) || min;
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, n - 1))}
        disabled={n <= min}
        className="w-9 h-9 rounded-full bg-white/[0.06] ring-1 ring-white/15 flex items-center justify-center text-white/80 hover:bg-white/[0.12] hover:ring-white/30 active:scale-90 transition duration-300 ease-spring disabled:opacity-30 disabled:active:scale-100"
        aria-label="Fewer"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className="relative w-8 h-6 overflow-hidden text-center font-display font-semibold text-white tabular-nums">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={n}
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute inset-0"
          >
            {n}
          </motion.span>
        </AnimatePresence>
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, n + 1))}
        disabled={n >= max}
        className="w-9 h-9 rounded-full bg-white/[0.06] ring-1 ring-white/15 flex items-center justify-center text-white/80 hover:bg-white/[0.12] hover:ring-white/30 active:scale-90 transition duration-300 ease-spring disabled:opacity-30 disabled:active:scale-100"
        aria-label="More"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function Summary({ label, value, i = 0 }) {
  return (
    <Reveal delay={0.25 + i * 0.07} className="h-full">
      <Spotlight className="card-dark h-full p-4">
        <p className="text-xs font-medium text-white/50">{label}</p>
        <p className="font-semibold text-white mt-1 break-words">{value}</p>
      </Spotlight>
    </Reveal>
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
        <div key={i} className="relative flex-1 h-1.5 bg-white/[0.08] overflow-hidden">
          <motion.div
            className="h-full bg-sunset relative"
            initial={false}
            animate={{ width: `${fill * 100}%` }}
            transition={{ type: "spring", stiffness: 140, damping: 24 }}
          >
            {fill > 0 && fill < 1 && (
              <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-sunset-magenta blur-[6px]" />
            )}
          </motion.div>
        </div>
      ))}
    </div>
  );
}
