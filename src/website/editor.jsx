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
import { MAX_PHOTO_MB, websiteApi } from "./api";

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

export const inputCls =
  "w-full rounded-xl border-2 border-ink-200 bg-white px-3.5 py-2.5 text-[15px] text-ink-900 outline-none transition focus:border-ink-900";

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-ink-800">{label}</span>
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
      {label && <p className="text-sm font-bold text-ink-800">{label}</p>}
      <div className="mt-1.5 flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="relative w-full overflow-hidden rounded-xl border-2 border-ink-100 bg-ink-50 sm:w-56" style={{ aspectRatio: aspect }}>
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-ink-300"><ImagePlus className="h-8 w-8" /></div>
          )}
          {value && isStock(value) && (
            <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-bold text-ink-700">Stock photo</span>
          )}
          {busy && <div className="absolute inset-0 flex items-center justify-center bg-white/70"><Loader2 className="h-6 w-6 animate-spin text-ink-700" /></div>}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1.5 rounded-xl border-2 border-ink-200 px-3 py-2 text-sm font-bold text-ink-800 hover:border-ink-900">
              <Upload className="h-4 w-4" /> Upload
            </button>
            <button type="button" onClick={() => setLinkMode((v) => !v)} className="inline-flex items-center gap-1.5 rounded-xl border-2 border-ink-200 px-3 py-2 text-sm font-bold text-ink-800 hover:border-ink-900">
              <Link2 className="h-4 w-4" /> Paste a link
            </button>
          </div>
          {linkMode && (
            <div className="flex gap-2">
              <input className={inputCls} placeholder="https://…/photo.jpg" value={link} onChange={(e) => setLink(e.target.value)} />
              <button
                type="button"
                onClick={() => {
                  if (!isUrl(link)) return toast.error("That doesn't look like an image link");
                  onChange(link.trim());
                  setLink("");
                  setLinkMode(false);
                }}
                className="rounded-xl bg-ink-900 px-4 text-sm font-bold text-white"
              >
                Use
              </button>
            </div>
          )}
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
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <span>{stockCount} of these are stock photos. Replace them with your own whenever you're ready.</span>
          <button type="button" onClick={() => onChange(photos.filter((p) => !(p.stock || isStock(p.url))))} className="font-bold underline">
            Remove stock photos
          </button>
        </div>
      )}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); upload(e.dataTransfer.files); }}
        className={`grid grid-cols-2 gap-3 rounded-2xl sm:grid-cols-3 ${dragOver ? "outline-dashed outline-2 outline-ink-400" : ""}`}
      >
        {photos.map((p, i) => (
          <div key={p.url + i} className="overflow-hidden rounded-xl border-2 border-ink-100 bg-white">
            <div className="relative aspect-[4/3] bg-ink-50">
              <img src={p.url} alt="" className="h-full w-full object-cover" />
              {(p.stock || isStock(p.url)) && <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-bold text-ink-700">Stock</span>}
              {i === 0 && <span className="absolute right-2 top-2 rounded-full bg-ink-900 px-2 py-0.5 text-[11px] font-bold text-white">First</span>}
            </div>
            <div className="p-2">
              <input className="w-full rounded-lg px-2 py-1 text-sm outline-none focus:bg-ink-50" placeholder="Caption" value={p.caption || ""} maxLength={200} onChange={(e) => onChange(photos.map((x, j) => (j === i ? { ...x, caption: e.target.value } : x)))} />
              <div className="mt-1 flex items-center justify-between">
                <div className="flex">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-50 disabled:opacity-30" aria-label="Move earlier"><ArrowLeft className="h-4 w-4" /></button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === photos.length - 1} className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-50 disabled:opacity-30" aria-label="Move later"><ArrowRight className="h-4 w-4" /></button>
                </div>
                <button type="button" onClick={() => onChange(photos.filter((_, j) => j !== i))} className="rounded-lg p-1.5 text-ink-400 hover:bg-rose-50 hover:text-rose-600" aria-label="Delete photo"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        ))}
        {photos.length < max && (
          <button type="button" onClick={() => fileRef.current?.click()} className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-300 text-ink-600 transition hover:border-ink-600">
            {busy ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6" />}
            <span className="text-sm font-bold">{busy ? "Uploading…" : "Upload photos"}</span>
            <span className="text-xs text-ink-400">or drag them here</span>
          </button>
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
          className="inline-flex items-center gap-1 whitespace-nowrap rounded-xl bg-ink-900 px-4 text-sm font-bold text-white"
        >
          <Plus className="h-4 w-4" /> Add
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
      {items.map((it, i) => (
        <div key={i} className="relative rounded-xl border-2 border-ink-100 p-3 pr-10">
          <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="absolute right-2 top-2 rounded-lg p-1.5 text-ink-400 hover:text-rose-600" aria-label="Remove"><X className="h-4 w-4" /></button>
          <div className="space-y-2">
            {fields.map((f) =>
              f.multiline ? (
                <textarea key={f.key} rows={f.rows || 2} className={inputCls} placeholder={f.placeholder} value={it[f.key] || ""} onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, [f.key]: e.target.value } : x)))} />
              ) : (
                <input key={f.key} className={inputCls} placeholder={f.placeholder} value={it[f.key] || ""} onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, [f.key]: e.target.value } : x)))} />
              ),
            )}
          </div>
        </div>
      ))}
      {items.length < max && (
        <button type="button" onClick={() => onChange([...items, { ...blank }])} className="inline-flex items-center gap-1.5 rounded-xl border-2 border-dashed border-ink-300 px-4 py-2.5 text-sm font-bold text-ink-700 hover:border-ink-600">
          <Plus className="h-4 w-4" /> {addLabel}
        </button>
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
        {items.map((a, i) => (
          <span key={a + i} className="inline-flex items-center gap-1 rounded-full bg-ink-100 py-1.5 pl-3 pr-1.5 text-sm font-semibold text-ink-800">
            {a}
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="rounded-full p-0.5 hover:bg-ink-200" aria-label={`Remove ${a}`}><X className="h-3.5 w-3.5" /></button>
          </span>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input className={inputCls} placeholder={placeholder} value={v} maxLength={60} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} />
        <button type="button" onClick={add} className="inline-flex items-center gap-1 rounded-xl bg-ink-900 px-4 text-sm font-bold text-white"><Plus className="h-4 w-4" /> Add</button>
      </div>
    </div>
  );
}
