"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Building2,
  Check,
  ChevronRight,
  Cloud,
  Filter,
  Globe2,
  Layers3,
  LockKeyhole,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import type { AppCategory, AppStatus } from "./appsData";
import { appCategories, marketplaceApps } from "./appsData";

const statusOptions: (AppStatus | "All")[] = ["All", "Available", "Pilot", "Coming Soon"];

const statusLabels: Record<AppStatus, string> = {
  Available: "Available now",
  Pilot: "Limited pilot",
  "Coming Soon": "Coming soon",
};

const categoryIcons: Partial<Record<AppCategory, typeof ShieldCheck>> = {
  Cybersecurity: ShieldCheck,
  Identity: Users,
  GRC: BadgeCheck,
  "AI Governance": Sparkles,
  Intelligence: Globe2,
  Operations: BarChart3,
  "Executive Protection": LockKeyhole,
};

const buyingAssurance = [
  [ShieldCheck, "Enterprise security", "Identity, least privilege, auditability, encryption, and controlled administration."],
  [Building2, "Flexible deployment", "SaaS, private cloud, hybrid, on premises, and government deployment pathways."],
  [Layers3, "Portfolio integration", "Shared identity, licensing, billing, connectors, and evidence across the Obserra platform."],
  [BadgeCheck, "Implementation assurance", "Architecture, onboarding, integration, training, and adoption support from Obserra."],
] as const;

