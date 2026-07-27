/**
 * Botlify — FAQ template library.
 *
 * ~100 ready-made question/answer pairs the user can toggle on for their AI
 * bot, grouped by category. Adding a template copies it into the workspace's
 * aiSettings.faqs[] (question + answer), where the user can edit it freely.
 *
 * Answers are written as friendly, editable starting points — most contain a
 * [bracketed placeholder] the user should replace with their real details.
 * Kept intentionally short so they read well in an Instagram DM.
 */

export const FAQ_CATEGORIES = [
  { key: "getting_started", label: "Getting started", emoji: "👋" },
  { key: "ordering", label: "Ordering & payment", emoji: "🛒" },
  { key: "shipping", label: "Shipping & delivery", emoji: "🚚" },
  { key: "returns", label: "Returns & refunds", emoji: "↩️" },
  { key: "products", label: "Products & stock", emoji: "📦" },
  { key: "pricing", label: "Pricing & discounts", emoji: "🏷️" },
  { key: "booking", label: "Booking & appointments", emoji: "📅" },
  { key: "services", label: "Services & work", emoji: "💼" },
  { key: "creators", label: "Creators & collabs", emoji: "✨" },
  { key: "support", label: "Support & contact", emoji: "💬" },
  { key: "trust", label: "Trust & policies", emoji: "🔒" },
];

