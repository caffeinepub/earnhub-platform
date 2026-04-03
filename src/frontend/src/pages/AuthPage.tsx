import { TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useNavigate } from "../hooks/useRouter";

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
    const refCode = new URLSearchParams(window.location.search).get("ref");
    if (refCode) localStorage.setItem("earnhub_ref_code", refCode);
  }, []);

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
          const refCode = localStorage.getItem("earnhub_ref_code");
          if (refCode) {
            actor.setReferredBy(refCode).catch(() => {});
            localStorage.removeItem("earnhub_ref_code");
          }
          navigate("/", { replace: true });
        })
        .catch(() => navigate("/", { replace: true }));
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
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-muted-foreground text-sm animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  const inputClass =
    "mt-1.5 w-full px-4 py-3.5 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder-muted-foreground/50";
  const inputStyle = {
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.12)",
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Hero Header */}
      <div
        className="flex flex-col items-center pt-14 pb-10 px-6"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.20 0.05 250) 0%, oklch(0.13 0.012 262) 100%)",
        }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-glow"
          style={{ background: "linear-gradient(135deg, #FF6B00, #FF9500)" }}
        >
          <TrendingUp size={30} className="text-white" />
        </div>
        <h1 className="font-display text-white text-3xl font-bold tracking-tight">
          EarnHub
        </h1>
        <p className="text-white/50 text-sm mt-1">Earn daily. Grow steadily.</p>
      </div>

      {/* Card */}
      <div
        className="flex-1 rounded-t-3xl px-6 py-7"
        style={{
          background: "oklch(0.17 0.016 260)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderBottom: "none",
        }}
      >
        {step === "login" && (
          <>
            <h2 className="text-2xl font-bold text-foreground mb-1">
              Welcome Back
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              Sign in to your account
            </p>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="login-mobile"
                  className="text-sm font-medium text-foreground/80"
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
                  className={inputClass}
                  style={inputStyle}
                  data-ocid="auth.input"
                />
              </div>
              <div>
                <label
                  htmlFor="login-password"
                  className="text-sm font-medium text-foreground/80"
                >
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className={inputClass}
                  style={inputStyle}
                  data-ocid="auth.input"
                />
              </div>
              {error && (
                <p
                  className="text-sm"
                  style={{ color: "#FF5555" }}
                  data-ocid="auth.error_state"
                >
                  {error}
                </p>
              )}
              <button
                type="button"
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="w-full py-3.5 rounded-xl font-semibold text-sm disabled:opacity-50 mt-2"
                style={{
                  background: "linear-gradient(135deg, #FF6B00, #FF9500)",
                  color: "#0D1117",
                }}
                data-ocid="auth.primary_button"
              >
                {isLoggingIn ? "Connecting..." : "Login"}
              </button>
              <div className="flex justify-between text-sm pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setStep("forgot");
                    setError("");
                  }}
                  className="text-primary/80 hover:text-primary transition-colors"
                  data-ocid="auth.secondary_button"
                >
                  Forgot Password?
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep("signup");
                    setError("");
                  }}
                  className="text-primary font-semibold"
                  data-ocid="auth.secondary_button"
                >
                  Create Account
                </button>
              </div>
            </div>
          </>
        )}

        {step === "signup" && (
          <>
            <h2 className="text-2xl font-bold text-foreground mb-1">
              Create Account
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              Start earning daily from your investments
            </p>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="signup-mobile"
                  className="text-sm font-medium text-foreground/80"
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
                  className={inputClass}
                  style={inputStyle}
                  data-ocid="auth.input"
                />
              </div>
              <div>
                <label
                  htmlFor="signup-password"
                  className="text-sm font-medium text-foreground/80"
                >
                  Password
                </label>
                <input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className={inputClass}
                  style={inputStyle}
                  data-ocid="auth.input"
                />
              </div>
              {error && (
                <p
                  className="text-sm"
                  style={{ color: "#FF5555" }}
                  data-ocid="auth.error_state"
                >
                  {error}
                </p>
              )}
              <button
                type="button"
                onClick={handleSignup}
                className="w-full py-3.5 rounded-xl font-semibold text-sm"
                style={{
                  background: "linear-gradient(135deg, #FF6B00, #FF9500)",
                  color: "#0D1117",
                }}
                data-ocid="auth.primary_button"
              >
                Get OTP
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("login");
                  setError("");
                }}
                className="w-full text-center text-sm text-primary/80"
                data-ocid="auth.secondary_button"
              >
                Already have an account? Login
              </button>
            </div>
          </>
        )}

        {step === "otp" && (
          <>
            <h2 className="text-2xl font-bold text-foreground mb-1">
              Verify OTP
            </h2>
            <p className="text-muted-foreground text-sm mb-4">
              Enter the OTP sent to {mobile}
            </p>
            <div
              className="mb-5 p-4 rounded-xl"
              style={{
                background: "rgba(255,107,0,0.1)",
                border: "1px dashed rgba(255,107,0,0.4)",
              }}
            >
              <p
                className="text-xs font-medium mb-1"
                style={{ color: "#FF9500" }}
              >
                Your OTP (testing)
              </p>
              <p
                className="text-3xl font-bold tracking-widest"
                style={{ color: "#FF6B00" }}
              >
                {generatedOtp}
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="otp-input"
                  className="text-sm font-medium text-foreground/80"
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
                  className={`${inputClass} text-center text-xl tracking-widest`}
                  style={inputStyle}
                  data-ocid="auth.input"
                />
              </div>
              {error && (
                <p
                  className="text-sm"
                  style={{ color: "#FF5555" }}
                  data-ocid="auth.error_state"
                >
                  {error}
                </p>
              )}
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isLoggingIn}
                className="w-full py-3.5 rounded-xl font-semibold text-sm disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, #FF6B00, #FF9500)",
                  color: "#0D1117",
                }}
                data-ocid="auth.primary_button"
              >
                {isLoggingIn ? "Verifying..." : "Verify & Continue"}
              </button>
              <button
                type="button"
                onClick={() => setStep("signup")}
                className="w-full text-center text-sm text-primary/80"
                data-ocid="auth.secondary_button"
              >
                Go Back
              </button>
            </div>
          </>
        )}

        {step === "forgot" && (
          <>
            <h2 className="text-2xl font-bold text-foreground mb-1">
              Reset Password
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              We'll send a reset OTP to your mobile
            </p>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="forgot-mobile"
                  className="text-sm font-medium text-foreground/80"
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
                  className={inputClass}
                  style={inputStyle}
                  data-ocid="auth.input"
                />
              </div>
              {error && (
                <p
                  className="text-sm"
                  style={{ color: "#FF5555" }}
                  data-ocid="auth.error_state"
                >
                  {error}
                </p>
              )}
              <button
                type="button"
                onClick={handleForgot}
                className="w-full py-3.5 rounded-xl font-semibold text-sm"
                style={{
                  background: "linear-gradient(135deg, #FF6B00, #FF9500)",
                  color: "#0D1117",
                }}
                data-ocid="auth.primary_button"
              >
                Send Reset OTP
              </button>
              {generatedOtp && (
                <div
                  className="p-4 rounded-xl"
                  style={{
                    background: "rgba(255,107,0,0.1)",
                    border: "1px dashed rgba(255,107,0,0.4)",
                  }}
                >
                  <p
                    className="text-xs font-medium mb-1"
                    style={{ color: "#FF9500" }}
                  >
                    Reset OTP (testing)
                  </p>
                  <p
                    className="text-3xl font-bold tracking-widest"
                    style={{ color: "#FF6B00" }}
                  >
                    {generatedOtp}
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
                className="w-full text-center text-sm text-primary/80"
                data-ocid="auth.secondary_button"
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
