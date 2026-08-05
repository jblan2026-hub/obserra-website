export type EiosCapability = {
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  image: string;
  outcomes: string[];
  capabilities: string[];
  governance: string[];
  deployment: string[];
};

export const eiosCapabilities: EiosCapability[] = [
  {
    slug: "executive-mission-control",
    title: "Executive Mission Control",
    eyebrow: "EXECUTIVE OPERATING CENTER",
    summary: "Unify enterprise priorities, risk changes, approvals, recommendations, and accountable action in one executive decision environment.",
    image: "/eios/eios-overview-marketing.png",
    outcomes: ["Faster executive decisions", "One enterprise risk picture", "Clear ownership and escalation", "Board-ready operating visibility"],
    capabilities: ["Enterprise Health Index", "Priority action queue", "Cross-domain KPI intelligence", "Executive summaries", "Decision and approval workflows", "Financial impact context"],
    governance: ["Role-based decision rights", "Evidence-linked recommendations", "Immutable audit history", "Human approval controls"],
    deployment: ["Obserra Cloud", "Private Cloud", "Enterprise On Premises", "Government Edition"],
  },
  {
    slug: "digital-twin",
    title: "Enterprise Digital Twin",
    eyebrow: "GLOBAL ENTERPRISE VISIBILITY",
    summary: "Explore the enterprise by geography, facility, asset, business unit, vendor, executive exposure, and risk condition through a connected digital representation.",
    image: "/eios/eios-situation-room-marketing.png",
    outcomes: ["Connected global risk context", "Faster regional impact analysis", "Improved executive travel awareness", "Better resilience planning"],
    capabilities: ["Geographic risk overlays", "Facility and asset drill-down", "Executive travel intelligence", "Threat and compliance views", "Business-unit scoring", "Regional trend analysis"],
    governance: ["Source attribution", "Confidence scoring", "Data classification controls", "Access by role and geography"],
    deployment: ["Cloud-hosted visualization", "Dedicated private environment", "Customer-controlled data sources", "Air-gapped visualization options"],
  },
  {
    slug: "obserrian-ai",
    title: "Obserrian Executive AI Advisor",
    eyebrow: "GOVERNED EXECUTIVE INTELLIGENCE",
    summary: "Ask questions, evaluate risk, prepare briefings, compare options, and coordinate accountable action through an AI advisor grounded in enterprise evidence and the Obserrian Doctrine.",
    image: "/eios/eios-report-center-marketing.png",
    outcomes: ["Evidence-backed executive guidance", "Faster briefing preparation", "Consistent governance reasoning", "Explainable recommendations"],
    capabilities: ["Natural-language enterprise queries", "Board briefing generation", "Recommendation prioritization", "Scenario analysis", "Course and service guidance", "Cross-dashboard context"],
    governance: ["Human oversight", "Confidence and evidence display", "Prompt and response audit logs", "Policy-aligned access controls"],
    deployment: ["Managed AI service", "Private model gateway", "Customer-approved model providers", "Restricted or isolated environments"],
  },
  {
    slug: "digital-board-room",
    title: "Digital Board Room",
    eyebrow: "BOARD GOVERNANCE AND REPORTING",
    summary: "Prepare, review, approve, and retain board-ready intelligence packages with traceable metrics, decisions, recommendations, and supporting evidence.",
    image: "/eios/eios-report-center-marketing.png",
    outcomes: ["Stronger board oversight", "Consistent reporting", "Faster package preparation", "Traceable governance decisions"],
    capabilities: ["Board packet generation", "Executive presentation mode", "Risk and financial summaries", "Governance approvals", "Meeting history", "PDF, Word, Excel, and PowerPoint exports"],
    governance: ["Board-level access controls", "Document versioning", "Approval records", "Confidentiality markings"],
    deployment: ["Cloud board workspace", "Dedicated customer tenant", "Private cloud", "On-premises governance environment"],
  },
  {
    slug: "knowledge-graph",
    title: "Enterprise Knowledge Graph",
    eyebrow: "CONNECTED ENTERPRISE CONTEXT",
    summary: "Expose relationships among people, assets, applications, vendors, controls, risks, regulations, AI models, facilities, and business units.",
    image: "/eios/eios-asset-intelligence-marketing.png",
    outcomes: ["Better impact analysis", "Reduced data fragmentation", "Faster root-cause investigation", "Stronger AI context"],
    capabilities: ["Entity and relationship mapping", "Cross-domain traversal", "Control-to-risk linkage", "Vendor and asset dependencies", "Evidence relationships", "Executive impact paths"],
    governance: ["Tenant isolation", "Relationship provenance", "Authorized graph traversal", "Auditable graph changes"],
    deployment: ["Managed graph service", "Customer-dedicated graph", "Hybrid data synchronization", "On-premises graph deployment"],
  },
  {
    slug: "enterprise-integrations",
    title: "Enterprise Integrations",
    eyebrow: "CONNECT EXISTING SYSTEMS",
    summary: "Connect the systems organizations already depend on so EIOS can correlate evidence, risk, workflow, identity, telemetry, and business context without replacing every source platform.",
    image: "/eios/eios-asset-intelligence-marketing.png",
    outcomes: ["Preserve existing investments", "Reduce manual reporting", "Improve cross-system intelligence", "Accelerate implementation"],
    capabilities: ["ServiceNow and ticketing", "AuditBoard and audit platforms", "Microsoft Purview", "Zscaler and security platforms", "Cloud and identity providers", "SAP, Salesforce, QMS, and business systems"],
    governance: ["Scoped API permissions", "Secrets management", "Integration health monitoring", "Bi-directional audit records"],
    deployment: ["Secure SaaS connectors", "Private integration gateway", "Customer-hosted agents", "Offline and controlled transfer patterns"],
  },
  {
    slug: "architecture-security",
    title: "Architecture and Security",
    eyebrow: "SECURE BY DESIGN AND DEFAULT",
    summary: "Review the architectural principles that govern identity, authorization, isolation, encryption, observability, software assurance, and accountable automation across EIOS.",
    image: "/eios/eios-overview-marketing.png",
    outcomes: ["Clear security posture", "Procurement-ready architecture", "Defensible access control", "Reduced implementation risk"],
    capabilities: ["Enterprise SSO and federation", "Role-based and attribute-aware access", "Encryption in transit and at rest", "Audit and correlation IDs", "Secure SDLC and supply-chain controls", "Monitoring and operational evidence"],
    governance: ["Zero Trust principles", "Least privilege", "Secure defaults", "Rollback and human oversight for automation"],
    deployment: ["Multi-tenant SaaS with isolation", "Dedicated private cloud", "Customer data center", "Government and restricted environments"],
  },
  {
    slug: "deployment-editions",
    title: "Deployment Editions",
    eyebrow: "FLEXIBLE ENTERPRISE DELIVERY",
    summary: "Choose the operating model that fits organizational risk, regulatory obligations, infrastructure strategy, and data-control requirements.",
    image: "/eios/eios-situation-room-marketing.png",
    outcomes: ["Flexible procurement", "Regulatory alignment", "Customer-controlled data boundaries", "Scalable adoption"],
    capabilities: ["Obserra Cloud", "Private Cloud", "Enterprise On Premises", "Government Edition", "Phased implementation", "Enterprise support and success planning"],
    governance: ["Documented responsibility model", "Environment-specific controls", "Customer-approved integrations", "Deployment assurance evidence"],
    deployment: ["Managed multi-tenant SaaS", "Dedicated cloud environment", "Customer-hosted deployment", "Restricted and air-gapped patterns"],
  },
];

export function getEiosCapability(slug: string) {
  return eiosCapabilities.find((entry) => entry.slug === slug);
}
