import Image from "next/image";
import Link from "next/link";
import { courses as sourceCourses } from "../../academy/courseData";
import { academyOwnerCatalog } from "../../../lib/academy-control";
import { defaultAcademyCourseControl } from "../../../lib/academy-control-contracts";
import { requireOwnerAccess } from "../../../lib/owner-access";
import OwnerAcademyControlCatalog, { type OwnerAcademyCourseSummary } from "./OwnerAcademyControlCatalog";
import styles from "../owner-command-center.module.css";

export const dynamic = "force-dynamic";

export default async function OwnerAcademyReviewPage() {
  const access = await requireOwnerAccess("/command-center/academy");
  const snapshot = await academyOwnerCatalog(access.token);
  const controls = new Map(snapshot.controls.map((control) => [control.course_id, control]));
  const overrides = new Map(snapshot.contentOverrides.map((content) => [content.course_id, content]));

  const courses: OwnerAcademyCourseSummary[] = sourceCourses.map((sourceCourse) => {
    const rawControl = controls.get(sourceCourse.id);
    const control = rawControl
      ? {
          ...defaultAcademyCourseControl(sourceCourse.id),
          lifecycle: rawControl.lifecycle,
          publicVisible: rawControl.public_visible,
          purchaseEnabled: rawControl.purchase_enabled,
          revision: rawControl.revision,
          updatedAt: rawControl.updated_at,
          reason: rawControl.reason,
        }
      : defaultAcademyCourseControl(sourceCourse.id);
    const content = overrides.get(sourceCourse.id);
    const overriddenCourse = content?.course_summary?.id === sourceCourse.id
      ? content.course_summary
      : sourceCourse;

    return {
      id: overriddenCourse.id,
      title: overriddenCourse.title,
      department: overriddenCourse.department,
      level: overriddenCourse.level,
      track: overriddenCourse.track,
      description: overriddenCourse.description,
      duration: overriddenCourse.duration,
      lessonCount: overriddenCourse.modules.length,
      price: overriddenCourse.price,
      lifecycle: control.lifecycle,
      publicVisible: control.publicVisible,
      purchaseEnabled: control.purchaseEnabled,
      preserveExistingEntitlements: true,
      controlRevision: control.revision,
      contentRevision: content?.revision ?? 0,
      contentUpdatedAt: content?.updated_at ?? null,
      reason: control.reason ?? null,
    };
  });

  const departments = new Set(courses.map((course) => course.department)).size;
  const levels = new Set(courses.map((course) => course.level)).size;
  const published = courses.filter((course) => course.lifecycle === "published").length;
  const blockedPurchases = courses.filter((course) => !course.purchaseEnabled).length;

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
            <p className={styles.eyebrow}>OWNER COMMAND CENTER · ACADEMY CONTROL PLANE</p>
            <h1 className={styles.title}>Course Content, Publication, and Purchasing</h1>
            <p className={styles.intro}>
              Inspect every course, edit the complete governed content package, pause new sales, unpublish a
              course, cancel future availability, restore publication, and review the audit history. Unpublish
              and cancel never revoke entitlements, progress, assessments, or certificates already committed to
              paid learners.
            </p>
            <nav className={styles.navLinks} aria-label="Owner Academy navigation">
              <Link className={styles.navLink} href="/command-center">Command Center</Link>
              <Link className={styles.navLink} href="/academy" target="_blank">Public Academy</Link>
            </nav>
          </div>
          <div className={styles.accessBadge}>OWNER ID VERIFIED · {access.displayName}</div>
        </header>

        <section className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>LIVE CONTROL INVENTORY</p>
            <h2>{courses.length} courses under owner governance</h2>
          </div>
          <div className={styles.courseMeta}>
            <span>{published} published</span>
            <span>{blockedPurchases} purchase-blocked</span>
            <span>{departments} departments</span>
            <span>{levels} levels</span>
            <span>Existing entitlements preserved</span>
          </div>
        </section>

        <OwnerAcademyControlCatalog courses={courses} />

        <p className={styles.footer}>
          OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC · Proprietary owner control plane · Every mutation is revision controlled and audited
        </p>
      </div>
    </main>
  );
}
