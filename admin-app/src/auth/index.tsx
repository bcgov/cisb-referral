import { Suspense, use, type ReactNode } from "react";
import Keycloak from "keycloak-js";

export const keycloak = new Keycloak({
  url: import.meta.env.VITE_KC_URL,
  realm: import.meta.env.VITE_KC_REALM,
  clientId: import.meta.env.VITE_KC_CLIENT_ID,
});

export const init = async (): Promise<void> => {
  await keycloak.init({
    onLoad: "login-required",
    checkLoginIframe: false,
    pkceMethod: "S256",
  });

  keycloak.onTokenExpired = () => {
    keycloak.updateToken(30).catch(() => {
      keycloak.logout({ redirectUri: globalThis.location.origin });
    });
  };
};

export const logout = (): void => {
  keycloak.logout({ redirectUri: globalThis.location.origin });
};

// TODO: Replace getUser() with a /users/me API endpoint and useProfile hook
// to match the referral-app pattern and avoid reading claims from the token.
export const getUser = (): {
  name: string;
} | null => {
  if (!keycloak.authenticated || !keycloak.tokenParsed) {
    return null;
  }
  return {
    name:
      (keycloak.tokenParsed.name as string) ??
      (keycloak.tokenParsed.preferred_username as string) ??
      "",
  };
};

/** Promise created once on first render — not re-created on re-render. */
let authPromise: Promise<void> | null = null;

const getAuthPromise = () => {
  authPromise ??= init();
  return authPromise;
};

/** Suspends until auth init resolves. */
const AuthGate = ({ children }: { children: ReactNode }) => {
  use(getAuthPromise());
  return children;
};

/**
 * Handles Keycloak authentication lifecycle.
 * Suspends rendering until authentication completes.
 */
const AuthProvider = ({ children }: { children: ReactNode }) => {
  return (
    <Suspense fallback={null}>
      <AuthGate>{children}</AuthGate>
    </Suspense>
  );
};

export default AuthProvider;
