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

const retailCollections = [
  { key: "All", label: "All", matcher: (level: CourseLevel) => level.length > 0 },
  { key: "Starter", label: "Starter", matcher: (level: CourseLevel) => level === "Foundation" },
  { key: "Career Growth", label: "Career Growth", matcher: (level: CourseLevel) => level === "Professional" || level === "Advanced" },
  { key: "Executive", label: "Executive", matcher: (level: CourseLevel) => level === "Executive Intensive" || level === "CISO Masterclass" },
] as const;

type RetailCollection = typeof retailCollections[number]["key"];

function levelTag(level: CourseLevel): string {
  if (level === "Foundation") return "Starter";
  if (level === "Professional") return "Professional";
  if (level === "Advanced") return "Advanced";
  return "Executive";
}

const featuredCourseIds = [
  "zero-trust-strategy",
  "executive-threat-assessment",
  "secure-enterprise-llm-deployment",
  "incident-response-leadership",
  "ciso-leadership-playbook",
] as const;

export default function AcademyClient() {
  const [department, setDepartment] = useState<Department | "All">("All");
  const [collection, setCollection] = useState<RetailCollection>("All");
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const selected = courses[0];
  const selectedCollection = retailCollections.find((item) => item.key === collection)!;
  const flagshipCourses = useMemo(
    () => courses.filter((course) => featuredCourseIds.includes(course.id as typeof featuredCourseIds[number])),
    [],
  );
  const featuredCourse = flagshipCourses[featuredIndex % flagshipCourses.length];

  useEffect(() => {
    if (flagshipCourses.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setFeaturedIndex((current) => (current + 1) % flagshipCourses.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [flagshipCourses.length]);

  const visibleCourses = courses
    .filter((course) => (department === "All" ? true : course.department === department))
    .filter((course) => selectedCollection.matcher(course.level))
    .sort((a, b) => a.price - b.price || a.title.localeCompare(b.title));

  return (
    <main>
      <header className="masthead">
        <a href="/" className="brand" aria-label="Obserra Executive Protection and Intelligence LLC home"><Image src="/brand/obserra-logo.png" alt="Obserra Executive Protection and Intelligence LLC" width={286} height={55} /><span className="product-label">ACADEMY</span></a>
        <div className="masthead-actions"><a href="/services" className="nav-link">Services</a><a href="/protection-intelligence" className="nav-link">Protection</a><a href="/catalog" className="nav-link">Catalog</a><a href="/contact" className="nav-link">Contact</a><a href="mailto:info@obserrallc.com?subject=Obserra%20Enterprise%20Training" className="nav-link">Enterprise training</a></div>
      </header>

      <section className="hero">
        <p className="kicker">Scalable revenue engine: Obserra Academy</p>
        <h1>Shop practical cybersecurity and intelligence training like a premium course catalog.</h1>
        <p>Pick a category, compare time and price, and buy in one click. Every course is paid, self-paced, and built from real cybersecurity, protection, intelligence, and secure technology workflows.</p>
        <div className="certificate-promise"><strong>Certificate standard</strong><span>Complete every lesson and earn 80 percent or higher on the final assessment to receive your Obserra Certificate of Training.</span></div>
      </section>

      <section className="academy-spotlight" aria-label="Flagship courses">
        <div className="academy-spotlight-heading">
          <p className="kicker">FLAGSHIP COURSES</p>
          <h2>Lead with the Academy offering most relevant to executive buyers right now.</h2>
          <p>
            The featured course rotates automatically so the page keeps showing a different premium
            must-take option while still keeping the full catalog below.
          </p>
          <div className="academy-spotlight-tabs" aria-label="Featured course rotation">
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
              <b>{money.format(featuredCourse.price)}</b>
              <em>· {featuredCourse.duration}</em>
            </div>
            <div className="academy-feature-highlights">
              {featuredCourse.outcomes.slice(0, 3).map((highlight) => (
                <span key={highlight}>{highlight}</span>
              ))}
            </div>
            <div className="academy-feature-actions">
              <a href={`/academy/${featuredCourse.id}`}>Preview course</a>
              <a href={`/api/academy/checkout?course=${featuredCourse.id}`} onClick={() => track("academy_checkout_started", { course: featuredCourse.id, source: "featured_spotlight" })}>Buy now</a>
            </div>
          </article>
        </div>
      </section>

      <section className="catalog" id="courses">
        <div className="catalog-heading"><div><p className="kicker">Course catalog</p><h2>Choose the track that matches your mission</h2></div><p>{courses.length} paid courses with secure checkout and immediate learner access.</p></div>
        <nav className="academy-category-rail" aria-label="Browse Academy categories">{departments.map((item) => { const count = item === "All" ? courses.length : courses.filter((course) => course.department === item).length; return <button key={item} className={department === item ? "active" : ""} onClick={() => setDepartment(item)}><span>{departmentLabels[item]}</span><b>{count}</b></button>; })}</nav>
        <div className="academy-collection-rail" aria-label="Shop collections">{retailCollections.map((item) => { const count = courses.filter((course) => item.matcher(course.level)).length; return <button key={item.key} className={collection === item.key ? "active" : ""} onClick={() => setCollection(item.key)}><span>{item.label}</span><b>{count}</b></button>; })}</div>
        <div className="catalog-results"><p className="kicker">{departmentLabels[department]} · {collection}</p><strong>{visibleCourses.length} course{visibleCourses.length === 1 ? "" : "s"} available</strong></div>
        <div className="course-grid">{visibleCourses.map((course) => <article key={course.id} className="course-card"><span>{course.department}: {course.track}</span><h3>{course.title}</h3><p>{course.description}</p><div className="course-retail-meta"><i>{levelTag(course.level)}</i><i>{course.level}</i></div><div className="course-highlights">{course.outcomes.slice(0, 2).map((item) => <span key={item}>{item}</span>)}</div><footer><b>{money.format(course.price)}</b><em>· {course.duration}</em></footer><div className="course-card-actions"><a href={`/academy/${course.id}`}>View course</a><a href={`/api/academy/checkout?course=${course.id}`} onClick={() => track("academy_checkout_started", { course: course.id, source: "course_tile" })}>Buy now</a></div></article>)}</div>
      </section>

      <section className="course-detail" aria-live="polite">
        <div className="detail-copy"><p className="kicker">{selected.department}: {selected.track}</p><h2>{selected.title}</h2><p>{selected.description}</p><p className="audience"><strong>Designed for:</strong> {selected.audience}</p><div className="outcomes">{selected.outcomes.map((outcome) => <span key={outcome}>{outcome}</span>)}</div></div>
        <aside className="enrollment-card"><span>Paid enrollment</span><strong>{money.format(selected.price)} <small>per learner</small></strong><p>Duration: {selected.duration}. Includes {selected.modules.length} interactive lessons, applied learning, and a final assessment aligned to Obserra delivery standards.</p><a className="checkout" href={`/api/academy/checkout?course=${selected.id}`} onClick={() => track("academy_checkout_started", { course: selected.id })}>Purchase secure enrollment</a><small>Secure Stripe checkout returns learners directly to paid course access. No Academy sign-in is required.</small></aside>
      </section>

      <section className="curriculum"><p className="kicker">Interactive curriculum</p><h2>What you will complete</h2><ol>{selected.modules.map((module, index) => <li key={module.title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{module.title}</h3><p>{module.description}</p></div><em>{module.format}<br />{module.duration}</em></li>)}</ol></section>
      <section className="certificate"><div><p className="kicker">Completion recognition</p><h2>Earn an Obserra Certificate of Training.</h2><p>After paid enrollment, learners complete all lessons and pass the final assessment with an 80 percent score or higher. The certificate validates successful completion of training tied to cybersecurity, intelligence, protection, and secure technology practice.</p></div><p className="fine-print">An Obserra Certificate of Training is a proprietary course completion record. It is not a state license, occupational authorization, accredited academic credit, or third party professional certification.</p></section>
      <footer className="site-footer"><Image src="/brand/obserra-logo.png" alt="Obserra Executive Protection and Intelligence LLC" width={180} height={35} /><p>Obserra Technologies learning product. Proprietary to Obserra Executive Protection &amp; Intelligence LLC. Unauthorized downloading, recording, copying, sharing, distribution, or classroom use is prohibited.</p></footer>
    </main>
  );
}
