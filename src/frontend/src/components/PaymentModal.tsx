import { Camera, Check, QrCode, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { PaymentApp, type Plan } from "../backend";
import { useActor } from "../hooks/useActor";
import { useQRScanner } from "../qr-code/useQRScanner";

type Step = "select-app" | "qr" | "utr" | "success";

// Inline SVG logos — no external image dependency
function PhonePeLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      role="img"
      aria-label="PhonePe"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="100" height="100" rx="20" fill="#5F259F" />
      <path
        d="M65 30H50C44.477 30 40 34.477 40 40V55L30 65H45C45 65 45 65 45 65V70C45 75.523 49.477 80 55 80H65C70.523 80 75 75.523 75 70V40C75 34.477 70.523 30 65 30Z"
        fill="white"
      />
      <circle cx="55" cy="48" r="7" fill="#5F259F" />
    </svg>
  );
}

function GooglePayLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      role="img"
      aria-label="Google Pay"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        width="100"
        height="100"
        rx="20"
        fill="white"
        stroke="#e2e8f0"
        strokeWidth="2"
      />
      <text
        x="50"
        y="38"
        textAnchor="middle"
        fontSize="14"
        fontWeight="bold"
        fontFamily="Arial"
      >
        <tspan fill="#4285F4">G</tspan>
        <tspan fill="#EA4335">o</tspan>
        <tspan fill="#FBBC05">o</tspan>
        <tspan fill="#4285F4">g</tspan>
        <tspan fill="#34A853">l</tspan>
        <tspan fill="#EA4335">e</tspan>
      </text>
      <text
        x="50"
        y="60"
        textAnchor="middle"
        fontSize="16"
        fontWeight="bold"
        fontFamily="Arial"
        fill="#1a1a1a"
      >
        Pay
      </text>
    </svg>
  );
}

function PaytmLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      role="img"
      aria-label="Paytm"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="100" height="100" rx="20" fill="#00BAF2" />
      <text
        x="50"
        y="56"
        textAnchor="middle"
        fontSize="22"
        fontWeight="bold"
        fontFamily="Arial"
        fill="white"
      >
        Paytm
      </text>
    </svg>
  );
}

