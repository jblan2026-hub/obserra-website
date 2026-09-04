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
import "./final-six-pages-polish.css";
import "./global-clarity.css";
import "./institutional-redesign.css";

export default function PremiumSiteScope({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const marketplaceRoute = pathname === "/ai-marketplace" || pathname.startsWith("/ai-marketplace/");
  const publicMarketingRoutes = new Set([
    "/",
    "/about",
    "/speaking",
    "/services",
    "/protection-intelligence",
    "/industries",
    "/resources",
    "/contact",
    "/trust",
    "/eios",
    "/apps",
    "/marketplace",
    "/academy",
    "/academy/enterprise",
    "/certifications",
    "/catalog",
    "/florida-security-training",
  ]);
  const publicDetailRoute = /^\/(services|industries|trust|eios|apps)\/[^/]+$/.test(pathname)
    || (/^\/academy\/[^/]+$/.test(pathname) && pathname !== "/academy/success");
  const publicMarketingRoute = publicMarketingRoutes.has(pathname) || publicDetailRoute;
  const scopeClassName = marketplaceRoute
    ? "marketplace-design-scope"
    : `premium-site-scope${publicMarketingRoute ? " public-marketing-scope" : ""}`;

  return (
    <div className={scopeClassName}>
      {children}
    </div>
  );
}
