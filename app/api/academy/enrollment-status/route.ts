import { NextResponse } from "next/server";
import { academyStateWithOwnerAccess, courseForId } from "../../../../lib/academy";
import { safeAcademyIdentity } from "../../../../lib/academy-identity";

const headers = {
  "cache-control": "private, no-store, max-age=0",
  "x-content-type-options": "nosniff",
};

export async function GET(request: Request) {
  const courseId = new URL(request.url).searchParams.get("course") ?? "";
  if (!courseForId(courseId)) {
    return NextResponse.json({ error: "Unknown course" }, { status: 400, headers });
  }

  const identity = await safeAcademyIdentity();
  if (!identity.configured || identity.status === "claims_unavailable") {
    return NextResponse.json({ error: "Identity service is unavailable" }, { status: 503, headers });
  }
  if (!identity.principalId || !identity.identity) {
    return NextResponse.json({ enrolled: false, progress: null, signedIn: false }, { headers });
  }

  const state = await academyStateWithOwnerAccess(
    identity.principalId,
    courseId,
    identity.identity.roles,
  );
  return NextResponse.json({
    enrolled: Boolean(state.entitlements[courseId]),
    progress: state.progress[courseId] ?? null,
    signedIn: true,
  }, { headers });
}
