import type { Metadata } from "next";
import AppsMarketplaceClient from "./AppsMarketplaceClient";
import "./apps.css";
import "./apps-interactions.css";
import "./apps-commercial.css";
import "./apps-responsive.css";

export const metadata: Metadata = {
  title: "Obserra EPI Applications",
  description: "Private Obserra EPI Applications workspace.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function AppsPage() {
  return <AppsMarketplaceClient />;
}
