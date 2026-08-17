import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import { prepareClerkRuntime } from "../lib/clerk-runtime-config";
import { LEGAL_ENTITY_NAME } from "../lib/legal-identity";
import ObserraGuide from "./ObserraGuide";
import CredlyProfileLink from "./CredlyProfileLink";
import { RegionalLocalizationProvider, RegionalTranslationNotice } from "./RegionalLocalization";
import "./globals.css";
import "./design-system.css";
import "./brand-consistency.css";
import "./credential-issuer-marks.css";
import "./credly-profile-link.css";
import "./global-symbols.css";
import "./auth.css";
import "./premium-site.css";
import "./premium-routes.css";
import "./regional-localization.css";

const SITE_URL = "https://www.obserrallc.com";
const GLOBAL_DESCRIPTION =
  `${LEGAL_ENTITY_NAME} helps executives govern cyber risk, AI, intelligence, resilience, and secure technology through advisory services, EIOS software, and professional training.`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${LEGAL_ENTITY_NAME} | Enterprise Intelligence, Cybersecurity and AI Governance`,
    template: `%s | ${LEGAL_ENTITY_NAME}`,
  },
  description: GLOBAL_DESCRIPTION,
  alternates: {
    canonical: "/",
    languages: {
      "en-US": SITE_URL,
      "x-default": SITE_URL,
    },
  },
  applicationName: LEGAL_ENTITY_NAME,
  authors: [{ name: LEGAL_ENTITY_NAME, url: SITE_URL }],
  creator: LEGAL_ENTITY_NAME,
  publisher: LEGAL_ENTITY_NAME,
  category: "Enterprise intelligence, cybersecurity, AI governance, protective intelligence, and professional learning",
  formatDetection: { email: false, address: false, telephone: false },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/brand/obserra-mark.svg", type: "image/svg+xml" }],
    shortcut: ["/brand/obserra-mark.svg"],
    apple: [{ url: "/brand/obserra-logo.png" }],
  },
  keywords: [
    "enterprise intelligence",
    "cybersecurity consulting",
    "AI governance consulting",
    "executive cyber risk",
    "protective intelligence",
    "executive protection",
    "enterprise risk intelligence",
    "fractional CISO",
    "CMMC readiness",
    "NIST cybersecurity",
    "cybersecurity training",
    "Obserra EIOS",
  ],
  verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION },
  openGraph: {
    siteName: LEGAL_ENTITY_NAME,
    type: "website",
    url: SITE_URL,
    title: `${LEGAL_ENTITY_NAME} | Enterprise Intelligence, Cybersecurity and AI Governance`,
    description: GLOBAL_DESCRIPTION,
    locale: "en_US",
    images: [
      {
        url: "/brand/visuals/obserra-eios-intelligence-hero.png",
        width: 1672,
        height: 941,
        alt: `${LEGAL_ENTITY_NAME} enterprise intelligence operating environment`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${LEGAL_ENTITY_NAME} | Enterprise Intelligence, Cybersecurity and AI Governance`,
    description: GLOBAL_DESCRIPTION,
    images: ["/brand/visuals/obserra-eios-intelligence-hero.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: LEGAL_ENTITY_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/brand/obserra-logo.png`,
        description: GLOBAL_DESCRIPTION,
        email: "info@obserrallc.com",
        knowsAbout: [
          "Enterprise cybersecurity",
          "AI governance",
          "Executive cyber risk",
          "Protective intelligence",
          "Executive protection",
          "Enterprise resilience",
          "Secure technology",
          "Professional cybersecurity training",
        ],
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "sales",
            email: "info@obserrallc.com",
            availableLanguage: ["en"],
            areaServed: "US",
          },
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: LEGAL_ENTITY_NAME,
        url: SITE_URL,
        description: GLOBAL_DESCRIPTION,
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: "en-US",
      },
    ],
  };

  const application = (
    <html lang="en-US" dir="ltr" suppressHydrationWarning>
      <body>
        <RegionalLocalizationProvider>
          <a className="obs-skip-link" href="#main-content">Skip to main content</a>
          <RegionalTranslationNotice />
          <div id="main-content" tabIndex={-1}>{children}</div>
          <CredlyProfileLink />
          <ObserraGuide />
          <Analytics />
        </RegionalLocalizationProvider>
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
