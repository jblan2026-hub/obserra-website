import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { courseForId } from "../../../lib/academy";
import "./course-page.css";

const LEGAL_NAME = "Obserra Executive Protection & Intelligence, LLC";
const OFFICIAL_LOGO = "/brand/obserra-logo.png";
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export async function generateMetadata({ params }: { params: Promise<{ courseId: string }> }): Promise<Metadata> {
  const course = courseForId((await params).courseId);
  if (!course) return {};
  return {
    title: `${course.title} | Obserra Academy`,
    description: course.description,
    alternates: { canonical: `/academy/${course.id}` },
    openGraph: {
      title: `${course.title} | Obserra Academy`,
      description: course.description,
      url: `https://www.obserrallc.com/academy/${course.id}`,
      type: "article",
      images: [{ url: OFFICIAL_LOGO, width: 1344, height: 768, alt: `${LEGAL_NAME}: ${course.title}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${course.title} | Obserra Academy`,
      description: course.description,
      images: [OFFICIAL_LOGO],
    },
  };
}

export default async function AcademyCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const course = courseForId((await params).courseId);
  if (!course) notFound();
  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.description,
    provider: { "@type": "Organization", name: LEGAL_NAME, url: "https://www.obserrallc.com/academy", logo: `https://www.obserrallc.com${OFFICIAL_LOGO}` },
    audience: { "@type": "Audience", audienceType: course.audience },
    offers: { "@type": "Offer", price: course.price, priceCurrency: "USD", availability: "https://schema.org/InStock", url: `https://www.obserrallc.com/academy/${course.id}` },
    hasCourseInstance: { "@type": "CourseInstance", courseMode: "online", courseWorkload: course.duration },
  };
  return (
    <main className="academy-course-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }} />

      <header className="academy-course-nav">
        <a href="/academy" className="academy-course-brand">
          <Image src={OFFICIAL_LOGO} alt={LEGAL_NAME} width={220} height={42} priority />
          <b>ACADEMY</b>
        </a>
        <nav aria-label="Course navigation">
          <a href="/academy#courses">All courses</a>
          <a href="/catalog">Catalog</a>
          <a href="/contact">Contact</a>
        </nav>
      </header>

      <section className="academy-course-hero">
        <div className="academy-course-eyebrow-row">
          <p>{course.track} · {course.level}</p>
          <span>Paid enrollment</span>
        </div>

        <div className="academy-course-grid">
          <div className="academy-course-copy">
            <p className="academy-course-kicker">AI NATIVE PROFESSIONAL TRAINING</p>
            <h1>{course.title}</h1>
            <p className="academy-course-description">{course.description}</p>

            <div className="academy-course-pills" aria-label="Course summary">
              <span>{course.duration}</span>
              <span>{course.modules.length} original lessons</span>
              <span>25 question final assessment</span>
              <span>80 percent completion standard</span>
              <span>Obserrian AI Tutor after authorized access</span>
              <span>{course.audience}</span>
            </div>

            <div className="academy-course-actions">
              <a className="academy-course-checkout" href={`/api/academy/checkout?course=${course.id}`}>Purchase secure enrollment · {money.format(course.price)}</a>
              <a className="academy-course-secondary" href="#curriculum">See curriculum</a>
            </div>

            <div className="academy-course-assurance">
              <div>
                <strong>Secure Stripe Checkout</strong>
                <span>Buy once and return directly to authorized paid course access.</span>
              </div>
              <div>
                <strong>Substantive professional instruction</strong>
                <span>Every lesson teaches the published course subject, why it matters, how it is applied, and how decisions are documented.</span>
              </div>
              <div>
                <strong>Authoritative grounding</strong>
                <span>Relevant laws, regulations, standards, government guidance, and professional frameworks are connected directly to the lesson where applicable.</span>
              </div>
              <div>
                <strong>Obserrian Academy Tutor</strong>
                <span>The course aware AI tutor unlocks with authorized access and can explain concepts, create ungraded practice, and translate the lesson into business use.</span>
              </div>
              <div>
                <strong>Digitally signed certificate standard</strong>
                <span>Complete every lesson and score 80 percent or higher on the protected final assessment.</span>
              </div>
            </div>
          </div>

          <aside className="academy-course-card">
            <p>Course investment</p>
            <strong>{money.format(course.price)}</strong>
            <span>per learner</span>
            <dl>
              <div><dt>Duration</dt><dd>{course.duration}</dd></div>
              <div><dt>Lessons</dt><dd>{course.modules.length}</dd></div>
              <div><dt>Audience</dt><dd>{course.audience}</dd></div>
              <div><dt>Format</dt><dd>Self paced online, AI native</dd></div>
              <div><dt>AI support</dt><dd>Obserrian Academy Tutor with authorized access</dd></div>
            </dl>
            <a className="academy-course-checkout academy-course-card-cta" href={`/api/academy/checkout?course=${course.id}`}>Buy secure enrollment</a>
            <small>Enterprise ready training with authoritative grounding, applied scenarios, an assessment protected AI tutor, a governed completion path, and a cryptographically signed completion certificate issued by {LEGAL_NAME}.</small>
          </aside>
        </div>
      </section>

      <section className="academy-course-proof">
        <article>
          <span>01</span>
          <h2>What this course teaches</h2>
          <p>The instruction is derived from the published course description and outcomes, then developed into professional concepts, applied methods, scenarios, and decision practices.</p>
        </article>
        <article>
          <span>02</span>
          <h2>Why the instruction is defensible</h2>
          <p>Lessons identify the relevant authoritative basis and distinguish legal requirements, regulations, standards, recognized guidance, organizational policy, and professional practice.</p>
        </article>
        <article>
          <span>03</span>
          <h2>How learners apply it</h2>
          <p>Documented public examples, realistic business scenarios, job aids, knowledge checks, and the Obserrian Tutor connect the material to professional use.</p>
        </article>
      </section>

      <section className="academy-course-content" id="curriculum">
        <div className="academy-course-outcomes">
          <p className="academy-course-kicker">WHAT YOU WILL LEARN</p>
          <h2>Practical learning tied directly to this published course description and intended professional audience.</h2>
          <ul>
            {course.outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}
          </ul>
        </div>

        <ol className="academy-course-modules">
          {course.modules.map((module, index) => (
            <li key={module.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <strong>{module.title}</strong>
                <p>{module.description}</p>
              </div>
              <em>{module.format}<br />{module.duration}</em>
            </li>
          ))}
        </ol>
      </section>

      <section className="academy-course-certificate">
        <div>
          <p className="academy-course-kicker">COMPLETION</p>
          <h2>Receive a digitally signed Certificate of Training Completion.</h2>
          <p>Complete every required lesson and achieve 80 percent or higher on the final assessment. The Obserrian Tutor is available during learning and practice but is paused during the graded final assessment. The certificate is cryptographically signed by Dr. Jody Blanchard, issued by {LEGAL_NAME}, and linked to a public verification record.</p>
        </div>
        <aside>
          <strong>Buyer safe details</strong>
          <p>One purchase route. One published duration. One lesson path. One protected assessment standard. One signed certificate record for the learner who finishes the course.</p>
        </aside>
      </section>
    </main>
  );
}
