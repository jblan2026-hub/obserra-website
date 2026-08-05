import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import ObserraGuide from "./ObserraGuide";
import "./globals.css";
import "./brand-consistency.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.obserrallc.com"),
  title: { default: "Obserra | Enterprise Intelligence, Cybersecurity & Professional Training", template: "%s | Obserra" },
  description: "Obserra delivers enterprise intelligence, cybersecurity strategy, protective intelligence, and paid professional training.",
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "https://www.obserrallc.com",
      "x-default": "https://www.obserrallc.com",
    },
  },
  applicationName: "Obserra",
  authors: [{ name: "Obserra Executive Protection & Intelligence LLC" }],
  creator: "Obserra Executive Protection & Intelligence LLC",
  publisher: "Obserra Executive Protection & Intelligence LLC",
  abstract: "Enterprise commercial cybersecurity, intelligence, protection, and workforce capability delivery.",
  category: "Professional services and enterprise technology",
  formatDetection: { email: false, address: false, telephone: false },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/brand/obserra-logo.png", type: "image/png" }],
    shortcut: ["/brand/obserra-logo.png"],
    apple: [{ url: "/brand/obserra-logo.png" }],
  },
  keywords: ["executive protection", "protective intelligence", "cybersecurity leadership", "enterprise intelligence", "EIOS", "professional training", "AI governance"],
  verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION },
  openGraph: {
    siteName: "Obserra",
    type: "website",
    url: "https://www.obserrallc.com",
    title: "Obserra | Enterprise Intelligence, Cybersecurity & Professional Training",
    description: "Enterprise intelligence, cybersecurity, protective intelligence, secure technology, and paid professional training for high-consequence environments.",
    locale: "en_US",
    images: [{ url: "/brand/visuals/obserra-eios-intelligence-hero.png", width: 1672, height: 941, alt: "Obserra Executive Protection & Intelligence LLC" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Obserra | Enterprise Intelligence, Cybersecurity & Professional Training",
    description: "Enterprise intelligence, cybersecurity, protective intelligence, secure technology, and paid professional training.",
    images: ["/brand/visuals/obserra-eios-intelligence-hero.png"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  },
  other: {
    copyright: "Copyright Obserra Executive Protection & Intelligence LLC. All rights reserved.",
    rights: "Property of Obserra. Not for reproduction, distribution, recording, or use without prior written approval.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.obserrallc.com/#organization",
        name: "Obserra Executive Protection & Intelligence LLC",
        alternateName: "Obserra",
        url: "https://www.obserrallc.com",
        logo: "https://www.obserrallc.com/brand/obserra-logo.png",
        description: "Enterprise intelligence, cybersecurity strategy, protective intelligence, secure technology, and professional training.",
        email: "info@obserrallc.com",
        sameAs: [
          "https://www.linkedin.com/company/obserra-executive-protection-intelligence-llc",
          "https://www.youtube.com/@obserra",
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
        areaServed: ["US", "CA", "UK", "EU"],
        knowsAbout: [
          "Enterprise intelligence",
          "Cybersecurity consulting",
          "Protective intelligence",
          "Executive protection",
          "AI governance",
          "Professional training",
        ],
      },
      {
        "@type": "WebSite",
        "@id": "https://www.obserrallc.com/#website",
        name: "Obserra",
        url: "https://www.obserrallc.com",
        publisher: { "@id": "https://www.obserrallc.com/#organization" },
        inLanguage: "en-US",
        potentialAction: {
          "@type": "SearchAction",
          target: "https://www.obserrallc.com/catalog?query={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
  return <html lang="en"><body>{children}<aside className="site-proprietary-notice" aria-label="Proprietary material notice">Property of Obserra · Proprietary material · Not for reproduction, distribution, recording, or use without prior written approval.</aside><nav className="site-trust-links" aria-label="Trust and legal links"><a href="/trust">Trust Center</a><a href="/trust/privacy-policy">Privacy</a><a href="/trust/terms-of-use">Terms</a><a href="/trust/refund-and-cancellation-policy">Refunds</a><a href="/trust/security-and-responsible-disclosure">Security Disclosure</a><a href="/trust/data-handling-statement">Data Handling</a></nav><ObserraGuide /><Analytics /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} /></body></html>;
}
