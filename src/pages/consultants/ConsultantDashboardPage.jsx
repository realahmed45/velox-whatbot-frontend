/**
 * Consultant dashboard — /dashboard/consultant
 * No profile → application form. Pending → waiting state. Approved →
 * referral code, stats, referred hotels, earnings ledger and payout editor.
 */
import { useEffect, useState, useCallback } from "react";
import api from "@/services/api";
import { PAYOUT_CHANNELS, channelLabel } from "@/data/payoutChannels";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { Magnetic, NumberTicker, Reveal, RevealGroup, Spotlight } from "@/components/fx";
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

const input = "input";
const label = "label";

const ENTRY_STATUS = {
  accrued: "badge-yellow",
  verified: "badge-blue",
  paid: "badge-green",
  reversed: "badge-red",
};

const hop =
  "transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]";

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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6" aria-busy="true">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-ink-900/[0.06] animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-56 rounded-lg bg-ink-900/[0.06] animate-pulse" />
            <div className="h-4 w-72 max-w-[60vw] rounded bg-ink-900/[0.06] animate-pulse" />
          </div>
        </div>
        <div className="card h-40 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="card h-24 animate-pulse" />
          ))}
        </div>
        <Loader2 className="sr-only" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-10">
      <Reveal y={14} className="group flex items-start sm:items-center gap-3 mb-6 sm:mb-8">
        <div className="relative shrink-0">
          <span aria-hidden className="absolute inset-0 rounded-xl bg-sunset opacity-40 blur-lg" />
          <div className={`relative w-11 h-11 rounded-xl bg-sunset text-white flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] ${hop}`}>
            <HandCoins className="w-5 h-5" strokeWidth={1.8} />
          </div>
        </div>
        <div className="min-w-0">
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-ink-900">
            Consultant{" "}
            <span className="font-serif italic font-normal">Program</span>
          </h1>
          <p className="text-sm text-ink-500 mt-0.5">
            Earn 20% of Botlify's revenue from every hotel you sign — for 12
            months.
          </p>
        </div>
      </Reveal>

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
    channelCode: "",
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
          channelCode: form.channelCode,
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
      <Reveal y={16}>
      <div className="relative overflow-hidden rounded-2xl bg-sunset-soft ring-1 ring-sunset-flame/15 p-5 mb-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
        <p className="font-display font-semibold tracking-[-0.01em] text-ink-900">How it works</p>
        <ul className="mt-3 space-y-2.5 text-sm text-ink-600">
          {[
            "Apply below — we approve consultants within a day or two.",
            "You get a personal referral code.",
            "Hotels enter your code when they sign up — you earn 20% of what Botlify makes from them for 12 months, paid automatically to your bank or e-wallet every month.",
          ].map((t, i) => (
            <li key={i} className="flex gap-2.5">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-sunset text-[11px] font-bold text-white tabular-nums shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
                {i + 1}
              </span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>
      </Reveal>

      <Reveal y={16} delay={0.06}>
      <div className="card p-5 space-y-3">
        <p className="font-display font-semibold tracking-[-0.01em] text-ink-900">Apply to join</p>
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
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-400 pt-3">
          Payout details
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <span className={label}>Bank or e-wallet</span>
            <select
              value={form.channelCode}
              onChange={(e) =>
                setForm((f) => ({ ...f, channelCode: e.target.value, bankName: channelLabel(e.target.value) }))
              }
              className={input}
            >
              <option value="">Choose…</option>
              {PAYOUT_CHANNELS.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
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
          className="btn-primary w-full mt-3 py-3"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          Submit application
        </button>
      </div>
      </Reveal>
    </div>
  );
}

function PendingState() {
  return (
    <Reveal y={16} className="max-w-md mx-auto text-center card ring-1 ring-amber-500/20 p-8">
      <div className="relative mx-auto mb-4 w-fit">
        <span aria-hidden className="absolute inset-0 rounded-2xl bg-amber-400 opacity-30 blur-2xl" />
        <motion.span
          className="relative grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-amber-500 ring-1 ring-amber-500/20"
          animate={{ rotate: [0, 180, 180, 360] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", times: [0, 0.2, 0.5, 0.7] }}
        >
          <Hourglass className="w-7 h-7" strokeWidth={1.8} />
        </motion.span>
      </div>
      <p className="font-display font-semibold tracking-[-0.02em] text-ink-900 text-lg">Application received</p>
      <p className="text-sm text-ink-600 mt-2">
        We're reviewing your application — you'll get your referral code as soon
        as it's approved, usually within 1–2 days.
      </p>
    </Reveal>
  );
}

function SuspendedState() {
  return (
    <Reveal y={16} className="max-w-md mx-auto text-center card ring-1 ring-rose-500/20 p-8">
      <div className="relative mx-auto mb-4 w-fit">
        <span aria-hidden className="absolute inset-0 rounded-2xl bg-rose-400 opacity-25 blur-2xl" />
        <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-500 ring-1 ring-rose-500/20">
          <XCircle className="w-7 h-7" strokeWidth={1.8} />
        </span>
      </div>
      <p className="font-display font-semibold tracking-[-0.02em] text-ink-900 text-lg">Account suspended</p>
      <p className="text-sm text-ink-600 mt-2">
        Your consultant account is currently suspended. If you think this is a
        mistake, email contactus@botlify.site.
      </p>
    </Reveal>
  );
}

/* ── Approved dashboard ─────────────────────────────────────────────── */
function ApprovedDashboard({ me, hotels, onChanged }) {
  const { consultant, stats, entries = [] } = me;
  const byCurrency = stats?.byCurrency || [];

  const [copied, setCopied] = useState(false);
  const copyCode = () => {
    navigator.clipboard
      .writeText(consultant.code)
      .then(() => {
        toast.success("Code copied!");
        // Visual-only tick on the button; resets on its own.
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      })
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
      <Reveal y={18}>
      <Spotlight className="relative isolate overflow-hidden rounded-3xl bg-night-950 text-white p-6 sm:p-8 shadow-[0_30px_60px_-30px_rgba(124,92,255,0.55),inset_0_1px_0_rgba(255,255,255,0.1)] ring-1 ring-white/10 grain">
        <div className="pointer-events-none absolute -top-20 -right-16 w-64 h-64 rounded-full bg-sunset-magenta/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-10 w-64 h-64 rounded-full bg-sunset-violet/35 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-dot-grid-dark opacity-60 mask-fade-b" />
        <p className="relative text-[11px] font-semibold uppercase tracking-[0.18em] text-sunset-gold">
          Your referral code
        </p>
        <div className="relative mt-2 flex flex-wrap items-center gap-3">
          <span className="text-3xl sm:text-5xl font-bold tracking-[0.18em] font-mono break-all bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
            {consultant.code}
          </span>
          <Magnetic strength={0.3}>
            <button
              onClick={copyCode}
              className="btn-glass-dark text-xs px-3.5 py-2"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={copied ? "ok" : "copy"}
                  initial={{ scale: 0.4, opacity: 0, rotate: -20 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 24 }}
                  className="flex"
                >
                  {copied ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </motion.span>
              </AnimatePresence>
              Copy
            </button>
          </Magnetic>
        </div>
        <p className="relative mt-3 text-sm text-white/60 max-w-lg">
          Hotels enter this code during sign-up. You earn 20% of Botlify's
          revenue from each one for 12 months — paid to your bank every month.
        </p>
      </Spotlight>
      </Reveal>

      {/* Stats */}
      <RevealGroup step={0.06} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Spotlight className="group card p-4 sm:p-5 h-full">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[13px] text-ink-500">Hotels signed</span>
            <span className={`grid h-8 w-8 place-items-center rounded-xl bg-sunset-soft text-sunset-flame ${hop}`}>
              <Building2 className="w-4 h-4" strokeWidth={1.8} />
            </span>
          </div>
          <p className="font-display text-3xl font-semibold tracking-[-0.03em] text-ink-900">
            <NumberTicker value={Number(stats?.hotelsSigned ?? hotels.length) || 0} />
          </p>
        </Spotlight>
        {["accrued", "verified", "paid"].map((k) => (
          <Spotlight key={k} className="group card p-4 sm:p-5 h-full">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[13px] text-ink-500 capitalize">{k}</span>
              <span
                className={`grid h-8 w-8 place-items-center rounded-xl ${hop} ${
                  k === "paid"
                    ? "bg-emerald-50 text-emerald-600"
                    : k === "verified"
                      ? "bg-sky-50 text-sky-600"
                      : "bg-amber-50 text-amber-600"
                }`}
              >
                {k === "paid" ? (
                  <Banknote className="w-4 h-4" strokeWidth={1.8} />
                ) : k === "verified" ? (
                  <CheckCircle2 className="w-4 h-4" strokeWidth={1.8} />
                ) : (
                  <Clock className="w-4 h-4" strokeWidth={1.8} />
                )}
              </span>
            </div>
            {byCurrency.length === 0 ? (
              <p className="font-display text-3xl font-semibold tracking-[-0.03em] text-ink-900 tabular-nums">0</p>
            ) : (
              byCurrency.map((c) => (
                <p key={c.currency} className="font-display text-lg sm:text-xl font-semibold tracking-[-0.02em] text-ink-900 leading-tight tabular-nums break-words">
                  {money(c[k], c.currency)}
                </p>
              ))
            )}
          </Spotlight>
        ))}
      </RevealGroup>

      {/* Referred hotels */}
      <Reveal y={16}>
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-ink-900/[0.06] flex items-center gap-2">
          <Building2 className="w-4 h-4 text-sunset-flame" strokeWidth={1.8} />
          <p className="font-display font-semibold tracking-[-0.01em] text-ink-900">Your hotels</p>
        </div>
        {hotels.length === 0 ? (
          <EmptyRow icon={Building2}>
            No hotels signed up with your code yet — go get them!
          </EmptyRow>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-400 border-b border-ink-900/[0.06] bg-white/70 backdrop-blur">
                  <th className="px-4 py-3 whitespace-nowrap">Hotel</th>
                  <th className="px-4 py-3 whitespace-nowrap">Signed up</th>
                  <th className="px-4 py-3 whitespace-nowrap">Plan</th>
                  <th className="px-4 py-3 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-900/[0.06]">
                {hotels.map((h, i) => (
                  <tr key={i} className="hover:bg-white/80 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap font-semibold text-ink-900">
                      {h.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-ink-500">
                      {fmtDate(h.attributedAt)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-ink-700 capitalize">
                      {h.plan || "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-ink-500 capitalize">
                      {h.status || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </Reveal>

      {/* Earnings ledger */}
      <Reveal y={16}>
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-ink-900/[0.06] flex items-center gap-2">
          <HandCoins className="w-4 h-4 text-sunset-flame" strokeWidth={1.8} />
          <p className="font-display font-semibold tracking-[-0.01em] text-ink-900">Earnings</p>
        </div>
        {entries.length === 0 ? (
          <EmptyRow icon={HandCoins}>
            Your commission entries will appear here each month.
          </EmptyRow>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-400 border-b border-ink-900/[0.06] bg-white/70 backdrop-blur">
                  <th className="px-4 py-3 whitespace-nowrap">Period</th>
                  <th className="px-4 py-3 whitespace-nowrap">Hotel</th>
                  <th className="px-4 py-3 whitespace-nowrap">Type</th>
                  <th className="px-4 py-3 whitespace-nowrap">Amount</th>
                  <th className="px-4 py-3 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-900/[0.06]">
                {entries.map((e, i) => (
                  <tr key={e._id || i} className="hover:bg-white/80 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-ink-700">
                      {e.period || fmtDate(e.createdAt)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-ink-700">
                      {e.workspaceName || e.workspace?.name || e.workspaceId?.name || "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-ink-500 capitalize">
                      {(e.revenueType || "").replace("_", " ")}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-semibold text-ink-900">
                      {money(e.amount, e.currency)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`capitalize ${ENTRY_STATUS[e.status] || ENTRY_STATUS.accrued}`}
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
      </Reveal>

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
    <Reveal y={16}>
    <div className="card p-5">
      <p className="font-display font-semibold tracking-[-0.01em] text-ink-900 mb-4 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-sunset-soft text-sunset-flame">
          <Banknote className="w-4 h-4" strokeWidth={1.8} />
        </span>
        Payout details
      </p>
      <p className="text-sm text-ink-500 -mt-2 mb-4">
        Your commission is paid automatically every month to this account.
      </p>
      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <span className={label}>Bank or e-wallet</span>
          <select
            value={p.channelCode || ""}
            onChange={(e) =>
              setP((x) => ({ ...x, channelCode: e.target.value, bankName: channelLabel(e.target.value) }))
            }
            className={input}
          >
            <option value="">Choose…</option>
            {PAYOUT_CHANNELS.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
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
          <span className={label}>Account / phone number</span>
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
          className="btn-primary w-full sm:w-auto"
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
    </Reveal>
  );
}

function EmptyRow({ icon: Icon, children }) {
  return (
    <div className="flex flex-col items-center text-center px-6 py-10">
      <div className="relative mb-3">
        <span aria-hidden className="absolute inset-0 rounded-2xl bg-sunset opacity-20 blur-2xl" />
        <span className="relative grid h-11 w-11 place-items-center rounded-2xl bg-sunset-soft text-sunset-flame">
          <Icon className="w-5 h-5" strokeWidth={1.8} />
        </span>
      </div>
      <p className="text-sm text-ink-500 max-w-xs">{children}</p>
    </div>
  );
}
