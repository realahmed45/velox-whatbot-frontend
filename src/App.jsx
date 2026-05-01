import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ConfirmProvider } from "@/components/ui/ConfirmDialog";
import ConnectInstagramGate from "@/components/ConnectInstagramGate";

// Layouts
import DashboardLayout from "@/layouts/DashboardLayout";
import AuthLayout from "@/layouts/AuthLayout";
import MarketingLayout from "@/layouts/MarketingLayout";

// Auth Pages
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";

// App Pages (lazy-loaded for smaller main bundle)
const OverviewPage = lazy(() => import("@/pages/dashboard/OverviewPage"));
const AutomationSetupPage = lazy(
  () => import("@/pages/automation/AutomationSetupPage"),
);
const AnalyticsPage = lazy(() => import("@/pages/analytics/AnalyticsPage"));
const InboxPage = lazy(() => import("@/pages/inbox/InboxPage"));
const ContactsPage = lazy(() => import("@/pages/contacts/ContactsPage"));
const BroadcastsPage = lazy(() => import("@/pages/broadcasts/BroadcastsPage"));
const ScheduledPostsPage = lazy(
  () => import("@/pages/content/ScheduledPostsPage"),
);
const DripCampaignsPage = lazy(() => import("@/pages/drip/DripCampaignsPage"));
const GiveawaysPage = lazy(() => import("@/pages/giveaways/GiveawaysPage"));
const CompetitorsPage = lazy(
  () => import("@/pages/competitors/CompetitorsPage"),
);
const IntegrationsPage = lazy(
  () => import("@/pages/integrations/IntegrationsPage"),
);
const AppsIntegrationsPage = lazy(
  () => import("@/pages/integrations/AppsIntegrationsPage"),
);
const ReferralPage = lazy(() => import("@/pages/referral/ReferralPage"));
const TeamPage = lazy(() => import("@/pages/team/TeamPage"));
const HashtagsPage = lazy(() => import("@/pages/hashtags/HashtagsPage"));
const LinkInBioPage = lazy(() => import("@/pages/link-in-bio/LinkInBioPage"));
import PublicBioPage from "@/pages/link-in-bio/PublicBioPage";
const AiBotPage = lazy(() => import("@/pages/ai-bot/AiBotPage"));
const PricingPage = lazy(() => import("@/pages/PricingPage"));
const GuidePage = lazy(() => import("@/pages/GuidePage"));
const SettingsPage = lazy(() => import("@/pages/settings/SettingsPage"));
const FlowBuilderPage = lazy(
  () => import("@/pages/flow-builder/FlowBuilderPage"),
);
const OnboardingPage = lazy(() => import("@/pages/onboarding/OnboardingPage"));
const ChooseChannelPage = lazy(() =>
  import("@/pages/onboarding/ChooseChannelPage"),
);
const WhatsAppOnboardingPage = lazy(() =>
  import("@/pages/onboarding/WhatsAppOnboardingPage"),
);
import VerifyEmailPage from "@/pages/auth/VerifyEmailPage";
const BillingPage = lazy(() => import("@/pages/billing/BillingPage"));

// Public
const LandingPage = lazy(() => import("@/pages/LandingPage"));
import PrivacyPage from "@/pages/PrivacyPage";
import TermsPage from "@/pages/TermsPage";

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

              {/* Guest Routes */}
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
                <Route
                  path="inbox"
                  element={
                    <ConnectInstagramGate>
                      <InboxPage />
                    </ConnectInstagramGate>
                  }
                />
                <Route path="contacts" element={<ContactsPage />} />
                <Route
                  path="broadcasts"
                  element={
                    <ConnectInstagramGate>
                      <BroadcastsPage />
                    </ConnectInstagramGate>
                  }
                />
                <Route
                  path="scheduled-posts"
                  element={
                    <ConnectInstagramGate>
                      <ScheduledPostsPage />
                    </ConnectInstagramGate>
                  }
                />
                <Route
                  path="drip-campaigns"
                  element={
                    <ConnectInstagramGate>
                      <DripCampaignsPage />
                    </ConnectInstagramGate>
                  }
                />
                <Route
                  path="giveaways"
                  element={
                    <ConnectInstagramGate>
                      <GiveawaysPage />
                    </ConnectInstagramGate>
                  }
                />
                <Route path="competitors" element={<CompetitorsPage />} />
                <Route path="integrations" element={<IntegrationsPage />} />
                <Route path="apps" element={<AppsIntegrationsPage />} />
                <Route path="referral" element={<ReferralPage />} />
                <Route path="team" element={<TeamPage />} />
                <Route path="hashtags" element={<HashtagsPage />} />
                <Route path="link-in-bio" element={<LinkInBioPage />} />
                <Route
                  path="analytics"
                  element={
                    <ConnectInstagramGate>
                      <AnalyticsPage />
                    </ConnectInstagramGate>
                  }
                />
                <Route path="ai-bot" element={<AiBotPage />} />
                <Route path="flow-builder" element={<FlowBuilderPage />} />
                <Route
                  path="flow-builder/:flowId"
                  element={<FlowBuilderPage />}
                />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="billing" element={<BillingPage />} />
                <Route path="pricing" element={<PricingPage embedded />} />
                <Route path="guide" element={<GuidePage />} />
              </Route>

              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute>
                    <ChooseChannelPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/onboarding/choose-channel"
                element={
                  <ProtectedRoute>
                    <ChooseChannelPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/onboarding/whatsapp"
                element={
                  <ProtectedRoute>
                    <WhatsAppOnboardingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/onboarding/instagram"
                element={
                  <ProtectedRoute>
                    <OnboardingPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/verify-email" element={<VerifyEmailPage />} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </ConfirmProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
