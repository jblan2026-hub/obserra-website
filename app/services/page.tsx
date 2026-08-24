import type { Metadata } from "next";
import "../apps/apps.css";
import "./services.css";
import "./services-executive.css";
import { serviceCatalog } from "./serviceCatalog";
import ServicePortfolioGrid from "./ServicePortfolioGrid";
import { LEGAL_ENTITY_NAME, PUBLIC_BRAND_NAME } from "@/lib/legal-identity";
import { EnterpriseFooter, EnterpriseHeader } from "../components/enterprise/EnterpriseChrome";

export const metadata: Metadata = {
  title: "Enterprise Services | Cybersecurity, Protection & AI Governance",
  description:
    "Executive advisory and scoped delivery across cybersecurity, protection, intelligence, enterprise risk, AI governance, identity, resilience, and secure technology.",
  alternates: { canonical: "/services" },
  keywords: [
    "enterprise cybersecurity services",
    "executive protection services",
    "fractional ciso",
    "protective intelligence",
    "AI governance consulting",
    "incident response advisory",
    "digital forensics consulting",
  ],
  openGraph: {
    title: `${PUBLIC_BRAND_NAME} Enterprise Services`,
    description: "Executive-ready advisory and delivery across cybersecurity, protection, intelligence, AI governance, risk, resilience, and professional training.",
    url: "https://www.obserrallc.com/services",
    type: "website",
    images: [{ url: "/brand/visuals/obserra-cybersecurity.png", width: 1344, height: 768, alt: `${PUBLIC_BRAND_NAME} enterprise services` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${PUBLIC_BRAND_NAME} Enterprise Services`,
    description: "Cybersecurity, executive protection, intelligence, risk, AI governance, resilience, and training for high-consequence organizations.",
    images: ["/brand/visuals/obserra-cybersecurity.png"],
  },
};

export default function ServicesPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        name: `${LEGAL_ENTITY_NAME} Enterprise Services`,
        itemListElement: serviceCatalog.map((service, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `https://www.obserrallc.com/services/${service.id}`,
          name: service.title,
        })),
      },
      {
        "@type": "Service",
        serviceType: "Enterprise cybersecurity, protection, intelligence, risk, AI governance, and advisory services",
        provider: {
          "@type": "Organization",
          name: LEGAL_ENTITY_NAME,
          url: "https://www.obserrallc.com",
        },
        areaServed: "Global",
      },
    ],
  };

  return (
    <>
      <EnterpriseHeader section="Enterprise services" />
      <main className="apps-page services-page enterprise-page-main">
        <section className="apps-hero services-hero">
          <div>
            <p className="apps-eyebrow">ENTERPRISE SERVICES</p>
            <h1>Senior expertise for risks that cannot be handled in isolation.</h1>
            <p>
              {PUBLIC_BRAND_NAME} helps leaders address cyber risk, protection, intelligence,
              governance, resilience, and transformation with executive judgment, focused analysis,
              and accountable execution.
            </p>
            <div className="apps-actions">
              <a className="apps-button" href="/contact?interest=enterprise-services">Start an executive conversation</a>
              <a className="apps-outline" href="#service-lines">View service portfolio</a>
              <a className="apps-outline" href="/trust">Review enterprise assurance</a>
            </div>
          </div>
        </section>

        <ServicePortfolioGrid />

        <section className="services-consultation">
          <div>
            <p className="apps-eyebrow">START WITH THE DECISION</p>
            <h2>Tell us what has to change and what is at risk.</h2>
            <p>We will align the right service, engagement model, and next step around the outcome you need.</p>
          </div>
          <div className="services-consultation-actions">
            <a className="apps-button" href="/contact?interest=enterprise-services">Start the conversation</a>
            <a className="apps-outline" href={`mailto:info@obserrallc.com?subject=${encodeURIComponent(`${LEGAL_ENTITY_NAME} Enterprise Services Inquiry`)}`}>Email enterprise services</a>
          </div>
        </section>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </main>
      <EnterpriseFooter />
    </>
  );
}
