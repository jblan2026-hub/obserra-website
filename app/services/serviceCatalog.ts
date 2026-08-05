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
  | "ArrowRight";

export type ServiceItem = {
  id: string;
  title: string;
  summary: string;
  detail: string;
  icon: ServiceIconKey;
};

export const serviceCatalog: ServiceItem[] = [
  { id: "executive-protection", title: "Executive Protection", summary: "Executive-facing protective programs with advance planning, travel safeguards, and high-risk event posture control.", detail: "Designed for organizations that need structured protective planning, executive movement support, and disciplined security posture during high-consequence events.", icon: "ShieldCheck" },
  { id: "protective-intelligence", title: "Protective Intelligence", summary: "Operational intelligence workflows that identify threat indicators early and support defensible protective decisions.", detail: "Focuses on evidence-driven threat context, escalation standards, and protective recommendations aligned to mission-critical decisions.", icon: "Brain" },
  { id: "cybersecurity-consulting", title: "Cybersecurity Consulting", summary: "Board-relevant cyber strategy, control architecture, and resilience planning for complex enterprise environments.", detail: "Supports leadership teams with risk-prioritized cybersecurity planning, policy alignment, and practical execution roadmaps.", icon: "LockKeyhole" },
  { id: "fractional-ciso", title: "Fractional CISO", summary: "Interim security leadership for governance maturity, risk reduction, executive reporting, and prioritized execution.", detail: "Provides executive-level security leadership capacity for organizations needing strategic guidance and operating cadence immediately.", icon: "Briefcase" },
  { id: "ai-governance", title: "AI Governance", summary: "Policy-aligned AI operating controls covering model risk, approval workflow, evidence, and accountability.", detail: "Builds practical governance for AI use cases, including approval controls, role accountability, and confidence boundaries.", icon: "Binary" },
  { id: "enterprise-risk", title: "Enterprise Risk", summary: "Cross-functional risk intelligence that links business impact, control posture, and leadership action paths.", detail: "Integrates security, operational, and business risk context so leadership can prioritize actions with clear ownership.", icon: "Landmark" },
  { id: "identity-access-management", title: "Identity Access Management", summary: "Identity lifecycle, privileged access governance, and certification controls for enterprise-scale access risk.", detail: "Improves identity assurance, access governance, and privileged account controls in complex environments.", icon: "Users" },
  { id: "grc", title: "GRC", summary: "Governance, risk, and compliance structures that produce audit-ready evidence and executive-level decision clarity.", detail: "Creates defensible governance mechanisms with clear evidence pathways for internal oversight and external audit requirements.", icon: "Building2" },
  { id: "digital-risk", title: "Digital Risk", summary: "Exposure mapping across identity, surface area, and digital ecosystems with mitigation prioritization.", detail: "Maps business-relevant digital exposure and delivers practical mitigation sequencing for faster risk reduction.", icon: "ShieldCheck" },
  { id: "training", title: "Training", summary: "Outcome-driven professional training through Obserra Academy and enterprise cohort enablement.", detail: "Supports workforce capability in cybersecurity, protection, intelligence, and secure technology through paid structured training.", icon: "BookOpen" },
  { id: "corporate-security", title: "Corporate Security", summary: "Integrated corporate security design aligned to legal, HR, cyber, and physical operations.", detail: "Aligns cross-functional teams around practical corporate security operating models and incident readiness controls.", icon: "ShieldCheck" },
  { id: "technology-consulting", title: "Technology Consulting", summary: "Secure AI-native product strategy, implementation planning, and enterprise integration governance.", detail: "Delivers scoped advisory for secure technology modernization, architecture choices, and controlled implementation pathways.", icon: "ArrowRight" },
];

export const serviceMap = Object.fromEntries(serviceCatalog.map((item) => [item.id, item])) as Record<string, ServiceItem>;
