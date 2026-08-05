"use client";

import { useEffect, useMemo, useState } from "react";
import { track } from "@vercel/analytics";
import Image from "next/image";
import { courses, type CourseLevel, type Department } from "./courseData";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const departments: (Department | "All")[] = ["All", "Cyber", "Protection", "Intelligence", "Technologies"];
const departmentLabels: Record<Department | "All", string> = {
  All: "All courses",
  Cyber: "Cybersecurity",
  Protection: "Travel and Executive Safety",
  Intelligence: "Intelligence and Leadership",
  Technologies: "AI and Technology",
};
const collections = [
  { key: "All", label: "All levels", matcher: (_level: CourseLevel) => true },
  { key: "Starter", label: "Starter", matcher: (level: CourseLevel) => level === "Foundation" },
  { key: "Career", label: "Career growth", matcher: (level: CourseLevel) => level === "Professional" || level === "Advanced" },
  { key: "Executive", label: "Executive", matcher: (level: CourseLevel) => level === "Executive Intensive" || level === "CISO Masterclass" },
] as const;
type Collection = (typeof collections)[number]["key"];
type SortMode = "recommended" | "price-low" | "price-high" | "title";

const featuredIds = ["zero-trust-strategy", "executive-threat-assessment", "secure-enterprise-llm-deployment", "incident-response-leadership", "ciso-leadership-playbook"] as const;

function levelTag(level: CourseLevel) {
  if (level === "Foundation") return "Starter";
  if (level === "Professional") return "Professional";
  if (level === "Advanced") return "Advanced";
  return "Executive";
}

