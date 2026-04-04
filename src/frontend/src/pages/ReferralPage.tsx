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
          background:
            "linear-gradient(135deg, oklch(0.25 0.08 250) 0%, oklch(0.17 0.016 260) 100%)",
        }}
      >
        <div
          className="absolute -right-8 -top-8 w-32 h-32 rounded-full"
          style={{ background: "rgba(255,107,0,0.08)" }}
        />
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #FF6B00, #FF9500)" }}
          >
            <Gift size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-white text-xl font-bold">Referral Program</h1>
            <p className="text-white/75 text-xs">Share &amp; Earn Together</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* FREE OFFER Banner */}
        <div
          className="rounded-2xl p-4 border"
          data-ocid="referral.panel"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.22 0.09 175), oklch(0.18 0.06 175))",
            borderColor: "rgba(0,201,167,0.25)",
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "rgba(0,201,167,0.2)",
                border: "1px solid rgba(0,201,167,0.3)",
              }}
            >
              <TrendingUp size={22} style={{ color: "#00C9A7" }} />
            </div>
            <div className="flex-1">
              <span
                className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-full mb-1.5"
                style={{
                  background: "rgba(255,107,0,0.2)",
                  color: "#FF6B00",
                  border: "1px solid rgba(255,107,0,0.3)",
                }}
              >
                🎁 FREE OFFER
              </span>
              <h2 className="text-white font-bold text-base leading-snug">
                Earn ₹500 Free on Every Referral!
              </h2>
              <p className="text-white/80 text-xs mt-1 leading-relaxed">
                Share your link. When your friend signs up and buys the{" "}
                <span className="font-bold text-white">Basic Plan (₹500)</span>,
                you get{" "}
                <span className="font-bold" style={{ color: "#00C9A7" }}>
                  ₹500 FREE
                </span>{" "}
                in your wallet.
              </p>
            </div>
          </div>
          <div
            className="mt-3 pt-3 grid grid-cols-3 gap-2"
            style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
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
                    background: "rgba(0,201,167,0.25)",
                    color: "#00C9A7",
                  }}
                >
                  {step}
                </div>
                <p className="text-white/80 text-xs leading-tight">{label}</p>
              </div>
            ))}
          </div>
          <div
            className="mt-2 pt-2 text-center"
            style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
          >
            <p className="font-bold text-sm" style={{ color: "#00C9A7" }}>
              🎉 You get ₹500 FREE in your wallet!
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div
            className="rounded-2xl p-4 border border-white/8"
            style={{ background: "oklch(0.17 0.016 260)" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Users size={14} style={{ color: "#4F8EF7" }} />
              <span
                className="text-xs font-medium"
                style={{ color: "#e5e7eb" }}
              >
                Total Referrals
              </span>
            </div>
            {loadingStats ? (
              <div
                className="h-7 w-10 rounded-lg animate-pulse"
                style={{ background: "rgba(255,255,255,0.08)" }}
                data-ocid="referral.loading_state"
              />
            ) : (
              <p className="text-2xl font-bold" style={{ color: "#4F8EF7" }}>
                {totalReferrals}
              </p>
            )}
            <p className="text-xs mt-0.5" style={{ color: "#e5e7eb" }}>
              Friends joined
            </p>
          </div>
          <div
            className="rounded-2xl p-4 border border-white/8"
            style={{ background: "oklch(0.17 0.016 260)" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={14} style={{ color: "#00C9A7" }} />
              <span
                className="text-xs font-medium"
                style={{ color: "#e5e7eb" }}
              >
                Total Earned
              </span>
            </div>
            {loadingStats ? (
              <div
                className="h-7 w-16 rounded-lg animate-pulse"
                style={{ background: "rgba(255,255,255,0.08)" }}
                data-ocid="referral.loading_state"
              />
            ) : (
              <p className="text-2xl font-bold" style={{ color: "#00C9A7" }}>
                ₹{totalEarnings}
              </p>
            )}
            <p className="text-xs mt-0.5" style={{ color: "#e5e7eb" }}>
              Referral earnings
            </p>
          </div>
        </div>

        {/* Referral Link */}
        <div
          className="rounded-2xl p-4 border border-white/8"
          style={{ background: "oklch(0.17 0.016 260)" }}
        >
          <h3 className="text-sm font-bold text-foreground mb-3">
            Your Referral Link
          </h3>
          {referralLink ? (
            <>
              <div
                className="flex items-center gap-2 rounded-xl p-3 mb-3"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <p
                  className="flex-1 text-xs font-mono truncate select-all"
                  style={{ color: "#e5e7eb" }}
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
                    ? "rgba(0,201,167,0.2)"
                    : "linear-gradient(135deg, #FF6B00, #FF9500)",
                  color: copied ? "#00C9A7" : "#0D1117",
                  border: copied ? "1px solid rgba(0,201,167,0.4)" : "none",
                }}
                data-ocid="referral.primary_button"
              >
                <Copy size={15} />
                {copied ? "✓ Link Copied!" : "Copy Referral Link"}
              </button>
              {copied && (
                <p
                  className="text-center text-xs mt-2"
                  style={{ color: "#00C9A7" }}
                  data-ocid="referral.success_state"
                >
                  Link copied! Share it with your friends now.
                </p>
              )}
            </>
          ) : (
            <div
              className="text-center py-4 text-sm"
              style={{ color: "#e5e7eb" }}
              data-ocid="referral.loading_state"
            >
              Loading your referral link...
            </div>
          )}
        </div>

        {/* Terms */}
        <div
          className="rounded-2xl p-4 border border-white/8"
          style={{ background: "oklch(0.17 0.016 260)" }}
        >
          <h3 className="text-sm font-bold text-foreground mb-3">
            📋 Terms &amp; Conditions
          </h3>
          <ul className="space-y-2">
            {TERMS.map((item, index) => (
              <li
                key={item}
                className="flex items-start gap-2 text-xs"
                style={{ color: "#e5e7eb" }}
              >
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 mt-0.5"
                  style={{
                    background: "rgba(255,107,0,0.2)",
                    color: "#FF6B00",
                    fontSize: "10px",
                    border: "1px solid rgba(255,107,0,0.3)",
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
          style={{ color: "rgba(255,255,255,0.45)" }}
        >
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white/70 transition-colors"
          >
            caffeine.ai
          </a>
        </footer>
      </div>
    </div>
  );
}
