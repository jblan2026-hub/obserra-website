import { NextResponse } from "next/server";
import { findVerifiedCertificate } from "../../../../../lib/academy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CERTIFICATE_ID_PATTERN = /^OBS-[A-Z0-9]{6,150}-[0-9A-F]{8}$/;
const RATE_WINDOW_MS = 60_000;
const CLIENT_REQUEST_LIMIT = 12;
const INSTANCE_REQUEST_LIMIT = 120;
const MAX_CONCURRENT_LOOKUPS = 4;
const MAX_TRACKED_CLIENTS = 2_000;

type RateBucket = {
  startedAt: number;
  requests: number;
};

type CertificateGuardState = {
  clients: Map<string, RateBucket>;
  instance: RateBucket;
  inFlight: number;
};

const certificateGuardGlobal = globalThis as typeof globalThis & {
  __obserraCertificateGuard?: CertificateGuardState;
};

function newBucket(now: number): RateBucket {
  return { startedAt: now, requests: 0 };
}

function guardState(now: number) {
  if (!certificateGuardGlobal.__obserraCertificateGuard) {
    certificateGuardGlobal.__obserraCertificateGuard = {
      clients: new Map(),
      instance: newBucket(now),
      inFlight: 0,
    };
  }
  return certificateGuardGlobal.__obserraCertificateGuard;
}

function clientAddress(request: Request) {
  const forwarded = request.headers.get("x-vercel-forwarded-for")
    ?? request.headers.get("x-forwarded-for")
    ?? request.headers.get("x-real-ip")
    ?? "unknown";
  return forwarded.split(",", 1)[0].trim().slice(0, 96) || "unknown";
}

function refreshBucket(bucket: RateBucket, now: number) {
  if (now - bucket.startedAt >= RATE_WINDOW_MS) {
    bucket.startedAt = now;
    bucket.requests = 0;
  }
}

function pruneClientBuckets(state: CertificateGuardState, now: number) {
  if (state.clients.size <= MAX_TRACKED_CLIENTS) return;
  for (const [key, bucket] of state.clients) {
    if (now - bucket.startedAt >= RATE_WINDOW_MS) state.clients.delete(key);
    if (state.clients.size <= MAX_TRACKED_CLIENTS) break;
  }
}

function allowExpensiveLookup(request: Request) {
  const now = Date.now();
  const state = guardState(now);
  refreshBucket(state.instance, now);
  pruneClientBuckets(state, now);

  const client = clientAddress(request);
  const clientBucket = state.clients.get(client) ?? newBucket(now);
  refreshBucket(clientBucket, now);
  state.clients.set(client, clientBucket);

  if (clientBucket.requests >= CLIENT_REQUEST_LIMIT || state.instance.requests >= INSTANCE_REQUEST_LIMIT) {
    return { allowed: false as const, state, reason: "rate-limit" as const };
  }
  if (state.inFlight >= MAX_CONCURRENT_LOOKUPS) {
    return { allowed: false as const, state, reason: "concurrency-limit" as const };
  }

  clientBucket.requests += 1;
  state.instance.requests += 1;
  state.inFlight += 1;
  return { allowed: true as const, state };
}

function guardedResponse(message: string, status: 429 | 503, retryAfterSeconds: number) {
  return NextResponse.json(
    { valid: false, error: message },
    {
      status,
      headers: {
        "cache-control": "private, no-store, max-age=0",
        "retry-after": String(retryAfterSeconds),
        "x-obserra-certificate-verification": "temporarily-unavailable",
      },
    },
  );
}

export async function GET(request: Request) {
  const certificateId = new URL(request.url).searchParams.get("certificateId")?.trim().toUpperCase() ?? "";
  if (!certificateId || certificateId.length > 180 || !CERTIFICATE_ID_PATTERN.test(certificateId)) {
    return NextResponse.json(
      { valid: false, error: "A valid Obserra certificate ID is required" },
      {
        status: 400,
        headers: {
          "cache-control": "private, no-store, max-age=0",
          "x-obserra-certificate-verification": "invalid-request",
        },
      },
    );
  }

  const guard = allowExpensiveLookup(request);
  if (!guard.allowed) {
    return guard.reason === "rate-limit"
      ? guardedResponse("Certificate verification request limit reached. Try again shortly.", 429, 60)
      : guardedResponse("Certificate verification is busy. Try again shortly.", 503, 5);
  }

  try {
    const certificate = await findVerifiedCertificate(certificateId);
    if (!certificate) {
      return NextResponse.json(
        { valid: false, certificateId },
        {
          status: 404,
          headers: {
            "cache-control": "public, max-age=60, stale-while-revalidate=300",
            "x-obserra-certificate-verification": "not-found",
          },
        },
      );
    }

    return NextResponse.json(certificate, {
      headers: {
        "cache-control": "public, max-age=300, stale-while-revalidate=3600",
        "x-obserra-certificate-signature": certificate.signatureAlgorithm,
        "x-obserra-certificate-verification": "valid",
      },
    });
  } catch {
    return guardedResponse("Certificate verification is temporarily unavailable. Try again shortly.", 503, 15);
  } finally {
    guard.state.inFlight = Math.max(0, guard.state.inFlight - 1);
  }
}