/**
 * Channel switcher — renders a *truly separate* component per channel.
 * Instagram and WhatsApp screens have distinct layouts, copy, and palettes.
 */
import { useWorkspaceStore } from "@/store/workspaceStore";
import IgAiBotPage from "./IgAiBotPage";
import WaAiBotPage from "./WaAiBotPage";

export default function AiBotPage() {
  const { workspace } = useWorkspaceStore();
  const channel = workspace?.activeChannel || "instagram";

  if (channel === "whatsapp") return <WaAiBotPage />;
  return <IgAiBotPage />;
}
