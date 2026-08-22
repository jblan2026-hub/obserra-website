import {
  applicationsTenantId,
  durableApplicationEntitlement,
  durableApplicationEntitlements,
  type DurableApplicationEntitlement,
} from "./applications-commerce";
import type { LicenseRecord, LicenseType } from "./licensing";

export type LicenseQuery = {
  tenantId?: string;
  subjectId: string;
  email?: string;
  productSlug?: string;
};

export type LicenseRepositoryResult = {
  records: LicenseRecord[];
  source: "applications-commerce-ledger" | "contract" | "manual" | "unavailable";
  authoritative: boolean;
  message?: string;
};

export interface LicenseRepository {
  listForSubject(query: LicenseQuery): Promise<LicenseRepositoryResult>;
}

function normalizeLicenseType(value?: string): LicenseType {
  switch (value) {
    case "individual":
    case "professional":
    case "team":
    case "enterprise":
    case "government":
    case "education":
    case "trial":
    case "evaluation":
    case "internal":
      return value;
    default:
      return "professional";
  }
}

function licenseStatus(entitlement: DurableApplicationEntitlement): LicenseRecord["status"] {
  if (entitlement.allowed) return "active";
  if (entitlement.status === "revoked") return "revoked";
  if (entitlement.status === "suspended") return "suspended";
  return "pending";
}

function entitlementRecord(entitlement: DurableApplicationEntitlement, tenantId: string): LicenseRecord | null {
  if (!entitlement.subscriptionId || !entitlement.appSlug) return null;
  const seatsPurchased = Math.max(1, Number(entitlement.seatsPurchased ?? 1));
  return {
    id: entitlement.subscriptionId,
    tenantId,
    productSlug: entitlement.appSlug,
    licenseType: normalizeLicenseType(entitlement.plan),
    status: licenseStatus(entitlement),
    seatsPurchased,
    seatsAssigned: entitlement.allowed ? 1 : 0,
    startsAt: entitlement.startsAt ?? new Date(0).toISOString(),
    renewalAt: entitlement.currentPeriodEnd ?? undefined,
    supportLevel: entitlement.plan === "enterprise" ? "priority" : "standard",
    deploymentModel: entitlement.deploymentModel ?? "SaaS",
    maintenanceActive: entitlement.allowed,
    source: "applications-commerce-ledger",
    externalReference: entitlement.customerId,
  };
}

export class DurableApplicationsLicenseRepository implements LicenseRepository {
  async listForSubject(query: LicenseQuery): Promise<LicenseRepositoryResult> {
    try {
      const tenantId = applicationsTenantId(query.subjectId, query.tenantId);
      const entitlements = query.productSlug
        ? [await durableApplicationEntitlement(query.subjectId, tenantId, query.productSlug)]
        : await durableApplicationEntitlements(query.subjectId, tenantId);
      const records = entitlements
        .map((entry) => entitlementRecord(entry, tenantId))
        .filter((entry): entry is LicenseRecord => entry !== null);
      return {
        records,
        source: "applications-commerce-ledger",
        authoritative: true,
        message: records.length ? undefined : "No verified licenses were found for this account.",
      };
    } catch (error) {
      console.error("Applications durable license repository unavailable", {
        error: error instanceof Error ? error.name : "unknown",
      });
      return {
        records: [],
        source: "unavailable",
        authoritative: false,
        message: "The authoritative Applications license ledger is unavailable.",
      };
    }
  }
}

export const licenseRepository: LicenseRepository = new DurableApplicationsLicenseRepository();
