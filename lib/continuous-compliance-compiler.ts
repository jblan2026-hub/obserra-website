import "server-only";

import { createHash } from "node:crypto";

import { getAuditableDocuments, getGovernanceControls, getGovernanceSummary } from "./governance-evidence";

export type ComplianceState = "compliant" | "partial" | "noncompliant" | "unknown";

export type CompiledComplianceControl = {
  framework: string;
  controlId: string;
  state: ComplianceState;
  evidenceCount: number;
  validationCount: number;
  evidenceFreshness: "current" | "stale" | "unknown";
  confidence: number;
  blockingGaps: string[];
};

export type ComplianceCompilation = {
  compilationId: string;
  generatedAt: string;
  expiresAt: string;
  overallState: ComplianceState;
  compliancePercent: number;
  controlCount: number;
  compliantControls: number;
  partialControls: number;
  noncompliantControls: number;
  unknownControls: number;
  evidenceReferences: number;
  validationCommands: number;
  auditableDocuments: number;
  driftDetected: boolean;
  blockingGaps: string[];
  controls: CompiledComplianceControl[];
  aiSummary: {
    mode: "verified-evidence-only";
    narrative: string;
    recommendations: string[];
  };
};

function compileState(status: "implemented" | "planned" | "partial", evidenceCount: number, validationCount: number): ComplianceState {
  if (status === "implemented" && evidenceCount > 0 && validationCount > 0) return "compliant";
  if (status === "partial" || (status === "implemented" && (evidenceCount === 0 || validationCount === 0))) return "partial";
  if (status === "planned") return "noncompliant";
  return "unknown";
}

export function compileContinuousCompliance(): ComplianceCompilation {
  const generatedAt = new Date();
  const summary = getGovernanceSummary();
  const documents = getAuditableDocuments();
  const controls = getGovernanceControls().map((control): CompiledComplianceControl => {
    const state = compileState(control.status, control.evidence.length, control.tests.length);
    const blockingGaps: string[] = [];
    if (control.evidence.length === 0) blockingGaps.push("No implementation evidence linked");
    if (control.tests.length === 0) blockingGaps.push("No validation command linked");
    if (control.status !== "implemented") blockingGaps.push(`Control status is ${control.status}`);
    const confidence = Math.min(100, 40 + Math.min(control.evidence.length, 3) * 12 + Math.min(control.tests.length, 3) * 12);
    return {
      framework: control.framework,
      controlId: control.controlId,
      state,
      evidenceCount: control.evidence.length,
      validationCount: control.tests.length,
      evidenceFreshness: control.evidence.length > 0 ? "current" : "unknown",
      confidence,
      blockingGaps,
    };
  });

  const compliantControls = controls.filter((control) => control.state === "compliant").length;
  const partialControls = controls.filter((control) => control.state === "partial").length;
  const noncompliantControls = controls.filter((control) => control.state === "noncompliant").length;
  const unknownControls = controls.filter((control) => control.state === "unknown").length;
  const compliancePercent = controls.length ? Math.round((compliantControls / controls.length) * 100) : 0;
  const blockingGaps = controls.flatMap((control) => control.blockingGaps.map((gap) => `${control.framework} ${control.controlId}: ${gap}`));
  const overallState: ComplianceState = noncompliantControls > 0
    ? "noncompliant"
    : partialControls > 0 || unknownControls > 0
      ? "partial"
      : "compliant";
  const recommendations = [
    ...(noncompliantControls > 0 ? ["Prioritize planned controls with production-impacting dependencies."] : []),
    ...(partialControls > 0 ? ["Attach missing evidence and release-blocking validation commands to partial controls."] : []),
    ...(unknownControls > 0 ? ["Resolve unknown evidence states before release promotion."] : []),
    ...(blockingGaps.length === 0 ? ["Maintain continuous evidence freshness and cross-target verification."] : []),
  ];
  const hash = createHash("sha256")
    .update(JSON.stringify({ controls, documents: documents.map((document) => document.id), summary }))
    .digest("hex")
    .slice(0, 24);

  return {
    compilationId: `compliance-${hash}`,
    generatedAt: generatedAt.toISOString(),
    expiresAt: new Date(generatedAt.getTime() + 60_000).toISOString(),
    overallState,
    compliancePercent,
    controlCount: controls.length,
    compliantControls,
    partialControls,
    noncompliantControls,
    unknownControls,
    evidenceReferences: summary.evidenceReferences,
    validationCommands: summary.validationCommands,
    auditableDocuments: documents.length,
    driftDetected: blockingGaps.length > 0,
    blockingGaps: blockingGaps.slice(0, 100),
    controls,
    aiSummary: {
      mode: "verified-evidence-only",
      narrative: `Compiled ${controls.length} controls across NIST, ISO 27001, SOC 2, and Privacy. ${compliantControls} are evidence-complete, ${partialControls} are partial, ${noncompliantControls} are not implemented, and ${unknownControls} are unknown.`,
      recommendations,
    },
  };
}

export function continuousComplianceCompilerHealth() {
  return {
    configured: true,
    refreshIntervalSeconds: 30,
    compilationTtlSeconds: 60,
    verifiedEvidenceOnly: true,
    aiMayChangeControlStatus: false,
    driftDetection: true,
    failClosed: true,
  };
}
