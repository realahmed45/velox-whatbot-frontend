import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex w-1/2 bg-brand-600 flex-col items-center justify-center p-12 text-white">
        <div className="max-w-md text-center">
          <div className="text-5xl font-bold mb-4">💬</div>
          <h1 className="text-3xl font-bold mb-3">Flowgram</h1>
          <p className="text-brand-100 text-lg">
            Automate your Instagram DM conversations with powerful flows, smart
            inbox, and real-time analytics.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
            {[
              "Visual Flow Builder",
              "Smart Inbox",
              "CRM Contacts",
              "Analytics Dashboard",
              "JazzCash & EasyPaisa",
              "Multi-Agent Support",
            ].map((f) => (
              <div
                key={f}
                className="flex items-center gap-2 bg-brand-700 rounded-lg px-3 py-2"
              >
                <span className="text-brand-300">✓</span> {f}
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
