import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Brain, GraduationCap, ShieldCheck, Building2, Radar } from "lucide-react";
import { industryMap, industrySolutions } from "../industryData";

export async function generateStaticParams() {
  return industrySolutions.map((industry) => ({ industry: industry.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ industry: string }> }): Promise<Metadata> {
  const { industry: slug } = await params;
  const industry = industryMap[slug];
  if (!industry) return {};
  return {
    title: `${industry.name} Solutions | Obserra`,
    description: industry.summary,
    alternates: { canonical: `/industries/${industry.slug}` },
    openGraph: {
      title: `${industry.name} Solutions | Obserra`,
      description: industry.summary,
      url: `https://www.obserrallc.com/industries/${industry.slug}`,
      type: "website",
      images: [{ url: "/brand/visuals/obserra-eios-intelligence-hero.png", width: 1344, height: 768, alt: `${industry.name} industry solution` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${industry.name} Solutions | Obserra`,
      description: industry.summary,
      images: ["/brand/visuals/obserra-eios-intelligence-hero.png"],
    },
  };
}

function ListSection({ title, items }: { title: string; items: string[] }) {
  return <article className="industry-detail-list"><h3>{title}</h3><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></article>;
}

export default async function IndustryDetailPage({ params }: { params: Promise<{ industry: string }> }) {
  const { industry: slug } = await params;
  const industry = industryMap[slug];
  if (!industry) notFound();

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: `${industry.name} enterprise intelligence and security solutions`,
        serviceType: `${industry.name} cybersecurity, executive protection, AI governance, and enterprise intelligence`,
        description: industry.summary,
        provider: { "@type": "Organization", name: "Obserra Executive Protection & Intelligence LLC", url: "https://www.obserrallc.com" },
        url: `https://www.obserrallc.com/industries/${industry.slug}`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.obserrallc.com" },
          { "@type": "ListItem", position: 2, name: "Industries", item: "https://www.obserrallc.com/industries" },
          { "@type": "ListItem", position: 3, name: industry.name, item: `https://www.obserrallc.com/industries/${industry.slug}` },
        ],
      },
    ],
  };

  return (
    <main className="industry-page industry-detail-page">
      <section className="industry-detail-hero">
        <div>
          <p className="industry-eyebrow">{industry.shortName.toUpperCase()} SOLUTIONS</p>
          <h1>{industry.name} intelligence, security, and executive decision support.</h1>
          <p>{industry.executiveOverview}</p>
          <div className="industry-actions">
            <Link href={`/contact?interest=enterprise-consultation&industry=${encodeURIComponent(industry.name)}`}>Request industry consultation</Link>
            <Link href="/industries">View all industries</Link>
          </div>
        </div>
        <aside className="industry-detail-summary">
          <article><ShieldCheck size={18} /><strong>{industry.cyberPriorities.length}</strong><span>Cyber priorities</span></article>
          <article><Brain size={18} /><strong>{industry.aiGovernance.length}</strong><span>AI governance priorities</span></article>
          <article><Radar size={18} /><strong>{industry.intelligenceFocus.length}</strong><span>Intelligence domains</span></article>
        </aside>
      </section>

      <section className="industry-detail-grid">
        <ListSection title="Operating pressures" items={industry.operatingPressures} />
        <ListSection title="Regulatory and assurance context" items={industry.regulatoryContext} />
        <ListSection title="Cybersecurity priorities" items={industry.cyberPriorities} />
        <ListSection title="Executive protection considerations" items={industry.protectionConsiderations} />
        <ListSection title="AI governance priorities" items={industry.aiGovernance} />
        <ListSection title="Intelligence focus" items={industry.intelligenceFocus} />
      </section>

      <section className="industry-linked-capabilities">
        <div><p className="industry-eyebrow">CONNECTED OBSERRA CAPABILITIES</p><h2>Move from industry context to governed action.</h2></div>
        <div className="industry-linked-grid">
          <article><ShieldCheck size={20} /><strong>Enterprise services</strong><div>{industry.serviceSlugs.map((slug) => <Link key={slug} href={`/services/${slug}`}>{slug.replaceAll("-", " ")} <ArrowRight size={13} /></Link>)}</div></article>
          <article><Brain size={20} /><strong>EIOS capabilities</strong><div>{industry.eiosCapabilities.map((slug) => <Link key={slug} href={`/eios/${slug}`}>{slug.replaceAll("-", " ")} <ArrowRight size={13} /></Link>)}</div></article>
          <article><GraduationCap size={20} /><strong>Academy pathways</strong><ul>{industry.academyPathways.map((item) => <li key={item}>{item}</li>)}</ul><Link href="/academy/enterprise">Build an enterprise learning plan</Link></article>
          <article><Building2 size={20} /><strong>Trust and assurance</strong><p>Review Obserra security architecture, framework alignment, policies, and procurement pathways.</p><Link href="/trust">Open Trust Center</Link></article>
        </div>
      </section>

      <section className="industry-case-study">
        <div><p className="industry-eyebrow">CASE-STUDY FRAMEWORK</p><h2>A defensible engagement narrative without unsupported client claims.</h2></div>
        <div className="industry-case-grid">
          <article><span>01</span><strong>Operating context</strong><p>Document the business model, critical services, regulatory environment, stakeholders, and decision constraints.</p></article>
          <article><span>02</span><strong>Risk and evidence</strong><p>Correlate cyber, operational, physical, AI, third-party, and governance evidence into one consequence-aware picture.</p></article>
          <article><span>03</span><strong>Executive action</strong><p>Prioritize accountable actions, implementation sequencing, measurable outcomes, and board-ready reporting.</p></article>
        </div>
      </section>

      <section className="industry-cta">
        <div><p className="industry-eyebrow">START WITH THE OPERATING MODEL</p><h2>Scope a {industry.shortName} engagement around the risks that actually matter.</h2><p>Pricing and delivery are based on organizational complexity, urgency, required evidence, and implementation scope.</p></div>
        <Link href={`/contact?interest=enterprise-consultation&industry=${encodeURIComponent(industry.name)}`}>Request consultation</Link>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </main>
  );
}
