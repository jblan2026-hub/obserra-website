import "server-only";

import nist from "../compliance/nist-security-by-design-crosswalk.json";
import iso27001 from "../compliance/iso27001-security-by-design-crosswalk.json";
import soc2 from "../compliance/soc2-security-by-design-crosswalk.json";
import privacy from "../compliance/privacy-security-by-design-crosswalk.json";

type RawControl = {
  controlId: string;
  category?: string;
  domain?: string;
  capability: string;
  evidence: string[];
  tests: string[];
  status: "implemented" | "planned" | "partial";
  csf?: string[];
  ssdf?: string[];
  gdpr?: string[];
  iso27701?: string;
};

export type GovernanceControl = RawControl & {
  framework: "NIST" | "ISO 27001" | "SOC 2" | "Privacy";
};

export type AuditableDocument = {
  id: string;
  category: "Governance" | "Security" | "Privacy" | "Release" | "Operations" | "Architecture" | "Testing";
  title: string;
  source: string;
  description: string;
  exportable: boolean;
  evidenceType: "policy" | "crosswalk" | "source" | "test" | "workflow" | "release";
};

const controls: GovernanceControl[] = [
  ...(nist.controls as RawControl[]).map((control) => ({ ...control, framework: "NIST" as const })),
  ...(iso27001.controls as RawControl[]).map((control) => ({ ...control, framework: "ISO 27001" as const })),
  ...(soc2.controls as RawControl[]).map((control) => ({ ...control, framework: "SOC 2" as const })),
  ...(privacy.controls as RawControl[]).map((control) => ({ ...control, framework: "Privacy" as const })),
];

const auditableDocuments: AuditableDocument[] = [
  { id: "nist-crosswalk", category: "Governance", title: "NIST Security-by-Design Crosswalk", source: "compliance/nist-security-by-design-crosswalk.json", description: "Individual NIST SP 800-53, CSF 2.0, and SSDF mappings with implementation and test evidence.", exportable: true, evidenceType: "crosswalk" },
  { id: "iso-crosswalk", category: "Governance", title: "ISO/IEC 27001 Annex A Crosswalk", source: "compliance/iso27001-security-by-design-crosswalk.json", description: "ISO control identifiers mapped to Obserra implementation evidence without reproducing licensed text.", exportable: true, evidenceType: "crosswalk" },
  { id: "soc2-crosswalk", category: "Governance", title: "SOC 2 Trust Services Crosswalk", source: "compliance/soc2-security-by-design-crosswalk.json", description: "SOC 2 criteria mapped to security, availability, confidentiality, processing integrity, and privacy evidence.", exportable: true, evidenceType: "crosswalk" },
  { id: "privacy-crosswalk", category: "Privacy", title: "Privacy Security-by-Design Crosswalk", source: "compliance/privacy-security-by-design-crosswalk.json", description: "NIST Privacy Framework, ISO/IEC 27701, and GDPR-aligned evidence mapping.", exportable: true, evidenceType: "crosswalk" },
  { id: "release-workflow", category: "Release", title: "Branch and Deployed-System Validation Workflow", source: ".github/workflows/branch-validation.yml", description: "Release-blocking CI workflow covering static, security, operational, framework, and deployed-system checks.", exportable: true, evidenceType: "workflow" },
  { id: "release-command", category: "Release", title: "Complete Release Verification Command", source: "package.json#verify:release", description: "Authoritative command sequence for linting, tests, framework gates, rollback evidence, and production build.", exportable: true, evidenceType: "release" },
  { id: "security-resilience", category: "Security", title: "Security and Resilience Readiness Evidence", source: "scripts/security-resilience-readiness.mjs", description: "Secure defaults, bounded inputs, abuse resistance, failure behavior, and resilience checks.", exportable: true, evidenceType: "test" },
  { id: "data-protection", category: "Privacy", title: "Data Protection Readiness Evidence", source: "scripts/data-protection-readiness.mjs", description: "Privacy, secret handling, caching, disclosure, and data-protection validation.", exportable: true, evidenceType: "test" },
  { id: "supply-chain", category: "Security", title: "Software Supply Chain Evidence", source: "scripts/supply-chain-readiness.mjs", description: "Dependency, package-lock, release artifact, and software-supply-chain validation.", exportable: true, evidenceType: "test" },
  { id: "rollback", category: "Release", title: "Rollback and Recovery Evidence", source: "scripts/rollback-readiness-gate.mjs", description: "Rollback prerequisites, evidence, and recovery validation for production changes.", exportable: true, evidenceType: "test" },
  { id: "operational-slo", category: "Operations", title: "Operational Service-Level Evidence", source: "scripts/operational-slo-readiness.mjs", description: "Health, timeout, service-level, monitoring, and operational readiness checks.", exportable: true, evidenceType: "test" },
  { id: "cross-target", category: "Operations", title: "Cross-Target Deployment Evidence", source: "scripts/cross-target-contract.mjs", description: "Shared contract and deployment parity evidence across all three Vercel projects.", exportable: true, evidenceType: "test" },
  { id: "identity", category: "Security", title: "Passwordless Identity and Step-Up Evidence", source: "lib/passwordless-auth-policy.ts", description: "Passwordless authentication, recovery, passkey, session, and recent-authentication controls.", exportable: true, evidenceType: "source" },
  { id: "session-containment", category: "Security", title: "Session and Token Containment Evidence", source: "lib/saas-session-revocation.ts", description: "Durable session, token, and organization-wide containment mechanisms.", exportable: true, evidenceType: "source" },
  { id: "health-contract", category: "Operations", title: "Production Health Contract", source: "app/api/health/route.ts", description: "Sanitized platform, storage, token, and readiness health evidence.", exportable: true, evidenceType: "source" },
  { id: "governance-center", category: "Governance", title: "Governance Center Implementation", source: "app/admin/governance/page.tsx", description: "Owner-only control center for framework coverage, auditable documents, exports, and evidence review.", exportable: true, evidenceType: "source" },
];

