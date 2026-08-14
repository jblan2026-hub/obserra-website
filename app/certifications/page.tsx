import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import VerifiedCredentials from "../about/VerifiedCredentials";
import { LEGAL_ENTITY_NAME } from "@/lib/legal-identity";
import "../about/about.css";
import "../about/about-extra.css";

export const metadata: Metadata = {
  title: `Certifications and Professional Credentials | ${LEGAL_ENTITY_NAME}`,
  description: `Review issuer backed cybersecurity, risk, privacy, audit, AI governance, and protective services credentials held by ${LEGAL_ENTITY_NAME} founder Dr. Jody Blanchard.`,
  alternates: { canonical: "/certifications" },
};

export default function CertificationsPage() {
  return (
    <main className="about-page">
      <header className="about-nav">
        <Link href="/" className="about-brand">
          <Image src="/brand/obserra-logo.png" width={286} height={55} priority alt={LEGAL_ENTITY_NAME} />
        </Link>
        <nav>
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/services">Services</Link>
          <Link href="/academy">Academy</Link>
          <Link href="/trust">Trust</Link>
          <Link href="/contact?interest=enterprise-consultation" className="about-nav-cta">Talk with {LEGAL_ENTITY_NAME}</Link>
        </nav>
      </header>

      <section className="about-hero" style={{ minHeight: 430 }}>
        <div className="about-grid" />
        <div className="about-hero-copy">
          <p className="about-kicker">CERTIFICATIONS AND PROFESSIONAL CREDENTIALS</p>
          <h1>Verified qualifications behind {LEGAL_ENTITY_NAME} leadership.</h1>
          <p>Review issuer backed professional certifications and Florida licenses. Verification actions open the applicable issuer or licensing authority.</p>
        </div>
      </section>

      <section className="credentials">
        <VerifiedCredentials />
      </section>

      <section className="about-cta">
        <p className="about-kicker">ABOUT {LEGAL_ENTITY_NAME}</p>
        <h2>Credentials support the work. Executive judgment determines how they are applied.</h2>
        <p>Learn more about {LEGAL_ENTITY_NAME} leadership, experience, business capabilities, and the operating philosophy behind our services and products.</p>
        <div><Link className="about-button" href="/about">Review company leadership</Link></div>
      </section>

      <footer className="about-footer">
        <Image src="/brand/obserra-logo.png" width={180} height={35} alt={LEGAL_ENTITY_NAME} />
        <p>Copyright OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC. Credential artwork remains the property of the applicable issuing organizations.</p>
      </footer>
    </main>
  );
}
