import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "./store.css";

export const metadata: Metadata = {
  title: "Store | Obserra",
  description: "Purchase Obserra applications, courses, subscriptions, advisory services, and enterprise offerings through one secure commercial storefront.",
  alternates: { canonical: "/store" },
};

const categories = [
  {
    eyebrow: "APPLICATIONS",
    title: "Enterprise software and SaaS",
    copy: "Subscribe to Obserra applications, launch entitled SaaS services, retrieve subscription-bound keys, and download approved releases.",
    href: "/apps",
    action: "Browse applications",
    status: "Stripe subscriptions",
  },
  {
    eyebrow: "ACADEMY",
    title: "Professional courses and certifications",
    copy: "Enroll in cybersecurity, leadership, governance, intelligence, and executive education through the Obserra Academy.",
    href: "/academy",
    action: "Browse courses",
    status: "Secure checkout",
  },
  {
    eyebrow: "ADVISORY",
    title: "Executive and cybersecurity advisory",
    copy: "Request fractional CISO, board advisory, cyber strategy, governance, risk, compliance, and transformation engagements.",
    href: "/services",
    action: "Explore advisory",
    status: "Proposal-based",
  },
  {
    eyebrow: "PROTECTION",
    title: "Executive protection and intelligence",
    copy: "Request executive protection, travel risk, protective intelligence, investigations, and security planning services.",
    href: "/contact?interest=executive-protection",
    action: "Request protection support",
    status: "Consultation required",
  },
];

const commerceControls = [
  ["Secure payments", "Stripe-hosted checkout keeps payment-card data outside Obserra application code."],
  ["Subscription enforcement", "Application access is revalidated and denied automatically when billing is inactive."],
  ["Protected delivery", "Approved software releases use authenticated entitlement checks and short-lived signed URLs."],
  ["Customer fulfillment", "Purchases route to the protected portal for launch, licensing, downloads, billing, and support."],
];

export default function StorePage() {
  return (
    <main className="store-page">
      <header className="store-nav">
        <Link href="/" className="store-brand" aria-label="Obserra home">
          <Image src="/brand/obserra-logo.png" alt="Obserra Executive Protection and Intelligence LLC" width={286} height={55} />
          <span>COMMERCIAL STORE</span>
        </Link>
        <nav aria-label="Store navigation">
          <Link href="/apps">Applications</Link>
          <Link href="/academy">Courses</Link>
          <Link href="/services">Services</Link>
          <Link href="/portal">Customer portal</Link>
          <Link className="store-nav-cta" href="/contact?interest=enterprise-commerce">Enterprise sales</Link>
        </nav>
      </header>

      <section className="store-hero">
        <div>
          <p className="store-eyebrow">OBSERRA COMMERCIAL PLATFORM</p>
          <h1>Applications, courses, subscriptions, and executive services in one secure store.</h1>
          <p>Choose the offering that fits your organization, complete secure checkout where available, and manage access through the Obserra customer portal.</p>
          <div className="store-actions">
            <Link className="store-button" href="/apps">Shop applications</Link>
            <Link className="store-outline" href="/academy">Shop courses</Link>
            <Link className="store-outline" href="/contact?interest=enterprise-commerce">Request enterprise pricing</Link>
          </div>
        </div>
        <aside>
          <span>COMMERCE MODEL</span>
          <strong>Secure, entitlement-based, and expandable</strong>
          <p>Applications, education, and services use the correct purchase or engagement pathway without exposing unverified pricing, inventory, or customer data.</p>
        </aside>
      </section>

      <section className="store-kpis" aria-label="Store capabilities">
        <article><span>APPLICATIONS</span><strong>Subscriptions</strong><p>SaaS, private cloud, hybrid, and on-premises options</p></article>
        <article><span>COURSES</span><strong>Enrollment</strong><p>Professional learning and certification pathways</p></article>
        <article><span>SERVICES</span><strong>Proposals</strong><p>Advisory, protection, and enterprise engagements</p></article>
        <article><span>FULFILLMENT</span><strong>Protected</strong><p>Portal access, licensing, downloads, and billing</p></article>
      </section>

      <section className="store-section">
        <div className="store-heading">
          <div><p className="store-eyebrow">SHOP BY OFFERING</p><h2>Start with one capability and expand across the Obserra platform.</h2></div>
          <p>Each category routes to its production purchase, enrollment, subscription, or consultation workflow.</p>
        </div>
        <div className="store-grid">
          {categories.map((category) => (
            <article key={category.title}>
              <div className="store-card-top"><span>{category.eyebrow}</span><small>{category.status}</small></div>
              <h3>{category.title}</h3>
              <p>{category.copy}</p>
              <Link href={category.href}>{category.action} →</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="store-section store-assurance">
        <div className="store-heading">
          <div><p className="store-eyebrow">SECURE COMMERCE</p><h2>Commercial controls built for trusted customer transactions.</h2></div>
          <p>Payment, subscription, fulfillment, and delivery controls remain fail closed when required services are not configured.</p>
        </div>
        <div className="store-assurance-grid">
          {commerceControls.map(([title, copy]) => <article key={title}><h3>{title}</h3><p>{copy}</p></article>)}
        </div>
      </section>

      <section className="store-cta">
        <div><p className="store-eyebrow">ENTERPRISE PURCHASING</p><h2>Need bundled applications, team training, deployment support, or a custom agreement?</h2><p>Obserra can coordinate enterprise pricing, procurement documentation, implementation planning, and controlled deployment.</p></div>
        <div className="store-actions"><Link className="store-button" href="/contact?interest=enterprise-commerce">Contact enterprise sales</Link><Link className="store-outline" href="/portal">Open customer portal</Link></div>
      </section>
    </main>
  );
}
