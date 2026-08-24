import type { MetadataRoute } from "next";
import { marketplaceV12SitemapPage, marketplaceV12Summary } from "../../lib/marketplace-v12-catalog";

const siteUrl = "https://www.obserrallc.com";
const pageSize = 500;
const marketplaceRevisionDate = new Date("2026-08-24T19:55:00.000Z");

export async function generateSitemaps() {
  return Array.from({ length: Math.ceil(marketplaceV12Summary().total_cards / pageSize) }, (_, id) => ({ id }));
}

export default async function sitemap({ id }: { id: Promise<number> }): Promise<MetadataRoute.Sitemap> {
  return marketplaceV12SitemapPage(await id, pageSize).entries.map(({ slug, product_type }) => ({
    url: product_type === "collection" || product_type === "bundle"
      ? `${siteUrl}/ai-marketplace/collections/${encodeURIComponent(slug)}`
      : `${siteUrl}/ai-marketplace/${encodeURIComponent(slug)}`,
    lastModified: marketplaceRevisionDate,
    changeFrequency: "weekly",
    priority: product_type === "collection" || product_type === "bundle" ? 0.76 : 0.72,
  }));
}
