export type ResourceType = "Executive Brief" | "Playbook" | "Checklist" | "Framework Guide" | "Intelligence Update" | "Board Briefing";

export type ResourceItem = {
  slug: string;
  title: string;
  summary: string;
  type: ResourceType;
  topic: string;
  industry: string;
  audience: string;
  readTime: string;
  updated: string;
  executiveSummary: string;
  keyQuestions: string[];
  recommendedActions: string[];
  relatedLinks: { label: string; href: string }[];
};

export const resourceCatalog: ResourceItem[] = [
  {
    slug: "board-cyber-risk-briefing",
    title: "Board Cyber Risk Briefing",
    summary: "A board-ready structure for connecting cyber exposure, business consequence, ownership, and investment decisions.",
    type: "Board Briefing",
    topic: "Cybersecurity",
    industry: "All industries",
    audience: "Boards and executive teams",
    readTime: "8 min",
    updated: "August 2026",
    executiveSummary: "Cybersecurity oversight is strongest when directors can see the business consequence, accountable owner, evidence quality, and decision required. This briefing provides a practical structure for moving beyond technical reporting toward governance-quality discussion.",
    keyQuestions: ["Which risks could materially affect strategic objectives?", "What decisions require board or executive intervention?", "Which control claims are supported by current evidence?"],
    recommendedActions: ["Define a consistent enterprise risk narrative.", "Separate operational metrics from governance decisions.", "Track ownership, decision status, and expected risk reduction."],
    relatedLinks: [{ label: "Cybersecurity consulting", href: "/services/cybersecurity-consulting" }, { label: "Executive Mission Control", href: "/eios/executive-mission-control" }, { label: "Trust Center", href: "/trust" }],
  },
  {
    slug: "ai-governance-operating-playbook",
    title: "AI Governance Operating Playbook",
    summary: "A practical operating model for use-case intake, accountability, risk review, evidence, human oversight, and controlled deployment.",
    type: "Playbook",
    topic: "AI Governance",
    industry: "All industries",
    audience: "Executives, legal, risk, security, and product teams",
    readTime: "10 min",
    updated: "August 2026",
    executiveSummary: "AI governance requires more than policy. Organizations need clear decision rights, use-case classification, evidence standards, monitoring expectations, and escalation paths that remain usable at operating speed.",
    keyQuestions: ["Who can approve an AI use case?", "What evidence is required before deployment?", "Where must human review remain mandatory?"],
    recommendedActions: ["Create a governed AI intake workflow.", "Assign accountable owners for every use case.", "Define monitoring, rollback, and retirement criteria."],
    relatedLinks: [{ label: "AI governance service", href: "/services/ai-governance" }, { label: "AI Governance Control Plane", href: "/eios/ai-governance-control-plane" }, { label: "AI governance training", href: "/academy" }],
  },
  {
    slug: "executive-protection-readiness-checklist",
    title: "Executive Protection Readiness Checklist",
    summary: "A concise readiness review for travel, public appearances, residences, digital exposure, intelligence, and response coordination.",
    type: "Checklist",
    topic: "Executive Protection",
    industry: "All industries",
    audience: "Executives, chiefs of staff, security, and operations",
    readTime: "6 min",
    updated: "August 2026",
    executiveSummary: "Executive protection is most effective when travel, public exposure, digital presence, communications, and response planning are treated as one coordinated operating problem.",
    keyQuestions: ["Which upcoming movements create elevated exposure?", "Who owns escalation and response coordination?", "How is digital exposure affecting physical risk?"],
    recommendedActions: ["Review the executive calendar for exposure windows.", "Confirm roles and response contacts.", "Integrate protective intelligence with travel and event planning."],
    relatedLinks: [{ label: "Executive protection", href: "/services/executive-protection" }, { label: "Protective intelligence", href: "/services/protective-intelligence" }, { label: "Protection and intelligence", href: "/protection-intelligence" }],
  },
  {
    slug: "incident-readiness-executive-guide",
    title: "Incident Readiness Executive Guide",
    summary: "An executive guide for clarifying authority, communications, evidence, legal coordination, and recovery decisions before an incident occurs.",
    type: "Executive Brief",
    topic: "Incident Response",
    industry: "All industries",
    audience: "Executives, legal, security, communications, and operations",
    readTime: "9 min",
    updated: "August 2026",
    executiveSummary: "Incident response fails when authority, evidence, communications, and business priorities are unclear. Executive readiness establishes decision rights and coordination before time pressure and incomplete information make alignment harder.",
    keyQuestions: ["Who can declare and escalate an incident?", "Which decisions require legal or executive approval?", "How will business impact and recovery priorities be communicated?"],
    recommendedActions: ["Define executive decision authorities.", "Exercise communications and evidence workflows.", "Align recovery priorities to critical business services."],
    relatedLinks: [{ label: "Incident response readiness", href: "/services/incident-response-readiness" }, { label: "Digital forensics advisory", href: "/services/digital-forensics-advisory" }, { label: "Enterprise intelligence", href: "/eios" }],
  },
  {
    slug: "medical-device-cybersecurity-framework-guide",
    title: "Medical Device Cybersecurity Framework Guide",
    summary: "A leadership guide for aligning product security, secure development, vulnerability management, evidence, and regulatory expectations.",
    type: "Framework Guide",
    topic: "Product Security",
    industry: "Medical Devices",
    audience: "Executives, product, quality, regulatory, and security teams",
    readTime: "11 min",
    updated: "August 2026",
    executiveSummary: "Medical device cybersecurity requires coordinated ownership across product development, quality, regulatory, privacy, legal, and enterprise security. Evidence and lifecycle governance are as important as technical controls.",
    keyQuestions: ["How are product risks connected to business and patient impact?", "Which secure-development evidence is consistently retained?", "How are post-market signals prioritized and governed?"],
    recommendedActions: ["Map secure-development responsibilities across functions.", "Standardize evidence for design and lifecycle decisions.", "Connect vulnerability management to product and patient consequence."],
    relatedLinks: [{ label: "Medical devices industry", href: "/industries/medical-devices" }, { label: "Regulatory assurance", href: "/services/regulatory-control-assurance" }, { label: "NIST SSDF-aligned services", href: "/services/cybersecurity-consulting" }],
  },
  {
    slug: "identity-governance-decision-brief",
    title: "Identity Governance Decision Brief",
    summary: "A decision framework for lifecycle access, privileged access, certification, segregation of duties, and identity evidence.",
    type: "Executive Brief",
    topic: "Identity and Access",
    industry: "All industries",
    audience: "CIO, CISO, audit, HR, application, and risk leaders",
    readTime: "7 min",
    updated: "August 2026",
    executiveSummary: "Identity risk is an enterprise operating issue because access depends on workforce changes, application ownership, privileged activity, data sensitivity, and evidence quality across multiple functions.",
    keyQuestions: ["Which access decisions carry the greatest consequence?", "Are lifecycle events reflected quickly and consistently?", "Can reviewers make informed certification decisions?"],
    recommendedActions: ["Prioritize high-consequence identities and entitlements.", "Integrate HR, application, and privileged-access workflows.", "Improve decision context and evidence for access reviews."],
    relatedLinks: [{ label: "Identity access management", href: "/services/identity-access-management" }, { label: "Enterprise integrations", href: "/eios/enterprise-integrations" }, { label: "GRC services", href: "/services/grc" }],
  },
  {
    slug: "critical-infrastructure-intelligence-update",
    title: "Critical Infrastructure Intelligence Update",
    summary: "An executive intelligence template for combining cyber, physical, geopolitical, supply-chain, and operational signals.",
    type: "Intelligence Update",
    topic: "Threat Intelligence",
    industry: "Critical Infrastructure",
    audience: "Executives, security, operations, resilience, and risk leaders",
    readTime: "8 min",
    updated: "August 2026",
    executiveSummary: "Critical infrastructure decisions require a fused view of operational consequence, cyber exposure, physical conditions, geopolitical developments, suppliers, and response capacity. Intelligence is valuable only when it changes prioritization or action.",
    keyQuestions: ["Which emerging signals could affect essential operations?", "What assets, locations, suppliers, or leaders are exposed?", "Which action would reduce the most consequence now?"],
    recommendedActions: ["Maintain cross-domain watchlists.", "Correlate intelligence to assets and business services.", "Rank actions by consequence reduction and urgency."],
    relatedLinks: [{ label: "Critical infrastructure industry", href: "/industries/critical-infrastructure" }, { label: "Intelligence Fusion Engine", href: "/eios/intelligence-fusion-engine" }, { label: "Protective intelligence", href: "/services/protective-intelligence" }],
  },
  {
    slug: "third-party-risk-executive-checklist",
    title: "Third-Party Risk Executive Checklist",
    summary: "A concise checklist for supplier criticality, evidence, contractual requirements, concentration risk, and remediation decisions.",
    type: "Checklist",
    topic: "Third-Party Risk",
    industry: "All industries",
    audience: "Executives, procurement, legal, security, compliance, and operations",
    readTime: "6 min",
    updated: "August 2026",
    executiveSummary: "Third-party risk should focus on business dependency and consequence rather than treating every supplier as equally important. Critical services require stronger evidence, contractual clarity, and continuity planning.",
    keyQuestions: ["Which suppliers support critical business services?", "Where is evidence incomplete or stale?", "What concentration or substitution risk exists?"],
    recommendedActions: ["Tier suppliers by business consequence.", "Align evidence and contract requirements to tier.", "Track remediation and exit options for critical dependencies."],
    relatedLinks: [{ label: "Enterprise risk", href: "/services/enterprise-risk" }, { label: "GRC", href: "/services/grc" }, { label: "Trust Center", href: "/trust" }],
  },
];

export const resourceMap = Object.fromEntries(resourceCatalog.map((item) => [item.slug, item])) as Record<string, ResourceItem>;
export const resourceTopics = [...new Set(resourceCatalog.map((item) => item.topic))];
export const resourceTypes = [...new Set(resourceCatalog.map((item) => item.type))];
