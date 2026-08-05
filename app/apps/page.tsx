import type { Metadata } from "next";
import FortuneMarketplaceClient from "./FortuneMarketplaceClient";
import { marketplaceApps } from "./appsData";
import "./apps.css";
import "./apps-interactions.css";
import "./apps-commercial.css";
import "./apps-responsive.css";
import "./fortune-marketplace.css";
import "./fortune-marketplace-premium.css";

export const metadata: Metadata = {
  title: "Enterprise Application Marketplace | Obserra",
  description:
    "Explore Obserra enterprise applications for executive intelligence, cybersecurity, identity, governance, AI oversight, protective operations, and enterprise execution.",
  alternates: { canonical: "/apps" },
  keywords: [
    "enterprise application marketplace",
    "executive intelligence software",
    "cybersecurity software",
    "AI governance software",
    "enterprise risk applications",
    "Obserra applications",
  ],
  openGraph: {
    title: "Obserra Enterprise Application Marketplace",
    description:
      "Secure enterprise applications for intelligence, cybersecurity, identity, governance, AI oversight, and accountable execution.",
    url: "https://www.obserrallc.com/apps",
    type: "website",
    images: [{ url: "/brand/visuals/obserra-eios-intelligence-hero.png", width: 1672, height: 941, alt: "Obserra Enterprise Application Marketplace" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Obserra Enterprise Application Marketplace",
    description: "Enterprise applications for intelligence, cybersecurity, governance, and execution.",
    images: ["/brand/visuals/obserra-eios-intelligence-hero.png"],
  },
};

export default function AppsPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        name: "Obserra Enterprise Application Marketplace",
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
      <FortuneMarketplaceClient />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </>
  );
}
