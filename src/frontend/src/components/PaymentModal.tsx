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
  },
  {
    id: PaymentApp.GooglePay,
    label: "Google Pay",
    logo: "/assets/generated/googlepay-logo-transparent.dim_100x100.png",
  },
  {
    id: PaymentApp.Paytm,
    label: "Paytm",
    logo: "/assets/generated/paytm-logo-transparent.dim_100x100.png",
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
      <div className="w-full max-w-lg bg-white rounded-t-3xl px-5 pt-5 pb-8 max-h-[90vh] overflow-y-auto">
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
        {step !== "success" && (
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Buy {plan.name}
              </h3>
              <p className="text-sm text-gray-500">
                ₹{Number(plan.price)} • ₹{Number(plan.dailyEarning)}/day for{" "}
                {Number(plan.validityDays)} days
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full bg-gray-100"
              data-ocid="payment_modal.close_button"
            >
              <X size={18} className="text-gray-600" />
            </button>
          </div>
        )}

        {step === "select-app" && (
          <>
            <p className="text-sm font-semibold text-gray-700 mb-3">
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
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-blue-300 transition-colors"
                  data-ocid="payment_modal.button"
                >
                  <img
                    src={app.logo}
                    alt={app.label}
                    className="w-10 h-10 object-contain rounded-lg"
                  />
                  <span className="font-semibold text-gray-800">
                    {app.label}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === "qr" && (
          <>
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Pay ₹{Number(plan.price)} via {selectedApp}
            </p>
            <p className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Scan to Pay
            </p>
            <div className="flex justify-center mb-4">
              <img
                src="/assets/20260330_191337-019d3f3a-f423-76ed-bb39-fa2c1d041ae5.jpg"
                alt="UPI QR Code"
                className="w-64 h-64 object-contain rounded-2xl border-4 border-blue-100 shadow-md"
              />
            </div>
            <div className="bg-blue-50 rounded-xl p-3 mb-5">
              <p className="text-sm font-bold text-blue-900 text-center">
                Amount: ₹{Number(plan.price)}
              </p>
              <p className="text-xs text-blue-600 text-center mt-1">
                Scan the QR code using GPay / PhonePe / Paytm and complete your
                payment
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStep("utr")}
              className="w-full py-3.5 rounded-xl text-white font-semibold mt-2"
              style={{ background: "#0F3B66" }}
              data-ocid="payment_modal.primary_button"
            >
              I Have Paid — Enter UTR
            </button>
          </>
        )}

        {step === "utr" && (
          <>
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Enter Transaction Details
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Enter the UTR / Reference number from your payment app
            </p>
            <div className="mb-4">
              <label
                htmlFor="payment-utr"
                className="text-sm font-medium text-gray-700"
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
                className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-ocid="payment_modal.input"
              />
            </div>
            {error && (
              <p
                className="text-red-500 text-sm mb-3"
                data-ocid="payment_modal.error_state"
              >
                {error}
              </p>
            )}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-3.5 rounded-xl text-white font-semibold disabled:opacity-60"
              style={{ background: "#0F3B66" }}
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
              style={{ background: "#E8F5E9" }}
            >
              <Check size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Payment Submitted!
            </h3>
            <p className="text-gray-500 text-sm text-center mb-1">
              Your payment is under review.
            </p>
            <p className="text-gray-400 text-xs text-center mb-6">
              Admin will verify and activate your plan within 24 hours.
            </p>
            <div
              className="px-4 py-2 rounded-full text-sm font-semibold"
              style={{ background: "#FFF3E0", color: "#F57C1F" }}
            >
              Status: Pending
            </div>
            <button
              type="button"
              onClick={onSuccess}
              className="mt-6 w-full py-3.5 rounded-xl text-white font-semibold"
              style={{ background: "#0F3B66" }}
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
