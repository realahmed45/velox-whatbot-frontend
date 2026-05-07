/**
 * Channel switcher — renders a separate component per channel.
 */
import { useWorkspaceStore } from "@/store/workspaceStore";
import IgBroadcastsPage from "./IgBroadcastsPage";
import WaBroadcastsPage from "./WaBroadcastsPage";

export default function BroadcastsPage() {
  const { workspace } = useWorkspaceStore();
  const channel = workspace?.activeChannel || "instagram";
  if (channel === "whatsapp") return <WaBroadcastsPage />;
  return <IgBroadcastsPage />;
}
