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
import { Magnetic, Reveal, SlidingTabs } from "@/components/fx";

const spring = { type: "spring", stiffness: 420, damping: 30 };

export default function TemplateGallery({ site, currentId, onSelect, busyId, selectLabel = "Use this design" }) {
  const [previewId, setPreviewId] = useState(null);
  const data = useMemo(() => withDemoFallback(site), [site]);

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
        {TEMPLATES.map((t, i) => {
          const current = currentId === t.id;
          return (
            <Reveal key={t.id} delay={i * 0.06} className="h-full">
            <div
              className={`card group flex h-full flex-col overflow-hidden transition-[transform,box-shadow] duration-500 ease-spring hover:-translate-y-1 ${
                current
                  ? "shadow-[inset_0_1px_0_#fff,0_0_0_2px_rgba(255,106,43,0.7),0_20px_44px_-18px_rgba(255,61,119,0.45)]"
                  : "hover:shadow-[inset_0_1px_0_#fff,0_0_0_1px_rgba(255,106,43,0.25),0_22px_48px_-20px_rgba(255,61,119,0.4)]"
              }`}
            >
              <button type="button" onClick={() => setPreviewId(t.id)} className="relative block w-full overflow-hidden rounded-t-2xl text-left" aria-label={`Preview ${t.name}`}>
                <div className="flex items-center gap-1.5 border-b border-ink-900/[0.06] bg-white/70 px-3 py-2 backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-[#FF5F57]" />
                  <span className="h-2 w-2 rounded-full bg-[#FEBC2E]" />
                  <span className="h-2 w-2 rounded-full bg-[#28C840]" />
                </div>
                <div className="overflow-hidden">
                  <div className="transition-transform duration-700 ease-out-expo group-hover:scale-[1.035]">
                    <SiteRenderer site={{ ...data, templateId: t.id }} templateId={t.id} mode="thumb" className="aspect-[16/11] w-full" />
                  </div>
                </div>
                <span className="absolute inset-0 top-7 flex items-center justify-center bg-night-950/0 opacity-0 backdrop-blur-0 transition-all duration-500 group-hover:bg-night-950/30 group-hover:opacity-100 group-hover:backdrop-blur-[2px]">
                  <span className="inline-flex translate-y-2 items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-ink-900 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.4)] backdrop-blur transition-transform duration-500 ease-spring group-hover:translate-y-0">
                    <Eye className="h-4 w-4" /> Preview
                  </span>
                </span>
                {current && (
                  <motion.span initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={spring} className="absolute left-3 top-10 inline-flex items-center gap-1 rounded-full bg-sunset px-2.5 py-1 text-xs font-semibold text-white shadow-[0_8px_20px_-8px_rgba(255,61,119,0.6)]">
                    <Check className="h-3.5 w-3.5" /> Your design
                  </motion.span>
                )}
              </button>
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-display text-lg font-semibold tracking-[-0.02em] text-ink-900">{t.name}</p>
                  <div className="flex -space-x-1 transition-[gap] duration-500">
                    {t.swatches.map((c, j) => (
                      <span key={c} className="h-5 w-5 rounded-full border-2 border-white shadow-[0_1px_4px_rgba(15,23,42,0.18)] transition-transform duration-500 ease-spring group-hover:-translate-y-0.5" style={{ background: c, transitionDelay: `${j * 40}ms` }} />
                    ))}
                  </div>
                </div>
                <p className="mt-1 text-sm text-ink-500">{t.tagline}</p>
                <p className="mt-1 text-xs font-medium text-ink-400">Best for: {t.bestFor}</p>
                <div className="mt-auto flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setPreviewId(t.id)}
                    className="btn-secondary min-h-[44px] flex-1 justify-center"
                  >
                    Preview
                  </button>
                  <button
                    type="button"
                    disabled={!!busyId}
                    onClick={() => onSelect(t.id)}
                    className="btn-primary min-h-[44px] flex-1 justify-center disabled:opacity-60"
                  >
                    {busyId === t.id && <Loader2 className="h-4 w-4 animate-spin" />}
                    {current ? "Keep this one" : selectLabel}
                  </button>
                </div>
              </div>
            </div>
            </Reveal>
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
          className="fixed inset-0 z-[200] flex flex-col bg-night-950"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex flex-wrap items-center gap-3 border-b border-white/10 bg-white/[0.03] px-3 py-2.5 text-white backdrop-blur-xl sm:px-5">
            <motion.button whileHover={{ rotate: 90 }} whileTap={{ scale: 0.9 }} transition={spring} type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl text-white/80 hover:bg-white/10 hover:text-white" aria-label="Close preview">
              <X className="h-5 w-5" />
            </motion.button>
            {onChange && (
              <div className="flex items-center gap-1">
                <motion.button whileHover={{ x: -2 }} whileTap={{ scale: 0.9 }} transition={spring} type="button" onClick={() => step(-1)} className="grid h-9 w-9 place-items-center rounded-xl text-white/80 hover:bg-white/10 hover:text-white" aria-label="Previous design"><ChevronLeft className="h-5 w-5" /></motion.button>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span key={t.id} initial={{ opacity: 0, y: 6, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -6, filter: "blur(4px)" }} transition={{ duration: 0.25 }} className="min-w-[84px] text-center font-display font-semibold tracking-[-0.02em]">{t.name}</motion.span>
                </AnimatePresence>
                <motion.button whileHover={{ x: 2 }} whileTap={{ scale: 0.9 }} transition={spring} type="button" onClick={() => step(1)} className="grid h-9 w-9 place-items-center rounded-xl text-white/80 hover:bg-white/10 hover:text-white" aria-label="Next design"><ChevronRight className="h-5 w-5" /></motion.button>
              </div>
            )}
            <div className="order-last w-full overflow-x-auto md:order-none md:mx-auto md:w-auto">
              <SlidingTabs dark size="sm" items={PAGES.map((p) => ({ value: p.id, label: p.label }))} value={page} onChange={setPage} className="whitespace-nowrap" />
            </div>
            <div className="ml-auto flex items-center gap-2 md:ml-0">
              <div className="hidden sm:block">
                <SlidingTabs
                  dark
                  size="sm"
                  items={[
                    { value: "desktop", label: <span className="sr-only">Desktop view</span>, icon: Monitor },
                    { value: "mobile", label: <span className="sr-only">Phone view</span>, icon: Smartphone },
                  ]}
                  value={device}
                  onChange={setDevice}
                />
              </div>
              {onSelect && (
                <Magnetic strength={0.25}>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onSelect(t.id)}
                    className="btn-primary group min-h-[40px] disabled:opacity-60"
                  >
                    <Check className="h-4 w-4 transition-transform duration-500 ease-spring group-hover:scale-125" />
                    {currentId === t.id ? "Keep this design" : selectLabel}
                  </button>
                </Magnetic>
              )}
            </div>
          </div>
          <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden p-0 sm:p-4">
            <div
              className={`h-full overflow-hidden bg-white transition-all duration-500 ease-spring ${device === "mobile" ? "max-h-[860px] w-[390px] max-w-full rounded-[38px] border-[10px] border-white/10 shadow-[0_40px_100px_-30px_rgba(255,61,119,0.45)]" : "w-full sm:rounded-2xl sm:shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)]"}`}
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
