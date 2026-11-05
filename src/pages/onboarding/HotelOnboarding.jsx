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
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
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
  Trash2,
  Users,
} from "lucide-react";
import api from "@/services/api";
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

  if (!ready) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-7 h-7 text-brand-500 animate-spin" />
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
    <div className="pb-36">
      <div className={`${wide ? "max-w-6xl" : "max-w-2xl"} mx-auto px-5 sm:px-6 pt-10 sm:pt-16`}>
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
                icon={<CloudDownload className="w-6 h-6 text-ink-800" />}
              />
              <Choice
                active={s.path === "manual"}
                onClick={() => set({ path: "manual", otas: {} })}
                title="No, I'll set it up"
                body="A few quick questions about your place."
                icon={<PenLine className="w-6 h-6 text-ink-800" />}
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
                <p className="font-bold text-ink-900">Which of these is yours?</p>
                <p className="text-sm text-ink-500 mt-1">
                  We couldn't match that ID automatically — pick your property and we'll bring it across.
                </p>
                <div className="mt-4 space-y-2">
                  {importChoices.map((c) => (
                    <button
                      key={c.providerPropertyId}
                      type="button"
                      disabled={busy}
                      onClick={() => doImport(c.providerPropertyId)}
                      className="w-full text-left rounded-2xl border-2 border-ink-200 hover:border-ink-900 p-4 transition disabled:opacity-60"
                    >
                      <p className="font-bold text-ink-900">{c.name}</p>
                      <p className="text-sm text-ink-500">
                        {[c.city, c.country].filter(Boolean).join(", ")}
                        {c.rooms !== undefined ? ` · ${c.rooms} room types` : ""}
                      </p>
                    </button>
                  ))}
                </div>
                <button type="button" onClick={() => setImportChoices(null)} className="mt-4 text-sm font-bold underline text-ink-600">
                  Try a different ID
                </button>
              </div>
            )}
            {importError && (
              <div className="mt-5 rounded-2xl bg-amber-50 border-2 border-amber-200 p-4">
                <p className="font-bold text-ink-900">We couldn't import it automatically</p>
                <p className="text-sm text-ink-600 mt-1">
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
                  className="mt-3 inline-flex items-center gap-2 bg-ink-900 text-white font-bold rounded-xl px-4 py-2.5 text-sm"
                >
                  Set it up manually
                </button>
              </div>
            )}
          </Question>
        )}

        {screen.id === "review" && (
          <Question
            title="Here's what we found"
            sub="Check it over — change anything that's not right, or just continue."
          >
            <div className="rounded-2xl border-2 border-ink-200 divide-y-2 divide-ink-200 overflow-hidden">
              <Field label="Name">
                <input value={s.name} onChange={(e) => set({ name: e.target.value })} className="w-full outline-none text-ink-900 bg-transparent font-bold" maxLength={80} />
              </Field>
              <Field label="Type">
                <select value={s.type || "hotel"} onChange={(e) => set({ type: e.target.value })} className="w-full outline-none text-ink-900 bg-transparent">
                  {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </Field>
              <Field label="Street address">
                <input value={s.address} onChange={(e) => set({ address: e.target.value })} className="w-full outline-none text-ink-900 bg-transparent" />
              </Field>
              <div className="grid grid-cols-2 divide-x-2 divide-ink-200">
                <Field label="City">
                  <input value={s.city} onChange={(e) => set({ city: e.target.value })} className="w-full outline-none text-ink-900 bg-transparent" />
                </Field>
                <Field label="Country">
                  <input value={s.country} onChange={(e) => set({ country: e.target.value })} className="w-full outline-none text-ink-900 bg-transparent" />
                </Field>
              </div>
            </div>
            <p className="mt-8 mb-3 font-bold text-ink-900">Rooms &amp; nightly prices</p>
            <RoomsEditor s={s} set={set} />
            {!roomsOk && (
              <p className="mt-3 text-sm font-semibold text-amber-700">
                Add a nightly price for every room — your AI quotes these to guests.
              </p>
            )}
          </Question>
        )}

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
            sub="Shown on your website map, and shared with guests once they've booked."
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

        {screen.id === "template" && (
          <Question
            title="Choose your website design"
            sub="Your hotel gets its own website, free. Every design below is already filled with your details — tap Preview to click through all five pages on desktop or phone."
          >
            {choosing && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-ink-50 px-4 py-3 text-sm font-semibold text-ink-700">
                <Loader2 className="h-4 w-4 animate-spin" /> Building your website…
              </div>
            )}
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
            <div className="rounded-2xl border-2 border-ink-200 overflow-hidden">
              <Field label="WhatsApp number, with country code">
                <input
                  autoFocus
                  type="tel"
                  value={s.whatsapp}
                  onChange={(e) => set({ whatsapp: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && canNext && onNext()}
                  placeholder="+62 812 3456 7890"
                  className="w-full outline-none text-ink-900 bg-transparent text-xl font-bold"
                />
              </Field>
            </div>
            <p className="text-xs text-ink-400 mt-3">
              A local number like 0812… works too — we add your country code.
            </p>
          </Question>
        )}

        {screen.id === "photos" && (
          <Question
            title="Add photos of your place"
            sub="Upload photos or paste links. Short on time? Skip — we'll use beautiful stock photos for now, and you can swap them any time in Manage your website."
          >
            <GalleryManager photos={s.photos || []} onChange={(photos) => set({ photos })} max={24} />
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
              Your calendar and website are live, and your AI knows your rooms and prices.
              Everything else can be fine-tuned in Settings.
            </p>
            <div className="mt-8 grid sm:grid-cols-3 gap-3 text-left">
              <Summary label="Rooms" value={`${s.rooms.reduce((n, r) => n + (Number(r.units) || 0), 0)} across ${s.rooms.length} type${s.rooms.length === 1 ? "" : "s"}`} />
              <Summary
                label="Website"
                value={s.siteSlug ? `${SITE_HOST}/${s.siteSlug}` : "Not set up yet"}
              />
              <Summary
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
    ["Tell us about your hotel", "Already on Airbnb or Booking.com? We'll bring it all across."],
    ["Make it stand out", "Your rooms and what they cost a night."],
    ["Your website & AI", "Pick a design for your free website, then switch your AI on."],
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

function Choice({ active, onClick, title, body, icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-2xl border-2 p-5 transition ${
        active ? "border-ink-900 bg-ink-50" : "border-ink-200 hover:border-ink-400"
      }`}
    >
      {icon && <span className="block mb-3">{icon}</span>}
      <p className="font-bold text-ink-900 text-[17px]">{title}</p>
      <p className="text-sm text-ink-500 mt-1">{body}</p>
    </button>
  );
}

/** Pick the OTAs you're on, each with its listing ID. */
function OtaPicker({ otas, onChange }) {
  return (
    <div className="space-y-3">
      {LIVE_OTA_CHANNELS.map((c) => {
        const on = c.key in otas;
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
                const nextOtas = { ...otas };
                if (on) delete nextOtas[c.key];
                else nextOtas[c.key] = "";
                onChange(nextOtas);
              }}
              className="w-full flex items-center gap-3.5 p-4 text-left"
            >
              <OtaLogo channelKey={c.key} name={c.name} size={36} />
              <span className="flex-1 font-bold text-ink-900 text-[17px]">{c.name}</span>
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
                  value={otas[c.key]}
                  onChange={(e) => onChange({ ...otas, [c.key]: e.target.value })}
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
  );
}

/** Rooms with a count and a nightly price — used by both lanes. */
function RoomsEditor({ s, set }) {
  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-ink-600">Prices in</span>
        <select
          value={s.currency}
          onChange={(e) => set({ currency: e.target.value })}
          className="border-2 border-ink-200 rounded-xl px-3 py-1.5 text-sm font-bold outline-none focus:border-ink-900"
        >
          {[...new Set([s.currency, ...CURRENCIES])].map((c) => (
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
                    onClick={() => set({ rooms: s.rooms.filter((_, j) => j !== i) })}
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
                  <Stepper value={r.units} onChange={(units) => update({ units })} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-ink-600">Per night</span>
                  <div className="flex items-center border-2 border-ink-200 focus-within:border-ink-900 rounded-xl px-3 py-1.5">
                    <span className="text-xs font-bold text-ink-400 mr-1.5">{s.currency}</span>
                    <input
                      inputMode="numeric"
                      value={r.price}
                      onChange={(e) => update({ price: e.target.value.replace(/[^0-9.]/g, "") })}
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
    </>
  );
}

/** "Your website is live" — the URL, a peek at it, and Open. */
function SiteLive({ slug, site, templateId }) {
  const url = slug ? siteUrl(slug) : null;
  return (
    <div className="text-center pt-2">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto">
        <Globe className="w-8 h-8" />
      </div>
      <h1 className="text-3xl sm:text-4xl font-black text-ink-900 mt-6">Your website is live</h1>
      <p className="text-lg text-ink-500 mt-3">
        Share it anywhere — guests can see your rooms and book with you on WhatsApp.
      </p>
      {slug && (
        <div className="mt-6 inline-flex items-center gap-2 rounded-2xl border-2 border-ink-200 bg-white pl-4 pr-2 py-2">
          <span className="font-bold text-ink-900 text-[17px]">{SITE_HOST}/{slug}</span>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(url);
              toast.success("Link copied");
            }}
            className="rounded-lg p-2 text-ink-500 hover:bg-ink-100"
            aria-label="Copy link"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      )}
      {site && (
        <a
          href={url || undefined}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 block overflow-hidden rounded-2xl border-2 border-ink-100 shadow-lg text-left"
        >
          <div className="flex items-center gap-1.5 border-b border-ink-100 bg-ink-50 px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-rose-300" />
            <span className="h-2 w-2 rounded-full bg-amber-300" />
            <span className="h-2 w-2 rounded-full bg-emerald-300" />
            <span className="ml-3 text-xs font-semibold text-ink-500">{SITE_HOST}/{slug}</span>
          </div>
          <SiteRenderer site={site} templateId={templateId} mode="thumb" className="aspect-[16/10] w-full" />
        </a>
      )}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-ink-900 px-5 py-3 font-bold text-ink-900 hover:bg-ink-50"
          >
            Open website <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
      <p className="text-sm text-ink-400 mt-4">
        {templateId ? `${templateById(templateId).name} design. ` : ""}
        Change the design, text and photos any time in <b>Manage your website</b>.
      </p>
    </div>
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
      <p className="font-bold text-ink-900 mt-1 break-words">{value}</p>
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
