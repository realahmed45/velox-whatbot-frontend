/**
 * Settings → Guest payments.
 *
 * The hotel opens a payment account under Botlify (Xendit). Once Xendit has
 * verified the business, guests who book through the AI get a secure payment
 * link (QRIS, bank transfer, e-wallets, cards). The money lands in the hotel's
 * account with Botlify's fee taken off automatically.
 */
import { useEffect, useState } from "react";
import api from "@/services/api";
import toast from "react-hot-toast";
import {
  Loader2,
  CheckCircle2,
  Clock,
  RefreshCw,
  Link2,
  Copy,
  ShieldCheck,
  Wallet,
} from "lucide-react";

const STATUS = {
  INVITED: { label: "Check your email", tone: "amber", text: "Xendit has emailed you an invite. Open it and set a password to continue." },
  REGISTERED: { label: "Verification needed", tone: "amber", text: "Log in to Xendit and upload your business documents (KTP, NPWP, bank account)." },
  AWAITING_DOCS: { label: "Verification needed", tone: "amber", text: "Xendit is waiting for your business documents. Log in to Xendit to finish." },
  LIVE: { label: "Live", tone: "green", text: "Guests can pay online. Money goes straight to your Xendit account." },
  SUSPENDED: { label: "Suspended", tone: "red", text: "Xendit has paused this account. Contact Botlify support." },
};

const pct = (r) => `${Math.round(Number(r || 0) * 1000) / 10}%`;

