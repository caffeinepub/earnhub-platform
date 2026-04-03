import {
  CheckCircle,
  Copy,
  LogOut,
  Plus,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  type DepositRequest,
  type PaymentSubmission,
  type Plan,
  Variant_pending_approved_rejected,
  Variant_pending_completed_rejected,
  type WithdrawalRequest,
} from "../backend";
import { useActor } from "../hooks/useActor";

type Tab = "payments" | "withdrawals" | "deposits" | "plans";

const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";

function Badge({
  label,
  color,
  bg,
}: { label: string; color: string; bg: string }) {
  return (
    <span
      className="px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ color, background: bg }}
    >
      {label}
    </span>
  );
}

function StatusPAR({ status }: { status: Variant_pending_approved_rejected }) {
  const map = {
    [Variant_pending_approved_rejected.approved]: {
      label: "Approved",
      color: "#00C9A7",
      bg: "rgba(0,201,167,0.15)",
    },
    [Variant_pending_approved_rejected.rejected]: {
      label: "Rejected",
      color: "#FF5555",
      bg: "rgba(255,85,85,0.15)",
    },
    [Variant_pending_approved_rejected.pending]: {
      label: "Pending",
      color: "#FF9500",
      bg: "rgba(255,149,0,0.15)",
    },
  };
  const s = map[status] ?? map[Variant_pending_approved_rejected.pending];
  return <Badge {...s} />;
}

function StatusPCR({ status }: { status: Variant_pending_completed_rejected }) {
  const map = {
    [Variant_pending_completed_rejected.completed]: {
      label: "Completed",
      color: "#00C9A7",
      bg: "rgba(0,201,167,0.15)",
    },
    [Variant_pending_completed_rejected.rejected]: {
      label: "Rejected",
      color: "#FF5555",
      bg: "rgba(255,85,85,0.15)",
    },
    [Variant_pending_completed_rejected.pending]: {
      label: "Pending",
      color: "#FF9500",
      bg: "rgba(255,149,0,0.15)",
    },
  };
  const s = map[status] ?? map[Variant_pending_completed_rejected.pending];
  return <Badge {...s} />;
}

function shortPrincipal(p: { toString(): string }) {
  const s = p.toString();
  return s.length > 16 ? `${s.slice(0, 8)}...${s.slice(-6)}` : s;
}

