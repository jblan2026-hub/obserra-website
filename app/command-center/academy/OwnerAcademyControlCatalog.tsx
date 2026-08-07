"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { AcademyCourseLifecycle } from "../../../lib/academy-control-contracts";
import styles from "../owner-command-center.module.css";

export type OwnerAcademyCourseSummary = {
  id: string;
  title: string;
  department: string;
  level: string;
  track: string;
  description: string;
  duration: string;
  lessonCount: number;
  price: number;
  lifecycle: AcademyCourseLifecycle;
  publicVisible: boolean;
  purchaseEnabled: boolean;
  preserveExistingEntitlements: true;
  controlRevision: number;
  contentRevision: number;
  contentUpdatedAt: string | null;
  reason: string | null;
};

function lifecycleLabel(lifecycle: AcademyCourseLifecycle) {
  if (lifecycle === "published") return "Published";
  if (lifecycle === "sales_paused") return "Sales paused";
  if (lifecycle === "unpublished") return "Unpublished";
  return "Cancelled";
}

export default function OwnerAcademyControlCatalog({
  courses,
}: {
  courses: OwnerAcademyCourseSummary[];
}) {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("All levels");
  const [lifecycle, setLifecycle] = useState("All states");
  const levels = useMemo(
    () => ["All levels", ...Array.from(new Set(courses.map((course) => course.level)))],
    [courses],
  );

  const filteredCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return courses.filter((course) => {
      const matchesLevel = level === "All levels" || course.level === level;
      const matchesLifecycle = lifecycle === "All states" || course.lifecycle === lifecycle;
      const searchable = [
        course.title,
        course.department,
        course.level,
        course.track,
        course.description,
        course.lifecycle,
        course.reason ?? "",
      ].join(" ").toLowerCase();
      return matchesLevel && matchesLifecycle && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [courses, level, lifecycle, query]);

  return (
    <>
      <div className={styles.catalogControls}>
        <label>
          <span className={styles.eyebrow}>SEARCH COURSES</span>
          <input
            className={styles.searchInput}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search title, department, status, audience, or topic"
          />
        </label>
        <label>
          <span className={styles.eyebrow}>FILTER LEVEL</span>
          <select className={styles.selectInput} value={level} onChange={(event) => setLevel(event.target.value)}>
            {levels.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label>
          <span className={styles.eyebrow}>FILTER PUBLICATION</span>
          <select className={styles.selectInput} value={lifecycle} onChange={(event) => setLifecycle(event.target.value)}>
            <option>All states</option>
            <option value="published">Published</option>
            <option value="sales_paused">Sales paused</option>
            <option value="unpublished">Unpublished</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
      </div>

      <p className={styles.reviewBanner}>
        Showing {filteredCourses.length} of {courses.length} governed courses. Unpublish and cancel remove public
        visibility and block new checkout. Existing paid learner entitlements remain active by enforced policy.
      </p>

      {filteredCourses.length > 0 ? (
        <section className={styles.courseGrid} aria-label="Owner Academy course control catalog">
          {filteredCourses.map((course, index) => (
            <article className={styles.courseCard} key={course.id}>
              <div className={styles.cardTop}>
                <p className={styles.eyebrow}>
                  {String(index + 1).padStart(2, "0")} · {course.department} · {course.level}
                </p>
                <span className={styles.statusPill}>{lifecycleLabel(course.lifecycle)}</span>
              </div>
              <h2>{course.title}</h2>
              <p>{course.description}</p>
              <div className={styles.courseMeta}>
                <span>{course.duration}</span>
                <span>{course.lessonCount} lessons</span>
                <span>${course.price}</span>
                <span>{course.publicVisible ? "Public page visible" : "Public page hidden"}</span>
                <span>{course.purchaseEnabled ? "Purchasing enabled" : "Purchasing blocked"}</span>
                <span>Existing access preserved</span>
                <span>Control r{course.controlRevision}</span>
                <span>Content r{course.contentRevision}</span>
              </div>
              {course.reason ? <p><strong>Owner reason:</strong> {course.reason}</p> : null}
              <div className={styles.courseActions}>
                <Link className={styles.primaryAction} href={`/command-center/academy/${course.id}`}>
                  View, edit, and control course
                </Link>
                <Link className={styles.secondaryAction} href={`/command-center/academy/${course.id}/certificate`}>
                  Certificate sample
                </Link>
                {course.publicVisible ? (
                  <Link className={styles.secondaryAction} href={`/academy/${course.id}`} target="_blank">
                    Public sales page
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </section>
      ) : (
        <div className={styles.emptyState}>No courses match the current owner-control filters.</div>
      )}
    </>
  );
}
