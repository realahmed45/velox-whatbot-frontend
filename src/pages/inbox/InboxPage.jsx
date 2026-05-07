import { useWorkspaceStore } from "@/store/workspaceStore";
import IgInboxPage from "./IgInboxPage";
import WaInboxPage from "./WaInboxPage";

export default function InboxPage() {
  const { workspace } = useWorkspaceStore();
  const channel = workspace?.activeChannel || "instagram";
  if (channel === "whatsapp") return <WaInboxPage />;
  return <IgInboxPage />;
}
