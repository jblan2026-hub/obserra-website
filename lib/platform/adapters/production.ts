import { auth, currentUser } from "@clerk/nextjs/server";
import { getStripe } from "../../stripe";
import { licenseRepository } from "../../license-repository";
import { resolveUnifiedEntitlement } from "../../unified-entitlements";
import type {
  BillingService,
  EntitlementService,
  HealthCheckResult,
  IdentityService,
  LicensingService,
  OrganizationRecord,
  OrganizationService,
  PlatformRequestContext,
  ServiceResult,
  TenantRecord,
  TenantService,
} from "../contracts";

function success<T>(data: T, source: string): ServiceResult<T> {
  return { ok: true, data, source };
}

function failure<T>(code: string, message: string, source: string, retryable = false): ServiceResult<T> {
  return { ok: false, error: { code, message, retryable }, source };
}

function health(service: HealthCheckResult["service"], configured: boolean, source: string): HealthCheckResult {
  return {
    service,
    status: configured ? "healthy" : "not-configured",
    checkedAt: new Date().toISOString(),
    message: configured ? `${source} adapter configured` : `${source} adapter is not configured`,
  };
}

export class ClerkIdentityService implements IdentityService {
  readonly name = "identity" as const;

  async healthCheck() {
    return health(this.name, Boolean(process.env.CLERK_SECRET_KEY), "Clerk");
  }

  async resolveSubject(context: PlatformRequestContext) {
    const session = await auth();
    if (!session.userId) return failure("identity.unauthenticated", "No authenticated Clerk session", "clerk");
    if (context.subjectId && context.subjectId !== session.userId) {
      return failure("identity.subject-mismatch", "Request subject does not match the authenticated session", "clerk");
    }

    const user = await currentUser();
    if (!user) return failure("identity.user-unavailable", "Authenticated user record is unavailable", "clerk", true);

    const organizationIds = session.orgId ? [session.orgId] : [];
    const roles = session.orgRole ? [session.orgRole] : context.roles;
    return success(
      {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        displayName: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || undefined,
        tenantIds: organizationIds,
        organizationIds,
        roles,
        assuranceLevel: "clerk-session",
        provider: "clerk",
      },
      "clerk",
    );
  }

  async revokeSessions(subjectId: string, context: PlatformRequestContext) {
    if (context.subjectId !== subjectId) {
      return failure("identity.revoke-denied", "Session revocation requires a matching subject context", "clerk");
    }
    return failure(
      "identity.revoke-not-implemented",
      "Administrative Clerk session revocation requires the Clerk backend client and an authorized operator workflow",
      "clerk",
    );
  }
}

export class ClerkOrganizationService implements OrganizationService {
  readonly name = "organization" as const;

  async healthCheck() {
    return health(this.name, Boolean(process.env.CLERK_SECRET_KEY), "Clerk organizations");
  }

  private async currentOrganization(): Promise<OrganizationRecord | undefined> {
    const session = await auth();
    if (!session.orgId) return undefined;
    return {
      id: session.orgId,
      name: session.orgSlug || session.orgId,
      status: "active",
      primaryTenantId: session.orgId,
      domains: [],
    };
  }

  async getOrganization(id: string, context: PlatformRequestContext) {
    const organization = await this.currentOrganization();
    if (!organization) return failure("organization.context-missing", "No active Clerk organization context", "clerk");
    if (organization.id !== id || (context.organizationId && context.organizationId !== id)) {
      return failure("organization.boundary-denied", "Organization boundary validation failed", "clerk");
    }
    return success(organization, "clerk");
  }

  async listForSubject(subjectId: string, context: PlatformRequestContext) {
    const session = await auth();
    if (!session.userId || session.userId !== subjectId || (context.subjectId && context.subjectId !== subjectId)) {
      return failure("organization.subject-denied", "Subject does not match the authenticated session", "clerk");
    }
    const organization = await this.currentOrganization();
    return success(organization ? [organization] : [], "clerk");
  }
}

export class ClerkTenantService implements TenantService {
  readonly name = "tenant" as const;

  async healthCheck() {
    return health(this.name, Boolean(process.env.CLERK_SECRET_KEY), "Clerk tenant context");
  }

  async getTenant(id: string, context: PlatformRequestContext) {
    const session = await auth();
    if (!session.orgId || session.orgId !== id || (context.tenantId && context.tenantId !== id)) {
      return failure("tenant.boundary-denied", "Tenant boundary validation failed", "clerk");
    }
    const tenant: TenantRecord = {
      id,
      organizationId: session.orgId,
      name: session.orgSlug || id,
      status: "active",
    };
    return success(tenant, "clerk");
  }

