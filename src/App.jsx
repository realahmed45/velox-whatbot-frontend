import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense } from "react";
import lazyWithRetry from "@/utils/lazyWithRetry";
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
const VerifyEmailPage = lazyWithRetry(() => import("@/pages/auth/VerifyEmailPage"));
const InvitePage = lazyWithRetry(() => import("@/pages/auth/InvitePage"));
const AccountPickerPage = lazyWithRetry(
  () => import("@/pages/auth/AccountPickerPage"),
);

// App Pages (lazy-loaded)
const OverviewPage = lazyWithRetry(() => import("@/pages/dashboard/OverviewPage"));
const AutomationSetupPage = lazyWithRetry(
  () => import("@/pages/automation/AutomationSetupPage"),
);
const AnalyticsPage = lazyWithRetry(() => import("@/pages/analytics/AnalyticsPage"));
const InboxPage = lazyWithRetry(() => import("@/pages/inbox/InboxPage"));
const ContactsPage = lazyWithRetry(() => import("@/pages/contacts/ContactsPage"));
const BroadcastsPage = lazyWithRetry(() => import("@/pages/broadcasts/BroadcastsPage"));
const AiBotPage = lazyWithRetry(() => import("@/pages/ai-bot/AiBotPage"));
const PricingPage = lazyWithRetry(() => import("@/pages/PricingPage"));
const GuidePage = lazyWithRetry(() => import("@/pages/GuidePage"));
const DocsPage = lazyWithRetry(() => import("@/pages/docs/DocsPage"));
const SettingsPage = lazyWithRetry(() => import("@/pages/settings/SettingsPage"));
const FlowBuilderPage = lazyWithRetry(
  () => import("@/pages/flow-builder/FlowBuilderPage"),
);
const CustomFlowsPage = lazyWithRetry(
  () => import("@/pages/flow-builder/CustomFlowsPage"),
);
const BillingPage = lazyWithRetry(() => import("@/pages/billing/BillingPage"));

// Growth tools (lazy-loaded)
const ScheduledPostsPage = lazyWithRetry(
  () => import("@/pages/content/ScheduledPostsPage"),
);
const DripCampaignsPage = lazyWithRetry(() => import("@/pages/drip/DripCampaignsPage"));
const HashtagsPage = lazyWithRetry(() => import("@/pages/hashtags/HashtagsPage"));
const IntegrationsPage = lazyWithRetry(
  () => import("@/pages/integrations/IntegrationsPage"),
);
const AppsIntegrationsPage = lazyWithRetry(
  () => import("@/pages/integrations/AppsIntegrationsPage"),
);
const TeamPage = lazyWithRetry(() => import("@/pages/team/TeamPage"));
const AppointmentsPage = lazyWithRetry(
  () => import("@/pages/appointments/AppointmentsPage"),
);

// Hotel product (lazy-loaded)
const TodayPage = lazyWithRetry(() => import("@/pages/hotel/TodayPage"));
const CalendarPage = lazyWithRetry(() => import("@/pages/hotel/CalendarPage"));
const GuestsPage = lazyWithRetry(() => import("@/pages/hotel/GuestsPage"));
const BookingsPage = lazyWithRetry(() => import("@/pages/hotel/BookingsPage"));
const PropertyPage = lazyWithRetry(() => import("@/pages/hotel/PropertyPage"));
const TransfersPage = lazyWithRetry(() => import("@/pages/hotel/TransfersPage"));
const ChannelsPage = lazyWithRetry(() => import("@/pages/hotel/ChannelsPage"));

// Consultant program
const ConsultantsLandingPage = lazyWithRetry(
  () => import("@/pages/consultants/ConsultantsLandingPage"),
);
const ConsultantDashboardPage = lazyWithRetry(
  () => import("@/pages/consultants/ConsultantDashboardPage"),
);

// Onboarding
const ChooseChannelPage = lazyWithRetry(
  () => import("@/pages/onboarding/ChooseChannelPage"),
);
const OnboardingPricingPage = lazyWithRetry(
  () => import("@/pages/onboarding/OnboardingPricingPage"),
);
const InstagramOnboardingPage = lazyWithRetry(
  () => import("@/pages/onboarding/InstagramOnboardingPage"),
);
const BusinessTypePage = lazyWithRetry(
  () => import("@/pages/onboarding/BusinessTypePage"),
);
const HotelSetupPage = lazyWithRetry(
  () => import("@/pages/onboarding/HotelSetupPage"),
);
const ReactivatePage = lazyWithRetry(() => import("@/pages/onboarding/ReactivatePage"));

// Public
const LandingPage = lazyWithRetry(() => import("@/pages/LandingPage"));
const AdminPage = lazyWithRetry(() => import("@/pages/admin/AdminPage"));
const PrivacyPage = lazyWithRetry(() => import("@/pages/PrivacyPage"));
const TermsPage = lazyWithRetry(() => import("@/pages/TermsPage"));
const ContactPage = lazyWithRetry(() => import("@/pages/ContactPage"));
const HelpPage = lazyWithRetry(() => import("@/pages/HelpPage"));
const FeaturesPage = lazyWithRetry(() => import("@/pages/FeaturesPage"));
const NotFoundPage = lazyWithRetry(() => import("@/pages/NotFoundPage"));

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
              {/* Admin panel — self-contained auth, no user session */}
              <Route path="/admin" element={<AdminPage />} />
              {/* Team-invite landing (self-redirects to login if needed) */}
              <Route path="/invite" element={<InvitePage />} />
              <Route element={<MarketingLayout />}>
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/consultants" element={<ConsultantsLandingPage />} />
                <Route path="/guide" element={<GuidePage />} />
                <Route path="/docs" element={<DocsPage />} />
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
                  element={<ForgotPasswordPage />}
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
                {/* Today — the home screen (agent chat + pricing + glance) */}
                <Route index element={<TodayPage />} />
                {/* The old Instagram-era overview stays reachable by URL. */}
                <Route path="overview" element={<OverviewPage />} />

                {/* Hotel product */}
                <Route path="bookings" element={<BookingsPage />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="guests" element={<GuestsPage />} />
                <Route path="property" element={<PropertyPage />} />
                <Route path="transfers" element={<TransfersPage />} />
                <Route path="channels" element={<ChannelsPage />} />

                {/* Consultant program */}
                <Route path="consultant" element={<ConsultantDashboardPage />} />
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
                <Route
                  path="appointments"
                  element={
                    <RequirePermission perm="automations">
                      <AppointmentsPage />
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

              {/* Account picker — post-login "choose an account" screen. Logged
                  in but NOT behind the onboarding gate (it's the chooser). */}
              <Route
                path="/accounts"
                element={
                  <ProtectedRoute>
                    <AccountPickerPage />
                  </ProtectedRoute>
                }
              />

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
                  element={<Navigate to="/onboarding/hotel" replace />}
                />
                {/* Name your hotel — the only mandatory step. */}
                <Route path="/onboarding/hotel" element={<HotelSetupPage />} />
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
                <Route
                  path="/onboarding/business-type"
                  element={<BusinessTypePage />}
                />
                <Route
                  path="/onboarding/reactivate"
                  element={<ReactivatePage />}
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
