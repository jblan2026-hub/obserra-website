import type { Metadata } from "next";
import Image from "next/image";
import { courses } from "../academy/courseData";
import AcademyCheckoutForm from "../academy/AcademyCheckoutForm";
import { academyLicensedSalesEnabled } from "../../lib/academy-licensing";
import { LEGAL_ENTITY_NAME } from "@/lib/legal-identity";
import {
  academyFlagshipCatalog,
} from "./catalogData";
import "./catalog.css";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const buyableCourseIds = [
  "zero-trust-strategy",
  "executive-threat-assessment",
  "secure-enterprise-llm-deployment",
  "incident-response-leadership",
  "ciso-leadership-playbook",
  "identity-security-access-governance",
  "business-continuity-cyber-resilience",
  "generative-ai-business-leaders",
] as const;

const featuredCourses = buyableCourseIds
  .map((courseId) => courses.find((course) => course.id === courseId))
  .filter((course): course is (typeof courses)[number] => Boolean(course));

const academyFlagshipCourses = academyFlagshipCatalog
  .map((title) => courses.find((course) => course.title === title))
  .filter((course): course is (typeof courses)[number] => Boolean(course));

const courseTones = [
  {
    accent: "#f6c45f",
    accentSoft: "#f6c45f22",
    border: "#f6c45f55",
    glow: "rgba(246, 196, 95, 0.22)",
  },
  {
    accent: "#73d9ff",
    accentSoft: "#73d9ff22",
    border: "#73d9ff55",
    glow: "rgba(115, 217, 255, 0.22)",
  },
  {
    accent: "#8ef0b0",
    accentSoft: "#8ef0b022",
    border: "#8ef0b055",
    glow: "rgba(142, 240, 176, 0.2)",
  },
  {
    accent: "#ff9c73",
    accentSoft: "#ff9c7322",
    border: "#ff9c7355",
    glow: "rgba(255, 156, 115, 0.22)",
  },
] as const;

