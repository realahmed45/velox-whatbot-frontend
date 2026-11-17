/**
 * Settings → Services — what the hotel offers beyond the room (massage, spa,
 * airport pickup, tours…). Shown in the website's Services section and known
 * by the AI, which offers them to guests.
 *
 * Load:  GET /hotel/properties → the active property (property switcher's
 *        choice for this workspace, else the first one).
 * Save:  PUT /hotel/properties/:id { services: [{ key, name, description,
 *        price (number|null), priceUnit, icon, enabled }] }
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Baby,
  Bike,
  Car,
  ChefHat,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  Coffee,
  ConciergeBell,
  Dumbbell,
  Flame,
  Flower2,
  Globe,
  HandHeart,
  Map as MapIcon,
  PenLine,
  Plane,
  Plus,
  RotateCcw,
  Shirt,
  Sparkles,
  Trash2,
  UtensilsCrossed,
  Waves,
  X,
} from "lucide-react";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { usePropertyStore } from "@/store/propertyStore";
import { SERVICE_PRESETS, SERVICE_ICON_FALLBACK, makeService } from "@/data/hotelServices";
import SaveBar from "@/pages/hotel/train/SaveBar";
import {
  Switch,
  btnPrimary,
  btnSecondary,
  iconBtn,
  iconBtnDanger,
  panel,
} from "@/pages/hotel/train/ui";

const ICONS = {
  HandHeart,
  Flower2,
  Plane,
  Map: MapIcon,
  UtensilsCrossed,
  Coffee,
  ConciergeBell,
  Shirt,
  Sparkles,
  Bike,
  Car,
  Waves,
  Dumbbell,
  Baby,
  ChefHat,
  Flame,
};
const iconOf = (name) => ICONS[name] || ICONS[SERVICE_ICON_FALLBACK] || Sparkles;

const errMsg = (e, fallback) => e?.response?.data?.message || fallback;
let seq = 0;
const localKey = () => `s${++seq}`;

const toRows = (services = []) =>
  services.map((s) => ({
    _k: localKey(),
    key: s.key || "custom",
    name: s.name || "",
    description: s.description || "",
    price: s.price === null || s.price === undefined ? "" : String(s.price),
    priceUnit: s.priceUnit || "",
    icon: s.icon || SERVICE_ICON_FALLBACK,
    image: s.image || "",
    enabled: s.enabled !== false,
  }));

/** What actually gets saved: price as a number or null. */
const toPayload = (rows) =>
  rows.map((r) => {
    const n = Number(String(r.price ?? "").replace(/[^0-9.]/g, ""));
    const out = {
      key: r.key || "custom",
      name: r.name.trim(),
      description: r.description.trim(),
      price: String(r.price).trim() !== "" && Number.isFinite(n) && n > 0 ? n : null,
      priceUnit: r.priceUnit.trim(),
      icon: r.icon || SERVICE_ICON_FALLBACK,
      enabled: !!r.enabled,
    };
    if (r.image) out.image = r.image;
    return out;
  });

const sig = (rows) => JSON.stringify(toPayload(rows));

const quiet =
  "w-full rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-[#0A0A0A] placeholder:text-neutral-400 transition-[border-color,background-color,box-shadow] hover:border-neutral-200 focus:border-[#FF5A1F] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF5A1F]/15";

