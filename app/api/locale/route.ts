import { NextRequest, NextResponse } from "next/server";
import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  LOCALE_COOKIE,
  recommendedLocale,
} from "../../../lib/regional-localization";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const responseHeaders = {
  "cache-control": "private, no-store, max-age=0, must-revalidate",
  "x-content-type-options": "nosniff",
  "x-robots-tag": "noindex, nofollow",
};

function sameOriginRequest(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === request.nextUrl.host;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const locale = recommendedLocale({
    savedLocale: request.cookies.get(LOCALE_COOKIE)?.value,
    acceptLanguage: request.headers.get("accept-language"),
    country: request.headers.get("x-vercel-ip-country"),
  });

  return NextResponse.json(
    {
      locale,
      country: request.headers.get("x-vercel-ip-country")?.slice(0, 2).toUpperCase() || null,
      source: request.cookies.has(LOCALE_COOKIE) ? "saved" : "regional",
    },
    { headers: responseHeaders },
  );
}

export async function POST(request: NextRequest) {
  if (!sameOriginRequest(request)) {
    return NextResponse.json({ error: "origin_not_allowed" }, { status: 403, headers: responseHeaders });
  }
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return NextResponse.json({ error: "json_required" }, { status: 415, headers: responseHeaders });
  }

  let payload: { locale?: unknown };
  try {
    payload = (await request.json()) as { locale?: unknown };
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400, headers: responseHeaders });
  }

  if (!isSupportedLocale(payload.locale)) {
    return NextResponse.json({ error: "unsupported_locale" }, { status: 400, headers: responseHeaders });
  }

  const response = NextResponse.json({ locale: payload.locale || DEFAULT_LOCALE }, { headers: responseHeaders });
  response.cookies.set({
    name: LOCALE_COOKIE,
    value: payload.locale,
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    priority: "low",
  });
  return response;
}
