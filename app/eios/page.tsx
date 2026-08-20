import type { Metadata } from "next";
import EiosShowcase from "./EiosShowcase";
import { LEGAL_ENTITY_NAME } from "@/lib/legal-identity";

const EIOS_PRODUCT_NAME = "Obserra EPI EIOS";
const EIOS_CANONICAL_URL = "https://www.obserrallc.com/eios";
const EIOS_DESCRIPTION =
  "Obserra EPI EIOS is an Enterprise Intelligence Operating System that connects enterprise context, supports evidence-backed executive decisions, governs authorized action, and verifies outcomes.";

export const metadata: Metadata = {
  title: `${EIOS_PRODUCT_NAME} | Enterprise Intelligence Operating System`,
  description: EIOS_DESCRIPTION,
  alternates: { canonical: "/eios" },
  keywords: [
    "enterprise intelligence operating system",
    "executive intelligence",
    "decision intelligence",
    "AI governance",
    "enterprise digital twin",
    "enterprise knowledge graph",
  ],
  openGraph: {
    title: `${EIOS_PRODUCT_NAME} | Enterprise Intelligence Operating System`,
    description: EIOS_DESCRIPTION,
    url: EIOS_CANONICAL_URL,
    type: "website",
    images: [
      {
        url: "/eios/eios-overview-marketing.png",
        width: 1584,
        height: 889,
        alt: `${EIOS_PRODUCT_NAME} platform overview`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${EIOS_PRODUCT_NAME} | Enterprise Intelligence Operating System`,
    description: EIOS_DESCRIPTION,
    images: ["/eios/eios-overview-marketing.png"],
  },
};

export default function EiosPage() {
  const productSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": `${EIOS_CANONICAL_URL}#software-application`,
        name: EIOS_PRODUCT_NAME,
        alternateName: "EIOS",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: EIOS_CANONICAL_URL,
        description: EIOS_DESCRIPTION,
        provider: {
          "@type": "Organization",
          "@id": "https://www.obserrallc.com/#organization",
          name: LEGAL_ENTITY_NAME,
          url: "https://www.obserrallc.com",
        },
      },
      {
        "@type": "WebPage",
        "@id": `${EIOS_CANONICAL_URL}#webpage`,
        url: EIOS_CANONICAL_URL,
        name: `${EIOS_PRODUCT_NAME} | Enterprise Intelligence Operating System`,
        description: EIOS_DESCRIPTION,
        about: { "@id": `${EIOS_CANONICAL_URL}#software-application` },
        isPartOf: { "@id": "https://www.obserrallc.com/#website" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.obserrallc.com" },
          {
            "@type": "ListItem",
            position: 2,
            name: EIOS_PRODUCT_NAME,
            item: EIOS_CANONICAL_URL,
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
