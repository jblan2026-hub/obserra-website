import type { MetadataRoute } from "next";
import { courses } from "./academy/courseData";

const siteUrl = "https://www.obserrallc.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const corePages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/eios`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/academy`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
  ];
  return [...corePages, ...courses.map((course) => ({ url: `${siteUrl}/academy/${course.id}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 }))];
}
