"use client";

import Image from "next/image";
import "./certificate.css";
import "./brand-certificate.css";

const LEGAL_NAME = "Obserra Executive Protection & Intelligence, LLC";
const OFFICIAL_LOGO = "/brand/obserra-logo.png";
const CREDENTIAL_NAME = "Certificate of Course Completion";

type CertificateProps = {
  learnerName: string;
  courseTitle: string;
  courseVersion: string;
  department: string;
  trainingHours: string;
  completedAt: string;
  certificateId: string;
  signatureAlgorithm: string;
  publicKeyFingerprint: string;
};

export default function CertificateView({
  learnerName,
  courseTitle,
  courseVersion,
  department,
  trainingHours,
  completedAt,
  certificateId,
  signatureAlgorithm,
  publicKeyFingerprint,
}: CertificateProps) {
  const completionDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(completedAt));
  const verificationUrl = `/api/academy/certificate/verify?certificateId=${encodeURIComponent(certificateId)}`;
  const normalizedVersion = courseVersion.startsWith("v") ? courseVersion : `v${courseVersion}`;

  return (
    <main className="certificate-page">
      <nav>
        <a href="/academy">Obserra Academy</a>
        <a href={verificationUrl} target="_blank" rel="noreferrer">Verify signature</a>
        <button onClick={() => window.print()}>Print certificate</button>
      </nav>

      <section className="certificate-document">
        <div className="certificate-corner certificate-corner-left" />
        <div className="certificate-corner certificate-corner-right" />
        <div className="certificate-brands">
          <Image src={OFFICIAL_LOGO} alt={LEGAL_NAME} width={220} height={42} priority />
          <div className="academy-seal" aria-label={`Obserra Academy, a training division of ${LEGAL_NAME}`}>
            <span>OA</span>
            <b>OBSERRA ACADEMY</b>
            <small>A TRAINING DIVISION OF OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE, LLC</small>
          </div>
        </div>

        <div className="certificate-rule" />
        <p className="certificate-label">{CREDENTIAL_NAME}</p>
        <p className="certificate-kicker">Cryptographically signed professional development record of {LEGAL_NAME}</p>
        <h1>This certifies that</h1>
        <h2>{learnerName}</h2>
        <p className="certificate-copy">has successfully completed the following Obserra Academy course:</p>
        <h3>{courseTitle}</h3>
        <p className="certificate-copy certificate-copy-strong">Completion included every required learning experience and the required final assessment.</p>

        <div className="certificate-meta">
          <span>Academy division<strong>{department} Department</strong></span>
          <span>Course Version<strong>{normalizedVersion}</strong></span>
          <span>Instructional hours<strong>{trainingHours}</strong></span>
          <span>Verification ID<strong>{certificateId}</strong></span>
        </div>

        <div className="certificate-authentication">
          <div className="certificate-verification-seal" aria-label={`${LEGAL_NAME} verified digital seal`}>
            <div className="certificate-verification-seal-inner">
              <Image src={OFFICIAL_LOGO} alt={`Official ${LEGAL_NAME} logo`} width={96} height={96} />
              <b>VERIFIED</b>
              <small>{signatureAlgorithm} SIGNATURE</small>
            </div>
          </div>
          <div className="certificate-signature">
            <span className="signature-mark">Dr. Jody Blanchard</span>
            <b>DR. JODY BLANCHARD</b>
            <small>Founder and Owner. This completion record is digitally signed by Dr. Jody Blanchard and issued by {LEGAL_NAME}.</small>
          </div>
        </div>

        <div className="certificate-verification">
          <span>Completion date <b>{completionDate}</b></span>
          <span>Course Version <b>{normalizedVersion}</b></span>
          <span>Signature algorithm <b>{signatureAlgorithm}</b></span>
          <span>Signing key fingerprint <b>{publicKeyFingerprint.slice(0, 16)}...{publicKeyFingerprint.slice(-16)}</b></span>
          <span>Verify online <b><a href={verificationUrl}>Certificate verification record</a></b></span>
        </div>

        <footer>
          <b>Issued by Obserra Academy, a training division of {LEGAL_NAME}</b>
          <small>This signed record confirms completion of an Obserra Academy course. It is not a government license, occupational authorization, accredited academic credit, or third-party professional certification.</small>
        </footer>
      </section>
    </main>
  );
}
