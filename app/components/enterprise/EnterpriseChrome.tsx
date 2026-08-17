"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { LEGAL_ENTITY_NAME } from "../../../lib/legal-identity";
import "./enterprise-chrome.css";
import "./enterprise-sales-navigation.css";
import "./legal-identity-lockup.css";

const primaryNavigation = [
  ["EIOS", "/eios", "sales"],
  ["Services", "/services"],
  ["Applications", "/apps", "sales"],
  ["Academy", "/academy", "sales"],
  ["Industries", "/industries"],
  ["Trust", "/trust"],
  ["About", "/about"],
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
        <span>Enterprise intelligence · Cybersecurity · AI governance · Protective intelligence</span>
        <div>
          <Link href="/florida-security-training">Florida training</Link>
          <Link href="/resources">Resources</Link>
          <Link href="/speaking">Speaking</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </div>
      <div className="ent-header__main">
        <Link className="ent-header__brand" href="/" aria-label={`${LEGAL_ENTITY_NAME} home`} onClick={close}>
          <Image src="/brand/obserra-logo.png" width={286} height={55} priority alt={LEGAL_ENTITY_NAME} />
          <span className="ent-header__identity">
            <span className="ent-header__legal-name">{LEGAL_ENTITY_NAME}</span>
            <small>{section}</small>
          </span>
        </Link>
        <button
          ref={toggleRef}
          className="ent-header__toggle"
          type="button"
          aria-label={open ? "Close enterprise navigation" : "Open enterprise navigation"}
          aria-expanded={open}
          aria-controls="enterprise-navigation"
          onClick={() => setOpen((value) => !value)}
        >
          <span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" />
        </button>
        <nav id="enterprise-navigation" className={`ent-header__nav${open ? " is-open" : ""}`} aria-label="Enterprise navigation">
          {primaryNavigation.map(([label, href, prominence]) => (
            <Link
              key={href}
              href={href}
              className={prominence === "sales" ? "ent-header__sales-link" : undefined}
              onClick={close}
              aria-current={pathname === href || pathname.startsWith(`${href}/`) ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
          <Link href="/contact?interest=enterprise-consultation" className="ent-header__cta" onClick={close}>
            Talk to Obserra
          </Link>
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
          <div><span>01</span><strong>Executive-led</strong><small>Senior judgment for material enterprise decisions</small></div>
          <div><span>02</span><strong>Evidence-driven</strong><small>Traceable analysis, controls, recommendations, and outcomes</small></div>
          <div><span>03</span><strong>Secure by design</strong><small>Identity, access, data, and release boundaries built into delivery</small></div>
          <div><span>04</span><strong>Built to execute</strong><small>Clear ownership, implementation, measurement, and verification</small></div>
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
        <p>
          Obserra helps executives connect risk, intelligence, governance, secure technology, and execution so the enterprise can move with greater clarity and accountability.
        </p>
        <Link href="/contact?interest=enterprise-consultation">Start an executive conversation <span aria-hidden="true">→</span></Link>
      </div>
      <nav aria-label="Obserra products and services">
        <strong>Obserra</strong>
        <Link href="/eios">EIOS platform</Link>
        <Link href="/services">Enterprise services</Link>
        <Link href="/apps">Applications</Link>
        <Link href="/academy">Academy</Link>
        <Link href="/protection-intelligence">Protection and intelligence</Link>
      </nav>
      <nav aria-label="Company links">
        <strong>Company</strong>
        <Link href="/industries">Industries</Link>
        <Link href="/about">Leadership and credentials</Link>
        <Link href="/resources">Resources</Link>
        <Link href="/speaking">Speaking and briefings</Link>
        <Link href="/contact">Contact</Link>
      </nav>
      <nav aria-label="Enterprise assurance links">
        <strong>Trust</strong>
        <Link href="/trust">Trust Center</Link>
        <Link href="/trust/privacy-policy">Privacy</Link>
        <Link href="/trust/security-and-responsible-disclosure">Security</Link>
        <Link href="/trust/accessibility-statement">Accessibility</Link>
      </nav>
      <div className="ent-footer__legal">
        <span>© {new Date().getFullYear()} {LEGAL_ENTITY_NAME}. All rights reserved.</span>
        <span>{LEGAL_ENTITY_NAME} product, Obserra EIOS, and Obserra Academy materials are proprietary.</span>
      </div>
    </footer>
  );
}
