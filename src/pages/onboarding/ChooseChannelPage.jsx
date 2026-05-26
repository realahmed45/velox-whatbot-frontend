import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Botlify is Instagram-only — skip channel selection and go straight to pricing.
 */
export default function ChooseChannelPage() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/onboarding/pricing?channel=instagram", { replace: true });
  }, [navigate]);
  return null;
}
