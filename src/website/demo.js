/**
 * Demo content for the template gallery — what a design looks like with a
 * full, realistic hotel behind it. Used when there's no hotel data yet, and as
 * filler for anything the hotel's own data leaves empty (so a preview never
 * shows a half-empty page).
 *
 * Photo ids mirror backend/src/services/website/stockPhotos.js.
 */
const u = (id, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const STOCK = {
  resortPool: u("1566073771259-6a8506099945"),
  hotelFacade: u("1542314831-068cd1dbfeeb"),
  poolPalms: u("1520250497591-112f2f40a3f4"),
  poolSunset: u("1571003123894-1f0594d2b5d9"),
  infinityPool: u("1586611292717-f828b167408c"),
  resortTropical: u("1540541338287-41700207dee6"),
  baliVillaPool: u("1602002418082-a4443e081dd1"),
  roomBed: u("1582719478250-c89cae4dc85b", 1200),
  roomSuite: u("1611892440504-42a792e24d32", 1200),
  roomDouble: u("1590490360182-c33d57733427", 1200),
  roomView: u("1561501900-3701fa6a0864", 1200),
  roomKing: u("1566665797739-1674de7a421a", 1200),
  lobby: u("1564501049412-61c2a3083791"),
  interior: u("1445019980597-93fa8acb246c"),
  bathroomStone: u("1552321554-5fefe8c9ef14"),
  spa: u("1544161515-4ab6ce6db874"),
  restaurant: u("1414235077428-338989a2e8c0"),
  beach: u("1507525428034-b723cf961d3e"),
};

export const DEMO_SITE = {
  slug: "the-saffron-house",
  templateId: "coastal",
  published: true,
  accent: "",
  whatsapp: "6281234567890",
  bookingUrl: null,
  hotel: {
    name: "The Saffron House",
    type: "resort",
    typeLabel: "Resort",
    city: "Seminyak",
    country: "Indonesia",
    address: "Jl. Kayu Aya No. 12",
    checkIn: "14:00",
    checkOut: "11:00",
    currency: "USD",
    starRating: 4,
  },
  content: {
    hero: {
      title: "The Saffron House",
      subtitle: "Your escape in Seminyak — pools, sunsets and nowhere you need to be.",
      image: STOCK.resortTropical,
    },
    about: {
      heading: "Welcome to The Saffron House",
      body:
        "The Saffron House is a resort made for slow days in Seminyak. We keep things simple: comfortable rooms, honest prices and people who actually answer when you message.\n\nChoose from garden rooms, ocean-view suites and two private pool villas. Check-in is from 14:00 and check-out by 11:00, and if you need something different, just ask — we'll always try.\n\nBook directly with us for the best rate. Message us on WhatsApp any time; we reply fast, in your language.",
      image: STOCK.poolSunset,
    },
    highlights: [
      { title: "Book direct, pay less", body: "No booking-site fees. Message us and we'll confirm your room in minutes." },
      { title: "Answers in minutes", body: "Questions about rooms, transfers or the area? We reply on WhatsApp day and night." },
      { title: "The best of Seminyak", body: "Beach clubs, cafés and sunsets a short walk away — ask us for our favourite spots." },
    ],
    amenities: [
      "Infinity pool", "Free Wi-Fi", "Spa treatments", "Restaurant & bar",
      "Airport transfers", "Daily housekeeping", "Yoga deck", "Room service",
    ],
    gallery: [
      { url: STOCK.resortTropical, caption: "Tropical gardens" },
      { url: STOCK.infinityPool, caption: "Infinity pool" },
      { url: STOCK.roomSuite, caption: "Ocean suite" },
      { url: STOCK.spa, caption: "The spa" },
      { url: STOCK.restaurant, caption: "Dinner at the terrace" },
      { url: STOCK.poolSunset, caption: "Evenings by the pool" },
      { url: STOCK.bathroomStone, caption: "Stone bathrooms" },
      { url: STOCK.beach, caption: "Five minutes to the beach" },
    ],
    location: {
      address: "Jl. Kayu Aya No. 12, Seminyak, Indonesia",
      mapQuery: "Seminyak, Bali, Indonesia",
      directions:
        "We're 25 minutes from Ngurah Rai airport. Send us your flight number on WhatsApp and our driver will meet you at arrivals.",
    },
    contact: { phone: "+62 812 3456 7890", email: "hello@saffronhouse.com", whatsapp: "6281234567890" },
    testimonials: [
      { quote: "The kind of place you plan your next trip around. Every message answered within minutes.", author: "Sample review", source: "Google" },
      { quote: "Spotless rooms, the most beautiful pool, and breakfast I still think about.", author: "Sample review", source: "Booking.com" },
      { quote: "They organised our airport pickup and dinner reservations over WhatsApp. Effortless.", author: "Sample review", source: "Airbnb" },
    ],
    seo: { title: "The Saffron House — Resort in Seminyak", description: "" },
  },
  rooms: [
    {
      id: "demo-1", name: "Garden Room", price: 95, currency: "USD", maxOccupancy: 2,
      bedConfig: "1 queen bed", sizeSqm: 28, image: STOCK.roomBed, images: [],
      description: "Cool, quiet and opening onto the frangipani garden. The easy choice for couples.",
      amenities: ["Garden view", "Rain shower", "Air conditioning"], breakfastIncluded: true,
    },
    {
      id: "demo-2", name: "Ocean Suite", price: 160, currency: "USD", maxOccupancy: 3,
      bedConfig: "1 king bed", sizeSqm: 42, image: STOCK.roomSuite, images: [],
      description: "A private balcony over the pool with a glimpse of the ocean beyond.",
      amenities: ["Balcony", "Bathtub", "Minibar"], breakfastIncluded: true,
    },
    {
      id: "demo-3", name: "Pool Villa", price: 290, currency: "USD", maxOccupancy: 4,
      bedConfig: "2 king beds", sizeSqm: 90, image: STOCK.roomView, images: [],
      description: "Your own walled villa with a plunge pool, outdoor bathroom and a day bed made for napping.",
      amenities: ["Private pool", "Kitchenette", "Outdoor bath"], breakfastIncluded: true,
    },
  ],
};

/**
 * The hotel's own site, with demo filler only where it has nothing yet —
 * so a preview of a brand-new hotel still looks finished.
 */
export function withDemoFallback(site) {
  if (!site) return DEMO_SITE;
  const c = site.content || {};
  const d = DEMO_SITE.content;
  return {
    ...DEMO_SITE,
    ...site,
    hotel: { ...DEMO_SITE.hotel, ...(site.hotel || {}) },
    content: {
      ...d,
      ...c,
      hero: { ...d.hero, ...(c.hero || {}) },
      about: { ...d.about, ...(c.about || {}) },
      highlights: c.highlights?.length ? c.highlights : d.highlights,
      amenities: c.amenities?.length ? c.amenities : d.amenities,
      gallery: c.gallery?.length ? c.gallery : d.gallery,
      location: { ...d.location, ...(c.location || {}) },
      contact: { ...(c.contact || {}) },
      testimonials: c.testimonials || [],
    },
    rooms: site.rooms?.length ? site.rooms : DEMO_SITE.rooms,
  };
}
