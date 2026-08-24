/**
 * Rooms, room type by room type — the final pane of step 1, reached from
 * both forks (manual entry and OTA import, since an import may still need a
 * rate set).
 *
 * Booking.com's room setup is the model: you don't fill a table, you add ONE
 * room, see it appear as a card, and decide whether to add another. The editor
 * is a focused panel with big touch targets — steppers instead of number
 * inputs, chips instead of dropdowns — because hoteliers do this on a phone.
 *
 * Saved with POST /hotel/properties/:id/rooms (createRoomType accepts name,
 * description, unitsCount, maxAdults, maxChildren, maxOccupancy, bedConfig,
 * baseRate, currency, amenities, photos) and edited with
 * PUT /hotel/rooms/:roomId (same fields plus sizeSqm and active).
 *
 * `sizeSqm` is update-only on the backend, so a new room with a size set is
 * created and then patched — same two-call shape as StepProperty's amenities.
 *
 * Skippable, but visibly not recommended: without a rate the AI can't quote.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BedDouble,
  Check,
  ImageIcon,
  Loader2,
  Minus,
  Pencil,
  Plus,
  Ruler,
  Trash2,
  Users,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { clsx } from "clsx";
import api from "@/services/api";
import PhotoUploader from "@/components/PhotoUploader";
import WizardShell from "./WizardShell";

/** Fast-path names — tapping one fills the name field, they can still edit it. */
const ROOM_PRESETS = [
  "Single",
  "Double",
  "Twin",
  "Triple",
  "Family",
  "Suite",
  "Dorm",
];

/** bedConfig is a free-text string on RoomType — these are the common ones. */
const BED_CONFIGS = [
  "1 king bed",
  "1 queen bed",
  "1 double bed",
  "2 twin beds",
  "1 single bed",
  "1 bunk bed",
  "1 sofa bed",
];

const ROOM_AMENITIES = [
  "Air conditioning",
  "Private bathroom",
  "Balcony",
  "Sea view",
  "Kitchenette",
  "TV",
  "Safe",
  "Minibar",
  "Desk",
  "Bathtub",
];

const CURRENCIES = ["IDR", "USD", "EUR", "GBP", "AUD", "SGD", "MYR", "THB"];

const blankDraft = (currency) => ({
  name: "",
  unitsCount: 1,
  maxAdults: 2,
  maxChildren: 0,
  bedConfig: "",
  sizeSqm: "",
  baseRate: "",
  currency: currency || "USD",
  amenities: [],
  photos: [],
});

/** Hydrate the editor from an existing room. */
const draftFrom = (room, currency) => ({
  name: room.name || "",
  unitsCount: room.unitsCount || 1,
  maxAdults: room.maxAdults ?? 2,
  maxChildren: room.maxChildren ?? 0,
  bedConfig: room.bedConfig || "",
  sizeSqm: room.sizeSqm ? String(room.sizeSqm) : "",
  baseRate: room.baseRate ? String(room.baseRate) : "",
  currency: room.currency || currency || "USD",
  amenities: Array.isArray(room.amenities) ? room.amenities : [],
  photos: Array.isArray(room.photos) ? room.photos : [],
});

/* ── Primitives ──────────────────────────────────────────────────────────── */

/**
 * A +/- stepper. Beats a number input on a phone: no keyboard, no zoom, and
 * the value is always legal.
 */
