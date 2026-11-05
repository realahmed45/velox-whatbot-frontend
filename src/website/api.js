import api from "@/services/api";

/** The public host hotel sites live on: botlify.site/<slug>. */
export const SITE_HOST = "botlify.site";

/** Absolute URL of a hotel's live site (current origin, so dev works too). */
export const siteUrl = (slug) =>
  `${typeof window !== "undefined" ? window.location.origin : `https://${SITE_HOST}`}/${slug}`;

export const websiteApi = {
  get: () => api.get("/website").then((r) => r.data),
  draft: (templateId) =>
    api.get("/website/draft", { params: { templateId } }).then((r) => r.data.site),
  generate: (body) => api.post("/website/generate", body).then((r) => r.data),
  update: (body) => api.patch("/website", body).then((r) => r.data),
  checkSlug: (slug) =>
    api.get("/website/slug-check", { params: { slug } }).then((r) => r.data),
  uploadPhoto: async (file) => {
    const fd = new FormData();
    fd.append("file", file);
    const { data } = await api.post("/website/photo", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.url;
  },
  publicSite: (slug) => api.get(`/public/site/${encodeURIComponent(slug)}`).then((r) => r.data.site),
};

export const MAX_PHOTO_MB = 10;
