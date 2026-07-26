import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import ErrorBoundary from "@/components/ErrorBoundary";
import BrandSpinner from "@/components/ui/BrandSpinner";
import { ConfirmProvider } from "@/components/ui/ConfirmDialog";
import ConnectChannelGate from "@/components/ConnectChannelGate";
import RequireOnboarding from "@/components/RequireOnboarding";
import RequirePermission from "@/components/RequirePermission";

// Layouts
import DashboardLayout from "@/layouts/DashboardLayout";
import AuthLayout from "@/layouts/AuthLayout";
import MarketingLayout from "@/layouts/MarketingLayout";
import OnboardingLayout from "@/layouts/OnboardingLayout";

// Auth Pages
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
const VerifyEmailPage = lazy(() => import("@/pages/auth/VerifyEmailPage"));
const InvitePage = lazy(() => import("@/pages/auth/InvitePage"));

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
const CustomFlowsPage = lazy(
  () => import("@/pages/flow-builder/CustomFlowsPage"),
);
const BillingPage = lazy(() => import("@/pages/billing/BillingPage"));

// Growth tools (lazy-loaded)
const ScheduledPostsPage = lazy(
  () => import("@/pages/content/ScheduledPostsPage"),
);
const DripCampaignsPage = lazy(() => import("@/pages/drip/DripCampaignsPage"));
const HashtagsPage = lazy(() => import("@/pages/hashtags/HashtagsPage"));
const IntegrationsPage = lazy(
  () => import("@/pages/integrations/IntegrationsPage"),
);
const AppsIntegrationsPage = lazy(
  () => import("@/pages/integrations/AppsIntegrationsPage"),
);
const TeamPage = lazy(() => import("@/pages/team/TeamPage"));

// Onboarding
const ChooseChannelPage = lazy(
  () => import("@/pages/onboarding/ChooseChannelPage"),
);
const OnboardingPricingPage = lazy(
  () => import("@/pages/onboarding/OnboardingPricingPage"),
);
const InstagramOnboardingPage = lazy(
  () => import("@/pages/onboarding/InstagramOnboardingPage"),
);

