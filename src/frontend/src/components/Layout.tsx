import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Bell,
  Gift,
  Home,
  Tag,
  TrendingUp,
  User,
  Wallet,
  X,
} from "lucide-react";
import { useState } from "react";
import { useLocation, useRouter } from "../hooks/useRouter";

const NAV_ITEMS = [
  { path: "/", label: "Home", icon: Home },
  { path: "/wallet", label: "Wallet", icon: Wallet },
  { path: "/deposit", label: "Deposit", icon: ArrowDownToLine },
  { path: "/withdraw", label: "Withdraw", icon: ArrowUpFromLine },
  { path: "/referral", label: "Referral", icon: Gift },
  { path: "/profile", label: "Profile", icon: User },
] as const;

type NavPath = (typeof NAV_ITEMS)[number]["path"];

const NOTIFICATIONS = [
  {
    id: 1,
    type: "offer",
    icon: Gift,
    title: "\uD83C\uDF81 Special Offer!",
    message:
      "Get the Premium Plan (\u20B91750) now and earn \u20B9750/day for 120 days! Limited time offer, act fast!",
    time: "Just now",
    color: "#F57C1F",
    bg: "#FFF3E0",
  },
  {
    id: 2,
    type: "offer",
    icon: Tag,
    title: "\uD83D\uDCB0 Double Earning Chance!",
    message:
      "Share your referral link and earn \u20B9500 FREE every time someone buys the Basic Plan \u2014 credited directly to your wallet!",
    time: "Today",
    color: "#388E3C",
    bg: "#E8F5E9",
  },
  {
    id: 3,
    type: "update",
    icon: Bell,
    title: "\uD83D\uDCE2 New Update",
    message:
      "Basic Plan update: Now earn \u20B9150/day with just \u20B9500 for 60 days. Invest today!",
    time: "Yesterday",
    color: "#0F3B66",
    bg: "#E3F2FD",
  },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const { navigate } = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [readIds, setReadIds] = useState<number[]>([]);

  const unreadCount = NOTIFICATIONS.filter(
    (n) => !readIds.includes(n.id),
  ).length;

  const markAllRead = () => {
    setReadIds(NOTIFICATIONS.map((n) => n.id));
  };

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
          {/* Clickable Bell */}
          <button
            type="button"
            onClick={() => setShowNotifications((prev) => !prev)}
            className="relative p-1 rounded-full active:bg-white/10 transition-colors"
            style={{
              background: showNotifications
                ? "rgba(255,255,255,0.15)"
                : "transparent",
            }}
            aria-label="Notifications"
            data-ocid="notifications.open_modal_button"
          >
            <Bell size={22} className="text-white" />
            {unreadCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 flex items-center justify-center rounded-full text-white font-bold border border-white"
                style={{
                  background: "#E53935",
                  fontSize: "9px",
                  minWidth: "16px",
                  height: "16px",
                  padding: "0 3px",
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
        </div>
      </header>

      {/* Notification Panel */}
      {showNotifications && (
        <>
          {/* Backdrop */}
          <button
            type="button"
            className="fixed inset-0 z-40 w-full h-full cursor-default"
            style={{ background: "transparent", border: "none" }}
            onClick={() => setShowNotifications(false)}
            aria-label="Close notifications"
          />
          {/* Panel */}
          <div
            className="fixed top-14 right-2 z-50 rounded-xl shadow-2xl overflow-hidden"
            style={{
              width: "calc(100vw - 16px)",
              maxWidth: "400px",
              background: "#fff",
              border: "1px solid #E0E0E0",
            }}
            data-ocid="notifications.modal"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ background: "#0F3B66" }}
            >
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-white" />
                <span className="text-white font-bold text-sm">
                  Notifications &amp; Offers
                </span>
                {unreadCount > 0 && (
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "#F57C1F", color: "#fff" }}
                  >
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="text-xs text-white/80 underline"
                    data-ocid="notifications.confirm_button"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowNotifications(false)}
                  aria-label="Close"
                  data-ocid="notifications.close_button"
                >
                  <X size={18} className="text-white" />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div
              className="divide-y divide-gray-100"
              style={{ maxHeight: "65vh", overflowY: "auto" }}
            >
              {NOTIFICATIONS.map((notif) => {
                const IconComp = notif.icon;
                const isRead = readIds.includes(notif.id);
                return (
                  <button
                    type="button"
                    key={notif.id}
                    className="flex gap-3 px-4 py-3 w-full text-left"
                    style={{
                      background: isRead ? "#fff" : notif.bg,
                      opacity: isRead ? 0.75 : 1,
                    }}
                    onClick={() => setReadIds((prev) => [...prev, notif.id])}
                    data-ocid="notifications.row"
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: notif.color }}
                    >
                      <IconComp size={16} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="font-bold text-sm"
                          style={{ color: notif.color }}
                        >
                          {notif.title}
                        </span>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {notif.time}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                        {notif.message}
                      </p>
                      {!isRead && (
                        <span
                          className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: notif.color, color: "#fff" }}
                        >
                          New
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div
              className="text-center py-2 text-xs"
              style={{ background: "#F5F5F5", color: "#888" }}
            >
              Special offers just for you 🎉
            </div>
          </div>
        </>
      )}

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
          const active = pathname === path;
          return (
            <button
              type="button"
              key={path}
              onClick={() => navigate(path as NavPath)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5"
              data-ocid="nav.link"
            >
              <Icon
                size={20}
                style={{
                  color: active ? "#F57C1F" : "rgba(255,255,255,0.75)",
                }}
              />
              <span
                className="font-medium"
                style={{
                  color: active ? "#F57C1F" : "rgba(255,255,255,0.75)",
                  fontSize: "10px",
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
