import type { Metadata } from "next";
import Link from "next/link";
import { IdCard, ShieldCheck } from "lucide-react";
import {
  getFloridaClassDProductionOwnerValidationConfiguration,
  requireFloridaClassDProductionOwnerPrincipal,
} from "../../../../lib/florida-class-d-production-owner-validation";
import OwnerIdentityValidationClient from "./OwnerIdentityValidationClient";
import "../../florida-security-training.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Production Owner Identity Validation | OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC",
  robots: { index: false, follow: false },
};

export default async function FloridaClassDProductionOwnerIdentityPage() {
  const principal = await requireFloridaClassDProductionOwnerPrincipal();
  const configuration = getFloridaClassDProductionOwnerValidationConfiguration();

  return (
    <main className="fl-classd">
      <section className="fl-classd__hero">
        <div className="fl-classd__eyebrow"><IdCard size={18} /> Governed owner identity validation</div>
        <span className="fl-classd__status">LIVE STRIPE IDENTITY · MATCHING SELFIE · OWNER AAL2 · NON-CREDIT</span>
        <h1>Validate the real identity provider safely</h1>
        <p className="fl-classd__lead">This owner-only diagnostic uses Stripe&apos;s hosted government-ID and matching-selfie flow. It does not create a Florida learner enrollment, award instructional time, grant course access, issue a completion record, or authorize LIAS reporting.</p>
        <div className="fl-classd__notice"><ShieldCheck size={20} /><div><strong>Authenticated owner: {principal.principalId}</strong><span>The hosted provider retains identity-document and selfie capture. This diagnostic returns only provider status and a bounded error code to the LMS.</span></div></div>
      </section>

      <OwnerIdentityValidationClient
        authorized={configuration.authorized}
        blockingKeys={[...configuration.blockingKeys]}
      />

      <section className="fl-classd__section">
        <div className="fl-classd__actions">
          <Link className="secondary" href="/florida-security-training/owner-validation">Return to production command center</Link>
        </div>
      </section>
    </main>
  );
}
