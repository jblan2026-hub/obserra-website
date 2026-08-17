import type { MetadataRoute } from "next";
import { courses } from "./academy/courseData";
import { marketplaceApps } from "./apps/appsData";
import { eiosCapabilities } from "./eios/capabilities";
import { industrySolutions } from "./industries/industryData";
import { serviceCatalog } from "./services/serviceCatalog";
import { trustPolicies } from "./trust/policies";
import { productIntelligence } from "../lib/product-intelligence";

const siteUrl = "https://www.obserrallc.com";

const canonical = (path: string): MetadataRoute.Sitemap[number] => ({
  url: `${siteUrl}${path}`,
});

export default function sitemap(): MetadataRoute.Sitemap {
  const corePages: MetadataRoute.Sitemap = [
    canonical(""),
    canonical("/about"),
    canonical("/speaking"),
    canonical("/contact"),
    canonical("/services"),
    canonical("/protection-intelligence"),
    canonical("/eios"),
    canonical("/apps"),
    canonical("/catalog"),
    canonical("/academy"),
    canonical("/academy/enterprise"),
    canonical("/florida-security-training"),
    canonical("/industries"),
    canonical("/resources"),
    canonical("/trust"),
  ];

  const productPages = productIntelligence.map((entry) => ({
    url: `${siteUrl}/products/${entry.slug}`,
    ...(entry.publishedAt ? { lastModified: new Date(entry.publishedAt) } : {}),
  }));

  return [
    ...corePages,
    ...industrySolutions.map((industry) => canonical(`/industries/${industry.slug}`)),
    ...serviceCatalog.map((service) => canonical(`/services/${service.id}`)),
    ...eiosCapabilities.map((entry) => canonical(`/eios/${entry.slug}`)),
    ...marketplaceApps.map((entry) => canonical(`/apps/${entry.slug}`)),
    ...productPages,
    ...courses.map((course) => canonical(`/academy/${course.id}`)),
    ...trustPolicies.map((policy) => canonical(`/trust/${policy.slug}`)),
  ];
}
