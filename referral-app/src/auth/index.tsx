import { Suspense, use, type ReactNode } from "react";
import Keycloak from "keycloak-js";

const appConfig =
  (
    globalThis as typeof globalThis & {
      __APP_CONFIG__?: Record<string, string>;
    }
  ).__APP_CONFIG__ ?? {};

export const keycloak = new Keycloak({
  url: appConfig.KC_URL ?? import.meta.env.VITE_KC_URL,
  realm: appConfig.KC_REALM ?? import.meta.env.VITE_KC_REALM,
  clientId: appConfig.KC_CLIENT_ID ?? import.meta.env.VITE_KC_CLIENT_ID,
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
