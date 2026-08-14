"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Acknowledgment = {
  code: string;
  label: string;
  statement: string;
};

type Cohort = {
  id?: unknown;
  cohort_code?: unknown;
  start_date?: unknown;
  end_date?: unknown;
  execution_profile?: unknown;
  uat_expires_at?: unknown;
};

type EnrollmentStatus = {
  id?: unknown;
  status?: unknown;
  execution_profile?: unknown;
  training_credit_eligible?: unknown;
};

type EnrollmentResponse = {
  enrollment?: EnrollmentStatus | null;
  cohorts?: Cohort[];
  preEnrollmentEnabled?: boolean;
  executionProfile?: "production" | "owner_uat_noncredit";
  trainingCreditEligible?: boolean;
  fdacsApprovalClaimed?: boolean;
  error?: string;
};

async function loadEnrollment() {
  const response = await fetch("/api/florida-class-d/enrollment", {
    cache: "no-store",
    headers: { accept: "application/json" },
  });
  const payload = await response.json().catch(() => ({})) as EnrollmentResponse;
  if (!response.ok) throw new Error(payload.error || "Enrollment status is unavailable.");
  return payload;
}

export default function EnrollmentClient({ acknowledgments }: { acknowledgments: Acknowledgment[] }) {
  const router = useRouter();
  const [payload, setPayload] = useState<EnrollmentResponse | null>(null);
  const [legalName, setLegalName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [cohortId, setCohortId] = useState("");
  const [accepted, setAccepted] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    loadEnrollment()
      .then((value) => {
        if (!active) return;
        setPayload(value);
        const firstCohort = value.cohorts?.find((entry) => typeof entry.id === "string");
        if (firstCohort && typeof firstCohort.id === "string") setCohortId(firstCohort.id);
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Enrollment status is unavailable.");
      });
    return () => { active = false; };
  }, []);

  const cohorts = useMemo(
    () => (payload?.cohorts ?? []).filter((entry): entry is Cohort & { id: string } => typeof entry.id === "string"),
    [payload?.cohorts],
  );
  const allAccepted = acknowledgments.every((item) => accepted.includes(item.code));
  const ownerUat = payload?.executionProfile === "owner_uat_noncredit";

  async function submit() {
    if (!legalName.trim() || !dateOfBirth || !cohortId || !allAccepted) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/florida-class-d/enrollment", {
        method: "POST",
        cache: "no-store",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({
          legalName: legalName.trim(),
          dateOfBirth,
          cohortId,
          acceptedAcknowledgmentCodes: acknowledgments.map((item) => item.code),
          correlationId: crypto.randomUUID(),
        }),
      });
      const result = await response.json().catch(() => ({})) as { error?: unknown };
      if (!response.ok) {
        throw new Error(typeof result.error === "string" ? result.error : "Enrollment could not be created.");
      }
      router.push("/florida-security-training/identity");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Enrollment could not be created.");
    } finally {
      setBusy(false);
    }
  }

  if (!payload && !error) {
    return <div className="fl-classd__notice"><span>Loading protected enrollment controls…</span></div>;
  }

  if (payload?.enrollment?.id) {
    return (
      <div className="fl-classd__notice">
        <strong>An enrollment record already exists.</strong>
        <span>Status: {typeof payload.enrollment.status === "string" ? payload.enrollment.status : "controlled review"}. Continue to identity verification.</span>
        <a href="/florida-security-training/identity">Continue to secure identity verification</a>
      </div>
    );
  }

  return (
    <section className="fl-classd__section" aria-live="polite">
      {ownerUat ? (
        <div className="fl-classd__notice">
          <strong>Restricted real-identity owner acceptance test.</strong>
          <span>This is the production implementation connected to the isolated FDACS database and hosted providers. It is non-credit, does not represent FDACS approval, and cannot produce completion or LIAS records.</span>
        </div>
      ) : null}
      {error ? <div className="fl-classd__notice"><strong>Enrollment remains locked.</strong><span>{error}</span></div> : null}
      {!payload?.preEnrollmentEnabled ? (
        <div className="fl-classd__notice">
          <strong>Controlled enrollment is not enabled.</strong>
          <span>The exact-release runtime or a required protected provider is not ready.</span>
        </div>
      ) : cohorts.length === 0 ? (
        <div className="fl-classd__notice">
          <strong>No exact-release cohort is available.</strong>
          <span>A protected administrator must prepare the release-bound cohort before learner data is collected.</span>
        </div>
      ) : (
        <div className="fl-classd__automation-grid">
          <label>
            <span>Legal name</span>
            <input autoComplete="name" maxLength={200} value={legalName} onChange={(event) => setLegalName(event.target.value)} />
          </label>
          <label>
            <span>Date of birth</span>
            <input type="date" autoComplete="bday" value={dateOfBirth} onChange={(event) => setDateOfBirth(event.target.value)} />
          </label>
          <label>
            <span>Controlled cohort</span>
            <select value={cohortId} onChange={(event) => setCohortId(event.target.value)}>
              {cohorts.map((cohort) => (
                <option key={cohort.id} value={cohort.id}>
                  {typeof cohort.cohort_code === "string" ? cohort.cohort_code : "Controlled cohort"}
                  {typeof cohort.start_date === "string" && typeof cohort.end_date === "string" ? ` · ${cohort.start_date}–${cohort.end_date}` : ""}
                </option>
              ))}
            </select>
          </label>
          {acknowledgments.map((item) => (
            <label key={item.code}>
              <input
                type="checkbox"
                checked={accepted.includes(item.code)}
                onChange={(event) => setAccepted((current) => event.target.checked
                  ? [...new Set([...current, item.code])]
                  : current.filter((code) => code !== item.code))}
              />
              <span><strong>{item.label}</strong><br />{item.statement}</span>
            </label>
          ))}
          <button type="button" disabled={busy || !allAccepted || !legalName.trim() || !dateOfBirth || !cohortId} onClick={() => void submit()}>
            {busy ? "Creating protected record…" : ownerUat ? "Begin non-credit owner test" : "Create controlled pre-enrollment"}
          </button>
        </div>
      )}
    </section>
  );
}
