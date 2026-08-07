"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type OwnerCourseSummary = {
  id: string;
  title: string;
  department: string;
  level: string;
  description: string;
  duration: string;
  lessonCount: number;
  price: number;
};

export default function AcademyOwnerCatalog({ courses }: { courses: OwnerCourseSummary[] }) {
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("all");
  const [level, setLevel] = useState("all");

  const departments = useMemo(
    () => Array.from(new Set(courses.map((course) => course.department))).sort(),
    [courses],
  );
  const levels = useMemo(
    () => Array.from(new Set(courses.map((course) => course.level))),
    [courses],
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return courses.filter((course) => {
      const matchesQuery =
        !normalized ||
        `${course.title} ${course.description} ${course.department} ${course.level}`
          .toLowerCase()
          .includes(normalized);
      const matchesDepartment = department === "all" || course.department === department;
      const matchesLevel = level === "all" || course.level === level;
      return matchesQuery && matchesDepartment && matchesLevel;
    });
  }, [courses, department, level, query]);

  return (
    <>
      <div className="owner-filter-row" aria-label="Course filters">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search title, department, level, or subject"
          aria-label="Search Academy courses"
        />
        <select value={department} onChange={(event) => setDepartment(event.target.value)} aria-label="Filter by department">
          <option value="all">All departments</option>
          {departments.map((value) => <option value={value} key={value}>{value}</option>)}
        </select>
        <select value={level} onChange={(event) => setLevel(event.target.value)} aria-label="Filter by level">
          <option value="all">All levels</option>
          {levels.map((value) => <option value={value} key={value}>{value}</option>)}
        </select>
      </div>

      <p className="owner-muted">Showing {filtered.length} of {courses.length} governed courses.</p>

      <section className="owner-course-grid" aria-label="Owner Academy course catalog">
        {filtered.map((course, index) => (
          <article className="owner-course-card" key={course.id}>
            <p className="owner-eyebrow">
              {String(index + 1).padStart(2, "0")} · {course.department} · {course.level}
            </p>
            <h2>{course.title}</h2>
            <p>{course.description}</p>
            <div className="owner-course-meta">
              <span>{course.duration}</span>
              <span>{course.lessonCount} lessons</span>
              <span>${course.price}</span>
            </div>
            <div className="owner-course-actions">
              <Link href={`/command-center/academy/${course.id}`}>Open complete course</Link>
              <Link href={`/command-center/academy/${course.id}/certificate`}>Certificate sample</Link>
              <Link href={`/academy/${course.id}`} target="_blank">Public sales page</Link>
            </div>
          </article>
        ))}
      </section>

      {filtered.length === 0 && (
        <section className="owner-section">
          <h2>No matching courses</h2>
          <p>Change the search text or filters to return to the governed catalog.</p>
        </section>
      )}
    </>
  );
}
