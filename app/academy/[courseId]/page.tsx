import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { courseForId } from "../../../lib/academy";
import { publicAcademyCourse } from "../../../lib/academy-control";
import { publicationForCourse } from "../coursePublication";
import { courseOfferForCourse } from "../courseOffers";
import "./course-page.css";

const LEGAL_NAME = "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC";
const OFFICIAL_LOGO = "/brand/obserra-logo.png";
const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const revalidate = 10;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseId: string }>;
}): Promise<Metadata> {
  const baseCourse = courseForId((await params).courseId);
  if (!baseCourse) return {};
  const runtime = await publicAcademyCourse(baseCourse);
  if (!runtime.course) {
    return {
      title: "Course Unavailable | Obserra Academy",
      robots: { index: false, follow: false, noarchive: true, nosnippet: true },
    };
  }
  const course = runtime.course;
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

export default async function AcademyCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const baseCourse = courseForId((await params).courseId);
  if (!baseCourse) notFound();
  const runtime = await publicAcademyCourse(baseCourse);
  if (!runtime.course) notFound();

  const course = runtime.course;
  const publication = publicationForCourse(course.id);
  const offer = courseOfferForCourse(course);
  const purchaseAvailable = Boolean(
    runtime.controlPlane === "operational" &&
    runtime.control.purchaseEnabled &&
    offer.livePurchaseEnabled &&
    offer.contentState === "approved" &&
    offer.commerceState === "published",
  );
  const passingScoreLabel = `${publication.passingScore} percent completion standard`;
  const assessmentLabel = publication.assessmentRequired
    ? publication.assessmentDuration
      ? `Protected final assessment, ${publication.assessmentDuration}`
      : "Protected final assessment"
    : "No final assessment required";
  const certificateLabel = publication.certificateIssued
    ? "Governed completion certificate"
    : "Completion record without certificate issuance";

  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.description,
    provider: {
      "@type": "Organization",
      name: LEGAL_NAME,
      url: "https://www.obserrallc.com/academy",
      logo: `https://www.obserrallc.com${OFFICIAL_LOGO}`,
    },
    audience: { "@type": "Audience", audienceType: course.audience },
    offers: {
      "@type": "Offer",
      price: offer.offerPrice,
      priceCurrency: "USD",
      availability: purchaseAvailable ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `https://www.obserrallc.com/academy/${course.id}`,
    },
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
          <a href="/academy#courses">Course roadmap</a>
          <a href="/catalog">Catalog</a>
          <a href="/contact">Contact</a>
        </nav>
      </header>

      <section className="academy-course-hero">
        <div className="academy-course-eyebrow-row">
          <p>{course.track} · {course.level}</p>
          <span>{purchaseAvailable ? "Live enrollment approved" : offer.statusLabel}</span>
        </div>

        <div className="academy-course-grid">
          <div className="academy-course-copy">
            <p className="academy-course-kicker">GOVERNED COURSE BUILD</p>
            <h1>{course.title}</h1>
            <p className="academy-course-description">{course.description}</p>

            <div className="academy-course-pills" aria-label="Course summary">
              <span>{course.duration}</span>
              <span>{course.modules.length} planned instructional modules</span>
              <span>{assessmentLabel}</span>
              {publication.assessmentRequired ? <span>{passingScoreLabel}</span> : null}
              <span>{certificateLabel}</span>
              <span>{offer.contentState === "approved" ? "Content approved" : "Content not yet approved for live sale"}</span>
              <span>{course.audience}</span>
            </div>

            <div className="academy-course-actions">
              {purchaseAvailable ? (
                <a className="academy-course-checkout" href={`/api/academy/checkout?course=${course.id}`}>
                  Enroll through LearnWorlds · {money.format(offer.offerPrice)}
                </a>
              ) : (
                <span className="academy-course-checkout" aria-disabled="true">
                  Live enrollment opens after course approval
                </span>
              )}
              <a className="academy-course-secondary" href="#curriculum">Review planned curriculum</a>
              <a className="academy-course-secondary" href="/contact?interest=academy-launch">Join launch updates</a>
              <a className="academy-course-secondary" href={`/academy/learn/${course.id}`}>Existing learner access</a>
            </div>

            {!purchaseAvailable ? (
              <div className="academy-course-assurance">
                <div>
                  <strong>No live sale of an empty or unapproved course shell</strong>
                  <span>
                    Checkout, pricing, enrollment, and learner access were tested in LearnWorlds Sandbox. Live
                    sales remain disabled until the actual course, assessment, accessibility evidence, completion
                    rules, and certificate have passed validation.
                  </span>
                </div>
              </div>
            ) : null}

            <div className="academy-course-assurance">
              <div><strong>Authoritative LearnWorlds checkout</strong><span>After approval, enrollment will use the governed LearnWorlds product and learner identity system.</span></div>
              <div><strong>Substantive professional instruction required</strong><span>Every module must contain complete instruction, practice, knowledge checks, learner materials, and evidence before publication.</span></div>
              <div><strong>Authoritative grounding</strong><span>Relevant standards and government guidance are connected to the course without presenting nonbinding guidance as law.</span></div>
              <div><strong>Governed completion standard</strong><span>{publication.assessmentRequired ? `Complete every required activity and achieve ${publication.passingScore} percent or higher on the approved final assessment.` : "Complete every required activity defined in the approved course contract."}</span></div>
            </div>
          </div>

          <aside className="academy-course-card">
            <p>{offer.offerLabel}</p>
            <strong>{money.format(offer.offerPrice)}</strong>
            <span>{offer.savings > 0 ? `${money.format(offer.listPrice)} list · save ${money.format(offer.savings)}` : "planned price per learner"}</span>
            <dl>
              <div><dt>Duration</dt><dd>{course.duration}</dd></div>
              <div><dt>Modules</dt><dd>{course.modules.length}</dd></div>
              <div><dt>Audience</dt><dd>{course.audience}</dd></div>
              <div><dt>Content state</dt><dd>{offer.contentState}</dd></div>
              <div><dt>Commerce state</dt><dd>{offer.commerceState}</dd></div>
              <div><dt>Assessment</dt><dd>{assessmentLabel}</dd></div>
              {publication.version ? <div><dt>Course version</dt><dd>{publication.version}</dd></div> : null}
            </dl>
            {purchaseAvailable ? (
              <a className="academy-course-checkout academy-course-card-cta" href={`/api/academy/checkout?course=${course.id}`}>
                Enroll through LearnWorlds
              </a>
            ) : (
              <span className="academy-course-checkout academy-course-card-cta" aria-disabled="true">
                Build in progress
              </span>
            )}
            <small>The displayed offer is aligned with the governed LearnWorlds canary: {money.format(offer.listPrice)} list price, {money.format(offer.offerPrice)} launch offer, and {money.format(offer.savings)} savings where applicable.</small>
          </aside>
        </div>
      </section>

      <section className="academy-course-proof">
        <article><span>01</span><h2>What must be built</h2><p>Complete instructional modules, narrated presentations, transcripts, scenarios, exercises, knowledge checks, workbook, assessment, source register, and certificate rules.</p></article>
        <article><span>02</span><h2>What must be verified</h2><p>Content accuracy, accessibility, branding, duration, price parity, LearnWorlds import, learner completion, assessment scoring, and certificate issuance.</p></article>
        <article><span>03</span><h2>What authorizes sale</h2><p>Evidence that every required deliverable exists and works, followed by explicit owner approval and a controlled change from Sandbox build to published.</p></article>
      </section>

      <section className="academy-course-content" id="curriculum">
        <div className="academy-course-outcomes">
          <p className="academy-course-kicker">PLANNED LEARNING OUTCOMES</p>
          <h2>The course build must produce evidence that learners can perform these outcomes.</h2>
          <ul>{course.outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}</ul>
          {publication.prerequisites.length > 0 ? (
            <>
              <p className="academy-course-kicker">PREREQUISITES</p>
              <ul>{publication.prerequisites.map((prerequisite) => <li key={prerequisite}>{prerequisite}</li>)}</ul>
            </>
          ) : null}
        </div>

        <ol className="academy-course-modules">
          {course.modules.map((module, index) => (
            <li key={`${index}-${module.title}`}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><strong>{module.title}</strong><p>{module.description}</p></div>
              <em>{module.format}<br />{module.duration}</em>
            </li>
          ))}
        </ol>
      </section>

      <section className="academy-course-certificate">
        <div>
          <p className="academy-course-kicker">COMPLETION GATE</p>
          <h2>{publication.certificateIssued ? "Certificate issuance remains blocked until the complete course works." : "The completion record remains blocked until the complete course works."}</h2>
          <p>{publication.assessmentRequired ? `The learner must complete every required activity and achieve ${publication.passingScore} percent or higher on the approved final assessment. Assessment and certificate behavior cannot be accepted while the LearnWorlds course contains no instructional content.` : "The learner must complete every approved course activity before any completion record is issued."}</p>
          {publication.credentialDisclaimer ? <p>{publication.credentialDisclaimer}</p> : null}
        </div>
        <aside>
          <strong>Current factual status</strong>
          <p>Sandbox checkout, invoice, entitlement, and course-shell access passed. Actual course content, assessment, completion, and certificate remain incomplete.</p>
        </aside>
      </section>
    </main>
  );
}
