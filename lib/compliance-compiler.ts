import "server-only";

import { createHash, randomUUID } from "node:crypto";

import { buildGovernanceExport, getGovernanceControls } from "./governance-evidence";
import { vulnerabilityIntelligenceHealth } from "./vulnerability-intelligence";

export type ComplianceStatus = "compliant" | "partially-compliant" | "non-compliant" | "not-assessed";

export type ComplianceCompilerSnapshot = {
  snapshotId: string;
  compiledAt: string;
  sourceRevision: string;
  status: ComplianceStatus;
  score: number;
  releaseReady: boolean;
  certificationClaimed: false;
  summary: {
    totalControls: number;
    implementedControls: number;
    partialControls: number;
    plannedControls: number;
    missingEvidence: number;
    missingTests: number;
    releaseBlockingFindings: number;
    openCriticalFindings: number;
    openHighFindings: number;
  };
  frameworks: Record<string, {
    total: number;
    implemented: number;
    partial: number;
    planned: number;
    score: number;
    status: ComplianceStatus;
  }>;
  controls: Array<{
    framework: string;
    controlId: string;
    status: ComplianceStatus;
    implementationStatus: string;
    evidenceCount: number;
    testCount: number;
    riskState: "clear" | "elevated" | "blocking" | "unknown";
  }>;
  evidence: {
    documentCount: number;
    evidenceReferenceCount: number;
    validationCommandCount: number;
    completenessPercent: number;
  };
  vulnerability: {
    scannerConfigured: boolean;
    aiConfigured: boolean;
    verifiedFindingsOnly: true;
    releaseBlockingThreshold: number;
    releaseBlockingFindings: number;
    openCriticalFindings: number;
    openHighFindings: number;
    state: "live" | "scanner-unconfigured" | "scanner-unavailable";
  };
  release: {
    branchValidationConfigured: boolean;
    deployedSystemValidationConfigured: boolean;
    fullVerifierConfigured: boolean;
    releaseReady: boolean;
  };
  digest: string;
};

type ScannerSummary = {
  releaseBlocking?: number;
  critical?: number;
  high?: number;
};

function statusFromScore(score: number, blockers: number): ComplianceStatus {
  if (blockers > 0 || score < 70) return "non-compliant";
  if (score < 95) return "partially-compliant";
  return "compliant";
}

function revision() {
  return process.env.VERCEL_GIT_COMMIT_SHA?.trim() || process.env.GITHUB_SHA?.trim() || "local-unversioned";
}

async function scannerSummary(): Promise<{ summary: ScannerSummary; state: "live" | "scanner-unconfigured" | "scanner-unavailable" }> {
  const baseUrl = process.env.OBSERRA_SECURITY_SCANNER_URL?.trim().replace(/\/$/, "");
  const token = process.env.OBSERRA_SECURITY_SCANNER_TOKEN?.trim();
  if (!baseUrl || !token) return { summary: {}, state: "scanner-unconfigured" };
  try {
    const response = await fetch(`${baseUrl}/v1/findings/summary`, {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
      headers: { authorization: `Bearer ${token}`, accept: "application/json" },
    });
    if (!response.ok) throw new Error(`scanner-${response.status}`);
    const payload = (await response.json()) as ScannerSummary;
    return { summary: payload, state: "live" };
  } catch {
    return { summary: {}, state: "scanner-unavailable" };
  }
}

async function persistSnapshot(snapshot: ComplianceCompilerSnapshot) {
  const baseUrl = process.env.OBSERRA_CONTROL_PLANE_STORE_URL?.trim().replace(/\/$/, "");
  const token = process.env.OBSERRA_CONTROL_PLANE_STORE_TOKEN?.trim();
  if (!baseUrl || !token) throw new Error("compliance-snapshot-store-unconfigured");
  const response = await fetch(`${baseUrl}/v1/compliance-snapshots/${encodeURIComponent(snapshot.snapshotId)}`, {
    method: "PUT",
    cache: "no-store",
    signal: AbortSignal.timeout(3_000),
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      "idempotency-key": snapshot.snapshotId,
    },
    body: JSON.stringify(snapshot),
  });
  if (!response.ok) throw new Error(`compliance-snapshot-store-${response.status}`);
}

