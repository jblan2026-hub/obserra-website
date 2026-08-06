import "server-only";

import { auth, reverificationErrorResponse } from "@clerk/nextjs/server";

export type StepUpPreset = "strict" | "strict_mfa" | "moderate" | "lax";

export async function requireStepUp(preset: StepUpPreset = "strict") {
  const identity = await auth();
  if (!identity.userId) {
    return {
      allowed: false as const,
      userId: null,
      organizationId: identity.orgId ?? null,
      response: Response.json(
        { error: "authentication-required" },
        {
          status: 401,
          headers: {
            "Cache-Control": "private, no-store, max-age=0",
            "X-Robots-Tag": "noindex, nofollow",
          },
        },
      ),
    };
  }

  if (!identity.has({ reverification: preset })) {
    return {
      allowed: false as const,
      userId: identity.userId,
      organizationId: identity.orgId ?? null,
      response: reverificationErrorResponse(preset),
    };
  }

  return {
    allowed: true as const,
    userId: identity.userId,
    organizationId: identity.orgId ?? null,
    response: null,
  };
}
