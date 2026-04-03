import {
  CheckCircle,
  Copy,
  LogOut,
  Plus,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
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

function StatusBadgePAR({
  status,
}: { status: Variant_pending_approved_rejected }) {
  if (status === Variant_pending_approved_rejected.approved)
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
        Approved
      </span>
    );
  if (status === Variant_pending_approved_rejected.rejected)
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
        Rejected
      </span>
    );
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
      Pending
    </span>
  );
}

function StatusBadgePCR({
  status,
}: { status: Variant_pending_completed_rejected }) {
  if (status === Variant_pending_completed_rejected.completed)
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
        Completed
      </span>
    );
  if (status === Variant_pending_completed_rejected.rejected)
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
        Rejected
      </span>
    );
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
      Pending
    </span>
  );
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

  // New plan form
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: "",
    price: "",
    dailyEarning: "",
    validityDays: "",
  });
  const [addingPlan, setAddingPlan] = useState(false);

  // Copy UPI feedback
  const [copiedUpi, setCopiedUpi] = useState<string | null>(null);

  const fetchAll = async () => {
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
      for (const plan of pl) {
        edits[plan.id.toString()] = { ...plan };
      }
      setPlanEdits(edits);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && actor) {
      setLoading(true);
      Promise.all([
        actor.getAllPaymentSubmissions(),
        actor.getAllWithdrawalRequests(),
        actor.getAllDepositRequests(),
        actor.getAllPlans(),
      ])
        .then(([p, w, d, pl]) => {
          setPayments(p);
          setWithdrawals(w);
          setDeposits(d);
          setPlans(pl);
          const edits: Record<string, Plan> = {};
          for (const plan of pl) {
            edits[plan.id.toString()] = { ...plan };
          }
          setPlanEdits(edits);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isLoggedIn, actor]);

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

  const savePlan = async (planId: bigint) => {
    if (!actor) return;
    const edit = planEdits[planId.toString()];
    if (!edit) return;
    const key = `save-${planId}`;
    setActionLoading(key);
    try {
      await actor.updatePlan(
        planId,
        edit.name,
        BigInt(edit.price),
        BigInt(edit.dailyEarning),
        BigInt(edit.validityDays),
      );
      setSaveMsg("Plan updated successfully!");
      setTimeout(() => setSaveMsg(null), 3000);
      await fetchAll();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const addNewPlan = async () => {
    if (!actor) return;
    const price = Number(newPlan.price);
    const daily = Number(newPlan.dailyEarning);
    const days = Number(newPlan.validityDays);
    if (!newPlan.name || !price || !daily || !days) return;
    setAddingPlan(true);
    try {
      await actor.addPlan(
        newPlan.name,
        BigInt(price),
        BigInt(daily),
        BigInt(days),
      );
      setNewPlan({ name: "", price: "", dailyEarning: "", validityDays: "" });
      setShowAddPlan(false);
      setSaveMsg("Plan added successfully!");
      setTimeout(() => setSaveMsg(null), 3000);
      await fetchAll();
    } catch (e) {
      console.error(e);
    } finally {
      setAddingPlan(false);
    }
  };

  const copyUpi = (upi: string) => {
    navigator.clipboard.writeText(upi).catch(() => {});
    setCopiedUpi(upi);
    setTimeout(() => setCopiedUpi(null), 2000);
  };

  const shortPrincipal = (p: { toString: () => string }) => {
    const s = p.toString();
    return s.length > 12 ? `${s.slice(0, 6)}...${s.slice(-4)}` : s;
  };

  if (!isLoggedIn) {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{ background: "linear-gradient(135deg, #0F3B66, #1a5a9a)" }}
      >
        <div className="flex flex-col items-center pt-16 pb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "#F57C1F" }}
          >
            <TrendingUp size={32} className="text-white" />
          </div>
          <h1 className="text-white text-2xl font-bold">Admin Panel</h1>
        </div>
        <div className="flex-1 bg-white rounded-t-3xl px-6 py-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Admin Login</h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="admin-username"
                className="text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                id="admin-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-ocid="admin.input"
              />
            </div>
            <div>
              <label
                htmlFor="admin-password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="admin123"
                className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-ocid="admin.input"
              />
            </div>
            {loginError && (
              <p className="text-red-500 text-sm" data-ocid="admin.error_state">
                {loginError}
              </p>
            )}
            <button
              type="button"
              onClick={handleLogin}
              className="w-full py-3.5 rounded-xl text-white font-semibold"
              style={{ background: "#0F3B66" }}
              data-ocid="admin.primary_button"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-4 h-14"
        style={{ background: "#0F3B66" }}
      >
        <div className="flex items-center gap-2">
          <TrendingUp size={20} className="text-white" />
          <span className="text-white font-bold">EarnHub Admin</span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1 text-white/80 text-sm"
          data-ocid="admin.secondary_button"
        >
          <LogOut size={16} /> Logout
        </button>
      </header>

      <div className="flex bg-white border-b border-gray-200 sticky top-14 z-40">
        {(["payments", "withdrawals", "deposits", "plans"] as Tab[]).map(
          (t) => (
            <button
              type="button"
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-xs font-semibold capitalize transition-colors ${
                tab === t ? "border-b-2" : "text-gray-500"
              }`}
              style={
                tab === t ? { borderColor: "#0F3B66", color: "#0F3B66" } : {}
              }
              data-ocid="admin.tab"
            >
              {t}
            </button>
          ),
        )}
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 pb-8">
        {loading && (
          <div
            className="text-center text-gray-400 py-8"
            data-ocid="admin.loading_state"
          >
            Loading...
          </div>
        )}

        {!loading && tab === "payments" && (
          <div className="space-y-3">
            <p className="text-xs text-gray-500">
              {payments.length} submissions
            </p>
            {payments.length === 0 && (
              <div
                className="text-center py-8 text-gray-400 text-sm"
                data-ocid="admin.empty_state"
              >
                No payment submissions
              </div>
            )}
            {[...payments].reverse().map((p, i) => {
              // When displayed in reverse, original index = array.length - 1 - i
              const originalIndex = payments.length - 1 - i;
              return (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: no stable key available
                  key={i}
                  className="bg-white rounded-2xl p-4 shadow-sm"
                  data-ocid={`admin.item.${i + 1}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs text-gray-500">User</p>
                      <p className="text-sm font-mono font-semibold text-gray-800">
                        {shortPrincipal(p.user)}
                      </p>
                    </div>
                    <StatusBadgePAR status={p.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                    <div>
                      <span className="text-gray-400">Plan ID:</span>{" "}
                      {p.planId.toString()}
                    </div>
                    <div>
                      <span className="text-gray-400">App:</span> {p.paymentApp}
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-400">UTR:</span> {p.utrNumber}
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-400">Date:</span>{" "}
                      {new Date(
                        Number(p.submittedAt / 1000000n),
                      ).toLocaleString("en-IN")}
                    </div>
                  </div>
                  {p.status === Variant_pending_approved_rejected.pending && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          doAction(`pay-approve-${i}`, () =>
                            actor!.approvePaymentSubmission(
                              BigInt(originalIndex),
                            ),
                          )
                        }
                        disabled={!!actionLoading}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-60"
                        style={{ background: "#16A34A" }}
                        data-ocid="admin.confirm_button"
                      >
                        <CheckCircle size={14} /> Approve
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          doAction(`pay-reject-${i}`, () =>
                            actor!.rejectPaymentSubmission(
                              BigInt(originalIndex),
                            ),
                          )
                        }
                        disabled={!!actionLoading}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-60"
                        style={{ background: "#DC2626" }}
                        data-ocid="admin.delete_button"
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!loading && tab === "withdrawals" && (
          <div className="space-y-3">
            <p className="text-xs text-gray-500">
              {
                withdrawals.filter(
                  (w) =>
                    w.status === Variant_pending_completed_rejected.pending,
                ).length
              }{" "}
              pending • {withdrawals.length} total
            </p>
            {withdrawals.length === 0 && (
              <div
                className="text-center py-8 text-gray-400 text-sm"
                data-ocid="admin.empty_state"
              >
                No withdrawal requests
              </div>
            )}
            {[...withdrawals].reverse().map((w, i) => {
              const originalIndex = withdrawals.length - 1 - i;
              return (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: no stable key available
                  key={i}
                  className="bg-white rounded-2xl p-4 shadow-sm"
                  data-ocid={`admin.item.${i + 1}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs text-gray-500">User</p>
                      <p className="text-sm font-mono font-semibold text-gray-800">
                        {shortPrincipal(w.user)}
                      </p>
                    </div>
                    <StatusBadgePCR status={w.status} />
                  </div>
                  {/* Amount & UPI highlighted prominently */}
                  <div className="bg-orange-50 rounded-xl p-3 mb-3">
                    <p className="text-lg font-extrabold text-gray-900">
                      ₹{Number(w.amount).toLocaleString("en-IN")}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm font-semibold text-orange-700">
                        {w.upiId}
                      </p>
                      <button
                        type="button"
                        onClick={() => copyUpi(w.upiId)}
                        className="p-1 rounded-md bg-orange-100 hover:bg-orange-200 transition-colors"
                        title="Copy UPI ID"
                        data-ocid="admin.secondary_button"
                      >
                        <Copy size={12} className="text-orange-600" />
                      </button>
                      {copiedUpi === w.upiId && (
                        <span className="text-xs text-green-600 font-medium">
                          Copied!
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Send ₹{Number(w.amount)} to this UPI ID
                    </p>
                  </div>
                  <div className="text-xs text-gray-500 mb-3">
                    {new Date(Number(w.requestedAt / 1000000n)).toLocaleString(
                      "en-IN",
                    )}
                  </div>
                  {w.status === Variant_pending_completed_rejected.pending && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          doAction(`wd-approve-${i}`, () =>
                            actor!.approveWithdrawalRequest(
                              BigInt(originalIndex),
                            ),
                          )
                        }
                        disabled={!!actionLoading}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-60"
                        style={{ background: "#16A34A" }}
                        data-ocid="admin.confirm_button"
                      >
                        <CheckCircle size={14} /> Approve
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          doAction(`wd-reject-${i}`, () =>
                            actor!.rejectWithdrawalRequest(
                              BigInt(originalIndex),
                            ),
                          )
                        }
                        disabled={!!actionLoading}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-60"
                        style={{ background: "#DC2626" }}
                        data-ocid="admin.delete_button"
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!loading && tab === "deposits" && (
          <div className="space-y-3">
            <p className="text-xs text-gray-500">{deposits.length} requests</p>
            {deposits.length === 0 && (
              <div
                className="text-center py-8 text-gray-400 text-sm"
                data-ocid="admin.empty_state"
              >
                No deposit requests
              </div>
            )}
            {[...deposits].reverse().map((d, i) => {
              const originalIndex = deposits.length - 1 - i;
              return (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: no stable key available
                  key={i}
                  className="bg-white rounded-2xl p-4 shadow-sm"
                  data-ocid={`admin.item.${i + 1}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs text-gray-500">User</p>
                      <p className="text-sm font-mono font-semibold text-gray-800">
                        {shortPrincipal(d.user)}
                      </p>
                    </div>
                    <StatusBadgePAR status={d.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                    <div>
                      <span className="text-gray-400">Amount:</span> ₹
                      {Number(d.amount)}
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-400">UTR:</span> {d.utrNumber}
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-400">Date:</span>{" "}
                      {new Date(
                        Number(d.submittedAt / 1000000n),
                      ).toLocaleString("en-IN")}
                    </div>
                  </div>
                  {d.status === Variant_pending_approved_rejected.pending && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          doAction(`dep-approve-${i}`, () =>
                            actor!.approveDepositRequest(BigInt(originalIndex)),
                          )
                        }
                        disabled={!!actionLoading}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-60"
                        style={{ background: "#16A34A" }}
                        data-ocid="admin.confirm_button"
                      >
                        <CheckCircle size={14} /> Approve
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          doAction(`dep-reject-${i}`, () =>
                            actor!.rejectDepositRequest(BigInt(originalIndex)),
                          )
                        }
                        disabled={!!actionLoading}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-60"
                        style={{ background: "#DC2626" }}
                        data-ocid="admin.delete_button"
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!loading && tab === "plans" && (
          <div className="space-y-4">
            {saveMsg && (
              <div
                className="bg-green-50 border border-green-200 rounded-xl p-3 text-green-700 text-sm"
                data-ocid="admin.success_state"
              >
                {saveMsg}
              </div>
            )}

            {/* Add Plan Button */}
            <button
              type="button"
              onClick={() => setShowAddPlan(!showAddPlan)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm"
              style={{ background: "#F57C1F" }}
              data-ocid="admin.primary_button"
            >
              <Plus size={16} /> Add New Plan
            </button>

            {/* Add Plan Form */}
            {showAddPlan && (
              <div
                className="bg-white rounded-2xl p-4 shadow-sm border-2 border-orange-200"
                data-ocid="admin.panel"
              >
                <h3 className="text-sm font-bold text-gray-900 mb-3">
                  New Plan
                </h3>
                <div className="space-y-3">
                  <div>
                    <label
                      htmlFor="new-plan-name"
                      className="text-xs font-medium text-gray-500"
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
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      data-ocid="admin.input"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label
                        htmlFor="new-plan-price"
                        className="text-xs font-medium text-gray-500"
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
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="new-plan-daily"
                        className="text-xs font-medium text-gray-500"
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
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="new-plan-days"
                        className="text-xs font-medium text-gray-500"
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
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addNewPlan}
                    disabled={addingPlan}
                    className="w-full py-2.5 rounded-xl text-white font-semibold text-sm disabled:opacity-60"
                    style={{ background: "#0F3B66" }}
                    data-ocid="admin.submit_button"
                  >
                    {addingPlan ? "Adding..." : "Add Plan"}
                  </button>
                </div>
              </div>
            )}

            {plans.length === 0 && !showAddPlan && (
              <div
                className="text-center py-8 text-gray-400 text-sm"
                data-ocid="admin.empty_state"
              >
                No plans yet. Click "Add New Plan" to create plans.
              </div>
            )}

            {plans.map((plan) => {
              const edit = planEdits[plan.id.toString()] || plan;
              const key = plan.id.toString();
              return (
                <div
                  key={key}
                  className="bg-white rounded-2xl p-4 shadow-sm"
                  data-ocid="admin.card"
                >
                  <h3 className="text-sm font-bold text-gray-900 mb-3">
                    Plan #{plan.id.toString()}
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label
                        htmlFor={`plan-name-${key}`}
                        className="text-xs font-medium text-gray-500"
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
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label
                          htmlFor={`plan-price-${key}`}
                          className="text-xs font-medium text-gray-500"
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
                                price: BigInt(e.target.value || 0),
                              },
                            }))
                          }
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`plan-daily-${key}`}
                          className="text-xs font-medium text-gray-500"
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
                                dailyEarning: BigInt(e.target.value || 0),
                              },
                            }))
                          }
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`plan-days-${key}`}
                          className="text-xs font-medium text-gray-500"
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
                                validityDays: BigInt(e.target.value || 0),
                              },
                            }))
                          }
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => savePlan(plan.id)}
                      disabled={actionLoading === `save-${plan.id}`}
                      className="w-full py-2.5 rounded-xl text-white font-semibold text-sm disabled:opacity-60"
                      style={{ background: "#0F3B66" }}
                      data-ocid="admin.save_button"
                    >
                      {actionLoading === `save-${plan.id}`
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

      {/* Footer */}
      <footer className="mt-6 pb-6 text-center text-xs text-gray-400">
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
