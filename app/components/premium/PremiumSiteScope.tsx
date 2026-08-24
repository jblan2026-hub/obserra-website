"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import "./premium-site-scope.css";
import "./premium-eios.css";
import "./premium-about.css";
import "./corporate-density.css";
import "./executive-future.css";
import "./executive-layout-repair.css";
import "./final-six-pages.css";

export default function PremiumSiteScope({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const marketplaceRoute = pathname === "/ai-marketplace" || pathname.startsWith("/ai-marketplace/");

  return (
    <div className={marketplaceRoute ? "marketplace-design-scope" : "premium-site-scope"}>
      {children}
    </div>
  );
}
