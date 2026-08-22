import "server-only";

import Stripe from "stripe";

const STRIPE_KEY_PATTERN = /^(?:sk|rk)_(live|test)_[A-Za-z0-9_]+$/;

export class ApplicationsStripeConfigurationError extends Error {
  constructor(message = "Applications Stripe commerce is not configured.") {
    super(message);
    this.name = "ApplicationsStripeConfigurationError";
  }
}

function configuredKey() {
  return process.env.APPLICATIONS_STRIPE_SECRET_KEY?.trim() ?? "";
}

function productionRuntime() {
  return process.env.VERCEL_ENV === "production" || Boolean(process.env.WEBSITE_HOSTNAME);
}

export function applicationsCommerceLivemode() {
  const match = configuredKey().match(STRIPE_KEY_PATTERN);
  if (!match) return null;
  const live = match[1] === "live";
  if (productionRuntime() && !live) return null;
  if (!productionRuntime() && live && process.env.OBSERRA_ALLOW_LIVE_STRIPE_OUTSIDE_PRODUCTION !== "true") return null;
  return live;
}

export function applicationsStripeWebhookSecret() {
  const secret = process.env.APPLICATIONS_STRIPE_WEBHOOK_SECRET?.trim() ?? "";
  return /^whsec_[A-Za-z0-9_]{16,}$/.test(secret) ? secret : null;
}

export function applicationsCommerceConfigured() {
  return applicationsCommerceLivemode() !== null && Boolean(applicationsStripeWebhookSecret());
}

export function applicationsStripePriceId(appSlug: string, planId: string, interval: string) {
  const raw = process.env.OBSERRA_APPLICATIONS_PRICE_CATALOG_JSON?.trim() ?? "";
  if (!raw) return null;
  try {
    const catalog = JSON.parse(raw) as unknown;
    if (!catalog || Array.isArray(catalog) || typeof catalog !== "object") return null;
    const key = `${appSlug}.${planId}.${interval}`;
    const value = (catalog as Record<string, unknown>)[key];
    return typeof value === "string" && /^price_[A-Za-z0-9]+$/.test(value) ? value : null;
  } catch {
    return null;
  }
}

export function getApplicationsStripe() {
  if (applicationsCommerceLivemode() === null) throw new ApplicationsStripeConfigurationError();
  return new Stripe(configuredKey(), { apiVersion: "2026-07-29.dahlia", typescript: true });
}
