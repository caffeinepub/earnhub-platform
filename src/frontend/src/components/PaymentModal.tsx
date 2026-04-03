import { Check, X } from "lucide-react";
import { useState } from "react";
import { PaymentApp, type Plan } from "../backend";
import { useActor } from "../hooks/useActor";

type Step = "select-app" | "qr" | "utr" | "success";

const APP_OPTIONS = [
  {
    id: PaymentApp.PhonePe,
    label: "PhonePe",
    logo: "/assets/generated/phonepe-logo-transparent.dim_100x100.png",
    color: "#7B2FF7",
  },
  {
    id: PaymentApp.GooglePay,
    label: "Google Pay",
    logo: "/assets/generated/googlepay-logo-transparent.dim_100x100.png",
    color: "#4285F4",
  },
  {
    id: PaymentApp.Paytm,
    label: "Paytm",
    logo: "/assets/generated/paytm-logo-transparent.dim_100x100.png",
    color: "#00BAF2",
  },
];

export default function PaymentModal({
  plan,
  onClose,
  onSuccess,
}: { plan: Plan; onClose: () => void; onSuccess: () => void }) {
  const { actor } = useActor();
  const [step, setStep] = useState<Step>("select-app");
  const [selectedApp, setSelectedApp] = useState<PaymentApp | null>(null);
  const [utr, setUtr] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!utr.trim() || utr.length < 6) {
      setError("Enter a valid UTR / Transaction ID (min 6 chars)");
      return;
    }
    if (!actor || !selectedApp) return;
    setSubmitting(true);
    try {
      await actor.requestPlanPurchase(plan.id, selectedApp, utr.trim());
      setStep("success");
    } catch {
      setError("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.7)" }}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl px-5 pt-4 pb-8 max-h-[90vh] overflow-y-auto"
        style={{
          background: "oklch(0.17 0.016 260)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderBottom: "none",
        }}
      >
        <div
          className="w-10 h-1 rounded-full mx-auto mb-4"
          style={{ background: "rgba(255,255,255,0.2)" }}
        />

        {step !== "success" && (
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-bold text-foreground">
                Buy {plan.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                ₹{Number(plan.price).toLocaleString("en-IN")} • ₹
                {Number(plan.dailyEarning)}/day for {Number(plan.validityDays)}{" "}
                days
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl"
              style={{ background: "rgba(255,255,255,0.08)" }}
              data-ocid="payment_modal.close_button"
            >
              <X size={18} className="text-muted-foreground" />
            </button>
          </div>
        )}

        {step === "select-app" && (
          <>
            <p className="text-sm font-semibold text-foreground mb-3">
              Select Payment App
            </p>
            <div className="space-y-3">
              {APP_OPTIONS.map((app) => (
                <button
                  type="button"
                  key={app.id}
                  onClick={() => {
                    setSelectedApp(app.id);
                    setStep("qr");
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-98"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                  data-ocid="payment_modal.button"
                >
                  <div
                    className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center"
                    style={{
                      background: `${app.color}15`,
                      border: `1px solid ${app.color}30`,
                    }}
                  >
                    <img
                      src={app.logo}
                      alt={app.label}
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <span className="font-semibold text-foreground">
                    {app.label}
                  </span>
                  <span className="ml-auto text-muted-foreground">→</span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === "qr" && (
          <>
            <div className="text-center mb-4">
              <p className="text-sm font-semibold text-foreground mb-1">
                Scan & Pay ₹{Number(plan.price).toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-muted-foreground">
                Use {selectedApp} to scan this QR code
              </p>
            </div>
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-2xl" style={{ background: "#fff" }}>
                <img
                  src="/assets/upi-qr.jpg"
                  alt="UPI QR Code"
                  className="w-56 h-56 object-contain rounded-xl"
                />
              </div>
            </div>
            <div
              className="rounded-xl p-3 mb-5 text-center"
              style={{
                background: "rgba(255,107,0,0.1)",
                border: "1px solid rgba(255,107,0,0.2)",
              }}
            >
              <p className="text-sm font-bold" style={{ color: "#FF6B00" }}>
                Amount: ₹{Number(plan.price).toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Open GPay / PhonePe / Paytm and scan the code above
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStep("utr")}
              className="w-full py-3.5 rounded-xl font-semibold text-sm"
              style={{
                background: "linear-gradient(135deg, #FF6B00, #FF9500)",
                color: "#0D1117",
              }}
              data-ocid="payment_modal.primary_button"
            >
              I've Paid — Enter UTR Number
            </button>
          </>
        )}

        {step === "utr" && (
          <>
            <p className="text-sm font-semibold text-foreground mb-1">
              Enter Transaction Details
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Find the UTR / Reference ID in your payment app's transaction
              history
            </p>
            <div className="mb-4">
              <label
                htmlFor="payment-utr"
                className="text-sm font-medium text-foreground/80"
              >
                UTR / Transaction ID
              </label>
              <input
                id="payment-utr"
                type="text"
                value={utr}
                onChange={(e) => {
                  setUtr(e.target.value);
                  setError("");
                }}
                placeholder="e.g. 423812345678"
                className="mt-1.5 w-full px-4 py-3 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
                data-ocid="payment_modal.input"
              />
            </div>
            {error && (
              <p
                className="text-sm mb-3"
                style={{ color: "#FF5555" }}
                data-ocid="payment_modal.error_state"
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
              data-ocid="payment_modal.submit_button"
            >
              {submitting ? "Submitting..." : "Submit Payment"}
            </button>
          </>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center py-8">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{
                background: "rgba(0,201,167,0.15)",
                border: "2px solid rgba(0,201,167,0.4)",
              }}
            >
              <Check size={28} style={{ color: "#00C9A7" }} />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              Payment Submitted!
            </h3>
            <p className="text-muted-foreground text-sm text-center mb-1">
              Your payment is under review.
            </p>
            <p className="text-muted-foreground text-xs text-center mb-6">
              Admin will verify and activate your plan within 24 hours.
            </p>
            <div
              className="px-4 py-2 rounded-full text-sm font-semibold mb-6"
              style={{
                background: "rgba(255,107,0,0.15)",
                color: "#FF6B00",
                border: "1px solid rgba(255,107,0,0.3)",
              }}
            >
              Status: Pending Review
            </div>
            <button
              type="button"
              onClick={onSuccess}
              className="w-full py-3.5 rounded-xl font-semibold text-sm"
              style={{
                background: "linear-gradient(135deg, #FF6B00, #FF9500)",
                color: "#0D1117",
              }}
              data-ocid="payment_modal.primary_button"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
