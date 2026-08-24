/**
 * Step 1 — Your property. The only mandatory step.
 *
 * Creates the workspace (if the owner doesn't have one yet), then the property
 * via POST /hotel/properties. Keeps the consultant-referral validate/attribute
 * logic that used to live in HotelSetupPage.
 */
import { useEffect, useState } from "react";
import { CheckCircle2, Hotel, Loader2, Ticket } from "lucide-react";
import toast from "react-hot-toast";
import { clsx } from "clsx";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import WizardShell from "./WizardShell";

const PROPERTY_TYPES = [
  { key: "hotel", label: "Hotel" },
  { key: "guesthouse", label: "Guesthouse" },
  { key: "villa", label: "Villa" },
  { key: "hostel", label: "Hostel" },
  { key: "resort", label: "Resort" },
  { key: "apartment", label: "Apartment" },
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

export default function StepProperty({ state, patch, goNext }) {
  const { activeWorkspace, setActiveWorkspace, user } = useAuthStore();
  const { fetchWorkspace } = useWorkspaceStore();

  const [ensuring, setEnsuring] = useState(!activeWorkspace);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: state.propertyName || "",
    propertyType: "hotel",
    city: "",
    country: "",
    currency: state.currency || "IDR",
    timezone: "Asia/Makassar",
    checkInTime: "14:00",
    checkOutTime: "11:00",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Optional consultant referral — validated live, credited on save.
  const [refCode, setRefCode] = useState("");
  const [refState, setRefState] = useState(null); // null|checking|valid|invalid
  const [refName, setRefName] = useState("");

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

  useEffect(() => {
    const code = refCode.trim();
    if (!code) {
      setRefState(null);
      setRefName("");
      return undefined;
    }
    setRefState("checking");
    const t = setTimeout(async () => {
      try {
        const { data } = await api.get(
          `/consultants/validate/${encodeURIComponent(code)}`,
        );
        if (data?.valid) {
          setRefState("valid");
          setRefName(data.consultantName || "");
        } else {
          setRefState("invalid");
          setRefName("");
        }
      } catch {
        setRefState("invalid");
        setRefName("");
      }
    }, 450);
    return () => clearTimeout(t);
  }, [refCode]);

  const submit = async () => {
    const name = form.name.trim();
    if (!name) {
      toast.error("What's your property called?");
      return;
    }
    if (saving) return;
    setSaving(true);
    try {
      const { data } = await api.post("/hotel/properties", {
        name,
        propertyType: form.propertyType,
        city: form.city.trim(),
        country: form.country.trim(),
        currency: form.currency,
        timezone: form.timezone,
        checkInTime: form.checkInTime,
        checkOutTime: form.checkOutTime,
      });

      // Best-effort — a referral problem must never block setup.
      if (refCode.trim() && refState === "valid") {
        try {
          await api.post("/consultants/attribute", { code: refCode.trim() });
          toast.success(`Referral credited to ${refName || "your consultant"}`);
        } catch {
          /* ignore */
        }
      }

      const property = data?.property || {};
      patch({
        propertyId: property._id || null,
        propertyName: property.name || name,
        currency: property.currency || form.currency,
        bookingSlug: property.directBooking?.slug || null,
      });
      if (activeWorkspace) {
        await fetchWorkspace(activeWorkspace, { force: true });
      }
      toast.success("Property created");
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
      eyebrow="Step 1 of 5"
      title="Tell us about your property"
      subtitle="This is the base everything else is built on — your calendar, your rates and what the AI tells guests."
      onNext={submit}
      nextLabel="Continue"
      nextDisabled={!form.name.trim()}
      busy={saving}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="bg-white rounded-2xl border border-ink-100 shadow-lg p-5 sm:p-7 space-y-5"
      >
        <div>
          <label className="label" htmlFor="propName">
            Property name
          </label>
          <input
            id="propName"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Sunset Beach Resort"
            className="input"
            autoFocus
          />
        </div>

        <div>
          <span className="label">Property type</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PROPERTY_TYPES.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => set("propertyType", t.key)}
                className={clsx(
                  "rounded-xl border px-3 py-2.5 text-sm font-semibold transition",
                  form.propertyType === t.key
                    ? "border-brand-500 bg-brand-50 text-brand-700 shadow-ring"
                    : "border-ink-200 bg-white text-ink-600 hover:border-ink-300 hover:bg-ink-50",
                )}
              >
                {t.label}
              </button>
            ))}
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
            />
          </div>
        </div>

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
              Used for arrivals, reports and the AI's sense of "today".
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="propCheckIn">
              Check-in time
            </label>
            <input
              id="propCheckIn"
              type="time"
              value={form.checkInTime}
              onChange={(e) => set("checkInTime", e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="propCheckOut">
              Check-out time
            </label>
            <input
              id="propCheckOut"
              type="time"
              value={form.checkOutTime}
              onChange={(e) => set("checkOutTime", e.target.value)}
              className="input"
            />
          </div>
        </div>

        <div className="pt-1 border-t border-ink-100">
          <label className="label mt-4" htmlFor="refCode">
            Referral code{" "}
            <span className="font-normal text-ink-400">(optional)</span>
          </label>
          <div className="relative">
            <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
            <input
              id="refCode"
              value={refCode}
              onChange={(e) => setRefCode(e.target.value)}
              placeholder="Have a consultant's code?"
              className="input pl-9"
            />
            {refState === "checking" && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 animate-spin" />
            )}
            {refState === "valid" && (
              <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
            )}
          </div>
          {refState === "valid" && (
            <p className="text-xs text-emerald-600 mt-1">
              Referred by {refName || "a Botlify consultant"}
            </p>
          )}
          {refState === "invalid" && (
            <p className="text-xs text-ink-400 mt-1">
              We don't recognise that code — you can leave it blank.
            </p>
          )}
        </div>

        {/* Enter-to-submit without showing a second button. */}
        <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
      </form>
    </WizardShell>
  );
}
