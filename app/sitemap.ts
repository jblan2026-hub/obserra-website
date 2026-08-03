import type { MetadataRoute } from "next";

const siteUrl = "https://www.obserrallc.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/eios`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/academy`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
  ];
}
