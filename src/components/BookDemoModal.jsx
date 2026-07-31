/**
 * BookDemoModal — a public "Book a Demo" form used from the marketing header.
 * Captures a lead (name, email, phone, business, preferred time) and posts to
 * the public /demo endpoint, which emails the Botlify team.
 */
import { useState } from "react";
import { createPortal } from "react-dom";
import { X, CalendarClock, Loader2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/services/api";

export default function BookDemoModal({ open, onClose, source = "header" }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    business: "",
    preferredTime: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (!open) return null;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!form.email.trim()) {
      toast.error("Please add your email so we can reach you.");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post("/demo", { ...form, source });
      setDone(true);
      toast.success(data.message || "Thanks! We'll be in touch shortly.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong — try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const close = () => {
    setDone(false);
    setForm({ name: "", email: "", phone: "", business: "", preferredTime: "" });
    onClose?.();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={close}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-gradient-to-br from-brand-500 to-brand-600 px-6 py-5 text-white">
          <button
            onClick={close}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black leading-tight">Book a free demo</h2>
              <p className="text-xs text-white/80">
                See Botlify automate your Instagram in 15 minutes.
              </p>
            </div>
          </div>
        </div>

        {done ? (
          <div className="px-6 py-10 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <p className="font-bold text-ink-900 text-lg">You're booked! 🎉</p>
            <p className="text-sm text-ink-500 mt-1">
              We'll email you shortly to lock in a time. Talk soon!
            </p>
            <button
              onClick={close}
              className="mt-5 px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold transition"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="px-6 py-5 space-y-3">
            <input
              value={form.name}
              onChange={set("name")}
              placeholder="Your name"
              className="w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition"
            />
            <input
              type="email"
              required
              value={form.email}
              onChange={set("email")}
              placeholder="Email *"
              className="w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition"
            />
            <input
              value={form.phone}
              onChange={set("phone")}
              placeholder="Phone / WhatsApp (optional)"
              className="w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition"
            />
            <input
              value={form.business}
              onChange={set("business")}
              placeholder="What's your business? (optional)"
              className="w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition"
            />
            <input
              value={form.preferredTime}
              onChange={set("preferredTime")}
              placeholder="Preferred time (e.g. weekday afternoons)"
              className="w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition"
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Booking…
                </>
              ) : (
                "Book my demo"
              )}
            </button>
            <p className="text-[11px] text-center text-ink-400">
              No spam. We'll only use this to set up your demo.
            </p>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}
