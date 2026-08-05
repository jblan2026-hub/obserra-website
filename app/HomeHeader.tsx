"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navigation = [
  { label: "Services", href: "/services" },
  { label: "Applications", href: "/apps" },
  { label: "Industries", href: "/industries" },
  { label: "Academy", href: "/academy" },
  { label: "Resources", href: "/resources" },
  { label: "Trust", href: "/trust" },
  { label: "About", href: "/about" },
];

export default function HomeHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Obserra home">
        <Image src="/brand/obserra-logo.png" width={286} height={55} priority alt="Obserra Executive Protection and Intelligence LLC" />
      </Link>
      <button className="menu-toggle" type="button" aria-label={open ? "Close navigation menu" : "Open navigation menu"} aria-expanded={open} aria-controls="primary-navigation" onClick={() => setOpen((current) => !current)}>
        <span /><span /><span />
      </button>
      <nav id="primary-navigation" className={open ? "is-open" : ""} aria-label="Primary navigation">
        {navigation.map((item) => (
          <Link key={item.href} href={item.href} aria-current={pathname === item.href || pathname.startsWith(`${item.href}/`) ? "page" : undefined}>{item.label}</Link>
        ))}
        <Link className="nav-cta" href="/contact">Contact Obserra</Link>
      </nav>
    </header>
  );
}
