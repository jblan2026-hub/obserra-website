import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("single-item binding review records exact Price metadata and exposes durable, non-activating progress", () => {
  const route = read("app/api/admin/ai-marketplace-v12/binding-import/route.ts");
  const evidence = read("lib/marketplace-v12-binding-import.ts");
  const migration = read("supabase/release-authority/migrations/20260823142000_ai_marketplace_v12_binding_review_progress.sql");

  for (const field of ["obserraMarketplaceProduct", "catalogRevision", "artifactSha256", "commerceSource", "bindingKey", "purchaseOption"]) {
    assert.match(route, new RegExp(field));
  }
  assert.match(route, /marketplaceV12BindingReviewProgress/);
  assert.match(route, /export async function GET/);
  assert.match(route, /checkoutActivated: false/);
  assert.match(route, /bindingManifestUpdated: false/);
  assert.match(evidence, /review\.artifactSha256/);
  assert.match(evidence, /review\.stripeLivemode/);
  assert.match(evidence, /obserra_ai_marketplace_v12_binding_review_progress/);
  assert.match(evidence, /reviewedOfferBindings/);
  assert.match(migration, /obserra_ai_marketplace_v12_binding_review_progress/);
  assert.match(migration, /reviewedOfferBindings/);
  assert.match(migration, /liveReviewedOfferBindings/);
  assert.match(migration, /productEvidence/);
  assert.match(migration, /grant execute .* to service_role/);
  assert.doesNotMatch(migration, /grant execute .* to (?:anon|authenticated)/);
  assert.doesNotMatch(route, /OBSERRA_AI_MARKETPLACE_V12_BINDINGS_JSON\s*=/);
});

test("runtime binding authority uses a compact receipt and exact durable per-product lookups", () => {
  const bindings = read("lib/marketplace-v12-bindings.ts");
  const evidence = read("lib/marketplace-v12-binding-import.ts");
  const releaseEvidence = read("lib/marketplace-v12-release-evidence.ts");
  const migration = read("supabase/release-authority/migrations/20260823143000_ai_marketplace_v12_binding_authority.sql");

  assert.match(bindings, /OBSERRA_AI_MARKETPLACE_V12_BINDING_RECEIPT_JSON/);
  assert.match(bindings, /marketplaceV12BindingAuthorityReceipt/);
  assert.match(bindings, /marketplaceV12ProductBindingAuthority/);
  assert.match(bindings, /marketplaceV12BindingEvidenceKeyMatches/);
  assert.match(bindings, /authority\.bindings\.length !== expectedOptions\.length/);
  assert.match(bindings, /binding\.artifactSha256 !== subject\.artifactSha256/);
  assert.match(bindings, /binding\.stripeLivemode !== true/);
  assert.doesNotMatch(bindings, /OBSERRA_AI_MARKETPLACE_V12_BINDINGS_JSON|OBSERRA_AI_MARKETPLACE_V12_VERIFIED_BINDING_COUNT/);

  assert.match(evidence, /obserra_ai_marketplace_v12_binding_authority_receipt/);
  assert.match(evidence, /obserra_ai_marketplace_v12_product_binding_authority/);
  assert.match(evidence, /createHmac\("sha256"/);
  assert.match(releaseEvidence, /binding_receipt_sha256/);

  assert.match(migration, /v12_binding_authority_receipts/);
  assert.match(migration, /pg_advisory_xact_lock/);
  assert.match(migration, /pg_advisory_xact_lock_shared/);
  assert.match(migration, /create trigger invalidate_v12_binding_authority_receipt/);
  assert.match(migration, /delete from obserra_ai_marketplace\.v12_binding_authority_receipts/);
  assert.match(migration, /extensions\.digest/);
  assert.match(migration, /order by product_id, purchase_option/);
  assert.match(migration, /obserra_ai_marketplace_v12_binding_review_page/);
  assert.match(migration, /p_limit < 1 or p_limit > 1000/);
  assert.match(migration, /\(product_id, purchase_option\) > \(p_after_product_id, p_after_purchase_option\)/);
  assert.match(migration, /obserra_ai_marketplace_finalize_v12_binding_authority/);
  assert.match(migration, /v_latest_reviewed_at > p_verified_at/);
  assert.match(migration, /v_binding_set_sha256 <> p_binding_set_sha256/);
  assert.match(migration, /grant execute .* to service_role/);
  assert.doesNotMatch(migration, /grant execute .* to (?:anon|authenticated)/);
});

test("release verification consumes bounded durable reviews and never requires a catalog-sized runtime secret", () => {
  const verifier = read("scripts/verify-marketplace-v12-stripe-evidence.mjs");
  const workflow = read(".github/workflows/marketplace-v12-protected-delivery.yml");

  assert.match(verifier, /obserra_ai_marketplace_v12_binding_review_page/);
  assert.match(verifier, /obserra_ai_marketplace_finalize_v12_binding_authority/);
  assert.match(verifier, /bindingReceipt\.verifiedAt !== verifiedAt/);
  assert.match(workflow, /OBSERRA_APPLICATIONS_SUPABASE_URL/);
  assert.match(workflow, /OBSERRA_APPLICATIONS_SUPABASE_SERVICE_ROLE_KEY/);
  assert.doesNotMatch(verifier, /OBSERRA_AI_MARKETPLACE_V12_BINDINGS_JSON/);
  assert.doesNotMatch(workflow, /ai-marketplace-v12-bindings-json|OBSERRA_AI_MARKETPLACE_V12_BINDINGS_JSON/);
});
