"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";

type Readiness = {
  ready?: boolean;
  verifiedActiveInstructorCount?: number;
  requiredThrough?: string;
  error?: string;
};

type ProvisioningResult = {
  instructorFileId?: string | null;
  recordSha256?: string | null;
  qualificationArtifactId?: string | null;
  qualificationPlaintextSha256?: string | null;
  licenseArtifactId?: string | null;
  licensePlaintextSha256?: string | null;
  instructorRoleAssigned?: boolean;
  idempotentReplay?: boolean;
  correlationId?: string;
};

function localDateTimeNow() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

async function responsePayload(response: Response) {
  return response.json().catch(() => ({})) as Promise<Record<string, unknown>>;
}

export default function InstructorFileProvisioning() {
  const formRef = useRef<HTMLFormElement>(null);
  const [instructorClerkUserId, setInstructorClerkUserId] = useState("");
  const [instructorLegalName, setInstructorLegalName] = useState("");
  const [diLicenseNumber, setDiLicenseNumber] = useState("");
  const [licenseVerifiedAt, setLicenseVerifiedAt] = useState(localDateTimeNow);
  const [licenseExpiresOn, setLicenseExpiresOn] = useState("");
  const [supersedesInstructorFileId, setSupersedesInstructorFileId] = useState("");
  const [verificationAttestation, setVerificationAttestation] = useState(false);
  const [readiness, setReadiness] = useState<Readiness | null>(null);
  const [result, setResult] = useState<ProvisioningResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refreshReadiness = useCallback(async () => {
    const response = await fetch("/api/florida-class-d/admin/instructor-file", { cache: "no-store" });
    const payload = await responsePayload(response);
    if (typeof payload.ready === "boolean") {
      setReadiness(payload as Readiness);
      return;
    }
    setReadiness({ ready: false, error: typeof payload.error === "string" ? payload.error : "Instructor readiness is unavailable." });
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void refreshReadiness(), 0);
    return () => window.clearTimeout(timer);
  }, [refreshReadiness]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!verificationAttestation) return;
    const confirmed = window.confirm(
      "Provision this distinct Clerk user as the assigned Class DI instructor? The evidence files will be encrypted before database transmission, immutable audit records will be created, and the instructor role will be added to that Clerk account.",
    );
    if (!confirmed) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const form = new FormData(event.currentTarget);
      form.set("verificationAttestation", "accepted");
      const response = await fetch("/api/florida-class-d/admin/instructor-file", {
        method: "POST",
        cache: "no-store",
        body: form,
      });
      const payload = await responsePayload(response);
      if (!response.ok) {
        throw new Error(typeof payload.error === "string" ? payload.error : "Class DI instructor provisioning failed.");
      }
      setResult(payload as ProvisioningResult);
      setInstructorClerkUserId("");
      setInstructorLegalName("");
      setDiLicenseNumber("");
      setLicenseExpiresOn("");
      setSupersedesInstructorFileId("");
      setVerificationAttestation(false);
      formRef.current?.reset();
      setLicenseVerifiedAt(localDateTimeNow());
      await refreshReadiness();
    } catch (provisioningError) {
      setError(provisioningError instanceof Error ? provisioningError.message : "Class DI instructor provisioning failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="fdacs-live fdacs-instructor-file">
      <header className="fdacs-live__topbar">
        <div>
          <span>OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC</span>
          <h1>Class DI Instructor Provisioning</h1>
        </div>
        <div className="fdacs-live__status">
          <strong>{readiness?.ready ? "VERIFIED-ACTIVE DI READY" : "FAIL CLOSED"}</strong>
          <small>Owner UAT · encrypted evidence · distinct instructor identity</small>
        </div>
      </header>

      {error ? <div className="fdacs-live__alert">{error}</div> : null}
      {result?.instructorFileId ? (
        <div className="fdacs-instructor-file__success">
          <strong>Instructor file provisioned.</strong>
          <span>Instructor file: <code>{result.instructorFileId}</code></span>
          <span>Audit correlation: <code>{result.correlationId}</code></span>
          <span>{result.instructorRoleAssigned ? "The Clerk instructor role was assigned." : "The Clerk instructor role was already present."}</span>
          <a href="/florida-security-training/admin/schedule">Continue to the exact-release cohort scheduler</a>
        </div>
      ) : null}

      <section className="fdacs-instructor-file__grid">
        <section className="fdacs-live__panel">
          <div className="fdacs-live__panel-head"><h2>Register verified instructor</h2><span>protected write</span></div>
          <p className="fdacs-live__muted">
            Use a Clerk user that belongs to the real Class DI instructor and is distinct from the owner learner.
            Do not upload the student&apos;s ID here; the student government-ID and matching-selfie flow runs through Stripe Identity.
          </p>
          <form ref={formRef} className="fdacs-live__form fdacs-instructor-file__form" onSubmit={submit}>
            <label>
              Instructor Clerk user ID
              <input name="instructorClerkUserId" value={instructorClerkUserId} onChange={(event) => setInstructorClerkUserId(event.target.value)} placeholder="user_..." required autoComplete="off" />
            </label>
            <label>
              Instructor legal name
              <input name="instructorLegalName" value={instructorLegalName} onChange={(event) => setInstructorLegalName(event.target.value)} maxLength={200} required autoComplete="off" />
            </label>
            <label>
              Active Class DI license number
              <input name="diLicenseNumber" value={diLicenseNumber} onChange={(event) => setDiLicenseNumber(event.target.value)} maxLength={80} required autoComplete="off" />
            </label>
            <div className="fdacs-instructor-file__row">
              <label>
                License verified at
                <input name="licenseVerifiedAt" type="datetime-local" value={licenseVerifiedAt} onChange={(event) => setLicenseVerifiedAt(event.target.value)} required />
              </label>
              <label>
                License expires on
                <input name="licenseExpiresOn" type="date" value={licenseExpiresOn} onChange={(event) => setLicenseExpiresOn(event.target.value)} required />
              </label>
            </div>
            <label>
              Instructor qualification evidence
              <input name="qualificationEvidence" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" required />
              <small>PDF, JPEG, PNG, or WebP; maximum 2 MB.</small>
            </label>
            <label>
              Class DI license evidence
              <input name="licenseEvidence" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" required />
              <small>PDF, JPEG, PNG, or WebP; maximum 2 MB.</small>
            </label>
            <label>
              Superseded instructor-file UUID (only for a controlled replacement)
              <input name="supersedesInstructorFileId" value={supersedesInstructorFileId} onChange={(event) => setSupersedesInstructorFileId(event.target.value)} placeholder="Optional" autoComplete="off" />
            </label>
            <label className="fdacs-instructor-file__attestation">
              <input type="checkbox" checked={verificationAttestation} onChange={(event) => setVerificationAttestation(event.target.checked)} />
              <span>I independently verified that this Clerk user is the named instructor, that the Class DI credential is active through the stated expiration date, and that both files are authentic evidence for this instructor.</span>
            </label>
            <button type="submit" disabled={busy || !verificationAttestation}>
              {busy ? "Encrypting and provisioning…" : "Encrypt evidence and provision instructor"}
            </button>
          </form>
        </section>

        <aside className="fdacs-live__panel">
          <div className="fdacs-live__panel-head"><h2>Controlled readiness</h2><span>{readiness?.ready ? "ready" : "blocked"}</span></div>
          <dl className="fdacs-instructor-file__facts">
            <div><dt>Verified-active records</dt><dd>{readiness?.verifiedActiveInstructorCount ?? 0}</dd></div>
            <div><dt>Required coverage through</dt><dd>{readiness?.requiredThrough ?? "Preview authorization unavailable"}</dd></div>
            <div><dt>Raw evidence at rest</dt><dd>AES-256-GCM application envelope</dd></div>
            <div><dt>Browser database access</dt><dd>Denied</dd></div>
            <div><dt>Production / training credit</dt><dd>Not authorized</dd></div>
          </dl>
          {readiness?.error ? <p className="fdacs-live__muted">{readiness.error}</p> : null}
          <p className="fdacs-live__fineprint">
            Raw files are accepted only by this protected server route, validated by content signature, encrypted in memory,
            and sent to the service-role-only FDACS archive. The response exposes record identifiers and hashes, never the files,
            encryption key, legal name, or license number.
          </p>
        </aside>
      </section>
    </main>
  );
}
