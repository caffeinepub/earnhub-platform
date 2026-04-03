import { useEffect, useState } from "react";
import type { Plan, UserProfile } from "../backend";
import PaymentModal from "../components/PaymentModal";
import { useActor } from "../hooks/useActor";

const PLAN_GRADIENTS = [
  { from: "#1E3A5F", to: "#2C5AA0", accent: "#00C9A7", badge: "STARTER" },
  { from: "#1A3A2A", to: "#1E6B42", accent: "#4ADE80", badge: "POPULAR" },
  { from: "#3B1F00", to: "#7A3D00", accent: "#FF6B00", badge: "PREMIUM" },
];

const FALLBACK_PLANS: Plan[] = [
  { id: 1n, name: "Basic", price: 500n, dailyEarning: 150n, validityDays: 60n },
  {
    id: 2n,
    name: "Standard",
    price: 1000n,
    dailyEarning: 300n,
    validityDays: 60n,
  },
  {
    id: 3n,
    name: "Premium",
    price: 1750n,
    dailyEarning: 750n,
    validityDays: 120n,
  },
];

export default function HomePage() {
  const { actor } = useActor();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [plans, setPlans] = useState<Plan[]>(FALLBACK_PLANS);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const mobile = localStorage.getItem("earnhub_mobile") || "Member";

  useEffect(() => {
    if (!actor) return;
    actor
      .ensureDefaultPlans()
      .catch(() => {})
      .finally(() => {
        Promise.all([
          actor
            .getCallerProfileWithEarnings()
            .then((u) =>
              setProfile({
                mobile: u.mobile,
                joinDate: u.joinDate,
                walletBalance: u.walletBalance,
                activePlan: u.activePlan,
              }),
            )
            .catch(() => {}),
          actor
            .getAllPlans()
            .then((fetched) => {
              if (fetched?.length > 0) setPlans(fetched);
            })
            .catch(() => {}),
        ]);
      });
  }, [actor]);

  const balance = profile ? Number(profile.walletBalance) : 0;
  const activePlanDetails =
    profile?.activePlan && plans.length > 0
      ? plans.find((p) => p.id === profile.activePlan!.planId)
      : null;
  const daysRemaining = activePlanDetails
    ? Math.max(
        0,
        Number(activePlanDetails.validityDays) -
          Math.floor(
            (Date.now() * 1e6 - Number(profile!.activePlan!.activatedAt)) /
              (86400 * 1e15),
          ),
      )
    : 0;
  const progressPct = activePlanDetails
    ? Math.min(
        100,
        Math.round(
          ((Number(activePlanDetails.validityDays) - daysRemaining) /
            Number(activePlanDetails.validityDays)) *
            100,
        ),
      )
    : 0;

  return (
    <div className="px-4 py-5 pb-8">
      {/* Greeting + Balance Card */}
      <div className="mb-5">
        <p className="text-xs text-muted-foreground mb-0.5">Welcome back,</p>
        <h1 className="text-lg font-bold text-foreground mb-4">{mobile} 👋</h1>
        <div
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.28 0.10 250), oklch(0.20 0.06 260))",
          }}
        >
          {/* decorative circles */}
          <div
            className="absolute -right-6 -top-6 w-24 h-24 rounded-full"
            style={{ background: "rgba(255,107,0,0.12)" }}
          />
          <div
            className="absolute -right-2 -bottom-4 w-16 h-16 rounded-full"
            style={{ background: "rgba(0,201,167,0.1)" }}
          />
          <p className="text-white/60 text-xs mb-1">Total Balance</p>
          <p
            className="text-white text-4xl font-bold tracking-tight"
            data-ocid="wallet.balance"
          >
            ₹{balance.toLocaleString("en-IN")}
          </p>
          {activePlanDetails && (
            <div className="mt-3 flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: "#00C9A7" }}
              />
              <p className="text-white/70 text-xs">
                {activePlanDetails.name} · ₹
                {Number(activePlanDetails.dailyEarning)}/day
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Active Plan Progress */}
      {activePlanDetails && (
        <div
          className="rounded-2xl p-4 mb-5 border border-white/8"
          style={{ background: "oklch(0.17 0.016 260)" }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-foreground/80">
              Active Plan: {activePlanDetails.name}
            </span>
            <span className="text-xs font-bold" style={{ color: "#FF6B00" }}>
              {daysRemaining} days left
            </span>
          </div>
          <div
            className="w-full h-2 rounded-full"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: `${progressPct}%`,
                background: "linear-gradient(90deg, #FF6B00, #00C9A7)",
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            ₹{Number(activePlanDetails.dailyEarning)}/day · {progressPct}%
            complete
          </p>
        </div>
      )}

      {/* Available Plans */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-foreground">
            Available Plans
          </h2>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: "rgba(255,107,0,0.15)", color: "#FF6B00" }}
          >
            Instant Returns
          </span>
        </div>
        <div className="space-y-3">
          {plans.map((plan, i) => {
            const g = PLAN_GRADIENTS[i % PLAN_GRADIENTS.length];
            const totalReturn =
              Number(plan.dailyEarning) * Number(plan.validityDays);
            return (
              <div
                key={plan.id.toString()}
                className="rounded-2xl p-4 relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${g.from}, ${g.to})`,
                  border: `1px solid ${g.accent}25`,
                }}
                data-ocid={`plans.item.${i + 1}`}
              >
                <div
                  className="absolute top-0 right-0 px-2.5 py-1 rounded-bl-xl text-xs font-bold"
                  style={{ background: `${g.accent}25`, color: g.accent }}
                >
                  {g.badge}
                </div>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-base mb-0.5">
                      {plan.name} Plan
                    </h3>
                    <p className="text-white/60 text-xs">
                      {Number(plan.validityDays)} days validity
                    </p>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-white text-2xl font-bold">
                        ₹{Number(plan.price).toLocaleString("en-IN")}
                      </span>
                      <span className="text-white/50 text-xs">investment</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs mb-0.5" style={{ color: g.accent }}>
                      Daily Earn
                    </p>
                    <p
                      className="text-xl font-bold"
                      style={{ color: g.accent }}
                    >
                      ₹{Number(plan.dailyEarning)}
                    </p>
                    <p className="text-white/40 text-xs mt-1">
                      Total: ₹{totalReturn.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPlan(plan)}
                  className="mt-3 w-full py-2.5 rounded-xl text-sm font-bold transition-all active:scale-98"
                  style={{ background: g.accent, color: "#0D1117" }}
                  data-ocid={`plans.primary_button.${i + 1}`}
                >
                  Buy Now — ₹{Number(plan.price).toLocaleString("en-IN")}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Modal */}
      {selectedPlan && (
        <PaymentModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onSuccess={() => {
            setSelectedPlan(null);
            if (actor) {
              actor
                .getCallerProfileWithEarnings()
                .then((u) =>
                  setProfile({
                    mobile: u.mobile,
                    joinDate: u.joinDate,
                    walletBalance: u.walletBalance,
                    activePlan: u.activePlan,
                  }),
                )
                .catch(() => {});
            }
          }}
        />
      )}

      <footer className="mt-10 text-center text-xs text-muted-foreground/50">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-muted-foreground transition-colors"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
