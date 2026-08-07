"use client";

import Image from "next/image";
import { useEffect } from "react";

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

const ec = [
  ["ADG Adopt", "AI Governance: Adopt", "/badges/eccouncil/adg-adopt.png", "https://aigovernance.eccouncil.org/verify/ADG-ADO-4RQRY6"],
  ["ADG Defend", "AI Governance: Defend", "/badges/eccouncil/adg-defend.png", "https://aigovernance.eccouncil.org/verify/ADG-DEF-93CTC8"],
  ["ADG Govern", "AI Governance: Govern", "/badges/eccouncil/adg-govern.png", "https://aigovernance.eccouncil.org/verify/ADG-GOV-9Q8BPK"],
  ["CEH", "Certified Ethical Hacker", "/badges/eccouncil/ceh.png", "https://aspen.eccouncil.org/verify"],
  ["CHFI", "Computer Hacking Forensic Investigator", "/badges/eccouncil/chfi.png", "https://aspen.eccouncil.org/verify"],
  ["ECIH", "EC-Council Certified Incident Handler", "/badges/eccouncil/ecih.png", "https://aspen.eccouncil.org/verify"],
  ["ECES", "EC-Council Certified Encryption Specialist", "/badges/eccouncil/eces.png", "https://aspen.eccouncil.org/verify"],
  ["Associate CCISO", "Associate Certified Chief Information Security Officer", "/badges/eccouncil/associate-cciso.png", "https://aspen.eccouncil.org/verify"],
  ["CNDA", "Certified Network Defense Architect", "/badges/eccouncil/cnda.png", "https://aspen.eccouncil.org/verify"],
];

const licenses = [
  ["Private Investigator", "C 3600281", "BLANCHARD, JODY W"],
  ["Security Officer", "D 3617216", "BLANCHARD, JODY W"],
  ["Security Officer School Instructor", "DI3600107", "BLANCHARD, JODY W."],
  ["Statewide Firearms License", "G 3604219", "BLANCHARD, JODY W."],
];

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
        <span>Use each issuer link to verify the credential or professional license at its official source.</span>
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
        {ec.map(([name, fullName, image, verify]) => (
          <article className="verified-credential-card ec-council-credential-card" key={name}>
            <a className="ec-council-badge-artwork protected-credential-artwork" href={verify} target="_blank" rel="noreferrer" aria-label={`Verify ${name}`} onContextMenu={(event) => event.preventDefault()} onDragStart={(event) => event.preventDefault()}>
              <Image src={image} alt={`${name} official EC-Council badge`} width={190} height={190} sizes="(max-width: 480px) 180px, (max-width: 760px) 164px, 190px" draggable={false} />
              <span className="credential-artwork-watermark">VERIFIED · OBSERRA</span>
            </a>
            <div className="verified-credential-detail"><span>EC-Council</span><strong>{name}</strong><p>{fullName}</p><a className="verified-credential-verify-link" href={verify} target="_blank" rel="noreferrer">Verify credential</a></div>
          </article>
        ))}
      </div>

      <h3 className="verified-credentials-group-title">Florida FDACS professional licenses</h3>
      <div className="verified-credentials-grid florida-license-grid">
        {licenses.map(([type, number, licensedName]) => (
          <article className="verified-credential-card florida-license-card" key={number}>
            <div className="fdacs-license-mark" aria-label="Florida Department of Agriculture and Consumer Services"><span>FLORIDA</span><strong>FDACS</strong><small>LICENSED</small></div>
            <div className="verified-credential-detail"><span>Florida FDACS</span><strong>{type}</strong><p>{number}</p><small className="florida-license-name">{licensedName}</small><a className="verified-credential-verify-link" href="https://licensing.fdacs.gov/access/individual.aspx" target="_blank" rel="noreferrer">Verify with Florida FDACS</a></div>
          </article>
        ))}
      </div>

      <a className="verified-credentials-profile-link" href="https://www.credly.com/users/jody-blanchard.177e348f" target="_blank" rel="noreferrer">View the complete verified Credly profile</a>
    </section>
  );
}
