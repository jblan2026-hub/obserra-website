import type {
  AuthenticationAssuranceLevel,
  AuthenticatorClass,
  FederationAssuranceLevel,
  IdentityAssuranceLevel,
} from "./identitySecurityPolicy";

export type IdentityProviderKind =
  | "clerk"
  | "entra-id"
  | "okta"
  | "auth0"
  | "ping"
  | "google-workspace"
  | "oidc"
  | "saml";

export type NormalizedIdentity = {
  subjectId: string;
  tenantId: string;
  email?: string;
  displayName?: string;
  roles: string[];
  groups: string[];
  identityAssurance: IdentityAssuranceLevel;
  authenticationAssurance: AuthenticationAssuranceLevel;
  federationAssurance: FederationAssuranceLevel;
  authenticators: AuthenticatorClass[];
  provider: IdentityProviderKind;
  providerSubject: string;
  issuedAt: string;
  expiresAt: string;
  sessionId: string;
  attributes: Record<string, string | number | boolean | string[]>;
};

export type IdentityProviderConfiguration = {
  id: string;
  kind: IdentityProviderKind;
  issuer: string;
  audience: string;
  tenantClaim: string;
  roleClaim?: string;
  groupClaim?: string;
  clockSkewSeconds: number;
  requireSignedAssertions: boolean;
  requireEncryptedAssertions: boolean;
  allowedAlgorithms: string[];
  enabled: boolean;
};

export type IdentityValidationContext = {
  rawToken: string;
  expectedTenantId?: string;
  expectedAudience: string;
  requestId: string;
  ipAddress?: string;
  userAgent?: string;
};

export type IdentityValidationResult =
  | { ok: true; identity: NormalizedIdentity }
  | { ok: false; reason: string; code: "invalid" | "expired" | "tenant_mismatch" | "audience_mismatch" | "provider_unavailable" };

export interface IdentityProviderAdapter {
  readonly provider: IdentityProviderKind;
  validate(context: IdentityValidationContext): Promise<IdentityValidationResult>;
  revokeSession(sessionId: string, reason: string): Promise<void>;
  healthCheck(): Promise<{ healthy: boolean; detail?: string }>;
}

export class IdentityProviderRegistry {
  private readonly adapters = new Map<IdentityProviderKind, IdentityProviderAdapter>();

  register(adapter: IdentityProviderAdapter): void {
    this.adapters.set(adapter.provider, adapter);
  }

  resolve(provider: IdentityProviderKind): IdentityProviderAdapter {
    const adapter = this.adapters.get(provider);
    if (!adapter) {
      throw new Error(`Identity provider adapter not registered: ${provider}`);
    }
    return adapter;
  }

  listProviders(): IdentityProviderKind[] {
    return [...this.adapters.keys()];
  }
}

export function assertNormalizedIdentity(identity: NormalizedIdentity): void {
  if (!identity.subjectId || !identity.tenantId || !identity.sessionId) {
    throw new Error("Normalized identity is missing required subject, tenant, or session context");
  }
  if (new Date(identity.expiresAt).getTime() <= Date.now()) {
    throw new Error("Normalized identity session is expired");
  }
}
