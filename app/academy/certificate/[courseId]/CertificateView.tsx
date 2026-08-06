"use client";

import Image from "next/image";
import "./certificate.css";
import "./brand-certificate.css";

type CertificateProps = {
  learnerName: string;
  courseTitle: string;
  department: string;
  trainingHours: string;
  completedAt: string;
  certificateId: string;
};

export default function CertificateView({
  learnerName,
  courseTitle,
  department,
  trainingHours,
  completedAt,
  certificateId,
}: CertificateProps) {
  const completionDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(completedAt));
  const verificationPath = `/academy/verify?certificateId=${encodeURIComponent(certificateId)}`;

  return (
    <main className="certificate-page">
      <nav>
        <a href="/academy">Obserra Academy</a>
        <a href={verificationPath}>Verify credential</a>
        <button onClick={() => window.print()}>Print certificate</button>
      </nav>

      <section className="certificate-document">
        <div className="certificate-corner certificate-corner-left" />
        <div className="certificate-corner certificate-corner-right" />
        <div className="certificate-brands">
          <Image src="/brand/obserra-logo.png" alt="Obserra Executive Protection & Intelligence LLC" width={220} height={42} />
          <div className="academy-seal" aria-label="Obserra Academy, a training division of Obserra Executive Protection & Intelligence LLC">
            <span>OA</span>
            <b>OBSERRA ACADEMY</b>
            <small>A TRAINING DIVISION OF OBSERRA EXECUTIVE PROTECTION &amp; INTELLIGENCE LLC</small>
          </div>
        </div>

        <div className="certificate-rule" />
        <p className="certificate-label">Certificate of Training Completion</p>
        <p className="certificate-kicker">Verified professional development record of Obserra Executive Protection &amp; Intelligence LLC</p>
        <h1>This certifies that</h1>
        <h2>{learnerName}</h2>
        <p className="certificate-copy">has successfully completed the Obserra Academy professional training program of Obserra Executive Protection &amp; Intelligence LLC</p>
        <h3>{courseTitle}</h3>
        <p className="certificate-copy certificate-copy-strong">Completion included all interactive learning experiences and a final assessment score of 80 percent or higher.</p>

        <div className="certificate-meta">
          <span>Academy division<strong>{department} Department</strong></span>
          <span>Instructional hours<strong>{trainingHours}</strong></span>
          <span>Verification ID<strong>{certificateId}</strong></span>
        </div>

        <div className="certificate-authentication">
          <div className="certificate-verification-seal" aria-label="Obserra Executive Protection & Intelligence LLC verified digital seal">
            <div className="certificate-verification-seal-inner">
              <Image src="/brand/obserra-logo.png" alt="Official Obserra Executive Protection & Intelligence LLC logo" width={96} height={96} />
              <b>VERIFIED</b>
              <small>DIGITAL SEAL</small>
            </div>
          </div>
          <div className="certificate-signature">
            <span className="signature-mark">Dr. Jody Blanchard</span>
            <b>DR. JODY BLANCHARD</b>
            <small>Founder and Owner. Digitally issued and verified by Obserra Executive Protection &amp; Intelligence LLC</small>
          </div>
        </div>

        <div className="certificate-verification">
          <span>Completion date <b>{completionDate}</b></span>
          <span>Verify at <b>www.obserrallc.com{verificationPath}</b></span>
        </div>

        <footer>
          <b>Issued by Obserra Executive Protection &amp; Intelligence LLC</b>
          <small>Property of Obserra Executive Protection &amp; Intelligence LLC. This record confirms completion of an Obserra Academy professional training program. It is not a government license, occupational authorization, accredited academic credit, or third party professional certification.</small>
        </footer>
      </section>
    </main>
  );
}
