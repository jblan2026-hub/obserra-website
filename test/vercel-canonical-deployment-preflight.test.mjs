import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(path, "utf8");
const CANONICAL_PROJECT_ID = "prj_lxTKKDa9sbhht7FaigiaF1PONMiC";

test("canonical production deployment exposes only read-only health routes before public cutover", () => {
  assert.ok(
    fs.existsSync("lib/direct-deployment-health-routing.ts"),
    "direct deployment health routing policy must exist",
  );

  const routing = read("lib/direct-deployment-health-routing.ts");
  const runtimeConfig = read("lib/auth/runtime-config.ts");
  const proxy = read("proxy.ts");

  for (const path of [
    "/api/health",
    "/api/academy/commerce-health",
    "/api/florida-class-d/health/live",
    "/api/florida-class-d/health/ready",
  ]) {
    assert.match(routing, new RegExp(path.replaceAll("/", "\\/")));
  }

  assert.match(routing, /import\s*\{\s*CANONICAL_PUBLIC_VERCEL_PROJECT_ID\s*\}\s*from\s*["']\.\/auth\/runtime-config["']/);
  assert.match(routing, /VERCEL_PROJECT_ID\?\.trim\(\)\s*!==\s*CANONICAL_PUBLIC_VERCEL_PROJECT_ID/);
  assert.match(runtimeConfig, new RegExp(`CANONICAL_PUBLIC_VERCEL_PROJECT_ID\\s*=\\s*["']${CANONICAL_PROJECT_ID}["']`));
  assert.match(routing, /VERCEL_ENV/);
  assert.match(routing, /\.vercel\.app/);
  assert.match(routing, /method\.toUpperCase\(\)\s*!==\s*["']GET["']/);
  assert.match(proxy, /shouldServeDirectDeploymentHealth/);

  const directHealthIndex = proxy.indexOf("shouldServeDirectDeploymentHealth");
  const canonicalRedirectIndex = proxy.indexOf("canonicalRedirect(request)");
  assert.ok(directHealthIndex >= 0, "proxy must evaluate the direct health policy");
  assert.ok(
    canonicalRedirectIndex > directHealthIndex,
    "direct health policy must be evaluated before canonical host redirection",
  );
});

test("Vercel cutover preflights exact website, Academy commerce, and Florida LMS health before moving domains", () => {
  const cutover = read(".github/workflows/production-vercel-public-cutover.yml");
  const preflightStep = "Preflight exact canonical deployment health";
  const moveStep = "Move canonical domains to production project";
  const preflightIndex = cutover.indexOf(preflightStep);
  const moveIndex = cutover.indexOf(moveStep);

  assert.ok(preflightIndex >= 0, "cutover must preflight the exact canonical deployment");
  assert.ok(moveIndex > preflightIndex, "preflight must complete before any canonical domain move");

  assert.match(cutover, /deployment_url=/);
  assert.match(cutover, /CANDIDATE_URL/);
  assert.match(cutover, /\/api\/health/);
  assert.match(cutover, /\/api\/academy\/commerce-health/);
  assert.match(cutover, /\/api\/florida-class-d\/health\/live/);
  assert.match(cutover, /\/api\/florida-class-d\/health\/ready/);
  assert.match(cutover, /observedProjectId/);
  assert.match(cutover, /deploymentId/);
  assert.match(cutover, /gitCommitSha/);
  assert.match(cutover, /providerVerification\.environment/);
  assert.match(cutover, /providerVerification\.connected/);
  assert.match(cutover, /providerVerification\.chargesEnabled/);
  assert.match(cutover, /purchaserIdentityHashing/);
  assert.match(cutover, /durableStorage/);
  assert.match(cutover, /identityEnvironment/);
  assert.match(cutover, /stripe-event-id/);
});
