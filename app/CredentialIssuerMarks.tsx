"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const issuerRules: Array<[RegExp, string, string]> = [
  [/ADG Verified/i, "ADG", "ADG credential issuer"],
  [/SecurityX|Project\+/i, "CompTIA", "CompTIA certification issuer"],
  [/Certified Data Privacy Solutions Engineer|Certification in Risk and Information Systems Control|Certified Information Systems Auditor|Certified Information Security Manager/i, "ISACA", "ISACA certification issuer"],
  [/Chief Information Security Officer|Incident Handler|Encryption Specialist|Computer Hacking Forensic Investigator|Certified Ethical Hacker/i, "EC-Council", "EC-Council certification issuer"],
  [/Advanced Security Practitioner/i, "CompTIA", "CompTIA certification issuer"],
  [/Systems Security Certified Practitioner|Certified Information Systems Security Professional/i, "ISC2", "ISC2 certification issuer"],
  [/Florida Class|Florida Concealed/i, "FL", "Florida licensing authority"],
];

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
  }, [pathname]);

  return null;
}
