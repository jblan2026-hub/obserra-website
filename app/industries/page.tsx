import type { Metadata } from "next";
import Link from "next/link";
import "../commercial-pages.css";

export const metadata: Metadata = {
  title: "Industries | Obserra Executive Intelligence and Cybersecurity",
  description: "Explore Obserra solutions for regulated and high-consequence industries including healthcare, financial services, manufacturing, critical infrastructure, government, and technology.",
  alternates: { canonical: "/industries" },
};

const industries = [
  ["Healthcare and Medical Technology", "Protect connected care, regulated products, sensitive data, and executive decision-making across complex clinical and technology environments."],
  ["Financial Services and Insurance", "Strengthen cyber governance, operational resilience, third-party risk, AI oversight, and board-level accountability."],
  ["Manufacturing and Industrial Operations", "Connect enterprise risk, operational technology, supply-chain exposure, and continuity planning into one decision framework."],
  ["Energy and Critical Infrastructure", "Support high-availability operations with cyber resilience, intelligence, governance, and consequence-aware prioritization."],
  ["Government and Defense", "Improve mission assurance, secure technology adoption, intelligence workflows, and compliance-aligned execution."],
  ["Technology and Cloud Services", "Scale secure products, AI governance, customer assurance, incident readiness, and enterprise risk management."],
];

export default function IndustriesPage() {
  return <main className="commercial-page"><div className="commercial-shell">
    <section className="commercial-hero"><p className="commercial-eyebrow">INDUSTRY SOLUTIONS</p><h1>Enterprise risk intelligence built for the operating environment.</h1><p>Obserra aligns advisory, applications, intelligence, protection, and professional training to the regulatory pressure, operational realities, and decision consequences of each industry.</p></section>
    <section className="commercial-grid">{industries.map(([title, copy]) => <article className="commercial-card" key={title}><span>Industry solution</span><h2>{title}</h2><p>{copy}</p><Link href={`/contact?interest=enterprise-consultation&industry=${encodeURIComponent(title)}`}>Discuss your industry requirements →</Link></article>)}</section>
    <section className="commercial-cta"><div><h2>Build an industry-specific Obserra engagement.</h2><p>Combine executive advisory, applications, Academy training, and intelligence capabilities around your operating model.</p></div><Link href="/contact?interest=enterprise-consultation">Start a confidential conversation</Link></section>
  </div></main>;
}
