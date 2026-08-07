"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Course } from "../../academy/courseData";
import styles from "../owner-command-center.module.css";

export default function OwnerAcademyCatalog({ courses }: { courses: Course[] }) {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("All levels");
  const levels = useMemo(
    () => ["All levels", ...Array.from(new Set(courses.map((course) => course.level)))],
    [courses],
  );

  const filteredCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return courses.filter((course) => {
      const matchesLevel = level === "All levels" || course.level === level;
      const searchable = [
        course.title,
        course.department,
        course.level,
        course.track,
        course.audience,
        course.description,
      ].join(" ").toLowerCase();
      return matchesLevel && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [courses, level, query]);

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
            placeholder="Search title, department, level, audience, or topic"
          />
        </label>
        <label>
          <span className={styles.eyebrow}>FILTER LEVEL</span>
          <select className={styles.selectInput} value={level} onChange={(event) => setLevel(event.target.value)}>
            {levels.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
      </div>

      {filteredCourses.length > 0 ? (
        <section className={styles.courseGrid} aria-label="Owner Academy course review catalog">
          {filteredCourses.map((course, index) => (
            <article className={styles.courseCard} key={course.id}>
              <p className={styles.eyebrow}>
                {String(index + 1).padStart(2, "0")} · {course.department} · {course.level}
              </p>
              <h2>{course.title}</h2>
              <p>{course.description}</p>
              <div className={styles.courseMeta}>
                <span>{course.duration}</span>
                <span>{course.modules.length} lessons</span>
                <span>${course.price}</span>
                <span>{course.track}</span>
              </div>
              <div className={styles.courseActions}>
                <Link className={styles.primaryAction} href={`/command-center/academy/${course.id}`}>
                  Review complete course
                </Link>
                <Link className={styles.secondaryAction} href={`/command-center/academy/${course.id}/certificate`}>
                  Certificate sample
                </Link>
                <Link className={styles.secondaryAction} href={`/academy/${course.id}`}>
                  Public sales page
                </Link>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <div className={styles.emptyState}>No courses match the current owner-review filters.</div>
      )}
    </>
  );
}
