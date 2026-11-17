/**
 * Property & Rooms — set up the hotel (import from Booking.com/Airbnb via
 * Channex, or manually), edit details & photos, manage room types with a
 * 30-day availability strip, and configure airport-transfer settings.
 */
import { useEffect, useState, useCallback, useRef } from "react";
import api from "@/services/api";
import toast from "react-hot-toast";
import {
  BedDouble,
  Building2,
  Camera,
  Check,
  CloudDownload,
  Hotel,
  Loader2,
  Pencil,
  Plane,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Modal from "@/components/ui/Modal";
import PhotoUploader from "@/components/PhotoUploader";
import { PulseDot, Reveal, Spotlight } from "@/components/fx";
import ConnectionStatus from "@/components/ConnectionStatus";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { Link, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { usePropertyStore } from "@/store/propertyStore";

const input = "input";
const label = "label";
const spring = { type: "spring", stiffness: 420, damping: 30 };
const hop =
  "transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]";

function Toggle({ checked, onChange }) {
  return (
    <label className="toggle shrink-0">
      <input
        type="checkbox"
        checked={!!checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="slider" />
    </label>
  );
}

export default function PropertyPage() {
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [activeId, setActiveId] = useState(null);

  // The sidebar's property switcher and this page share one choice, so
  // switching hotels there lands you on the right one here.
  const { activeWorkspace } = useAuthStore();
  const selectedByWorkspace = usePropertyStore((s) => s.selectedByWorkspace);
  const selectProperty = usePropertyStore((s) => s.select);
  const fetchProperties = usePropertyStore((s) => s.fetchProperties);

  // "+ Add another property" in the switcher routes here with ?new=1.
  const [searchParams, setSearchParams] = useSearchParams();
  const wantsNew = searchParams.get("new") === "1";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/hotel/properties");
      const props = data.properties || [];
      setProperties(props);
      const preferred = activeWorkspace
        ? selectedByWorkspace[activeWorkspace]
        : null;
      setActiveId((cur) => {
        if (cur && props.some((p) => p._id === cur)) return cur;
        if (preferred && props.some((p) => String(p._id) === String(preferred)))
          return preferred;
        return props[0]?._id || null;
      });
      // Keep the switcher's list in step with what this page just fetched.
      if (activeWorkspace) fetchProperties(activeWorkspace, { force: true });
    } catch {
      toast.error("Couldn't load your property");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWorkspace]);

  useEffect(() => {
    load();
  }, [load]);

  const switchTo = (id) => {
    setActiveId(id);
    if (activeWorkspace) selectProperty(activeWorkspace, id);
  };

  const closeNew = () => {
    searchParams.delete("new");
    setSearchParams(searchParams, { replace: true });
  };

  // A hotel that set itself up manually still needs a way to connect its OTAs
  // later — this reopens the same import flow first-run uses.
  const openConnect = () => {
    searchParams.set("new", "1");
    setSearchParams(searchParams, { replace: false });
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 pt-6 font-geist sm:px-6 sm:pt-8 lg:px-8" aria-busy="true">
        <div className="flex items-center gap-3.5 mb-8">
          <div className="h-11 w-11 rounded-xl bg-ink-900/[0.06] animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-52 rounded-lg bg-ink-900/[0.06] animate-pulse" />
            <div className="h-3.5 w-72 max-w-full rounded bg-ink-900/[0.06] animate-pulse" />
          </div>
        </div>
        <div className="space-y-5">
          <div className="card h-16 animate-pulse" />
          <div className="card h-72 animate-pulse" />
          <div className="card h-40 animate-pulse" />
        </div>
      </div>
    );
  }

  const property = properties.find((p) => p._id === activeId) || null;

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-12 pt-6 font-geist sm:px-6 sm:pt-8 lg:px-8">
      <Reveal className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div className="group flex items-center gap-3.5 min-w-0">
          <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#0A0A0A] text-[#FF5A1F] shadow-[0_14px_28px_-14px_rgba(10,10,10,0.7)] ${hop}`}>
            <Hotel className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <h1 className="font-geist text-[28px] font-semibold leading-tight tracking-[-0.045em] text-[#0A0A0A] sm:text-[36px]">
              Property &amp; <span className="text-[#FF5A1F]">Rooms</span>
            </h1>
            <p className="text-sm text-black/55">
              Your hotel's details, rooms, rates and availability.
            </p>
          </div>
        </div>
        {properties.length > 1 && (
          <select
            value={activeId || ""}
            onChange={(e) => switchTo(e.target.value)}
            className="input w-full max-w-full min-h-[42px] rounded-xl bg-white py-2 pr-8 font-medium sm:w-auto"
          >
            {properties.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        )}
      </Reveal>

      {!property || wantsNew ? (
        <SetupCards
          onDone={() => {
            closeNew();
            load();
          }}
          onCancel={property ? closeNew : undefined}
        />
      ) : (
        <>
          {/* The honest state of the OTA connection, right where rates and
              rooms are edited — so a blocker ("set a nightly rate for Deluxe
              Double") is one scroll from the field that fixes it. */}
          <Reveal className="mb-6">
            <ConnectionStatus
              propertyId={property._id}
              onConnect={openConnect}
            />
          </Reveal>
          <PropertyEditor property={property} onChanged={load} />
        </>
      )}
    </div>
  );
}

