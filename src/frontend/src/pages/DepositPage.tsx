import { ArrowDownToLine, Camera, Check, Copy, QrCode } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Variant_pending_approved_rejected } from "../backend";
import { useActor } from "../hooks/useActor";
import { useQRScanner } from "../qr-code/useQRScanner";

function statusBadge(status: Variant_pending_approved_rejected) {
  const map = {
    [Variant_pending_approved_rejected.approved]: {
      label: "Approved",
      color: "#10b981",
      bg: "rgba(16,185,129,0.1)",
    },
    [Variant_pending_approved_rejected.rejected]: {
      label: "Rejected",
      color: "#ef4444",
      bg: "rgba(239,68,68,0.1)",
    },
    [Variant_pending_approved_rejected.pending]: {
      label: "Pending",
      color: "#f97316",
      bg: "rgba(249,115,22,0.1)",
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

// Inline SVG logos
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
        strokeWidth="3"
      />
      <text
        x="50"
        y="40"
        textAnchor="middle"
        fontSize="14"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
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
        y="62"
        textAnchor="middle"
        fontSize="18"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
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
        y="58"
        textAnchor="middle"
        fontSize="20"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
        fill="white"
      >
        Paytm
      </text>
    </svg>
  );
}

const PAYMENT_APPS = [
  { label: "PhonePe", Logo: PhonePeLogo, color: "#5F259F" },
  { label: "GPay", Logo: GooglePayLogo, color: "#4285F4" },
  { label: "Paytm", Logo: PaytmLogo, color: "#00BAF2" },
];

function QRScannerSection({
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
            <Camera size={40} style={{ color: "#f97316" }} />
            <p
              className="text-sm text-center px-4"
              style={{ color: "#475569" }}
            >
              {scanner.isSupported === false
                ? "Camera not supported"
                : "Tap below to start scanning"}
            </p>
          </div>
        )}
        {scanner.isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div
              className="w-8 h-8 rounded-full border-2 animate-spin"
              style={{
                borderColor: "rgba(249,115,22,0.2)",
                borderTopColor: "#f97316",
              }}
            />
            <p className="text-sm" style={{ color: "#475569" }}>
              Starting camera...
            </p>
          </div>
        )}
        {scanner.isActive && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div
              className="w-48 h-48 rounded-2xl"
              style={{
                border: "2px solid #f97316",
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)",
              }}
            />
          </div>
        )}
      </div>
      {scanner.error && (
        <p className="text-sm text-center" style={{ color: "#ef4444" }}>
          {scanner.error.message}
        </p>
      )}
      {scanner.qrResults.length > 0 && (
        <div
          className="w-full rounded-xl p-3"
          style={{
            background: "rgba(16,185,129,0.08)",
            border: "1px solid rgba(16,185,129,0.2)",
          }}
        >
          <p
            className="text-xs font-semibold mb-1"
            style={{ color: "#10b981" }}
          >
            QR Scanned!
          </p>
          <p className="text-xs break-all" style={{ color: "#475569" }}>
            {scanner.qrResults[0].data}
          </p>
        </div>
      )}
      <div className="flex gap-2 w-full">
        {!scanner.isActive ? (
          <button
            type="button"
            disabled={scanner.isLoading || scanner.isSupported === false}
            onClick={() => {
              hasScanned.current = false;
              scanner.startScanning();
            }}
            className="flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #f97316, #fb923c)",
              color: "#ffffff",
              touchAction: "manipulation",
              cursor: "pointer",
            }}
          >
            <Camera size={16} /> Start Camera
          </button>
        ) : (
          <button
            type="button"
            onClick={() => scanner.stopScanning()}
            className="flex-1 py-3 rounded-xl font-semibold text-sm"
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
        {scanner.qrResults.length > 0 && (
          <button
            type="button"
            onClick={() =>
              navigator.clipboard
                .writeText(scanner.qrResults[0].data)
                .catch(() => {})
            }
            className="px-4 py-3 rounded-xl font-semibold text-sm flex items-center gap-1.5"
            style={{
              background: "#f1f5f9",
              border: "1px solid #e2e8f0",
              color: "#475569",
              touchAction: "manipulation",
              cursor: "pointer",
            }}
          >
            <Copy size={14} /> Copy
          </button>
        )}
      </div>
    </div>
  );
}