// Public
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const PublicBioPage = lazy(() => import("@/pages/link-in-bio/PublicBioPage"));
const PrivacyPage = lazy(() => import("@/pages/PrivacyPage"));
const TermsPage = lazy(() => import("@/pages/TermsPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const HelpPage = lazy(() => import("@/pages/HelpPage"));
const FeaturesPage = lazy(() => import("@/pages/FeaturesPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

const ProtectedRoute = ({ children }) => {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/login" replace />;
};

const GuestRoute = ({ children }) => {
  const { token, user } = useAuthStore();
  if (!token) return children;
  // A logged-in but unverified email/password user must finish the 4-digit
  // code step before entering the app — never bounce them to the dashboard.
  if (user && user.isEmailVerified === false) {
    return <Navigate to="/verify-email" replace state={{ email: user.email }} />;
  }
  return <Navigate to="/dashboard" replace />;
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
          <Suspense fallback={<BrandSpinner />}>
            <Routes>
              {/* Public marketing */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/@:slug" element={<PublicBioPage />} />
              {/* Team-invite landing (self-redirects to login if needed) */}
              <Route path="/invite" element={<InvitePage />} />
              <Route element={<MarketingLayout />}>
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/guide" element={<GuidePage />} />
                <Route path="/features" element={<FeaturesPage />} />
                <Route path="/help" element={<HelpPage />} />
                <Route path="/contact" element={<ContactPage />} />
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
                    <RequireOnboarding>
                      <DashboardLayout />
                    </RequireOnboarding>
                  </ProtectedRoute>
                }
              >
                <Route index element={<OverviewPage />} />
                <Route
                  path="automation"
                  element={
                    <RequirePermission perm="automations">
                      <AutomationSetupPage />
                    </RequirePermission>
                  }
                />
                <Route
                  path="flows"
                  element={
                    <RequirePermission perm="automations">
                      <CustomFlowsPage />
                    </RequirePermission>
                  }
                />
                <Route
                  path="contacts"
                  element={
                    <RequirePermission perm="contacts">
                      <ContactsPage />
                    </RequirePermission>
                  }
                />
                <Route
                  path="ai-bot"
                  element={
                    <RequirePermission perm="automations">
                      <AiBotPage />
                    </RequirePermission>
                  }
                />
                <Route
                  path="settings"
                  element={
                    <RequirePermission perm="settings">
                      <SettingsPage />
                    </RequirePermission>
                  }
                />
                <Route
                  path="billing"
                  element={
                    <RequirePermission ownerOnly>
                      <BillingPage />
                    </RequirePermission>
                  }
                />
                <Route path="pricing" element={<PricingPage embedded />} />
                <Route path="guide" element={<GuidePage />} />
                <Route
                  path="flow-builder"
                  element={<Navigate to="/dashboard/automation" replace />}
                />
                <Route
                  path="flow-builder/:flowId"
                  element={
                    <RequirePermission perm="automations">
                      <FlowBuilderPage />
                    </RequirePermission>
                  }
                />

                {/* Growth tools */}
                <Route
                  path="scheduled-posts"
                  element={
                    <RequirePermission perm="content">
                      <ScheduledPostsPage />
                    </RequirePermission>
                  }
                />
                <Route
                  path="drip"
                  element={
                    <RequirePermission perm="broadcasts">
                      <DripCampaignsPage />
                    </RequirePermission>
                  }
                />
                <Route
                  path="hashtags"
                  element={
                    <RequirePermission perm="content">
                      <HashtagsPage />
                    </RequirePermission>
                  }
                />
                <Route
                  path="integrations"
                  element={
                    <RequirePermission perm="integrations">
                      <IntegrationsPage />
                    </RequirePermission>
                  }
                />
                <Route
                  path="apps"
                  element={
                    <RequirePermission perm="integrations">
                      <AppsIntegrationsPage />
                    </RequirePermission>
                  }
                />
                <Route
                  path="team"
                  element={
                    <RequirePermission ownerOnly>
                      <TeamPage />
                    </RequirePermission>
                  }
                />

                {/* Channel-gated pages */}
                <Route
                  path="inbox"
                  element={
                    <RequirePermission perm="inbox">
                      <ConnectChannelGate feature="Inbox">
                        <InboxPage />
                      </ConnectChannelGate>
                    </RequirePermission>
                  }
                />
                <Route
                  path="broadcasts"
                  element={
                    <RequirePermission perm="broadcasts">
                      <ConnectChannelGate feature="Broadcasts">
                        <BroadcastsPage />
                      </ConnectChannelGate>
                    </RequirePermission>
                  }
                />
                <Route
                  path="analytics"
                  element={
                    <RequirePermission perm="analytics">
                      <ConnectChannelGate feature="Analytics">
                        <AnalyticsPage />
                      </ConnectChannelGate>
                    </RequirePermission>
                  }
                />

                {/* Onboarding inside dashboard shell — redirects for back-compat */}
                <Route
                  path="onboarding"
                  element={<Navigate to="/onboarding/instagram" replace />}
                />
                <Route
                  path="onboarding/instagram"
                  element={<Navigate to="/onboarding/instagram" replace />}
                />
              </Route>

              {/* Top-level full-screen onboarding (no sidebar) */}
              <Route
                element={
                  <ProtectedRoute>
                    <OnboardingLayout />
                  </ProtectedRoute>
                }
              >
                <Route
                  path="/onboarding"
                  element={<Navigate to="/onboarding/instagram" replace />}
                />
                <Route
                  path="/onboarding/choose-channel"
                  element={<ChooseChannelPage />}
                />
                <Route
                  path="/onboarding/pricing"
                  element={<OnboardingPricingPage />}
                />
                <Route
                  path="/onboarding/instagram"
                  element={<InstagramOnboardingPage />}
                />
              </Route>

              {/* 404 catch-all */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </ConfirmProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
