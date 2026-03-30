import { TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

type AuthStep = "login" | "signup" | "otp" | "forgot";

export default function AuthPage() {
  const navigate = useNavigate();
  const { identity, login, isInitializing, isLoggingIn } =
    useInternetIdentity();
  const { actor } = useActor();

  const [step, setStep] = useState<AuthStep>("login");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [error, setError] = useState("");
  const [pendingRegistration, setPendingRegistration] = useState(false);

  useEffect(() => {
    if (identity && !isInitializing) navigate("/", { replace: true });
  }, [identity, isInitializing, navigate]);

  useEffect(() => {
    if (identity && actor && pendingRegistration) {
      setPendingRegistration(false);
      actor
        .registerUser(mobile)
        .then(() => {
          localStorage.setItem("earnhub_mobile", mobile);
          navigate("/", { replace: true });
        })
        .catch((err: unknown) => {
          console.error("Register error", err);
          navigate("/", { replace: true });
        });
    }
  }, [identity, actor, pendingRegistration, mobile, navigate]);

  const handleSignup = () => {
    if (!mobile || mobile.length < 10) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(code);
    setError("");
    setStep("otp");
  };

  const handleVerifyOtp = () => {
    if (otp !== generatedOtp) {
      setError("Incorrect OTP. Please try again.");
      return;
    }
    setError("");
    setPendingRegistration(true);
    login();
  };

  const handleLogin = () => {
    if (!mobile || mobile.length < 10) {
      setError("Enter a valid mobile number");
      return;
    }
    if (!password) {
      setError("Enter your password");
      return;
    }
    setError("");
    localStorage.setItem("earnhub_mobile", mobile);
    login();
  };

  const handleForgot = () => {
    if (!mobile || mobile.length < 10) {
      setError("Enter your registered mobile number");
      return;
    }
    setError("");
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(code);
    setStep("otp");
  };

  if (isInitializing) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: "#0F3B66" }}
      >
        <div className="text-white text-lg animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(135deg, #0F3B66 0%, #1a5a9a 100%)",
      }}
    >
      <div className="flex flex-col items-center pt-16 pb-8">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
          style={{ background: "#F57C1F" }}
        >
          <TrendingUp size={32} className="text-white" />
        </div>
        <h1 className="text-white text-3xl font-bold">EarnHub</h1>
        <p className="text-white/70 text-sm mt-1">Earn daily. Grow steadily.</p>
      </div>

      <div className="flex-1 bg-white rounded-t-3xl px-6 py-8">
        {step === "login" && (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Welcome Back
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="login-mobile"
                  className="text-sm font-medium text-gray-700"
                >
                  Mobile Number
                </label>
                <input
                  id="login-mobile"
                  type="tel"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                  placeholder="10-digit mobile number"
                  className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="login-password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="button"
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="w-full py-3.5 rounded-xl text-white font-semibold text-base disabled:opacity-60"
                style={{ background: "#0F3B66" }}
              >
                {isLoggingIn ? "Connecting..." : "Login"}
              </button>
              <div className="flex justify-between text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setStep("forgot");
                    setError("");
                  }}
                  className="text-blue-600"
                >
                  Forgot Password?
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep("signup");
                    setError("");
                  }}
                  className="text-blue-600 font-medium"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </>
        )}

        {step === "signup" && (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Create Account
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Start earning daily from your investments
            </p>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="signup-mobile"
                  className="text-sm font-medium text-gray-700"
                >
                  Mobile Number
                </label>
                <input
                  id="signup-mobile"
                  type="tel"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                  placeholder="10-digit mobile number"
                  className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="signup-password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="button"
                onClick={handleSignup}
                className="w-full py-3.5 rounded-xl text-white font-semibold text-base"
                style={{ background: "#0F3B66" }}
              >
                Get OTP
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("login");
                  setError("");
                }}
                className="w-full text-center text-sm text-blue-600"
              >
                Already have an account? Login
              </button>
            </div>
          </>
        )}

        {step === "otp" && (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verify OTP
            </h2>
            <p className="text-gray-500 text-sm mb-4">
              Enter the OTP sent to {mobile}
            </p>
            <div
              className="mb-6 p-4 rounded-xl border-2 border-dashed"
              style={{ borderColor: "#F57C1F", background: "#FFF3E0" }}
            >
              <p className="text-xs text-orange-600 font-medium mb-1">
                Your OTP (for testing)
              </p>
              <p
                className="text-3xl font-bold tracking-widest"
                style={{ color: "#F57C1F" }}
              >
                {generatedOtp}
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="otp-input"
                  className="text-sm font-medium text-gray-700"
                >
                  Enter OTP
                </label>
                <input
                  id="otp-input"
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="6-digit OTP"
                  className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-xl text-sm text-center text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isLoggingIn}
                className="w-full py-3.5 rounded-xl text-white font-semibold text-base disabled:opacity-60"
                style={{ background: "#0F3B66" }}
              >
                {isLoggingIn ? "Verifying..." : "Verify & Continue"}
              </button>
              <button
                type="button"
                onClick={() => setStep("signup")}
                className="w-full text-center text-sm text-blue-600"
              >
                Go Back
              </button>
            </div>
          </>
        )}

        {step === "forgot" && (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Reset Password
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              We\'ll send a reset link to your mobile
            </p>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="forgot-mobile"
                  className="text-sm font-medium text-gray-700"
                >
                  Mobile Number
                </label>
                <input
                  id="forgot-mobile"
                  type="tel"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                  placeholder="10-digit mobile number"
                  className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="button"
                onClick={handleForgot}
                className="w-full py-3.5 rounded-xl text-white font-semibold text-base"
                style={{ background: "#0F3B66" }}
              >
                Send Reset OTP
              </button>
              {generatedOtp && (
                <div
                  className="p-4 rounded-xl border-2 border-dashed"
                  style={{ borderColor: "#F57C1F", background: "#FFF3E0" }}
                >
                  <p className="text-xs text-orange-600 font-medium mb-1">
                    Reset OTP (for testing)
                  </p>
                  <p
                    className="text-3xl font-bold tracking-widest"
                    style={{ color: "#F57C1F" }}
                  >
                    {generatedOtp}
                  </p>
                  <p className="text-xs text-orange-700 mt-2">
                    Use this OTP to verify. In a real app, this would be sent
                    via SMS.
                  </p>
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  setStep("login");
                  setError("");
                  setGeneratedOtp("");
                }}
                className="w-full text-center text-sm text-blue-600"
              >
                Back to Login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
