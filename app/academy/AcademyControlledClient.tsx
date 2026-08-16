"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import AcademyCheckoutForm from "./AcademyCheckoutForm";
import type { Course, CourseLevel, Department } from "./courseData";
import { LEGAL_ENTITY_NAME } from "@/lib/legal-identity";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const departments: (Department | "All")[] = ["All", "Cyber", "Protection", "Intelligence", "Technologies"];
const departmentLabels: Record<Department | "All", string> = {
  All: "All courses",
  Cyber: "Cybersecurity",
  Protection: "Travel and Executive Safety",
  Intelligence: "Intelligence and Leadership",
  Technologies: "AI and Technology",
};
const collections = [
  { key: "All", label: "All levels", matcher: () => true },
  { key: "Starter", label: "Starter", matcher: (level: CourseLevel) => level === "Foundation" },
  {
    key: "Career",
    label: "Career growth",
    matcher: (level: CourseLevel) => level === "Professional" || level === "Advanced",
  },
  {
    key: "Executive",
    label: "Executive",
    matcher: (level: CourseLevel) => level === "Executive Intensive" || level === "CISO Masterclass",
  },
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
  const [visibleCount, setVisibleCount] = useState(12);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  const flagshipCourses = useMemo(() => {
    const featured = courses.filter((course) => featuredIds.includes(course.id as typeof featuredIds[number]));
    return featured.length ? featured : courses.slice(0, Math.min(5, courses.length));
  }, [courses]);
  const featuredCourse = flagshipCourses.length
    ? flagshipCourses[featuredIndex % flagshipCourses.length]
    : null;
  const selectedCollection = collections.find((item) => item.key === collection) ?? collections[0];

  useEffect(() => {
    if (flagshipCourses.length < 2) return;
    const timer = window.setInterval(
      () => setFeaturedIndex((current) => (current + 1) % flagshipCourses.length),
      5_200,
    );
    return () => window.clearInterval(timer);
  }, [flagshipCourses.length]);

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
    setVisibleCount(12);
  }

  return (
    <main>
      <header className="masthead">
        <a href="/" className="brand" aria-label={`${LEGAL_ENTITY_NAME} home`}>
          <Image
            src="/brand/obserra-logo.png"
            alt={LEGAL_ENTITY_NAME}
            width={286}
            height={55}
          />
          <span className="product-label">ACADEMY</span>
        </a>
        <div className="masthead-actions">
          <a href="/services" className="nav-link">Services</a>
          <a href="/apps" className="nav-link">Applications</a>
          <a href="/contact" className="nav-link">Contact</a>
          <a href="/contact?interest=enterprise-training" className="nav-link">Enterprise training</a>
        </div>
      </header>

      <section className="hero">
        <p className="kicker">OBSERRA ACADEMY</p>
        <h1>Professional, artificial intelligence (AI) native training for high consequence cybersecurity, intelligence, protection, and technology decisions.</h1>
        <p>
          Review {courses.length} courses in the Obserra Academy catalog. New enrollment opens only after a
          course's learner edition is loaded, reviewed, and explicitly approved for sale. Previously entitled
          learners retain their committed access when new sales are paused.
        </p>
        <div className="certificate-promise">
          <strong>Completion standard</strong>
          <span>
            Complete every lesson and earn 80 percent or higher on the final assessment to receive an Obserra
            Academy Certificate of Course Completion. The AI tutor supports learning and practice but is paused during the graded
            final assessment.
          </span>
        </div>
        {controlPlane === "degraded" ? (
          <p className="fine-print" role="status">
            The catalog control service is refreshing. Checkout remains independently governed and fails closed
            when current purchase authorization cannot be confirmed.
          </p>
        ) : null}
      </section>

      <section className="purchase-journey" aria-label="Academy purchase and completion journey">
        <article><span>01</span><h2>Review</h2><p>Compare the stated outcomes, duration, level, and planned lesson path.</p></article>
        <article><span>02</span><h2>Enroll when activated</h2><p>After course approval, complete secure enrollment and associate access with your learner identity.</p></article>
        <article><span>03</span><h2>Learn with AI</h2><p>Receive course aware instruction, saved progress, applied scenarios, authoritative sources, and the Obserrian Academy Tutor.</p></article>
        <article><span>04</span><h2>Complete</h2><p>Complete every lesson, pass the protected assessment, and generate your governed Certificate of Course Completion.</p></article>
      </section>

      {featuredCourse ? (
        <section className="academy-spotlight" aria-label="Featured courses">
          <div className="academy-spotlight-heading">
            <p className="kicker">FEATURED COURSES</p>
            <h2>Start with training built for decisions leaders face now.</h2>
            <p>
              Preview planned learning across cybersecurity, executive protection, incident leadership, AI governance,
              and enterprise technology. Activated paid courses include an entitlement-gated AI learning assistant.
            </p>
            <div className="academy-spotlight-tabs">
              {flagshipCourses.map((course, index) => (
                <button
                  key={course.id}
                  type="button"
                  className={index === featuredIndex ? "active" : ""}
                  onClick={() => setFeaturedIndex(index)}
                >
                  {course.title}
                </button>
              ))}
            </div>
          </div>
          <div className="academy-spotlight-grid" aria-live="polite">
            <article key={featuredCourse.id} className="academy-spotlight-card academy-feature-card">
              <span>{featuredCourse.department} · {levelTag(featuredCourse.level)}</span>
              <h3>{featuredCourse.title}</h3>
              <p>{featuredCourse.description}</p>
              <div className="academy-feature-meta">
                <b>{purchaseAvailable(featuredCourse.id) ? money.format(featuredCourse.price) : "Enrollment pending"}</b><em>· {featuredCourse.duration}</em>
              </div>
              <div className="academy-feature-highlights">
                {featuredCourse.outcomes.slice(0, 3).map((item) => <span key={item}>{item}</span>)}
              </div>
              <div className="academy-feature-actions">
                <a href={`/academy/${featuredCourse.id}`}>Preview course</a>
                {purchaseAvailable(featuredCourse.id) ? (
                  <AcademyCheckoutForm
                    courseId={featuredCourse.id}
                    label="Enroll securely"
                    source="featured"
                    className="academy-checkout-button"
                  />
                ) : (
                  <span className="academy-enrollment-pending" aria-disabled="true">Not yet available for purchase</span>
                )}
              </div>
            </article>
          </div>
        </section>
      ) : null}

      <section className="catalog" id="courses">
        <div className="catalog-heading">
          <div><p className="kicker">COURSE CATALOG</p><h2>Review the courses being prepared by Obserra Academy.</h2></div>
          <p>
            {courses.length} courses are available to review. {purchasableCourseCount} are currently open for purchase.
            Enrollment activates separately for each course only after the learner edition and commercial controls are approved.
          </p>
        </div>

        <div className="academy-commerce-controls">
          <label className="academy-search">
            <span>Search courses</span>
            <input
              value={query}
              onChange={(event) => { setQuery(event.target.value); setVisibleCount(12); }}
              placeholder="Search AI governance, CISO, incident response..."
              type="search"
            />
          </label>
          <label className="academy-sort">
            <span>Sort</span>
            <select value={sort} onChange={(event) => { setSort(event.target.value as SortMode); setVisibleCount(12); }}>
              <option value="recommended">Recommended</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
              <option value="title">Title</option>
            </select>
          </label>
        </div>

        <nav className="academy-category-rail" aria-label="Browse Academy categories">
          {departments.map((item) => (
            <button
              key={item}
              className={department === item ? "active" : ""}
              onClick={() => { setDepartment(item); setVisibleCount(12); }}
            >
              <span>{departmentLabels[item]}</span>
              <b>{item === "All" ? courses.length : courses.filter((course) => course.department === item).length}</b>
            </button>
          ))}
        </nav>
        <div className="academy-collection-rail" aria-label="Browse course levels">
          {collections.map((item) => (
            <button
              key={item.key}
              className={collection === item.key ? "active" : ""}
              onClick={() => { setCollection(item.key); setVisibleCount(12); }}
            >
              <span>{item.label}</span><b>{courses.filter((course) => item.matcher(course.level)).length}</b>
            </button>
          ))}
        </div>
        <div className="catalog-results">
          <p className="kicker">{departmentLabels[department]} · {selectedCollection.label}</p>
          <strong>{filteredCourses.length} course{filteredCourses.length === 1 ? "" : "s"} found</strong>
        </div>

        {visibleCourses.length ? (
          <div className="course-grid">
            {visibleCourses.map((course) => {
              const canPurchase = purchaseAvailable(course.id);
              return (
              <article key={course.id} className="course-card">
                <span>{course.department}: {course.track}</span>
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <div className="course-retail-meta"><i>{levelTag(course.level)}</i><i>{course.level}</i><i>AI native</i></div>
                <div className="course-highlights">{course.outcomes.slice(0, 2).map((item) => <span key={item}>{item}</span>)}</div>
                <footer><b>{canPurchase ? money.format(course.price) : "Enrollment pending"}</b><em>· {course.duration}</em></footer>
                <div className="course-card-actions">
                  <a href={`/academy/${course.id}`}>View details</a>
                  {canPurchase ? (
                    <AcademyCheckoutForm
                      courseId={course.id}
                      label="Enroll securely"
                      source="catalog"
                      className="academy-checkout-button"
                    />
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
            <button type="button" onClick={() => setVisibleCount((count) => count + 12)}>Show 12 more courses</button>
            <span>{visibleCourses.length} of {filteredCourses.length} shown</span>
          </div>
        ) : null}
      </section>

      <section className="academy-buyer-paths">
        <article>
          <p className="kicker">INDIVIDUAL LEARNERS</p><h2>Build practical capability at your own pace.</h2>
          <p>Browse planned courses now. Secure enrollment, course-aware AI tutoring, saved progress, assessments, and completion records activate only for approved learner editions.</p>
          <a href="#courses">Browse courses</a>
        </article>
        <article>
          <p className="kicker">ENTERPRISE TEAMS</p><h2>Train teams against a shared operating standard.</h2>
          <p>Request curated learning paths, cohort delivery, executive briefings, organizational reporting, and AI-native learner support aligned to the purchased curriculum.</p>
          <a href="/contact?interest=enterprise-training">Request enterprise training</a>
        </article>
      </section>

      <section className="certificate">
        <div>
          <p className="kicker">COMPLETION RECOGNITION</p><h2>Earn an Obserra Academy Certificate of Course Completion.</h2>
          <p>Complete every lesson and pass the final assessment with an 80 percent score or higher. Course-completion certificates include learner name, course, completion date, training hours, and a unique verification ID.</p>
        </div>
        <p className="fine-print">An Obserra Academy Certificate of Course Completion is a proprietary course-completion record issued by {LEGAL_ENTITY_NAME}. It is not a state license, occupational authorization, accredited academic credit, or third-party professional certification.</p>
      </section>

      <section className="academy-purchase-assurance">
        <h2>Commercial activation assurance</h2>
        <div>
          <span>Course-by-course sales approval</span><span>Secure Stripe checkout after activation</span><span>Authorized learner access</span><span>Existing entitlement preservation</span>
          <span>Obserrian AI Tutor</span><span>Authoritative course grounding</span><span>Saved progress</span>
          <span>Assessment-based completion</span><span>Course-completion record</span>
        </div>
        <p>Questions about enrollment, team licensing, access, or course-completion records can be directed to <a href="mailto:info@obserrallc.com">info@obserrallc.com</a>.</p>
      </section>

      <footer className="site-footer">
        <Image src="/brand/obserra-logo.png" alt={LEGAL_ENTITY_NAME} width={180} height={35} />
        <p>Obserra Academy learning product. Proprietary to {LEGAL_ENTITY_NAME}. Unauthorized downloading, recording, copying, sharing, distribution, or classroom use is prohibited.</p>
      </footer>
    </main>
  );
}
