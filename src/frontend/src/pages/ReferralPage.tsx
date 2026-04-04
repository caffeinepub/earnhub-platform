import { Copy, Gift, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface ReferralStats {
  totalReferrals: bigint;
  totalEarnings: bigint;
}

const TERMS = [
  "Your friend must sign up using your referral link.",
  "Your friend must purchase the Basic Plan (₹500).",
  "₹500 bonus is credited to your wallet after plan activation.",
  "No limit — refer as many friends as you like!",
  "Each friend can only be referred once.",
];

export default function ReferralPage() {
  const { identity } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [copied, setCopied] = useState(false);

  const referralCode = identity?.getPrincipal().toText() ?? "";
  const referralLink = referralCode
    ? `${window.location.origin}/?ref=${referralCode}`
    : "";

  useEffect(() => {
    if (!actor || isFetching) return;
    setLoadingStats(true);
    actor
      .getCallerReferralStats()
      .then((data) => setStats(data))
      .catch(() => setStats({ totalReferrals: 0n, totalEarnings: 0n }))
      .finally(() => setLoadingStats(false));
  }, [actor, isFetching]);

  const handleCopy = () => {
    if (!referralLink) return;
    navigator.clipboard
      .writeText(referralLink)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        const el = document.createElement("textarea");
        el.value = referralLink;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
  };

  const totalReferrals = stats ? Number(stats.totalReferrals) : 0;
  const totalEarnings = stats ? Number(stats.totalEarnings) : 0;

  return (
    <div className="pb-6">
      {/* Page Header */}
      <div
        className="px-4 pt-5 pb-8 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #fff7ed, #ffedd5)",
          borderBottom: "1px solid #fed7aa",
        }}
      >
        <div
          className="absolute -right-8 -top-8 w-32 h-32 rounded-full"
          style={{ background: "rgba(249,115,22,0.08)" }}
        />
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #f97316, #fb923c)" }}
          >
            <Gift size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: "#0f172a" }}>
              Referral Program
            </h1>
            <p className="text-xs" style={{ color: "#475569" }}>
              Share &amp; Earn Together
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* FREE OFFER Banner */}
        <div
          className="rounded-2xl p-4"
          data-ocid="referral.panel"
          style={{
            background: "#ecfdf5",
            border: "1px solid #a7f3d0",
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "rgba(16,185,129,0.15)",
                border: "1px solid rgba(16,185,129,0.3)",
              }}
            >
              <TrendingUp size={22} style={{ color: "#10b981" }} />
            </div>
            <div className="flex-1">
              <span
                className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-full mb-1.5"
                style={{
                  background: "rgba(249,115,22,0.1)",
                  color: "#f97316",
                  border: "1px solid rgba(249,115,22,0.2)",
                }}
              >
                🎁 FREE OFFER
              </span>
              <h2
                className="font-bold text-base leading-snug"
                style={{ color: "#0f172a" }}
              >
                Earn ₹500 Free on Every Referral!
              </h2>
              <p
                className="text-xs mt-1 leading-relaxed"
                style={{ color: "#475569" }}
              >
                Share your link. When your friend signs up and buys the{" "}
                <span className="font-bold" style={{ color: "#0f172a" }}>
                  Basic Plan (₹500)
                </span>
                , you get{" "}
                <span className="font-bold" style={{ color: "#10b981" }}>
                  ₹500 FREE
                </span>{" "}
                in your wallet.
              </p>
            </div>
          </div>
          <div
            className="mt-3 pt-3 grid grid-cols-3 gap-2"
            style={{ borderTop: "1px solid rgba(16,185,129,0.2)" }}
          >
            {[
              { step: "1", label: "Copy & share link" },
              { step: "2", label: "Friend signs up" },
              { step: "3", label: "Friend buys ₹500 plan" },
            ].map(({ step, label }) => (
              <div
                key={step}
                className="flex flex-col items-center text-center"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center mb-1 text-sm font-bold"
                  style={{
                    background: "rgba(16,185,129,0.15)",
                    color: "#10b981",
                  }}
                >
                  {step}
                </div>
                <p
                  className="text-xs leading-tight"
                  style={{ color: "#475569" }}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>
          <div
            className="mt-2 pt-2 text-center"
            style={{ borderTop: "1px solid rgba(16,185,129,0.2)" }}
          >
            <p className="font-bold text-sm" style={{ color: "#10b981" }}>
              🎉 You get ₹500 FREE in your wallet!
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div
            className="rounded-2xl p-4"
            style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Users size={14} style={{ color: "#3b82f6" }} />
              <span
                className="text-xs font-medium"
                style={{ color: "#475569" }}
              >
                Total Referrals
              </span>
            </div>
            {loadingStats ? (
              <div
                className="h-7 w-10 rounded-lg animate-pulse"
                style={{ background: "#e2e8f0" }}
                data-ocid="referral.loading_state"
              />
            ) : (
              <p className="text-2xl font-bold" style={{ color: "#3b82f6" }}>
                {totalReferrals}
              </p>
            )}
            <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
              Friends joined
            </p>
          </div>
          <div
            className="rounded-2xl p-4"
            style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={14} style={{ color: "#10b981" }} />
              <span
                className="text-xs font-medium"
                style={{ color: "#475569" }}
              >
                Total Earned
              </span>
            </div>
            {loadingStats ? (
              <div
                className="h-7 w-16 rounded-lg animate-pulse"
                style={{ background: "#e2e8f0" }}
                data-ocid="referral.loading_state"
              />
            ) : (
              <p className="text-2xl font-bold" style={{ color: "#10b981" }}>
                ₹{totalEarnings}
              </p>
            )}
            <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
              Referral earnings
            </p>
          </div>
        </div>

        {/* Referral Link */}
        <div
          className="rounded-2xl p-4"
          style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
        >
          <h3 className="text-sm font-bold mb-3" style={{ color: "#0f172a" }}>
            Your Referral Link
          </h3>
          {referralLink ? (
            <>
              <div
                className="flex items-center gap-2 rounded-xl p-3 mb-3"
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                }}
              >
                <p
                  className="flex-1 text-xs font-mono truncate select-all"
                  style={{ color: "#475569" }}
                  data-ocid="referral.input"
                >
                  {referralLink}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="w-full py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-all active:scale-98"
                style={{
                  background: copied
                    ? "rgba(16,185,129,0.1)"
                    : "linear-gradient(135deg, #f97316, #fb923c)",
                  color: copied ? "#10b981" : "#ffffff",
                  border: copied ? "1px solid rgba(16,185,129,0.3)" : "none",
                  touchAction: "manipulation",
                  cursor: "pointer",
                }}
                data-ocid="referral.primary_button"
              >
                <Copy size={15} />
                {copied ? "✓ Link Copied!" : "Copy Referral Link"}
              </button>
              {copied && (
                <p
                  className="text-center text-xs mt-2"
                  style={{ color: "#10b981" }}
                  data-ocid="referral.success_state"
                >
                  Link copied! Share it with your friends now.
                </p>
              )}
            </>
          ) : (
            <div
              className="text-center py-4 text-sm"
              style={{ color: "#94a3b8" }}
              data-ocid="referral.loading_state"
            >
              Loading your referral link...
            </div>
          )}
        </div>

        {/* Terms */}
        <div
          className="rounded-2xl p-4"
          style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
        >
          <h3 className="text-sm font-bold mb-3" style={{ color: "#0f172a" }}>
            📋 Terms &amp; Conditions
          </h3>
          <ul className="space-y-2">
            {TERMS.map((item, index) => (
              <li
                key={item}
                className="flex items-start gap-2 text-xs"
                style={{ color: "#475569" }}
              >
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center font-bold flex-shrink-0 mt-0.5"
                  style={{
                    background: "rgba(249,115,22,0.1)",
                    color: "#f97316",
                    fontSize: "10px",
                    border: "1px solid rgba(249,115,22,0.2)",
                  }}
                >
                  {index + 1}
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <footer
          className="text-center text-xs pt-2"
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
    </div>
  );
}
