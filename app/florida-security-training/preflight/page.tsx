import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import IdentityPreflightForm from "./IdentityPreflightForm";
import "../florida-security-training.css";
import "./preflight.css";

export const metadata: Metadata = {
  title: "Class D Identity Readiness Check | OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC",
  robots: { index: false, follow: false },
};

export default function FloridaClassDIdentityPreflightPage() {
  return (
    <main className="fl-classd">
      <section className="fl-classd__hero">
        <div className="fl-classd__eyebrow"><ShieldCheck size={18} /> Pre-login identity readiness</div>
        <h1>Check identity requirements before student sign-in</h1>
        <p className="fl-classd__lead">This public readiness step collects no student PII and grants no training access. It confirms the student can satisfy the protected identity, device, and live-instructor controls before entering the LMS account flow.</p>
      </section>
      <IdentityPreflightForm />
    </main>
  );
}
