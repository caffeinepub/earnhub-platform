import { ArrowUpFromLine, Check } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Variant_pending_completed_rejected } from "../backend";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

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

export default function WithdrawPage() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [withdrawals, setWithdrawals] = useState<
    Awaited<ReturnType<NonNullable<typeof actor>["getAllWithdrawalRequests"]>>
  >([] as any);
  const [dataLoading, setDataLoading] = useState(false);

  const fetchWithdrawals = useCallback(() => {
    if (!actor) {
      setDataLoading(false);
      return;
    }
    setDataLoading(true);
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
      .catch(() => {})
      .finally(() => setDataLoading(false));
  }, [actor, identity]);

  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  const handleSubmit = async () => {
    const amt = Number.parseInt(amount);
    if (!amount || Number.isNaN(amt) || amt < 100) {
      setError("Minimum withdrawal is ₹100");
      return;
    }
    if (!upiId.trim() || !upiId.includes("@")) {
      setError("Enter a valid UPI ID (e.g. name@upi)");
      return;
    }
    if (!actor) return;
    setSubmitting(true);
    setError("");
    try {
      await actor.requestWithdrawal(BigInt(amt), upiId.trim());
      setAmount("");
      setUpiId("");
      setSuccess(true);
      fetchWithdrawals();
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = isFetching || dataLoading;

  const inputClass =
    "mt-1.5 w-full px-4 py-3.5 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder-muted-foreground/50";
  const inputStyle = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
  };

  return (
    <div className="px-4 py-5 pb-8">
      <h1 className="text-2xl font-bold text-foreground mb-5">Withdraw</h1>
      <div
        className="rounded-2xl p-5 mb-6 border border-white/8"
        style={{ background: "oklch(0.17 0.016 260)" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(255,107,0,0.15)" }}
          >
            <ArrowUpFromLine size={16} style={{ color: "#FF6B00" }} />
          </div>
          <h3 className="text-sm font-bold text-foreground">
            Request Withdrawal
          </h3>
        </div>
        <p className="text-xs mb-4" style={{ color: "#e5e7eb" }}>
          Minimum withdrawal: ₹100. Funds sent to your UPI ID.
        </p>
        {success && (
          <div
            className="flex items-center gap-2 mb-4 p-3 rounded-xl"
            style={{
              background: "rgba(0,201,167,0.1)",
              border: "1px solid rgba(0,201,167,0.25)",
            }}
          >
            <Check size={15} style={{ color: "#00C9A7" }} />
            <p className="text-sm font-medium" style={{ color: "#00C9A7" }}>
              Withdrawal requested! Pending admin approval.
            </p>
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="withdraw-amount"
              className="text-sm font-medium text-foreground/80"
            >
              Amount (₹)
            </label>
            <input
              id="withdraw-amount"
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError("");
              }}
              placeholder="Minimum ₹100"
              className={inputClass}
              style={inputStyle}
              data-ocid="withdraw.input"
            />
          </div>
          <div>
            <label
              htmlFor="withdraw-upi"
              className="text-sm font-medium text-foreground/80"
            >
              UPI ID
            </label>
            <input
              id="withdraw-upi"
              type="text"
              value={upiId}
              onChange={(e) => {
                setUpiId(e.target.value);
                setError("");
              }}
              placeholder="yourname@upi"
              className={inputClass}
              style={inputStyle}
              data-ocid="withdraw.textarea"
            />
          </div>
          {error && (
            <p
              className="text-sm"
              style={{ color: "#FF5555" }}
              data-ocid="withdraw.error_state"
            >
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-3.5 rounded-xl font-semibold text-sm disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #FF6B00, #FF9500)",
              color: "#0D1117",
            }}
            data-ocid="withdraw.submit_button"
          >
            {submitting ? "Submitting..." : "Request Withdrawal"}
          </button>
        </div>
      </div>

      <h3 className="text-sm font-bold text-foreground mb-3">
        Withdrawal History
      </h3>
      {isLoading ? (
        <div
          className="text-sm"
          style={{ color: "#e5e7eb" }}
          data-ocid="withdraw.loading_state"
        >
          Loading...
        </div>
      ) : withdrawals.length === 0 ? (
        <div
          className="text-center py-8 text-sm"
          style={{ color: "#e5e7eb" }}
          data-ocid="withdraw.empty_state"
        >
          <div className="text-3xl mb-2">💸</div>
          No withdrawals yet
        </div>
      ) : (
        <div className="space-y-2.5" data-ocid="withdraw.list">
          {[...withdrawals]
            .reverse()
            .slice(0, 10)
            .map((w, idx) => (
              <div
                key={`${w.upiId}-${w.requestedAt.toString()}`}
                className="rounded-xl p-3.5 flex items-center justify-between border border-white/6"
                style={{ background: "oklch(0.17 0.016 260)" }}
                data-ocid={`withdraw.item.${idx + 1}`}
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
