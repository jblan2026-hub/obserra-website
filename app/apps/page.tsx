import type { Metadata } from "next";
import AppsMarketplaceClient from "./AppsMarketplaceClient";
import { marketplaceApps } from "./appsData";
import "./apps.css";

export const metadata: Metadata = {
  title: "Applications | Obserra Enterprise Marketplace",
  description:
    "Explore Obserra enterprise applications across cybersecurity, executive protection, intelligence, AI governance, and operational command.",
  alternates: { canonical: "/apps" },
  openGraph: {
    title: "Obserra Applications Marketplace",
    description:
      "Enterprise software for intelligence, cybersecurity, executive protection, AI governance, and risk operations.",
    url: "https://www.obserrallc.com/apps"
  }
};

export default function AppsPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Obserra Enterprise Applications Marketplace",
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
        url: `https://www.obserrallc.com/apps/${entry.slug}`
      }
    }))
  };

  return (
    <>
      <AppsMarketplaceClient />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </>
  );
}
