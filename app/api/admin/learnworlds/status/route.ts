import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ownerEmailAllowed } from "../../../../../lib/academy";
import { learnWorldsConfigurationStatus } from "../../../../../lib/learnworlds";

export const runtime = "nodejs";

async function ownerApproved() {
  try {
    const { userId } = await auth();
    const user = userId ? await currentUser() : null;
    return ownerEmailAllowed(user?.emailAddresses.map((entry) => entry.emailAddress) ?? []);
  } catch {
    return false;
  }
}

export async function GET() {
  if (!(await ownerApproved())) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const status = learnWorldsConfigurationStatus();
  const readyForSandboxCanary = Boolean(
    status.provider === "learnworlds" &&
    status.sandboxMode &&
    status.mappedProducts >= 1 &&
    status.sandboxProducts >= 1 &&
    status.apiEnvironmentReady,
  );

  const response = NextResponse.json({
    checkedAt: new Date().toISOString(),
    readyForSandboxCanary,
    status,
    nextRequiredAction: readyForSandboxCanary
      ? "Run the governed LearnWorlds sandbox checkout acceptance test."
      : "Complete the canary product mapping and deployment secret configuration.",
  });
  response.headers.set("cache-control", "private, no-store, max-age=0");
  response.headers.set("x-content-type-options", "nosniff");
  response.headers.set("x-frame-options", "DENY");
  return response;
}
