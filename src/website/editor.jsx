/**
 * Small editing controls for the website manager and onboarding:
 *   ImageField      one image — upload a file OR paste a link
 *   GalleryManager  the photo gallery — upload, paste links, caption,
 *                   reorder, delete
 *   ListEditor      a repeatable list of small objects (highlights, reviews)
 *   ChipsEditor     a list of short strings (amenities)
 */
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { ArrowLeft, ArrowRight, ImagePlus, Link2, Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { MAX_PHOTO_MB, websiteApi } from "./api";

const spring = { type: "spring", stiffness: 420, damping: 30 };
const pop = {
  initial: { opacity: 0, scale: 0.92, filter: "blur(4px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 0.9, filter: "blur(4px)" },
  transition: spring,
};
const chipBtn =
  "btn-secondary group min-h-[40px] px-3 py-2 text-sm";
const iconBtn =
  "grid h-9 w-9 place-items-center rounded-lg text-ink-500 transition-[transform,background-color,color] duration-300 ease-spring hover:-translate-y-0.5 hover:bg-white hover:text-ink-800 active:scale-90 disabled:pointer-events-none disabled:opacity-30";

const isUrl = (v) => /^https?:\/\/\S+$/i.test(String(v || "").trim());
export const isStock = (url) => String(url || "").startsWith("https://images.unsplash.com/");

async function uploadFiles(files, max = 40) {
  const list = Array.from(files || [])
    .filter((f) => f.type?.startsWith("image/"))
    .slice(0, max);
  if (!list.length) {
    toast.error("Please choose an image file");
    return [];
  }
  const ok = list.filter((f) => f.size <= MAX_PHOTO_MB * 1024 * 1024);
  if (ok.length < list.length) toast.error(`Images need to be under ${MAX_PHOTO_MB}MB`);
  const urls = [];
  for (const f of ok) {
    try {
      urls.push(await websiteApi.uploadPhoto(f));
    } catch (e) {
      toast.error(e?.response?.data?.message || `Couldn't upload ${f.name}`);
    }
  }
  return urls;
}

export const inputCls = "input text-[15px]";

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="text-[13px] font-medium text-ink-700">{label}</span>
      {hint && <span className="mt-0.5 block text-xs text-ink-500">{hint}</span>}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

/** One image: upload a file, or paste a link. */
export function ImageField({ label, value, onChange, aspect = "16/9" }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [linkMode, setLinkMode] = useState(false);
  const [link, setLink] = useState("");

  const pick = async (files) => {
    setBusy(true);
    const [url] = await uploadFiles(files, 1);
    setBusy(false);
    if (url) onChange(url);
  };

  return (
    <div>
      {label && <p className="text-[13px] font-medium text-ink-700">{label}</p>}
      <div className="mt-1.5 flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="group relative w-full overflow-hidden rounded-xl bg-ink-900/[0.04] ring-1 ring-ink-900/[0.07] shadow-[0_8px_20px_-14px_rgba(15,23,42,0.35)] sm:w-56" style={{ aspectRatio: aspect }}>
          <AnimatePresence mode="popLayout" initial={false}>
            {value ? (
              <motion.img key={value} initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} src={value} alt="" className="h-full w-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.04]" />
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full items-center justify-center text-ink-300"><ImagePlus className="h-8 w-8 transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]" strokeWidth={1.6} /></motion.div>
            )}
          </AnimatePresence>
          {value && isStock(value) && (
            <span className="absolute left-2 top-2 rounded-full bg-white/85 px-2 py-0.5 text-[11px] font-semibold text-ink-700 backdrop-blur">Stock photo</span>
          )}
          <AnimatePresence>
            {busy && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm"><Loader2 className="h-6 w-6 animate-spin text-sunset-flame" /></motion.div>}
          </AnimatePresence>
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => fileRef.current?.click()} className={chipBtn}>
              <Upload className="h-4 w-4 transition-transform duration-500 ease-spring group-hover:-translate-y-0.5" /> Upload
            </button>
            <button type="button" onClick={() => setLinkMode((v) => !v)} aria-expanded={linkMode} className={chipBtn}>
              <Link2 className="h-4 w-4 transition-transform duration-500 ease-spring group-hover:rotate-[-20deg]" /> Paste a link
            </button>
          </div>
          <AnimatePresence initial={false}>
          {linkMode && (
            <motion.div key="link" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
            <div className="flex gap-2 pt-0.5">
              <input className={inputCls} placeholder="https://…/photo.jpg" value={link} onChange={(e) => setLink(e.target.value)} />
              <button
                type="button"
                onClick={() => {
                  if (!isUrl(link)) return toast.error("That doesn't look like an image link");
                  onChange(link.trim());
                  setLink("");
                  setLinkMode(false);
                }}
                className="btn-primary min-h-[40px] shrink-0 px-4"
              >
                Use
              </button>
            </div>
            </motion.div>
          )}
          </AnimatePresence>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { pick(e.target.files); e.target.value = ""; }} />
        </div>
      </div>
    </div>
  );
}

