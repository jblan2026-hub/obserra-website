import type { Metadata } from "next";
import EiosShowcase from "./EiosShowcase";

export const metadata: Metadata = {
  title: "EIOS | Governed Enterprise Intelligence and Action | Obserra",
  description: "EIOS connects enterprise context, helps leaders make evidence-backed decisions, governs authorized action, and independently verifies outcomes.",
  alternates: { canonical: "/eios" },
};

export default function EiosPage() {
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Obserra EIOS",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: "https://www.obserrallc.com/eios",
    description: "A governed enterprise intelligence and execution layer that connects enterprise context, supports evidence-backed decisions, governs authorized action, and verifies outcomes.",
    provider: { "@type": "Organization", name: "Obserra Executive Protection & Intelligence LLC", url: "https://www.obserrallc.com" },
  };
  return <><EiosShowcase /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} /></>;
}
