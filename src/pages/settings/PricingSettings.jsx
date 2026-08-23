/**
 * Pricing — the revenue manager's guard rails, plus the public direct-booking
 * link for this property.
 *
 * PUT /api/agent/revenue-settings { enabled, mode, minRate, maxRate }
 */
import { useCallback, useEffect, useState } from "react";
import api from "@/services/api";
import toast from "react-hot-toast";
import { Check, Copy, Loader2, Save, TrendingUp } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";

const errMsg = (e, fallback) => e?.response?.data?.message || fallback;

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

/* ── Direct booking link ─────────────────────────────────────────────────── */

function DirectBookingLink({ property }) {
  const [copied, setCopied] = useState(false);
  const slug = property?.directBooking?.slug;

  if (!slug) {
    return (
      <div className="card p-5 sm:p-6">
        <h2 className="text-base font-bold text-ink-900">Direct booking page</h2>
        <p className="text-sm text-ink-500 mt-1">
          Your public booking link appears here once your property has a name
          saved.
        </p>
      </div>
    );
  }

  const url = `${window.location.origin}/book/${slug}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — select the link and copy it manually");
    }
  };

  return (
    <div className="card p-5 sm:p-6">
      <h2 className="text-base font-bold text-ink-900">Direct booking page</h2>
      <p className="text-sm text-ink-500 mt-1 mb-4">
        Share this link — guests book you directly, with no OTA commission.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="flex-1 min-w-[200px] rounded-md border border-ink-200 bg-ink-50 px-3 py-2.5 text-sm text-ink-700 truncate hover:border-brand-300 hover:text-brand-700 transition"
        >
          {url}
        </a>
        <button type="button" onClick={copy} className="btn-secondary">
          {copied ? (
            <Check className="w-4 h-4 text-emerald-600" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */

export default function PricingSettings() {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [property, setProperty] = useState(null);
  const [form, setForm] = useState({
    enabled: true,
    mode: "suggest",
    minRate: 0,
    maxRate: 0,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/hotel/properties");
      const prop = (data.properties || [])[0] || null;
      setProperty(prop);
      const rev = prop?.revenue || {};
      setForm({
        enabled: rev.enabled !== false,
        mode: rev.mode === "auto" ? "auto" : "suggest",
        minRate: rev.minRate ?? 0,
        maxRate: rev.maxRate ?? 0,
      });
      setFailed(false);
    } catch (e) {
      setFailed(true);
      toast.error(errMsg(e, "Couldn't load your pricing settings"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    const minRate = Math.max(0, Number(form.minRate) || 0);
    const maxRate = Math.max(0, Number(form.maxRate) || 0);
    if (maxRate && minRate && maxRate < minRate) {
      toast.error("The highest rate must be above the lowest");
      return;
    }
    setSaving(true);
    try {
      await api.put("/agent/revenue-settings", {
        enabled: form.enabled,
        mode: form.mode,
        minRate,
        maxRate,
      });
      toast.success("Pricing settings saved");
    } catch (e) {
      toast.error(errMsg(e, "Couldn't save your pricing settings"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  if (failed) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="Couldn't load pricing"
        description="We couldn't reach your property. Check your connection and try again."
        action={
          <button type="button" onClick={load} className="btn-primary">
            Try again
          </button>
        }
      />
    );
  }

  if (!property) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="No property yet"
        description="Add your hotel under Property & Rooms first, then set your pricing guard rails here."
      />
    );
  }

  const currency = property.currency || "USD";

  return (
    <div className="space-y-4">
      <div className="card p-5 sm:p-6">
        <h2 className="text-base font-bold text-ink-900">Smart pricing</h2>
        <p className="text-sm text-ink-500 mt-0.5 mb-5">
          Botlify watches demand and proposes better nightly rates.
        </p>

        {/* on/off */}
        <div className="flex items-center justify-between gap-4 py-3 border-t border-ink-100">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink-900">
              Enable smart pricing
            </p>
            <p className="text-xs text-ink-500 mt-0.5">
              Turn this off and your rates never change on their own.
            </p>
          </div>
          <Toggle
            checked={form.enabled}
            onChange={(v) => setForm((f) => ({ ...f, enabled: v }))}
          />
        </div>

        {/* mode */}
        <div className="py-3 border-t border-ink-100">
          <p className="text-sm font-semibold text-ink-900 mb-2">How it works</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              {
                id: "suggest",
                title: "Suggest",
                desc: "Rate changes wait for your approval on the Today screen.",
              },
              {
                id: "auto",
                title: "Automatic",
                desc: "Botlify applies rate changes for you, within your limits.",
              },
            ].map((opt) => {
              const active = form.mode === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, mode: opt.id }))}
                  disabled={!form.enabled}
                  className={`text-left rounded-lg border p-3.5 transition disabled:opacity-50 ${
                    active
                      ? "border-brand-400 bg-brand-50 ring-1 ring-brand-200"
                      : "border-ink-200 hover:border-ink-300"
                  }`}
                >
                  <span className="flex items-center gap-1.5 text-sm font-bold text-ink-900">
                    {active && <Check className="w-3.5 h-3.5 text-brand-600" />}
                    {opt.title}
                  </span>
                  <span className="block text-xs text-ink-500 mt-1">
                    {opt.desc}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-ink-500 mt-2">
            Suggestions need your approval — nothing changes until you tap
            Approve on the Today screen.
          </p>
        </div>

        {/* guard rails */}
        <div className="py-3 border-t border-ink-100">
          <p className="text-sm font-semibold text-ink-900 mb-2">
            Never price outside this range
          </p>
          <div className="flex flex-wrap gap-3">
            <div>
              <label className="label text-xs" htmlFor="minRate">
                Lowest rate ({currency})
              </label>
              <input
                id="minRate"
                type="number"
                min="0"
                step="1"
                value={form.minRate}
                disabled={!form.enabled}
                onChange={(e) =>
                  setForm((f) => ({ ...f, minRate: e.target.value }))
                }
                className="input py-2 w-36"
              />
            </div>
            <div>
              <label className="label text-xs" htmlFor="maxRate">
                Highest rate ({currency})
              </label>
              <input
                id="maxRate"
                type="number"
                min="0"
                step="1"
                value={form.maxRate}
                disabled={!form.enabled}
                onChange={(e) =>
                  setForm((f) => ({ ...f, maxRate: e.target.value }))
                }
                className="input py-2 w-36"
              />
            </div>
          </div>
          <p className="text-xs text-ink-500 mt-2">
            Leave a field at 0 for no limit on that side.
          </p>
        </div>

        <div className="pt-4 border-t border-ink-100 flex justify-end">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="btn-primary"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save pricing
          </button>
        </div>
      </div>

      <DirectBookingLink property={property} />
    </div>
  );
}
