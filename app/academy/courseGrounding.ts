import type { Course } from "./courseData";

export type AuthorityReference = {
  readonly title: string;
  readonly publisher: string;
  readonly reference: string;
  readonly url: string;
  readonly whyItMatters: string;
};

export type PracticeExample = {
  readonly title: string;
  readonly organization: string;
  readonly summary: string;
  readonly takeaway: string;
  readonly url: string;
};

export type CourseGrounding = {
  readonly authorities: readonly AuthorityReference[];
  readonly example: PracticeExample;
};

const references = {
  nistCsf: {
    title: "Cybersecurity Framework 2.0",
    publisher: "National Institute of Standards and Technology",
    reference: "NIST CSF 2.0",
    url: "https://www.nist.gov/cyberframework",
    whyItMatters: "Provides an outcome based structure for governing, identifying, protecting, detecting, responding to, and recovering from cybersecurity risk.",
  },
  nist80053: {
    title: "Security and Privacy Controls for Information Systems and Organizations",
    publisher: "National Institute of Standards and Technology",
    reference: "NIST SP 800-53 Rev. 5",
    url: "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final",
    whyItMatters: "Provides a comprehensive control catalog used to translate risk decisions into accountable safeguards and evidence.",
  },
  nistIncident: {
    title: "Incident Response Recommendations and Considerations for Cybersecurity Risk Management",
    publisher: "National Institute of Standards and Technology",
    reference: "NIST SP 800-61 Rev. 3",
    url: "https://csrc.nist.gov/pubs/sp/800/61/r3/final",
    whyItMatters: "Connects incident response to enterprise risk management and defines disciplined preparation, detection, response, recovery, and improvement practices.",
  },
  nistZeroTrust: {
    title: "Zero Trust Architecture",
    publisher: "National Institute of Standards and Technology",
    reference: "NIST SP 800-207",
    url: "https://csrc.nist.gov/pubs/sp/800/207/final",
    whyItMatters: "Defines zero trust principles around explicit verification, resource protection, policy enforcement, and continuous context based access decisions.",
  },
  nistIdentity: {
    title: "Digital Identity Guidelines",
    publisher: "National Institute of Standards and Technology",
    reference: "NIST SP 800-63-4",
    url: "https://pages.nist.gov/800-63-4/",
    whyItMatters: "Provides current federal guidance for identity proofing, authentication, federation, and risk based assurance decisions.",
  },
  nistVulnerability: {
    title: "Guide to Enterprise Patch Management Planning",
    publisher: "National Institute of Standards and Technology",
    reference: "NIST SP 800-40 Rev. 4",
    url: "https://csrc.nist.gov/pubs/sp/800/40/r4/final",
    whyItMatters: "Explains how organizations should plan, prioritize, deploy, verify, and govern patching as an enterprise risk reduction process.",
  },
  cisaKev: {
    title: "Known Exploited Vulnerabilities Catalog",
    publisher: "Cybersecurity and Infrastructure Security Agency",
    reference: "CISA KEV Catalog",
    url: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog",
    whyItMatters: "Provides evidence that a vulnerability is being actively exploited and is therefore an important prioritization signal.",
  },
  ssdf: {
    title: "Secure Software Development Framework",
    publisher: "National Institute of Standards and Technology",
    reference: "NIST SP 800-218",
    url: "https://csrc.nist.gov/pubs/sp/800/218/final",
    whyItMatters: "Defines secure development practices that integrate software security into organizational preparation, development, verification, and vulnerability response.",
  },
  secureByDesign: {
    title: "Secure by Design",
    publisher: "Cybersecurity and Infrastructure Security Agency",
    reference: "CISA Secure by Design",
    url: "https://www.cisa.gov/securebydesign",
    whyItMatters: "Frames security as a product and leadership responsibility rather than a burden shifted to customers or downstream operators.",
  },
  aiRmf: {
    title: "Artificial Intelligence Risk Management Framework",
    publisher: "National Institute of Standards and Technology",
    reference: "NIST AI RMF 1.0",
    url: "https://www.nist.gov/itl/ai-risk-management-framework",
    whyItMatters: "Provides the Govern, Map, Measure, and Manage functions for trustworthy and accountable AI risk management.",
  },
  genAiProfile: {
    title: "Artificial Intelligence Risk Management Framework: Generative Artificial Intelligence Profile",
    publisher: "National Institute of Standards and Technology",
    reference: "NIST AI 600-1",
    url: "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf",
    whyItMatters: "Applies AI RMF practices to generative AI risks such as confabulation, privacy, information integrity, misuse, and human overreliance.",
  },
  owaspLlm: {
    title: "OWASP Top 10 for Large Language Model Applications",
    publisher: "OWASP Foundation",
    reference: "OWASP LLM Top 10",
    url: "https://owasp.org/www-project-top-10-for-large-language-model-applications/",
    whyItMatters: "Provides a practical threat taxonomy for prompt injection, insecure output handling, sensitive information disclosure, model abuse, and related LLM risks.",
  },
  owaspApi: {
    title: "OWASP API Security Top 10",
    publisher: "OWASP Foundation",
    reference: "OWASP API Security Top 10",
    url: "https://owasp.org/API-Security/",
    whyItMatters: "Provides a practical taxonomy for authorization, authentication, resource consumption, business flow, configuration, and inventory risks in APIs.",
  },
  privacyFramework: {
    title: "NIST Privacy Framework",
    publisher: "National Institute of Standards and Technology",
    reference: "NIST Privacy Framework",
    url: "https://www.nist.gov/privacy-framework",
    whyItMatters: "Helps organizations connect privacy risk, data processing, governance, and operational safeguards to business outcomes.",
  },
  ftcAct: {
    title: "Federal Trade Commission Act, Section 5",
    publisher: "Federal Trade Commission",
    reference: "15 U.S.C. § 45",
    url: "https://www.ftc.gov/legal-library/browse/statutes/federal-trade-commission-act",
    whyItMatters: "Unfair or deceptive practices can create legal exposure when organizations make representations about privacy, security, or AI behavior that are not supported by practice.",
  },
  secCyber: {
    title: "Cybersecurity Risk Management, Strategy, Governance, and Incident Disclosure",
    publisher: "U.S. Securities and Exchange Commission",
    reference: "Regulation S-K Item 106 and Form 8-K Item 1.05",
    url: "https://www.sec.gov/rules-regulations/2023/07/s7-04-22",
    whyItMatters: "Creates disclosure obligations for public companies concerning material cybersecurity incidents and governance of cybersecurity risk.",
  },
  iso31000: {
    title: "Risk Management Guidelines",
    publisher: "International Organization for Standardization",
    reference: "ISO 31000:2018",
    url: "https://www.iso.org/iso-31000-risk-management.html",
    whyItMatters: "Provides a widely used framework for integrating risk management into governance, decision making, operations, and continuous improvement.",
  },
  iso31030: {
    title: "Travel Risk Management Guidance for Organizations",
    publisher: "International Organization for Standardization",
    reference: "ISO 31030:2021",
    url: "https://www.iso.org/standard/54204.html",
    whyItMatters: "Provides a structured approach to travel risk governance, traveler preparation, threat assessment, communication, and incident response.",
  },
  oshaGeneralDuty: {
    title: "Occupational Safety and Health Act General Duty Clause",
    publisher: "Occupational Safety and Health Administration",
    reference: "29 U.S.C. § 654(a)(1)",
    url: "https://www.osha.gov/laws-regs/oshact/section5-duties",
    whyItMatters: "Requires employers to furnish a workplace free from recognized serious hazards and is relevant to governance of workplace violence prevention and safety programs.",
  },
  ntac: {
    title: "Behavioral Threat Assessment and Management Guidance",
    publisher: "U.S. Secret Service National Threat Assessment Center",
    reference: "NTAC operational guidance",
    url: "https://www.secretservice.gov/protection/ntac",
    whyItMatters: "Supports multidisciplinary, behavior based threat assessment and management rather than profiling, unsupported accusations, or single indicator decisions.",
  },
  icd203: {
    title: "Analytic Standards",
    publisher: "Office of the Director of National Intelligence",
    reference: "Intelligence Community Directive 203",
    url: "https://www.dni.gov/files/documents/ICD/ICD-203.pdf",
    whyItMatters: "Establishes analytic standards such as objectivity, sourcing, uncertainty, alternative analysis, relevance, timeliness, and clear expression of confidence.",
  },
  cosoErm: {
    title: "Enterprise Risk Management: Integrating with Strategy and Performance",
    publisher: "Committee of Sponsoring Organizations of the Treadway Commission",
    reference: "COSO ERM",
    url: "https://www.coso.org/enterprise-risk-management",
    whyItMatters: "Connects risk management to strategy, performance, governance, decision making, and enterprise value.",
  },
} satisfies Record<string, AuthorityReference>;

