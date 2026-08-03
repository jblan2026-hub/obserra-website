import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import ObserraGuide from "./ObserraGuide";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.obserrallc.com"),
  title: { default: "Obserra | Enterprise Intelligence, Cybersecurity & Professional Training", template: "%s | Obserra" },
  description: "Obserra delivers enterprise intelligence, cybersecurity strategy, protective intelligence, and paid professional training.",
  verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION },
  openGraph: { siteName: "Obserra", type: "website", locale: "en_US" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const page = <html lang="en"><body>{children}<ObserraGuide /><Analytics /></body></html>;
  return process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? (
    <ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-up">
      {page}
    </ClerkProvider>
  ) : page;
}
