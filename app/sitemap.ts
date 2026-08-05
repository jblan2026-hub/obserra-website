import type { MetadataRoute } from "next";
import { courses } from "./academy/courseData";
import { marketplaceApps } from "./apps/appsData";
import { trustPolicies } from "./trust/policies";

const siteUrl = "https://www.obserrallc.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const corePages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/about`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/contact`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/services`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/protection-intelligence`, lastModified, changeFrequency: "weekly", priority: 0.88 },
    { url: `${siteUrl}/eios`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/apps`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/catalog`, lastModified, changeFrequency: "weekly", priority: 0.85 },
    { url: `${siteUrl}/academy`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/trust`, lastModified, changeFrequency: "monthly", priority: 0.8 },
  ];
  return [
    ...corePages,
    ...marketplaceApps.map((entry) => ({
      url: `${siteUrl}/apps/${entry.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
    ...courses.map((course) => ({
      url: `${siteUrl}/academy/${course.id}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...trustPolicies.map((policy) => ({
      url: `${siteUrl}/trust/${policy.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.65,
    })),
  ];
}
