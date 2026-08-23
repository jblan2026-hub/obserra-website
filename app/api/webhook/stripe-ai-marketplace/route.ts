import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { aiMarketplaceAmountCents, findAiMarketplaceProduct, validAiMarketplaceProduct } from "../../../../lib/ai-marketplace-catalog";
import { boundAiMarketplacePrice, requiredBillingIntervals, type AiMarketplaceBillingInterval } from "../../../../lib/ai-marketplace-payment-bindings";
import { recordAiMarketplacePayment, recordMarketplaceV12Payment } from "../../../../lib/ai-marketplace-commerce";
import { applicationsCommerceLivemode, applicationsStripeWebhookSecret, getApplicationsStripe } from "../../../../lib/applications-stripe";
import { boundMarketplaceV12Price, marketplaceV12BindingCoverage, marketplaceV12Offer, type MarketplaceV12PurchaseOption } from "../../../../lib/marketplace-v12-bindings";
import { marketplaceV12CommerceSubjects, marketplaceV12Product, marketplaceV12Summary } from "../../../../lib/marketplace-v12-catalog";
import { ensureApplicationsRuntimeSecrets } from "../../../../lib/production-runtime-secrets";
import { readStripeWebhookBody } from "../../../../lib/stripe-webhook-body";

const LEGACY_SOURCE = "obserra-ai-marketplace-v1";
const V12_SOURCE = "obserra-ai-marketplace-v12";
const id = (value: string | { id: string } | null | undefined) => typeof value === "string" ? value : value?.id;

function validV12Price(price: Stripe.Price, productId: string, option: MarketplaceV12PurchaseOption, amount: number, live: boolean, revision: string, artifactSha256: string, bindingKey: string) {
  const product = typeof price.product === "string" ? null : price.product;
  return price.active && price.livemode === live && price.currency === "usd" && price.unit_amount === amount
    && (option === "recurring:month" ? price.type === "recurring" && price.recurring?.interval === "month" && price.recurring.interval_count === 1 : option === "recurring:year" ? price.type === "recurring" && price.recurring?.interval === "year" && price.recurring.interval_count === 1 : price.type === "one_time")
    && !!product && !product.deleted && product.active && product.metadata.obserraMarketplaceProduct === productId && product.metadata.catalogRevision === revision && product.metadata.artifactSha256 === artifactSha256 && product.metadata.bindingKey === bindingKey && product.metadata.commerceSource === V12_SOURCE;
}

async function fulfillV12(event: Stripe.Event, session: Stripe.Checkout.Session, raw: string, live: boolean) {
  const metadata = session.metadata ?? {}, product = marketplaceV12Product(metadata.productId ?? ""), option = metadata.purchaseOption as MarketplaceV12PurchaseOption, revision = marketplaceV12Summary().revision, customer = id(session.customer);
  const coverage = marketplaceV12BindingCoverage(), isSubject = product && marketplaceV12CommerceSubjects().some((subject) => subject.productId === product.product_id), offer = product && marketplaceV12Offer(product, option), priceId = product && boundMarketplaceV12Price(product, option);
  if (session.payment_status !== "paid" || !product || !isSubject || !offer || !priceId || !customer || metadata.commerceSource !== V12_SOURCE || metadata.catalogRevision !== revision || !coverage.structurallyComplete || !coverage.stripeVerified) throw new Error("v12 binding evidence unavailable");
  const lines = await getApplicationsStripe().checkout.sessions.listLineItems(session.id, { limit: 2, expand: ["data.price.product"] }), price = lines.data[0]?.price;
  const subject = marketplaceV12CommerceSubjects().find((candidate) => candidate.productId === product.product_id);
  const bindingKey = `${offer.kind}:${offer.cadence ?? "once"}:${offer.amount_minor}`;
  if (!subject || lines.has_more || lines.data.length !== 1 || !price || price.livemode !== live || price.id !== priceId || !validV12Price(price, product.product_id, option, offer.amount_minor, live, revision, subject.artifactSha256, bindingKey)) throw new Error("v12 price governance failed");
  await recordMarketplaceV12Payment({ eventId: event.id, eventType: event.type, payload: createHash("sha256").update(raw).digest("hex"), live: event.livemode, session: session.id, customer, subject: metadata.clerkUserId ?? "", tenant: metadata.tenantId ?? "", product: product.product_id, option, price: price.id, revision, artifactSha256: subject.artifactSha256 });
}

export async function POST(request: Request) { try { await ensureApplicationsRuntimeSecrets(); const secret = applicationsStripeWebhookSecret(), signature = request.headers.get("stripe-signature"); if (!secret || !signature) return NextResponse.json({ error: "Webhook not configured" }, { status: 503 }); const raw = await readStripeWebhookBody(request), event = getApplicationsStripe().webhooks.constructEvent(raw, signature, secret), live = applicationsCommerceLivemode(); if (live === null || event.livemode !== live) return NextResponse.json({ error: "Webhook mode mismatch" }, { status: 409 }); if (event.type !== "checkout.session.completed" && event.type !== "checkout.session.async_payment_succeeded") return NextResponse.json({ received: true, ignored: true }); const session = event.data.object as Stripe.Checkout.Session; if (session.metadata?.commerceSource === V12_SOURCE) { await fulfillV12(event, session, raw, live); return NextResponse.json({ received: true }); } const metadata = session.metadata ?? {}, product = findAiMarketplaceProduct(metadata.productId ?? ""), interval = metadata.billingInterval as AiMarketplaceBillingInterval, customer = id(session.customer); if (session.payment_status !== "paid" || metadata.commerceSource !== LEGACY_SOURCE || !validAiMarketplaceProduct(product) || !requiredBillingIntervals(product).includes(interval) || !customer) throw new Error("invalid legacy metadata"); const lines = await getApplicationsStripe().checkout.sessions.listLineItems(session.id, { limit: 2, expand: ["data.price.product"] }), price = lines.data[0]?.price, stripeProduct = typeof price?.product === "string" ? null : price?.product; if (lines.has_more || lines.data.length !== 1 || !price || price.livemode !== live || price.id !== boundAiMarketplacePrice(product, interval) || price.unit_amount !== aiMarketplaceAmountCents(product, interval) || !stripeProduct || stripeProduct.deleted || !stripeProduct.active || stripeProduct.metadata.obserraMarketplaceProduct !== product.product_id || stripeProduct.metadata.billingInterval !== interval || stripeProduct.metadata.commerceSource !== LEGACY_SOURCE) throw new Error("legacy price governance failed"); await recordAiMarketplacePayment({ eventId: event.id, eventType: event.type, payload: createHash("sha256").update(raw).digest("hex"), live: event.livemode, session: session.id, customer, subject: metadata.clerkUserId ?? "", tenant: metadata.tenantId ?? "", product: product.product_id, interval, price: price.id }); return NextResponse.json({ received: true }); } catch { return NextResponse.json({ error: "Webhook payload rejected" }, { status: 400 }); } }
