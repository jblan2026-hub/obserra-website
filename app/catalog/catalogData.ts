export type ServicePackage = {
  name: string;
  duration: string;
  idealFor: string;
  priceRange: string;
  outcomes: string[];
};

export const servicePackages: ServicePackage[] = [
  {
    name: "Executive Protection Program",
    duration: "8 to 12 weeks",
    idealFor: "Boards, C-suite teams, and family-office leadership",
    priceRange: "Commercial proposal",
    outcomes: [
      "Protective risk baseline and executive movement protocol",
      "Travel, event, and venue coverage playbook",
      "Escalation matrix spanning security, legal, and communications"
    ]
  },
  {
    name: "Protective Intelligence Sprint",
    duration: "4 to 6 weeks",
    idealFor: "Corporate security operations centers and executive support",
    priceRange: "Commercial proposal",
    outcomes: [
      "Threat indicator taxonomy and triage standards",
      "Analyst workflow with confidence scoring",
      "Decision brief template for leadership action"
    ]
  },
  {
    name: "Cyber Governance Accelerator",
    duration: "6 to 10 weeks",
    idealFor: "Security leaders modernizing governance",
    priceRange: "Commercial proposal",
    outcomes: [
      "Governance charter and control ownership model",
      "Executive cyber metric suite",
      "Quarterly governance operating cadence"
    ]
  },
  {
    name: "Fractional CISO Operating Model",
    duration: "Monthly retainer",
    idealFor: "Mid-market and growth enterprises",
    priceRange: "Retainer on request",
    outcomes: [
      "Board-level reporting and decision support",
      "Risk-prioritized security roadmap",
      "Incident and regulatory readiness cadence"
    ]
  },
  {
    name: "AI Governance and Controls Launch",
    duration: "6 to 8 weeks",
    idealFor: "Teams deploying generative AI in regulated workflows",
    priceRange: "Commercial proposal",
    outcomes: [
      "AI policy set and approval workflow",
      "Model and data handling control map",
      "Executive AI risk dashboard"
    ]
  },
  {
    name: "Identity and Access Assurance Program",
    duration: "8 to 14 weeks",
    idealFor: "Enterprises with privileged access exposure",
    priceRange: "Commercial proposal",
    outcomes: [
      "Identity lifecycle and privileged access controls",
      "Certification campaign operating model",
      "Audit-ready access evidence package"
    ]
  },
  {
    name: "Enterprise Risk Command Pack",
    duration: "10 to 16 weeks",
    idealFor: "Cross-functional leadership teams",
    priceRange: "Commercial proposal",
    outcomes: [
      "Integrated cyber and enterprise risk register",
      "Risk appetite and escalation thresholds",
      "Monthly executive risk command briefing"
    ]
  },
  {
    name: "Secure Technology Modernization Advisory",
    duration: "6 to 12 weeks",
    idealFor: "Technology organizations scaling AI-native products",
    priceRange: "Commercial proposal",
    outcomes: [
      "Secure architecture decision record set",
      "Implementation sequencing and control plan",
      "KPIs for adoption, reliability, and risk"
    ]
  }
];

export const applicationEditions = [
  {
    edition: "Foundation Edition",
    annualRange: "$30K to $60K",
    fits: "Single business unit or pilot deployment",
    includes: ["Core workflows", "Standard integrations", "Quarterly product advisory"]
  },
  {
    edition: "Professional Edition",
    annualRange: "$65K to $140K",
    fits: "Multi-team programs",
    includes: ["Advanced dashboards", "Role-based governance", "Implementation success manager"]
  },
  {
    edition: "Enterprise Edition",
    annualRange: "$150K to $350K",
    fits: "Enterprise operations",
    includes: ["Private cloud options", "Audit export automation", "Executive outcome reviews"]
  },
  {
    edition: "Sovereign Edition",
    annualRange: "Custom pricing",
    fits: "Highly regulated and critical infrastructure",
    includes: ["On-premises deployment", "Enhanced control hardening", "Dedicated solution architect"]
  }
] as const;

export const academyFlagshipCatalog = [
  "Zero Trust Strategy and Implementation",
  "AI Risk, Ethics, and Governance",
  "Executive Threat Assessment and Protective Intelligence",
  "Incident Response Leadership",
  "The New CISO Leadership Playbook",
  "Secure Enterprise LLM Deployment",
  "Identity Security and Access Governance",
  "Business Continuity and Cyber Resilience"
] as const;

