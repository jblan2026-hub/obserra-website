export type TrustPolicy = {
  slug: string;
  title: string;
  description: string;
  summary: string;
  sections: Array<{ heading: string; points: string[] }>;
};

export const trustPolicies: TrustPolicy[] = [
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    description: "How Obserra collects, uses, and safeguards personal and business information.",
    summary: "Obserra processes personal information for service delivery, security, billing, and legal obligations.",
    sections: [
      { heading: "Data Collected", points: ["Contact details, business details, inquiry information, and service preferences.", "Billing and transaction information for paid services and Academy purchases.", "Website analytics events used for operational performance and conversion measurement."] },
      { heading: "Use of Data", points: ["Responding to inquiries, scheduling consultations, and delivering purchased services.", "Security monitoring, fraud prevention, and compliance with legal obligations.", "Improving product, service, and training quality."] },
      { heading: "Data Rights", points: ["Submit access, correction, or deletion requests by contacting info@obserrallc.com.", "Data requests are handled subject to legal and contractual retention requirements."] },
    ],
  },
  {
    slug: "terms-of-use",
    title: "Terms of Use",
    description: "Rules and legal terms for use of Obserra websites and public content.",
    summary: "Use of this website constitutes acceptance of these terms.",
    sections: [
      { heading: "Permitted Use", points: ["Use the website for lawful business inquiry, education, and product evaluation.", "Do not misuse automation, scraping, or disruption techniques against site services."] },
      { heading: "Intellectual Property", points: ["All Obserra trademarks, content, and product materials are proprietary unless otherwise stated.", "No reproduction, redistribution, or derivative use without written permission."] },
      { heading: "Liability", points: ["Information is provided for business evaluation and does not constitute legal advice.", "To the maximum extent permitted by law, liability is limited as described in executed agreements."] },
    ],
  },
  {
    slug: "software-license-agreement",
    title: "Software License Agreement",
    description: "License terms for Obserra applications and software assets.",
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
    description: "Commercial terms for Obserra Academy purchases and learner access.",
    summary: "Academy courses are paid digital products with proprietary content and controlled learner access.",
    sections: [
      { heading: "Enrollment", points: ["Access is granted after successful payment verification.", "Learner access may be restricted to the purchased course and authorized account context."] },
      { heading: "Completion and Certificates", points: ["Certificates require completion standards published in-course.", "Certificates are training completion records and not occupational licenses or academic credit."] },
      { heading: "Access Controls", points: ["Obserra may revoke access for abuse, sharing, or policy violations.", "Automated extraction, content copying, and redistribution are prohibited."] },
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
      { heading: "Request Process", points: ["Submit requests to info@obserrallc.com with invoice reference and reason.", "Obserra targets a business response within 5 business days."] },
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
    description: "Acceptable and prohibited use of Obserra websites, services, and software.",
    summary: "Users must not misuse systems, data, or access mechanisms.",
    sections: [
      { heading: "Prohibited Activities", points: ["Unauthorized access, scanning, scraping, or disruption attempts.", "Use of services for unlawful, abusive, or harmful activities.", "Credential sharing or circumvention of access controls."] },
      { heading: "Security Cooperation", points: ["Users must promptly report discovered vulnerabilities or suspicious activity.", "Obserra may suspend access to protect systems and customers."] },
    ],
  },
  {
    slug: "accessibility-statement",
    title: "Accessibility Statement",
    description: "Obserra commitment to accessible digital experiences.",
    summary: "Obserra works to improve usability and accessibility across device types.",
    sections: [
      { heading: "Accessibility Commitment", points: ["Design and development practices target practical accessibility and readability.", "Continuous improvements are prioritized based on user feedback and audits."] },
      { heading: "Support Requests", points: ["If you need assistance accessing content, contact info@obserrallc.com.", "Provide the page URL and issue details for rapid support."] },
    ],
  },
  {
    slug: "security-and-responsible-disclosure",
    title: "Security and Responsible Disclosure",
    description: "How to report security issues responsibly to Obserra.",
    summary: "Obserra supports coordinated disclosure and security-first issue handling.",
    sections: [
      { heading: "How to Report", points: ["Report vulnerabilities to info@obserrallc.com with technical details and reproduction steps.", "Do not publicly disclose vulnerabilities before coordinated review."] },
      { heading: "Safe Testing Rules", points: ["No data exfiltration, social engineering, or service disruption.", "Testing must remain lawful and narrowly scoped."] },
      { heading: "Response Process", points: ["Obserra acknowledges reports and coordinates remediation based on severity.", "Validated findings are handled through internal security governance."] },
    ],
  },
  {
    slug: "third-party-and-open-source-notices",
    title: "Third-Party and Open-Source Notices",
    description: "Notices and attributions for third-party and open-source components.",
    summary: "Obserra solutions may include third-party and open-source components under their respective licenses.",
    sections: [
      { heading: "Component Licensing", points: ["Third-party components retain their original license terms.", "Required attributions and notices are provided to customers where applicable."] },
      { heading: "Customer Responsibility", points: ["Customers must comply with relevant third-party license obligations.", "Open-source obligations do not transfer proprietary rights in Obserra materials."] },
    ],
  },
  {
    slug: "data-handling-statement",
    title: "Data Handling Statement",
    description: "Operational controls for handling client and user information.",
    summary: "Obserra follows controlled handling, minimization, and access governance principles.",
    sections: [
      { heading: "Handling Principles", points: ["Least-privilege access and purpose-limited processing.", "Retention and deletion aligned to contract and legal obligations.", "Security monitoring and incident response governance."] },
      { heading: "Sensitive Information", points: ["Sensitive files are accepted only through governed channels.", "Email should not be used for high-sensitivity file transfer."] },
    ],
  },
  {
    slug: "cookie-disclosure",
    title: "Cookie Disclosure",
    description: "Disclosure of cookie or similar tracking technologies used on the website.",
    summary: "Obserra uses limited technical and analytics-related browser storage where required.",
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
      { heading: "Service Area", points: ["Obserra serves commercial clients subject to legal and operational feasibility.", "Some services may be limited or unavailable in certain jurisdictions."] },
      { heading: "Licensing", points: ["Where services require specific licensure, delivery is limited to qualified personnel and lawful scope.", "Customers are responsible for their own regulatory and jurisdictional compliance obligations."] },
    ],
  },
  {
    slug: "certificate-disclaimer",
    title: "Certificate Disclaimer",
    description: "Clarifies scope and legal meaning of Obserra training certificates.",
    summary: "Obserra certificates verify course completion only.",
    sections: [
      { heading: "Scope", points: ["Certificates document successful completion of specified Obserra training.", "Certificates are not state licenses, academic credits, or third-party certifications."] },
      { heading: "Verification", points: ["Employers or partners should treat certificates as completion evidence only.", "Certificate validity may be revoked for fraud or misuse."] },
    ],
  },
  {
    slug: "course-intellectual-property-terms",
    title: "Course Intellectual-Property Terms",
    description: "Intellectual-property terms for course materials and learner access.",
    summary: "All Academy materials remain proprietary to Obserra unless explicitly licensed otherwise.",
    sections: [
      { heading: "Ownership", points: ["Course videos, slides, modules, assessments, and certificate assets are protected IP.", "Purchase grants learner access rights, not ownership transfer."] },
      { heading: "Restrictions", points: ["No recording, sharing, resale, classroom redistribution, or derivative reuse without permission.", "Automated scraping, extraction, or model training on content is prohibited."] },
    ],
  },
];

export const trustPolicyMap = Object.fromEntries(trustPolicies.map((policy) => [policy.slug, policy])) as Record<string, TrustPolicy>;
