import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LEGAL_ENTITY_NAME } from "@/lib/legal-identity";
import "./enterprise.css";

export const metadata: Metadata = {
  title: "Obserra Academy Enterprise | Team Training and Learning Paths",
  description:
    "Build enterprise cybersecurity, intelligence, executive protection, and AI governance capability through curated learning paths, cohort delivery, manager reporting, and team licensing.",
  alternates: { canonical: "/academy/enterprise" },
  keywords: [
    "enterprise cybersecurity training",
    "AI governance training for teams",
    "executive protection training",
    "corporate security learning paths",
    "CISO team development",
  ],
  openGraph: {
    title: "Obserra Academy Enterprise",
    description: "Curated learning paths, cohort delivery, manager visibility, and enterprise training support.",
    url: "https://www.obserrallc.com/academy/enterprise",
    type: "website",
    images: [
      {
        url: "/brand/visuals/obserra-cybersecurity.png",
        width: 1344,
        height: 768,
        alt: "Obserra Academy Enterprise",
      },
    ],
  },
};

const learningPaths = [
  {
    title: "Executive Cyber Governance",
    audience: "Boards, CEOs, CIOs, CISOs, and risk leaders",
    outcome: "Improve oversight, decision quality, risk communication, and accountability at the executive level.",
    modules: ["Board cyber oversight", "Enterprise risk decisions", "Incident leadership", "AI governance"],
  },
  {
    title: "Cybersecurity Leadership",
    audience: "Security leaders, program managers, and emerging CISOs",
    outcome: "Build practical leadership capability across strategy, governance, operations, and board communication.",
    modules: ["CISO leadership", "Zero trust strategy", "Risk prioritization", "Security transformation"],
  },
  {
    title: "AI Governance and Secure Adoption",
    audience: "AI councils, legal, privacy, risk, technology, and security teams",
    outcome: "Create a shared operating standard for responsible AI adoption, oversight, and control implementation.",
    modules: ["AI governance foundations", "Model risk", "Secure enterprise AI", "Policy and assurance"],
  },
  {
    title: "Protective Intelligence and Executive Safety",
    audience: "Security teams, executive offices, travel teams, and protection professionals",
    outcome: "Strengthen threat assessment, travel risk, digital exposure awareness, and executive safety planning.",
    modules: ["Threat assessment", "Travel risk", "Digital exposure", "Protective intelligence"],
  },
];

const capabilities = [
  ["Curated learning paths", "Courses are assembled around roles, business outcomes, and organizational priorities rather than a generic catalog."],
  ["Cohort delivery", "Launch structured programs for leadership teams, business units, security teams, or cross functional governance groups."],
  ["Manager visibility", "Track enrollment, progression, completion, assessment results, and certificate records for authorized managers."],
  ["Executive briefings", "Combine self paced learning with facilitated executive sessions, workshops, or decision exercises."],
  ["Custom content", "Adapt learning objectives, examples, scenarios, and implementation guidance to the organization where appropriate."],
  ["Governed records", "Maintain account based access, completion standards, certificate identifiers, and defensible training records."],
];

const editions = [
  {
    name: "Team",
    fit: "Focused teams and small cohorts",
    includes: ["Curated course bundle", "Central enrollment support", "Completion reporting", "Certificate records"],
  },
  {
    name: "Enterprise",
    fit: "Multiple business units or role based programs",
    includes: ["Multiple learning paths", "Manager reporting", "Cohort administration", "Executive briefings", "Priority support"],
  },
  {
    name: "Strategic Program",
    fit: "Organization wide transformation or governance initiatives",
    includes: ["Custom curriculum", "Facilitated workshops", "Executive exercises", "Program roadmap", "Outcome reporting"],
  },
];