export function getGovernanceControls() {
  return controls;
}

export function getAuditableDocuments() {
  return auditableDocuments;
}

export function getGovernanceSummary() {
  const byFramework = Object.fromEntries(
    ["NIST", "ISO 27001", "SOC 2", "Privacy"].map((framework) => {
      const frameworkControls = controls.filter((control) => control.framework === framework);
      return [framework, {
        total: frameworkControls.length,
        implemented: frameworkControls.filter((control) => control.status === "implemented").length,
        partial: frameworkControls.filter((control) => control.status === "partial").length,
        planned: frameworkControls.filter((control) => control.status === "planned").length,
      }];
    }),
  );
  const implemented = controls.filter((control) => control.status === "implemented").length;
  return {
    generatedAt: new Date().toISOString(),
    totalControls: controls.length,
    implementedControls: implemented,
    plannedControls: controls.filter((control) => control.status === "planned").length,
    coveragePercent: controls.length ? Math.round((implemented / controls.length) * 100) : 0,
    evidenceReferences: new Set(controls.flatMap((control) => control.evidence)).size,
    validationCommands: new Set(controls.flatMap((control) => control.tests)).size,
    auditableDocuments: auditableDocuments.length,
    byFramework,
  };
}

export function buildGovernanceExport() {
  return {
    title: "Obserra Governance, Security, Privacy, and Release Evidence Package",
    company: "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC",
    generatedAt: new Date().toISOString(),
    summary: getGovernanceSummary(),
    controls,
    documents: auditableDocuments,
    disclaimers: [
      "This package provides implementation evidence and readiness mappings; it is not a certification, legal opinion, or independent auditor attestation.",
      "Licensed standards text is not reproduced. Control identifiers and Obserra-authored implementation summaries are provided for evidence traceability.",
    ],
  };
}
