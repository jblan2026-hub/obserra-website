"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, BriefcaseBusiness, Building2, Cloud, Filter, Landmark, LockKeyhole, Search, Server, ShieldCheck, Sparkles } from "lucide-react";
import { ACADEMY_BRAND_NAME, APPLICATIONS_BRAND_NAME, EIOS_BRAND_NAME, LEGAL_ENTITY_NAME } from "../../lib/legal-identity";
import type { AppCategory, AppStatus, MarketplaceApp } from "./appsData";
import { appCategories, marketplaceApps } from "./appsData";

const statuses: (AppStatus | "All")[] = ["All", "Available", "Pilot", "Coming Soon"];

type Props = {
  initialCategory?: AppCategory | "All";
};

const statusToneClass: Record<AppStatus, string> = {
  Available: "status-available",
  Pilot: "status-pilot",
  "Coming Soon": "status-coming",
};

const deploymentEditions = [
  {
    icon: Cloud,
    title: "Obserra Cloud",
    label: "Enterprise SaaS",
    copy: "Managed cloud delivery with continuous updates, enterprise SSO, governed tenant isolation, and accelerated time to value.",
    points: ["Annual subscription", "Automatic updates", "Enterprise identity integration"],
  },
  {
    icon: Building2,
    title: "Private Cloud",
    label: "Dedicated environment",
    copy: "Dedicated deployment in an approved cloud environment with customer-controlled networking, identity, and integration boundaries.",
    points: ["AWS, Azure, or GCP", "Dedicated tenancy", "Customer-controlled network model"],
  },
  {
    icon: Server,
    title: "Enterprise On Premises",
    label: "Customer-hosted",
    copy: "Customer-controlled deployment for highly regulated, sovereign, disconnected, and air-gapped operating environments.",
    points: ["Data-center deployment", "Offline or restricted operation", "Enterprise support model"],
  },
  {
    icon: Landmark,
    title: "Government Edition",
    label: "Public-sector ready",
    copy: "Government-oriented deployment and assurance path for agencies, defense organizations, and critical public missions.",
    points: ["Hardened configuration", "Procurement support", "Mission-specific deployment planning"],
  },
];

const buyerPaths = [
  ["Executive and Board", "Decision intelligence, risk visibility, board reporting, and accountable enterprise action.", "/apps/obserra-eios"],
  ["CISO and Security", "Cyber risk, control evidence, vulnerability prioritization, and security governance.", "/apps?category=Cybersecurity"],
  ["AI Governance", "Model inventory, policy oversight, approval workflows, and auditable AI controls.", "/apps/obserra-ai-governance-suite"],
  ["Protection and Intelligence", "Executive exposure, protective intelligence, travel risk, and threat context.", "/apps/obserra-executive-exposure-monitor"],
];

