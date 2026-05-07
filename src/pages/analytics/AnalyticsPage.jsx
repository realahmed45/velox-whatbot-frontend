import { useWorkspaceStore } from "@/store/workspaceStore";
import IgAnalyticsPage from "./IgAnalyticsPage";
import WaAnalyticsPage from "./WaAnalyticsPage";

export default function AnalyticsPage() {
  const { workspace } = useWorkspaceStore();
  const channel = workspace?.activeChannel || "instagram";
  if (channel === "whatsapp") return <WaAnalyticsPage />;
  return <IgAnalyticsPage />;
}
