"use client";

import { useCallback, useEffect, useState } from "react";

type StudentIdentity = {
  legal_name?: unknown;
  identity_status?: unknown;
};

type Enrollment = {
  id?: unknown;
  status?: unknown;
  cohort_id?: unknown;
  execution_profile?: unknown;
  training_credit_eligible?: unknown;
  created_at?: unknown;
  fdacs_class_d_student_identities?: StudentIdentity | StudentIdentity[] | null;
};

type EnrollmentPayload = {
  enrollments?: Enrollment[];
  error?: string;
};

function studentIdentity(enrollment: Enrollment) {
  const value = enrollment.fdacs_class_d_student_identities;
  if (Array.isArray(value)) return value[0] ?? null;
  return value && typeof value === "object" ? value : null;
}

async function loadEnrollments() {
  const response = await fetch("/api/florida-class-d/admin/enrollments", {
    cache: "no-store",
    headers: { accept: "application/json" },
  });
  const payload = await response.json().catch(() => ({})) as EnrollmentPayload;
  if (!response.ok) throw new Error(payload.error || "The protected enrollment queue is unavailable.");
  return Array.isArray(payload.enrollments) ? payload.enrollments : [];
}

export default function EnrollmentActivationConsole() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setEnrollments(await loadEnrollments());
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "The protected enrollment queue is unavailable.");
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  async function activate(enrollmentId: string) {
    if (!window.confirm(
      "Activate this exact-release, non-credit owner UAT enrollment? The database will independently require verified live Stripe Identity evidence and a distinct Class DI instructor attestation.",
    )) return;
    setBusy(enrollmentId);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch("/api/florida-class-d/admin/enrollments", {
        method: "POST",
        cache: "no-store",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({
          action: "activate_owner_uat",
          enrollmentId,
          correlationId: crypto.randomUUID(),
        }),
      });
      const payload = await response.json().catch(() => ({})) as { error?: unknown; correlationId?: unknown };
      if (!response.ok) {
        throw new Error(typeof payload.error === "string" ? payload.error : "Owner UAT activation was rejected.");
      }
      setNotice(
        `Non-credit enrollment activated. Audit correlation: ${typeof payload.correlationId === "string" ? payload.correlationId : "recorded"}.`,
      );
      await refresh();
    } catch (activationError) {
      setError(activationError instanceof Error ? activationError.message : "Owner UAT activation was rejected.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="fdacs-live fdacs-completion-admin">
      <header className="fdacs-live__topbar">
        <div>
          <span>OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC</span>
          <h1>Class D Enrollment Activation</h1>
        </div>
        <div className="fdacs-live__status">
          <strong>FAIL-CLOSED ADMIN GATE</strong>
          <small>Live identity · assigned DI attestation · exact release</small>
        </div>
      </header>

      {error ? <div className="fdacs-live__alert">{error}</div> : null}
      {notice ? <div className="fdacs-live__panel"><strong>{notice}</strong></div> : null}

      <section className="fdacs-live__panel">
        <h2>Pending protected enrollments</h2>
        <p>
          Owner UAT activation remains unavailable until the live Stripe government-ID and matching-selfie result is verified
          and the distinct assigned Class DI instructor records the live photo-ID attestation. Activation remains non-credit and
          cannot create completion or LIAS records.
        </p>
        <div className="fdacs-completion-admin__grid">
          {enrollments.map((enrollment) => {
            const id = typeof enrollment.id === "string" ? enrollment.id : "";
            const identity = studentIdentity(enrollment);
            const identityStatus = typeof identity?.identity_status === "string" ? identity.identity_status : "pending";
            const legalName = typeof identity?.legal_name === "string" ? identity.legal_name : "Protected learner";
            const profile = typeof enrollment.execution_profile === "string" ? enrollment.execution_profile : "production";
            const status = typeof enrollment.status === "string" ? enrollment.status : "pending";
            const activatable = Boolean(
              id
              && profile === "owner_uat_noncredit"
              && enrollment.training_credit_eligible === false
              && status === "pending_entitlement"
              && identityStatus === "verified",
            );
            return (
              <article key={id || String(enrollment.created_at)} className="fdacs-completion-admin__card">
                <div className="fdacs-completion-admin__card-head">
                  <strong>{legalName}</strong>
                  <span>{activatable ? "READY TO ACTIVATE" : "BLOCKED"}</span>
                </div>
                <dl>
                  <div><dt>Enrollment</dt><dd><code>{id || "Unavailable"}</code></dd></div>
                  <div><dt>Status</dt><dd>{status}</dd></div>
                  <div><dt>Identity</dt><dd>{identityStatus}</dd></div>
                  <div><dt>Profile</dt><dd>{profile}</dd></div>
                  <div><dt>Training credit</dt><dd>{enrollment.training_credit_eligible === true ? "Eligible" : "Not eligible"}</dd></div>
                </dl>
                {profile === "owner_uat_noncredit" ? (
                  <button type="button" disabled={!activatable || busy === id} onClick={() => void activate(id)}>
                    {busy === id ? "Activating…" : "Activate exact-release owner UAT"}
                  </button>
                ) : (
                  <p>Production enrollment continues through the separately governed school review and entitlement path.</p>
                )}
              </article>
            );
          })}
          {enrollments.length === 0 ? <p>No pending protected enrollments are currently available.</p> : null}
        </div>
      </section>

      <section className="fdacs-live__panel">
        <h2>Next controlled steps</h2>
        <p>
          <a href="/florida-security-training/admin/schedule">Open the exact-release schedule</a>
          {" · "}
          <a href="/florida-security-training/admin/runtime-readiness">Return to runtime readiness</a>
        </p>
      </section>
    </main>
  );
}
