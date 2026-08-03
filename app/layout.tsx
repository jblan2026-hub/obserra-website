import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import ObserraGuide from "./ObserraGuide";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.obserrallc.com"),
  title: { default: "Obserra | Enterprise Intelligence, Cybersecurity & Professional Training", template: "%s | Obserra" },
  description: "Obserra delivers enterprise intelligence, cybersecurity strategy, protective intelligence, and paid professional training.",
  applicationName: "Obserra",
  authors: [{ name: "Obserra Executive Protection & Intelligence LLC" }],
  creator: "Obserra Executive Protection & Intelligence LLC",
  publisher: "Obserra Executive Protection & Intelligence LLC",
  category: "Professional services and enterprise technology",
  keywords: ["executive protection", "protective intelligence", "cybersecurity leadership", "enterprise intelligence", "EIOS", "professional training", "AI governance"],
  verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION },
  openGraph: {
    siteName: "Obserra",
    type: "website",
    locale: "en_US",
    images: [{ url: "/brand/visuals/obserra-eios-intelligence-hero.png", width: 1672, height: 941, alt: "Obserra Executive Protection & Intelligence LLC" }],
  },
  twitter: { card: "summary_large_image", images: ["/brand/visuals/obserra-eios-intelligence-hero.png"] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
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
  const page = <html lang="en"><body>{children}<aside className="site-proprietary-notice" aria-label="Proprietary material notice">Property of Obserra · Proprietary material · Not for reproduction, distribution, recording, or use without prior written approval.</aside><ObserraGuide /><Analytics /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} /></body></html>;
  return process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/academy"
      signUpFallbackRedirectUrl="/academy"
    >
      {page}
    </ClerkProvider>
  ) : page;
}
