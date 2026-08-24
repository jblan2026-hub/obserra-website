import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { EIOS_BRAND_NAME, LEGAL_ENTITY_NAME, PUBLIC_BRAND_NAME } from "../lib/legal-identity";
import ObserraGuide from "./ObserraGuide";
import CredlyProfileLink from "./CredlyProfileLink";
import PremiumSiteScope from "./components/premium/PremiumSiteScope";
import "./globals.css";
import "./design-system.css";
import "./brand-consistency.css";
import "./credential-issuer-marks.css";
import "./credly-profile-link.css";
import "./global-symbols.css";
import "./commerce-semantics.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.obserrallc.com"),
  title: {
    default: `${PUBLIC_BRAND_NAME} | Executive Intelligence & Cybersecurity`,
    template: `%s | ${PUBLIC_BRAND_NAME}`,
  },
  description: `${PUBLIC_BRAND_NAME} provides executive advisory, cybersecurity, protective intelligence, secure technology, and professional learning for regulated and high-consequence organizations.`,
  alternates: { canonical: "/", languages: { "en-US": "https://www.obserrallc.com", "x-default": "https://www.obserrallc.com" } },
  applicationName: PUBLIC_BRAND_NAME,
  authors: [{ name: LEGAL_ENTITY_NAME }],
  creator: LEGAL_ENTITY_NAME,
  publisher: LEGAL_ENTITY_NAME,
  category: "Executive advisory, cybersecurity, protective intelligence, secure technology, and professional learning",
  formatDetection: { email: false, address: false, telephone: false },
  manifest: "/manifest.webmanifest",
  icons: { icon: [{ url: "/brand/obserra-mark.svg", type: "image/svg+xml" }], shortcut: ["/brand/obserra-mark.svg"], apple: [{ url: "/brand/obserra-logo.png" }] },
  keywords: ["cybersecurity consulting", "executive protection", "protective intelligence", "enterprise intelligence", "AI governance", "enterprise learning", "university cybersecurity training", EIOS_BRAND_NAME],
  verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION },
  openGraph: {
    siteName: PUBLIC_BRAND_NAME,
    type: "website",
    url: "https://www.obserrallc.com",
    title: `${PUBLIC_BRAND_NAME} | Executive Intelligence & Cybersecurity`,
    description: "Executive advisory, cybersecurity, protective intelligence, secure technology, and professional learning.",
    locale: "en_US",
    images: [{ url: "/brand/visuals/obserra-eios-intelligence-hero.png", width: 1672, height: 941, alt: `${PUBLIC_BRAND_NAME} enterprise intelligence and cybersecurity` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${PUBLIC_BRAND_NAME} | Executive Intelligence & Cybersecurity`,
    description: "Executive advisory, cybersecurity, protective intelligence, secure technology, and professional learning.",
    images: ["/brand/visuals/obserra-eios-intelligence-hero.png"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": "https://www.obserrallc.com/#organization", name: LEGAL_ENTITY_NAME, alternateName: PUBLIC_BRAND_NAME, url: "https://www.obserrallc.com", logo: "https://www.obserrallc.com/brand/obserra-logo.png", description: "Executive advisory, cybersecurity, protective intelligence, secure technology, and professional learning.", email: "info@obserrallc.com", contactPoint: [{ "@type": "ContactPoint", contactType: "sales", email: "info@obserrallc.com", availableLanguage: ["en"], areaServed: "US" }] },
      { "@type": "WebSite", "@id": "https://www.obserrallc.com/#website", name: PUBLIC_BRAND_NAME, url: "https://www.obserrallc.com", publisher: { "@id": "https://www.obserrallc.com/#organization" }, inLanguage: "en-US" },
    ],
  };

  return (
    <html lang="en">
      <body>
        <a className="obs-skip-link" href="#main-content">Skip to main content</a>
        <div id="main-content" tabIndex={-1}>
          <PremiumSiteScope>{children}</PremiumSiteScope>
        </div>
        <CredlyProfileLink />
        <ObserraGuide />
        <Analytics />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      </body>
    </html>
  );
}
