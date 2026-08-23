import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const route = readFileSync(new URL("../app/api/admin/ai-marketplace-v12/binding-import/route.ts", import.meta.url), "utf8");
const evidence = readFileSync(new URL("../lib/marketplace-v12-binding-import.ts", import.meta.url), "utf8");
const migration = readFileSync(new URL("../supabase/release-authority/migrations/20260823130000_ai_marketplace_v12_single_binding_review.sql", import.meta.url), "utf8");

test("single catalog binding import is owner-governed, catalog-validated, and cannot activate checkout", () => {
  assert.match(route, /IMPORT_SINGLE_V12_PRODUCT/);
  assert.match(route, /sameOrigin/);
  assert.match(route, /getInternalOwnerAuthority/);
  assert.match(route, /assuranceLevel !== "aal2"/);
  assert.match(route, /marketplaceV12CommerceSubjects/);
  assert.match(route, /product\.product_type === "collection"/);
  assert.match(route, /stripe\.products\.search/);
  assert.match(route, /stripe\.products\.create/);
  assert.match(route, /stripe\.prices\.create/);
  assert.match(route, /recordMarketplaceV12BindingImportReview/);
  assert.match(route, /checkoutActivated: false/);
  assert.match(route, /releaseEvidenceUpdated: false/);
  assert.doesNotMatch(route, /OBSERRA_AI_MARKETPLACE_V12_BINDINGS_JSON\s*=/);
  assert.doesNotMatch(route, /OBSERRA_AI_MARKETPLACE_V12_RELEASE_EVIDENCE_JSON\s*=/);
});

test("single import evidence is durable, integrity-bound, and service-role only", () => {
  assert.match(evidence, /createHmac/);
  assert.match(evidence, /obserra_ai_marketplace_record_v12_binding_review/);
  assert.match(migration, /v12_binding_import_reviews/);
  assert.match(migration, /evidence_key/);
  assert.match(migration, /grant execute .* to service_role/);
  assert.doesNotMatch(migration, /grant execute .* to anon/);
  assert.doesNotMatch(migration, /checkout_attempts.*insert/i);
  assert.doesNotMatch(migration, /v12_artifact_entitlements.*insert/i);
});
