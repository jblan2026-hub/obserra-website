"use client";

import { usePathname } from "next/navigation";

const credlyProfileUrl = "https://www.credly.com/users/jody-blanchard.177e348f";

export default function CredlyProfileLink() {
  const pathname = usePathname();

  if (pathname !== "/about") return null;

  return (
    <section className="credly-profile-callout" aria-label="Verified digital credentials">
      <div>
        <p>VERIFIED DIGITAL CREDENTIALS</p>
        <h2>Review Dr. Jody Blanchard&apos;s public Credly badge profile.</h2>
        <span>
          Credly provides issuer-backed digital badge verification for participating professional credentials. The public profile opens in a new browser tab.
        </span>
      </div>
      <a href={credlyProfileUrl} target="_blank" rel="noreferrer external">
        View verified Credly badges
      </a>
    </section>
  );
}
