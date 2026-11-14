/**
 * Shared constants, style tokens and helpers for "Train your AI" and
 * "Test your AI". No JSX here — components import what they need.
 */
import {
  Car,
  ConciergeBell,
  Crown,
  Flame,
  Hammer,
  Siren,
  SprayCan,
  UserCog,
  Utensils,
} from "lucide-react";

export const OTHER = "__other";
export const PHONE_RE = /^\+?[0-9 ()-]{6,20}$/;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const TRAIN_PATH = "/dashboard/train";
export const TEST_PATH = "/dashboard/test-ai";

export const spring = { type: "spring", stiffness: 420, damping: 30 };
export const ease = [0.16, 1, 0.3, 1];
export const hop =
  "transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]";

/* Liquid-glass rings (cards use box-shadow rings, not borders). */
export const ringWarn =
  "shadow-[inset_0_1px_0_#fff,0_0_0_1.5px_rgba(255,181,71,0.55),0_10px_28px_-16px_rgba(255,106,43,0.45)]";
export const ringError =
  "shadow-[inset_0_1px_0_#fff,0_0_0_1.5px_rgba(244,63,94,0.5),0_10px_28px_-16px_rgba(244,63,94,0.4)]";
export const ringFocus =
  "shadow-[inset_0_1px_0_#fff,0_0_0_1.5px_rgba(255,106,43,0.6),0_18px_40px_-18px_rgba(255,61,119,0.45)]";
export const mustHave =
  "inline-flex items-center rounded-full bg-sunset-soft text-sunset-flame ring-1 ring-sunset-flame/20 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5";

export const errMsg = (e, fallback) => e?.response?.data?.message || fallback;
export const hasText = (s) => !!String(s || "").trim();
let keySeq = 0;
export const newKey = () => `k${++keySeq}`;

/* Plain-English help per contact role (keys come from the backend config). */
export const ROLE_META = {
  front_desk: {
    icon: ConciergeBell,
    help: "The main number for guests — bookings, questions, anything at all.",
  },
  manager: {
    icon: UserCog,
    help: "Handles complaints, refunds and anything the AI can't sort out itself.",
  },
  owner: {
    icon: Crown,
    help: "Only for serious matters. Usually kept private.",
  },
  emergency: {
    icon: Siren,
    help: "Who guests should call in an emergency — fire, injury or a medical problem.",
  },
  maintenance_emergency: {
    icon: Flame,
    help: "On call at night for urgent problems: no water, no power, a broken lock or AC.",
  },
  maintenance: {
    icon: Hammer,
    help: "Fixes things during the day. The AI tells guests it'll be sorted — without giving out this number.",
  },
  cleaning: {
    icon: SprayCan,
    help: "Housekeeping, for cleaning requests and fresh towels.",
  },
  taxi: {
    icon: Car,
    help: "Your own driver or a taxi company you trust. Add as many as you like.",
    multiple: true,
  },
  restaurant: {
    icon: Utensils,
    help: "For table bookings, room service and food questions.",
  },
};

export const SUGGESTED_TESTS = [
  "What time is check-in?",
  "What's the WiFi password?",
  "Is breakfast included?",
  "The AC in my room isn't working",
  "Can I get a refund?",
  "Can you book me a taxi to the airport?",
];

/** Same rules as readinessOf() on the backend, so optimistic edits update the bar instantly. */
export function computeReadiness(faqs, contacts, roles) {
  const missingAnswers = faqs
    .filter((f) => f.required && !hasText(f.answer))
    .map((f) => ({ id: f._id, question: f.question, category: f.category }));
  const requiredRoles = roles.filter((r) => r.required);
  const missingContacts = requiredRoles
    .filter((r) => !contacts.some((c) => c.role === r.key && hasText(c.whatsapp)))
    .map((r) => ({ role: r.key, label: r.label }));
  const requiredTotal = faqs.filter((f) => f.required).length + requiredRoles.length;
  const missing = missingAnswers.length + missingContacts.length;
  return {
    complete: missing === 0,
    percent: requiredTotal ? Math.round(((requiredTotal - missing) / requiredTotal) * 100) : 100,
    missingAnswers,
    missingContacts,
    answered: faqs.filter((f) => hasText(f.answer)).length,
    total: faqs.length,
  };
}
