"use client";

import { track } from "@vercel/analytics";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import AcademyCinematicCampaigns from "./AcademyCinematicCampaigns";
import type { Course, CourseLevel, Department } from "./courseData";
import { courseOfferForCourse } from "./courseOffers";

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
  "cybersecurity-foundations",
  "zero-trust-strategy",
  "executive-threat-assessment",
  "secure-enterprise-llm-deployment",
  "incident-response-leadership",
] as const;

function levelTag(level: CourseLevel) {
  if (level === "Foundation") return "Starter";
  if (level === "Professional") return "Professional";
  if (level === "Advanced") return "Advanced";
  return "Executive";
}

function offerSummary(course: Course) {
  const offer = courseOfferForCourse(course);
  if (offer.savings > 0) {
    return `${offer.offerLabel} · ${money.format(offer.listPrice)} list · save ${money.format(offer.savings)}`;
  }
  return `${offer.offerLabel} · ${course.duration}`;
}

export default function AcademyControlledClient({
  courses,
  controlPlane,
  cinematicMediaEnabled,
}: {
  courses: Course[];
  controlPlane: "operational" | "degraded";
  cinematicMediaEnabled: boolean;
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
      if (sort === "price-low") return courseOfferForCourse(a).offerPrice - courseOfferForCourse(b).offerPrice;
      if (sort === "price-high") return courseOfferForCourse(b).offerPrice - courseOfferForCourse(a).offerPrice;
      if (sort === "title") return a.title.localeCompare(b.title);
      const aFeatured = featuredIds.includes(a.id as typeof featuredIds[number]) ? 1 : 0;
      const bFeatured = featuredIds.includes(b.id as typeof featuredIds[number]) ? 1 : 0;
      return bFeatured - aFeatured || courseOfferForCourse(a).offerPrice - courseOfferForCourse(b).offerPrice || a.title.localeCompare(b.title);
    });
  }, [courses, department, query, selectedCollection, sort]);

  const visibleCourses = filteredCourses.slice(0, visibleCount);

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
        <a href="/" className="brand" aria-label="Obserra home">
          <Image
            src="/brand/obserra-logo.png"
            alt="Obserra Executive Protection and Intelligence LLC"
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
        <h1>Professional training being built for high consequence cybersecurity, intelligence, protection, and technology decisions.</h1>
        <p>
          The 60-course catalog is a governed development roadmap, not a claim that 60 completed courses are
          available today. A course may enter live enrollment only after its instructional content, assessment,
          accessibility, certificate, pricing, branding, and owner-approval gates pass.
        </p>
        <div className="certificate-promise">
          <strong>Current canary build</strong>
          <span>
            Cybersecurity Foundations for New Professionals is the first controlled production course. Its
            LearnWorlds Sandbox checkout has passed, but live enrollment remains disabled until the real course
            content and completion path are loaded and validated.
          </span>
        </div>
        {controlPlane === "degraded" ? (
          <p className="fine-print" role="status">
            The catalog control service is refreshing. No live course purchase is authorized while current
            publication and content-readiness evidence cannot be confirmed.
          </p>
        ) : null}
      </section>

      <AcademyCinematicCampaigns enabled={cinematicMediaEnabled} />

      <section className="purchase-journey" aria-label="Academy production and launch journey">
        <article><span>01</span><h2>Build</h2><p>Create the complete course, learner materials, assessments, and source evidence.</p></article>
        <article><span>02</span><h2>Validate</h2><p>Test content, accessibility, branding, pricing, checkout, completion, and certificates in Sandbox.</p></article>
        <article><span>03</span><h2>Approve</h2><p>Record owner approval only after every production gate is supported by evidence.</p></article>
        <article><span>04</span><h2>Publish</h2><p>Enable LearnWorlds enrollment only for courses that have passed the complete acceptance contract.</p></article>
      </section>

      {featuredCourse ? (() => {
        const offer = courseOfferForCourse(featuredCourse);
        return (
          <section className="academy-spotlight" aria-label="Featured course roadmap">
            <div className="academy-spotlight-heading">
              <p className="kicker">COURSE ROADMAP</p>
              <h2>Follow the canary build before the catalog scales.</h2>
              <p>
                Cybersecurity Foundations is the production canary. The remaining courses are roadmap entries
                and will be built only after the canary proves the complete learner and commercial journey.
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
                  <b>{money.format(offer.offerPrice)}</b><em>· {offerSummary(featuredCourse)}</em>
                </div>
                <div className="academy-feature-highlights">
                  {featuredCourse.outcomes.slice(0, 3).map((item) => <span key={item}>{item}</span>)}
                  <span>{offer.statusLabel}</span>
                </div>
                <div className="academy-feature-actions">
                  <a href={`/academy/${featuredCourse.id}`}>View build status</a>
                  <a
                    href="/contact?interest=academy-launch"
                    onClick={() => track("academy_launch_interest", { course: featuredCourse.id, source: "featured" })}
                  >
                    Join launch updates
                  </a>
                </div>
              </article>
            </div>
          </section>
        );
      })() : null}

      <section className="catalog" id="courses">
        <div className="catalog-heading">
          <div><p className="kicker">PLANNED COURSE CATALOG</p><h2>Review the governed 60-course development roadmap.</h2></div>
          <p>
            These are planned course products. They are not represented as completed, published, or available
            for live purchase until their individual content and release gates pass.
          </p>
        </div>

        <div className="academy-commerce-controls">
          <label className="academy-search">
            <span>Search roadmap</span>
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
              <option value="price-low">Planned price: low to high</option>
              <option value="price-high">Planned price: high to low</option>
              <option value="title">Title</option>
            </select>
          </label>
        </div>

        <nav className="academy-category-rail" aria-label="Browse Academy roadmap categories">
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
          <strong>{filteredCourses.length} roadmap course{filteredCourses.length === 1 ? "" : "s"} found</strong>
        </div>

        {visibleCourses.length ? (
          <div className="course-grid">
            {visibleCourses.map((course) => {
              const offer = courseOfferForCourse(course);
              return (
                <article key={course.id} className="course-card">
                  <span>{course.department}: {course.track}</span>
                  <h3>{course.title}</h3>
                  <p>{course.description}</p>
                  <div className="course-retail-meta"><i>{levelTag(course.level)}</i><i>{course.level}</i><i>{offer.commerceState === "sandbox-build" ? "Canary build" : "Roadmap"}</i></div>
                  <div className="course-highlights">{course.outcomes.slice(0, 2).map((item) => <span key={item}>{item}</span>)}</div>
                  <footer><b>{money.format(offer.offerPrice)}</b><em>· {offerSummary(course)} · {course.duration}</em></footer>
                  <div className="course-card-actions">
                    <a href={`/academy/${course.id}`}>View build status</a>
                    <a
                      href="/contact?interest=academy-launch"
                      onClick={() => track("academy_launch_interest", { course: course.id, source: "roadmap" })}
                    >
                      Join launch updates
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="academy-empty-state">
            <h3>No roadmap courses match those filters.</h3>
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
          <p className="kicker">INDIVIDUAL LEARNERS</p><h2>Join the launch list for the first approved courses.</h2>
          <p>Live enrollment will open only after the course, assessment, certificate, accessibility, and commercial journey pass validation.</p>
          <a href="/contact?interest=academy-launch">Request launch notification</a>
        </article>
        <article>
          <p className="kicker">ENTERPRISE TEAMS</p><h2>Shape the highest-priority cohort roadmap.</h2>
          <p>Request a pilot discussion for role-based cohorts, executive briefings, and enterprise learning requirements.</p>
          <a href="/contact?interest=enterprise-training">Request enterprise training</a>
        </article>
      </section>

      <section className="certificate">
        <div>
          <p className="kicker">COMPLETION RECOGNITION</p><h2>Approved courses will issue an Obserra Certificate of Course Completion.</h2>
          <p>Certificate issuance requires completion of every required activity and the governed passing standard for the approved final assessment.</p>
        </div>
        <p className="fine-print">An Obserra completion certificate is a proprietary training record. It is not a state license, occupational authorization, accredited academic credit, or third-party professional certification.</p>
      </section>

      <section className="academy-purchase-assurance">
        <h2>Commercial release controls</h2>
        <div>
          <span>LearnWorlds checkout after approval</span><span>No live sale of empty course shells</span><span>Single authoritative price</span>
          <span>Content-readiness evidence</span><span>Accessibility validation</span><span>Assessment verification</span>
          <span>Certificate validation</span><span>Owner approval required</span>
        </div>
        <p>Questions about launch timing, enterprise pilots, or the course roadmap can be directed to <a href="mailto:info@obserrallc.com">info@obserrallc.com</a>.</p>
      </section>

      <footer className="site-footer">
        <Image src="/brand/obserra-logo.png" alt="Obserra Executive Protection and Intelligence LLC" width={180} height={35} />
        <p>Obserra Academy is a learning product of Obserra Executive Protection &amp; Intelligence LLC. Course availability is controlled by documented content, assessment, accessibility, commerce, and owner-approval gates.</p>
      </footer>
    </main>
  );
}
