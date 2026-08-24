import type { Metadata } from "next";
import { APPLICATIONS_BRAND_NAME, CANONICAL_PUBLIC_ORIGIN } from "../../lib/legal-identity";
import AppsMarketplaceClient from "./AppsMarketplaceClient";
import { marketplaceApps } from "./appsData";
import "./apps.css";
import "./apps-interactions.css";
import "./apps-commercial.css";
import "./apps-responsive.css";
import "./applications-final.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: `${APPLICATIONS_BRAND_NAME} | Enterprise Marketplace`,
  description:
    `Explore ${APPLICATIONS_BRAND_NAME} across cybersecurity, executive protection, intelligence, AI governance, and operational command.`,
  alternates: { canonical: "/apps" },
  keywords: ["enterprise applications", "cybersecurity software", "AI governance software", APPLICATIONS_BRAND_NAME],
  openGraph: {
    title: `${APPLICATIONS_BRAND_NAME} Marketplace`,
    description:
      "Enterprise software for intelligence, cybersecurity, executive protection, AI governance, and risk operations.",
    url: `${CANONICAL_PUBLIC_ORIGIN}/apps`,
    type: "website",
    images: [{ url: "/brand/visuals/obserra-eios-intelligence-hero.png", width: 1672, height: 941, alt: `${APPLICATIONS_BRAND_NAME} Marketplace` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${APPLICATIONS_BRAND_NAME} Marketplace`,
    description: "Enterprise applications for cyber, intelligence, governance, and execution.",
    images: ["/brand/visuals/obserra-eios-intelligence-hero.png"],
  },
};

export default function AppsPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        name: `${APPLICATIONS_BRAND_NAME} Enterprise Marketplace`,
        numberOfItems: marketplaceApps.length,
        itemListElement: marketplaceApps.map((entry, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "SoftwareApplication",
            name: entry.name,
            applicationCategory: entry.category,
            description: entry.value,
            operatingSystem: "Web",
            url: `${CANONICAL_PUBLIC_ORIGIN}/apps/${entry.slug}`,
          },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: CANONICAL_PUBLIC_ORIGIN },
          { "@type": "ListItem", position: 2, name: APPLICATIONS_BRAND_NAME, item: `${CANONICAL_PUBLIC_ORIGIN}/apps` },
        ],
      },
    ],
  };

  return (
    <>
      <AppsMarketplaceClient />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </>
  );
}