export default function AppsMarketplaceClient({ initialCategory = "All" }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<AppCategory | "All">(initialCategory);
  const [status, setStatus] = useState<AppStatus | "All">("All");

  const flagshipApps = useMemo(() => marketplaceApps.slice(0, 4), []);

  const visibleApps = useMemo(() => {
    return marketplaceApps.filter((entry) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        q.length === 0 ||
        entry.name.toLowerCase().includes(q) ||
        entry.value.toLowerCase().includes(q) ||
        entry.features.some((feature) => feature.toLowerCase().includes(q));
      const matchesCategory = category === "All" || entry.category === category;
      const matchesStatus = status === "All" || entry.status === status;
      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [category, query, status]);

  return (
    <main className="apps-page">
      <header className="apps-nav">
        <Link href="/" className="apps-brand" aria-label={LEGAL_ENTITY_NAME}>
          <Image src="/brand/obserra-logo.png" alt={LEGAL_ENTITY_NAME} width={286} height={55} />
          <span>{APPLICATIONS_BRAND_NAME.toUpperCase()}</span>
        </Link>
        <nav aria-label={`${APPLICATIONS_BRAND_NAME} navigation`}>
          <Link href="/">Home</Link>
          <Link href="/services">Services</Link>
          <Link href="/protection-intelligence">Protection</Link>
          <Link href="/industries">Industries</Link>
          <Link href="/eios">{EIOS_BRAND_NAME}</Link>
          <Link href="/academy">{ACADEMY_BRAND_NAME}</Link>
          <Link href="/resources">Resources</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/contact?interest=application-demo" className="apps-nav-cta">Schedule demo</Link>
        </nav>
      </header>

      <section className="apps-hero">
        <div>
          <p className="apps-eyebrow">{APPLICATIONS_BRAND_NAME.toUpperCase()}</p>
          <h1>Purpose-built applications for enterprise risk, governance, intelligence, and accountable execution.</h1>
          <p>
            Explore commercial solutions that help leaders convert fragmented information into defensible decisions,
            governed workflows, measurable risk reduction, and executive-ready evidence. Available solutions can be
            evaluated now; pilot and roadmap offerings are clearly identified before a buyer commits.
          </p>
          <div className="apps-actions">
            <Link href="/contact?interest=application-demo" className="apps-button">Request enterprise demo</Link>
            <Link href="/contact?interest=capability-review" className="apps-outline">Book product advisory call</Link>
          </div>
        </div>
        <aside>
          <p><BadgeCheck size={16} /> Commercial use cases aligned to measurable enterprise outcomes</p>
          <p><Sparkles size={16} /> Governed AI capabilities aligned to policy, audit, and risk controls</p>
          <p><BriefcaseBusiness size={16} /> Deployment planning designed for regulated and security-conscious organizations</p>
          <p><LockKeyhole size={16} /> SaaS, private cloud, on-premises, and government deployment pathways</p>
        </aside>
      </section>

      <section className="apps-buyer-paths" aria-label="Buyer pathways">
        <div className="apps-spotlight-heading">
          <p className="apps-eyebrow">START WITH YOUR BUSINESS PRIORITY</p>
          <h2>Find the right product family by executive outcome.</h2>
          <p>Each pathway connects business priorities to available applications, implementation options, and the right next conversation.</p>
        </div>
        <div className="apps-buyer-grid">
          {buyerPaths.map(([title, copy, href]) => (
            <Link key={title} href={href} className="apps-buyer-card">
              <span>{title}</span>
              <p>{copy}</p>
              <strong>Explore solutions <ArrowRight size={15} /></strong>
            </Link>
          ))}
        </div>
      </section>

      <section className="apps-spotlight" aria-label="Flagship applications">
        <div className="apps-spotlight-heading">
          <p className="apps-eyebrow">FLAGSHIP APPLICATIONS</p>
          <h2>Start with the solutions most relevant to executive and operational buyers.</h2>
          <p>Open any product brief to review the business problem, capabilities, deployment model, and next step.</p>
        </div>
        <div className="apps-spotlight-grid">
          {flagshipApps.map((entry) => (
            <Link key={entry.slug} href={`/apps/${entry.slug}`} className="apps-card-link" aria-label={`View ${entry.name}`}>
              <article className="apps-spotlight-card">
                <span className={`status-pill ${statusToneClass[entry.status]}`}>{entry.status}</span>
                <h3>{entry.name}</h3>
                <p>{entry.value}</p>
                <strong>Open product brief <ArrowRight size={15} /></strong>
              </article>
            </Link>
          ))}
        </div>
      </section>

      <section className="apps-deployment" aria-label="Deployment editions">
        <div className="apps-deployment-heading">
          <p className="apps-eyebrow">DEPLOYMENT AND LICENSING</p>
          <h2>Choose the operating model that fits your security, regulatory, and mission requirements.</h2>
          <p>Deployment options include cloud, dedicated, customer-hosted, and government-oriented pathways. Final scope, licensing, support, and implementation are confirmed during solution design.</p>
        </div>
        <div className="apps-deployment-grid">
          {deploymentEditions.map(({ icon: Icon, title, label, copy, points }) => (
            <article key={title}>
              <div className="apps-deployment-icon"><Icon size={22} /></div>
              <small>{label}</small>
              <h3>{title}</h3>
              <p>{copy}</p>
              <ul>{points.map((point) => <li key={point}>{point}</li>)}</ul>
            </article>
          ))}
        </div>
        <div className="apps-actions">
          <Link href="/contact?interest=enterprise-licensing" className="apps-button">Request enterprise licensing</Link>
          <Link href="/trust" className="apps-outline">Review security and trust</Link>
        </div>
      </section>

      <section className="apps-assurance" aria-label="Commercial assurance">
        <article><ShieldCheck size={20} /><div><strong>Secure by design</strong><p>Identity, least privilege, auditability, encryption, monitoring, and governed administration are treated as foundational requirements.</p></div></article>
        <article><BadgeCheck size={20} /><div><strong>Executive and technical depth</strong><p>Board-ready summaries are supported by control-level evidence, implementation detail, and technical exports.</p></div></article>
        <article><BriefcaseBusiness size={20} /><div><strong>Commercial implementation support</strong><p>Solution design, integration planning, deployment governance, and adoption support are available through {LEGAL_ENTITY_NAME} services.</p></div></article>
      </section>

      <section className="apps-filter-wrap" aria-label="Filter applications">
        <label className="apps-search">
          <Search size={16} />
          <input
            aria-label="Search applications"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by product, workflow, or business need"
          />
        </label>
        <div className="apps-filters">
          <p><Filter size={16} /> Category</p>
          <div>
            {["All", ...appCategories].map((item) => (
              <button key={item} type="button" className={category === item ? "active" : ""} onClick={() => setCategory(item as AppCategory | "All")}>
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="apps-filters">
          <p><Filter size={16} /> Status</p>
          <div>
            {statuses.map((item) => (
              <button key={item} type="button" className={status === item ? "active" : ""} onClick={() => setStatus(item)}>
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="apps-results" aria-live="polite">
        <p>{visibleApps.length} product{visibleApps.length === 1 ? "" : "s"} matched to your filters</p>
        <div className="apps-grid">
          {visibleApps.map((entry, index) => (
            <motion.div
              key={entry.slug}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.02, duration: 0.28 }}
            >
              <Link href={`/apps/${entry.slug}`} className="apps-card-link" aria-label={`Open commercial product brief for ${entry.name}`}>
                <article>
                  <header>
                    <span className={`status-pill ${statusToneClass[entry.status]}`}>{entry.status}</span>
                    <small>{entry.category}</small>
                  </header>
                  <h2>{entry.name}</h2>
                  <p>{entry.value}</p>
                  <ul>
                    {entry.features.slice(0, 3).map((feature) => <li key={feature}>{feature}</li>)}
                  </ul>
                  <footer><strong>Open commercial product brief <ArrowRight size={15} /></strong></footer>
                </article>
              </Link>
            </motion.div>
          ))}
        </div>
        {visibleApps.length === 0 && (
          <div className="apps-empty">
            <h2>No products match those filters.</h2>
            <p>Reset the filters or speak with {LEGAL_ENTITY_NAME} about the business outcome you need.</p>
            <button type="button" onClick={() => { setQuery(""); setCategory("All"); setStatus("All"); }}>Reset filters</button>
            <Link href="/contact?interest=application-demo">Talk with a product advisor</Link>
          </div>
        )}
      </section>

      <section className="apps-commercial-cta">
        <div>
          <p className="apps-eyebrow">ENTERPRISE PROCUREMENT</p>
          <h2>Compare products, deployment editions, and implementation options with an {APPLICATIONS_BRAND_NAME} product advisor.</h2>
          <p>Enterprise, government, and custom licensing are scoped around organizational size, deployment model, integrations, assurance requirements, and support needs.</p>
        </div>
        <div className="apps-actions">
          <Link href="/contact?interest=enterprise-quote" className="apps-button">Request enterprise quote</Link>
          <Link href="/contact?interest=application-demo" className="apps-outline">Schedule product demonstration</Link>
        </div>
      </section>
    </main>
  );
}

export function ProductInfoSections({ entry }: { entry: MarketplaceApp }) {
  return (
    <>
      <section className="app-detail-grid">
        <article><h2>Key features</h2><ul>{entry.features.map((feature) => <li key={feature}>{feature}</li>)}</ul></article>
        <article><h2>Supported integrations</h2><ul>{entry.integrations.map((integration) => <li key={integration}>{integration}</li>)}</ul></article>
        <article><h2>Deployment model</h2><ul>{entry.deployment.map((model) => <li key={model}>{model}</li>)}</ul></article>
      </section>

      <section className="app-docs">
        <div><h2>Implementation assets aligned to {APPLICATIONS_BRAND_NAME} delivery</h2><ul>{entry.documentation.map((item) => <li key={item}>{item}</li>)}</ul></div>
        <div><h2>FAQ</h2>{entry.faq.map((item) => <article key={item.q}><h3>{item.q}</h3><p>{item.a}</p></article>)}</div>
      </section>

    </>
  );
}

