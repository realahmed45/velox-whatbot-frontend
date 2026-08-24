/**
 * Botlify support-chat knowledge base.
 *
 * Powers the floating SupportChat widget on the public marketing pages.
 * Everything is matched and answered CLIENT-SIDE — there is no support API.
 *
 * To add an entry: append an object with
 *   id       — stable unique slug
 *   question — the canonical phrasing (also used for suggestion chips)
 *   keywords — lowercase terms/phrases we match the visitor's message against.
 *              Multi-word phrases score higher than single words.
 *   answer   — plain text. Use "\n\n" for paragraph breaks and lines starting
 *              with "• " for bullets; the widget renders both.
 *   chip     — optional short label used on the suggestion chips.
 */

export const SUPPORT_EMAIL = "contactus@botlify.site";

export const BOTLIFY_FAQ = [
  {
    id: "what-is-botlify",
    question: "What is Botlify?",
    chip: "What is Botlify?",
    keywords: [
      "what is botlify",
      "what does botlify do",
      "what do you do",
      "about botlify",
      "explain botlify",
      "what is this",
      "tell me about",
      "platform",
      "overview",
    ],
    answer:
      "Botlify is a complete operating platform for a hotel — not just a chatbot.\n\nIt gives you:\n• A channel manager — Booking.com and Airbnb on one calendar\n• Your own direct-booking page, commission-free\n• An AI revenue manager that suggests nightly rates you approve\n• An AI concierge on WhatsApp, Instagram, Messenger and Telegram\n• A front desk — check-in, check-out, housekeeping and folio\n• A unified guest CRM and a reviews inbox\n• The Botlify Agent — type an instruction in plain language and it does it\n\nOne login, one calendar, one bill.",
  },
  {
    id: "pricing",
    question: "How much does Botlify cost?",
    chip: "Pricing",
    keywords: [
      "how much does it cost",
      "how much",
      "what does it cost",
      "price",
      "pricing",
      "cost",
      "monthly fee",
      "subscription",
      "per month",
      "plan",
      "plans",
      "expensive",
      "49",
      "$49",
      "yearly",
      "annual",
      "free plan",
      "free trial",
      "trial",
    ],
    answer:
      "$49 a month, flat — per property, not per room and not per channel. Yearly is $490 (two months free).\n\n• There is a free \"Launch\" plan available right now, with the same features, while we launch.\n• The paid plan has a 3-day free trial. A card is required to start the trial.\n• No setup fee. Cancel anytime.\n\nOn top of the subscription there is a simple commission model — ask me about \"commission\" and I'll break it down.",
  },
  {
    id: "commission-model",
    question: "How does the commission work?",
    chip: "0% / 10% commission",
    keywords: [
      "how does the commission work",
      "commission",
      "commissions",
      "0%",
      "10%",
      "percentage",
      "cut",
      "take a cut",
      "revenue share",
      "fee per booking",
      "booking fee",
      "do you charge per booking",
    ],
    answer:
      "Two numbers, and that's the whole model:\n\n• 0% on Booking.com and Airbnb bookings. OTA sync is completely free — we never take a cut of a reservation that came through an OTA.\n• 10% only on bookings the AI closes for you — through WhatsApp, Instagram, Messenger, Telegram or your direct booking page.\n\nWhy 10% is the good deal: OTAs charge 15–18% for the same reservation. Our 10% is cheaper, and it only applies to revenue you would not otherwise have had — the AI closed it, at 3am, in a chat you never had to answer.\n\nThere is also a small partner margin (roughly 5–10%) when we arrange an airport transfer through our partner network. If you use your own driver, you keep 100%.",
  },
  {
    id: "commission-settlement",
    question: "How is the commission actually collected?",
    chip: "How commission is settled",
    keywords: [
      "how is the commission collected",
      "how do you collect",
      "how is it settled",
      "settled",
      "settlement",
      "invoice",
      "statement",
      "ledger",
      "bank transfer",
      "billed",
      "deduct",
      "automatically deducted",
      "take money out",
    ],
    answer:
      "Tracked automatically, settled manually. Here's exactly what happens:\n\n• Every commissionable booking is recorded in a ledger inside your dashboard, as it happens — you can see each line item.\n• At the end of each month we email you a statement of what's owed.\n• You settle it by bank transfer or invoice.\n\nBotlify never takes money out of your account and never sits between your guest and your payments. You always collect from the guest directly, the way you do today.",
  },
  {
    id: "guest-payments",
    question: "Do you take my guest payments?",
    chip: "Do you hold my payments?",
    keywords: [
      "do you take my guest payments",
      "guest payments",
      "take payments",
      "hold my money",
      "payment processing",
      "who collects the money",
      "payout",
      "merchant of record",
      "credit card",
      "do you handle payments",
    ],
    answer:
      "No. Never.\n\nThe hotel always collects guest payments directly — card on arrival, your own payment link, bank transfer, cash, whatever you use today. Botlify does not sit in the middle of that flow and does not hold your money.\n\nThe only thing we bill you for is the $49 subscription. Booking commissions are tracked in a ledger and invoiced to you monthly — you pay us, we never deduct from you.",
  },
  {
    id: "which-otas",
    question: "Which OTAs do you connect to?",
    chip: "Which OTAs?",
    keywords: [
      "which otas do you connect to",
      "ota",
      "otas",
      "booking.com",
      "booking com",
      "airbnb",
      "expedia",
      "agoda",
      "vrbo",
      "channels",
      "channel manager",
      "connect booking",
      "sync",
      "two-way sync",
    ],
    answer:
      "Booking.com and Airbnb today, connected through our connectivity partner. More channels are available through the same partner.\n\nThe sync is two-way: your rooms, rates and availability push out, and reservations pull in. The moment a room sells anywhere — an OTA, your direct page, or in a chat — availability drops everywhere else. That's what makes double-bookings stop.\n\nAnd it costs you nothing extra: OTA sync is 0% commission.",
  },
  {
    id: "messaging-channels",
    question: "Which messaging channels does the AI work on?",
    chip: "Messaging channels",
    keywords: [
      "which messaging channels",
      "messaging",
      "whatsapp",
      "instagram",
      "messenger",
      "facebook",
      "telegram",
      "sms",
      "channels does the ai work",
      "where does the ai reply",
      "social",
      "dm",
      "dms",
    ],
    answer:
      "The AI concierge works on:\n• WhatsApp\n• Instagram\n• Facebook Messenger\n• Telegram\n• Your own direct booking page\n\nWhatsApp, Instagram and Messenger connect with a normal authorisation flow from your dashboard.\n\nTelegram is different: you add our bot to your group or channel as an admin, then send it the short code shown in your dashboard. That's it.\n\nOne thing we're honest about: TikTok is not supported — see \"TikTok\" if you want the reason.",
  },
  {
    id: "tiktok",
    question: "Does the AI work on TikTok?",
    chip: "TikTok?",
    keywords: [
      "does the ai work on tiktok",
      "tiktok",
      "tik tok",
      "tiktok dm",
      "tiktok messages",
    ],
    answer:
      "No — and we'd rather say so plainly than promise it.\n\nTikTok does not offer a messaging API to platforms like us. There is no supported way for Botlify (or any similar tool) to read or reply to TikTok DMs on your behalf, so we don't claim to.\n\nEverything else works: WhatsApp, Instagram, Facebook Messenger, Telegram and your direct booking page. If TikTok ever opens up messaging, we'll add it.",
  },
  {
    id: "onboarding",
    question: "How do I get started?",
    chip: "How do I get started?",
    keywords: [
      "how do i get started",
      "get started",
      "getting started",
      "sign up",
      "signup",
      "register",
      "onboarding",
      "first steps",
      "set up",
      "setup",
      "start",
      "how do i begin",
      "try it",
    ],
    answer:
      "Three steps, and you can do them right now:\n\n1. Create your account — email and password, no card needed for the free Launch plan.\n2. Name your hotel — property name, city, timezone and currency.\n3. Add your rooms — type them in manually, or import your room types, rates and photos straight from your Booking.com or Airbnb listing.\n\nThe moment rooms exist, your calendar and your direct booking page are live. Connecting channels and messaging comes after, whenever you're ready.\n\nThe full walkthrough is on our Guide page.",
  },
  {
    id: "setup-time",
    question: "How long does setup take?",
    chip: "How long does setup take?",
    keywords: [
      "how long does setup take",
      "how long",
      "setup time",
      "how quickly",
      "how fast",
      "migration",
      "implementation",
      "onboarding time",
      "go live",
      "minutes",
    ],
    answer:
      "About 10 minutes to be up and taking bookings.\n\nAccount, hotel name and rooms take a few minutes — faster if you import from an OTA listing. Connecting Booking.com and Airbnb through our connectivity partner is the slowest part, and it's mostly waiting on the channel to acknowledge the mapping.\n\nThere's no migration project, no implementation fee and no code to install anywhere.",
  },
  {
    id: "need-channel-manager",
    question: "Do I still need a channel manager?",
    chip: "Do I need a channel manager?",
    keywords: [
      "do i still need a channel manager",
      "need a channel manager",
      "siteminder",
      "cloudbeds",
      "channex",
      "existing channel manager",
      "replace channel manager",
      "already have a channel manager",
    ],
    answer:
      "No — Botlify is the channel manager.\n\nYour rooms, rates and availability sync two-way with Booking.com and Airbnb, and a sale on any channel drops availability everywhere else instantly. There's nothing extra to subscribe to and nothing to wire two products together.\n\nIf you already pay for one, Botlify is meant to replace that line item, not sit next to it.",
  },
  {
    id: "replace-pms",
    question: "Does it replace my PMS?",
    chip: "Does it replace my PMS?",
    keywords: [
      "does it replace my pms",
      "pms",
      "property management system",
      "front desk software",
      "replace my pms",
      "night audit",
      "accounting",
      "housekeeping software",
    ],
    answer:
      "For the daily front-desk basics, yes:\n• Check-in and check-out\n• Unit / room assignment\n• A housekeeping board — clean, dirty, inspected\n• A folio, so breakfast, the minibar or a late check-out get charged to the room\n\nBeing straight with you: if you run a large property that depends on deep accounting integrations, interfaces to third-party systems or formal night-audit workflows, treat Botlify as your day-to-day front desk rather than a full enterprise PMS replacement.\n\nFor most independent hotels, guesthouses and B&Bs, it's everything they actually use.",
  },
  {
    id: "ai-concierge",
    question: "How does the AI concierge work?",
    chip: "The AI concierge",
    keywords: [
      "how does the ai concierge work",
      "ai concierge",
      "concierge",
      "chatbot",
      "ai bot",
      "does it book",
      "answer guests",
      "reply to guests",
      "24/7",
      "make up rooms",
      "hallucinate",
      "invent",
    ],
    answer:
      "It reads the same live calendar the rest of the platform uses — so it can only quote rooms and nights that genuinely exist and are genuinely free.\n\nWhat it does in a conversation:\n• Answers questions about your property, in your tone, 24/7\n• Quotes real availability and your real nightly rate\n• Re-checks availability one more time immediately before confirming, so a room that sold 30 seconds ago can't be sold twice\n• Books the room and sends a confirmation\n• Arranges an airport transfer and offers extras like breakfast or late check-out\n\nIt never invents a room type. And your front desk can take over any conversation mid-way from the unified inbox.",
  },
  {
    id: "botlify-agent",
    question: "What is the Botlify Agent?",
    chip: "The Botlify Agent",
    keywords: [
      "what is the botlify agent",
      "botlify agent",
      "agent",
      "command",
      "commands",
      "plain language",
      "type an instruction",
      "natural language",
      "tell it what to do",
    ],
    answer:
      "It's your hotel's command line, in plain English.\n\nType it the way you'd say it to a manager:\n• \"Change Deluxe Double to $95 next weekend\"\n• \"Who checks in today?\"\n• \"Block room 3 tomorrow — the AC is out\"\n• \"How did we do last month?\"\n\nRead-only questions are answered immediately. Anything that changes a rate, availability or a booking shows you exactly what will change and asks you to confirm first — it never acts on money or inventory without your say-so.\n\nOne confirmed instruction updates Booking.com, Airbnb and your direct page together.",
  },
  {
    id: "revenue-manager",
    question: "How does the AI revenue manager work?",
    chip: "AI revenue manager",
    keywords: [
      "how does the ai revenue manager work",
      "revenue manager",
      "revenue management",
      "pricing ai",
      "rate suggestions",
      "dynamic pricing",
      "adr",
      "yield",
      "auto pricing",
      "guard rails",
    ],
    answer:
      "It watches your occupancy, your booking pace and your local market, then suggests a nightly rate — in plain language, with the reason attached. For example: \"Sep 3–5 is 30% booked, usually 70% this close in — drop to $85?\"\n\nYou stay in control:\n• Every suggestion comes with its reasoning, and you approve or skip it\n• Guard rails: set a minimum and maximum rate per room type and it will never suggest outside them\n• Two modes — Suggest (nothing changes until you approve) or Auto (approved changes apply within your guard rails)\n\nApproved rates push to every connected channel and your direct page at once.",
  },
  {
    id: "transfers",
    question: "How do airport transfers work?",
    chip: "Airport transfers",
    keywords: [
      "how do airport transfers work",
      "airport transfer",
      "transfers",
      "pickup",
      "pick up",
      "drop off",
      "driver",
      "taxi",
      "shuttle",
    ],
    answer:
      "When a guest asks about getting from the airport, the AI handles it in the same conversation instead of losing the thread.\n\n• If you have your own driver or shuttle, the transfer is booked against your service and you keep 100% of it.\n• If you don't, we can arrange it through our partner network. Botlify takes a small partner margin on those — roughly 5–10%.\n\nEither way the transfer is attached to the booking, so your front desk sees the flight and the pickup time on the arrivals screen.",
  },
  {
    id: "consultants",
    question: "Tell me about the consultant program",
    chip: "Consultant program",
    keywords: [
      "consultant program",
      "consultants",
      "affiliate",
      "referral",
      "reseller",
      "partner program",
      "commission for referring",
      "20%",
      "refer a hotel",
      "marketer",
    ],
    answer:
      "If you sign hotels up for Botlify, you earn 20% of Botlify's revenue from every hotel you bring in, for 12 months from the day they sign.\n\n• It applies to everything we earn from that hotel — subscription and booking commissions.\n• Every hotel is attributed to you by your personal referral code, entered at sign-up.\n• Earnings are tracked automatically in your consultant dashboard and paid out manually, monthly.\n• Free to join, no cap on how many hotels you sign.\n\nThe Consultants page has the full details and the application form.",
  },
  {
    id: "rooms-and-rates",
    question: "How do I set my rooms and rates?",
    chip: "Rooms & rates",
    keywords: [
      "how do i set my rooms and rates",
      "rooms",
      "room types",
      "rates",
      "nightly rate",
      "units",
      "add rooms",
      "import rooms",
      "base rate",
      "how many rooms",
    ],
    answer:
      "A room type in Botlify is a name, a number of units, an occupancy and a nightly rate — for example \"Deluxe Double, 4 units, sleeps 2, $79\".\n\n• Add them manually, or import your types, rates and photos from your Booking.com or Airbnb listing.\n• Units is how many physical rooms of that type you have. That number is your availability.\n• The nightly rate matters more than anywhere else in the product: it is the number the AI quotes to guests, the number your direct booking page shows, and the baseline the revenue manager suggests moving up or down.\n\nThere is no per-room pricing from us — put in as many as you have.",
  },
  {
    id: "double-booking",
    question: "Will it double-book my rooms?",
    chip: "Double bookings?",
    keywords: [
      "will it double book",
      "double book",
      "double booking",
      "overbooking",
      "oversell",
      "two guests same room",
      "conflict",
    ],
    answer:
      "No. Everything writes to a single calendar.\n\n• Every channel — OTAs, direct page, chat, manual bookings — reads and writes the same availability.\n• OTA sync is two-way, so a Booking.com reservation removes that night everywhere else.\n• Both the booking page and the AI re-check live availability in the moment before confirming, not just when the conversation started.\n\nThat last check is the one that matters — it's what stops a room being promised twice in two simultaneous chats.",
  },
  {
    id: "guest-crm",
    question: "How does the guest CRM work?",
    chip: "Guest profiles",
    keywords: [
      "guest crm",
      "guests",
      "guest profile",
      "crm",
      "guest history",
      "returning guest",
      "contacts",
      "lifetime value",
    ],
    answer:
      "One profile per guest, across every channel and every OTA.\n\nThe same person who messaged you on WhatsApp last year, booked on Booking.com in March and is emailing you now is a single record — with their stay history, their preferences, their notes and their lifetime value in one place.\n\nThat's what lets your front desk greet a returning guest properly, and it's what makes off-season broadcasts to past guests actually work.",
  },
  {
    id: "data-security",
    question: "Is my data secure?",
    chip: "Data & security",
    keywords: [
      "is my data secure",
      "data",
      "security",
      "secure",
      "privacy",
      "gdpr",
      "who owns my data",
      "export",
      "delete my data",
      "encrypted",
    ],
    answer:
      "Your data is yours.\n\n• Traffic is encrypted in transit, and channel credentials are stored encrypted — never shown back to anyone, including us in plain text.\n• Your guest list, bookings and messages belong to you. We don't sell them and we don't share them with other hotels.\n• Team access is permissioned — front desk, manager and owner roles see different things.\n• You can export your data, and if you close your account you can ask us to delete it.\n\nOur Privacy Policy has the formal version.",
  },
  {
    id: "cancel",
    question: "Can I cancel anytime?",
    chip: "Cancelling",
    keywords: [
      "can i cancel",
      "cancel",
      "cancellation",
      "refund",
      "contract",
      "lock in",
      "commitment",
      "notice period",
    ],
    answer:
      "Anytime, in one click from the Billing page. No contract, no notice period, no cancellation fee.\n\nIf you cancel, you keep access until the end of the period you've already paid for. Anything still owed on the commission ledger is settled on your final statement.",
  },
  {
    id: "contact-human",
    question: "How do I talk to a human?",
    chip: "Talk to a human",
    keywords: [
      "talk to a human",
      "human",
      "real person",
      "contact",
      "contact you",
      "email",
      "support",
      "help",
      "phone",
      "speak to someone",
    ],
    answer: `Email us at ${SUPPORT_EMAIL} and a real person replies — usually within a few hours.\n\nTell us your property name and what you're trying to do, and we'll answer specifically rather than sending you a link.\n\nYou can also use the Contact page on this site.`,
  },
];

