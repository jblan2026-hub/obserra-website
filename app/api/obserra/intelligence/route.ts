import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/academy",
  "/apps",
  "/contact",
  "/eios",
  "/services",
  "/trust",
] as const;

const PROTECTED_ROUTES = [
  "/admin",
  "/portal",
  "/academy/success",
  "/academy/certificate/[courseId]",
] as const;

function configured(name: string): boolean {
  return Boolean(process.env[name]?.trim());
}

export async function GET() {
  const identityReady = configured("CLERK_SECRET_KEY") && configured("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");
  const stripeReady = configured("STRIPE_SECRET_KEY");
  const webhookReady = configured("STRIPE_WEBHOOK_SECRET");
  const commerceReady = identityReady && stripeReady && webhookReady;

  const recommendations: Array<{
    severity: "low" | "medium" | "high" | "critical";
    title: string;
    recommendation: string;
  }> = [];

  if (!identityReady) {
    recommendations.push({
      severity: "critical",
      title: "Production identity is not fully configured",
      recommendation: "Configure Clerk production credentials and verify protected learner, portal, and administrative routes before promotion.",
    });
  }
  if (!stripeReady) {
    recommendations.push({
      severity: "critical",
      title: "Stripe payment processing is unavailable",
      recommendation: "Configure the Stripe secret key and validate checkout session creation in preview before production promotion.",
    });
  }
  if (!webhookReady) {
    recommendations.push({
      severity: "critical",
      title: "Stripe webhook verification is unavailable",
      recommendation: "Configure the Stripe webhook secret. Checkout remains fail closed until verified fulfillment is available.",
    });
  }

  const payload = {
    schemaVersion: "1.0",
    sourceId: "website",
    generatedAt: new Date().toISOString(),
    status: commerceReady ? "operational" : "degraded",
    memory: `Website intelligence observed ${PUBLIC_ROUTES.length} public routes, ${PROTECTED_ROUTES.length} protected route patterns, and commerce readiness ${commerceReady ? "operational" : "degraded"}.`,
    services: {
      website: { status: "reporting", publicRouteCount: PUBLIC_ROUTES.length, protectedRouteCount: PROTECTED_ROUTES.length },
      academy: { status: "reporting", catalogAuthority: "academy-production-studio" },
      commerce: { status: commerceReady ? "operational" : "degraded", failClosedWithoutWebhook: true },
    },
    routes: {
      public: PUBLIC_ROUTES,
      protected: PROTECTED_ROUTES,
      health: "/api/health",
      intelligence: "/api/obserra/intelligence",
      checkout: "/api/academy/checkout",
      webhook: "/api/webhook/stripe",
    },
    identity: {
      provider: "clerk",
      configured: identityReady,
      status: identityReady ? "operational" : "degraded",
    },
    commerce: {
      provider: "stripe",
      paymentsConfigured: stripeReady,
      webhookVerificationConfigured: webhookReady,
      checkoutPolicy: "fail-closed-without-verified-webhook",
      status: commerceReady ? "operational" : "degraded",
    },
    deployment: {
      provider: "vercel",
      environment: process.env.VERCEL_ENV ?? "local",
      project: process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL ?? null,
      commitSha: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
      branch: process.env.VERCEL_GIT_COMMIT_REF ?? null,
    },
    recommendations,
  };

  return NextResponse.json(payload, {
    status: 200,
    headers: {
      "cache-control": "private, no-store, max-age=0",
      "x-content-type-options": "nosniff",
      "x-obserra-intelligence-source": "website",
    },
  });
}