function UPIQRImage() {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div
        className="w-56 h-56 rounded-xl flex flex-col items-center justify-center gap-3"
        style={{ background: "#f8fafc", border: "2px dashed #e2e8f0" }}
      >
        <QrCode size={52} style={{ color: "#f97316" }} />
        <p className="text-xs text-center px-4" style={{ color: "#475569" }}>
          QR code not available. Please contact admin for the UPI QR code.
        </p>
      </div>
    );
  }
  return (
    <img
      src="/assets/upi-qr.jpg"
      alt="UPI Payment QR Code"
      className="w-56 h-56 object-contain rounded-xl"
      onError={() => setFailed(true)}
    />
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
  const [qrTab, setQrTab] = useState<"show" | "scan">("show");

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

  const inputStyle = {
    background: "#f1f5f9",
    border: "1px solid #e2e8f0",
    color: "#0f172a",
  };
  const btnBase: React.CSSProperties = {
    touchAction: "manipulation",
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
  };

  return (
    <div className="px-4 py-5 pb-8">
      <h1 className="text-2xl font-bold mb-5" style={{ color: "#0f172a" }}>
        Deposit
      </h1>

      {/* QR Code Card */}
      <div
        className="rounded-2xl p-5 mb-4"
        style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
      >
        <p
          className="text-sm font-bold text-center mb-4"
          style={{ color: "#0f172a" }}
        >
          Scan to Pay via UPI
        </p>

        {/* Tab Switcher */}
        <div
          className="flex gap-1 p-1 rounded-xl mb-4"
          style={{ background: "#e2e8f0" }}
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
            <QrCode size={14} /> Show QR
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
            <Camera size={14} /> Scan QR
          </button>
        </div>

        {qrTab === "show" ? (
          <>
            {/* QR Image */}
            <div className="flex justify-center mb-4">
              <div
                className="p-3 rounded-2xl"
                style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}
              >
                <UPIQRImage />
              </div>
            </div>

            {/* Payment app icons */}
            <div className="flex justify-center gap-5 mb-3">
              {PAYMENT_APPS.map((app) => (
                <div
                  key={app.label}
                  className="flex flex-col items-center gap-1"
                >
                  <div
                    className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center"
                    style={{
                      background: `${app.color}15`,
                      border: `1.5px solid ${app.color}30`,
                    }}
                  >
                    <app.Logo size={40} />
                  </div>
                  <span
                    className="text-xs font-medium"
                    style={{ color: "#475569" }}
                  >
                    {app.label}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-xs text-center" style={{ color: "#475569" }}>
              Scan using GPay, PhonePe, or Paytm to pay
            </p>
          </>
        ) : (
          <QRScannerSection
            onScanned={(data) => {
              setUtr(data);
              setQrTab("show");
            }}
          />
        )}
      </div>

      {/* Deposit Form */}
      <div
        className="rounded-2xl p-5 mb-6"
        style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(16,185,129,0.1)" }}
          >
            <ArrowDownToLine size={16} style={{ color: "#10b981" }} />
          </div>
          <h3 className="text-sm font-bold" style={{ color: "#0f172a" }}>
            Confirm Deposit
          </h3>
        </div>
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
              Deposit submitted! Pending admin approval.
            </p>
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="deposit-amount"
              className="text-sm font-medium"
              style={{ color: "#475569" }}
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
              className="mt-1.5 w-full px-4 py-3.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              style={inputStyle}
            />
          </div>
          <div>
            <label
              htmlFor="deposit-utr"
              className="text-sm font-medium"
              style={{ color: "#475569" }}
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
              className="mt-1.5 w-full px-4 py-3.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              style={inputStyle}
            />
            {utr && (
              <p className="text-xs mt-1" style={{ color: "#10b981" }}>
                ✓ UTR auto-filled from scan
              </p>
            )}
          </div>
          {error && (
            <p className="text-sm" style={{ color: "#ef4444" }}>
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
            {submitting ? "Submitting..." : "Submit Deposit"}
          </button>
        </div>
      </div>

      {/* Deposit History */}
      <h3 className="text-sm font-bold mb-3" style={{ color: "#0f172a" }}>
        Deposit History
      </h3>
      {loading ? (
        <div className="text-sm" style={{ color: "#475569" }}>
          Loading...
        </div>
      ) : deposits.length === 0 ? (
        <div className="text-center py-8 text-sm" style={{ color: "#94a3b8" }}>
          <div className="text-3xl mb-2">💰</div>
          No deposits yet
        </div>
      ) : (
        <div className="space-y-2.5">
          {[...deposits]
            .reverse()
            .slice(0, 10)
            .map((d) => (
              <div
                key={`${d.utrNumber}-${d.submittedAt.toString()}`}
                className="rounded-xl p-3.5 flex items-center justify-between"
                style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
              >
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "#0f172a" }}
                  >
                    ₹{Number(d.amount).toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs" style={{ color: "#475569" }}>
                    UTR: {d.utrNumber}
                  </p>
                </div>
                {statusBadge(d.status)}
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
