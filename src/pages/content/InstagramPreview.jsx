import { Heart, MessageCircle, Send, Bookmark, Music2 } from "lucide-react";

/**
 * Live Instagram preview for the Schedule-post modal.
 * Renders a faithful feed / story / reel mock that updates as the user
 * fills the form, so they see exactly how the post will look.
 */
export default function InstagramPreview({
  postType = "image",
  imageUrl,
  videoUrl,
  caption = "",
  workspaceName = "your_handle",
}) {
  const handle = String(workspaceName).replace(/^@/, "");
  const hasMedia = postType === "reel" ? !!videoUrl : !!imageUrl;

  const Avatar = () => (
    <div className="w-7 h-7 rounded-full p-[2px] bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] shrink-0">
      <div className="w-full h-full rounded-full bg-white grid place-items-center text-[11px] font-bold text-ink-700">
        {handle.slice(0, 1).toUpperCase()}
      </div>
    </div>
  );

  const Media = ({ className = "" }) =>
    postType === "reel" ? (
      videoUrl ? (
        <video
          src={videoUrl}
          className={className}
          muted
          loop
          autoPlay
          playsInline
        />
      ) : (
        <Placeholder className={className} label="Your reel" />
      )
    ) : imageUrl ? (
      <img src={imageUrl} alt="" className={className} />
    ) : (
      <Placeholder className={className} label="Your image" />
    );

  const Placeholder = ({ className, label }) => (
    <div
      className={`${className} bg-ink-100 grid place-items-center text-ink-400 text-xs font-medium`}
    >
      {label}
    </div>
  );

  return (
    <div>
      <label className="block text-sm font-semibold text-ink-700 mb-1.5">
        Live preview
      </label>

      {/* FEED */}
      {postType === "image" && (
        <div className="mx-auto max-w-[300px] rounded-xl border border-ink-200 bg-white overflow-hidden shadow-sm">
          <div className="flex items-center gap-2 px-3 py-2">
            <Avatar />
            <span className="text-[13px] font-semibold text-ink-900">
              {handle}
            </span>
            <span className="ml-auto text-ink-400 text-lg leading-none">⋯</span>
          </div>
          <Media className="w-full aspect-square object-cover" />
          <div className="flex items-center gap-3 px-3 pt-2 text-ink-800">
            <Heart className="w-5 h-5" />
            <MessageCircle className="w-5 h-5" />
            <Send className="w-5 h-5" />
            <Bookmark className="w-5 h-5 ml-auto" />
          </div>
          <div className="px-3 py-2 text-[13px] text-ink-900 leading-snug">
            {caption ? (
              <>
                <span className="font-semibold">{handle}</span>{" "}
                <span className="whitespace-pre-wrap">{caption}</span>
              </>
            ) : (
              <span className="text-ink-400">
                Your caption will show here…
              </span>
            )}
          </div>
        </div>
      )}

      {/* STORY */}
      {postType === "story" && (
        <div className="mx-auto w-[210px] aspect-[9/16] rounded-2xl overflow-hidden relative bg-ink-950 shadow-md">
          <Media className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute top-0 inset-x-0 p-2">
            <div className="h-[3px] rounded-full bg-white/40 overflow-hidden">
              <div className="h-full w-1/3 bg-white" />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Avatar />
              <span className="text-[12px] font-semibold text-white drop-shadow">
                {handle}
              </span>
              <span className="text-[11px] text-white/70">now</span>
            </div>
          </div>
        </div>
      )}

      {/* REEL */}
      {postType === "reel" && (
        <div className="mx-auto w-[210px] aspect-[9/16] rounded-2xl overflow-hidden relative bg-ink-950 shadow-md">
          <Media className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
          <div className="absolute right-2 bottom-16 flex flex-col items-center gap-3 text-white">
            <Heart className="w-5 h-5" />
            <MessageCircle className="w-5 h-5" />
            <Send className="w-5 h-5" />
          </div>
          <div className="absolute left-2 right-10 bottom-3 text-white">
            <div className="flex items-center gap-2">
              <Avatar />
              <span className="text-[12px] font-semibold drop-shadow">
                {handle}
              </span>
            </div>
            {caption && (
              <p className="text-[11px] mt-1.5 line-clamp-2 drop-shadow whitespace-pre-wrap">
                {caption}
              </p>
            )}
            <div className="flex items-center gap-1 mt-1.5 text-[10px] text-white/90">
              <Music2 className="w-3 h-3" />
              <span>Original audio</span>
            </div>
          </div>
        </div>
      )}

      {!hasMedia && (
        <p className="text-center text-xs text-ink-400 mt-2">
          Upload {postType === "reel" ? "a video" : "an image"} to see the full
          preview.
        </p>
      )}
    </div>
  );
}
