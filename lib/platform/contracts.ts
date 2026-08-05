export type PlatformServiceName =
  | "identity"
  | "organization"
  | "tenant"
  | "licensing"
  | "entitlement"
  | "notification"
  | "audit"
  | "storage"
  | "search"
  | "billing"
  | "ai";

export type ServiceHealth = "healthy" | "degraded" | "unavailable" | "not-configured";

export type PlatformRequestContext = {
  requestId: string;
  correlationId: string;
  subjectId?: string;
  tenantId?: string;
  organizationId?: string;
  roles: string[];
  issuedAt: string;
};

export type ServiceResult<T> = {
  ok: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    retryable: boolean;
  };
  source: string;
};

export type HealthCheckResult = {
  service: PlatformServiceName;
  status: ServiceHealth;
  checkedAt: string;
  latencyMs?: number;
  message?: string;
};

export interface PlatformService {
  readonly name: PlatformServiceName;
  healthCheck(): Promise<HealthCheckResult>;
}

export type IdentitySubject = {
  id: string;
  email?: string;
  displayName?: string;
  tenantIds: string[];
  organizationIds: string[];
  roles: string[];
  assuranceLevel?: string;
  provider: string;
};

export interface IdentityService extends PlatformService {
  resolveSubject(context: PlatformRequestContext): Promise<ServiceResult<IdentitySubject>>;
  revokeSessions(subjectId: string, context: PlatformRequestContext): Promise<ServiceResult<{ revoked: boolean }>>;
}

export type OrganizationRecord = {
  id: string;
  name: string;
  status: "active" | "suspended" | "closed";
  primaryTenantId: string;
  domains: string[];
};

export interface OrganizationService extends PlatformService {
  getOrganization(id: string, context: PlatformRequestContext): Promise<ServiceResult<OrganizationRecord>>;
  listForSubject(subjectId: string, context: PlatformRequestContext): Promise<ServiceResult<OrganizationRecord[]>>;
}

export type TenantRecord = {
  id: string;
  organizationId: string;
  name: string;
  region?: string;
  status: "active" | "suspended" | "provisioning";
};

export interface TenantService extends PlatformService {
  getTenant(id: string, context: PlatformRequestContext): Promise<ServiceResult<TenantRecord>>;
  assertBoundary(tenantId: string, subjectId: string, context: PlatformRequestContext): Promise<ServiceResult<{ allowed: boolean }>>;
}

export type LicenseSummary = {
  id: string;
  productSlug: string;
  status: string;
  seatsPurchased: number;
  seatsAssigned: number;
  renewalAt?: string;
};

export interface LicensingService extends PlatformService {
  listLicenses(subjectId: string, context: PlatformRequestContext): Promise<ServiceResult<LicenseSummary[]>>;
}

export type EntitlementCheck = {
  productSlug: string;
  action: string;
  resource: string;
};

export type EntitlementOutcome = {
  allowed: boolean;
  reason: string;
  policyId: string;
  evaluatedAt: string;
};

export interface EntitlementService extends PlatformService {
  evaluate(check: EntitlementCheck, context: PlatformRequestContext): Promise<ServiceResult<EntitlementOutcome>>;
}

export type NotificationMessage = {
  id?: string;
  channel: "email" | "in-app" | "sms" | "webhook";
  recipient: string;
  template: string;
  data: Record<string, unknown>;
  tenantId?: string;
};

export interface NotificationService extends PlatformService {
  send(message: NotificationMessage, context: PlatformRequestContext): Promise<ServiceResult<{ notificationId: string }>>;
}

export type AuditEventInput = {
  eventType: string;
  action: string;
  outcome: "success" | "failure" | "denied";
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
};

export interface AuditService extends PlatformService {
  append(event: AuditEventInput, context: PlatformRequestContext): Promise<ServiceResult<{ eventId: string }>>;
}

export type StoredObject = {
  key: string;
  contentType: string;
  size: number;
  checksum?: string;
  expiresAt?: string;
};

export interface StorageService extends PlatformService {
  createUpload(key: string, contentType: string, context: PlatformRequestContext): Promise<ServiceResult<{ uploadUrl: string }>>;
  createDownload(key: string, context: PlatformRequestContext): Promise<ServiceResult<{ downloadUrl: string; object: StoredObject }>>;
}

export type SearchDocument = {
  id: string;
  type: string;
  title: string;
  summary?: string;
  tenantId?: string;
  metadata?: Record<string, unknown>;
};

export interface SearchService extends PlatformService {
  search(query: string, context: PlatformRequestContext): Promise<ServiceResult<SearchDocument[]>>;
  index(document: SearchDocument, context: PlatformRequestContext): Promise<ServiceResult<{ indexed: boolean }>>;
}

export type BillingAccount = {
  customerId: string;
  status: string;
  currency?: string;
};

export interface BillingService extends PlatformService {
  getAccount(subjectId: string, context: PlatformRequestContext): Promise<ServiceResult<BillingAccount>>;
  createPortalSession(subjectId: string, returnUrl: string, context: PlatformRequestContext): Promise<ServiceResult<{ url: string }>>;
}

export type AiRequest = {
  capability: string;
  prompt: string;
  contextDocuments?: string[];
  requiresApproval?: boolean;
};

export type AiResponse = {
  output: string;
  model: string;
  confidence?: number;
  citations?: string[];
  requiresApproval: boolean;
};

export interface AiService extends PlatformService {
  execute(request: AiRequest, context: PlatformRequestContext): Promise<ServiceResult<AiResponse>>;
}
