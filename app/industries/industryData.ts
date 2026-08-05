export type IndustrySolution = {
  slug: string;
  name: string;
  shortName: string;
  summary: string;
  executiveOverview: string;
  operatingPressures: string[];
  regulatoryContext: string[];
  cyberPriorities: string[];
  protectionConsiderations: string[];
  aiGovernance: string[];
  serviceSlugs: string[];
  eiosCapabilities: string[];
  academyPathways: string[];
  intelligenceFocus: string[];
};

export const industrySolutions: IndustrySolution[] = [
  {
    slug: "healthcare",
    name: "Healthcare",
    shortName: "Healthcare",
    summary: "Protect clinical operations, sensitive data, connected environments, and executive decision-making across complex care delivery systems.",
    executiveOverview: "Healthcare leaders must balance patient safety, operational continuity, privacy, cyber resilience, and rapid technology adoption. Obserra connects those priorities into one executive decision framework.",
    operatingPressures: ["Patient-safety and care-continuity dependencies", "Third-party and connected-device exposure", "Workforce identity and privileged-access complexity", "Board and executive accountability for material cyber risk"],
    regulatoryContext: ["HIPAA and HITECH obligations", "NIST Cybersecurity Framework alignment", "State privacy and breach-notification requirements", "Healthcare-sector resilience and assurance expectations"],
    cyberPriorities: ["Clinical and enterprise identity governance", "Ransomware resilience and incident readiness", "Medical-device and connected-environment risk", "Third-party and supply-chain assurance"],
    protectionConsiderations: ["Executive and clinician threat awareness", "Facility, travel, and public-event coordination", "Sensitive-case and reputational-risk monitoring"],
    aiGovernance: ["Clinical AI use-case approval and accountability", "Model risk, data provenance, and human oversight", "Privacy and security controls for AI-enabled workflows"],
    serviceSlugs: ["cybersecurity-consulting", "incident-response", "identity-access-management", "enterprise-risk"],
    eiosCapabilities: ["executive-mission-control", "enterprise-digital-twin", "executive-ai-advisor"],
    academyPathways: ["Executive cyber-risk briefings", "Healthcare security cohorts", "Incident leadership exercises"],
    intelligenceFocus: ["Healthcare-sector threat activity", "Regulatory and privacy changes", "Vendor and supply-chain exposure"]
  },
  {
    slug: "medical-devices",
    name: "Medical Devices",
    shortName: "Medical Devices",
    summary: "Unify product security, quality, regulatory, privacy, and enterprise cyber risk across the full device lifecycle.",
    executiveOverview: "Medical-device organizations operate where patient safety, product quality, cybersecurity, regulatory evidence, and software supply-chain integrity converge. Obserra helps leadership govern those risks as one enterprise system.",
    operatingPressures: ["Product cybersecurity throughout the lifecycle", "Quality-system and regulatory evidence requirements", "Software bill of materials and supplier dependencies", "Postmarket monitoring and coordinated response"],
    regulatoryContext: ["FDA medical-device cybersecurity guidance", "Secure software development expectations", "Quality-system and risk-management requirements", "Privacy and global market obligations"],
    cyberPriorities: ["Secure product architecture and threat modeling", "SBOM and software supply-chain governance", "Vulnerability intake and postmarket response", "Enterprise-to-product risk correlation"],
    protectionConsiderations: ["Executive and researcher protection", "Sensitive product and intellectual-property exposure", "Travel and event security for leadership teams"],
    aiGovernance: ["AI-enabled product governance", "Model change control and validation evidence", "Human oversight and safety-impact escalation"],
    serviceSlugs: ["cybersecurity-consulting", "regulatory-assurance", "technology-consulting", "digital-risk"],
    eiosCapabilities: ["enterprise-knowledge-graph", "architecture-and-security", "enterprise-integrations"],
    academyPathways: ["Product-security leadership", "FDA cybersecurity readiness", "Secure development training"],
    intelligenceFocus: ["Medical-device vulnerabilities", "FDA and global regulatory developments", "Supplier and component risk"]
  },
  {
    slug: "pharmaceuticals",
    name: "Pharmaceuticals",
    shortName: "Pharmaceuticals",
    summary: "Protect research, manufacturing, regulated data, intellectual property, and global executive operations.",
    executiveOverview: "Pharmaceutical enterprises require integrated governance across research, manufacturing, privacy, cyber resilience, supply chains, and executive risk. Obserra delivers a unified operating view for those dependencies.",
    operatingPressures: ["Research and intellectual-property protection", "Global manufacturing and supply-chain resilience", "Regulated data and validated environments", "Third-party and geopolitical exposure"],
    regulatoryContext: ["GxP and validated-system expectations", "Privacy and clinical-data obligations", "NIST and ISO-aligned security governance", "Global regulatory and records requirements"],
    cyberPriorities: ["Research and laboratory security", "Manufacturing and OT resilience", "Identity and privileged-access governance", "Third-party and clinical-trial ecosystem assurance"],
    protectionConsiderations: ["Executive travel and geopolitical risk", "Researcher and facility threat awareness", "High-profile event and public-appearance planning"],
    aiGovernance: ["AI use in research and regulated workflows", "Data lineage and model accountability", "Approval controls and evidentiary traceability"],
    serviceSlugs: ["enterprise-risk", "cybersecurity-consulting", "protective-intelligence", "grc"],
    eiosCapabilities: ["enterprise-digital-twin", "enterprise-knowledge-graph", "board-intelligence"],
    academyPathways: ["Executive risk governance", "OT and manufacturing security", "AI governance cohorts"],
    intelligenceFocus: ["Sector threat intelligence", "Geopolitical and supply-chain developments", "Regulatory change monitoring"]
  },
  {
    slug: "financial-services",
    name: "Financial Services",
    shortName: "Financial Services",
    summary: "Strengthen cyber governance, operational resilience, fraud-risk visibility, third-party assurance, and board accountability.",
    executiveOverview: "Financial institutions require continuous assurance across cybersecurity, resilience, identity, third parties, AI, and regulatory obligations. Obserra translates those demands into prioritized executive action.",
    operatingPressures: ["Material operational-resilience expectations", "High-value identity and fraud exposure", "Complex third-party and cloud dependencies", "Board-level cyber and technology accountability"],
    regulatoryContext: ["Financial-sector supervisory expectations", "NIST, ISO, and control-assurance frameworks", "Privacy and records obligations", "Operational resilience and incident reporting"],
    cyberPriorities: ["Identity, privileged access, and fraud-risk governance", "Cloud and third-party assurance", "Incident readiness and executive crisis coordination", "Control effectiveness and evidence traceability"],
    protectionConsiderations: ["Executive threat and travel intelligence", "High-profile meeting and event security", "Digital exposure and impersonation monitoring"],
    aiGovernance: ["Model-risk governance and approval workflows", "Explainability and human oversight", "Data-use, privacy, and fairness controls"],
    serviceSlugs: ["fractional-ciso", "identity-access-management", "grc", "incident-response"],
    eiosCapabilities: ["board-intelligence", "executive-ai-advisor", "enterprise-integrations"],
    academyPathways: ["Board cyber governance", "Financial-services resilience", "AI risk management"],
    intelligenceFocus: ["Financial-sector threats", "Regulatory developments", "Fraud, third-party, and geopolitical signals"]
  },
  {
    slug: "insurance",
    name: "Insurance",
    shortName: "Insurance",
    summary: "Connect cyber risk, underwriting intelligence, privacy, claims resilience, third-party exposure, and AI governance.",
    executiveOverview: "Insurers face simultaneous exposure as regulated enterprises, data custodians, risk underwriters, and AI adopters. Obserra helps leadership integrate those perspectives into defensible decisions.",
    operatingPressures: ["Sensitive policyholder and claims data", "AI-enabled underwriting and claims workflows", "Third-party and distribution-channel dependencies", "Cyber-risk accumulation and enterprise resilience"],
    regulatoryContext: ["Insurance-sector cybersecurity requirements", "Privacy and records obligations", "AI and model-governance expectations", "Operational resilience and incident reporting"],
    cyberPriorities: ["Identity and data-governance controls", "Third-party and SaaS assurance", "Incident and ransomware preparedness", "Cyber-risk and control-evidence correlation"],
    protectionConsiderations: ["Executive and claims-related threat awareness", "Travel and public-event support", "Digital exposure and harassment monitoring"],
    aiGovernance: ["Underwriting and claims model accountability", "Bias, explainability, and approval controls", "Data provenance and human review"],
    serviceSlugs: ["enterprise-risk", "ai-governance", "digital-risk", "grc"],
    eiosCapabilities: ["executive-mission-control", "executive-ai-advisor", "enterprise-knowledge-graph"],
    academyPathways: ["Insurance cyber governance", "AI governance leadership", "Third-party risk training"],
    intelligenceFocus: ["Insurance-sector cyber trends", "Regulatory and litigation developments", "Vendor and concentration risk"]
  },
  {
    slug: "manufacturing",
    name: "Manufacturing",
    shortName: "Manufacturing",
    summary: "Connect enterprise cyber risk, operational technology, supply chains, product security, and business continuity.",
    executiveOverview: "Manufacturers depend on tightly coupled enterprise, plant, supplier, product, and logistics ecosystems. Obserra gives leadership one consequence-aware view of those interdependencies.",
    operatingPressures: ["OT and production availability", "Supplier and logistics dependencies", "Product and intellectual-property protection", "Legacy technology and distributed operations"],
    regulatoryContext: ["NIST and industry control frameworks", "Customer and contractual assurance requirements", "Product-security and privacy obligations", "Safety and business-continuity expectations"],
    cyberPriorities: ["OT segmentation and resilience", "Supply-chain and third-party risk", "Identity and remote-access governance", "Incident coordination across plants and enterprise teams"],
    protectionConsiderations: ["Facility and executive threat awareness", "Travel and site-visit risk", "Labor, protest, and disruption intelligence"],
    aiGovernance: ["AI use in production and quality workflows", "Operational safety and human oversight", "Data lineage and change-control governance"],
    serviceSlugs: ["cybersecurity-consulting", "enterprise-risk", "corporate-security", "incident-response"],
    eiosCapabilities: ["enterprise-digital-twin", "enterprise-integrations", "architecture-and-security"],
    academyPathways: ["OT security leadership", "Manufacturing resilience", "Supply-chain risk cohorts"],
    intelligenceFocus: ["OT threats and vulnerabilities", "Supplier and geopolitical risk", "Operational disruption indicators"]
  },
  {
    slug: "energy-utilities",
    name: "Energy and Utilities",
    shortName: "Energy & Utilities",
    summary: "Protect high-availability operations through consequence-aware cyber resilience, intelligence, and governance.",
    executiveOverview: "Energy and utility organizations operate essential services where cyber, physical, geopolitical, environmental, and supply-chain risks intersect. Obserra unifies those signals for executive action.",
    operatingPressures: ["High-availability and public-safety obligations", "Distributed OT and field operations", "Geopolitical and supply-chain exposure", "Physical-cyber convergence"],
    regulatoryContext: ["Critical-infrastructure cybersecurity expectations", "NIST and sector-specific control frameworks", "Incident reporting and resilience requirements", "Environmental, safety, and reliability obligations"],
    cyberPriorities: ["OT and control-system resilience", "Identity and remote-access governance", "Threat intelligence and incident command", "Supplier and infrastructure dependency mapping"],
    protectionConsiderations: ["Executive, facility, and field-team protection", "Travel and geopolitical risk", "Protest, sabotage, and insider-threat awareness"],
    aiGovernance: ["AI use in grid and operational decision support", "Safety boundaries and human authorization", "Data quality, drift, and explainability"],
    serviceSlugs: ["protective-intelligence", "incident-response", "enterprise-risk", "corporate-security"],
    eiosCapabilities: ["enterprise-digital-twin", "executive-mission-control", "enterprise-integrations"],
    academyPathways: ["Critical-infrastructure leadership", "OT incident command", "Executive protection awareness"],
    intelligenceFocus: ["Nation-state and infrastructure threats", "Weather and disaster intelligence", "Supply-chain and geopolitical developments"]
  },
  {
    slug: "critical-infrastructure",
    name: "Critical Infrastructure",
    shortName: "Critical Infrastructure",
    summary: "Integrate cyber, physical, geopolitical, supply-chain, and continuity risk across essential services.",
    executiveOverview: "Critical-infrastructure leaders must make rapid decisions with incomplete information and high consequences. Obserra brings cross-domain intelligence, governance, and response priorities into one operating picture.",
    operatingPressures: ["Essential-service continuity", "Physical-cyber interdependencies", "Nation-state and criminal threat activity", "Public confidence and government coordination"],
    regulatoryContext: ["NIST Cybersecurity Framework", "Sector-specific resilience requirements", "Incident reporting and government coordination", "Supply-chain and infrastructure assurance"],
    cyberPriorities: ["Asset and dependency visibility", "Operational resilience and segmentation", "Incident command and executive escalation", "Continuous intelligence and risk reprioritization"],
    protectionConsiderations: ["Executive and key-person protection", "Facility and event intelligence", "Threat monitoring for sabotage, protest, and targeted violence"],
    aiGovernance: ["AI-assisted operational decisions", "Human authorization and fail-safe controls", "Model security, auditability, and resilience"],
    serviceSlugs: ["protective-intelligence", "cybersecurity-consulting", "incident-response", "digital-risk"],
    eiosCapabilities: ["enterprise-digital-twin", "executive-ai-advisor", "architecture-and-security"],
    academyPathways: ["Critical-infrastructure governance", "Executive crisis leadership", "Threat-intelligence operations"],
    intelligenceFocus: ["Infrastructure-sector threats", "Geopolitical and disaster intelligence", "Cross-sector dependency risk"]
  },
  {
    slug: "technology-saas",
    name: "Technology and SaaS",
    shortName: "Technology & SaaS",
    summary: "Scale secure products, AI governance, customer assurance, cloud resilience, and enterprise risk management.",
    executiveOverview: "Technology companies must move quickly while maintaining customer trust, secure development, platform resilience, privacy, and responsible AI. Obserra converts those requirements into scalable governance.",
    operatingPressures: ["Rapid product and AI release cycles", "Customer assurance and contractual commitments", "Cloud, identity, and software supply-chain risk", "Global privacy and regulatory obligations"],
    regulatoryContext: ["Secure software development expectations", "Privacy and AI regulations", "SOC 2 and ISO-aligned customer assurance", "Cyber incident and disclosure obligations"],
    cyberPriorities: ["Secure SDLC and product security", "Cloud and identity architecture", "Customer trust and evidence management", "Incident readiness and resilience engineering"],
    protectionConsiderations: ["Founder and executive digital exposure", "Event, travel, and public-appearance security", "Doxxing, impersonation, and targeted-threat monitoring"],
    aiGovernance: ["Model lifecycle and prompt governance", "Agent permissions and human oversight", "Data-use, safety, and explainability controls"],
    serviceSlugs: ["technology-consulting", "ai-governance", "cybersecurity-consulting", "regulatory-assurance"],
    eiosCapabilities: ["architecture-and-security", "enterprise-integrations", "executive-ai-advisor"],
    academyPathways: ["Secure software development", "AI product governance", "Customer assurance leadership"],
    intelligenceFocus: ["Cloud and software vulnerabilities", "AI and privacy regulation", "Supply-chain and customer-trust developments"]
  },
  {
    slug: "government",
    name: "Government",
    shortName: "Government",
    summary: "Improve mission assurance, secure technology adoption, intelligence workflows, and compliance-aligned execution.",
    executiveOverview: "Government organizations require secure, accountable, and resilient operations across mission systems, personnel, suppliers, data, and emerging technology. Obserra provides decision support without overstating authorization status.",
    operatingPressures: ["Mission continuity and public accountability", "Legacy and modern technology integration", "Workforce, contractor, and supplier complexity", "High-consequence cyber and physical threats"],
    regulatoryContext: ["NIST SP 800-53 and RMF alignment", "CMMC and federal supplier expectations where applicable", "Records, privacy, and accessibility obligations", "Agency-specific security and resilience requirements"],
    cyberPriorities: ["Zero-trust and identity governance", "Control evidence and continuous monitoring", "Incident command and mission resilience", "Secure modernization and supply-chain risk"],
    protectionConsiderations: ["Executive and public-official protection planning", "Travel, facility, and event intelligence", "Targeted-threat and insider-risk awareness"],
    aiGovernance: ["Responsible public-sector AI use", "Human authority, transparency, and auditability", "Model security and data-governance controls"],
    serviceSlugs: ["grc", "identity-access-management", "protective-intelligence", "technology-consulting"],
    eiosCapabilities: ["architecture-and-security", "board-intelligence", "enterprise-knowledge-graph"],
    academyPathways: ["NIST governance leadership", "Government cyber resilience", "Responsible AI training"],
    intelligenceFocus: ["Public-sector threat intelligence", "Regulatory and policy changes", "Supplier and geopolitical risk"]
  },
  {
    slug: "defense",
    name: "Defense",
    shortName: "Defense",
    summary: "Support mission assurance, controlled information, secure supply chains, executive protection, and emerging-technology governance.",
    executiveOverview: "Defense organizations and suppliers must protect missions, people, controlled information, technology, and complex supply chains. Obserra aligns enterprise risk, cyber assurance, intelligence, and executive decision support.",
    operatingPressures: ["Mission and program protection", "Controlled information and supplier risk", "Nation-state targeting and insider threats", "Secure technology and AI adoption"],
    regulatoryContext: ["NIST SP 800-171 and CMMC alignment where applicable", "NIST SP 800-53 and RMF practices", "Export-control and contractual obligations", "Supply-chain and program-security requirements"],
    cyberPriorities: ["Controlled-information governance", "Supplier and program risk", "Identity, privileged access, and insider-threat controls", "Incident readiness and mission-impact analysis"],
    protectionConsiderations: ["Executive and key-person protection", "Travel, facility, and geopolitical intelligence", "Targeted-threat and counterintelligence awareness"],
    aiGovernance: ["Mission AI approval and authority boundaries", "Model security, provenance, and human oversight", "Adversarial testing and controlled deployment"],
    serviceSlugs: ["protective-intelligence", "regulatory-assurance", "enterprise-risk", "digital-forensics"],
    eiosCapabilities: ["enterprise-digital-twin", "enterprise-knowledge-graph", "architecture-and-security"],
    academyPathways: ["CMMC and controlled-information leadership", "Defense threat intelligence", "AI mission governance"],
    intelligenceFocus: ["Nation-state and defense-sector threats", "Supply-chain and geopolitical intelligence", "Program and executive threat indicators"]
  },
  {
    slug: "higher-education",
    name: "Higher Education",
    shortName: "Higher Education",
    summary: "Protect open academic environments, research, identities, privacy, students, executives, and institutional continuity.",
    executiveOverview: "Higher-education institutions combine open access, sensitive research, diverse populations, distributed technology, and public-facing leadership. Obserra helps institutions govern those competing priorities without losing mission focus.",
    operatingPressures: ["Open and decentralized technology environments", "Research and intellectual-property protection", "Student, faculty, and workforce privacy", "Public safety and institutional reputation"],
    regulatoryContext: ["FERPA and privacy obligations", "Research and contractual security requirements", "NIST and sector-assurance frameworks", "State breach, records, and accessibility requirements"],
    cyberPriorities: ["Identity and access governance", "Research and endpoint security", "Ransomware and incident readiness", "Third-party and cloud assurance"],
    protectionConsiderations: ["Executive, campus, and event threat awareness", "Targeted-violence and protest intelligence", "Travel and public-appearance planning"],
    aiGovernance: ["Academic and administrative AI policy", "Data-use, integrity, and human oversight", "Responsible research and student-impact controls"],
    serviceSlugs: ["cybersecurity-consulting", "identity-access-management", "corporate-security", "training"],
    eiosCapabilities: ["executive-mission-control", "enterprise-knowledge-graph", "executive-ai-advisor"],
    academyPathways: ["Higher-education cyber governance", "Campus threat awareness", "Responsible AI enablement"],
    intelligenceFocus: ["Education-sector threats", "Research and geopolitical risk", "Campus safety and regulatory developments"]
  }
];

export const industryMap = Object.fromEntries(industrySolutions.map((industry) => [industry.slug, industry])) as Record<string, IndustrySolution>;