function Stepper({ label, hint, value, onChange, min = 0, max = 99, icon: Icon }) {
  const n = Number(value) || 0;
  return (
    <div>
      <span className="label">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, n - 1))}
          disabled={n <= min}
          className="w-11 h-11 rounded-xl border border-ink-200 bg-white text-ink-600 flex items-center justify-center hover:border-ink-300 hover:bg-ink-50 transition disabled:opacity-40 disabled:hover:bg-white shrink-0"
          aria-label={`Decrease ${label}`}
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="flex-1 text-center font-black text-lg text-ink-900 tabular-nums inline-flex items-center justify-center gap-1.5">
          {Icon && <Icon className="w-4 h-4 text-ink-400" />}
          {n}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, n + 1))}
          disabled={n >= max}
          className="w-11 h-11 rounded-xl border border-ink-200 bg-white text-ink-600 flex items-center justify-center hover:border-ink-300 hover:bg-ink-50 transition disabled:opacity-40 disabled:hover:bg-white shrink-0"
          aria-label={`Increase ${label}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {hint && <p className="text-xs text-ink-400 mt-1.5">{hint}</p>}
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition",
        active
          ? "border-brand-500 bg-brand-50 text-brand-700 shadow-ring"
          : "border-ink-200 bg-white text-ink-600 hover:border-ink-300 hover:bg-ink-50",
      )}
    >
      {active && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
      {children}
    </button>
  );
}

function Block({ title, hint, children }) {
  return (
    <div>
      <p className="font-bold text-ink-900 text-sm">{title}</p>
      {hint && <p className="text-xs text-ink-500 mt-0.5 mb-2.5">{hint}</p>}
      <div className={hint ? "" : "mt-2.5"}>{children}</div>
    </div>
  );
}

/* ── Saved room card ─────────────────────────────────────────────────────── */

function RoomCard({ room, currency, onEdit, onRemove, removing }) {
  const cover = room.photos?.[0]?.url;
  const guests = (room.maxAdults ?? 2) + (room.maxChildren ?? 0);
  return (
    <li className="flex items-stretch gap-0 rounded-2xl border border-ink-100 bg-white shadow-card overflow-hidden">
      <div className="w-20 sm:w-28 shrink-0 bg-ink-100 flex items-center justify-center">
        {cover ? (
          <img
            src={cover}
            alt={room.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <ImageIcon className="w-5 h-5 text-ink-300" />
        )}
      </div>

      <div className="flex-1 min-w-0 p-3.5 sm:p-4">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-bold text-ink-900 truncate">{room.name}</p>
            <p className="text-xs text-ink-500 mt-0.5">
              {room.unitsCount || 1} room
              {(room.unitsCount || 1) === 1 ? "" : "s"} · sleeps {guests}
              {room.bedConfig ? ` · ${room.bedConfig}` : ""}
              {room.sizeSqm ? ` · ${room.sizeSqm} m²` : ""}
            </p>
            <p className="text-sm font-black text-ink-900 mt-1.5">
              {room.currency || currency}{" "}
              {Number(room.baseRate || 0).toLocaleString()}
              <span className="text-xs font-semibold text-ink-400"> / night</span>
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onEdit(room)}
              className="text-ink-400 hover:text-brand-600 transition p-2 rounded-lg hover:bg-brand-50"
              aria-label={`Edit ${room.name}`}
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onRemove(room)}
              disabled={removing}
              className="text-ink-400 hover:text-rose-600 transition p-2 rounded-lg hover:bg-rose-50 disabled:opacity-50"
              aria-label={`Remove ${room.name}`}
            >
              {removing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

/* ── Step ────────────────────────────────────────────────────────────────── */

export default function StepRooms({ state, patch, goNext, goBack, shell = {} }) {
  const propertyId = state.propertyId;
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [touched, setTouched] = useState(false);

  // null = no editor open; { room } = editing; {} = adding.
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState(() => blankDraft(state.currency));
  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));

  const load = useCallback(async () => {
    if (!propertyId) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get(`/hotel/properties/${propertyId}/rooms`);
      const list = (data.roomTypes || data.rooms || []).filter(
        (r) => r.active !== false,
      );
      setRooms(list);
      patch({ roomsAdded: list.length });
      // Straight into the editor when there's nothing yet — one less tap.
      if (list.length === 0) {
        setEditing({});
        setDraft(blankDraft(state.currency));
      }
    } catch {
      toast.error("Couldn't load your rooms");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setTouched(false);
    setDraft(blankDraft(draft.currency || state.currency));
    setEditing({});
  };

  const openEdit = (room) => {
    setTouched(false);
    setDraft(draftFrom(room, state.currency));
    setEditing({ room });
  };

  const closeEditor = () => {
    setEditing(null);
    setTouched(false);
  };

  const toggleAmenity = (a) =>
    setDraft((d) => ({
      ...d,
      amenities: d.amenities.includes(a)
        ? d.amenities.filter((x) => x !== a)
        : [...d.amenities, a],
    }));

  const errors = useMemo(() => {
    const e = {};
    if (!draft.name.trim()) e.name = "Give this room type a name.";
    if (!Number(draft.baseRate) || Number(draft.baseRate) <= 0)
      e.baseRate = "Set a nightly rate so the AI has something to quote.";
    return e;
  }, [draft.name, draft.baseRate]);

  const saveRoom = async () => {
    setTouched(true);
    if (Object.keys(errors).length) return;
    if (!propertyId) {
      toast.error("Your property is still saving — one moment");
      return;
    }
    if (saving) return;

    const maxAdults = Number(draft.maxAdults) || 1;
    const maxChildren = Number(draft.maxChildren) || 0;
    const payload = {
      name: draft.name.trim(),
      unitsCount: Math.max(1, Number(draft.unitsCount) || 1),
      maxAdults,
      maxChildren,
      maxOccupancy: maxAdults + maxChildren,
      bedConfig: draft.bedConfig || "",
      baseRate: Number(draft.baseRate),
      currency: draft.currency || state.currency || "USD",
      amenities: draft.amenities,
      photos: draft.photos,
    };
    const size = Number(draft.sizeSqm);
    const sizeSqm = size > 0 ? size : null;

    setSaving(true);
    try {
      let saved;
      if (editing?.room?._id) {
        // Update takes sizeSqm directly.
        const { data } = await api.put(`/hotel/rooms/${editing.room._id}`, {
          ...payload,
          ...(sizeSqm ? { sizeSqm } : {}),
        });
        saved = data?.roomType || { ...editing.room, ...payload };
        setRooms((cur) =>
          cur.map((r) => (r._id === editing.room._id ? saved : r)),
        );
        toast.success(`${saved.name} updated`);
      } else {
        const { data } = await api.post(
          `/hotel/properties/${propertyId}/rooms`,
          payload,
        );
        saved = data?.roomType || data?.room;
        // createRoomType ignores sizeSqm — patch it in when they set one.
        if (saved?._id && sizeSqm) {
          try {
            const { data: up } = await api.put(`/hotel/rooms/${saved._id}`, {
              sizeSqm,
            });
            if (up?.roomType) saved = up.roomType;
          } catch {
            /* the room exists; size is editable in Settings */
          }
        }
        const next = [...rooms, saved];
        setRooms(next);
        patch({ roomsAdded: next.length });
        toast.success(`${payload.name} added`);
      }
      closeEditor();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Couldn't save that room");
    } finally {
      setSaving(false);
    }
  };

  const removeRoom = async (room) => {
    setDeleting(room._id);
    try {
      await api.put(`/hotel/rooms/${room._id}`, { active: false });
      const next = rooms.filter((x) => x._id !== room._id);
      setRooms(next);
      patch({ roomsAdded: next.length });
      toast.success(`${room.name} removed`);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Couldn't remove that room");
    } finally {
      setDeleting(null);
    }
  };

  const skip = () => {
    patch({ roomsAdded: rooms.length });
    goNext();
  };

  const isEditing = !!editing?.room;

  return (
    <WizardShell
      step={0}
      icon={BedDouble}
      eyebrow="Step 1 of 3"
      title="Now, what do you rent out?"
      subtitle="Add one room type at a time — a category, not every physical room. Ten identical doubles are one room type with ten of them."
      onBack={goBack}
      onSkip={rooms.length === 0 && !editing ? skip : undefined}
      skipLabel="I'll add rooms later"
      onNext={editing ? undefined : goNext}
      nextLabel={rooms.length ? "Continue" : "Continue without rooms"}
      wide
      {...shell}
    >
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-7 h-7 text-brand-500 animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Saved rooms, as cards. */}
          {rooms.length > 0 && (
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-ink-400 mb-2.5">
                {rooms.length} room type{rooms.length === 1 ? "" : "s"} added
              </p>
              <ul className="space-y-2.5">
                {rooms.map((r) => (
                  <RoomCard
                    key={r._id}
                    room={r}
                    currency={state.currency}
                    onEdit={openEdit}
                    onRemove={removeRoom}
                    removing={deleting === r._id}
                  />
                ))}
              </ul>
            </div>
          )}

          {/* The editor — one room, full attention. */}
          {editing ? (
            <div className="rounded-2xl border-2 border-brand-200 bg-white shadow-lg overflow-hidden">
              <div className="flex items-center justify-between gap-3 px-5 sm:px-7 py-4 border-b border-ink-100 bg-brand-50/50">
                <p className="font-black text-ink-900">
                  {isEditing
                    ? `Edit ${editing.room.name}`
                    : rooms.length
                      ? "Add another room type"
                      : "Your first room type"}
                </p>
                {(rooms.length > 0 || isEditing) && (
                  <button
                    type="button"
                    onClick={closeEditor}
                    className="text-ink-400 hover:text-ink-700 transition p-1.5 rounded-lg hover:bg-white"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="p-5 sm:p-7 space-y-6">
                {/* Name + presets */}
                <Block
                  title="What do you call this room?"
                  hint="Tap a starting point, then make it yours."
                >
                  <div className="flex flex-wrap gap-2 mb-3">
                    {ROOM_PRESETS.map((p) => (
                      <Chip
                        key={p}
                        active={draft.name.trim() === p}
                        onClick={() => set("name", p)}
                      >
                        {p}
                      </Chip>
                    ))}
                  </div>
                  <input
                    value={draft.name}
                    onChange={(e) => set("name", e.target.value)}
                    onBlur={() => setTouched(true)}
                    placeholder="Deluxe Double, Sea View"
                    className={clsx(
                      "input text-base py-3.5",
                      touched && errors.name && "border-rose-300",
                    )}
                    aria-label="Room type name"
                  />
                  {touched && errors.name && (
                    <p className="text-xs font-semibold text-rose-600 mt-1.5">
                      {errors.name}
                    </p>
                  )}
                </Block>

                {/* Inventory + occupancy */}
                <Block title="How many, and for how many guests?">
                  <div className="grid sm:grid-cols-3 gap-5">
                    <Stepper
                      label="Rooms of this type"
                      hint="Your bookable inventory."
                      value={draft.unitsCount}
                      onChange={(v) => set("unitsCount", v)}
                      min={1}
                    />
                    <Stepper
                      label="Adults"
                      value={draft.maxAdults}
                      onChange={(v) => set("maxAdults", v)}
                      min={1}
                      max={20}
                      icon={Users}
                    />
                    <Stepper
                      label="Children"
                      value={draft.maxChildren}
                      onChange={(v) => set("maxChildren", v)}
                      min={0}
                      max={20}
                    />
                  </div>
                </Block>

                {/* Beds */}
                <Block
                  title="What's the bed setup?"
                  hint="Guests filter by this on every OTA."
                >
                  <div className="flex flex-wrap gap-2">
                    {BED_CONFIGS.map((b) => (
                      <Chip
                        key={b}
                        active={draft.bedConfig === b}
                        onClick={() =>
                          set("bedConfig", draft.bedConfig === b ? "" : b)
                        }
                      >
                        {b}
                      </Chip>
                    ))}
                  </div>
                </Block>

                {/* Rate — the one that matters most. */}
                <Block
                  title="What does a night cost?"
                  hint="This is what the AI quotes guests and what syncs to your channels. Change it any time."
                >
                  <div className="flex gap-2">
                    <select
                      value={draft.currency}
                      onChange={(e) => set("currency", e.target.value)}
                      className="input w-24 shrink-0 px-2"
                      aria-label="Rate currency"
                    >
                      {[draft.currency, ...CURRENCIES]
                        .filter((c, i, a) => c && a.indexOf(c) === i)
                        .map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                    </select>
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      value={draft.baseRate}
                      onChange={(e) => set("baseRate", e.target.value)}
                      onBlur={() => setTouched(true)}
                      placeholder="850000"
                      className={clsx(
                        "input text-base py-3.5",
                        touched && errors.baseRate && "border-rose-300",
                      )}
                      aria-label="Nightly rate"
                    />
                  </div>
                  {touched && errors.baseRate && (
                    <p className="text-xs font-semibold text-rose-600 mt-1.5">
                      {errors.baseRate}
                    </p>
                  )}
                </Block>

                {/* Size — genuinely optional. */}
                <Block title="Room size" hint="Optional, in square metres.">
                  <div className="relative max-w-[12rem]">
                    <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      value={draft.sizeSqm}
                      onChange={(e) => set("sizeSqm", e.target.value)}
                      placeholder="28"
                      className="input pl-9 pr-10"
                      aria-label="Room size in square metres"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink-400 pointer-events-none">
                      m²
                    </span>
                  </div>
                </Block>

                {/* Amenities */}
                <Block
                  title="What's in the room?"
                  hint="Optional — but it's what guests ask about most."
                >
                  <div className="flex flex-wrap gap-2">
                    {ROOM_AMENITIES.map((a) => (
                      <Chip
                        key={a}
                        active={draft.amenities.includes(a)}
                        onClick={() => toggleAmenity(a)}
                      >
                        {a}
                      </Chip>
                    ))}
                  </div>
                </Block>

                {/* Photos */}
                <PhotoUploader
                  photos={draft.photos}
                  onChange={(next) => set("photos", next)}
                  label="Room photos"
                  max={8}
                  compact
                  hint="Skip if you don't have them handy — you can add them later."
                />

                <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-3 pt-1">
                  {(rooms.length > 0 || isEditing) && (
                    <button
                      type="button"
                      onClick={closeEditor}
                      disabled={saving}
                      className="text-xs font-semibold text-ink-500 hover:text-ink-800 transition sm:flex-1 text-left disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={saveRoom}
                    disabled={saving}
                    className="btn-primary w-full sm:w-auto"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    {isEditing ? "Save changes" : "Add this room"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={openAdd}
              className="w-full rounded-2xl border-2 border-dashed border-ink-200 bg-white hover:border-brand-300 hover:bg-brand-50/40 transition p-6 text-center group"
            >
              <span className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto group-hover:bg-brand-500 group-hover:text-white transition">
                <Plus className="w-5 h-5" />
              </span>
              <span className="block font-black text-ink-900 mt-3">
                Add another room type
              </span>
              <span className="block text-sm text-ink-500 mt-1">
                A different size, view or price? That's a new room type.
              </span>
            </button>
          )}

          {rooms.length === 0 && !editing && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              Without at least one room your calendar stays empty and the AI
              can't quote a price. It only takes a minute.
            </p>
          )}
        </div>
      )}
    </WizardShell>
  );
}