export const pricingArchitecture = [
  "Advisory packages: fixed-scope outcomes with clear delivery windows",
  "Application subscriptions: annual licensing by edition plus onboarding",
  "Academy: per-learner checkout for the public catalog and cohort pricing for enterprise",
  "Pilot pricing: low-friction 30 to 90 day entry programs with upgrade credits",
  "Expansion pricing: add-on modules for integrations, reporting, and governance depth"
] as const;

export const productBriefs = [
  {
    name: "EIOS Executive Command Brief",
    purpose: "Unify cross-domain operational intelligence, governance, and decision evidence for executive buyers.",
    deliverables: ["Architecture map", "Integration plan", "Executive dashboard storyboard"]
  },
  {
    name: "AI Governance Suite Brief",
    purpose: "Operationalize policy-aligned AI approvals, controls, and accountability.",
    deliverables: ["Governance control matrix", "Approval workflow design", "Board reporting prototype"]
  },
  {
    name: "Identity Certification Manager Brief",
    purpose: "Reduce access risk with accountable certification campaigns and evidence trails.",
    deliverables: ["Campaign baseline", "Exception handling runbook", "Certification KPI pack"]
  },
  {
    name: "Obserra EPI Academy Enterprise Cohort Brief",
    purpose: "Build workforce capability with role-aligned cyber and intelligence training.",
    deliverables: ["Cohort curriculum map", "Completion dashboard", "Leadership impact summary"]
  }
] as const;

export const sampleDeliverables = [
  "Executive risk register with confidence labels",
  "Security control evidence bundle for audit and leadership review",
  "Protective intelligence daily brief template",
  "AI model approval and exception policy pack",
  "Incident command timeline and role playbook",
  "Board-level security metric dashboard"
] as const;

export const pilotOffers = [
  {
    name: "30-Day Protective Intelligence Pilot",
    target: "Corporate security leaders",
    successMetric: "Validated threat triage workflow and weekly executive brief adoption"
  },
  {
    name: "45-Day AI Governance Pilot",
    target: "AI program and risk owners",
    successMetric: "Policy-aligned approval workflow for the first 10 business use cases"
  },
  {
    name: "60-Day Identity Assurance Pilot",
    target: "Identity and compliance teams",
    successMetric: "First certification cycle completed with evidence and remediation closure"
  },
  {
    name: "Academy Cohort Pilot",
    target: "Security leadership and operations teams",
    successMetric: "80 percent completion and measurable readiness uplift"
  }
] as const;

export const caseStudies = [
  {
    title: "Global services enterprise reduced privileged access exposure",
    challenge: "Identity certification was manual and slow across multiple systems.",
    action: "Implemented a staged IAM assurance program with certification workflows and exception governance.",
    impact: "Reduced unresolved privileged access exceptions by 62 percent in one quarter."
  },
  {
    title: "Executive protection office improved travel risk readiness",
    challenge: "Threat data was fragmented and escalation criteria were inconsistent.",
    action: "Deployed a protective intelligence sprint with confidence-scored decision briefs and on-call playbooks.",
    impact: "Cut escalation decision time from days to same-day with clearer command accountability."
  },
  {
    title: "Technology organization operationalized AI governance",
    challenge: "Teams were shipping AI features without consistent approval controls.",
    action: "Launched AI governance controls, model inventory, and an executive risk review cadence.",
    impact: "Reached policy-compliant approval for 100 percent of prioritized AI releases in the pilot window."
  }
] as const;

export const proofBacklog = [
  "Publish founder product videos for EIOS, AI Governance Suite, and Academy cohorts",
  "Release app demonstration recordings for three available products",
  "Add course preview clips for flagship Academy offerings",
  "Publish redacted sample reports from risk, identity, and intelligence engagements",
  "Recruit 10 pilot users across app and advisory lines",
  "Collect 6 verified testimonials tied to measurable business outcomes",
  "Maintain transparent security and data handling disclosures in Trust Center"
] as const;

export const demandGenerationPlan = [
  "Launch LinkedIn campaigns by business line with weekly thought leadership and product proof",
  "Run monthly executive briefings focused on AI governance, cyber resilience, and executive protection",
  "Publish one lead magnet per line: cyber, protection, intelligence, technology",
  "Activate targeted email outreach to CISOs, CSOs, risk executives, and transformation leaders",
  "Build referral partnerships with legal, compliance, and managed security providers",
  "Pursue joint briefs with corporate security and cyber advisory firms",
  "Run Academy cohort campaigns with role-based enrollment offers",
  "Launch qualified app pilots with conversion paths to annual editions"
] as const;

export const funnelMetrics = [
  "Leads",
  "Qualified demonstrations",
  "Proposals",
  "Purchases",
  "Renewals"
] as const;
