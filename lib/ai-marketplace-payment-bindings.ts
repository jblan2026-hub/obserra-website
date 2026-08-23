import "server-only";

import { aiMarketplaceCatalog, type AiMarketplaceProduct } from "./ai-marketplace-catalog";

export type AiMarketplaceBillingInterval = "monthly" | "annual" | "one-time";
export type AiMarketplacePriceCatalog = Record<string, Partial<Record<AiMarketplaceBillingInterval, string>>>;

const PRICE_ID = /^price_[A-Za-z0-9]+$/;

export function aiMarketplacePriceCatalog() {
  const raw = process.env.OBSERRA_AI_MARKETPLACE_PRICE_CATALOG_JSON?.trim() ?? "";
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as unknown;
    if (!value || Array.isArray(value) || typeof value !== "object") return null;
    return value as AiMarketplacePriceCatalog;
  } catch {
    return null;
  }
}

export function requiredBillingIntervals(product: AiMarketplaceProduct): AiMarketplaceBillingInterval[] {
  if (product.billing_model === "subscription") return ["monthly", "annual"];
  if (product.billing_model === "hybrid") return ["monthly", "one-time"];
  return ["one-time"];
}

export function boundAiMarketplacePrice(product: AiMarketplaceProduct, interval: AiMarketplaceBillingInterval) {
  if (!requiredBillingIntervals(product).includes(interval)) return null;
  const catalog = aiMarketplacePriceCatalog();
  const priceId = catalog?.[product.product_id]?.[interval] ?? "";
  return PRICE_ID.test(priceId) ? priceId : null;
}

export function aiMarketplaceBindingCoverage() {
  const products = aiMarketplaceCatalog();
  const boundProducts = products.filter((product) => requiredBillingIntervals(product).every((interval) => boundAiMarketplacePrice(product, interval)));
  return { totalProducts: products.length, boundProducts: boundProducts.length, complete: boundProducts.length === products.length };
}
