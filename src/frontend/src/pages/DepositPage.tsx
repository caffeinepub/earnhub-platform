import { ArrowDownToLine, Check } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Variant_pending_approved_rejected } from "../backend";
import { useActor } from "../hooks/useActor";

function statusBadge(status: Variant_pending_approved_rejected) {
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

export default function DepositPage() {
  const { actor } = useActor();
  const [amount, setAmount] = useState("");
  const [utr, setUtr] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [deposits, setDeposits] = useState<
    Awaited<ReturnType<NonNullable<typeof actor>["getCallerDepositRequests"]>>
  >([]);
  const [loading, setLoading] = useState(false);

  const fetchDeposits = useCallback(() => {
    if (!actor) {
      setLoading(false);
      return;
    }
    setLoading(true);
    actor
      .getCallerDepositRequests()
      .then(setDeposits)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [actor]);

  useEffect(() => {
    fetchDeposits();
  }, [fetchDeposits]);

  const handleSubmit = async () => {
    const amt = Number.parseInt(amount);
    if (!amount || Number.isNaN(amt) || amt < 100) {
      setError("Minimum deposit is ₹100");
      return;
    }
    if (!utr.trim() || utr.length < 6) {
      setError("Enter a valid UTR / Transaction ID");
      return;
    }
    if (!actor) return;
    setSubmitting(true);
    setError("");
    try {
      await actor.requestDeposit(BigInt(amt), utr.trim());
      setAmount("");
      setUtr("");
      setSuccess(true);
      fetchDeposits();
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-4 py-5 pb-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-5">Deposit</h1>

      {/* QR Code Section */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
        <p className="text-sm font-bold text-gray-900 text-center mb-3">
          Scan to Pay via UPI
        </p>
        <div className="flex justify-center">
          <img
            src="/assets/20260330_191337-019d3f3a-f423-76ed-bb39-fa2c1d041ae5.jpg"
            alt="UPI Payment QR Code"
            className="w-64 h-64 object-contain rounded-xl border border-gray-200"
          />
        </div>
        <p className="text-xs text-gray-500 text-center mt-3">
          Scan this QR code using GPay, PhonePe, or Paytm to make your payment
        </p>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <ArrowDownToLine size={18} style={{ color: "#18A6A0" }} />
          <h3 className="text-sm font-bold text-gray-900">Confirm Deposit</h3>
        </div>
        {success && (
          <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-green-50">
            <Check size={16} className="text-green-600" />
            <p className="text-green-700 text-sm font-medium">
              Deposit submitted! Pending admin approval.
            </p>
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="deposit-amount"
              className="text-sm font-medium text-gray-700"
            >
              Amount (₹)
            </label>
            <input
              id="deposit-amount"
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError("");
              }}
              placeholder="Minimum ₹100"
              data-ocid="deposit.input"
              className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="deposit-utr"
              className="text-sm font-medium text-gray-700"
            >
              UTR / Transaction ID
            </label>
            <input
              id="deposit-utr"
              type="text"
              value={utr}
              onChange={(e) => {
                setUtr(e.target.value);
                setError("");
              }}
              placeholder="Enter UTR / Transaction ID after payment"
              data-ocid="deposit.textarea"
              className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm" data-ocid="deposit.error_state">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            data-ocid="deposit.submit_button"
            className="w-full py-3.5 rounded-xl text-white font-semibold disabled:opacity-60"
            style={{ background: "#0F3B66" }}
          >
            {submitting ? "Submitting..." : "Submit Deposit"}
          </button>
        </div>
      </div>
      <h3 className="text-sm font-bold text-gray-900 mb-3">Deposit History</h3>
      {loading ? (
        <div
          className="text-gray-400 text-sm"
          data-ocid="deposit.loading_state"
        >
          Loading...
        </div>
      ) : deposits.length === 0 ? (
        <div
          className="text-center py-8 text-gray-400 text-sm"
          data-ocid="deposit.empty_state"
        >
          No deposits yet
        </div>
      ) : (
        <div className="space-y-3" data-ocid="deposit.list">
          {[...deposits]
            .reverse()
            .slice(0, 10)
            .map((d, i) => (
              <div
                key={`${d.utrNumber}-${d.submittedAt.toString()}`}
                data-ocid={`deposit.item.${i + 1}`}
                className="bg-white rounded-xl p-3 shadow-sm flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    ₹{Number(d.amount).toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-gray-500">UTR: {d.utrNumber}</p>
                </div>
                {statusBadge(d.status)}
              </div>
            ))}
        </div>
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
