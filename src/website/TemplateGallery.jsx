/**
 * TemplateGallery — pick a website design the way you would on Hostinger:
 * live thumbnails of all five, a full-screen preview you can click through
 * (every page, desktop or phone), and "Use this design".
 *
 * Previews use the hotel's own data when we have it (`site`), topped up with
 * demo content wherever it's still empty, so nothing ever looks unfinished.
 */
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Eye, Loader2, Monitor, Smartphone, X } from "lucide-react";
import SiteRenderer from "./SiteRenderer";
import { PAGES } from "./shared";
import { TEMPLATES } from "./templates";
import { withDemoFallback } from "./demo";

export default function TemplateGallery({ site, currentId, onSelect, busyId, selectLabel = "Use this design" }) {
  const [previewId, setPreviewId] = useState(null);
  const data = useMemo(() => withDemoFallback(site), [site]);

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {TEMPLATES.map((t) => {
          const current = currentId === t.id;
          return (
            <div
              key={t.id}
              className={`group overflow-hidden rounded-2xl border-2 bg-white transition ${current ? "border-ink-900" : "border-ink-100 hover:border-ink-300"}`}
            >
              <button type="button" onClick={() => setPreviewId(t.id)} className="relative block w-full text-left" aria-label={`Preview ${t.name}`}>
                <div className="flex items-center gap-1.5 border-b border-ink-100 bg-ink-50 px-3 py-2">
                  <span className="h-2 w-2 rounded-full bg-rose-300" />
                  <span className="h-2 w-2 rounded-full bg-amber-300" />
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                </div>
                <SiteRenderer site={{ ...data, templateId: t.id }} templateId={t.id} mode="thumb" className="aspect-[16/11] w-full" />
                <span className="absolute inset-0 top-7 flex items-center justify-center bg-ink-950/0 opacity-0 transition group-hover:bg-ink-950/35 group-hover:opacity-100">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-ink-900 shadow-lg">
                    <Eye className="h-4 w-4" /> Preview
                  </span>
                </span>
                {current && (
                  <span className="absolute left-3 top-10 inline-flex items-center gap-1 rounded-full bg-ink-900 px-2.5 py-1 text-xs font-bold text-white">
                    <Check className="h-3.5 w-3.5" /> Your design
                  </span>
                )}
              </button>
              <div className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-lg font-black text-ink-900">{t.name}</p>
                  <div className="flex -space-x-1">
                    {t.swatches.map((c) => (
                      <span key={c} className="h-5 w-5 rounded-full border-2 border-white shadow-sm" style={{ background: c }} />
                    ))}
                  </div>
                </div>
                <p className="mt-1 text-sm text-ink-500">{t.tagline}</p>
                <p className="mt-1 text-xs font-semibold text-ink-400">Best for: {t.bestFor}</p>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewId(t.id)}
                    className="flex-1 rounded-xl border-2 border-ink-200 py-2.5 text-sm font-bold text-ink-800 transition hover:border-ink-900"
                  >
                    Preview
                  </button>
                  <button
                    type="button"
                    disabled={!!busyId}
                    onClick={() => onSelect(t.id)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-ink-900 py-2.5 text-sm font-bold text-white transition hover:bg-black disabled:opacity-60"
                  >
                    {busyId === t.id && <Loader2 className="h-4 w-4 animate-spin" />}
                    {current ? "Keep this one" : selectLabel}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <TemplatePreview
        site={data}
        templateId={previewId}
        onClose={() => setPreviewId(null)}
        onChange={setPreviewId}
        onSelect={(id) => {
          setPreviewId(null);
          onSelect(id);
        }}
        busy={!!busyId}
        currentId={currentId}
        selectLabel={selectLabel}
      />
    </>
  );
}

/** Full-screen live preview with page switcher and desktop/phone toggle. */
export function TemplatePreview({ site, templateId, onClose, onChange, onSelect, busy, currentId, selectLabel = "Use this design" }) {
  const [device, setDevice] = useState("desktop");
  const [page, setPage] = useState("home");
  const idx = TEMPLATES.findIndex((t) => t.id === templateId);
  const t = TEMPLATES[idx];

  useEffect(() => setPage("home"), [templateId]);
  useEffect(() => {
    if (!templateId) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [templateId, onClose]);

  const step = (d) => onChange?.(TEMPLATES[(idx + d + TEMPLATES.length) % TEMPLATES.length].id);

  return createPortal(
    <AnimatePresence>
      {t && (
        <motion.div
          className="fixed inset-0 z-[200] flex flex-col bg-ink-950"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex flex-wrap items-center gap-3 border-b border-white/10 px-3 py-2.5 text-white sm:px-5">
            <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-white/10" aria-label="Close preview">
              <X className="h-5 w-5" />
            </button>
            {onChange && (
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => step(-1)} className="rounded-lg p-1.5 hover:bg-white/10" aria-label="Previous design"><ChevronLeft className="h-5 w-5" /></button>
                <span className="min-w-[84px] text-center font-black">{t.name}</span>
                <button type="button" onClick={() => step(1)} className="rounded-lg p-1.5 hover:bg-white/10" aria-label="Next design"><ChevronRight className="h-5 w-5" /></button>
              </div>
            )}
            <div className="order-last flex w-full gap-1 overflow-x-auto rounded-xl bg-white/5 p-1 md:order-none md:mx-auto md:w-auto">
              {PAGES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPage(p.id)}
                  className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition ${page === p.id ? "bg-white text-ink-900" : "text-white/70 hover:text-white"}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-2 md:ml-0">
              <div className="hidden rounded-xl bg-white/5 p-1 sm:flex">
                <button type="button" onClick={() => setDevice("desktop")} className={`rounded-lg p-1.5 ${device === "desktop" ? "bg-white text-ink-900" : "text-white/70"}`} aria-label="Desktop view"><Monitor className="h-4 w-4" /></button>
                <button type="button" onClick={() => setDevice("mobile")} className={`rounded-lg p-1.5 ${device === "mobile" ? "bg-white text-ink-900" : "text-white/70"}`} aria-label="Phone view"><Smartphone className="h-4 w-4" /></button>
              </div>
              {onSelect && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onSelect(t.id)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-black text-ink-900 hover:bg-ink-100 disabled:opacity-60"
                >
                  <Check className="h-4 w-4" />
                  {currentId === t.id ? "Keep this design" : selectLabel}
                </button>
              )}
            </div>
          </div>
          <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden p-0 sm:p-4">
            <div
              className={`h-full overflow-hidden bg-white transition-all duration-500 ${device === "mobile" ? "max-h-[860px] w-[390px] rounded-[38px] border-[10px] border-ink-800 shadow-2xl" : "w-full sm:rounded-xl"}`}
            >
              <SiteRenderer
                key={`${t.id}-${device}`}
                site={{ ...site, templateId: t.id }}
                templateId={t.id}
                mode={device === "mobile" ? "frame" : "scaled"}
                page={page}
                onNavigate={setPage}
                className="h-full w-full"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
