import type { Metadata } from "next";
import AppsMarketplaceClient from "./AppsMarketplaceClient";
import { marketplaceApps } from "./appsData";
import "./apps.css";
import "./apps-interactions.css";
import "./apps-commercial.css";
import "./apps-responsive.css";

export const metadata: Metadata = {
  title: "Applications | Obserra Product Release Catalog",
  description:
    "Review product-specific Demo, Live, deployment, and release evidence for Obserra applications.",
  alternates: { canonical: "/apps" },
  keywords: ["enterprise applications", "cybersecurity software", "AI governance software", "obserra apps"],
  openGraph: {
    title: "Obserra Product Release Catalog",
    description:
      "Reviewed Obserra products with explicit Demo, Live, deployment, and release-evidence states.",
    url: "https://www.obserrallc.com/apps",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Obserra Product Release Catalog",
    description: "Reviewed Obserra products with explicit release evidence and verification states.",
  },
};

export default function AppsPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        name: "Obserra Product Release Catalog",
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