export default function FortuneMarketplaceClient() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<AppCategory | "All">("All");
  const [status, setStatus] = useState<AppStatus | "All">("All");

  const featured = marketplaceApps.find((app) => app.slug === "obserra-eios") ?? marketplaceApps[0];
  const featuredSecondary = marketplaceApps.filter((app) => app.slug !== featured.slug).slice(0, 3);

  const visibleApps = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return marketplaceApps.filter((app) => {
      const matchesQuery =
        !normalized ||
        app.name.toLowerCase().includes(normalized) ||
        app.value.toLowerCase().includes(normalized) ||
        app.features.some((feature) => feature.toLowerCase().includes(normalized)) ||
        app.integrations.some((integration) => integration.toLowerCase().includes(normalized));
      return matchesQuery && (category === "All" || app.category === category) && (status === "All" || app.status === status);
    });
  }, [category, query, status]);

  return (
    <main className="f100-store">
      <header className="f100-nav">
        <Link href="/" className="f100-brand" aria-label="Obserra home">
          <Image src="/brand/obserra-logo.png" alt="Obserra Executive Protection and Intelligence LLC" width={280} height={54} priority />
          <span>Enterprise Marketplace</span>
        </Link>
        <nav aria-label="Marketplace navigation">
          <Link href="/solutions">Solutions</Link>
          <Link href="/services">Services</Link>
          <Link href="/academy">Academy</Link>
          <Link href="/trust">Trust Center</Link>
          <Link href="/portal">Customer Portal</Link>
          <Link href="/contact?interest=application-demo" className="f100-nav-cta">Talk to sales</Link>
        </nav>
      </header>

      <section className="f100-hero">
        <div className="f100-hero-copy">
          <p className="f100-kicker">OBSERRA ENTERPRISE APPLICATION MARKETPLACE</p>
          <h1>Enterprise software designed for decisions that carry real consequence.</h1>
          <p className="f100-hero-lede">
            Discover secure applications for executive intelligence, cybersecurity, identity, governance, AI oversight,
            protective operations, and enterprise execution. Every solution is built for accountable leadership,
            measurable risk reduction, and deployment in complex environments.
          </p>
          <div className="f100-actions">
            <Link href="#catalog" className="f100-primary">Explore applications <ArrowRight size={17} /></Link>
            <Link href="/contact?interest=portfolio-advisory" className="f100-secondary">Schedule portfolio consultation</Link>
          </div>
          <div className="f100-hero-proof" aria-label="Marketplace assurance">
            <span><Check size={15} /> Enterprise ready</span>
            <span><Check size={15} /> Secure by design</span>
            <span><Check size={15} /> Flexible deployment</span>
            <span><Check size={15} /> Executive and technical views</span>
          </div>
        </div>

        <aside className="f100-hero-panel">
          <p className="f100-panel-label">FEATURED PLATFORM</p>
          <div className="f100-featured-visual">
            <Image src="/eios/eios-overview-marketing.png" alt="Obserra EIOS executive intelligence dashboard" fill sizes="(max-width: 900px) 100vw, 44vw" priority />
          </div>
          <div className="f100-featured-meta">
            <div>
              <span className="f100-status available">Available now</span>
              <h2>{featured.name}</h2>
              <p>{featured.value}</p>
            </div>
            <Link href={`/apps/${featured.slug}`} aria-label={`Explore ${featured.name}`}><ArrowRight size={20} /></Link>
          </div>
        </aside>
      </section>

      <section className="f100-trust-band" aria-label="Enterprise marketplace assurances">
        {buyingAssurance.map(([Icon, title, copy]) => (
          <article key={title}>
            <Icon size={20} />
            <div><strong>{title}</strong><p>{copy}</p></div>
          </article>
        ))}
      </section>

      <section className="f100-featured" aria-label="Featured solutions">
        <div className="f100-section-heading">
          <div><p className="f100-kicker">FEATURED SOLUTIONS</p><h2>Start with the highest impact enterprise capabilities.</h2></div>
          <Link href="#catalog">View complete catalog <ArrowRight size={16} /></Link>
        </div>
        <div className="f100-featured-grid">
          <Link href={`/apps/${featured.slug}`} className="f100-featured-main">
            <div className="f100-featured-image">
              <Image src="/eios/eios-situation-room-marketing.png" alt={`${featured.name} situation room`} fill sizes="(max-width: 900px) 100vw, 58vw" />
            </div>
            <div className="f100-featured-main-copy">
              <span className="f100-status available">Available now</span>
              <small>{featured.category}</small>
              <h3>{featured.name}</h3>
              <p>{featured.value}</p>
              <ul>{featured.features.map((feature) => <li key={feature}><Check size={15} /> {feature}</li>)}</ul>
              <strong>Explore flagship platform <ArrowRight size={16} /></strong>
            </div>
          </Link>

          <div className="f100-featured-stack">
            {featuredSecondary.map((app) => {
              const Icon = categoryIcons[app.category] ?? Layers3;
              return (
                <Link href={`/apps/${app.slug}`} key={app.slug}>
                  <div className="f100-app-icon"><Icon size={22} /></div>
                  <div>
                    <span className={`f100-status ${app.status.toLowerCase().replaceAll(" ", "-")}`}>{statusLabels[app.status]}</span>
                    <h3>{app.name}</h3>
                    <p>{app.value}</p>
                    <strong>View solution <ChevronRight size={15} /></strong>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="f100-catalog" id="catalog">
        <div className="f100-section-heading f100-catalog-heading">
          <div><p className="f100-kicker">APPLICATION CATALOG</p><h2>Find the right capability for your mission.</h2><p>Search by business problem, product capability, integration, category, or release status.</p></div>
          <div className="f100-result-count"><strong>{visibleApps.length}</strong><span>solutions</span></div>
        </div>

        <div className="f100-controls">
          <label className="f100-search">
            <Search size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search applications, capabilities, or integrations" aria-label="Search applications" />
          </label>
          <div className="f100-select-group">
            <Filter size={16} />
            <select value={category} onChange={(event) => setCategory(event.target.value as AppCategory | "All")} aria-label="Filter by category">
              <option value="All">All categories</option>
              {appCategories.map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
          <div className="f100-select-group">
            <BadgeCheck size={16} />
            <select value={status} onChange={(event) => setStatus(event.target.value as AppStatus | "All")} aria-label="Filter by status">
              {statusOptions.map((item) => <option key={item}>{item === "All" ? "All availability" : item}</option>)}
            </select>
          </div>
        </div>

        <div className="f100-catalog-grid">
          {visibleApps.map((app) => {
            const Icon = categoryIcons[app.category] ?? Layers3;
            const statusClass = app.status.toLowerCase().replaceAll(" ", "-");
            return (
              <article key={app.slug} className="f100-product-card">
                <div className="f100-card-topline"><div className="f100-app-icon"><Icon size={22} /></div><span className={`f100-status ${statusClass}`}>{statusLabels[app.status]}</span></div>
                <small>{app.category}</small>
                <h3>{app.name}</h3>
                <p>{app.value}</p>
                <ul>{app.features.slice(0, 3).map((feature) => <li key={feature}><Check size={14} /> {feature}</li>)}</ul>
                <div className="f100-card-meta"><span><Cloud size={14} /> {app.deployment.join(" · ")}</span></div>
                <div className="f100-card-actions">
                  <Link href={`/apps/${app.slug}`} className="f100-card-primary">View solution <ArrowRight size={15} /></Link>
                  <Link href={`/contact?interest=application-demo&product=${encodeURIComponent(app.name)}`} className="f100-card-secondary">Request demo</Link>
                </div>
              </article>
            );
          })}
        </div>

        {visibleApps.length === 0 && (
          <div className="f100-empty">
            <Search size={28} />
            <h3>No solutions match those filters.</h3>
            <p>Reset the catalog or speak with an Obserra advisor about the outcome you need.</p>
            <button type="button" onClick={() => { setQuery(""); setCategory("All"); setStatus("All"); }}>Reset catalog</button>
          </div>
        )}
      </section>

      <section className="f100-enterprise-cta">
        <div>
          <p className="f100-kicker">ENTERPRISE PROCUREMENT AND DEPLOYMENT</p>
          <h2>Build the right Obserra portfolio for your organization.</h2>
          <p>Compare applications, deployment models, implementation services, licensing structures, integration scope, and security requirements with an enterprise product advisor.</p>
        </div>
        <div className="f100-actions">
          <Link href="/contact?interest=enterprise-quote" className="f100-primary">Request enterprise proposal <ArrowRight size={17} /></Link>
          <Link href="/trust" className="f100-secondary">Review security and trust</Link>
        </div>
      </section>
    </main>
  );
}
