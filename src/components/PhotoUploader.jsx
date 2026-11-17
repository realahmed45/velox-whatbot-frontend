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
 * Photos are optional by default — the empty state says so out loud. Pass
 * `required` where a photo is mandatory (a room added by hand needs at least
 * one picture); the label then says "(required)" and the empty-state hint is
 * shown as a warning. `error` shows an inline message under the grid.
 *
 * Props
 *  photos     [{ url, caption, position }]
 *  onChange   (nextPhotos) => void
 *  max        cap (default 12)
 *  label      heading text
 *  hint       line under the heading
 *  compact    denser grid, for the room editor
 *  required   at least one photo is needed (label + hint change)
 *  error      inline error message (e.g. after a blocked save)
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
  required = false,
  error = "",
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
          {required ? (
            <span className="font-normal text-rose-600">(required)</span>
          ) : (
            <span className="font-normal text-ink-400">(optional)</span>
          )}
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
          "group w-full rounded-2xl border-2 border-dashed text-center transition-all duration-500 ease-spring",
          compact ? "px-4 py-5" : "px-5 py-7",
          dragging
            ? "scale-[1.01] border-sunset-flame/60 bg-sunset-soft shadow-[0_18px_40px_-20px_rgba(255,61,119,0.5)]"
            : "border-ink-900/15 bg-white/50 hover:border-sunset-flame/40 hover:bg-white/80",
          (uploading || full) && "opacity-60 cursor-not-allowed",
        )}
      >
        {uploading ? (
          <>
            <Loader2 className="w-6 h-6 text-sunset-flame animate-spin mx-auto" />
            <p className="text-sm font-semibold text-ink-600 mt-2">
              Uploading…
            </p>
          </>
        ) : (
          <>
            <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-white shadow-[inset_0_1px_0_#fff,0_0_0_1px_rgba(255,106,43,0.14),0_8px_20px_-8px_rgba(255,61,119,0.4)] transition-transform duration-500 ease-spring group-hover:-translate-y-1 group-hover:rotate-[-8deg]">
              <ImagePlus className="w-5 h-5 text-sunset-flame" />
            </span>
            <p className="mt-2.5 text-sm font-semibold text-ink-800">
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
        <p
          className={clsx(
            "text-xs mt-2",
            required ? "font-medium text-amber-700" : "text-ink-400",
          )}
        >
          {hint}
        </p>
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
              className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-ink-900/[0.06] ring-1 ring-ink-900/[0.08] transition-transform duration-500 ease-spring hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-14px_rgba(15,23,42,0.4)]"
            >
              <img
                src={p.url}
                alt={p.caption || `Photo ${i + 1}`}
                className="h-full w-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
                loading="lazy"
              />

              {/* The first photo is the one guests see first — say so. */}
              {i === 0 && (
                <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-sunset px-2 py-0.5 text-[10px] font-semibold text-white shadow-[0_4px_10px_-4px_rgba(255,61,119,0.7)]">
                  <Star className="w-2.5 h-2.5 fill-current" />
                  Cover
                </span>
              )}

              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-night-950/60 text-white sm:opacity-0 transition duration-300 hover:scale-110 hover:bg-rose-500 focus:opacity-100 active:scale-90 sm:group-hover:opacity-100"
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

      {error && (
        <p role="alert" className="mt-2 text-sm font-medium text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}
