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
import api from "@/services/api";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import SiteRenderer from "@/website/SiteRenderer";
import TemplateGallery, { TemplatePreview } from "@/website/TemplateGallery";
import { templateById } from "@/website/templates";
import { PAGES } from "@/website/shared";
import { SITE_HOST, siteUrl, websiteApi } from "@/website/api";
import { ChipsEditor, Field, GalleryManager, ImageField, ListEditor, inputCls } from "@/website/editor";

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
    return <div className="flex justify-center py-32"><Loader2 className="h-7 w-7 animate-spin text-brand-500" /></div>;
  }

  if (noProperty) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <Globe className="mx-auto h-10 w-10 text-ink-300" />
        <h1 className="mt-4 text-2xl font-black text-ink-900">Set up your property first</h1>
        <p className="mt-2 text-ink-500">Your website is built from your hotel's details and rooms.</p>
        <Link to="/onboarding/hotel" className="mt-6 inline-block rounded-xl bg-ink-900 px-5 py-3 font-bold text-white">Set up my property</Link>
      </div>
    );
  }

  // ── No website yet: pick a design ─────────────────────────────────────
  if (!data?.website) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <p className="text-sm font-bold uppercase tracking-wider text-brand-600">Your website</p>
        <h1 className="mt-1 text-3xl font-black text-ink-900">Choose a design for {data?.property?.name || "your hotel"}</h1>
        <p className="mt-2 max-w-2xl text-ink-500">
          Five designs, all filled with your own hotel details. Preview any of them full screen — every page, on desktop and phone — then pick one. You can change it any time.
        </p>
        <div className="mt-8">
          <TemplateGallery site={draftSite} onSelect={createWith} busyId={busyTemplate} />
        </div>
      </div>
    );
  }

  const tpl = templateById(draft.templateId);
  const url = siteUrl(baseline.slug);

  return (
    <div className="mx-auto max-w-[1600px] px-4 pb-32 pt-6 sm:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-ink-900 sm:text-3xl">Manage your website</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${baseline.published ? "bg-emerald-50 text-emerald-700" : "bg-ink-100 text-ink-600"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${baseline.published ? "bg-emerald-500" : "bg-ink-400"}`} />
              {baseline.published ? "Live" : "Hidden"}
            </span>
            <a href={url} target="_blank" rel="noopener noreferrer" className="font-semibold text-ink-700 hover:underline">
              {SITE_HOST}/{baseline.slug}
            </a>
            <button type="button" onClick={() => { navigator.clipboard?.writeText(url); toast.success("Link copied"); }} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700" aria-label="Copy link">
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={regenerate} disabled={regenerating} className="inline-flex items-center gap-1.5 rounded-xl border-2 border-ink-200 px-3.5 py-2 text-sm font-bold text-ink-700 hover:border-ink-900 disabled:opacity-60">
            {regenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Rewrite from hotel details
          </button>
          <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-xl bg-ink-900 px-4 py-2 text-sm font-bold text-white hover:bg-black">
            View live site <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        {/* ── Editor ─────────────────────────────────────────────── */}
        <div className="space-y-3">
          <Section icon={LayoutTemplate} title="Design" sub={`${tpl.name} — ${tpl.tagline}`} defaultOpen>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex -space-x-1">
                {tpl.swatches.map((c) => <span key={c} className="h-7 w-7 rounded-full border-2 border-white shadow" style={{ background: c }} />)}
              </div>
              <button type="button" onClick={() => setGalleryOpen(true)} className="rounded-xl bg-ink-900 px-4 py-2 text-sm font-bold text-white">Change design</button>
            </div>
            <div className="mt-5">
              <Field label="Accent colour" hint="Optional — buttons and highlights. Leave empty for the design's own colour.">
                <div className="flex items-center gap-3">
                  <input type="color" value={draft.accent || tpl.accent} onChange={(e) => set("accent", e.target.value)} className="h-10 w-14 cursor-pointer rounded-lg border-2 border-ink-200" />
                  <span className="font-mono text-sm text-ink-600">{draft.accent || `${tpl.accent} (default)`}</span>
                  {draft.accent && <button type="button" onClick={() => set("accent", "")} className="text-sm font-bold text-ink-500 underline">Reset</button>}
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
            <label className="mt-4 flex cursor-pointer items-center justify-between gap-4 rounded-xl border-2 border-ink-100 p-3">
              <span>
                <span className="block text-sm font-bold text-ink-800">{draft.published ? "Website is public" : "Website is hidden"}</span>
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
                <p className="mb-1.5 text-sm font-bold text-ink-800">Highlights</p>
                <ListEditor items={draft.content.highlights || []} onChange={(v) => set("content.highlights", v)} blank={{ title: "", body: "" }} addLabel="Add a highlight" fields={[{ key: "title", placeholder: "e.g. Book direct, pay less" }, { key: "body", placeholder: "One or two sentences", multiline: true }]} />
              </div>
            </div>
          </Section>

          <Section icon={BedDouble} title="Rooms" sub="Names and prices come from your rooms — here you choose how they look">
            {rooms.length === 0 ? (
              <p className="text-sm text-ink-500">No rooms yet. Add them in <Link to="/dashboard/settings" className="font-bold underline">Settings</Link>.</p>
            ) : (
              <div className="space-y-3">
                {rooms.map((r) => {
                  const id = String(r._id);
                  const o = draft.roomOverrides.find((x) => x.roomTypeId === id) || { roomTypeId: id, hidden: false, description: "", image: "" };
                  const upd = (fields) => set("roomOverrides", [...draft.roomOverrides.filter((x) => x.roomTypeId !== id), { ...o, ...fields }]);
                  return (
                    <div key={id} className={`rounded-xl border-2 p-3 ${o.hidden ? "border-ink-100 bg-ink-50" : "border-ink-100"}`}>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-bold text-ink-900">{r.name}</p>
                          <p className="text-xs text-ink-500">{r.currency} {Number(r.baseRate || 0).toLocaleString()} / night · sleeps {r.maxOccupancy || 2}</p>
                        </div>
                        <button type="button" onClick={() => upd({ hidden: !o.hidden })} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-ink-600 hover:bg-ink-100">
                          {o.hidden ? <><EyeOff className="h-3.5 w-3.5" /> Hidden</> : <><Eye className="h-3.5 w-3.5" /> Shown</>}
                        </button>
                      </div>
                      {!o.hidden && (
                        <div className="mt-3 space-y-3">
                          <textarea rows={2} className={inputCls} placeholder={r.description || "Description shown on the website (optional)"} value={o.description} onChange={(e) => upd({ description: e.target.value })} />
                          <ImageField value={o.image || r.photos?.[0]?.url || (data.site.rooms.find((x) => x.id === id) || {}).image} onChange={(v) => upd({ image: v })} aspect="4/3" />
                        </div>
                      )}
                    </div>
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
      <div className={`fixed inset-x-0 bottom-0 z-40 border-t border-ink-100 bg-white/95 backdrop-blur transition-transform duration-300 ${dirty ? "translate-y-0" : "translate-y-full"}`}>
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <p className="text-sm font-semibold text-ink-700">You have unsaved changes</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setDraft(baseline)} className="rounded-xl px-4 py-2.5 text-sm font-bold text-ink-600 hover:bg-ink-100">Discard</button>
            <button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-ink-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-black disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Save &amp; publish
            </button>
          </div>
        </div>
      </div>

      {/* Change design */}
      {galleryOpen && (
        <div className="fixed inset-0 z-[150] overflow-y-auto bg-ink-950/60 p-4 backdrop-blur-sm" onClick={() => setGalleryOpen(false)}>
          <div className="mx-auto my-6 max-w-6xl rounded-3xl bg-white p-5 sm:p-8" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-ink-900">Change design</h2>
                <p className="text-ink-500">Your content stays the same — only the look changes.</p>
              </div>
              <button type="button" onClick={() => setGalleryOpen(false)} className="rounded-xl px-3 py-2 font-bold text-ink-500 hover:bg-ink-100">Close</button>
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
          </div>
        </div>
      )}

      <TemplatePreview site={previewSite} templateId={fullPreview ? draft.templateId : null} onClose={() => setFullPreview(false)} />
    </div>
  );
}

function Section({ icon: Icon, title, sub, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-ink-100 bg-white">
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center gap-3 p-4 text-left">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink-50 text-ink-700"><Icon className="h-[18px] w-[18px]" /></span>
        <span className="min-w-0 flex-1">
          <span className="block font-black text-ink-900">{title}</span>
          {sub && <span className="block truncate text-sm text-ink-500">{sub}</span>}
        </span>
        <ChevronDown className={`h-5 w-5 text-ink-400 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="border-t border-ink-100 p-4">{children}</div>}
    </div>
  );
}

