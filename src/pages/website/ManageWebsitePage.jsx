/**
 * Manage your website — everything on the hotel's site at botlify.site/<slug>.
 *
 * Left: an editor for every section (design, address & WhatsApp, hero, about,
 * highlights, rooms, amenities, gallery, location, contact, reviews, SEO).
 * Right: a live preview of the chosen template that updates as you type.
 * Nothing goes live until Save; the bar at the bottom says when there are
 * unsaved changes.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  BedDouble, Check, ChevronDown, Copy, ExternalLink, Eye, EyeOff, Globe, Image as ImageIcon,
  LayoutTemplate, Loader2, MapPin, Maximize2, MessageSquareQuote, Monitor, Phone, RefreshCw,
  Search, Smartphone, Sparkles, Star, Type,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import api from "@/services/api";
import { Magnetic, PulseDot, Reveal, SlidingTabs } from "@/components/fx";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import SiteRenderer from "@/website/SiteRenderer";
import TemplateGallery, { TemplatePreview } from "@/website/TemplateGallery";
import { templateById } from "@/website/templates";
import { PAGES } from "@/website/shared";
import { SITE_HOST, siteUrl, websiteApi } from "@/website/api";
import { ChipsEditor, Field, GalleryManager, ImageField, ListEditor, inputCls } from "@/website/editor";

const spring = { type: "spring", stiffness: 420, damping: 30 };
const hop = "transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]";

const pick = (w) => ({
  templateId: w.templateId,
  slug: w.slug,
  whatsappNumber: w.whatsappNumber ? `+${w.whatsappNumber}` : "",
  published: w.published !== false,
  accent: w.accent || "",
  content: JSON.parse(JSON.stringify(w.content || {})),
  roomOverrides: (w.roomOverrides || []).map((o) => ({ ...o, roomTypeId: String(o.roomTypeId) })),
});

export default function ManageWebsitePage() {
  const confirm = useConfirm();
  const [loading, setLoading] = useState(true);
  const [noProperty, setNoProperty] = useState(false);
  const [data, setData] = useState(null); // { website, site, property }
  const [draftSite, setDraftSite] = useState(null); // preview data before a site exists
  const [rooms, setRooms] = useState([]);
  const [draft, setDraft] = useState(null);
  const [baseline, setBaseline] = useState(null);
  const [saving, setSaving] = useState(false);
  const [busyTemplate, setBusyTemplate] = useState(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [fullPreview, setFullPreview] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const apply = useCallback((res) => {
    setData(res);
    if (res.website) {
      const d = pick(res.website);
      setDraft(d);
      setBaseline(d);
    }
  }, []);

  const load = useCallback(async () => {
    try {
      const res = await websiteApi.get();
      apply(res);
      if (!res.website) setDraftSite(await websiteApi.draft().catch(() => null));
      if (res.property?._id) {
        api.get(`/hotel/properties/${res.property._id}/rooms`).then(({ data: r }) => setRooms((r.roomTypes || r.rooms || []).filter((x) => x.active !== false))).catch(() => {});
      }
    } catch (e) {
      if (e?.response?.status === 404) setNoProperty(true);
      else toast.error(e?.response?.data?.message || "Couldn't load your website");
    } finally {
      setLoading(false);
    }
  }, [apply]);

  useEffect(() => {
    load();
  }, [load]);

  const dirty = useMemo(() => draft && baseline && JSON.stringify(draft) !== JSON.stringify(baseline), [draft, baseline]);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return undefined;
    const on = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", on);
    return () => window.removeEventListener("beforeunload", on);
  }, [dirty]);

  const set = (path, value) =>
    setDraft((d) => {
      const next = { ...d, content: { ...d.content } };
      const [a, b] = path.split(".");
      if (a === "content") next.content[b] = value;
      else if (b) next.content[a] = { ...(d.content[a] || {}), [b]: value };
      else next[a] = value;
      return next;
    });

  const save = async () => {
    setSaving(true);
    try {
      const body = { ...draft };
      if (draft.slug === baseline.slug) delete body.slug;
      const res = await websiteApi.update(body);
      apply(res);
      toast.success(draft.published ? "Saved — your website is updated" : "Saved");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Couldn't save — try again");
    } finally {
      setSaving(false);
    }
  };

  const createWith = async (templateId) => {
    setBusyTemplate(templateId);
    try {
      const res = await websiteApi.generate({ templateId });
      apply(res);
      toast.success("Your website is live!");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Couldn't create your website");
    } finally {
      setBusyTemplate(null);
    }
  };

  const regenerate = async () => {
    const ok = await confirm({
      title: "Rewrite the text from your hotel details?",
      description:
        "We'll rewrite the headline, about text, amenities, location and SEO from your current property and rooms. Your own photos and reviews are kept. Unsaved changes here will be lost.",
      confirmLabel: "Rewrite text",
    });
    if (!ok) return;
    setRegenerating(true);
    try {
      apply(await websiteApi.generate({ templateId: draft.templateId }));
      toast.success("Text refreshed from your hotel details");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Couldn't refresh");
    } finally {
      setRegenerating(false);
    }
  };

  // What the preview shows: the saved site with every unsaved edit applied.
  const previewSite = useMemo(() => {
    if (!data?.site || !draft) return null;
    const ov = new Map((draft.roomOverrides || []).map((o) => [String(o.roomTypeId), o]));
    const live = data.site.rooms || [];
    const allRooms = rooms.length
      ? rooms
          .filter((r) => !ov.get(String(r._id))?.hidden)
          .map((r) => {
            const base = live.find((x) => x.id === String(r._id));
            const o = ov.get(String(r._id)) || {};
            return {
              ...(base || {
                id: String(r._id), name: r.name, price: r.baseRate, currency: r.currency,
                maxOccupancy: r.maxOccupancy || 2, bedConfig: r.bedConfig, images: [], amenities: r.amenities || [],
                description: r.description || "", image: r.photos?.[0]?.url || data.site.content?.hero?.image,
              }),
              ...(o.description ? { description: o.description } : {}),
              ...(o.image ? { image: o.image } : {}),
            };
          })
      : live;
    return {
      ...data.site,
      templateId: draft.templateId,
      accent: draft.accent,
      whatsapp: String(draft.whatsappNumber || "").replace(/\D/g, "") || data.site.whatsapp,
      content: {
        ...data.site.content,
        ...draft.content,
        gallery: (draft.content.gallery || []).filter((g) => g.url),
        testimonials: (draft.content.testimonials || []).filter((t) => t.quote),
      },
      rooms: allRooms,
    };
  }, [data, draft, rooms]);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 pt-6 font-geist sm:px-6 sm:pt-8 lg:px-8" aria-busy="true">
        <div className="h-8 w-64 max-w-full rounded-lg bg-ink-900/[0.06] animate-pulse" />
        <div className="mt-3 h-4 w-48 rounded bg-ink-900/[0.06] animate-pulse" />
        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <div className="space-y-3">
            {[0, 1, 2, 3, 4].map((i) => <div key={i} className="card h-[72px] animate-pulse" />)}
          </div>
          <div className="card hidden h-[560px] animate-pulse xl:block" />
        </div>
      </div>
    );
  }

  if (noProperty) {
    return (
      <Reveal className="mx-auto max-w-lg px-6 py-24 text-center">
        <div className="relative mx-auto grid h-16 w-16 place-items-center">
          <span aria-hidden className="absolute inset-0 rounded-full bg-[#FF5A1F] opacity-20 blur-2xl" />
          <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-[#0A0A0A] text-[#FF5A1F]">
            <Globe className="h-7 w-7" strokeWidth={1.8} />
          </span>
        </div>
        <h1 className="mt-5 font-geist text-[28px] font-semibold tracking-[-0.045em] text-[#0A0A0A]">Set up your property first</h1>
        <p className="mt-2 text-ink-500">Your website is built from your hotel's details and rooms.</p>
        <Magnetic strength={0.3} className="mt-6">
          <Link to="/onboarding/hotel" className="btn bg-[#FF5A1F] text-white shadow-[0_10px_24px_-12px_rgba(255,90,31,0.8)] hover:bg-[#E84A12] hover:-translate-y-0.5 active:scale-[0.97] min-h-[44px] px-5">Set up my property</Link>
        </Magnetic>
      </Reveal>
    );
  }

  // ── No website yet: pick a design ─────────────────────────────────────
  if (!data?.website) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 pb-12 pt-6 font-geist sm:px-6 sm:pt-8 lg:px-8">
        <Reveal>
          <p className="inline-flex items-center gap-2 rounded-full bg-[#0A0A0A] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
            <Sparkles className="h-3.5 w-3.5" /> Your website
          </p>
          <h1 className="mt-3 font-geist text-[28px] font-semibold leading-tight tracking-[-0.045em] text-[#0A0A0A] sm:text-[40px]">
            Choose a <span className="text-[#FF5A1F]">design</span> for {data?.property?.name || "your hotel"}
          </h1>
          <p className="mt-2 max-w-2xl text-black/55">
            Five designs, all filled with your own hotel details. Preview any of them full screen — every page, on desktop and phone — then pick one. You can change it any time.
          </p>
        </Reveal>
        <div className="mt-8">
          <TemplateGallery site={draftSite} onSelect={createWith} busyId={busyTemplate} />
        </div>
      </div>
    );
  }

  const tpl = templateById(draft.templateId);
  const url = siteUrl(baseline.slug);

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-32 pt-6 font-geist sm:px-6 sm:pt-8 lg:px-8">
      {/* Header */}
      <Reveal className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3.5">
          <div className="hidden h-12 w-12 flex-shrink-0 place-items-center rounded-2xl bg-[#0A0A0A] text-[#FF5A1F] shadow-[0_14px_28px_-14px_rgba(10,10,10,0.7)] sm:grid">
            <Globe className="h-5 w-5" strokeWidth={1.8} />
          </div>
        <div className="min-w-0">
          <h1 className="font-geist text-[28px] font-semibold leading-tight tracking-[-0.045em] text-[#0A0A0A] sm:text-[36px]">
            Manage your <span className="text-[#FF5A1F]">website</span>
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 ${baseline.published ? "badge-green" : "badge-gray"}`}>
              {baseline.published ? <PulseDot color="bg-emerald-500" /> : <span className="h-1.5 w-1.5 rounded-full bg-ink-400" />}
              {baseline.published ? "Live" : "Hidden"}
            </span>
            <a href={url} target="_blank" rel="noopener noreferrer" className="min-w-0 truncate rounded-lg bg-white px-2 py-1 font-mono text-[13px] font-semibold text-[#0A0A0A] ring-1 ring-black/[0.07] underline-offset-4 hover:text-[#FF5A1F] hover:underline">
              {SITE_HOST}/{baseline.slug}
            </a>
            <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.9 }} transition={spring} type="button" onClick={() => { navigator.clipboard?.writeText(url); toast.success("Link copied"); }} className="grid h-9 w-9 place-items-center rounded-xl text-ink-400 hover:bg-white hover:text-ink-700 hover:shadow-[inset_0_1px_0_#fff,0_0_0_1px_rgba(15,23,42,0.08)]" aria-label="Copy link">
              <Copy className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={regenerate} disabled={regenerating} className="btn-secondary group min-h-[40px] disabled:opacity-60">
            {regenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4 transition-transform duration-700 ease-spring group-hover:rotate-180" />} Rewrite from hotel details
          </button>
          <Magnetic strength={0.25}>
            <a href={url} target="_blank" rel="noopener noreferrer" className="btn bg-[#FF5A1F] text-white shadow-[0_10px_24px_-12px_rgba(255,90,31,0.8)] hover:bg-[#E84A12] hover:-translate-y-0.5 active:scale-[0.97] group min-h-[40px]">
              View live site <ExternalLink className="h-4 w-4 transition-transform duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </Magnetic>
        </div>
      </Reveal>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        {/* ── Editor ─────────────────────────────────────────────── */}
        <div className="space-y-3">
          <Section icon={LayoutTemplate} title="Design" sub={`${tpl.name} — ${tpl.tagline}`} defaultOpen>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex -space-x-1">
                {tpl.swatches.map((c, i) => <motion.span key={c} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...spring, delay: i * 0.05 }} className="h-7 w-7 rounded-full border-2 border-white shadow-[0_2px_6px_rgba(15,23,42,0.18)]" style={{ background: c }} />)}
              </div>
              <button type="button" onClick={() => setGalleryOpen(true)} className="btn bg-[#FF5A1F] text-white shadow-[0_10px_24px_-12px_rgba(255,90,31,0.8)] hover:bg-[#E84A12] hover:-translate-y-0.5 active:scale-[0.97] group min-h-[40px]"><LayoutTemplate className="h-4 w-4 transition-transform duration-500 ease-spring group-hover:rotate-[-8deg]" /> Change design</button>
            </div>
            <div className="mt-5">
              <Field label="Accent colour" hint="Optional — buttons and highlights. Leave empty for the design's own colour.">
                <div className="flex items-center gap-3">
                  <input type="color" value={draft.accent || tpl.accent} onChange={(e) => set("accent", e.target.value)} className="h-10 w-14 cursor-pointer rounded-xl border border-ink-900/10 bg-white/80 p-1 shadow-[inset_0_1px_0_#fff] transition-transform duration-300 ease-spring hover:-translate-y-0.5" />
                  <span className="font-mono text-sm text-ink-600">{draft.accent || `${tpl.accent} (default)`}</span>
                  {draft.accent && <button type="button" onClick={() => set("accent", "")} className="btn-ghost px-2.5 py-1.5 text-sm">Reset</button>}
                </div>
              </Field>
            </div>
          </Section>

          <Section icon={Globe} title="Web address & WhatsApp" sub={`${SITE_HOST}/${draft.slug}`} defaultOpen>
            <SlugField value={draft.slug} original={baseline.slug} onChange={(v) => set("slug", v)} />
            <div className="mt-4">
              <Field label="WhatsApp number" hint="Every 'Book on WhatsApp' button and the floating chat button open a chat with this number.">
                <input className={inputCls} type="tel" placeholder="+62 812 3456 7890" value={draft.whatsappNumber} onChange={(e) => set("whatsappNumber", e.target.value)} />
              </Field>
            </div>
            <label className="mt-4 flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-white/60 p-3.5 ring-1 ring-ink-900/[0.07] transition-colors hover:bg-white/90">
              <span>
                <span className="block text-sm font-semibold text-ink-800">{draft.published ? "Website is public" : "Website is hidden"}</span>
                <span className="block text-xs text-ink-500">{draft.published ? "Anyone with the link can see it." : "Visitors see a 'not found' page until you publish."}</span>
              </span>
              <Toggle on={draft.published} onChange={(v) => set("published", v)} />
            </label>
          </Section>

          <Section icon={Type} title="Top of the page" sub="Headline, tagline and the big photo">
            <div className="space-y-4">
              <Field label="Headline"><input className={inputCls} maxLength={120} value={draft.content.hero?.title || ""} onChange={(e) => set("hero.title", e.target.value)} /></Field>
              <Field label="Tagline"><textarea rows={2} className={inputCls} maxLength={300} value={draft.content.hero?.subtitle || ""} onChange={(e) => set("hero.subtitle", e.target.value)} /></Field>
              <ImageField label="Main photo" value={draft.content.hero?.image} onChange={(v) => set("hero.image", v)} />
            </div>
          </Section>

          <Section icon={Sparkles} title="About" sub="Your story, and why guests love staying">
            <div className="space-y-4">
              <Field label="Heading"><input className={inputCls} maxLength={120} value={draft.content.about?.heading || ""} onChange={(e) => set("about.heading", e.target.value)} /></Field>
              <Field label="Text" hint="Leave an empty line between paragraphs."><textarea rows={8} className={inputCls} maxLength={5000} value={draft.content.about?.body || ""} onChange={(e) => set("about.body", e.target.value)} /></Field>
              <ImageField label="About photo" value={draft.content.about?.image} onChange={(v) => set("about.image", v)} aspect="4/5" />
              <div>
                <p className="label">Highlights</p>
                <ListEditor items={draft.content.highlights || []} onChange={(v) => set("content.highlights", v)} blank={{ title: "", body: "" }} addLabel="Add a highlight" fields={[{ key: "title", placeholder: "e.g. Book direct, pay less" }, { key: "body", placeholder: "One or two sentences", multiline: true }]} />
              </div>
            </div>
          </Section>

          <Section icon={BedDouble} title="Rooms" sub="Names and prices come from your rooms — here you choose how they look">
            {rooms.length === 0 ? (
              <p className="text-sm text-ink-500">No rooms yet. Add them in <Link to="/dashboard/settings" className="font-semibold text-[#FF5A1F] underline underline-offset-4">Settings</Link>.</p>
            ) : (
              <div className="space-y-3">
                {rooms.map((r) => {
                  const id = String(r._id);
                  const o = draft.roomOverrides.find((x) => x.roomTypeId === id) || { roomTypeId: id, hidden: false, description: "", image: "" };
                  const upd = (fields) => set("roomOverrides", [...draft.roomOverrides.filter((x) => x.roomTypeId !== id), { ...o, ...fields }]);
                  return (
                    <motion.div layout transition={spring} key={id} className={`rounded-xl p-3.5 ring-1 transition-colors ${o.hidden ? "bg-ink-900/[0.03] ring-ink-900/[0.05] opacity-75" : "bg-white/70 ring-ink-900/[0.07] shadow-[inset_0_1px_0_#fff]"}`}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-geist font-semibold tracking-[-0.01em] text-ink-900">{r.name}</p>
                          <p className="text-xs tabular-nums text-ink-500">{r.currency} {Number(r.baseRate || 0).toLocaleString()} / night · sleeps {r.maxOccupancy || 2}</p>
                        </div>
                        <button type="button" onClick={() => upd({ hidden: !o.hidden })} className={`btn min-h-[36px] shrink-0 gap-1.5 px-3 py-1.5 text-xs ring-1 hover:-translate-y-0.5 ${o.hidden ? "bg-ink-900/[0.04] text-ink-500 ring-ink-900/[0.08]" : "bg-emerald-50 text-emerald-700 ring-emerald-500/20"}`}>
                          {o.hidden ? <><EyeOff className="h-3.5 w-3.5" /> Hidden</> : <><Eye className="h-3.5 w-3.5" /> Shown</>}
                        </button>
                      </div>
                      <AnimatePresence initial={false}>
                      {!o.hidden && (
                        <motion.div key="body" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
                        <div className="mt-3 space-y-3">
                          <textarea rows={2} className={inputCls} placeholder={r.description || "Description shown on the website (optional)"} value={o.description} onChange={(e) => upd({ description: e.target.value })} />
                          <ImageField value={o.image || r.photos?.[0]?.url || (data.site.rooms.find((x) => x.id === id) || {}).image} onChange={(v) => upd({ image: v })} aspect="4/3" />
                        </div>
                        </motion.div>
                      )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </Section>

          <Section icon={Star} title="Amenities" sub={`${(draft.content.amenities || []).length} listed`}>
            <ChipsEditor items={draft.content.amenities || []} onChange={(v) => set("content.amenities", v)} placeholder="e.g. Rooftop bar" />
          </Section>

          <Section icon={ImageIcon} title="Gallery" sub={`${(draft.content.gallery || []).length} photos — upload or paste links`}>
            <GalleryManager photos={draft.content.gallery || []} onChange={(v) => set("content.gallery", v)} />
          </Section>

          <Section icon={MapPin} title="Location" sub="Address, map and directions">
            <div className="space-y-4">
              <Field label="Address"><input className={inputCls} value={draft.content.location?.address || ""} onChange={(e) => set("location.address", e.target.value)} /></Field>
              <Field label="Map search" hint="What Google Maps should look up — your hotel name and town usually works best."><input className={inputCls} value={draft.content.location?.mapQuery || ""} onChange={(e) => set("location.mapQuery", e.target.value)} /></Field>
              <Field label="Getting here"><textarea rows={3} className={inputCls} value={draft.content.location?.directions || ""} onChange={(e) => set("location.directions", e.target.value)} /></Field>
            </div>
          </Section>

          <Section icon={Phone} title="Contact details" sub="Shown on the Contact page and footer">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Phone"><input className={inputCls} type="tel" value={draft.content.contact?.phone || ""} onChange={(e) => set("contact.phone", e.target.value)} /></Field>
              <Field label="Email"><input className={inputCls} type="email" value={draft.content.contact?.email || ""} onChange={(e) => set("contact.email", e.target.value)} /></Field>
            </div>
          </Section>

          <Section icon={MessageSquareQuote} title="Guest reviews" sub="Only real reviews — copy them from Google, Booking.com or Airbnb">
            <ListEditor items={draft.content.testimonials || []} onChange={(v) => set("content.testimonials", v)} blank={{ quote: "", author: "", source: "" }} max={12} addLabel="Add a review" fields={[{ key: "quote", placeholder: "What the guest said", multiline: true }, { key: "author", placeholder: "Guest name, e.g. Anna from Berlin" }, { key: "source", placeholder: "Where it's from, e.g. Google" }]} />
          </Section>

          <Section icon={Search} title="Search engines" sub="How your site appears on Google">
            <div className="space-y-4">
              <Field label="Page title" hint={`${(draft.content.seo?.title || "").length}/70`}><input className={inputCls} maxLength={70} value={draft.content.seo?.title || ""} onChange={(e) => set("seo.title", e.target.value)} /></Field>
              <Field label="Description" hint={`${(draft.content.seo?.description || "").length}/160`}><textarea rows={3} className={inputCls} maxLength={170} value={draft.content.seo?.description || ""} onChange={(e) => set("seo.description", e.target.value)} /></Field>
            </div>
          </Section>
        </div>

        {/* ── Live preview ───────────────────────────────────────── */}
        <div className="xl:sticky xl:top-4 xl:self-start">
          <LivePreview site={previewSite} onExpand={() => setFullPreview(true)} />
        </div>
      </div>

      {/* Save bar */}
      <div className={`fixed inset-x-0 bottom-0 z-40 px-3 pb-3 transition-[transform,opacity] duration-500 ease-spring sm:px-6 sm:pb-5 ${dirty ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-[120%] opacity-0"}`}>
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#0A0A0A] px-4 py-3 shadow-[0_24px_60px_-20px_rgba(10,10,10,0.6)]">
          <p className="flex items-center gap-2 text-sm font-semibold text-white"><PulseDot color="bg-amber-400" /> You have unsaved changes</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setDraft(baseline)} className="btn min-h-[40px] text-white/70 hover:bg-white/10 hover:text-white">Discard</button>
            <button type="button" onClick={save} disabled={saving} className="btn bg-[#FF5A1F] text-white shadow-[0_10px_24px_-12px_rgba(255,90,31,0.8)] hover:bg-[#E84A12] hover:-translate-y-0.5 active:scale-[0.97] group min-h-[40px] disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 transition-transform duration-500 ease-spring group-hover:scale-125" />} Save &amp; publish
            </button>
          </div>
        </div>
      </div>

      {/* Change design */}
      <AnimatePresence>
      {galleryOpen && (
        <motion.div key="gallery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] overflow-y-auto bg-night-950/40 p-3 backdrop-blur-md sm:p-4" onClick={() => setGalleryOpen(false)}>
          <motion.div initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.97 }} transition={spring} className="glass-strong mx-auto my-6 max-w-6xl rounded-3xl p-4 sm:p-8" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-geist text-2xl font-semibold tracking-[-0.04em] text-[#0A0A0A]">Change <span className="text-[#FF5A1F]">design</span></h2>
                <p className="text-ink-500">Your content stays the same — only the look changes.</p>
              </div>
              <button type="button" onClick={() => setGalleryOpen(false)} className="btn-secondary min-h-[40px]">Close</button>
            </div>
            <TemplateGallery
              site={previewSite}
              currentId={draft.templateId}
              selectLabel="Switch to this"
              onSelect={(id) => {
                set("templateId", id);
                setGalleryOpen(false);
                toast.success(`${templateById(id).name} selected — save to publish it`);
              }}
            />
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      <TemplatePreview site={previewSite} templateId={fullPreview ? draft.templateId : null} onClose={() => setFullPreview(false)} />
    </div>
  );
}

