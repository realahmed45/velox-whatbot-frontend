import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import api from "@/services/api";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      login(data.user, data.token, data.refreshToken);
      toast.success("Welcome back!");
      const ws = data.user?.activeWorkspace || data.user?.workspaces?.[0];
      navigate(ws ? "/dashboard" : "/onboarding");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-black text-ink-900 tracking-tighter">
        Welcome <span className="text-gradient-animated">back</span>
      </h2>
      <p className="text-ink-500 text-sm mt-2 mb-7">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="text-brand-600 font-semibold hover:underline"
        >
          Sign up free
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-2">
          <GoogleSignInButton />
        </div>
        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-ink-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-ink-400">
              Or continue with email
            </span>
          </div>
        </div>
        <div>
          <label className="label">Email address</label>
          <input
            className="input"
            type="email"
            placeholder="you@example.com"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <input
              className="input pr-10"
              type={show ? "text" : "password"}
              placeholder="••••••••"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
              onClick={() => setShow(!show)}
            >
              {show ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          <div className="text-right mt-1">
            <Link
              to="/forgot-password"
              className="text-xs text-brand-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
