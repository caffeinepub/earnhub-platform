import { createContext, useContext } from "react";

export type Route =
  | "/"
  | "/auth"
  | "/admin"
  | "/wallet"
  | "/deposit"
  | "/withdraw"
  | "/referral"
  | "/profile";

export interface RouterContextValue {
  pathname: string;
  navigate: (to: Route, options?: { replace?: boolean }) => void;
}

export const RouterContext = createContext<RouterContextValue>({
  pathname: window.location.pathname,
  navigate: () => {},
});

export function useRouter() {
  return useContext(RouterContext);
}

export function useNavigate() {
  const { navigate } = useContext(RouterContext);
  return navigate;
}

export function useLocation() {
  const { pathname } = useContext(RouterContext);
  return { pathname };
}
