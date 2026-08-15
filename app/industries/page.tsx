import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, Brain, GraduationCap, ShieldCheck } from "lucide-react";
import { industrySolutions } from "./industryData";
import { LEGAL_ENTITY_NAME } from "@/lib/legal-identity";
import "./industries.css";
import { EnterpriseFooter, EnterpriseHeader, EnterpriseProofBand } from "../components/enterprise/EnterpriseChrome";

export const metadata: Metadata = {
  title: `Industries | ${LEGAL_ENTITY_NAME} Enterprise Intelligence and Security Solutions`,
  description: "Industry-aware cybersecurity, executive protection, AI governance, intelligence, risk, and secure technology for regulated and high-consequence sectors.",
  alternates: { canonical: "/industries" },
  openGraph: {
    title: `${LEGAL_ENTITY_NAME} Industry Solutions`,
    description: "Industry-specific executive intelligence, cybersecurity, protection, AI governance, and assurance solutions.",
    url: "https://www.obserrallc.com/industries",
    type: "website",
    images: [{ url: "/brand/visuals/obserra-eios-intelligence-hero.png", width: 1344, height: 768, alt: `${LEGAL_ENTITY_NAME} industry solutions` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${LEGAL_ENTITY_NAME} Industry Solutions`,
    description: "Industry-specific executive intelligence, cybersecurity, protection, AI governance, and assurance solutions.",
    images: ["/brand/visuals/obserra-eios-intelligence-hero.png"],
  },
};

export default function IndustriesPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: `${LEGAL_ENTITY_NAME} Industry Solutions`,
        url: "https://www.obserrallc.com/industries",
        description: "Industry-specific enterprise intelligence, cybersecurity, protection, AI governance, and assurance solutions.",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.obserrallc.com" },
          { "@type": "ListItem", position: 2, name: "Industries", item: "https://www.obserrallc.com/industries" },
        ],
      },
    ],
  };

  return (
    <>
      <EnterpriseHeader section="Industry solutions" />
      <main className="industry-page enterprise-page-main">
      <section className="industry-hero">
        <div>
          <p className="industry-eyebrow">INDUSTRY SOLUTIONS</p>
          <h1>Enterprise intelligence built around the operating environment.</h1>
          <p>{LEGAL_ENTITY_NAME} adapts cybersecurity, protection, intelligence, artificial intelligence (AI) governance, assurance, and executive decision support to the regulatory pressure, operational dependencies, and consequence profile of each engagement.</p>
          <div className="industry-actions">
            <Link href="/contact?interest=enterprise-consultation">Start an industry consultation</Link>
            <Link href="/services">Explore enterprise services</Link>
          </div>
        </div>
        <aside>
          <article><ShieldCheck size={18} /><strong>12 sectors</strong><span>Documented industry context pathways</span></article>
          <article><Brain size={18} /><strong>Cross-domain</strong><span>Cyber, physical, artificial intelligence, and enterprise risk</span></article>
          <article><Building2 size={18} /><strong>Executive-ready</strong><span>Decision support and board-level context</span></article>
        </aside>
      </section>

      <EnterpriseProofBand />

      <section className="industry-grid-section">
        <div className="industry-section-heading">
          <p>INDUSTRY PORTFOLIO</p>
          <h2>Select the operating environment that best matches your enterprise.</h2>
        </div>
        <div className="industry-grid">
          {industrySolutions.map((industry) => (
            <article key={industry.slug}>
              <span>{industry.shortName}</span>
              <h2>{industry.name}</h2>
              <p>{industry.summary}</p>
              <div className="industry-card-signals">
                <small>{industry.regulatoryContext.length} regulatory contexts</small>
                <small>{industry.serviceSlugs.length} aligned services</small>
              </div>
              <Link href={`/industries/${industry.slug}`}>Open industry solution <ArrowRight size={15} /></Link>
            </article>
          ))}
        </div>
      </section>

      <section className="industry-operating-model">
        <div>
          <p className="industry-eyebrow">ONE CONNECTED OPERATING MODEL</p>
          <h2>Industry context flows into every {LEGAL_ENTITY_NAME} capability.</h2>
        </div>
        <div className="industry-model-grid">
          <article><ShieldCheck size={20} /><strong>Services</strong><p>Executive advisory and delivery aligned to sector-specific risk.</p><Link href="/services">View services</Link></article>
          <article><Brain size={20} /><strong>Obserra EIOS</strong><p>The Enterprise Intelligence Operating System (EIOS) connects intelligence, digital-twin context, knowledge graphs, and artificial intelligence decision support.</p><Link href="/eios">View Obserra EIOS</Link></article>
          <article><GraduationCap size={20} /><strong>Academy</strong><p>Role-based learning options for leaders, practitioners, and teams, subject to offering-specific controls.</p><Link href="/academy/enterprise">View enterprise learning</Link></article>
          <article><Building2 size={20} /><strong>Trust Center</strong><p>Security architecture, framework alignment, policy, and procurement assurance.</p><Link href="/trust">Open Trust Center</Link></article>
        </div>
      </section>

      <section className="industry-cta">
        <div><p className="industry-eyebrow">BUILD THE RIGHT ENGAGEMENT</p><h2>Connect industry pressure to a controlled executive action plan.</h2><p>{LEGAL_ENTITY_NAME} scopes engagements around the actual operating model, regulatory environment, risk appetite, and decision priorities of the organization.</p></div>
        <Link href="/contact?interest=enterprise-consultation">Request industry consultation</Link>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </main>
      <EnterpriseFooter />
    </>
  );
}
