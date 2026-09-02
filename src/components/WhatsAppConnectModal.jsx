/**
 * WhatsAppConnectModal — the two paths a hotelier can take to WhatsApp.
 *
 * There are only ever two kinds of hotel:
 *   A. Their number is already on WhatsApp (the common case). They keep the
 *      number and their phone; the AI answers alongside them. Coexistence
 *      needs the free WhatsApp Business app, so we say so plainly and tell
 *      them what the Facebook screen will ask for — no surprises.
 *      → GET /channels/whatsapp/connect?from=… then window.location = url
 *   B. That number has no WhatsApp. We provision a dedicated number for
 *      bookings, live immediately.
 *      → GET  /channels/whatsapp/number-options        → { countries }
 *        GET  /channels/whatsapp/number-options?country=XX → { numbers }
 *        POST /channels/whatsapp/number { country, numberType?, areaCode? }
 *             → { phoneNumber, webhookError } | { kycRequired, kycUrl, message }
 *
 * Presented with the same treatment as the Telegram pairing modal and the
 * FacebookPagePicker: full-width bottom sheet on mobile, centred card on
 * desktop, ink-950/50 backdrop.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import api from "@/services/api";
import { WhatsAppMark } from "@/components/ChannelMarks";

/* Some countries ship a price on the country row, some only on the number
   rows. Format whatever we get without inventing a currency. */
function priceLabel(amount, currency) {
  if (amount === null || amount === undefined || amount === "") return null;
  const n = Number(amount);
  if (!Number.isFinite(n)) return `${amount} ${currency || ""}`.trim();
  return `${(currency || "USD").toUpperCase()} ${n.toFixed(2)}/mo`;
}

