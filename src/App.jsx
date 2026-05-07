import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ConfirmProvider } from "@/components/ui/ConfirmDialog";
import ConnectChannelGate from "@/components/ConnectChannelGate";

// Layouts
import DashboardLayout from "@/layouts/DashboardLayout";
import AuthLayout from "@/layouts/AuthLayout";
import MarketingLayout from "@/layouts/MarketingLayout";

// Auth Pages
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
const VerifyEmailPage = lazy(() => import("@/pages/auth/VerifyEmailPage"));

// App Pages (lazy-loaded)
const OverviewPage = lazy(() => import("@/pages/dashboard/OverviewPage"));
const AutomationSetupPage = lazy(
  () => import("@/pages/automation/AutomationSetupPage"),
);
const AnalyticsPage = lazy(() => import("@/pages/analytics/AnalyticsPage"));
const InboxPage = lazy(() => import("@/pages/inbox/InboxPage"));
const ContactsPage = lazy(() => import("@/pages/contacts/ContactsPage"));
const BroadcastsPage = lazy(() => import("@/pages/broadcasts/BroadcastsPage"));
const AiBotPage = lazy(() => import("@/pages/ai-bot/AiBotPage"));
const PricingPage = lazy(() => import("@/pages/PricingPage"));
const GuidePage = lazy(() => import("@/pages/GuidePage"));
const SettingsPage = lazy(() => import("@/pages/settings/SettingsPage"));
const FlowBuilderPage = lazy(
  () => import("@/pages/flow-builder/FlowBuilderPage"),
);
const BillingPage = lazy(() => import("@/pages/billing/BillingPage"));

// Onboarding
const ChooseChannelPage = lazy(
  () => import("@/pages/onboarding/ChooseChannelPage"),
);
const WhatsAppOnboardingPage = lazy(
  () => import("@/pages/onboarding/WhatsAppOnboardingPage"),
);
const InstagramOnboardingPage = lazy(
  () => import("@/pages/onboarding/InstagramOnboardingPage"),
);

// Public
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const PublicBioPage = lazy(() => import("@/pages/link-in-bio/PublicBioPage"));
const PrivacyPage = lazy(() => import("@/pages/PrivacyPage"));
const TermsPage = lazy(() => import("@/pages/TermsPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

const ProtectedRoute = ({ children }) => {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/login" replace />;
};

const GuestRoute = ({ children }) => {
  const { token } = useAuthStore();
  return !token ? children : <Navigate to="/dashboard" replace />;
};

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ConfirmProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3500,
              style: {
                borderRadius: "10px",
                background: "#0f172a",
                color: "#fff",
                fontSize: "13px",
              },
            }}
          />
          <Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center text-sm text-ink-400">
                Loading…
              </div>
            }
          >
            <Routes>
              {/* Public marketing */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/@:slug" element={<PublicBioPage />} />
              <Route element={<MarketingLayout />}>
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/guide" element={<GuidePage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
              </Route>

              {/* Guest Routes (auth) */}
              <Route element={<AuthLayout />}>
                <Route
                  path="/login"
                  element={
                    <GuestRoute>
                      <LoginPage />
                    </GuestRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <GuestRoute>
                      <RegisterPage />
                    </GuestRoute>
                  }
                />
                <Route
                  path="/forgot-password"
                  element={
                    <GuestRoute>
                      <ForgotPasswordPage />
                    </GuestRoute>
                  }
                />
                <Route
                  path="/reset-password"
                  element={
                    <GuestRoute>
                      <ResetPasswordPage />
                    </GuestRoute>
                  }
                />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
              </Route>

              {/* App Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<OverviewPage />} />
                <Route path="automation" element={<AutomationSetupPage />} />
                <Route path="contacts" element={<ContactsPage />} />
                <Route path="ai-bot" element={<AiBotPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="billing" element={<BillingPage />} />
                <Route path="pricing" element={<PricingPage embedded />} />
                <Route path="guide" element={<GuidePage />} />
                <Route path="flow-builder" element={<FlowBuilderPage />} />
                <Route
                  path="flow-builder/:flowId"
                  element={<FlowBuilderPage />}
                />

                {/* Channel-gated pages */}
                <Route
                  path="inbox"
                  element={
                    <ConnectChannelGate feature="Inbox">
                      <InboxPage />
                    </ConnectChannelGate>
                  }
                />
                <Route
                  path="broadcasts"
                  element={
                    <ConnectChannelGate feature="Broadcasts">
                      <BroadcastsPage />
                    </ConnectChannelGate>
                  }
                />
                <Route
                  path="analytics"
                  element={
                    <ConnectChannelGate feature="Analytics">
                      <AnalyticsPage />
                    </ConnectChannelGate>
                  }
                />

                {/* Onboarding inside dashboard shell */}
                <Route
                  path="onboarding"
                  element={
                    <Navigate
                      to="/dashboard/onboarding/choose-channel"
                      replace
                    />
                  }
                />
                <Route
                  path="onboarding/choose-channel"
                  element={<ChooseChannelPage />}
                />
                <Route
                  path="onboarding/whatsapp"
                  element={<WhatsAppOnboardingPage />}
                />
                <Route
                  path="onboarding/instagram"
                  element={<InstagramOnboardingPage />}
                />
              </Route>

              {/* Legacy /onboarding/* → redirect into dashboard */}
              <Route
                path="/onboarding"
                element={
                  <Navigate to="/dashboard/onboarding/choose-channel" replace />
                }
              />
              <Route
                path="/onboarding/*"
                element={
                  <Navigate to="/dashboard/onboarding/choose-channel" replace />
                }
              />

              {/* 404 catch-all */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </ConfirmProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
