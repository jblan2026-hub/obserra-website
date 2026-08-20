import assert from "node:assert/strict";
import test from "node:test";

const { default: nextConfig } = await import("../next.config.ts");

async function configuredRewrites() {
  assert.equal(
    typeof nextConfig.rewrites,
    "function",
    "Applications privacy requires an explicit Next.js rewrites() contract",
  );

  const rewrites = await nextConfig.rewrites();
  assert.ok(
    rewrites && !Array.isArray(rewrites) && Array.isArray(rewrites.beforeFiles),
    "Applications privacy requires beforeFiles rewrites so filesystem routes cannot win first",
  );

  return rewrites.beforeFiles;
}

function rewriteFor(rewrites, source) {
  return rewrites.find((rewrite) => rewrite.source === source);
}

test("Applications routes are intercepted before filesystem resolution", async () => {
  const beforeFiles = await configuredRewrites();

  assert.deepEqual(rewriteFor(beforeFiles, "/apps"), {
    source: "/apps",
    destination: "/_obserra/private-applications",
  });
  assert.deepEqual(rewriteFor(beforeFiles, "/apps/:path*"), {
    source: "/apps/:path*",
    destination: "/_obserra/private-applications/:path*",
  });
});
