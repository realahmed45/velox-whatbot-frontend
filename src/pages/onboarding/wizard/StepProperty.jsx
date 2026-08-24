/**
 * The manual property form — the "enter details myself" pane of step 1.
 * The only mandatory content in the whole wizard.
 *
 * Modelled on Booking.com's "List your property" and Airbnb's "Become a host":
 * one question per section, generous spacing, big friendly targets, and
 * everything non-essential folded behind a single "Add more details" toggle.
 * A hotelier on a phone can finish this with a name and a tap.
 *
 * Creates the property via POST /hotel/properties. The workspace is already
 * ensured by the fork screen (StepSetup), which also owns the consultant
 * referral field — the ensure below is a defensive no-op when one exists.
 *
 * Two calls, not one: POST /hotel/properties doesn't accept `amenities` or
 * `starRating` (see hotelController.createProperty's explicit field list), so
 * when either is set we follow up with PUT /hotel/properties/:id, which does.
 * Photos go through POST /upload/image and ride along on the create.
 */
import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Check,
  ChevronDown,
  Clock,
  Hotel,
  Loader2,
  MapPin,
  Home,
  Building,
  Palmtree,
  BedDouble,
  Star,
} from "lucide-react";
import toast from "react-hot-toast";
import { clsx } from "clsx";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import PhotoUploader from "@/components/PhotoUploader";
import WizardShell from "./WizardShell";

/**
 * Visual type cards, the way both ideals do it — an icon and a plain-English
 * line beats a <select> the hotelier has to interpret. Keys match the
 * Property model's propertyType enum exactly.
 */
const PROPERTY_TYPES = [
  { key: "hotel", label: "Hotel", icon: Hotel, blurb: "Rooms, a front desk" },
  {
    key: "guesthouse",
    label: "Guesthouse",
    icon: Home,
    blurb: "Small, homely, hosted",
  },
  { key: "villa", label: "Villa", icon: Palmtree, blurb: "Private, whole place" },
  { key: "hostel", label: "Hostel", icon: BedDouble, blurb: "Dorms and privates" },
  { key: "resort", label: "Resort", icon: Building2, blurb: "Grounds, pool, F&B" },
  {
    key: "apartment",
    label: "Apartment",
    icon: Building,
    blurb: "Self-contained units",
  },
];

const CURRENCIES = [
  "IDR",
  "USD",
  "EUR",
  "GBP",
  "AUD",
  "SGD",
  "MYR",
  "THB",
  "PHP",
  "VND",
  "INR",
  "JPY",
  "AED",
];

const TIMEZONES = [
  "Asia/Makassar",
  "Asia/Jakarta",
  "Asia/Jayapura",
  "Asia/Singapore",
  "Asia/Kuala_Lumpur",
  "Asia/Bangkok",
  "Asia/Manila",
  "Asia/Ho_Chi_Minh",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Australia/Sydney",
  "Europe/London",
  "Europe/Amsterdam",
  "America/New_York",
  "America/Los_Angeles",
  "UTC",
];

/** Free-text on the model, so these are just fast-path chips. */
const AMENITIES = [
  "Wi-Fi",
  "Pool",
  "Breakfast",
  "Parking",
  "Air conditioning",
  "Restaurant",
  "Spa",
  "Gym",
  "Airport shuttle",
  "Laundry",
  "24h reception",
];

/* ── Layout primitives ───────────────────────────────────────────────────── */

/**
 * One question per block: a numbered heading, an optional helper line, then
 * the control. The white card + generous padding is the wizard's existing
 * treatment; the numbering is what makes it read as a guided flow.
 */
