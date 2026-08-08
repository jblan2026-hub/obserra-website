export type AlignmentId =
  | "nist-csf-2"
  | "iso-27001-2022"
  | "soc-2-tsc"
  | "cisa-cpg"
  | "gdpr"
  | "ccpa-cpra"
  | "pci-dss";

export type AlignmentKind = "framework" | "standard" | "assurance-criteria" | "guidance" | "privacy-law" | "payment-standard";

export type AlignmentAuthority = {
  id: AlignmentId;
  shortName: string;
  name: string;
  kind: AlignmentKind;
  authority: string;
  sourceUrl: string;
  scope: string;
  domains: string[];
  websiteUse: string[];
};

export const alignmentAuthorities: AlignmentAuthority[] = [
  {
    id: "nist-csf-2",
    shortName: "NIST CSF 2.0",
    name: "NIST Cybersecurity Framework 2.0",
    kind: "framework",
    authority: "National Institute of Standards and Technology",
    sourceUrl: "https://www.nist.gov/cyberframework",
    scope: "Cybersecurity governance and risk management across Govern, Identify, Protect, Detect, Respond, and Recover.",
    domains: ["Govern", "Identify", "Protect", "Detect", "Respond", "Recover"],
    websiteUse: ["services", "applications", "academy", "industries", "trust", "security"],
  },
  {
    id: "iso-27001-2022",
    shortName: "ISO/IEC 27001:2022",
    name: "ISO/IEC 27001:2022 Information Security Management Systems",
    kind: "standard",
    authority: "International Organization for Standardization and International Electrotechnical Commission",
    sourceUrl: "https://www.iso.org/standard/27001",
    scope: "Information security management system governance and risk treatment with organizational, people, physical, and technological control themes.",
    domains: ["ISMS governance", "Risk treatment", "Organizational controls", "People controls", "Physical controls", "Technological controls"],
    websiteUse: ["services", "applications", "academy", "industries", "trust", "security", "privacy"],
  },
  {
    id: "soc-2-tsc",
    shortName: "SOC 2 TSC",
    name: "AICPA Trust Services Criteria",
    kind: "assurance-criteria",
    authority: "American Institute of Certified Public Accountants",
    sourceUrl: "https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-2",
    scope: "Trust services criteria used in SOC 2 examinations, including Security and, when applicable, Availability, Processing Integrity, Confidentiality, and Privacy.",
    domains: ["Security", "Availability", "Processing Integrity", "Confidentiality", "Privacy"],
    websiteUse: ["services", "applications", "academy", "industries", "trust", "security", "privacy"],
  },
  {
    id: "cisa-cpg",
    shortName: "CISA CPGs",
    name: "CISA Cross-Sector Cybersecurity Performance Goals",
    kind: "guidance",
    authority: "Cybersecurity and Infrastructure Security Agency",
    sourceUrl: "https://www.cisa.gov/cross-sector-cybersecurity-performance-goals",
    scope: "High-impact cybersecurity practices for reducing common and consequential risks across critical infrastructure and enterprise environments.",
    domains: ["Governance", "Identity and access", "Asset and vulnerability management", "Data protection", "Logging and detection", "Incident response", "Recovery and resilience"],
    websiteUse: ["services", "applications", "academy", "industries", "trust", "security"],
  },
  {
    id: "gdpr",
    shortName: "GDPR",
    name: "EU General Data Protection Regulation",
    kind: "privacy-law",
    authority: "European Union",
    sourceUrl: "https://eur-lex.europa.eu/eli/reg/2016/679/oj",
    scope: "Privacy and data protection obligations for personal data when the GDPR applies, including transparency, rights, privacy by design, security, records, incident response, and risk assessment.",
    domains: ["Lawfulness and transparency", "Data subject rights", "Data minimization", "Privacy by design and default", "Security of processing", "Breach response", "Data protection impact assessment"],
    websiteUse: ["applications", "academy", "trust", "privacy", "commerce", "contact", "portal"],
  },
  {
    id: "ccpa-cpra",
    shortName: "CCPA/CPRA",
    name: "California Consumer Privacy Act as amended by the California Privacy Rights Act",
    kind: "privacy-law",
    authority: "State of California",
    sourceUrl: "https://oag.ca.gov/privacy/ccpa",
    scope: "California privacy requirements when applicable, including notice, consumer rights, sensitive personal information, data minimization, opt-out choices, contractual controls, and reasonable security.",
    domains: ["Notice at collection", "Consumer privacy rights", "Sensitive personal information", "Data minimization and retention", "Opt-out and preference signals", "Service provider and contractor controls", "Reasonable security"],
    websiteUse: ["applications", "academy", "trust", "privacy", "commerce", "contact", "portal"],
  },
  {
    id: "pci-dss",
    shortName: "PCI DSS v4.0.1",
    name: "Payment Card Industry Data Security Standard v4.0.1",
    kind: "payment-standard",
    authority: "PCI Security Standards Council",
    sourceUrl: "https://www.pcisecuritystandards.org/standards/pci-dss/",
    scope: "Payment account data security requirements when payment card data is stored, processed, transmitted, or otherwise brought into PCI DSS scope.",
    domains: ["Network security controls", "Secure configuration", "Account data protection", "Encryption in transit", "Malware protection", "Secure development", "Access control", "Identity and authentication", "Physical access", "Logging and monitoring", "Security testing", "Security policy and program"],
    websiteUse: ["academy", "applications", "commerce", "trust", "security"],
  },
];

export const alignmentById = Object.fromEntries(alignmentAuthorities.map((authority) => [authority.id, authority])) as Record<AlignmentId, AlignmentAuthority>;

export const sitewideAlignmentIds: AlignmentId[] = alignmentAuthorities.map((authority) => authority.id);

export const alignmentDisclaimer =
  "Framework and regulatory alignment describes design intent, control mapping, and applicable operating considerations. It does not by itself constitute ISO certification, a SOC 2 attestation, PCI DSS validation, regulatory approval, legal compliance, or an independent audit opinion.";

export function alignmentForArea(area: string): AlignmentAuthority[] {
  const normalized = area.trim().toLowerCase();
  return alignmentAuthorities.filter((authority) => authority.websiteUse.includes(normalized) || normalized === "sitewide");
}

export function compactAlignmentLabels(ids: AlignmentId[] = sitewideAlignmentIds) {
  return ids.map((id) => alignmentById[id].shortName);
}
