import { NextResponse } from "next/server";
import { getFloridaClassDResilienceSnapshot } from "../../../../../lib/florida-class-d-resilience";

export const dynamic = "force-dynamic";

const headers = {
  "cache-control": "no-store, max-age=0, must-revalidate",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "no-referrer",
};

export async function GET() {
  const snapshot = getFloridaClassDResilienceSnapshot();
  const ready = snapshot.readiness.state === "ready";

  if (!ready) {
    console.warn("Florida Class D readiness not ready", {
      technicalFailureKeys: snapshot.runtime.nonLicenseBlockingKeys,
      highAvailabilityFailureKeys: snapshot.highAvailability.failingCheckKeys,
    });
  }

  return NextResponse.json(
    {
      service: "florida-class-d-lms",
      status: ready ? "ready" : "not_ready",
    },
    {
      status: ready ? 200 : 503,
      headers: ready ? headers : { ...headers, "retry-after": "60" },
    },
  );
}
