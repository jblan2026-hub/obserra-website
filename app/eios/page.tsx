import type { Metadata } from "next";
import EiosShowcase from "./EiosShowcase";

export const metadata: Metadata = {
  title: "EIOS | Governed Enterprise Intelligence and Action | Obserra",
  description:
    "EIOS connects enterprise context, helps leaders make evidence-backed decisions, governs authorized action, and independently verifies outcomes.",
  alternates: { canonical: "/eios" },
  keywords: ["enterprise intelligence operating system", "governed AI", "decision intelligence", "EIOS"],
  openGraph: {
    title: "EIOS | Governed Enterprise Intelligence and Action",
    description: "Connect context, govern decisions, authorize action, and verify enterprise outcomes with EIOS.",
    url: "https://www.obserrallc.com/eios",
    type: "website",
    images: [
      {
        url: "/eios/eios-overview-marketing.png",
        width: 1584,
        height: 889,
        alt: "Obserra EIOS overview"
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EIOS | Governed Enterprise Intelligence and Action",
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
        name: "Obserra EIOS",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: "https://www.obserrallc.com/eios",
        description: "A governed Enterprise Intelligence Operating System that connects enterprise context, supports evidence-backed decisions, governs authorized action, and verifies outcomes.",
        provider: {
          "@type": "Organization",
          name: "Obserra Executive Protection & Intelligence LLC",
          url: "https://www.obserrallc.com"
        },
      },
      {
        "@type": "WebPage",
        url: "https://www.obserrallc.com/eios",
        name: "EIOS | Governed Enterprise Intelligence and Action | Obserra",
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
            item: "https://www.obserrallc.com/eios"
          }
        ]
      }
    ]
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
