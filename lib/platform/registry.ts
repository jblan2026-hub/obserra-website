import type {
  AiService,
  AuditService,
  BillingService,
  EntitlementService,
  HealthCheckResult,
  IdentityService,
  LicensingService,
  NotificationService,
  OrganizationService,
  PlatformRequestContext,
  PlatformService,
  PlatformServiceName,
  SearchService,
  StorageService,
  TenantService,
} from "./contracts";

type RegisteredServices = {
  identity: IdentityService;
  organization: OrganizationService;
  tenant: TenantService;
  licensing: LicensingService;
  entitlement: EntitlementService;
  notification: NotificationService;
  audit: AuditService;
  storage: StorageService;
  search: SearchService;
  billing: BillingService;
  ai: AiService;
};

export class PlatformServiceRegistry {
  private readonly services = new Map<PlatformServiceName, PlatformService>();

  register<K extends PlatformServiceName>(service: RegisteredServices[K]) {
    if (this.services.has(service.name)) {
      throw new Error(`Platform service already registered: ${service.name}`);
    }
    this.services.set(service.name, service);
    return this;
  }

  replace<K extends PlatformServiceName>(service: RegisteredServices[K]) {
    this.services.set(service.name, service);
    return this;
  }

  has(name: PlatformServiceName) {
    return this.services.has(name);
  }

  get<K extends PlatformServiceName>(name: K): RegisteredServices[K] {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Required platform service is not configured: ${name}`);
    }
    return service as RegisteredServices[K];
  }

  list() {
    return Array.from(this.services.keys()).sort();
  }

  async healthCheck(): Promise<HealthCheckResult[]> {
    const results = await Promise.all(
      Array.from(this.services.values()).map(async (service) => {
        const started = Date.now();
        try {
          const result = await service.healthCheck();
          return { ...result, latencyMs: result.latencyMs ?? Date.now() - started };
        } catch (error) {
          return {
            service: service.name,
            status: "unavailable" as const,
            checkedAt: new Date().toISOString(),
            latencyMs: Date.now() - started,
            message: error instanceof Error ? error.message : "Unknown service health-check failure",
          };
        }
      }),
    );
    return results.sort((left, right) => left.service.localeCompare(right.service));
  }
}

export function createPlatformRequestContext(input: {
  requestId?: string;
  correlationId?: string;
  subjectId?: string;
  tenantId?: string;
  organizationId?: string;
  roles?: string[];
}): PlatformRequestContext {
  return {
    requestId: input.requestId ?? crypto.randomUUID(),
    correlationId: input.correlationId ?? crypto.randomUUID(),
    subjectId: input.subjectId,
    tenantId: input.tenantId,
    organizationId: input.organizationId,
    roles: input.roles ?? [],
    issuedAt: new Date().toISOString(),
  };
}

export const platformServices = new PlatformServiceRegistry();
