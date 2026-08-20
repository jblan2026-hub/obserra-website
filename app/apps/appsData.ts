import { EIOS_BRAND_NAME } from "../../lib/legal-identity";

export type AppStatus = "Available" | "Pilot" | "Coming Soon";

export type DeploymentModel = "SaaS" | "Private Cloud" | "Hybrid" | "On-Premises";

export type AppCategory =
  | "Cybersecurity"
  | "Executive Protection"
  | "Identity"
  | "GRC"
  | "AI Governance"
  | "Operations"
  | "Intelligence";

export type MarketplaceApp = {
  slug: string;
  name: string;
  status: AppStatus;
  category: AppCategory;
  value: string;
  features: string[];
  integrations: string[];
  deployment: DeploymentModel[];
  pricing: string;
  documentation: string[];
  faq: { q: string; a: string }[];
};

export const marketplaceApps: MarketplaceApp[] = [
  {
    slug: "obserra-eios",
    name: EIOS_BRAND_NAME,
    status: "Available",
    category: "Intelligence",
    value: "Unifies enterprise context, decision governance, and verified outcomes in one command layer.",
    features: ["Executive command dashboards", "Evidence-backed decision workflows", "Outcome verification trail"],
    integrations: ["Microsoft Entra ID", "ServiceNow", "Jira", "Splunk"],
    deployment: ["SaaS", "Private Cloud", "Hybrid"],
    pricing: "Enterprise pricing based on scope and integration profile.",
    documentation: ["Platform overview", "Security and governance controls", "Integration guide"],
    faq: [
      { q: "Is EIOS production ready?", a: "Yes. EIOS is available for enterprise deployment engagements." },
      { q: "Can EIOS run in private cloud?", a: "Yes, for organizations requiring controlled hosting and network boundaries." }
    ]
  },
  {
    slug: "obserra-sap-uac",
    name: "Obserra SAP UAC",
    status: "Pilot",
    category: "Identity",
    value: "Accelerates SAP user access certifications and governance with policy-aware workflows.",
    features: ["SAP entitlement intelligence", "Certification campaigns", "Segregation-of-duties checkpoints"],
    integrations: ["SAP", "Microsoft Entra ID", "Okta"],
    deployment: ["SaaS", "Private Cloud"],
    pricing: "Pilot engagement pricing with enterprise transition path.",
    documentation: ["Pilot onboarding", "Access model mapping", "Control evidence export"],
    faq: [{ q: "Is this generally available?", a: "This product is in pilot with controlled customer enrollment." }]
  },
  {
    slug: "obserra-offboarding-orchestrator",
    name: "Obserra Offboarding Orchestrator",
    status: "Pilot",
    category: "Operations",
    value: "Coordinates HR, IT, and security offboarding actions to reduce residual access and operational risk.",
    features: ["Automated deprovisioning triggers", "Cross-system task orchestration", "Audit evidence bundle"],
    integrations: ["Workday", "Microsoft 365", "ServiceNow"],
    deployment: ["SaaS", "Hybrid"],
    pricing: "Pilot engagement pricing.",
    documentation: ["Workflow templates", "Connector setup", "Audit export"],
    faq: [{ q: "Can workflows be customized?", a: "Yes. Workflow controls are tailored to enterprise policy requirements." }]
  },
  {
    slug: "obserra-asset-intelligence",
    name: "Obserra Asset Intelligence",
    status: "Available",
    category: "Cybersecurity",
    value: "Builds a business-aligned inventory of technology assets, exposures, and ownership accountability.",
    features: ["Asset criticality scoring", "Dependency mapping", "Exposure prioritization"],
    integrations: ["CMDB", "EDR", "Cloud APIs"],
    deployment: ["SaaS", "Private Cloud"],
    pricing: "Enterprise subscription based on asset volume.",
    documentation: ["Data model guide", "Scoring methodology", "Dashboard handbook"],
    faq: [{ q: "Does it replace CMDB tools?", a: "No. It complements existing systems with decision-grade intelligence." }]
  },
  {
    slug: "obserra-it-pmo-command-center",
    name: "Obserra IT PMO Command Center",
    status: "Coming Soon",
    category: "Operations",
    value: "Centralizes delivery risk, dependencies, and portfolio execution insights for enterprise PMO teams.",
    features: ["Portfolio health dashboard", "Dependency risk signals", "Executive readiness reporting"],
    integrations: ["Jira", "Azure DevOps", "ServiceNow"],
    deployment: ["SaaS", "Private Cloud"],
    pricing: "Pricing to be announced.",
    documentation: ["Preview brief", "Roadmap overview"],
    faq: [{ q: "Is this available for purchase today?", a: "No. This product is planned and currently marked Coming Soon." }]
  },
  {
    slug: "obserra-executive-exposure-monitor",
    name: "Obserra Executive Exposure Monitor",
    status: "Pilot",
    category: "Executive Protection",
    value: "Continuously surfaces digital and physical exposure indicators relevant to executive risk decisions.",
    features: ["Executive risk watchlist", "Travel and event risk snapshots", "Escalation playbooks"],
    integrations: ["Threat intel feeds", "Travel systems", "Case management"],
    deployment: ["Private Cloud", "Hybrid"],
    pricing: "Pilot pricing based on executive population.",
    documentation: ["Operational playbooks", "Alert tuning guide"],
    faq: [{ q: "Does this include physical protection services?", a: "It supports intelligence workflows and complements protective operations." }]
  },
  {
    slug: "obserra-ai-governance-suite",
    name: "Obserra AI Governance Suite",
    status: "Available",
    category: "AI Governance",
    value: "Enables policy-aligned AI use with model oversight, approvals, and defensible governance records.",
    features: ["Model inventory and policy tags", "Approval workflows", "AI risk and control dashboards"],
    integrations: ["M365 Copilot governance data", "Model registries", "GRC platforms"],
    deployment: ["SaaS", "Private Cloud", "Hybrid"],
    pricing: "Enterprise licensing based on AI footprint.",
    documentation: ["Governance framework starter", "Control mapping guide", "Executive reporting pack"],
    faq: [{ q: "Can this map to existing governance frameworks?", a: "Yes, with configurable control and policy mappings." }]
  },
  {
    slug: "obserra-cyber-risk-register",
    name: "Obserra Cyber Risk Register",
    status: "Available",
    category: "GRC",
    value: "Transforms static risk logs into dynamic, evidence-backed cyber risk intelligence.",
    features: ["Risk scoring and confidence labels", "Control linkage", "Board reporting views"],
    integrations: ["SIEM", "Vulnerability tools", "GRC systems"],
    deployment: ["SaaS", "Private Cloud"],
    pricing: "Enterprise subscription.",
    documentation: ["Risk model guide", "Control alignment handbook"],
    faq: [{ q: "Can risk scoring be customized?", a: "Yes, scoring models can align to enterprise risk methodology." }]
  },
  {
    slug: "obserra-identity-certification-manager",
    name: "Obserra Identity Certification Manager",
    status: "Pilot",
    category: "Identity",
    value: "Streamlines identity certification campaigns with accountability and evidence controls.",
    features: ["Reviewer workflows", "Exception handling", "Certification evidence archive"],
    integrations: ["Microsoft Entra ID", "Okta", "SailPoint"],
    deployment: ["SaaS", "Private Cloud"],
    pricing: "Pilot pricing.",
    documentation: ["Campaign setup guide", "Reviewer quickstart"],
    faq: [{ q: "Is this available broadly?", a: "No. This is in pilot and limited-release deployment." }]
  },
  {
    slug: "obserra-security-control-evidence-manager",
    name: "Obserra Security Control Evidence Manager",
    status: "Available",
    category: "GRC",
    value: "Collects and validates control evidence to reduce audit friction and strengthen assurance.",
    features: ["Evidence collection workflows", "Control mapping library", "Audit-ready exports"],
    integrations: ["Ticketing", "Cloud platforms", "SIEM"],
    deployment: ["SaaS", "Private Cloud", "On-Premises"],
    pricing: "Enterprise pricing by control scope.",
    documentation: ["Evidence workflow templates", "Control catalog guide"],
    faq: [{ q: "Can it support multiple frameworks?", a: "Yes, including custom internal control taxonomies." }]
  },
  {
    slug: "obserra-vulnerability-prioritizer",
    name: "Obserra Vulnerability Prioritizer",
    status: "Available",
    category: "Cybersecurity",
    value: "Prioritizes vulnerabilities by business impact, exploitability, and operational context.",
    features: ["Context-based scoring", "Remediation sequencing", "Executive risk summaries"],
    integrations: ["Tenable", "Qualys", "EDR", "CMDB"],
    deployment: ["SaaS", "Private Cloud"],
    pricing: "Enterprise subscription by asset coverage.",
    documentation: ["Scoring model reference", "Remediation playbook"],
    faq: [{ q: "Does this replace vulnerability scanners?", a: "No. It consumes scanner data and improves decision prioritization." }]
  },
  {
    slug: "obserra-incident-command-console",
    name: "Obserra Incident Command Console",
    status: "Coming Soon",
    category: "Cybersecurity",
    value: "Coordinates incident command workflows with role-based execution and live accountability.",
    features: ["Command timeline", "Role and task orchestration", "Post-incident evidence pack"],
    integrations: ["SOAR", "SIEM", "Service desk"],
    deployment: ["SaaS", "Private Cloud"],
    pricing: "Pricing to be announced.",
    documentation: ["Preview feature guide", "Roadmap highlights"],
    faq: [{ q: "Is this production-ready today?", a: "No. This product is not yet available and is marked Coming Soon." }]
  },
  {
    slug: "obserra-cloud-security-posture-advisor",
    name: "Obserra Cloud Security Posture Advisor",
    status: "Pilot",
    category: "Cybersecurity",
    value: "Provides cloud posture recommendations tied to business risk and control priorities.",
    features: ["Cloud misconfiguration insights", "Control posture views", "Remediation plans"],
    integrations: ["AWS", "Azure", "Google Cloud"],
    deployment: ["SaaS", "Private Cloud"],
    pricing: "Pilot pricing.",
    documentation: ["Cloud connector guide", "Control baseline pack"],
    faq: [{ q: "Can this support multi-cloud?", a: "Yes, with normalized posture reporting across providers." }]
  },
  {
    slug: "obserra-data-protection-command-center",
    name: "Obserra Data Protection Command Center",
    status: "Coming Soon",
    category: "GRC",
    value: "Gives leaders visibility into sensitive data risk, access controls, and policy conformance.",
    features: ["Data risk heatmaps", "Access governance overlays", "Policy exception tracking"],
    integrations: ["DLP systems", "Identity providers", "Cloud data stores"],
    deployment: ["SaaS", "Private Cloud"],
    pricing: "Pricing to be announced.",
    documentation: ["Concept brief", "Roadmap notes"],
    faq: [{ q: "Can we buy this now?", a: "No. This solution is planned and currently Coming Soon." }]
  },
  {
    slug: "obserra-technology-lifecycle-manager",
    name: "Obserra Technology Lifecycle Manager",
    status: "Coming Soon",
    category: "Operations",
    value: "Tracks technology lifecycle risk from adoption through retirement with governance checkpoints.",
    features: ["Lifecycle stage governance", "Ownership and dependency tracking", "Retirement risk alerts"],
    integrations: ["CMDB", "Procurement", "Service management"],
    deployment: ["SaaS", "Private Cloud"],
    pricing: "Pricing to be announced.",
    documentation: ["Lifecycle model preview", "Roadmap brief"],
    faq: [{ q: "Is it available in production?", a: "No. It is currently marked Coming Soon." }]
  },
  {
    slug: "obserra-business-continuity-planner",
    name: "Obserra Business Continuity Planner",
    status: "Pilot",
    category: "GRC",
    value: "Aligns continuity planning, recovery priorities, and readiness evidence in one governed program.",
    features: ["Continuity playbook workflows", "Dependency-based recovery mapping", "Readiness scorecards"],
    integrations: ["Service catalogs", "CMDB", "Ticketing"],
    deployment: ["SaaS", "Private Cloud"],
    pricing: "Pilot pricing.",
    documentation: ["Continuity starter templates", "Readiness reporting guide"],
    faq: [{ q: "Can it support exercises?", a: "Yes, it supports tabletop and readiness evidence workflows." }]
  },
  {
    slug: "obserra-third-party-risk-hub",
    name: "Obserra Third Party Risk Hub",
    status: "Available",
    category: "GRC",
    value: "Centralizes third-party risk intelligence, assurance workflows, and executive visibility.",
    features: ["Vendor risk scoring", "Control attestation workflows", "Executive third-party dashboard"],
    integrations: ["Procurement", "GRC", "Security questionnaires"],
    deployment: ["SaaS", "Private Cloud"],
    pricing: "Enterprise licensing by vendor count.",
    documentation: ["Vendor onboarding guide", "Risk framework mapping"],
    faq: [{ q: "Can this replace procurement tools?", a: "No. It augments procurement with risk and assurance visibility." }]
  },
  {
    slug: "obserra-executive-intelligence-dashboard",
    name: "Obserra Executive Intelligence Dashboard",
    status: "Pilot",
    category: "Intelligence",
    value: "Presents board-ready intelligence snapshots for security, operational, and enterprise risk posture.",
    features: ["Executive scorecards", "Decision brief generation", "KPI and risk correlation"],
    integrations: ["EIOS", "BI platforms", "Risk registers"],
    deployment: ["SaaS", "Private Cloud", "Hybrid"],
    pricing: "Pilot engagement pricing.",
    documentation: ["Dashboard configuration guide", "Briefing template pack"],
    faq: [{ q: "Is this generally available?", a: "This solution is currently in pilot." }]
  }
];

export const appCategories: AppCategory[] = [
  "Cybersecurity",
  "Executive Protection",
  "Identity",
  "GRC",
  "AI Governance",
  "Operations",
  "Intelligence"
];

export function findAppBySlug(slug: string) {
  return marketplaceApps.find((entry) => entry.slug === slug);
}
