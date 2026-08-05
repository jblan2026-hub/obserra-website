"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

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

const ecCouncilVerificationPortal = "https://aspen.eccouncil.org/verify";
const fdacsVerificationPortal = "https://licensing.fdacs.gov/access/individual.aspx";

const ecCouncilCredentials = [
  { name: "ADG Adopt", fullName: "AI Governance: Adopt", image: "/badges/eccouncil/adg-adopt.png", verifyUrl: "https://aigovernance.eccouncil.org/verify/ADG-ADO-4RQRY6" },
  { name: "ADG Defend", fullName: "AI Governance: Defend", image: "/badges/eccouncil/adg-defend.png", verifyUrl: "https://aigovernance.eccouncil.org/verify/ADG-DEF-93CTC8" },
  { name: "ADG Govern", fullName: "AI Governance: Govern", image: "/badges/eccouncil/adg-govern.png", verifyUrl: "https://aigovernance.eccouncil.org/verify/ADG-GOV-9Q8BPK" },
  { name: "CEH", fullName: "Certified Ethical Hacker", image: "/badges/eccouncil/ceh.png", verifyUrl: ecCouncilVerificationPortal },
  { name: "CHFI", fullName: "Computer Hacking Forensic Investigator", image: "/badges/eccouncil/chfi.png", verifyUrl: ecCouncilVerificationPortal },
  { name: "ECIH", fullName: "EC-Council Certified Incident Handler", image: "/badges/eccouncil/ecih.png", verifyUrl: ecCouncilVerificationPortal },
  { name: "ECES", fullName: "EC-Council Certified Encryption Specialist", image: "/badges/eccouncil/eces.png", verifyUrl: ecCouncilVerificationPortal },
  { name: "Associate CCISO", fullName: "Associate Certified Chief Information Security Officer", image: "/badges/eccouncil/associate-cciso.png", verifyUrl: ecCouncilVerificationPortal },
  { name: "CNDA", fullName: "Certified Network Defense Architect", image: "/badges/eccouncil/cnda.png", verifyUrl: ecCouncilVerificationPortal },
];

const floridaLicenses = [
  { code: "C", number: "C 3600281", title: "Private Investigator" },
  { code: "D", number: "D 3617216", title: "Security Officer" },
  { code: "DI", number: "DI3600107", title: "Security Officer School Instructor" },
  { code: "G", number: "G 3604219", title: "Statewide Firearms License" },
];

