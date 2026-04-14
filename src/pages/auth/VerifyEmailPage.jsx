import { useSearchParams, Link } from "react-router-dom";
import { Mail } from "lucide-react";

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const email = params.get("email") || "your email";

  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <Mail className="w-8 h-8 text-brand-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Check your email
      </h2>
      <p className="text-gray-500 text-sm mb-4">
        We sent a verification link to{" "}
        <strong className="text-gray-700">{email}</strong>. Click the link in
        the email to verify your account.
      </p>
      <p className="text-xs text-gray-400">
        Didn't get it? Check your spam folder.{" "}
        <Link to="/login" className="text-brand-600 hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}
