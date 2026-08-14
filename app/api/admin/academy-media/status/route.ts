import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ownerEmailAllowed } from "../../../../../lib/academy";
import {
  academyMediaConfigurationStatus,
  probeAcademyMediaServices,
} from "../../../../../lib/academy-media-services";

export const runtime = "nodejs";
export const maxDuration = 30;

async function ownerApproved() {
  try {
    const { userId } = await auth();
    const user = userId ? await currentUser() : null;
    return ownerEmailAllowed(user?.emailAddresses.map((entry) => entry.emailAddress) ?? []);
  } catch {
    return false;
  }
}

function securedJson(body: unknown, status = 200) {
  const response = NextResponse.json(body, { status });
  response.headers.set("cache-control", "private, no-store, max-age=0");
  response.headers.set("content-security-policy", "default-src 'none'; frame-ancestors 'none'");
  response.headers.set("x-content-type-options", "nosniff");
  response.headers.set("x-frame-options", "DENY");
  response.headers.set("referrer-policy", "no-referrer");
  response.headers.set("x-robots-tag", "noindex, nofollow, noarchive");
  return response;
}

export async function GET(request: Request) {
  if (!(await ownerApproved())) {
    return securedJson({ error: "Not found" }, 404);
  }

  const url = new URL(request.url);
  const liveProbeRequested = url.searchParams.get("probe") === "1";
  const status = academyMediaConfigurationStatus();
  const details = liveProbeRequested
    ? await probeAcademyMediaServices()
    : { status, probe: null };
  const manualReady = status.heygen.manualReady && status.pollo.manualReady;
  const configuredReady = status.heygen.ready && status.pollo.ready;
  const liveProbePassed = Boolean(
    details.probe &&
      (!details.probe.heygen.attempted || details.probe.heygen.authorized) &&
      (!details.probe.pollo.attempted || details.probe.pollo.authorized),
  );

  return securedJson({
    checkedAt: new Date().toISOString(),
    liveProbeRequested,
    readyForManualCanary: manualReady,
    readyForConfiguredMode: configuredReady,
    liveProbePassed: liveProbeRequested ? liveProbePassed : null,
    status: details.status,
    probe: details.probe,
    nextRequiredAction: !status.heygen.manualReady
      ? "Finish the authorized HeyGen avatar, voice, and both governed templates, then set the manual setup evidence variables."
      : !status.pollo.manualReady
        ? "Confirm private Pollo workspace mode and the governed visual presets, then set the manual setup evidence variables."
        : "Generate and validate the Cybersecurity Foundations HeyGen and Pollo canary assets.",
  });
}
