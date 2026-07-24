import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import api from "@/services/api";
import toast from "react-hot-toast";
import {
  Plus,
  CalendarClock,
  Image as ImageIcon,
  Clock,
  Upload,
  X,
  TrendingUp,
  Trash2,
  Sparkles,
  Loader2,
  ImagePlus,
  Film,
  LayoutGrid,
  Check,
  AlertCircle,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import StatHero from "@/components/ui/StatHero";
import EmptyState from "@/components/ui/EmptyState";

dayjs.extend(relativeTime);

export default function ScheduledPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [smartTiming, setSmartTiming] = useState(null);
  const [showSmartTiming, setShowSmartTiming] = useState(false);

  // Form state
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [postType, setPostType] = useState("image"); // image | story
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dragging, setDragging] = useState(false);

  const fileInputRef = useRef(null);
  const [aiTopic, setAiTopic] = useState("");
  const [aiTone, setAiTone] = useState("casual");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiCaptions, setAiCaptions] = useState([]);
  const [showAiPanel, setShowAiPanel] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  // Lock body scroll + Escape-to-close while any modal is open
  useEffect(() => {
    const anyOpen = showModal || showSmartTiming;
    if (!anyOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (showModal) closeModal();
        if (showSmartTiming) setShowSmartTiming(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal, showSmartTiming]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/scheduled-posts");
      setPosts(data.posts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadSmartTiming = async () => {
    try {
      const { data } = await api.get("/scheduled-posts/smart-timing");
      setSmartTiming(data);
      setShowSmartTiming(true);
    } catch (err) {
      toast.error("Failed to load smart timing");
    }
  };

  const uploadImage = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const { data } = await api.post("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!data.url) {
        throw new Error("No URL returned from upload");
      }

      setImageUrl(data.url);
      toast.success("Image uploaded!");

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("[Upload] Error:", err);
      toast.error(err.response?.data?.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleCsvUpload = async (file) => {
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length < 2) {
        toast.error("CSV must have a header row and at least one data row");
        return;
      }
      const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const idx = {
        imageUrl: header.indexOf("imageurl"),
        caption: header.indexOf("caption"),
        scheduledTime: header.indexOf("scheduledtime"),
      };
      if (idx.imageUrl < 0 || idx.scheduledTime < 0) {
        toast.error(
          "CSV header must contain: imageUrl, caption, scheduledTime",
        );
        return;
      }
      const posts = lines.slice(1).map((line) => {
        // Simple CSV: handle quoted fields
        const cells = line.match(/("([^"]|"")*"|[^,]*)(,|$)/g) || [];
        const clean = cells.slice(0, cells.length - 1).map((c) =>
          c
            .replace(/,$/, "")
            .replace(/^"(.*)"$/, "$1")
            .replace(/""/g, '"')
            .trim(),
        );
        return {
          imageUrl: clean[idx.imageUrl] || "",
          caption: idx.caption >= 0 ? clean[idx.caption] || "" : "",
          scheduledTime: clean[idx.scheduledTime] || "",
        };
      });
      if (posts.length > 100) {
        toast.error("Max 100 posts per CSV");
        return;
      }
      const { data } = await api.post("/scheduled-posts/bulk", { posts });
      toast.success(
        `${data.inserted} scheduled${data.skipped ? `, ${data.skipped} skipped` : ""}`,
      );
      loadPosts();
    } catch (err) {
      console.error("[CSV] error", err);
      toast.error(err.response?.data?.message || "CSV import failed");
    }
  };

  const createPost = async (e) => {
    e.preventDefault();

    if (!imageUrl) {
      toast.error("Please upload an image");
      return;
    }
    if (!scheduledTime) {
      toast.error("Please select a time");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/scheduled-posts", {
        imageUrl,
        caption,
        postType,
        scheduledTime: new Date(scheduledTime).toISOString(),
      });

      toast.success("Post scheduled!");
      setShowModal(false);
      resetForm();
      loadPosts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to schedule post");
    } finally {
      setSubmitting(false);
    }
  };

  const cancelPost = async (id) => {
    if (!window.confirm("Cancel this scheduled post?")) return;

    try {
      await api.delete(`/scheduled-posts/${id}`);
      setPosts((p) => p.filter((x) => x._id !== id));
      toast.success("Post cancelled");
    } catch (err) {
      toast.error("Failed to cancel post");
    }
  };

  const resetForm = () => {
    setImageUrl("");
    setCaption("");
    setScheduledTime("");
    setPostType("image");
    setAiTopic("");
    setAiCaptions([]);
    setShowAiPanel(false);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  // Normalize a single AI caption entry (object {text,hashtags} or plain string)
  const captionToText = (c) => {
    if (!c) return "";
    if (typeof c === "string") return c;
    const text = c.text || "";
    const tags = Array.isArray(c.hashtags) ? c.hashtags.join(" ") : "";
    return tags ? `${text}\n\n${tags}`.trim() : text.trim();
  };

  const generateAICaptions = async () => {
    // Fall back to the current caption text as the topic if none typed
    const topic = (aiTopic.trim() || caption.trim()).slice(0, 300);
    if (!topic) {
      toast.error("Describe what the post is about first");
      return;
    }
    setAiLoading(true);
    try {
      const { data } = await api.post("/ai/caption", {
        topic,
        tone: aiTone,
        count: 3,
        language: "en",
      });

      // API shape: { success, captions: [{ text, hashtags }] } — also tolerate {caption}
      let list = Array.isArray(data?.captions) ? data.captions : [];
      if (!list.length && data?.caption) list = [data.caption];
      const normalized = list.map(captionToText).filter(Boolean);

      if (!normalized.length) {
        toast.error(
          "No caption suggestions returned. Add an AI key in settings and try again.",
        );
        setAiCaptions([]);
        return;
      }
      setAiCaptions(normalized);
      // Auto-insert the first suggestion for a fast happy path
      setCaption(normalized[0]);
      toast.success("Caption generated");
    } catch (err) {
      toast.error(err.response?.data?.message || "AI caption generation failed");
    } finally {
      setAiLoading(false);
    }
  };

  const STATUS_BADGE = {
    pending: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
    publishing: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
    published: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
    failed: "bg-red-100 text-red-700 ring-1 ring-red-200",
    cancelled: "bg-ink-100 text-ink-600 ring-1 ring-ink-200",
  };

  const STATUS_TEXT = {
    pending: "Pending",
    publishing: "Publishing…",
    published: "Published",
    failed: "Failed",
    cancelled: "Cancelled",
  };

  // Get minimum datetime (5 minutes from now)
  const minDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return now.toISOString().slice(0, 16);
  };

  const pendingCount = posts.filter((p) => p.status === "pending").length;
  const publishedCount = posts.filter((p) => p.status === "published").length;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      <StatHero
        icon={CalendarClock}
        title="Scheduled posts"
        subtitle="Plan Instagram posts and stories to publish automatically — keep your feed consistent on autopilot."
        stats={[
          { label: "Total posts", value: posts.length },
          { label: "Pending", value: pendingCount, accent: true },
          { label: "Published", value: publishedCount },
        ]}
      >
        <button
          onClick={loadSmartTiming}
          className="bg-white/10 hover:bg-white/20 text-white border border-white/15 font-semibold text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 transition backdrop-blur"
        >
          <TrendingUp className="w-4 h-4" />
          Smart timing
        </button>
        <label className="bg-white/10 hover:bg-white/20 text-white border border-white/15 font-semibold text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 transition backdrop-blur cursor-pointer">
          <Upload className="w-4 h-4" />
          Bulk CSV
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) =>
              e.target.files[0] && handleCsvUpload(e.target.files[0])
            }
          />
        </label>
        <button
          onClick={() => setShowModal(true)}
          className="bg-white text-ink-900 hover:bg-brand-50 font-bold text-sm px-5 py-2.5 rounded-xl shadow-sm flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          Schedule post
        </button>
      </StatHero>

      {/* Posts grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-ink-100 bg-white shadow-sm overflow-hidden animate-pulse"
            >
              <div className="aspect-square bg-ink-100" />
              <div className="p-4 space-y-3">
                <div className="h-3 rounded bg-ink-100 w-full" />
                <div className="h-3 rounded bg-ink-100 w-4/5" />
                <div className="h-3 rounded bg-ink-100 w-2/3" />
                <div className="h-9 rounded-xl bg-ink-100 mt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No scheduled posts yet"
          description="Queue posts and stories to publish automatically. Perfect for keeping your feed consistent — set it once and let it run."
          action={
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              Schedule your first post
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => {
            const isPending = post.status === "pending";
            const isStory = post.postType === "story";
            const when = dayjs(post.scheduledTime);
            const relative = when.isValid() ? when.fromNow() : "";
            return (
              <div
                key={post._id}
                className="group rounded-2xl border border-ink-100 bg-white shadow-sm overflow-hidden hover:border-brand-300 hover:shadow-md transition flex flex-col"
              >
                {/* Image preview */}
                <div className="aspect-square bg-ink-50 relative">
                  {post.imageUrl ? (
                    <img
                      src={post.imageUrl}
                      alt="Post preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-ink-300">
                      <ImageIcon className="w-10 h-10" />
                    </div>
                  )}

                  {/* Status badge */}
                  <span
                    className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${STATUS_BADGE[post.status] || STATUS_BADGE.pending}`}
                  >
                    {STATUS_TEXT[post.status] || post.status}
                  </span>

                  {/* Post type chip */}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-black/55 text-white backdrop-blur flex items-center gap-1">
                    {isStory ? (
                      <Film className="w-3 h-3" />
                    ) : (
                      <LayoutGrid className="w-3 h-3" />
                    )}
                    {isStory ? "Story" : "Feed"}
                  </span>
                </div>

                {/* Post details */}
                <div className="p-4 space-y-3 flex-1 flex flex-col">
                  <p className="text-sm text-ink-700 line-clamp-3 leading-relaxed min-h-[1.25rem]">
                    {post.caption || (
                      <span className="text-ink-400 italic">No caption</span>
                    )}
                  </p>

                  <div className="mt-auto space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-ink-500">
                      <Clock className="w-3.5 h-3.5 text-ink-400 shrink-0" />
                      <span className="truncate">
                        {post.status === "published"
                          ? `Published ${dayjs(post.publishedAt).format("MMM D, h:mm A")}`
                          : `${when.format("MMM D, h:mm A")}`}
                      </span>
                    </div>

                    {isPending && relative && (
                      <div className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
                        <CalendarClock className="w-3 h-3" />
                        {relative}
                      </div>
                    )}

                    {post.errorMessage && (
                      <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-2.5 py-1.5 flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{post.errorMessage}</span>
                      </p>
                    )}

                    {isPending && (
                      <button
                        onClick={() => cancelPost(post._id)}
                        className="w-full flex items-center justify-center gap-2 text-sm font-medium text-red-600 border border-ink-200 hover:border-red-300 hover:bg-red-50 rounded-xl py-2 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Post Modal — portal to body */}
      {showModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Schedule post"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={closeModal}
            />

            {/* Panel */}
            <div className="relative bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
              {/* Sticky header */}
              <div className="shrink-0 bg-white border-b border-ink-100 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
                    <CalendarClock className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-ink-900 leading-tight">
                      Schedule post
                    </h2>
                    <p className="text-xs text-ink-400">
                      Publish automatically at the perfect time
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-1.5 rounded-lg text-ink-400 hover:text-ink-700 hover:bg-ink-50 transition"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable body */}
              <form
                id="schedule-post-form"
                onSubmit={createPost}
                className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
              >
                {/* Image upload */}
                <div>
                  <label className="block text-sm font-semibold text-ink-700 mb-1.5">
                    Image <span className="text-brand-500">*</span>
                  </label>
                  {imageUrl ? (
                    <div className="relative group rounded-xl overflow-hidden border border-ink-100">
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="w-full max-h-72 object-cover"
                        onError={() => toast.error("Failed to load preview")}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition" />
                      <button
                        type="button"
                        onClick={() => setImageUrl("")}
                        className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md hover:bg-red-50 hover:text-red-600 text-ink-700 transition"
                        aria-label="Remove image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 text-xs font-semibold text-white bg-emerald-500 px-2 py-1 rounded-full shadow">
                        <Check className="w-3 h-3" />
                        Uploaded
                      </span>
                    </div>
                  ) : (
                    <label
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragging(true);
                      }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragging(false);
                        const f = e.dataTransfer.files?.[0];
                        if (f) uploadImage(f);
                      }}
                      className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
                        dragging
                          ? "border-brand-400 bg-brand-50/60"
                          : "border-ink-200 hover:border-brand-400 hover:bg-brand-50/40"
                      } ${uploading ? "pointer-events-none opacity-70" : ""}`}
                    >
                      <div className="w-11 h-11 rounded-2xl bg-ink-50 flex items-center justify-center">
                        {uploading ? (
                          <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
                        ) : (
                          <ImagePlus className="w-5 h-5 text-ink-400" />
                        )}
                      </div>
                      <span className="text-sm font-semibold text-ink-700">
                        {uploading
                          ? "Uploading…"
                          : "Click or drag to upload image"}
                      </span>
                      <span className="text-xs text-ink-400">
                        PNG, JPG up to 10 MB
                      </span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploading}
                        onChange={(e) =>
                          e.target.files[0] && uploadImage(e.target.files[0])
                        }
                      />
                    </label>
                  )}
                </div>

                {/* Caption */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-semibold text-ink-700">
                      Caption
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAiPanel((v) => !v)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-2.5 py-1 rounded-lg transition"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Generate with AI
                    </button>
                  </div>

                  {/* AI panel */}
                  {showAiPanel && (
                    <div className="mb-3 rounded-xl border border-brand-100 bg-brand-50/50 p-3 space-y-2.5">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={aiTopic}
                          onChange={(e) => setAiTopic(e.target.value)}
                          placeholder="What's the post about? (e.g. summer sale)"
                          className="flex-1 rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition bg-white"
                        />
                        <select
                          value={aiTone}
                          onChange={(e) => setAiTone(e.target.value)}
                          className="rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-900 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition bg-white"
                        >
                          <option value="casual">Casual</option>
                          <option value="professional">Professional</option>
                          <option value="playful">Playful</option>
                          <option value="bold">Bold</option>
                          <option value="inspirational">Inspirational</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={generateAICaptions}
                        disabled={aiLoading}
                        className="w-full inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-semibold text-sm rounded-lg py-2 shadow-sm transition"
                      >
                        {aiLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generating…
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Generate captions
                          </>
                        )}
                      </button>

                      {aiCaptions.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                            Suggestions — tap to use
                          </p>
                          {aiCaptions.map((c, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setCaption(c)}
                              className={`w-full text-left text-xs rounded-lg border px-3 py-2 whitespace-pre-line transition ${
                                caption === c
                                  ? "border-brand-400 bg-white ring-1 ring-brand-200"
                                  : "border-ink-200 bg-white hover:border-brand-300"
                              }`}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    rows={4}
                    maxLength={2200}
                    className="w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition resize-y"
                    placeholder="Write your caption…"
                  />
                  <p
                    className={`text-xs mt-1 text-right ${
                      caption.length > 2100 ? "text-amber-600" : "text-ink-400"
                    }`}
                  >
                    {caption.length}/2200
                  </p>
                </div>

                {/* Scheduled time */}
                <div>
                  <label className="block text-sm font-semibold text-ink-700 mb-1.5">
                    Publish date &amp; time{" "}
                    <span className="text-brand-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    min={minDateTime()}
                    className="w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm text-ink-900 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition"
                    required
                  />
                  <p className="text-xs text-ink-400 mt-1">
                    Minimum 5 minutes from now
                  </p>
                </div>

                {/* Post Type — Feed image or Story */}
                <div>
                  <label className="block text-sm font-semibold text-ink-700 mb-1.5">
                    Post type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPostType("image")}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold border transition ${
                        postType === "image"
                          ? "bg-brand-500 text-white border-brand-500 shadow-sm"
                          : "bg-white text-ink-700 border-ink-200 hover:border-brand-300"
                      }`}
                    >
                      <LayoutGrid className="w-4 h-4" />
                      Feed image
                    </button>
                    <button
                      type="button"
                      onClick={() => setPostType("story")}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold border transition ${
                        postType === "story"
                          ? "bg-brand-500 text-white border-brand-500 shadow-sm"
                          : "bg-white text-ink-700 border-ink-200 hover:border-brand-300"
                      }`}
                    >
                      <Film className="w-4 h-4" />
                      Story (24h)
                    </button>
                  </div>
                  {postType === "story" && (
                    <p className="text-xs text-amber-600 mt-1.5">
                      Stories don't use captions. Image-only stories supported.
                    </p>
                  )}
                </div>
              </form>

              {/* Sticky footer */}
              <div className="shrink-0 bg-white border-t border-ink-100 px-6 py-4 flex gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 border border-ink-200 hover:border-brand-300 text-ink-700 font-semibold text-sm rounded-xl py-2.5 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="schedule-post-form"
                  disabled={submitting || uploading}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-semibold text-sm rounded-xl py-2.5 shadow-sm transition"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Scheduling…
                    </>
                  ) : (
                    <>
                      <CalendarClock className="w-4 h-4" />
                      Schedule post
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Smart Timing Modal — portal to body */}
      {showSmartTiming &&
        smartTiming &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Smart timing"
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowSmartTiming(false)}
            />
            <div className="relative bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
              <div className="shrink-0 px-6 py-4 border-b border-ink-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h2 className="font-bold text-lg text-ink-900">
                    Smart timing
                  </h2>
                </div>
                <button
                  onClick={() => setShowSmartTiming(false)}
                  className="p-1.5 rounded-lg text-ink-400 hover:text-ink-700 hover:bg-ink-50 transition"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <p className="text-sm text-ink-600">{smartTiming.message}</p>
                <p className="text-xs text-ink-400">
                  Based on {smartTiming.dataPoints} data points
                </p>

                <div className="space-y-3">
                  {(smartTiming.recommendations || []).map((rec, i) => (
                    <div
                      key={i}
                      className="bg-brand-50 border border-brand-100 rounded-xl p-3.5"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-ink-900">
                          {rec.time}
                        </span>
                        <span className="text-xs text-brand-700 font-semibold bg-brand-100 px-2 py-0.5 rounded-full">
                          {rec.score}% engagement
                        </span>
                      </div>
                      <p className="text-xs text-ink-600">{rec.reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="shrink-0 border-t border-ink-100 p-6 pt-4">
                <button
                  onClick={() => setShowSmartTiming(false)}
                  className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm rounded-xl py-2.5 shadow-sm transition"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
