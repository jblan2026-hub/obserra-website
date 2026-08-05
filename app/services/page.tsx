import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Brain, Briefcase, Users, Binary, Landmark, BookOpen, Building2, LockKeyhole } from "lucide-react";
import "../apps/apps.css";
import "./services.css";
import { serviceCatalog } from "./serviceCatalog";

export const metadata: Metadata = {
  title: "Services | Obserra Executive Protection, Cybersecurity, Intelligence and Advisory",
  description:
    "Executive protection, protective intelligence, cybersecurity consulting, fractional CISO, AI governance, IAM, GRC, enterprise risk, and technology consulting.",
  alternates: { canonical: "/services" },
  keywords: ["executive protection services", "fractional ciso", "cybersecurity consulting", "protective intelligence", "AI governance"],
  openGraph: {
    title: "Obserra Services | Enterprise Security, Intelligence, and Advisory",
    description: "Executive-ready cybersecurity, protective intelligence, enterprise risk, and secure technology consulting.",
    url: "https://www.obserrallc.com/services",
    type: "website",
    images: [{ url: "/brand/visuals/obserra-cybersecurity.png", width: 1344, height: 768, alt: "Obserra services" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Obserra Services | Enterprise Security and Intelligence",
    description: "Advisory and delivery across cybersecurity, protection, intelligence, and AI governance.",
    images: ["/brand/visuals/obserra-cybersecurity.png"],
  },
};

const iconByKey = {
  ShieldCheck,
  Brain,
  LockKeyhole,
  Briefcase,
  Binary,
  Landmark,
  Users,
  Building2,
  BookOpen,
  ArrowRight,
};

export default function ServicesPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        serviceType: "Cybersecurity and executive protection services",
        provider: {
          "@type": "Organization",
          name: "Obserra Executive Protection & Intelligence LLC",
          url: "https://www.obserrallc.com"
        },
        areaServed: "Global"
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.obserrallc.com" },
          { "@type": "ListItem", position: 2, name: "Services", item: "https://www.obserrallc.com/services" }
        ]
      }
    ]
  };

  return (
    <main className="apps-page services-page">
      <header className="apps-nav">
        <a href="/" className="apps-brand" aria-label="Obserra home">
          <Image src="/brand/obserra-logo.png" alt="Obserra Executive Protection and Intelligence LLC" width={286} height={55} />
          <span>SERVICES</span>
        </a>
        <nav aria-label="Services navigation">
          <a href="/">Home</a>
          <a href="/protection-intelligence">Protection</a>
          <a href="/apps">Applications</a>
          <a href="/catalog">Catalog</a>
          <a href="/eios">EIOS</a>
          <a href="/academy">Academy</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
          <a href="mailto:info@obserrallc.com?subject=Obserra%20Service%20Inquiry" className="apps-nav-cta">Request consultation</a>
        </nav>
      </header>

      <section className="apps-hero services-hero">
        <div>
          <p className="apps-eyebrow">EXECUTIVE SERVICES</p>
          <h1>Bring in proven cyber, protection, and intelligence experts when the stakes are high.</h1>
          <p>
            OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC delivers advisory and execution across
            executive protection, protective intelligence, cybersecurity leadership, AI governance,
            identity and access, and enterprise risk. We help leadership teams reduce exposure,
            make faster decisions, and execute confidently across critical priorities.
          </p>
          <div className="apps-actions">
            <a className="apps-button" href="mailto:info@obserrallc.com?subject=Request%20Obserra%20Executive%20Consultation">Request executive consultation</a>
            <a className="apps-outline" href="mailto:info@obserrallc.com?subject=Schedule%20Obserra%20Scoping%20Session">Book commercial scoping session</a>
            <a className="apps-outline" href="/catalog">View course catalog</a>
          </div>
        </div>
        <aside>
          <p><ShieldCheck size={16} /> Veteran-owned executive advisory organization</p>
          <p><Brain size={16} /> Fortune 500 CISO leadership experience</p>
          <p><Building2 size={16} /> Structured delivery model for enterprise environments</p>
        </aside>
      </section>

      <section className="apps-results services-results">
        <p>Service lines available for immediate engagement</p>
        <div className="apps-grid">
          {serviceCatalog.map((service) => {
            const Icon = iconByKey[service.icon];
            return (
              <article key={service.id}>
              <header>
                <span className="status-pill status-available">Service</span>
                <small>Advisory</small>
              </header>
              <h2>{service.title}</h2>
              <p>{service.summary}</p>
              <footer>
                <a href={`/services/${service.id}`}>
                  Start this engagement <ArrowRight size={15} />
                </a>
              </footer>
              <div className="service-icon-wrap">
                <Icon size={16} />
              </div>
              </article>
            );
          })}
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </main>
  );
}