// Each template: { category, question, answer }. Placeholders in [brackets].
export const FAQ_TEMPLATES = [
  // ── Getting started ────────────────────────────────────────────────
  { category: "getting_started", question: "Hi! What do you sell?", answer: "Hey! 👋 We're [your brand] and we specialise in [what you sell]. What can I help you find today?" },
  { category: "getting_started", question: "Are you a real person?", answer: "You're chatting with our assistant right now 🤖 — but a real teammate is always one message away if you need them!" },
  { category: "getting_started", question: "How does this work?", answer: "Super simple — tell me what you're looking for and I'll point you to the right product, price or link. Ask me anything!" },
  { category: "getting_started", question: "Where are you based?", answer: "We're based in [city, country] and we serve customers all over [region]. 🌍" },
  { category: "getting_started", question: "Do you have a website?", answer: "Yes! You can browse everything here: [your website link] 🔗" },
  { category: "getting_started", question: "Can I see your catalogue?", answer: "Of course! Here's our full catalogue: [link]. Let me know if anything catches your eye 😊" },
  { category: "getting_started", question: "What are your hours?", answer: "We're online [days & hours, e.g. Mon–Sat, 9am–8pm]. Messages outside those hours are answered first thing the next day! ⏰" },

  // ── Ordering & payment ─────────────────────────────────────────────
  { category: "ordering", question: "How do I place an order?", answer: "Easy! Just tell me what you'd like, or order directly here: [order link]. I'll guide you through the rest. 🛍️" },
  { category: "ordering", question: "How can I pay?", answer: "We accept [payment methods — e.g. card, bank transfer, cash on delivery]. Whatever's easiest for you!" },
  { category: "ordering", question: "Do you offer cash on delivery?", answer: "Yes! 💵 Cash on delivery is available across [area/country]. You only pay when your order arrives." },
  { category: "ordering", question: "Is online payment safe?", answer: "Absolutely 🔒 — all payments are processed through a secure, encrypted checkout. Your details are never stored by us." },
  { category: "ordering", question: "Can I change my order?", answer: "If your order hasn't shipped yet, we can usually change it! Just send me your order number and what you'd like to update." },
  { category: "ordering", question: "Can I cancel my order?", answer: "Sure — as long as it hasn't shipped. Share your order number and I'll get it sorted for you." },
  { category: "ordering", question: "I didn't get an order confirmation", answer: "No worries! Send me the email or number you used and I'll check your order status right away. 🔍" },
  { category: "ordering", question: "Do you take custom orders?", answer: "We love custom requests! ✨ Tell me what you have in mind and I'll let you know if we can make it happen." },
  { category: "ordering", question: "What's the minimum order?", answer: "Our minimum order is [amount/quantity]. Let me know what you need and I'll confirm!" },
  { category: "ordering", question: "Do you sell wholesale?", answer: "Yes, we offer wholesale pricing for bulk orders 📦. Tell me the quantity you're after and I'll share our rates." },

  // ── Shipping & delivery ────────────────────────────────────────────
  { category: "shipping", question: "Do you ship to my area?", answer: "We ship across [countries/regions] 🚚. Tell me your city and I'll confirm delivery and timing for you!" },
  { category: "shipping", question: "How much is shipping?", answer: "Shipping is [amount], and it's FREE on orders over [amount] 🎉. Where should it go?" },
  { category: "shipping", question: "How long does delivery take?", answer: "Most orders arrive within [X–Y] business days after dispatch. I'll always share tracking so you can follow along! 📦" },
  { category: "shipping", question: "Do you offer free shipping?", answer: "Yes! Shipping is free on orders over [amount] 🚚✨. Anything below that is a flat [amount]." },
  { category: "shipping", question: "Can I track my order?", answer: "Definitely! Once it ships you'll get a tracking link. Send me your order number and I'll pull it up for you. 🔎" },
  { category: "shipping", question: "My order is late", answer: "So sorry about that! 🙏 Send me your order number and I'll check exactly where it is right now." },
  { category: "shipping", question: "Do you offer express delivery?", answer: "We do! Express delivery gets it to you in [X] days for [amount]. Want me to add it to your order? ⚡" },
  { category: "shipping", question: "Do you ship internationally?", answer: "Yes, we ship worldwide 🌍. International delivery takes about [X–Y] days — tell me your country for exact rates." },
  { category: "shipping", question: "Can I collect in person?", answer: "Yes! You can pick up from [location] during [hours]. Just let me know and I'll set it aside for you. 🏬" },

  // ── Returns & refunds ──────────────────────────────────────────────
  { category: "returns", question: "What's your return policy?", answer: "You can return any item within [X] days if it's unused and in its original packaging. Want me to start a return? ↩️" },
  { category: "returns", question: "How do I return an item?", answer: "Easy — send me your order number and the reason, and I'll email you a return label + next steps. 📮" },
  { category: "returns", question: "When will I get my refund?", answer: "Refunds are processed within [X] business days of us receiving your return, back to your original payment method. 💳" },
  { category: "returns", question: "Can I exchange for a different size?", answer: "Of course! 🔄 Tell me your order number and the size you'd like instead, and I'll arrange the swap." },
  { category: "returns", question: "My item arrived damaged", answer: "Oh no, I'm sorry! 😔 Please send a quick photo and your order number — we'll replace it or refund you straight away." },
  { category: "returns", question: "I received the wrong item", answer: "That's on us — apologies! 🙏 Send me a photo and your order number and I'll fix it immediately." },
  { category: "returns", question: "Do returns cost anything?", answer: "Returns are [free / a flat amount]. For faulty or wrong items, we always cover the return cost. 👍" },

  // ── Products & stock ───────────────────────────────────────────────
  { category: "products", question: "Is this in stock?", answer: "Let me check for you! 🔍 Tell me the exact item (and size/colour) and I'll confirm availability right away." },
  { category: "products", question: "Do you have other colours?", answer: "We might! 🎨 Tell me which product you mean and I'll list all the colours we have available." },
  { category: "products", question: "What sizes do you have?", answer: "We carry [size range]. Send me the item you like and I'll confirm what's in stock in your size! 📏" },
  { category: "products", question: "When will you restock?", answer: "That item is restocking around [date] ⏳. Want me to message you the moment it's back?" },
  { category: "products", question: "Can you tell me more about this product?", answer: "Happy to! Which product are you looking at? Send me the name or a screenshot and I'll share all the details. 📋" },
  { category: "products", question: "What material is it made of?", answer: "It's made from [material] — [key quality, e.g. soft, durable, breathable]. Anything specific you'd like to know? 🧵" },
  { category: "products", question: "Do you have a size guide?", answer: "Yes! Here's our full size guide: [link] 📐. Tell me your measurements and I'll recommend the best fit." },
  { category: "products", question: "Is this good for gifting?", answer: "Perfect for gifts! 🎁 We also offer gift wrapping for [amount] — want me to add it?" },
  { category: "products", question: "Do you offer gift wrapping?", answer: "We do! 🎀 Gift wrapping is [free / amount] and we can add a personal note too. Just say the word." },

  // ── Pricing & discounts ────────────────────────────────────────────
  { category: "pricing", question: "How much is this?", answer: "Tell me exactly which item you mean and I'll give you the price right away! 🏷️" },
  { category: "pricing", question: "Do you have any discounts?", answer: "Yes! 🎉 Right now you can use code [CODE] for [X]% off. Want me to share what's included?" },
  { category: "pricing", question: "Is there a discount for first orders?", answer: "There is! First-time customers get [X]% off with code [CODE]. Welcome aboard! 🥳" },
  { category: "pricing", question: "Do you have a sale on?", answer: "We do! 🔥 [Details of current sale]. Want me to send you the best deals right now?" },
  { category: "pricing", question: "Can I get a bulk discount?", answer: "Definitely — the more you order, the more you save 📦. Tell me the quantity and I'll share your price." },
  { category: "pricing", question: "Why is this priced this way?", answer: "Great question! Our pricing reflects [quality/materials/handmade/etc.] 💎. Happy to walk you through the value." },
  { category: "pricing", question: "Do you price match?", answer: "Send me the link or screenshot of the other price and I'll see what I can do for you! 🤝" },
  { category: "pricing", question: "Do you have a loyalty program?", answer: "Yes! Earn points on every order and redeem them for discounts 🎁. Want me to sign you up?" },

  // ── Booking & appointments ─────────────────────────────────────────
  { category: "booking", question: "How do I book an appointment?", answer: "Easy! Pick a time here: [booking link] 📅, or tell me your preferred day and I'll check availability." },
  { category: "booking", question: "What are your available times?", answer: "I have openings on [days/times]. What works best for you and I'll lock it in? ⏰" },
  { category: "booking", question: "How much does a session cost?", answer: "A [session type] is [amount] for [duration]. Want me to book you in? 💼" },
  { category: "booking", question: "Can I reschedule?", answer: "Of course! Just tell me your current booking and the new time you'd like, and I'll update it for you. 🔄" },
  { category: "booking", question: "What's your cancellation policy?", answer: "You can cancel free up to [X hours] before your appointment. After that a [amount/%] fee applies. 🙏" },
  { category: "booking", question: "Do you take walk-ins?", answer: "We do when we have space! But booking ahead guarantees your spot 📅. Want me to reserve one?" },
  { category: "booking", question: "Where are you located?", answer: "We're at [address] 📍. I can send directions or a map link if that helps!" },
  { category: "booking", question: "Do you offer online sessions?", answer: "Yes! We offer virtual sessions over [Zoom/Meet] 💻. Want me to book you a remote slot?" },

  // ── Services & work ────────────────────────────────────────────────
  { category: "services", question: "What services do you offer?", answer: "We offer [list your main services] 💼. Tell me a bit about what you need and I'll point you to the right one!" },
  { category: "services", question: "How much do you charge?", answer: "Pricing depends on the project 📊. Tell me what you're after and I'll give you a clear quote." },
  { category: "services", question: "How long does a project take?", answer: "Most projects take around [timeframe] ⏳, depending on scope. Share your details and I'll give you a timeline." },
  { category: "services", question: "Can I see your portfolio?", answer: "Absolutely! Here's some of our recent work: [link] ✨. Let me know what style you're drawn to." },
  { category: "services", question: "Do you offer a free consultation?", answer: "Yes! 🎉 We offer a free [X-minute] consultation to understand your needs. Want me to book one?" },
  { category: "services", question: "How do I get started?", answer: "Simple — tell me what you need and I'll walk you through the first steps. Or book a call here: [link] 🚀" },
  { category: "services", question: "Do you require a deposit?", answer: "Yes, we take a [%/amount] deposit to secure your slot, with the balance due [when]. Fully explained before you commit! 💳" },
  { category: "services", question: "Do you work with clients abroad?", answer: "We do! 🌍 We work with clients worldwide, remotely. Tell me your timezone and we'll make it work." },

  // ── Creators & collabs ─────────────────────────────────────────────
  { category: "creators", question: "Do you do collaborations?", answer: "Love collabs! 🤝 Tell me a bit about you and what you have in mind, and I'll pass it to the team." },
  { category: "creators", question: "How do I work with you?", answer: "Amazing! Share your niche, audience size and idea, and we'll see if it's a fit. Excited to hear from you! ✨" },
  { category: "creators", question: "What are your rates?", answer: "Rates depend on the deliverables 📊. Send me what you're planning and I'll share a media kit + pricing." },
  { category: "creators", question: "Can I get a discount code for my audience?", answer: "Possibly! 🎁 Tell me about your audience and we can set up a custom code for your followers." },
  { category: "creators", question: "Do you send PR packages?", answer: "We do for the right fit! 📦 Share your profile and reach and we'll take a look." },
  { category: "creators", question: "Where can I find your media kit?", answer: "Here you go: [media kit link] 📄. Let me know if you'd like anything tailored to your campaign!" },
  { category: "creators", question: "Can I repost your content?", answer: "Please do — just tag and credit us 🙌. We love seeing our stuff shared!" },
  { category: "creators", question: "Do you offer affiliate partnerships?", answer: "Yes! Earn commission on every sale you refer 💰. Want me to send you the affiliate details?" },

  // ── Support & contact ──────────────────────────────────────────────
  { category: "support", question: "How can I contact you?", answer: "You can reach us right here in DMs, or by email at [your email] 📧. We usually reply within [timeframe]!" },
  { category: "support", question: "I need help with my order", answer: "I'm on it! 🙌 Send me your order number and tell me what's going on — we'll sort it out fast." },
  { category: "support", question: "Can I talk to a human?", answer: "Of course! 🙋 I'll flag this for a teammate — they'll jump in as soon as they're available." },
  { category: "support", question: "How fast do you reply?", answer: "We usually reply within [timeframe] during business hours ⏰. I'm here 24/7 for quick questions in the meantime!" },
  { category: "support", question: "I have a complaint", answer: "I'm really sorry to hear that 😔. Tell me what happened and I'll make sure the right person makes it right." },
  { category: "support", question: "Do you have a phone number?", answer: "You can call us on [phone] during [hours] 📞, or just keep chatting here — whatever's easiest!" },
  { category: "support", question: "Can you help me choose?", answer: "That's what I'm here for! 😊 Tell me what you're looking for and your budget, and I'll recommend the perfect option." },

  // ── Trust & policies ───────────────────────────────────────────────
  { category: "trust", question: "Is my data safe?", answer: "100% 🔒. We never share your details, and payments run through a secure encrypted checkout." },
  { category: "trust", question: "Are you a legit business?", answer: "We are! ✅ You can see reviews from real customers here: [link]. Happy to answer anything that builds your confidence." },
  { category: "trust", question: "Do you have reviews?", answer: "Loads! ⭐ Check out what customers say here: [link]. We're proud of the feedback!" },
  { category: "trust", question: "What's your privacy policy?", answer: "You can read our full privacy policy here: [link] 🔒. Short version: your data stays yours." },
  { category: "trust", question: "Do you offer a guarantee?", answer: "Yes! We stand behind everything with a [X-day] satisfaction guarantee 🛡️. Not happy? We'll make it right." },
  { category: "trust", question: "How long have you been in business?", answer: "We've been serving happy customers since [year] 🎉. Thanks for considering us!" },
  { category: "trust", question: "Are your products authentic?", answer: "Always 💯. Everything we sell is genuine and sourced directly. No fakes, ever." },
];

export const TEMPLATES_BY_CATEGORY = FAQ_CATEGORIES.map((c) => ({
  ...c,
  items: FAQ_TEMPLATES.filter((t) => t.category === c.key),
}));

export const FAQ_TEMPLATE_COUNT = FAQ_TEMPLATES.length;