/** The gallery: upload many, paste links, caption, reorder, delete. */
export function GalleryManager({ photos = [], onChange, max = 40 }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const stockCount = photos.filter((p) => p.stock || isStock(p.url)).length;

  const add = (urls) => onChange([...photos, ...urls.map((url) => ({ url, caption: "", stock: false }))].slice(0, max));

  const upload = async (files) => {
    setBusy(true);
    const urls = await uploadFiles(files, max - photos.length);
    setBusy(false);
    if (urls.length) {
      add(urls);
      toast.success(`${urls.length} photo${urls.length === 1 ? "" : "s"} added`);
    }
  };
  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= photos.length) return;
    const next = [...photos];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div>
      {stockCount > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-amber-50/90 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-500/20">
          <span>{stockCount} of these are stock photos. Replace them with your own whenever you're ready.</span>
          <button type="button" onClick={() => onChange(photos.filter((p) => !(p.stock || isStock(p.url))))} className="font-semibold underline underline-offset-4 transition-colors hover:text-amber-700">
            Remove stock photos
          </button>
        </div>
      )}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); upload(e.dataTransfer.files); }}
        className={`grid grid-cols-2 gap-3 rounded-2xl transition-[outline-color,background-color] duration-300 sm:grid-cols-3 ${dragOver ? "bg-sunset-soft outline-dashed outline-2 outline-offset-4 outline-sunset-flame/60" : ""}`}
      >
        <AnimatePresence initial={false}>
        {photos.map((p, i) => (
          <motion.div layout {...pop} key={p.url + i} className="group overflow-hidden rounded-xl bg-white/80 ring-1 ring-ink-900/[0.07] shadow-[inset_0_1px_0_#fff,0_8px_20px_-16px_rgba(15,23,42,0.4)] transition-shadow duration-500 hover:shadow-[inset_0_1px_0_#fff,0_0_0_1px_rgba(255,106,43,0.22),0_16px_32px_-18px_rgba(255,61,119,0.4)]">
            <div className="relative aspect-[4/3] overflow-hidden bg-ink-900/[0.04]">
              <img src={p.url} alt="" className="h-full w-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.05]" />
              {(p.stock || isStock(p.url)) && <span className="absolute left-2 top-2 rounded-full bg-white/85 px-2 py-0.5 text-[11px] font-semibold text-ink-700 backdrop-blur">Stock</span>}
              {i === 0 && <span className="absolute right-2 top-2 rounded-full bg-sunset px-2 py-0.5 text-[11px] font-semibold text-white shadow-[0_6px_14px_-6px_rgba(255,61,119,0.6)]">First</span>}
            </div>
            <div className="p-2">
              <input className="w-full rounded-lg bg-transparent px-2 py-1 text-sm outline-none transition-colors focus:bg-white focus:ring-1 focus:ring-sunset-flame/40" placeholder="Caption" value={p.caption || ""} maxLength={200} onChange={(e) => onChange(photos.map((x, j) => (j === i ? { ...x, caption: e.target.value } : x)))} />
              <div className="mt-1 flex items-center justify-between">
                <div className="flex">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className={iconBtn} aria-label="Move earlier"><ArrowLeft className="h-4 w-4" /></button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === photos.length - 1} className={iconBtn} aria-label="Move later"><ArrowRight className="h-4 w-4" /></button>
                </div>
                <button type="button" onClick={() => onChange(photos.filter((_, j) => j !== i))} className={`${iconBtn} text-ink-400 hover:!bg-rose-50 hover:!text-rose-600`} aria-label="Delete photo"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </motion.div>
        ))}
        </AnimatePresence>
        {photos.length < max && (
          <motion.button layout whileHover={{ y: -3 }} whileTap={{ scale: 0.96 }} transition={spring} type="button" onClick={() => fileRef.current?.click()} className="group flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-900/15 bg-white/40 text-ink-600 transition-colors hover:border-sunset-flame/50 hover:bg-white/80 hover:text-ink-900">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-sunset-soft text-sunset-flame transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]">
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" strokeWidth={1.8} />}
            </span>
            <span className="text-sm font-semibold">{busy ? "Uploading…" : "Upload photos"}</span>
            <span className="text-xs text-ink-400">or drag them here</span>
          </motion.button>
        )}
      </div>
      <div className="mt-3 flex gap-2">
        <input className={inputCls} placeholder="…or paste an image link: https://…" value={link} onChange={(e) => setLink(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (isUrl(link)) { add([link.trim()]); setLink(""); } } }} />
        <button
          type="button"
          onClick={() => {
            if (!isUrl(link)) return toast.error("That doesn't look like an image link");
            add([link.trim()]);
            setLink("");
          }}
          className="btn-primary group min-h-[40px] shrink-0 whitespace-nowrap px-4"
        >
          <Plus className="h-4 w-4 transition-transform duration-500 ease-spring group-hover:rotate-90" /> Add
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => { upload(e.target.files); e.target.value = ""; }} />
    </div>
  );
}

