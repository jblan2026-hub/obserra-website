import type { Metadata } from "next";
import Link from "next/link";
import { Activity, BadgeCheck, BookOpenCheck, CreditCard, Database, FileCheck2, GraduationCap, IdCard, MonitorCheck, RadioTower, ShieldCheck, UsersRound } from "lucide-react";
import { getFloridaClassDProductionOwnerValidationConfiguration, requireFloridaClassDProductionOwnerPrincipal } from "../../../lib/florida-class-d-production-owner-validation";
import { readFloridaClassDOwnerPreviewState } from "../../../lib/florida-class-d-owner-preview-state";
import "../florida-security-training.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Florida Class D Production LMS Command Center | OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC",
  robots: { index: false, follow: false },
};

const modules = [
  ["Student identity", "/florida-security-training/owner-validation/identity", IdCard, "Live hosted government ID and matching selfie validation for the authenticated owner. No learner record or training credit is created."],
  ["Live LMS test", "/florida-security-training/owner-validation/lms", RadioTower, "Direct AAL2 owner classroom with a real private Daily room and private protected courseware storage. No learner credit or regulated completion state is created."],
  ["Enrollments", null, UsersRound, "Controlled student records, cohort assignment, entitlement, and enrollment review."],
  ["Instructor files", null, BadgeCheck, "Class DI identity, license, qualification evidence, and encrypted record provisioning."],
  ["Scheduling", null, MonitorCheck, "Five day cohort scheduling and twenty controlled live instructional sessions."],
  ["Live instruction", null, RadioTower, "Instructor led classroom operations, attendance, presence, polls, and screen time controls."],
  ["Exams", null, GraduationCap, "170 question controlled exam, monitoring, minimum duration, score, and retest governance."],
  ["Completion", null, FileCheck2, "Completion readiness and review. Production issuance remains governed by activation controls."],
  ["LIAS", null, Database, "Three business day reporting queue, submission references, certificate confirmation, and audit history."],
  ["Runtime readiness", null, Activity, "Provider, identity, database, HA, security, and release binding readiness."],
  ["Production activation", null, ShieldCheck, "Final regulated activation evidence and release decision."],
] as const;

export default async function FloridaClassDProductionOwnerValidationPage() {
  const principal = await requireFloridaClassDProductionOwnerPrincipal();
  const configuration = getFloridaClassDProductionOwnerValidationConfiguration();
  const state = await readFloridaClassDOwnerPreviewState();

  return (
    <main className="fl-classd">
      <section className="fl-classd__hero">
        <div className="fl-classd__eyebrow"><ShieldCheck size={18} /> Production LMS command center</div>
        <span className="fl-classd__status">REAL PRODUCTION IDENTITY · OWNER AAL2 · FAIL CLOSED PROVIDER ACTIONS</span>
        <h1>Florida Class D production LMS</h1>
        <p className="fl-classd__lead">This production owner surface separates authenticated inspection from governed provider execution. You can inspect readiness after AAL2 authentication and run the dedicated owner only provider tests without creating learner credit.</p>
        <div className="fl-classd__notice"><ShieldCheck size={20} /><div><strong>{configuration.watermark}</strong><span>Student training credit, completion, certificate issuance, LIAS production reporting, and production enrollment remain legally fail closed until their separate activation requirements are satisfied.</span></div></div>
        {!configuration.authorized ? (
          <div className="fl-classd__notice is-locked" role="status">
            <ShieldCheck size={20} />
            <div>
              <strong>Production owner validation is blocked.</strong>
              <span>Regulated production actions remain unavailable until every exact release validation control is satisfied. Blocking controls: {configuration.blockingKeys.join(", ") || "unknown"}.</span>
            </div>
          </div>
        ) : null}
      </section>

      <section className="fl-classd__metrics" aria-label="Production control status">
        <article><BookOpenCheck /><strong>{configuration.authorized ? "LIVE" : "BLOCKED"}</strong><span>Production owner validation</span></article>
        <article><Database /><strong>{state.status === "ready" ? "LIVE" : "BLOCKED"}</strong><span>FDACS records database</span></article>
        <article><CreditCard /><strong>{configuration.checks.stripeIdentity ? "LIVE" : "BLOCKED"}</strong><span>Stripe Identity validation</span></article>
        <article><ShieldCheck /><strong>NON CREDIT</strong><span>Until FDACS activation</span></article>
      </section>

      <section className="fl-classd__section">
        <div className="fl-classd__section-heading">
          <span>PRODUCTION WORKSPACE</span>
          <h2>Inspect and test the governed LMS lifecycle</h2>
          <p>The identity and live LMS test modules are dedicated owner only paths bound to the authenticated AAL2 session and deployed release. Locked regulated modules remain visible without enabling learner writes.</p>
        </div>
        <div className="fl-classd__automation-grid">
          {modules.map(([title, href, Icon, detail], index) => (
            <div key={title}>
              <b>{String(index + 1).padStart(2, "0")}</b>
              <span>
                <Icon size={18} aria-hidden="true" />
                <strong>{title}</strong>
                {detail}
                <br />
                {href ? (
                  <Link href={href}>{title === "Live LMS test" ? "Open live LMS test" : configuration.authorized ? "Open governed validation" : "Inspect validation readiness"}</Link>
                ) : (
                  <small>Governed production operation remains locked.</small>
                )}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="fl-classd__section">
        <div className="fl-classd__section-heading"><span>RELEASE BINDING</span><h2>Authenticated production owner</h2></div>
        <div className="fl-classd__notice"><ShieldCheck size={20} /><div><strong>Authenticated owner: {principal.principalId}</strong><span>Validation release {configuration.releaseCommitSha ?? "not yet bound"} · authorization expiry {configuration.expiresAt ?? "not yet authorized"}. Sensitive credentials are never rendered.</span></div></div>
      </section>
    </main>
  );
}
