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
        summary: "Instagram DM automation — replies, automations, and a dashboard on autopilot.",
        blocks: [
          {
            p: "Botlify turns your Instagram into a 24/7 sales and support machine. It replies to DMs, comments and story mentions in your brand voice, runs keyword automations, schedules content, and gives you one dashboard for everything — no code required.",
          },
          { h: "Who it's for" },
          {
            list: [
              "Creators and small brands who get more DMs than they can answer.",
              "Online shops that sell through Instagram DMs.",
              "Agencies managing Instagram for multiple clients.",
            ],
          },
          {
            note: "Botlify works with Instagram Business or Creator accounts through the official Instagram API. You connect once — no Meta App Review to complete yourself.",
            tone: "info",
          },
        ],
      },
      {
        id: "quickstart",
        title: "Quick start",
        summary: "From sign-up to your first automated DM in under 30 minutes.",
        blocks: [
          { p: "Five focused steps get you fully live:" },
          {
            steps: [
              "**Create your account** and start your 3-day free trial (card required, cancel anytime).",
              "**Connect Instagram** — one secure login, no App Review.",
              "**Teach the AI bot** your business (website, PDF, or a short description) and add a few FAQs.",
              "**Turn on automations** — Welcome DM, Comment → DM, keyword replies.",
              "**Test it** in the sandbox, then let it run. You're live.",
            ],
          },
          {
            note: "You can do steps 3–5 in any order. The bot works the moment it has knowledge and Instagram is connected.",
            tone: "tip",
          },
        ],
      },
      {
        id: "connect-instagram",
        title: "Connect Instagram",
        summary: "Link your Instagram Business/Creator account securely.",
        blocks: [
          {
            steps: [
              "Go to **Dashboard → Connect Instagram** (or the banner on the overview page).",
              "A secure window opens — log in to Instagram and approve the permissions.",
              "You're redirected back automatically. Your @handle, profile picture and follower count appear on the dashboard.",
            ],
          },
          { h: "Requirements" },
          {
            list: [
              "A **Business** or **Creator** Instagram account (personal accounts aren't supported by the API).",
              "You must be able to log in to that account during connect.",
            ],
          },
          {
            note: "Each Botlify workspace connects one Instagram account. One Instagram account can only be linked to one workspace at a time.",
            tone: "info",
          },
          { h: "Troubleshooting" },
          {
            list: [
              "**Stuck on Instagram after logging in?** Just return to Botlify — the connection completes automatically in the background; the dashboard updates within a few seconds.",
              '**"Already connected elsewhere"** means that account is linked to another workspace. Disconnect it there first.',
            ],
          },
        ],
      },
    ],
  },
  {
    group: "AI Bot",
    sections: [
      {
        id: "ai-overview",
        title: "AI Bot overview",
        summary: "The AI that answers DMs 24/7 in your brand voice.",
        blocks: [
          {
            p: "The AI Bot replies to DMs, comments and story replies automatically. It only answers about **your** business — it never invents prices, links or policies you haven't given it. Replies are short, warm and human, in the language your customer wrote in.",
          },
          { h: "How a reply is decided" },
          {
            steps: [
              "It first checks your **FAQs** for an exact match (instant, no AI).",
              "Then your **knowledge sources** (website, PDFs, catalog).",
              "Then your **business description**.",
              "If it genuinely doesn't know, it says so honestly and offers a human follow-up.",
            ],
          },
          {
            note: "Powered by Google Gemini. The bot remembers the recent conversation and keeps a rolling summary so longer chats stay on track.",
            tone: "info",
          },
        ],
      },
      {
        id: "knowledge",
        title: "Knowledge base",
        summary: "Teach the bot from your website, documents, or a description.",
        blocks: [
          { p: "Give the bot everything it needs to answer accurately. Add any mix of:" },
          {
            list: [
              "**Website import** — paste your URL. Botlify deep-crawls the whole site in the background and learns it.",
              "**Documents** — upload a PDF, menu, price list or brochure. Even scanned/image PDFs are read.",
              "**Written description** — type your business info directly.",
            ],
          },
          {
            note: "Large sites and scanned PDFs are read in the background — you'll see 'Reading…' then 'Learned · N chars' when it's done. You can keep working meanwhile.",
            tone: "tip",
          },
          { h: "Keeping it fresh" },
          {
            p: "Website sources can be re-synced any time so the bot stays current with your latest pages and prices.",
          },
        ],
      },
      {
        id: "faqs-catalog",
        title: "FAQs & Catalog",
        summary: "Exact answers and real product prices.",
        blocks: [
          { h: "FAQs" },
          {
            p: "Add question/answer pairs for the things people ask most (returns, sizing, hours). An FAQ match is answered **instantly and verbatim** — no AI guesswork.",
          },
          { h: "Product catalog" },
          {
            p: "Import your products with prices once. The bot then quotes **exact prices** and can link customers straight to checkout — it never makes a price up.",
          },
        ],
      },
      {
        id: "smart-orders",
        title: "Smart Orders",
        summary: "Capture orders right inside the DM conversation.",
        blocks: [
          {
            p: "When a customer wants to buy, the bot collects the details — product, quantity, variant, name, address, phone, payment method — confirms the order in a friendly message, and records it for you.",
          },
          {
            list: [
              "Captured orders appear in your workspace and fire an `order.created` event.",
              "The contact is tagged **order** so you can find buyers instantly.",
              "The customer only ever sees the friendly confirmation, never the internal order data.",
            ],
          },
          {
            note: "Set your catalog and payment instructions in the AI Bot → Catalog tab to enable Smart Orders.",
            tone: "tip",
          },
        ],
      },
      {
        id: "test-bot",
        title: "Test your bot",
        summary: "Try messages safely before going live.",
        blocks: [
          {
            p: "Use the **Test bot** tab to chat with your AI exactly as a customer would. No real DM is sent and nothing is charged — it's a safe sandbox to tune your persona, knowledge and FAQs.",
          },
        ],
      },
    ],
  },
  {
    group: "Automations",
    sections: [
      {
        id: "automations",
        title: "Smart Automations",
        summary: "Trigger-based replies: welcome, comment→DM, keywords, stories.",
        blocks: [
          { p: "Automations fire on specific Instagram events. Set each one up in **Dashboard → Smart Automations**." },
          {
            table: {
              head: ["Automation", "Fires when…"],
              rows: [
                ["Welcome DM", "Someone messages you for the first time"],
                ["Comment → DM", "Someone comments your keyword on a post/reel"],
                ["DM keyword replies", "A message contains a word you chose (e.g. 'price')"],
                ["Story replies & mentions", "Someone replies to, or mentions, your story"],
                ["Business hours & away mode", "Inside/outside your hours, or holiday pause"],
                ["Default reply", "No other automation matches"],
              ],
            },
          },
          {
            note: "If you enable an automation but leave the message blank, Botlify sends a sensible professional default so it never sends nothing.",
            tone: "info",
          },
          { h: "Order of priority" },
          {
            p: "On an incoming DM, Botlify runs: holiday mode → active flows → away reply → keyword replies → welcome (first message only) → AI bot → default reply. The first one that matches responds.",
          },
        ],
      },
      {
        id: "flows",
        title: "Custom Flows",
        summary: "Drag-and-drop, multi-step conversation builder.",
        blocks: [
          {
            p: "Flows let you build branching, multi-step journeys visually — ask a question, wait for a reply, branch on the answer, send an image, assign to a human, and more. No code.",
          },
          {
            list: [
              "Trigger a flow on a keyword, a first message, or a comment.",
              "Mix automated steps with a hand-off to a teammate at any point.",
              "Great for guided buying, bookings, or qualification.",
            ],
          },
        ],
      },
      {
        id: "handoff",
        title: "Human handoff",
        summary: "The bot escalates to you when it should.",
        blocks: [
          {
            p: "When a customer needs a human (or asks for one), the bot flags the conversation and **notifies you** — your inbox lights up in real time, you get an email, and an event fires for any integration. Take over from the shared inbox, then hand back.",
          },
        ],
      },
    ],
  },
  {
    group: "Growth & content",
    sections: [
      {
        id: "scheduling",
        title: "Post scheduling",
        summary: "Plan & auto-publish posts, carousels, stories and reels.",
        blocks: [
          {
            p: "Schedule content to publish automatically at the perfect time. Supports:",
          },
          {
            list: [
              "**Feed image** — a single photo.",
              "**Carousel** — 2 to 10 images in one swipeable post.",
              "**Story** — a 24-hour story image.",
              "**Reel** — an MP4 video (with your audio baked in).",
            ],
          },
          { h: "How to schedule" },
          {
            steps: [
              "Open **Dashboard → Scheduled Posts → New post**.",
              "Pick a type, upload your media (drag multiple images for a carousel).",
              "Write a caption — or generate one with AI.",
              "See the **live Instagram preview**, pick a date & time, and schedule.",
            ],
          },
          {
            note: "Instagram can't attach its licensed catalog music to auto-published reels — bake your audio into the video file before uploading.",
            tone: "warn",
          },
        ],
      },
      {
        id: "broadcasts",
        title: "Broadcasts & Drip",
        summary: "Message a segment, or nurture leads over days.",
        blocks: [
          { h: "Broadcasts" },
          {
            p: "Send a promo or update to a whole segment of your contacts in one go. Botlify sends each message safely paced (about one per second) to respect Instagram's limits.",
          },
          {
            note: "Instagram only allows proactive DMs to people who messaged you recently (a 24-hour window). Broadcast to engaged contacts — not cold lists — to stay safe.",
            tone: "warn",
          },
          { h: "Drip campaigns" },
          {
            p: "Automated DM sequences that nurture leads over days — a welcome, a follow-up, an offer — sent hands-free on your schedule.",
          },
        ],
      },
      {
        id: "hashtags",
        title: "Hashtag research",
        summary: "AI-picked hashtags grouped by reach.",
        blocks: [
          {
            p: "Enter a topic and get hashtags grouped into **big** (high reach), **medium** (balanced), and **niche** (high engagement). Mix all three in every post for the best balance of reach and ranking.",
          },
        ],
      },
    ],
  },
  {
    group: "Operations",
    sections: [
      {
        id: "inbox-contacts",
        title: "Inbox & Contacts",
        summary: "One live inbox and an auto-built audience.",
        blocks: [
          { h: "Shared inbox" },
          {
            p: "Every conversation in one place. See what the bot is handling, jump in to take over, and hand back — with your whole team.",
          },
          { h: "Contacts" },
          {
            p: "Everyone who messages you is saved automatically, with tags and notes so you can segment your audience for broadcasts and see who your buyers are.",
          },
        ],
      },
      {
        id: "analytics",
        title: "Analytics",
        summary: "Know exactly what's driving replies and sales.",
        blocks: [
          {
            p: "Track replies, reply rate, AI-vs-manual, contacts and engagement — updated in real time. No spreadsheets, no opening five tabs.",
          },
        ],
      },
      {
        id: "team",
        title: "Team & permissions",
        summary: "Invite teammates with per-area access.",
        blocks: [
          {
            p: "Invite teammates and give each one granular, per-area access to your workspace — so agents can work the inbox without touching billing or settings.",
          },
        ],
      },
      {
        id: "webhooks",
        title: "Webhooks & apps",
        summary: "Send Botlify events to your other tools.",
        blocks: [
          {
            p: "Connect Botlify to Zapier, Make, or any custom endpoint and receive events as they happen — new lead, order captured, conversation escalated, and more.",
          },
          {
            code: "lead.created · order.created · conversation.escalated · reaction.received · dm.sent · comment.received",
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
        summary: "Basic $9 · Pro $19 · 3-day free trial.",
        blocks: [
          {
            table: {
              head: ["", "Basic — $9/mo", "Pro — $19/mo"],
              rows: [
                ["Instagram accounts", "1", "1"],
                ["Conversations", "1,000 / month", "Unlimited"],
                ["AI replies", "200 / day", "Unlimited · premium"],
                ["Automations", "Core", "All (stories, hours)"],
                ["Broadcasts & drip", "—", "Yes"],
                ["Shared team inbox", "—", "Yes (3 seats)"],
                ["Analytics", "Basic", "Advanced"],
                ["Remove branding", "—", "Yes"],
              ],
            },
          },
          {
            note: "Every paid plan includes a 3-day free trial (card required). Annual billing saves ~17% (2 months free). Cancel anytime from Dashboard → Plan & Billing.",
            tone: "info",
          },
        ],
      },
      {
        id: "faq",
        title: "FAQ & troubleshooting",
        summary: "Common questions, answered.",
        blocks: [
          { h: "The bot replied with a generic 'a teammate will reply' message" },
          {
            p: "That's the fallback shown when the AI can't answer — usually because it has no knowledge yet. Add a website, PDF or description in **AI Bot → Knowledge**, and make sure the bot is enabled.",
          },
          { h: "My follower count looks out of date" },
          {
            p: "It refreshes automatically while you're on the dashboard. Open the dashboard and give it a few seconds.",
          },
          { h: "A page said 'reload' after an update" },
          {
            p: "That happens briefly right after we ship an update — the page now refreshes itself automatically to load the new version.",
          },
          { h: "Can I message lots of people at once?" },
          {
            p: "Use Broadcasts to message a segment. Instagram only allows proactive DMs to people who messaged you within the last 24 hours, so broadcast to engaged contacts rather than cold lists.",
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
