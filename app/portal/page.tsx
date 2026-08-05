import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "./portal.css";

export const metadata: Metadata = {
  title: "Customer Portal | Obserra",
  description: "Access Obserra Academy, certificates, purchases, enterprise licensing, reports, support, and account services through one customer entry point.",
  alternates: { canonical: "/portal" },
};

const services = [
  ["LEARNING", "Academy access", "Open the Academy catalog, continue account-based learning, and review course requirements.", "/academy", "Open Academy"],
  ["CERTIFICATES", "Completion records", "Access certificate support, verification guidance, and completion record assistance.", "/contact?interest=certificate-support", "Certificate support"],
  ["PURCHASES", "Orders and billing", "Request help with purchases, receipts, enrollment, invoicing, or payment questions.", "/contact?interest=billing-support", "Billing support"],
  ["LICENSING", "Enterprise licensing", "Coordinate team training, application licensing, renewals, procurement, and deployment planning.", "/contact?interest=enterprise-licensing", "Contact licensing"],
  ["REPORTS", "Executive deliverables", "Request approved reports, advisory deliverables, board materials, and engagement documentation.", "/contact?interest=customer-reports", "Request reports"],
  ["SUPPORT", "Customer support", "Open a confidential support conversation for Academy, applications, advisory, or protection services.", "/contact?interest=customer-support", "Open support"],
];

export default function PortalPage() {
  return (
    <main className="portal-page">
      <header className="portal-nav">
        <Link href="/" className="portal-brand" aria-label="Obserra home">
          <Image src="/brand/obserra-logo.png" alt="Obserra Executive Protection and Intelligence LLC" width={286} height={55} />
          <span>CUSTOMER PORTAL</span>
        </Link>
        <nav aria-label="Portal navigation">
          <Link href="/academy">Academy</Link><Link href="/apps">Applications</Link><Link href="/trust">Trust</Link><Link href="/contact">Contact</Link>
          <Link className="portal-cta" href="/contact?interest=customer-support">Get support</Link>
        </nav>
      </header>

      <section className="portal-hero">
        <div>
          <p className="portal-eyebrow">OBSERRA CUSTOMER SERVICES</p>
          <h1>One secure entry point for learning, licensing, deliverables, and support.</h1>
          <p>This portal foundation centralizes customer pathways already supported by Obserra. Authenticated dashboards, order history, certificates, downloads, licenses, and account administration will be activated as the corresponding backend services are released.</p>
          <div className="portal-actions">
            <Link className="portal-button" href="/academy">Open Academy</Link>
            <Link className="portal-outline" href="/contact?interest=customer-support">Contact customer support</Link>
          </div>
        </div>
        <aside className="portal-status" aria-label="Portal service status">
          <article><span>ACADEMY</span><strong>Enrollment and course access available</strong></article>
          <article><span>ENTERPRISE SERVICES</span><strong>Licensing and support available</strong></article>
          <article><span>ACCOUNT DASHBOARD</span><strong>Phased activation in progress</strong></article>
        </aside>
      </section>

      <section className="portal-grid" aria-label="Customer portal services">
        {services.map(([label,title,copy,href,action]) => (
          <article className="portal-card" key={title}>
            <small>{label}</small><h2>{title}</h2><p>{copy}</p><Link href={href}>{action} →</Link>
          </article>
        ))}
      </section>

      <section className="portal-section">
        <p className="portal-eyebrow">SECURITY AND ACCOUNT INTEGRITY</p>
        <h2>Customer access will be activated only when identity, authorization, audit, and data protections are ready.</h2>
        <div className="portal-security">
          <p>Obserra will not expose placeholder account data or simulated customer records. New authenticated capabilities will be released only after the related identity, tenant isolation, authorization, logging, privacy, and recovery controls are implemented and validated.</p>
          <ul><li>Least-privilege access</li><li>Role-based authorization</li><li>Tenant-aware data boundaries</li><li>Audit logging and traceability</li><li>Secure payment and account workflows</li><li>Privacy and retention controls</li></ul>
        </div>
      </section>

      <section className="portal-section">
        <div className="portal-support">
          <div><p className="portal-eyebrow">NEED ASSISTANCE NOW?</p><h2>Reach the correct Obserra team through one confidential request.</h2><p>Use customer support for enrollment, certificates, billing, licensing, reports, application access, or active engagements.</p></div>
          <div className="portal-actions"><Link className="portal-button" href="/contact?interest=customer-support">Open support request</Link><a className="portal-outline" href="mailto:info@obserrallc.com">Email support</a></div>
        </div>
      </section>

      <footer className="portal-footer"><span>OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC</span><nav><Link href="/trust">Trust Center</Link><Link href="/privacy">Privacy</Link><Link href="/contact">Contact</Link></nav></footer>
    </main>
  );
}
