import "server-only";

import { getStripe } from "./stripe";
import { getFloridaClassDOwnerUatInstructorReadiness } from "./florida-class-d-instructor-provisioning";
import { verifyFloridaClassDMediaProviderConnection } from "./florida-class-d-media";
import { getFloridaClassDOwnerUatReport } from "./florida-class-d-owner-uat";
import { floridaClassDPersistenceRequest } from "./florida-class-d-persistence";

const REQUIRED_STRIPE_IDENTITY_WEBHOOK_EVENTS = [
  "identity.verification_session.processing",
  "identity.verification_session.requires_input",
  "identity.verification_session.verified",
  "identity.verification_session.canceled",
  "identity.verification_session.redacted",
] as const;

type ProviderCheck = {
  provider: "supabase" | "stripe_identity" | "daily" | "fdacs_instructor";
  ready: boolean;
  detail: string;
};

async function liveStripeIdentityWebhookReady(origin: string) {
  const expectedUrl = `${origin}/api/webhook/stripe-identity`;
  const stripe = getStripe();
  let startingAfter: string | undefined;

  do {
    const page = await stripe.webhookEndpoints.list({ limit: 100, starting_after: startingAfter });
    const endpoint = page.data.find((candidate) => {
      const enabledEvents = new Set(candidate.enabled_events);
      return candidate.url === expectedUrl
        && candidate.livemode === true
        && candidate.status === "enabled"
        && (enabledEvents.has("*") || REQUIRED_STRIPE_IDENTITY_WEBHOOK_EVENTS.every((event) => enabledEvents.has(event)));
    });
    if (endpoint) return true;
    if (!page.has_more) return false;
    startingAfter = page.data.at(-1)?.id;
  } while (startingAfter);

  return false;
}

export async function getFloridaClassDProviderReadiness() {
  const checks: ProviderCheck[] = [];
  const ownerUatReport = getFloridaClassDOwnerUatReport();

  try {
    const health = await floridaClassDPersistenceRequest<Record<string, unknown>>(
      "rpc/fdacs_class_d_boundary_health",
      { method: "POST", body: "{}" },
    );
    checks.push({
      provider: "supabase",
      ready: health.providerProjectRef === "ggkxgjhsbgbifiqrhavr"
        && health.productionRuntimeAuthorized === false,
      detail: health.providerProjectRef === "ggkxgjhsbgbifiqrhavr"
        ? "Isolated FDACS boundary responded and production activation remains fail closed."
        : "The responding database is not the controlled isolated FDACS project.",
    });
  } catch {
    checks.push({ provider: "supabase", ready: false, detail: "The isolated FDACS database did not pass its live boundary check." });
  }

  try {
    const liveModeConfigured = process.env.STRIPE_SECRET_KEY?.trim().startsWith("sk_live_") === true;
    if (!liveModeConfigured) throw new Error("live Stripe Identity is not configured");
    const webhookSecretConfigured = /^whsec_[A-Za-z0-9_]+$/.test(
      process.env.STRIPE_IDENTITY_WEBHOOK_SECRET?.trim() || "",
    );
    const origin = ownerUatReport.publicOrigin;
    if (!webhookSecretConfigured || !origin) throw new Error("live Stripe Identity webhook is not configured");
    const stripe = getStripe();
    const sessions = await stripe.identity.verificationSessions.list({ limit: 1 });
    const webhookReady = await liveStripeIdentityWebhookReady(origin);
    checks.push({
      provider: "stripe_identity",
      ready: Array.isArray(sessions.data)
        && sessions.data.every((session) => session.livemode === true)
        && webhookReady,
      detail: webhookReady
        ? "Live Stripe Identity authenticated and an enabled exact-Preview signed webhook subscribes to every handled verification event; no session contents or endpoint values are exposed."
        : "Live Stripe Identity authenticated, but its enabled exact-Preview signed webhook event contract is incomplete.",
    });
  } catch {
    checks.push({ provider: "stripe_identity", ready: false, detail: "Stripe Identity authentication, product access, or exact-Preview signed webhook configuration is unavailable." });
  }

  try {
    await verifyFloridaClassDMediaProviderConnection();
    checks.push({ provider: "daily", ready: true, detail: "Daily authenticated successfully without creating a room or token." });
  } catch {
    checks.push({ provider: "daily", ready: false, detail: "Daily authentication or controlled media configuration is unavailable." });
  }

  try {
    const requiredThrough = ownerUatReport.expiresAt?.slice(0, 10);
    if (!requiredThrough) throw new Error("owner UAT expiration is unavailable");
    const readiness = await getFloridaClassDOwnerUatInstructorReadiness(requiredThrough);
    checks.push({
      provider: "fdacs_instructor",
      ready: readiness.ready === true,
      detail: readiness.ready === true
        ? `Verified-active Class DI evidence covers the owner-UAT window through ${requiredThrough}; license values are suppressed.`
        : `A verified-active Class DI instructor record covering the owner-UAT window through ${requiredThrough} is required.`,
    });
  } catch {
    checks.push({ provider: "fdacs_instructor", ready: false, detail: "Verified-active Class DI coverage could not be established." });
  }

  return {
    generatedAt: new Date().toISOString(),
    ready: checks.every((entry) => entry.ready),
    checks,
    testMode: "live_provider_read_only_preflight" as const,
    productionActivationAuthorized: false,
    fdacsApprovalClaimed: false,
    secretsExposed: false,
  };
}
