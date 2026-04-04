import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Bell,
  Gift,
  Home,
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
    icon: "🎉",
    title: "Special Offer!",
    message:
      "Join Premium plan and earn ₹750/day for 120 days! Limited time offer.",
    time: "Just now",
    color: "#f97316",
    bg: "rgba(249,115,22,0.08)",
  },
  {
    id: 2,
    icon: "⚡",
    title: "Double Earning Week!",
    message:
      "Standard plan members: share your link and earn ₹500 FREE for every referral this week!",
    time: "Today",
    color: "#10b981",
    bg: "rgba(16,185,129,0.08)",
  },
  {
    id: 3,
    icon: "✅",
    title: "Basic Plan Updated!",
    message:
      "Basic Plan now earns ₹150/day for 60 days with just ₹500 investment. Invest today!",
    time: "Yesterday",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.08)",
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

  const markAllRead = () => setReadIds(NOTIFICATIONS.map((n) => n.id));

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Top Nav */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14 border-b border-gray-200"
        style={{
          background: "#ffffff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #f97316, #fb923c)" }}
          >
            <span className="text-white text-sm font-bold">₹</span>
          </div>
          <span
            className="font-display font-bold text-lg tracking-tight"
            style={{ color: "#0f172a" }}
          >
            EarnHub
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowNotifications((prev) => !prev)}
            className="relative p-2 rounded-xl transition-colors"
            style={{
              background: showNotifications
                ? "rgba(249,115,22,0.1)"
                : "#f1f5f9",
              cursor: "pointer",
              touchAction: "manipulation",
              minWidth: "44px",
              minHeight: "44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Notifications"
            data-ocid="notifications.open_modal_button"
          >
            <Bell size={19} style={{ color: "#475569" }} />
            {unreadCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 flex items-center justify-center rounded-full text-white font-bold"
                style={{
                  background: "#f97316",
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
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "#f1f5f9" }}
          >
            <User size={15} style={{ color: "#94a3b8" }} />
          </div>
        </div>
      </header>

      {/* Notification Panel */}
      {showNotifications && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 w-full h-full cursor-default"
            style={{ background: "rgba(0,0,0,0.3)", border: "none" }}
            onClick={() => setShowNotifications(false)}
            aria-label="Close notifications"
          />
          <div
            className="fixed top-14 right-2 z-50 rounded-2xl shadow-xl overflow-hidden"
            style={{
              width: "calc(100vw - 16px)",
              maxWidth: "400px",
              background: "#ffffff",
              border: "1px solid #e2e8f0",
            }}
            data-ocid="notifications.modal"
          >
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: "1px solid #e2e8f0" }}
            >
              <div className="flex items-center gap-2">
                <Bell size={15} style={{ color: "#f97316" }} />
                <span
                  className="font-bold text-sm"
                  style={{ color: "#0f172a" }}
                >
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(249,115,22,0.1)",
                      color: "#f97316",
                    }}
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
                    className="text-xs hover:underline"
                    style={{
                      touchAction: "manipulation",
                      cursor: "pointer",
                      color: "#94a3b8",
                    }}
                    data-ocid="notifications.confirm_button"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowNotifications(false)}
                  aria-label="Close"
                  style={{
                    touchAction: "manipulation",
                    cursor: "pointer",
                    padding: "4px",
                  }}
                  data-ocid="notifications.close_button"
                >
                  <X size={16} style={{ color: "#94a3b8" }} />
                </button>
              </div>
            </div>

            <div
              className="divide-y divide-gray-100"
              style={{ maxHeight: "65vh", overflowY: "auto" }}
            >
              {NOTIFICATIONS.map((notif) => {
                const isRead = readIds.includes(notif.id);
                return (
                  <button
                    type="button"
                    key={notif.id}
                    className="flex gap-3 px-4 py-3.5 w-full text-left transition-colors hover:bg-gray-50"
                    style={{
                      background: isRead ? "transparent" : notif.bg,
                      opacity: isRead ? 0.65 : 1,
                      touchAction: "manipulation",
                      cursor: "pointer",
                    }}
                    onClick={() => setReadIds((prev) => [...prev, notif.id])}
                    data-ocid="notifications.row"
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-base"
                      style={{
                        background: `${notif.color}15`,
                        border: `1px solid ${notif.color}30`,
                      }}
                    >
                      {notif.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="font-semibold text-sm"
                          style={{ color: "#0f172a" }}
                        >
                          {notif.title}
                        </span>
                        <span
                          className="text-xs flex-shrink-0"
                          style={{ color: "#94a3b8" }}
                        >
                          {notif.time}
                        </span>
                      </div>
                      <p
                        className="text-xs mt-0.5 leading-relaxed"
                        style={{ color: "#475569" }}
                      >
                        {notif.message}
                      </p>
                      {!isRead && (
                        <span
                          className="inline-block mt-1.5 text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{
                            background: `${notif.color}15`,
                            color: notif.color,
                          }}
                        >
                          New
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            <div
              className="text-center py-2.5 text-xs"
              style={{ borderTop: "1px solid #e2e8f0", color: "#94a3b8" }}
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
        className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-gray-200"
        style={{
          background: "#ffffff",
          boxShadow: "0 -1px 3px rgba(0,0,0,0.06)",
          height: "64px",
          willChange: "transform",
        }}
      >
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const active = pathname === path;
          return (
            <button
              type="button"
              key={path}
              onClick={() => navigate(path as NavPath)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5"
              style={{
                cursor: "pointer",
                touchAction: "manipulation",
                WebkitTapHighlightColor: "transparent",
                outline: "none",
                border: "none",
                background: "transparent",
                minHeight: "44px",
              }}
              data-ocid="nav.link"
            >
              <div
                className={`p-1.5 rounded-lg transition-colors ${active ? "bg-orange-50" : ""}`}
              >
                <Icon
                  size={18}
                  style={{
                    color: active ? "#f97316" : "#94a3b8",
                  }}
                />
              </div>
              <span
                className="font-medium"
                style={{
                  color: active ? "#f97316" : "#94a3b8",
                  fontSize: "9px",
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
