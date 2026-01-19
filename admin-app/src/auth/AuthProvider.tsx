import type { ReactNode } from "react";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import type { AuthClientEvent } from "@react-keycloak/core";
import keycloak from "./keycloak";
import { TOKEN_REFRESH_MIN_VALIDITY } from "./constants";

interface AuthProviderProps {
  children: ReactNode;
}

const keycloakInitOptions = {
  onLoad: "login-required" as const,
  checkLoginIframe: false,
};

/**
 * Handles Keycloak authentication events.
 * On token expiration, attempts silent refresh; logs out on failure.
 */
const handleKeycloakEvent = (event: AuthClientEvent): void => {
  if (event === "onTokenExpired") {
    keycloak.updateToken(TOKEN_REFRESH_MIN_VALIDITY).catch(() => {
      keycloak.logout({ redirectUri: window.location.origin });
    });
  }
};

/**
 * Authentication provider that wraps the application with Keycloak.
 * Automatically redirects unauthenticated users to login.
 */
export function AuthProvider({ children }: AuthProviderProps): ReactNode {
  return (
    <ReactKeycloakProvider
      authClient={keycloak}
      initOptions={keycloakInitOptions}
      onEvent={handleKeycloakEvent}
    >
      {children}
    </ReactKeycloakProvider>
  );
}
