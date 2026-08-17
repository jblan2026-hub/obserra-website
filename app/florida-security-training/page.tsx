import type { Metadata } from "next";
import Link from "next/link";
import { EnterpriseFooter, EnterpriseHeader } from "../components/enterprise/EnterpriseChrome";
import { FLORIDA_CLASS_D_COURSE, floridaClassDDays, floridaClassDLmsAutomation, moduleTitle } from "../../lib/florida-class-d";
import { floridaClassDPublicLearnerControlsEnabled } from "../../lib/florida-class-d-production-activation";
import GovernedFloridaClassDLink from "./GovernedFloridaClassDLink";
import "./florida-security-training.css";
import "./premium-lms-shell.css";

export const metadata: Metadata = {
  title: "Florida Class D Security Officer Training",
  description: "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC is building a premium Florida Class D Security Officer Training learning experience. Enrollment is not yet open.",
  alternates: { canonical: "/florida-security-training" },
  robots: { index: true, follow: true },
};

const courseMetrics = [
  ["40", "Required instructional hours after authorization", "TIME"],
  ["5", "Planned eight-hour instructional days", "DAYS"],
  ["18", "Required curriculum areas", "CURRICULUM"],
  ["170", "Controlled final-exam questions", "EXAM"],
] as const;

export default function FloridaSecurityTrainingPage() {
  const publicLearnerControlsEnabled = floridaClassDPublicLearnerControlsEnabled();

  return (
    <>
      <EnterpriseHeader section="Florida Class D training" />
      <main className="fl-classd">
        <div className="fl-classd__hero-shell">
          <section className="fl-classd__hero" aria-labelledby="class-d-title">
            <div className="fl-classd__hero-grid">
              <div className="fl-classd__hero-copy">
                <div className="fl-classd__eyebrow">Florida Security Training</div>
                <div className="fl-classd__status-row" aria-label="Current program status">
                  <span className="fl-classd__status is-verified">PRODUCTION SOFTWARE VERIFIED</span>
                  <span className="fl-classd__status is-locked">REGULATED CREDIT LOCKED</span>
                </div>
                <h1 id="class-d-title">{FLORIDA_CLASS_D_COURSE.title}</h1>
                <p className="fl-classd__lead">A production learning environment from <strong>{FLORIDA_CLASS_D_COURSE.provider}</strong>, engineered for live instruction, secure enrollment, verified attendance, student interaction, learning checks, examination controls, training records, and post-course administration.</p>
                <div className="fl-classd__actions">
                  <Link href="/florida-security-training/preflight">Check student readiness</Link>
                  <Link className="secondary" href="/contact?interest=florida-class-d-training">Request launch notice</Link>
                  <GovernedFloridaClassDLink enabled={publicLearnerControlsEnabled} href="/florida-security-training/enroll">Enrollment and payment</GovernedFloridaClassDLink>
                  <GovernedFloridaClassDLink className="secondary" enabled={publicLearnerControlsEnabled} href="/florida-security-training/access">Student course access</GovernedFloridaClassDLink>
                </div>
              </div>

              <aside className="fl-classd__access-state" aria-label="Program activation status">
                <span className="fl-classd__access-state-icon" aria-hidden="true">01</span>
                <small>PROGRAM STATUS</small>
                <strong>Software live. Regulated outcomes remain locked.</strong>
                <span>Enrollment, payment, instructional credit, completion, certificates, and LIAS reporting remain disabled until the separate FDACS authorization and production activation gates are satisfied.</span>
              </aside>
            </div>

            <div className="fl-classd__notice is-warning">
              <span className="fl-classd__notice-mark" aria-hidden="true">LOCK</span>
              <div><strong>Coming soon for regulated enrollment.</strong><span>The live system can validate software and operational controls, but validation activity cannot create authorized course credit, a completion record, a certificate, or a Florida licensing record.</span></div>
            </div>
          </section>
        </div>

        <section className="fl-classd__metrics" aria-label="Course structure">
          {courseMetrics.map(([value, label, mark]) => (
            <article key={mark}><span className="fl-classd__metric-mark">{mark}</span><strong>{value}</strong><span>{label}</span></article>
          ))}
        </section>

        <section className="fl-classd__section" aria-labelledby="curriculum-heading">
          <div className="fl-classd__section-heading">
            <div><span>CONTROLLED CURRICULUM ARCHITECTURE</span><h2 id="curriculum-heading">Four planned live lessons every authorized training day.</h2></div>
            <p>The controlled design provides four 120-minute live instructional lessons per day, with a 15-minute break after Lessons 1, 2, and 3. Production validation tracks instruction, breaks, connection time, security-question responses, attendance, and participation separately. Breaks are never counted toward the required 40 instructional hours.</p>
          </div>
          <div className="fl-classd__days">{floridaClassDDays.map(({ day, lessons }) => <article key={day}><header><span>DAY {day}</span><strong>8 instruction hours + 45 tracked break minutes</strong></header>{lessons.map((lesson) => <div className="fl-classd__module" key={lesson.id}><div><b>{lesson.id}</b><span><strong>{lesson.title}</strong><small>{lesson.moduleSegments.map((segment) => `${moduleTitle(segment.moduleId)} · ${segment.hours} hr`).join(" | ")}</small></span></div><em>2 hr{lesson.breakAfterMinutes ? " + 15 min break" : ""}</em></div>)}</article>)}</div>
        </section>

        <section className="fl-classd__section fl-classd__automation" aria-labelledby="live-classroom-heading">
          <div className="fl-classd__section-heading">
            <div><span>LIVE CLASSROOM CONTROL PLANE</span><h2 id="live-classroom-heading">Instructor led, interaction rich, and auditable.</h2></div>
            <p>The production classroom is designed around real-time instructor presence and auditable student participation rather than passive video playback. Validation results do not establish FDACS approval or production authorization for regulated outcomes.</p>
          </div>
          <div className="fl-classd__automation-grid">{floridaClassDLmsAutomation.map((item, index) => <div key={item}><b>{String(index + 1).padStart(2, "0")}</b><span>{item}</span></div>)}</div>
        </section>

        <section className="fl-classd__section" aria-labelledby="student-journey-heading">
          <div className="fl-classd__section-heading">
            <div><span>PROTECTED STUDENT JOURNEY</span><h2 id="student-journey-heading">Identity, enrollment, instructor attestation, then secure course access.</h2></div>
            <p>The public preflight collects no PII. Protected steps use the student account, hosted identity verification, instructor attestation, schedule assignment, and one-device access controls. Identity images remain with the hosted verification provider and are not copied into the LMS.</p>
          </div>
          <div className="fl-classd__automation-grid" aria-label="Protected Class D student access sequence">
            <div><b>01</b><span>Confirm government photo-ID readiness, secure browser and camera capability, one-device use, hosted ID/selfie verification, and live instructor-attestation requirements.</span></div>
            <div><b>02</b><span>Create or sign in to the protected student account and complete the release-bound enrollment record.</span></div>
            <div><b>03</b><span>Complete hosted government photo-ID and matching-selfie verification, then meet the assigned licensed Class DI instructor for independent identity attestation.</span></div>
            <div><b>04</b><span>Open only the assigned secure live lesson after enrollment, identity, instructor, schedule, and single-device controls all pass.</span></div>
          </div>
          <div className="fl-classd__actions"><Link href="/florida-security-training/preflight">Run pre-login readiness check</Link><GovernedFloridaClassDLink className="secondary" enabled={publicLearnerControlsEnabled} href="/florida-security-training/access">Student course access</GovernedFloridaClassDLink></div>
        </section>

        <section className="fl-classd__legal" aria-label="Florida licensing and authorization notice">
          <span className="fl-classd__legal-mark" aria-hidden="true">FL</span>
          <div><strong>Licensing and authorization distinction</strong><p>Production software validation is non-credit until the regulated activation gates are satisfied. Completing validation activity does not complete the course. Completing training does not itself issue a Florida Class D Security Officer license. Students must satisfy applicable Florida licensing requirements and receive the license from the Florida Department of Agriculture and Consumer Services. {FLORIDA_CLASS_D_COURSE.provider} does not claim FDACS approval or production authorization. Enrollment, course credit, completion, certificates, and Licensing Information and Alert System reporting remain disabled until every applicable authorization gate is satisfied.</p></div>
        </section>
      </main>
      <EnterpriseFooter />
    </>
  );
}
