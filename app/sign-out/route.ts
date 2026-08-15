import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function noStore(response: NextResponse) {
  response.headers.set("cache-control", "private, no-store, max-age=0, must-revalidate");
  response.headers.set("pragma", "no-cache");
  response.headers.set("expires", "0");
  return response;
}

export async function POST(request: Request) {
  const expectedOrigin = new URL(request.url).origin;
  if (request.headers.get("origin") !== expectedOrigin) {
    return noStore(NextResponse.json(
      { error: "Sign-out requires an exact same-origin request.", code: "SIGN_OUT_ORIGIN_REJECTED" },
      { status: 403 },
    ));
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) throw error;
    return noStore(NextResponse.redirect(new URL("/sign-in?status=signed-out", request.url), 303));
  } catch {
    return noStore(NextResponse.json(
      { error: "Sign-out is temporarily unavailable.", code: "SIGN_OUT_UNAVAILABLE" },
      { status: 503 },
    ));
  }
}
