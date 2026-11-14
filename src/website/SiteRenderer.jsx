/**
 * SiteRenderer — hosts a website template in one of three modes:
 *
 *   live   the real public site. Uses the window for size and scrolling;
 *          pages are real URLs (hrefFor/onNavigate come from the router).
 *   frame  an interactive preview inside the app (template gallery, manage
 *          page). The template is boxed in its own scrolling frame; because
 *          the outer box has a transform, the template's `position: fixed`
 *          nav, WhatsApp button and lightbox pin to the frame, not the app.
 *   thumb  a static, scaled-down screenshot of the home page — rendered at a
 *          virtual desktop width and shrunk with transform: scale().
 */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { SiteCtx } from "./shared";
import { templateById } from "./templates";

/**
 * Site-wide polish every template shares: visible keyboard focus, headings
 * that never overflow a 360px phone, and calmer motion for people who ask
 * for it. Injected once per document.
 */
const SITE_CSS = `
.bsite :focus-visible{outline:2px solid currentColor;outline-offset:3px;border-radius:2px}
.bsite input:focus-visible,.bsite textarea:focus-visible,.bsite select:focus-visible{outline-offset:1px}
.bsite a,.bsite button{-webkit-tap-highlight-color:transparent}
.bsite h1,.bsite h2,.bsite h3{overflow-wrap:break-word;text-wrap:balance}
.bsite img{-webkit-user-drag:none}
@media (prefers-reduced-motion: reduce){.bsite *,.bsite *::before,.bsite *::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}
`;

function useSiteCss() {
  useEffect(() => {
    if (typeof document === "undefined" || document.getElementById("bsite-css")) return;
    const el = document.createElement("style");
    el.id = "bsite-css";
    el.textContent = SITE_CSS;
    document.head.appendChild(el);
  }, []);
}

/** Scopes the shared CSS without adding a layout box. */
const Scope = ({ children }) => (
  <div className="bsite" style={{ display: "contents" }}>
    {children}
  </div>
);

export default function SiteRenderer({
  site,
  templateId,
  mode = "frame",
  page: controlledPage,
  onNavigate,
  hrefFor,
  virtualWidth = 1280,
  virtualHeight = 800,
  className = "",
}) {
  useSiteCss();
  const [ownPage, setOwnPage] = useState("home");
  const page = controlledPage || ownPage;
  const scrollRoot = useRef(null);
  const outer = useRef(null);
  const [box, setBox] = useState({ w: virtualWidth, h: virtualHeight });

  // Measure the frame (frame/thumb) or the window (live).
  useLayoutEffect(() => {
    if (mode === "live") {
      const on = () => setBox({ w: window.innerWidth, h: window.innerHeight });
      on();
      window.addEventListener("resize", on);
      return () => window.removeEventListener("resize", on);
    }
    const el = outer.current;
    if (!el) return undefined;
    const on = () => setBox({ w: el.clientWidth || virtualWidth, h: el.clientHeight || virtualHeight });
    on();
    const ro = new ResizeObserver(on);
    ro.observe(el);
    return () => ro.disconnect();
  }, [mode, virtualWidth, virtualHeight]);

  const go = (p) => {
    if (onNavigate) onNavigate(p);
    else setOwnPage(p);
  };

  // New page → back to the top.
  useEffect(() => {
    if (mode === "live") window.scrollTo({ top: 0 });
    else if (scrollRoot.current) scrollRoot.current.scrollTop = 0;
  }, [page, mode]);

  const t = templateById(templateId || site?.templateId);
  const Template = t.Component;

  const ctx = useMemo(
    () => ({
      site,
      width: mode === "thumb" ? virtualWidth : box.w,
      height: mode === "thumb" ? virtualHeight : box.h,
      scrollRoot: mode === "live" ? null : scrollRoot,
      embedded: mode !== "live",
      still: mode === "thumb",
      page,
      go,
      href: hrefFor || (() => "#"),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [site, mode, box.w, box.h, page, hrefFor, virtualWidth, virtualHeight],
  );

  if (!site) return null;

  if (mode === "live") {
    return (
      <SiteCtx.Provider value={ctx}>
        <Scope><Template /></Scope>
      </SiteCtx.Provider>
    );
  }

  if (mode === "thumb") {
    const scale = box.w / virtualWidth;
    return (
      <div ref={outer} className={`relative overflow-hidden ${className}`} style={{ transform: "translateZ(0)" }} aria-hidden="true">
        <div
          className="pointer-events-none origin-top-left select-none"
          style={{ width: virtualWidth, height: virtualHeight / 1, transform: `scale(${scale})`, overflow: "hidden" }}
        >
          <div ref={scrollRoot} style={{ width: virtualWidth, height: virtualHeight, overflow: "hidden", transform: "translateZ(0)" }}>
            <SiteCtx.Provider value={ctx}>
              <Scope><Template /></Scope>
            </SiteCtx.Provider>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "scaled") {
    // Interactive, but laid out at desktop width and shrunk to fit the box.
    const vw = Math.max(virtualWidth, box.w);
    const scale = box.w / vw || 1;
    return (
      <div ref={outer} className={`relative overflow-hidden ${className}`}>
        <div
          className="origin-top-left"
          style={{ width: vw, height: box.h / scale, transform: `scale(${scale})` }}
        >
          <div className="relative h-full w-full overflow-hidden" style={{ transform: "translateZ(0)" }}>
            <div ref={scrollRoot} className="h-full w-full overflow-y-auto overflow-x-hidden overscroll-contain">
              <SiteCtx.Provider value={{ ...ctx, width: vw, height: box.h / scale }}>
                <Scope><Template /></Scope>
              </SiteCtx.Provider>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={outer} className={`relative overflow-hidden ${className}`} style={{ transform: "translateZ(0)" }}>
      <div ref={scrollRoot} className="h-full w-full overflow-y-auto overflow-x-hidden overscroll-contain">
        <SiteCtx.Provider value={ctx}>
          <Scope><Template /></Scope>
        </SiteCtx.Provider>
      </div>
    </div>
  );
}
