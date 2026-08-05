export type SecurityFrameworkId =
  | "nist-csf-2"
  | "nist-800-53-r5"
  | "nist-800-63-r4"
  | "nist-800-207"
  | "nist-ssdf"
  | "pci-dss-4-0-1"
  | "owasp-asvs-5"
  | "owasp-samm"
  | "privacy-by-design";

export type SecurityControlStatus = "required" | "planned" | "implemented" | "validated";
export type SecurityArea = "portal" | "identity" | "billing" | "academy" | "eios" | "applications" | "platform";
export type ReleaseGateSeverity = "blocking" | "advisory";

export type SecurityControlRequirement = {
  id: string;
  title: string;
  description: string;
  frameworks: SecurityFrameworkId[];
  status: SecurityControlStatus;
  appliesTo: SecurityArea[];
  evidence: string[];
  testCriteria: string[];
  releaseGate: ReleaseGateSeverity;
};

export const securityFrameworks: Record<SecurityFrameworkId, { name: string; purpose: string }> = {
  "nist-csf-2": {
    name: "NIST Cybersecurity Framework 2.0",
    purpose: "Executive risk governance across Govern, Identify, Protect, Detect, Respond, and Recover.",
  },
  "nist-800-53-r5": {
    name: "NIST SP 800-53 Rev. 5",
    purpose: "Detailed security and privacy control catalog for enterprise systems.",
  },
  "nist-800-63-r4": {
    name: "NIST SP 800-63 Revision 4 Digital Identity Guidelines",
    purpose: "Risk-based identity proofing, authentication, authenticator management, federation, and assurance levels.",
  },
  "nist-800-207": {
    name: "NIST SP 800-207 Zero Trust Architecture",
    purpose: "Continuous verification, least privilege, explicit policy decisions, and resource-centric access.",
  },
  "nist-ssdf": {
    name: "NIST SP 800-218 Secure Software Development Framework",
    purpose: "Secure software design, development, testing, release, and maintenance.",
  },
  "pci-dss-4-0-1": {
    name: "PCI DSS 4.0.1",
    purpose: "Protection of cardholder data and secure payment processing.",
  },
  "owasp-asvs-5": {
    name: "OWASP Application Security Verification Standard 5.0",
    purpose: "Versioned application security verification requirements and testable assurance objectives.",
  },
  "owasp-samm": {
    name: "OWASP SAMM",
    purpose: "Secure software maturity and governance.",
  },
  "privacy-by-design": {
    name: "Privacy by Design",
    purpose: "Data minimization, purpose limitation, retention, transparency, and user rights.",
  },
};

