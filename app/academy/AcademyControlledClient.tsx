"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import AcademyCheckoutForm from "./AcademyCheckoutForm";
import type { Course, CourseLevel, Department } from "./courseData";
import { ACADEMY_BRAND_NAME, LEGAL_ENTITY_NAME } from "@/lib/legal-identity";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const departments: (Department | "All")[] = ["All", "Cyber", "Protection", "Intelligence", "Technologies"];
const departmentLabels: Record<Department | "All", string> = {
  All: "All courses",
  Cyber: "Cybersecurity",
  Protection: "Protection & safety",
  Intelligence: "Intelligence & leadership",
  Technologies: "AI & technology",
};

const collections = [
  { key: "All", label: "All levels", matcher: () => true },
  { key: "Starter", label: "Starter", matcher: (level: CourseLevel) => level === "Foundation" },
  { key: "Career", label: "Career growth", matcher: (level: CourseLevel) => level === "Professional" || level === "Advanced" },
  { key: "Executive", label: "Executive", matcher: (level: CourseLevel) => level === "Executive Intensive" || level === "CISO Masterclass" },
] as const;

type Collection = (typeof collections)[number]["key"];
type SortMode = "recommended" | "price-low" | "price-high" | "title";

const featuredIds = [
  "zero-trust-strategy",
  "executive-threat-assessment",
  "secure-enterprise-llm-deployment",
  "incident-response-leadership",
  "ciso-leadership-playbook",
] as const;

function levelTag(level: CourseLevel) {
  if (level === "Foundation") return "Starter";
  if (level === "Professional") return "Professional";
  if (level === "Advanced") return "Advanced";
  return "Executive";
}