/* ── First-run setup: import from OTA or create manually ────────────── */
function SetupCards({ onDone, onCancel }) {
  const [mode, setMode] = useState(null); // null | "import" | "manual"

  return (
    <div>
      {/* Only shown when adding a FURTHER property — first-run has no
          existing property to go back to. */}
      {onCancel && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <p className="text-sm text-ink-500">
            Import a property from a booking channel, or add another to this
            account.
          </p>
          <button
            onClick={onCancel}
            className="btn-ghost px-3 py-1.5 text-xs"
          >
            Cancel
          </button>
        </div>
      )}
      <AnimatePresence mode="wait" initial={false}>
      {!mode && (
        <motion.div
          key="choose"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="grid md:grid-cols-2 gap-4"
        >
          <Spotlight
            as="button"
            onClick={() => setMode("import")}
            className="card-hover text-left p-6 group active:scale-[0.98]"
          >
            <div className={`grid h-12 w-12 place-items-center rounded-xl bg-[#FF5A1F] text-white shadow-[0_10px_24px_-10px_rgba(255,90,31,0.6)] mb-4 ${hop}`}>
              <CloudDownload className="w-6 h-6" strokeWidth={1.8} />
            </div>
            <p className="font-geist text-lg font-semibold tracking-[-0.02em] text-ink-900">
              Import from Booking.com / Airbnb
            </p>
            <p className="text-sm text-ink-500 mt-1">
              Already listed on an OTA? Pull your property, rooms and rates in
              one click — and keep availability synced both ways.
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#FF5A1F] mt-4">
              Import my property <Plus className="w-3.5 h-3.5 transition-transform duration-500 ease-spring group-hover:rotate-90" />
            </span>
          </Spotlight>
          <Spotlight
            as="button"
            onClick={() => setMode("manual")}
            className="card-hover text-left p-6 group active:scale-[0.98]"
          >
            <div className={`grid h-12 w-12 place-items-center rounded-xl bg-[#FFF1EA] text-[#FF5A1F] mb-4 ${hop}`}>
              <Building2 className="w-6 h-6" strokeWidth={1.8} />
            </div>
            <p className="font-geist text-lg font-semibold tracking-[-0.02em] text-ink-900">Set up manually</p>
            <p className="text-sm text-ink-500 mt-1">
              Not on an OTA yet? Add your hotel and rooms yourself in a couple
              of minutes — you can connect OTAs later.
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#FF5A1F] mt-4">
              Create my property <Plus className="w-3.5 h-3.5 transition-transform duration-500 ease-spring group-hover:rotate-90" />
            </span>
          </Spotlight>
        </motion.div>
      )}

      {mode === "import" && (
        <motion.div key="import" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
          <ImportFlow onBack={() => setMode(null)} onDone={onDone} onManual={() => setMode("manual")} />
        </motion.div>
      )}
      {mode === "manual" && (
        <motion.div key="manual" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
          <ManualCreateForm onBack={() => setMode(null)} onDone={onDone} />
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}

function ImportFlow({ onBack, onDone, onManual }) {
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(null); // message when 503
  const [channexProps, setChannexProps] = useState([]);
  const [importing, setImporting] = useState(null);

  useEffect(() => {
    let alive = true;
    api
      .get("/hotel/channex/properties")
      .then(({ data }) => {
        if (alive) setChannexProps(data.properties || []);
      })
      .catch((e) => {
        if (!alive) return;
        if (e?.response?.status === 503) {
          setUnavailable(
            e.response?.data?.message ||
              "OTA sync isn't configured for your account yet.",
          );
        } else {
          toast.error("Couldn't load your OTA properties");
        }
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const doImport = async (p) => {
    setImporting(p.channexId);
    try {
      // The unified import: the backend resolves whichever channel provider is
      // configured, so this stays correct if the provider ever changes.
      await api.post("/hotel/connection/import", {
        providerPropertyId: p.channexId,
      });
      toast.success(`${p.name} imported with its rooms!`);
      onDone();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Import failed");
      setImporting(null);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-black/[0.06] shadow-[0_24px_48px_-36px_rgba(10,10,10,0.3)] sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="font-geist text-lg font-semibold tracking-[-0.02em] text-ink-900">Import from your OTAs</p>
        <button
          onClick={onBack}
          className="btn-ghost px-3 py-1.5 text-xs"
        >
          ← Back
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[0, 1].map((i) => (
            <div key={i} className="h-[68px] rounded-xl bg-ink-900/[0.05] animate-pulse" />
          ))}
        </div>
      ) : unavailable ? (
        <div className="text-center py-8">
          <div className="relative mx-auto mb-4 grid h-14 w-14 place-items-center">
            <span aria-hidden className="absolute inset-0 rounded-full bg-[#FF5A1F] opacity-20 blur-2xl" />
            <span className="relative grid h-12 w-12 place-items-center rounded-xl bg-amber-50 text-amber-500 ring-1 ring-amber-500/20">
              <CloudDownload className="w-6 h-6" strokeWidth={1.8} />
            </span>
          </div>
          <p className="font-geist text-lg font-semibold text-ink-900">OTA import is coming soon</p>
          <p className="text-sm text-ink-500 mt-1 max-w-md mx-auto">
            {unavailable} In the meantime, add your rooms manually — your
            bookings and AI concierge work exactly the same.
          </p>
          <button
            onClick={onManual}
            className="btn bg-[#FF5A1F] text-white shadow-[0_10px_24px_-12px_rgba(255,90,31,0.8)] hover:bg-[#E84A12] hover:-translate-y-0.5 active:scale-[0.97] group mt-5 min-h-[44px]"
          >
            <Building2 className={`w-4 h-4 ${hop}`} /> Set up manually
          </button>
        </div>
      ) : channexProps.length === 0 ? (
        <p className="text-sm text-ink-500 py-6 text-center">
          No properties found on your connected OTA account.
        </p>
      ) : (
        <div className="space-y-2">
          {channexProps.map((p, i) => (
            <motion.div
              key={p.channexId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: i * 0.05 }}
              className="flex flex-wrap items-center gap-3 rounded-xl bg-white/60 p-4 ring-1 ring-ink-900/[0.07] shadow-[inset_0_1px_0_#fff] transition-[transform,background-color] duration-500 ease-spring hover:-translate-y-0.5 hover:bg-white/90"
            >
              <div className="flex-1 min-w-[180px]">
                <p className="font-geist font-semibold text-ink-900">{p.name}</p>
                <p className="text-xs text-ink-500">
                  {[p.city, p.country].filter(Boolean).join(", ")}
                  {p.currency ? ` · ${p.currency}` : ""}
                </p>
              </div>
              {p.alreadyImported ? (
                <span className="badge-green inline-flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Imported
                </span>
              ) : (
                <button
                  onClick={() => doImport(p)}
                  disabled={!!importing}
                  className="btn bg-[#FF5A1F] text-white shadow-[0_10px_24px_-12px_rgba(255,90,31,0.8)] hover:bg-[#E84A12] hover:-translate-y-0.5 active:scale-[0.97] min-h-[40px] px-3.5 py-2 text-xs disabled:opacity-60"
                >
                  {importing === p.channexId ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CloudDownload className="w-3.5 h-3.5" />
                  )}
                  Import
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function ManualCreateForm({ onBack, onDone }) {
  const [saving, setSaving] = useState(false);
  const [limitError, setLimitError] = useState("");
  const [form, setForm] = useState({
    name: "",
    propertyType: "hotel",
    city: "",
    country: "",
    currency: "USD",
    address: "",
    phone: "",
    email: "",
  });
  const patch = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.name.trim()) return toast.error("Give your property a name");
    setSaving(true);
    setLimitError("");
    try {
      await api.post("/hotel/properties", {
        ...form,
        name: form.name.trim(),
      });
      toast.success("Property created — now add your rooms!");
      onDone();
    } catch (e) {
      // 403 here is always the plan's property cap. Surface it inline with a
      // way out rather than as a toast that vanishes.
      if (e?.response?.status === 403) {
        setLimitError(
          e.response?.data?.message ||
            "Your plan doesn't cover another property.",
        );
      } else {
        toast.error(e?.response?.data?.message || "Couldn't create property");
      }
      setSaving(false);
    }
  };

  return (
    <div className="card p-5 sm:p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <p className="font-geist text-lg font-semibold tracking-[-0.02em] text-ink-900">Set up your property</p>
        <button
          onClick={onBack}
          className="btn-ghost px-3 py-1.5 text-xs"
        >
          ← Back
        </button>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <span className={label}>Property name</span>
          <input
            value={form.name}
            onChange={(e) => patch("name", e.target.value)}
            placeholder="e.g. Seaview Boutique Hotel"
            className={input}
          />
        </div>
        <div>
          <span className={label}>Type</span>
          <select
            value={form.propertyType}
            onChange={(e) => patch("propertyType", e.target.value)}
            className={input}
          >
            <option value="hotel">Hotel</option>
            <option value="guesthouse">Guesthouse</option>
            <option value="apartment">Apartments</option>
            <option value="hostel">Hostel</option>
            <option value="resort">Resort</option>
            <option value="villa">Villa</option>
          </select>
        </div>
        <div>
          <span className={label}>Currency</span>
          <input
            value={form.currency}
            onChange={(e) => patch("currency", e.target.value.toUpperCase())}
            placeholder="USD"
            maxLength={3}
            className={input}
          />
        </div>
        <div>
          <span className={label}>City</span>
          <input
            value={form.city}
            onChange={(e) => patch("city", e.target.value)}
            className={input}
          />
        </div>
        <div>
          <span className={label}>Country</span>
          <input
            value={form.country}
            onChange={(e) => patch("country", e.target.value)}
            className={input}
          />
        </div>
        <div className="sm:col-span-2">
          <span className={label}>Address</span>
          <input
            value={form.address}
            onChange={(e) => patch("address", e.target.value)}
            className={input}
          />
        </div>
        <div>
          <span className={label}>Phone</span>
          <input
            value={form.phone}
            onChange={(e) => patch("phone", e.target.value)}
            className={input}
          />
        </div>
        <div>
          <span className={label}>Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => patch("email", e.target.value)}
            className={input}
          />
        </div>
      </div>

      <AnimatePresence>
      {limitError && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={spring}
          className="mt-5 rounded-xl bg-amber-50/90 p-4 ring-1 ring-amber-500/25"
        >
          <p className="font-semibold text-amber-900 text-sm">
            You've reached your plan's property limit
          </p>
          <p className="text-sm text-amber-800 mt-1">{limitError}</p>
          <Link
            to="/dashboard/billing"
            className="btn bg-[#FF5A1F] text-white shadow-[0_10px_24px_-12px_rgba(255,90,31,0.8)] hover:bg-[#E84A12] hover:-translate-y-0.5 active:scale-[0.97] mt-3 min-h-[40px] px-3.5 py-2 text-xs"
          >
            See upgrade options
          </Link>
        </motion.div>
      )}
      </AnimatePresence>

      <button
        onClick={submit}
        disabled={saving || !!limitError}
        className="mt-5 btn bg-[#FF5A1F] text-white shadow-[0_10px_24px_-12px_rgba(255,90,31,0.8)] hover:bg-[#E84A12] hover:-translate-y-0.5 active:scale-[0.97] group min-h-[44px] disabled:opacity-60"
      >
        {saving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Plus className="w-4 h-4 transition-transform duration-500 ease-spring group-hover:rotate-90" />
        )}
        Create property
      </button>
    </div>
  );
}

/* ── Editor for an existing property ────────────────────────────────── */
function PropertyEditor({ property, onChanged }) {
  const [form, setForm] = useState(property);
  const [saving, setSaving] = useState(false);
  useEffect(() => setForm(property), [property]);
  const patch = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (fields) => {
    setSaving(true);
    try {
      await api.put(`/hotel/properties/${property._id}`, fields);
      toast.success("Saved");
      onChanged();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const saveDetails = () =>
    save({
      name: form.name,
      description: form.description,
      propertyType: form.propertyType,
      address: form.address,
      city: form.city,
      country: form.country,
      currency: form.currency,
      checkInTime: form.checkInTime,
      checkOutTime: form.checkOutTime,
      phone: form.phone,
      email: form.email,
    });

  return (
    <div className="space-y-6">
      {/* OTA sync status strip */}
      {form.channel?.provider && form.channel.provider !== "none" && (
        <Reveal className="card px-5 py-3.5 flex flex-wrap items-center gap-3 text-sm">
          {form.channel.status === "active" ? (
            <PulseDot color="bg-emerald-500" />
          ) : (
            <CloudDownload className="w-4 h-4 text-sky-600 shrink-0" />
          )}
          <span className="font-semibold text-ink-800">
            OTA sync {form.channel.status === "active" ? "active" : form.channel.status}
          </span>
          {(form.channel.connectedOtas || []).length > 0 && (
            <span className="text-ink-500">
              {(form.channel.connectedOtas || []).join(", ")}
            </span>
          )}
          {form.channel.lastSyncAt && (
            <span className="ml-auto text-xs text-ink-400">
              Last sync {new Date(form.channel.lastSyncAt).toLocaleString()}
            </span>
          )}
        </Reveal>
      )}

      {/* Details */}
      <Reveal>
      <div className="rounded-2xl bg-white p-5 ring-1 ring-black/[0.06] shadow-[0_24px_48px_-36px_rgba(10,10,10,0.3)] sm:p-6">
        <div className="mb-5"><div className="group flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#0A0A0A] text-[#FF5A1F] transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]">
            <Building2 className="h-5 w-5" strokeWidth={1.8} />
          </span>
          <p className="font-geist text-[18px] font-semibold tracking-[-0.03em] text-[#0A0A0A]">Property details</p>
        </div></div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <span className={label}>Name</span>
            <input
              value={form.name || ""}
              onChange={(e) => patch("name", e.target.value)}
              className={input}
            />
          </div>
          <div className="sm:col-span-2">
            <span className={label}>Description (your AI uses this to answer guests)</span>
            <textarea
              value={form.description || ""}
              onChange={(e) => patch("description", e.target.value)}
              rows={3}
              className={input}
            />
          </div>
          <div className="sm:col-span-2">
            <span className={label}>Address</span>
            <input
              value={form.address || ""}
              onChange={(e) => patch("address", e.target.value)}
              className={input}
            />
          </div>
          <div>
            <span className={label}>City</span>
            <input
              value={form.city || ""}
              onChange={(e) => patch("city", e.target.value)}
              className={input}
            />
          </div>
          <div>
            <span className={label}>Country</span>
            <input
              value={form.country || ""}
              onChange={(e) => patch("country", e.target.value)}
              className={input}
            />
          </div>
          <div>
            <span className={label}>Currency</span>
            <input
              value={form.currency || ""}
              onChange={(e) => patch("currency", e.target.value.toUpperCase())}
              maxLength={3}
              className={input}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className={label}>Check-in</span>
              <input
                type="time"
                value={form.checkInTime || "14:00"}
                onChange={(e) => patch("checkInTime", e.target.value)}
                className={input}
              />
            </div>
            <div>
              <span className={label}>Check-out</span>
              <input
                type="time"
                value={form.checkOutTime || "12:00"}
                onChange={(e) => patch("checkOutTime", e.target.value)}
                className={input}
              />
            </div>
          </div>
          <div>
            <span className={label}>Phone</span>
            <input
              value={form.phone || ""}
              onChange={(e) => patch("phone", e.target.value)}
              className={input}
            />
          </div>
          <div>
            <span className={label}>Email</span>
            <input
              type="email"
              value={form.email || ""}
              onChange={(e) => patch("email", e.target.value)}
              className={input}
            />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={saveDetails}
            disabled={saving}
            className="btn bg-[#FF5A1F] text-white shadow-[0_10px_24px_-12px_rgba(255,90,31,0.8)] hover:bg-[#E84A12] hover:-translate-y-0.5 active:scale-[0.97] group min-h-[44px] disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4 transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]" />
            )}
            Save details
          </button>
        </div>
      </div>
      </Reveal>

      {/* Photos */}
      <PhotosCard property={property} onChanged={onChanged} />

      {/* Rooms */}
      <RoomsSection property={property} />

      {/* Transfers settings */}
      <TransfersSettingsCard property={property} onChanged={onChanged} />
    </div>
  );
}

/* ── Photos ─────────────────────────────────────────────────────────── */
function PhotosCard({ property, onChanged }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const photos = property.photos || [];

  const savePhotos = async (next) => {
    try {
      await api.put(`/hotel/properties/${property._id}`, { photos: next });
      onChanged();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Couldn't save photos");
    }
  };

  const upload = async (files) => {
    const list = Array.from(files || []).filter((f) =>
      f.type?.startsWith("image/"),
    );
    if (!list.length) return toast.error("Please pick an image file");
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of list) {
        const formData = new FormData();
        formData.append("file", file);
        const { data } = await api.post("/upload/image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (data?.url) uploaded.push(data.url);
      }
      if (!uploaded.length) throw new Error("No URL returned");
      const next = [
        ...photos,
        ...uploaded.map((url, i) => ({
          url,
          caption: "",
          position: photos.length + i,
        })),
      ];
      await savePhotos(next);
      toast.success(
        uploaded.length > 1 ? `${uploaded.length} photos added` : "Photo added",
      );
    } catch (e) {
      toast.error(e?.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removePhoto = (idx) => {
    const next = photos
      .filter((_, i) => i !== idx)
      .map((p, i) => ({ ...p, position: i }));
    savePhotos(next);
  };

  return (
    <Reveal>
    <div className="rounded-2xl bg-white p-5 ring-1 ring-black/[0.06] shadow-[0_24px_48px_-36px_rgba(10,10,10,0.3)] sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="group flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#0A0A0A] text-[#FF5A1F] transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]">
            <Camera className="h-5 w-5" strokeWidth={1.8} />
          </span>
          <p className="font-geist text-[18px] font-semibold tracking-[-0.03em] text-[#0A0A0A]">Photos</p>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="btn-secondary group min-h-[40px] px-3.5 py-2 text-xs disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Camera className={`w-4 h-4 ${hop}`} />
          )}
          Add photos
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => upload(e.target.files)}
        />
      </div>
      {photos.length === 0 ? (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="group flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-900/10 bg-white/40 px-4 py-8 text-center transition-colors hover:border-[#FF5A1F]/40 hover:bg-white/80"
        >
          <span className={`grid h-10 w-10 place-items-center rounded-xl bg-[#FFF1EA] text-[#FF5A1F] ${hop}`}>
            <Camera className="h-5 w-5" strokeWidth={1.8} />
          </span>
          <span className="text-sm text-ink-500">
            No photos yet — guests book more when they can see the rooms.
          </span>
        </button>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          <AnimatePresence initial={false}>
          {photos.map((p, i) => (
            <motion.div
              layout
              key={`${p.url}-${i}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={spring}
              className="relative group aspect-square rounded-xl overflow-hidden ring-1 ring-ink-900/[0.07] shadow-[0_6px_16px_-10px_rgba(15,23,42,0.35)]"
            >
              <img
                src={p.url}
                alt={p.caption || `Photo ${i + 1}`}
                className="w-full h-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.07]"
              />
              <button
                onClick={() => removePhoto(i)}
                className="absolute top-1.5 right-1.5 grid h-7 w-7 place-items-center rounded-full bg-night-950/55 text-white backdrop-blur opacity-100 sm:opacity-0 sm:scale-75 transition-all duration-300 ease-spring group-hover:opacity-100 group-hover:scale-100 hover:bg-rose-600"
                title="Remove"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
          </AnimatePresence>
        </div>
      )}
    </div>
    </Reveal>
  );
}

/* ── Rooms ──────────────────────────────────────────────────────────── */
function RoomsSection({ property }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | {} (new) | room
  const confirm = useConfirm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(
        `/hotel/properties/${property._id}/rooms`,
      );
      setRooms(data.roomTypes || []);
    } catch {
      toast.error("Couldn't load rooms");
    } finally {
      setLoading(false);
    }
  }, [property._id]);

  useEffect(() => {
    load();
  }, [load]);

  const deactivate = async (room) => {
    const ok = await confirm({
      title: `Deactivate "${room.name}"?`,
      description: "The AI will stop offering this room to guests.",
      confirmLabel: "Deactivate",
      danger: true,
    });
    if (!ok) return;
    try {
      await api.put(`/hotel/rooms/${room._id}`, { active: false });
      toast.success("Room deactivated");
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Update failed");
    }
  };

  return (
    <Reveal>
    <div className="rounded-2xl bg-white p-5 ring-1 ring-black/[0.06] shadow-[0_24px_48px_-36px_rgba(10,10,10,0.3)] sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="group flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#0A0A0A] text-[#FF5A1F] transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]">
            <BedDouble className="h-5 w-5" strokeWidth={1.8} />
          </span>
          <p className="font-geist text-[18px] font-semibold tracking-[-0.03em] text-[#0A0A0A]">Rooms</p>
        </div>
        <button
          onClick={() => setEditing({})}
          className="btn bg-[#FF5A1F] text-white shadow-[0_10px_24px_-12px_rgba(255,90,31,0.8)] hover:bg-[#E84A12] hover:-translate-y-0.5 active:scale-[0.97] group min-h-[40px] px-3.5 py-2 text-xs"
        >
          <Plus className="w-4 h-4 transition-transform duration-500 ease-spring group-hover:rotate-90" /> Add room
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-[104px] rounded-xl bg-ink-900/[0.05] animate-pulse" />
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-10 rounded-xl border-2 border-dashed border-ink-900/10 bg-white/40">
          <div className="relative mx-auto mb-3 grid h-14 w-14 place-items-center">
            <span aria-hidden className="absolute inset-0 rounded-full bg-[#FF5A1F] opacity-20 blur-2xl" />
            <span className="relative grid h-12 w-12 place-items-center rounded-xl bg-[#FFF1EA] text-[#FF5A1F]">
              <BedDouble className="w-6 h-6" strokeWidth={1.8} />
            </span>
          </div>
          <p className="font-geist font-semibold text-ink-900">No rooms yet</p>
          <p className="text-sm text-ink-500 mt-0.5">
            Add your room types so the AI can quote prices and book guests.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rooms.map((r, i) => (
            <motion.div
              key={r._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: Math.min(i, 8) * 0.05 }}
              className={`group rounded-xl p-4 ring-1 ring-ink-900/[0.07] shadow-[inset_0_1px_0_#fff] transition-[transform,background-color,box-shadow] duration-500 ease-spring ${r.active === false ? "bg-ink-900/[0.02] opacity-60" : "bg-white/60 hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-[inset_0_1px_0_#fff,0_14px_30px_-18px_rgba(255,90,31,0.35)]"}`}
            >
              <div className="flex flex-wrap items-start gap-3">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <span className="font-geist font-semibold tracking-[-0.01em] text-ink-900">{r.name}</span>
                    {r.active === false && (
                      <span className="badge-gray">
                        inactive
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500 mt-1.5">
                    {r.bedConfig && <span>{r.bedConfig}</span>}
                    <span>
                      Sleeps {r.maxOccupancy || (r.maxAdults || 0) + (r.maxChildren || 0)}
                    </span>
                    <span>{r.unitsCount} unit{r.unitsCount === 1 ? "" : "s"}</span>
                    <span className="font-semibold tabular-nums text-ink-800">
                      {r.currency || property.currency || ""} {r.baseRate}
                      /night
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditing(r)}
                    className="btn-secondary group/b min-h-[36px] gap-1 px-3 py-1.5 text-xs"
                  >
                    <Pencil className="w-3.5 h-3.5 transition-transform duration-500 ease-spring group-hover/b:rotate-[-14deg]" /> Edit
                  </button>
                  {r.active !== false && (
                    <button
                      onClick={() => deactivate(r)}
                      aria-label={`Deactivate ${r.name}`}
                      className="btn group/b min-h-[36px] px-2.5 py-1.5 text-xs text-rose-600 bg-rose-50/90 ring-1 ring-rose-500/20 hover:bg-rose-100 hover:-translate-y-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5 transition-transform duration-500 ease-spring group-hover/b:rotate-[-12deg]" />
                    </button>
                  )}
                </div>
              </div>
              <AvailabilityStrip roomId={r._id} />
            </motion.div>
          ))}
        </div>
      )}

      <RoomModal
        open={editing !== null}
        room={editing && editing._id ? editing : null}
        property={property}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          load();
        }}
      />
    </div>
    </Reveal>
  );
}

/* 30-day availability strip: green = at least one unit free, red = full. */
function AvailabilityStrip({ roomId }) {
  const [nights, setNights] = useState(null);

  useEffect(() => {
    let alive = true;
    const from = new Date().toISOString().slice(0, 10);
    api
      .get(`/hotel/rooms/${roomId}/availability`, {
        params: { from, days: 30 },
      })
      .then(({ data }) => alive && setNights(data.nights || []))
      .catch(() => alive && setNights([]));
    return () => {
      alive = false;
    };
  }, [roomId]);

  if (nights === null)
    return (
      <div className="mt-3 h-6 rounded-lg bg-ink-900/[0.06] animate-pulse" />
    );
  if (!nights.length) return null;

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-bold uppercase tracking-wide text-ink-400">
          Next 30 nights
        </span>
        <span className="flex items-center gap-2 text-[10px] text-ink-400">
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-emerald-400" /> free
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-rose-400" /> full
          </span>
        </span>
      </div>
      <div className="flex gap-[2px] overflow-x-auto">
        {nights.map((n, i) => (
          <motion.div
            key={n.date}
            title={`${n.date} · ${n.available} free`}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 26, delay: i * 0.012 }}
            style={{ originY: 1 }}
            className={`h-5 flex-1 min-w-[6px] rounded-[3px] transition-transform duration-300 ease-spring hover:-translate-y-0.5 hover:scale-y-125 ${
              n.available > 0 ? "bg-emerald-400/80" : "bg-rose-400/90"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function RoomModal({ open, room, property, onClose, onSaved }) {
  const isEdit = !!room;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [triedSave, setTriedSave] = useState(false);
  const patch = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  // A room added by hand needs at least one photo of the room.
  const hasPhoto = (form.photos || []).some((p) => p.url);
  const photoRequired = !isEdit;

  useEffect(() => {
    if (!open) return;
    setTriedSave(false);
    setForm(
      room
        ? { ...room }
        : {
            name: "",
            description: "",
            unitsCount: 1,
            maxAdults: 2,
            maxChildren: 1,
            bedConfig: "",
            baseRate: "",
            currency: property.currency || "USD",
            active: true,
            photos: [],
          },
    );
  }, [open, room, property.currency]);

  const submit = async () => {
    setTriedSave(true);
    if (!form.name?.trim()) return toast.error("Room name is required");
    if (!Number(form.baseRate)) return toast.error("Set a nightly rate");
    if (photoRequired && !hasPhoto) return toast.error("Add at least one photo of the room");
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description,
      unitsCount: Number(form.unitsCount) || 1,
      maxAdults: Number(form.maxAdults) || 1,
      maxChildren: Number(form.maxChildren) || 0,
      bedConfig: form.bedConfig,
      baseRate: Number(form.baseRate),
      currency: form.currency,
      active: form.active !== false,
    };
    if (Array.isArray(form.photos)) {
      payload.photos = form.photos
        .filter((p) => p.url)
        .map((p, i) => ({ url: p.url, caption: p.caption || "", position: i }));
    }
    try {
      if (isEdit) {
        await api.put(`/hotel/rooms/${room._id}`, payload);
      } else {
        await api.post(`/hotel/properties/${property._id}/rooms`, payload);
      }
      toast.success(isEdit ? "Room updated" : "Room added");
      onSaved();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit room" : "Add a room"}
      size="lg"
      footer={
        <>
          <button
            onClick={onClose}
            className="btn-ghost min-h-[40px]"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="btn-primary group min-h-[44px] disabled:opacity-60"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit ? "Save room" : "Add room"}
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <div>
          <span className={label}>Room name</span>
          <input
            value={form.name || ""}
            onChange={(e) => patch("name", e.target.value)}
            placeholder="e.g. Room 1"
            className={input}
          />
        </div>
        <PhotoUploader
          label="Room photos"
          photos={form.photos || []}
          onChange={(photos) => patch("photos", photos)}
          max={12}
          compact
          required={photoRequired}
          hint={
            photoRequired
              ? "Add at least one photo of the room — guests book what they can see."
              : "Add photos of this room — they show on your website and booking page."
          }
          error={
            photoRequired && triedSave && !hasPhoto
              ? "Add at least one photo of the room before saving."
              : ""
          }
        />
        <div>
          <span className={label}>Description</span>
          <textarea
            value={form.description || ""}
            onChange={(e) => patch("description", e.target.value)}
            rows={2}
            placeholder="What makes this room special?"
            className={input}
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <span className={label}>Units</span>
            <input
              type="number"
              min="1"
              value={form.unitsCount ?? 1}
              onChange={(e) => patch("unitsCount", e.target.value)}
              className={input}
            />
          </div>
          <div>
            <span className={label}>Max adults</span>
            <input
              type="number"
              min="1"
              value={form.maxAdults ?? 2}
              onChange={(e) => patch("maxAdults", e.target.value)}
              className={input}
            />
          </div>
          <div>
            <span className={label}>Max children</span>
            <input
              type="number"
              min="0"
              value={form.maxChildren ?? 0}
              onChange={(e) => patch("maxChildren", e.target.value)}
              className={input}
            />
          </div>
          <div>
            <span className={label}>Beds</span>
            <input
              value={form.bedConfig || ""}
              onChange={(e) => patch("bedConfig", e.target.value)}
              placeholder="1 double + 1 sofa"
              className={input}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className={label}>Nightly rate</span>
            <input
              type="number"
              min="0"
              value={form.baseRate ?? ""}
              onChange={(e) => patch("baseRate", e.target.value)}
              className={input}
            />
          </div>
          <div>
            <span className={label}>Currency</span>
            <input
              value={form.currency || ""}
              onChange={(e) => patch("currency", e.target.value.toUpperCase())}
              maxLength={3}
              className={input}
            />
          </div>
        </div>
        {isEdit && (
          <label className="flex items-center justify-between rounded-xl bg-white/60 ring-1 ring-ink-900/[0.07] shadow-[inset_0_1px_0_#fff] px-4 py-3">
            <span className="text-sm text-ink-700 font-medium">
              Active — the AI can offer and book this room
            </span>
            <Toggle
              checked={form.active !== false}
              onChange={(v) => patch("active", v)}
            />
          </label>
        )}
      </div>
    </Modal>
  );
}

/* ── Airport transfer settings ──────────────────────────────────────── */
function TransfersSettingsCard({ property, onChanged }) {
  const [saving, setSaving] = useState(false);
  const [t, setT] = useState(property.transfers || {});
  useEffect(() => setT(property.transfers || {}), [property]);
  const patch = (k, v) => setT((x) => ({ ...x, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/hotel/properties/${property._id}`, { transfers: t });
      toast.success("Transfer settings saved");
      onChanged();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Reveal>
    <div className="rounded-2xl bg-white p-5 ring-1 ring-black/[0.06] shadow-[0_24px_48px_-36px_rgba(10,10,10,0.3)] sm:p-6">
      <div className="group flex items-center gap-3 mb-5">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#FFF1EA] text-[#FF5A1F] ${hop}`}>
          <Plane className="h-5 w-5" strokeWidth={1.8} />
        </span>
        <div className="min-w-0">
          <p className="font-geist text-[18px] font-semibold tracking-[-0.03em] text-[#0A0A0A]">Airport transfers</p>
          <p className="text-xs text-ink-500">
            Let your AI offer guests a ride from and to the airport.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="rounded-xl bg-white/60 ring-1 ring-ink-900/[0.07] shadow-[inset_0_1px_0_#fff] px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-ink-800">
                We run our own pickup service
              </p>
              <p className="text-xs text-ink-500">
                The AI offers your car at your price.
              </p>
            </div>
            <Toggle
              checked={t.hasOwnService}
              onChange={(v) => patch("hasOwnService", v)}
            />
          </div>
          <AnimatePresence initial={false}>
          {t.hasOwnService && (
            <motion.div
              key="own"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
            <div className="grid sm:grid-cols-2 gap-3 pt-3">
              <div>
                <span className={label}>
                  Price per ride ({property.currency || "USD"})
                </span>
                <input
                  type="number"
                  min="0"
                  value={t.ownServicePrice ?? ""}
                  onChange={(e) => patch("ownServicePrice", Number(e.target.value))}
                  className={input}
                />
              </div>
              <div>
                <span className={label}>Notes (car type, luggage…)</span>
                <input
                  value={t.ownServiceNotes || ""}
                  onChange={(e) => patch("ownServiceNotes", e.target.value)}
                  className={input}
                />
              </div>
            </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>

        <div className="rounded-xl bg-white/60 ring-1 ring-ink-900/[0.07] shadow-[inset_0_1px_0_#fff] px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-ink-800">
              Offer partner transfer service
            </p>
            <p className="text-xs text-ink-500">
              When your car isn't available, the AI books a vetted partner ride.
            </p>
          </div>
          <Toggle
            checked={t.offerPartnerService}
            onChange={(v) => patch("offerPartnerService", v)}
          />
        </div>

        <div className="max-w-[200px]">
          <span className={label}>Nearest airport code</span>
          <input
            value={t.airportCode || ""}
            onChange={(e) => patch("airportCode", e.target.value.toUpperCase())}
            placeholder="e.g. KHI"
            maxLength={4}
            className={input}
          />
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <button
          onClick={save}
          disabled={saving}
          className="btn bg-[#FF5A1F] text-white shadow-[0_10px_24px_-12px_rgba(255,90,31,0.8)] hover:bg-[#E84A12] hover:-translate-y-0.5 active:scale-[0.97] group min-h-[44px] disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4 transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]" />
          )}
          Save transfer settings
        </button>
      </div>
    </div>
    </Reveal>
  );
}
