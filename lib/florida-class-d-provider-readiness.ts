import "server-only";

import { getStripe } from "./stripe";
import { getFloridaClassDOwnerUatInstructorReadiness } from "./florida-class-d-instructor-provisioning";
import { verifyFloridaClassDMediaProviderConnection } from "./florida-class-d-media";
import { getFloridaClassDOwnerUatReport } from "./florida-class-d-owner-uat";
import { floridaClassDPersistenceRequest } from "./florida-class-d-persistence";

type ProviderCheck = {
  provider: "supabase" | "stripe_identity" | "daily" | "fdacs_instructor";
  ready: boolean;
  detail: string;
};

export async function getFloridaClassDProviderReadiness() {
  const checks: ProviderCheck[] = [];

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
    const sessions = await getStripe().identity.verificationSessions.list({ limit: 1 });
    checks.push({
      provider: "stripe_identity",
      ready: Array.isArray(sessions.data) && sessions.data.every((session) => session.livemode === true),
      detail: "Live Stripe Identity authenticated successfully; no verification-session contents are exposed.",
    });
  } catch {
    checks.push({ provider: "stripe_identity", ready: false, detail: "Stripe Identity authentication or product access is unavailable." });
  }

  try {
    await verifyFloridaClassDMediaProviderConnection();
    checks.push({ provider: "daily", ready: true, detail: "Daily authenticated successfully without creating a room or token." });
  } catch {
    checks.push({ provider: "daily", ready: false, detail: "Daily authentication or controlled media configuration is unavailable." });
  }

  try {
    const requiredThrough = getFloridaClassDOwnerUatReport().expiresAt?.slice(0, 10);
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
