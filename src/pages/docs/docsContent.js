/**
 * Botlify documentation content.
 *
 * Structured so the Docs page can render a sidebar, in-page search, and anchored
 * sections from one source of truth. Each section has an id (anchor), a title,
 * an optional short summary, and `blocks` (the body). Blocks are simple typed
 * nodes the renderer knows how to draw — no markdown parser needed, and every
 * word is searchable.
 *
 * Block types:
 *   { p: "..." }                 paragraph (supports **bold** and `code`)
 *   { h: "..." }                 sub-heading
 *   { list: ["...", ...] }       bullet list
 *   { steps: ["...", ...] }      numbered steps
 *   { note: "...", tone }        callout (tone: info | warn | tip)
 *   { table: { head:[], rows:[[]] } }   simple table
 *   { code: "..." }              monospace block
 */

export const DOC_GROUPS = [
  {
    group: "Getting started",
    sections: [
      {
        id: "overview",
        title: "What is Botlify",
        summary: "The AI channel manager for hotels — channel sync plus AI guest messaging.",
        blocks: [
          {
            p: "Botlify is the AI channel manager for hotels. It syncs your rooms, rates and availability across **Booking.com, Airbnb and Expedia** on one calendar — and its AI answers every guest message **inside those OTA inboxes and on WhatsApp**, 24/7, in the guest's language. It replaces the manual work of guest messaging.",
          },
          { h: "What you get" },
          {
            list: [
              "**Channel sync** — two-way rates, availability and reservations with Booking.com, Airbnb and Expedia. More OTAs are coming.",
              "**AI guest messaging** — instant, accurate replies in every connected OTA inbox and on WhatsApp, and bookings closed for you.",
              "**One calendar** — every sale, wherever it happens, drops availability everywhere else.",
              "**Around it** — a commission-free direct booking page, guest profiles, airport transfers and team access.",
            ],
          },
          { h: "Who it's for" },
          {
            list: [
              "Independent hotels, guesthouses, villas and B&Bs listed on more than one OTA.",
              "Properties where someone spends hours a day answering the same guest questions.",
              "Owners who want one tool instead of a channel manager plus a messaging inbox plus a person.",
            ],
          },
        ],
      },
      {
        id: "quickstart",
        title: "Quick start",
        summary: "From sign-up to the AI answering its first guest.",
        blocks: [
          { p: "Five focused steps get you fully live:" },
          {
            steps: [
              "**Create your account** — start on the free Launch plan, or the $49/month plan with a 3-day free trial (card required).",
              "**Name your hotel** — property name, city, timezone and currency.",
              "**Add your rooms** — by hand, or import types, rates and photos from an existing OTA listing.",
              "**Connect your channels** — Booking.com, Airbnb and Expedia for sync and inbox replies, plus WhatsApp.",
              "**Train your AI** — your policies, check-in details and local tips. Then let it answer.",
            ],
          },
          {
            note: "Steps 1–3 are the required part. With rooms in the system your calendar, your direct booking page and manual bookings already work; connect channels whenever you're ready.",
            tone: "tip",
          },
        ],
      },
    ],
  },
  {
    group: "Channel manager",
    sections: [
      {
        id: "connect-otas",
        title: "Connect your OTAs",
        summary: "Booking.com, Airbnb and Expedia — live today. More coming.",
        blocks: [
          {
            p: "Botlify connects to OTAs through our certified connectivity partner — the same kind of pipe a traditional channel manager uses. You start it from **Channels** in the dashboard.",
          },
          {
            steps: [
              "Open **Channels** and choose Booking.com, Airbnb or Expedia.",
              "Authorise the channel; we request connectivity for your property.",
              "**Map** each Botlify room type to the matching room and rate plan on the OTA side.",
              "Rates and availability push out; reservations and guest messages pull in automatically.",
            ],
          },
          {
            note: "Mapping is the step worth doing carefully — everything downstream depends on it. An unmapped room type has nothing to push to, so it looks frozen.",
            tone: "warn",
          },
          {
            table: {
              head: ["OTA", "Status", "Sync", "AI inbox replies"],
              rows: [
                ["Booking.com", "Live", "Rates, availability, reservations", "Yes"],
                ["Airbnb", "Live", "Rates, availability, reservations", "Yes"],
                ["Expedia", "Live", "Rates, availability, reservations", "Yes"],
                ["More OTAs", "Coming", "—", "—"],
              ],
            },
          },
        ],
      },
      {
        id: "sync",
        title: "Rates & availability sync",
        summary: "One calendar, synced two ways.",
        blocks: [
          {
            p: "Every channel — OTAs, your direct page, chat and manual bookings — reads and writes the same calendar. The moment a room sells anywhere, availability drops everywhere else. That's what makes double-bookings stop.",
          },
          {
            list: [
              "Change a rate once and it pushes to Booking.com, Airbnb, Expedia and your direct page together.",
              "Override rates for specific dates — a weekend, a local event, a slow midweek stretch.",
              "The AI and the booking page both re-check live availability in the instant before confirming.",
            ],
          },
        ],
      },
      {
        id: "rooms-rates",
        title: "Rooms & rates",
        summary: "Room types, units and the nightly rate.",
        blocks: [
          {
            p: "A room type is four things: a **name**, a number of **units**, an **occupancy** and a **nightly rate** — e.g. “Deluxe Double, 4 units, sleeps 2, $79”.",
          },
          {
            list: [
              "**Units** is how many physical rooms of that type you have. That number is your availability.",
              "The **nightly rate** is what the AI quotes, what your direct page shows and what's pushed to every OTA.",
              "There is no per-room pricing from us — add as many types and units as you actually have.",
            ],
          },
        ],
      },
    ],
  },
  {
    group: "AI guest messaging",
    sections: [
      {
        id: "ai-overview",
        title: "How the AI answers",
        summary: "Replies inside your OTA inboxes and on WhatsApp, 24/7.",
        blocks: [
          {
            p: "The AI answers guest messages wherever they arrive — the **Booking.com, Airbnb and Expedia inboxes** and **WhatsApp** — instantly, in your tone and in the guest's language. It reads the same live calendar as the rest of Botlify, so it only ever quotes rooms and nights that genuinely exist and are free.",
          },
          { h: "What it does in a conversation" },
          {
            list: [
              "Answers questions about your property, policies, check-in and directions.",
              "Quotes real availability and your real nightly rate.",
              "Books the room and sends a confirmation (on WhatsApp and your direct page).",
              "Arranges airport transfers and offers extras like breakfast or late check-out.",
              "Says so honestly when it doesn't know, and flags the conversation for your team.",
            ],
          },
          {
            note: "Powered by Google Gemini. It never invents a room type, price or policy you haven't given it.",
            tone: "info",
          },
        ],
      },
      {
        id: "ota-inboxes",
        title: "OTA inboxes",
        summary: "No extra setup — it comes with the channel connection.",
        blocks: [
          {
            p: "Once an OTA is connected and mapped, its guest messages flow into Botlify and the AI replies inside that OTA's own messaging thread. Your response time stays fast around the clock, without anyone logging into three extranets.",
          },
          {
            note: "Bookings that arrive through an OTA are always 0% commission from Botlify — even when the AI answered the guest in the OTA inbox.",
            tone: "tip",
          },
        ],
      },
      {
        id: "whatsapp",
        title: "WhatsApp",
        summary: "Where direct guests ask, negotiate and book.",
        blocks: [
          {
            steps: [
              "Open **Channels** and choose WhatsApp.",
              "Authorise your WhatsApp Business number.",
              "The AI starts answering immediately — and can close bookings for you.",
            ],
          },
          {
            note: "WhatsApp only allows free-form messages within 24 hours of the guest's last message. Outside that window, use approved templates.",
            tone: "warn",
          },
        ],
      },
      {
        id: "train-ai",
        title: "Train your AI",
        summary: "Teach it your hotel once.",
        blocks: [
          {
            p: "Open **Train your AI** and give it everything a great receptionist would know:",
          },
          {
            list: [
              "Check-in and check-out times, deposit and cancellation policies.",
              "Room details, amenities, breakfast, parking, pets.",
              "Directions, airport distance, local tips.",
              "Answers to the questions you get every day.",
            ],
          },
          {
            note: "The more specific you are, the fewer conversations need a human. Update it any time — changes apply to the next reply.",
            tone: "tip",
          },
        ],
      },
      {
        id: "handoff",
        title: "Human handoff",
        summary: "Your team can take over any conversation.",
        blocks: [
          {
            p: "Every conversation, from every channel, lands in **Messages**. Any team member can take over — the AI steps back the moment a human replies, so you never both answer at once — and hand it back when done. You can also switch the AI off per channel.",
          },
        ],
      },
    ],
  },
  {
    group: "Operations",
    sections: [
      {
        id: "bookings-guests",
        title: "Bookings & guests",
        summary: "Every reservation and every guest in one place.",
        blocks: [
          { h: "Bookings" },
          {
            p: "Reservations from every OTA, your direct page, chat and manual entry appear in **Bookings** and on the **Calendar**. The **Today** screen shows who's arriving, who's leaving and which rooms are ready.",
          },
          { h: "Guests" },
          {
            p: "One profile per guest across every channel — the person who messaged on WhatsApp last year and booked on Booking.com in March is a single record, with stay history and notes.",
          },
        ],
      },
      {
        id: "direct-booking",
        title: "Your direct booking page",
        summary: "A commission-free channel on the same calendar.",
        blocks: [
          {
            p: "Every property gets a public booking page at `/book/your-hotel`, reading the same live calendar. Link it from your website, your Google profile or a WhatsApp reply. Manage it under **Your website**.",
          },
        ],
      },
      {
        id: "team",
        title: "Team & permissions",
        summary: "Invite your staff with the right access.",
        blocks: [
          {
            p: "Invite teammates and give each one a role, so front-desk staff can work Messages and Bookings without touching rates or billing.",
          },
        ],
      },
    ],
  },
  {
    group: "Account",
    sections: [
      {
        id: "billing",
        title: "Plans & billing",
        summary: "$49/month flat · free Launch plan · 0% on OTA bookings.",
        blocks: [
          {
            table: {
              head: ["", "Launch — free", "Botlify — $49/mo"],
              rows: [
                ["Price", "$0, while we launch", "$49/month per property, or $490/year"],
                ["Trial", "—", "3-day free trial (card required)"],
                ["OTA bookings", "0% commission", "0% commission"],
                ["Bookings the AI closes", "10%", "10%"],
              ],
            },
          },
          {
            p: "The 10% applies only to bookings the AI closes for you on WhatsApp or your direct page — OTAs charge 15–18% for the same reservation. Commission is tracked in a ledger in your dashboard and settled monthly by statement; Botlify never takes money out of your account or touches guest payments.",
          },
          {
            note: "Cancel anytime from Settings → Billing. You keep access until the end of the period you've paid for.",
            tone: "info",
          },
        ],
      },
      {
        id: "faq",
        title: "FAQ & troubleshooting",
        summary: "Common questions, answered.",
        blocks: [
          { h: "My Booking.com rooms aren't showing the right availability" },
          {
            p: "Almost always a mapping problem. Open **Channels → Booking.com** and check every room type is mapped to the matching room and rate plan. If mapping is correct, use the manual re-sync and give it a few minutes.",
          },
          { h: "A guest messaged and got no reply" },
          {
            p: "Check that the channel still shows Connected on the Channels page, that the AI is switched on for that channel, and that the conversation isn't in manual handover.",
          },
          { h: "The AI quoted a room I don't sell any more" },
          {
            p: "It only reads your Rooms list. Delete or deactivate the old room type and the AI stops offering it immediately.",
          },
          { h: "Which OTAs are supported?" },
          {
            p: "Booking.com, Airbnb and Expedia are live today. More OTAs are coming — tell us which one you need.",
          },
          { h: "Still stuck?" },
          {
            p: "Email us at **contactus@botlify.site** — we're happy to help.",
          },
        ],
      },
    ],
  },
];
