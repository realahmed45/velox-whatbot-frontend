/**
 * useChannelCallbackParams — handle everything the /channels/:platform/callback
 * can send the browser back with, on whichever page it returns to.
 *
 * The callback returns the user to where they started: Settings → Channels
 * (?from=channels) or the onboarding wizard (?from=onboarding). Both pages use
 * this hook so the feedback is identical in either place.
 *
 * Params it consumes:
 *   ?pick=facebook&tempToken=&userProfile=  headless Messenger — open the picker
 *   ?connected=<platform>[&webhook=failed]  success
 *   ?error=already_connected | connect_failed | unsupported_platform
 *          | cancelled | invalid_state      failure
 *
 * Every one of them is stripped from the URL afterwards with replace (never
 * push) so a refresh or Back doesn't replay the toast — or worse, re-run a
 * spent tempToken.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

const PLATFORM_LABELS = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  messenger: "Facebook Messenger",
  telegram: "Telegram",
};

const ERROR_MESSAGES = {
  already_connected:
    "That account is already connected to another Botlify workspace.",
  connect_failed: "Couldn't finish the connection. Please try again.",
  unsupported_platform: "That channel isn't supported yet.",
  cancelled: "Connection cancelled — nothing was changed.",
  invalid_state: "That connection link expired. Please try again.",
};

const CONSUMED = [
  "pick",
  "tempToken",
  "userProfile",
  "connected",
  "webhook",
  "error",
];

/**
 * @param {object}   opts
 * @param {Function} opts.onConnected  called after a successful connect, to
 *                                     refresh channel status
 * @param {string[]} [opts.keep]       query params to preserve when cleaning
 *                                     (the wizard must keep ?step=messaging or
 *                                     a refresh drops the user back to step 1)
 * @returns {{ picker: {tempToken,userProfile}|null, closePicker: Function,
 *             handlePicked: Function }}
 */
export default function useChannelCallbackParams({ onConnected, keep = [] }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [picker, setPicker] = useState(null);
  // The params are read once per arrival — StrictMode double-invokes effects in
  // dev, and re-toasting/re-opening on every render would be wrong.
  const handled = useRef(false);

  const clean = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        CONSUMED.filter((k) => !keep.includes(k)).forEach((k) =>
          next.delete(k),
        );
        return next;
      },
      { replace: true },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setSearchParams]);

  useEffect(() => {
    if (handled.current) return;

    const pick = searchParams.get("pick");
    const tempToken = searchParams.get("tempToken");
    const connected = searchParams.get("connected");
    const error = searchParams.get("error");
    if (!pick && !connected && !error) return;

    handled.current = true;

    if (pick === "facebook" && tempToken) {
      // Hold the token in state and clear it from the URL straight away — it's
      // short-lived and shouldn't sit in history or get copy-pasted.
      setPicker({
        tempToken,
        userProfile: searchParams.get("userProfile") || null,
      });
      clean();
      return;
    }

    if (connected) {
      const label = PLATFORM_LABELS[connected] || connected;
      if (searchParams.get("webhook") === "failed") {
        toast(
          `${label} connected, but we couldn't switch on live messages yet. Try disconnecting and connecting again.`,
          { icon: "⚠️", duration: 7000 },
        );
      } else {
        toast.success(`${label} connected`);
      }
      onConnected?.();
    } else if (error) {
      toast.error(ERROR_MESSAGES[error] || "Couldn't connect that channel.");
    }
    clean();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, clean]);

  /* The picker finished: toast, refresh status, drop the modal. */
  const handlePicked = useCallback(
    (result) => {
      setPicker(null);
      if (result?.webhookError) {
        toast(
          "Facebook Messenger connected, but we couldn't switch on live messages yet. Try disconnecting and connecting again.",
          { icon: "⚠️", duration: 7000 },
        );
      } else {
        toast.success(
          result?.username
            ? `Facebook Messenger connected — ${result.username}`
            : "Facebook Messenger connected",
        );
      }
      onConnected?.();
    },
    [onConnected],
  );

  const closePicker = useCallback(() => setPicker(null), []);

  return { picker, closePicker, handlePicked };
}