function Section({ icon: Icon, title, sub, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Reveal y={14}>
    <div className={`rounded-2xl bg-white ring-1 transition-[box-shadow] duration-300 ${open ? "ring-[#FF5A1F]/30 shadow-[0_18px_40px_-24px_rgba(255,90,31,0.45)]" : "ring-black/[0.06] hover:ring-black/[0.12]"}`}>
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="group flex w-full items-center gap-3 rounded-2xl p-4 text-left transition-colors hover:bg-[#FAFAF9]">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${open ? "bg-[#FF5A1F] text-white shadow-[0_8px_20px_-8px_rgba(255,90,31,0.55)]" : "bg-[#0A0A0A] text-[#FF5A1F]"} ${hop}`}><Icon className="h-[18px] w-[18px]" strokeWidth={1.8} /></span>
        <span className="min-w-0 flex-1">
          <span className="block font-geist text-[15px] font-semibold tracking-[-0.02em] text-[#0A0A0A]">{title}</span>
          {sub && <span className="block truncate text-sm text-ink-500">{sub}</span>}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={spring} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-400 group-hover:bg-ink-900/[0.04] group-hover:text-ink-700">
          <ChevronDown className="h-5 w-5" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="c" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
            <div className="relative p-4"><div className="divider absolute inset-x-4 top-0" />{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </Reveal>
  );
}

function Toggle({ on, onChange }) {
  return (
    <motion.button whileTap={{ scale: 0.94 }} type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)} className={`relative h-7 w-12 shrink-0 rounded-full shadow-[inset_0_1px_2px_rgba(15,23,42,0.15)] transition-colors duration-300 ${on ? "bg-emerald-500" : "bg-ink-300"}`}>
      <motion.span layout transition={{ type: "spring", stiffness: 600, damping: 30 }} className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-[0_2px_6px_rgba(15,23,42,0.25)] ${on ? "left-6" : "left-1"}`} />
    </motion.button>
  );
}

