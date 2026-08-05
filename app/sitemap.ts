import type { MetadataRoute } from "next";
import { courses } from "./academy/courseData";
import { marketplaceApps } from "./apps/appsData";

const siteUrl = "https://www.obserrallc.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const corePages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/eios`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/apps`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/services`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/academy`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
  ];
  return [
    ...corePages,
    ...marketplaceApps.map((entry) => ({
      url: `${siteUrl}/apps/${entry.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
    ...courses.map((course) => ({
      url: `${siteUrl}/academy/${course.id}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
