import { useKeycloak } from "@react-keycloak/web";

interface AuthUser {
  id: string;
  email: string;
  name: string;
}

interface UseAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  logout: () => void;
}

/**
 * Extracts user information from Keycloak token claims.
 * Returns null if token is missing or invalid.
 */
function parseUserFromToken(
  tokenParsed: Record<string, unknown> | undefined,
): AuthUser | null {
  if (!tokenParsed) {
    return null;
  }

  return {
    id: (tokenParsed.sub as string) ?? "",
    email: (tokenParsed.email as string) ?? "",
    name:
      (tokenParsed.name as string) ??
      (tokenParsed.preferred_username as string) ??
      "",
  };
}

/**
 * Custom hook for accessing authentication state and actions.
 * Provides user info, auth status, and logout functionality.
 */
export function useAuth(): UseAuthReturn {
  const { keycloak, initialized } = useKeycloak();

  const isAuthenticated = initialized && (keycloak.authenticated ?? false);
  const user = isAuthenticated
    ? parseUserFromToken(keycloak.tokenParsed)
    : null;

  const logout = (): void => {
    keycloak.logout({ redirectUri: window.location.origin });
  };

  return {
    isAuthenticated,
    isLoading: !initialized,
    user,
    logout,
  };
}
