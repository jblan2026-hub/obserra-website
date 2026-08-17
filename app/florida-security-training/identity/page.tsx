import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import IdentityVerificationClient from "./IdentityVerificationClient";
import { requireFloridaClassDPageUser } from "../../../lib/florida-class-d-page-auth";
import { evaluateFloridaClassDIdentityStageAccess } from "../../../lib/florida-class-d-student-access";
import "../florida-security-training.css";

export const metadata: Metadata = {
  title: "Class D Student Identity Verification | OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC",
  robots: { index: false, follow: false },
};

export default async function FloridaClassDIdentityVerificationPage() {
  const { userId } = await requireFloridaClassDPageUser("/florida-security-training/identity");
  const access = await evaluateFloridaClassDIdentityStageAccess(userId);
  if (!access.allowed) notFound();

  return (
    <main className="fl-classd">
      <section className="fl-classd__hero">
        <div className="fl-classd__eyebrow"><ShieldCheck size={18} /> Controlled student identity</div>
        <h1>Verify identity before course access</h1>
        <p className="fl-classd__lead">Automated government-ID verification and matching-selfie evidence are completed first. A licensed Class DI instructor must then personally verify the student and qualifying photo ID. Both controls must pass before course access.</p>
      </section>
      <IdentityVerificationClient />
    </main>
  );
}