export default function PaymentsSettings() {
  const [s, setS] = useState(null);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState("");
  const [link, setLink] = useState({ amount: "", description: "" });
  const [lastLink, setLastLink] = useState("");

  const load = async () => {
    try {
      const { data } = await api.get("/payments/status");
      setS(data);
    } catch {
      setS({ available: false });
    }
  };
  useEffect(() => {
    load();
  }, []);

  const run = async (key, fn) => {
    setBusy(key);
    try {
      await fn();
    } catch (e) {
      toast.error(e.response?.data?.message || "Something went wrong");
    } finally {
      setBusy("");
    }
  };

  if (!s) {
    return (
      <div className="flex items-center gap-2 text-neutral-500 text-[14px]">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </div>
    );
  }

  const st = STATUS[s.status] || null;
  const toneCls = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-800 border-amber-200",
    red: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <div className="max-w-3xl space-y-6 font-geist">
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-neutral-100">
            <Wallet className="h-5 w-5 text-[#0A0A0A]" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-[16px] font-semibold text-[#0A0A0A]">Take payments when your AI books</h3>
            <p className="text-[14px] text-neutral-500 mt-0.5">
              Guests get a secure link for QRIS, bank transfer, GoPay / OVO / DANA or card. The money goes into your own
              account; Botlify's fee is taken off automatically, so there's nothing to invoice.
            </p>
          </div>
        </div>

        {!s.available && (
          <p className="mt-4 rounded-xl bg-neutral-50 px-4 py-3 text-[14px] text-neutral-600">
            Online payments are being switched on for your region. Until then guests pay at the property.
          </p>
        )}

        {s.available && !s.connected && (
          <div className="mt-5 space-y-3">
            <label className="block text-[13px] font-medium text-neutral-700">Email for your payment account</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="finance@yourhotel.com"
                className="h-11 flex-1 rounded-xl border border-neutral-200 px-3.5 text-[14px] outline-none focus:border-neutral-400"
              />
              <button
                onClick={() =>
                  run("connect", async () => {
                    const { data } = await api.post("/payments/connect", { email });
                    setS(data);
                    toast.success(data.message || "Account created — check your email");
                  })
                }
                disabled={busy === "connect"}
                className="h-11 rounded-xl bg-[#0A0A0A] px-5 text-[14px] font-semibold text-white disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                {busy === "connect" && <Loader2 className="h-4 w-4 animate-spin" />}
                Set up payments
              </button>
            </div>
            <p className="text-[12.5px] text-neutral-500 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" /> Xendit (licensed by Bank Indonesia) will email you to verify your
              business. It takes about 1–3 working days.
            </p>
          </div>
        )}

        {s.connected && st && (
          <div className={`mt-5 rounded-xl border px-4 py-3 ${toneCls[st.tone]}`}>
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-[14px] font-semibold">
                {st.tone === "green" ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                {st.label}
              </span>
              {s.status !== "LIVE" && (
                <button
                  onClick={() =>
                    run("refresh", async () => {
                      const { data } = await api.post("/payments/refresh");
                      setS(data);
                    })
                  }
                  className="inline-flex items-center gap-1.5 text-[13px] font-medium underline-offset-2 hover:underline"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${busy === "refresh" ? "animate-spin" : ""}`} /> Check again
                </button>
              )}
            </div>
            <p className="text-[13.5px] mt-1 opacity-90">{st.text}</p>
            {s.email && <p className="text-[12.5px] mt-1 opacity-70">Account email: {s.email}</p>}
          </div>
        )}
      </div>

      {s.connected && (
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 sm:p-6 space-y-5">
          <h3 className="text-[16px] font-semibold text-[#0A0A0A]">How guests pay</h3>
          <label className="flex items-center justify-between gap-4">
            <span>
              <span className="block text-[14px] font-medium text-[#0A0A0A]">Send a payment link when the AI books</span>
              <span className="block text-[13px] text-neutral-500">Off = guests pay at the property.</span>
            </span>
            <input
              type="checkbox"
              checked={s.collectOnline}
              onChange={(e) =>
                run("collect", async () => {
                  const { data } = await api.patch("/payments/settings", { collectOnline: e.target.checked });
                  setS(data);
                })
              }
              className="h-5 w-5 accent-[#0A0A0A]"
            />
          </label>
          <div>
            <span className="block text-[14px] font-medium text-[#0A0A0A]">Amount taken online</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {[100, 50, 30].map((d) => (
                <button
                  key={d}
                  onClick={() =>
                    run("deposit", async () => {
                      const { data } = await api.patch("/payments/settings", { depositPercent: d });
                      setS(data);
                    })
                  }
                  className={`h-10 rounded-xl px-4 text-[13.5px] font-semibold border ${
                    s.depositPercent === d ? "bg-[#0A0A0A] text-white border-[#0A0A0A]" : "border-neutral-200 text-neutral-700"
                  }`}
                >
                  {d === 100 ? "Full amount" : `${d}% deposit`}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-xl bg-neutral-50 px-4 py-3 text-[13px] text-neutral-600 space-y-0.5">
            <p className="font-medium text-neutral-700">Botlify's fee (taken off automatically)</p>
            <p>Rooms booked by your AI: {pct(s.feeRates?.stays)} · Airport pickups by your drivers: {pct(s.feeRates?.pickups)} · Links you send yourself: {pct(s.feeRates?.links)}</p>
            <p>Bookings from Booking.com, Airbnb and other booking sites are never charged.</p>
          </div>
        </div>
      )}

      {s.live && (
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 sm:p-6 space-y-3">
          <h3 className="text-[16px] font-semibold text-[#0A0A0A] flex items-center gap-2">
            <Link2 className="h-4 w-4" /> Send a payment link
          </h3>
          <p className="text-[13.5px] text-neutral-500">For a deposit, an extra, or anything else. Paste the link in any chat.</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              inputMode="decimal"
              value={link.amount}
              onChange={(e) => setLink({ ...link, amount: e.target.value })}
              placeholder="Amount (IDR)"
              className="h-11 sm:w-40 rounded-xl border border-neutral-200 px-3.5 text-[14px] outline-none focus:border-neutral-400"
            />
            <input
              value={link.description}
              onChange={(e) => setLink({ ...link, description: e.target.value })}
              placeholder="What it's for — e.g. Late check-out"
              className="h-11 flex-1 rounded-xl border border-neutral-200 px-3.5 text-[14px] outline-none focus:border-neutral-400"
            />
            <button
              onClick={() =>
                run("link", async () => {
                  const { data } = await api.post("/payments/link", {
                    amount: Number(String(link.amount).replace(/[^\d.]/g, "")),
                    currency: "IDR",
                    description: link.description,
                  });
                  setLastLink(data.payment.url);
                  setLink({ amount: "", description: "" });
                })
              }
              disabled={busy === "link"}
              className="h-11 rounded-xl bg-[#0A0A0A] px-5 text-[14px] font-semibold text-white disabled:opacity-60 inline-flex items-center justify-center gap-2"
            >
              {busy === "link" && <Loader2 className="h-4 w-4 animate-spin" />}
              Create link
            </button>
          </div>
          {lastLink && (
            <div className="flex items-center gap-2 rounded-xl bg-neutral-50 px-3 py-2">
              <span className="truncate text-[13px] text-neutral-700 flex-1">{lastLink}</span>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(lastLink);
                  toast.success("Link copied");
                }}
                className="inline-flex items-center gap-1 text-[13px] font-semibold"
              >
                <Copy className="h-3.5 w-3.5" /> Copy
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
