import { NextResponse } from "next/server";
import { safeRelativeRedirect } from "@/lib/auth/redirects";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function noStoreRedirect(request: Request, pathname: string, status = 303) {
  const response = NextResponse.redirect(new URL(pathname, request.url), status);
  response.headers.set("cache-control", "private, no-store, max-age=0, must-revalidate");
  response.headers.set("pragma", "no-cache");
  response.headers.set("expires", "0");
  return response;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const redirectUrl = safeRelativeRedirect(url.searchParams.get("redirect_url") ?? undefined);
  const code = url.searchParams.get("code");
  if (!code) return noStoreRedirect(request, "/sign-in?status=callback-invalid");

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return noStoreRedirect(request, "/sign-in?status=callback-failed");

    const { data, error: assuranceError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (assuranceError) return noStoreRedirect(request, "/sign-in?status=assurance-unavailable");
    if (data.currentLevel !== "aal2") {
      const challenge = new URL("/auth/mfa", request.url);
      challenge.searchParams.set("redirect_url", redirectUrl);
      return noStoreRedirect(request, `${challenge.pathname}${challenge.search}`);
    }
    return noStoreRedirect(request, redirectUrl);
  } catch {
    return noStoreRedirect(request, "/sign-in?status=identity-unavailable");
  }
}
