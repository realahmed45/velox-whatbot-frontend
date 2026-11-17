/**
 * Preset hotel services offered at onboarding and in Settings → Services.
 * Saved on the property as `services: [{ key, name, description, price,
 * priceUnit, icon, enabled }]` via PUT /hotel/properties/:id — the website's
 * Services section and the AI both read from there.
 *
 * `icon` is a lucide-react icon name; render with a small lookup map.
 */
export const SERVICE_PRESETS = [
  { key: "massage", name: "Massage", icon: "HandHeart", priceUnit: "per hour", description: "Relaxing massage in your room or at our spa." },
  { key: "spa", name: "Spa & wellness", icon: "Flower2", priceUnit: "per person", description: "Treatments, scrubs and facials." },
  { key: "airport_pickup", name: "Airport pickup", icon: "Plane", priceUnit: "per trip", description: "Private driver waiting at arrivals." },
  { key: "tours", name: "Tours & excursions", icon: "Map", priceUnit: "per person", description: "Day trips to the best spots nearby." },
  { key: "restaurant", name: "Restaurant", icon: "UtensilsCrossed", priceUnit: "", description: "Fresh local and international dishes." },
  { key: "breakfast", name: "Breakfast", icon: "Coffee", priceUnit: "per person", description: "Served every morning." },
  { key: "room_service", name: "Room service", icon: "ConciergeBell", priceUnit: "", description: "Food and drinks to your room." },
  { key: "laundry", name: "Laundry", icon: "Shirt", priceUnit: "per kg", description: "Same-day wash, dry and fold." },
  { key: "yoga", name: "Yoga classes", icon: "Sparkles", priceUnit: "per class", description: "Morning sessions for all levels." },
  { key: "scooter_rental", name: "Scooter rental", icon: "Bike", priceUnit: "per day", description: "Explore the area on two wheels." },
  { key: "car_rental", name: "Car rental / driver", icon: "Car", priceUnit: "per day", description: "Car with or without a driver." },
  { key: "pool", name: "Swimming pool", icon: "Waves", priceUnit: "", description: "Open for guests every day." },
  { key: "gym", name: "Gym", icon: "Dumbbell", priceUnit: "", description: "Fitness equipment for guests." },
  { key: "babysitting", name: "Babysitting", icon: "Baby", priceUnit: "per hour", description: "Trusted sitters on request." },
  { key: "cooking_class", name: "Cooking class", icon: "ChefHat", priceUnit: "per person", description: "Learn to cook local dishes." },
  { key: "bbq", name: "BBQ dinner", icon: "Flame", priceUnit: "per person", description: "Private barbecue in the evening." },
];

export const SERVICE_ICON_FALLBACK = "Sparkles";

/** A fresh service row from a preset (or a blank custom one). */
export function makeService(preset) {
  if (!preset) return { key: "custom", name: "", description: "", price: null, priceUnit: "", icon: SERVICE_ICON_FALLBACK, enabled: true };
  return { key: preset.key, name: preset.name, description: preset.description, price: null, priceUnit: preset.priceUnit, icon: preset.icon, enabled: true };
}
