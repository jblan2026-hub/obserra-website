import type { Metadata } from "next";
import Link from "next/link";
import { IdCard, ShieldCheck } from "lucide-react";
import { requireFloridaClassDProductionOwnerPrincipal } from "../../../../lib/florida-class-d-production-owner-validation";
import OwnerIdentityValidationClient from "./OwnerIdentityValidationClient";
import "../../florida-security-training.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Owner Identity Test | OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC",
  robots: { index: false, follow: false },
};

export default async function FloridaClassDProductionOwnerIdentityPage() {
  const principal = await requireFloridaClassDProductionOwnerPrincipal();

  return (
    <main className="fl-classd">
      <section className="fl-classd__hero">
        <div className="fl-classd__eyebrow"><IdCard size={18} /> Owner identity test</div>
        <span className="fl-classd__status">STRIPE IDENTITY · GOVERNMENT ID · MATCHING SELFIE · OWNER AAL2</span>
        <h1>Test identity verification now</h1>
        <p className="fl-classd__lead">This authenticated owner test launches the configured Stripe Identity hosted flow and returns provider status to this LMS workspace.</p>
        <div className="fl-classd__notice"><ShieldCheck size={20} /><div><strong>Authenticated owner: {principal.principalId}</strong><span>The provider handles document and selfie capture. The LMS stores only the bounded provider session reference and status required for this owner test.</span></div></div>
      </section>

      <OwnerIdentityValidationClient />

      <section className="fl-classd__section">
        <div className="fl-classd__actions">
          <Link href="/florida-security-training/owner-validation/lms">Open LMS test workspace</Link>
          <Link className="secondary" href="/florida-security-training/owner-validation">Return to owner command center</Link>
        </div>
      </section>
    </main>
  );
}
