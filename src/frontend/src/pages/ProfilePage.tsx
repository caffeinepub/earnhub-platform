import { Calendar, LogOut, Phone, Star, User } from "lucide-react";
import { useEffect, useState } from "react";
import type { Plan, UserProfile } from "../backend";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useNavigate } from "../hooks/useRouter";

export default function ProfilePage() {
  const { actor } = useActor();
  const { clear } = useInternetIdentity();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const mobile = localStorage.getItem("earnhub_mobile") || "—";

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

  const handleLogout = () => {
    localStorage.removeItem("earnhub_mobile");
    clear();
    navigate("/auth", { replace: true });
  };

  return (
    <div className="px-4 py-5 pb-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-5">Profile</h1>
      <div className="flex flex-col items-center mb-6">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-3"
          style={{ background: "linear-gradient(135deg, #0F3B66, #2F73C8)" }}
        >
          <User size={36} className="text-white" />
        </div>
        <p className="text-lg font-bold text-gray-900">{mobile}</p>
        <p className="text-sm text-gray-500">EarnHub Member</p>
      </div>
      <div className="space-y-3 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "#E8F4FD" }}
          >
            <Phone size={18} style={{ color: "#2F73C8" }} />
          </div>
          <div>
            <p className="text-xs text-gray-500">Mobile Number</p>
            <p className="text-sm font-semibold text-gray-900">{mobile}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "#E8F5E9" }}
          >
            <Calendar size={18} className="text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Member Since</p>
            <p className="text-sm font-semibold text-gray-900">
              {loading ? "—" : joinDate}
            </p>
          </div>
        </div>
        {activePlan ? (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "#FFF3E0" }}
            >
              <Star size={18} style={{ color: "#F57C1F" }} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Active Plan</p>
              <p className="text-sm font-semibold text-gray-900">
                {activePlan.name}
              </p>
              <p className="text-xs text-gray-500">
                ₹{Number(activePlan.dailyEarning)}/day • {daysRemaining} days
                remaining
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100">
              <Star size={18} className="text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Active Plan</p>
              <p className="text-sm font-semibold text-gray-500">
                No active plan
              </p>
            </div>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white"
        style={{ background: "#d32f2f" }}
        data-ocid="profile.delete_button"
      >
        <LogOut size={18} />
        Logout
      </button>

      {/* Footer */}
      <footer className="mt-12 text-center text-xs text-gray-400">
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
  );
}