const APP_OPTIONS = [
  {
    id: PaymentApp.PhonePe,
    label: "PhonePe",
    Logo: PhonePeLogo,
    color: "#5F259F",
  },
  {
    id: PaymentApp.GooglePay,
    label: "Google Pay",
    Logo: GooglePayLogo,
    color: "#4285F4",
  },
  {
    id: PaymentApp.Paytm,
    label: "Paytm",
    Logo: PaytmLogo,
    color: "#00BAF2",
  },
];

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
        style={{
          background: "#f1f5f9",
          aspectRatio: "1",
          border: "1px solid #e2e8f0",
        }}
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
            <Camera size={36} style={{ color: "#f97316" }} />
            <p
              className="text-xs text-center px-4"
              style={{ color: "#475569" }}
            >
              {scanner.isSupported === false
                ? "Camera not supported"
                : "Tap Start Camera to scan"}
            </p>
          </div>
        )}
        {scanner.isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div
              className="w-7 h-7 rounded-full border-2 animate-spin"
              style={{
                borderColor: "rgba(249,115,22,0.2)",
                borderTopColor: "#f97316",
              }}
            />
            <p className="text-xs" style={{ color: "#475569" }}>
              Starting camera...
            </p>
          </div>
        )}
        {scanner.isActive && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div
              className="w-40 h-40 rounded-2xl"
              style={{
                border: "2px solid #f97316",
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)",
              }}
            />
          </div>
        )}
      </div>
      {scanner.error && (
        <p className="text-xs text-center" style={{ color: "#ef4444" }}>
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
            background: "linear-gradient(135deg, #f97316, #fb923c)",
            color: "#ffffff",
            touchAction: "manipulation",
            cursor: "pointer",
          }}
        >
          <Camera size={15} /> Start Camera
        </button>
      ) : (
        <button
          type="button"
          onClick={() => scanner.stopScanning()}
          className="w-full py-3 rounded-xl font-semibold text-sm"
          style={{
            background: "rgba(239,68,68,0.08)",
            color: "#ef4444",
            border: "1px solid rgba(239,68,68,0.2)",
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
        style={{ background: "#f8fafc", border: "2px dashed #e2e8f0" }}
      >
        <QrCode size={48} style={{ color: "#f97316" }} />
        <p className="text-xs text-center px-4" style={{ color: "#475569" }}>
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

  useEffect(() => {
    if (step !== "qr") setQrTab("show");
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
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl px-5 pt-4 pb-8 max-h-[90vh] overflow-y-auto"
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderBottom: "none",
          boxShadow: "0 -4px 24px rgba(0,0,0,0.1)",
        }}
      >
        <div
          className="w-10 h-1 rounded-full mx-auto mb-4"
          style={{ background: "#e2e8f0" }}
        />

        {step !== "success" && (
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-bold" style={{ color: "#0f172a" }}>
                Buy {plan.name}
              </h3>
              <p className="text-sm" style={{ color: "#475569" }}>
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
                background: "#f1f5f9",
                minWidth: "40px",
                minHeight: "40px",
              }}
            >
              <X size={18} style={{ color: "#475569" }} />
            </button>
          </div>
        )}

        {/* Step 1: Select Payment App */}
        {step === "select-app" && (
          <>
            <p
              className="text-sm font-semibold mb-3"
              style={{ color: "#0f172a" }}
            >
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
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    minHeight: "64px",
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `${app.color}15`,
                      border: `1.5px solid ${app.color}30`,
                    }}
                  >
                    <app.Logo size={36} />
                  </div>
                  <span className="font-semibold" style={{ color: "#0f172a" }}>
                    {app.label}
                  </span>
                  <span
                    className="ml-auto text-lg"
                    style={{ color: "#94a3b8" }}
                  >
                    ›
                  </span>
                </button>
              ))}

              {/* Scan QR Directly */}
              <button
                type="button"
                onClick={() => {
                  setSelectedApp(PaymentApp.PhonePe);
                  setQrTab("scan");
                  setStep("qr");
                }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all"
                style={{
                  ...btnBase,
                  background: "rgba(249,115,22,0.05)",
                  border: "1.5px solid rgba(249,115,22,0.3)",
                  minHeight: "64px",
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "rgba(249,115,22,0.1)",
                    border: "1px solid rgba(249,115,22,0.25)",
                  }}
                >
                  <Camera size={22} style={{ color: "#f97316" }} />
                </div>
                <span className="font-semibold" style={{ color: "#0f172a" }}>
                  Scan QR Directly
                </span>
                <span className="ml-auto text-lg" style={{ color: "#94a3b8" }}>
                  ›
                </span>
              </button>
            </div>
          </>
        )}

        {/* Step 2: Show / Scan QR */}
        {step === "qr" && (
          <>
            <div className="text-center mb-4">
              <p
                className="text-sm font-semibold mb-1"
                style={{ color: "#0f172a" }}
              >
                Scan &amp; Pay ₹{Number(plan.price).toLocaleString("en-IN")}
              </p>
              <p className="text-xs" style={{ color: "#475569" }}>
                Use your UPI app to scan this QR code
              </p>
            </div>

            {/* Tab */}
            <div
              className="flex gap-1 p-1 rounded-xl mb-4"
              style={{ background: "#f1f5f9" }}
            >
              <button
                type="button"
                onClick={() => setQrTab("show")}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold"
                style={{
                  ...btnBase,
                  background: qrTab === "show" ? "#f97316" : "transparent",
                  color: qrTab === "show" ? "#ffffff" : "#475569",
                }}
              >
                <QrCode size={13} /> Show QR
              </button>
              <button
                type="button"
                onClick={() => setQrTab("scan")}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold"
                style={{
                  ...btnBase,
                  background: qrTab === "scan" ? "#f97316" : "transparent",
                  color: qrTab === "scan" ? "#ffffff" : "#475569",
                }}
              >
                <Camera size={13} /> Scan QR
              </button>
            </div>

            {qrTab === "show" ? (
              <>
                <div className="flex justify-center mb-3">
                  <div
                    className="p-3 rounded-2xl"
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <UPIQRImage />
                  </div>
                </div>

                {/* Payment app icons row */}
                <div className="flex justify-center gap-4 mb-3">
                  {APP_OPTIONS.map((app) => (
                    <div
                      key={app.id}
                      className="flex flex-col items-center gap-1"
                    >
                      <div
                        className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center"
                        style={{
                          background: `${app.color}15`,
                          border: `1.5px solid ${app.color}30`,
                        }}
                      >
                        <app.Logo size={32} />
                      </div>
                      <span className="text-xs" style={{ color: "#475569" }}>
                        {app.label}
                      </span>
                    </div>
                  ))}
                </div>

                <div
                  className="rounded-xl p-3 mb-5 text-center"
                  style={{
                    background: "rgba(249,115,22,0.06)",
                    border: "1px solid rgba(249,115,22,0.2)",
                  }}
                >
                  <p className="text-sm font-bold" style={{ color: "#f97316" }}>
                    Amount: ₹{Number(plan.price).toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#475569" }}>
                    Open GPay / PhonePe / Paytm and scan the code above
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep("utr")}
                  className="w-full py-3.5 rounded-xl font-semibold text-sm"
                  style={{
                    ...btnBase,
                    background: "linear-gradient(135deg, #f97316, #fb923c)",
                    color: "#ffffff",
                  }}
                >
                  I&apos;ve Paid — Enter UTR Number
                </button>
              </>
            ) : (
              <QRScannerInModal onScanned={handleScanned} />
            )}
          </>
        )}

        {/* Step 3: UTR */}
        {step === "utr" && (
          <>
            <p
              className="text-sm font-semibold mb-1"
              style={{ color: "#0f172a" }}
            >
              Enter Transaction Details
            </p>
            <p className="text-xs mb-4" style={{ color: "#475569" }}>
              Find the UTR / Reference ID in your payment app&apos;s transaction
              history
            </p>
            <div className="mb-4">
              <label
                htmlFor="payment-utr"
                className="text-sm font-medium"
                style={{ color: "#475569" }}
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
                className="mt-1.5 w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                style={{
                  background: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  color: "#0f172a",
                }}
              />
              {utr && (
                <p className="text-xs mt-1" style={{ color: "#10b981" }}>
                  ✓ UTR auto-filled from scan
                </p>
              )}
            </div>
            {error && (
              <p className="text-sm mb-3" style={{ color: "#ef4444" }}>
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
                background: "linear-gradient(135deg, #f97316, #fb923c)",
                color: "#ffffff",
              }}
            >
              {submitting ? "Submitting..." : "Submit Payment"}
            </button>
          </>
        )}

        {/* Step 4: Success */}
        {step === "success" && (
          <div className="flex flex-col items-center py-8">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{
                background: "rgba(16,185,129,0.1)",
                border: "2px solid rgba(16,185,129,0.3)",
              }}
            >
              <Check size={28} style={{ color: "#10b981" }} />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: "#0f172a" }}>
              Payment Submitted!
            </h3>
            <p
              className="text-sm text-center mb-1"
              style={{ color: "#475569" }}
            >
              Your payment is under review.
            </p>
            <p
              className="text-xs text-center mb-6"
              style={{ color: "#94a3b8" }}
            >
              Admin will verify and activate your plan within 24 hours.
            </p>
            <div
              className="px-4 py-2 rounded-full text-sm font-semibold mb-6"
              style={{
                background: "rgba(249,115,22,0.1)",
                color: "#f97316",
                border: "1px solid rgba(249,115,22,0.2)",
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
                background: "linear-gradient(135deg, #f97316, #fb923c)",
                color: "#ffffff",
              }}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
