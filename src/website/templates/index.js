import Coastal from "./Coastal";
import Noir from "./Noir";
import Tropic from "./Tropic";
import Urban from "./Urban";
import Heritage from "./Heritage";

/** The five website designs. `id` matches the backend enum (models/Website.js). */
export const TEMPLATES = [
  {
    id: "coastal",
    name: "Coastal",
    tagline: "Airy and editorial — elegant serif headlines on warm sand.",
    bestFor: "Beach hotels, boutique stays",
    accent: "#2f6f86",
    swatches: ["#f6f2ec", "#2f6f86", "#1c2b33"],
    Component: Coastal,
  },
  {
    id: "noir",
    name: "Noir",
    tagline: "Dark luxury with champagne gold — a five-star evening feel.",
    bestFor: "Luxury hotels, city hotels",
    accent: "#c9a96e",
    swatches: ["#0b0b0c", "#c9a96e", "#ece7df"],
    Component: Noir,
  },
  {
    id: "tropic",
    name: "Tropic",
    tagline: "Lush green, rounded cards and a playful bento layout.",
    bestFor: "Villas, resorts, island stays",
    accent: "#1c4a35",
    swatches: ["#f3efe2", "#1c4a35", "#d6f06a"],
    Component: Tropic,
  },
  {
    id: "urban",
    name: "Urban",
    tagline: "Minimal black-and-white, an editorial grid and huge type.",
    bestFor: "Design hotels, apartments, hostels",
    accent: "#ff4a1c",
    swatches: ["#ffffff", "#0d0d0d", "#ff4a1c"],
    Component: Urban,
  },
  {
    id: "heritage",
    name: "Heritage",
    tagline: "Warm and classic — arched frames, ornaments and paper texture.",
    bestFor: "Guesthouses, historic & family-run",
    accent: "#7a2b25",
    swatches: ["#f2e9d8", "#7a2b25", "#a8834a"],
    Component: Heritage,
  },
];

export const templateById = (id) => TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];