export default function AdminPage() {
  const { actor } = useActor();
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => sessionStorage.getItem("admin_auth") === "true",
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [tab, setTab] = useState<Tab>("payments");

  const [payments, setPayments] = useState<PaymentSubmission[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [planEdits, setPlanEdits] = useState<Record<string, Plan>>({});
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const [showAddPlan, setShowAddPlan] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: "",
    price: "",
    dailyEarning: "",
    validityDays: "",
  });
  const [addingPlan, setAddingPlan] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!actor) return;
    setLoading(true);
    try {
      const [p, w, d, pl] = await Promise.all([
        actor.getAllPaymentSubmissions(),
        actor.getAllWithdrawalRequests(),
        actor.getAllDepositRequests(),
        actor.getAllPlans(),
      ]);
      setPayments(p);
      setWithdrawals(w);
      setDeposits(d);
      setPlans(pl);
      const edits: Record<string, Plan> = {};
      for (const plan of pl) edits[plan.id.toString()] = { ...plan };
      setPlanEdits(edits);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    if (isLoggedIn && actor) fetchAll();
  }, [isLoggedIn, actor, fetchAll]);

  const handleLogin = () => {
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      sessionStorage.setItem("admin_auth", "true");
      setIsLoggedIn(true);
      setLoginError("");
    } else {
      setLoginError("Invalid credentials");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth");
    setIsLoggedIn(false);
  };

  const doAction = async (key: string, fn: () => Promise<void>) => {
    setActionLoading(key);
    try {
      await fn();
      await fetchAll();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const savePlan = async (plan: Plan) => {
    if (!actor) return;
    const key = `save-${plan.id.toString()}`;
    setActionLoading(key);
    try {
      await actor.updatePlan(
        plan.id,
        plan.name,
        plan.price,
        plan.dailyEarning,
        plan.validityDays,
      );
      setSaveMsg(`Plan "${plan.name}" updated!`);
      setTimeout(() => setSaveMsg(null), 3000);
      await fetchAll();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const addNewPlan = async () => {
    if (
      !actor ||
      !newPlan.name ||
      !newPlan.price ||
      !newPlan.dailyEarning ||
      !newPlan.validityDays
    )
      return;
    setAddingPlan(true);
    try {
      await actor.addPlan(
        newPlan.name,
        BigInt(Number.parseInt(newPlan.price)),
        BigInt(Number.parseInt(newPlan.dailyEarning)),
        BigInt(Number.parseInt(newPlan.validityDays)),
      );
      setNewPlan({ name: "", price: "", dailyEarning: "", validityDays: "" });
      setShowAddPlan(false);
      await fetchAll();
    } catch (e) {
      console.error(e);
    } finally {
      setAddingPlan(false);
    }
  };

  const copyUpi = (upiId: string) => {
    navigator.clipboard.writeText(upiId).catch(() => {
      const el = document.createElement("textarea");
      el.value = upiId;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    });
    setCopiedUpi(upiId);
    setTimeout(() => setCopiedUpi(null), 2000);
  };

  const inputClass =
    "w-full px-3 py-2.5 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50";
  const inputStyle = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
  };

  // ─── Login Screen ────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div
          className="w-full max-w-sm rounded-2xl p-6 border border-white/8"
          style={{ background: "oklch(0.17 0.016 260)" }}
        >
          <div className="flex flex-col items-center mb-6">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
              style={{
                background: "linear-gradient(135deg, #FF6B00, #FF9500)",
              }}
            >
              <span className="text-white text-2xl">🔑</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-xs text-muted-foreground mt-1">
              EarnHub Management
            </p>
          </div>
          <div className="space-y-3">
            <div>
              <label
                htmlFor="admin-user"
                className="text-sm font-medium text-foreground/80"
              >
                Username
              </label>
              <input
                id="admin-user"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className={`mt-1.5 ${inputClass}`}
                style={inputStyle}
                data-ocid="admin.input"
              />
            </div>
            <div>
              <label
                htmlFor="admin-pass"
                className="text-sm font-medium text-foreground/80"
              >
                Password
              </label>
              <input
                id="admin-pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className={`mt-1.5 ${inputClass}`}
                style={inputStyle}
                data-ocid="admin.input"
              />
            </div>
            {loginError && (
              <p
                className="text-sm"
                style={{ color: "#FF5555" }}
                data-ocid="admin.error_state"
              >
                {loginError}
              </p>
            )}
            <button
              type="button"
              onClick={handleLogin}
              className="w-full py-3 rounded-xl font-semibold text-sm"
              style={{
                background: "linear-gradient(135deg, #FF6B00, #FF9500)",
                color: "#0D1117",
              }}
              data-ocid="admin.primary_button"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Dashboard ────────────────────────────────────────────────
  const TABS: { key: Tab; label: string; count?: number }[] = [
    {
      key: "payments",
      label: "Purchases",
      count: payments.filter(
        (p) => p.status === Variant_pending_approved_rejected.pending,
      ).length,
    },
    {
      key: "deposits",
      label: "Deposits",
      count: deposits.filter(
        (d) => d.status === Variant_pending_approved_rejected.pending,
      ).length,
    },
    {
      key: "withdrawals",
      label: "Withdrawals",
      count: withdrawals.filter(
        (w) => w.status === Variant_pending_completed_rejected.pending,
      ).length,
    },
    { key: "plans", label: "Plans" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header
        className="flex items-center justify-between px-4 h-14 border-b border-white/8"
        style={{
          background: "oklch(0.17 0.016 260 / 0.98)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #FF6B00, #FF9500)" }}
          >
            <span className="text-white text-sm">🔑</span>
          </div>
          <span className="font-bold text-foreground">Admin Panel</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchAll}
            className="p-2 rounded-xl transition-colors"
            style={{ background: "rgba(255,255,255,0.06)" }}
            data-ocid="admin.secondary_button"
          >
            <RefreshCw
              size={15}
              className={`text-muted-foreground ${loading ? "animate-spin" : ""}`}
            />
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
            style={{ background: "rgba(255,85,85,0.12)", color: "#FF5555" }}
            data-ocid="admin.delete_button"
          >
            <LogOut size={13} /> Logout
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div
        className="flex gap-1 px-4 py-3 overflow-x-auto"
        style={{ scrollbarWidth: "none" }}
      >
        {TABS.map(({ key, label, count }) => (
          <button
            type="button"
            key={key}
            onClick={() => setTab(key)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background:
                tab === key
                  ? "linear-gradient(135deg, #FF6B00, #FF9500)"
                  : "rgba(255,255,255,0.06)",
              color: tab === key ? "#0D1117" : "rgba(255,255,255,0.65)",
            }}
            data-ocid="admin.tab"
          >
            {label}
            {count !== undefined && count > 0 && (
              <span
                className="px-1.5 py-0.5 rounded-full text-xs font-bold"
                style={{
                  background:
                    tab === key ? "rgba(0,0,0,0.2)" : "rgba(255,107,0,0.2)",
                  color: tab === key ? "#0D1117" : "#FF6B00",
                }}
              >
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="px-4 pb-8">
        {loading && (
          <div
            className="text-center py-8 text-muted-foreground text-sm"
            data-ocid="admin.loading_state"
          >
            Loading...
          </div>
        )}

        {/* Plan Purchases */}
        {!loading && tab === "payments" && (
          <div className="space-y-3">
            {payments.length === 0 && (
              <div
                className="text-center py-8 text-muted-foreground text-sm"
                data-ocid="admin.empty_state"
              >
                No plan purchases yet
              </div>
            )}
            {[...payments].reverse().map((pm, i) => (
              <div
                key={`${pm.utrNumber}-${pm.submittedAt.toString()}`}
                className="rounded-2xl p-4 border border-white/8"
                style={{ background: "oklch(0.17 0.016 260)" }}
                data-ocid={`admin.item.${i + 1}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs text-muted-foreground">User</p>
                    <p className="text-sm font-mono text-foreground">
                      {shortPrincipal(pm.user)}
                    </p>
                  </div>
                  <StatusPAR status={pm.status} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div>
                    <p className="text-muted-foreground">Plan ID</p>
                    <p className="text-foreground font-semibold">
                      {pm.planId.toString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Payment App</p>
                    <p className="text-foreground font-semibold">
                      {pm.paymentApp}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">UTR Number</p>
                    <p className="text-foreground font-semibold font-mono">
                      {pm.utrNumber}
                    </p>
                  </div>
                </div>
                {pm.status === Variant_pending_approved_rejected.pending && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        doAction(`pm-approve-${i}`, () =>
                          actor!.approvePaymentSubmission(
                            BigInt(payments.length - 1 - i),
                          ),
                        )
                      }
                      disabled={!!actionLoading}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold disabled:opacity-50"
                      style={{
                        background: "rgba(0,201,167,0.2)",
                        color: "#00C9A7",
                        border: "1px solid rgba(0,201,167,0.3)",
                      }}
                      data-ocid="admin.confirm_button"
                    >
                      <CheckCircle size={13} /> Approve
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        doAction(`pm-reject-${i}`, () =>
                          actor!.rejectPaymentSubmission(
                            BigInt(payments.length - 1 - i),
                          ),
                        )
                      }
                      disabled={!!actionLoading}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold disabled:opacity-50"
                      style={{
                        background: "rgba(255,85,85,0.15)",
                        color: "#FF5555",
                        border: "1px solid rgba(255,85,85,0.25)",
                      }}
                      data-ocid="admin.delete_button"
                    >
                      <XCircle size={13} /> Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Deposits */}
        {!loading && tab === "deposits" && (
          <div className="space-y-3">
            {deposits.length === 0 && (
              <div
                className="text-center py-8 text-muted-foreground text-sm"
                data-ocid="admin.empty_state"
              >
                No deposit requests yet
              </div>
            )}
            {[...deposits].reverse().map((dep, i) => {
              const originalIndex = deposits.length - 1 - i;
              return (
                <div
                  key={`${dep.utrNumber}-${dep.submittedAt.toString()}`}
                  className="rounded-2xl p-4 border border-white/8"
                  style={{ background: "oklch(0.17 0.016 260)" }}
                  data-ocid={`admin.item.${i + 1}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs text-muted-foreground">User</p>
                      <p className="text-sm font-mono text-foreground">
                        {shortPrincipal(dep.user)}
                      </p>
                    </div>
                    <StatusPAR status={dep.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div>
                      <p className="text-muted-foreground">Amount</p>
                      <p className="text-foreground font-bold text-base">
                        ₹{Number(dep.amount).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground">UTR Number</p>
                      <p className="text-foreground font-semibold font-mono">
                        {dep.utrNumber}
                      </p>
                    </div>
                  </div>
                  {dep.status === Variant_pending_approved_rejected.pending && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          doAction(`dep-approve-${i}`, () =>
                            actor!.approveDepositRequest(BigInt(originalIndex)),
                          )
                        }
                        disabled={!!actionLoading}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold disabled:opacity-50"
                        style={{
                          background: "rgba(0,201,167,0.2)",
                          color: "#00C9A7",
                          border: "1px solid rgba(0,201,167,0.3)",
                        }}
                        data-ocid="admin.confirm_button"
                      >
                        <CheckCircle size={13} /> Approve
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          doAction(`dep-reject-${i}`, () =>
                            actor!.rejectDepositRequest(BigInt(originalIndex)),
                          )
                        }
                        disabled={!!actionLoading}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold disabled:opacity-50"
                        style={{
                          background: "rgba(255,85,85,0.15)",
                          color: "#FF5555",
                          border: "1px solid rgba(255,85,85,0.25)",
                        }}
                        data-ocid="admin.delete_button"
                      >
                        <XCircle size={13} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Withdrawals */}
        {!loading && tab === "withdrawals" && (
          <div className="space-y-3">
            {withdrawals.length === 0 && (
              <div
                className="text-center py-8 text-muted-foreground text-sm"
                data-ocid="admin.empty_state"
              >
                No withdrawal requests yet
              </div>
            )}
            {[...withdrawals].reverse().map((wr, i) => {
              const originalIndex = withdrawals.length - 1 - i;
              return (
                <div
                  key={`${wr.upiId}-${wr.requestedAt.toString()}`}
                  className="rounded-2xl p-4 border border-white/8"
                  style={{ background: "oklch(0.17 0.016 260)" }}
                  data-ocid={`admin.item.${i + 1}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs text-muted-foreground">User</p>
                      <p className="text-sm font-mono text-foreground">
                        {shortPrincipal(wr.user)}
                      </p>
                    </div>
                    <StatusPCR status={wr.status} />
                  </div>
                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground mb-1">Amount</p>
                    <p className="text-foreground font-bold text-xl">
                      ₹{Number(wr.amount).toLocaleString("en-IN")}
                    </p>
                  </div>
                  {/* UPI ID — prominent orange box with copy */}
                  <div
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 mb-3"
                    style={{
                      background: "rgba(255,107,0,0.12)",
                      border: "2px solid rgba(255,107,0,0.35)",
                    }}
                    data-ocid="admin.panel"
                  >
                    <div>
                      <p
                        className="text-xs"
                        style={{ color: "rgba(255,107,0,0.7)" }}
                      >
                        UPI ID
                      </p>
                      <p
                        className="text-sm font-bold"
                        style={{ color: "#FF6B00" }}
                      >
                        {wr.upiId}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyUpi(wr.upiId)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95"
                      style={{
                        background:
                          copiedUpi === wr.upiId
                            ? "rgba(0,201,167,0.2)"
                            : "rgba(255,107,0,0.2)",
                        color: copiedUpi === wr.upiId ? "#00C9A7" : "#FF6B00",
                        border: `1px solid ${copiedUpi === wr.upiId ? "rgba(0,201,167,0.4)" : "rgba(255,107,0,0.4)"}`,
                      }}
                      data-ocid="admin.secondary_button"
                    >
                      <Copy size={11} />
                      {copiedUpi === wr.upiId ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  {wr.status === Variant_pending_completed_rejected.pending && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          doAction(`wr-approve-${i}`, () =>
                            actor!.approveWithdrawalRequest(
                              BigInt(originalIndex),
                            ),
                          )
                        }
                        disabled={!!actionLoading}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold disabled:opacity-50"
                        style={{
                          background: "rgba(0,201,167,0.2)",
                          color: "#00C9A7",
                          border: "1px solid rgba(0,201,167,0.3)",
                        }}
                        data-ocid="admin.confirm_button"
                      >
                        <CheckCircle size={13} /> Approve
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          doAction(`wr-reject-${i}`, () =>
                            actor!.rejectWithdrawalRequest(
                              BigInt(originalIndex),
                            ),
                          )
                        }
                        disabled={!!actionLoading}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold disabled:opacity-50"
                        style={{
                          background: "rgba(255,85,85,0.15)",
                          color: "#FF5555",
                          border: "1px solid rgba(255,85,85,0.25)",
                        }}
                        data-ocid="admin.delete_button"
                      >
                        <XCircle size={13} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Plans */}
        {!loading && tab === "plans" && (
          <div className="space-y-4">
            {saveMsg && (
              <div
                className="rounded-xl p-3 text-sm font-medium"
                data-ocid="admin.success_state"
                style={{
                  background: "rgba(0,201,167,0.12)",
                  color: "#00C9A7",
                  border: "1px solid rgba(0,201,167,0.25)",
                }}
              >
                {saveMsg}
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowAddPlan(!showAddPlan)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all"
              style={{
                background: "linear-gradient(135deg, #FF6B00, #FF9500)",
                color: "#0D1117",
              }}
              data-ocid="admin.primary_button"
            >
              <Plus size={15} /> Add New Plan
            </button>

            {showAddPlan && (
              <div
                className="rounded-2xl p-4 border"
                style={{
                  background: "oklch(0.17 0.016 260)",
                  borderColor: "rgba(255,107,0,0.3)",
                }}
                data-ocid="admin.panel"
              >
                <h3 className="text-sm font-bold text-foreground mb-3">
                  New Plan
                </h3>
                <div className="space-y-3">
                  <div>
                    <label
                      htmlFor="new-plan-name"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Plan Name
                    </label>
                    <input
                      id="new-plan-name"
                      type="text"
                      value={newPlan.name}
                      onChange={(e) =>
                        setNewPlan((p) => ({ ...p, name: e.target.value }))
                      }
                      placeholder="e.g. Silver Plan"
                      className={`mt-1 ${inputClass}`}
                      style={inputStyle}
                      data-ocid="admin.input"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label
                        htmlFor="new-plan-price"
                        className="text-xs font-medium text-muted-foreground"
                      >
                        Price (₹)
                      </label>
                      <input
                        id="new-plan-price"
                        type="number"
                        value={newPlan.price}
                        onChange={(e) =>
                          setNewPlan((p) => ({ ...p, price: e.target.value }))
                        }
                        placeholder="500"
                        className={`mt-1 ${inputClass}`}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="new-plan-daily"
                        className="text-xs font-medium text-muted-foreground"
                      >
                        Daily ₹
                      </label>
                      <input
                        id="new-plan-daily"
                        type="number"
                        value={newPlan.dailyEarning}
                        onChange={(e) =>
                          setNewPlan((p) => ({
                            ...p,
                            dailyEarning: e.target.value,
                          }))
                        }
                        placeholder="25"
                        className={`mt-1 ${inputClass}`}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="new-plan-days"
                        className="text-xs font-medium text-muted-foreground"
                      >
                        Days
                      </label>
                      <input
                        id="new-plan-days"
                        type="number"
                        value={newPlan.validityDays}
                        onChange={(e) =>
                          setNewPlan((p) => ({
                            ...p,
                            validityDays: e.target.value,
                          }))
                        }
                        placeholder="30"
                        className={`mt-1 ${inputClass}`}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addNewPlan}
                    disabled={addingPlan}
                    className="w-full py-2.5 rounded-xl font-semibold text-sm disabled:opacity-50"
                    style={{
                      background: "linear-gradient(135deg, #FF6B00, #FF9500)",
                      color: "#0D1117",
                    }}
                    data-ocid="admin.submit_button"
                  >
                    {addingPlan ? "Adding..." : "Add Plan"}
                  </button>
                </div>
              </div>
            )}

            {plans.length === 0 && !showAddPlan && (
              <div
                className="text-center py-8 text-muted-foreground text-sm"
                data-ocid="admin.empty_state"
              >
                No plans yet. Click "Add New Plan" to create one.
              </div>
            )}

            {plans.map((plan) => {
              const edit = planEdits[plan.id.toString()] || plan;
              const key = plan.id.toString();
              return (
                <div
                  key={key}
                  className="rounded-2xl p-4 border border-white/8"
                  style={{ background: "oklch(0.17 0.016 260)" }}
                  data-ocid="admin.card"
                >
                  <h3 className="text-sm font-bold text-foreground mb-3">
                    Plan #{key}
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label
                        htmlFor={`plan-name-${key}`}
                        className="text-xs font-medium text-muted-foreground"
                      >
                        Plan Name
                      </label>
                      <input
                        id={`plan-name-${key}`}
                        type="text"
                        value={edit.name}
                        onChange={(e) =>
                          setPlanEdits((prev) => ({
                            ...prev,
                            [key]: { ...edit, name: e.target.value },
                          }))
                        }
                        className={`mt-1 ${inputClass}`}
                        style={inputStyle}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label
                          htmlFor={`plan-price-${key}`}
                          className="text-xs font-medium text-muted-foreground"
                        >
                          Price (₹)
                        </label>
                        <input
                          id={`plan-price-${key}`}
                          type="number"
                          value={Number(edit.price)}
                          onChange={(e) =>
                            setPlanEdits((prev) => ({
                              ...prev,
                              [key]: {
                                ...edit,
                                price: BigInt(
                                  Number.parseInt(e.target.value) || 0,
                                ),
                              },
                            }))
                          }
                          className={`mt-1 ${inputClass}`}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`plan-daily-${key}`}
                          className="text-xs font-medium text-muted-foreground"
                        >
                          Daily ₹
                        </label>
                        <input
                          id={`plan-daily-${key}`}
                          type="number"
                          value={Number(edit.dailyEarning)}
                          onChange={(e) =>
                            setPlanEdits((prev) => ({
                              ...prev,
                              [key]: {
                                ...edit,
                                dailyEarning: BigInt(
                                  Number.parseInt(e.target.value) || 0,
                                ),
                              },
                            }))
                          }
                          className={`mt-1 ${inputClass}`}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`plan-days-${key}`}
                          className="text-xs font-medium text-muted-foreground"
                        >
                          Days
                        </label>
                        <input
                          id={`plan-days-${key}`}
                          type="number"
                          value={Number(edit.validityDays)}
                          onChange={(e) =>
                            setPlanEdits((prev) => ({
                              ...prev,
                              [key]: {
                                ...edit,
                                validityDays: BigInt(
                                  Number.parseInt(e.target.value) || 0,
                                ),
                              },
                            }))
                          }
                          className={`mt-1 ${inputClass}`}
                          style={inputStyle}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => savePlan(edit)}
                      disabled={actionLoading === `save-${key}`}
                      className="w-full py-2.5 rounded-xl font-semibold text-sm disabled:opacity-50"
                      style={{
                        background: "rgba(0,201,167,0.2)",
                        color: "#00C9A7",
                        border: "1px solid rgba(0,201,167,0.3)",
                      }}
                      data-ocid="admin.save_button"
                    >
                      {actionLoading === `save-${key}`
                        ? "Saving..."
                        : "Save Changes"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
