import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const INTENDED_VERCEL_PROJECT_ID = "prj_lxTKKDa9sbhht7FaigiaF1PONMiC";

const baseHeaders = {
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
  "x-obserra-health-contract": "website-liveness-v1",
};

function systemValue(name: "VERCEL_PROJECT_ID" | "VERCEL_DEPLOYMENT_ID" | "VERCEL_GIT_COMMIT_SHA") {
  return process.env[name]?.trim() || null;
}

export async function GET() {
  const observedProjectId = systemValue("VERCEL_PROJECT_ID");
  const deploymentId = systemValue("VERCEL_DEPLOYMENT_ID");
  const gitCommitSha = systemValue("VERCEL_GIT_COMMIT_SHA");
  const routingAuthority =
    observedProjectId === null
      ? "unavailable"
      : observedProjectId === INTENDED_VERCEL_PROJECT_ID
        ? "verified"
        : "mismatch";
  const headers: Record<string, string> = {
    ...baseHeaders,
    "x-obserra-routing-authority": routingAuthority,
  };

  if (observedProjectId) headers["x-obserra-vercel-project-id"] = observedProjectId;
  if (deploymentId) headers["x-obserra-vercel-deployment-id"] = deploymentId;
  if (gitCommitSha) headers["x-obserra-release-commit"] = gitCommitSha;

  return NextResponse.json(
    {
      service: "obserra-website",
      status: "live",
      contract: "website-liveness-v1",
      routing: {
        expectedProjectId: INTENDED_VERCEL_PROJECT_ID,
        observedProjectId,
        deploymentId,
        gitCommitSha,
        authority: routingAuthority,
        verified: routingAuthority === "verified",
      },
      checkedAt: new Date().toISOString(),
    },
    { status: 200, headers },
  );
}