/** botlify.site/<slug> with a live availability check. */
function SlugField({ value, original, onChange }) {
  const [status, setStatus] = useState(null); // { available, message }
  const timer = useRef(null);
  useEffect(() => {
    clearTimeout(timer.current);
    if (!value || value === original) {
      setStatus(null);
      return undefined;
    }
    timer.current = setTimeout(() => {
      websiteApi.checkSlug(value).then(setStatus).catch(() => setStatus(null));
    }, 400);
    return () => clearTimeout(timer.current);
  }, [value, original]);
  return (
    <Field label="Web address" hint="Lowercase letters, numbers and dashes.">
      <div className="flex items-center overflow-hidden rounded-xl border border-ink-900/10 bg-white/80 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] transition-[border-color,box-shadow] duration-300 focus-within:border-[#FF5A1F]/60 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(255,90,31,0.12)]">
        <span className="whitespace-nowrap bg-ink-900/[0.03] px-3 py-2.5 font-mono text-[13px] font-semibold text-ink-500 sm:text-sm">{SITE_HOST}/</span>
        <input
          className="w-full min-w-0 bg-transparent px-2 py-2.5 font-mono text-[14px] font-semibold text-ink-900 outline-none"
          value={value}
          maxLength={50}
          onChange={(e) => onChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-{2,}/g, "-"))}
        />
      </div>
      <AnimatePresence mode="wait">
      {status && (
        <motion.p key={String(status.available)} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={spring} className={`mt-1.5 text-xs font-semibold ${status.available ? "text-emerald-600" : "text-rose-600"}`}>
          {status.available ? "✓ Available" : status.message}
        </motion.p>
      )}
      </AnimatePresence>
    </Field>
  );
}

