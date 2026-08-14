import "server-only";

import {
  getFloridaClassDProductionActivationReport,
  type FloridaClassDProductionActivationReport,
} from "./florida-class-d-production-activation";
import {
  getFloridaClassDProductionRuntimeReadiness,
  type FloridaClassDRuntimeReadinessReport,
} from "./florida-class-d-runtime-readiness";

export type FloridaClassDOperationalState = "live" | "ready" | "degraded" | "fail_closed";

export type FloridaClassDResilienceSnapshot = {
  generatedAt: string;
  service: "florida-class-d-lms";
  liveness: {
    state: "live";
    processUptimeSeconds: number;
  };
  readiness: {
    state: "ready" | "degraded";
    technicalReadinessComplete: boolean;
    blockingCount: number;
  };
  highAvailability: {
    state: "ready" | "degraded";
    requiredCheckCount: number;
    passingCheckCount: number;
    failingCheckKeys: string[];
  };
  productionActivation: {
    state: "authorized" | "fail_closed";
    authorized: boolean;
    readyForOwnerActivationDecision: boolean;
    blockingCount: number;
  };
  overallState: FloridaClassDOperationalState;
  runtime: FloridaClassDRuntimeReadinessReport;
  activation: FloridaClassDProductionActivationReport;
  secretsExposed: false;
};

export const FLORIDA_CLASS_D_RESILIENCE_POLICY = {
  policyVersion: "2026-08-13-gate-27-v1",
  livenessIsNotReadiness: true,
  readinessIsNotActivationAuthorization: true,
  activationAuthorizationIsNotFdacsApproval: true,
  publicHealthResponsesSuppressDetails: true,
  adminDetailedHealthRequiresAuthorization: true,
  healthResponsesMustNotBeCached: true,
  haFailurePreventsReadyState: true,
  technicalFailurePreventsReadyState: true,
  secretsExposed: false,
} as const;

function highAvailabilityState(activation: FloridaClassDProductionActivationReport) {
  const checks = activation.checks.filter((entry) => entry.key.startsWith("ha:"));
  const failing = checks.filter((entry) => !entry.ready).map((entry) => entry.key);
  return {
    state: failing.length === 0 && checks.length > 0 ? "ready" as const : "degraded" as const,
    requiredCheckCount: checks.length,
    passingCheckCount: checks.length - failing.length,
    failingCheckKeys: failing,
  };
}

export function getFloridaClassDResilienceSnapshot(): FloridaClassDResilienceSnapshot {
  const runtime = getFloridaClassDProductionRuntimeReadiness();
  const activation = getFloridaClassDProductionActivationReport();
  const ha = highAvailabilityState(activation);
  const technicalReadinessComplete = runtime.technicalReadinessComplete;
  const ready = technicalReadinessComplete && ha.state === "ready";

  const overallState: FloridaClassDOperationalState = activation.productionActivationAuthorized
    ? ready ? "ready" : "degraded"
    : ready ? "fail_closed" : "degraded";

  return {
    generatedAt: new Date().toISOString(),
    service: "florida-class-d-lms",
    liveness: {
      state: "live",
      processUptimeSeconds: Math.max(0, Math.floor(process.uptime())),
    },
    readiness: {
      state: ready ? "ready" : "degraded",
      technicalReadinessComplete,
      blockingCount: runtime.nonLicenseBlockingKeys.length,
    },
    highAvailability: ha,
    productionActivation: {
      state: activation.productionActivationAuthorized ? "authorized" : "fail_closed",
      authorized: activation.productionActivationAuthorized,
      readyForOwnerActivationDecision: activation.readyForOwnerActivationDecision,
      blockingCount: activation.blockingKeys.length,
    },
    overallState,
    runtime,
    activation,
    secretsExposed: false,
  };
}

export function getFloridaClassDPublicLiveness() {
  return {
    service: "florida-class-d-lms" as const,
    status: "live" as const,
  };
}

export function getFloridaClassDPublicReadiness() {
  const snapshot = getFloridaClassDResilienceSnapshot();
  const ready = snapshot.readiness.state === "ready";
  return {
    service: snapshot.service,
    status: ready ? "ready" as const : "not_ready" as const,
  };
}
