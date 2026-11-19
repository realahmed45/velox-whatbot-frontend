/**
 * Admin → Money. Everything here runs on its own (payment webhooks, daily
 * driver payouts, monthly consultant payouts). This screen is for watching
 * it — and for running a payout batch early when needed.
 */
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Loader2, Play, RefreshCw } from "lucide-react";
import { channelLabel } from "@/data/payoutChannels";

const fmt = (cur, n) =>
  `${cur} ${Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: cur === "IDR" ? 0 : 2 })}`;
const when = (d) => (d ? new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—");
const badge = {
  paid: "badge-green",
  succeeded: "badge-green",
  pending: "badge-gray",
  processing: "badge-gray",
  expired: "badge-gray",
  failed: "badge-red",
  refunded: "badge-gray",
};

export default function AdminMoney({ client }) {
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState("");
  const [preview, setPreview] = useState(null);

  const load = async () => {
    const [p, o] = await Promise.all([client.get("/admin/payments"), client.get("/admin/payouts")]);
    setData({ ...p.data, payouts: o.data.payouts });
  };
  useEffect(() => {
    load().catch(() => setData({ payments: [], payouts: [], totals: [] }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const run = async (type, dryRun) => {
    setBusy(type + dryRun);
    try {
      const { data: r } = await client.post("/admin/payouts/run", { type, dryRun });
      if (dryRun) setPreview(r);
      else {
        toast.success(`${type} payouts: ${r.paid} sent, ${r.failed} failed, ${r.skipped.length} skipped`);
        setPreview(null);
        await load();
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Couldn't run payouts");
    } finally {
      setBusy("");
    }
  };

  if (!data) return <div className="card p-6 text-ink-400 flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>;

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-3">
        {(data.totals.length ? data.totals : [{ _id: "IDR", volume: 0, fees: 0, count: 0 }]).map((t) => (
          <div key={t._id} className="card p-4">
            <p className="text-xs uppercase tracking-wide text-ink-400">Paid through Botlify ({t._id})</p>
            <p className="font-display text-xl font-semibold text-ink-900 mt-1">{fmt(t._id, t.volume)}</p>
            <p className="text-sm text-ink-500">{t.count} payments · Botlify earned {fmt(t._id, t.fees)}</p>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <p className="font-display font-semibold text-ink-900">Payouts</p>
            <p className="text-sm text-ink-500">Drivers are paid daily, consultants on the 5th — automatically.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {["driver", "consultant"].map((t) => (
              <span key={t} className="inline-flex gap-1">
                <button onClick={() => run(t, true)} disabled={!!busy} className="btn-ghost">
                  {busy === t + "true" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  Preview {t}s
                </button>
                <button onClick={() => run(t, false)} disabled={!!busy} className="btn-primary">
                  {busy === t + "false" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  Pay {t}s now
                </button>
              </span>
            ))}
          </div>
        </div>
        {preview && (
          <div className="mb-3 rounded-xl bg-ink-900/[0.03] p-3 text-sm text-ink-700">
            <p className="font-semibold">
              {preview.type} preview: {preview.paid} ready · {Object.entries(preview.total).map(([c, a]) => fmt(c, a)).join(", ") || "nothing to pay"}
            </p>
            {preview.skipped.map((s, i) => (
              <p key={i} className="text-ink-500">Skipped {s.name || s.who || ""}: {s.reason}</p>
            ))}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-ink-500 border-b border-ink-900/[0.06]">
                <th className="px-3 py-2">When</th><th className="px-3 py-2">Who</th><th className="px-3 py-2">Amount</th><th className="px-3 py-2">To</th><th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.payouts.map((p) => (
                <tr key={p._id} className="border-b border-ink-900/[0.04]">
                  <td className="px-3 py-2 text-ink-500">{when(p.createdAt)}</td>
                  <td className="px-3 py-2">{p.recipientName} <span className="text-ink-400">({p.recipientType})</span></td>
                  <td className="px-3 py-2 tabular-nums">{fmt(p.currency, p.amount)}</td>
                  <td className="px-3 py-2 text-ink-500">{channelLabel(p.channelCode)} ···{String(p.accountNumber).slice(-4)}</td>
                  <td className="px-3 py-2"><span className={badge[p.status] || "badge-gray"}>{p.status}</span>{p.failureReason && <span className="block text-xs text-rose-600">{p.failureReason}</span>}</td>
                </tr>
              ))}
              {!data.payouts.length && <tr><td colSpan={5} className="px-3 py-8 text-center text-ink-400">No payouts yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-5">
        <p className="font-display font-semibold text-ink-900 mb-3">Guest payments</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-ink-500 border-b border-ink-900/[0.06]">
                <th className="px-3 py-2">When</th><th className="px-3 py-2">Hotel</th><th className="px-3 py-2">For</th><th className="px-3 py-2">Amount</th><th className="px-3 py-2">Botlify</th><th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.payments.map((p) => (
                <tr key={p._id} className="border-b border-ink-900/[0.04]">
                  <td className="px-3 py-2 text-ink-500">{when(p.createdAt)}</td>
                  <td className="px-3 py-2">{p.workspaceId?.name || "—"}</td>
                  <td className="px-3 py-2 text-ink-600">{p.description}</td>
                  <td className="px-3 py-2 tabular-nums">{fmt(p.currency, p.amount)}</td>
                  <td className="px-3 py-2 tabular-nums">{fmt(p.currency, p.platformFee)}</td>
                  <td className="px-3 py-2"><span className={badge[p.status] || "badge-gray"}>{p.status}</span>{p.method && <span className="block text-xs text-ink-400">{p.method}</span>}</td>
                </tr>
              ))}
              {!data.payments.length && <tr><td colSpan={6} className="px-3 py-8 text-center text-ink-400">No guest payments yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