function LivePreview({ site, onExpand }) {
  const [device, setDevice] = useState("desktop");
  const [page, setPage] = useState("home");
  if (!site) return null;
  return (
    <Reveal delay={0.1} className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/[0.07] shadow-[0_30px_60px_-40px_rgba(10,10,10,0.45)]">
      <div className="flex flex-wrap items-center gap-2 rounded-t-2xl border-b border-black/[0.06] bg-[#FAFAFA] px-3 py-2">
        <div className="hidden items-center gap-1.5 pr-1 sm:flex" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
        </div>
        <div className="min-w-0 max-w-full overflow-x-auto">
          <SlidingTabs size="sm" items={PAGES.map((p) => ({ value: p.id, label: p.label }))} value={page} onChange={setPage} className="whitespace-nowrap" />
        </div>
        <div className="ml-auto flex items-center gap-1">
          <SlidingTabs
            size="sm"
            items={[
              { value: "desktop", label: <span className="sr-only">Desktop</span>, icon: Monitor },
              { value: "mobile", label: <span className="sr-only">Phone</span>, icon: Smartphone },
            ]}
            value={device}
            onChange={setDevice}
          />
          <motion.button whileHover={{ y: -2, rotate: -6 }} whileTap={{ scale: 0.9 }} transition={spring} type="button" onClick={onExpand} className="grid h-9 w-9 place-items-center rounded-xl text-ink-500 hover:bg-white hover:text-ink-800 hover:shadow-[inset_0_1px_0_#fff,0_0_0_1px_rgba(15,23,42,0.08)]" aria-label="Full screen"><Maximize2 className="h-4 w-4" /></motion.button>
        </div>
      </div>
      <div className="flex justify-center bg-[#F5F5F4] p-3" style={{ height: "calc(100vh - 170px)", minHeight: 560 }}>
        <div className={`h-full overflow-hidden bg-white shadow-[0_20px_50px_-24px_rgba(15,23,42,0.35)] transition-[width,border-radius] duration-500 ease-spring ${device === "mobile" ? "w-[375px] max-w-full rounded-[28px] border-[8px] border-night-950" : "w-full rounded-xl"}`}>
          <SiteRenderer key={device} site={site} mode={device === "mobile" ? "frame" : "scaled"} page={page} onNavigate={setPage} className="h-full w-full" />
        </div>
      </div>
    </Reveal>
  );
}
