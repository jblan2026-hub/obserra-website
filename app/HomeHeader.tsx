"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LEGAL_ENTITY_NAME } from "../lib/legal-identity";
import "./site-header.css";

const navigation = [
  { label: "Services", href: "/services" },
  { label: "Industries", href: "/industries" },
  { label: "Academy LMS", href: "/academy" },
  { label: "Florida Training", href: "/florida-security-training" },
  { label: "Resources", href: "/resources" },
  { label: "Trust", href: "/trust" },
  { label: "About", href: "/about" },
];

function ObserraMark() {
  return (
    <span className="obs-site-mark" aria-hidden="true">
      <svg viewBox="0 0 64 64" role="img">
        <path d="M6 32c7.6-11.2 16.3-16.8 26-16.8S50.4 20.8 58 32c-7.6 11.2-16.3 16.8-26 16.8S13.6 43.2 6 32Z" />
        <circle cx="32" cy="32" r="10.5" />
        <path d="M32 24.2a4.2 4.2 0 0 1 2.6 7.5v6.2h-5.2v-6.2a4.2 4.2 0 0 1 2.6-7.5Z" />
      </svg>
    </span>
  );
}

export default function HomeHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  function closeNavigation() {
    setOpen(false);
  }

  return (
    <header className="obs-site-header">
      <div className="obs-site-header__brand-row">
        <Link className="obs-site-header__brand" href="/" aria-label={`${LEGAL_ENTITY_NAME} home`} onClick={closeNavigation}>
          <ObserraMark />
          <Image src="/brand/obserra-logo.png" width={286} height={55} priority alt={LEGAL_ENTITY_NAME} />
        </Link>
        <button ref={toggleRef} className="obs-site-header__toggle" type="button" aria-label={open ? "Close navigation menu" : "Open navigation menu"} aria-expanded={open} aria-controls="primary-navigation" onClick={() => setOpen((current) => !current)}>
          <span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" />
        </button>
      </div>
      <nav id="primary-navigation" className={`obs-site-header__nav${open ? " is-open" : ""}`} aria-label="Primary navigation">
        {navigation.map((item) => (
          <Link key={item.href} href={item.href} onClick={closeNavigation} aria-current={pathname === item.href || pathname.startsWith(`${item.href}/`) ? "page" : undefined}>{item.label}</Link>
        ))}
        <Link href="/contact" onClick={closeNavigation}>Contact</Link>
        <Link className="obs-site-header__cta" href="/contact?interest=enterprise-consultation" onClick={closeNavigation}>Get in touch</Link>
      </nav>
    </header>
  );
}
