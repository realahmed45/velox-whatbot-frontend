import { useWorkspaceStore } from "@/store/workspaceStore";
import IgContactsPage from "./IgContactsPage";
import WaContactsPage from "./WaContactsPage";

export default function ContactsPage() {
  const { workspace } = useWorkspaceStore();
  const channel = workspace?.activeChannel || "instagram";
  if (channel === "whatsapp") return <WaContactsPage />;
  return <IgContactsPage />;
}
