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
