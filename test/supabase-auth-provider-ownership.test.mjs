import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const ROUTING_MODULE = "lib/auth/provider-routing.ts";

function routingModule() {
  assert.ok(
    fs.existsSync(ROUTING_MODULE),
    `${ROUTING_MODULE} must define the single route-to-provider ownership contract before dual-provider proxy wiring`,
  );
  const output = ts.transpileModule(fs.readFileSync(ROUTING_MODULE, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(output, { exports: module.exports, module, URL, Set });
  return module.exports;
}

test("Applications and Clerk infrastructure remain Clerk-owned", () => {
  const { identityProviderForRequest } = routingModule();
  assert.equal(typeof identityProviderForRequest, "function");

  for (const pathname of [
    "/__clerk",
    "/__clerk/v1/client",
    "/apps",
    "/apps/obserra-eios",
    "/apps/obserra-eios/subscribe",
    "/api/apps",
    "/api/apps/access",
    "/api/apps/billing-portal",
    "/api/apps/checkout",
    "/api/apps/download",
    "/api/apps/license",
    "/portal/applications",
    "/portal/enterprise",
    "/portal/licenses",
    "/portal/orders",
    "/portal/success",
  ]) {
    assert.equal(identityProviderForRequest({ pathname }).provider, "clerk", pathname);
  }
});

test("customer portal, Academy, and FDACS protected paths are Supabase-owned", () => {
  const { identityProviderForRequest } = routingModule();

  for (const pathname of [
    "/portal",
    "/admin",
    "/academy/learn/course-1",
    "/academy/certificate/course-1",
    "/florida-security-training/access",
    "/florida-security-training/admin/enrollments",
    "/florida-security-training/live/session-1",
    "/api/florida-class-d/admin/enrollments",
    "/auth/callback",
    "/auth/mfa",
    "/sign-out",
  ]) {
    assert.equal(identityProviderForRequest({ pathname }).provider, "supabase", pathname);
  }
});

test("the exact Florida Coming Soon landing stays public without opening child routes", () => {
  const { identityProviderForRequest } = routingModule();

  for (const pathname of ["/florida-security-training", "/florida-security-training/"]) {
    for (const method of ["GET", "HEAD"]) {
      const landing = identityProviderForRequest({ pathname, method });
      assert.equal(landing.provider, "public", `${method} ${pathname}`);
      assert.equal(landing.requiresAuthentication, false, `${method} ${pathname}`);
      assert.equal(landing.accessPolicy, "public", `${method} ${pathname}`);
      assert.equal(landing.mutationAllowed, true, `${method} ${pathname}`);
      assert.equal(landing.mutationClass, "read", `${method} ${pathname}`);
    }
    const landingMutation = identityProviderForRequest({ pathname, method: "POST" });
    assert.equal(landingMutation.provider, "supabase", pathname);
    assert.equal(landingMutation.requiresAuthentication, true, pathname);
    assert.equal(landingMutation.accessPolicy, "internal_owner_read_only", pathname);
    assert.equal(landingMutation.mutationAllowed, false, pathname);
    assert.equal(landingMutation.mutationClass, "training_operation", pathname);
  }

  for (const pathname of [
    "/florida-security-training/access",
    "/florida-security-training/owner-preview",
  ]) {
    const child = identityProviderForRequest({ pathname, method: "GET" });
    assert.equal(child.provider, "supabase", pathname);
    assert.equal(child.requiresAuthentication, true, pathname);
    assert.equal(child.accessPolicy, "internal_owner_read_only", pathname);
  }
  assert.equal(
    identityProviderForRequest({ pathname: "/florida-security-trainingish", method: "GET" }).provider,
    "public",
  );
});

test("every non-health FDACS protected route is an internal owner read surface", () => {
  const { identityProviderForRequest } = routingModule();

  for (const pathname of [
    "/florida-security-training/access",
    "/florida-security-training/admin/enrollments",
    "/florida-security-training/completion",
    "/api/florida-class-d/enrollment",
    "/api/florida-class-d/identity-verification",
    "/api/florida-class-d/live",
    "/api/florida-class-d/admin/lias",
  ]) {
    const ownership = identityProviderForRequest({ pathname, method: "GET" });
    assert.equal(ownership.provider, "supabase", pathname);
    assert.equal(ownership.requiresAuthentication, true, pathname);
    assert.equal(ownership.accessPolicy, "internal_owner_read_only", pathname);
    assert.equal(ownership.mutationAllowed, false, pathname);
    assert.equal(ownership.mutationClass, "read", pathname);
  }

  for (const pathname of [
    "/api/florida-class-d/enrollment",
    "/api/florida-class-d/identity-verification",
    "/api/florida-class-d/admin/schedule",
    "/api/florida-class-d/live",
    "/api/florida-class-d/exam",
    "/api/florida-class-d/admin/completion",
    "/api/florida-class-d/admin/lias",
  ]) {
    const ownership = identityProviderForRequest({ pathname, method: "POST" });
    assert.equal(ownership.accessPolicy, "internal_owner_read_only", pathname);
    assert.equal(ownership.mutationAllowed, false, pathname);
    assert.notEqual(ownership.mutationClass, "read", pathname);
  }

  assert.equal(
    identityProviderForRequest({ pathname: "/api/florida-class-d/health/ready", method: "GET" }).provider,
    "public",
  );
});

test("provider ownership is segment-safe and shared sign-in follows only a safe owned return path", () => {
  const { identityProviderForRequest } = routingModule();

  assert.equal(identityProviderForRequest({ pathname: "/api/appshell" }).provider, "public");
  assert.equal(identityProviderForRequest({ pathname: "/florida-security-training-malicious" }).provider, "public");
  assert.equal(identityProviderForRequest({ pathname: "/portal/applications-malicious" }).provider, "supabase");
  assert.equal(identityProviderForRequest({ pathname: "/portal/%61pplications" }).provider, "clerk");
  assert.equal(
    identityProviderForRequest({ pathname: "/sign-in", redirectTarget: "/portal/applications" }).provider,
    "clerk",
  );
  assert.equal(
    identityProviderForRequest({ pathname: "/sign-in", redirectTarget: "/academy/learn/course-1" }).provider,
    "supabase",
  );
  assert.equal(
    identityProviderForRequest({ pathname: "/sign-up", redirectTarget: "/portal/applications" }).provider,
    "clerk",
  );
  assert.equal(
    identityProviderForRequest({ pathname: "/sign-up", redirectTarget: "/academy/learn/course-1" }).provider,
    "supabase",
  );
  assert.equal(
    identityProviderForRequest({ pathname: "/sign-in", redirectTarget: "https://evil.example/steal" }).provider,
    "supabase",
  );
});

test("the proxy cannot authorize the internal owner shell from JWT claims alone", () => {
  const proxy = fs.readFileSync("proxy.ts", "utf8");

  assert.match(proxy, /ownership\.accessPolicy === "internal_owner_read_only"/);
  assert.doesNotMatch(proxy, /internalIdentityAuthorized:\s*false/);
  assert.match(proxy, /getInternalOwnerAuthority/);
  assert.match(proxy, /authority\.protectedReadiness\.ready/);
  assert.match(proxy, /identity\.assuranceLevel/);
  assert.match(proxy, /OBSERRA_FDACS_PRODUCTION_ACTIVATION_AUTHORIZED/);
  assert.match(proxy, /!ownership\.mutationAllowed/);
  assert.match(proxy, /FDACS_INTERNAL_OWNER_WRITE_LOCKED/);
});
