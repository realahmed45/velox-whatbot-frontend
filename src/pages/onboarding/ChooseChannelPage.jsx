import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/** Instagram-only — connect the channel first, pricing comes after. */
export default function ChooseChannelPage() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/onboarding/instagram", { replace: true });
  }, [navigate]);
  return null;
}
