import { ArrowUpFromLine, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  type Plan,
  type UserProfile,
  Variant_pending_completed_rejected,
} from "../backend";
import { useActor } from "../hooks/useActor";

function statusBadge(status: Variant_pending_completed_rejected) {
  if (status === Variant_pending_completed_rejected.completed)
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
        Completed
      </span>
    );
  if (status === Variant_pending_completed_rejected.rejected)
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

export default function WalletPage() {
  const { actor } = useActor();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [withdrawals, setWithdrawals] = useState<
    Awaited<ReturnType<NonNullable<typeof actor>["getAllWithdrawalRequests"]>>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!actor) return;
    setLoading(true);
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
        .then(setPlans)
        .catch(() => {}),
      actor
        .getAllWithdrawalRequests()
        .then(setWithdrawals)
        .catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [actor]);

  const balance = profile ? Number(profile.walletBalance) : 0;
  const activePlan =
    profile?.activePlan && plans.length > 0
      ? plans.find((p) => p.id === profile.activePlan!.planId)
      : null;
  const daysActive = profile?.activePlan
    ? Math.floor(
        (Date.now() * 1e6 - Number(profile.activePlan.activatedAt)) /
          (86400 * 1e15),
      )
    : 0;

  return (
    <div className="px-4 py-5 pb-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-5">Wallet</h1>
      <div
        className="rounded-2xl p-5 mb-5 shadow-lg"
        style={{
          background: "linear-gradient(135deg, #2F73C8 0%, #1a52a0 100%)",
        }}
      >
        <p className="text-white/70 text-sm">Available Balance</p>
        <p className="text-white text-4xl font-extrabold mt-1">
          ₹{loading ? "—" : balance.toLocaleString("en-IN")}
        </p>
        {activePlan && (
          <p className="text-white/70 text-xs mt-2">
            Earning ₹{Number(activePlan.dailyEarning)}/day • {daysActive} days
            active
          </p>
        )}
      </div>
      {activePlan && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={18} style={{ color: "#18A6A0" }} />
            <h3 className="text-sm font-bold text-gray-900">
              Earnings Breakdown
            </h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Plan</span>
              <span className="font-semibold text-gray-800">
                {activePlan.name}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Daily Rate</span>
              <span className="font-semibold text-gray-800">
                ₹{Number(activePlan.dailyEarning)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Days Active</span>
              <span className="font-semibold text-gray-800">{daysActive}</span>
            </div>
            <div className="flex justify-between text-sm border-t pt-2 mt-1">
              <span className="text-gray-700 font-medium">
                Estimated Earnings
              </span>
              <span className="font-bold" style={{ color: "#18A6A0" }}>
                ₹{daysActive * Number(activePlan.dailyEarning)}
              </span>
            </div>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => navigate("/withdraw")}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-semibold mb-5"
        style={{ background: "#0F3B66" }}
      >
        <ArrowUpFromLine size={18} />
        Request Withdrawal
      </button>
      <div>
        <h3 className="text-sm font-bold text-gray-900 mb-3">
          Withdrawal History
        </h3>
        {loading ? (
          <div className="text-gray-400 text-sm">Loading...</div>
        ) : withdrawals.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            No withdrawals yet
          </div>
        ) : (
          <div className="space-y-3">
            {[...withdrawals]
              .reverse()
              .slice(0, 10)
              .map((w) => (
                <div
                  key={`${w.upiId}-${w.requestedAt.toString()}`}
                  className="bg-white rounded-xl p-3 shadow-sm flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      ₹{Number(w.amount).toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-gray-500">{w.upiId}</p>
                  </div>
                  {statusBadge(w.status)}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
