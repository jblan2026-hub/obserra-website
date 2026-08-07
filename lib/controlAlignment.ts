export type ControlFramework = {
  id: "nist-csf-2" | "iso-27001-2022" | "soc-2" | "cisa-cpg";
  name: string;
  authority: string;
  scope: string;
  controlFamilies: string[];
};

export const controlFrameworks: ControlFramework[] = [
  {
    id: "nist-csf-2",
    name: "NIST Cybersecurity Framework 2.0",
    authority: "National Institute of Standards and Technology",
    scope: "Enterprise cybersecurity risk governance and lifecycle risk management.",
    controlFamilies: ["Govern", "Identify", "Protect", "Detect", "Respond", "Recover"],
  },
  {
    id: "iso-27001-2022",
    name: "ISO/IEC 27001:2022",
    authority: "International Organization for Standardization and International Electrotechnical Commission",
    scope: "Information security management, risk treatment, control ownership, assurance, and continual improvement.",
    controlFamilies: ["Organizational controls", "People controls", "Physical controls", "Technological controls"],
  },
  {
    id: "soc-2",
    name: "SOC 2 Trust Services Criteria",
    authority: "AICPA",
    scope: "Control assurance for security and applicable availability, processing integrity, confidentiality, and privacy criteria.",
    controlFamilies: ["Security", "Availability", "Processing integrity", "Confidentiality", "Privacy"],
  },
  {
    id: "cisa-cpg",
    name: "CISA Cross Sector Cybersecurity Performance Goals",
    authority: "Cybersecurity and Infrastructure Security Agency",
    scope: "Prioritized cybersecurity practices intended to reduce common and high impact cyber risk.",
    controlFamilies: ["Account security", "Data security", "Device security", "Governance and training", "Vulnerability management", "Supply chain", "Response and recovery"],
  },
];

export type AlignmentDomain =
  | "governance"
  | "identity"
  | "data-protection"
  | "secure-development"
  | "monitoring"
  | "incident-response"
  | "resilience"
  | "third-party"
  | "workforce"
  | "physical-security"
  | "ai-governance";

const frameworkReferenceByDomain: Record<AlignmentDomain, Record<ControlFramework["id"], string[]>> = {
  governance: {
    "nist-csf-2": ["GOVERN"],
    "iso-27001-2022": ["ISMS governance", "Organizational controls"],
    "soc-2": ["Security common criteria"],
    "cisa-cpg": ["Governance and training"],
  },
  identity: {
    "nist-csf-2": ["PROTECT", "Identity management, authentication, and access control"],
    "iso-27001-2022": ["Technological controls", "Access control"],
    "soc-2": ["Security common criteria", "Logical access"],
    "cisa-cpg": ["Account security"],
  },
  "data-protection": {
    "nist-csf-2": ["PROTECT", "Data security"],
    "iso-27001-2022": ["Organizational controls", "Technological controls"],
    "soc-2": ["Security", "Confidentiality", "Privacy where applicable"],
    "cisa-cpg": ["Data security"],
  },
  "secure-development": {
    "nist-csf-2": ["GOVERN", "PROTECT", "Platform security"],
    "iso-27001-2022": ["Technological controls", "Secure development lifecycle"],
    "soc-2": ["Security common criteria", "Change management"],
    "cisa-cpg": ["Device security", "Vulnerability management"],
  },
  monitoring: {
    "nist-csf-2": ["DETECT", "Continuous monitoring"],
    "iso-27001-2022": ["Technological controls", "Logging and monitoring"],
    "soc-2": ["Security common criteria", "Monitoring activities"],
    "cisa-cpg": ["Device security", "Vulnerability management"],
  },
  "incident-response": {
    "nist-csf-2": ["RESPOND"],
    "iso-27001-2022": ["Organizational controls", "Information security incident management"],
    "soc-2": ["Security common criteria", "System operations"],
    "cisa-cpg": ["Response and recovery"],
  },
  resilience: {
    "nist-csf-2": ["RECOVER"],
    "iso-27001-2022": ["Organizational controls", "ICT readiness for business continuity"],
    "soc-2": ["Availability", "Security common criteria"],
    "cisa-cpg": ["Response and recovery"],
  },
  "third-party": {
    "nist-csf-2": ["GOVERN", "Cybersecurity supply chain risk management"],
    "iso-27001-2022": ["Organizational controls", "Supplier relationships"],
    "soc-2": ["Security common criteria", "Risk assessment and vendor management"],
    "cisa-cpg": ["Supply chain"],
  },
  workforce: {
    "nist-csf-2": ["GOVERN", "PROTECT", "Awareness and training"],
    "iso-27001-2022": ["People controls"],
    "soc-2": ["Security common criteria", "Control environment"],
    "cisa-cpg": ["Governance and training"],
  },
  "physical-security": {
    "nist-csf-2": ["PROTECT", "Platform and physical environment considerations"],
    "iso-27001-2022": ["Physical controls"],
    "soc-2": ["Security common criteria", "Physical safeguards where applicable"],
    "cisa-cpg": ["Risk based safeguards where applicable"],
  },
  "ai-governance": {
    "nist-csf-2": ["GOVERN", "IDENTIFY", "PROTECT"],
    "iso-27001-2022": ["ISMS governance", "Organizational controls", "Technological controls"],
    "soc-2": ["Security", "Confidentiality", "Privacy where applicable"],
    "cisa-cpg": ["Governance and training", "Data security", "Account security"],
  },
};

export type FrameworkAlignment = {
  framework: ControlFramework;
  references: string[];
};

export function controlAlignmentForDomains(domains: AlignmentDomain[]): FrameworkAlignment[] {
  return controlFrameworks.map((framework) => ({
    framework,
    references: [...new Set(domains.flatMap((domain) => frameworkReferenceByDomain[domain][framework.id]))],
  }));
}

const serviceDomains: Record<string, AlignmentDomain[]> = {
  "cybersecurity-consulting": ["governance", "identity", "data-protection", "monitoring", "incident-response", "resilience", "third-party"],
  "fractional-ciso": ["governance", "incident-response", "resilience", "third-party", "workforce"],
  "ai-governance": ["ai-governance", "governance", "data-protection", "identity", "monitoring"],
  "enterprise-risk": ["governance", "third-party", "resilience"],
  "identity-access-management": ["identity", "governance", "monitoring"],
  grc: ["governance", "third-party", "monitoring"],
  "incident-response": ["incident-response", "monitoring", "resilience"],
  "digital-forensics": ["incident-response", "monitoring", "data-protection"],
  "digital-risk": ["monitoring", "third-party", "identity", "data-protection"],
  "corporate-security": ["physical-security", "governance", "incident-response", "workforce"],
  training: ["workforce", "governance"],
  "technology-consulting": ["secure-development", "data-protection", "identity", "governance", "resilience"],
  "regulatory-assurance": ["governance", "monitoring", "third-party", "data-protection"],
  "executive-protection": ["physical-security", "incident-response", "resilience"],
  "protective-intelligence": ["physical-security", "monitoring", "incident-response"],
};

export function controlAlignmentForService(serviceId: string) {
  return controlAlignmentForDomains(serviceDomains[serviceId] ?? ["governance"]);
}

export const siteWideAlignmentNotice =
  "Framework references describe design alignment, control intent, and traceability. They do not by themselves constitute certification, SOC 2 attestation, regulatory approval, or independent assurance.";
