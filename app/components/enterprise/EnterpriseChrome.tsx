"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { LEGAL_ENTITY_NAME } from "../../../lib/legal-identity";
import type { LocalizedMessageKey } from "../../../lib/regional-localization";
import { LanguageSelector, useObserraLocale } from "../../RegionalLocalization";
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
  ["Speaking", "/speaking"],
] as const;

const primaryNavigationKeys: Record<(typeof primaryNavigation)[number][0], LocalizedMessageKey> = {
  EIOS: "nav.eios",
  Services: "nav.services",
  Applications: "nav.applications",
  Academy: "nav.academy",
  Industries: "nav.industries",
  Trust: "nav.trust",
  About: "nav.about",
  Speaking: "nav.speaking",
};

export function EnterpriseHeader({ section = "Enterprise" }: { section?: string }) {
  const pathname = usePathname();
  const { t } = useObserraLocale();
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
    <header className="ent-header" data-obserra-localized>
      <div className="ent-header__utility">
        <span>{t("nav.utility")}</span>
        <div>
          <Link href="/florida-security-training">{t("nav.florida")}</Link>
          <Link href="/resources">{t("nav.resources")}</Link>
          <Link href="/speaking">{t("nav.speaking")}</Link>
          <Link href="/contact">{t("nav.contact")}</Link>
          <LanguageSelector className="ent-header__locale-desktop" />
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
          <LanguageSelector className="ent-header__locale-mobile" />
          {primaryNavigation.map(([label, href, prominence]) => (
            <Link
              key={href}
              href={href}
              className={prominence === "sales" ? "ent-header__sales-link" : undefined}
              onClick={close}
              aria-current={pathname === href || pathname.startsWith(`${href}/`) ? "page" : undefined}
            >
              {t(primaryNavigationKeys[label])}
            </Link>
          ))}
          <Link href="/contact?interest=enterprise-consultation" className="ent-header__cta" onClick={close}>
            {t("nav.talk")}
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
          <div><span>02</span><strong>Evidence-backed</strong><small>Traceable analysis, controls, recommendations, and outcomes</small></div>
          <div><span>03</span><strong>Secure by design</strong><small>Identity, access, data, and release boundaries built into delivery</small></div>
          <div><span>04</span><strong>Built to execute</strong><small>Clear ownership, implementation, measurement, and verification</small></div>
        </>
      )}
    </section>
  );
}

export function EnterpriseFooter() {
  const { t } = useObserraLocale();
  return (
    <footer className="ent-footer" data-obserra-localized>
      <div className="ent-footer__lead">
        <Image src="/brand/obserra-logo.png" width={286} height={55} alt={LEGAL_ENTITY_NAME} />
        <strong className="ent-footer__legal-name">{LEGAL_ENTITY_NAME}</strong>
        <p>
          {LEGAL_ENTITY_NAME} helps executives connect risk, intelligence, governance, secure technology, and execution so the enterprise can move with greater clarity and accountability.
        </p>
        <Link href="/contact?interest=enterprise-consultation">{t("footer.start")} <span aria-hidden="true">→</span></Link>
      </div>
      <nav aria-label="Obserra products and services">
        <strong>{t("footer.obserra")}</strong>
        <Link href="/eios">{t("footer.eios")}</Link>
        <Link href="/services">{t("footer.services")}</Link>
        <Link href="/apps">{t("footer.apps")}</Link><Link href="/academy">{t("footer.academy")}</Link>
        <Link href="/protection-intelligence">{t("footer.protection")}</Link>
      </nav>
      <nav aria-label="Company links">
        <strong>{t("footer.company")}</strong>
        <Link href="/industries">{t("footer.industries")}</Link>
        <Link href="/about">{t("footer.leadership")}</Link>
        <Link href="/resources">{t("nav.resources")}</Link>
        <Link href="/speaking">{t("footer.speaking")}</Link>
        <Link href="/contact">{t("nav.contact")}</Link>
      </nav>
      <nav aria-label="Enterprise assurance links">
        <strong>{t("footer.trust")}</strong>
        <Link href="/trust">Trust Center</Link>
        <Link href="/trust/privacy-policy">{t("footer.privacy")}</Link>
        <Link href="/trust/security-and-responsible-disclosure">{t("footer.security")}</Link>
        <Link href="/trust/accessibility-statement">{t("footer.accessibility")}</Link>
      </nav>
      <div className="ent-footer__legal">
        <span>© {new Date().getFullYear()} {LEGAL_ENTITY_NAME}. All rights reserved.</span>
        <span>{LEGAL_ENTITY_NAME} product, Obserra EIOS, and Obserra Academy materials are proprietary.</span>
      </div>
    </footer>
  );
}
