export type SecurityTierId = "public" | "transactional" | "authenticated";

export type SecurityTier = Readonly<{
  id: SecurityTierId;
  name: string;
  purpose: string;
  routeExamples: readonly string[];
  requirements: readonly string[];
  frameworks: readonly string[];
}>;

export const securityTiers: Readonly<Record<SecurityTierId, SecurityTier>> = Object.freeze({
  public: Object.freeze({
    id: "public",
    name: "Public marketing tier",
    purpose: "Provide fast, accessible, indexable, and frictionless browsing for company, service, industry, trust, leadership, credential, and product-marketing content.",
    routeExamples: Object.freeze(["/", "/about", "/services", "/industries", "/eios", "/apps", "/academy", "/store", "/trust", "/contact"]),
    requirements: Object.freeze([
      "TLS and HSTS",
      "Content Security Policy",
      "Secure response headers",
      "Accessible navigation and responsive layout",
      "Input validation and abuse protection for public forms",
      "Dependency, secret, and vulnerability scanning",
      "Search-engine indexing permitted unless a page is intentionally private",
      "No authentication or step-up challenge for ordinary browsing",
    ]),
    frameworks: Object.freeze(["NIST CSF 2.0", "OWASP ASVS baseline", "NIST SSDF"]),
  }),
  transactional: Object.freeze({
    id: "transactional",
    name: "Transactional commerce tier",
    purpose: "Protect checkout, enrollment, payment, subscription, invoice, receipt, order, and billing-management workflows while minimizing PCI scope.",
    routeExamples: Object.freeze(["/checkout", "/api/checkout", "/api/stripe", "/portal/orders", "/portal/billing", "/academy/enroll"]),
    requirements: Object.freeze([
      "PCI-compliant hosted or tokenized payment processing",
      "No raw cardholder data stored, logged, or transmitted by Obserra systems",
      "Signed webhook validation, replay prevention, and idempotency",
      "Private no-store caching and noindex for transactional pages",
      "Server-side authorization for account-specific payment and order data",
      "Audit logging for payment-state and fulfillment transitions",
      "Rate limiting, anti-automation controls, and input validation",
      "Step-up authentication for billing administration and sensitive changes",
    ]),
    frameworks: Object.freeze(["PCI DSS 4.0.1", "NIST CSF 2.0", "NIST SP 800-63", "OWASP ASVS"]),
  }),
  authenticated: Object.freeze({
    id: "authenticated",
    name: "Authenticated application tier",
    purpose: "Protect SaaS applications, customer records, licensed capabilities, course delivery, certificates, reports, and administrative functions.",
    routeExamples: Object.freeze(["/portal", "/portal/applications", "/academy/learn", "/academy/certificate", "/eios/app"]),
    requirements: Object.freeze([
      "Verified identity and tenant context",
      "Role, permission, resource, session, device, and risk-aware authorization",
      "MFA and phishing-resistant authentication for privileged workflows",
      "Private no-store caching and noindex",
      "Tenant isolation and least privilege",
      "Continuous zero-trust evaluation and reauthentication",
      "Immutable authentication and authorization audit events",
      "Secure recovery, session revocation, retention, and evidence controls",
    ]),
    frameworks: Object.freeze(["NIST SP 800-63", "NIST SP 800-207", "NIST CSF 2.0", "OWASP ASVS"]),
  }),
});

export function getSecurityTier(id: SecurityTierId): SecurityTier {
  return securityTiers[id];
}