export default function AcademyEnterprisePage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: "Obserra Academy Enterprise",
        description:
          "Enterprise training programs with curated learning paths, cohort delivery, manager reporting, executive briefings, and team licensing.",
        provider: {
          "@type": "Organization",
          name: LEGAL_ENTITY_NAME,
          url: "https://www.obserrallc.com",
        },
        areaServed: "Worldwide",
        url: "https://www.obserrallc.com/academy/enterprise",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.obserrallc.com" },
          { "@type": "ListItem", position: 2, name: "Academy", item: "https://www.obserrallc.com/academy" },
          {
            "@type": "ListItem",
            position: 3,
            name: "Academy Enterprise",
            item: "https://www.obserrallc.com/academy/enterprise",
          },
        ],
      },
    ],
  };

  return (
    <main className="academy-enterprise">
      <header className="ae-nav">
        <Link href="/" className="ae-brand" aria-label={`${LEGAL_ENTITY_NAME} home`}>
          <Image
            src="/brand/obserra-logo.png"
            alt={LEGAL_ENTITY_NAME}
            width={286}
            height={55}
          />
          <span>ACADEMY ENTERPRISE</span>
        </Link>
        <nav aria-label="Academy Enterprise navigation">
          <Link href="/academy">Course catalog</Link>
          <Link href="/about">Instructor</Link>
          <Link href="/trust">Trust Center</Link>
          <Link href="/contact?interest=enterprise-training" className="ae-nav-cta">Request program</Link>
        </nav>
      </header>

      <section className="ae-hero">
        <div>
          <p className="ae-eyebrow">OBSERRA ACADEMY ENTERPRISE</p>
          <h1>Build shared capability across the people responsible for high consequence decisions.</h1>
          <p>
            Create role based learning paths for executives, cybersecurity teams, AI governance groups, intelligence
            professionals, and protection teams. {LEGAL_ENTITY_NAME} combines self paced training, facilitated sessions, completion
            standards, and manager visibility in one enterprise learning model.
          </p>
          <div className="ae-actions">
            <Link href="/contact?interest=enterprise-training" className="ae-primary">Request enterprise training plan</Link>
            <Link href="/academy" className="ae-secondary">Review individual courses</Link>
          </div>
        </div>
        <aside aria-label="Enterprise Academy assurances">
          <span><strong>Role aligned</strong> Learning paths tied to real responsibilities</span>
          <span><strong>Account based</strong> Secure learner access and saved progress</span>
          <span><strong>Measurable</strong> Assessments, completion records, and reporting</span>
          <span><strong>Flexible</strong> Self paced, cohort, facilitated, or blended delivery</span>
        </aside>
      </section>

      <section className="ae-section">
        <header>
          <p className="ae-eyebrow">ROLE BASED LEARNING PATHS</p>
          <h2>Develop the capabilities your operating model requires.</h2>
          <p>Each path can be used as published or tailored to the organization&apos;s risk profile, roles, and priorities.</p>
        </header>
        <div className="ae-path-grid">
          {learningPaths.map((path) => (
            <article key={path.title}>
              <span>{path.audience}</span>
              <h3>{path.title}</h3>
              <p>{path.outcome}</p>
              <ul>{path.modules.map((module) => <li key={module}>{module}</li>)}</ul>
            </article>
          ))}
        </div>
      </section>

      <section className="ae-operating-model">
        <div>
          <p className="ae-eyebrow">ENTERPRISE LEARNING OPERATING MODEL</p>
          <h2>From enrollment through evidence of completion.</h2>
        </div>
        <ol>
          <li><b>01</b><span><strong>Discover</strong> Identify roles, capability gaps, desired outcomes, and constraints.</span></li>
          <li><b>02</b><span><strong>Design</strong> Select courses, learning paths, cohorts, facilitation, and reporting.</span></li>
          <li><b>03</b><span><strong>Deliver</strong> Provide secure access, progress tracking, assessments, and support.</span></li>
          <li><b>04</b><span><strong>Demonstrate</strong> Report completion, assessment results, certificates, and next actions.</span></li>
        </ol>
      </section>

      <section className="ae-section ae-capabilities">
        <header>
          <p className="ae-eyebrow">PROGRAM CAPABILITIES</p>
          <h2>Enterprise administration without losing instructional quality.</h2>
        </header>
        <div className="ae-capability-grid">
          {capabilities.map(([title, copy]) => <article key={title}><h3>{title}</h3><p>{copy}</p></article>)}
        </div>
      </section>

      <section className="ae-section ae-editions">
        <header>
          <p className="ae-eyebrow">ENGAGEMENT OPTIONS</p>
          <h2>Select the delivery model that fits the organization.</h2>
          <p>Final scope and pricing depend on learner count, delivery format, customization, facilitation, and reporting requirements.</p>
        </header>
        <div className="ae-edition-grid">
          {editions.map((edition) => (
            <article key={edition.name}>
              <span>{edition.fit}</span>
              <h3>{edition.name}</h3>
              <ul>{edition.includes.map((item) => <li key={item}>{item}</li>)}</ul>
              <Link href={`/contact?interest=enterprise-training&edition=${encodeURIComponent(edition.name)}`}>Request scope and pricing</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="ae-trust">
        <div>
          <p className="ae-eyebrow">COMMERCIAL AND TRAINING ASSURANCE</p>
          <h2>Clear standards for access, completion, and records.</h2>
          <p>
            Learner accounts, Stripe supported purchasing where applicable, progress records, assessment thresholds,
            and unique certificate identifiers support a consistent training experience. Enterprise programs can include
            authorized manager reporting and consolidated completion summaries.
          </p>
        </div>
        <div className="ae-trust-links">
          <Link href="/trust/academy-terms-and-conditions">Academy terms</Link>
          <Link href="/trust/refund-and-cancellation-policy">Refund policy</Link>
          <Link href="/trust/privacy-policy">Privacy policy</Link>
          <Link href="/trust">Enterprise Trust Center</Link>
        </div>
      </section>

      <section className="ae-final">
        <p className="ae-eyebrow">BUILD YOUR PROGRAM</p>
        <h2>Turn training into a measurable enterprise capability.</h2>
        <p>Tell {LEGAL_ENTITY_NAME} which roles, teams, and outcomes matter. We will recommend a practical learning path and delivery model.</p>
        <div className="ae-actions">
          <Link href="/contact?interest=enterprise-training" className="ae-primary">Request enterprise training plan</Link>
          <a href="mailto:info@obserrallc.com" className="ae-secondary">Email Academy Enterprise</a>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </main>
  );
}
