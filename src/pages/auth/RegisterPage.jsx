import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    businessName: "",
    email: "",
    password: "",
  });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get("ref");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", {
        name: form.name,
        businessName: form.businessName,
        email: form.email,
        password: form.password,
        ref: refCode || undefined,
      });
      login(data.user, data.token, data.refreshToken);
      toast.success("Welcome to Botlify!");
      navigate("/onboarding/choose-channel");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-black text-ink-900 tracking-tighter">
        Create your <span className="text-gradient-animated">account</span>
      </h2>
      <p className="text-ink-500 text-sm mt-2 mb-7">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-brand-600 font-semibold hover:underline"
        >
          Sign in
        </Link>
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-2">
          <GoogleSignInButton label="Sign up with Google" />
        </div>
        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-ink-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-ink-400">
              Or sign up with email
            </span>
          </div>
        </div>
        <div>
          <label className="label">Full name</label>
          <input
            className="input"
            placeholder="Ahmad Ali"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Business name</label>
          <input
            className="input"
            placeholder="e.g. Linen Studio"
            required
            value={form.businessName}
            onChange={(e) => setForm({ ...form, businessName: e.target.value })}
          />
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
              placeholder="Min 8 characters"
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
        </div>
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
    </div>
  );
}
