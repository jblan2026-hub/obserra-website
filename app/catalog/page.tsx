import type { Metadata } from "next";
import Image from "next/image";
import { courses } from "../academy/courseData";
import { courseOfferForCourse } from "../academy/courseOffers";
import { academyFlagshipCatalog } from "./catalogData";
import "./catalog.css";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const roadmapCourseIds = [
  "cybersecurity-foundations",
  "zero-trust-strategy",
  "executive-threat-assessment",
  "secure-enterprise-llm-deployment",
  "incident-response-leadership",
  "ciso-leadership-playbook",
  "identity-security-access-governance",
  "business-continuity-cyber-resilience",
] as const;

const featuredCourses = roadmapCourseIds
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
  title: "Enterprise Product Catalog | Obserra",
  description:
    "Review the governed Obserra Academy course roadmap, enterprise services, and applications without representing unfinished training as available for live purchase.",
  alternates: { canonical: "/catalog" },
  keywords: [
    "enterprise product catalog",
    "commercial cybersecurity services",
    "executive protection advisory",
    "protective intelligence",
    "AI governance",
    "professional training roadmap",
  ],
  openGraph: {
    title: "Obserra Enterprise Product Catalog",
    description:
      "Review the Academy course roadmap, proof assets, and controlled paths into Obserra services and applications.",
    url: "https://www.obserrallc.com/catalog",
    type: "website",
    images: [{ url: "/brand/visuals/obserra-cybersecurity.png", width: 1344, height: 768, alt: "Obserra enterprise product catalog" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Obserra Enterprise Product Catalog",
    description:
      "Academy course roadmap, services, applications, and controlled commercial release paths.",
    images: ["/brand/visuals/obserra-cybersecurity.png"],
  },
};

export default function CatalogPage() {
  return (
    <main className="catalog-page">
      <header className="catalog-nav">
        <a href="/" className="catalog-brand" aria-label="Obserra home">
          <Image src="/brand/obserra-logo.png" alt="Obserra Executive Protection and Intelligence LLC" width={286} height={55} />
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
          <h1>Review what is available now and what remains in controlled development.</h1>
          <p>
            Services and applications follow their existing commercial paths. Academy courses remain gated until
            complete instructional content, assessment, accessibility, branding, pricing, and certificate evidence
            support live publication.
          </p>
        </div>

        <aside className="catalog-hero-panel" aria-label="Commercial release paths">
          <p className="catalog-panel-label">CONTROLLED PATH TO VALUE</p>
          <h2>Choose the correct commercial lane.</h2>
          <p>
            Move consulting engagements to Services, software offerings to Apps, and course launch interest to the
            governed Academy roadmap.
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
              <strong>Governed course development roadmap</strong>
              <span>Review canary status and register for launch updates.</span>
            </a>
          </div>
        </aside>
      </section>

      <section className="catalog-section">
        <div className="section-head">
          <p className="eyebrow">ACADEMY COURSE ROADMAP</p>
          <h2>Planned courses with explicit content and commerce status</h2>
        </div>
        <div className="course-offerings-grid">
          {featuredCourses.map((course, index) => {
            const tone = courseTones[index % courseTones.length];
            const offer = courseOfferForCourse(course);

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
                  <b>{offer.commerceState === "sandbox-build" ? "Canary build" : "Coming soon"}</b>
                </div>
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <div className="course-offering-pills">
                  {course.outcomes.slice(0, 3).map((outcome) => (
                    <span key={outcome}>{outcome}</span>
                  ))}
                  <span>{offer.statusLabel}</span>
                </div>
                <footer>
                  <div className="course-offering-price">
                    <strong>{money.format(offer.offerPrice)}</strong>
                    <span>{offer.savings > 0 ? `${money.format(offer.listPrice)} list · save ${money.format(offer.savings)}` : "planned price per learner"}</span>
                  </div>
                  <a href={`/academy/${course.id}`}>View build status</a>
                </footer>
                <a className="section-link" href="/contact?interest=academy-launch">Join launch updates</a>
              </article>
            );
          })}
        </div>
      </section>

      <section className="catalog-section">
        <article className="academy-flagship-card">
          <div className="section-head">
            <p className="eyebrow">ACADEMY FLAGSHIP ROADMAP</p>
            <h2>Additional planned courses for campaigns and cohorts</h2>
          </div>
          <ol className="academy-flagship-list">
            {academyFlagshipCourses.map((course) => {
              const offer = courseOfferForCourse(course);
              return (
                <li key={course.id}>
                  <a href={`/academy/${course.id}`}>
                    <span>{course.title}</span>
                    <strong>{money.format(offer.offerPrice)} planned</strong>
                  </a>
                </li>
              );
            })}
          </ol>
          <a className="section-link" href="/academy">Open full Academy roadmap</a>
        </article>
      </section>
    </main>
  );
}
