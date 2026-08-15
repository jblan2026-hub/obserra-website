import "server-only";

import {
  floridaClassDNonProductionExecutionAuthorized,
  floridaClassDRegulatedExecutionAuthorized,
} from "./florida-class-d-production-activation";

const REGULATED_API_PREFIX = "/api/florida-class-d";
const ACCEPTANCE_MUTATION_PATH = "/api/florida-class-d/admin/acceptance";
const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export type FloridaClassDMutationBoundaryDecision = {
  regulatedMutation: boolean;
  authorized: boolean;
  policy: "not_applicable" | "synthetic_nonproduction_only" | "regulated_execution";
};

export function floridaClassDMutationOriginAuthorized(
  requestUrl: string,
  originHeader: string | null,
) {
  if (!originHeader) return false;
  try {
    return new URL(originHeader).origin === new URL(requestUrl).origin;
  } catch {
    return false;
  }
}

function pathMatchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function evaluateFloridaClassDMutationBoundary(
  pathname: string,
  method: string,
): FloridaClassDMutationBoundaryDecision {
  const normalizedMethod = method.trim().toUpperCase();
  const regulatedMutation = pathMatchesPrefix(pathname, REGULATED_API_PREFIX) && MUTATION_METHODS.has(normalizedMethod);

  if (!regulatedMutation) {
    return { regulatedMutation: false, authorized: true, policy: "not_applicable" };
  }

  if (pathname === ACCEPTANCE_MUTATION_PATH) {
    return {
      regulatedMutation: true,
      authorized: floridaClassDNonProductionExecutionAuthorized(),
      policy: "synthetic_nonproduction_only",
    };
  }

  return {
    regulatedMutation: true,
    authorized: floridaClassDRegulatedExecutionAuthorized(),
    policy: "regulated_execution",
  };
}
