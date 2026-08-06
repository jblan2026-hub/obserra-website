import { NextResponse } from "next/server";
import { productIntelligence } from "../../../lib/product-intelligence";
import { platformDependencySummary, resolveDeploymentTarget, sharedPlatformCapabilities } from "../../../lib/platform-topology";
import { saasControlPlaneHealth } from "../../../lib/saas-control-plane";
import { courses } from "../../academy/courseData";

export const dynamic = "force-dynamic";

type Check = { name: string; status: "pass" | "warn" | "fail"; detail: string };

function releaseIdentity() {
  return {
    commitSha: process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GITHUB_SHA ?? null,
    commitRef: process.env.VERCEL_GIT_COMMIT_REF ?? process.env.GITHUB_REF_NAME ?? null,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown",
    deploymentUrl: process.env.VERCEL_URL ?? null,
    productionUrl: process.env.VERCEL_PROJECT_PRODUCTION_URL ?? null,
    region: process.env.VERCEL_REGION ?? null,
  };
}

export async function GET(request: Request) {
  const startedAt = Date.now();
  const checks: Check[] = [];
  const target = resolveDeploymentTarget();
  const topology = platformDependencySummary();
  const saas = saasControlPlaneHealth();

  checks.push({
    name: "catalog",
    status: productIntelligence.length > 0 ? "pass" : "warn",
    detail: `${productIntelligence.length} product records available through the shared catalog service`,
  });
  checks.push({
    name: "academy",
    status: courses.length > 0 ? "pass" : "fail",
    detail: `${courses.length} course records available through the shared Academy service`,
  });
  checks.push({
    name: "shared-platform",
    status: sharedPlatformCapabilities.length >= 10 ? "pass" : "warn",
    detail: `${sharedPlatformCapabilities.length} reusable platform capabilities enabled for ${target.projectName}`,
  });
  checks.push({
    name: "saas-control-plane",
    status: saas.configured ? "pass" : "warn",
    detail: saas.configured
      ? `${saas.subscriptionCount} tenant subscription records loaded with fail-closed entitlement enforcement`
      : "Fail-closed entitlement service available; tenant subscription source is not configured",
  });
  checks.push({
    name: "ai-gateway",
    status: process.env.AI_GATEWAY_API_KEY && process.env.OBSERRIAN_AI_MODEL ? "pass" : "warn",
    detail: process.env.AI_GATEWAY_API_KEY && process.env.OBSERRIAN_AI_MODEL ? "Configured" : "Fallback mode available",
  });
  checks.push({
    name: "telemetry",
    status: process.env.OBSERRA_GITHUB_PUBLISH_TOKEN ? "pass" : "warn",
    detail: process.env.OBSERRA_GITHUB_PUBLISH_TOKEN ? "Append-only telemetry configured" : "Customer responses remain available; analytics recording disabled",
  });
  checks.push({
    name: "owner-auth",
    status: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY ? "pass" : "warn",
    detail: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY ? "Configured" : "Owner controls unavailable until configured",
  });

  const failed = checks.filter((check) => check.status === "fail").length;
  const warnings = checks.filter((check) => check.status === "warn").length;
  const status = failed > 0 ? "unhealthy" : warnings > 0 ? "degraded" : "healthy";
  const payload = {
    service: target.projectName,
    role: target.role,
    status,
    ready: failed === 0,
    target,
    platform: topology,
    topology,
    capabilities: sharedPlatformCapabilities,
    saas: {
      configured: saas.configured,
      failClosed: saas.failClosed,
      planCount: saas.planCount,
      subscriptionCount: saas.subscriptionCount,
      supportedStatuses: saas.supportedStatuses,
    },
    release: releaseIdentity(),
    checks,
    durationMs: Date.now() - startedAt,
    timestamp: new Date().toISOString(),
    requestId: request.headers.get("x-vercel-id") ?? request.headers.get("x-request-id"),
  };

  console.log(JSON.stringify({ level: failed > 0 ? "error" : warnings > 0 ? "warn" : "info", event: "health_check", ...payload }));
  return NextResponse.json(payload, { status: failed > 0 ? 503 : 200, headers: { "cache-control": "no-store" } });
}
