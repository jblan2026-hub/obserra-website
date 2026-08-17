import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const proxySource = readFileSync(new URL("../proxy.ts", import.meta.url), "utf8");
const routingSource = readFileSync(new URL("../lib/auth/provider-routing.ts", import.meta.url), "utf8");

test("public marketing routes are explicitly public and do not require Clerk readiness", () => {
  assert.match(routingSource, /return route\("public", false, "public"\)/);
  assert.match(proxySource, /function publicIdentityResponse\(request: NextRequest\)/);
  assert.match(proxySource, /X-Obserra-Identity-Status", "ready"/);
  assert.match(proxySource, /X-Obserra-Identity-Provider", "public"/);
  assert.match(proxySource, /if \(ownership\.provider === "public"\) return publicIdentityResponse\(request\);/);

  const publicBranch = proxySource.indexOf('if (ownership.provider === "public") return publicIdentityResponse(request);');
  const clerkReadiness = proxySource.indexOf("if (!authenticationReady())");
  assert.ok(publicBranch >= 0 && clerkReadiness > publicBranch, "public routes must resolve before Clerk readiness is evaluated");
});

test("Supabase-owned routes fail closed and cannot fall through to Clerk", () => {
  assert.match(proxySource, /if \(ownership\.provider === "supabase"\) \{/);
  assert.match(proxySource, /if \(!supabaseRuntime\.runtimeEnabled \|\| !supabaseRuntime\.ready\) return identityConfigurationResponse\(request\);/);

  const supabaseBranch = proxySource.indexOf('if (ownership.provider === "supabase") {');
  const clerkReadiness = proxySource.indexOf("if (!authenticationReady())");
  assert.ok(supabaseBranch >= 0 && clerkReadiness > supabaseBranch, "Supabase routes must resolve before Clerk handling");
});
