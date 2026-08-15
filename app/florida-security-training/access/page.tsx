import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { getFloridaClassDIdentityVerificationStatus } from "../../../lib/florida-class-d-identity-verification";
import { listFloridaClassDStudentLiveSessions } from "../../../lib/florida-class-d-live-persistence";
import "../florida-security-training.css";

export const metadata: Metadata = {
  title: "Class D Controlled Course Access | OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC",
  robots: { index: false, follow: false },
};

function sessionTime(value: string, timeZone: string) {
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) return "Schedule pending";
  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone,
      timeZoneName: "short",
    }).format(parsed);
  } catch {
    return parsed.toISOString();
  }
}

export default async function FloridaClassDControlledAccessPage() {
  const { userId } = await auth();
  if (!userId) redirect(`/sign-in?redirect_url=${encodeURIComponent("/florida-security-training/access")}`);

  let status: Awaited<ReturnType<typeof getFloridaClassDIdentityVerificationStatus>> | null = null;
  let unavailable = false;
  try {
    status = await getFloridaClassDIdentityVerificationStatus(userId);
  } catch {
    unavailable = true;
  }
  if (status?.enrollmentId && !status.instructorAttestationRecorded) {
    redirect("/florida-security-training/identity");
  }

  const active = Boolean(
    status?.instructionalAccessGranted &&
    ["enrolled", "in_progress", "instruction_complete", "exam_eligible"].includes(status.enrollmentStatus ?? ""),
  );
  let liveSessions: Awaited<ReturnType<typeof listFloridaClassDStudentLiveSessions>> = [];
  if (active) {
    try {
      liveSessions = await listFloridaClassDStudentLiveSessions(userId);
    } catch {
      unavailable = true;
    }
  }

  return (
    <main className="fl-classd">
      <section className="fl-classd__hero">
        <div className="fl-classd__eyebrow"><ShieldCheck size={18} /> Controlled course entry</div>
        <h1>Florida Class D student access</h1>
        {active ? (
          <div className="fl-classd__notice">
            <ShieldCheck size={20} />
            <div><strong>Enrollment and identity controls are satisfied.</strong><span>Open only the live-session link assigned in your controlled course schedule. The assigned instructor must complete today&apos;s live identity check-in before the LMS issues a single-device instructional lease.</span></div>
          </div>
        ) : (
          <div className="fl-classd__notice">
            <LockKeyhole size={20} />
            <div>
              <strong>Course access remains locked.</strong>
              <span>{unavailable ? "The regulated identity datastore is unavailable or not configured." : !status?.enrollmentId ? "No eligible regulated enrollment was found." : "Identity is verified, but enrollment entitlement and school approval are still pending."}</span>
            </div>
          </div>
        )}
        <div className="fl-classd__actions">
          {!status?.enrollmentId ? <Link href="/florida-security-training/enroll">Begin controlled enrollment</Link> : null}
          {!status?.instructorAttestationRecorded && status?.enrollmentId ? <Link href="/florida-security-training/identity">Complete identity verification</Link> : null}
          <Link className="secondary" href="/florida-security-training">Return to course information</Link>
        </div>
      </section>
      <section className="fl-classd__section" aria-labelledby="protected-access-sequence">
        <h2 id="protected-access-sequence">Protected identity and video sequence</h2>
        <div className="fl-classd__automation-grid">
          <div><b>1</b><span>Controlled enrollment establishes the release-bound learner record.</span></div>
          <div><b>2</b><span>Stripe hosts the government-ID image and selfie check. The LMS does not store copies or biometric templates.</span></div>
          <div><b>3</b><span>The assigned licensed Class DI instructor completes the separate personal photo-ID attestation.</span></div>
          <div><b>4</b><span>The assigned lesson link opens short-lived secure video only after enrollment, identity, instructor, schedule, and single-device controls pass.</span></div>
        </div>
      </section>
      {active ? (
        <section className="fl-classd__section">
          <h2>Assigned live lessons</h2>
          <p>Use these release-bound lesson links. Video access remains locked until the assigned instructor starts the lesson and today&apos;s identity check is recorded.</p>
          {liveSessions.length ? (
            <div className="fl-classd__automation-grid">
              {liveSessions.map((session) => (
                <div key={session.id}>
                  <b>Day {session.day} · {session.lesson_id}</b>
                  <span>{sessionTime(session.scheduled_start_at, session.time_zone)} · {session.status}</span>
                  <Link href={`/florida-security-training/live/${encodeURIComponent(session.id)}`}>Open controlled classroom</Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="fl-classd__notice"><span>No assigned live lessons are currently available.</span></div>
          )}
        </section>
      ) : null}
    </main>
  );
}
