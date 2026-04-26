import { useEffect } from "react";

/**
 * Sets `document.title` while mounted, restores previous on unmount.
 * @param {string} title - page title (will be appended with brand)
 */
export default function useDocumentTitle(title) {
  useEffect(() => {
    if (!title) return;
    const prev = document.title;
    document.title = `${title} · Botlify`;
    return () => {
      document.title = prev;
    };
  }, [title]);
}
