import { requireFloridaClassDStaff } from "../../../../lib/florida-class-d-auth";
import {
  getFloridaClassDNonProductionAcceptanceReadiness,
  getFloridaClassDProductionRuntimeReadiness,
  type FloridaClassDRuntimeReadinessReport,
} from "../../../../lib/florida-class-d-runtime-readiness";
import {
  getFloridaClassDOwnerUatReport,
  type FloridaClassDOwnerUatReport,
} from "../../../../lib/florida-class-d-owner-uat";
import ProviderReadinessPanel from "./ProviderReadinessPanel";

export const dynamic = "force-dynamic";

function productionStatus(report: FloridaClassDRuntimeReadinessReport) {
  if (report.readyForControlledActivationReview) return "READY FOR CONTROLLED ACTIVATION REVIEW";
  if (report.readyExceptForClassDSLicense) return "READY EXCEPT CLASS DS LICENSE";
  return "FAIL CLOSED";
}

function nonProductionStatus(report: FloridaClassDRuntimeReadinessReport) {
  return report.readyForControlledActivationReview
    ? "READY FOR SYNTHETIC NON-PRODUCTION ACCEPTANCE"
    : "FAIL CLOSED";
}

function ReadinessChecks({ report }: { report: FloridaClassDRuntimeReadinessReport }) {
  return (
    <div className="fdacs-completion-admin__grid">
      {report.items.map((item) => (
        <article key={`${report.profile}:${item.key}`} className="fdacs-completion-admin__card">
          <div className="fdacs-completion-admin__card-head">
            <strong>{item.label}</strong>
            <span>{item.ready ? "READY" : "BLOCKED"}</span>
          </div>
          <p>{item.detail}</p>
          <small>{item.category.toUpperCase()} · {item.sensitive ? "Sensitive value suppressed" : "No secret value involved"}</small>
        </article>
      ))}
    </div>
  );
}

function OwnerUatChecks({ report }: { report: FloridaClassDOwnerUatReport }) {
  return (
    <div className="fdacs-completion-admin__grid">
      {report.checks.map((item) => (
        <article key={`owner-uat:${item.key}`} className="fdacs-completion-admin__card">
          <div className="fdacs-completion-admin__card-head">
            <strong>{item.key.replaceAll("_", " ")}</strong>
            <span>{item.ready ? "READY" : "BLOCKED"}</span>
          </div>
          <p>{item.detail}</p>
          <small>{item.sensitive ? "Sensitive value suppressed" : "No secret value involved"}</small>
        </article>
      ))}
    </div>
  );
}

export default async function FloridaClassDRuntimeReadinessPage() {
  await requireFloridaClassDStaff(["school_admin", "compliance_admin"]);
  const production = getFloridaClassDProductionRuntimeReadiness();
  const nonProduction = getFloridaClassDNonProductionAcceptanceReadiness();
  const ownerUat = getFloridaClassDOwnerUatReport();

  return (
    <main className="fdacs-live fdacs-completion-admin">
      <header className="fdacs-live__topbar">
        <div>
          <span>OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC</span>
          <h1>Florida Class D Runtime Readiness</h1>
        </div>
        <div className="fdacs-live__status">
          <strong>{productionStatus(production)}</strong>
          <small>Gate 22 · secret values are never displayed</small>
        </div>
      </header>

      <section className="fdacs-live__panel">
        <h2>Production activation readiness</h2>
        <p>
          This protected production profile reports configuration presence only. It does not return credential values,
          activate regulated functions, or authorize launch. A staged state of READY EXCEPT CLASS DS LICENSE means all
          non-license technical readiness checks are clear while the Class DS license status and number remain intentionally blocked.
        </p>
        <p>
          <strong>Status: {productionStatus(production)}</strong>
        </p>
        <ReadinessChecks report={production} />
      </section>

      <section className="fdacs-live__panel">
        <h2>Non-production acceptance readiness</h2>
        <p>
          This separate profile is limited to explicitly designated development, sandbox, staging, or UAT runtime use.
          It requires explicit non-production acceptance authorization and synthetic-identity-only mode. It never requires
          an active Class DS school license or Class DS license number.
        </p>
        <p>
          <strong>Status: {nonProductionStatus(nonProduction)}</strong>
        </p>
        <ReadinessChecks report={nonProduction} />
      </section>

      <ProviderReadinessPanel />

      <section className="fdacs-live__panel">
        <h2>Owner real-identity UAT readiness</h2>
        <p>
          This distinct Vercel Preview profile uses the production database and live hosted providers for one
          exact release. It is owner-only, expires within fourteen days, is never eligible for training credit,
          and is blocked by the database from creating completion or LIAS records.
        </p>
        <p>
          <strong>Status: {ownerUat.authorized ? "READY FOR NON-CREDIT OWNER UAT" : "FAIL CLOSED"}</strong>
        </p>
        <OwnerUatChecks report={ownerUat} />
        <p>
          <a href="/florida-security-training/admin/instructor-file">Provision the distinct verified Class DI instructor</a>
          {" · "}
          <a href="/florida-security-training/admin/schedule">Publish the exact-release owner-UAT schedule</a>
          {" · "}
          <a href="/florida-security-training/admin/enrollments">Activate the verified non-credit enrollment</a>
        </p>
      </section>

      <section className="fdacs-live__panel">
        <h2>Production activation boundary</h2>
        <p>
          Class DS license issuance does not automatically activate the regulated LMS. Production activation remains a controlled
          decision after applicable regulatory authorization, production verification, end-to-end testing, security and operational
          acceptance, and owner approval. Regulated production feature flags remain disabled during readiness review.
        </p>
      </section>

      <section className="fdacs-live__panel">
        <h2>Completion boundary</h2>
        <p>
          Forty instructional hours alone do not earn a completion certificate. The passing final examination and controlled
          completion approval remain required before supplemental completion documents are generated.
        </p>
      </section>
    </main>
  );
}
