import Link from "next/link";
import { courses } from "../academy/courseData";
import AcademyCommerceProvisioner from "../admin/AcademyCommerceProvisioner";
import { getAcademyAggregateMetrics, getAcademyCommerceMetrics } from "../../lib/academy";
import { requireOwnerPage } from "../../lib/owner-auth";

export const dynamic = "force-dynamic";

export default async function OwnerCommandCenterPage() {
  await requireOwnerPage("/command-center");

  const [academyResult, commerce] = await Promise.all([
    getAcademyAggregateMetrics()
      .then((metrics) => ({ available: true as const, metrics }))
      .catch(() => ({ available: false as const, metrics: null })),
    getAcademyCommerceMetrics(),
  ]);

  const metrics = academyResult.metrics;
  const grossRevenue = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(commerce.grossUsdCents / 100);

  return (
    <main className="owner-main">
      <section className="owner-hero">
        <div>
          <p className="owner-eyebrow">EXECUTIVE OWNER MISSION CONTROL</p>
          <h1>Operate Obserra from one private command site.</h1>
          <p>
            This owner-only environment is separated from the public Academy. It provides direct course-content
            review, live Academy account metrics, Stripe commerce metrics, controlled catalog provisioning, and
            links to the private production consoles used to operate the company.
          </p>
          <div className="owner-actions">
            <Link href="/command-center/academy" className="owner-link-button owner-primary">
              Review all Academy courses
            </Link>
            <a className="owner-link-button" href="https://www.obserrallc.com" target="_blank" rel="noreferrer">
              Open public website
            </a>
          </div>
        </div>
        <aside className="owner-status-panel">
          <p className="owner-eyebrow">ACCESS BOUNDARY</p>
          <strong>Owner identity authorized</strong>
          <p>
            Authorization is bound to the configured Clerk user ID. The Command Center does not use an email
            address or email allowlist to determine access.
          </p>
        </aside>
      </section>

      <section aria-label="Live owner metrics">
        <p className="owner-eyebrow">LIVE OPERATIONAL DATA</p>
        <div className="owner-grid">
          <article className="owner-card">
            <span>Academy catalog</span>
            <strong>{courses.length}</strong>
            <small>Current governed courses available to the website runtime</small>
          </article>
          <article className="owner-card">
            <span>Learner accounts</span>
            <strong>{academyResult.available ? metrics?.learnerAccounts : "—"}</strong>
            <small>{academyResult.available ? "Clerk accounts evaluated for Academy state" : "Identity metrics unavailable"}</small>
          </article>
          <article className="owner-card">
            <span>Verified enrollments</span>
            <strong>{academyResult.available ? metrics?.enrollments : "—"}</strong>
            <small>Account-backed Academy entitlements</small>
          </article>
          <article className="owner-card">
            <span>Verified certificates</span>
            <strong>{academyResult.available ? metrics?.certificates : "—"}</strong>
            <small>Cryptographically verified Academy completion records</small>
          </article>
          <article className="owner-card">
            <span>Stripe paid checkouts</span>
            <strong>{commerce.available ? commerce.paidCheckouts : "—"}</strong>
            <small>{commerce.available ? "Live Stripe checkout-session count" : "Stripe reporting unavailable"}</small>
          </article>
          <article className="owner-card">
            <span>Gross USD collected</span>
            <strong>{commerce.available ? grossRevenue : "—"}</strong>
            <small>Payment-provider reported gross checkout value</small>
          </article>
        </div>
      </section>

      <section className="owner-section">
        <p className="owner-eyebrow">ACADEMY COMMERCE CONTROL</p>
        <h2>Provision the approved course catalog.</h2>
        <p>
          This action checks the governed Academy catalog and creates only missing Stripe products, prices, and
          internal payment-link records. The operation remains idempotent and owner-authorized.
        </p>
        <AcademyCommerceProvisioner />
      </section>

      <section className="owner-section">
        <p className="owner-eyebrow">PRIVATE PRODUCTION CONSOLES</p>
        <h2>Open the systems that provide direct operational evidence.</h2>
        <div className="owner-console-links">
          <a href="https://vercel.com/obserra/obserra-website-live/analytics" target="_blank" rel="noreferrer">
            Vercel Web Analytics
          </a>
          <a href="https://vercel.com/obserra/obserra-website-live/observability" target="_blank" rel="noreferrer">
            Vercel Observability
          </a>
          <a href="https://dashboard.stripe.com/payments" target="_blank" rel="noreferrer">
            Stripe Payments
          </a>
          <a href="https://dashboard.stripe.com/events" target="_blank" rel="noreferrer">
            Stripe Events
          </a>
        </div>
      </section>
    </main>
  );
}
