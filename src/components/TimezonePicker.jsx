import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search, Check, Globe } from "lucide-react";
import { clsx } from "clsx";

// Full IANA timezone list (grouped & deduped) — commonly used worldwide.
const TIMEZONES = [
  // UTC / reference
  "UTC",
  // Africa
  "Africa/Abidjan",
  "Africa/Accra",
  "Africa/Addis_Ababa",
  "Africa/Algiers",
  "Africa/Cairo",
  "Africa/Casablanca",
  "Africa/Dar_es_Salaam",
  "Africa/Johannesburg",
  "Africa/Kampala",
  "Africa/Khartoum",
  "Africa/Lagos",
  "Africa/Nairobi",
  "Africa/Tripoli",
  "Africa/Tunis",
  // Americas
  "America/Anchorage",
  "America/Argentina/Buenos_Aires",
  "America/Asuncion",
  "America/Bogota",
  "America/Caracas",
  "America/Chicago",
  "America/Denver",
  "America/Edmonton",
  "America/Guatemala",
  "America/Halifax",
  "America/Havana",
  "America/Lima",
  "America/Los_Angeles",
  "America/Mexico_City",
  "America/Montevideo",
  "America/New_York",
  "America/Panama",
  "America/Phoenix",
  "America/Puerto_Rico",
  "America/Santiago",
  "America/Sao_Paulo",
  "America/St_Johns",
  "America/Tijuana",
  "America/Toronto",
  "America/Vancouver",
  "America/Winnipeg",
  // Asia
  "Asia/Almaty",
  "Asia/Amman",
  "Asia/Baghdad",
  "Asia/Bahrain",
  "Asia/Baku",
  "Asia/Bangkok",
  "Asia/Beirut",
  "Asia/Colombo",
  "Asia/Damascus",
  "Asia/Dhaka",
  "Asia/Dubai",
  "Asia/Ho_Chi_Minh",
  "Asia/Hong_Kong",
  "Asia/Istanbul",
  "Asia/Jakarta",
  "Asia/Jerusalem",
  "Asia/Kabul",
  "Asia/Karachi",
  "Asia/Kathmandu",
  "Asia/Kolkata",
  "Asia/Kuala_Lumpur",
  "Asia/Kuwait",
  "Asia/Manila",
  "Asia/Muscat",
  "Asia/Phnom_Penh",
  "Asia/Qatar",
  "Asia/Riyadh",
  "Asia/Seoul",
  "Asia/Shanghai",
  "Asia/Singapore",
  "Asia/Taipei",
  "Asia/Tashkent",
  "Asia/Tbilisi",
  "Asia/Tehran",
  "Asia/Tokyo",
  "Asia/Ulaanbaatar",
  "Asia/Yangon",
  "Asia/Yerevan",
  // Atlantic
  "Atlantic/Azores",
  "Atlantic/Cape_Verde",
  "Atlantic/Reykjavik",
  // Australia / Oceania
  "Australia/Adelaide",
  "Australia/Brisbane",
  "Australia/Darwin",
  "Australia/Hobart",
  "Australia/Melbourne",
  "Australia/Perth",
  "Australia/Sydney",
  "Pacific/Auckland",
  "Pacific/Fiji",
  "Pacific/Guam",
  "Pacific/Honolulu",
  "Pacific/Port_Moresby",
  // Europe
  "Europe/Amsterdam",
  "Europe/Athens",
  "Europe/Belgrade",
  "Europe/Berlin",
  "Europe/Brussels",
  "Europe/Bucharest",
  "Europe/Budapest",
  "Europe/Copenhagen",
  "Europe/Dublin",
  "Europe/Helsinki",
  "Europe/Kiev",
  "Europe/Lisbon",
  "Europe/London",
  "Europe/Madrid",
  "Europe/Moscow",
  "Europe/Oslo",
  "Europe/Paris",
  "Europe/Prague",
  "Europe/Rome",
  "Europe/Sofia",
  "Europe/Stockholm",
  "Europe/Vienna",
  "Europe/Warsaw",
  "Europe/Zurich",
];

function getOffset(tz) {
  try {
    const d = new Date();
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "shortOffset",
    });
    const parts = fmt.formatToParts(d);
    const off = parts.find((p) => p.type === "timeZoneName")?.value || "";
    return off.replace("GMT", "UTC");
  } catch {
    return "";
  }
}

export default function TimezonePicker({ value, onChange, className }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef(null);
  const inputRef = useRef(null);

  const options = useMemo(
    () =>
      TIMEZONES.map((tz) => ({
        tz,
        offset: getOffset(tz),
        label: tz.replace(/_/g, " "),
      })),
    [],
  );

  const filtered = useMemo(() => {
    if (!q.trim()) return options;
    const s = q.toLowerCase();
    return options.filter(
      (o) =>
        o.tz.toLowerCase().includes(s) ||
        o.label.toLowerCase().includes(s) ||
        o.offset.toLowerCase().includes(s),
    );
  }, [q, options]);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
  }, [open]);

  const current = options.find((o) => o.tz === value);

  return (
    <div className={clsx("relative", className)} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="input flex items-center justify-between w-full text-left"
      >
        <span className="flex items-center gap-2 min-w-0">
          <Globe className="w-4 h-4 text-ink-400 flex-shrink-0" />
          <span className="truncate">
            {current ? current.label : "Select timezone"}
          </span>
          {current?.offset && (
            <span className="text-xs text-ink-400 flex-shrink-0">
              {current.offset}
            </span>
          )}
        </span>
        <ChevronDown className="w-4 h-4 text-ink-400" />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md border border-ink-200 shadow-hero z-50 overflow-hidden">
          <div className="p-2 border-b border-ink-100 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-400" />
            <input
              ref={inputRef}
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search city, country, or offset…"
              className="input pl-8 text-sm"
            />
          </div>
          <div className="max-h-72 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="py-6 text-center text-sm text-ink-400">
                No matches
              </p>
            )}
            {filtered.map((o) => (
              <button
                key={o.tz}
                type="button"
                onClick={() => {
                  onChange(o.tz);
                  setOpen(false);
                  setQ("");
                }}
                className={clsx(
                  "w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-brand-50 transition",
                  o.tz === value && "bg-brand-50",
                )}
              >
                <span className="flex items-center gap-2">
                  {o.tz === value ? (
                    <Check className="w-3.5 h-3.5 text-brand-600" />
                  ) : (
                    <span className="w-3.5 h-3.5" />
                  )}
                  <span className="text-ink-800">{o.label}</span>
                </span>
                <span className="text-xs text-ink-400 font-mono">
                  {o.offset}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