const examples = {
  googleBeyondCorp: {
    title: "BeyondCorp zero trust operating model",
    organization: "Google",
    summary: "Google publicly documented BeyondCorp as an approach that moved access decisions away from implicit network trust and toward identity, device, context, and application level policy.",
    takeaway: "Zero trust is an operating model. Identity, device posture, policy, telemetry, and application access must work together rather than relying on a trusted network boundary.",
    url: "https://cloud.google.com/beyondcorp",
  },
  equifax: {
    title: "Enterprise patching and vulnerability accountability",
    organization: "Equifax",
    summary: "The 2017 Equifax breach became a widely studied example of the consequences of failing to remediate a known vulnerable component and verify that remediation was actually completed.",
    takeaway: "A vulnerability program needs ownership, risk based prioritization, deployment evidence, exception handling, and independent verification rather than a list of scanner findings.",
    url: "https://www.ftc.gov/enforcement/refunds/equifax-data-breach-settlement",
  },
  capitalOne: {
    title: "Cloud control design and accountability",
    organization: "Capital One",
    summary: "The 2019 Capital One incident is commonly used to examine cloud configuration, access control, logging, monitoring, and shared responsibility in a highly regulated environment.",
    takeaway: "Moving to cloud changes the control plane but not executive accountability. Architecture, identity, configuration, monitoring, and evidence must be governed together.",
    url: "https://www.occ.gov/news-issuances/news-releases/2020/nr-occ-2020-101.html",
  },
  solarWinds: {
    title: "Software supply chain compromise",
    organization: "SolarWinds and affected customers",
    summary: "The SolarWinds compromise demonstrated how trusted software distribution can become an enterprise attack path across many downstream organizations.",
    takeaway: "Third party risk must consider software provenance, build integrity, supplier concentration, monitoring, blast radius, and response dependencies rather than relying only on questionnaires.",
    url: "https://www.cisa.gov/news-events/directives/ed-21-01-mitigate-solarwinds-orion-code-compromise",
  },
  microsoftSdl: {
    title: "Institutionalizing secure software development",
    organization: "Microsoft",
    summary: "Microsoft has publicly documented its Security Development Lifecycle as an example of integrating security requirements, threat modeling, verification, and response into software engineering practices.",
    takeaway: "Secure development becomes durable when it is part of the engineering system, release criteria, and evidence model rather than a final review step.",
    url: "https://www.microsoft.com/en-us/securityengineering/sdl",
  },
  colonialPipeline: {
    title: "Cyber incident becomes an operational crisis",
    organization: "Colonial Pipeline",
    summary: "The 2021 ransomware event disrupted business operations and showed how cybersecurity, continuity, executive communication, law enforcement coordination, and recovery decisions converge during a major incident.",
    takeaway: "Incident response leaders need technical containment, business continuity, executive decision rights, evidence preservation, communications, and recovery planning operating as one system.",
    url: "https://www.cisa.gov/news-events/cybersecurity-advisories/aa21-131a",
  },
  airCanadaAi: {
    title: "Organizations remain accountable for AI assisted customer interactions",
    organization: "Air Canada",
    summary: "A Canadian tribunal held Air Canada responsible for inaccurate information provided by a chatbot, illustrating that organizations cannot treat automated output as independent of the business that deploys it.",
    takeaway: "AI systems require authoritative source content, validation, escalation, human oversight, monitoring, and clear ownership for customer or business decisions.",
    url: "https://www.canlii.org/en/bc/bccrt/doc/2024/2024bccrt149/2024bccrt149.html",
  },
  cisaSecureByDesign: {
    title: "Shifting security responsibility toward technology producers",
    organization: "CISA Secure by Design initiative",
    summary: "CISA and participating technology organizations have promoted secure defaults, elimination of common product weaknesses, transparent vulnerability handling, and executive ownership of product security outcomes.",
    takeaway: "Security becomes commercially stronger when it is designed into architecture, defaults, engineering practices, and product accountability rather than delegated to customers.",
    url: "https://www.cisa.gov/securebydesign",
  },
  ntacThreatManagement: {
    title: "Multidisciplinary behavioral threat assessment",
    organization: "U.S. Secret Service NTAC",
    summary: "NTAC research and guidance emphasize multidisciplinary assessment of concerning behavior, context, stressors, communications, access, and protective factors rather than relying on profiles or a single warning sign.",
    takeaway: "Effective threat management integrates security, HR, legal, management, mental health resources when appropriate, documentation, proportional intervention, and continuing reassessment.",
    url: "https://www.secretservice.gov/protection/ntac",
  },
  travelRisk: {
    title: "Travel risk as a governed business process",
    organization: "Organizations applying ISO 31030",
    summary: "ISO 31030 reflects the mature practice of treating travel risk as an organizational system involving policy, traveler preparation, destination intelligence, communications, assistance, incident management, and review.",
    takeaway: "Travel protection is stronger when risk intelligence, traveler behavior, business necessity, duty of care, escalation, and incident response are connected before travel begins.",
    url: "https://www.iso.org/standard/54204.html",
  },
  secGovernance: {
    title: "Cybersecurity becomes a board and disclosure issue",
    organization: "U.S. public companies",
    summary: "SEC cybersecurity disclosure requirements require public companies to address material incident disclosure and describe processes for assessing and managing material cybersecurity risk and board oversight.",
    takeaway: "Executives need decision ready risk information, documented governance, materiality processes, and evidence that can support both operations and external reporting obligations.",
    url: "https://www.sec.gov/rules-regulations/2023/07/s7-04-22",
  },
  intelligenceStandards: {
    title: "Structured analytic standards",
    organization: "U.S. Intelligence Community",
    summary: "ICD 203 formalizes expectations for sourcing, objectivity, alternatives, uncertainty, relevance, timeliness, and clear analytic judgments.",
    takeaway: "Business intelligence products become more decision useful when facts, assumptions, confidence, alternatives, and limitations are explicit rather than blended together.",
    url: "https://www.dni.gov/files/documents/ICD/ICD-203.pdf",
  },
} satisfies Record<string, PracticeExample>;

