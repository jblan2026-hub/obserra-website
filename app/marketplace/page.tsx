import type { Metadata } from "next";
import AppsMarketplaceClient from "../apps/AppsMarketplaceClient";
import { APPLICATIONS_BRAND_NAME, CANONICAL_PUBLIC_ORIGIN } from "../../lib/legal-identity";
import "../apps/apps.css";
import "../apps/apps-interactions.css";
import "../apps/apps-commercial.css";
import "../apps/apps-responsive.css";

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
    description: "Enterprise software for intelligence, cybersecurity, executive protection, AI governance, and risk operations.",
    url: `${CANONICAL_PUBLIC_ORIGIN}/apps`,
    type: "website",
  },
};

export default function MarketplacePage() {
  return <AppsMarketplaceClient />;
}
