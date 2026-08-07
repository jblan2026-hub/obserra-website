import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ACADEMY_OWNER_EDGE_URL } from "../../../../../lib/academy-control-contracts";
import { verifyAcademyOwner } from "../../../../../lib/owner-access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 1_500_000;
const SAFE_PATH_SEGMENT = /^[a-z0-9-]{1,180}$/;
const responseHeaders = {
  "cache-control": "private, no-store, max-age=0, must-revalidate",
  "pragma": "no-cache",
  "referrer-policy": "no-referrer",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "x-robots-tag": "noindex, nofollow, noarchive, nosnippet, noimageindex",
};

type RouteContext = {
  params: Promise<{ path?: string[] }>;
};

function json(status: number, body: unknown, requestId?: string | null) {
  return NextResponse.json(body, {
    status,
    headers: {
      ...responseHeaders,
      ...(requestId ? { "x-obserra-request-id": requestId } : {}),
    },
  });
}

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

function safePath(path: string[] | undefined) {
  const parts = path ?? [];
  if (parts.length > 4 || parts.some((part) => !SAFE_PATH_SEGMENT.test(part))) return null;
  if (parts.length === 0) return "";
  return `/${parts.map(encodeURIComponent).join("/")}`;
}

async function ownerToken() {
  const session = await auth();
  if (!session.userId) return { status: 401 as const, token: null, requestId: null };
  const token = await session.getToken();
  if (!token || token.length > 16_000 || /\s/.test(token)) {
    return { status: 401 as const, token: null, requestId: null };
  }
  const verification = await verifyAcademyOwner(token);
  if (verification.state === "authorized" && verification.ownerUserId === session.userId) {
    return { status: 200 as const, token, requestId: verification.requestId };
  }
  if (verification.state === "bootstrap-required") {
    return { status: 409 as const, token: null, requestId: verification.requestId };
  }
  if (verification.state === "unavailable") {
    return { status: 503 as const, token: null, requestId: verification.requestId };
  }
  return { status: 404 as const, token: null, requestId: verification.requestId };
}

async function forward(request: Request, context: RouteContext) {
  const method = request.method.toUpperCase();
  if (!["GET", "POST", "PUT", "DELETE"].includes(method)) {
    return json(405, { error: "Owner control method is not allowed." });
  }
  if (method !== "GET" && !sameOrigin(request)) {
    return json(403, { error: "Owner control origin denied." });
  }

  const path = safePath((await context.params).path);
  if (path === null) {
    return json(400, { error: "Owner control path is invalid." });
  }

  const access = await ownerToken();
  if (!access.token) {
    const message = access.status === 409
      ? "Owner identity bootstrap is required."
      : access.status === 503
        ? "Owner verification is unavailable."
        : access.status === 404
          ? "Owner control route not found."
          : "Owner authentication is required.";
    return json(access.status, { error: message }, access.requestId);
  }

  let body: string | undefined;
  if (method !== "GET") {
    if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
      return json(415, { error: "Owner controls require application/json." });
    }
    const contentLength = Number(request.headers.get("content-length") ?? "0");
    if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
      return json(413, { error: "Owner control request is too large." });
    }
    body = await request.text();
    if (!body || Buffer.byteLength(body, "utf8") > MAX_BODY_BYTES) {
      return json(413, { error: "Owner control request is invalid or too large." });
    }
  }

  const requestId = request.headers.get("x-obserra-request-id")?.slice(0, 100) || crypto.randomUUID();
  try {
    const upstream = await fetch(`${ACADEMY_OWNER_EDGE_URL}${path}`, {
      method,
      cache: "no-store",
      redirect: "error",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${access.token}`,
        "x-obserra-request-id": requestId,
        ...(body ? { "content-type": "application/json" } : {}),
      },
      body,
      signal: AbortSignal.timeout(15_000),
    });
    const payload = await upstream.json().catch(() => ({
      error: "The owner control service returned an invalid response.",
    }));
    return json(upstream.status, payload, upstream.headers.get("x-obserra-request-id") || requestId);
  } catch (error) {
    console.error("Academy owner control BFF unavailable", error);
    return json(503, {
      error: "The owner control service is unavailable.",
      code: "OWNER_CONTROL_UNAVAILABLE",
      requestId,
    }, requestId);
  }
}

export async function GET(request: Request, context: RouteContext) {
  return forward(request, context);
}

export async function POST(request: Request, context: RouteContext) {
  return forward(request, context);
}

export async function PUT(request: Request, context: RouteContext) {
  return forward(request, context);
}

export async function DELETE(request: Request, context: RouteContext) {
  return forward(request, context);
}
