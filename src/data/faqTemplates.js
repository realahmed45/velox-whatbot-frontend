/**
 * Botlify — hotel FAQ template library.
 *
 * Ready-made question/answer pairs a hotel can toggle on for its AI concierge,
 * grouped by category. Adding a template copies it into the workspace's
 * aiSettings.faqs[] (question + answer), where it can be edited freely.
 *
 * Answers are friendly, editable starting points — most contain a [bracketed
 * placeholder] to swap for the property's real details. Kept short so they read
 * well in a WhatsApp, Instagram, Messenger or Telegram message.
 *
 * Shape is unchanged from the previous library (FAQ_CATEGORIES,
 * FAQ_TEMPLATES, TEMPLATES_BY_CATEGORY, FAQ_TEMPLATE_COUNT) so the AI
 * Assistant screen consumes it exactly as before.
 */

export const FAQ_CATEGORIES = [
  { key: "booking", label: "Booking & availability", emoji: "📅" },
  { key: "rates", label: "Rates & payment", emoji: "🏷️" },
  { key: "rooms", label: "Rooms", emoji: "🛏️" },
  { key: "checkin", label: "Check-in & check-out", emoji: "🔑" },
  { key: "amenities", label: "Amenities & facilities", emoji: "🏊" },
  { key: "food", label: "Breakfast & dining", emoji: "🍳" },
  { key: "location", label: "Location & getting here", emoji: "📍" },
  { key: "policies", label: "Policies & cancellation", emoji: "📋" },
  { key: "guests", label: "Families, groups & pets", emoji: "👨‍👩‍👧" },
  { key: "support", label: "During your stay", emoji: "💬" },
];

