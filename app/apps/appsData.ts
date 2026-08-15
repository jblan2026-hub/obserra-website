export type AppStatus = "Available" | "Pilot" | "Coming Soon";

export type AppCategory =
  | "Cybersecurity"
  | "Identity"
  | "GRC"
  | "AI Governance"
  | "Operations"
  | "Intelligence"
  | "Learning";

export type DeploymentMode = "Local / on-prem" | "SaaS" | "Outbound tenant agent";
export type VerificationState = "Verified" | "Not verified" | "Not offered";
export type ReleaseSurface = "Demo" | "Live";

export type VerificationRecord = {
  state: VerificationState;
  version: string | null;
  verifiedAt: string | null;
  evidence: string;
};

export type DeploymentRecord = {
  mode: DeploymentMode;
  state: VerificationState;
  evidence: string;
};

export type VerifiedAction = {
  kind: "Demo" | "Launch" | "Download" | "Subscribe";
  label: string;
  href: string;
  evidence: string;
};

export type MarketplaceApp = {
  slug: string;
  name: string;
  /** Fail-closed compatibility value for protected commerce/API consumers. */
  status: AppStatus;
  lifecycle: "Internal validation";
  category: AppCategory;
  value: string;
  focusAreas: string[];
  integrationReview: string[];
  positioning: {
    standalone: string;
    eios: string;
  };
  release: Record<ReleaseSurface, VerificationRecord>;
  deploymentModes: DeploymentRecord[];
  releaseEvidence: {
    source: string;
    sourceVersion: string;
    evidenceDate: string;
    summary: string;
  };
  actions: VerifiedAction[];
  /** Compatibility fields retained for existing protected portal/API imports. */
  features: string[];
  integrations: string[];
  deployment: DeploymentMode[];
  pricing: string;
  documentation: string[];
  faq: { q: string; a: string }[];
};

export type RoadmapConcept = {
  name: string;
  category: AppCategory;
  status: "Roadmap concept";
};

const NO_PUBLIC_RELEASE =
  "Source exists, but no approved public release, customer artifact, or release-bound endpoint is published in the website catalog.";
const NO_DEMO_ENDPOINT = "No exact approved demo endpoint is bound in the website Applications catalog.";
const NO_LIVE_ENDPOINT = "No exact approved live endpoint is bound in the website Applications catalog.";

function state(
  value: VerificationState,
  evidence: string,
  version: string | null = null,
  verifiedAt: string | null = null,
): VerificationRecord {
  return { state: value, version, verifiedAt, evidence };
}

function mode(mode: DeploymentMode, value: VerificationState, evidence: string): DeploymentRecord {
  return { mode, state: value, evidence };
}

type ReviewedProduct = Pick<
  MarketplaceApp,
  | "slug"
  | "name"
  | "category"
  | "value"
  | "focusAreas"
  | "integrationReview"
  | "positioning"
  | "release"
  | "deploymentModes"
  | "releaseEvidence"
  | "faq"
> & {
  /** Source-order compatibility contract for the read-only production-worker parser. */
  status: "Coming Soon";
  /** Literal reviewed scope for the read-only market-planning parser. */
  features: string[];
  /** Literal reviewed integration scope for the read-only market-planning parser. */
  integrations: string[];
  /** Intended worker review target only; never surfaced as verified availability. */
  deployment: "On-Premises"[];
};

function reviewedProduct(product: ReviewedProduct): MarketplaceApp {
  return {
    ...product,
    status: "Coming Soon",
    lifecycle: "Internal validation",
    actions: [],
    features: product.focusAreas,
    integrations: product.integrationReview,
    deployment: [],
    pricing: "Commercial availability is not published in the checked website release catalog.",
    documentation: ["Reviewed product source", "Release evidence status", "Deployment verification status"],
  };
}

const optionalEios = {
  standalone: "Reviewed as a standalone product source; customer runtime verification is tracked separately.",
  eios: "Optional EIOS-connected positioning; no release-bound connector verification is published.",
};

