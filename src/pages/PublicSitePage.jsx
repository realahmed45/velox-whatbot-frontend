/**
 * A hotel's public website — botlify.site/<slug>[/<page>] (also /site/<slug>).
 *
 * Top-level paths that aren't app routes land here; anything that isn't a
 * published hotel site falls through to the normal 404 page. The five pages
 * are real URLs (botlify.site/<slug>/rooms), so they can be shared and
 * bookmarked.
 */
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import SiteRenderer from "@/website/SiteRenderer";
import { PAGES } from "@/website/shared";
import { websiteApi } from "@/website/api";
import NotFoundPage from "@/pages/NotFoundPage";

// App paths — never a hotel site, so don't even ask the API.
const RESERVED = new Set([
  "api", "app", "admin", "book", "site", "login", "register", "dashboard", "onboarding",
  "pricing", "help", "docs", "guide", "contact", "privacy", "terms", "invite", "accounts",
  "verify-email", "reset-password", "forgot-password", "features", "consultants",
]);

function setMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  const prev = el.getAttribute("content");
  el.setAttribute("content", content || "");
  return () => el.setAttribute("content", prev || "");
}

export default function PublicSitePage() {
  const { slug: rawSlug = "", page: rawPage } = useParams();
  const slug = rawSlug.toLowerCase();
  const page = rawPage || "home";
  const location = useLocation();
  const navigate = useNavigate();
  const base = location.pathname.startsWith("/site/") ? `/site/${slug}` : `/${slug}`;
  const validPage = PAGES.some((p) => p.id === page);
  const skip = RESERVED.has(slug) || !validPage;

  const [state, setState] = useState({ loading: !skip, site: null, missing: skip });

  useEffect(() => {
    if (skip) {
      setState({ loading: false, site: null, missing: true });
      return undefined;
    }
    let alive = true;
    setState((s) => (s.site?.slug === slug ? s : { loading: true, site: null, missing: false }));
    websiteApi
      .publicSite(slug)
      .then((site) => alive && setState({ loading: false, site, missing: false }))
      .catch(() => alive && setState({ loading: false, site: null, missing: true }));
    return () => {
      alive = false;
    };
  }, [slug, skip]);

  // Title + description for search engines and link previews.
  useEffect(() => {
    const site = state.site;
    if (!site) return undefined;
    const prevTitle = document.title;
    const label = PAGES.find((p) => p.id === page)?.label;
    const title = site.content?.seo?.title || site.hotel?.name;
    document.title = page === "home" ? title : `${label} — ${site.hotel?.name}`;
    const undo = setMeta("description", site.content?.seo?.description || site.content?.hero?.subtitle);
    const undoTheme = setMeta("theme-color", site.accent || "#111111");
    return () => {
      document.title = prevTitle;
      undo();
      undoTheme();
    };
  }, [state.site, page]);

  const hrefFor = useCallback((p) => (p === "home" ? base : `${base}/${p}`), [base]);
  const onNavigate = useCallback((p) => navigate(hrefFor(p)), [navigate, hrefFor]);

  if (state.missing) return <NotFoundPage />;
  if (state.loading || !state.site) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-ink-200 border-t-ink-800" />
      </div>
    );
  }

  return (
    <SiteRenderer
      site={state.site}
      mode="live"
      page={page}
      hrefFor={hrefFor}
      onNavigate={onNavigate}
    />
  );
}
