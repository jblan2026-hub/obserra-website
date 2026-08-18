import type { Metadata } from "next";
import Link from "next/link";
import { Clock3, GraduationCap, LockKeyhole, MessageSquareText, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { FLORIDA_CLASS_D_COURSE, floridaClassDDays, floridaClassDLmsAutomation, moduleTitle } from "../../lib/florida-class-d";
import { floridaClassDPublicLearnerControlsEnabled } from "../../lib/florida-class-d-production-activation";
import GovernedFloridaClassDLink from "./GovernedFloridaClassDLink";
import "./florida-security-training.css";

export const metadata: Metadata = {
  title: "Florida Class D Security Officer Training",
  description: "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC operates a live Florida Class D Security Officer Training LMS platform. Enrollment and payment remain unavailable until licensing and production activation are complete.",
  alternates: { canonical: "/florida-security-training" },
  robots: { index: true, follow: true },
};

export default function FloridaSecurityTrainingPage() {
  const publicLearnerControlsEnabled = floridaClassDPublicLearnerControlsEnabled();
  return (
    <main className="fl-classd">
      <section className="fl-classd__hero">
        <div className="fl-classd__eyebrow"><ShieldCheck size={18} /> Florida Security Training</div>
        <span className="fl-classd__status">LMS PLATFORM LIVE · PRODUCTION SOFTWARE</span>
        <span className="fl-classd__status">ENROLLMENT & PAYMENT LOCKED · LICENSE ACTIVATION PENDING</span>
        <h1>{FLORIDA_CLASS_D_COURSE.title}</h1>
        <p className="fl-classd__lead">The LMS platform is live on the OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC production website and is engineered for instructor-led delivery, identity controls, attendance evidence, student interaction, learning checks, examination controls, training records, and post-course administration. Enrollment and payment remain unavailable until licensing and production activation are complete, and regulated training credit remains disabled until every applicable FDACS activation requirement is satisfied.</p>
        <div className="fl-classd__notice is-warning"><LockKeyhole size={20} /><div><strong>Platform live. Learner commerce locked pending licensure.</strong><span>You may review the LMS, curriculum, readiness requirements, and delivery model now. Enrollment, payment, production student access, course credit, completion, certificates, and LIAS reporting remain fail closed until licensing and production activation are complete.</span></div></div>
        <div className="fl-classd__actions">
          <Link href="/florida-security-training/preflight">Check student ID requirements</Link>
          <Link className="secondary" href="/contact?interest=florida-class-d-training">Request a program launch notice</Link>
          <GovernedFloridaClassDLink enabled={publicLearnerControlsEnabled} href="/florida-security-training/enroll">Enrollment and payment</GovernedFloridaClassDLink>
          <GovernedFloridaClassDLink className="secondary" enabled={publicLearnerControlsEnabled} href="/florida-security-training/access" lockedLabel="Student access unavailable pending license activation">Student course access</GovernedFloridaClassDLink>
        </div>
      </section>

      <section className="fl-classd__metrics" aria-label="Course structure">
        <article><Clock3 /><strong>40</strong><span>Required instructional hours after authorization</span></article>
        <article><GraduationCap /><strong>5</strong><span>Planned eight-hour instructional days</span></article>
        <article><Sparkles /><strong>18</strong><span>Required curriculum areas</span></article>
        <article><ShieldCheck /><strong>170</strong><span>Controlled final-exam questions</span></article>
      </section>

      <section className="fl-classd__section">
        <div className="fl-classd__section-heading"><span>CONTROLLED CURRICULUM ARCHITECTURE</span><h2>Four planned live lessons every authorized training day</h2><p>The controlled design provides four 120-minute live instructional lessons per day, with a 15-minute break after Lessons 1, 2, and 3. Before production activation, the live LMS can be inspected and validated without awarding regulated instructional credit. Break time is recorded but is never credited toward the required 40 instructional hours. Connection time, security-question responses, attendance, and participation remain distinct evidence classes. The certification examination is controlled separately from the 40 instructional hours.</p></div>
        <div className="fl-classd__days">{floridaClassDDays.map(({ day, lessons }) => <article key={day}><header><span>DAY {day}</span><strong>8 instruction hours + 45 tracked break minutes</strong></header>{lessons.map((lesson) => <div className="fl-classd__module" key={lesson.id}><div><b>{lesson.id}</b><span><strong>{lesson.title}</strong><small>{lesson.moduleSegments.map((segment) => `${moduleTitle(segment.moduleId)} · ${segment.hours} hr`).join(" | ")}</small></span></div><em>2 hr{lesson.breakAfterMinutes ? " + 15 min break" : ""}</em></div>)}</article>)}</div>
      </section>

      <section className="fl-classd__section fl-classd__automation">
        <div className="fl-classd__section-heading"><span>REGULATED LMS PRODUCTION VALIDATION</span><h2>Instructor-led and interaction rich</h2><p>The production-stack classroom supports real-time instructor presence and auditable student participation rather than passive video playback. Prelicense validation does not establish FDACS approval, authorize learner commerce, or create regulated training outcomes.</p></div>
        <div className="fl-classd__metrics" aria-label="Live classroom features">
          <article><UsersRound /><strong>Live</strong><span>Instructor and student presence</span></article>
          <article><MessageSquareText /><strong>Q&amp;A</strong><span>Questions, answers, polls, hand raise</span></article>
          <article><ShieldCheck /><strong>Check-ins</strong><span>Security challenges and attendance evidence</span></article>
          <article><Clock3 /><strong>All time</strong><span>Instruction, breaks, connection and absences</span></article>
        </div>
        <div className="fl-classd__automation-grid">{floridaClassDLmsAutomation.map((item, index) => <div key={item}><b>{String(index + 1).padStart(2, "0")}</b><span>{item}</span></div>)}</div>
      </section>

      <section className="fl-classd__section">
        <div className="fl-classd__section-heading">
          <span>PROTECTED STUDENT JOURNEY</span>
          <h2>Photo-ID controls before secure live video</h2>
          <p>Identity requirements are checked before student sign-in. After licensing and activation, the student journey proceeds through the public no-PII readiness gate, protected account, enrollment, hosted identity verification, instructor attestation, and single-device course-access sequence. Identity images remain with the hosted verification provider and are not copied into the LMS.</p>
        </div>
        <div className="fl-classd__automation-grid" aria-label="Protected Class D student access sequence">
          <div><b>01</b><span>Before login, confirm government photo-ID readiness, secure browser and camera capability, one-device use, hosted ID/selfie verification, and live instructor-attestation requirements.</span></div>
          <div><b>02</b><span>After activation, create or sign in to the protected student account and complete the release-bound enrollment record.</span></div>
          <div><b>03</b><span>Complete hosted government photo-ID and matching-selfie verification, then meet the assigned licensed Class DI instructor for independent identity attestation.</span></div>
          <div><b>04</b><span>Open only the assigned secure live lesson after enrollment, identity, instructor, schedule, and single-device controls all pass.</span></div>
        </div>
        <div className="fl-classd__actions"><Link href="/florida-security-training/preflight">Run pre-login ID readiness check</Link><GovernedFloridaClassDLink className="secondary" enabled={publicLearnerControlsEnabled} href="/florida-security-training/access" lockedLabel="Student access unavailable pending license activation">Student course access</GovernedFloridaClassDLink></div>
      </section>

      <section className="fl-classd__legal"><ShieldCheck /><div><strong>Important licensing and authorization distinction</strong><p>The LMS software may be live while regulated learner operations remain disabled. Completing prelicense validation activity does not complete the course. Completing training does not itself issue a Florida Class D Security Officer license. Students must satisfy applicable Florida licensing requirements and receive the license from the Florida Department of Agriculture and Consumer Services (FDACS). {FLORIDA_CLASS_D_COURSE.provider} does not claim FDACS approval or production authorization. Enrollment, course credit, completion, certificates, and Licensing Information and Alert System (LIAS) reporting remain disabled until every applicable authorization gate is satisfied. Payment and production student access also remain disabled until licensing and production activation are complete.</p></div></section>
    </main>
  );
}
