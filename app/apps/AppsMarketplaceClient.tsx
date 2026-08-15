"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  CircleDashed,
  Filter,
  Link2,
  PackageCheck,
  Search,
  ShieldCheck,
} from "lucide-react";
import type { AppCategory, MarketplaceApp, VerificationState } from "./appsData";
import { appCategories, marketplaceApps, roadmapConcepts } from "./appsData";

type Props = { initialCategory?: AppCategory | "All" };
type ReleaseFilter = "All" | "Demo verified" | "Live verified" | "Internal validation";

const releaseFilters: ReleaseFilter[] = ["All", "Demo verified", "Live verified", "Internal validation"];

function verificationClass(state: VerificationState) {
  if (state === "Verified") return "verification-verified";
  if (state === "Not offered") return "verification-not-offered";
  return "verification-unverified";
}

function VerificationBadge({ label, state }: { label: string; state: VerificationState }) {
  return <span className={`verification-pill ${verificationClass(state)}`}>{label}: {state}</span>;
}

export default function AppsMarketplaceClient({ initialCategory = "All" }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<AppCategory | "All">(initialCategory);
  const [releaseFilter, setReleaseFilter] = useState<ReleaseFilter>("All");

  const visibleApps = useMemo(() => marketplaceApps.filter((entry) => {
    const q = query.trim().toLowerCase();
    const matchesQuery = q.length === 0
      || entry.name.toLowerCase().includes(q)
      || entry.value.toLowerCase().includes(q)
      || entry.focusAreas.some((item) => item.toLowerCase().includes(q));
    const matchesCategory = category === "All" || entry.category === category;
    const matchesRelease = releaseFilter === "All"
      || (releaseFilter === "Demo verified" && entry.release.Demo.state === "Verified")
      || (releaseFilter === "Live verified" && entry.release.Live.state === "Verified")
      || (releaseFilter === "Internal validation" && entry.lifecycle === "Internal validation");
    return matchesQuery && matchesCategory && matchesRelease;
  }), [category, query, releaseFilter]);

  const demoVerified = marketplaceApps.filter((entry) => entry.release.Demo.state === "Verified").length;
  const liveVerified = marketplaceApps.filter((entry) => entry.release.Live.state === "Verified").length;
  const releaseActions = marketplaceApps.reduce((count, entry) => count + entry.actions.length, 0);

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
          <Link href="/eios">EIOS</Link>
          <Link href="/academy">Academy</Link>
          <Link href="/trust">Trust</Link>
          <Link href="/contact" className="apps-nav-cta">Talk to Obserra</Link>
        </nav>
      </header>

      <section className="apps-hero apps-release-hero">
        <div>
          <p className="apps-eyebrow">OBSERRA PRODUCT RELEASE CATALOG</p>
          <h1>Reviewed products, staged with the evidence required to release them responsibly.</h1>
          <p>
            This catalog separates product source from customer availability. Demo, Live, deployment, and delivery actions
            are shown only when current evidence supports them. A product page is not proof that a runtime or download exists.
          </p>
          <div className="apps-actions">
            <a href="#catalog" className="apps-button">Review product states</a>
            <Link href="/contact?interest=application-evidence-review" className="apps-outline">Request an evidence review</Link>
          </div>
        </div>
        <aside className="apps-release-rules" aria-label="Release rules">
          <p><BadgeCheck size={17} /> <strong>Verified</strong> means the named evidence is present for that exact state.</p>
          <p><CircleDashed size={17} /> <strong>Not verified</strong> means no current release-bound proof is published.</p>
          <p><Link2 size={17} /> Standalone and optional EIOS positioning are reported separately from runtime proof.</p>
          <p><PackageCheck size={17} /> Launch, download, and subscribe links remain absent until their endpoint or artifact is approved.</p>
        </aside>
      </section>

      <section className="apps-release-summary" aria-label="Catalog release summary">
        <article><small>REVIEWED PRODUCTS</small><strong>{marketplaceApps.length}</strong><span>source-backed identities</span></article>
        <article><small>DEMO VERIFIED</small><strong>{demoVerified}</strong><span>with named evidence</span></article>
        <article><small>LIVE VERIFIED</small><strong>{liveVerified}</strong><span>approved runtimes</span></article>
        <article><small>BOUND ACTIONS</small><strong>{releaseActions}</strong><span>launch, download, subscribe</span></article>
      </section>

      <section className="apps-assurance" aria-label="Catalog assurance">
        <article><ShieldCheck size={20} /><div><strong>Fail-closed availability</strong><p>Source versions and internal packages do not create a Live state by themselves.</p></div></article>
        <article><BadgeCheck size={20} /><div><strong>Evidence is product-specific</strong><p>Each application carries its own source head, evidence date, and deployment record.</p></div></article>
        <article><PackageCheck size={20} /><div><strong>No phantom delivery</strong><p>Temporary hosts, guessed downloads, and unbound commerce routes are excluded.</p></div></article>
      </section>

      <section id="catalog" className="apps-filter-wrap" aria-label="Filter reviewed products">
        <label className="apps-search">
          <Search size={16} />
          <input
            aria-label="Search reviewed products"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search product or reviewed focus area"
          />
        </label>
        <div className="apps-filters">
          <p><Filter size={16} /> Product family</p>
          <div>{["All", ...appCategories].map((item) => (
            <button key={item} type="button" className={category === item ? "active" : ""} onClick={() => setCategory(item as AppCategory | "All")}>{item}</button>
          ))}</div>
        </div>
        <div className="apps-filters">
          <p><Filter size={16} /> Release state</p>
          <div>{releaseFilters.map((item) => (
            <button key={item} type="button" className={releaseFilter === item ? "active" : ""} onClick={() => setReleaseFilter(item)}>{item}</button>
          ))}</div>
        </div>
      </section>

      <section className="apps-results" aria-live="polite">
        <p>{visibleApps.length} reviewed product{visibleApps.length === 1 ? "" : "s"} matched</p>
        <div className="apps-grid apps-release-grid">
          {visibleApps.map((entry, index) => (
            <motion.div
              key={entry.slug}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ delay: index * 0.025, duration: 0.25 }}
            >
              <Link href={`/apps/${entry.slug}`} className="apps-card-link" aria-label={`Review release evidence for ${entry.name}`}>
                <article className="apps-release-card">
                  <header><span className="status-pill status-pilot">{entry.lifecycle}</span><small>{entry.category}</small></header>
                  <h2>{entry.name}</h2>
                  <p>{entry.value}</p>
                  <div className="apps-verification-row">
                    <VerificationBadge label="Demo" state={entry.release.Demo.state} />
                    <VerificationBadge label="Live" state={entry.release.Live.state} />
                  </div>
                  <dl className="apps-card-evidence">
                    <div><dt>Evidence version</dt><dd>{entry.releaseEvidence.sourceVersion}</dd></div>
                    <div><dt>Evidence date</dt><dd>{entry.releaseEvidence.evidenceDate}</dd></div>
                  </dl>
                  <div className="apps-mode-list" aria-label={`${entry.name} deployment verification`}>
                    {entry.deploymentModes.map((record) => (
                      <span key={record.mode} className={verificationClass(record.state)}>{record.mode} · {record.state}</span>
                    ))}
                  </div>
                  <footer><strong>Review product evidence <ArrowRight size={15} /></strong></footer>
                </article>
              </Link>
            </motion.div>
          ))}
        </div>
        {visibleApps.length === 0 && (
          <div className="apps-empty">
            <h2>No reviewed products match those filters.</h2>
            <p>Reset the filters to return to the complete source-backed catalog.</p>
            <button type="button" onClick={() => { setQuery(""); setCategory("All"); setReleaseFilter("All"); }}>Reset filters</button>
          </div>
        )}
      </section>

      <section className="apps-roadmap" aria-labelledby="roadmap-heading">
        <div className="apps-spotlight-heading">
          <p className="apps-eyebrow">ROADMAP CONCEPTS</p>
          <h2 id="roadmap-heading">Concepts are not standalone released products.</h2>
          <p>These names remain visible for portfolio planning only. They have no product route, Demo, Live, deployment, launch, download, or subscription action.</p>
        </div>
        <div className="apps-roadmap-grid">
          {roadmapConcepts.map((concept) => (
            <article key={concept.name}><span>ROADMAP CONCEPT</span><h3>{concept.name}</h3><p>{concept.category}</p></article>
          ))}
        </div>
      </section>

      <section className="apps-commercial-cta">
        <div>
          <p className="apps-eyebrow">RELEASE REVIEW</p>
          <h2>Need to evaluate one of these products before a release action is approved?</h2>
          <p>Obserra can review intended use, evidence, deployment boundaries, customer connectivity, and the exact gate still blocking delivery.</p>
        </div>
        <div className="apps-actions"><Link href="/contact?interest=application-evidence-review" className="apps-button">Request an evidence review</Link></div>
      </section>
    </main>
  );
}

