"use client";

import Image from "next/image";
import { useEffect } from "react";
import ecCouncilManifest from "../../public/badges/eccouncil/asset-manifest.json";

const credly = [
  ["CISSP", "Certified Information Systems Security Professional", "ISC2", "b0ed2873-a2c1-475c-b233-9052d587c4bf"],
  ["SSCP", "Systems Security Certified Practitioner", "ISC2", "5214db18-abd0-4e5e-a5c5-a1fd40b6f292"],
  ["CISA", "Certified Information Systems Auditor", "ISACA", "fc4cc937-36f4-4d01-99ef-bd092f7f29ed"],
  ["CISM", "Certified Information Security Manager", "ISACA", "390a1565-b427-4e21-b03e-84d750abc266"],
  ["CRISC", "Certification in Risk and Information Systems Control", "ISACA", "429b59f8-7277-44f3-8d07-c2fd585d3f62"],
  ["CDPSE", "Certified Data Privacy Solutions Engineer", "ISACA", "7ca2300a-73ed-46b9-ab7a-d48f58b7540e"],
  ["CISO", "Chief Information Security Officer", "Carnegie Mellon University", "bdd9cfcf-a3ef-4583-a5f2-920c14e27468"],
  ["SecurityX", "CompTIA SecurityX", "CompTIA", "91c9a509-f61a-47f4-83ce-dfc98bf98420"],
  ["Security+", "CompTIA Security+", "CompTIA", "ab52b8b0-62dd-4421-bf3e-cc6b27c02031"],
  ["Project+", "CompTIA Project+", "CompTIA", "8b0ed714-41a3-4f19-82f5-82885617c34c"],
  ["NCDA", "NetApp Certified Data Administrator", "NetApp", "e660531d-2431-4bda-8295-2954cfbdbfa3"],
];

const licenses = [
  {
    type: "Private Investigator",
    number: "C 3600281",
    licensedName: "BLANCHARD, JODY W",
    status: "licensed",
  },
  {
    type: "Security Officer",
    number: "D 3617216",
    licensedName: "BLANCHARD, JODY W",
    status: "licensed",
  },
  {
    type: "Security Officer School Instructor",
    number: "DI3600107",
    licensedName: "BLANCHARD, JODY W.",
    status: "licensed",
  },
  {
    type: "Statewide Firearms License",
    number: "G 3604219",
    licensedName: "BLANCHARD, JODY W.",
    status: "licensed",
  },
  {
    type: "Class A Private Investigative Agency",
    number: "APPLICATION PENDING",
    licensedName: "OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC",
    status: "pending",
  },
] as const;

export default function VerifiedCredentials() {
  useEffect(() => {
    if (document.querySelector('script[data-obserra-credly="true"]')) return;
    const script = document.createElement("script");
    script.src = "https://cdn.credly.com/assets/utilities/embed.js";
    script.async = true;
    script.dataset.obserraCredly = "true";
    document.body.appendChild(script);
  }, []);

  return (
    <section className="verified-credentials-gallery" aria-labelledby="verified-credentials-title">
      <div className="verified-credentials-heading">
        <p>VERIFIED EXECUTIVE CREDENTIALS</p>
        <h2 id="verified-credentials-title">Issuer-backed qualifications in cybersecurity, risk, privacy, audit, AI governance, and protective services.</h2>
        <span>Use each issuer link to verify the credential or professional license at its official source. Pending applications are identified separately and are not represented as issued licenses.</span>
      </div>

      <h3 className="verified-credentials-group-title">Credly verified credentials</h3>
      <div className="verified-credentials-grid">
        {credly.map(([name, fullName, issuer, badgeId]) => (
          <article className="verified-credential-card" key={badgeId}>
            <div className="verified-credential-embed" data-iframe-width="150" data-iframe-height="270" data-share-badge-id={badgeId} data-share-badge-host="https://www.credly.com">
              <div className="credential-loading-mark" aria-hidden="true"><span>{issuer}</span><strong>{name}</strong><small>Verified credential</small></div>
            </div>
            <div className="verified-credential-detail"><span>{issuer}</span><strong>{name}</strong><p>{fullName}</p></div>
          </article>
        ))}
      </div>

      <h3 className="verified-credentials-group-title">EC-Council verified credentials</h3>
      <div className="verified-credentials-grid ec-council-credentials-grid">
        {ecCouncilManifest.credentials.map((credential) => (
          <article className="verified-credential-card ec-council-credential-card" key={credential.id}>
            <a
              className={`ec-council-badge-artwork protected-credential-artwork${credential.artworkKind === "issuer-verification-record" ? " ec-council-badge-artwork--certificate" : ""}`}
              href={credential.verificationUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`${credential.verificationActionLabel}: ${credential.displayName}`}
              onContextMenu={(event) => event.preventDefault()}
              onDragStart={(event) => event.preventDefault()}
            >
              <Image
                src={credential.assetPath}
                alt={`${credential.displayName} official EC-Council ${credential.artworkKind === "issuer-verification-record" ? "credential record" : "badge"}`}
                width={credential.width}
                height={credential.height}
                sizes={credential.artworkKind === "issuer-verification-record" ? "(max-width: 480px) 260px, 220px" : "(max-width: 480px) 180px, (max-width: 760px) 164px, 190px"}
                draggable={false}
                unoptimized={credential.mimeType === "image/svg+xml"}
              />
            </a>
            <div className="verified-credential-detail">
              <span>EC-Council</span>
              <strong>{credential.displayName}</strong>
              <p>{credential.fullName}</p>
              <a className="verified-credential-verify-link" href={credential.verificationUrl} target="_blank" rel="noreferrer">{credential.verificationActionLabel}</a>
            </div>
          </article>
        ))}
      </div>

      <h3 className="verified-credentials-group-title">Florida FDACS professional licenses</h3>
      <div className="verified-credentials-grid florida-license-grid">
        {licenses.map(({ type, number, licensedName, status }) => (
          <article className="verified-credential-card florida-license-card" key={`${type}-${number}`}>
            <div className="fdacs-license-mark" aria-label={`Florida Department of Agriculture and Consumer Services ${status === "pending" ? "pending application" : "licensed credential"}`}>
              <span>FLORIDA</span>
              <strong>FDACS</strong>
              <small>{status === "pending" ? "PENDING" : "LICENSED"}</small>
            </div>
            <div className="verified-credential-detail">
              <span>Florida FDACS</span>
              <strong>{type}</strong>
              <p>{number}</p>
              <small className="florida-license-name">{licensedName}</small>
              <a className="verified-credential-verify-link" href="https://licensing.fdacs.gov/access/individual.aspx" target="_blank" rel="noreferrer">Verify with Florida FDACS</a>
            </div>
          </article>
        ))}
      </div>

      <a className="verified-credentials-profile-link" href="https://www.credly.com/users/jody-blanchard.177e348f" target="_blank" rel="noreferrer">View the complete verified Credly profile</a>
    </section>
  );
}
