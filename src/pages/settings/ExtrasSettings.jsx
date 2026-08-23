/**
 * Extras — the upsell catalog the AI can offer guests (airport transfer, late
 * checkout, breakfast…). Simple editable rows: label, price, on/off.
 *
 * GET/PUT /api/growth/upsell-catalog { upsells: [{key,label,price,enabled}] }
 */
import { useCallback, useEffect, useState } from "react";
import api from "@/services/api";
import toast from "react-hot-toast";
import { Loader2, Plus, Save, Sparkles, Trash2 } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";

const errMsg = (e, fallback) => e?.response?.data?.message || fallback;

// The backend derives keys from [a-z0-9_] — mirror that so a row we send back
// round-trips to the same entry.
const toKey = (label) =>
  String(label || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);

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

export default function ExtrasSettings() {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState([]);
  const [currency, setCurrency] = useState("USD");
  const [defaults, setDefaults] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/growth/upsell-catalog");
      const list = (data.upsells || []).map((u) => ({
        key: u.key,
        label: u.label || u.key,
        price: u.price ?? 0,
        enabled: u.enabled !== false,
      }));
      setRows(list);
      setDefaults(data.defaults || []);
      setCurrency(data.currency || "USD");
      setFailed(false);
    } catch (e) {
      setFailed(true);
      toast.error(errMsg(e, "Couldn't load your extras"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const update = (i, patch) =>
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const remove = (i) => setRows((rs) => rs.filter((_, idx) => idx !== i));

  const addRow = () =>
    setRows((rs) => [...rs, { key: "", label: "", price: 0, enabled: true }]);

  const useDefaults = () =>
    setRows(
      (defaults || []).map((d) => ({
        key: d.key || toKey(d.label),
        label: d.label || d.key,
        price: d.price ?? 0,
        enabled: d.enabled !== false,
      })),
    );

  const save = async () => {
    // Every row needs a label; the key is derived when it's a new row.
    const upsells = rows
      .map((r) => ({
        key: r.key || toKey(r.label),
        label: r.label.trim(),
        price: Math.max(0, Number(r.price) || 0),
        enabled: !!r.enabled,
      }))
      .filter((r) => r.key && r.label);

    if (upsells.length === 0) {
      toast.error("Add at least one extra with a name");
      return;
    }

    setSaving(true);
    try {
      const { data } = await api.put("/growth/upsell-catalog", { upsells });
      setRows(
        (data.upsells || upsells).map((u) => ({
          key: u.key,
          label: u.label || u.key,
          price: u.price ?? 0,
          enabled: u.enabled !== false,
        })),
      );
      toast.success("Extras saved");
    } catch (e) {
      toast.error(errMsg(e, "Couldn't save your extras"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    );
  }

  if (failed) {
    return (
      <EmptyState
        icon={Sparkles}
        title="Couldn't load extras"
        description="We couldn't reach your property. Check your connection and try again."
        action={
          <button type="button" onClick={load} className="btn-primary">
            Try again
          </button>
        }
      />
    );
  }

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
        <div>
          <h2 className="text-base font-bold text-ink-900">Extras</h2>
          <p className="text-sm text-ink-500 mt-0.5">
            What your AI can offer guests on top of the room.
          </p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-ink-500 mb-4">
            No extras yet. Start from the common ones, or add your own.
          </p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {defaults.length > 0 && (
              <button type="button" onClick={useDefaults} className="btn-secondary">
                Use suggested extras
              </button>
            )}
            <button type="button" onClick={addRow} className="btn-primary">
              <Plus className="w-4 h-4" /> Add an extra
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="divide-y divide-ink-100 mt-4">
            {rows.map((r, i) => (
              <div
                key={i}
                className="flex flex-wrap items-center gap-3 py-3 first:pt-0"
              >
                <input
                  value={r.label}
                  onChange={(e) => update(i, { label: e.target.value })}
                  placeholder="Airport transfer"
                  className="input py-2 flex-1 min-w-[160px]"
                  aria-label="Extra name"
                />
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-ink-500">
                    {currency}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={r.price}
                    onChange={(e) => update(i, { price: e.target.value })}
                    className="input py-2 w-24"
                    aria-label="Price"
                  />
                </div>
                <Toggle
                  checked={r.enabled}
                  onChange={(v) => update(i, { enabled: v })}
                />
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="p-2 rounded-lg text-ink-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  aria-label={`Remove ${r.label || "extra"}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-ink-100">
            <button type="button" onClick={addRow} className="btn-secondary">
              <Plus className="w-4 h-4" /> Add an extra
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="btn-primary ml-auto"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save extras
            </button>
          </div>
        </>
      )}
    </div>
  );
}
