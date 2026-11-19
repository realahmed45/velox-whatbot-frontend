/**
 * Where Xendit sends a guest after paying a Botlify payment link.
 * /pay/thanks → success, /pay/failed → didn't go through.
 */
import { useParams } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";

export default function PayResultPage() {
  const { result } = useParams();
  const ok = result !== "failed";
  return (
    <div className="min-h-screen grid place-items-center bg-[#FAFAF9] px-4 font-geist">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-7 text-center">
        {ok ? (
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
        ) : (
          <XCircle className="mx-auto h-12 w-12 text-rose-500" />
        )}
        <h1 className="mt-4 text-[22px] font-semibold tracking-[-0.02em] text-[#0A0A0A]">
          {ok ? "Payment received" : "Payment didn't go through"}
        </h1>
        <p className="mt-2 text-[15px] text-neutral-500">
          {ok
            ? "Thank you! Your confirmation is on its way in the chat. You can close this page."
            : "No money was taken. Go back to the chat and open the link again, or try another payment method."}
        </p>
      </div>
    </div>
  );
}
