import { GoogleLogin } from "@react-oauth/google";
import { useAuthStore } from "@/store/authStore";
import api from "@/services/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

/**
 * Google Sign-in button used on Login + Register pages.
 * Sends the raw Google credential (ID token) to /auth/google, where the
 * backend verifies it against GOOGLE_CLIENT_ID before trusting the identity.
 */
export default function GoogleSignInButton({ label = "Continue with Google" }) {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSuccess = async (credentialResponse) => {
    try {
      const credential = credentialResponse?.credential;
      if (!credential) throw new Error("No credential returned from Google");

      const ref = searchParams.get("ref") || undefined;
      const { data } = await api.post("/auth/google", { credential, ref });

      login(data.user, data.token, data.refreshToken);
      toast.success("Welcome!");

      const ws = data.user?.activeWorkspace || data.user?.workspaces?.[0];
      const igConnected =
        data.user?.activeWorkspace?.instagram?.status === "connected";

      if (data.isNew || !ws || !igConnected) {
        navigate("/onboarding/instagram");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Google sign-in failed");
    }
  };

  return (
    <div className="w-full flex justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => toast.error("Google sign-in was cancelled")}
        text={
          label.toLowerCase().includes("sign up")
            ? "signup_with"
            : "continue_with"
        }
        size="large"
        width="100%"
        theme="outline"
        shape="rectangular"
      />
    </div>
  );
}