function protectArtwork(element: HTMLElement) {
  element.addEventListener("contextmenu", (event) => event.preventDefault());
  element.addEventListener("dragstart", (event) => event.preventDefault());
  element.addEventListener("selectstart", (event) => event.preventDefault());
}

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
  credentialsSection.querySelector(".credentials-grid")?.remove();
  const legacyHeading = credentialsSection.querySelector<HTMLElement>(".credentials-heading");
  if (legacyHeading) legacyHeading.style.display = "none";

  const gallery = document.createElement("section");
  gallery.className = "verified-credentials-gallery";
  gallery.dataset.obserraVerifiedCredentials = "true";
  gallery.setAttribute("aria-labelledby", "verified-credentials-title");

  const heading = document.createElement("div");
  heading.className = "verified-credentials-heading";
  heading.innerHTML = `<p>VERIFIED EXECUTIVE CREDENTIALS</p><h2 id="verified-credentials-title">Issuer-backed qualifications in cybersecurity, risk, privacy, audit, AI governance, executive leadership, investigations, and protective services.</h2><span>Official badge artwork and license details are presented for verification. Select the verification action to open the issuer or licensing authority record.</span>`;

  const credlyLabel = document.createElement("h3");
  credlyLabel.className = "verified-credentials-group-title";
  credlyLabel.textContent = "Credly verified credentials";
  const credlyGrid = document.createElement("div");
  credlyGrid.className = "verified-credentials-grid";

  verifiedBadges.forEach((badge) => {
    const card = document.createElement("article");
    card.className = "verified-credential-card";
    card.dataset.issuer = badge.issuer;
    const badgeHost = document.createElement("div");
    badgeHost.className = "verified-credential-embed protected-credential-artwork";
    badgeHost.dataset.iframeWidth = "150";
    badgeHost.dataset.iframeHeight = "270";
    badgeHost.dataset.shareBadgeId = badge.badgeId;
    badgeHost.dataset.shareBadgeHost = "https://www.credly.com";
    protectArtwork(badgeHost);
    const detail = document.createElement("div");
    detail.className = "verified-credential-detail";
    detail.innerHTML = `<span>${badge.issuer}</span><strong>${badge.name}</strong><p>${badge.fullName}</p>`;
    card.append(badgeHost, detail);
    credlyGrid.appendChild(card);
  });

  const ecLabel = document.createElement("h3");
  ecLabel.className = "verified-credentials-group-title";
  ecLabel.textContent = "EC-Council verified credentials";
  const ecGrid = document.createElement("div");
  ecGrid.className = "verified-credentials-grid ec-council-credentials-grid";

  ecCouncilCredentials.forEach((credential) => {
    const card = document.createElement("article");
    card.className = "verified-credential-card ec-council-credential-card";
    card.dataset.issuer = "EC-Council";
    const artworkLink = document.createElement("a");
    artworkLink.href = credential.verifyUrl;
    artworkLink.target = "_blank";
    artworkLink.rel = "noreferrer";
    artworkLink.className = "ec-council-badge-artwork protected-credential-artwork";
    artworkLink.setAttribute("aria-label", `Verify ${credential.name} credential`);
    protectArtwork(artworkLink);
    const image = document.createElement("img");
    image.src = credential.image;
    image.alt = `${credential.name} official EC-Council badge`;
    image.loading = "lazy";
    image.draggable = false;
    image.setAttribute("decoding", "async");
    image.addEventListener("error", () => {
      artworkLink.classList.add("badge-artwork-unavailable");
      artworkLink.textContent = credential.name;
    });
    artworkLink.appendChild(image);
    const watermark = document.createElement("span");
    watermark.className = "credential-artwork-watermark";
    watermark.textContent = "VERIFIED · OBSERRA";
    artworkLink.appendChild(watermark);
    const detail = document.createElement("div");
    detail.className = "verified-credential-detail";
    detail.innerHTML = `<span>EC-Council</span><strong>${credential.name}</strong><p>${credential.fullName}</p>`;
    const verify = document.createElement("a");
    verify.href = credential.verifyUrl;
    verify.target = "_blank";
    verify.rel = "noreferrer";
    verify.className = "verified-credential-verify-link";
    verify.textContent = credential.verifyUrl === ecCouncilVerificationPortal ? "Open EC-Council verification" : "Verify credential";
    detail.appendChild(verify);
    card.append(artworkLink, detail);
    ecGrid.appendChild(card);
  });

  const floridaLabel = document.createElement("h3");
  floridaLabel.className = "verified-credentials-group-title";
  floridaLabel.textContent = "Florida professional licenses";
  const floridaIntro = document.createElement("p");
  floridaIntro.className = "florida-license-intro";
  floridaIntro.textContent = "Licenses issued through the Florida Department of Agriculture and Consumer Services, Division of Licensing.";
  const floridaGrid = document.createElement("div");
  floridaGrid.className = "verified-credentials-grid florida-license-grid";

  floridaLicenses.forEach((license) => {
    const card = document.createElement("article");
    card.className = "verified-credential-card florida-license-card";
    card.dataset.issuer = "FDACS";
    const emblem = document.createElement("div");
    emblem.className = "fdacs-license-emblem protected-credential-artwork";
    emblem.setAttribute("aria-label", "Florida Department of Agriculture and Consumer Services license");
    emblem.innerHTML = `<span>FLORIDA</span><strong>FDACS</strong><small>DIVISION OF LICENSING</small>`;
    protectArtwork(emblem);
    const detail = document.createElement("div");
    detail.className = "verified-credential-detail florida-license-detail";
    detail.innerHTML = `<span>FDACS LICENSE ${license.code}</span><strong>${license.title}</strong><p class="florida-license-number">${license.number}</p><p>Licensed to Jody W. Blanchard</p>`;
    const verify = document.createElement("a");
    verify.href = fdacsVerificationPortal;
    verify.target = "_blank";
    verify.rel = "noreferrer";
    verify.className = "verified-credential-verify-link";
    verify.textContent = "Verify with Florida FDACS";
    detail.appendChild(verify);
    card.append(emblem, detail);
    floridaGrid.appendChild(card);
  });

  const profileLink = document.createElement("a");
  profileLink.className = "verified-credentials-profile-link";
  profileLink.href = "https://www.credly.com/users/jody-blanchard.177e348f";
  profileLink.target = "_blank";
  profileLink.rel = "noreferrer";
  profileLink.textContent = "View the complete verified Credly profile";

  gallery.append(heading, credlyLabel, credlyGrid, ecLabel, ecGrid, floridaLabel, floridaIntro, floridaGrid, profileLink);
  credentialsSection.appendChild(gallery);
  loadCredlyEmbedScript();
}

export default function CredentialIssuerMarks() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname !== "/about") return;
    createVerifiedGallery();
  }, [pathname]);
  return null;
}
