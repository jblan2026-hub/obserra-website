"use client";

import { useState } from "react";
import { courses, type Department } from "./courseData";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const departments: (Department | "All")[] = ["All", "Cyber", "Protection", "Intelligence", "Technologies"];

export default function AcademyClient() {
  const [department, setDepartment] = useState<Department | "All">("All");
  const [selected, setSelected] = useState(courses[0]);
  const visibleCourses = department === "All" ? courses : courses.filter((course) => course.department === department);

  function chooseCourse(id: string) {
    setSelected(courses.find((item) => item.id === id) ?? courses[0]);
  }

  return (
    <main>
      <header className="masthead">
        <a href="/" className="brand" aria-label="Obserra Executive Protection and Intelligence LLC home"><img src="/brand/obserra-logo.png" alt="Obserra Executive Protection and Intelligence LLC" /><span className="product-label">ACADEMY</span></a>
        <div className="masthead-actions"><a href="/sign-in" className="nav-link">Learner sign in</a><a href="mailto:info@obserrallc.com?subject=Obserra%20Enterprise%20Training" className="nav-link">Enterprise training</a></div>
      </header>

      <section className="hero">
        <p className="kicker">Obserra Academy and Obserra Technologies</p>
        <h1>Paid, interactive security training built for decisions that matter.</h1>
        <p>Choose a self paced course in cybersecurity, protective operations, intelligence, or secure technology governance. Each paid enrollment includes interactive lessons, scenario practice, a final assessment, and an Obserra Certificate of Training upon successful completion.</p>
        <div className="certificate-promise"><strong>Certificate standard</strong><span>Complete every lesson and earn 80 percent or higher on the final assessment to receive your Obserra Certificate of Training.</span></div>
      </section>

      <section className="catalog" id="courses">
        <div className="catalog-heading"><div><p className="kicker">Course catalog</p><h2>Choose your training track</h2></div><p>{courses.length} paid courses. Secure card or ACH checkout.</p></div>
        <div className="filters" aria-label="Filter courses by department">{departments.map((item) => <button key={item} className={department === item ? "active" : ""} onClick={() => setDepartment(item)}>{item}</button>)}</div>
        <div className="course-grid">{visibleCourses.map((course) => <button key={course.id} className={selected.id === course.id ? "course-card selected" : "course-card"} onClick={() => chooseCourse(course.id)}><span>{course.department}: {course.track}</span><h3>{course.title}</h3><p>{course.description}</p><footer><b>{money.format(course.price)}</b><em>{course.duration}</em></footer></button>)}</div>
      </section>

      <section className="course-detail" aria-live="polite">
        <div className="detail-copy"><p className="kicker">{selected.department}: {selected.track}</p><h2>{selected.title}</h2><p>{selected.description}</p><p className="audience"><strong>Designed for:</strong> {selected.audience}</p><div className="outcomes">{selected.outcomes.map((outcome) => <span key={outcome}>{outcome}</span>)}</div></div>
        <aside className="enrollment-card"><span>Paid enrollment</span><strong>{money.format(selected.price)} <small>per learner</small></strong><p>Duration: {selected.duration}. Includes {selected.modules.length} interactive lessons and a final assessment.</p>{selected.stripePaymentLinkId ? <a className="checkout" href={`/api/academy/checkout?course=${selected.id}`}>Sign in to buy this course</a> : <a className="checkout" href={`mailto:info@obserrallc.com?subject=${encodeURIComponent(`Academy enrollment request: ${selected.title}`)}`}>Request enrollment</a>}<small>{selected.stripePaymentLinkId ? "Sign in first. Use the same email address at checkout. Protected course access activates after Obserra verifies payment." : "This course is being prepared for secure checkout."}</small></aside>
      </section>

      <section className="curriculum"><p className="kicker">Interactive curriculum</p><h2>What you will complete</h2><ol>{selected.modules.map((module, index) => <li key={module.title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{module.title}</h3><p>{module.description}</p></div><em>{module.format}<br />{module.duration}</em></li>)}</ol></section>
      <section className="certificate"><div><p className="kicker">Completion recognition</p><h2>Earn an Obserra Certificate of Training.</h2><p>After paid enrollment, learners complete all lessons and pass the final assessment with an 80 percent score or higher. The certificate records successful completion of the named Obserra Academy training course.</p></div><p className="fine-print">An Obserra Certificate of Training is a proprietary course completion record. It is not a state license, occupational authorization, accredited academic credit, or third party professional certification.</p></section>
      <footer className="site-footer"><img src="/brand/obserra-logo.png" alt="Obserra Executive Protection and Intelligence LLC" /><p>Obserra Technologies learning product. Proprietary to Obserra Executive Protection &amp; Intelligence LLC. Unauthorized downloading, recording, copying, sharing, distribution, or classroom use is prohibited.</p></footer>
    </main>
  );
}
