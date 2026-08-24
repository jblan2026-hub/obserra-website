import type { Metadata } from "next";
import EiosShowcase from "./EiosShowcase";
import { EIOS_BRAND_NAME, LEGAL_ENTITY_NAME, PUBLIC_BRAND_NAME } from "@/lib/legal-identity";

export const metadata: Metadata = {
  title: "EIOS | Governed Enterprise Intelligence & Action",
  description:
    "EIOS connects enterprise context, helps leaders make evidence-backed decisions, governs authorized action, and independently verifies outcomes.",
  alternates: { canonical: "/eios" },
  keywords: ["enterprise intelligence operating system", "governed AI", "decision intelligence", "EIOS"],
  openGraph: {
    title: `${EIOS_BRAND_NAME} | Governed Enterprise Intelligence & Action`,
    description: "Connect context, govern decisions, authorize action, and verify enterprise outcomes with EIOS.",
    url: "https://www.obserrallc.com/eios",
    type: "website",
    images: [
      {
        url: "/eios/eios-overview-marketing.png",
        width: 1584,
        height: 889,
        alt: `${EIOS_BRAND_NAME} overview`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${EIOS_BRAND_NAME} | Governed Enterprise Intelligence`,
    description: "Enterprise Intelligence Operating System with accountable, evidence-backed decisions.",
    images: ["/eios/eios-overview-marketing.png"],
  },
};

export default function EiosPage() {
  const productSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: EIOS_BRAND_NAME,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: "https://www.obserrallc.com/eios",
        description: "A governed Enterprise Intelligence Operating System that connects enterprise context, supports evidence-backed decisions, governs authorized action, and verifies outcomes.",
        provider: {
          "@type": "Organization",
          name: LEGAL_ENTITY_NAME,
          alternateName: PUBLIC_BRAND_NAME,
          url: "https://www.obserrallc.com",
        },
      },
      {
        "@type": "WebPage",
        url: "https://www.obserrallc.com/eios",
        name: `${EIOS_BRAND_NAME} | Governed Enterprise Intelligence & Action`,
        description: "EIOS connects enterprise context, helps leaders make evidence-backed decisions, governs authorized action, and independently verifies outcomes.",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.obserrallc.com" },
          {
            "@type": "ListItem",
            position: 2,
            name: "EIOS",
            item: "https://www.obserrallc.com/eios",
          },
        ],
      },
    ],
  };

  return (
    <>
      <EiosShowcase />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
    </>
  );
}