export const metadata: Metadata = {
  title: "Enterprise Product Catalog",
  description:
    `Evaluate ${LEGAL_ENTITY_NAME} Academy courses, proof assets, services, and applications with purchase controls that reflect the current governed sales state.`,
  alternates: { canonical: "/catalog" },
  keywords: [
    "enterprise product catalog",
    "commercial cybersecurity services",
    "executive protection advisory",
    "protective intelligence",
    "AI governance",
    "professional training",
  ],
  openGraph: {
    title: `${LEGAL_ENTITY_NAME} Enterprise Product Catalog`,
    description:
      `Evaluate training offers, proof assets, and clear next steps into ${LEGAL_ENTITY_NAME} services and applications.`,
    url: "https://www.obserrallc.com/catalog",
    type: "website",
    images: [{ url: "/brand/visuals/obserra-cybersecurity.png", width: 1344, height: 768, alt: `${LEGAL_ENTITY_NAME} enterprise product catalog` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${LEGAL_ENTITY_NAME} Enterprise Product Catalog`,
    description:
      "Professional training offers and buyer-ready proof assets with governed purchase controls.",
    images: ["/brand/visuals/obserra-cybersecurity.png"],
  },
};

export default function CatalogPage() {
  const licensedSalesEnabled = academyLicensedSalesEnabled();

  return (
    <main className="catalog-page">
      <header className="catalog-nav">
        <a href="/" className="catalog-brand" aria-label={`${LEGAL_ENTITY_NAME} home`}>
          <Image src="/brand/obserra-logo.png" alt={LEGAL_ENTITY_NAME} width={286} height={55} />
          <span>ENTERPRISE CATALOG</span>
        </a>
        <nav aria-label="Enterprise catalog navigation">
          <a href="/services">Services</a>
          <a href="/apps">Applications</a>
          <a href="/academy">Academy</a>
          <a href="/trust">Trust Center</a>
          <a href="/contact" className="catalog-cta">Book executive briefing</a>
        </nav>
      </header>

      <section className="catalog-hero">
        <div className="catalog-hero-copy">
          <p className="eyebrow">COMMERCIAL PRODUCT CATALOG</p>
          <h1>{licensedSalesEnabled
            ? "Choose your training program, purchase securely, and deploy capability faster."
            : "Evaluate training programs, proof assets, and enterprise capabilities in one place."}</h1>
          <p>
            {licensedSalesEnabled
              ? "Compare Academy courses, review proof assets, and move into secure checkout when you are ready."
              : "Academy course previews are available now. New enrollment and payment remain disabled until the required licensing is complete and the governed sales gate is enabled."}
          </p>
        </div>

        <aside className="catalog-hero-panel" aria-label="Buyer pathways">
          <p className="catalog-panel-label">CHOOSE YOUR PATH</p>
          <h2>Move from evaluation to the right next step.</h2>
          <p>
            Review training here. Move consulting engagements to Services and software offerings to Apps.
          </p>
          <div className="catalog-route-grid">
            <a className="catalog-route-card" href="/services">
              <p>Services</p>
              <strong>Consulting, engagements, retainers</strong>
              <span>Get scoped advisory and execution support.</span>
            </a>
            <a className="catalog-route-card" href="/apps">
              <p>Apps</p>
              <strong>Products, editions, licensing</strong>
              <span>Review software offerings and deployment paths.</span>
            </a>
            <a className="catalog-route-card" href="/academy">
              <p>Academy</p>
              <strong>Professional courses and cohort training</strong>
              <span>{licensedSalesEnabled ? "Purchase through secure checkout." : "Preview courses while new enrollment is licensing-gated."}</span>
            </a>
          </div>
        </aside>
      </section>

      {!licensedSalesEnabled ? (
        <section className="academy-commerce-notice" role="status" aria-label="Academy sales status">
          <strong>Academy LMS is live; new enrollment is not yet open</strong>
          <p>Course previews and existing learner access remain available. New enrollment and payment stay disabled until the required licensing is complete and the sales gate is explicitly enabled.</p>
        </section>
      ) : null}

      <section className="catalog-section">
        <div className="section-head">
          <p className="eyebrow">ACADEMY COURSES</p>
          <h2>{licensedSalesEnabled ? "Featured courses available for secure purchase" : "Featured courses available to preview"}</h2>
        </div>
        <div className="course-offerings-grid">
          {featuredCourses.map((course, index) => {
            const tone = courseTones[index % courseTones.length];

            return (
            <article
              key={course.id}
              className="course-offering-card"
              style={{
                ["--card-accent" as string]: tone.accent,
                ["--card-accent-soft" as string]: tone.accentSoft,
                ["--card-border" as string]: tone.border,
                ["--card-glow" as string]: tone.glow,
              }}
            >
              <div className="course-offering-top">
                <span>{course.department} · {course.level}</span>
                <b>{course.duration}</b>
              </div>
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <div className="course-offering-pills">
                {course.outcomes.slice(0, 3).map((outcome) => (
                  <span key={outcome}>{outcome}</span>
                ))}
              </div>
              <footer>
                <div className="course-offering-price">
                  <strong>{money.format(course.price)}</strong>
                  <span>per learner</span>
                </div>
                {licensedSalesEnabled ? (
                  <AcademyCheckoutForm courseId={course.id} label="Buy now" source="course-card" className="academy-course-buy-button" />
                ) : (
                  <a className="academy-course-buy-button" href={`/academy/${course.id}`}>Preview course</a>
                )}
              </footer>
              <a className="section-link" href={`/academy/${course.id}`}>Course details</a>
            </article>
            );
          })}
        </div>
      </section>

      <section className="catalog-section">
        <article className="academy-flagship-card">
          <div className="section-head">
            <p className="eyebrow">ACADEMY FLAGSHIP</p>
            <h2>More Academy courses for campaigns and cohorts</h2>
          </div>
          <ol className="academy-flagship-list">
            {academyFlagshipCourses.map((course) => (
              <li key={course.id}>
                {licensedSalesEnabled ? (
                  <AcademyCheckoutForm courseId={course.id} label={`${course.title} · ${money.format(course.price)}`} source="course-card" className="academy-flagship-buy-button" />
                ) : (
                  <a href={`/academy/${course.id}`} className="academy-flagship-buy-button">{course.title} · {money.format(course.price)} · Preview</a>
                )}
              </li>
            ))}
          </ol>
          <a className="section-link" href="/academy">Open full Academy catalog</a>
        </article>
      </section>
    </main>
  );
}
