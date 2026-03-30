import { ArrowUpFromLine, Check } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Variant_pending_completed_rejected } from "../backend";
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

export default function WithdrawPage() {
  const { actor } = useActor();
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [withdrawals, setWithdrawals] = useState<
    Awaited<ReturnType<NonNullable<typeof actor>["getAllWithdrawalRequests"]>>
  >([]);
  const [loading, setLoading] = useState(true);

  const fetchWithdrawals = useCallback(() => {
    if (!actor) return;
    actor
      .getAllWithdrawalRequests()
      .then(setWithdrawals)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [actor]);

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

  return (
    <div className="px-4 py-5 pb-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-5">Withdraw</h1>
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <ArrowUpFromLine size={18} style={{ color: "#F57C1F" }} />
          <h3 className="text-sm font-bold text-gray-900">
            Request Withdrawal
          </h3>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Minimum withdrawal: ₹100. Funds sent to your UPI ID.
        </p>
        {success && (
          <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-green-50">
            <Check size={16} className="text-green-600" />
            <p className="text-green-700 text-sm font-medium">
              Withdrawal requested! Pending admin approval.
            </p>
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="withdraw-amount"
              className="text-sm font-medium text-gray-700"
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
              className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="withdraw-upi"
              className="text-sm font-medium text-gray-700"
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
              className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-3.5 rounded-xl text-white font-semibold disabled:opacity-60"
            style={{ background: "#0F3B66" }}
          >
            {submitting ? "Submitting..." : "Request Withdrawal"}
          </button>
        </div>
      </div>
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
  );
}
