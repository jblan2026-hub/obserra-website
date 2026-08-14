import { NextResponse } from "next/server";
import {
  floridaClassDIdentityErrorStatus,
  recordFloridaClassDStripeIdentityWebhook,
} from "../../../../lib/florida-class-d-identity-verification";

const responseHeaders = {
  "cache-control": "no-store, max-age=0",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "no-referrer",
};

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature.", code: "FDACS_IDENTITY_WEBHOOK_SIGNATURE_MISSING" },
      { status: 400, headers: responseHeaders },
    );
  }

  try {
    const result = await recordFloridaClassDStripeIdentityWebhook(await request.text(), signature);
    return NextResponse.json(result, { headers: responseHeaders });
  } catch (error) {
    const identityError = floridaClassDIdentityErrorStatus(error);
    if (identityError) {
      return NextResponse.json(
        { error: identityError.message, code: identityError.code },
        { status: identityError.status, headers: responseHeaders },
      );
    }
    console.error("Florida Class D Stripe Identity webhook failed", error instanceof Error ? error.name : "unknown_error");
    return NextResponse.json(
      { error: "Unable to process Stripe Identity webhook.", code: "FDACS_IDENTITY_WEBHOOK_FAILED" },
      { status: 500, headers: responseHeaders },
    );
  }
}
