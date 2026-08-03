import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { courseForId } from "../../../lib/academy";
import "./course-page.css";

export async function generateMetadata({ params }: { params: Promise<{ courseId: string }> }): Promise<Metadata> {
  const course = courseForId((await params).courseId);
  if (!course) return {};
  return { title: `${course.title} | Obserra Academy`, description: course.description, alternates: { canonical: `/academy/${course.id}` } };
}

export default async function AcademyCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const course = courseForId((await params).courseId);
  if (!course) notFound();
  return <main className="academy-course-page">
    <header className="academy-course-nav"><a href="/academy"><img src="/brand/obserra-logo.png" alt="Obserra Executive Protection and Intelligence LLC" /><b>ACADEMY</b></a><a href="/academy#courses">All courses</a></header>
    <section className="academy-course-hero"><p>{course.track} · {course.level}</p><h1>{course.title}</h1><div><span>{course.duration}</span><span>{course.modules.length} original interactive lessons</span><span>25-question final assessment</span></div><p className="academy-course-description">{course.description}</p><a className="academy-course-checkout" href={`/api/academy/checkout?course=${course.id}`}>Purchase secure enrollment · ${course.price}</a><small>Secure Stripe Checkout. Return directly to paid course access—no Academy sign-in required.</small></section>
    <section className="academy-course-content"><div><p className="academy-course-kicker">WHAT YOU WILL LEARN</p><h2>Practical learning for decisions that matter.</h2><ul>{course.outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}</ul></div><ol>{course.modules.map((module, index) => <li key={module.title}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{module.title}</strong><p>{module.description}</p></div><em>{module.format}<br />{module.duration}</em></li>)}</ol></section>
    <section className="academy-course-certificate"><p className="academy-course-kicker">COMPLETION</p><h2>Receive an Obserra Certificate of Training upon successful completion.</h2><p>Complete every interactive lesson and achieve 80 percent or higher on the final assessment. This informational program does not confer professional licensure, accredited academic credit, or third-party industry certification.</p></section>
  </main>;
}
