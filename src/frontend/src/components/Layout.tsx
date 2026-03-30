import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Bell,
  Home,
  TrendingUp,
  User,
  Wallet,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { path: "/", label: "Home", icon: Home },
  { path: "/wallet", label: "Wallet", icon: Wallet },
  { path: "/deposit", label: "Deposit", icon: ArrowDownToLine },
  { path: "/withdraw", label: "Withdraw", icon: ArrowUpFromLine },
  { path: "/profile", label: "Profile", icon: User },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Top Nav */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14"
        style={{ background: "#0F3B66" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "#F57C1F" }}
          >
            <TrendingUp size={18} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg">EarnHub</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell size={22} className="text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border border-white" />
          </div>
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 mt-14 mb-16 overflow-y-auto">
        <div className="max-w-lg mx-auto">{children}</div>
      </main>

      {/* Bottom Nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex"
        style={{ background: "#0F3B66", height: "64px" }}
      >
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className="flex-1 flex flex-col items-center justify-center gap-0.5"
            >
              <Icon
                size={22}
                style={{ color: active ? "#F57C1F" : "rgba(255,255,255,0.75)" }}
              />
              <span
                className="text-xs font-medium"
                style={{ color: active ? "#F57C1F" : "rgba(255,255,255,0.75)" }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
