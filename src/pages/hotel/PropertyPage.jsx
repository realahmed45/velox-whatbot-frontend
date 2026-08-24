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
import Modal from "@/components/ui/Modal";
import ConnectionStatus from "@/components/ConnectionStatus";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { Link, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { usePropertyStore } from "@/store/propertyStore";

const input =
  "w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 outline-none";
const label = "block text-xs font-semibold text-ink-600 mb-1";

function Toggle({ checked, onChange }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer shrink-0">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={!!checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className="w-11 h-6 bg-ink-200 rounded-full peer peer-checked:bg-brand-500 peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition" />
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-7 h-7 text-brand-500 animate-spin" />
      </div>
    );
  }

  const property = properties.find((p) => p._id === activeId) || null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-brand-500/10 flex items-center justify-center">
            <Hotel className="w-6 h-6 text-brand-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-ink-900">
              Property &amp; Rooms
            </h1>
            <p className="text-sm text-ink-500">
              Your hotel's details, rooms, rates and availability.
            </p>
          </div>
        </div>
        {properties.length > 1 && (
          <select
            value={activeId || ""}
            onChange={(e) => switchTo(e.target.value)}
            className="rounded-xl border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-400 bg-white"
          >
            {properties.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        )}
      </div>

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
          <div className="mb-6">
            <ConnectionStatus propertyId={property._id} />
          </div>
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
            Adding another property to this account.
          </p>
          <button
            onClick={onCancel}
            className="text-xs font-semibold text-ink-500 hover:text-ink-800"
          >
            Cancel
          </button>
        </div>
      )}
      {!mode && (
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={() => setMode("import")}
            className="text-left rounded-2xl border border-ink-100 bg-white p-6 hover:border-brand-300 hover:shadow-card transition group"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-105 transition">
              <CloudDownload className="w-6 h-6" />
            </div>
            <p className="font-black text-ink-900">
              Import from Booking.com / Airbnb
            </p>
            <p className="text-sm text-ink-500 mt-1">
              Already listed on an OTA? Pull your property, rooms and rates in
              one click — and keep availability synced both ways.
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 mt-3">
              Import my property <Plus className="w-3.5 h-3.5" />
            </span>
          </button>
          <button
            onClick={() => setMode("manual")}
            className="text-left rounded-2xl border border-ink-100 bg-white p-6 hover:border-brand-300 hover:shadow-card transition group"
          >
            <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center mb-4 group-hover:scale-105 transition">
              <Building2 className="w-6 h-6" />
            </div>
            <p className="font-black text-ink-900">Set up manually</p>
            <p className="text-sm text-ink-500 mt-1">
              Not on an OTA yet? Add your hotel and rooms yourself in a couple
              of minutes — you can connect OTAs later.
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 mt-3">
              Create my property <Plus className="w-3.5 h-3.5" />
            </span>
          </button>
        </div>
      )}

      {mode === "import" && (
        <ImportFlow onBack={() => setMode(null)} onDone={onDone} onManual={() => setMode("manual")} />
      )}
      {mode === "manual" && (
        <ManualCreateForm onBack={() => setMode(null)} onDone={onDone} />
      )}
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
      await api.post("/hotel/channex/import", {
        channexPropertyId: p.channexId,
      });
      toast.success(`${p.name} imported with its rooms!`);
      onDone();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Import failed");
      setImporting(null);
    }
  };

  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="font-black text-ink-900">Import from your OTAs</p>
        <button
          onClick={onBack}
          className="text-xs font-semibold text-ink-500 hover:text-ink-800"
        >
          ← Back
        </button>
      </div>

      {loading ? (
        <div className="py-10 text-center">
          <Loader2 className="w-6 h-6 text-brand-500 animate-spin inline" />
        </div>
      ) : unavailable ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-3">
            <CloudDownload className="w-6 h-6" />
          </div>
          <p className="font-bold text-ink-900">OTA import is coming soon</p>
          <p className="text-sm text-ink-500 mt-1 max-w-md mx-auto">
            {unavailable} In the meantime, add your rooms manually — your
            bookings and AI concierge work exactly the same.
          </p>
          <button
            onClick={onManual}
            className="mt-4 inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl px-4 py-2.5 transition"
          >
            <Building2 className="w-4 h-4" /> Set up manually
          </button>
        </div>
      ) : channexProps.length === 0 ? (
        <p className="text-sm text-ink-500 py-6 text-center">
          No properties found on your connected OTA account.
        </p>
      ) : (
        <div className="space-y-2">
          {channexProps.map((p) => (
            <div
              key={p.channexId}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-ink-100 p-4"
            >
              <div className="flex-1 min-w-[180px]">
                <p className="font-bold text-ink-900">{p.name}</p>
                <p className="text-xs text-ink-500">
                  {[p.city, p.country].filter(Boolean).join(", ")}
                  {p.currency ? ` · ${p.currency}` : ""}
                </p>
              </div>
              {p.alreadyImported ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5">
                  <Check className="w-3.5 h-3.5" /> Imported
                </span>
              ) : (
                <button
                  onClick={() => doImport(p)}
                  disabled={!!importing}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-lg px-3 py-2 transition disabled:opacity-60"
                >
                  {importing === p.channexId ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CloudDownload className="w-3.5 h-3.5" />
                  )}
                  Import
                </button>
              )}
            </div>
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
    <div className="rounded-2xl border border-ink-100 bg-white p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <p className="font-black text-ink-900">Set up your property</p>
        <button
          onClick={onBack}
          className="text-xs font-semibold text-ink-500 hover:text-ink-800"
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

      {limitError && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="font-bold text-amber-900 text-sm">
            You've reached your plan's property limit
          </p>
          <p className="text-sm text-amber-800 mt-1">{limitError}</p>
          <Link
            to="/dashboard/billing"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-lg px-3.5 py-2 mt-3 transition"
          >
            See upgrade options
          </Link>
        </div>
      )}

      <button
        onClick={submit}
        disabled={saving || !!limitError}
        className="mt-5 inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl px-5 py-2.5 transition disabled:opacity-60"
      >
        {saving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Plus className="w-4 h-4" />
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
        <div className="rounded-2xl border border-blue-100 bg-blue-50/60 px-5 py-3.5 flex flex-wrap items-center gap-3 text-sm">
          <CloudDownload className="w-4 h-4 text-blue-600 shrink-0" />
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
        </div>
      )}

      {/* Details */}
      <div className="rounded-2xl border border-ink-100 bg-white p-5">
        <p className="font-bold text-ink-900 mb-4">Property details</p>
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
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl px-5 py-2.5 transition disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save details
          </button>
        </div>
      </div>

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
    <div className="rounded-2xl border border-ink-100 bg-white p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="font-bold text-ink-900">Photos</p>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Camera className="w-4 h-4" />
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
        <p className="text-sm text-ink-400">
          No photos yet — guests book more when they can see the rooms.
        </p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {photos.map((p, i) => (
            <div
              key={`${p.url}-${i}`}
              className="relative group aspect-square rounded-xl overflow-hidden border border-ink-100"
            >
              <img
                src={p.url}
                alt={p.caption || `Photo ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => removePhoto(i)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                title="Remove"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
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
    <div className="rounded-2xl border border-ink-100 bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="font-bold text-ink-900">Rooms</p>
        <button
          onClick={() => setEditing({})}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
        >
          <Plus className="w-4 h-4" /> Add room
        </button>
      </div>

      {loading ? (
        <div className="py-8 text-center">
          <Loader2 className="w-5 h-5 text-brand-500 animate-spin inline" />
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-10 rounded-xl border border-dashed border-ink-200">
          <BedDouble className="w-8 h-8 text-ink-300 mx-auto mb-2" />
          <p className="font-semibold text-ink-700">No rooms yet</p>
          <p className="text-sm text-ink-500 mt-0.5">
            Add your room types so the AI can quote prices and book guests.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rooms.map((r) => (
            <div
              key={r._id}
              className={`rounded-xl border p-4 ${r.active === false ? "border-ink-100 opacity-60" : "border-ink-100"}`}
            >
              <div className="flex flex-wrap items-start gap-3">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-ink-900">{r.name}</span>
                    {r.active === false && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full border bg-ink-100 text-ink-500 border-ink-200">
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
                    <span className="font-semibold text-ink-800">
                      {r.currency || property.currency || ""} {r.baseRate}
                      /night
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditing(r)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-ink-600 bg-ink-50 hover:bg-ink-100 border border-ink-200 rounded-lg px-2.5 py-1.5 transition"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  {r.active !== false && (
                    <button
                      onClick={() => deactivate(r)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg px-2.5 py-1.5 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <AvailabilityStrip roomId={r._id} />
            </div>
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
      <div className="mt-3 h-6 rounded-lg bg-ink-50 animate-pulse" />
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
        {nights.map((n) => (
          <div
            key={n.date}
            title={`${n.date} · ${n.available} free`}
            className={`h-5 flex-1 min-w-[6px] rounded-[3px] ${
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
  const patch = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!open) return;
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
          },
    );
  }, [open, room, property.currency]);

  const submit = async () => {
    if (!form.name?.trim()) return toast.error("Room name is required");
    if (!Number(form.baseRate)) return toast.error("Set a nightly rate");
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
            className="text-sm font-semibold text-ink-600 hover:text-ink-900 px-4 py-2 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl px-5 py-2.5 transition disabled:opacity-60"
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
            placeholder="e.g. Deluxe Double, Sea View"
            className={input}
          />
        </div>
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
          <label className="flex items-center justify-between rounded-xl border border-ink-100 px-4 py-3">
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
    <div className="rounded-2xl border border-ink-100 bg-white p-5">
      <p className="font-bold text-ink-900 flex items-center gap-1.5 mb-1">
        <Plane className="w-4 h-4 text-brand-500" /> Airport transfers
      </p>
      <p className="text-xs text-ink-500 mb-4">
        Let your AI offer guests a ride from and to the airport.
      </p>

      <div className="space-y-3">
        <div className="rounded-xl border border-ink-100 px-4 py-3">
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
          {t.hasOwnService && (
            <div className="grid sm:grid-cols-2 gap-3 mt-3">
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
          )}
        </div>

        <div className="rounded-xl border border-ink-100 px-4 py-3 flex items-center justify-between gap-3">
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
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl px-5 py-2.5 transition disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save transfer settings
        </button>
      </div>
    </div>
  );
}
