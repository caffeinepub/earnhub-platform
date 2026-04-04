import { Camera, Check, QrCode, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { PaymentApp, type Plan } from "../backend";
import { useActor } from "../hooks/useActor";
import { useQRScanner } from "../qr-code/useQRScanner";

type Step = "select-app" | "qr" | "utr" | "success";

const APP_OPTIONS = [
  {
    id: PaymentApp.PhonePe,
    label: "PhonePe",
    logo: "/assets/generated/phonepe-logo-transparent.dim_100x100.png",
    color: "#7B2FF7",
    initial: "P",
  },
  {
    id: PaymentApp.GooglePay,
    label: "Google Pay",
    logo: "/assets/generated/googlepay-logo-transparent.dim_100x100.png",
    color: "#4285F4",
    initial: "G",
  },
  {
    id: PaymentApp.Paytm,
    label: "Paytm",
    logo: "/assets/generated/paytm-logo-transparent.dim_100x100.png",
    color: "#00BAF2",
    initial: "Pt",
  },
];

function AppLogo({ app }: { app: (typeof APP_OPTIONS)[number] }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs"
        style={{ background: app.color }}
      >
        {app.initial}
      </div>
    );
  }
  return (
    <img
      src={app.logo}
      alt={app.label}
      className="w-8 h-8 object-contain"
      onError={() => setFailed(true)}
    />
  );
}

function QRScannerInModal({
  onScanned,
}: { onScanned: (data: string) => void }) {
  const scanner = useQRScanner({
    facingMode: "environment",
    scanInterval: 200,
  });
  const hasScanned = useRef(false);

  useEffect(() => {
    if (scanner.qrResults.length > 0 && !hasScanned.current) {
      hasScanned.current = true;
      onScanned(scanner.qrResults[0].data);
    }
  }, [scanner.qrResults, onScanned]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="w-full rounded-2xl overflow-hidden relative"
        style={{ background: "rgba(0,0,0,0.4)", aspectRatio: "1" }}
      >
        <video
          ref={scanner.videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ display: scanner.isActive ? "block" : "none" }}
        />
        <canvas ref={scanner.canvasRef} className="hidden" />

        {!scanner.isActive && !scanner.isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <Camera size={36} style={{ color: "#FF6B00" }} />
            <p
              className="text-xs text-center px-4"
              style={{ color: "#e5e7eb" }}
            >
              {scanner.isSupported === false
                ? "Camera not supported on this device"
                : "Tap Start Camera to scan"}
            </p>
          </div>
        )}

        {scanner.isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div
              className="w-7 h-7 rounded-full border-2 animate-spin"
              style={{
                borderColor: "rgba(255,107,0,0.2)",
                borderTopColor: "#FF6B00",
              }}
            />
            <p className="text-xs" style={{ color: "#e5e7eb" }}>
              Starting camera...
            </p>
          </div>
        )}

        {scanner.isActive && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div
              className="w-40 h-40 rounded-2xl"
              style={{
                border: "2px solid #FF6B00",
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)",
              }}
            />
          </div>
        )}
      </div>

      {scanner.error && (
        <p className="text-xs text-center" style={{ color: "#FF5555" }}>
          {scanner.error.message}
        </p>
      )}

      {!scanner.isActive ? (
        <button
          type="button"
          disabled={scanner.isLoading || scanner.isSupported === false}
          onClick={() => {
            hasScanned.current = false;
            scanner.startScanning();
          }}
          className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          style={{
            background: "linear-gradient(135deg, #FF6B00, #FF9500)",
            color: "#0D1117",
            touchAction: "manipulation",
            cursor: "pointer",
          }}
        >
          <Camera size={15} />
          Start Camera
        </button>
      ) : (
        <button
          type="button"
          onClick={() => scanner.stopScanning()}
          className="w-full py-3 rounded-xl font-semibold text-sm"
          style={{
            background: "rgba(255,85,85,0.15)",
            color: "#FF5555",
            border: "1px solid rgba(255,85,85,0.2)",
            touchAction: "manipulation",
            cursor: "pointer",
          }}
        >
          Stop Camera
        </button>
      )}
    </div>
  );
}