/** Repeatable small objects, e.g. highlights {title, body}. */
export function ListEditor({ items = [], onChange, fields, blank, max = 6, addLabel = "Add" }) {
  return (
    <div className="space-y-3">
      <AnimatePresence initial={false}>
      {items.map((it, i) => (
        <motion.div layout key={i} initial={{ opacity: 0, y: 8, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, scale: 0.96, filter: "blur(4px)" }} transition={spring} className="relative rounded-xl bg-white/60 p-3 pr-11 ring-1 ring-ink-900/[0.07] shadow-[inset_0_1px_0_#fff]">
          <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="absolute right-1.5 top-1.5 grid h-9 w-9 place-items-center rounded-lg text-ink-400 transition-[transform,background-color,color] duration-300 ease-spring hover:rotate-90 hover:bg-rose-50 hover:text-rose-600 active:scale-90" aria-label="Remove"><X className="h-4 w-4" /></button>
          <div className="space-y-2">
            {fields.map((f) =>
              f.multiline ? (
                <textarea key={f.key} rows={f.rows || 2} className={inputCls} placeholder={f.placeholder} value={it[f.key] || ""} onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, [f.key]: e.target.value } : x)))} />
              ) : (
                <input key={f.key} className={inputCls} placeholder={f.placeholder} value={it[f.key] || ""} onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, [f.key]: e.target.value } : x)))} />
              ),
            )}
          </div>
        </motion.div>
      ))}
      </AnimatePresence>
      {items.length < max && (
        <motion.button layout whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }} transition={spring} type="button" onClick={() => onChange([...items, { ...blank }])} className="group inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border-2 border-dashed border-ink-900/15 bg-white/40 px-4 py-2.5 text-sm font-semibold text-ink-700 transition-colors hover:border-sunset-flame/50 hover:bg-white/80 hover:text-ink-900">
          <Plus className="h-4 w-4 text-sunset-flame transition-transform duration-500 ease-spring group-hover:rotate-90" /> {addLabel}
        </motion.button>
      )}
    </div>
  );
}

/** Short strings as removable chips. */
export function ChipsEditor({ items = [], onChange, placeholder = "Add one…", max = 40 }) {
  const [v, setV] = useState("");
  const add = () => {
    const t = v.trim();
    if (!t || items.includes(t) || items.length >= max) return;
    onChange([...items, t]);
    setV("");
  };
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <AnimatePresence initial={false}>
        {items.map((a, i) => (
          <motion.span layout {...pop} key={a + i} className="inline-flex items-center gap-1 rounded-full bg-white/80 py-1.5 pl-3 pr-1.5 text-sm font-medium text-ink-800 ring-1 ring-ink-900/[0.08] shadow-[inset_0_1px_0_#fff]">
            {a}
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="grid h-6 w-6 place-items-center rounded-full text-ink-400 transition-[transform,background-color,color] duration-300 ease-spring hover:rotate-90 hover:bg-rose-50 hover:text-rose-600" aria-label={`Remove ${a}`}><X className="h-3.5 w-3.5" /></button>
          </motion.span>
        ))}
        </AnimatePresence>
      </div>
      <div className="mt-3 flex gap-2">
        <input className={inputCls} placeholder={placeholder} value={v} maxLength={60} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} />
        <button type="button" onClick={add} className="btn-primary group min-h-[40px] shrink-0 px-4"><Plus className="h-4 w-4 transition-transform duration-500 ease-spring group-hover:rotate-90" /> Add</button>
      </div>
    </div>
  );
}
