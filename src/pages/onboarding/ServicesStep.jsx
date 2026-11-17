/**
 * "What services do you offer?" — the onboarding services picker.
 *
 * Presets from data/hotelServices.js as tappable cards (multi-select). Each
 * picked service can carry an optional price + unit, and the hotelier can add
 * their own. The parent owns the list (`services`, the exact shape saved on the
 * property: { key, name, description, price, priceUnit, icon, enabled }) and
 * saves it with PUT /hotel/properties/:id — the website's Services section and
 * the AI read it from there. Editable later in Settings.
 */
import { AnimatePresence, motion } from "framer-motion";
import {
  Baby,
  Bike,
  Car,
  Check,
  ChefHat,
  ConciergeBell,
  Coffee,
  Dumbbell,
  Flame,
  Flower2,
  HandHeart,
  Map as MapIcon,
  Plane,
  Plus,
  Shirt,
  Sparkles,
  Trash2,
  UtensilsCrossed,
  Waves,
} from "lucide-react";
import { SERVICE_PRESETS, makeService } from "@/data/hotelServices";

export const SERVICE_ICONS = {
  Baby,
  Bike,
  Car,
  ChefHat,
  ConciergeBell,
  Coffee,
  Dumbbell,
  Flame,
  Flower2,
  HandHeart,
  Map: MapIcon,
  Plane,
  Shirt,
  Sparkles,
  UtensilsCrossed,
  Waves,
};

const SPRING = { type: "spring", stiffness: 380, damping: 30 };

/** What actually gets saved: named services, price as a number or null. */
export function cleanServices(list = []) {
  return list
    .filter((x) => String(x.name || "").trim())
    .map((x) => {
      const n = Number(String(x.price ?? "").replace(/[^0-9.]/g, ""));
      return {
        key: x.key,
        name: String(x.name).trim(),
        description: String(x.description || "").trim(),
        price: x.price !== null && x.price !== "" && n > 0 ? n : null,
        priceUnit: String(x.priceUnit || "").trim(),
        icon: x.icon || "Sparkles",
        enabled: x.enabled !== false,
      };
    });
}

