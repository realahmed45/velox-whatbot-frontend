import { useEffect, useState, useRef } from "react";
import api from "@/services/api";
import toast from "react-hot-toast";
import {
  Plus,
  Calendar,
  Image as ImageIcon,
  Clock,
  Upload,
  X,
  TrendingUp,
  Trash2,
} from "lucide-react";
import dayjs from "dayjs";

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
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    loadPosts();
  }, []);

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

      console.log("[Upload] Response:", data);

      if (!data.url) {
        throw new Error("No URL returned from upload");
      }

      setImageUrl(data.url);
      console.log("[Upload] Image URL set to:", data.url);
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

  const createPost = async (e) => {
    e.preventDefault();

    console.log("[Create Post] imageUrl:", imageUrl);
    console.log("[Create Post] scheduledTime:", scheduledTime);

    if (!imageUrl) {
      toast.error("Please upload an image");
      return;
    }
    if (!scheduledTime) {
      toast.error("Please select a time");
      return;
    }

    try {
      await api.post("/scheduled-posts", {
        imageUrl,
        caption,
        scheduledTime: new Date(scheduledTime).toISOString(),
      });

      toast.success("Post scheduled!");
      setShowModal(false);
      resetForm();
      loadPosts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to schedule post");
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
  };

  const STATUS_BADGE = {
    pending: "bg-blue-100 text-blue-700",
    publishing: "bg-yellow-100 text-yellow-700",
    published: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
    cancelled: "bg-gray-100 text-gray-700",
  };

  const STATUS_TEXT = {
    pending: "Pending",
    publishing: "Publishing...",
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Scheduled Posts</h1>
          <p className="text-sm text-gray-500">
            Schedule Instagram posts to publish automatically
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadSmartTiming} className="btn-secondary gap-2">
            <TrendingUp className="w-4 h-4" />
            Smart Timing
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary gap-2"
          >
            <Plus className="w-4 h-4" />
            Schedule Post
          </button>
        </div>
      </div>

      {/* Posts grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No scheduled posts</p>
          <p className="text-gray-300 text-sm mt-1">
            Schedule your first post to publish automatically
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary mt-4 gap-2"
          >
            <Plus className="w-4 h-4" />
            Schedule Post
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => (
            <div
              key={post._id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Image preview */}
              <div className="aspect-square bg-gray-100 relative">
                <img
                  src={post.imageUrl}
                  alt="Post preview"
                  className="w-full h-full object-cover"
                />
                <span
                  className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[post.status]}`}
                >
                  {STATUS_TEXT[post.status]}
                </span>
              </div>

              {/* Post details */}
              <div className="p-4 space-y-3">
                <p className="text-sm text-gray-700 line-clamp-3">
                  {post.caption || "(No caption)"}
                </p>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {post.status === "published"
                    ? `Published ${dayjs(post.publishedAt).format("MMM D, h:mm A")}`
                    : `Scheduled for ${dayjs(post.scheduledTime).format("MMM D, h:mm A")}`}
                </div>

                {post.errorMessage && (
                  <p className="text-xs text-red-600">{post.errorMessage}</p>
                )}

                {post.status === "pending" && (
                  <button
                    onClick={() => cancelPost(post._id)}
                    className="w-full btn-secondary text-red-600 hover:bg-red-50 gap-2 text-sm"
                  >
                    <Trash2 className="w-3 h-3" />
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Post Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="font-semibold text-lg">Schedule Post</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={createPost} className="p-6 space-y-4">
              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image *
                </label>
                {imageUrl ? (
                  <div className="relative">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full rounded-lg border"
                      onError={(e) => {
                        console.error(
                          "[Image Preview] Failed to load:",
                          imageUrl,
                        );
                        toast.error("Failed to load image preview");
                      }}
                      onLoad={() => {
                        console.log(
                          "[Image Preview] Loaded successfully:",
                          imageUrl,
                        );
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">
                      {uploading ? "Uploading..." : "Click to upload image"}
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => uploadImage(e.target.files[0])}
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>

              {/* Caption */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Caption
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={4}
                  maxLength={2200}
                  className="input"
                  placeholder="Write your caption..."
                />
                <p className="text-xs text-gray-400 mt-1">
                  {caption.length}/2200
                </p>
              </div>

              {/* Scheduled time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Publish Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  min={minDateTime()}
                  className="input"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Minimum 5 minutes from now
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Schedule Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Smart Timing Modal */}
      {showSmartTiming && smartTiming && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-lg">
                Smart Timing Recommendations
              </h2>
              <button
                onClick={() => setShowSmartTiming(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">{smartTiming.message}</p>
              <p className="text-xs text-gray-400">
                Based on {smartTiming.dataPoints} data points
              </p>

              <div className="space-y-3">
                {smartTiming.recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="bg-blue-50 border border-blue-200 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-blue-900">
                        {rec.time}
                      </span>
                      <span className="text-xs text-blue-700 font-medium">
                        {rec.score}% engagement
                      </span>
                    </div>
                    <p className="text-xs text-blue-700">{rec.reason}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowSmartTiming(false)}
                className="btn-primary w-full"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
