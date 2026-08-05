export type ServiceIconKey =
  | "ShieldCheck"
  | "Brain"
  | "LockKeyhole"
  | "Briefcase"
  | "Binary"
  | "Landmark"
  | "Users"
  | "Building2"
  | "BookOpen"
  | "ArrowRight"
  | "Network"
  | "Scale"
  | "Crosshair"
  | "FileCheck2";

export type ServiceItem = {
  id: string;
  title: string;
  category: string;
  summary: string;
  detail: string;
  icon: ServiceIconKey;
  outcomes: string[];
  deliverables: string[];
  engagementSteps: string[];
  industries: string[];
};

export const serviceCatalog: ServiceItem[] = [
  {
    id: "executive-protection",
    title: "Executive Protection",
    category: "Protection",
    summary: "Executive-facing protective programs with advance planning, travel safeguards, and high-risk event posture control.",
    detail: "Designed for organizations that need structured protective planning, executive movement support, and disciplined security posture during high-consequence events.",
    icon: "ShieldCheck",
    outcomes: ["Reduce avoidable exposure before travel, meetings, and public activity.", "Create repeatable protective processes and escalation paths.", "Align executive protection with intelligence, cyber, legal, and operations."],
    deliverables: ["Protective-risk scoping", "Advance and movement planning", "Executive coordination model", "Escalation and response playbook"],
    engagementSteps: ["Define people, assets, schedules, and exposure windows.", "Assess travel, venue, digital, communications, and threat context.", "Deliver a scoped protective plan with ownership and response paths."],
    industries: ["Corporate", "Financial services", "Technology", "Healthcare"],
  },
  {
    id: "protective-intelligence",
    title: "Protective Intelligence",
    category: "Intelligence",
    summary: "Operational intelligence workflows that identify threat indicators early and support defensible protective decisions.",
    detail: "Focuses on evidence-driven threat context, escalation standards, watchlists, and protective recommendations aligned to mission-critical decisions.",
    icon: "Brain",
    outcomes: ["Improve early identification of relevant threat indicators.", "Create consistent escalation and confidence standards.", "Connect intelligence findings to protective and executive action."],
    deliverables: ["Threat and exposure assessment", "Watchlist and monitoring design", "Escalation criteria", "Executive intelligence brief"],
    engagementSteps: ["Identify protected people, assets, geographies, and decisions.", "Define collection, validation, scoring, and escalation requirements.", "Operationalize reporting, review cadence, and response ownership."],
    industries: ["Corporate", "Government", "Technology", "Critical infrastructure"],
  },
  {
    id: "cybersecurity-consulting",
    title: "Cybersecurity Consulting",
    category: "Cybersecurity",
    summary: "Board-relevant cyber strategy, control architecture, and resilience planning for complex enterprise environments.",
    detail: "Supports leadership teams with risk-prioritized cybersecurity planning, policy alignment, operating-model design, and practical implementation roadmaps.",
    icon: "LockKeyhole",
    outcomes: ["Translate technical exposure into executive priorities.", "Strengthen governance, control ownership, and evidence.", "Sequence investments by risk reduction and business impact."],
    deliverables: ["Cybersecurity strategy", "Control and maturity assessment", "Executive roadmap", "Board and leadership reporting"],
    engagementSteps: ["Establish business context, risk appetite, and material assets.", "Assess governance, controls, evidence, and operational performance.", "Prioritize remediation, investment, ownership, and reporting cadence."],
    industries: ["Healthcare", "Manufacturing", "Financial services", "Technology"],
  },
  {
    id: "fractional-ciso",
    title: "Fractional CISO",
    category: "Executive Leadership",
    summary: "Interim security leadership for governance maturity, risk reduction, executive reporting, and prioritized execution.",
    detail: "Provides executive-level security leadership capacity for organizations needing strategic guidance, operating cadence, and accountable execution immediately.",
    icon: "Briefcase",
    outcomes: ["Establish visible executive ownership for cybersecurity risk.", "Create a repeatable governance and reporting cadence.", "Accelerate decisions, remediation, and organizational alignment."],
    deliverables: ["Security operating model", "Executive and board reporting", "Risk and investment roadmap", "Leadership and stakeholder cadence"],
    engagementSteps: ["Confirm mandate, authority, stakeholders, and urgent risks.", "Stabilize governance, reporting, priorities, and operating cadence.", "Drive execution while developing sustainable internal capability."],
    industries: ["Technology", "Healthcare", "Professional services", "Manufacturing"],
  },
  {
    id: "ai-governance",
    title: "AI Governance",
    category: "AI and Governance",
    summary: "Policy-aligned AI operating controls covering model risk, approval workflow, evidence, and accountability.",
    detail: "Builds practical governance for AI use cases, including approval controls, role accountability, human oversight, data boundaries, and confidence requirements.",
    icon: "Binary",
    outcomes: ["Create accountable AI decision rights and approval pathways.", "Reduce unmanaged data, model, legal, and operational risk.", "Establish evidence, monitoring, and human-oversight requirements."],
    deliverables: ["AI governance framework", "Use-case intake and risk classification", "Policy and control set", "Executive AI risk reporting"],
    engagementSteps: ["Inventory AI use cases, stakeholders, data, and decisions.", "Classify risk and define approvals, controls, and evidence.", "Operationalize monitoring, accountability, escalation, and review."],
    industries: ["Technology", "Healthcare", "Financial services", "Government"],
  },
  {
    id: "enterprise-risk",
    title: "Enterprise Risk",
    category: "Risk",
    summary: "Cross-functional risk intelligence that links business impact, control posture, and leadership action paths.",
    detail: "Integrates security, operational, legal, financial, and business risk context so leadership can prioritize actions with clear ownership.",
    icon: "Landmark",
    outcomes: ["Create a unified view of cross-domain enterprise risk.", "Prioritize material risks by impact, urgency, and confidence.", "Clarify ownership, treatment decisions, and executive reporting."],
    deliverables: ["Enterprise risk taxonomy", "Risk assessment and prioritization", "Executive risk register", "Treatment and governance roadmap"],
    engagementSteps: ["Define material objectives, assets, dependencies, and risk criteria.", "Assess exposure, controls, evidence, and business impact.", "Prioritize treatment, ownership, escalation, and reporting."],
    industries: ["Financial services", "Healthcare", "Manufacturing", "Corporate"],
  },
  {
    id: "identity-access-management",
    title: "Identity and Access Management",
    category: "Identity",
    summary: "Identity lifecycle, privileged access governance, and certification controls for enterprise-scale access risk.",
    detail: "Improves identity assurance, access governance, privileged account controls, and auditable access decisions in complex environments.",
    icon: "Users",
    outcomes: ["Reduce excessive, orphaned, and privileged access risk.", "Improve joiner, mover, leaver, and certification discipline.", "Strengthen evidence and accountability for access decisions."],
    deliverables: ["IAM operating model", "Privileged-access roadmap", "Access certification design", "Identity-control assessment"],
    engagementSteps: ["Map identities, systems, roles, privileges, and lifecycle events.", "Assess governance, technical controls, exceptions, and evidence.", "Prioritize architecture, process, ownership, and implementation."],
    industries: ["Financial services", "Healthcare", "Technology", "Manufacturing"],
  },
  {
    id: "grc",
    title: "Governance, Risk and Compliance",
    category: "Governance",
    summary: "Governance, risk, and compliance structures that produce audit-ready evidence and executive-level decision clarity.",
    detail: "Creates defensible governance mechanisms, control mappings, evidence pathways, and accountability for internal oversight and external review.",
    icon: "Building2",
    outcomes: ["Clarify control ownership and governance accountability.", "Reduce duplicated evidence and fragmented compliance work.", "Improve audit readiness and executive visibility."],
    deliverables: ["GRC operating model", "Framework and control mapping", "Evidence-management design", "Compliance and assurance roadmap"],
    engagementSteps: ["Identify obligations, frameworks, controls, and stakeholders.", "Assess governance, evidence, workflows, and tooling.", "Design the target operating model and prioritized implementation."],
    industries: ["Healthcare", "Government", "Financial services", "Technology"],
  },
  {
    id: "incident-response",
    title: "Incident Response Readiness",
    category: "Resilience",
    summary: "Executive, technical, legal, communications, and operational readiness for high-consequence cyber incidents.",
    detail: "Builds coordinated decision structures, playbooks, escalation criteria, exercises, and evidence requirements before a material incident occurs.",
    icon: "Crosshair",
    outcomes: ["Reduce decision latency during material incidents.", "Align technical, executive, legal, communications, and operational roles.", "Improve exercise evidence and corrective-action ownership."],
    deliverables: ["Incident-response operating model", "Executive and technical playbooks", "Tabletop exercise", "Corrective-action roadmap"],
    engagementSteps: ["Define scenarios, stakeholders, authorities, and escalation thresholds.", "Assess plans, evidence, communications, and dependencies.", "Exercise the model and prioritize corrective actions."],
    industries: ["Healthcare", "Financial services", "Manufacturing", "Technology"],
  },
  {
    id: "digital-forensics",
    title: "Digital Forensics Advisory",
    category: "Forensics",
    summary: "Governed forensic-readiness, evidence handling, investigation planning, and executive decision support.",
    detail: "Helps organizations prepare for defensible evidence collection, preserve chain of custody, coordinate stakeholders, and scope specialist forensic response.",
    icon: "FileCheck2",
    outcomes: ["Improve readiness to preserve and analyze relevant evidence.", "Clarify legal, HR, security, and executive decision paths.", "Reduce avoidable evidence-handling and investigation risks."],
    deliverables: ["Forensic-readiness assessment", "Evidence-handling protocol", "Investigation governance model", "Specialist-response scoping"],
    engagementSteps: ["Identify likely scenarios, systems, evidence sources, and authorities.", "Assess preservation, access, documentation, and stakeholder readiness.", "Define response pathways, specialist needs, and governance controls."],
    industries: ["Corporate", "Healthcare", "Financial services", "Government"],
  },
  {
    id: "digital-risk",
    title: "Digital Risk and Exposure",
    category: "Risk Intelligence",
    summary: "Exposure mapping across identity, attack surface, third parties, and digital ecosystems with mitigation prioritization.",
    detail: "Maps business-relevant digital exposure and delivers practical mitigation sequencing for faster and more measurable risk reduction.",
    icon: "Network",
    outcomes: ["Connect external exposure to business assets and decisions.", "Prioritize remediation by exploitability and business impact.", "Improve ownership and monitoring of digital exposure."],
    deliverables: ["Exposure assessment", "Attack-surface and dependency map", "Prioritized mitigation plan", "Executive risk brief"],
    engagementSteps: ["Identify critical assets, identities, vendors, and digital dependencies.", "Assess exposure, threat relevance, controls, and business impact.", "Prioritize mitigation, ownership, monitoring, and reporting."],
    industries: ["Technology", "Financial services", "Healthcare", "Manufacturing"],
  },
  {
    id: "corporate-security",
    title: "Corporate Security",
    category: "Security Operations",
    summary: "Integrated corporate security design aligned to legal, HR, cyber, facilities, investigations, and physical operations.",
    detail: "Aligns cross-functional teams around practical corporate security operating models, incident readiness, investigations, and executive protection.",
    icon: "ShieldCheck",
    outcomes: ["Reduce fragmentation across cyber, physical, legal, HR, and investigations.", "Clarify authorities, escalation, and incident ownership.", "Create a measurable enterprise security operating model."],
    deliverables: ["Corporate security operating model", "Security governance and RACI", "Incident and investigations playbooks", "Capability roadmap"],
    engagementSteps: ["Map security functions, authorities, assets, and dependencies.", "Assess governance, operations, workflows, and coordination gaps.", "Design the target model, ownership, and implementation roadmap."],
    industries: ["Corporate", "Manufacturing", "Technology", "Financial services"],
  },
  {
    id: "training",
    title: "Enterprise Training",
    category: "Workforce Capability",
    summary: "Outcome-driven professional training through Obserra Academy, executive briefings, and enterprise cohort enablement.",
    detail: "Supports workforce capability in cybersecurity, protection, intelligence, governance, and secure technology through structured training and enterprise programs.",
    icon: "BookOpen",
    outcomes: ["Build role-specific capability linked to operating responsibilities.", "Create measurable cohort completion and learning pathways.", "Improve leadership and workforce readiness for material risks."],
    deliverables: ["Role-based learning path", "Enterprise cohort delivery", "Executive briefing", "Completion and certificate reporting"],
    engagementSteps: ["Define audience, capability gaps, outcomes, and delivery constraints.", "Select or customize curriculum, cohort model, and reporting.", "Deliver training and measure completion, feedback, and next steps."],
    industries: ["All sectors", "Government", "Healthcare", "Technology"],
  },
  {
    id: "technology-consulting",
    title: "Secure Technology Consulting",
    category: "Technology",
    summary: "Secure AI-native product strategy, architecture planning, implementation governance, and enterprise integration advisory.",
    detail: "Delivers scoped advisory for secure technology modernization, architecture choices, integration, data governance, and controlled implementation pathways.",
    icon: "ArrowRight",
    outcomes: ["Align technology decisions to business value and risk.", "Embed security, privacy, governance, and resilience from design.", "Reduce architecture ambiguity and implementation rework."],
    deliverables: ["Technology strategy", "Target architecture", "Secure implementation roadmap", "Integration and governance model"],
    engagementSteps: ["Define business outcomes, constraints, users, data, and dependencies.", "Evaluate architecture, security, governance, and implementation options.", "Recommend target design, sequencing, ownership, and assurance gates."],
    industries: ["Technology", "Healthcare", "Manufacturing", "Financial services"],
  },
  {
    id: "regulatory-assurance",
    title: "Regulatory and Control Assurance",
    category: "Assurance",
    summary: "Framework alignment, control validation, evidence strategy, and readiness support for regulated environments.",
    detail: "Supports organizations preparing for internal review, customer assurance, audit, regulatory examination, or framework-based maturity improvement.",
    icon: "Scale",
    outcomes: ["Improve traceability from obligations to controls and evidence.", "Identify readiness gaps before external review.", "Prioritize assurance work by material risk and deadline."],
    deliverables: ["Framework readiness assessment", "Control and evidence matrix", "Gap-remediation roadmap", "Executive assurance brief"],
    engagementSteps: ["Confirm frameworks, obligations, scope, deadlines, and evidence owners.", "Assess controls, implementation, evidence, and governance.", "Prioritize remediation, validation, and executive reporting."],
    industries: ["Healthcare", "Government", "Financial services", "Technology"],
  },
];

export const serviceMap = Object.fromEntries(serviceCatalog.map((item) => [item.id, item])) as Record<string, ServiceItem>;
