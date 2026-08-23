import "server-only";

import rawProducts from "../app/ai-marketplace/marketplace-products.json";

export type AiMarketplaceProduct = Readonly<{
  product_id: string;
  product_name: string;
  family: string;
  version: string;
  mission: string;
  deliverable: string;
  individual_zip: string;
  billing_model: "subscription" | "one-time" | "hybrid";
  monthly_usd: string;
  annual_usd: string;
  one_time_usd: string;
}>;

const PRODUCT_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const VERSION = /^\d+\.\d+\.\d+$/;
const MONEY = /^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/;

const catalog = rawProducts as AiMarketplaceProduct[];
const byId = new Map(catalog.map((product) => [product.product_id, product]));

function validPrice(value: string) {
  return value === "" || MONEY.test(value);
}

export function aiMarketplaceCatalog() {
  return catalog;
}

export function findAiMarketplaceProduct(productId: string) {
  return byId.get(productId) ?? null;
}

export function validAiMarketplaceProduct(product: AiMarketplaceProduct | null): product is AiMarketplaceProduct {
  if (!product || !PRODUCT_ID.test(product.product_id) || !VERSION.test(product.version)) return false;
  if (!validPrice(product.monthly_usd) || !validPrice(product.annual_usd) || !validPrice(product.one_time_usd)) return false;
  return product.billing_model === "subscription"
    ? product.monthly_usd !== "" && product.annual_usd !== "" && product.one_time_usd === ""
    : product.billing_model === "one-time"
      ? product.one_time_usd !== "" && product.monthly_usd === "" && product.annual_usd === ""
      : product.billing_model === "hybrid" && product.monthly_usd !== "" && product.one_time_usd !== "";
}

export function aiMarketplaceAmountCents(product: AiMarketplaceProduct, interval: "monthly" | "annual" | "one-time") {
  const value = interval === "monthly" ? product.monthly_usd : interval === "annual" ? product.annual_usd : product.one_time_usd;
  if (!MONEY.test(value)) return null;
  const amount = Math.round(Number(value) * 100);
  return Number.isSafeInteger(amount) && amount > 0 ? amount : null;
}
