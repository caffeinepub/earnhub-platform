import { ArrowUpFromLine, TrendingUp, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import {
  type Plan,
  type UserProfile,
  Variant_pending_completed_rejected,
  type WithdrawalRequest,
} from "../backend";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useNavigate } from "../hooks/useRouter";

function statusBadge(status: Variant_pending_completed_rejected) {
  const map = {
    [Variant_pending_completed_rejected.completed]: {
      label: "Completed",
      color: "#00C9A7",
      bg: "rgba(0,201,167,0.15)",
    },
    [Variant_pending_completed_rejected.rejected]: {
      label: "Rejected",
      color: "#FF5555",
      bg: "rgba(255,85,85,0.15)",
    },
    [Variant_pending_completed_rejected.pending]: {
      label: "Pending",
      color: "#FF9500",
      bg: "rgba(255,149,0,0.15)",
    },
  };
  const s = map[status] ?? map[Variant_pending_completed_rejected.pending];
  return (
    <span
      className="px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ color: s.color, background: s.bg }}
    >
      {s.label}
    </span>
  );
}

export default function WalletPage() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!actor) {
      setLoading(false);
      return;
    }
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
        .then((all) => {
          const callerPrincipal = identity?.getPrincipal().toString();
          setWithdrawals(
            callerPrincipal
              ? all.filter((w) => w.user.toString() === callerPrincipal)
              : all,
          );
        })
        .catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [actor, identity]);

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
  const estimatedEarnings = activePlan
    ? daysActive * Number(activePlan.dailyEarning)
    : 0;

  return (
    <div className="px-4 py-5 pb-8">
      <h1 className="text-2xl font-bold text-foreground mb-5">Wallet</h1>

      {/* Balance Card */}
      <div
        className="rounded-2xl p-5 mb-5 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.28 0.10 250), oklch(0.20 0.06 260))",
        }}
      >
        <div
          className="absolute -right-4 -top-4 w-20 h-20 rounded-full"
          style={{ background: "rgba(255,107,0,0.1)" }}
        />
        <div className="flex items-center gap-2 mb-2">
          <Wallet size={14} className="text-white/75" />
          <p className="text-white/75 text-xs">Available Balance</p>
        </div>
        <p
          className="text-white text-4xl font-bold tracking-tight mb-1"
          data-ocid="wallet.balance"
        >
          ₹{balance.toLocaleString("en-IN")}
        </p>
        {activePlan && (
          <p className="text-white/80 text-xs">
            Earning ₹{Number(activePlan.dailyEarning)}/day · {daysActive} days
            active
          </p>
        )}
      </div>

      {/* Earnings Breakdown */}
      {activePlan && (
        <div
          className="rounded-2xl p-4 mb-5 border border-white/8"
          style={{ background: "oklch(0.17 0.016 260)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={15} style={{ color: "#00C9A7" }} />
            <h3 className="text-sm font-bold text-foreground">
              Earnings Breakdown
            </h3>
          </div>
          <div className="space-y-2">
            {[
              { label: "Plan", value: activePlan.name },
              {
                label: "Daily Rate",
                value: `₹${Number(activePlan.dailyEarning)}`,
              },
              { label: "Days Active", value: daysActive.toString() },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span style={{ color: "#e5e7eb" }}>{label}</span>
                <span className="font-semibold text-foreground">{value}</span>
              </div>
            ))}
            <div
              className="flex justify-between text-sm pt-2"
              style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
            >
              <span className="text-foreground font-medium">
                Estimated Earnings
              </span>
              <span className="font-bold" style={{ color: "#00C9A7" }}>
                ₹{estimatedEarnings.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw CTA */}
      <button
        type="button"
        onClick={() => navigate("/withdraw")}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm mb-5 transition-all active:scale-98"
        style={{
          background: "linear-gradient(135deg, #FF6B00, #FF9500)",
          color: "#0D1117",
        }}
        data-ocid="wallet.primary_button"
      >
        <ArrowUpFromLine size={17} />
        Request Withdrawal
      </button>

      {/* Withdrawal History */}
      <h3 className="text-sm font-bold text-foreground mb-3">
        Withdrawal History
      </h3>
      {loading ? (
        <div
          className="text-sm"
          style={{ color: "#e5e7eb" }}
          data-ocid="wallet.loading_state"
        >
          Loading...
        </div>
      ) : withdrawals.length === 0 ? (
        <div
          className="text-center py-8 text-sm"
          style={{ color: "#e5e7eb" }}
          data-ocid="wallet.empty_state"
        >
          <div className="text-3xl mb-2">💸</div>
          No withdrawals yet
        </div>
      ) : (
        <div className="space-y-2.5">
          {[...withdrawals]
            .reverse()
            .slice(0, 10)
            .map((w, idx) => (
              <div
                key={`${w.upiId}-${w.requestedAt.toString()}`}
                className="rounded-xl p-3.5 flex items-center justify-between border border-white/6"
                style={{ background: "oklch(0.17 0.016 260)" }}
                data-ocid={`wallet.item.${idx + 1}`}
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    ₹{Number(w.amount).toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs" style={{ color: "#e5e7eb" }}>
                    {w.upiId}
                  </p>
                </div>
                {statusBadge(w.status)}
              </div>
            ))}
        </div>
      )}

      <footer
        className="mt-10 text-center text-xs"
        style={{ color: "rgba(255,255,255,0.45)" }}
      >
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-white/70 transition-colors"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
