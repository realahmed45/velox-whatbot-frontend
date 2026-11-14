import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/** Legacy route — channel setup now lives inside the hotel setup wizard. */
export default function ChooseChannelPage() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/onboarding/hotel", { replace: true });
  }, [navigate]);
  return null;
}
