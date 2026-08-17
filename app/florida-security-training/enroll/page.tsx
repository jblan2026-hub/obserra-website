import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import {
  floridaClassDPreEnrollmentEnabled,
  floridaClassDRequiredAcknowledgments,
} from "../../../lib/florida-class-d-enrollment-policy";
import { requireFloridaClassDPageUser } from "../../../lib/florida-class-d-page-auth";
import EnrollmentClient from "./EnrollmentClient";
import "../florida-security-training.css";

export const metadata: Metadata = {
  title: "Class D Controlled Enrollment | OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC",
  robots: { index: false, follow: false },
};

export default async function FloridaClassDEnrollmentPage() {
  await requireFloridaClassDPageUser("/florida-security-training/enroll");
  if (!floridaClassDPreEnrollmentEnabled()) notFound();

  return (
    <main className="fl-classd">
      <section className="fl-classd__hero">
        <div className="fl-classd__eyebrow"><ShieldCheck size={18} /> Controlled student record</div>
        <h1>Florida Class D protected enrollment</h1>
        <p className="fl-classd__lead">Enter regulated learner information only on this protected page. Identity-document and selfie capture occurs later on Stripe&apos;s hosted service; those images are not copied into the LMS database.</p>
      </section>
      <EnrollmentClient acknowledgments={floridaClassDRequiredAcknowledgments.map((item) => ({ ...item }))} />
    </main>
  );
}
