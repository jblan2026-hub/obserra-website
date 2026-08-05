import type { Metadata } from "next";
import Link from "next/link";
import "../commercial-pages.css";

export const metadata: Metadata = {
  title: "Resources | Executive Cybersecurity and Intelligence Guidance",
  description: "Explore Obserra executive resources across cybersecurity, AI governance, protective intelligence, enterprise risk, leadership, and professional training.",
  alternates: { canonical: "/resources" },
};

const resources = [
  ["Executive Cybersecurity", "Board-ready guidance for connecting cyber exposure, enterprise value, accountability, and investment decisions.", "/services"],
  ["AI Governance", "Practical direction for governing enterprise AI adoption, model use, accountability, risk, and human oversight.", "/apps/obserra-ai-governance-suite"],
  ["Enterprise Intelligence", "Explore how Obserra EIOS connects evidence, decisions, approvals, actions, and measurable outcomes.", "/eios"],
  ["Protective Intelligence", "Understand executive exposure, travel risk, threat context, and proportionate protection planning.", "/protection-intelligence"],
  ["Professional Training", "Browse self-paced courses designed for cybersecurity, protection, intelligence, and technology leaders.", "/academy"],
  ["Trust and Procurement", "Review Obserra security, privacy, data-handling, licensing, accessibility, and buyer-protection disclosures.", "/trust"],
];

export default function ResourcesPage() {
  return <main className="commercial-page"><div className="commercial-shell">
    <section className="commercial-hero"><p className="commercial-eyebrow">EXECUTIVE RESOURCES</p><h1>Practical guidance for decisions that carry enterprise consequences.</h1><p>Use Obserra resources to evaluate risk, strengthen governance, develop leaders, and identify the right service, application, or training path for your organization.</p></section>
    <section className="commercial-grid">{resources.map(([title, copy, href]) => <article className="commercial-card" key={title}><span>Obserra insight</span><h2>{title}</h2><p>{copy}</p><Link href={href}>Explore this resource →</Link></article>)}</section>
    <section className="commercial-cta"><div><h2>Need guidance tailored to your organization?</h2><p>Obserrian can help you navigate the site, or you can begin a confidential enterprise conversation.</p></div><Link href="/contact?interest=enterprise-consultation">Contact Obserra</Link></section>
  </div></main>;
}
