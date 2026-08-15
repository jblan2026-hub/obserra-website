import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { LEGAL_ENTITY_NAME } from "@/lib/legal-identity";
import "./portal.css";

export const metadata: Metadata = {
  title: `Customer Dashboard | ${LEGAL_ENTITY_NAME}`,
  description: `Access your protected ${LEGAL_ENTITY_NAME} customer workspace for Academy, applications, licenses, reports, billing, course-completion records, support, and account security.`,
  alternates: { canonical: "/portal" },
  robots: { index: false, follow: false },
};

const dashboardModules = [
  { eyebrow: "ACADEMY", title: "Learning workspace", copy: "Browse available training, resume account-based learning, and review course completion requirements.", href: "/academy", action: "Open Academy", state: "Available" },
  { eyebrow: "APPLICATIONS", title: `${LEGAL_ENTITY_NAME} applications`, copy: "Review secure enterprise applications and request deployment, licensing, or technical evaluation support.", href: "/apps", action: "View applications", state: "Available" },
  { eyebrow: "COURSE COMPLETION", title: "Completion records", copy: "Request Certificate of Course Completion assistance, verification support, or corrections to approved completion records.", href: "/contact?interest=certificate-support", action: "Completion-record support", state: "Support-enabled" },
  { eyebrow: "LICENSING", title: "Enterprise licensing", copy: "Coordinate renewals, procurement, user allocation, team training, and application deployment planning.", href: "/contact?interest=enterprise-licensing", action: "Contact licensing", state: "Request-based" },
  { eyebrow: "BILLING", title: "Orders and invoicing", copy: "Request receipts, invoice support, payment clarification, enrollment assistance, or procurement documentation.", href: "/contact?interest=billing-support", action: "Billing support", state: "Request-based" },
  { eyebrow: "REPORTS", title: "Executive deliverables", copy: "Request approved reports, advisory deliverables, board materials, engagement documents, and secure distribution support.", href: "/contact?interest=customer-reports", action: "Request reports", state: "Controlled release" },
  { eyebrow: "SUPPORT", title: "Customer support", copy: "Open a confidential support pathway for Academy, applications, advisory, protection, billing, or active engagements.", href: "/contact?interest=customer-support", action: "Open support", state: "Available" },
  { eyebrow: "SECURITY", title: "Account and session controls", copy: "Manage your verified identity, passwordless methods, multifactor authentication, profile, and active sessions.", href: "/portal#account-security", action: "Manage account", state: "Available" },
];

const roadmap = [
  ["Organization administration", "Planned", "Tenant-aware roles, members, and delegated administration will activate after organizational authorization controls are validated."],
  ["License inventory", "Planned", "Assigned products, seats, renewal dates, and entitlements require a production licensing system of record."],
  ["Order history", "Planned", "Verified transaction history will activate after Stripe customer reconciliation and account ownership controls are complete."],
  ["Downloads center", "Planned", "Secure files will activate with expiring links, authorization checks, malware controls, and download audit records."],
  ["Support case tracking", "Planned", "Case status and correspondence require a connected support platform and customer-scoped authorization."],
  ["API credentials", "Future", "Scoped API credentials will be introduced only with rotation, revocation, least privilege, logging, and tenant isolation."],
];

