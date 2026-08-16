import "server-only";

import {
  floridaClassDNonProductionExecutionAuthorized,
  floridaClassDRegulatedExecutionAuthorized,
} from "./florida-class-d-production-activation";
import { floridaClassDOwnerPreviewExecutionAuthorized } from "./florida-class-d-owner-preview";

const REGULATED_API_PREFIX = "/api/florida-class-d";
const ACCEPTANCE_MUTATION_PATH = "/api/florida-class-d/admin/acceptance";
const OWNER_PREVIEW_DAILY_PATH = "/api/florida-class-d/owner-preview/daily";
const OWNER_PREVIEW_COURSEWARE_PATH = "/api/florida-class-d/owner-preview/courseware";
const OWNER_PREVIEW_ACTIVATION_REQUEST_PATH = "/api/florida-class-d/owner-preview/activation-request";
const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export type FloridaClassDMutationBoundaryDecision = {
  regulatedMutation: boolean;
  authorized: boolean;
  policy: "not_applicable" | "synthetic_nonproduction_only" | "owner_preview_provider_diagnostic" | "owner_preview_courseware" | "owner_preview_activation_request" | "regulated_execution";
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

  if (pathname === OWNER_PREVIEW_DAILY_PATH) {
    return {
      regulatedMutation: true,
      authorized: floridaClassDOwnerPreviewExecutionAuthorized(),
      policy: "owner_preview_provider_diagnostic",
    };
  }

  if (pathname === OWNER_PREVIEW_COURSEWARE_PATH) {
    return {
      regulatedMutation: true,
      authorized: floridaClassDOwnerPreviewExecutionAuthorized(),
      policy: "owner_preview_courseware",
    };
  }

  if (pathname === OWNER_PREVIEW_ACTIVATION_REQUEST_PATH) {
    return {
      regulatedMutation: true,
      authorized: floridaClassDOwnerPreviewExecutionAuthorized(),
      policy: "owner_preview_activation_request",
    };
  }

  return {
    regulatedMutation: true,
    authorized: floridaClassDRegulatedExecutionAuthorized(),
    policy: "regulated_execution",
  };
}
