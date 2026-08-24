import { ACADEMY_BRAND_NAME, LEGAL_ENTITY_NAME } from "@/lib/legal-identity";

export type TrustPolicy = {
  slug: string;
  title: string;
  description: string;
  summary: string;
  sections: Array<{ heading: string; points: string[] }>;
};

export const trustPolicies: TrustPolicy[] = [
  {
    slug: "trust-brief",
    title: "Enterprise Trust Brief",
    description: `A concise procurement overview of ${LEGAL_ENTITY_NAME} security, privacy, governance, and service protections.`,
    summary: `${LEGAL_ENTITY_NAME} applies secure-by-design, least-privilege, data-minimization, governed-access, and accountable-delivery principles across services, software, and training.`,
    sections: [
      { heading: "Security and Governance", points: ["Secure-by-design and secure-by-default practices guide product and service delivery.", "Access is limited by business need, role, and contractual scope.", "Material security events are handled through documented escalation and response processes."] },
      { heading: "Privacy and Data Handling", points: ["Data collection is limited to service delivery, billing, security, support, and legal obligations.", "Sensitive information should be transferred only through approved governed channels.", "Retention and deletion follow contractual, operational, and legal requirements."] },
      { heading: "Commercial Assurance", points: ["Scope, responsibilities, deliverables, payment, and service boundaries are documented in governing agreements.", "Academy purchases use secure payment processing and account-based access.", "Enterprise security and procurement questions may be submitted to info@obserrallc.com."] },
    ],
  },
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    description: `How ${LEGAL_ENTITY_NAME} collects, uses, and safeguards personal and business information.`,
    summary: `${LEGAL_ENTITY_NAME} processes personal information for service delivery, security, billing, and legal obligations.`,
    sections: [
      { heading: "Data Collected", points: ["Contact details, business details, inquiry information, and service preferences.", "Billing and transaction information for paid services and Academy purchases.", "Website analytics events used for operational performance and conversion measurement."] },
      { heading: "Use of Data", points: ["Responding to inquiries, scheduling consultations, and delivering purchased services.", "Security monitoring, fraud prevention, and compliance with legal obligations.", "Improving product, service, and training quality."] },
      { heading: "Data Rights", points: ["Submit access, correction, or deletion requests by contacting info@obserrallc.com.", "Data requests are handled subject to legal and contractual retention requirements."] },
    ],
  },
  {
    slug: "responsible-ai-policy",
    title: "Responsible AI Policy",
    description: `Principles governing ${LEGAL_ENTITY_NAME} use of artificial intelligence in products, services, and internal operations.`,
    summary: "AI use must remain governed, explainable, proportionate to risk, and subject to appropriate human oversight.",
    sections: [
      { heading: "Governance Principles", points: ["AI use is evaluated for business purpose, data sensitivity, legal obligations, security risk, and potential harm.", "Human review is required for consequential recommendations, approvals, or actions where appropriate.", "AI generated output is treated as decision support and must be validated before material use."] },
      { heading: "Data and Security", points: ["Sensitive client information is not submitted to unapproved AI services.", "Access, logging, retention, and model usage controls are applied according to risk and contractual requirements.", "Prompt injection, data leakage, model abuse, and unauthorized automation risks are considered in design and operation."] },
      { heading: "Accountability", points: ["AI recommendations should be traceable to relevant evidence, assumptions, and confidence where practical.", "Users remain accountable for final decisions and authorized actions.", "Suspected AI related security or governance issues should be reported to info@obserrallc.com."] },
    ],
  },
  {
    slug: "subprocessor-disclosure",
    title: "Subprocessor Disclosure",
    description: "Categories of third parties that may support hosting, payments, analytics, communications, and service delivery.",
    summary: `${LEGAL_ENTITY_NAME} uses service providers only where needed for legitimate business operations and applies contractual and access controls appropriate to the service.`,
    sections: [
      { heading: "Service Provider Categories", points: ["Cloud hosting and application delivery providers.", "Payment processing and transaction service providers.", "Authentication, communications, analytics, monitoring, and support providers."] },
      { heading: "Governance", points: ["Provider access is limited to the purpose and scope of the service.", "Material providers are evaluated based on security, privacy, operational, and contractual considerations.", "Specific enterprise subprocessor information may be provided during contracting where applicable."] },
    ],
  },
  {
    slug: "data-retention-and-deletion",
    title: "Data Retention and Deletion",
    description: `How ${LEGAL_ENTITY_NAME} determines retention periods and handles deletion requests.`,
    summary: "Information is retained only as long as needed for service delivery, security, accounting, legal, contractual, or legitimate operational purposes.",
    sections: [
      { heading: "Retention", points: ["Account, transaction, service, and support records are retained according to operational and legal need.", "Security logs may be retained for investigation, fraud prevention, audit, and resilience purposes.", "Contractual retention terms supersede general practices where agreed."] },
      { heading: "Deletion", points: ["Deletion requests may be submitted to info@obserrallc.com.", "Deletion is completed subject to legal holds, accounting requirements, security needs, and contractual obligations.", "Backups may retain deleted information temporarily until normal rotation completes."] },
    ],
  },
  {
    slug: "security-incident-reporting",
    title: "Security Incident Reporting",
    description: "How customers, users, and partners should report suspected security or privacy incidents.",
    summary: "Prompt reporting enables containment, investigation, communication, and recovery.",
    sections: [
      { heading: "Report an Incident", points: ["Send suspected security, privacy, account, payment, or access incidents to info@obserrallc.com.", "Include affected service, date and time, observed behavior, relevant identifiers, and contact information.", "Do not include unnecessary sensitive information in ordinary email."] },
      { heading: "Response", points: ["Reports are triaged based on severity, scope, customer impact, and legal obligations.", `${LEGAL_ENTITY_NAME} may request additional information, preserve evidence, restrict access, or coordinate with affected providers.`, "Customer notification obligations follow applicable law and governing agreements."] },
    ],
  },
  {
    slug: "terms-of-use",
    title: "Terms of Use",
    description: `Rules and legal terms for use of ${LEGAL_ENTITY_NAME} websites and public content.`,
    summary: "Use of this website constitutes acceptance of these terms.",
    sections: [
      { heading: "Permitted Use", points: ["Use the website for lawful business inquiry, education, and product evaluation.", "Do not misuse automation, scraping, or disruption techniques against site services."] },
      { heading: "Intellectual Property", points: [`All ${LEGAL_ENTITY_NAME} trademarks, content, and product materials are proprietary unless otherwise stated.`, "No reproduction, redistribution, or derivative use without written permission."] },
      { heading: "Liability", points: ["Information is provided for business evaluation and does not constitute legal advice.", "To the maximum extent permitted by law, liability is limited as described in executed agreements."] },
    ],
  },
  {
    slug: "software-license-agreement",
    title: "Software License Agreement",
    description: `License terms for ${LEGAL_ENTITY_NAME} applications and software assets.`,
    summary: "Software is licensed, not sold, under scope and restrictions defined by agreement.",
    sections: [
      { heading: "License Grant", points: ["Non-exclusive, non-transferable license for contracted use case and term.", "Usage is limited to authorized users, environments, and workloads."] },
      { heading: "Restrictions", points: ["No reverse engineering, unauthorized redistribution, or sub-licensing.", "No use outside approved jurisdiction, compliance scope, or contractual boundaries."] },
      { heading: "Termination", points: ["License rights terminate for breach, non-payment, or contract expiration.", "Upon termination, customer must cease use and remove licensed materials as required."] },
    ],
  },
  {
    slug: "academy-terms",
    title: "Academy Terms",
    description: `Commercial terms for ${ACADEMY_BRAND_NAME} purchases and learner access.`,
    summary: "Academy courses are paid digital products with proprietary content and controlled learner access.",
    sections: [
      { heading: "Enrollment", points: ["Access is granted after successful payment verification.", "Learner access may be restricted to the purchased course and authorized account context."] },
      { heading: "Course Completion Records", points: ["Certificates of Course Completion require the completion standards published in the applicable course.", "These proprietary course-completion records are not occupational licenses, accredited academic credit, or third-party professional certifications."] },
      { heading: "Access Controls", points: [`${LEGAL_ENTITY_NAME} may revoke access for abuse, sharing, or policy violations.`, "Automated extraction, content copying, and redistribution are prohibited."] },
    ],
  },
  {
    slug: "refund-and-cancellation-policy",
    title: "Refund and Cancellation Policy",
    description: "Refund eligibility and cancellation rules for services, software, and Academy purchases.",
    summary: "Refunds and cancellations are governed by engagement type and execution status.",
    sections: [
      { heading: "Academy Digital Purchases", points: ["Refund requests must be submitted within 7 days of purchase and before substantial course completion.", "No refund for accounts with significant completion progress or policy abuse."] },
      { heading: "Service Engagements", points: ["Cancellation and refund terms follow signed scope and commercial agreements.", "Work already performed, reserved resources, or pass-through costs may be non-refundable."] },
      { heading: "Request Process", points: ["Submit requests to info@obserrallc.com with invoice reference and reason.", `${LEGAL_ENTITY_NAME} targets a business response within 5 business days.`] },
    ],
  },
  {
    slug: "subscription-terms",
    title: "Subscription Terms",
    description: "Billing, renewal, and cancellation terms for recurring products or services.",
    summary: "Subscription products renew according to selected term unless canceled under policy.",
    sections: [
      { heading: "Billing", points: ["Recurring charges follow agreed billing schedule.", "Failure to pay may suspend access or services."] },
      { heading: "Renewal and Cancellation", points: ["Renewal notice and cancellation windows follow the governing order form.", "Late cancellation may apply to the next billing cycle."] },
      { heading: "Plan Changes", points: ["Scope, seat, and feature changes may affect billing and service level.", "Material changes are documented through commercial amendment."] },
    ],
  },
  {
    slug: "acceptable-use-policy",
    title: "Acceptable Use Policy",
    description: `Acceptable and prohibited use of ${LEGAL_ENTITY_NAME} websites, services, and software.`,
    summary: "Users must not misuse systems, data, or access mechanisms.",
    sections: [
      { heading: "Prohibited Activities", points: ["Unauthorized access, scanning, scraping, or disruption attempts.", "Use of services for unlawful, abusive, or harmful activities.", "Credential sharing or circumvention of access controls."] },
      { heading: "Security Cooperation", points: ["Users must promptly report discovered vulnerabilities or suspicious activity.", `${LEGAL_ENTITY_NAME} may suspend access to protect systems and customers.`] },
    ],
  },
  {
    slug: "accessibility-statement",
    title: "Accessibility Statement",
    description: `${LEGAL_ENTITY_NAME} commitment to accessible digital experiences.`,
    summary: `${LEGAL_ENTITY_NAME} works to improve usability and accessibility across device types.`,
    sections: [
      { heading: "Accessibility Commitment", points: ["Design and development practices target practical accessibility and readability.", "Continuous improvements are prioritized based on user feedback and audits."] },
      { heading: "Support Requests", points: ["If you need assistance accessing content, contact info@obserrallc.com.", "Provide the page URL and issue details for rapid support."] },
    ],
  },
  {
    slug: "security-and-responsible-disclosure",
    title: "Security and Responsible Disclosure",
    description: `How to report security issues responsibly to ${LEGAL_ENTITY_NAME}.`,
    summary: `${LEGAL_ENTITY_NAME} supports coordinated disclosure and security-first issue handling.`,
    sections: [
      { heading: "How to Report", points: ["Report vulnerabilities to info@obserrallc.com with technical details and reproduction steps.", "Do not publicly disclose vulnerabilities before coordinated review."] },
      { heading: "Safe Testing Rules", points: ["No data exfiltration, social engineering, denial of service, destructive testing, or access to data that is not yours.", "Testing must remain lawful, narrowly scoped, and limited to publicly accessible systems.", "Stop testing and report immediately if sensitive information is encountered."] },
      { heading: "Response Process", points: [`${LEGAL_ENTITY_NAME} acknowledges reports and coordinates remediation based on severity.`, "Validated findings are handled through internal security governance.", "Good faith research does not authorize access beyond applicable law or these safe testing rules."] },
    ],
  },
  {
    slug: "third-party-and-open-source-notices",
    title: "Third-Party and Open-Source Notices",
    description: "Notices and attributions for third-party and open-source components.",
    summary: `${LEGAL_ENTITY_NAME} solutions may include third-party and open-source components under their respective licenses.`,
    sections: [
      { heading: "Component Licensing", points: ["Third-party components retain their original license terms.", "Required attributions and notices are provided to customers where applicable."] },
      { heading: "Customer Responsibility", points: ["Customers must comply with relevant third-party license obligations.", `Open-source obligations do not transfer proprietary rights in ${LEGAL_ENTITY_NAME} materials.`] },
    ],
  },
  {
    slug: "data-handling-statement",
    title: "Data Handling Statement",
    description: "Operational controls for handling client and user information.",
    summary: `${LEGAL_ENTITY_NAME} follows controlled handling, minimization, and access governance principles.`,
    sections: [
      { heading: "Handling Principles", points: ["Least-privilege access and purpose-limited processing.", "Retention and deletion aligned to contract and legal obligations.", "Security monitoring and incident response governance."] },
      { heading: "Sensitive Information", points: ["Sensitive files are accepted only through governed channels.", "Email should not be used for high-sensitivity file transfer."] },
    ],
  },
  {
    slug: "cookie-disclosure",
    title: "Cookie Disclosure",
    description: "Disclosure of cookie or similar tracking technologies used on the website.",
    summary: `${LEGAL_ENTITY_NAME} uses limited technical and analytics-related browser storage where required.`,
    sections: [
      { heading: "Cookie Categories", points: ["Essential cookies for authentication/session continuity where applicable.", "Analytics signals to understand traffic and conversion behavior."] },
      { heading: "Controls", points: ["Users can manage cookies through browser settings.", "Disabling some cookies may reduce site functionality."] },
    ],
  },
  {
    slug: "service-area-and-licensing-disclosures",
    title: "Service-Area and Licensing Disclosures",
    description: "Disclosures regarding jurisdiction, availability, and service licensing boundaries.",
    summary: "Service availability, legal scope, and licensing obligations vary by location and engagement type.",
    sections: [
      { heading: "Service Area", points: [`${LEGAL_ENTITY_NAME} serves commercial clients subject to legal and operational feasibility.`, "Some services may be limited or unavailable in certain jurisdictions."] },
      { heading: "Licensing", points: ["Where services require specific licensure, delivery is limited to qualified personnel and lawful scope.", "Customers are responsible for their own regulatory and jurisdictional compliance obligations."] },
    ],
  },
  {
    slug: "certificate-disclaimer",
    title: "Course Completion Credential Disclaimer",
    description: `Clarifies the scope and legal meaning of ${LEGAL_ENTITY_NAME} Certificates of Course Completion.`,
    summary: `${LEGAL_ENTITY_NAME} Certificates of Course Completion document course completion only.`,
    sections: [
      { heading: "Scope", points: [`A Certificate of Course Completion documents successful completion of specified ${LEGAL_ENTITY_NAME} training.`, "It is not a state license, occupational authorization, accredited academic credit, or third-party professional certification."] },
      { heading: "Verification", points: ["Employers or partners should treat the credential as proprietary course-completion evidence only.", "Record validity may be revoked for fraud or misuse."] },
    ],
  },
  {
    slug: "course-intellectual-property-terms",
    title: "Course Intellectual-Property Terms",
    description: "Intellectual-property terms for course materials and learner access.",
    summary: `All Academy materials remain proprietary to ${LEGAL_ENTITY_NAME} unless explicitly licensed otherwise.`,
    sections: [
      { heading: "Ownership", points: ["Course videos, slides, modules, assessments, and certificate assets are protected IP.", "Purchase grants learner access rights, not ownership transfer."] },
      { heading: "Restrictions", points: ["No recording, sharing, resale, classroom redistribution, or derivative reuse without permission.", "Automated scraping, extraction, or model training on content is prohibited."] },
    ],
  },
];

export const trustPolicyMap = Object.fromEntries(trustPolicies.map((policy) => [policy.slug, policy])) as Record<string, TrustPolicy>;
