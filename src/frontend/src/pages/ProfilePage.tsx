import { Calendar, LogOut, Phone, Shield, Star, User } from "lucide-react";
import { useEffect, useState } from "react";
import type { Plan, UserProfile } from "../backend";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useNavigate } from "../hooks/useRouter";

export default function ProfilePage() {
  const { actor } = useActor();
  const { clear, identity } = useInternetIdentity();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const mobile = localStorage.getItem("earnhub_mobile") || "Member";

  useEffect(() => {
    if (!actor) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([
      actor
        .getCallerUserProfile()
        .then((p) => {
          if (p) setProfile(p);
        })
        .catch(() => {}),
      actor
        .getAllPlans()
        .then(setPlans)
        .catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [actor]);

  const activePlan =
    profile?.activePlan && plans.length > 0
      ? plans.find((p) => p.id === profile.activePlan!.planId)
      : null;
  const joinDate = profile?.joinDate
    ? new Date(Number(profile.joinDate / 1000000n)).toLocaleDateString(
        "en-IN",
        { day: "2-digit", month: "short", year: "numeric" },
      )
    : "—";
  const daysRemaining =
    activePlan && profile?.activePlan
      ? Math.max(
          0,
          Number(activePlan.validityDays) -
            Math.floor(
              (Date.now() * 1e6 - Number(profile.activePlan.activatedAt)) /
                (86400 * 1e15),
            ),
        )
      : 0;
  const principal = identity?.getPrincipal().toText() ?? "";
  const shortPrincipal = principal
    ? `${principal.slice(0, 8)}...${principal.slice(-6)}`
    : "—";

  const handleLogout = () => {
    localStorage.removeItem("earnhub_mobile");
    clear();
    navigate("/auth", { replace: true });
  };

  return (
    <div className="px-4 py-5 pb-8">
      <h1 className="text-2xl font-bold mb-5" style={{ color: "#0f172a" }}>
        Profile
      </h1>

      {/* Avatar + Name */}
      <div className="flex flex-col items-center mb-6">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-3 relative"
          style={{
            background: "linear-gradient(135deg, #1e40af, #f97316)",
          }}
        >
          <User size={34} className="text-white" />
          <div
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: "#f97316" }}
          >
            <Shield size={12} className="text-white" />
          </div>
        </div>
        <p className="text-lg font-bold" style={{ color: "#0f172a" }}>
          {mobile}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
          EarnHub Member
        </p>
      </div>

      {/* Info Cards */}
      <div className="space-y-3 mb-6">
        <div
          className="rounded-2xl p-4 flex items-center gap-3"
          style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(59,130,246,0.1)" }}
          >
            <Phone size={16} style={{ color: "#3b82f6" }} />
          </div>
          <div>
            <p className="text-xs" style={{ color: "#94a3b8" }}>
              Mobile Number
            </p>
            <p className="text-sm font-semibold" style={{ color: "#0f172a" }}>
              {mobile}
            </p>
          </div>
        </div>

        <div
          className="rounded-2xl p-4 flex items-center gap-3"
          style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(16,185,129,0.1)" }}
          >
            <Calendar size={16} style={{ color: "#10b981" }} />
          </div>
          <div>
            <p className="text-xs" style={{ color: "#94a3b8" }}>
              Member Since
            </p>
            <p className="text-sm font-semibold" style={{ color: "#0f172a" }}>
              {loading ? "—" : joinDate}
            </p>
          </div>
        </div>

        <div
          className="rounded-2xl p-4 flex items-center gap-3"
          style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(249,115,22,0.1)" }}
          >
            <Star size={16} style={{ color: "#f97316" }} />
          </div>
          <div className="flex-1">
            <p className="text-xs" style={{ color: "#94a3b8" }}>
              Active Plan
            </p>
            {activePlan ? (
              <>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "#0f172a" }}
                >
                  {activePlan.name}
                </p>
                <p className="text-xs" style={{ color: "#475569" }}>
                  ₹{Number(activePlan.dailyEarning)}/day · {daysRemaining} days
                  remaining
                </p>
              </>
            ) : (
              <p className="text-sm font-semibold" style={{ color: "#94a3b8" }}>
                No active plan
              </p>
            )}
          </div>
        </div>

        {principal && (
          <div
            className="rounded-2xl p-4"
            style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
          >
            <p className="text-xs mb-1" style={{ color: "#94a3b8" }}>
              Principal ID
            </p>
            <p
              className="text-xs font-mono break-all"
              style={{ color: "#475569" }}
            >
              {shortPrincipal}
            </p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-98"
        style={{
          background: "rgba(239,68,68,0.08)",
          color: "#ef4444",
          border: "1px solid rgba(239,68,68,0.2)",
          touchAction: "manipulation",
          cursor: "pointer",
        }}
        data-ocid="profile.delete_button"
      >
        <LogOut size={16} />
        Logout
      </button>

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
