import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { trustPolicies, trustPolicyMap } from "../policies";
import { LEGAL_ENTITY_NAME } from "@/lib/legal-identity";
import "../trust.css";

export async function generateStaticParams() {
  return trustPolicies.map((policy) => ({ slug: policy.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const policy = trustPolicyMap[slug];
  if (!policy) return {};
  return {
    title: `${policy.title} | ${LEGAL_ENTITY_NAME} Trust Center`,
    description: policy.description,
    alternates: { canonical: `/trust/${policy.slug}` },
    openGraph: {
      title: `${policy.title} | ${LEGAL_ENTITY_NAME} Trust Center`,
      description: policy.description,
      url: `https://www.obserrallc.com/trust/${policy.slug}`,
      type: "article",
      images: [{ url: "/brand/visuals/obserra-cybersecurity.png", width: 1344, height: 768, alt: `${LEGAL_ENTITY_NAME} Trust Policy: ${policy.title}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${policy.title} | ${LEGAL_ENTITY_NAME} Trust Center`,
      description: policy.description,
      images: ["/brand/visuals/obserra-cybersecurity.png"],
    },
  };
}

export default async function TrustPolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const policy = trustPolicyMap[slug];
  if (!policy) notFound();

  return (
    <main className="trust-page">
      <div className="trust-wrap">
        <p className="trust-eyebrow">{LEGAL_ENTITY_NAME} TRUST CENTER</p>
        <h1>{policy.title}</h1>
        <p className="trust-lead">{policy.summary}</p>

        <div className="trust-policy">
          {policy.sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              <ul>
                {section.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <Link href="/trust" className="trust-return">Back to Trust Center</Link>
      </div>
    </main>
  );
}
