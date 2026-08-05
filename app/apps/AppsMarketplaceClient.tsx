"use client";

import Image from "next/image";
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
  "Coming Soon": "status-coming"
};

export default function AppsMarketplaceClient({ initialCategory = "All" }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<AppCategory | "All">(initialCategory);
  const [status, setStatus] = useState<AppStatus | "All">("All");

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
        <a href="/" className="apps-brand" aria-label="Obserra home">
          <Image src="/brand/obserra-logo.png" alt="Obserra Executive Protection and Intelligence LLC" width={286} height={55} />
          <span>APPLICATIONS</span>
        </a>
        <nav aria-label="Applications navigation">
          <a href="/">Home</a>
          <a href="/services">Services</a>
          <a href="/eios">EIOS</a>
          <a href="/academy">Academy</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
          <a href="mailto:info@obserrallc.com?subject=Obserra%20Applications%20Demo" className="apps-nav-cta">Schedule demo</a>
        </nav>
      </header>

      <section className="apps-hero">
        <div>
          <p className="apps-eyebrow">OBSERRA ENTERPRISE APPLICATION MARKETPLACE</p>
          <h1>Enterprise software for cyber risk, executive protection, intelligence, and AI governance.</h1>
          <p>
            Evaluate production and pilot-ready Obserra products built for regulated environments,
            high-consequence operations, and executive accountability. Solutions labeled Coming Soon
            are roadmap offerings and are not currently purchasable for production use.
          </p>
          <div className="apps-actions">
            <a href="mailto:info@obserrallc.com?subject=Request%20Obserra%20Enterprise%20Demo" className="apps-button">Request enterprise demo</a>
            <a href="mailto:info@obserrallc.com?subject=Obserra%20Product%20Advisory%20Call" className="apps-outline">Speak with product advisor</a>
          </div>
        </div>
        <aside>
          <p><BadgeCheck size={16} /> Clear production, pilot, and roadmap status on every product</p>
          <p><Sparkles size={16} /> Governed AI capabilities aligned to policy and risk controls</p>
          <p><BriefcaseBusiness size={16} /> Deployment options for private cloud and enterprise boundaries</p>
        </aside>
      </section>

      <section className="apps-filter-wrap" aria-label="Filter applications">
        <label className="apps-search">
          <Search size={16} />
          <input
            aria-label="Search applications"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by product, feature, or value proposition"
          />
        </label>
        <div className="apps-filters">
          <p><Filter size={16} /> Category</p>
          <div>
            {["All", ...appCategories].map((item) => (
              <button
                key={item}
                type="button"
                className={category === item ? "active" : ""}
                onClick={() => setCategory(item as AppCategory | "All")}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="apps-filters">
          <p><Filter size={16} /> Status</p>
          <div>
            {statuses.map((item) => (
              <button
                key={item}
                type="button"
                className={status === item ? "active" : ""}
                onClick={() => setStatus(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="apps-results" aria-live="polite">
        <p>{visibleApps.length} products matched to current filters</p>
        <div className="apps-grid">
          {visibleApps.map((entry, index) => (
            <motion.article
              key={entry.slug}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.02, duration: 0.28 }}
            >
              <header>
                <span className={`status-pill ${statusToneClass[entry.status]}`}>{entry.status}</span>
                <small>{entry.category}</small>
              </header>
              <h2>{entry.name}</h2>
              <p>{entry.value}</p>
              <ul>
                {entry.features.slice(0, 3).map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <footer>
                <a href={`/apps/${entry.slug}`}>View product page <ArrowRight size={15} /></a>
              </footer>
            </motion.article>
          ))}
        </div>
      </section>
    </main>
  );
}

export function ProductInfoSections({ entry }: { entry: MarketplaceApp }) {
  return (
    <>
      <section className="app-detail-grid">
        <article>
          <h2>Key features</h2>
          <ul>
            {entry.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </article>
        <article>
          <h2>Supported integrations</h2>
          <ul>
            {entry.integrations.map((integration) => (
              <li key={integration}>{integration}</li>
            ))}
          </ul>
        </article>
        <article>
          <h2>Deployment model</h2>
          <ul>
            {entry.deployment.map((model) => (
              <li key={model}>{model}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="app-docs">
        <div>
          <h2>Implementation and governance assets</h2>
          <ul>
            {entry.documentation.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2>FAQ</h2>
          {entry.faq.map((item) => (
            <article key={item.q}>
              <h3>{item.q}</h3>
              <p>{item.a}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="app-screenshot-placeholder">
        <h2>Product visuals and architecture narrative</h2>
        <p>
          Detailed visuals, implementation diagrams, and technical walkthroughs are provided during
          qualified enterprise briefings to protect customer confidentiality and product security posture.
        </p>
        <div aria-hidden="true">
          <span>ENTERPRISE VISUAL BRIEFING AVAILABLE</span>
        </div>
      </section>
    </>
  );
}
