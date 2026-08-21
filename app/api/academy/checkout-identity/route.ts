import { NextResponse } from "next/server";
import { isProductionRuntime } from "../../../../lib/runtime-environment";

export const runtime = "nodejs";

const COOKIE_NAME = "obserra_academy_checkout_browser";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function cookieValue(request: Request) {
  const raw = request.headers.get("cookie") ?? "";
  for (const item of raw.split(";")) {
    const [name, ...value] = item.trim().split("=");
    if (name === COOKIE_NAME) return decodeURIComponent(value.join("="));
  }
  return "";
}

export async function GET() {
  const response = NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  response.headers.set("allow", "POST");
  return response;
}

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get("origin");
  let sameOrigin = false;
  try { sameOrigin = Boolean(origin && new URL(origin).origin === requestUrl.origin); } catch { /* reject */ }
  if (!sameOrigin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return NextResponse.json({ error: "Unsupported media type" }, { status: 415 });
  }
  const body = await request.json().catch(() => null) as { browserId?: unknown } | null;
  if (!body || typeof body.browserId !== "string" || !UUID.test(body.browserId)) {
    return NextResponse.json({ error: "Invalid browser identity" }, { status: 400 });
  }
  const existing = cookieValue(request);
  const browserId = UUID.test(existing) ? existing.toLowerCase() : body.browserId.toLowerCase();
  const response = NextResponse.json(
    { ready: true },
    { headers: { "cache-control": "private, no-store, max-age=0", "x-content-type-options": "nosniff" } },
  );
  response.cookies.set(COOKIE_NAME, browserId, {
    httpOnly: true,
    sameSite: "strict",
    secure: isProductionRuntime(),
    path: "/",
    maxAge: 365 * 24 * 60 * 60,
  });
  return response;
}
