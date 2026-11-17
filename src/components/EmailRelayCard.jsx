/**
 * EmailRelayCard — Expedia & Trip.com guest messages via email relay.
 *
 * Shows the hotel's own Botlify inbound address and the one-time step: paste
 * it as the guest-message email in Expedia Partner Central and Trip.com
 * eBooking. From then on guest messages land in Messages and the AI answers
 * (replies reach the guest inside the Expedia / Trip.com app).
 *
 * GET /hotel/email-relay → { configured, address, lastMessage }
 */
import { useEffect, useState } from "react";
import { Check, Copy, Mail } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/services/api";
import OtaLogo from "@/components/OtaLogo";

const STEPS = [
  {
    key: "expedia",
    name: "Expedia",
    text: "Expedia Partner Central → Property details → Contacts → set the reservations / guest-messages email to your Botlify address.",
  },
  {
    key: "trip",
    name: "Trip.com",
    text: "Trip.com eBooking → Settings → Contact information → set the email for guest messages to your Botlify address.",
  },
];

export default function EmailRelayCard() {
  const [data, setData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;
    api
      .get("/hotel/email-relay")
      .then(({ data }) => alive && setData(data))
      .catch(() => alive && setData({ configured: false }));
    return () => {
      alive = false;
    };
  }, []);

  if (!data || data.configured === false || !data.address) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(data.address);
      setCopied(true);
      toast.success("Address copied");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Couldn't copy — select the address and copy it manually");
    }
  };

  return (
    <section className="rounded-2xl bg-white ring-1 ring-black/[0.08] p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#0A0A0A] text-[#FF5A1F]">
          <Mail className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h3 className="font-geist text-lg font-semibold tracking-tight text-[#0A0A0A]">
            Expedia &amp; Trip.com guest messages
          </h3>
          <p className="mt-1 text-sm text-ink-600">
            Paste this address once in each site. Guest messages then arrive in Messages and your AI
            answers — replies reach the guest inside the Expedia or Trip.com app, usually within a few
            minutes.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <code className="min-w-0 flex-1 truncate rounded-xl bg-[#FFF1EA] px-4 py-3 font-mono text-sm text-[#0A0A0A] ring-1 ring-[#FF5A1F]/25">
          {data.address}
        </code>
        <button
          type="button"
          onClick={copy}
          className="btn inline-flex min-h-[44px] items-center justify-center gap-2 bg-[#FF5A1F] px-4 text-white hover:bg-[#E84A12]"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy address"}
        </button>
      </div>

      <ol className="mt-5 grid gap-3 sm:grid-cols-2">
        {STEPS.map((s, i) => (
          <li key={s.key} className="flex gap-3 rounded-xl bg-ink-50 p-4 ring-1 ring-black/[0.05]">
            <OtaLogo channelKey={s.key} size={28} />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#0A0A0A]">
                {i + 1}. {s.name}
              </p>
              <p className="mt-0.5 text-[13px] leading-relaxed text-ink-600">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-4 text-xs text-ink-500">
        {data.lastMessage
          ? `Working — last guest message received ${new Date(data.lastMessage.lastMessageAt).toLocaleString()}.`
          : "Waiting for the first guest message through this address."}{" "}
        Flight + hotel package bookings on Trip.com don't include guest contact, so those guests can only be
        reached through Trip.com.
      </p>
    </section>
  );
}