export default function AcademyControlledClient({
  courses,
  purchaseAvailability,
  controlPlane,
}: {
  courses: Course[];
  purchaseAvailability: Record<string, boolean>;
  controlPlane: "operational" | "degraded";
}) {
  const [department, setDepartment] = useState<Department | "All">("All");
  const [collection, setCollection] = useState<Collection>("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("recommended");
  const [visibleCount, setVisibleCount] = useState(6);

  const selectedCollection = collections.find((item) => item.key === collection) ?? collections[0];
  const featuredCourse = courses.find((course) => featuredIds.includes(course.id as typeof featuredIds[number])) ?? courses[0] ?? null;

  const filteredCourses = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const result = courses
      .filter((course) => department === "All" || course.department === department)
      .filter((course) => selectedCollection.matcher(course.level))
      .filter((course) => !normalized || [
        course.title,
        course.description,
        course.track,
        course.department,
        course.audience,
        ...course.outcomes,
      ].join(" ").toLowerCase().includes(normalized));

    return [...result].sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "title") return a.title.localeCompare(b.title);
      const aFeatured = featuredIds.includes(a.id as typeof featuredIds[number]) ? 1 : 0;
      const bFeatured = featuredIds.includes(b.id as typeof featuredIds[number]) ? 1 : 0;
      return bFeatured - aFeatured || a.price - b.price || a.title.localeCompare(b.title);
    });
  }, [courses, department, query, selectedCollection, sort]);

  const visibleCourses = filteredCourses.slice(0, visibleCount);
  const purchaseAvailable = (courseId: string) =>
    controlPlane === "operational" && purchaseAvailability[courseId] === true;
  const purchasableCourseCount = courses.filter((course) => purchaseAvailable(course.id)).length;

  function resetCatalog() {
    setQuery("");
    setDepartment("All");
    setCollection("All");
    setSort("recommended");
    setVisibleCount(6);
  }

  return (
    <main className="academy-executive-page">
      <header className="masthead">
        <a href="/" className="brand" aria-label={`${LEGAL_ENTITY_NAME} home`}>
          <Image src="/brand/obserra-logo.png" alt={LEGAL_ENTITY_NAME} width={286} height={55} />
          <span className="product-label">ACADEMY</span>
        </a>
        <div className="masthead-actions">
          <a href="/services" className="nav-link">Services</a>
          <a href="/contact" className="nav-link">Contact</a>
          <a href="/contact?interest=enterprise-training" className="nav-link">Enterprise training</a>
        </div>
      </header>

      <section className="hero academy-executive-hero">
        <p className="kicker">{ACADEMY_BRAND_NAME.toUpperCase()}</p>
        <h1>Practical professional learning for cybersecurity, intelligence, protection, and technology leaders.</h1>
        <p>
          Browse concise, outcome-focused learning built for working professionals and enterprise teams. New enrollment opens only after a course learner edition is reviewed and explicitly approved for sale.
        </p>
        <div className="certificate-promise">
          <strong>Completion standard</strong>
          <span>Complete every lesson and earn 80 percent or higher on the final assessment to receive an {ACADEMY_BRAND_NAME} Certificate of Course Completion.</span>
        </div>
        {controlPlane === "degraded" ? (
          <p className="fine-print" role="status">The catalog control service is refreshing. Checkout remains fail-closed when current purchase authorization cannot be confirmed.</p>
        ) : null}
      </section>

      {featuredCourse ? (
        <section className="academy-executive-feature" aria-label="Featured Academy course">
          <div>
            <p className="kicker">FEATURED COURSE</p>
            <h2>{featuredCourse.title}</h2>
            <p>{featuredCourse.description}</p>
            <div className="academy-feature-highlights">
              {featuredCourse.outcomes.slice(0, 3).map((item) => <span key={item}>{item}</span>)}
            </div>
          </div>
          <aside>
            <span>{featuredCourse.department}, {levelTag(featuredCourse.level)}</span>
            <strong>{purchaseAvailable(featuredCourse.id) ? money.format(featuredCourse.price) : "Enrollment pending"}</strong>
            <small>{featuredCourse.duration}</small>
            <a href={`/academy/${featuredCourse.id}`}>View course details</a>
            {purchaseAvailable(featuredCourse.id) ? (
              <AcademyCheckoutForm courseId={featuredCourse.id} label="Enroll securely" source="featured" className="academy-checkout-button" />
            ) : (
              <span className="academy-enrollment-pending" aria-disabled="true">Not yet available for purchase</span>
            )}
          </aside>
        </section>
      ) : null}

      <section className="catalog academy-executive-catalog" id="courses">
        <div className="catalog-heading">
          <div><p className="kicker">COURSE CATALOG</p><h2>Find the course that matches the decision or capability you need to strengthen.</h2></div>
          <p>{courses.length} courses are available to review. {purchasableCourseCount} are currently open for purchase.</p>
        </div>

        <div className="academy-commerce-controls">
          <label className="academy-search">
            <span>Search courses</span>
            <input value={query} onChange={(event) => { setQuery(event.target.value); setVisibleCount(6); }} placeholder="Search CISO, AI governance, incident response..." type="search" />
          </label>
          <label className="academy-sort">
            <span>Sort</span>
            <select value={sort} onChange={(event) => { setSort(event.target.value as SortMode); setVisibleCount(6); }}>
              <option value="recommended">Recommended</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
              <option value="title">Title</option>
            </select>
          </label>
        </div>

        <nav className="academy-category-rail" aria-label="Browse Academy categories">
          {departments.map((item) => (
            <button key={item} className={department === item ? "active" : ""} onClick={() => { setDepartment(item); setVisibleCount(6); }}>
              <span>{departmentLabels[item]}</span>
            </button>
          ))}
        </nav>
        <div className="academy-collection-rail" aria-label="Browse course levels">
          {collections.map((item) => (
            <button key={item.key} className={collection === item.key ? "active" : ""} onClick={() => { setCollection(item.key); setVisibleCount(6); }}>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="catalog-results">
          <p className="kicker">{departmentLabels[department]}: {selectedCollection.label}</p>
          <strong>{filteredCourses.length} course{filteredCourses.length === 1 ? "" : "s"} found</strong>
        </div>

        {visibleCourses.length ? (
          <div className="course-grid">
            {visibleCourses.map((course) => {
              const canPurchase = purchaseAvailable(course.id);
              return (
                <article key={course.id} className="course-card">
                  <span>{course.department}, {levelTag(course.level)}</span>
                  <h3>{course.title}</h3>
                  <p>{course.description}</p>
                  <footer><b>{canPurchase ? money.format(course.price) : "Enrollment pending"}</b><em>{course.duration}</em></footer>
                  <div className="course-card-actions">
                    <a href={`/academy/${course.id}`}>View details</a>
                    {canPurchase ? (
                      <AcademyCheckoutForm courseId={course.id} label="Enroll securely" source="catalog" className="academy-checkout-button" />
                    ) : (
                      <span className="academy-enrollment-pending" aria-disabled="true">Not yet for sale</span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="academy-empty-state">
            <h3>No courses match those filters.</h3>
            <p>Clear the search or select a broader category.</p>
            <button type="button" onClick={resetCatalog}>Reset catalog</button>
          </div>
        )}

        {visibleCount < filteredCourses.length ? (
          <div className="academy-load-more">
            <button type="button" onClick={() => setVisibleCount((count) => count + 6)}>Show 6 more courses</button>
            <span>{visibleCourses.length} of {filteredCourses.length} shown</span>
          </div>
        ) : null}
      </section>

      <section className="academy-executive-close">
        <div>
          <p className="kicker">INDIVIDUALS & ENTERPRISE TEAMS</p>
          <h2>Build practical capability without adding another long training program.</h2>
          <p>Individuals can select focused learning. Enterprise teams can request curated paths, cohort delivery, executive briefings, and organizational reporting.</p>
        </div>
        <a href="/contact?interest=enterprise-training">Request enterprise training</a>
      </section>

      <section className="certificate academy-executive-certificate">
        <div>
          <p className="kicker">COMPLETION RECOGNITION</p>
          <h2>{ACADEMY_BRAND_NAME} Certificate of Course Completion</h2>
          <p>Complete every lesson and pass the final assessment with an 80 percent score or higher.</p>
        </div>
        <p className="fine-print">An {ACADEMY_BRAND_NAME} Certificate of Course Completion is a proprietary course-completion record issued by {LEGAL_ENTITY_NAME}. It is not a state license, occupational authorization, accredited academic credit, or third-party professional certification.</p>
      </section>

      <footer className="site-footer">
        <Image src="/brand/obserra-logo.png" alt={LEGAL_ENTITY_NAME} width={180} height={35} />
        <p>{ACADEMY_BRAND_NAME} learning product. Proprietary to {LEGAL_ENTITY_NAME}.</p>
      </footer>
    </main>
  );
}
