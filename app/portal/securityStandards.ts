export type SecurityFrameworkId =
  | "nist-csf-2"
  | "nist-800-53-r5"
  | "nist-800-207"
  | "nist-ssdf"
  | "pci-dss-4-0-1"
  | "owasp-asvs"
  | "owasp-samm"
  | "privacy-by-design";

export type SecurityControlStatus = "required" | "planned" | "implemented" | "validated";

export type SecurityControlRequirement = {
  id: string;
  title: string;
  description: string;
  frameworks: SecurityFrameworkId[];
  status: SecurityControlStatus;
  appliesTo: Array<"portal" | "identity" | "billing" | "academy" | "eios" | "applications" | "platform">;
  evidence: string[];
  testCriteria: string[];
};

export const securityFrameworks: Record<SecurityFrameworkId, { name: string; purpose: string }> = {
  "nist-csf-2": { name: "NIST Cybersecurity Framework 2.0", purpose: "Executive risk governance across Govern, Identify, Protect, Detect, Respond, and Recover." },
  "nist-800-53-r5": { name: "NIST SP 800-53 Rev. 5", purpose: "Detailed security and privacy control catalog for enterprise systems." },
  "nist-800-207": { name: "NIST SP 800-207 Zero Trust Architecture", purpose: "Continuous verification, least privilege, and resource-centric access." },
  "nist-ssdf": { name: "NIST SP 800-218 Secure Software Development Framework", purpose: "Secure software design, development, testing, release, and maintenance." },
  "pci-dss-4-0-1": { name: "PCI DSS 4.0.1", purpose: "Protection of cardholder data and secure payment processing." },
  "owasp-asvs": { name: "OWASP ASVS", purpose: "Application security verification requirements." },
  "owasp-samm": { name: "OWASP SAMM", purpose: "Secure software maturity and governance." },
  "privacy-by-design": { name: "Privacy by Design", purpose: "Data minimization, purpose limitation, retention, transparency, and user rights." },
};

