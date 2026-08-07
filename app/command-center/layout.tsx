import { UserButton } from "@clerk/nextjs";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { requireOwnerPage } from "../../lib/owner-auth";
import "./command-center.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Owner Command Center | Obserra",
    template: "%s | Obserra Owner Command Center",
  },
  description: "Private owner operating site for Obserra administration, Academy review, commerce, and production intelligence.",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

export default async function CommandCenterLayout({ children }: { children: React.ReactNode }) {
  await requireOwnerPage("/command-center");

  return (
    <div className="owner-shell">
      <header className="owner-header">
        <Link href="/command-center" className="owner-brand" aria-label="Obserra Owner Command Center home">
          <Image
            src="/brand/obserra-logo.png"
            alt="Obserra Executive Protection and Intelligence LLC"
            width={196}
            height={38}
            priority
          />
          <div>
            <strong>OWNER COMMAND CENTER</strong>
            <span>Private operating site</span>
          </div>
        </Link>
        <nav className="owner-nav" aria-label="Owner Command Center navigation">
          <Link href="/command-center">Mission Control</Link>
          <Link href="/command-center/academy">Academy Review</Link>
          <a href="https://vercel.com/obserra/obserra-website-live" target="_blank" rel="noreferrer">Vercel</a>
          <a href="https://dashboard.stripe.com" target="_blank" rel="noreferrer">Stripe</a>
        </nav>
        <div className="owner-session">
          <span>OWNER IDENTITY VERIFIED</span>
          <UserButton afterSignOutUrl="/owner-access" />
        </div>
      </header>
      {children}
      <div className="owner-watermark" aria-hidden="true">
        OWNER ONLY · OBSERRA PROPRIETARY
      </div>
    </div>
  );
}
