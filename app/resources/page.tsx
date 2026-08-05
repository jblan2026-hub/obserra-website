import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Brain, BriefcaseBusiness, ClipboardCheck, Filter, Search, ShieldCheck, Sparkles } from "lucide-react";
import { resourceCatalog, resourceTopics, resourceTypes } from "./resourceData";
import "./resources.css";

export const metadata: Metadata = {
  title: "Executive Resources & Intelligence Center | Obserra",
  description: "Executive briefings, playbooks, checklists, framework guides, and intelligence updates across cybersecurity, AI governance, protection, risk, and enterprise intelligence.",
  alternates: { canonical: "/resources" },
  openGraph: {
    title: "Executive Resources & Intelligence Center | Obserra",
    description: "Board-ready guidance and practical intelligence for enterprise decision-makers.",
    url: "https://www.obserrallc.com/resources",
    type: "website",
    images: [{ url: "/brand/visuals/obserra-eios-intelligence-hero.png", width: 1344, height: 768, alt: "Obserra Executive Resources and Intelligence Center" }],
  },
};

const typeIcon = {
  "Executive Brief": BriefcaseBusiness,
  Playbook: BookOpen,
  Checklist: ClipboardCheck,
  "Framework Guide": ShieldCheck,
  "Intelligence Update": Brain,
  "Board Briefing": Sparkles,
};

export default function ResourcesPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: "Obserra Executive Resources & Intelligence Center",
        url: "https://www.obserrallc.com/resources",
        description: "Executive briefings, playbooks, checklists, framework guides, and intelligence updates.",
        hasPart: resourceCatalog.map((resource) => ({ "@type": "CreativeWork", name: resource.title, url: `https://www.obserrallc.com/resources/${resource.slug}` })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.obserrallc.com" },
          { "@type": "ListItem", position: 2, name: "Resources", item: "https://www.obserrallc.com/resources" },
        ],
      },
    ],
  };

  return (
    <main className="resources-page">
      <section className="resources-hero">
        <div>
          <p className="resources-eyebrow">EXECUTIVE RESOURCES &amp; INTELLIGENCE CENTER</p>
          <h1>Practical intelligence for decisions that carry enterprise consequences.</h1>
          <p>Use Obserra briefings, playbooks, checklists, and framework guides to clarify risk, improve governance, strengthen readiness, and identify the right service or platform path.</p>
          <div className="resources-actions">
            <a className="resources-button" href="#resource-library">Explore the library</a>
            <Link className="resources-outline" href="/contact?interest=enterprise-consultation">Request an executive briefing</Link>
          </div>
        </div>
        <aside>
          <span><Sparkles size={16} /> Board-ready decision framing</span>
          <span><Brain size={16} /> Cross-domain intelligence context</span>
          <span><ShieldCheck size={16} /> Evidence-aware governance guidance</span>
        </aside>
      </section>

      <section className="resources-summary">
        <article><strong>{resourceCatalog.length}</strong><span>curated executive resources</span></article>
        <article><strong>{resourceTopics.length}</strong><span>decision topics</span></article>
        <article><strong>{resourceTypes.length}</strong><span>resource formats</span></article>
        <article><strong>0</strong><span>unsupported customer claims</span></article>
      </section>

      <section className="resources-discovery" aria-label="Resource discovery controls">
        <div><Search size={17} /><span>Search-ready catalog architecture</span></div>
        <div><Filter size={17} /><span>Topic, type, industry, and audience filters</span></div>
        <div><ArrowRight size={17} /><span>Cross-links to Services, Industries, EIOS, Academy, and Trust</span></div>
      </section>

      <section id="resource-library" className="resources-library">
        <div className="resources-section-heading">
          <p className="resources-eyebrow">CURATED LIBRARY</p>
          <h2>Executive resources organized for action, not passive reading.</h2>
          <p>Each resource includes an executive summary, decision questions, recommended actions, and direct pathways into Obserra services and platforms.</p>
        </div>
        <div className="resources-grid">
          {resourceCatalog.map((resource) => {
            const Icon = typeIcon[resource.type];
            return (
              <article key={resource.slug}>
                <header><span><Icon size={15} /> {resource.type}</span><small>{resource.readTime}</small></header>
                <p className="resources-topic">{resource.topic} · {resource.industry}</p>
                <h2>{resource.title}</h2>
                <p>{resource.summary}</p>
                <footer><span>{resource.audience}</span><Link href={`/resources/${resource.slug}`}>Open resource <ArrowRight size={14} /></Link></footer>
              </article>
            );
          })}
        </div>
      </section>

      <section className="resources-intelligence">
        <div>
          <p className="resources-eyebrow">INTELLIGENCE OPERATING MODEL</p>
          <h2>Turn information into a governed executive decision path.</h2>
          <p>The Resources Center is designed to connect external developments, internal evidence, industry context, and leadership decisions without presenting unverified claims as established facts.</p>
        </div>
        <div className="resources-intelligence-grid">
          <article><span>01</span><strong>Observe</strong><p>Identify relevant signals, evidence, and changes.</p></article>
          <article><span>02</span><strong>Interpret</strong><p>Translate information into enterprise consequence and confidence.</p></article>
          <article><span>03</span><strong>Decide</strong><p>Clarify authority, options, tradeoffs, and recommended action.</p></article>
          <article><span>04</span><strong>Act</strong><p>Connect the decision to services, workflows, platforms, and measurable outcomes.</p></article>
        </div>
      </section>

      <section className="resources-pathways">
        <article><p>Enterprise Services</p><h2>Move from guidance into scoped advisory or execution.</h2><Link href="/services">Explore services <ArrowRight size={15} /></Link></article>
        <article><p>Industry Solutions</p><h2>Apply the guidance to your operating and regulatory environment.</h2><Link href="/industries">Explore industries <ArrowRight size={15} /></Link></article>
        <article><p>Executive Intelligence</p><h2>Connect evidence, decisions, actions, and outcomes through EIOS.</h2><Link href="/eios">Explore EIOS <ArrowRight size={15} /></Link></article>
      </section>

      <section className="resources-cta">
        <div><p className="resources-eyebrow">TAILORED EXECUTIVE BRIEFING</p><h2>Bring your highest-consequence decision into a controlled briefing process.</h2><p>Share the issue, affected business area, timeline, and decision audience. Obserra will respond with the appropriate consultation or resource pathway.</p></div>
        <div><Link className="resources-button" href="/contact?interest=executive-briefing">Request executive briefing</Link><Link className="resources-outline" href="/trust">Review Trust Center</Link></div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </main>
  );
}