function Toggle({ on, onChange }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)} className={`relative h-7 w-12 shrink-0 rounded-full transition ${on ? "bg-emerald-500" : "bg-ink-300"}`}>
      <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-6" : "left-1"}`} />
    </button>
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
      <div className="flex items-center overflow-hidden rounded-xl border-2 border-ink-200 focus-within:border-ink-900">
        <span className="whitespace-nowrap bg-ink-50 px-3 py-2.5 text-[15px] font-semibold text-ink-500">{SITE_HOST}/</span>
        <input
          className="w-full px-2 py-2.5 text-[15px] font-semibold text-ink-900 outline-none"
          value={value}
          maxLength={50}
          onChange={(e) => onChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-{2,}/g, "-"))}
        />
      </div>
      {status && (
        <p className={`mt-1.5 text-xs font-semibold ${status.available ? "text-emerald-600" : "text-rose-600"}`}>
          {status.available ? "✓ Available" : status.message}
        </p>
      )}
    </Field>
  );
}

function LivePreview({ site, onExpand }) {
  const [device, setDevice] = useState("desktop");
  const [page, setPage] = useState("home");
  if (!site) return null;
  return (
    <div className="overflow-hidden rounded-2xl border border-ink-100 bg-ink-100">
      <div className="flex flex-wrap items-center gap-2 border-b border-ink-200 bg-white px-3 py-2">
        <div className="flex gap-1 overflow-x-auto">
          {PAGES.map((p) => (
            <button key={p.id} type="button" onClick={() => setPage(p.id)} className={`whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-bold ${page === p.id ? "bg-ink-900 text-white" : "text-ink-500 hover:bg-ink-100"}`}>{p.label}</button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1">
          <button type="button" onClick={() => setDevice("desktop")} className={`rounded-lg p-1.5 ${device === "desktop" ? "bg-ink-900 text-white" : "text-ink-500"}`} aria-label="Desktop"><Monitor className="h-4 w-4" /></button>
          <button type="button" onClick={() => setDevice("mobile")} className={`rounded-lg p-1.5 ${device === "mobile" ? "bg-ink-900 text-white" : "text-ink-500"}`} aria-label="Phone"><Smartphone className="h-4 w-4" /></button>
          <button type="button" onClick={onExpand} className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100" aria-label="Full screen"><Maximize2 className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="flex justify-center p-3" style={{ height: "calc(100vh - 170px)", minHeight: 560 }}>
        <div className={`h-full overflow-hidden bg-white shadow-sm ${device === "mobile" ? "w-[375px] rounded-[28px] border-[8px] border-ink-800" : "w-full rounded-lg"}`}>
          <SiteRenderer key={device} site={site} mode={device === "mobile" ? "frame" : "scaled"} page={page} onNavigate={setPage} className="h-full w-full" />
        </div>
      </div>
    </div>
  );
}
