"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const issuerRules: Array<[RegExp, string, string]> = [
  [/ADG Verified/i, "ADG", "ADG credential issuer"],
  [/SecurityX|Security\+|Project\+/i, "CompTIA", "CompTIA certification issuer"],
  [/Certified Data Privacy Solutions Engineer|Certification in Risk and Information Systems Control|Certified Information Systems Auditor|Certified Information Security Manager/i, "ISACA", "ISACA certification issuer"],
  [/Chief Information Security Officer|Incident Handler|Encryption Specialist|Computer Hacking Forensic Investigator|Certified Ethical Hacker/i, "EC-Council", "EC-Council certification issuer"],
  [/Advanced Security Practitioner/i, "CompTIA", "CompTIA certification issuer"],
  [/Systems Security Certified Practitioner|Certified Information Systems Security Professional/i, "ISC2", "ISC2 certification issuer"],
  [/Florida Class|Florida Concealed/i, "FL", "Florida licensing authority"],
];

const verifiedBadges = [
  { name: "CISSP", fullName: "Certified Information Systems Security Professional", issuer: "ISC2", badgeId: "b0ed2873-a2c1-475c-b233-9052d587c4bf" },
  { name: "SSCP", fullName: "Systems Security Certified Practitioner", issuer: "ISC2", badgeId: "5214db18-abd0-4e5e-a5c5-a1fd40b6f292" },
  { name: "CISA", fullName: "Certified Information Systems Auditor", issuer: "ISACA", badgeId: "fc4cc937-36f4-4d01-99ef-bd092f7f29ed" },
  { name: "CISM", fullName: "Certified Information Security Manager", issuer: "ISACA", badgeId: "390a1565-b427-4e21-b03e-84d750abc266" },
  { name: "CRISC", fullName: "Certification in Risk and Information Systems Control", issuer: "ISACA", badgeId: "429b59f8-7277-44f3-8d07-c2fd585d3f62" },
  { name: "CDPSE", fullName: "Certified Data Privacy Solutions Engineer", issuer: "ISACA", badgeId: "7ca2300a-73ed-46b9-ab7a-d48f58b7540e" },
  { name: "CISO", fullName: "Chief Information Security Officer", issuer: "Carnegie Mellon University", badgeId: "bdd9cfcf-a3ef-4583-a5f2-920c14e27468" },
  { name: "SecurityX", fullName: "CompTIA SecurityX", issuer: "CompTIA", badgeId: "91c9a509-f61a-47f4-83ce-dfc98bf98420" },
  { name: "Security+", fullName: "CompTIA Security+", issuer: "CompTIA", badgeId: "ab52b8b0-62dd-4421-bf3e-cc6b27c02031" },
  { name: "Project+", fullName: "CompTIA Project+", issuer: "CompTIA", badgeId: "8b0ed714-41a3-4f19-82f5-82885617c34c" },
  { name: "NCDA", fullName: "NetApp Certified Data Administrator", issuer: "NetApp", badgeId: "e660531d-2431-4bda-8295-2954cfbdbfa3" },
];

function loadCredlyEmbedScript() {
  if (document.querySelector<HTMLScriptElement>('script[data-obserra-credly="true"]')) return;
  const script = document.createElement("script");
  script.src = "https://cdn.credly.com/assets/utilities/embed.js";
  script.async = true;
  script.dataset.obserraCredly = "true";
  document.body.appendChild(script);
}

function createVerifiedGallery() {
  if (document.querySelector("[data-obserra-verified-credentials]")) return;
  const credentialsSection = document.querySelector<HTMLElement>(".credentials");
  if (!credentialsSection) return;

  const gallery = document.createElement("section");
  gallery.className = "verified-credentials-gallery";
  gallery.dataset.obserraVerifiedCredentials = "true";
  gallery.setAttribute("aria-labelledby", "verified-credentials-title");

  const heading = document.createElement("div");
  heading.className = "verified-credentials-heading";
  heading.innerHTML = `
    <p>ISSUER-VERIFIED DIGITAL CREDENTIALS</p>
    <h2 id="verified-credentials-title">Professional credentials verified through Credly.</h2>
    <span>Each badge below is issued and hosted by its credentialing organization through Credly. Select a badge to review the official verification record.</span>
  `;

  const grid = document.createElement("div");
  grid.className = "verified-credentials-grid";

  verifiedBadges.forEach((badge) => {
    const card = document.createElement("article");
    card.className = "verified-credential-card";
    card.dataset.issuer = badge.issuer;

    const badgeHost = document.createElement("div");
    badgeHost.className = "verified-credential-embed";
    badgeHost.dataset.iframeWidth = "150";
    badgeHost.dataset.iframeHeight = "270";
    badgeHost.dataset.shareBadgeId = badge.badgeId;
    badgeHost.dataset.shareBadgeHost = "https://www.credly.com";

    const detail = document.createElement("div");
    detail.className = "verified-credential-detail";
    detail.innerHTML = `
      <span>${badge.issuer}</span>
      <strong>${badge.name}</strong>
      <p>${badge.fullName}</p>
    `;

    card.append(badgeHost, detail);
    grid.appendChild(card);
  });

  const profileLink = document.createElement("a");
  profileLink.className = "verified-credentials-profile-link";
  profileLink.href = "https://www.credly.com/users/jody-blanchard.177e348f";
  profileLink.target = "_blank";
  profileLink.rel = "noreferrer";
  profileLink.textContent = "View the complete verified Credly profile";

  gallery.append(heading, grid, profileLink);
  credentialsSection.appendChild(gallery);
  loadCredlyEmbedScript();
}

export default function CredentialIssuerMarks() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/about") return;

    const cards = Array.from(document.querySelectorAll<HTMLElement>(".credentials-grid article"));
    cards.forEach((card) => {
      if (card.querySelector("[data-credential-issuer]")) return;
      const title = card.querySelector("h3")?.textContent?.trim() ?? "";
      const match = issuerRules.find(([pattern]) => pattern.test(title));
      if (!match) return;

      const [, label, accessibleLabel] = match;
      const mark = document.createElement("span");
      mark.dataset.credentialIssuer = label;
      mark.className = "credential-issuer-mark";
      mark.textContent = label;
      mark.setAttribute("aria-label", accessibleLabel);
      card.prepend(mark);
    });

    createVerifiedGallery();
  }, [pathname]);

  return null;
}
