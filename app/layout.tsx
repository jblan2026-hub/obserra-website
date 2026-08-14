import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import { prepareClerkRuntime } from "../lib/clerk-runtime-config";
import { LEGAL_ENTITY_NAME } from "../lib/legal-identity";
import ObserraGuide from "./ObserraGuide";
import CredlyProfileLink from "./CredlyProfileLink";
import "./globals.css";
import "./design-system.css";
import "./brand-consistency.css";
import "./credential-issuer-marks.css";
import "./credly-profile-link.css";
import "./global-symbols.css";
import "./auth.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.obserrallc.com"),
  title: { default: `${LEGAL_ENTITY_NAME} | Executive Intelligence, Cybersecurity and Protection`, template: `%s | ${LEGAL_ENTITY_NAME}` },
  description: `${LEGAL_ENTITY_NAME} provides executive cybersecurity advisory, protective intelligence, enterprise applications, and professional training for high-consequence organizations.`,
  alternates: { canonical: "/", languages: { "en-US": "https://www.obserrallc.com", "x-default": "https://www.obserrallc.com" } },
  applicationName: LEGAL_ENTITY_NAME,
  authors: [{ name: LEGAL_ENTITY_NAME }],
  creator: LEGAL_ENTITY_NAME,
  publisher: LEGAL_ENTITY_NAME,
  category: "Enterprise intelligence, cybersecurity, executive protection, and professional training",
  formatDetection: { email: false, address: false, telephone: false },
  manifest: "/manifest.webmanifest",
  icons: { icon: [{ url: "/brand/obserra-mark.svg", type: "image/svg+xml" }], shortcut: ["/brand/obserra-mark.svg"], apple: [{ url: "/brand/obserra-logo.png" }] },
  keywords: ["cybersecurity consulting", "executive protection", "protective intelligence", "enterprise intelligence", "AI governance", "cybersecurity training", "Obserra EIOS"],
  verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION },
  openGraph: { siteName: LEGAL_ENTITY_NAME, type: "website", url: "https://www.obserrallc.com", title: `${LEGAL_ENTITY_NAME} | Executive Intelligence, Cybersecurity and Protection`, description: "Executive cybersecurity advisory, protective intelligence, secure enterprise applications, and professional training.", locale: "en_US", images: [{ url: "/brand/visuals/obserra-eios-intelligence-hero.png", width: 1672, height: 941, alt: `${LEGAL_ENTITY_NAME} enterprise intelligence and cybersecurity` }] },
  twitter: { card: "summary_large_image", title: `${LEGAL_ENTITY_NAME} | Executive Intelligence, Cybersecurity and Protection`, description: "Executive cybersecurity advisory, protective intelligence, enterprise applications, and professional training.", images: ["/brand/visuals/obserra-eios-intelligence-hero.png"] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": "https://www.obserrallc.com/#organization", name: LEGAL_ENTITY_NAME, alternateName: "Obserra", url: "https://www.obserrallc.com", logo: "https://www.obserrallc.com/brand/obserra-logo.png", description: "Executive cybersecurity advisory, protective intelligence, secure enterprise applications, and professional training.", email: "info@obserrallc.com", contactPoint: [{ "@type": "ContactPoint", contactType: "sales", email: "info@obserrallc.com", availableLanguage: ["en"], areaServed: "US" }] },
      { "@type": "WebSite", "@id": "https://www.obserrallc.com/#website", name: LEGAL_ENTITY_NAME, alternateName: "Obserra", url: "https://www.obserrallc.com", publisher: { "@id": "https://www.obserrallc.com/#organization" }, inLanguage: "en-US" },
    ],
  };

  const application = (
    <html lang="en">
      <body>
        {children}
        <CredlyProfileLink />
        <ObserraGuide />
        <Analytics />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      </body>
    </html>
  );

  const clerkRuntime = prepareClerkRuntime();
  if (!clerkRuntime.ready || !clerkRuntime.publishableKey) return application;

  return (
    <ClerkProvider
      publishableKey={clerkRuntime.publishableKey}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/portal"
      signUpFallbackRedirectUrl="/portal"
    >
      {application}
    </ClerkProvider>
  );
}
