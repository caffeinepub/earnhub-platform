import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Bell,
  Gift,
  Home,
  Tag,
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
    color: "#FF6B00",
    bg: "rgba(255,107,0,0.12)",
  },
  {
    id: 2,
    icon: "⚡",
    title: "Double Earning Week!",
    message:
      "Standard plan members: share your link and earn ₹500 FREE for every referral this week!",
    time: "Today",
    color: "#00C9A7",
    bg: "rgba(0,201,167,0.12)",
  },
  {
    id: 3,
    icon: "✅",
    title: "Basic Plan Updated!",
    message:
      "Basic Plan now earns ₹150/day for 60 days with just ₹500 investment. Invest today!",
    time: "Yesterday",
    color: "#4F8EF7",
    bg: "rgba(79,142,247,0.12)",
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
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14 border-b border-white/8"
        style={{
          background: "oklch(0.17 0.016 260 / 0.98)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #FF6B00, #FF9500)" }}
          >
            <span className="text-white text-sm font-bold">₹</span>
          </div>
          <span className="font-display font-bold text-lg text-foreground tracking-tight">
            EarnHub
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowNotifications((prev) => !prev)}
            className="relative p-2 rounded-xl transition-colors active:scale-95"
            style={{
              background: showNotifications
                ? "rgba(255,107,0,0.15)"
                : "rgba(255,255,255,0.06)",
            }}
            aria-label="Notifications"
            data-ocid="notifications.open_modal_button"
          >
            <Bell size={19} className="text-foreground" />
            {unreadCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 flex items-center justify-center rounded-full text-white font-bold"
                style={{
                  background: "#FF6B00",
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
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <User size={15} className="text-foreground/70" />
          </div>
        </div>
      </header>

      {/* Notification Panel */}
      {showNotifications && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 w-full h-full cursor-default"
            style={{ background: "rgba(0,0,0,0.5)", border: "none" }}
            onClick={() => setShowNotifications(false)}
            aria-label="Close notifications"
          />
          <div
            className="fixed top-14 right-2 z-50 rounded-2xl shadow-2xl overflow-hidden animate-fade-in"
            style={{
              width: "calc(100vw - 16px)",
              maxWidth: "400px",
              background: "oklch(0.20 0.018 260)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            data-ocid="notifications.modal"
          >
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="flex items-center gap-2">
                <Bell size={15} className="text-primary" />
                <span className="text-foreground font-bold text-sm">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(255,107,0,0.2)",
                      color: "#FF6B00",
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
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
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
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>
            </div>

            <div
              className="divide-y divide-white/5"
              style={{
                maxHeight: "65vh",
                overflowY: "auto",
              }}
            >
              {NOTIFICATIONS.map((notif) => {
                const isRead = readIds.includes(notif.id);
                return (
                  <button
                    type="button"
                    key={notif.id}
                    className="flex gap-3 px-4 py-3.5 w-full text-left transition-colors hover:bg-white/5"
                    style={{
                      background: isRead ? "transparent" : notif.bg,
                      opacity: isRead ? 0.65 : 1,
                    }}
                    onClick={() => setReadIds((prev) => [...prev, notif.id])}
                    data-ocid="notifications.row"
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-base"
                      style={{
                        background: `${notif.color}20`,
                        border: `1px solid ${notif.color}40`,
                      }}
                    >
                      {notif.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-sm text-foreground">
                          {notif.title}
                        </span>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {notif.time}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {notif.message}
                      </p>
                      {!isRead && (
                        <span
                          className="inline-block mt-1.5 text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{
                            background: `${notif.color}20`,
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
              className="text-center py-2.5 text-xs text-muted-foreground"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
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
        className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-white/8"
        style={{
          background: "oklch(0.17 0.016 260 / 0.98)",
          backdropFilter: "blur(12px)",
          height: "64px",
        }}
      >
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const active = pathname === path;
          return (
            <button
              type="button"
              key={path}
              onClick={() => navigate(path as NavPath)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95"
              data-ocid="nav.link"
            >
              <div
                className={`p-1.5 rounded-lg transition-colors ${active ? "bg-primary/15" : ""}`}
              >
                <Icon
                  size={18}
                  style={{
                    color: active ? "#FF6B00" : "rgba(255,255,255,0.55)",
                  }}
                />
              </div>
              <span
                className="font-medium"
                style={{
                  color: active ? "#FF6B00" : "rgba(255,255,255,0.55)",
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
