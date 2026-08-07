import type { Metadata } from "next";
import Link from "next/link";
import { courses } from "../../academy/courseData";
import { requireOwnerPage } from "../../../lib/owner-auth";
import AcademyOwnerCatalog from "./AcademyOwnerCatalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Academy Review",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

export default async function OwnerAcademyPage() {
  await requireOwnerPage("/command-center/academy");

  const summaries = courses.map((course) => ({
    id: course.id,
    title: course.title,
    department: course.department,
    level: course.level,
    description: course.description,
    duration: course.duration,
    lessonCount: course.modules.length,
    price: course.price,
  }));

  return (
    <main className="owner-main">
      <section className="owner-section">
        <p className="owner-eyebrow">PRIVATE ACADEMY REVIEW SITE</p>
        <h1>Inspect every course without entering the public Academy learner flow.</h1>
        <p>
          This Command Center workspace renders the complete course-specific lesson content, source grounding,
          guided practice, materials, knowledge checks, final assessment, and certificate sample. Review actions
          do not create a purchase, enrollment, learner-progress record, assessment record, or issued certificate.
        </p>
        <div className="owner-actions">
          <Link href="/command-center" className="owner-link-button">Return to Mission Control</Link>
          <a href="https://www.obserrallc.com/academy" className="owner-link-button" target="_blank" rel="noreferrer">
            Open public Academy
          </a>
        </div>
      </section>
      <AcademyOwnerCatalog courses={summaries} />
    </main>
  );
}
