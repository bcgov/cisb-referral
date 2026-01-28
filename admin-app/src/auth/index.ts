import Keycloak from "keycloak-js";

export const keycloak = new Keycloak({
  url: import.meta.env.VITE_KC_URL,
  realm: import.meta.env.VITE_KC_REALM,
  clientId: import.meta.env.VITE_KC_CLIENT_ID,
});

export const init = (onSuccess: () => void): void => {
  keycloak
    .init({
      onLoad: "login-required",
      checkLoginIframe: false,
      pkceMethod: "S256",
    })
    .then((authenticated) => {
      if (authenticated) {
        onSuccess();
      }
    })
    .catch((error) => {
      console.error("Keycloak init failed:", error);
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

export const getUser = (): {
  id: string;
  email: string;
  name: string;
} | null => {
  if (!keycloak.authenticated || !keycloak.tokenParsed) {
    return null;
  }
  return {
    id: (keycloak.tokenParsed.sub as string) ?? "",
    email: (keycloak.tokenParsed.email as string) ?? "",
    name:
      (keycloak.tokenParsed.name as string) ??
      (keycloak.tokenParsed.preferred_username as string) ??
      "",
  };
};
