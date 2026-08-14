import type { Metadata } from "next";
import Link from "next/link";
import { Clock3, GraduationCap, LockKeyhole, MessageSquareText, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import {
  FLORIDA_CLASS_D_COURSE,
  floridaClassDDays,
  floridaClassDLmsAutomation,
  moduleTitle,
} from "../../lib/florida-class-d";
import "./florida-security-training.css";

export const metadata: Metadata = {
  title: "Florida Class D Security Officer Training | Obserra",
  description: "Obserra Executive Protection & Intelligence LLC is building a premium Florida Class D Security Officer Training learning experience. Enrollment is not yet open.",
  alternates: { canonical: "/florida-security-training" },
};

export default function FloridaSecurityTrainingPage() {
  return (
    <main className="fl-classd">
      <section className="fl-classd__hero">
        <div className="fl-classd__eyebrow"><ShieldCheck size={18} /> Florida Security Training</div>
        <span className="fl-classd__status">COMING SOON · LMS IN PROGRESS</span>
        <h1>{FLORIDA_CLASS_D_COURSE.title}</h1>
        <p className="fl-classd__lead">A premium regulated-training environment from <strong>{FLORIDA_CLASS_D_COURSE.provider}</strong>, being engineered for live instruction, secure enrollment, verified attendance, student interaction, learning checks, examination controls, training records, and post-course administration.</p>
        <div className="fl-classd__notice"><LockKeyhole size={20} /><div><strong>Enrollment and payment are not yet enabled.</strong><span>This page is a development preview. The regulated course will remain locked until applicable school, curriculum, examination, operational, and launch gates are satisfied.</span></div></div>
        <div className="fl-classd__actions"><Link href="/contact?interest=florida-class-d-training">Join the interest list</Link><Link className="secondary" href="/academy">Explore Obserra Academy</Link></div>
      </section>

      <section className="fl-classd__metrics" aria-label="Course structure">
        <article><Clock3 /><strong>40</strong><span>Credited instructional hours</span></article>
        <article><GraduationCap /><strong>5</strong><span>Eight-hour instructional days</span></article>
        <article><Sparkles /><strong>18</strong><span>Required curriculum areas</span></article>
        <article><ShieldCheck /><strong>170</strong><span>Controlled final-exam questions</span></article>
      </section>

      <section className="fl-classd__section">
        <div className="fl-classd__section-heading"><span>LIVE CURRICULUM ARCHITECTURE</span><h2>Four live lessons every day</h2><p>Each day contains four 120-minute live instructional lessons. A 15-minute break follows Lessons 1, 2, and 3. The LMS tracks instructional time, break time, connection time, security-question responses, attendance, and participation separately. Break time is recorded but is never credited toward the required 40 instructional hours. The certification examination is controlled separately from the 40 instructional hours.</p></div>
        <div className="fl-classd__days">{floridaClassDDays.map(({ day, lessons }) => <article key={day}><header><span>DAY {day}</span><strong>8 instruction hours + 45 tracked break minutes</strong></header>{lessons.map((lesson) => <div className="fl-classd__module" key={lesson.id}><div><b>{lesson.id}</b><span><strong>{lesson.title}</strong><small>{lesson.moduleSegments.map((segment) => `${moduleTitle(segment.moduleId)} · ${segment.hours} hr`).join(" | ")}</small></span></div><em>2 hr{lesson.breakAfterMinutes ? " + 15 min break" : ""}</em></div>)}</article>)}</div>
      </section>

      <section className="fl-classd__section fl-classd__automation">
        <div className="fl-classd__section-heading"><span>LIVE REGULATED LMS</span><h2>Instructor-led and interaction rich</h2><p>The live classroom is being built around real-time instructor presence and auditable student participation, not passive video playback.</p></div>
        <div className="fl-classd__metrics" aria-label="Live classroom features">
          <article><UsersRound /><strong>Live</strong><span>Instructor and student presence</span></article>
          <article><MessageSquareText /><strong>Q&amp;A</strong><span>Questions, answers, polls, hand raise</span></article>
          <article><ShieldCheck /><strong>Check-ins</strong><span>Security challenges and attendance evidence</span></article>
          <article><Clock3 /><strong>All time</strong><span>Instruction, breaks, connection and absences</span></article>
        </div>
        <div className="fl-classd__automation-grid">{floridaClassDLmsAutomation.map((item, index) => <div key={item}><b>{String(index + 1).padStart(2, "0")}</b><span>{item}</span></div>)}</div>
      </section>

      <section className="fl-classd__legal"><ShieldCheck /><div><strong>Important licensing distinction</strong><p>Completing training does not itself issue a Florida Class D Security Officer license. Students must satisfy applicable Florida licensing requirements and receive the license from the appropriate state authority. Obserra will not represent this course as state-approved until the applicable approval process is complete.</p></div></section>
    </main>
  );
}
