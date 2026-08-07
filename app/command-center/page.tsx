import Image from "next/image";
import Link from "next/link";
import { courses } from "../academy/courseData";
import { requireOwnerAccess } from "../../lib/owner-access";
import styles from "./owner-command-center.module.css";

export const dynamic = "force-dynamic";

export default async function OwnerCommandCenterPage() {
  const access = await requireOwnerAccess("/command-center");
  const departments = new Set(courses.map((course) => course.department)).size;
  const levels = new Set(courses.map((course) => course.level)).size;

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
            <p className={styles.eyebrow}>PRIVATE OWNER OPERATIONS</p>
            <h1 className={styles.title}>Owner Command Center</h1>
            <p className={styles.intro}>
              This is a separate private owner site. It is not part of the public Academy catalog and it does not create learner purchases, progress records, assessment attempts, or certificates while you review course content.
            </p>
            <nav className={styles.navLinks} aria-label="Owner Command Center navigation">
              <Link className={styles.navLink} href="/command-center/academy">Academy review</Link>
              <Link className={styles.navLink} href="/trust/alignment">Control alignment</Link>
              <Link className={styles.navLink} href="/">Public website</Link>
            </nav>
          </div>
          <div className={styles.accessBadge}>OWNER VERIFIED · {access.primaryEmail}</div>
        </header>

        <section className={styles.cardGrid} aria-label="Owner modules">
          <Link className={styles.card} href="/command-center/academy">
            <div className={styles.cardTop}>
              <div>
                <p className={styles.eyebrow}>ACADEMY CONTROL</p>
                <h2>Course Content Review</h2>
              </div>
              <span className={styles.statusPill}>READ ONLY</span>
            </div>
            <p>
              Open every course, inspect every lesson, review source grounding, exercises, knowledge checks, the complete answer-key view, and certificate samples without changing learner data.
            </p>
            <div className={styles.metricRow}>
              <div className={styles.metric}><strong>{courses.length}</strong><span>courses</span></div>
              <div className={styles.metric}><strong>{departments}</strong><span>departments</span></div>
              <div className={styles.metric}><strong>{levels}</strong><span>levels</span></div>
            </div>
          </Link>

          <Link className={styles.card} href="/trust/alignment">
            <div className={styles.cardTop}>
              <div>
                <p className={styles.eyebrow}>TRUST CENTER</p>
                <h2>Control Alignment Reference</h2>
              </div>
              <span className={styles.statusPill}>PUBLIC VIEW</span>
            </div>
            <p>
              Review the current public framework and regulatory alignment references without turning an alignment map into an unsupported certification or compliance claim.
            </p>
          </Link>

          <Link className={styles.card} href="/academy">
            <div className={styles.cardTop}>
              <div>
                <p className={styles.eyebrow}>PUBLIC EXPERIENCE</p>
                <h2>Academy Sales Catalog</h2>
              </div>
              <span className={styles.statusPill}>CUSTOMER VIEW</span>
            </div>
            <p>
              Compare the private owner-review content against the separate public course presentation, pricing, disclosures, and checkout entry points.
            </p>
          </Link>
        </section>

        <p className={styles.footer}>
          OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC · Private owner access · No public indexing
        </p>
      </div>
    </main>
  );
}
