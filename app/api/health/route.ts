import { NextResponse } from "next/server";
import { CANONICAL_PUBLIC_VERCEL_PROJECT_ID } from "../../../lib/auth/runtime-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const baseHeaders = {
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
  "x-obserra-health-contract": "website-liveness-v1",
};

function runtimeValue(name: string) {
  return process.env[name]?.trim() || null;
}

function validReleaseSha(value: string | null) {
  return Boolean(value && /^[0-9a-f]{40}$/i.test(value));
}

export async function GET() {
  const observedProjectId = runtimeValue("VERCEL_PROJECT_ID");
  const provider = runtimeValue("OBSERRA_HOSTING_PROVIDER") ?? (observedProjectId ? "vercel" : "unknown");
  const expectedProvider = runtimeValue("OBSERRA_EXPECTED_HOSTING_PROVIDER") ?? (provider === "vercel" ? "vercel" : null);
  const deploymentId = runtimeValue("OBSERRA_DEPLOYMENT_ID") ?? runtimeValue("VERCEL_DEPLOYMENT_ID");
  const gitCommitSha = runtimeValue("OBSERRA_RELEASE_SHA") ?? runtimeValue("VERCEL_GIT_COMMIT_SHA");

  const routingAuthority =
    observedProjectId === null
      ? "unavailable"
      : observedProjectId === CANONICAL_PUBLIC_VERCEL_PROJECT_ID
        ? "verified"
        : "mismatch";

  const hostingAuthority = provider === "vercel"
    ? routingAuthority
    : expectedProvider && provider === expectedProvider && deploymentId && validReleaseSha(gitCommitSha)
      ? "verified"
      : expectedProvider && provider !== expectedProvider
        ? "mismatch"
        : "unavailable";

  const headers: Record<string, string> = {
    ...baseHeaders,
    "x-obserra-routing-authority": routingAuthority,
    "x-obserra-hosting-provider": provider,
    "x-obserra-hosting-authority": hostingAuthority,
  };

  if (observedProjectId) headers["x-obserra-vercel-project-id"] = observedProjectId;
  if (deploymentId) headers["x-obserra-deployment-id"] = deploymentId;
  if (provider === "vercel" && deploymentId) headers["x-obserra-vercel-deployment-id"] = deploymentId;
  if (gitCommitSha) headers["x-obserra-release-commit"] = gitCommitSha;

  return NextResponse.json(
    {
      service: "obserra-website",
      status: "live",
      contract: "website-liveness-v1",
      hosting: {
        expectedProvider,
        provider,
        deploymentId,
        gitCommitSha,
        authority: hostingAuthority,
        verified: hostingAuthority === "verified",
      },
      routing: {
        expectedProjectId: CANONICAL_PUBLIC_VERCEL_PROJECT_ID,
        observedProjectId,
        deploymentId: provider === "vercel" ? deploymentId : null,
        gitCommitSha,
        authority: routingAuthority,
        verified: routingAuthority === "verified",
      },
      checkedAt: new Date().toISOString(),
    },
    { status: 200, headers },
  );
}
