import type { Metadata } from "next";
import Link from "next/link";
import { Activity, BadgeCheck, BookOpenCheck, CreditCard, Database, FileCheck2, GraduationCap, IdCard, MonitorCheck, RadioTower, ShieldCheck, UsersRound } from "lucide-react";
import { getFloridaClassDProductionOwnerValidationConfiguration, requireFloridaClassDProductionOwnerValidationPrincipal } from "../../../lib/florida-class-d-production-owner-validation";
import { readFloridaClassDOwnerPreviewState } from "../../../lib/florida-class-d-owner-preview-state";
import "../florida-security-training.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Florida Class D Production LMS Command Center | OBSERRA",
  robots: { index: false, follow: false },
};

const modules = [
  ["Student identity", "/florida-security-training/preflight", IdCard, "Pre-login readiness, hosted ID/selfie verification, and instructor identity attestation."],
  ["Enrollments", "/florida-security-training/admin/enrollments", UsersRound, "Controlled student records, cohort assignment, entitlement, and enrollment review."],
  ["Instructor files", "/florida-security-training/admin/instructor-file", BadgeCheck, "Class DI identity, license, qualification evidence, and encrypted record provisioning."],
  ["Scheduling", "/florida-security-training/admin/schedule", MonitorCheck, "Five-day cohort scheduling and twenty controlled live instructional sessions."],
  ["Live instruction", "/florida-security-training/admin/live", RadioTower, "Instructor-led classroom operations, attendance, presence, polls, and screen-time controls."],
  ["Exams", "/florida-security-training/admin/exam-monitor", GraduationCap, "170-question controlled exam, monitoring, minimum duration, score, and retest governance."],
  ["Completion", "/florida-security-training/admin/completion", FileCheck2, "Completion readiness and review; production issuance remains governed by activation controls."],
  ["LIAS", "/florida-security-training/admin/lias", Database, "Three-business-day reporting queue, submission references, certificate confirmation, and audit history."],
  ["Runtime readiness", "/florida-security-training/admin/runtime-readiness", Activity, "Provider, identity, database, HA, security, and release-binding readiness."],
  ["Production activation", "/florida-security-training/admin/production-activation", ShieldCheck, "Final regulated activation evidence and release decision."],
] as const;

export default async function FloridaClassDProductionOwnerValidationPage() {
  const principal = await requireFloridaClassDProductionOwnerValidationPrincipal();
  const configuration = getFloridaClassDProductionOwnerValidationConfiguration();
  const state = await readFloridaClassDOwnerPreviewState();

  return (
    <main className="fl-classd">
      <section className="fl-classd__hero">
        <div className="fl-classd__eyebrow"><ShieldCheck size={18} /> Production LMS command center</div>
        <span className="fl-classd__status">REAL PRODUCTION SERVICES · EXACT RELEASE · OWNER AAL2</span>
        <h1>Florida Class D production LMS</h1>
        <p className="fl-classd__lead">This is the production software control plane. It uses the canonical production identity, FDACS records database, live provider integrations, release binding, and audit controls. No mock data or placeholder provider state is accepted by this surface.</p>
        <div className="fl-classd__notice"><ShieldCheck size={20} /><div><strong>{configuration.watermark}</strong><span>Production software validation is live, but student training credit, completion, certificate issuance, and LIAS production reporting remain legally fail-closed until the separate FDACS activation requirements are satisfied.</span></div></div>
      </section>

      <section className="fl-classd__metrics" aria-label="Production control status">
        <article><BookOpenCheck /><strong>{configuration.authorized ? "LIVE" : "BLOCKED"}</strong><span>Production owner validation</span></article>
        <article><Database /><strong>{state.available ? "LIVE" : "BLOCKED"}</strong><span>FDACS records database</span></article>
        <article><CreditCard /><strong>REAL</strong><span>Provider/payment integrations required</span></article>
        <article><ShieldCheck /><strong>NON-CREDIT</strong><span>Until FDACS activation</span></article>
      </section>

      <section className="fl-classd__section">
        <div className="fl-classd__section-heading">
          <span>PRODUCTION WORKSPACE</span>
          <h2>Operate the complete LMS lifecycle</h2>
          <p>Each module remains independently governed by its original server/database controls. This command center does not bypass any record, identity, timing, payment, or regulatory gate.</p>
        </div>
        <div className="fl-classd__automation-grid">
          {modules.map(([title, href, Icon, detail], index) => (
            <div key={href}>
              <b>{String(index + 1).padStart(2, "0")}</b>
              <span><Icon size={18} aria-hidden="true" /><strong>{title}</strong>{detail}<br /><Link href={href}>Open module</Link></span>
            </div>
          ))}
        </div>
      </section>

      <section className="fl-classd__section">
        <div className="fl-classd__section-heading"><span>RELEASE BINDING</span><h2>Exact production identity</h2></div>
        <div className="fl-classd__notice"><ShieldCheck size={20} /><div><strong>Authenticated owner: {principal.principalId}</strong><span>Release {principal.releaseCommitSha} · authorization expires {principal.expiresAt}. Sensitive credentials are never rendered.</span></div></div>
      </section>
    </main>
  );
}
