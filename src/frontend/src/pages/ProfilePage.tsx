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
      <h1 className="text-2xl font-bold text-foreground mb-5">Profile</h1>

      {/* Avatar + Name */}
      <div className="flex flex-col items-center mb-6">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-3 relative"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.28 0.10 250), oklch(0.35 0.14 43))",
          }}
        >
          <User size={34} className="text-white" />
          <div
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: "#FF6B00" }}
          >
            <Shield size={12} className="text-white" />
          </div>
        </div>
        <p className="text-lg font-bold text-foreground">{mobile}</p>
        <p className="text-xs text-muted-foreground mt-0.5">EarnHub Member</p>
      </div>

      {/* Info Cards */}
      <div className="space-y-3 mb-6">
        <div
          className="rounded-2xl p-4 border border-white/8 flex items-center gap-3"
          style={{ background: "oklch(0.17 0.016 260)" }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(79,142,247,0.15)" }}
          >
            <Phone size={16} style={{ color: "#4F8EF7" }} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Mobile Number</p>
            <p className="text-sm font-semibold text-foreground">{mobile}</p>
          </div>
        </div>

        <div
          className="rounded-2xl p-4 border border-white/8 flex items-center gap-3"
          style={{ background: "oklch(0.17 0.016 260)" }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(0,201,167,0.15)" }}
          >
            <Calendar size={16} style={{ color: "#00C9A7" }} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Member Since</p>
            <p className="text-sm font-semibold text-foreground">
              {loading ? "—" : joinDate}
            </p>
          </div>
        </div>

        <div
          className="rounded-2xl p-4 border border-white/8 flex items-center gap-3"
          style={{ background: "oklch(0.17 0.016 260)" }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(255,107,0,0.15)" }}
          >
            <Star size={16} style={{ color: "#FF6B00" }} />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Active Plan</p>
            {activePlan ? (
              <>
                <p className="text-sm font-semibold text-foreground">
                  {activePlan.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  ₹{Number(activePlan.dailyEarning)}/day · {daysRemaining} days
                  remaining
                </p>
              </>
            ) : (
              <p className="text-sm font-semibold text-muted-foreground">
                No active plan
              </p>
            )}
          </div>
        </div>

        {principal && (
          <div
            className="rounded-2xl p-4 border border-white/8"
            style={{ background: "oklch(0.17 0.016 260)" }}
          >
            <p className="text-xs text-muted-foreground mb-1">Principal ID</p>
            <p className="text-xs font-mono text-foreground/70 break-all">
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
          background: "rgba(255,85,85,0.15)",
          color: "#FF5555",
          border: "1px solid rgba(255,85,85,0.25)",
        }}
        data-ocid="profile.delete_button"
      >
        <LogOut size={16} />
        Logout
      </button>

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
