import Image from "next/image";
import Link from "next/link";
import { courses } from "../../academy/courseData";
import { requireOwnerAccess } from "../../../lib/owner-access";
import OwnerAcademyCatalog from "./OwnerAcademyCatalog";
import styles from "../owner-command-center.module.css";

export const dynamic = "force-dynamic";

export default async function OwnerAcademyReviewPage() {
  const access = await requireOwnerAccess("/command-center/academy");
  const departments = new Set(courses.map((course) => course.department)).size;
  const levels = new Set(courses.map((course) => course.level)).size;

  return (
    <main className={styles.shell}>
      <div className={styles.wrapWide}>
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
            <p className={styles.eyebrow}>OWNER COMMAND CENTER · ACADEMY</p>
            <h1 className={styles.title}>Private Course Content Review</h1>
            <p className={styles.intro}>
              Inspect the protected instructional experience separately from the public Academy. This owner view is read-only: it does not create a purchase, learner entitlement, progress event, assessment attempt, or certificate issuance.
            </p>
            <nav className={styles.navLinks} aria-label="Owner Academy review navigation">
              <Link className={styles.navLink} href="/command-center">Command Center</Link>
              <Link className={styles.navLink} href="/academy">Public Academy</Link>
            </nav>
          </div>
          <div className={styles.accessBadge}>OWNER VERIFIED · {access.displayName}</div>
        </header>

        <section className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>CURRENT REVIEW INVENTORY</p>
            <h2>{courses.length} courses available for owner inspection</h2>
          </div>
          <div className={styles.courseMeta}>
            <span>{departments} departments</span>
            <span>{levels} levels</span>
            <span>Read-only answer-key view</span>
          </div>
        </section>

        <OwnerAcademyCatalog courses={courses} />

        <p className={styles.footer}>
          OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC · Proprietary owner review · Not a learner record
        </p>
      </div>
    </main>
  );
}
