/**
 * PhotoUploader — drag-and-drop + file-picker photo grid.
 *
 * Shared by the onboarding wizard (property photos and per-room photos). Uses
 * the app's existing upload endpoint, `POST /upload/image` (multipart, field
 * name "file", returns { url }), exactly as PropertyPage's PhotosCard does.
 *
 * Deliberately UNCONTROLLED with respect to the server: the parent owns the
 * photo array and decides when to persist it. During onboarding a room's
 * photos are uploaded to Cloudinary immediately but only attached to a record
 * when the parent saves — so a hotelier who bails halfway leaves no orphan
 * room, just an unreferenced image.
 *
 * Photos are ALWAYS optional. The empty state says so out loud, because the
 * fastest way to lose a hotelier mid-signup is to make them go find photos.
 *
 * Props
 *  photos     [{ url, caption, position }]
 *  onChange   (nextPhotos) => void
 *  max        cap (default 12)
 *  label      heading text
 *  hint       line under the heading
 *  compact    denser grid, for the room editor
 */
import { useCallback, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Star, X } from "lucide-react";
import toast from "react-hot-toast";
import { clsx } from "clsx";
import api from "@/services/api";

const MAX_MB = 10;

export default function PhotoUploader({
  photos = [],
  onChange,
  max = 12,
  label = "Photos",
  hint = "You can add these later — skipping won't hold anything up.",
  compact = false,
}) {
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);

  const upload = useCallback(
    async (files) => {
      const picked = Array.from(files || []).filter((f) =>
        f.type?.startsWith("image/"),
      );
      if (!picked.length) {
        toast.error("Please choose an image file");
        return;
      }
      const room = max - photos.length;
      if (room <= 0) {
        toast.error(`That's the ${max}-photo limit — remove one first`);
        return;
      }
      const list = picked.slice(0, room);
      const tooBig = list.filter((f) => f.size > MAX_MB * 1024 * 1024);
      if (tooBig.length) {
        toast.error(`Images need to be under ${MAX_MB}MB`);
      }
      const usable = list.filter((f) => f.size <= MAX_MB * 1024 * 1024);
      if (!usable.length) return;

      setUploading(true);
      try {
        const uploaded = [];
        for (const file of usable) {
          const formData = new FormData();
          formData.append("file", file);
          const { data } = await api.post("/upload/image", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          if (data?.url) uploaded.push(data.url);
        }
        if (!uploaded.length) throw new Error("No URL returned");
        onChange([
          ...photos,
          ...uploaded.map((url, i) => ({
            url,
            caption: "",
            position: photos.length + i,
          })),
        ]);
        toast.success(
          uploaded.length > 1 ? `${uploaded.length} photos added` : "Photo added",
        );
      } catch (e) {
        toast.error(e?.response?.data?.message || "Upload failed — try again");
      } finally {
        setUploading(false);
        if (fileRef.current) fileRef.current.value = "";
      }
    },
    [max, onChange, photos],
  );

  const reposition = (list) => list.map((p, i) => ({ ...p, position: i }));

  const remove = (idx) =>
    onChange(reposition(photos.filter((_, i) => i !== idx)));

  const move = (idx, dir) => {
    const target = idx + dir;
    if (target < 0 || target >= photos.length) return;
    const next = [...photos];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(reposition(next));
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    upload(e.dataTransfer?.files);
  };

  const full = photos.length >= max;

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
        <span className="label mb-0">
          {label}{" "}
          <span className="font-normal text-ink-400">(optional)</span>
        </span>
        {photos.length > 0 && (
          <span className="text-xs font-semibold text-ink-400">
            {photos.length} of {max}
          </span>
        )}
      </div>

      {/* Drop zone — also the file picker. Kept as a real button so keyboard
          and screen-reader users get the same affordance as a drag. */}
      <button
        type="button"
        onClick={() => !full && fileRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!full) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        disabled={uploading || full}
        className={clsx(
          "w-full rounded-2xl border-2 border-dashed transition text-center",
          compact ? "px-4 py-5" : "px-5 py-7",
          dragging
            ? "border-brand-400 bg-brand-50"
            : "border-ink-200 bg-ink-50/60 hover:border-brand-300 hover:bg-brand-50/40",
          (uploading || full) && "opacity-60 cursor-not-allowed",
        )}
      >
        {uploading ? (
          <>
            <Loader2 className="w-6 h-6 text-brand-500 animate-spin mx-auto" />
            <p className="text-sm font-semibold text-ink-600 mt-2">
              Uploading…
            </p>
          </>
        ) : (
          <>
            <span className="w-10 h-10 rounded-xl bg-white border border-ink-200 flex items-center justify-center mx-auto shadow-card">
              <ImagePlus className="w-5 h-5 text-brand-500" />
            </span>
            <p className="text-sm font-bold text-ink-800 mt-2.5">
              {full ? `Photo limit reached (${max})` : "Add photos"}
            </p>
            <p className="text-xs text-ink-500 mt-1">
              {full
                ? "Remove one to add another."
                : "Tap to choose, or drag images here. JPG or PNG, up to 10MB."}
            </p>
          </>
        )}
      </button>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => upload(e.target.files)}
      />

      {photos.length === 0 ? (
        <p className="text-xs text-ink-400 mt-2">{hint}</p>
      ) : (
        <div
          className={clsx(
            "grid gap-2 mt-3",
            compact
              ? "grid-cols-3 sm:grid-cols-4"
              : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
          )}
        >
          {photos.map((p, i) => (
            <div
              key={`${p.url}-${i}`}
              className="relative group aspect-[4/3] rounded-xl overflow-hidden border border-ink-200 bg-ink-100"
            >
              <img
                src={p.url}
                alt={p.caption || `Photo ${i + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />

              {/* The first photo is the one guests see first — say so. */}
              {i === 0 && (
                <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  <Star className="w-2.5 h-2.5 fill-current" />
                  Cover
                </span>
              )}

              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition"
                aria-label={`Remove photo ${i + 1}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Reorder — the only way to change the cover shot. Always
                  visible on touch, where hover doesn't exist. */}
              {photos.length > 1 && (
                <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 p-1.5 bg-gradient-to-t from-black/60 to-transparent sm:opacity-0 sm:group-hover:opacity-100 transition">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="w-6 h-6 rounded-md bg-white/90 text-ink-700 flex items-center justify-center disabled:opacity-30"
                    aria-label={`Move photo ${i + 1} earlier`}
                  >
                    <ArrowLeft className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === photos.length - 1}
                    className="w-6 h-6 rounded-md bg-white/90 text-ink-700 flex items-center justify-center disabled:opacity-30"
                    aria-label={`Move photo ${i + 1} later`}
                  >
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
