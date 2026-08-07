import Image from "next/image";
import Link from "next/link";
import { academyOwnerCatalog } from "../../lib/academy-control";
import { requireOwnerAccess } from "../../lib/owner-access";
import styles from "./owner-command-center.module.css";

export const dynamic = "force-dynamic";

export default async function OwnerCommandCenterPage() {
  const access = await requireOwnerAccess("/command-center");
  const academy = await academyOwnerCatalog(access.token);
  const published = academy.controls.filter((course) => course.lifecycle === "published").length;
  const purchaseBlocked = academy.controls.filter((course) => !course.purchase_enabled).length;
  const contentOverrides = academy.contentOverrides.length;

  return (
    <main className={styles.shell}>
      <div className={styles.wrap}>
        <header className={styles.topBar}>
          <div className={styles.brandBlock}>
            <Image
              className={styles.logo}
              src="/brand/obserra-logo.png"
              alt="Obserra Executive Protection and Intelligence LLC"
              width={220}
              height={43}
              priority
            />
            <p className={styles.eyebrow}>PRIVATE OWNER COMMAND CENTER</p>
            <h1 className={styles.title}>Company Mission Control</h1>
            <p className={styles.intro}>
              This is the private operating site for the single registered company owner. It is separate from
              the public Academy and customer purchase experience. Owner authorization is bound to one immutable
              Clerk user ID and issuer; no email allowlist is used.
            </p>
          </div>
          <div className={styles.accessBadge}>OWNER ID VERIFIED · {access.displayName}</div>
        </header>

        <section className={styles.metricRow} aria-label="Owner operating status">
          <div className={styles.metric}><strong>{published}</strong><span>Explicit published controls</span></div>
          <div className={styles.metric}><strong>{purchaseBlocked}</strong><span>Purchase-blocked courses</span></div>
          <div className={styles.metric}><strong>{contentOverrides}</strong><span>Live course overrides</span></div>
        </section>

        <section className={styles.cardGrid} aria-label="Owner Command Center modules">
          <Link className={styles.card} href="/command-center/academy">
            <div className={styles.cardTop}>
              <p className={styles.eyebrow}>OPERATIONAL MODULE</p>
              <span className={styles.statusPill}>LIVE CONTROL SERVICE</span>
            </div>
            <h2>Academy Course Control</h2>
            <p>
              View all courses and complete content by course, edit governed course packages, pause sales,
              unpublish, cancel future availability, restore publication, inspect answer keys, and review audit
              history. Existing paid entitlements remain preserved.
            </p>
            <div className={styles.courseMeta}>
              <span>Public catalog control</span>
              <span>Stripe checkout enforcement</span>
              <span>Revision control</span>
              <span>Immutable owner audit</span>
            </div>
          </Link>

          <a className={styles.card} href="/academy" target="_blank">
            <div className={styles.cardTop}>
              <p className={styles.eyebrow}>PRODUCTION SURFACE</p>
              <span className={styles.statusPill}>PUBLIC</span>
            </div>
            <h2>Public Academy and Store</h2>
            <p>
              Open the customer-facing catalog to verify current publication visibility, course detail pages,
              prices, and checkout availability after an owner control change.
            </p>
            <div className={styles.courseMeta}>
              <span>Governed catalog</span>
              <span>Current pricing</span>
              <span>Purchase availability</span>
              <span>Existing learner access</span>
            </div>
          </a>

          <a className={styles.card} href="/trust/alignment" target="_blank">
            <div className={styles.cardTop}>
              <p className={styles.eyebrow}>ASSURANCE SURFACE</p>
              <span className={styles.statusPill}>PUBLIC EVIDENCE</span>
            </div>
            <h2>Trust and Control Alignment</h2>
            <p>
              Review the governed public alignment presentation for NIST CSF 2.0, ISO/IEC 27001, SOC 2,
              CISA CPGs, GDPR, CCPA/CPRA, and PCI DSS without unsupported compliance or certification claims.
            </p>
          </a>
        </section>

        <section className={styles.controlPanel}>
          <p className={styles.eyebrow}>PRODUCTION TRUTH BOUNDARY</p>
          <h2>What is directly operational now</h2>
          <p>
            The Academy database control tables, owner identity binding, public catalog function, private owner
            function, unauthenticated denial path, public visibility state, and purchase-authorization boundary
            are deployed. Website branch validation and direct canonical-domain owner acceptance remain separate
            release gates and are not represented as complete until their exact deployed build passes.
          </p>
        </section>

        <p className={styles.footer}>
          OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC · Private company-owner system · No public index
        </p>
      </div>
    </main>
  );
}