// Each template: { category, question, answer }. Placeholders in [brackets].
export const FAQ_TEMPLATES = [
  // ── Booking & availability ─────────────────────────────────────────
  { category: "booking", question: "Do you have rooms available?", answer: "Happy to check! 😊 Which dates are you looking at, and how many guests?" },
  { category: "booking", question: "How do I book?", answer: "I can take care of it right here — just tell me your dates and how many guests. Or book directly at [your booking link] 🔗" },
  { category: "booking", question: "Can I book for tonight?", answer: "Let me check tonight's availability for you — how many guests will be staying?" },
  { category: "booking", question: "How far in advance should I book?", answer: "We'd recommend booking [X weeks] ahead, especially in [peak season]. Popular dates fill up fast!" },
  { category: "booking", question: "Can I hold a room?", answer: "We can usually hold a room for a short while ⏳. Tell me your dates and I'll see what I can do." },
  { category: "booking", question: "Do I need to pay a deposit?", answer: "We ask for [deposit amount/percentage] to confirm the booking, with the balance due [when]. 💳" },
  { category: "booking", question: "Can I change my booking dates?", answer: "Usually yes, subject to availability! Share your booking name or reference and I'll check what's possible." },
  { category: "booking", question: "Did my booking go through?", answer: "Let me confirm for you 🔍 — what name is the reservation under?" },
  { category: "booking", question: "Do you take walk-ins?", answer: "We do when we have rooms free 🚪. Booking ahead is safer, but message me and I'll tell you what's open right now." },
  { category: "booking", question: "Can I book for someone else?", answer: "Absolutely! Just give me the guest's name and your dates, and I'll set it up. 😊" },

  // ── Rates & payment ────────────────────────────────────────────────
  { category: "rates", question: "How much is a room per night?", answer: "Rates start from [amount] per night and change with the season and dates 🏷️. Tell me your dates and I'll quote you exactly." },
  { category: "rates", question: "What's your best rate?", answer: "Booking direct with us is always the best price — no commission added. Share your dates and I'll send you our lowest available rate! ✨" },
  { category: "rates", question: "Is breakfast included in the price?", answer: "[Yes, breakfast is included / Breakfast is [amount] per person per day]. 🍳" },
  { category: "rates", question: "Are taxes included?", answer: "Our quoted rates [include/exclude] taxes and fees — the total you see before confirming is exactly what you pay. ✅" },
  { category: "rates", question: "What payment methods do you accept?", answer: "We accept [cards, bank transfer, cash] 💳. Whatever's easiest for you!" },
  { category: "rates", question: "Can I pay on arrival?", answer: "[Yes, you can settle at check-in / We ask for payment in advance to confirm the room]. Let me know what suits you." },
  { category: "rates", question: "Do you offer discounts for long stays?", answer: "We do! Stays of [X nights] or more get [discount] off 🎉. How long were you thinking?" },
  { category: "rates", question: "Do you have any offers right now?", answer: "Let me check what's running for your dates — when are you planning to visit? ✨" },
  { category: "rates", question: "Is there a city tax?", answer: "There's a local tax of [amount] per person per night, collected at the property. 📋" },
  { category: "rates", question: "Can I get an invoice?", answer: "Of course 🧾. Send me the billing name and address and we'll have it ready for you." },

  // ── Rooms ──────────────────────────────────────────────────────────
  { category: "rooms", question: "What room types do you have?", answer: "We have [room types, e.g. Standard Double, Deluxe Twin, Family Suite] 🛏️. Want me to describe any of them?" },
  { category: "rooms", question: "How big are the rooms?", answer: "Our rooms range from about [size] — [room type] is our most spacious. Happy to send photos!" },
  { category: "rooms", question: "Do rooms have air conditioning?", answer: "[Yes, every room is air-conditioned / Rooms have [heating/fans]] ❄️." },
  { category: "rooms", question: "Is there a private bathroom?", answer: "[Yes, all rooms have a private en-suite bathroom / [details]] 🚿." },
  { category: "rooms", question: "Do you have rooms with a view?", answer: "We do! Our [room type] looks out over [view] 🌅. Would you like me to check availability?" },
  { category: "rooms", question: "Can I get a quiet room?", answer: "Of course — I'll note a preference for a quieter room away from [the street/lift]. We'll do our best on the day! 🤫" },
  { category: "rooms", question: "Do rooms have a kettle or fridge?", answer: "[Yes, every room has [amenities] / [room type] includes [amenities]] ☕." },
  { category: "rooms", question: "Can I see photos of the room?", answer: "Absolutely 📸 — here you go: [your photos link]. Let me know which one you like!" },
  { category: "rooms", question: "Do you have connecting rooms?", answer: "[Yes, we have connecting rooms — great for families / We don't, but we can book you adjacent rooms]. 👨‍👩‍👧" },
  { category: "rooms", question: "Is there a lift?", answer: "[Yes, there's a lift to all floors / We're a [X]-storey property without a lift — I can request a lower floor for you]. 🛗" },

  // ── Check-in & check-out ───────────────────────────────────────────
  { category: "checkin", question: "What time is check-in?", answer: "Check-in is from [time] 🔑. Arriving earlier? Let me know and we'll try to help." },
  { category: "checkin", question: "What time is check-out?", answer: "Check-out is by [time] ⏰. Need a little longer? Just ask on the day." },
  { category: "checkin", question: "Can I check in early?", answer: "We'll do our best, subject to the room being ready 😊. What time do you expect to arrive?" },
  { category: "checkin", question: "Can I check out late?", answer: "Late check-out is [free if available / [amount]] ⏳. Let the front desk know the evening before and we'll sort it." },
  { category: "checkin", question: "I'm arriving late at night", answer: "No problem — [reception is open 24/7 / we'll arrange a late arrival for you]. What time do you expect to get in? 🌙" },
  { category: "checkin", question: "What do I need to bring at check-in?", answer: "Just a valid ID or passport for each guest, and the card used to book if you paid online. 🪪" },
  { category: "checkin", question: "Can I leave my luggage?", answer: "Yes! We can store your bags [before check-in and after check-out] free of charge 🧳." },
  { category: "checkin", question: "Is there someone at reception all night?", answer: "[Reception is staffed 24 hours / Reception is open [hours], and there's a number for after-hours help]. 🛎️" },

  // ── Amenities & facilities ─────────────────────────────────────────
  { category: "amenities", question: "Is there free WiFi?", answer: "Yes — free WiFi throughout the property 📶. The details are in your room on arrival." },
  { category: "amenities", question: "Do you have parking?", answer: "[Yes, free on-site parking / Parking is [amount] per night / There's public parking [distance] away] 🅿️." },
  { category: "amenities", question: "Do you have a swimming pool?", answer: "[Yes! The pool is open [hours] / We don't have a pool, but [nearby option]] 🏊." },
  { category: "amenities", question: "Is there a gym?", answer: "[Yes, our gym is open [hours] and free for guests / We don't have a gym on site]. 💪" },
  { category: "amenities", question: "Do you have a spa?", answer: "[Yes — treatments can be booked at reception / We don't have a spa, but there's one nearby I can recommend]. 💆" },
  { category: "amenities", question: "Is there a laundry service?", answer: "[Yes, laundry is available for [amount] / There's a laundrette [distance] away] 🧺." },
  { category: "amenities", question: "Do you have airport transfers?", answer: "We do! A transfer is [amount] each way 🚗. Send me your flight details and I'll arrange it." },
  { category: "amenities", question: "Is the property accessible?", answer: "[Yes — we have step-free access and accessible rooms / [details]] ♿. Tell me what you need and I'll confirm." },
  { category: "amenities", question: "Do you have a business centre or workspace?", answer: "[Yes, there's a workspace with printing / Rooms have a desk and fast WiFi if you're working]. 💻" },

  // ── Breakfast & dining ─────────────────────────────────────────────
  { category: "food", question: "Do you serve breakfast?", answer: "Yes! Breakfast is served [hours] in [location] 🍳. [Included in your rate / [amount] per person]." },
  { category: "food", question: "What's for breakfast?", answer: "We serve [buffet/continental/à la carte] with [examples]. Let me know if you have dietary needs! 🥐" },
  { category: "food", question: "Do you have a restaurant?", answer: "[Yes, our restaurant is open [hours] / We don't have a restaurant, but there are great places a short walk away]. 🍽️" },
  { category: "food", question: "Is there room service?", answer: "[Yes, room service runs [hours] / We don't offer room service, but there's plenty of delivery nearby]. 🛎️" },
  { category: "food", question: "Can you cater for dietary requirements?", answer: "Absolutely — we handle [vegetarian, vegan, halal, gluten-free] 🌱. Tell me what you need and I'll pass it to the kitchen." },
  { category: "food", question: "Is there a bar?", answer: "[Yes, our bar is open [hours] / We don't have a bar on site]. 🍸" },
  { category: "food", question: "Can I get breakfast early for a flight?", answer: "We can usually arrange an early or packed breakfast 🥪 — just let reception know the night before." },

  // ── Location & getting here ────────────────────────────────────────
  { category: "location", question: "Where exactly are you located?", answer: "We're at [full address] 📍. Here's a map: [maps link]." },
  { category: "location", question: "How far are you from the airport?", answer: "About [X] minutes / [X] km from [airport] ✈️. I can arrange a transfer if you'd like." },
  { category: "location", question: "How do I get to you from the airport?", answer: "[Taxi takes about [X] min and costs around [amount] / There's a direct [train/bus]] 🚕. Or we can pick you up — just ask!" },
  { category: "location", question: "What's nearby?", answer: "You're right by [attractions/landmarks] 🗺️. Happy to recommend places once you arrive!" },
  { category: "location", question: "Are you close to the beach?", answer: "[Yes — about [X] minutes' walk / We're [distance] from the nearest beach] 🏖️." },
  { category: "location", question: "Is it easy to get around from there?", answer: "Very! [Public transport/taxis] are right on the doorstep, and lots is walkable. 🚶" },
  { category: "location", question: "Is the area safe?", answer: "Yes — it's a [quiet/central] neighbourhood and guests walk about comfortably. Reception is always happy to advise. 😊" },

  // ── Policies & cancellation ────────────────────────────────────────
  { category: "policies", question: "What's your cancellation policy?", answer: "Free cancellation up to [timeframe] before check-in ✅. After that, [terms]." },
  { category: "policies", question: "Can I get a refund?", answer: "Refunds follow our cancellation policy — [terms]. Send me your booking reference and I'll check yours." },
  { category: "policies", question: "Do you allow smoking?", answer: "We're a [non-smoking] property 🚭. [There's a designated area outside]." },
  { category: "policies", question: "Is there a minimum stay?", answer: "[No minimum / A [X]-night minimum applies on [dates/weekends]]. What dates were you thinking?" },
  { category: "policies", question: "What's the age requirement to book?", answer: "The main guest needs to be [18/21] or over to check in. 🪪" },
  { category: "policies", question: "Can I have visitors in my room?", answer: "Guests are welcome in the public areas; overnight visitors need to be registered at reception. 🙂" },
  { category: "policies", question: "Do you have quiet hours?", answer: "Yes — quiet hours are [times] so everyone sleeps well. 🤫" },
  { category: "policies", question: "What happens if I don't show up?", answer: "A no-show is charged [terms]. If your plans change, message me as early as you can and we'll help. 🙏" },

  // ── Families, groups & pets ────────────────────────────────────────
  { category: "guests", question: "Are children welcome?", answer: "Very much so! 👶 Children [age] and under stay [free/[amount]]. How many are travelling?" },
  { category: "guests", question: "Do you have cots or extra beds?", answer: "[Yes — cots are free and extra beds are [amount] / [details]] 🛏️. Just let me know what you need." },
  { category: "guests", question: "Are pets allowed?", answer: "[Yes, pets are welcome for [amount] per stay / Sorry, we can't accommodate pets — assistance animals always welcome] 🐾." },
  { category: "guests", question: "How many people can stay in a room?", answer: "Our [room type] sleeps up to [X] guests. Tell me your group size and I'll suggest the best fit! 😊" },
  { category: "guests", question: "Can you accommodate a large group?", answer: "We'd love to 🎉. How many guests and which dates? I'll check what we can put together." },
  { category: "guests", question: "Do you host events or weddings?", answer: "[Yes — tell me your date and guest count and I'll pass you to our events team / We don't host events, but we're happy to block rooms for your guests]. 💐" },

  // ── During your stay ───────────────────────────────────────────────
  { category: "support", question: "Can I talk to a person?", answer: "Of course! 🙋 I'll flag this for the front desk — someone will be with you shortly." },
  { category: "support", question: "How do I contact reception?", answer: "You can message me here any time, call [phone], or dial [extension] from your room 📞." },
  { category: "support", question: "Something's wrong with my room", answer: "I'm sorry about that 😔. Tell me the room number and what's happening and I'll get someone up right away." },
  { category: "support", question: "Can I request extra towels?", answer: "Of course! 🧻 What's your room number and I'll send housekeeping." },
  { category: "support", question: "What's the WiFi password?", answer: "The network is [network name] and the password is [password] 📶. Give me a shout if it won't connect." },
  { category: "support", question: "Can you book a taxi for me?", answer: "Happy to 🚕. What time do you need it, and where are you heading?" },
  { category: "support", question: "Can you recommend somewhere to eat?", answer: "Always! 🍽️ Tell me what you fancy and your budget, and I'll point you to a local favourite." },
  { category: "support", question: "I left something behind", answer: "Let's find it 🔎. Tell me your room number, your dates and what it was — we'll check lost property." },
  { category: "support", question: "How do I leave a review?", answer: "That would mean a lot to us 🙏 — you can leave one here: [review link]. Thank you!" },
];

export const TEMPLATES_BY_CATEGORY = FAQ_CATEGORIES.map((c) => ({
  ...c,
  items: FAQ_TEMPLATES.filter((t) => t.category === c.key),
}));

export const FAQ_TEMPLATE_COUNT = FAQ_TEMPLATES.length;