  async assertBoundary(tenantId: string, subjectId: string, context: PlatformRequestContext) {
    const session = await auth();
    const allowed = Boolean(
      session.userId &&
        session.userId === subjectId &&
        session.orgId === tenantId &&
        (!context.subjectId || context.subjectId === subjectId) &&
        (!context.tenantId || context.tenantId === tenantId),
    );
    return allowed
      ? success({ allowed: true }, "clerk")
      : failure("tenant.boundary-denied", "Authenticated subject is outside the requested tenant boundary", "clerk");
  }
}

export class StripeLicensingService implements LicensingService {
  readonly name = "licensing" as const;

  async healthCheck() {
    return health(this.name, Boolean(process.env.STRIPE_SECRET_KEY), "Stripe licensing");
  }

  async listLicenses(subjectId: string, context: PlatformRequestContext) {
    if (context.subjectId && context.subjectId !== subjectId) {
      return failure("licensing.subject-denied", "License query subject does not match request context", "stripe");
    }
    const result = await licenseRepository.listForSubject({
      subjectId,
      tenantId: context.tenantId,
    });
    if (!result.authoritative) {
      return failure("licensing.source-unavailable", result.message || "Authoritative license source unavailable", result.source, true);
    }
    return success(
      result.records.map((record) => ({
        id: record.id,
        productSlug: record.productSlug,
        status: record.status,
        seatsPurchased: record.seatsPurchased,
        seatsAssigned: record.seatsAssigned,
        renewalAt: record.renewalAt,
      })),
      result.source,
    );
  }
}

export class UnifiedPlatformEntitlementService implements EntitlementService {
  readonly name = "entitlement" as const;

  async healthCheck() {
    return health(this.name, Boolean(process.env.STRIPE_SECRET_KEY), "Unified entitlement engine");
  }

  async evaluate(check: { productSlug: string; action: string; resource: string }, context: PlatformRequestContext) {
    if (!context.subjectId) return failure("entitlement.subject-missing", "Entitlement evaluation requires a subject", "unified-entitlement");
    if (!(["launch", "download", "manage"] as const).includes(check.action as "launch" | "download" | "manage")) {
      return failure("entitlement.action-invalid", `Unsupported entitlement action: ${check.action}`, "unified-entitlement");
    }
    const result = await resolveUnifiedEntitlement({
      subjectId: context.subjectId,
      tenantId: context.tenantId,
      productSlug: check.productSlug,
      action: check.action as "launch" | "download" | "manage",
    });
    return success(
      {
        allowed: result.allowed,
        reason: result.reason,
        policyId: result.entitlementId,
        evaluatedAt: result.evaluatedAt,
      },
      result.source,
    );
  }
}

export class StripeBillingService implements BillingService {
  readonly name = "billing" as const;

  async healthCheck() {
    return health(this.name, Boolean(process.env.STRIPE_SECRET_KEY), "Stripe billing");
  }

  private async resolveCustomerId(subjectId: string) {
    const stripe = getStripe();
    const subscriptions = await stripe.subscriptions.search({
      query: `metadata['clerkUserId']:'${subjectId}'`,
      limit: 20,
    });
    const latest = subscriptions.data.sort((left, right) => right.created - left.created)[0];
    return latest ? (typeof latest.customer === "string" ? latest.customer : latest.customer.id) : undefined;
  }

  async getAccount(subjectId: string, context: PlatformRequestContext) {
    if (!process.env.STRIPE_SECRET_KEY) return failure("billing.not-configured", "Stripe billing is not configured", "stripe");
    if (context.subjectId && context.subjectId !== subjectId) {
      return failure("billing.subject-denied", "Billing account subject does not match request context", "stripe");
    }
    const customerId = await this.resolveCustomerId(subjectId);
    if (!customerId) return failure("billing.account-not-found", "No verified Stripe customer account was found", "stripe");
    return success({ customerId, status: "active" }, "stripe");
  }

  async createPortalSession(subjectId: string, returnUrl: string, context: PlatformRequestContext) {
    const account = await this.getAccount(subjectId, context);
    if (!account.ok || !account.data) return account as ServiceResult<{ url: string }>;
    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: account.data.customerId,
      return_url: returnUrl,
    });
    return success({ url: session.url }, "stripe");
  }
}