export const marketplaceApps: MarketplaceApp[] = [
  reviewedProduct({
    slug: "obserra-crisis-commander",
    name: "Obserra Crisis Commander",
    status: "Coming Soon",
    category: "Cybersecurity",
    features: ["Crisis command timeline", "Role-based decisions and actions", "Communications and evidence governance"],
    integrations: ["Security operations", "Service management", "Enterprise identity"],
    deployment: ["On-Premises"],
    value: "Cyber crisis command for executive decisions, response actions, communications, evidence, and recovery accountability.",
    focusAreas: ["Crisis command timeline", "Role-based decisions and actions", "Communications and evidence governance"],
    integrationReview: ["Security operations", "Service management", "Enterprise identity"],
    positioning: optionalEios,
    release: {
      Demo: state("Not verified", NO_DEMO_ENDPOINT),
      Live: state("Not verified", NO_LIVE_ENDPOINT),
    },
    deploymentModes: [
      mode("Local / on-prem", "Not verified", "The canonical source contains an on-prem deployment profile, but no release-bound customer package is published."),
      mode("SaaS", "Not verified", "No approved SaaS tenant or exact launch host is published."),
      mode("Outbound tenant agent", "Not verified", "No approved outbound-agent release evidence is published."),
    ],
    releaseEvidence: {
      source: "Obserra--Crisis-commander-app@85556468f598a4340e59a3d3609fd016c503bcfd",
      sourceVersion: "Source v1.0.0",
      evidenceDate: "2026-08-15",
      summary: "The controlled published authority was reviewed at the named head; no approved public release, customer artifact, or release-bound endpoint is published in the website catalog.",
    },
    faq: [{ q: "Can it be launched or downloaded here?", a: "No. Launch and download actions remain absent until an exact approved endpoint or artifact is bound." }],
  }),
  reviewedProduct({
    slug: "obserra-control-intelligence",
    name: "Obserra Control Intelligence",
    status: "Coming Soon",
    category: "GRC",
    features: ["Control effectiveness", "Assurance reporting", "Auditor and owner workflow"],
    integrations: ["Enterprise controls", "Evidence sources", "Board reporting"],
    deployment: ["On-Premises"],
    value: "Continuous control-effectiveness, assurance, auditor workflow, and defensibility intelligence.",
    focusAreas: ["Control effectiveness", "Assurance reporting", "Auditor and owner workflow"],
    integrationReview: ["Enterprise controls", "Evidence sources", "Board reporting"],
    positioning: optionalEios,
    release: {
      Demo: state("Not verified", "Source v1.0.0 contains a Demo Mode code path, but no exact approved demo endpoint or current execution evidence is published."),
      Live: state("Not verified", NO_LIVE_ENDPOINT),
    },
    deploymentModes: [
      mode("Local / on-prem", "Not verified", "An on-prem source profile exists without a published release-bound customer package."),
      mode("SaaS", "Not verified", "No approved SaaS tenant or exact launch host is published."),
      mode("Outbound tenant agent", "Not verified", "No approved outbound-agent release evidence is published."),
    ],
    releaseEvidence: {
      source: "Obserra-Control-Intelligence@4fac407ae1a4e93ff342db862c19544addfd9e0e",
      sourceVersion: "Source v1.0.0",
      evidenceDate: "2026-08-13",
      summary: NO_PUBLIC_RELEASE,
    },
    faq: [{ q: "Does Demo Mode make a public demo available?", a: "No. A source feature is not treated as a verified demo until an approved endpoint and current execution evidence are bound." }],
  }),
  reviewedProduct({
    slug: "obserra-eu-cra-governance",
    name: "Obserra EU CRA Governance",
    status: "Coming Soon",
    category: "GRC",
    features: ["Product classification", "Conformity and SBOM workflow", "Regulatory evidence ledger"],
    integrations: ["Product inventory", "Vulnerability operations", "Regulatory reporting"],
    deployment: ["On-Premises"],
    value: "EU Cyber Resilience Act product governance for classification, conformity, SBOM, reporting, declarations, and regulatory evidence.",
    focusAreas: ["Product classification", "Conformity and SBOM workflow", "Regulatory evidence ledger"],
    integrationReview: ["Product inventory", "Vulnerability operations", "Regulatory reporting"],
    positioning: optionalEios,
    release: {
      Demo: state("Not verified", "Source v1.0.0 contains a Demo Mode code path, but no exact approved demo endpoint or current execution evidence is published."),
      Live: state("Not verified", NO_LIVE_ENDPOINT),
    },
    deploymentModes: [
      mode("Local / on-prem", "Not verified", "An on-prem source profile exists without a published release-bound customer package."),
      mode("SaaS", "Not verified", "No approved SaaS tenant or exact launch host is published."),
      mode("Outbound tenant agent", "Not verified", "No approved outbound-agent release evidence is published."),
    ],
    releaseEvidence: {
      source: "Obserra-EU-CRA-governace-app@6fbbc06bd450946c0af5fad51e62153deb44bdf7 · CI run 31894696092",
      sourceVersion: "Source v1.0.0",
      evidenceDate: "2026-08-15",
      summary: "The named hardening head and successful CI run are source-quality evidence only; no approved public release, customer artifact, or release-bound endpoint is published.",
    },
    faq: [{ q: "Does this page claim legal compliance?", a: "No. It describes reviewed product scope and does not claim certification, approval, or legal determination." }],
  }),
  reviewedProduct({
    slug: "obserra-eios",
    name: "Obserra EIOS",
    status: "Coming Soon",
    category: "Intelligence",
    features: ["Enterprise intelligence kernel", "Governed automation", "Auditable platform services"],
    integrations: ["Identity and authorization", "Enterprise modules", "Evidence and reporting"],
    deployment: ["On-Premises"],
    value: "Private enterprise intelligence operating system for governed automation, typed services, security controls, and auditable evidence.",
    focusAreas: ["Enterprise intelligence kernel", "Governed automation", "Auditable platform services"],
    integrationReview: ["Identity and authorization", "Enterprise modules", "Evidence and reporting"],
    positioning: {
      standalone: "Core Obserra platform; standalone customer runtime is not verified by the website catalog.",
      eios: "EIOS is the connection platform. Each connected application must carry its own connector evidence.",
    },
    release: {
      Demo: state("Not verified", "The canonical repository contains demo-readiness material, but no current approved demo endpoint is bound."),
      Live: state("Not verified", "The source maturity record explicitly says NOT_READY and does not establish release or customer readiness."),
    },
    deploymentModes: [
      mode("Local / on-prem", "Not verified", "Customer-deployment source material exists, while the maturity record says the exact source is not ready."),
      mode("SaaS", "Not verified", "No approved SaaS tenant or release-bound host is published."),
      mode("Outbound tenant agent", "Not verified", "No approved outbound-agent release evidence is published."),
    ],
    releaseEvidence: {
      source: "obserra-eios-enterprise@0eb34b009c8776d071101c9b063ef58ea46dbf48",
      sourceVersion: "Source v1.0.0",
      evidenceDate: "2026-08-13",
      summary: "Reviewed source exists; the current maturity evidence remains NOT_READY and no public release is published.",
    },
    faq: [{ q: "What is EIOS's current release state?", a: "The reviewed maturity evidence explicitly remains NOT_READY, so Demo and Live are both not verified." }],
  }),
  reviewedProduct({
    slug: "obserra-sap-uac",
    name: "Obserra SAP UAC",
    status: "Coming Soon",
    category: "Identity",
    features: ["Access request workflow", "Policy and segregation-of-duties review", "Tamper-evident audit evidence"],
    integrations: ["ServiceNow", "SAP Identity Directory / SCIM", "Managed Windows configuration"],
    deployment: ["On-Premises"],
    value: "ServiceNow-governed SAP user-account creation and access orchestration for managed Windows endpoints.",
    focusAreas: ["Access request workflow", "Policy and segregation-of-duties review", "Tamper-evident audit evidence"],
    integrationReview: ["ServiceNow", "SAP Identity Directory / SCIM", "Managed Windows configuration"],
    positioning: optionalEios,
    release: {
      Demo: state(
        "Verified",
        "Canonical v0.2.0 evidence records a labeled capabilities demo, 9 passing unit tests, and a passing end-to-end dry-run smoke test; it does not represent production SAP writes.",
        "0.2.0",
        "2026-08-03",
      ),
      Live: state("Not verified", "Production ServiceNow and SAP connectivity requires customer endpoints, OAuth applications, mappings, and credentials."),
    },
    deploymentModes: [
      mode("Local / on-prem", "Not verified", "The canonical v0.2.0 repository records installer artifacts, but oneClick is false and no clean Windows install-to-runtime journey is verified; public distribution also requires trusted code signing."),
      mode("SaaS", "Not offered", "The reviewed product is a managed Windows desktop application with customer-connected services, not a published SaaS tenant."),
      mode("Outbound tenant agent", "Not verified", "The reviewed source describes outbound HTTPS/OAuth connectivity, but no clean install-to-live customer journey or exact customer connection is verified."),
    ],
    releaseEvidence: {
      source: "Obserra-SAP-UAC@854247654621a55d5c304568874f03446f46b9b0",
      sourceVersion: "Internal package 0.2.0",
      evidenceDate: "2026-08-03",
      summary: "Internal installer, checksum, SBOM, source/JSON, unit-test, and dry-run evidence is present. No approved public download is bound.",
    },
    faq: [{ q: "Can the installer be downloaded here?", a: "No. The catalog has no approved public artifact URL, and the reviewed evidence requires trusted code signing before distribution." }],
  }),
  reviewedProduct({
    slug: "obserra-agentic-ai-security",
    name: "Obserra Agentic AI Security",
    status: "Coming Soon",
    category: "AI Governance",
    features: ["AI-agent discovery", "Guardrail and authority review", "Red-team and defensibility evidence"],
    integrations: ["AI providers", "Enterprise collaboration", "Security and service data"],
    deployment: ["On-Premises"],
    value: "Discovery, risk review, guardrails, red-team workflow, and defensibility for enterprise AI agents.",
    focusAreas: ["AI-agent discovery", "Guardrail and authority review", "Red-team and defensibility evidence"],
    integrationReview: ["AI providers", "Enterprise collaboration", "Security and service data"],
    positioning: optionalEios,
    release: {
      Demo: state("Not verified", "The canonical source says it uses live provider data and does not publish seeded demo data; no approved demo endpoint is bound."),
      Live: state("Not verified", NO_LIVE_ENDPOINT),
    },
    deploymentModes: [
      mode("Local / on-prem", "Not verified", "An on-prem source profile exists without a published release-bound customer package."),
      mode("SaaS", "Not verified", "No approved SaaS tenant or exact launch host is published."),
      mode("Outbound tenant agent", "Not verified", "No approved outbound-agent release evidence is published."),
    ],
    releaseEvidence: {
      source: "Obserra-Agentic-AI-Security-app@d5307d4ba2198833dc766cb6da3c05a3f5ac6ce9",
      sourceVersion: "Source v1.0.0",
      evidenceDate: "2026-08-13",
      summary: NO_PUBLIC_RELEASE,
    },
    faq: [{ q: "Is a live control plane verified?", a: "No. Source claims are not converted into a Live status without an approved endpoint and current runtime evidence." }],
  }),
  reviewedProduct({
    slug: "obserra-academy-production-studio",
    name: "Obserra Academy Production Studio",
    status: "Coming Soon",
    category: "Operations",
    features: ["Course authoring and validation", "Review and approval workflow", "FINAL release and catalog generation"],
    integrations: ["Obserra Academy catalog", "LCMS dry-run loading", "Website publication contract"],
    deployment: ["On-Premises"],
    value: "Governed authoring, validation, packaging, approval, and publication system for original Obserra Academy courses.",
    focusAreas: ["Course authoring and validation", "Review and approval workflow", "FINAL release and catalog generation"],
    integrationReview: ["Obserra Academy catalog", "LCMS dry-run loading", "Website publication contract"],
    positioning: {
      standalone: "Reviewed as a separate Academy production system; customer runtime availability is not published.",
      eios: "No EIOS connection is offered in the reviewed publication contract.",
    },
    release: {
      Demo: state("Not verified", "No exact approved Production Studio demo endpoint is bound in the website Applications catalog."),
      Live: state("Not verified", "The current repository is an alpha source and contains no approved Production Studio release endpoint."),
    },
    deploymentModes: [
      mode("Local / on-prem", "Not verified", "A local authoring workflow is documented, but no release-bound customer package is published."),
      mode("SaaS", "Not verified", "No approved SaaS tenant or exact launch host is published."),
      mode("Outbound tenant agent", "Not offered", "The reviewed Studio publication contract does not offer an outbound tenant agent."),
    ],
    releaseEvidence: {
      source: "obserra-academy-production-studio@071ac15367ac68ec8fe74b236f12c92269f6a606",
      sourceVersion: "1.0.0-alpha.8",
      evidenceDate: "2026-08-14",
      summary: "Authoritative Studio source and generated catalog exist; no approved Studio release endpoint or customer artifact is published.",
    },
    faq: [{ q: "Does a generated course catalog make Studio live?", a: "No. Catalog generation is publication evidence for courses, not Live verification for the Production Studio application." }],
  }),
];

