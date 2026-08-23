"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ACADEMY_BRAND_NAME,
  EIOS_BRAND_NAME,
  LEGAL_ENTITY_NAME,
} from "../../../lib/legal-identity";
import "./enterprise-chrome.css";
import "./enterprise-sales-navigation.css";
import "./legal-identity-lockup.css";

const primaryNavigation = [
  [ACADEMY_BRAND_NAME, "/academy", "sales"],
  ["Services", "/services"],
  ["Industries", "/industries"],
  [EIOS_BRAND_NAME, "/eios"],
  ["Trust Center", "/trust"],
  ["About", "/about"],
  ["Speaking", "/speaking"],
] as const;

export function EnterpriseHeader({ section = "Enterprise" }: { section?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function close() {
    setOpen(false);
  }

  return (
    <header className="ent-header">
      <div className="ent-header__main">
        <Link className="ent-header__brand" href="/" aria-label={`${LEGAL_ENTITY_NAME} home`} onClick={close}>
          <Image src="/brand/obserra-logo.png" width={286} height={55} priority alt={LEGAL_ENTITY_NAME} />
          <span className="ent-header__identity">
            <span className="ent-header__legal-name">{LEGAL_ENTITY_NAME}</span>
            <small>{section}</small>
          </span>
        </Link>
        <button ref={toggleRef} className="ent-header__toggle" type="button" aria-label={open ? "Close enterprise navigation" : "Open enterprise navigation"} aria-expanded={open} aria-controls="enterprise-navigation" onClick={() => setOpen((value) => !value)}>
          <span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" />
        </button>
        <nav id="enterprise-navigation" className={`ent-header__nav${open ? " is-open" : ""}`} aria-label="Enterprise navigation">
          {primaryNavigation.map(([label, href, prominence]) => (
            <Link
              key={href}
              href={href}
              className={prominence === "sales" ? "ent-header__sales-link" : undefined}
              data-navigation={prominence === "sales" ? "academy" : undefined}
              onClick={close}
              aria-current={pathname === href || pathname.startsWith(`${href}/`) ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
          <Link href="/ai-marketplace" className="ent-header__marketplace" style={{ justifyContent: "center", padding: "0 16px", border: "1px solid #eeb756", borderRadius: 10, background: "linear-gradient(135deg,#ffd978,#e5a62e)", color: "#071a2b", boxShadow: "0 9px 26px #0006" }} onClick={close} aria-current={pathname === "/ai-marketplace" || pathname.startsWith("/ai-marketplace/") ? "page" : undefined}>AI Skills Marketplace</Link>
          <Link href="/florida-security-training" className="ent-header__florida" onClick={close} aria-current={pathname === "/florida-security-training" || pathname.startsWith("/florida-security-training/") ? "page" : undefined}>Florida Class D Training</Link>
          <Link href="/apps" className="ent-header__applications" onClick={close} aria-current={pathname === "/apps" || pathname.startsWith("/apps/") ? "page" : undefined}>Applications</Link>
          <Link href="/contact?interest=enterprise-consultation" className="ent-header__cta" onClick={close}>Request consultation</Link>
        </nav>
      </div>
    </header>
  );
}

export function EnterpriseProofBand({ children }: { children?: ReactNode }) {
  return (
    <section className="ent-proof" aria-label={`${LEGAL_ENTITY_NAME} operating principles`}>
      {children ?? (
        <>
          <div><span>01</span><strong>Executive-led</strong><small>Senior judgment at the point of decision</small></div>
          <div><span>02</span><strong>Evidence-backed</strong><small>Traceable analysis, controls, and outcomes</small></div>
          <div><span>03</span><strong>Security-conscious</strong><small>Controlled information and delivery boundaries</small></div>
          <div><span>04</span><strong>Mission-focused</strong><small>Clear ownership, action, and verification</small></div>
        </>
      )}
    </section>
  );
}

export function EnterpriseFooter() {
  return (
    <footer className="ent-footer">
      <div className="ent-footer__lead">
        <Image src="/brand/obserra-logo.png" width={286} height={55} alt={LEGAL_ENTITY_NAME} />
        <strong className="ent-footer__legal-name">{LEGAL_ENTITY_NAME}</strong>
        <p>Executive advisory, cybersecurity, protective intelligence, secure technology, and professional learning for organizations facing consequential decisions.</p>
        <Link href="/contact?interest=enterprise-consultation">Request an executive consultation <span aria-hidden="true">→</span></Link>
      </div>
      <nav aria-label="Enterprise capabilities"><strong>Capabilities</strong><Link href="/academy">{ACADEMY_BRAND_NAME}</Link><Link href="/services">Enterprise services</Link><Link href="/protection-intelligence">Protection and intelligence</Link><Link href="/eios">{EIOS_BRAND_NAME}</Link></nav>
      <nav aria-label="Enterprise company links"><strong>Company</strong><Link href="/about">Leadership and credentials</Link><Link href="/speaking">Speaking and briefings</Link><Link href="/industries">Industries</Link><Link href="/resources">Resources</Link></nav>
      <nav aria-label="Enterprise assurance links"><strong>Assurance</strong><Link href="/trust">Trust Center</Link><Link href="/trust/privacy-policy">Privacy</Link><Link href="/trust/security-and-responsible-disclosure">Security</Link><Link href="/trust/accessibility-statement">Accessibility</Link></nav>
      <div className="ent-footer__legal"><span>© {new Date().getFullYear()} {LEGAL_ENTITY_NAME}. All rights reserved.</span><span>{EIOS_BRAND_NAME} and {ACADEMY_BRAND_NAME} materials are proprietary products of {LEGAL_ENTITY_NAME}.</span></div>
    </footer>
  );
}