export default function AcademyClient() {
  const [department, setDepartment] = useState<Department | "All">("All");
  const [collection, setCollection] = useState<Collection>("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("recommended");
  const [visibleCount, setVisibleCount] = useState(12);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  const flagshipCourses = useMemo(() => courses.filter((course) => featuredIds.includes(course.id as typeof featuredIds[number])), []);
  const featuredCourse = flagshipCourses[featuredIndex % flagshipCourses.length];
  const selectedCollection = collections.find((item) => item.key === collection)!;

  useEffect(() => {
    if (flagshipCourses.length < 2) return;
    const timer = window.setInterval(() => setFeaturedIndex((current) => (current + 1) % flagshipCourses.length), 5200);
    return () => window.clearInterval(timer);
  }, [flagshipCourses.length]);

  useEffect(() => setVisibleCount(12), [department, collection, query, sort]);

  const filteredCourses = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const result = courses.filter((course) => department === "All" || course.department === department)
      .filter((course) => selectedCollection.matcher(course.level))
      .filter((course) => !normalized || [course.title, course.description, course.track, course.department, course.audience, ...course.outcomes].join(" ").toLowerCase().includes(normalized));

    return [...result].sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "title") return a.title.localeCompare(b.title);
      const aFeatured = featuredIds.includes(a.id as typeof featuredIds[number]) ? 1 : 0;
      const bFeatured = featuredIds.includes(b.id as typeof featuredIds[number]) ? 1 : 0;
      return bFeatured - aFeatured || a.price - b.price || a.title.localeCompare(b.title);
    });
  }, [collection, department, query, selectedCollection, sort]);

  const visibleCourses = filteredCourses.slice(0, visibleCount);

  return (
    <main>
      <header className="masthead">
        <a href="/" className="brand" aria-label="Obserra home"><Image src="/brand/obserra-logo.png" alt="Obserra Executive Protection and Intelligence LLC" width={286} height={55} /><span className="product-label">ACADEMY</span></a>
        <div className="masthead-actions"><a href="/services" className="nav-link">Services</a><a href="/apps" className="nav-link">Applications</a><a href="/contact" className="nav-link">Contact</a><a href="/contact?interest=enterprise-training" className="nav-link">Enterprise training</a></div>
      </header>

      <section className="hero">
        <p className="kicker">OBSERRA ACADEMY</p>
        <h1>Professional training for high consequence cybersecurity, intelligence, protection, and AI decisions.</h1>
        <p>Choose a course, create your secure learner account, complete payment through Stripe, and begin immediately. Access, progress, assessment results, and certificates remain tied to your account.</p>
        <div className="certificate-promise"><strong>Completion standard</strong><span>Complete every lesson and earn 80 percent or higher on the final assessment to receive an Obserra Certificate of Training.</span></div>
      </section>

      <section className="purchase-journey" aria-label="Academy purchase and completion journey">
        <article><span>01</span><h2>Select</h2><p>Compare outcomes, duration, level, and price.</p></article>
        <article><span>02</span><h2>Enroll securely</h2><p>Sign in and complete Stripe checkout.</p></article>
        <article><span>03</span><h2>Learn</h2><p>Receive account based access and saved progress.</p></article>
        <article><span>04</span><h2>Certify</h2><p>Pass the assessment and generate your certificate.</p></article>
      </section>

      <section className="academy-spotlight" aria-label="Featured courses">
        <div className="academy-spotlight-heading"><p className="kicker">FEATURED COURSES</p><h2>Start with training built for decisions leaders face now.</h2><p>Premium learning across cybersecurity, executive protection, incident leadership, AI governance, and enterprise technology.</p><div className="academy-spotlight-tabs">{flagshipCourses.map((course, index) => <button key={course.id} type="button" className={index === featuredIndex ? "active" : ""} onClick={() => setFeaturedIndex(index)}>{course.title}</button>)}</div></div>
        <div className="academy-spotlight-grid" aria-live="polite"><article key={featuredCourse.id} className="academy-spotlight-card academy-feature-card"><span>{featuredCourse.department} · {levelTag(featuredCourse.level)}</span><h3>{featuredCourse.title}</h3><p>{featuredCourse.description}</p><div className="academy-feature-meta"><b>{money.format(featuredCourse.price)}</b><em>· {featuredCourse.duration}</em></div><div className="academy-feature-highlights">{featuredCourse.outcomes.slice(0, 3).map((item) => <span key={item}>{item}</span>)}</div><div className="academy-feature-actions"><a href={`/academy/${featuredCourse.id}`}>Preview course</a><a href={`/api/academy/checkout?course=${featuredCourse.id}`} onClick={() => track("academy_checkout_started", { course: featuredCourse.id, source: "featured" })}>Enroll securely</a></div></article></div>
      </section>

      <section className="catalog" id="courses">
        <div className="catalog-heading"><div><p className="kicker">COURSE CATALOG</p><h2>Find the right course without scrolling through the entire catalog.</h2></div><p>{courses.length} paid courses with secure checkout, saved progress, assessments, and certificates.</p></div>

        <div className="academy-commerce-controls">
          <label className="academy-search"><span>Search courses</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search AI governance, CISO, incident response..." type="search" /></label>
          <label className="academy-sort"><span>Sort</span><select value={sort} onChange={(event) => setSort(event.target.value as SortMode)}><option value="recommended">Recommended</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="title">Title</option></select></label>
        </div>

        <nav className="academy-category-rail" aria-label="Browse Academy categories">{departments.map((item) => <button key={item} className={department === item ? "active" : ""} onClick={() => setDepartment(item)}><span>{departmentLabels[item]}</span><b>{item === "All" ? courses.length : courses.filter((course) => course.department === item).length}</b></button>)}</nav>
        <div className="academy-collection-rail" aria-label="Browse course levels">{collections.map((item) => <button key={item.key} className={collection === item.key ? "active" : ""} onClick={() => setCollection(item.key)}><span>{item.label}</span><b>{courses.filter((course) => item.matcher(course.level)).length}</b></button>)}</div>
        <div className="catalog-results"><p className="kicker">{departmentLabels[department]} · {selectedCollection.label}</p><strong>{filteredCourses.length} course{filteredCourses.length === 1 ? "" : "s"} found</strong></div>

        {visibleCourses.length ? <div className="course-grid">{visibleCourses.map((course) => <article key={course.id} className="course-card"><span>{course.department}: {course.track}</span><h3>{course.title}</h3><p>{course.description}</p><div className="course-retail-meta"><i>{levelTag(course.level)}</i><i>{course.level}</i></div><div className="course-highlights">{course.outcomes.slice(0, 2).map((item) => <span key={item}>{item}</span>)}</div><footer><b>{money.format(course.price)}</b><em>· {course.duration}</em></footer><div className="course-card-actions"><a href={`/academy/${course.id}`}>View details</a><a href={`/api/academy/checkout?course=${course.id}`} onClick={() => track("academy_checkout_started", { course: course.id, source: "catalog" })}>Enroll securely</a></div></article>)}</div> : <div className="academy-empty-state"><h3>No courses match those filters.</h3><p>Clear the search or select a broader category.</p><button type="button" onClick={() => { setQuery(""); setDepartment("All"); setCollection("All"); }}>Reset catalog</button></div>}

        {visibleCount < filteredCourses.length && <div className="academy-load-more"><button type="button" onClick={() => setVisibleCount((count) => count + 12)}>Show 12 more courses</button><span>{visibleCourses.length} of {filteredCourses.length} shown</span></div>}
      </section>

      <section className="academy-buyer-paths">
        <article><p className="kicker">INDIVIDUAL LEARNERS</p><h2>Build practical capability at your own pace.</h2><p>Secure enrollment, immediate access, saved progress, assessments, and a verifiable completion record.</p><a href="#courses">Browse courses</a></article>
        <article><p className="kicker">ENTERPRISE TEAMS</p><h2>Train teams against a shared operating standard.</h2><p>Request curated learning paths, cohort delivery, executive briefings, and organizational reporting.</p><a href="/contact?interest=enterprise-training">Request enterprise training</a></article>
      </section>

      <section className="certificate"><div><p className="kicker">COMPLETION RECOGNITION</p><h2>Earn an Obserra Certificate of Training.</h2><p>Complete every lesson and pass the final assessment with an 80 percent score or higher. Certificates include learner name, course, completion date, training hours, and a unique certificate ID.</p></div><p className="fine-print">An Obserra Certificate of Training is a proprietary course completion record. It is not a state license, occupational authorization, accredited academic credit, or third party professional certification.</p></section>

      <section className="academy-purchase-assurance"><h2>Commercial purchase assurance</h2><div><span>Secure Stripe checkout</span><span>Authenticated learner access</span><span>Saved progress</span><span>Assessment based completion</span><span>Certificate record</span><span>Enterprise support available</span></div><p>Questions about enrollment, team licensing, access, or certificates can be directed to <a href="mailto:info@obserrallc.com">info@obserrallc.com</a>.</p></section>

      <footer className="site-footer"><Image src="/brand/obserra-logo.png" alt="Obserra Executive Protection and Intelligence LLC" width={180} height={35} /><p>Obserra Technologies learning product. Proprietary to Obserra Executive Protection &amp; Intelligence LLC. Unauthorized downloading, recording, copying, sharing, distribution, or classroom use is prohibited.</p></footer>
    </main>
  );
}
