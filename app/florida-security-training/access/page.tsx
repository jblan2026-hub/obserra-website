import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { getFloridaClassDIdentityVerificationStatus } from "../../../lib/florida-class-d-identity-verification";
import "../florida-security-training.css";

export const metadata: Metadata = {
  title: "Class D Controlled Course Access | OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC",
  robots: { index: false, follow: false },
};

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
          {!status?.instructorAttestationRecorded && status?.enrollmentId ? <Link href="/florida-security-training/identity">Complete identity verification</Link> : null}
          <Link className="secondary" href="/florida-security-training">Return to course information</Link>
        </div>
      </section>
    </main>
  );
}
