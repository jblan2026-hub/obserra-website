import type { Metadata } from "next";
import Link from "next/link";
import { trustPolicies } from "./policies";
import "./trust.css";

export const metadata: Metadata = {
  title: "Trust Center | Policies, Legal, Security, and Buyer Protections",
  description: "Obserra Trust Center: privacy, terms, licensing, refund, security, accessibility, data handling, and related buyer protections.",
  alternates: { canonical: "/trust" },
  keywords: [
    "Obserra trust center",
    "privacy policy",
    "terms of use",
    "security disclosure",
    "data handling",
    "enterprise buyer protections",
  ],
  openGraph: {
    title: "Obserra Trust Center | Policies, Security, and Buyer Protections",
    description: "Review legal, privacy, security, and procurement protections for Obserra services, software, and training engagements.",
    url: "https://www.obserrallc.com/trust",
    type: "website",
    images: [{ url: "/brand/visuals/obserra-cybersecurity.png", width: 1344, height: 768, alt: "Obserra Trust Center" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Obserra Trust Center | Policies and Buyer Protections",
    description: "Privacy, terms, security, refunds, and data handling for enterprise procurement confidence.",
    images: ["/brand/visuals/obserra-cybersecurity.png"],
  },
};

export default function TrustCenterPage() {
  return (
    <main className="trust-page">
      <div className="trust-wrap">
        <p className="trust-eyebrow">OBSERRA TRUST CENTER</p>
        <h1>Policies and protections buyers need before they commit.</h1>
        <p className="trust-lead">
          This Trust Center provides legal terms, privacy details, service disclosures, and handling controls that support enterprise buying, procurement review, and governance workflows.
        </p>
        <div className="trust-grid">
          {trustPolicies.map((policy) => (
            <Link key={policy.slug} href={`/trust/${policy.slug}`} className="trust-card">
              <h2>{policy.title}</h2>
              <p>{policy.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
