import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { onSocketEvent } from "@/services/socket";
import { useNotificationStore } from "./notificationStore";
import { showNotificationToast } from "./NotificationToast";
import { playChime } from "./sound";

/**
 * Mount once (DashboardLayout). Loads the first page, listens for
 * `notification:new` on the workspace socket, pops a toast (+ optional
 * chime), and resyncs when the socket reconnects or the tab regains focus.
 */
export function useNotificationsLive(workspaceId) {
  const navigate = useNavigate();
  const location = useLocation();
  const pathRef = useRef(location.pathname);
  pathRef.current = location.pathname;

  // Initial load per workspace.
  useEffect(() => {
    if (!workspaceId) return;
    const s = useNotificationStore.getState();
    s.reset();
    s.fetch();
  }, [workspaceId]);

  // Live events.
  useEffect(() => {
    if (!workspaceId) return undefined;

    const onNew = (payload) => {
      const notification = payload?.notification || payload;
      const store = useNotificationStore.getState();
      const fresh = store.receive(notification, payload?.unreadCount);
      if (!fresh) return;

      // Already looking at the inbox? Don't shout about a new message there —
      // the conversation list updates by itself. Count + badge still update.
      const onInbox = pathRef.current.startsWith("/dashboard/inbox");
      const quiet = onInbox && notification.type === "message.new" && notification.priority !== "high";
      if (!quiet) {
        showNotificationToast(notification, () => {
          useNotificationStore.getState().markRead(notification._id);
          if (notification.link) openLink(navigate, notification.link);
        });
      }
      if (store.soundOn && !quiet) playChime({ urgent: notification.priority === "high" });
    };

    // After a (re)connect we may have missed events — resync quietly.
    const onConnect = () => {
      const st = useNotificationStore.getState();
      if (Date.now() - st.loadedAt > 5000) st.fetch({ silent: true });
    };

    const offNew = onSocketEvent("notification:new", onNew);
    const offConnect = onSocketEvent("connect", onConnect);
    return () => {
      offNew();
      offConnect();
    };
  }, [workspaceId, navigate]);

  // Refresh the count when the tab comes back into view.
  useEffect(() => {
    if (!workspaceId) return undefined;
    const onVis = () => {
      if (document.visibilityState === "visible") useNotificationStore.getState().refreshCount();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [workspaceId]);
}

/** In-app links route client-side; absolute URLs open in a new tab. */
export function openLink(navigate, link) {
  if (!link) return;
  if (/^https?:\/\//i.test(link)) {
    try {
      const url = new URL(link);
      if (url.origin === window.location.origin) {
        navigate(url.pathname + url.search + url.hash);
        return;
      }
    } catch {
      /* fall through */
    }
    window.open(link, "_blank", "noopener,noreferrer");
    return;
  }
  navigate(link.startsWith("/") ? link : `/${link}`);
}
