#!/usr/bin/env node

const EXPECTED_SUPABASE_ORIGIN = "https://ykmrlcfitsubqajgfnye.supabase.co";
const EXPECTED_AUTHORITY = "ai-marketplace-commerce-ledger-v1";

function fail(message) {
  throw new Error(`Marketplace v1.2 ledger evidence: ${message}`);
}

if (process.argv.length !== 2) fail("this verifier does not accept arguments");
if (process.env.VERCEL_ENV === "production" || process.env.WEBSITE_HOSTNAME) fail("verification is prohibited inside the production web runtime");

const origin = process.env.OBSERRA_APPLICATIONS_SUPABASE_URL?.trim() ?? "";
const serviceRoleKey = process.env.OBSERRA_APPLICATIONS_SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
if (origin !== EXPECTED_SUPABASE_ORIGIN || serviceRoleKey.length < 32) fail("durable authority configuration is unavailable; values suppressed");

let response;
try {
  response = await fetch(`${EXPECTED_SUPABASE_ORIGIN}/rest/v1/rpc/obserra_ai_marketplace_commerce_health`, {
    method: "POST",
    cache: "no-store",
    redirect: "error",
    headers: {
      apikey: serviceRoleKey,
      ...(serviceRoleKey.split(".").length === 3 ? { authorization: `Bearer ${serviceRoleKey}` } : {}),
      accept: "application/json",
      "content-type": "application/json",
    },
    body: "{}",
    signal: AbortSignal.timeout(10_000),
  });
} catch {
  fail("durable authority request failed; provider output suppressed");
}

if (!response.ok) fail(`durable authority rejected the evidence request with status ${response.status}`);
let health;
try {
  health = await response.json();
} catch {
  fail("durable authority returned invalid evidence");
}

const verified = health?.operational === true && health?.entitlementAuthority === EXPECTED_AUTHORITY;
const result = {
  contract: "obserra-marketplace-v12-ledger-evidence-v1",
  durableLedgerVerified: verified,
  entitlementAuthority: verified ? EXPECTED_AUTHORITY : "unavailable",
  verifiedAt: new Date().toISOString(),
};
process.stdout.write(`${JSON.stringify(result)}\n`);
if (!verified) process.exitCode = 2;
