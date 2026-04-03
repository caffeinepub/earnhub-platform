import { useEffect, useState } from "react";
import type { DepositRequest, Plan, UserProfile } from "../backend";
import { Variant_pending_approved_rejected } from "../backend";
import PaymentModal from "../components/PaymentModal";
import { useActor } from "../hooks/useActor";

const PLAN_STYLES = [
  { bg: "#18A6A0", icon: "₹" },
  { bg: "#2C6FC4", icon: "📈" },
  { bg: "#F57C1F", icon: "⭐" },
];

const FALLBACK_PLANS: Plan[] = [
  {
    id: 1n,
    name: "Basic Plan",
    price: 500n,
    dailyEarning: 150n,
    validityDays: 60n,
  },
  {
    id: 2n,
    name: "Standard Plan",
    price: 1000n,
    dailyEarning: 300n,
    validityDays: 60n,
  },
  {
    id: 3n,
    name: "Premium Plan",
    price: 1750n,
    dailyEarning: 750n,
    validityDays: 120n,
  },
];

function depositStatusBadge(status: Variant_pending_approved_rejected) {
  if (status === Variant_pending_approved_rejected.approved)
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
        Approved
      </span>
    );
  if (status === Variant_pending_approved_rejected.rejected)
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
        Rejected
      </span>
    );
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
      Pending
    </span>
  );
}

export default function HomePage() {
  const { actor } = useActor();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [plans, setPlans] = useState<Plan[]>(FALLBACK_PLANS);
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const mobile = localStorage.getItem("earnhub_mobile") || "User";

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
            .then((fetchedPlans) => {
              if (fetchedPlans && fetchedPlans.length > 0) {
                setPlans(fetchedPlans);
              }
            })
            .catch(() => {}),
          actor
            .getCallerDepositRequests()
            .then((all) => {
              setDeposits(all);
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

  const recentDeposits = [...deposits].reverse().slice(0, 5);

  return (
    <div className="px-4 py-5 pb-8">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">My Wallet</h1>
        <p className="text-gray-600 text-sm mt-0.5">Hi, {mobile} 👋</p>
      </div>
      <div
        className="rounded-2xl p-5 mb-6 shadow-lg"
        style={{
          background: "linear-gradient(135deg, #2F73C8 0%, #1a52a0 100%)",
        }}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-white/70 text-sm">Total Balance</p>
            <p
              className="text-white text-4xl font-extrabold mt-1"
              data-ocid="wallet.balance"
            >
              ₹{balance.toLocaleString("en-IN")}
            </p>
          </div>
          <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full">
            Current Wallet
          </span>
        </div>
        {activePlanDetails && (
          <p className="text-white/80 text-xs">
            Active Plan: {activePlanDetails.name} • ₹
            {Number(activePlanDetails.dailyEarning)}/day
          </p>
        )}
      </div>

      {recentDeposits.length > 0 && (
        <div
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-5"
          data-ocid="deposits.panel"
        >
          <h3
            className="text-sm font-bold text-gray-900 mb-3"
            style={{ borderBottom: "2px solid #2F73C8", paddingBottom: 6 }}
          >
            Recent Deposits
          </h3>
          <div className="space-y-2" data-ocid="deposits.list">
            {recentDeposits.map((d, idx) => (
              <div
                key={`${d.utrNumber}-${d.submittedAt.toString()}`}
                className="flex items-center justify-between"
                data-ocid={`deposits.item.${idx + 1}`}
              >
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    ₹{Number(d.amount).toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-gray-400">UTR: {d.utrNumber}</p>
                </div>
                {depositStatusBadge(d.status)}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-5">
        <h2 className="text-lg font-bold text-gray-900 mb-3">
          Available Plans
        </h2>
        <div className="grid grid-cols-3 gap-2.5">
          {plans.map((plan, i) => {
            const style = PLAN_STYLES[i % PLAN_STYLES.length];
            return (
              <div
                key={plan.id.toString()}
                className="rounded-2xl p-3 flex flex-col shadow-md"
                style={{ background: style.bg }}
                data-ocid={`plans.item.${i + 1}`}
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mb-2">
                  <span className="text-white text-sm">{style.icon}</span>
                </div>
                <p className="text-white text-xs font-semibold leading-tight">
                  {plan.name}
                </p>
                <p className="text-white font-extrabold text-lg leading-tight mt-1">
                  ₹{Number(plan.price).toLocaleString("en-IN")}
                </p>
                <p className="text-white/80 text-xs mt-1">
                  ₹{Number(plan.dailyEarning)}/day
                </p>
                <p className="text-white/70 text-xs">
                  {Number(plan.validityDays)} days
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedPlan(plan)}
                  className="mt-2 w-full py-1.5 rounded-lg text-xs font-bold"
                  style={{ background: "#F2A11B", color: "#111827" }}
                  data-ocid={`plans.primary_button.${i + 1}`}
                >
                  Buy Now
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {activePlanDetails && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3
            className="text-sm font-bold text-gray-900 mb-2"
            style={{ borderBottom: "2px solid #F57C1F", paddingBottom: 6 }}
          >
            Active Subscription
          </h3>
          <div className="flex justify-between items-center text-sm">
            <div>
              <p className="font-semibold text-gray-800">
                {activePlanDetails.name}
              </p>
              <p className="text-gray-500 text-xs mt-0.5">
                ₹{Number(activePlanDetails.dailyEarning)} daily earning
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold" style={{ color: "#F57C1F" }}>
                {daysRemaining}
              </p>
              <p className="text-xs text-gray-500">days left</p>
            </div>
          </div>
        </div>
      )}

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

      {/* Footer */}
      <footer className="mt-12 text-center text-xs text-gray-400">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-600"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
