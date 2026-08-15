"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { LEGAL_ENTITY_NAME } from "../../../lib/legal-identity";
import "./enterprise-chrome.css";
import "./legal-identity-lockup.css";

const primaryNavigation = [
  ["Services", "/services"],
  ["Industries", "/industries"],
  ["EIOS", "/eios"],
  ["Academy", "/academy"],
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
      <div className="ent-header__utility">
        <span>Executive advisory · Cybersecurity · Protective intelligence · Secure technology</span>
        <div><Link href="/florida-security-training">Florida training</Link><Link href="/resources">Resources</Link><Link href="/contact">Contact</Link></div>
      </div>
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
          {primaryNavigation.map(([label, href]) => (
            <Link key={href} href={href} onClick={close} aria-current={pathname === href || pathname.startsWith(`${href}/`) ? "page" : undefined}>{label}</Link>
          ))}
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
      <nav aria-label="Enterprise capabilities"><strong>Capabilities</strong><Link href="/services">Enterprise services</Link><Link href="/protection-intelligence">Protection and intelligence</Link><Link href="/eios">EIOS platform</Link><Link href="/academy">Obserra Academy</Link></nav>
      <nav aria-label="Enterprise company links"><strong>Company</strong><Link href="/about">Leadership and credentials</Link><Link href="/speaking">Speaking and briefings</Link><Link href="/industries">Industries</Link><Link href="/resources">Resources</Link></nav>
      <nav aria-label="Enterprise assurance links"><strong>Assurance</strong><Link href="/trust">Trust Center</Link><Link href="/trust/privacy-policy">Privacy</Link><Link href="/trust/security-and-responsible-disclosure">Security</Link><Link href="/trust/accessibility-statement">Accessibility</Link></nav>
      <div className="ent-footer__legal"><span>© {new Date().getFullYear()} {LEGAL_ENTITY_NAME}. All rights reserved.</span><span>{LEGAL_ENTITY_NAME} product, Obserra EIOS, and Obserra Academy materials are proprietary.</span></div>
    </footer>
  );
}
