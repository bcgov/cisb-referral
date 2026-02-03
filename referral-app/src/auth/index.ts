import Keycloak from "keycloak-js";

export const keycloak = new Keycloak({
  url: import.meta.env.VITE_KC_URL,
  realm: import.meta.env.VITE_KC_REALM,
  clientId: import.meta.env.VITE_KC_CLIENT_ID,
});

export const init = async (): Promise<void> => {
  const authenticated = await keycloak.init({
    onLoad: "login-required",
    checkLoginIframe: false,
    pkceMethod: "S256",
  });

  if (!authenticated) {
    throw new Error("Authentication failed");
  }

  keycloak.onTokenExpired = () => {
    keycloak.updateToken(30).catch(() => {
      keycloak.logout({ redirectUri: globalThis.location.origin });
    });
  };
};

export const logout = (): void => {
  keycloak.logout({ redirectUri: globalThis.location.origin });
};