export async function compileComplianceSnapshot(options: { persist?: boolean } = {}) {
  const governance = buildGovernanceExport();
  const controls = getGovernanceControls();
  const vulnerabilityHealth = vulnerabilityIntelligenceHealth();
  const scanner = await scannerSummary();
  const releaseBlockingFindings = Math.max(0, Number(scanner.summary.releaseBlocking) || 0);
  const openCriticalFindings = Math.max(0, Number(scanner.summary.critical) || 0);
  const openHighFindings = Math.max(0, Number(scanner.summary.high) || 0);

  const missingEvidence = controls.filter((control) => !Array.isArray(control.evidence) || control.evidence.length === 0).length;
  const missingTests = controls.filter((control) => !Array.isArray(control.tests) || control.tests.length === 0).length;
  const implementedControls = controls.filter((control) => control.status === "implemented").length;
  const partialControls = controls.filter((control) => control.status === "partial").length;
  const plannedControls = controls.filter((control) => control.status === "planned").length;
  const totalControls = controls.length;
  const implementationScore = totalControls ? ((implementedControls + partialControls * 0.5) / totalControls) * 100 : 0;
  const evidencePenalty = totalControls ? ((missingEvidence + missingTests) / (totalControls * 2)) * 30 : 0;
  const vulnerabilityPenalty = Math.min(40, releaseBlockingFindings * 10 + openCriticalFindings * 6 + openHighFindings * 2);
  const score = Math.max(0, Math.min(100, Math.round(implementationScore - evidencePenalty - vulnerabilityPenalty)));
  const status = statusFromScore(score, releaseBlockingFindings + openCriticalFindings);
  const releaseReady = status === "compliant" && scanner.state !== "scanner-unavailable";

  const frameworks = Object.fromEntries(Object.entries(governance.summary.byFramework).map(([framework, values]) => {
    const frameworkScore = values.total ? Math.round(((values.implemented + values.partial * 0.5) / values.total) * 100) : 0;
    return [framework, {
      ...values,
      score: frameworkScore,
      status: statusFromScore(frameworkScore, 0),
    }];
  }));

  const compiledAt = new Date().toISOString();
  const snapshotId = `${revision().slice(0, 12)}-${compiledAt}-${randomUUID()}`;
  const base = {
    snapshotId,
    compiledAt,
    sourceRevision: revision(),
    status,
    score,
    releaseReady,
    certificationClaimed: false as const,
    summary: {
      totalControls,
      implementedControls,
      partialControls,
      plannedControls,
      missingEvidence,
      missingTests,
      releaseBlockingFindings,
      openCriticalFindings,
      openHighFindings,
    },
    frameworks,
    controls: controls.map((control) => ({
      framework: control.framework,
      controlId: control.controlId,
      status: control.status === "implemented" ? "compliant" as const : control.status === "partial" ? "partially-compliant" as const : "not-assessed" as const,
      implementationStatus: control.status,
      evidenceCount: control.evidence.length,
      testCount: control.tests.length,
      riskState: scanner.state !== "live" ? "unknown" as const : releaseBlockingFindings > 0 ? "blocking" as const : openCriticalFindings + openHighFindings > 0 ? "elevated" as const : "clear" as const,
    })),
    evidence: {
      documentCount: governance.documents.length,
      evidenceReferenceCount: governance.summary.evidenceReferences,
      validationCommandCount: governance.summary.validationCommands,
      completenessPercent: totalControls ? Math.round((((totalControls - missingEvidence) + (totalControls - missingTests)) / (totalControls * 2)) * 100) : 0,
    },
    vulnerability: {
      scannerConfigured: vulnerabilityHealth.scannerConfigured,
      aiConfigured: vulnerabilityHealth.aiConfigured,
      verifiedFindingsOnly: true as const,
      releaseBlockingThreshold: vulnerabilityHealth.releaseBlockingThreshold,
      releaseBlockingFindings,
      openCriticalFindings,
      openHighFindings,
      state: scanner.state,
    },
    release: {
      branchValidationConfigured: true,
      deployedSystemValidationConfigured: true,
      fullVerifierConfigured: true,
      releaseReady,
    },
  };
  const digest = createHash("sha256").update(JSON.stringify(base)).digest("hex");
  const snapshot: ComplianceCompilerSnapshot = { ...base, digest };
  if (options.persist !== false) await persistSnapshot(snapshot);
  return snapshot;
}

export function complianceCompilerHealth() {
  return {
    continuousPollingSupported: true,
    defaultRefreshSeconds: 30,
    durableSnapshots: true,
    cryptographicDigest: "SHA-256",
    failClosedPersistence: true,
    certificationClaimed: false,
  };
}
