import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import ObserraGuide from "./ObserraGuide";
import CredlyProfileLink from "./CredlyProfileLink";
import "./globals.css";
import "./brand-consistency.css";
import "./credential-issuer-marks.css";
import "./credly-profile-link.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.obserrallc.com"),
  title: {
    default: "Obserra | Executive Intelligence, Cybersecurity and Protection",
    template: "%s | Obserra",
  },
  description: "Obserra provides executive cybersecurity advisory, protective intelligence, enterprise applications, and professional training for high-consequence organizations.",
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
  category: "Enterprise intelligence, cybersecurity, executive protection, and professional training",
  formatDetection: { email: false, address: false, telephone: false },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/brand/obserra-mark.svg", type: "image/svg+xml" }],
    shortcut: ["/brand/obserra-mark.svg"],
    apple: [{ url: "/brand/obserra-logo.png" }],
  },
  keywords: ["cybersecurity consulting", "executive protection", "protective intelligence", "enterprise intelligence", "AI governance", "cybersecurity training", "Obserra EIOS"],
  verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION },
  openGraph: {
    siteName: "Obserra",
    type: "website",
    url: "https://www.obserrallc.com",
    title: "Obserra | Executive Intelligence, Cybersecurity and Protection",
    description: "Executive cybersecurity advisory, protective intelligence, secure enterprise applications, and professional training.",
    locale: "en_US",
    images: [{ url: "/brand/visuals/obserra-eios-intelligence-hero.png", width: 1672, height: 941, alt: "Obserra enterprise intelligence and cybersecurity" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Obserra | Executive Intelligence, Cybersecurity and Protection",
    description: "Executive cybersecurity advisory, protective intelligence, enterprise applications, and professional training.",
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
        "@id": "https://www.obserrallc.com/#organization",
        name: "Obserra Executive Protection & Intelligence LLC",
        alternateName: "Obserra",
        url: "https://www.obserrallc.com",
        logo: "https://www.obserrallc.com/brand/obserra-logo.png",
        description: "Executive cybersecurity advisory, protective intelligence, secure enterprise applications, and professional training.",
        email: "info@obserrallc.com",
        contactPoint: [{ "@type": "ContactPoint", contactType: "sales", email: "info@obserrallc.com", availableLanguage: ["en"], areaServed: "US" }],
      },
      {
        "@type": "WebSite",
        "@id": "https://www.obserrallc.com/#website",
        name: "Obserra",
        url: "https://www.obserrallc.com",
        publisher: { "@id": "https://www.obserrallc.com/#organization" },
        inLanguage: "en-US",
      },
    ],
  };

  return (
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
}
