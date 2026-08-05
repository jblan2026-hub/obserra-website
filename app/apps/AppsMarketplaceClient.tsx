"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, BriefcaseBusiness, Filter, Search, Sparkles } from "lucide-react";
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

const enterpriseVisuals = [
  { src: "/eios/eios-overview-marketing.png", alt: "Executive overview dashboard" },
  { src: "/eios/eios-situation-room-marketing.png", alt: "Enterprise situation room dashboard" },
  { src: "/eios/eios-asset-intelligence-marketing.png", alt: "Asset intelligence dashboard" },
  { src: "/eios/eios-report-center-marketing.png", alt: "Evidence and reporting dashboard" },
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
        <Link href="/" className="apps-brand" aria-label="Obserra home">
          <Image src="/brand/obserra-logo.png" alt="Obserra Executive Protection and Intelligence LLC" width={286} height={55} />
          <span>APPLICATIONS</span>
        </Link>
        <nav aria-label="Applications navigation">
          <Link href="/">Home</Link>
          <Link href="/services">Services</Link>
          <Link href="/protection-intelligence">Protection</Link>
          <Link href="/industries">Industries</Link>
          <Link href="/eios">EIOS</Link>
          <Link href="/academy">Academy</Link>
          <Link href="/resources">Resources</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/contact?interest=application-demo" className="apps-nav-cta">Schedule demo</Link>
        </nav>
      </header>

      <section className="apps-hero">
        <div>
          <p className="apps-eyebrow">OBSERRA ENTERPRISE APPLICATIONS</p>
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
        </aside>
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
            <p>Reset the filters or speak with Obserra about the business outcome you need.</p>
            <button type="button" onClick={() => { setQuery(""); setCategory("All"); setStatus("All"); }}>Reset filters</button>
            <Link href="/contact?interest=application-demo">Talk with a product advisor</Link>
          </div>
        )}
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
        <div><h2>Implementation assets aligned to Obserra delivery</h2><ul>{entry.documentation.map((item) => <li key={item}>{item}</li>)}</ul></div>
        <div><h2>FAQ</h2>{entry.faq.map((item) => <article key={item.q}><h3>{item.q}</h3><p>{item.a}</p></article>)}</div>
      </section>

      <section className="app-screenshot-placeholder">
        <h2>Product visuals and architecture narrative</h2>
        <p>Qualified briefings connect product visuals, deployment models, security boundaries, and implementation planning to the buyer&apos;s active priorities.</p>
        <div className="app-visual-grid">
          {enterpriseVisuals.map((visual) => (
            <figure key={visual.src} className="app-visual-card">
              <Image src={visual.src} alt={visual.alt} fill sizes="(max-width: 900px) 100vw, 25vw" />
              <figcaption>{visual.alt}</figcaption>
            </figure>
          ))}
        </div>
        <div className="apps-actions">
          <Link href={`/contact?interest=application-demo&product=${encodeURIComponent(entry.name)}`} className="apps-button">Request a tailored demo</Link>
          <Link href="/trust" className="apps-outline">Review Trust Center</Link>
        </div>
      </section>
    </>
  );
}
