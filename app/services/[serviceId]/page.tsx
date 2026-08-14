import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { serviceCatalog, serviceMap } from "../serviceCatalog";
import { LEGAL_ENTITY_NAME } from "@/lib/legal-identity";
import "../services.css";

export async function generateStaticParams() {
  return serviceCatalog.map((service) => ({ serviceId: service.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ serviceId: string }> }): Promise<Metadata> {
  const { serviceId } = await params;
  const service = serviceMap[serviceId];
  if (!service) return {};
  return {
    title: `${service.title} | ${LEGAL_ENTITY_NAME} Enterprise Services`,
    description: service.summary,
    alternates: { canonical: `/services/${service.id}` },
    keywords: [service.title, service.category, "enterprise advisory", "executive risk", `${LEGAL_ENTITY_NAME} Services`],
    openGraph: {
      title: `${service.title} | ${LEGAL_ENTITY_NAME} Enterprise Services`,
      description: service.summary,
      url: `https://www.obserrallc.com/services/${service.id}`,
      type: "website",
      images: [{ url: "/brand/visuals/obserra-cybersecurity.png", width: 1344, height: 768, alt: service.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${service.title} | ${LEGAL_ENTITY_NAME} Enterprise Services`,
      description: service.summary,
      images: ["/brand/visuals/obserra-cybersecurity.png"],
    },
  };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ serviceId: string }> }) {
  const { serviceId } = await params;
  const service = serviceMap[serviceId];
  if (!service) notFound();

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: service.title,
        serviceType: service.category,
        description: service.detail,
        provider: {
          "@type": "Organization",
          name: LEGAL_ENTITY_NAME,
          url: "https://www.obserrallc.com",
        },
        areaServed: "Global",
        url: `https://www.obserrallc.com/services/${service.id}`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.obserrallc.com" },
          { "@type": "ListItem", position: 2, name: "Services", item: "https://www.obserrallc.com/services" },
          { "@type": "ListItem", position: 3, name: service.title, item: `https://www.obserrallc.com/services/${service.id}` },
        ],
      },
    ],
  };

  const consultationHref = `/contact?interest=${encodeURIComponent(service.id)}`;

  return (
    <>
      <main className="apps-page services-page service-detail-page">
        <header className="apps-nav">
          <a href="/" className="apps-brand" aria-label={`${LEGAL_ENTITY_NAME} home`}>
            <Image src="/brand/obserra-logo.png" alt={LEGAL_ENTITY_NAME} width={286} height={55} />
            <span>SERVICE DETAIL</span>
          </a>
          <nav aria-label="Service detail navigation">
            <a href="/">Home</a>
            <a href="/services">All services</a>
            <a href="/industries">Industries</a>
            <a href="/trust">Trust</a>
            <a href={consultationHref} className="apps-nav-cta">Request consultation</a>
          </nav>
        </header>

        <section className="service-detail-hero">
          <div className="service-detail-hero-copy">
            <p className="apps-eyebrow">{service.category.toUpperCase()}</p>
            <h1>{service.title}</h1>
            <p>{service.detail}</p>
            <div className="apps-actions">
              <a className="apps-button" href={consultationHref}>Start this engagement</a>
              <a className="apps-outline" href="/trust">Review enterprise assurance</a>
            </div>
            <ul className="service-detail-highlights">
              {service.outcomes.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
          <aside className="service-detail-panel">
            <p className="service-detail-panel-kicker">Commercial delivery model</p>
            <strong>Executive accountability with a defined scope, evidence path, and decision cadence.</strong>
            <span>Engagement structure is determined by risk, urgency, stakeholders, information sensitivity, and implementation requirements.</span>
            <div className="service-detail-panel-stats">
              <article><b>{service.category}</b><span>primary service domain</span></article>
              <article><b>{service.deliverables.length}</b><span>core deliverable categories</span></article>
              <article><b>{service.industries.length}</b><span>priority industry contexts</span></article>
            </div>
          </aside>
        </section>

        <section className="service-detail-proof">
          <article>
            <p>Expected business outcomes</p>
            <h2>Move from fragmented activity to an accountable operating model.</h2>
            <div>
              {service.outcomes.map((item) => <span key={item}>{item}</span>)}
            </div>
          </article>
        </section>

        <section className="service-detail-split">
          <div>
            <p className="apps-eyebrow">CORE DELIVERABLES</p>
            <h2>Evidence, decisions, and implementation artifacts tailored to the engagement.</h2>
          </div>
          <div className="service-detail-cards">
            {service.deliverables.map((item, index) => (
              <article key={item}>
                <strong>{String(index + 1).padStart(2, "0")} · {item}</strong>
                <p>Scoped to the organization’s operating context, stakeholders, risk criteria, evidence requirements, and commercial objectives.</p>
              </article>
            ))}
          </div>
        </section>

        <section className="service-detail-steps">
          <p className="apps-eyebrow">HOW THE ENGAGEMENT STARTS</p>
          <div className="service-detail-steps-grid">
            {service.engagementSteps.map((step, index) => (
              <article key={step}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{step}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="service-detail-industries">
          <div>
            <p className="apps-eyebrow">INDUSTRY CONTEXT</p>
            <h2>Designed for operating environments where assurance, resilience, and executive judgment matter.</h2>
          </div>
          <div className="service-industry-tags">
            {service.industries.map((industry) => <span key={industry}>{industry}</span>)}
          </div>
        </section>

        <section className="service-detail-cta">
          <div>
            <p className="apps-eyebrow">READY TO SCOPE THE WORK</p>
            <h2>Begin with the decision, exposure, deadline, and outcome that matter most.</h2>
            <p>{LEGAL_ENTITY_NAME} will determine the appropriate service scope, engagement model, information requirements, and next commercial step. Pricing is provided only after scope is understood.</p>
          </div>
          <div className="service-detail-cta-actions">
            <a className="apps-button" href={consultationHref}>Request consultation</a>
            <Link className="apps-outline" href="/services">Back to all services</Link>
          </div>
        </section>
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </>
  );
}