export const securityControlBaseline: SecurityControlRequirement[] = [
  {
    id: "iam-001",
    title: "Centralized identity and strong authentication",
    description: "Use enterprise-ready identity, MFA compatibility, secure sessions, account recovery, and phishing-resistant options where supported.",
    frameworks: ["nist-csf-2", "nist-800-53-r5", "nist-800-207", "owasp-asvs"],
    status: "required",
    appliesTo: ["portal", "identity", "academy", "eios", "applications", "platform"],
    evidence: ["Identity architecture", "MFA configuration", "Session policy", "Recovery test records"],
    testCriteria: ["Unauthenticated access is denied", "Session expiration is enforced", "MFA policy is testable", "Recovery does not bypass authorization"],
  },
  {
    id: "authz-001",
    title: "Tenant-aware least-privilege authorization",
    description: "Enforce server-side role and attribute checks for every protected resource and prevent cross-tenant access.",
    frameworks: ["nist-csf-2", "nist-800-53-r5", "nist-800-207", "owasp-asvs"],
    status: "required",
    appliesTo: ["portal", "identity", "academy", "eios", "applications", "platform"],
    evidence: ["Authorization matrix", "Tenant isolation tests", "Access review records", "Denied-access logs"],
    testCriteria: ["Cross-tenant access fails closed", "UI hiding is not the only control", "Privileged actions require explicit authorization"],
  },
  {
    id: "pci-001",
    title: "Minimize PCI scope through hosted payment processing",
    description: "Use PCI-compliant hosted payment pages or tokenized payment components so Obserra systems do not store, process, or transmit raw cardholder data unless explicitly approved.",
    frameworks: ["pci-dss-4-0-1", "nist-csf-2", "nist-800-53-r5"],
    status: "required",
    appliesTo: ["billing", "academy", "applications", "platform"],
    evidence: ["Payment data-flow diagram", "Processor attestation", "SAQ determination", "Quarterly scope review"],
    testCriteria: ["PAN is absent from logs and databases", "Payment redirects use approved domains", "Webhook signatures are verified", "Secrets are not exposed client-side"],
  },
  {
    id: "pci-002",
    title: "Protect payment integrations and webhooks",
    description: "Validate signatures, prevent replay, authorize fulfillment, preserve idempotency, and audit every payment-state transition.",
    frameworks: ["pci-dss-4-0-1", "nist-ssdf", "owasp-asvs"],
    status: "required",
    appliesTo: ["billing", "academy", "applications", "platform"],
    evidence: ["Webhook verification code", "Idempotency design", "Fulfillment logs", "Negative test results"],
    testCriteria: ["Unsigned events are rejected", "Duplicate events do not duplicate fulfillment", "Payment status cannot be forged from the browser"],
  },
  {
    id: "data-001",
    title: "Encryption and secrets management",
    description: "Encrypt data in transit and at rest, centralize secrets, rotate credentials, and prohibit secrets in source code or client bundles.",
    frameworks: ["nist-csf-2", "nist-800-53-r5", "pci-dss-4-0-1", "owasp-asvs"],
    status: "required",
    appliesTo: ["portal", "identity", "billing", "academy", "eios", "applications", "platform"],
    evidence: ["TLS configuration", "Key-management design", "Secret-scanning results", "Rotation records"],
    testCriteria: ["TLS is enforced", "Secrets are absent from repositories", "Sensitive fields are encrypted or tokenized"],
  },
  {
    id: "log-001",
    title: "Immutable security and transaction audit logging",
    description: "Capture actor, tenant, action, resource, outcome, correlation ID, timestamp, security context, and relevant before/after values.",
    frameworks: ["nist-csf-2", "nist-800-53-r5", "pci-dss-4-0-1"],
    status: "required",
    appliesTo: ["portal", "identity", "billing", "academy", "eios", "applications", "platform"],
    evidence: ["Audit schema", "Retention policy", "Alert rules", "Log integrity tests"],
    testCriteria: ["Privileged and payment actions are traceable", "Logs exclude prohibited secrets and card data", "Log tampering is detectable"],
  },
  {
    id: "sdlc-001",
    title: "Secure software development and release gates",
    description: "Require dependency review, SAST, secret scanning, tests, build verification, peer review, and rollback planning before production release.",
    frameworks: ["nist-ssdf", "owasp-samm", "owasp-asvs", "nist-csf-2"],
    status: "required",
    appliesTo: ["portal", "identity", "billing", "academy", "eios", "applications", "platform"],
    evidence: ["CI policy", "Scan reports", "Pull request records", "Release checklist", "Rollback evidence"],
    testCriteria: ["Failed security checks block merge", "Dependencies are inventoried", "Production artifacts are reproducible"],
  },
  {
    id: "privacy-001",
    title: "Privacy, retention, and data minimization",
    description: "Collect only required data, define retention, support deletion and correction workflows, and prevent sensitive data from appearing in logs or analytics.",
    frameworks: ["privacy-by-design", "nist-800-53-r5", "nist-csf-2"],
    status: "required",
    appliesTo: ["portal", "identity", "billing", "academy", "eios", "applications", "platform"],
    evidence: ["Data inventory", "Retention schedule", "Privacy impact assessment", "Deletion test records"],
    testCriteria: ["Optional data is not mandatory", "Retention is enforceable", "Analytics excludes sensitive content"],
  },
  {
    id: "resilience-001",
    title: "Resilience, recovery, and incident response",
    description: "Define backup, restore, failover, incident response, notification, and recovery objectives for customer-facing services.",
    frameworks: ["nist-csf-2", "nist-800-53-r5", "pci-dss-4-0-1"],
    status: "required",
    appliesTo: ["portal", "identity", "billing", "academy", "eios", "applications", "platform"],
    evidence: ["Recovery plan", "Backup tests", "Incident playbooks", "Tabletop results"],
    testCriteria: ["Backups are restorable", "Critical workflows have documented RTO/RPO", "Security events have an escalation path"],
  },
];

export function getSecurityControlsFor(area: SecurityControlRequirement["appliesTo"][number]) {
  return securityControlBaseline.filter((control) => control.appliesTo.includes(area));
}
