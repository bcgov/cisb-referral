/**
 * Standard Keycloak JWT token payload claims
 * Both admin-realm and referral-realm tokens share this structure
 */
export interface KeycloakTokenPayload {
  /** Token expiration time (Unix timestamp) */
  exp: number;

  /** Token issued at time (Unix timestamp) */
  iat: number;

  /** Token ID */
  jti: string;

  /** Issuer URL (Keycloak realm URL) */
  iss: string;

  /** Audience (client ID) */
  aud: string | string[];

  /** Subject (Keycloak user ID) - maps to keycloakId in our database */
  sub: string;

  /** Token type (typically 'Bearer') */
  typ?: string;

  /** Authorized party (client ID that requested the token) */
  azp?: string;

  /** Session ID */
  sid?: string;

  /** Authentication context class reference */
  acr?: string;

  /** Realm-level roles */
  realm_access?: {
    roles: string[];
  };

  /** Client-level roles */
  resource_access?: {
    [clientId: string]: {
      roles: string[];
    };
  };

  /** Scope of the token */
  scope?: string;

  /** Email verified flag */
  email_verified?: boolean;

  /** User's full name */
  name?: string;

  /** Preferred username */
  preferred_username?: string;

  /** User's given (first) name */
  given_name?: string;

  /** User's family (last) name */
  family_name?: string;

  /** User's email address */
  email?: string;
}
