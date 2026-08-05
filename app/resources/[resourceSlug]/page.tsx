import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, CircleHelp, Sparkles } from "lucide-react";
import { resourceCatalog, resourceMap } from "../resourceData";
import "../resources.css";

export async function generateStaticParams() {
  return resourceCatalog.map((resource) => ({ resourceSlug: resource.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ resourceSlug: string }> }): Promise<Metadata> {
  const { resourceSlug } = await params;
  const resource = resourceMap[resourceSlug];
  if (!resource) return {};
  return {
    title: `${resource.title} | Obserra Resources`,
    description: resource.summary,
    alternates: { canonical: `/resources/${resource.slug}` },
    openGraph: {
      title: `${resource.title} | Obserra Resources`,
      description: resource.summary,
      url: `https://www.obserrallc.com/resources/${resource.slug}`,
      type: "article",
      images: [{ url: "/brand/visuals/obserra-eios-intelligence-hero.png", width: 1344, height: 768, alt: resource.title }],
    },
  };
}

export default async function ResourceDetailPage({ params }: { params: Promise<{ resourceSlug: string }> }) {
  const { resourceSlug } = await params;
  const resource = resourceMap[resourceSlug];
  if (!resource) notFound();

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: resource.title,
        description: resource.summary,
        dateModified: "2026-08-05",
        author: { "@type": "Organization", name: "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC" },
        publisher: { "@type": "Organization", name: "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC", url: "https://www.obserrallc.com" },
        mainEntityOfPage: `https://www.obserrallc.com/resources/${resource.slug}`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.obserrallc.com" },
          { "@type": "ListItem", position: 2, name: "Resources", item: "https://www.obserrallc.com/resources" },
          { "@type": "ListItem", position: 3, name: resource.title, item: `https://www.obserrallc.com/resources/${resource.slug}` },
        ],
      },
    ],
  };

  return (
    <main className="resources-page resource-detail-page">
      <section className="resource-detail-hero">
        <Link href="/resources" className="resource-back"><ArrowLeft size={15} /> Back to Resources Center</Link>
        <p className="resources-eyebrow">{resource.type.toUpperCase()} · {resource.topic.toUpperCase()}</p>
        <h1>{resource.title}</h1>
        <p>{resource.summary}</p>
        <div className="resource-detail-meta"><span>{resource.audience}</span><span>{resource.readTime}</span><span>Updated {resource.updated}</span></div>
      </section>

      <section className="resource-detail-layout">
        <article className="resource-detail-main">
          <section>
            <p className="resources-eyebrow">EXECUTIVE SUMMARY</p>
            <h2>What leadership should understand now.</h2>
            <p>{resource.executiveSummary}</p>
          </section>

          <section>
            <p className="resources-eyebrow">DECISION QUESTIONS</p>
            <h2>Questions that should shape the discussion.</h2>
            <div className="resource-question-grid">
              {resource.keyQuestions.map((question) => <article key={question}><CircleHelp size={18} /><p>{question}</p></article>)}
            </div>
          </section>

          <section>
            <p className="resources-eyebrow">RECOMMENDED ACTIONS</p>
            <h2>Move from awareness into a governed action path.</h2>
            <div className="resource-action-list">
              {resource.recommendedActions.map((action, index) => <article key={action}><span>0{index + 1}</span><div><CheckCircle2 size={18} /><p>{action}</p></div></article>)}
            </div>
          </section>
        </article>

        <aside className="resource-detail-aside">
          <p className="resources-eyebrow">RELATED OBSERRA PATHWAYS</p>
          <h2>Continue from guidance into action.</h2>
          <div>
            {resource.relatedLinks.map((link) => <Link key={link.href} href={link.href}>{link.label}<ArrowRight size={14} /></Link>)}
          </div>
          <article><Sparkles size={18} /><strong>Need a tailored briefing?</strong><p>Bring the decision context, affected business area, and intended audience into a confidential executive consultation.</p><Link href={`/contact?interest=executive-briefing&resource=${encodeURIComponent(resource.title)}`}>Request briefing <ArrowRight size={14} /></Link></article>
        </aside>
      </section>

      <section className="resources-cta resource-detail-cta">
        <div><p className="resources-eyebrow">NEXT DECISION</p><h2>Use this resource as the start of a controlled executive conversation.</h2><p>Obserra can help translate the issue into scope, decision rights, evidence needs, and an actionable implementation path.</p></div>
        <div><Link className="resources-button" href={`/contact?interest=enterprise-consultation&resource=${encodeURIComponent(resource.title)}`}>Discuss this resource</Link><Link className="resources-outline" href="/resources">Browse all resources</Link></div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </main>
  );
}
