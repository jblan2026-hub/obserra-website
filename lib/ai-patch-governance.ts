import "server-only";

export type PatchRisk = "low" | "moderate" | "high" | "critical";
export type PatchMode = "observe" | "recommend" | "approval_required" | "autonomous_low_risk";
export type PatchTarget = "website-live" | "website-secondary" | "integrated-services" | "academy" | "eios" | "saas-application";

export type PatchProposal = {
  proposalId: string;
  target: PatchTarget;
  summary: string;
  requestedChange: string;
  risk: PatchRisk;
  mode: PatchMode;
  requiresApproval: boolean;
  requiresPreview: true;
  requiresRollbackPlan: true;
  requiresSecurityScan: true;
  requiresEndToEndValidation: true;
  prohibitedDirectProductionMutation: true;
  recommendedSequence: string[];
  evidenceRequirements: string[];
};

const HIGH_IMPACT_TERMS = [
  "authentication",
  "authorization",
  "billing",
  "payment",
  "database migration",
  "delete",
  "credential",
  "encryption",
  "firewall",
  "production data",
  "identity",
];

export function assessPatchRisk(requestedChange: string): PatchRisk {
  const normalized = requestedChange.toLowerCase();
  if (HIGH_IMPACT_TERMS.some((term) => normalized.includes(term))) return "high";
  if (/dependency|configuration|api|route|schema|workflow/.test(normalized)) return "moderate";
  return "low";
}

export function createPatchProposal(input: {
  proposalId: string;
  target: PatchTarget;
  requestedChange: string;
  mode: PatchMode;
}): PatchProposal {
  const requestedChange = input.requestedChange.trim();
  if (!/^[A-Za-z0-9._:@/ -]{10,2000}$/.test(requestedChange)) throw new Error("Invalid patch request");
  if (!/^[A-Za-z0-9_-]{8,120}$/.test(input.proposalId)) throw new Error("Invalid proposal identifier");

  const risk = assessPatchRisk(requestedChange);
  const requiresApproval = input.mode !== "observe" && (input.mode !== "autonomous_low_risk" || risk !== "low");

  return {
    proposalId: input.proposalId,
    target: input.target,
    summary: `AI-assisted patch proposal for ${input.target}`,
    requestedChange,
    risk,
    mode: input.mode,
    requiresApproval,
    requiresPreview: true,
    requiresRollbackPlan: true,
    requiresSecurityScan: true,
    requiresEndToEndValidation: true,
    prohibitedDirectProductionMutation: true,
    recommendedSequence: [
      "Capture current release identity and dependency graph",
      "Perform impact and security analysis",
      "Generate complete-file patch in an isolated branch",
      "Run lint, unit, integration, framework, privacy, and supply-chain gates",
      "Deploy preview across all applicable targets",
      "Run end-to-end journeys and performance-isolation checks",
      "Require approval when risk or policy demands it",
      "Promote through staged rollout with health monitoring",
      "Automatically stop and roll back on failed success criteria",
      "Write immutable governance and release evidence",
    ],
    evidenceRequirements: [
      "AI recommendation and confidence",
      "Human approval or autonomous-policy decision",
      "Source commit and changed-file inventory",
      "Dependency and component impact analysis",
      "Security, privacy, and framework mappings",
      "Preview deployment evidence",
      "End-to-end and regression results",
      "Performance and availability results",
      "Rollback plan and rollback validation",
      "Production verification and audit outcome",
    ],
  };
}

export function aiPatchGovernanceHealth() {
  return {
    configured: true,
    directProductionMutationAllowed: false,
    previewRequired: true,
    rollbackRequired: true,
    securityScanRequired: true,
    endToEndRequired: true,
    highImpactApprovalRequired: true,
    autonomousScope: "pre-approved low-risk maintenance only",
    failClosed: true,
  };
}
