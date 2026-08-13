import type { Metadata } from "next";
import Link from "next/link";
import { Clock3, GraduationCap, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { FLORIDA_CLASS_D_COURSE, floridaClassDDays, floridaClassDLmsAutomation } from "../../lib/florida-class-d";
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
        <p className="fl-classd__lead">A premium regulated-training environment from <strong>{FLORIDA_CLASS_D_COURSE.provider}</strong>, being engineered for secure enrollment, structured instruction, learning checks, examination controls, training records, and post-course administration.</p>
        <div className="fl-classd__notice"><LockKeyhole size={20} /><div><strong>Enrollment and payment are not yet enabled.</strong><span>This page is a development preview. The regulated course will remain locked until applicable school, instructor, curriculum, examination, and operational launch gates are satisfied.</span></div></div>
        <div className="fl-classd__actions"><Link href="/contact?interest=florida-class-d-training">Join the interest list</Link><Link className="secondary" href="/academy">Explore Obserra Academy</Link></div>
      </section>

      <section className="fl-classd__metrics" aria-label="Course structure">
        <article><Clock3 /><strong>40</strong><span>Instructional hours</span></article>
        <article><GraduationCap /><strong>5</strong><span>Eight-hour training days</span></article>
        <article><Sparkles /><strong>18</strong><span>Learning modules</span></article>
        <article><ShieldCheck /><strong>170</strong><span>Controlled final-exam questions</span></article>
      </section>

      <section className="fl-classd__section">
        <div className="fl-classd__section-heading"><span>CURRICULUM ARCHITECTURE</span><h2>Five-day learning pathway</h2><p>Each instructional area includes a defined learning check or applied assessment. The certification examination is controlled separately from the 40 instructional hours.</p></div>
        <div className="fl-classd__days">{floridaClassDDays.map(({ day, modules }) => <article key={day}><header><span>DAY {day}</span><strong>8 instructional hours</strong></header>{modules.map((module) => <div className="fl-classd__module" key={module.id}><div><b>{String(module.id).padStart(2, "0")}</b><span><strong>{module.title}</strong><small>{module.assessment}</small></span></div><em>{module.hours} hr{module.hours === 1 ? "" : "s"}</em></div>)}</article>)}</div>
      </section>

      <section className="fl-classd__section fl-classd__automation">
        <div className="fl-classd__section-heading"><span>REGULATED LMS</span><h2>Designed to automate the student lifecycle</h2><p>The production system is being designed to connect purchase, training, assessment, records, administrator review, and completion workflows without weakening regulatory controls.</p></div>
        <div className="fl-classd__automation-grid">{floridaClassDLmsAutomation.map((item, index) => <div key={item}><b>{String(index + 1).padStart(2, "0")}</b><span>{item}</span></div>)}</div>
      </section>

      <section className="fl-classd__legal"><ShieldCheck /><div><strong>Important licensing distinction</strong><p>Completing training does not itself issue a Florida Class D Security Officer license. Students must satisfy applicable Florida licensing requirements and receive the license from the appropriate state authority. Obserra will not represent this course as state-approved until the applicable approval process is complete.</p></div></section>
    </main>
  );
}
