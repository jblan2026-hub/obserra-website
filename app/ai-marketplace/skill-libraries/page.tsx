import type { Metadata } from "next";
import Link from "next/link";
import "../marketplace.css";

const levels = [
  { level: "Beginner", count: 3140, standard: "Foundational, documented capabilities with clear scope, user journey, and evidence expectations.", categories: "Engineering, security, privacy, governance, executive protection, education, accessibility, resilience, and operational design." },
  { level: "Intermediate", count: 3090, standard: "Role-aware workflows with tested integrations, durable records, error handling, and operational ownership.", categories: "Applications, Academy/LMS, video learning, marketplace operations, cloud, platform, data, and service design." },
  { level: "Expert", count: 3090, standard: "High-assurance controls with threat modeling, auditability, privacy, resilience, authorization, and performance evidence.", categories: "Identity, payments, enrollment, secure APIs, protected delivery, incident response, compliance, and intelligence operations." },
  { level: "Advanced", count: 2000, standard: "Governed, adversarially tested, measurable capability patterns for high-consequence operations.", categories: "Credentialing, licensing, protective mobility, intelligence collection, broadcast, publishing, membership, emergency, and regulated operations." },
];

const packages = [
  { name: "Obserra EPI AI Agent Capability Skills Repository", skills: 2160, coverage: "Beginner · Intermediate · Expert", domains: 24 },
  { name: "Set 2 Add-ons", skills: 2160, coverage: "Beginner · Intermediate · Expert", domains: 24 },
  { name: "Set 3 Final Add-ons", skills: 5000, coverage: "Beginner · Intermediate · Expert", domains: 50 },
  { name: "Set 4 Advanced", skills: 2000, coverage: "Advanced", domains: 40 },
];

export const metadata: Metadata = {
  title: "Obserra EPI Skill Libraries | Beginner to Advanced",
  description: "Browse Obserra EPI AI capability skill packages by proficiency level and operating category.",
  alternates: { canonical: "/ai-marketplace/skill-libraries" },
};

export default function SkillLibrariesPage() {
  return <main className="ai-marketplace">
    <header className="ai-marketplace__nav"><Link href="/">OBSERRA EPI</Link><nav><Link href="/ai-marketplace">Marketplace</Link><Link href="/apps">Applications</Link><Link href="/academy">Academy</Link></nav></header>
    <section className="ai-marketplace__hero"><p>OBSERRA EPI SKILL LIBRARIES</p><h1>11,320 capability skills, organized first by level and then by operating category.</h1><p className="ai-marketplace__notice">These are versioned package inventories. Product delivery and download entitlement remain governed until live commerce health is operational.</p></section>
    <section className="ai-marketplace__catalog" aria-label="Obserra EPI skill levels">
      <section><header><p>LEVEL COLLECTIONS</p><h2>Choose the required depth of capability.</h2></header><div className="ai-marketplace__grid">{levels.map((item) => <article key={item.level}><span>{item.level.toUpperCase()}</span><h3>{item.count.toLocaleString()} skills</h3><p>{item.standard}</p><small><b>Categories:</b> {item.categories}</small><footer><strong>Package access governed</strong><Link href={`/contact?interest=ai-skills-library&level=${item.level.toLowerCase()}`}>Request package access →</Link></footer></article>)}</div></section>
      <section><header><p>SOURCE PACKAGES</p><h2>Four complete, versioned library packages.</h2></header><div className="ai-marketplace__grid">{packages.map((item) => <article key={item.name}><span>{item.coverage}</span><h3>{item.name}</h3><p>{item.skills.toLocaleString()} capability skills across {item.domains} operating domains.</p><small>Catalogued, levelled, and mapped to the governed marketplace admission gate.</small><footer><strong>Version 1.0.0</strong><Link href={`/contact?interest=ai-skills-package&package=${encodeURIComponent(item.name)}`}>Request package access →</Link></footer></article>)}</div></section>
    </section>
  </main>;
}
