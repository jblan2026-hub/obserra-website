import type { MetadataRoute } from "next";
import { courses } from "./academy/courseData";
import { marketplaceApps } from "./apps/appsData";
import { eiosCapabilities } from "./eios/capabilities";
import { industrySolutions } from "./industries/industryData";
import { serviceCatalog } from "./services/serviceCatalog";
import { trustPolicies } from "./trust/policies";
import { productIntelligence } from "../lib/product-intelligence";

const siteUrl = "https://www.obserrallc.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const corePages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/about`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/speaking`, lastModified, changeFrequency: "monthly", priority: 0.82 },
    { url: `${siteUrl}/contact`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/services`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/protection-intelligence`, lastModified, changeFrequency: "weekly", priority: 0.88 },
    { url: `${siteUrl}/eios`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/apps`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/catalog`, lastModified, changeFrequency: "weekly", priority: 0.85 },
    { url: `${siteUrl}/academy`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/academy/enterprise`, lastModified, changeFrequency: "weekly", priority: 0.86 },
    { url: `${siteUrl}/portal`, lastModified, changeFrequency: "weekly", priority: 0.84 },
    { url: `${siteUrl}/industries`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/resources`, lastModified, changeFrequency: "monthly", priority: 0.82 },
    { url: `${siteUrl}/trust`, lastModified, changeFrequency: "monthly", priority: 0.8 },
  ];
  return [
    ...corePages,
    ...industrySolutions.map((industry) => ({ url: `${siteUrl}/industries/${industry.slug}`, lastModified, changeFrequency: "monthly" as const, priority: 0.82 })),
    ...serviceCatalog.map((service) => ({ url: `${siteUrl}/services/${service.id}`, lastModified, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...eiosCapabilities.map((entry) => ({ url: `${siteUrl}/eios/${entry.slug}`, lastModified, changeFrequency: "monthly" as const, priority: 0.82 })),
    ...marketplaceApps.map((entry) => ({ url: `${siteUrl}/apps/${entry.slug}`, lastModified, changeFrequency: "monthly" as const, priority: 0.75 })),
    ...productIntelligence.map((entry) => ({ url: `${siteUrl}/products/${entry.slug}`, lastModified: entry.publishedAt ? new Date(entry.publishedAt) : lastModified, changeFrequency: "weekly" as const, priority: 0.82 })),
    ...courses.map((course) => ({ url: `${siteUrl}/academy/${course.id}`, lastModified, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...trustPolicies.map((policy) => ({ url: `${siteUrl}/trust/${policy.slug}`, lastModified, changeFrequency: "monthly" as const, priority: 0.65 })),
  ];
}
