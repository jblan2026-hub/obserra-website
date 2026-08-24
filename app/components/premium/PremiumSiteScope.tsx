"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import "./premium-site-scope.css";
import "./premium-eios.css";

export default function PremiumSiteScope({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const marketplaceRoute = pathname === "/ai-marketplace" || pathname.startsWith("/ai-marketplace/");

  return (
    <div className={marketplaceRoute ? "marketplace-design-scope" : "premium-site-scope"}>
      {children}
    </div>
  );
}
