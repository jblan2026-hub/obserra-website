import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";

type Evidence = Readonly<{
  catalog_revision?: string;
  binding_receipt_sha256?: string;
  delivery_manifest_sha256?: string;
  stripe_account_id?: string;
  subject_count?: number;
  verified_at?: string;
  expires_at?: string;
  controls?: { charges_enabled?: boolean; protected_delivery_verified?: boolean; durable_ledger_verified?: boolean };
}>;

function canonical(value: unknown): string | null {
  if (value === null || typeof value === "boolean" || typeof value === "number" || typeof value === "string") return JSON.stringify(value);
  if (Array.isArray(value)) { const items = value.map(canonical); return items.some((item) => item === null) ? null : `[${items.join(",")}]`; }
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const entries = Object.keys(record).sort().map((key) => { const item = canonical(record[key]); return item === null ? null : `${JSON.stringify(key)}:${item}`; });
  return entries.some((item) => item === null) ? null : `{${entries.join(",")}}`;
}

function parsedDigest(raw: string | undefined) {
  try { const serialized = canonical(JSON.parse(raw ?? "")); return serialized ? createHash("sha256").update(serialized).digest("hex") : null; } catch { return null; }
}

function validSignature(payload: string, signature: string, key: string) {
  if (!/^[a-f0-9]{64}$/i.test(signature) || key.length < 32) return false;
  const expected = createHmac("sha256", key).update(payload).digest("hex");
  return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(signature, "hex"));
}

/**
 * A release verifier signs an exact, canonical snapshot after resolving the
 * full catalog's durable bindings and live Stripe Prices. Runtime recomputes
 * the compact authority digests and rejects unsigned or mismatched evidence.
 * The signed receipt is revision-bound; checkout revalidates the selected
 * Stripe Price live instead of disabling the whole catalog on a timer.
 */
export function marketplaceV12ReleaseEvidence(input: { revision: string; requiredSubjects: number; stripeAccountId?: string | null }) {
  const raw = process.env.OBSERRA_AI_MARKETPLACE_V12_RELEASE_EVIDENCE_JSON;
  const signature = process.env.OBSERRA_AI_MARKETPLACE_V12_RELEASE_EVIDENCE_SIGNATURE ?? "";
  const key = process.env.OBSERRA_AI_MARKETPLACE_V12_RELEASE_EVIDENCE_HMAC_KEY ?? "";
  const bindingDigest = parsedDigest(process.env.OBSERRA_AI_MARKETPLACE_V12_BINDING_RECEIPT_JSON);
  const deliveryDigest = parsedDigest(process.env.OBSERRA_AI_MARKETPLACE_V12_DELIVERY_CATALOG_JSON);
  try {
    const evidence = JSON.parse(raw ?? "") as Evidence;
    const payload = canonical(evidence);
    const verifiedAt = Date.parse(evidence.verified_at ?? ""), expiresAt = Date.parse(evidence.expires_at ?? ""), now = Date.now();
    const validWindow = Number.isFinite(verifiedAt) && Number.isFinite(expiresAt) && verifiedAt <= now + 5 * 60 * 1000 && expiresAt > verifiedAt && expiresAt - verifiedAt <= 7 * 24 * 60 * 60 * 1000;
    const fresh = validWindow && now < expiresAt;
    const verified = Boolean(payload && bindingDigest && deliveryDigest && validSignature(payload, signature, key)
      && evidence.catalog_revision === input.revision
      && evidence.binding_receipt_sha256 === bindingDigest
      && evidence.delivery_manifest_sha256 === deliveryDigest
      && evidence.subject_count === input.requiredSubjects
      && evidence.controls?.charges_enabled === true
      && evidence.controls?.protected_delivery_verified === true
      && evidence.controls?.durable_ledger_verified === true
      && (!input.stripeAccountId || evidence.stripe_account_id === input.stripeAccountId)
      && /^acct_[A-Za-z0-9]+$/.test(evidence.stripe_account_id ?? "")
      && validWindow);
    return { verified, fresh, bindingDigest, deliveryDigest, verifiedAt: Number.isFinite(verifiedAt) ? new Date(verifiedAt).toISOString() : null, expiresAt: Number.isFinite(expiresAt) ? new Date(expiresAt).toISOString() : null };
  } catch { return { verified: false, fresh: false, bindingDigest, deliveryDigest, verifiedAt: null, expiresAt: null }; }
}