export default function ServicesSettings() {
  const activeWorkspace = useAuthStore((s) => s.activeWorkspace);
  const selectedByWorkspace = usePropertyStore((s) => s.selectedByWorkspace);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [property, setProperty] = useState(null);
  const [baseline, setBaseline] = useState([]);
  const [rows, setRows] = useState([]);
  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [picker, setPicker] = useState(false);
  const focusKey = useRef(null);

  const preferred = activeWorkspace ? selectedByWorkspace?.[activeWorkspace] : null;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/hotel/properties");
      const props = data.properties || [];
      const p = props.find((x) => preferred && String(x._id) === String(preferred)) || props[0] || null;
      setProperty(p);
      const r = toRows(p?.services || []);
      setBaseline(r);
      setRows(r);
      setFailed(false);
    } catch (e) {
      setFailed(true);
      toast.error(errMsg(e, "Couldn't load your services"));
    } finally {
      setLoading(false);
    }
  }, [preferred]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!focusKey.current) return;
    document.getElementById(`svc-name-${focusKey.current}`)?.focus();
    focusKey.current = null;
  }, [rows.length]);

  const dirty = useMemo(() => sig(rows) !== sig(baseline), [rows, baseline]);
  const usedKeys = useMemo(() => new Set(rows.map((r) => r.key)), [rows]);
  const freePresets = SERVICE_PRESETS.filter((p) => !usedKeys.has(p.key));
  const currency = property?.currency || "USD";

  const update = (k, patch) => setRows((list) => list.map((r) => (r._k === k ? { ...r, ...patch } : r)));
  const remove = (k) => setRows((list) => list.filter((r) => r._k !== k));
  const move = (i, dir) =>
    setRows((list) => {
      const j = i + dir;
      if (j < 0 || j >= list.length) return list;
      const n = [...list];
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });

  const add = (preset) => {
    const [row] = toRows([makeService(preset)]);
    if (!preset) focusKey.current = row._k;
    setRows((list) => [...list, row]);
    if (!preset) setPicker(false);
  };

  const save = async () => {
    if (!property) return;
    if (rows.some((r) => !r.name.trim())) {
      setShowErrors(true);
      toast.error("Give every service a name, or remove it.");
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.put(`/hotel/properties/${property._id}`, { services: toPayload(rows) });
      const saved = toRows(data?.property?.services || toPayload(rows));
      setBaseline(saved);
      setRows(saved);
      if (data?.property) setProperty(data.property);
      setShowErrors(false);
      toast.success("Services saved — your website and AI are up to date");
    } catch (e) {
      toast.error(errMsg(e, "Couldn't save your services"));
    } finally {
      setSaving(false);
    }
  };

  const discard = () => {
    setRows(baseline);
    setShowErrors(false);
  };

  if (loading) {
    return (
      <div className="space-y-3" aria-busy="true">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`${panel} flex h-[88px] items-center gap-4 px-5`}>
            <div className="h-11 w-11 rounded-xl bg-neutral-100 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 rounded bg-neutral-100 animate-pulse" />
              <div className="h-3 w-64 max-w-full rounded bg-neutral-100 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (failed || !property) {
    return (
      <div className={`${panel} px-6 py-10 text-center`}>
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-neutral-100 text-neutral-500">
          <CircleAlert className="h-6 w-6" strokeWidth={1.8} />
        </span>
        <p className="mt-4 font-semibold text-[#0A0A0A]">
          {failed ? "Couldn't load your services" : "Add your property first"}
        </p>
        <p className="mt-1 text-[14px] text-neutral-500">
          {failed
            ? "Check your connection and try again."
            : "Services belong to a property. Set one up under Property & rooms."}
        </p>
        {failed && (
          <button onClick={load} className={`${btnSecondary} mt-5`}>
            <RotateCcw className="h-4 w-4" />
            Try again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="font-geist">
      <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-neutral-50 px-3.5 py-3 text-[13px] text-neutral-600">
        <Globe className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
        <p>
          These appear on your website's <span className="font-semibold text-[#0A0A0A]">Services</span> section and
          your AI offers them to guests. Leave a price empty and guests are told to ask.
          {property?.name && (
            <span className="text-neutral-400"> · Editing {property.name}</span>
          )}
        </p>
      </div>

      {rows.length === 0 ? (
        <div className={`${panel} px-6 py-10 text-center`}>
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#FF5A1F] text-[#0A0A0A] shadow-[0_3px_0_0_#0A0A0A]">
            <Sparkles className="h-6 w-6" strokeWidth={1.9} />
          </span>
          <p className="mt-4 text-[17px] font-semibold text-[#0A0A0A]">No services yet</p>
          <p className="mx-auto mt-1 max-w-sm text-[14px] text-neutral-500">
            Massage, airport pickup, tours… add what you offer and guests can ask your AI to book it.
          </p>
          <button onClick={() => setPicker(true)} className={`${btnPrimary} mt-5`}>
            <Plus className="h-4 w-4" />
            Add a service
          </button>
        </div>
      ) : (
        <div className={`${panel} divide-y divide-neutral-100`}>
          <AnimatePresence initial={false}>
            {rows.map((r, i) => (
              <motion.div
                key={r._k}
                layout="position"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative focus-within:z-10"
              >
                <ServiceRow
                  row={r}
                  currency={currency}
                  first={i === 0}
                  last={i === rows.length - 1}
                  nameError={showErrors && !r.name.trim()}
                  onChange={(patch) => update(r._k, patch)}
                  onRemove={() => remove(r._k)}
                  onUp={() => move(i, -1)}
                  onDown={() => move(i, 1)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add a service: presets + custom */}
      <AnimatePresence initial={false}>
        {picker ? (
          <motion.div
            key="picker"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className={`${panel} mt-4 p-4 sm:p-5`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-[15px] font-semibold text-[#0A0A0A]">Add a service</p>
              <button onClick={() => setPicker(false)} aria-label="Close" className={`${iconBtn} -mr-2`}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[13px] text-neutral-500">Tap to add. You can edit names and prices afterwards.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {freePresets.map((p) => {
                const Icon = iconOf(p.icon);
                return (
                  <button
                    key={p.key}
                    onClick={() => add(p)}
                    className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-neutral-200 bg-white pl-2 pr-3.5 text-[14px] font-medium text-neutral-700 transition-colors hover:border-[#FF5A1F] hover:text-[#0A0A0A] active:scale-[0.97]"
                  >
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-neutral-100 text-neutral-600">
                      <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                    </span>
                    {p.name}
                    <Plus className="h-3.5 w-3.5 text-neutral-400" />
                  </button>
                );
              })}
              <button
                onClick={() => add(null)}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-full bg-[#0A0A0A] pl-2 pr-3.5 text-[14px] font-semibold text-white transition-colors hover:bg-neutral-800 active:scale-[0.97]"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-[#FF5A1F]">
                  <PenLine className="h-3.5 w-3.5" strokeWidth={2} />
                </span>
                Custom service
              </button>
            </div>
          </motion.div>
        ) : (
          rows.length > 0 && (
            <motion.div key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
              <button onClick={() => setPicker(true)} className={btnSecondary}>
                <Plus className="h-4 w-4 text-[#FF5A1F]" />
                Add service
              </button>
            </motion.div>
          )
        )}
      </AnimatePresence>

      <SaveBar
        dirty={dirty}
        saving={saving}
        onSave={save}
        onDiscard={discard}
        label="Save services"
      />
    </div>
  );
}

function ServiceRow({ row, currency, first, last, nameError, onChange, onRemove, onUp, onDown }) {
  const [iconsOpen, setIconsOpen] = useState(false);
  const iconWrap = useRef(null);
  const Icon = iconOf(row.icon);

  useEffect(() => {
    if (!iconsOpen) return undefined;
    const close = (e) => {
      if (e.type === "keydown" ? e.key === "Escape" : !iconWrap.current?.contains(e.target)) setIconsOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [iconsOpen]);

  return (
    <div className={`px-3 py-3.5 sm:px-4 ${row.enabled ? "" : "bg-neutral-50/60"}`}>
      <div className="flex flex-wrap items-start gap-2 sm:flex-nowrap sm:gap-3">
        {/* Icon (tap to change) */}
        <div ref={iconWrap} className="relative pt-0.5">
          <button
            type="button"
            onClick={() => setIconsOpen((v) => !v)}
            aria-label="Change icon"
            aria-expanded={iconsOpen}
            className={`grid h-11 w-11 place-items-center rounded-xl transition-colors ${
              row.enabled ? "bg-[#0A0A0A] text-[#FF5A1F] hover:bg-neutral-800" : "bg-neutral-200 text-neutral-500"
            }`}
          >
            <Icon className="h-5 w-5" strokeWidth={1.9} />
          </button>
          <AnimatePresence>
            {iconsOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 top-12 z-30 grid w-[212px] grid-cols-5 gap-1 rounded-2xl border border-neutral-200 bg-white p-2 shadow-[0_18px_40px_-16px_rgba(10,10,10,0.35)]"
              >
                {Object.entries(ICONS).map(([name, I]) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      onChange({ icon: name });
                      setIconsOpen(false);
                    }}
                    aria-label={name}
                    className={`grid h-9 w-9 place-items-center rounded-lg transition-colors ${
                      row.icon === name ? "bg-[#FF5A1F] text-[#0A0A0A]" : "text-neutral-600 hover:bg-neutral-100"
                    }`}
                  >
                    <I className="h-4 w-4" strokeWidth={2} />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Fields */}
        <div className={`min-w-0 flex-1 ${row.enabled ? "" : "opacity-60"}`}>
          <input
            id={`svc-name-${row._k}`}
            value={row.name}
            onChange={(e) => onChange({ name: e.target.value })}
            maxLength={80}
            placeholder="Service name"
            aria-label="Service name"
            aria-invalid={nameError}
            className={`${quiet} text-[15px] font-semibold ${nameError ? "!border-rose-400" : ""}`}
          />
          <input
            value={row.description}
            onChange={(e) => onChange({ description: e.target.value })}
            maxLength={400}
            placeholder="A short line for guests (optional)"
            aria-label={`${row.name || "Service"} description`}
            className={`${quiet} text-[14px] text-neutral-600`}
          />
          <div className="mt-1 flex flex-wrap items-center gap-1 px-0.5">
            <div className="flex items-center rounded-lg border border-neutral-200 bg-white pl-2.5 focus-within:border-[#FF5A1F] focus-within:ring-4 focus-within:ring-[#FF5A1F]/15">
              <span className="text-[12px] font-semibold text-neutral-400">{currency}</span>
              <input
                inputMode="decimal"
                value={row.price}
                onChange={(e) => onChange({ price: e.target.value.replace(/[^0-9.]/g, "") })}
                placeholder="Ask us"
                aria-label={`${row.name || "Service"} price`}
                className="w-[84px] bg-transparent px-2 py-1.5 text-[14px] tabular-nums text-[#0A0A0A] placeholder:text-neutral-400 focus:outline-none"
              />
            </div>
            <input
              value={row.priceUnit}
              onChange={(e) => onChange({ priceUnit: e.target.value })}
              maxLength={40}
              placeholder="per person, per hour…"
              aria-label={`${row.name || "Service"} price unit`}
              className="min-w-0 w-[170px] rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-[14px] text-[#0A0A0A] placeholder:text-neutral-400 focus:border-[#FF5A1F] focus:outline-none focus:ring-4 focus:ring-[#FF5A1F]/15"
            />
          </div>
          {nameError && <p className="mt-1 px-2 text-[12px] text-rose-600">Give this service a name.</p>}
        </div>

        {/* Controls */}
        <div className="flex w-full shrink-0 items-center justify-between gap-1 pl-[52px] sm:w-auto sm:justify-end sm:pl-0 sm:pt-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-neutral-400">{row.enabled ? "On" : "Off"}</span>
            <Switch
              checked={row.enabled}
              onChange={(v) => onChange({ enabled: v })}
              label={`${row.name || "Service"} ${row.enabled ? "on" : "off"}`}
            />
          </div>
          <div className="flex items-center sm:ml-1">
            <button type="button" onClick={onUp} disabled={first} aria-label="Move up" className={`${iconBtn} h-9 w-9 disabled:opacity-30 disabled:hover:bg-transparent`}>
              <ChevronUp className="h-4 w-4" />
            </button>
            <button type="button" onClick={onDown} disabled={last} aria-label="Move down" className={`${iconBtn} h-9 w-9 disabled:opacity-30 disabled:hover:bg-transparent`}>
              <ChevronDown className="h-4 w-4" />
            </button>
            <button type="button" onClick={onRemove} aria-label={`Delete ${row.name || "service"}`} className={`${iconBtnDanger} h-9 w-9`}>
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
