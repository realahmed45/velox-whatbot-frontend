/**
 * ManyChat-style setup hub — universal for every business.
 * Shows clear steps: channel → train bot → optional store → go live.
 */
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Instagram,
  Sparkles,
  ShoppingBag,
  MessageCircle,
  Check,
  ArrowRight,
  Globe,
  Bot,
} from "lucide-react";
import { useWorkspaceStore } from "@/store/workspaceStore";
import ShopifyConnect from "@/components/integrations/ShopifyConnect";

export default function SetupHub({ onConnectInstagram }) {
  const { workspace } = useWorkspaceStore();
  const navigate = useNavigate();

  const igConnected = workspace?.instagram?.status === "connected";
  const shopifyConnected = !!workspace?.integrations?.shopify?.storeUrl;
  const shopifyOrders = !!workspace?.integrations?.shopify?.scopes?.orders;
  const hasKnowledge =
    !!(workspace?.aiKnowledge?.content?.trim()) ||
    (workspace?.aiKnowledge?.sources?.length || 0) > 0 ||
    !!(workspace?.aiSettings?.businessContext?.trim());
  const welcomeSet = !!workspace?.activation?.welcomeSet;

  const steps = useMemo(
    () => [
      {
        id: "instagram",
        label: "Connect Instagram",
        desc: "Link the Instagram account you want to automate.",
        done: igConnected,
        icon: Instagram,
        action: onConnectInstagram,
        actionLabel: "Connect Instagram",
      },
      {
        id: "profile",
        label: "Add your business profile",
        desc: "Share your website so replies match your brand and services.",
        done: hasKnowledge,
        icon: Globe,
        action: () => navigate("/dashboard/ai-bot"),
        actionLabel: "Set up profile",
      },
      {
        id: "shopify",
        label: "Connect your store",
        desc: "Optional — for brands selling through Shopify.",
        done: shopifyConnected,
        optional: true,
        icon: ShoppingBag,
        embedShopify: true,
      },
      {
        id: "welcome",
        label: "Set a welcome message",
        desc: "Send an instant reply when someone messages you for the first time.",
        done: welcomeSet,
        icon: MessageCircle,
        action: () => navigate("/dashboard/automation?tab=welcome"),
        actionLabel: "Configure welcome",
      },
      {
        id: "test",
        label: "Preview your automation",
        desc: "See how your brand responds before going live.",
        done: !!workspace?.activation?.testSent,
        icon: Bot,
        action: () => navigate("/dashboard/ai-bot?test=1"),
        actionLabel: "Open preview",
      },
    ],
    [
      igConnected,
      hasKnowledge,
      shopifyConnected,
      welcomeSet,
      workspace,
      navigate,
      onConnectInstagram,
    ],
  );

  const requiredDone = steps.filter((s) => !s.optional && s.done).length;
  const requiredTotal = steps.filter((s) => !s.optional).length;
  const pct = Math.round((requiredDone / requiredTotal) * 100);
  const allRequiredDone = requiredDone === requiredTotal;

  if (allRequiredDone && shopifyConnected) return null;

  return (
    <div className="border border-violet-200/70 bg-gradient-to-br from-violet-50/80 via-white to-emerald-50/50 shadow-sm">
      <div className="p-5 sm:p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-violet-600">
              Setup
            </p>
            <h2 className="text-lg font-black text-ink-950 mt-0.5">
              Get started
            </h2>
            <p className="text-xs text-ink-500 mt-1">
              Complete these steps to launch your Instagram automation.
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-black text-violet-600">{pct}%</p>
            <p className="text-[10px] text-ink-400">required steps</p>
          </div>
        </div>

        <div className="h-1.5 bg-ink-100 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        <ul className="space-y-3">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <li
                key={step.id}
                className={`border p-4 ${
                  step.done
                    ? "bg-emerald-50/40 border-emerald-100"
                    : "bg-white border-ink-100"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`shrink-0 w-8 h-8 flex items-center justify-center ${
                      step.done
                        ? "bg-emerald-500 text-white"
                        : "bg-ink-100 text-ink-500"
                    }`}
                  >
                    {step.done ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p
                        className={`text-sm font-bold ${
                          step.done ? "text-emerald-800" : "text-ink-900"
                        }`}
                      >
                        {idx + 1}. {step.label}
                      </p>
                      {step.optional && (
                        <span className="text-[10px] font-bold text-ink-400 uppercase">
                          Optional
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ink-500 mt-0.5">{step.desc}</p>

                    {!step.done && step.embedShopify && (
                      <div className="mt-3">
                        <ShopifyConnect compact />
                      </div>
                    )}

                    {!step.done && step.action && !step.embedShopify && (
                      <button
                        type="button"
                        onClick={step.action}
                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-violet-700 hover:text-violet-900"
                      >
                        {step.actionLabel}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {step.id === "shopify" && step.done && (
                      <div className="mt-2">
                        <ShopifyConnect
                          compact
                          connected
                          storeUrl={workspace?.integrations?.shopify?.storeUrl}
                          orderTracking={shopifyOrders}
                          showManageLink={false}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {allRequiredDone && (
          <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-2">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>
              You&apos;re ready to go live. Open{" "}
              <button
                type="button"
                onClick={() => navigate("/dashboard/automation")}
                className="font-bold underline"
              >
                Automations
              </button>{" "}
              to fine-tune your customer experience.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