export default function WhatsAppConnectModal({ from = "channels", onClose }) {
  // "choose" → the two paths; "buy" → country + number picker; "kyc" → the
  // identity-check outcome, which is information, not an error.
  const [view, setView] = useState("choose");
  const [redirecting, setRedirecting] = useState(false);
  const [showBusinessHelp, setShowBusinessHelp] = useState(false);

  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("");
  const [numbers, setNumbers] = useState([]);
  const [selected, setSelected] = useState(null);

  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingNumbers, setLoadingNumbers] = useState(false);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState(null);
  const [kyc, setKyc] = useState(null);

  const dialogRef = useRef(null);
  const previouslyFocused = useRef(null);

  /* Escape closes; focus moves into the dialog and returns on unmount. */
  useEffect(() => {
    previouslyFocused.current = document.activeElement;
    const els = dialogRef.current?.querySelectorAll(
      'button:not([disabled]), [href], select:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    (els?.[0] || dialogRef.current)?.focus?.();
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose?.();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previouslyFocused.current?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Path A ────────────────────────────────────────────────────────────────
  const startOauth = async () => {
    setRedirecting(true);
    setError(null);
    try {
      const { data } = await api.get("/channels/whatsapp/connect", {
        params: { from },
      });
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error("No connect URL returned");
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          "Couldn't start the WhatsApp connection. Please try again.",
      );
      setRedirecting(false);
    }
  };

  // ── Path B ────────────────────────────────────────────────────────────────
  const loadCountries = useCallback(async () => {
    setLoadingCountries(true);
    setError(null);
    try {
      const { data } = await api.get("/channels/whatsapp/number-options");
      const list = Array.isArray(data?.countries) ? data.countries : [];
      setCountries(list);
      // Indonesia first if the provider offers it — that's the home market.
      const preferred =
        list.find((c) => String(c.code).toUpperCase() === "ID") || list[0];
      if (preferred?.code) setCountry(String(preferred.code).toUpperCase());
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          "Couldn't load the countries we can give you a number in.",
      );
    } finally {
      setLoadingCountries(false);
    }
  }, []);

  const loadNumbers = useCallback(async (code) => {
    if (!code) return;
    setLoadingNumbers(true);
    setSelected(null);
    setNumbers([]);
    setError(null);
    try {
      const { data } = await api.get("/channels/whatsapp/number-options", {
        params: { country: code },
      });
      const list = Array.isArray(data?.numbers) ? data.numbers : [];
      setNumbers(list);
      if (list.length === 1) setSelected(list[0].phoneNumber);
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          "Couldn't load available numbers for that country.",
      );
    } finally {
      setLoadingNumbers(false);
    }
  }, []);

  const openBuy = () => {
    setView("buy");
    setError(null);
    if (countries.length === 0) loadCountries();
  };

  useEffect(() => {
    if (view === "buy" && country) loadNumbers(country);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, country]);

  const activeCountry = (countries || []).find(
    (c) => String(c.code).toUpperCase() === country,
  );
  const numberType = (activeCountry?.types || [])[0] || undefined;
  const selectedNumber = (numbers || []).find(
    (n) => n.phoneNumber === selected,
  );
  const shownPrice =
    priceLabel(selectedNumber?.monthlyPrice, selectedNumber?.currency) ||
    priceLabel(activeCountry?.monthlyPrice, activeCountry?.currency);

  const buy = async () => {
    if (!country || buying) return;
    setBuying(true);
    setError(null);
    try {
      const { data } = await api.post("/channels/whatsapp/number", {
        country,
        ...(numberType ? { numberType } : {}),
        ...(selectedNumber?.locality ? { areaCode: selectedNumber.locality } : {}),
      });
      if (data?.kycRequired) {
        // Not an error — a regulated country wants an identity check first.
        setKyc({
          url: data.kycUrl || null,
          message:
            data.message ||
            "This country needs a quick identity check before the number activates.",
        });
        setView("kyc");
        return;
      }
      onClose?.({
        connected: true,
        phoneNumber: data?.phoneNumber || selected || null,
        webhookError: data?.webhookError || null,
      });
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          "Couldn't get that number just now. Try another country.",
      );
    } finally {
      setBuying(false);
    }
  };

  // ── Chrome ────────────────────────────────────────────────────────────────
  const header = (
    <div className="flex items-start gap-3 mb-5">
      {view !== "choose" && (
        <button
          type="button"
          onClick={() => {
            setView("choose");
            setError(null);
          }}
          className="w-9 h-9 rounded-xl border border-ink-200 text-ink-500 hover:bg-ink-50 flex items-center justify-center flex-shrink-0"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
      )}
      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
        <WhatsAppMark className="w-6 h-6" />
      </div>
      <div className="min-w-0">
        <h2 id="wa-connect-title" className="text-lg font-black text-ink-900">
          {view === "buy"
            ? "Get a WhatsApp number"
            : view === "kyc"
              ? "One quick identity check"
              : "Connect WhatsApp"}
        </h2>
        <p className="text-sm text-ink-500">
          {view === "buy"
            ? "A dedicated number for bookings — ready right away."
            : view === "kyc"
              ? "Almost there."
              : "Two ways in. Pick the one that describes your hotel."}
        </p>
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink-950/50 p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wa-connect-title"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl p-6 shadow-xl outline-none max-h-[92vh] overflow-y-auto"
      >
        {header}

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 mb-4 flex gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-rose-900">{error}</p>
          </div>
        )}

        {/* ── The chooser ────────────────────────────────────────────────── */}
        {view === "choose" && (
          <div className="space-y-3">
            {/* Path A — the common case */}
            <div className="rounded-2xl border border-ink-100 p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-ink-900 text-[15px]">
                    My number is already on WhatsApp
                  </p>
                  <p className="text-sm text-ink-500 mt-1">
                    Your number stays yours. Keep using WhatsApp on your phone —
                    the AI answers alongside you, on the same number.
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-ink-50 border border-ink-100 p-3 mt-3">
                <p className="text-xs text-ink-700 leading-relaxed">
                  <span className="font-bold text-ink-900">
                    One requirement:
                  </span>{" "}
                  this needs the free{" "}
                  <span className="font-semibold">WhatsApp Business</span> app —
                  not normal WhatsApp. It's a 5-minute switch and you keep your
                  number and your chats.
                </p>
                <button
                  type="button"
                  onClick={() => setShowBusinessHelp((v) => !v)}
                  aria-expanded={showBusinessHelp}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700"
                >
                  {showBusinessHelp ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                  I'm on normal WhatsApp — what do I do?
                </button>
                {showBusinessHelp && (
                  <ol className="mt-3 space-y-2">
                    {[
                      "Install WhatsApp Business from the App Store or Google Play — it's free.",
                      "Open it and verify the same phone number you use today.",
                      "It offers to move your existing chats across. Keep them, and you're done.",
                    ].map((step, i) => (
                      <li key={i} className="flex gap-2.5 text-xs text-ink-700">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white border border-ink-200 text-ink-700 font-bold text-[10px] flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              <div className="mt-3">
                <p className="text-[11px] uppercase tracking-wider font-bold text-ink-400 mb-1.5">
                  What happens next
                </p>
                <ol className="space-y-1.5">
                  {[
                    "You'll log in with Facebook.",
                    "Pick the phone number you want to use.",
                    "Scan a QR code from your WhatsApp Business app — no SMS code.",
                  ].map((step, i) => (
                    <li key={i} className="flex gap-2.5 text-xs text-ink-600">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-ink-100 text-ink-700 font-bold text-[10px] flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <button
                type="button"
                onClick={startOauth}
                disabled={redirecting}
                className="mt-4 w-full inline-flex items-center justify-center gap-1.5 border border-ink-200 text-ink-800 font-bold text-sm rounded-xl px-4 py-2.5 hover:bg-ink-50 transition disabled:opacity-60"
              >
                {redirecting && <Loader2 className="w-4 h-4 animate-spin" />}
                Connect my existing number
              </button>
            </div>

            {/* Path B */}
            <div className="rounded-2xl border border-ink-100 p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-600 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-ink-900 text-[15px]">
                    I don't have WhatsApp on this number
                  </p>
                  <p className="text-sm text-ink-500 mt-1">
                    We give your hotel a dedicated WhatsApp number for bookings.
                    Ready immediately — nothing to install, nothing to verify.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={openBuy}
                className="mt-4 w-full inline-flex items-center justify-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl px-4 py-2.5 transition"
              >
                Get a number for my hotel
              </button>
            </div>

            <button
              type="button"
              onClick={() => onClose?.()}
              className="w-full text-sm font-semibold text-ink-500 hover:text-ink-700 py-2"
            >
              Cancel
            </button>
          </div>
        )}

        {/* ── Buy a number ───────────────────────────────────────────────── */}
        {view === "buy" && (
          <div>
            {loadingCountries ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-7 h-7 text-brand-500 animate-spin" />
              </div>
            ) : countries.length === 0 ? (
              <div className="py-6 text-center">
                <p className="font-bold text-ink-900">
                  No numbers available right now
                </p>
                <p className="text-sm text-ink-500 mt-1">
                  We couldn't reach the number provider. Try again in a moment,
                  or connect an existing WhatsApp number instead.
                </p>
                <button
                  type="button"
                  onClick={loadCountries}
                  className="mt-5 w-full inline-flex items-center justify-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl px-4 py-2.5"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try again
                </button>
              </div>
            ) : (
              <>
                <label
                  htmlFor="wa-country"
                  className="block text-[11px] uppercase tracking-wider font-bold text-ink-400 mb-1.5"
                >
                  Country
                </label>
                <select
                  id="wa-country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm font-semibold text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
                >
                  {countries.map((c) => (
                    <option
                      key={c.code}
                      value={String(c.code).toUpperCase()}
                    >
                      {c.name || c.code}
                      {priceLabel(c.monthlyPrice, c.currency)
                        ? ` — ${priceLabel(c.monthlyPrice, c.currency)}`
                        : ""}
                    </option>
                  ))}
                </select>

                <div className="mt-4">
                  <p className="text-[11px] uppercase tracking-wider font-bold text-ink-400 mb-1.5">
                    Available numbers
                  </p>
                  {loadingNumbers ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
                    </div>
                  ) : numbers.length === 0 ? (
                    <p className="text-sm text-ink-500 py-4">
                      No numbers free in that country at the moment. Try another
                      one.
                    </p>
                  ) : (
                    <div
                      role="radiogroup"
                      aria-label="Available WhatsApp numbers"
                      className="space-y-2 max-h-56 overflow-y-auto -mx-1 px-1"
                    >
                      {numbers.map((n) => {
                        const active = selected === n.phoneNumber;
                        const p = priceLabel(n.monthlyPrice, n.currency);
                        return (
                          <button
                            key={n.phoneNumber}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            onClick={() => setSelected(n.phoneNumber)}
                            className={`w-full flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                              active
                                ? "border-brand-500 bg-brand-500/5 ring-1 ring-brand-500"
                                : "border-ink-100 hover:border-ink-200 hover:bg-ink-50"
                            }`}
                          >
                            <span className="flex-1 min-w-0">
                              <span className="block font-bold text-ink-900 text-sm font-mono truncate">
                                {n.phoneNumber}
                              </span>
                              {n.locality && (
                                <span className="block text-xs text-ink-500 truncate">
                                  {n.locality}
                                </span>
                              )}
                            </span>
                            {p && (
                              <span className="text-xs font-bold text-ink-700 flex-shrink-0">
                                {p}
                              </span>
                            )}
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border ${
                                active
                                  ? "bg-brand-500 border-brand-500 text-white"
                                  : "border-ink-200"
                              }`}
                            >
                              {active && <Check className="w-3 h-3" />}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Never surprise a hotelier with a charge. */}
                <div className="rounded-xl bg-ink-50 border border-ink-100 p-3 mt-4">
                  <p className="text-xs text-ink-700">
                    {shownPrice ? (
                      <>
                        This number costs{" "}
                        <span className="font-bold text-ink-900">
                          {shownPrice}
                        </span>{" "}
                        and is billed with your subscription. Cancel any time by
                        disconnecting WhatsApp.
                      </>
                    ) : (
                      "The monthly cost for this number is added to your subscription. Cancel any time by disconnecting WhatsApp."
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={buy}
                  disabled={!country || buying || numbers.length === 0}
                  className="mt-4 w-full inline-flex items-center justify-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl px-4 py-2.5 transition disabled:opacity-60"
                >
                  {buying && <Loader2 className="w-4 h-4 animate-spin" />}
                  {buying ? "Setting up your number…" : "Get this number"}
                </button>
                <button
                  type="button"
                  onClick={() => onClose?.()}
                  disabled={buying}
                  className="mt-2 w-full text-sm font-semibold text-ink-500 hover:text-ink-700 py-2 disabled:opacity-60"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        )}

        {/* ── KYC — information, not failure ─────────────────────────────── */}
        {view === "kyc" && (
          <div className="py-2">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-900">
                  {kyc?.message}
                </p>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  Some countries require the number holder to be verified before
                  a WhatsApp number goes live. It's a short form — once it's
                  approved, your number activates automatically and the AI starts
                  answering.
                </p>
              </div>
            </div>
            {kyc?.url && (
              <a
                href={kyc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full inline-flex items-center justify-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl px-4 py-2.5 transition"
              >
                <ExternalLink className="w-4 h-4" />
                Complete the identity check
              </a>
            )}
            <button
              type="button"
              onClick={() => onClose?.()}
              className="mt-2 w-full border border-ink-200 text-ink-700 font-bold text-sm rounded-xl px-4 py-2.5 hover:bg-ink-50"
            >
              Done for now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