export function ProductInfoSections({ entry }: { entry: MarketplaceApp }) {
  return (
    <>
      <section className="app-detail-grid">
        <article><h2>Reviewed product focus</h2><ul>{entry.focusAreas.map((item) => <li key={item}>{item}</li>)}</ul></article>
        <article><h2>Integration review scope</h2><ul>{entry.integrationReview.map((item) => <li key={item}>{item}</li>)}</ul></article>
        <article><h2>Operating position</h2><ul><li>{entry.positioning.standalone}</li><li>{entry.positioning.eios}</li></ul></article>
      </section>

      <section className="app-release-evidence" aria-labelledby="release-evidence-heading">
        <div>
          <p className="apps-eyebrow">CURRENT RELEASE EVIDENCE</p>
          <h2 id="release-evidence-heading">{entry.releaseEvidence.sourceVersion}</h2>
          <p>{entry.releaseEvidence.summary}</p>
        </div>
        <dl>
          <div><dt>Source</dt><dd>{entry.releaseEvidence.source}</dd></div>
          <div><dt>Evidence date</dt><dd>{entry.releaseEvidence.evidenceDate}</dd></div>
          <div><dt>Demo</dt><dd>{entry.release.Demo.state}{entry.release.Demo.version ? ` · ${entry.release.Demo.version}` : ""}</dd></div>
          <div><dt>Live</dt><dd>{entry.release.Live.state}{entry.release.Live.version ? ` · ${entry.release.Live.version}` : ""}</dd></div>
        </dl>
      </section>

      <section className="app-deployment-evidence" aria-labelledby="deployment-evidence-heading">
        <div className="apps-spotlight-heading"><p className="apps-eyebrow">DEPLOYMENT VERIFICATION</p><h2 id="deployment-evidence-heading">Every operating mode carries its own state.</h2></div>
        <div className="app-deployment-evidence-grid">
          {entry.deploymentModes.map((record) => (
            <article key={record.mode}>
              <VerificationBadge label={record.mode} state={record.state} />
              <p>{record.evidence}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="app-docs">
        <div><h2>Release-state notes</h2><p>{entry.release.Demo.evidence}</p><p>{entry.release.Live.evidence}</p></div>
        <div><h2>FAQ</h2>{entry.faq.map((item) => <article key={item.q}><h3>{item.q}</h3><p>{item.a}</p></article>)}</div>
      </section>

      {entry.actions.length > 0 ? (
        <section className="app-release-actions" aria-labelledby="release-actions-heading">
          <div><p className="apps-eyebrow">VERIFIED DELIVERY ACTIONS</p><h2 id="release-actions-heading">Approved paths bound to this evidence record.</h2></div>
          <div className="apps-actions">
            {entry.actions.map((action) => (
              <a key={`${action.kind}-${action.href}`} href={action.href} className="apps-button" data-action-kind={action.kind}>
                {action.label}
              </a>
            ))}
          </div>
        </section>
      ) : (
        <section className="app-no-actions">
          <PackageCheck size={24} />
          <div><h2>No customer delivery action is bound.</h2><p>Launch, download, and subscription controls appear only after an exact approved endpoint or artifact is attached to this product record.</p></div>
          <Link href={`/contact?interest=application-evidence-review&product=${encodeURIComponent(entry.name)}`} className="apps-outline">Discuss release evidence</Link>
        </section>
      )}
    </>
  );
}