function containsAny(course: Course, values: readonly string[]) {
  const haystack = `${course.id} ${course.title} ${course.description}`.toLowerCase();
  return values.some((value) => haystack.includes(value));
}

export function groundingForCourse(course: Course): CourseGrounding {
  if (containsAny(course, ["zero-trust", "zero trust", "identity-security", "identity security"])) {
    return { authorities: [references.nistZeroTrust, references.nistIdentity, references.nistCsf], example: examples.googleBeyondCorp };
  }
  if (containsAny(course, ["vulnerability", "patch"])) {
    return { authorities: [references.nistVulnerability, references.cisaKev, references.nistCsf], example: examples.equifax };
  }
  if (containsAny(course, ["cloud-security", "cloud security", "cloud-native", "cloud native"])) {
    return { authorities: [references.nistCsf, references.nist80053, references.secureByDesign], example: examples.capitalOne };
  }
  if (containsAny(course, ["software", "devsecops", "coding", "python", "api-security", "api security", "low-code", "low code", "secure-ai-native", "custom-ai-native"])) {
    const authorities = containsAny(course, ["api-security", "api security"])
      ? [references.owaspApi, references.ssdf, references.secureByDesign]
      : [references.ssdf, references.secureByDesign, references.nistCsf];
    return { authorities, example: containsAny(course, ["ai-native", "ai native"]) ? examples.cisaSecureByDesign : examples.microsoftSdl };
  }
  if (containsAny(course, ["ai", "llm", "prompt", "generative"])) {
    const privacy = containsAny(course, ["privacy", "intellectual property", "data"]);
    return {
      authorities: privacy
        ? [references.aiRmf, references.genAiProfile, references.privacyFramework, references.ftcAct]
        : [references.aiRmf, references.genAiProfile, references.owaspLlm],
      example: examples.airCanadaAi,
    };
  }
  if (containsAny(course, ["incident", "ransomware", "crisis", "continuity", "resilience", "forensics"])) {
    return { authorities: [references.nistIncident, references.nistCsf, references.nist80053], example: examples.colonialPipeline };
  }
  if (containsAny(course, ["third-party", "third party", "supply chain", "vendor"])) {
    return { authorities: [references.nistCsf, references.nist80053, references.ssdf], example: examples.solarWinds };
  }
  if (containsAny(course, ["travel risk", "executive travel"])) {
    return { authorities: [references.iso31030, references.iso31000], example: examples.travelRisk };
  }
  if (containsAny(course, ["workplace violence", "threat assessment", "protective intelligence", "insider threat", "executive protection", "digital exposure", "family security"])) {
    return { authorities: [references.ntac, references.iso31000, references.oshaGeneralDuty], example: examples.ntacThreatManagement };
  }
  if (course.department === "Intelligence" || containsAny(course, ["intelligence", "decision making", "trusted teams", "ethical leadership"])) {
    return { authorities: [references.icd203, references.iso31000, references.cosoErm], example: examples.intelligenceStandards };
  }
  if (containsAny(course, ["board", "regulatory", "ciso", "governance", "metrics", "budget", "enterprise risk", "security program"])) {
    return { authorities: [references.nistCsf, references.secCyber, references.cosoErm], example: examples.secGovernance };
  }
  return { authorities: [references.nistCsf, references.nist80053, references.iso31000], example: examples.secGovernance };
}
