import { Toaster } from "@/components/ui/sonner";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import Layout from "./components/Layout";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { RouterContext } from "./hooks/useRouter";
import type { Route } from "./hooks/useRouter";
import AdminPage from "./pages/AdminPage";
import AuthPage from "./pages/AuthPage";
import DepositPage from "./pages/DepositPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import ReferralPage from "./pages/ReferralPage";
import WalletPage from "./pages/WalletPage";
import WithdrawPage from "./pages/WithdrawPage";

function getInitialPathname(): string {
  return window.location.pathname || "/";
}

function RouterProvider({ children }: { children: React.ReactNode }) {
  const [pathname, setPathname] = useState(getInitialPathname);

  useEffect(() => {
    const handler = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  const navigate = useCallback((to: Route, options?: { replace?: boolean }) => {
    if (options?.replace) {
      window.history.replaceState(null, "", to);
    } else {
      window.history.pushState(null, "", to);
    }
    setPathname(to);
  }, []);

  return (
    <RouterContext.Provider value={{ pathname, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { identity, isInitializing } = useInternetIdentity();
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    if (!isInitializing && !identity && !redirected) {
      setRedirected(true);
      window.history.replaceState(null, "", "/auth");
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  }, [identity, isInitializing, redirected]);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center animate-pulse">
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-muted-foreground text-sm">Loading EarnHub...</p>
        </div>
      </div>
    );
  }
  if (!identity) return null;
  return <>{children}</>;
}

function AppRoutes() {
  const [pathname, setPathname] = useState(getInitialPathname);

  useEffect(() => {
    const handler = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  if (pathname === "/auth") {
    return <AuthPage />;
  }
  if (pathname === "/admin") {
    return <AdminPage />;
  }

  const protectedPages: Record<string, React.ReactNode> = {
    "/": <HomePage />,
    "/wallet": <WalletPage />,
    "/deposit": <DepositPage />,
    "/withdraw": <WithdrawPage />,
    "/referral": <ReferralPage />,
    "/profile": <ProfilePage />,
  };

  const page = protectedPages[pathname] ?? <HomePage />;

  return (
    <ProtectedRoute>
      <Layout>{page}</Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <AppRoutes />
      <Toaster position="top-center" theme="dark" />
    </RouterProvider>
  );
}