export default async function PortalPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/portal");

  const user = await currentUser();
  const displayName = user?.firstName || user?.username || user?.primaryEmailAddress?.emailAddress?.split("@")[0] || "Customer";
  const primaryEmail = user?.primaryEmailAddress?.emailAddress || `Verified ${LEGAL_ENTITY_NAME} account`;

  return (
    <main className="portal-page">
      <header className="portal-nav">
        <Link href="/" className="portal-brand" aria-label={`${LEGAL_ENTITY_NAME} home`}>
          <Image src="/brand/obserra-logo.png" alt={LEGAL_ENTITY_NAME} width={286} height={55} />
          <span>CUSTOMER DASHBOARD</span>
        </Link>
        <nav aria-label="Portal navigation">
          <Link href="/academy">Academy</Link><Link href="/apps">Applications</Link><Link href="/trust">Trust</Link><Link href="/contact">Contact</Link>
          <Link className="portal-cta" href="/contact?interest=customer-support">Get support</Link>
          <div className="portal-account-bar" aria-label="Account menu"><UserButton /></div>
        </nav>
      </header>

      <section className="portal-command" aria-labelledby="dashboard-title">
        <div className="portal-command-copy">
          <p className="portal-eyebrow">AUTHENTICATED CUSTOMER WORKSPACE</p>
          <h1 id="dashboard-title">Welcome, {displayName}.</h1>
          <p>Your {LEGAL_ENTITY_NAME} identity is verified. This dashboard centralizes active customer pathways and shows which account capabilities are available, request-based, controlled, or still pending production data integration.</p>
          <div className="portal-actions"><Link className="portal-button" href="/academy">Continue to Academy</Link><Link className="portal-outline" href="/contact?interest=customer-support">Open customer support</Link></div>
        </div>
        <aside className="portal-profile" aria-label="Authenticated account summary">
          <div className="portal-profile-head"><div><span>VERIFIED ACCOUNT</span><strong>{displayName}</strong><p>{primaryEmail}</p></div><UserButton /></div>
          <dl><div><dt>Identity</dt><dd>Active</dd></div><div><dt>Portal access</dt><dd>Protected</dd></div><div><dt>Account data</dt><dd>Controlled release</dd></div></dl>
        </aside>
      </section>

      <section className="portal-kpis" aria-label="Customer dashboard status">
        <article><span>IDENTITY STATUS</span><strong>Verified</strong><p>Clerk-authenticated session</p></article>
        <article><span>AVAILABLE PATHWAYS</span><strong>8</strong><p>Customer service modules</p></article>
        <article><span>DATA INTEGRITY</span><strong>No simulation</strong><p>Only verified records will display</p></article>
        <article><span>SECURITY MODEL</span><strong>Fail closed</strong><p>Protected routes and phased access</p></article>
      </section>

      <section className="portal-workspace" aria-labelledby="workspace-title">
        <div className="portal-section-heading"><div><p className="portal-eyebrow">CUSTOMER WORKSPACE</p><h2 id="workspace-title">Access the services connected to your {LEGAL_ENTITY_NAME} relationship.</h2></div><p>Module status reflects current production readiness. Request-based modules connect you to the responsible {LEGAL_ENTITY_NAME} team without presenting invented balances, licenses, transactions, cases, or records.</p></div>
        <div className="portal-grid">
          {dashboardModules.map((module) => <article className="portal-card" key={module.title}><div className="portal-card-top"><small>{module.eyebrow}</small><span>{module.state}</span></div><h3>{module.title}</h3><p>{module.copy}</p><Link href={module.href}>{module.action} →</Link></article>)}
        </div>
      </section>

      <section className="portal-section" id="account-security">
        <div className="portal-section-heading"><div><p className="portal-eyebrow">ACCOUNT SECURITY</p><h2>Manage identity and session controls through your secure account menu.</h2></div><p>Your Clerk account menu supports profile management, authentication methods, multifactor configuration where enabled, and active session controls.</p></div>
        <div className="portal-security">
          <div><h3>Active protections</h3><ul><li>Server-side identity verification</li><li>Protected portal middleware</li><li>Secure session management</li><li>Account-level sign-out</li><li>Canonical host enforcement</li><li>Preview indexing restrictions</li></ul></div>
          <div><h3>Manage your account</h3><p>Open the account control to review your profile, authentication factors, connected methods, and active sessions.</p><div className="portal-account-control"><UserButton showName /></div></div>
        </div>
      </section>

      <section className="portal-section portal-roadmap-section">
        <div className="portal-section-heading"><div><p className="portal-eyebrow">CONTROLLED CAPABILITY ROADMAP</p><h2>Customer data modules will activate only when their systems of record and controls are ready.</h2></div><p>This preserves accuracy, tenant isolation, privacy, auditability, and least-privilege access as the portal expands.</p></div>
        <div className="portal-roadmap">{roadmap.map(([title,state,copy]) => <article key={title}><div><span>{state}</span><h3>{title}</h3></div><p>{copy}</p></article>)}</div>
      </section>

      <section className="portal-section"><div className="portal-support"><div><p className="portal-eyebrow">CUSTOMER ASSISTANCE</p><h2>Reach the correct {LEGAL_ENTITY_NAME} team through one confidential request.</h2><p>Use customer support for enrollment, course-completion records, billing, licensing, reports, application access, active engagements, or account assistance.</p></div><div className="portal-actions"><Link className="portal-button" href="/contact?interest=customer-support">Open support request</Link><a className="portal-outline" href="mailto:info@obserrallc.com">Email support</a></div></div></section>

      <footer className="portal-footer"><span>OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC</span><nav><Link href="/trust">Trust Center</Link><Link href="/privacy">Privacy</Link><Link href="/contact">Contact</Link></nav></footer>
    </main>
  );
}
