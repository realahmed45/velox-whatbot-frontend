import { GoogleLogin } from "@react-oauth/google";
import { useAuthStore } from "@/store/authStore";
import api from "@/services/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

/**
 * Google Sign-in button used on Login + Register pages.
 * Decodes the JWT credential client-side to extract profile info,
 * then POSTs to /auth/google which creates/links the user and returns our JWT.
 */
export default function GoogleSignInButton({ label = "Continue with Google" }) {
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    try {
      const credential = credentialResponse?.credential;
      if (!credential) throw new Error("No credential returned from Google");

      // Decode JWT payload (base64url, middle segment)
      const payload = JSON.parse(
        atob(credential.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
      );

      const { data } = await api.post("/auth/google", {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        avatar: payload.picture,
      });

      login(data.user, data.token, data.refreshToken);
      toast.success("Welcome!");
      const ws = data.user?.activeWorkspace || data.user?.workspaces?.[0];
      navigate(ws ? "/dashboard" : "/onboarding");
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
