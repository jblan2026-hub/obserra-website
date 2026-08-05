import type { Metadata } from "next";
import AppsMarketplaceClient from "./AppsMarketplaceClient";
import { marketplaceApps } from "./appsData";
import "./apps.css";
import "./apps-interactions.css";
import "./apps-commercial.css";

export const metadata: Metadata = {
  title: "Applications | Obserra Enterprise Marketplace",
  description:
    "Explore Obserra enterprise applications across cybersecurity, executive protection, intelligence, AI governance, and operational command.",
  alternates: { canonical: "/apps" },
  keywords: ["enterprise applications", "cybersecurity software", "AI governance software", "obserra apps"],
  openGraph: {
    title: "Obserra Applications Marketplace",
    description:
      "Enterprise software for intelligence, cybersecurity, executive protection, AI governance, and risk operations.",
    url: "https://www.obserrallc.com/apps",
    type: "website",
    images: [{ url: "/brand/visuals/obserra-eios-intelligence-hero.png", width: 1672, height: 941, alt: "Obserra Applications Marketplace" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Obserra Applications Marketplace",
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
            url: `https://www.obserrallc.com/apps/${entry.slug}`,
          },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.obserrallc.com" },
          { "@type": "ListItem", position: 2, name: "Applications", item: "https://www.obserrallc.com/apps" },
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
