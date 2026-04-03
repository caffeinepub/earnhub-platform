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
      .then((data) => {
        setStats(data);
      })
      .catch(() => {
        setStats({ totalReferrals: BigInt(0), totalEarnings: BigInt(0) });
      })
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
        // Fallback for older mobile browsers
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
    <div className="min-h-full bg-gray-50 pb-6">
      {/* Page Header */}
      <div
        className="px-4 pt-5 pb-6"
        style={{
          background: "linear-gradient(135deg, #0F3B66 0%, #1a5a9a 100%)",
        }}
      >
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "#F57C1F" }}
          >
            <Gift size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-white text-xl font-bold">Referral Program</h1>
            <p className="text-white/70 text-xs">Share &amp; Earn Together</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-3 space-y-4">
        {/* FREE OFFER Banner */}
        <div
          className="rounded-2xl p-4 shadow-md"
          style={{
            background: "linear-gradient(135deg, #18A6A0 0%, #0d7a75 100%)",
          }}
          data-ocid="referral.panel"
        >
          <div className="flex items-start gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.2)" }}
            >
              <TrendingUp size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "#F57C1F", color: "#fff" }}
                >
                  🎁 FREE OFFER
                </span>
              </div>
              <h2 className="text-white font-bold text-base leading-snug">
                Earn ₹500 Free on Every Referral!
              </h2>
              <p className="text-white/85 text-xs mt-1 leading-relaxed">
                Share your referral link with friends. When your friend signs up
                using your link and buys the{" "}
                <span className="font-bold text-white">Basic Plan (₹500)</span>,
                you get <span className="font-bold text-white">₹500 FREE</span>{" "}
                credited directly to your wallet — no conditions, no waiting!
              </p>
            </div>
          </div>
          {/* Steps */}
          <div
            className="mt-3 pt-3 grid grid-cols-3 gap-2"
            style={{ borderTop: "1px solid rgba(255,255,255,0.2)" }}
          >
            {[
              { step: "1", label: "Copy & share your link" },
              { step: "2", label: "Friend signs up via link" },
              { step: "3", label: "Friend buys ₹500 plan" },
            ].map(({ step, label }) => (
              <div
                key={step}
                className="flex flex-col items-center text-center"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center mb-1 text-sm font-bold"
                  style={{
                    background: "rgba(255,255,255,0.25)",
                    color: "#fff",
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
            style={{ borderTop: "1px solid rgba(255,255,255,0.2)" }}
          >
            <p className="text-white font-bold text-sm">
              🎉 You get ₹500 FREE in your wallet!
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Users size={16} style={{ color: "#0F3B66" }} />
              <span className="text-xs text-gray-500 font-medium">
                Total Referrals
              </span>
            </div>
            {loadingStats ? (
              <div
                className="h-7 w-12 rounded animate-pulse"
                style={{ background: "#E0E0E0" }}
                data-ocid="referral.loading_state"
              />
            ) : (
              <p className="text-2xl font-bold" style={{ color: "#0F3B66" }}>
                {totalReferrals}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-0.5">Friends joined</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={16} style={{ color: "#18A6A0" }} />
              <span className="text-xs text-gray-500 font-medium">
                Total Earned
              </span>
            </div>
            {loadingStats ? (
              <div
                className="h-7 w-20 rounded animate-pulse"
                style={{ background: "#E0E0E0" }}
                data-ocid="referral.loading_state"
              />
            ) : (
              <p className="text-2xl font-bold" style={{ color: "#18A6A0" }}>
                ₹{totalEarnings}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-0.5">Referral earnings</p>
          </div>
        </div>

        {/* Referral Link Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 mb-3">
            Your Referral Link
          </h3>
          {referralLink ? (
            <>
              <div
                className="flex items-center gap-2 rounded-xl border p-3 mb-3"
                style={{ background: "#F8F9FA", borderColor: "#E0E0E0" }}
              >
                <p
                  className="flex-1 text-xs font-mono text-gray-600 truncate select-all"
                  data-ocid="referral.input"
                >
                  {referralLink}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="w-full py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-all active:scale-95"
                style={{
                  background: copied ? "#18A6A0" : "#0F3B66",
                  color: "#fff",
                }}
                data-ocid="referral.primary_button"
              >
                <Copy size={16} />
                {copied ? "✓ Link Copied!" : "Copy Referral Link"}
              </button>
              {copied && (
                <p
                  className="text-center text-xs mt-2"
                  style={{ color: "#18A6A0" }}
                  data-ocid="referral.success_state"
                >
                  Link copied! Share it with your friends now.
                </p>
              )}
            </>
          ) : (
            <div
              className="text-center py-4 text-sm text-gray-400"
              data-ocid="referral.loading_state"
            >
              Loading your referral link...
            </div>
          )}
        </div>

        {/* Terms */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 mb-3">
            📋 Terms &amp; Conditions
          </h3>
          <ul className="space-y-2">
            {TERMS.map((item, index) => (
              <li
                key={item}
                className="flex items-start gap-2 text-xs text-gray-600"
              >
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 mt-0.5"
                  style={{ background: "#0F3B66", fontSize: "10px" }}
                >
                  {index + 1}
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-gray-400 pt-4">
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
    </div>
  );
}
