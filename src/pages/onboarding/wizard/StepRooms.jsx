/**
 * Step 2 — Your rooms. Add several room types inline, each saved with
 * POST /hotel/properties/:id/rooms. Skippable, but visibly not recommended:
 * without a rate the AI has nothing to quote.
 */
import { useCallback, useEffect, useState } from "react";
import { BedDouble, Check, Loader2, Plus, Trash2, Users } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/services/api";
import WizardShell from "./WizardShell";

const blankDraft = (currency) => ({
  name: "",
  unitsCount: 1,
  maxAdults: 2,
  baseRate: "",
  currency: currency || "USD",
});

export default function StepRooms({ state, patch, goNext, goBack }) {
  const propertyId = state.propertyId;
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [draft, setDraft] = useState(() => blankDraft(state.currency));
  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));

  const load = useCallback(async () => {
    if (!propertyId) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get(`/hotel/properties/${propertyId}/rooms`);
      const list = data.roomTypes || data.rooms || [];
      setRooms(list);
      patch({ roomsAdded: list.length });
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

  const addRoom = async () => {
    const name = draft.name.trim();
    if (!name) return toast.error("Give the room type a name");
    if (!Number(draft.baseRate))
      return toast.error("Set a nightly rate — it's what the AI quotes");
    if (!propertyId) return toast.error("Your property is still saving");
    setSaving(true);
    try {
      const { data } = await api.post(
        `/hotel/properties/${propertyId}/rooms`,
        {
          name,
          unitsCount: Number(draft.unitsCount) || 1,
          maxAdults: Number(draft.maxAdults) || 1,
          maxChildren: 0,
          baseRate: Number(draft.baseRate),
          currency: draft.currency || state.currency || "USD",
          active: true,
        },
      );
      const created = data?.roomType || data?.room || { _id: Date.now(), ...draft, name };
      const next = [...rooms, created];
      setRooms(next);
      patch({ roomsAdded: next.length });
      setDraft(blankDraft(draft.currency || state.currency));
      toast.success(`${name} added`);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Couldn't add that room");
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

  return (
    <WizardShell
      step={1}
      icon={BedDouble}
      eyebrow="Step 2 of 5"
      title="What rooms do you sell?"
      subtitle="Add each room type once — the nightly rate is what your AI quotes guests and what gets pushed to every channel."
      onBack={goBack}
      onSkip={rooms.length === 0 ? skip : undefined}
      skipLabel="I'll do this later (not recommended)"
      onNext={goNext}
      nextLabel={rooms.length ? "Continue" : "Continue without rooms"}
      wide
    >
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-7 h-7 text-brand-500 animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {rooms.length > 0 && (
            <ul className="space-y-2">
              {rooms.map((r) => (
                <li
                  key={r._id}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-ink-100 bg-white p-4 shadow-card"
                >
                  <span className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-5 h-5" strokeWidth={3} />
                  </span>
                  <div className="flex-1 min-w-[140px]">
                    <p className="font-bold text-ink-900">{r.name}</p>
                    <p className="text-xs text-ink-500">
                      {r.unitsCount || 1} room
                      {(r.unitsCount || 1) === 1 ? "" : "s"} ·{" "}
                      {r.maxAdults || 2} guest
                      {(r.maxAdults || 2) === 1 ? "" : "s"} · {r.currency}{" "}
                      {Number(r.baseRate || 0).toLocaleString()}/night
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeRoom(r)}
                    disabled={deleting === r._id}
                    className="text-ink-400 hover:text-rose-600 transition p-2 rounded-lg hover:bg-rose-50 disabled:opacity-50"
                    aria-label={`Remove ${r.name}`}
                  >
                    {deleting === r._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="rounded-2xl border border-ink-100 bg-white shadow-lg p-5 sm:p-6">
            <p className="font-black text-ink-900 mb-4">
              {rooms.length ? "Add another room type" : "Add your first room type"}
            </p>
            <div className="grid sm:grid-cols-6 gap-3">
              <div className="sm:col-span-6">
                <label className="label" htmlFor="roomName">
                  Room type name
                </label>
                <input
                  id="roomName"
                  value={draft.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Deluxe Double, Sea View"
                  className="input"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="roomUnits">
                  How many of these
                </label>
                <input
                  id="roomUnits"
                  type="number"
                  min="1"
                  value={draft.unitsCount}
                  onChange={(e) => set("unitsCount", e.target.value)}
                  className="input"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="roomOcc">
                  Max guests
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
                  <input
                    id="roomOcc"
                    type="number"
                    min="1"
                    value={draft.maxAdults}
                    onChange={(e) => set("maxAdults", e.target.value)}
                    className="input pl-9"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="roomRate">
                  Nightly rate
                </label>
                <div className="flex gap-2">
                  <select
                    value={draft.currency}
                    onChange={(e) => set("currency", e.target.value)}
                    className="input w-24 shrink-0 px-2"
                    aria-label="Rate currency"
                  >
                    {[
                      draft.currency,
                      "IDR",
                      "USD",
                      "EUR",
                      "GBP",
                      "AUD",
                      "SGD",
                      "MYR",
                      "THB",
                    ]
                      .filter((c, i, a) => c && a.indexOf(c) === i)
                      .map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                  </select>
                  <input
                    id="roomRate"
                    type="number"
                    min="0"
                    value={draft.baseRate}
                    onChange={(e) => set("baseRate", e.target.value)}
                    placeholder="850000"
                    className="input"
                  />
                </div>
              </div>
            </div>

            <p className="text-xs text-ink-400 mt-3">
              This rate is what the AI quotes guests and what syncs to every
              channel — you can change it any time.
            </p>

            <button
              type="button"
              onClick={addRoom}
              disabled={saving}
              className="btn-secondary w-full sm:w-auto mt-4"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Add room type
            </button>
          </div>

          {rooms.length === 0 && (
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
