import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { serviceCatalog, serviceMap } from "../serviceCatalog";

export async function generateStaticParams() {
  return serviceCatalog.map((service) => ({ serviceId: service.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ serviceId: string }> }): Promise<Metadata> {
  const { serviceId } = await params;
  const service = serviceMap[serviceId];
  if (!service) return {};
  return {
    title: `${service.title} | Obserra Services`,
    description: service.summary,
    alternates: { canonical: `/services/${service.id}` },
    keywords: [
      service.title,
      "enterprise cybersecurity services",
      "executive protection advisory",
      "protective intelligence",
      "AI governance",
      "Obserra Services",
    ],
    openGraph: {
      title: `${service.title} | Obserra Services`,
      description: service.summary,
      url: `https://www.obserrallc.com/services/${service.id}`,
      type: "website",
      images: [{ url: "/brand/visuals/obserra-cybersecurity.png", width: 1344, height: 768, alt: service.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${service.title} | Obserra Services`,
      description: service.summary,
      images: ["/brand/visuals/obserra-cybersecurity.png"],
    },
  };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ serviceId: string }> }) {
  const { serviceId } = await params;
  const service = serviceMap[serviceId];
  if (!service) notFound();

  const isExecutiveProtection = service.id === "executive-protection";
  const serviceHighlights = isExecutiveProtection
    ? [
        "Advance planning for travel, venues, and exposure windows.",
        "Protective support that connects people, context, and response.",
        "Clear escalation paths for discreet, high-consequence decisions.",
      ]
    : [
        "Structured scoping that matches the work to the risk.",
        "Executive-level delivery with direct accountability.",
        "Commercially focused advisory and execution support.",
      ];

  const executiveSections = isExecutiveProtection
    ? {
        outcomes: [
          "Reduce avoidable exposure before movement, meetings, or public-facing work.",
          "Create a repeatable protective process for travel, residence, and event activity.",
          "Align executive protection with intelligence, cyber, legal, and operations stakeholders.",
        ],
        services: [
          {
            title: "Advance planning",
            text: "Route, location, vendor, and timing review built around the executive schedule instead of a generic security checklist.",
          },
          {
            title: "Protective intelligence",
            text: "Threat indicators, open-source context, and escalation criteria turned into a defensible protective recommendation.",
          },
          {
            title: "Travel and event support",
            text: "High-consequence movement and public appearance support with practical coordination points and response readiness.",
          },
          {
            title: "Discrete executive coordination",
            text: "A calm operating model for assistants, operations, and leadership teams that need fast answers without noise.",
          },
        ],
        steps: [
          "Initial scoping call to identify the people, assets, schedules, and exposure points that matter most.",
          "Protective review of travel, venue, digital, and communications context to define the actual risk profile.",
          "Delivery of a scoped executive protection plan with clear ownership, response paths, and next actions.",
        ],
      }
    : null;

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: service.title,
        serviceType: service.title,
        description: service.detail,
        provider: {
          "@type": "Organization",
          name: "Obserra Executive Protection & Intelligence LLC",
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
      {
        "@type": "WebPage",
        name: `${service.title} | Obserra Services`,
        url: `https://www.obserrallc.com/services/${service.id}`,
        isPartOf: { "@id": "https://www.obserrallc.com/#website" },
        about: { "@id": "https://www.obserrallc.com/#organization" },
      },
    ],
  };

  return (
    <>
    <main className="apps-page services-page service-detail-page">
      <header className="apps-nav">
        <a href="/" className="apps-brand" aria-label="Obserra home">
          <Image src="/brand/obserra-logo.png" alt="Obserra Executive Protection and Intelligence LLC" width={286} height={55} />
          <span>SERVICE DETAIL</span>
        </a>
        <nav aria-label="Service detail navigation">
          <a href="/">Home</a>
          <a href="/services">All services</a>
          <a href="/contact">Contact</a>
          <a href={`mailto:info@obserrallc.com?subject=${encodeURIComponent(service.title + " consultation")}`} className="apps-nav-cta">Request consultation</a>
        </nav>
      </header>

      <section className="service-detail-hero">
        <div className="service-detail-hero-copy">
          <p className="apps-eyebrow">OBSERRA SERVICE DETAIL</p>
          <h1>{isExecutiveProtection ? "Executive protection that starts before the risk is visible." : service.title}</h1>
          <p>{isExecutiveProtection ? "Obserra Executive Protection helps leaders move, meet, and operate with fewer exposure gaps. The work is scoped around travel, venues, public activity, digital presence, and response planning so security decisions stay practical and defensible." : service.detail}</p>
          <div className="apps-actions">
            <a className="apps-button" href={`mailto:info@obserrallc.com?subject=${encodeURIComponent(service.title + " consultation")}`}>Start this engagement</a>
            <a className="apps-outline" href="/contact">Open guided contact and scheduling</a>
          </div>
          <ul className="service-detail-highlights">
            {serviceHighlights.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
        <aside className="service-detail-panel">
          <p className="service-detail-panel-kicker">Commercial delivery model</p>
          <strong>Executive-level accountability with direct response paths.</strong>
          <span>Scope is aligned to urgency, movement, visibility, and operational constraints.</span>
          <div className="service-detail-panel-stats">
            <article><b>24/7</b><span>protected decision posture</span></article>
            <article><b>1</b><span>scoped point of contact</span></article>
            <article><b>Same day</b><span>response target for standard inquiries</span></article>
          </div>
        </aside>
      </section>

      {isExecutiveProtection && executiveSections && (
        <>
          <section className="service-detail-proof">
            <article>
              <p>What this changes</p>
              <h2>Protection becomes a process, not a reaction.</h2>
              <div>
                {executiveSections.outcomes.map((item) => <span key={item}>{item}</span>)}
              </div>
            </article>
          </section>

          <section className="service-detail-split">
            <div>
              <p className="apps-eyebrow">Core delivery areas</p>
              <h2>Built for leaders, assistants, and operating teams that need clear execution.</h2>
            </div>
            <div className="service-detail-cards">
              {executiveSections.services.map((item) => (
                <article key={item.title}>
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="service-detail-steps">
            <p className="apps-eyebrow">How an engagement starts</p>
            <div className="service-detail-steps-grid">
              {executiveSections.steps.map((step, index) => (
                <article key={step}>
                  <span>0{index + 1}</span>
                  <p>{step}</p>
                </article>
              ))}
            </div>
          </section>
        </>
      )}

      <section className="service-detail-cta">
        <div>
          <p className="apps-eyebrow">Ready to scope the work</p>
          <h2>Bring the executive protection conversation into a controlled, professional process.</h2>
          <p>Use the contact link to start a private conversation about people, travel, events, or executive movement support. Obserra will respond with the next practical step.</p>
        </div>
        <div className="service-detail-cta-actions">
          <a className="apps-button" href={`mailto:info@obserrallc.com?subject=${encodeURIComponent(service.title + " consultation")}`}>Request consultation</a>
          <a className="apps-outline" href="/services">Back to all services</a>
        </div>
      </section>
    </main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </>
  );
}
