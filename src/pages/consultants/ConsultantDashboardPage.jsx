/**
 * Consultant dashboard — /dashboard/consultant
 * No profile → application form. Pending → waiting state. Approved →
 * referral code, stats, referred hotels, earnings ledger and payout editor.
 */
import { useEffect, useState, useCallback } from "react";
import api from "@/services/api";
import toast from "react-hot-toast";
import {
  Banknote,
  Building2,
  CheckCircle2,
  Clock,
  Copy,
  HandCoins,
  Hourglass,
  Loader2,
  Save,
  XCircle,
} from "lucide-react";

const input =
  "w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 outline-none";
const label = "block text-xs font-semibold text-ink-600 mb-1";

const ENTRY_STATUS = {
  accrued: "bg-amber-50 text-amber-700 border-amber-200",
  verified: "bg-blue-50 text-blue-700 border-blue-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  reversed: "bg-rose-50 text-rose-600 border-rose-200",
};

const money = (a, c) =>
  `${c || "USD"} ${Number(a || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export default function ConsultantDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null); // {consultant, stats, entries} or null
  const [hotels, setHotels] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/consultants/me");
      setMe(data);
      if (data?.consultant?.status === "approved") {
        api
          .get("/consultants/me/hotels")
          .then(({ data: h }) => setHotels(h.hotels || []))
          .catch(() => {});
      }
    } catch (e) {
      // 404 = no consultant profile yet → show the application form.
      setMe(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-7 h-7 text-brand-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl bg-brand-500/10 flex items-center justify-center">
          <HandCoins className="w-6 h-6 text-brand-500" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-ink-900">
            Consultant Program
          </h1>
          <p className="text-sm text-ink-500">
            Earn 20% of Botlify's revenue from every hotel you sign — for 12
            months.
          </p>
        </div>
      </div>

      {!me?.consultant ? (
        <ApplicationForm onApplied={load} />
      ) : me.consultant.status === "pending" ? (
        <PendingState />
      ) : me.consultant.status === "suspended" ? (
        <SuspendedState />
      ) : (
        <ApprovedDashboard me={me} hotels={hotels} onChanged={load} />
      )}
    </div>
  );
}

/* ── Application ────────────────────────────────────────────────────── */
function ApplicationForm({ onApplied }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    country: "",
    city: "",
    bankName: "",
    accountName: "",
    accountNumber: "",
  });
  const patch = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.fullName.trim()) return toast.error("Your full name is required");
    if (!form.phone.trim()) return toast.error("Your phone number is required");
    setSaving(true);
    try {
      await api.post("/consultants/apply", {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        country: form.country.trim(),
        city: form.city.trim(),
        payout: {
          bankName: form.bankName.trim(),
          accountName: form.accountName.trim(),
          accountNumber: form.accountNumber.trim(),
        },
      });
      toast.success("Application submitted!");
      onApplied();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Couldn't submit application");
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl">
      <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-5 mb-5">
        <p className="font-bold text-ink-900">How it works</p>
        <ul className="mt-2 space-y-1.5 text-sm text-ink-600">
          <li>1. Apply below — we approve consultants within a day or two.</li>
          <li>2. You get a personal referral code.</li>
          <li>
            3. Hotels enter your code when they sign up — you earn 20% of what
            Botlify makes from them for 12 months, paid monthly.
          </li>
        </ul>
      </div>

      <div className="rounded-2xl border border-ink-100 bg-white p-5 space-y-3">
        <p className="font-bold text-ink-900">Apply to join</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <span className={label}>Full name</span>
            <input
              value={form.fullName}
              onChange={(e) => patch("fullName", e.target.value)}
              className={input}
            />
          </div>
          <div>
            <span className={label}>Phone (WhatsApp)</span>
            <input
              value={form.phone}
              onChange={(e) => patch("phone", e.target.value)}
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
            <span className={label}>City</span>
            <input
              value={form.city}
              onChange={(e) => patch("city", e.target.value)}
              className={input}
            />
          </div>
        </div>
        <p className="text-xs font-bold uppercase tracking-wide text-ink-400 pt-2">
          Payout details
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <span className={label}>Bank name</span>
            <input
              value={form.bankName}
              onChange={(e) => patch("bankName", e.target.value)}
              className={input}
            />
          </div>
          <div>
            <span className={label}>Account name</span>
            <input
              value={form.accountName}
              onChange={(e) => patch("accountName", e.target.value)}
              className={input}
            />
          </div>
          <div className="sm:col-span-2">
            <span className={label}>Account number / IBAN</span>
            <input
              value={form.accountNumber}
              onChange={(e) => patch("accountNumber", e.target.value)}
              className={input}
            />
          </div>
        </div>
        <button
          onClick={submit}
          disabled={saving}
          className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl px-5 py-3 transition disabled:opacity-60"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          Submit application
        </button>
      </div>
    </div>
  );
}

function PendingState() {
  return (
    <div className="max-w-md mx-auto text-center rounded-2xl border border-amber-200 bg-amber-50/60 p-8">
      <Hourglass className="w-10 h-10 text-amber-500 mx-auto mb-3" />
      <p className="font-black text-ink-900 text-lg">Application received</p>
      <p className="text-sm text-ink-600 mt-2">
        We're reviewing your application — you'll get your referral code as soon
        as it's approved, usually within 1–2 days.
      </p>
    </div>
  );
}

function SuspendedState() {
  return (
    <div className="max-w-md mx-auto text-center rounded-2xl border border-rose-200 bg-rose-50/60 p-8">
      <XCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
      <p className="font-black text-ink-900 text-lg">Account suspended</p>
      <p className="text-sm text-ink-600 mt-2">
        Your consultant account is currently suspended. If you think this is a
        mistake, email contactus@botlify.site.
      </p>
    </div>
  );
}

/* ── Approved dashboard ─────────────────────────────────────────────── */
function ApprovedDashboard({ me, hotels, onChanged }) {
  const { consultant, stats, entries = [] } = me;
  const byCurrency = stats?.byCurrency || [];

  const copyCode = () => {
    navigator.clipboard
      .writeText(consultant.code)
      .then(() => toast.success("Code copied!"))
      .catch(() => toast.error("Couldn't copy"));
  };

  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "—";

  return (
    <div className="space-y-6">
      {/* Referral code hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ink-900 to-ink-800 text-white p-6 sm:p-8">
        <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-brand-500/30 blur-3xl" />
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-300">
          Your referral code
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <span className="text-3xl sm:text-5xl font-black tracking-widest font-mono">
            {consultant.code}
          </span>
          <button
            onClick={copyCode}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/15 rounded-lg px-3 py-2 transition"
          >
            <Copy className="w-3.5 h-3.5" /> Copy
          </button>
        </div>
        <p className="mt-3 text-sm text-white/60 max-w-lg">
          Hotels enter this code during sign-up. You earn 20% of Botlify's
          revenue from each one for 12 months — paid to your bank every month.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border border-ink-100 bg-white p-4">
          <div className="flex items-center gap-1.5 text-ink-400 text-xs font-semibold uppercase tracking-wide mb-1.5">
            <Building2 className="w-3.5 h-3.5" /> Hotels signed
          </div>
          <p className="text-2xl font-black text-ink-900">
            {stats?.hotelsSigned ?? hotels.length}
          </p>
        </div>
        {["accrued", "verified", "paid"].map((k) => (
          <div key={k} className="rounded-xl border border-ink-100 bg-white p-4">
            <div className="flex items-center gap-1.5 text-ink-400 text-xs font-semibold uppercase tracking-wide mb-1.5">
              {k === "paid" ? (
                <Banknote className="w-3.5 h-3.5" />
              ) : k === "verified" ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <Clock className="w-3.5 h-3.5" />
              )}
              {k}
            </div>
            {byCurrency.length === 0 ? (
              <p className="text-2xl font-black text-ink-900">0</p>
            ) : (
              byCurrency.map((c) => (
                <p key={c.currency} className="text-lg font-black text-ink-900 leading-tight">
                  {money(c[k], c.currency)}
                </p>
              ))
            )}
          </div>
        ))}
      </div>

      {/* Referred hotels */}
      <div className="rounded-2xl border border-ink-100 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-ink-100">
          <p className="font-bold text-ink-900">Your hotels</p>
        </div>
        {hotels.length === 0 ? (
          <p className="px-5 py-8 text-sm text-ink-400 text-center">
            No hotels signed up with your code yet — go get them!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-ink-400 border-b border-ink-100">
                  <th className="px-4 py-2.5">Hotel</th>
                  <th className="px-4 py-2.5">Signed up</th>
                  <th className="px-4 py-2.5">Plan</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {hotels.map((h, i) => (
                  <tr key={i} className="border-b border-ink-50">
                    <td className="px-4 py-2.5 font-semibold text-ink-900">
                      {h.name}
                    </td>
                    <td className="px-4 py-2.5 text-ink-500">
                      {fmtDate(h.attributedAt)}
                    </td>
                    <td className="px-4 py-2.5 text-ink-700 capitalize">
                      {h.plan || "—"}
                    </td>
                    <td className="px-4 py-2.5 text-ink-500 capitalize">
                      {h.status || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Earnings ledger */}
      <div className="rounded-2xl border border-ink-100 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-ink-100">
          <p className="font-bold text-ink-900">Earnings</p>
        </div>
        {entries.length === 0 ? (
          <p className="px-5 py-8 text-sm text-ink-400 text-center">
            Your commission entries will appear here each month.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-ink-400 border-b border-ink-100">
                  <th className="px-4 py-2.5">Period</th>
                  <th className="px-4 py-2.5">Hotel</th>
                  <th className="px-4 py-2.5">Type</th>
                  <th className="px-4 py-2.5">Amount</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e, i) => (
                  <tr key={e._id || i} className="border-b border-ink-50">
                    <td className="px-4 py-2.5 font-mono text-xs text-ink-700">
                      {e.period || fmtDate(e.createdAt)}
                    </td>
                    <td className="px-4 py-2.5 text-ink-700">
                      {e.workspaceName || e.workspace?.name || e.workspaceId?.name || "—"}
                    </td>
                    <td className="px-4 py-2.5 text-ink-500 capitalize">
                      {(e.revenueType || "").replace("_", " ")}
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-ink-900">
                      {money(e.amount, e.currency)}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${ENTRY_STATUS[e.status] || ENTRY_STATUS.accrued}`}
                      >
                        {e.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payout editor */}
      <PayoutEditor consultant={consultant} onChanged={onChanged} />
    </div>
  );
}

function PayoutEditor({ consultant, onChanged }) {
  const [saving, setSaving] = useState(false);
  const [p, setP] = useState(consultant.payout || {});
  useEffect(() => setP(consultant.payout || {}), [consultant]);
  const patch = (k, v) => setP((x) => ({ ...x, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await api.put("/consultants/me", { payout: p });
      toast.success("Payout details saved");
      onChanged();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5">
      <p className="font-bold text-ink-900 mb-3 flex items-center gap-1.5">
        <Banknote className="w-4 h-4 text-brand-500" /> Payout details
      </p>
      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <span className={label}>Bank name</span>
          <input
            value={p.bankName || ""}
            onChange={(e) => patch("bankName", e.target.value)}
            className={input}
          />
        </div>
        <div>
          <span className={label}>Account name</span>
          <input
            value={p.accountName || ""}
            onChange={(e) => patch("accountName", e.target.value)}
            className={input}
          />
        </div>
        <div>
          <span className={label}>Account number / IBAN</span>
          <input
            value={p.accountNumber || ""}
            onChange={(e) => patch("accountNumber", e.target.value)}
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
          Save payout details
        </button>
      </div>
    </div>
  );
}
