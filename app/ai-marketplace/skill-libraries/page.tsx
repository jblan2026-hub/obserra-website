import type { Metadata } from "next";
import Link from "next/link";
import "../marketplace.css";

const levels = [
  { level: "Beginner", count: 3140, standard: "Start with clear, guided skills designed to build confidence and practical understanding.", categories: "Engineering, security, privacy, governance, executive protection, education, accessibility, resilience, and operations design." },
  { level: "Intermediate", count: 3090, standard: "Build on the fundamentals with skills for multi-step projects and day-to-day team workflows.", categories: "Applications, learning, video, marketplace operations, cloud, platform, data, and service design." },
  { level: "Expert", count: 3090, standard: "Take on complex challenges with skills designed for experienced practitioners and team leaders.", categories: "Identity, payments, enrollment, service delivery, incident response, compliance, and intelligence operations." },
  { level: "Advanced", count: 2000, standard: "Explore specialized skills for strategic, high-consequence, and regulated environments.", categories: "Credentialing, licensing, protective mobility, intelligence collection, broadcast, publishing, membership, emergency, and regulated operations." },
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
    <section className="ai-marketplace__hero"><p>OBSERRA EPI SKILL LIBRARIES</p><h1>11,320 capability skills, organized by level and operating category.</h1><p className="ai-marketplace__notice">Explore the collections below, then contact our team to discuss the best library for your goals.</p></section>
    <section className="ai-marketplace__catalog" aria-label="Obserra EPI skill levels">
      <section><header><p>LEVEL COLLECTIONS</p><h2>Choose the right depth for your goals.</h2></header><div className="ai-marketplace__grid">{levels.map((item) => <article key={item.level}><span>{item.level.toUpperCase()}</span><h3>{item.count.toLocaleString()} skills</h3><p>{item.standard}</p><small><b>Categories:</b> {item.categories}</small><footer><strong>Available by request</strong><Link href={`/contact?interest=ai-skills-library&level=${item.level.toLowerCase()}`}>Ask about {item.level.toLowerCase()} skills →</Link></footer></article>)}</div></section>
      <section><header><p>SKILL PACKAGES</p><h2>Four curated libraries for individuals and teams.</h2></header><div className="ai-marketplace__grid">{packages.map((item) => <article key={item.name}><span>{item.coverage}</span><h3>{item.name}</h3><p>{item.skills.toLocaleString()} capability skills across {item.domains} operating domains.</p><small>Organized by level and category to make the right skills easier to find.</small><footer><strong>For individuals and teams</strong><Link href={`/contact?interest=ai-skills-package&package=${encodeURIComponent(item.name)}`}>Talk with our team →</Link></footer></article>)}</div></section>
    </section>
  </main>;
}
