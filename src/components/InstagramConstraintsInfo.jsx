import { Info, XCircle } from "lucide-react";

/**
 * Explains which Instagram triggers are impossible due to API constraints,
 * so users don't expect features that Meta simply doesn't expose.
 */
const CONSTRAINTS = [
  {
    title: "New follower trigger",
    reason:
      "Instagram Graph API does not expose follow events via webhooks, and there is no endpoint to list your followers. It's impossible to know when someone follows you.",
  },
  {
    title: "DM users who haven't messaged you first",
    reason:
      "Instagram's 24-hour messaging window requires the user to message you (or comment/react) before you can DM them. Cold-DMing accounts via the API is not allowed.",
  },
  {
    title: "Replying to non-text stories / reels",
    reason:
      "Story reactions (emoji taps) and some reel-only interactions don't fire a message webhook, only story replies with text do.",
  },
  {
    title: "Reading likes on posts",
    reason:
      "Post like events are no longer delivered via webhook since Meta's 2024 API changes. You can still react to comments.",
  },
  {
    title: "Bulk / scheduled outbound DMs to arbitrary users",
    reason:
      "Outbound DMs are always tied to an existing conversation in the 24-hour window. Broadcasts inside Botlify only re-engage contacts who opened that window recently.",
  },
];

export default function InstagramConstraintsInfo({ compact = false }) {
  return (
    <div className="card p-5 border-ink-200">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-accent-100 flex items-center justify-center flex-shrink-0">
          <Info className="w-4 h-4 text-accent-700" />
        </div>
        <div>
          <h3 className="font-semibold text-ink-900">
            Why some triggers aren't available
          </h3>
          <p className="text-xs text-ink-500 mt-0.5">
            These limits come from Meta's Instagram Graph API, not from Botlify.
          </p>
        </div>
      </div>

      <ul className="space-y-2.5 mt-3">
        {(compact ? CONSTRAINTS.slice(0, 3) : CONSTRAINTS).map((c) => (
          <li key={c.title} className="flex items-start gap-2 text-sm">
            <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-ink-800">{c.title}</p>
              <p className="text-xs text-ink-500 leading-relaxed">{c.reason}</p>
            </div>
          </li>
        ))}
      </ul>

      <p className="text-xs text-ink-400 mt-4 pt-3 border-t border-ink-100">
        If Instagram adds these capabilities in a future API version, we'll turn
        them on automatically.
      </p>
    </div>
  );
}
