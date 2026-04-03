import { ArrowDownToLine, Check } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Variant_pending_approved_rejected } from "../backend";
import { useActor } from "../hooks/useActor";

function statusBadge(status: Variant_pending_approved_rejected) {
  const map = {
    [Variant_pending_approved_rejected.approved]: {
      label: "Approved",
      color: "#00C9A7",
      bg: "rgba(0,201,167,0.15)",
    },
    [Variant_pending_approved_rejected.rejected]: {
      label: "Rejected",
      color: "#FF5555",
      bg: "rgba(255,85,85,0.15)",
    },
    [Variant_pending_approved_rejected.pending]: {
      label: "Pending",
      color: "#FF9500",
      bg: "rgba(255,149,0,0.15)",
    },
  };
  const s = map[status] ?? map[Variant_pending_approved_rejected.pending];
  return (
    <span
      className="px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ color: s.color, background: s.bg }}
    >
      {s.label}
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
  >([] as any);
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

  const inputClass =
    "mt-1.5 w-full px-4 py-3.5 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder-muted-foreground/50";
  const inputStyle = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
  };

  return (
    <div className="px-4 py-5 pb-8">
      <h1 className="text-2xl font-bold text-foreground mb-5">Deposit</h1>

      {/* QR Code Card */}
      <div
        className="rounded-2xl p-5 mb-4 border border-white/8"
        style={{ background: "oklch(0.17 0.016 260)" }}
      >
        <p className="text-sm font-bold text-foreground text-center mb-4">
          Scan to Pay via UPI
        </p>
        <div className="flex justify-center mb-3">
          <div className="p-3 rounded-2xl" style={{ background: "#fff" }}>
            <img
              src="/assets/upi-qr.jpg"
              alt="UPI Payment QR Code"
              className="w-56 h-56 object-contain rounded-xl"
            />
          </div>
        </div>
        <div className="flex justify-center gap-3 mt-3">
          {[
            {
              label: "GPay",
              img: "/assets/generated/googlepay-logo-transparent.dim_100x100.png",
            },
            {
              label: "PhonePe",
              img: "/assets/generated/phonepe-logo-transparent.dim_100x100.png",
            },
            {
              label: "Paytm",
              img: "/assets/generated/paytm-logo-transparent.dim_100x100.png",
            },
          ].map((app) => (
            <div key={app.label} className="flex flex-col items-center gap-1">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                <img
                  src={app.img}
                  alt={app.label}
                  className="w-7 h-7 object-contain"
                />
              </div>
              <span className="text-xs text-muted-foreground">{app.label}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center mt-3">
          Scan using GPay, PhonePe, or Paytm to pay
        </p>
      </div>

      {/* Deposit Form */}
      <div
        className="rounded-2xl p-5 mb-6 border border-white/8"
        style={{ background: "oklch(0.17 0.016 260)" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(0,201,167,0.15)" }}
          >
            <ArrowDownToLine size={16} style={{ color: "#00C9A7" }} />
          </div>
          <h3 className="text-sm font-bold text-foreground">Confirm Deposit</h3>
        </div>
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
              Deposit submitted! Pending admin approval.
            </p>
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="deposit-amount"
              className="text-sm font-medium text-foreground/80"
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
              className={inputClass}
              style={inputStyle}
              data-ocid="deposit.input"
            />
          </div>
          <div>
            <label
              htmlFor="deposit-utr"
              className="text-sm font-medium text-foreground/80"
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
              placeholder="Enter UTR after payment"
              className={inputClass}
              style={inputStyle}
              data-ocid="deposit.textarea"
            />
          </div>
          {error && (
            <p
              className="text-sm"
              style={{ color: "#FF5555" }}
              data-ocid="deposit.error_state"
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
            data-ocid="deposit.submit_button"
          >
            {submitting ? "Submitting..." : "Submit Deposit"}
          </button>
        </div>
      </div>

      {/* Deposit History */}
      <h3 className="text-sm font-bold text-foreground mb-3">
        Deposit History
      </h3>
      {loading ? (
        <div
          className="text-muted-foreground text-sm"
          data-ocid="deposit.loading_state"
        >
          Loading...
        </div>
      ) : deposits.length === 0 ? (
        <div
          className="text-center py-8 text-muted-foreground text-sm"
          data-ocid="deposit.empty_state"
        >
          <div className="text-3xl mb-2">💰</div>
          No deposits yet
        </div>
      ) : (
        <div className="space-y-2.5" data-ocid="deposit.list">
          {[...deposits]
            .reverse()
            .slice(0, 10)
            .map((d, i) => (
              <div
                key={`${d.utrNumber}-${d.submittedAt.toString()}`}
                className="rounded-xl p-3.5 flex items-center justify-between border border-white/6"
                style={{ background: "oklch(0.17 0.016 260)" }}
                data-ocid={`deposit.item.${i + 1}`}
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    ₹{Number(d.amount).toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    UTR: {d.utrNumber}
                  </p>
                </div>
                {statusBadge(d.status)}
              </div>
            ))}
        </div>
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