export default function ServicesStep({ services = [], onChange, currency }) {
  const picked = new Set(services.map((x) => x.key));
  const toggle = (preset) =>
    onChange(
      picked.has(preset.key)
        ? services.filter((x) => x.key !== preset.key)
        : [...services, makeService(preset)],
    );
  const update = (key, fields) =>
    onChange(services.map((x) => (x.key === key ? { ...x, ...fields } : x)));
  const remove = (key) => onChange(services.filter((x) => x.key !== key));
  const addCustom = () =>
    onChange([
      ...services,
      { ...makeService(), key: `custom_${Date.now().toString(36)}` },
    ]);

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
        {SERVICE_PRESETS.map((p, i) => {
          const active = picked.has(p.key);
          const Icon = SERVICE_ICONS[p.icon] || Sparkles;
          return (
            <motion.button
              key={p.key}
              type="button"
              onClick={() => toggle(p)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(0.03 + i * 0.025, 0.4), ...SPRING }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.96 }}
              aria-pressed={active}
              className={`group relative text-left rounded-2xl p-3.5 sm:p-4 min-h-[104px] flex flex-col justify-between gap-3 transition-[background-color,box-shadow] duration-500 ${
                active
                  ? "bg-white shadow-[0_0_0_1.5px_rgba(255,106,43,0.75),0_16px_36px_-18px_rgba(255,61,119,0.45)]"
                  : "bg-white/90 shadow-[0_0_0_1px_rgba(15,23,42,0.08),0_1px_2px_rgba(15,23,42,0.04)] hover:bg-white hover:shadow-[0_0_0_1px_rgba(15,23,42,0.16),0_8px_20px_-12px_rgba(15,23,42,0.18)]"
              }`}
            >
              <span
                className={`h-10 w-10 rounded-xl grid place-items-center transition-[transform,background-color,color] duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg] ${
                  active
                    ? "bg-sunset text-white shadow-[0_8px_20px_-8px_rgba(255,61,119,0.8)]"
                    : "bg-sunset-soft text-sunset-flame"
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={1.8} />
              </span>
              <span className="font-semibold text-ink-950 text-[15px] leading-tight pr-6">
                {p.name}
              </span>
              <AnimatePresence>
                {active && (
                  <motion.span
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 45 }}
                    transition={{ type: "spring", stiffness: 520, damping: 18 }}
                    className="absolute top-3 right-3 h-6 w-6 rounded-full bg-sunset grid place-items-center shadow-[0_6px_16px_-6px_rgba(255,61,119,0.9)]"
                  >
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {services.length > 0 && (
        <div className="mt-8">
          <p className="font-display font-semibold text-ink-950">
            Prices <span className="font-normal text-ink-500">(optional)</span>
          </p>
          <p className="text-sm text-ink-600 mt-1">
            Leave a price empty and guests are told to ask — your AI will say so too.
          </p>
          <div className="mt-3 space-y-2.5">
            <AnimatePresence initial={false}>
              {services.map((x) => {
                const custom = !SERVICE_PRESETS.some((p) => p.key === x.key);
                const Icon = SERVICE_ICONS[x.icon] || Sparkles;
                return (
                  <motion.div
                    key={x.key}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={SPRING}
                    className="card p-3.5 sm:p-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-9 w-9 shrink-0 rounded-xl grid place-items-center bg-sunset-soft text-sunset-flame">
                        <Icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
                      </span>
                      {custom ? (
                        <input
                          autoFocus={!x.name}
                          value={x.name}
                          onChange={(e) => update(x.key, { name: e.target.value })}
                          placeholder="Service name, e.g. Snorkeling trip"
                          maxLength={60}
                          className="flex-1 min-w-0 font-semibold text-ink-950 placeholder:text-ink-400 outline-none bg-transparent text-[15px]"
                        />
                      ) : (
                        <span className="flex-1 min-w-0 font-semibold text-ink-950 text-[15px] truncate">
                          {x.name}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => remove(x.key)}
                        className="h-9 w-9 shrink-0 grid place-items-center rounded-lg text-ink-400 hover:text-rose-600 hover:bg-rose-50 active:scale-90 transition duration-300 ease-spring"
                        aria-label={`Remove ${x.name || "service"}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {custom && (
                      <input
                        value={x.description}
                        onChange={(e) => update(x.key, { description: e.target.value })}
                        placeholder="One line about it (optional)"
                        maxLength={160}
                        className="mt-2 w-full rounded-xl px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 bg-white ring-1 ring-ink-900/10 outline-none focus:ring-2 focus:ring-sunset-flame/60 transition"
                      />
                    )}
                    <div className="mt-2.5 flex flex-wrap items-center gap-2">
                      <div className="flex items-center rounded-xl px-3 py-1.5 bg-white ring-1 ring-ink-900/10 focus-within:ring-2 focus-within:ring-sunset-flame/60 transition">
                        <span className="text-xs font-semibold text-ink-400 mr-1.5">{currency}</span>
                        <input
                          inputMode="decimal"
                          value={x.price ?? ""}
                          onChange={(e) =>
                            update(x.key, { price: e.target.value.replace(/[^0-9.]/g, "") || null })
                          }
                          placeholder="Price"
                          aria-label={`${x.name || "Service"} price`}
                          className="w-24 outline-none font-semibold text-ink-950 placeholder:text-ink-400 placeholder:font-normal bg-transparent tabular-nums"
                        />
                      </div>
                      <input
                        value={x.priceUnit || ""}
                        onChange={(e) => update(x.key, { priceUnit: e.target.value })}
                        placeholder="per person"
                        aria-label={`${x.name || "Service"} price unit`}
                        maxLength={30}
                        className="flex-1 min-w-[110px] rounded-xl px-3 py-1.5 text-sm text-ink-900 placeholder:text-ink-400 bg-white ring-1 ring-ink-900/10 outline-none focus:ring-2 focus:ring-sunset-flame/60 transition"
                      />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      <motion.button
        type="button"
        onClick={addCustom}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={SPRING}
        className="group mt-4 w-full rounded-2xl border border-dashed border-ink-900/15 hover:border-sunset-flame/50 hover:bg-ink-900/[0.04] py-3.5 font-semibold text-ink-800 inline-flex items-center justify-center gap-1.5 transition-colors"
      >
        <Plus className="w-4 h-4 text-sunset-flame transition-transform duration-500 ease-spring group-hover:rotate-90" />
        Add your own
      </motion.button>
    </div>
  );
}
