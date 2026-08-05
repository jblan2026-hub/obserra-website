import { licenseRepository } from "./license-repository";
import {
  evaluateEntitlement,
  productEntitlementRegistry,
  type EntitlementDecision,
  type ProductEntitlementDefinition,
} from "./licensing";

export type UnifiedEntitlementRequest = {
  subjectId: string;
  tenantId?: string;
  email?: string;
  productSlug: string;
  action: "launch" | "download" | "manage";
};

export type UnifiedEntitlementResult = EntitlementDecision & {
  authoritative: boolean;
  source: "stripe" | "contract" | "manual" | "unavailable";
  deploymentModel?: string;
  plan?: string;
};

function defaultEntitlement(productSlug: string, action: UnifiedEntitlementRequest["action"]): ProductEntitlementDefinition {
  return {
    id: `${productSlug}.${action}`,
    productSlug,
    name: `${action} ${productSlug}`,
    description: `Requires an active verified license before ${action} access is granted.`,
    effect: "allow",
    resource: `${action === "download" ? "release" : "application"}:${productSlug}`,
    action,
  };
}

export async function resolveUnifiedEntitlement(request: UnifiedEntitlementRequest): Promise<UnifiedEntitlementResult> {
  const repositoryResult = await licenseRepository.listForSubject({
    subjectId: request.subjectId,
    tenantId: request.tenantId,
    email: request.email,
    productSlug: request.productSlug,
  });

  const entitlement =
    productEntitlementRegistry.find(
      (entry) => entry.productSlug === request.productSlug && entry.action === request.action,
    ) ?? defaultEntitlement(request.productSlug, request.action);

  if (!repositoryResult.authoritative) {
    return {
      allowed: false,
      reason: repositoryResult.message ?? "Authoritative licensing source is unavailable",
      entitlementId: entitlement.id,
      productSlug: request.productSlug,
      evaluatedAt: new Date().toISOString(),
      authoritative: false,
      source: repositoryResult.source,
    };
  }

  const license = repositoryResult.records
    .filter((record) => record.productSlug === request.productSlug)
    .sort((left, right) => Date.parse(right.startsAt) - Date.parse(left.startsAt))[0];

  const decision = evaluateEntitlement({
    entitlement,
    license,
    plan: license?.licenseType,
    deploymentModel: license?.deploymentModel,
  });

  return {
    ...decision,
    authoritative: repositoryResult.authoritative,
    source: repositoryResult.source,
    deploymentModel: license?.deploymentModel,
    plan: license?.licenseType,
  };
}
