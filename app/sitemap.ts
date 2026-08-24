import type { MetadataRoute } from "next";
import { courses } from "./academy/courseData";
import { eiosCapabilities } from "./eios/capabilities";
import { industrySolutions } from "./industries/industryData";
import { serviceCatalog } from "./services/serviceCatalog";
import { trustPolicies } from "./trust/policies";
import { productIntelligence } from "../lib/product-intelligence";

const siteUrl = "https://www.obserrallc.com";
const siteRevisionDate = new Date("2026-08-24T00:00:00.000Z");

export default function sitemap(): MetadataRoute.Sitemap {
  const corePages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: siteRevisionDate, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/about`, lastModified: siteRevisionDate, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/speaking`, lastModified: siteRevisionDate, changeFrequency: "monthly", priority: 0.82 },
    { url: `${siteUrl}/contact`, lastModified: siteRevisionDate, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/services`, lastModified: siteRevisionDate, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/protection-intelligence`, lastModified: siteRevisionDate, changeFrequency: "weekly", priority: 0.88 },
    { url: `${siteUrl}/eios`, lastModified: siteRevisionDate, changeFrequency: "weekly", priority: 0.92 },
    { url: `${siteUrl}/apps`, lastModified: siteRevisionDate, changeFrequency: "weekly", priority: 0.92 },
    { url: `${siteUrl}/ai-marketplace`, lastModified: siteRevisionDate, changeFrequency: "daily", priority: 0.94 },
    { url: `${siteUrl}/catalog`, lastModified: siteRevisionDate, changeFrequency: "weekly", priority: 0.85 },
    { url: `${siteUrl}/academy`, lastModified: siteRevisionDate, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/academy/enterprise`, lastModified: siteRevisionDate, changeFrequency: "weekly", priority: 0.86 },
    { url: `${siteUrl}/florida-security-training`, lastModified: siteRevisionDate, changeFrequency: "monthly", priority: 0.78 },
    { url: `${siteUrl}/industries`, lastModified: siteRevisionDate, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/resources`, lastModified: siteRevisionDate, changeFrequency: "monthly", priority: 0.82 },
    { url: `${siteUrl}/trust`, lastModified: siteRevisionDate, changeFrequency: "monthly", priority: 0.8 },
  ];
  return [
    ...corePages,
    ...industrySolutions.map((industry) => ({ url: `${siteUrl}/industries/${industry.slug}`, lastModified: siteRevisionDate, changeFrequency: "monthly" as const, priority: 0.82 })),
    ...serviceCatalog.map((service) => ({ url: `${siteUrl}/services/${service.id}`, lastModified: siteRevisionDate, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...eiosCapabilities.map((entry) => ({ url: `${siteUrl}/eios/${entry.slug}`, lastModified: siteRevisionDate, changeFrequency: "monthly" as const, priority: 0.82 })),
    ...productIntelligence.map((entry) => ({ url: `${siteUrl}/products/${entry.slug}`, lastModified: entry.publishedAt ? new Date(entry.publishedAt) : siteRevisionDate, changeFrequency: "weekly" as const, priority: 0.82 })),
    ...courses.map((course) => ({ url: `${siteUrl}/academy/${course.id}`, lastModified: siteRevisionDate, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...trustPolicies.map((policy) => ({ url: `${siteUrl}/trust/${policy.slug}`, lastModified: siteRevisionDate, changeFrequency: "monthly" as const, priority: 0.65 })),
  ];
}