export const roadmapConcepts: RoadmapConcept[] = [
  { name: "Offboarding Orchestrator", category: "Operations", status: "Roadmap concept" },
  { name: "Asset Intelligence", category: "Cybersecurity", status: "Roadmap concept" },
  { name: "IT PMO Command Center", category: "Operations", status: "Roadmap concept" },
  { name: "Executive Exposure Monitor", category: "Intelligence", status: "Roadmap concept" },
  { name: "AI Governance Suite", category: "AI Governance", status: "Roadmap concept" },
  { name: "Cyber Risk Register", category: "GRC", status: "Roadmap concept" },
  { name: "Identity Certification Manager", category: "Identity", status: "Roadmap concept" },
  { name: "Security Control Evidence Manager", category: "GRC", status: "Roadmap concept" },
  { name: "Vulnerability Prioritizer", category: "Cybersecurity", status: "Roadmap concept" },
  { name: "Cloud Security Posture Advisor", category: "Cybersecurity", status: "Roadmap concept" },
  { name: "Data Protection Command Center", category: "GRC", status: "Roadmap concept" },
  { name: "Technology Lifecycle Manager", category: "Operations", status: "Roadmap concept" },
  { name: "Business Continuity Planner", category: "GRC", status: "Roadmap concept" },
  { name: "Third Party Risk Hub", category: "GRC", status: "Roadmap concept" },
  { name: "Executive Intelligence Dashboard", category: "Intelligence", status: "Roadmap concept" },
];

export const appCategories: AppCategory[] = [
  "Cybersecurity",
  "Identity",
  "GRC",
  "AI Governance",
  "Operations",
  "Intelligence",
  "Learning",
];

export function findAppBySlug(slug: string) {
  return marketplaceApps.find((entry) => entry.slug === slug);
}