function UPIQRImage() {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className="w-56 h-56 rounded-xl flex flex-col items-center justify-center gap-2"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "2px dashed rgba(255,255,255,0.2)",
        }}
      >
        <QrCode size={48} style={{ color: "#FF6B00" }} />
        <p className="text-xs text-center px-4" style={{ color: "#e5e7eb" }}>
          QR code unavailable. Please ask admin for the UPI QR.
        </p>
      </div>
    );
  }

  return (
    <img
      src="/assets/upi-qr.jpg"
      alt="UPI QR Code"
      className="w-56 h-56 object-contain rounded-xl"
      onError={() => setFailed(true)}
    />
  );
}

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
  const [qrTab, setQrTab] = useState<"show" | "scan">("show");

  const handleScanned = useCallback((data: string) => {
    setUtr(data);
    setQrTab("show");
    setStep("utr");
  }, []);

  // Reset tab when leaving qr step
  useEffect(() => {
    if (step !== "qr") {
      setQrTab("show");
    }
  }, [step]);

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

  const btnBase: React.CSSProperties = {
    touchAction: "manipulation",
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
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
              <p className="text-sm" style={{ color: "#e5e7eb" }}>
                ₹{Number(plan.price).toLocaleString("en-IN")} · ₹
                {Number(plan.dailyEarning)}/day for {Number(plan.validityDays)}{" "}
                days
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl"
              style={{
                ...btnBase,
                background: "rgba(255,255,255,0.08)",
                minWidth: "40px",
                minHeight: "40px",
              }}
              data-ocid="payment_modal.close_button"
            >
              <X size={18} style={{ color: "#e5e7eb" }} />
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
                  className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all"
                  style={{
                    ...btnBase,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    minHeight: "64px",
                  }}
                  data-ocid="payment_modal.button"
                >
                  <div
                    className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `${app.color}15`,
                      border: `1px solid ${app.color}30`,
                    }}
                  >
                    <AppLogo app={app} />
                  </div>
                  <span className="font-semibold text-foreground">
                    {app.label}
                  </span>
                  <span className="ml-auto" style={{ color: "#e5e7eb" }}>
                    →
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === "qr" && (
          <>
            <div className="text-center mb-4">
              <p className="text-sm font-semibold text-foreground mb-1">
                Scan &amp; Pay ₹{Number(plan.price).toLocaleString("en-IN")}
              </p>
              <p className="text-xs" style={{ color: "#e5e7eb" }}>
                Use your UPI app to scan this QR code
              </p>
            </div>

            {/* Tab Switcher */}
            <div
              className="flex gap-1 p-1 rounded-xl mb-4"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <button
                type="button"
                onClick={() => setQrTab("show")}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{
                  ...btnBase,
                  background: qrTab === "show" ? "#FF6B00" : "transparent",
                  color:
                    qrTab === "show" ? "#0D1117" : "rgba(255,255,255,0.85)",
                }}
                data-ocid="payment_modal.tab"
              >
                <QrCode size={13} />
                Show QR
              </button>
              <button
                type="button"
                onClick={() => setQrTab("scan")}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{
                  ...btnBase,
                  background: qrTab === "scan" ? "#FF6B00" : "transparent",
                  color:
                    qrTab === "scan" ? "#0D1117" : "rgba(255,255,255,0.85)",
                }}
                data-ocid="payment_modal.tab"
              >
                <Camera size={13} />
                Scan QR
              </button>
            </div>

            {qrTab === "show" ? (
              <>
                <div className="flex justify-center mb-4">
                  <div
                    className="p-3 rounded-2xl"
                    style={{ background: "#fff" }}
                  >
                    <UPIQRImage />
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
                  <p className="text-xs mt-1" style={{ color: "#e5e7eb" }}>
                    Open GPay / PhonePe / Paytm and scan the code above
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep("utr")}
                  className="w-full py-3.5 rounded-xl font-semibold text-sm"
                  style={{
                    ...btnBase,
                    background: "linear-gradient(135deg, #FF6B00, #FF9500)",
                    color: "#0D1117",
                  }}
                  data-ocid="payment_modal.primary_button"
                >
                  I&apos;ve Paid — Enter UTR Number
                </button>
              </>
            ) : (
              <QRScannerInModal onScanned={handleScanned} />
            )}
          </>
        )}

        {step === "utr" && (
          <>
            <p className="text-sm font-semibold text-foreground mb-1">
              Enter Transaction Details
            </p>
            <p className="text-xs mb-4" style={{ color: "#e5e7eb" }}>
              Find the UTR / Reference ID in your payment app&apos;s transaction
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
              {utr && (
                <p className="text-xs mt-1" style={{ color: "#00C9A7" }}>
                  ✓ UTR auto-filled from scan
                </p>
              )}
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
                ...btnBase,
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
            <p
              className="text-sm text-center mb-1"
              style={{ color: "#e5e7eb" }}
            >
              Your payment is under review.
            </p>
            <p
              className="text-xs text-center mb-6"
              style={{ color: "#e5e7eb" }}
            >
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
                ...btnBase,
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
