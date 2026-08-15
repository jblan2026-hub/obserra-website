import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { ArrowUpRight, Check, CircleDashed, LockKeyhole, ShieldCheck, Video } from "lucide-react";
import { getFloridaClassDIdentityVerificationStatus } from "../../../lib/florida-class-d-identity-verification";
import { listFloridaClassDStudentLiveSessions } from "../../../lib/florida-class-d-live-persistence";
import { evaluateFloridaClassDStudentAccess } from "../../../lib/florida-class-d-student-access";
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
  const access = await evaluateFloridaClassDStudentAccess(userId);
  if (!access.allowed) notFound();

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
  const hostedIdentityComplete = Boolean(
    status?.providerStatus === "verified" &&
    status.documentCheckStatus === "verified" &&
    status.selfieCheckStatus === "verified",
  );
  const instructorIdentityComplete = Boolean(status?.instructorAttestationRecorded && status?.identityStatus === "verified");
  const controlComplete = [Boolean(status?.enrollmentId), hostedIdentityComplete, instructorIdentityComplete, active] as const;
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
      <section className="fl-classd__hero fl-classd__hero--access">
        <div className="fl-classd__hero-grid">
          <div>
            <div className="fl-classd__eyebrow"><ShieldCheck size={18} /> Controlled course entry</div>
            <h1>Florida Class D student access</h1>
            <p className="fl-classd__lead">A protected entry point for your assigned live lessons, identity controls, and server-recorded instructional time.</p>
          </div>
          <div className={`fl-classd__access-state ${active ? "is-ready" : "is-locked"}`} role="status">
            <span className="fl-classd__access-state-icon" aria-hidden="true">{active ? <Check size={20} /> : <LockKeyhole size={20} />}</span>
            <small>ACCESS STATE</small>
            <strong>{active ? "Ready for assigned lessons" : "Controlled entry locked"}</strong>
            <span>{active ? "Enrollment and identity controls satisfied" : "A required control is incomplete"}</span>
          </div>
        </div>
        {active ? (
          <div className="fl-classd__notice is-success">
            <ShieldCheck size={20} />
            <div><strong>Enrollment and identity controls are satisfied.</strong><span>Open only the live-session link assigned in your controlled course schedule. The assigned instructor must complete today&apos;s live identity check-in before the LMS issues a single-device instructional lease.</span></div>
          </div>
        ) : (
          <div className="fl-classd__notice is-locked">
            <LockKeyhole size={20} />
            <div>
              <strong>Course access remains locked.</strong>
              <span>{unavailable ? "The regulated identity datastore is unavailable or not configured." : !status?.enrollmentId ? "No eligible regulated enrollment was found." : "Identity is verified, but enrollment entitlement and school approval are still pending."}</span>
            </div>
          </div>
        )}
        <div className="fl-classd__actions">
          {!status?.instructorAttestationRecorded && status?.enrollmentId ? <Link href="/florida-security-training/identity">Complete identity verification</Link> : null}
          <Link className="secondary" href="/florida-security-training">Return to course information</Link>
        </div>
      </section>
      <section className="fl-classd__section" aria-labelledby="protected-access-sequence">
        <div className="fl-classd__section-heading">
          <span>CONTROL CHAIN</span>
          <h2 id="protected-access-sequence">Protected identity and video sequence</h2>
          <p>Every control is evaluated independently. Access remains fail-closed whenever required evidence is missing or unavailable.</p>
        </div>
        <div className="fl-classd__automation-grid fl-classd__control-grid">
          <div><b className={controlComplete[0] ? "is-complete" : "is-neutral"}>{controlComplete[0] ? <Check size={16} aria-hidden="true" /> : <CircleDashed size={16} aria-hidden="true" />}01</b><span><strong>Controlled enrollment</strong>Establishes the release-bound learner record.</span></div>
          <div><b className={controlComplete[1] ? "is-complete" : "is-neutral"}>{controlComplete[1] ? <Check size={16} aria-hidden="true" /> : <CircleDashed size={16} aria-hidden="true" />}02</b><span><strong>Hosted verification</strong>Stripe hosts the government-ID image and selfie check. The LMS does not store copies or biometric templates.</span></div>
          <div><b className={controlComplete[2] ? "is-complete" : "is-neutral"}>{controlComplete[2] ? <Check size={16} aria-hidden="true" /> : <CircleDashed size={16} aria-hidden="true" />}03</b><span><strong>Instructor attestation</strong>The assigned licensed Class DI instructor completes the separate personal photo-ID attestation.</span></div>
          <div><b className={controlComplete[3] ? "is-complete" : "is-neutral"}>{controlComplete[3] ? <Check size={16} aria-hidden="true" /> : <Video size={16} aria-hidden="true" />}04</b><span><strong>Secure live lesson</strong>The assigned lesson link opens short-lived secure video only after enrollment, identity, instructor, schedule, and single-device controls pass.</span></div>
        </div>
      </section>
      {active ? (
        <section className="fl-classd__section">
          <div className="fl-classd__section-heading">
            <span>MY SCHEDULE</span>
            <h2>Assigned live lessons</h2>
            <p>Use these release-bound lesson links. Video access remains locked until the assigned instructor starts the lesson and today&apos;s identity check is recorded.</p>
          </div>
          {liveSessions.length ? (
            <div className="fl-classd__session-list">
              {liveSessions.map((session) => (
                <article key={session.id} className="fl-classd__session-card">
                  <div><small>DAY {session.day}</small><b>{session.lesson_id}</b></div>
                  <span><strong>{sessionTime(session.scheduled_start_at, session.time_zone)}</strong><small>{session.status.replaceAll("_", " ")}</small></span>
                  <Link href={`/florida-security-training/live/${encodeURIComponent(session.id)}`}>Open classroom <ArrowUpRight size={17} aria-hidden="true" /></Link>
                </article>
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