export const securityControlBaseline: SecurityControlRequirement[] = [
  {
    id: "iam-001",
    title: "Digital identity risk assessment and assurance selection",
    description: "Document the identity risks for each journey and select proportionate identity, authentication, and federation assurance targets before implementation.",
    frameworks: ["nist-800-63-r4", "nist-csf-2", "nist-800-207", "owasp-asvs-5"],
    status: "required",
    appliesTo: ["portal", "identity", "billing", "academy", "eios", "applications", "platform"],
    evidence: ["Digital identity risk assessment", "IAL/AAL/FAL decision record", "Threat model", "Exception approvals"],
    testCriteria: ["Each protected journey has an assurance decision", "Higher-risk actions require stronger assurance", "Exceptions are time-bounded and approved"],
    releaseGate: "blocking",
  },
  {
    id: "iam-002",
    title: "Strong authentication and authenticator lifecycle management",
    description: "Support MFA, phishing-resistant authenticators where risk warrants, secure enrollment, binding, replacement, recovery, revocation, and session reauthentication.",
    frameworks: ["nist-800-63-r4", "nist-800-207", "nist-csf-2", "owasp-asvs-5"],
    status: "required",
    appliesTo: ["portal", "identity", "billing", "academy", "eios", "applications", "platform"],
    evidence: ["Authenticator policy", "MFA configuration", "Recovery design", "Revocation test records", "Session policy"],
    testCriteria: ["MFA can be enforced by role and risk", "Recovery cannot bypass authorization", "Revoked authenticators stop working", "Sensitive actions require recent authentication"],
    releaseGate: "blocking",
  },
  {
    id: "iam-003",
    title: "Secure federation and assertion validation",
    description: "Validate issuer, audience, signature, nonce, state, time bounds, redirect targets, and tenant context for federated identity assertions.",
    frameworks: ["nist-800-63-r4", "nist-800-207", "owasp-asvs-5"],
    status: "required",
    appliesTo: ["identity", "portal", "academy", "eios", "applications", "platform"],
    evidence: ["Federation architecture", "OIDC/SAML configuration", "Assertion validation tests", "Key rotation records"],
    testCriteria: ["Unsigned or expired assertions are rejected", "Audience and issuer are enforced", "Open redirects are blocked", "Tenant claims are validated server-side"],
    releaseGate: "blocking",
  },
  {
    id: "authz-001",
    title: "Tenant-aware least-privilege authorization",
    description: "Enforce server-side role and attribute checks for every protected resource and prevent cross-tenant access.",
    frameworks: ["nist-csf-2", "nist-800-53-r5", "nist-800-207", "owasp-asvs-5"],
    status: "required",
    appliesTo: ["portal", "identity", "academy", "eios", "applications", "platform"],
    evidence: ["Authorization matrix", "Tenant isolation tests", "Access review records", "Denied-access logs"],
    testCriteria: ["Cross-tenant access fails closed", "UI hiding is not the only control", "Privileged actions require explicit authorization"],
    releaseGate: "blocking",
  },
  {
    id: "zta-001",
    title: "Explicit zero-trust policy decision and enforcement",
    description: "Separate policy decision and enforcement responsibilities, evaluate identity, device, resource, action, and context, and deny access when required signals are unavailable.",
    frameworks: ["nist-800-207", "nist-csf-2", "nist-800-63-r4", "owasp-asvs-5"],
    status: "required",
    appliesTo: ["portal", "identity", "eios", "applications", "platform"],
    evidence: ["Zero-trust architecture", "Policy model", "Decision logs", "Denied-access tests"],
    testCriteria: ["Every protected request is explicitly authorized", "Network location alone never grants trust", "Missing context fails closed", "Policy outcomes are auditable"],
    releaseGate: "blocking",
  },
  {
    id: "zta-002",
    title: "Continuous session and access evaluation",
    description: "Reevaluate sessions when risk, role, device posture, tenant, location, or resource sensitivity changes and revoke access without waiting for natural session expiry.",
    frameworks: ["nist-800-207", "nist-800-63-r4", "nist-csf-2"],
    status: "required",
    appliesTo: ["portal", "identity", "billing", "eios", "applications", "platform"],
    evidence: ["Session risk model", "Revocation design", "Conditional access rules", "Reauthentication tests"],
    testCriteria: ["Role removal terminates effective access", "High-risk events trigger reauthentication or denial", "Session revocation propagates promptly"],
    releaseGate: "blocking",
  },
  {
    id: "asvs-001",
    title: "Versioned application security verification baseline",
    description: "Map application requirements and tests to a declared OWASP ASVS 5.0 verification level and retain versioned evidence for each release.",
    frameworks: ["owasp-asvs-5", "nist-csf-2", "nist-ssdf"],
    status: "required",
    appliesTo: ["portal", "identity", "billing", "academy", "eios", "applications", "platform"],
    evidence: ["ASVS applicability matrix", "Versioned test results", "Penetration test scope", "Remediation records"],
    testCriteria: ["Applicable ASVS requirements are identified", "Requirement identifiers include version", "Unresolved blocking findings prevent release"],
    releaseGate: "blocking",
  },
  {
    id: "appsec-001",
    title: "Secure input, output, browser, API, and session controls",
    description: "Validate and authorize all inputs, apply contextual output encoding, protect APIs, enforce secure cookies and headers, and prevent injection, request forgery, and broken access control.",
    frameworks: ["owasp-asvs-5", "nist-csf-2", "nist-ssdf"],
    status: "required",
    appliesTo: ["portal", "identity", "billing", "academy", "eios", "applications", "platform"],
    evidence: ["SAST/DAST reports", "API tests", "Security-header tests", "Session tests", "Threat model"],
    testCriteria: ["Server-side validation is enforced", "Authorization is verified per object and action", "CSRF protections apply where required", "Secure cookie and header settings are validated"],
    releaseGate: "blocking",
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
    releaseGate: "blocking",
  },
  {
    id: "pci-002",
    title: "Protect payment integrations and webhooks",
    description: "Validate signatures, prevent replay, authorize fulfillment, preserve idempotency, and audit every payment-state transition.",
    frameworks: ["pci-dss-4-0-1", "nist-ssdf", "owasp-asvs-5"],
    status: "required",
    appliesTo: ["billing", "academy", "applications", "platform"],
    evidence: ["Webhook verification code", "Idempotency design", "Fulfillment logs", "Negative test results"],
    testCriteria: ["Unsigned events are rejected", "Duplicate events do not duplicate fulfillment", "Payment status cannot be forged from the browser"],
    releaseGate: "blocking",
  },
  {
    id: "data-001",
    title: "Encryption and secrets management",
    description: "Encrypt data in transit and at rest, centralize secrets, rotate credentials, and prohibit secrets in source code or client bundles.",
    frameworks: ["nist-csf-2", "nist-800-53-r5", "nist-800-207", "pci-dss-4-0-1", "owasp-asvs-5"],
    status: "required",
    appliesTo: ["portal", "identity", "billing", "academy", "eios", "applications", "platform"],
    evidence: ["TLS configuration", "Key-management design", "Secret-scanning results", "Rotation records"],
    testCriteria: ["TLS is enforced", "Secrets are absent from repositories", "Sensitive fields are encrypted or tokenized"],
    releaseGate: "blocking",
  },
  {
    id: "log-001",
    title: "Immutable security and transaction audit logging",
    description: "Capture actor, tenant, action, resource, outcome, correlation ID, timestamp, security context, and relevant before/after values.",
    frameworks: ["nist-csf-2", "nist-800-53-r5", "nist-800-207", "pci-dss-4-0-1", "owasp-asvs-5"],
    status: "required",
    appliesTo: ["portal", "identity", "billing", "academy", "eios", "applications", "platform"],
    evidence: ["Audit schema", "Retention policy", "Alert rules", "Log integrity tests"],
    testCriteria: ["Privileged and payment actions are traceable", "Logs exclude prohibited secrets and card data", "Log tampering is detectable"],
    releaseGate: "blocking",
  },
  {
    id: "sdlc-001",
    title: "Secure software development and release gates",
    description: "Require dependency review, SAST, secret scanning, tests, build verification, peer review, and rollback planning before production release.",
    frameworks: ["nist-ssdf", "owasp-samm", "owasp-asvs-5", "nist-csf-2"],
    status: "required",
    appliesTo: ["portal", "identity", "billing", "academy", "eios", "applications", "platform"],
    evidence: ["CI policy", "Scan reports", "Pull request records", "Release checklist", "Rollback evidence"],
    testCriteria: ["Failed security checks block merge", "Dependencies are inventoried", "Production artifacts are reproducible"],
    releaseGate: "blocking",
  },
  {
    id: "privacy-001",
    title: "Privacy, retention, and data minimization",
    description: "Collect only required data, define retention, support deletion and correction workflows, and prevent sensitive data from appearing in logs or analytics.",
    frameworks: ["privacy-by-design", "nist-800-53-r5", "nist-800-63-r4", "nist-csf-2"],
    status: "required",
    appliesTo: ["portal", "identity", "billing", "academy", "eios", "applications", "platform"],
    evidence: ["Data inventory", "Retention schedule", "Privacy impact assessment", "Deletion test records"],
    testCriteria: ["Optional data is not mandatory", "Retention is enforceable", "Analytics excludes sensitive content"],
    releaseGate: "blocking",
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
    releaseGate: "blocking",
  },
];

export function getSecurityControlsFor(area: SecurityArea) {
  return securityControlBaseline.filter((control) => control.appliesTo.includes(area));
}

export function getSecurityControlsForFramework(framework: SecurityFrameworkId) {
  return securityControlBaseline.filter((control) => control.frameworks.includes(framework));
}

export function getBlockingSecurityControls(area?: SecurityArea) {
  return securityControlBaseline.filter(
    (control) => control.releaseGate === "blocking" && (!area || control.appliesTo.includes(area)),
  );
}

export function canReleaseSecurityArea(area: SecurityArea) {
  return getBlockingSecurityControls(area).every((control) => control.status === "validated");
}