/** Topics offered as chips when the panel opens, and in the fallback reply. */
export const SUGGESTED_TOPIC_IDS = [
  "what-is-botlify",
  "pricing",
  "commission-model",
  "messaging-channels",
  "onboarding",
  "replace-pms",
];

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "but", "by", "can", "do", "does",
  "for", "from", "get", "has", "have", "how", "i", "if", "in", "is", "it",
  "its", "me", "my", "of", "on", "or", "our", "so", "that", "the", "their",
  "them", "then", "there", "these", "they", "this", "to", "was", "we", "what",
  "when", "where", "which", "who", "why", "will", "with", "you", "your",
]);

const normalize = (s) =>
  String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9%$.\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Score one entry against a normalized query.
 * Multi-word keyword phrases are worth far more than single-word hits, so
 * "how much does it cost" beats a stray "cost" appearing elsewhere.
 */
function scoreEntry(entry, query, queryWords) {
  let score = 0;

  for (const raw of entry.keywords) {
    const kw = normalize(raw);
    if (!kw) continue;
    const words = kw.split(" ");
    if (words.length > 1) {
      if (query.includes(kw)) score += 6 + words.length;
    } else if (queryWords.has(kw)) {
      score += STOP_WORDS.has(kw) ? 0 : 2;
    }
  }

  // A near-verbatim question match is decisive.
  const q = normalize(entry.question);
  if (q && (query.includes(q) || q.includes(query))) score += 10;

  return score;
}

/**
 * Find the best-matching FAQ entry for a visitor message.
 * Returns { entry, score, confident } — `confident` gates the fallback reply.
 */
export function findAnswer(message) {
  const query = normalize(message);
  if (!query) return { entry: null, score: 0, confident: false };

  const queryWords = new Set(
    query.split(" ").filter((w) => w.length > 1 && !STOP_WORDS.has(w)),
  );

  let best = null;
  let bestScore = 0;
  for (const entry of BOTLIFY_FAQ) {
    const score = scoreEntry(entry, query, queryWords);
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }

  return { entry: best, score: bestScore, confident: bestScore >= 4 };
}

/** Look an entry up by id (used by the suggestion chips). */
export const getEntry = (id) => BOTLIFY_FAQ.find((e) => e.id === id) || null;

/** Reply used when nothing matched confidently. */
export const FALLBACK_ANSWER =
  "I'm not sure I have a good answer for that one — I only know the Botlify basics.\n\nTry one of the topics below, or email " +
  SUPPORT_EMAIL +
  " and a real person will get back to you within a few hours.";

export const WELCOME_MESSAGE =
  "Hi! I'm the Botlify assistant. Ask me anything about the platform, pricing or how it all connects — or pick a question below.";
