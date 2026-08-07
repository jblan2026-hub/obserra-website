import "server-only";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { ownerEmailAllowed } from "./academy";

export type AcademyOwnerReviewAccess = {
  readonly mode: "vercel-protected-owner-preview" | "authenticated-owner";
  readonly userId: string | null;
  readonly email: string | null;
};

function safeOwnerReviewPath(pathname: string): string {
  const normalized = pathname.trim();
  if (
    normalized === "/academy/admin/review" ||
    normalized.startsWith("/academy/admin/review/")
  ) {
    return normalized;
  }
  return "/academy/admin/review";
}

/**
 * Enforces the single owner authorization boundary for Academy review routes.
 *
 * Production always requires a Clerk session whose server-resolved email is in
 * OBSERRA_OWNER_EMAIL or OBSERRA_OWNER_EMAILS. Vercel previews may use the
 * team's protected-deployment identity boundary, matching the existing owner
 * preview contract. Unauthorized production users receive a concealed 404.
 */
export async function requireAcademyOwnerReview(
  requestedPath: string,
): Promise<AcademyOwnerReviewAccess> {
  if (process.env.VERCEL_ENV === "preview") {
    return {
      mode: "vercel-protected-owner-preview",
      userId: null,
      email: null,
    };
  }

  const redirectPath = safeOwnerReviewPath(requestedPath);
  const { userId } = await auth();
  if (!userId) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent(redirectPath)}`);
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const emails = user.emailAddresses
    .map((item) => item.emailAddress.trim().toLowerCase())
    .filter(Boolean);

  if (!ownerEmailAllowed(emails)) {
    notFound();
  }

  return {
    mode: "authenticated-owner",
    userId,
    email: emails[0] ?? null,
  };
}
