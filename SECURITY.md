# Obserra Security Policy

## Scope

This policy applies to the production website and Obserra Academy/LMS source maintained in this repository for **OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC**.

The currently supported security baseline is the code on `main` and the production release deployed from the most recent governed, validated merge to `main`. Historical feature branches, superseded deployment artifacts, local forks, and archived release candidates are not supported production versions.

Florida Class D regulated production remains separately controlled and fail closed until its licensing, acceptance, database-promotion, high-availability, recovery, and activation prerequisites are satisfied. Nothing in this repository or policy represents FDACS approval, CMMC certification, FedRAMP authorization, or authorization to process Controlled Unclassified Information.

## Reporting a Security Vulnerability

Do **not** open a public GitHub issue for a suspected vulnerability.

Preferred reporting channel:

1. Use GitHub Private Vulnerability Reporting for this repository when the **Report a vulnerability** option is available under the repository Security area.
2. If private vulnerability reporting is unavailable, email `info@obserrallc.com` with the subject `SECURITY: obserra-website` and request a private security-response channel before sending sensitive technical details.

Do not include passwords, API keys, authentication tokens, private cryptographic material, student records, payment-card data, controlled data, production secrets, or other sensitive information in a public issue, discussion, pull request, commit, or chat transcript.

A useful report should include, when safe to provide privately:

- the affected route, component, dependency, or service;
- the observed security impact;
- reproducible steps that avoid destructive testing;
- relevant request or response metadata with secrets and personal data removed;
- the affected release or commit SHA when known; and
- suggested remediation or mitigating controls, if available.

## Coordinated Handling

Security reports are triaged under the Obserra secure-development and incident-response process. Confirmed findings are prioritized according to exploitability, business impact, affected data, regulatory impact, and exposure of production services.

Obserra may request additional evidence, coordinate a remediation and validation window, issue a security advisory when appropriate, and delay public disclosure until affected production systems can be remediated safely.

Do not perform destructive testing, denial-of-service testing, social engineering, credential stuffing, unauthorized access to another user's account, or extraction of real learner, payment, or regulated records.

## Security Engineering and Release Controls

Production changes are expected to follow the governed pull-request and CI/CD path and to retain auditable evidence. The repository security baseline includes, where applicable:

- CodeQL static analysis;
- locked dependency installation and production dependency auditing;
- automated dependency version monitoring;
- secure-by-default identity and authorization controls;
- signed Stripe webhook verification and fail-closed Academy commerce controls;
- Supabase least-privilege and row-level-security controls;
- exact-SHA release validation and deployment evidence;
- machine-readable NIST SP 800-171 Rev. 3 / CMMC Level 2 traceability; and
- explicit tracking of unresolved provider, recovery, CUI-scope, and organizational evidence.

## Sensitive and Regulated Data

This public repository is not an approved channel for CUI, learner PII, payment data, security credentials, licensing identifiers, protected exam materials, or regulated production evidence containing confidential information.

If a security report appears to contain such data, stop transmitting additional material and request a private handling channel.
