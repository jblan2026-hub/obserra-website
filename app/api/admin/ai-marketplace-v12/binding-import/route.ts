import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getInternalOwnerAuthority } from "../../../../../lib/auth/authority-repository";
import { applicationsCommerceLivemode, getApplicationsStripe } from "../../../../../lib/applications-stripe";
import { recordMarketplaceV12BindingImportReview } from "../../../../../lib/marketplace-v12-binding-import";
import { marketplaceV12CommerceSubjects, marketplaceV12Product, marketplaceV12Summary } from "../../../../../lib/marketplace-v12-catalog";
import { marketplaceV12Offer, type MarketplaceV12PurchaseOption } from "../../../../../lib/marketplace-v12-bindings";

export const runtime = "nodejs";
export const maxDuration = 60;
const SOURCE = "obserra-ai-marketplace-v12";
const CONFIRMATION = "IMPORT_SINGLE_V12_PRODUCT";
const OPTIONS = new Set<MarketplaceV12PurchaseOption>(["recurring:month", "recurring:year", "one_time:once", "team_license:once", "activation:once"]);

function sameOrigin(request: Request) { try { return new URL(request.headers.get("origin") ?? "invalid").origin === new URL(request.url).origin; } catch { return false; } }
function publicFailure(status: 403 | 409 | 503, code: string) { return NextResponse.json({ error: code }, { status, headers: { "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" } }); }

async function owner() {
  const authority = await getInternalOwnerAuthority();
  if (authority.status === "unavailable") return null;
  if (authority.status !== "ready" || !authority.identity || !authority.internalIdentityAuthorized || !authority.emailVerified || !authority.protectedReadiness.ready || !authority.identity.roles.includes("owner") || authority.identity.assuranceLevel !== "aal2") return null;
  return { principalId: authority.identity.principalId, correlationId: authority.correlationId };
}

function bindingKey(offer: { kind: string; cadence?: string; amount_minor: number }) { return `${offer.kind}:${offer.cadence ?? "once"}:${offer.amount_minor}`; }
function productMatches(product: Stripe.Product, productId: string, revision: string, artifactSha256: string) { return product.active && !product.deleted && product.metadata.obserraMarketplaceProduct === productId && product.metadata.catalogRevision === revision && product.metadata.artifactSha256 === artifactSha256 && product.metadata.commerceSource === SOURCE; }
function priceMatches(price: Stripe.Price, stripeProductId: string, expected: { kind: string; cadence?: string; amount_minor: number }, expectedKey: string, live: boolean) {
  const productId = typeof price.product === "string" ? price.product : price.product.id;
  const recurring = expected.kind === "recurring";
  return price.active && price.livemode === live && productId === stripeProductId && price.currency === "usd" && price.unit_amount === expected.amount_minor
    && (recurring ? price.type === "recurring" && price.recurring?.interval === expected.cadence && price.recurring?.interval_count === 1 : price.type === "one_time")
    && price.metadata.bindingKey === expectedKey && price.metadata.commerceSource === SOURCE;
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return publicFailure(403, "same_origin_required");
  let body: { productId?: unknown; purchaseOption?: unknown; confirmation?: unknown };
  try { body = await request.json() as typeof body; } catch { return publicFailure(409, "invalid_request"); }
  if (body.confirmation !== CONFIRMATION || typeof body.productId !== "string" || typeof body.purchaseOption !== "string" || !OPTIONS.has(body.purchaseOption as MarketplaceV12PurchaseOption)) return publicFailure(409, "single_item_confirmation_required");
  let approved;
  try { approved = await owner(); } catch { return publicFailure(503, "owner_authority_unavailable"); }
  if (!approved) return publicFailure(403, "owner_aal2_required");
  const product = marketplaceV12Product(body.productId), option = body.purchaseOption as MarketplaceV12PurchaseOption, offer = product && marketplaceV12Offer(product, option), subject = product && marketplaceV12CommerceSubjects().find((candidate) => candidate.productId === product.product_id);
  if (!product || !offer || !subject || product.product_type === "collection" || product.product_type === "bundle") return publicFailure(409, "catalog_subject_or_offer_invalid");
  const live = applicationsCommerceLivemode();
  if (live === null) return publicFailure(503, "stripe_runtime_unavailable");
  const revision = marketplaceV12Summary().revision, key = bindingKey(offer), stripe = getApplicationsStripe();
  try {
    const matches = await stripe.products.search({ query: `metadata['obserraMarketplaceProduct']:'${product.product_id}'`, limit: 10 });
    const existing = matches.data.filter((candidate) => productMatches(candidate, product.product_id, revision, subject.artifactSha256));
    if (existing.length > 1) return publicFailure(409, "ambiguous_stripe_product");
    const stripeProduct = existing[0] ?? await stripe.products.create({ name: product.name, description: product.description.slice(0, 500), metadata: { obserraMarketplaceProduct: product.product_id, catalogRevision: revision, artifactSha256: subject.artifactSha256, commerceSource: SOURCE } }, { idempotencyKey: `obserra-v12-product-${revision.slice(0, 16)}-${product.product_id}` });
    const prices = await stripe.prices.list({ product: stripeProduct.id, active: true, limit: 100 });
    const resolved = prices.data.filter((candidate) => priceMatches(candidate, stripeProduct.id, offer, key, live));
    if (resolved.length > 1) return publicFailure(409, "ambiguous_stripe_price");
    const stripePrice = resolved[0] ?? await stripe.prices.create({ product: stripeProduct.id, currency: "usd", unit_amount: offer.amount_minor, ...(offer.kind === "recurring" ? { recurring: { interval: offer.cadence as "month" | "year", interval_count: 1 } } : {}), metadata: { bindingKey: key, commerceSource: SOURCE } }, { idempotencyKey: `obserra-v12-price-${revision.slice(0, 16)}-${product.product_id}-${key}` });
    if (!priceMatches(stripePrice, stripeProduct.id, offer, key, live)) return publicFailure(409, "stripe_price_governance_failed");
    await recordMarketplaceV12BindingImportReview({ ...approved, productId: product.product_id, purchaseOption: option, catalogRevision: revision, artifactSha256: subject.artifactSha256, stripeProductId: stripeProduct.id, stripePriceId: stripePrice.id, stripeLivemode: stripePrice.livemode });
    return NextResponse.json({ reviewed: true, productId: product.product_id, purchaseOption: option, stripeProductId: stripeProduct.id, stripePriceId: stripePrice.id, checkoutActivated: false, releaseEvidenceUpdated: false }, { headers: { "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" } });
  } catch (error) {
    console.error("Marketplace single-item binding import unavailable", { name: error instanceof Error ? error.name : "unknown", productId: product.product_id, purchaseOption: option, correlationId: approved.correlationId });
    return publicFailure(503, "single_item_import_unavailable");
  }
}