function Section({ step, title, hint, children, optional }) {
  return (
    <section className="bg-white rounded-2xl border border-ink-100 shadow-lg p-5 sm:p-7">
      <div className="flex items-start gap-3 mb-4">
        {step != null && (
          <span className="w-7 h-7 rounded-full bg-brand-50 text-brand-600 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
            {step}
          </span>
        )}
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-black text-ink-900 leading-tight">
            {title}
            {optional && (
              <span className="ml-2 text-xs font-semibold text-ink-400 align-middle">
                Optional
              </span>
            )}
          </h2>
          {hint && <p className="text-sm text-ink-500 mt-1">{hint}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

/** Inline, gentle validation — never an alert, never red until they've tried. */
function FieldError({ children }) {
  if (!children) return null;
  return <p className="text-xs font-semibold text-rose-600 mt-1.5">{children}</p>;
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

export default function StepProperty({ state, patch, goNext, shell = {} }) {
  const { activeWorkspace, setActiveWorkspace, user } = useAuthStore();
  const { fetchWorkspace } = useWorkspaceStore();

  const [ensuring, setEnsuring] = useState(!activeWorkspace);
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const [form, setForm] = useState({
    name: state.propertyName || "",
    propertyType: "hotel",
    address: "",
    city: "",
    country: "",
    currency: state.currency || "IDR",
    timezone: "Asia/Makassar",
    checkInTime: "14:00",
    checkOutTime: "11:00",
    description: "",
    starRating: 0,
    phone: "",
    email: "",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const [amenities, setAmenities] = useState([]);
  const [photos, setPhotos] = useState([]);

  const toggleAmenity = (a) =>
    setAmenities((list) =>
      list.includes(a) ? list.filter((x) => x !== a) : [...list, a],
    );

  const nameError = useMemo(
    () => (touched && !form.name.trim() ? "Your property needs a name." : ""),
    [touched, form.name],
  );

  // A workspace is created deliberately here (not at signup).
  useEffect(() => {
    let alive = true;
    if (activeWorkspace) {
      setEnsuring(false);
      return undefined;
    }
    (async () => {
      try {
        const { data } = await api.post("/workspaces/ensure", {
          name: user?.name ? `${user.name}'s Hotel` : undefined,
        });
        if (!alive) return;
        setActiveWorkspace(data.workspace._id);
        fetchWorkspace(data.workspace._id);
      } catch (e) {
        if (alive)
          toast.error(
            e?.response?.data?.message || "Couldn't set up your workspace",
          );
      } finally {
        if (alive) setEnsuring(false);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWorkspace]);


  const submit = async () => {
    const name = form.name.trim();
    setTouched(true);
    if (!name) {
      // Inline error carries the message; nudge focus rather than alerting.
      document.getElementById("propName")?.focus();
      return;
    }
    if (saving) return;
    setSaving(true);
    try {
      /**
       * Backing up from the rooms pane and continuing again must not create a
       * SECOND property. When one already exists in wizard state we edit it
       * instead — updateProperty accepts the same fields plus amenities and
       * starRating, so the follow-up call below becomes a no-op.
       */
      const existingId = state.propertyId;
      const { data } = await (existingId
        ? api.put(`/hotel/properties/${existingId}`, {
            name,
            propertyType: form.propertyType,
            description: form.description.trim(),
            address: form.address.trim(),
            city: form.city.trim(),
            country: form.country.trim(),
            currency: form.currency,
            timezone: form.timezone,
            checkInTime: form.checkInTime,
            checkOutTime: form.checkOutTime,
            phone: form.phone.trim(),
            email: form.email.trim(),
            ...(photos.length ? { photos } : {}),
            ...(amenities.length ? { amenities } : {}),
            ...(form.starRating > 0 ? { starRating: form.starRating } : {}),
          })
        : api.post("/hotel/properties", {
            name,
            propertyType: form.propertyType,
            description: form.description.trim(),
            address: form.address.trim(),
            city: form.city.trim(),
            country: form.country.trim(),
            currency: form.currency,
            timezone: form.timezone,
            checkInTime: form.checkInTime,
            checkOutTime: form.checkOutTime,
            phone: form.phone.trim(),
            email: form.email.trim(),
            photos,
          }));

      let property = data?.property || {};

      /**
       * `amenities` and `starRating` aren't in createProperty's accepted field
       * list, only in updateProperty's. Follow up when there's something to
       * save — best-effort, since neither is worth failing setup over.
       */
      if (
        !existingId &&
        property._id &&
        (amenities.length || form.starRating > 0)
      ) {
        try {
          const { data: updated } = await api.put(
            `/hotel/properties/${property._id}`,
            {
              ...(amenities.length ? { amenities } : {}),
              ...(form.starRating > 0 ? { starRating: form.starRating } : {}),
            },
          );
          if (updated?.property) property = updated.property;
        } catch {
          /* the property exists — these are editable in Settings later */
        }
      }

      patch({
        propertyId: property._id || null,
        propertyName: property.name || name,
        currency: property.currency || form.currency,
        bookingSlug: property.directBooking?.slug || null,
      });
      if (activeWorkspace) {
        await fetchWorkspace(activeWorkspace, { force: true });
      }
      toast.success(existingId ? "Property updated" : "Property created");
      goNext();
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Couldn't save your property — try again",
      );
      setSaving(false);
    }
  };

  if (ensuring) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-7 h-7 text-brand-500 animate-spin" />
      </div>
    );
  }

  return (
    <WizardShell
      step={0}
      icon={Hotel}
      eyebrow="Step 1 of 3"
      title="Tell us about your property"
      subtitle="Just the basics for now — a name is genuinely enough to continue. Everything here stays editable."
      onNext={submit}
      nextLabel="Continue"
      busy={saving}
      wide
      {...shell}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="space-y-4"
      >
        {/* 1 — Name. The single required answer, alone on its own card. */}
        <Section
          step={1}
          title="What's your property called?"
          hint="The name guests will see on your booking page and in every message."
        >
          <input
            id="propName"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="Sunset Beach Resort"
            className={clsx(
              "input text-base sm:text-lg py-3.5",
              nameError && "border-rose-300 focus:border-rose-400",
            )}
            autoFocus
            autoComplete="organization"
          />
          <FieldError>{nameError}</FieldError>
        </Section>

        {/* 2 — Type, as visual cards. */}
        <Section
          step={2}
          title="Which of these describes it best?"
          hint="This shapes how the AI talks about your place to guests."
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {PROPERTY_TYPES.map((t) => {
              const active = form.propertyType === t.key;
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => set("propertyType", t.key)}
                  aria-pressed={active}
                  className={clsx(
                    "group text-left rounded-2xl border-2 p-3.5 sm:p-4 transition",
                    active
                      ? "border-brand-500 bg-brand-50/70 shadow-ring"
                      : "border-ink-200 bg-white hover:border-ink-300 hover:bg-ink-50",
                  )}
                >
                  <span
                    className={clsx(
                      "w-9 h-9 rounded-xl flex items-center justify-center transition",
                      active
                        ? "bg-brand-500 text-white"
                        : "bg-ink-100 text-ink-500 group-hover:bg-ink-200",
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </span>
                  <p
                    className={clsx(
                      "font-bold text-sm mt-2.5",
                      active ? "text-brand-700" : "text-ink-900",
                    )}
                  >
                    {t.label}
                  </p>
                  <p className="text-xs text-ink-500 mt-0.5 leading-snug">
                    {t.blurb}
                  </p>
                </button>
              );
            })}
          </div>
        </Section>

        {/* 3 — Where. */}
        <Section
          step={3}
          title="Where is it?"
          hint="Used on your booking page and to answer 'how do I get there?'"
        >
          <div className="space-y-4">
            <div>
              <label className="label" htmlFor="propAddress">
                Street address{" "}
                <span className="font-normal text-ink-400">(optional)</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
                <input
                  id="propAddress"
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                  placeholder="Jl. Pantai Batu Bolong 58"
                  className="input pl-9"
                  autoComplete="street-address"
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="propCity">
                  City
                </label>
                <input
                  id="propCity"
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  placeholder="Canggu"
                  className="input"
                  autoComplete="address-level2"
                />
              </div>
              <div>
                <label className="label" htmlFor="propCountry">
                  Country
                </label>
                <input
                  id="propCountry"
                  value={form.country}
                  onChange={(e) => set("country", e.target.value)}
                  placeholder="Indonesia"
                  className="input"
                  autoComplete="country-name"
                />
              </div>
            </div>
          </div>
        </Section>

        {/* 4 — Money & time, grouped because they're all "how you operate". */}
        <Section
          step={4}
          title="Currency, timezone and your hours"
          hint="Sensible defaults are already filled in — change them only if they're wrong."
        >
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="propCurrency">
                  Currency
                </label>
                <select
                  id="propCurrency"
                  value={form.currency}
                  onChange={(e) => set("currency", e.target.value)}
                  className="input"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-ink-400 mt-1">
                  What your rates are quoted in.
                </p>
              </div>
              <div>
                <label className="label" htmlFor="propTz">
                  Timezone
                </label>
                <select
                  id="propTz"
                  value={form.timezone}
                  onChange={(e) => set("timezone", e.target.value)}
                  className="input"
                >
                  {TIMEZONES.map((t) => (
                    <option key={t} value={t}>
                      {t.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-ink-400 mt-1">
                  The AI's sense of "today".
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="propCheckIn">
                  Check-in from
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
                  <input
                    id="propCheckIn"
                    type="time"
                    value={form.checkInTime}
                    onChange={(e) => set("checkInTime", e.target.value)}
                    className="input pl-9"
                  />
                </div>
              </div>
              <div>
                <label className="label" htmlFor="propCheckOut">
                  Check-out by
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
                  <input
                    id="propCheckOut"
                    type="time"
                    value={form.checkOutTime}
                    onChange={(e) => set("checkOutTime", e.target.value)}
                    className="input pl-9"
                  />
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* 5 — Photos. Optional and loudly so. */}
        <Section
          step={5}
          title="Show your property"
          hint="Listings with photos get booked more — but you can add them any time."
          optional
        >
          <PhotoUploader
            photos={photos}
            onChange={setPhotos}
            label="Property photos"
            hint="No photos yet? Skip it — you can upload them from Settings whenever you're ready."
          />
        </Section>

        {/* Progressive disclosure: everything else lives behind one toggle. */}
        <div className="bg-white rounded-2xl border border-ink-100 shadow-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setShowMore((v) => !v)}
            aria-expanded={showMore}
            className="w-full flex items-center justify-between gap-3 p-5 sm:px-7 text-left hover:bg-ink-50/60 transition"
          >
            <span className="min-w-0">
              <span className="block font-black text-ink-900">
                Add more details
              </span>
              <span className="block text-sm text-ink-500 mt-0.5">
                Description, star rating, amenities and contact details — all
                optional.
              </span>
            </span>
            <ChevronDown
              className={clsx(
                "w-5 h-5 text-ink-400 shrink-0 transition-transform",
                showMore && "rotate-180",
              )}
            />
          </button>

          {showMore && (
            <div className="px-5 sm:px-7 pb-6 pt-1 space-y-5 border-t border-ink-100">
              <div>
                <label className="label" htmlFor="propDesc">
                  Describe your property
                </label>
                <textarea
                  id="propDesc"
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={4}
                  placeholder="A quiet 12-room boutique stay two minutes from the beach, with a pool, an open-air restaurant and staff who know every warung worth walking to."
                  className="input resize-y"
                />
                <p className="text-xs text-ink-400 mt-1">
                  The AI reads this when guests ask what your place is like.
                </p>
              </div>

              <div>
                <span className="label">Star rating</span>
                <div className="flex flex-wrap items-center gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() =>
                        set("starRating", form.starRating === n ? 0 : n)
                      }
                      aria-pressed={form.starRating === n}
                      aria-label={`${n} star${n === 1 ? "" : "s"}`}
                      className={clsx(
                        "w-11 h-11 rounded-xl border flex items-center justify-center transition",
                        form.starRating >= n
                          ? "border-amber-300 bg-amber-50 text-amber-500"
                          : "border-ink-200 bg-white text-ink-300 hover:border-ink-300",
                      )}
                    >
                      <Star
                        className="w-5 h-5"
                        fill={form.starRating >= n ? "currentColor" : "none"}
                      />
                    </button>
                  ))}
                  {form.starRating > 0 && (
                    <button
                      type="button"
                      onClick={() => set("starRating", 0)}
                      className="text-xs font-semibold text-ink-400 hover:text-ink-600 underline underline-offset-2 ml-1"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div>
                <span className="label">What do you offer?</span>
                <div className="flex flex-wrap gap-2">
                  {AMENITIES.map((a) => (
                    <Chip
                      key={a}
                      active={amenities.includes(a)}
                      onClick={() => toggleAmenity(a)}
                    >
                      {a}
                    </Chip>
                  ))}
                </div>
                <p className="text-xs text-ink-400 mt-2">
                  The AI uses these to answer "do you have parking?" without
                  waking you up.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label" htmlFor="propPhone">
                    Phone
                  </label>
                  <input
                    id="propPhone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="+62 812 3456 7890"
                    className="input"
                    autoComplete="tel"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="propEmail">
                    Email
                  </label>
                  <input
                    id="propEmail"
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="stay@sunsetbeach.com"
                    className="input"
                    autoComplete="email"
                  />
                </div>
              </div>
              <p className="text-xs text-ink-400 -mt-1">
                Shown to guests on booking confirmations.
              </p>

            </div>
          )}
        </div>

        {/* Enter-to-submit without showing a second button. */}
        <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
      </form>
    </WizardShell>
  );
}
