import { ArrowUpFromLine, Check } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Variant_pending_completed_rejected } from "../backend";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

function statusBadge(status: Variant_pending_completed_rejected) {
  const map = {
    [Variant_pending_completed_rejected.completed]: {
      label: "Completed",
      color: "#10b981",
      bg: "rgba(16,185,129,0.1)",
    },
    [Variant_pending_completed_rejected.rejected]: {
      label: "Rejected",
      color: "#ef4444",
      bg: "rgba(239,68,68,0.1)",
    },
    [Variant_pending_completed_rejected.pending]: {
      label: "Pending",
      color: "#f97316",
      bg: "rgba(249,115,22,0.1)",
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
    "mt-1.5 w-full px-4 py-3.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300";
  const inputStyle = {
    background: "#f1f5f9",
    border: "1px solid #e2e8f0",
    color: "#0f172a",
  };

  return (
    <div className="px-4 py-5 pb-8">
      <h1 className="text-2xl font-bold mb-5" style={{ color: "#0f172a" }}>
        Withdraw
      </h1>
      <div
        className="rounded-2xl p-5 mb-6"
        style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(249,115,22,0.1)" }}
          >
            <ArrowUpFromLine size={16} style={{ color: "#f97316" }} />
          </div>
          <h3 className="text-sm font-bold" style={{ color: "#0f172a" }}>
            Request Withdrawal
          </h3>
        </div>
        <p className="text-xs mb-4" style={{ color: "#475569" }}>
          Minimum withdrawal: ₹100. Funds sent to your UPI ID.
        </p>
        {success && (
          <div
            className="flex items-center gap-2 mb-4 p-3 rounded-xl"
            style={{
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.2)",
            }}
          >
            <Check size={15} style={{ color: "#10b981" }} />
            <p className="text-sm font-medium" style={{ color: "#10b981" }}>
              Withdrawal requested! Pending admin approval.
            </p>
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="withdraw-amount"
              className="text-sm font-medium"
              style={{ color: "#475569" }}
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
              className="text-sm font-medium"
              style={{ color: "#475569" }}
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
              style={{ color: "#ef4444" }}
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
              background: "linear-gradient(135deg, #f97316, #fb923c)",
              color: "#ffffff",
              touchAction: "manipulation",
              cursor: "pointer",
            }}
            data-ocid="withdraw.submit_button"
          >
            {submitting ? "Submitting..." : "Request Withdrawal"}
          </button>
        </div>
      </div>

      <h3 className="text-sm font-bold mb-3" style={{ color: "#0f172a" }}>
        Withdrawal History
      </h3>
      {isLoading ? (
        <div
          className="text-sm"
          style={{ color: "#475569" }}
          data-ocid="withdraw.loading_state"
        >
          Loading...
        </div>
      ) : withdrawals.length === 0 ? (
        <div
          className="text-center py-8 text-sm"
          style={{ color: "#94a3b8" }}
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
                className="rounded-xl p-3.5 flex items-center justify-between"
                style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
                data-ocid={`withdraw.item.${idx + 1}`}
              >
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "#0f172a" }}
                  >
                    ₹{Number(w.amount).toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs" style={{ color: "#475569" }}>
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
        style={{ color: "#94a3b8" }}
      >
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-500 transition-colors"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
