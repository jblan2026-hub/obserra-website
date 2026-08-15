import "server-only";

const MAX_STRIPE_WEBHOOK_BYTES = 1_048_576;

export class StripeWebhookBodyError extends Error {
  readonly status = 413;

  constructor() {
    super("Stripe webhook payload is too large.");
    this.name = "StripeWebhookBodyError";
  }
}

export async function readStripeWebhookBody(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_STRIPE_WEBHOOK_BYTES) {
    throw new StripeWebhookBodyError();
  }
  const body = await request.text();
  if (Buffer.byteLength(body, "utf8") > MAX_STRIPE_WEBHOOK_BYTES) {
    throw new StripeWebhookBodyError();
  }
  return body;
}
